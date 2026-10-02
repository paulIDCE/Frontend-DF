import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Dropdown, Select, Spin, Switch, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  DownOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { EstadoError, ImpresionContext, LimiteError, useService } from "@idce/kit";
import { RevistaContext, type RevistaValor } from "./RevistaContext";
import { MESES, crearCtx, fechasDe } from "./datos";
import { cargarListaEntidades, cargarReporte, infoDe } from "./resumenEntidades";
import { HOJAS_ORDENADAS, SECCIONES, hojaPorNumero, seccionDe } from "./paginas";

/**
 * Revista digital de 31 hojas — porte de `#digital-magazine-view` de
 * prueba-data. Solo se monta la hoja activa (el original renderizaba las 31
 * en cada cambio de fecha).
 *
 * "Descargar PDF" (todo o la pagina actual) es HTML -> PDF con `window.print()`,
 * no una captura: las hojas se montan en modo impresion (`ImpresionContext`)
 * en un contenedor aparte con el ancho util de una A4 apaisada, de modo que las
 * graficas (SVG) y las tablas (sin scroll) salen completas, cada hoja empieza
 * en pagina nueva y el texto queda seleccionable.
 */

type Impresion = "todo" | "actual";

/** Ancho util de A4 apaisada con margenes de 10 mm (277 mm a 96 ppp). */
const ANCHO_IMPRESION = 1046;

/**
 * Espera a que las hojas terminen de cargar (las que piden datos propios muestran un `Spin`) y a
 * que se pinten: listo cuando no hay indicadores girando en dos comprobaciones seguidas.
 */
const esperarHojas = (contenedor: HTMLElement, cancelado: () => boolean): Promise<void> =>
  new Promise((listo) => {
    const inicio = Date.now();
    let quietas = 0;
    const comprobar = () => {
      if (cancelado()) return;
      const girando = contenedor.querySelector(".ant-spin-spinning, .ant-skeleton-active");
      quietas = girando ? 0 : quietas + 1;
      if ((quietas >= 2 && Date.now() - inicio > 800) || Date.now() - inicio > 30000) listo();
      else setTimeout(comprobar, 300);
    };
    setTimeout(comprobar, 300);
  });

interface Props {
  entidad: string;
  pagina: number;
  onPagina: (n: number) => void;
  onEntidad: (e: string) => void;
  onVolver: () => void;
}

const Revista = ({ entidad, pagina, onPagina, onEntidad, onVolver }: Props) => {
  const { data: filas, isLoading, apiError } = useService(cargarReporte, [entidad], [], true, "Sin datos disponibles para esta entidad.");
  const { data: lista } = useService(cargarListaEntidades, [], [], true, "No se pudo cargar la lista de entidades");

  const fechas = useMemo(() => (filas ? fechasDe(filas) : []), [filas]);
  const anios = useMemo(() => [...new Set(fechas.map((f) => f.slice(0, 4)))].sort().reverse(), [fechas]);
  const [eleccion, setEleccion] = useState<{ base: string[]; fecha: string } | null>(null);
  const fecha = eleccion && eleccion.base === fechas ? eleccion.fecha : (fechas[fechas.length - 1] ?? "");
  const setFecha = (f: string) => setEleccion({ base: fechas, fecha: f });

  const [etiquetas, setEtiquetas] = useState(true);
  const [sectores, setSectores] = useState<string[]>([]);
  const [imprimiendo, setImprimiendo] = useState<Impresion | null>(null);
  const contenedorImpresion = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imprimiendo) return;
    let cancelado = false;
    const tituloAnterior = document.title;
    const fin = () => {
      document.title = tituloAnterior;
      setImprimiendo(null);
    };
    window.addEventListener("afterprint", fin);
    const contenedor = contenedorImpresion.current;
    if (contenedor)
      esperarHojas(contenedor, () => cancelado).then(() => {
        if (cancelado) return;
        // El titulo es el nombre que propone el navegador para el PDF.
        document.title = ["Analisis", entidad, fecha, imprimiendo === "actual" ? `hoja_${pagina}` : ""]
          .filter(Boolean)
          .join("_")
          .replace(/[^\w-]+/g, "_");
        window.print();
      });
    return () => {
      cancelado = true;
      document.title = tituloAnterior;
      window.removeEventListener("afterprint", fin);
    };
  }, [imprimiendo, entidad, fecha, pagina]);

  const valor = useMemo<RevistaValor | null>(() => {
    if (!filas?.length || !fecha) return null;
    const info = infoDe(filas);
    return {
      ctx: crearCtx(filas, fecha),
      entidad,
      hoja: hojaPorNumero(pagina)?.nombre ?? "",
      etiquetas,
      tamano: info.tamano,
      rango: info.rango,
      provincia: info.provincia,
      setEntidad: onEntidad,
      sectores,
      setSectores,
    };
  }, [filas, fecha, entidad, pagina, etiquetas, onEntidad, sectores]);

  // Navegacion en el orden de las secciones. Una hoja de segmento abierta por URL (14-16, 20-22)
  // se ubica en la que la reune (13, 19).
  const total = HOJAS_ORDENADAS.length;
  const reunida = pagina >= 14 && pagina <= 16 ? 13 : pagina >= 20 && pagina <= 22 ? 19 : pagina;
  const pos = Math.max(0, HOJAS_ORDENADAS.findIndex((h) => h.numero === reunida));
  const irA = (i: number) => onPagina(HOJAS_ORDENADAS[Math.min(total - 1, Math.max(0, i))].numero);
  const hoja = hojaPorNumero(pagina) ?? HOJAS_ORDENADAS[0];

  const [anio, mes] = fecha.split("-");

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="sticky top-[76px] z-40 flex flex-wrap items-center gap-3 rounded-contenedor bg-superficie p-3 shadow-contenedor print:hidden">
        <Button icon={<ArrowLeftOutlined />} onClick={onVolver}>
          Volver al Hub
        </Button>
        <Dropdown
          disabled={!valor || !!imprimiendo}
          menu={{
            items: [
              { key: "todo", icon: <FileTextOutlined />, label: `Descargar todo (${total} hojas)` },
              { key: "actual", icon: <FileOutlined />, label: `Descargar página actual (${pagina})` },
            ],
            onClick: ({ key }) => setImprimiendo(key as Impresion),
          }}
        >
          <Button danger icon={<FilePdfOutlined />} loading={!!imprimiendo}>
            {imprimiendo ? "Preparando PDF…" : "Descargar PDF"} <DownOutlined />
          </Button>
        </Dropdown>
        <label className="flex items-center gap-2 text-detalle text-tinta-secundaria">
          <Switch size="small" checked={etiquetas} onChange={setEtiquetas} />
          📊 Mostrar valores en gráficos
        </label>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1 text-detalle">
            Año:
            <Select
              size="small"
              className="w-24"
              value={anio}
              options={anios.map((a) => ({ value: a, label: a }))}
              onChange={(a: string) => {
                const mismoMes = `${a}-${mes}`;
                setFecha(fechas.includes(mismoMes) ? mismoMes : (fechas.filter((f) => f.startsWith(a)).pop() ?? mismoMes));
              }}
            />
          </label>
          <label className="flex items-center gap-1 text-detalle">
            Mes:
            <Select
              size="small"
              className="w-24"
              value={mes}
              options={MESES.map((m, i) => {
                const v = String(i + 1).padStart(2, "0");
                return { value: v, label: m, disabled: !fechas.includes(`${anio}-${v}`) };
              })}
              onChange={(m: string) => setFecha(`${anio}-${m}`)}
            />
          </label>
          <label className="flex items-center gap-1 text-detalle">
            Entidad:
            <Select
              size="small"
              className="w-64"
              showSearch
              value={entidad}
              options={(lista ?? []).map((e) => ({ value: e.nombre, label: e.nombre }))}
              onChange={onEntidad}
              notFoundContent="No se encontró"
            />
          </label>
          {valor && (
            <span className="flex gap-3 rounded-tarjeta bg-superficie-hundida px-2 py-1 text-rotulo">
              <span>
                Tamaño: <strong>{valor.tamano}</strong>
              </span>
              <span>
                Nivel: <strong>{valor.rango}</strong>
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
        <Tooltip title="Primera">
          <Button size="small" icon={<DoubleLeftOutlined />} onClick={() => irA(0)} disabled={pos === 0} />
        </Tooltip>
        <Button size="small" icon={<LeftOutlined />} onClick={() => irA(pos - 1)} disabled={pos === 0} />
        <Select
          size="small"
          className="w-80"
          value={HOJAS_ORDENADAS[pos].numero}
          options={SECCIONES.map((s) => ({
            label: s.titulo,
            options: s.hojas.map((n) => ({
              value: n,
              label: `${HOJAS_ORDENADAS.findIndex((x) => x.numero === n) + 1}. ${hojaPorNumero(n)?.nombre ?? ""}`,
            })),
          }))}
          onChange={onPagina}
        />
        <span className="text-detalle text-tinta-tenue">
          {pos + 1} de {total} · {seccionDe(reunida)}
        </span>
        <Button size="small" icon={<RightOutlined />} onClick={() => irA(pos + 1)} disabled={pos === total - 1} />
        <Tooltip title="Última">
          <Button size="small" icon={<DoubleRightOutlined />} onClick={() => irA(total - 1)} disabled={pos === total - 1} />
        </Tooltip>
      </div>
      <div className="flex flex-wrap justify-center gap-1 print:hidden">
        {SECCIONES.map((s) => (
          <span key={s.titulo} className="flex gap-1 pr-2" title={s.titulo}>
            {s.hojas.map((n) => {
              const i = HOJAS_ORDENADAS.findIndex((x) => x.numero === n);
              return (
                <button
                  key={n}
                  type="button"
                  title={`${s.titulo} · ${i + 1}. ${hojaPorNumero(n)?.nombre ?? ""}`}
                  onClick={() => irA(i)}
                  className={`h-2.5 w-2.5 cursor-pointer rounded-full border-0 p-0 ${i === pos ? "bg-identidad" : "bg-linea-fuerte"}`}
                />
              );
            })}
          </span>
        ))}
      </div>

      {apiError ? (
        <EstadoError error={apiError} />
      ) : isLoading || !valor ? (
        <div className="flex justify-center py-24">
          <Spin size="large" description="Cargando reporte..." />
        </div>
      ) : (
        <RevistaContext.Provider value={valor}>
          <article className="rounded-contenedor bg-superficie p-5 shadow-tarjeta">
            <LimiteError key={`${pagina}-${entidad}`}>
              <hoja.Componente />
            </LimiteError>
          </article>
          {/* Copia para imprimir: fuera de pantalla mientras se prepara; al imprimir es lo unico
              que se ve (`index.css`). Portal en `body` para no heredar el ancho del layout. */}
          {imprimiendo &&
            createPortal(
              <div
                id="revista-impresion"
                ref={contenedorImpresion}
                style={{ width: ANCHO_IMPRESION }}
                aria-hidden
              >
                <ImpresionContext.Provider value>
                  {(imprimiendo === "todo" ? HOJAS_ORDENADAS : [hoja]).map((h) => (
                    <RevistaContext.Provider key={h.numero} value={{ ...valor, hoja: h.nombre }}>
                      <article className="hoja-impresion">
                        <LimiteError>
                          <h.Componente />
                        </LimiteError>
                      </article>
                    </RevistaContext.Provider>
                  ))}
                </ImpresionContext.Provider>
              </div>,
              document.body
            )}
        </RevistaContext.Provider>
      )}
    </div>
  );
};

export default Revista;
