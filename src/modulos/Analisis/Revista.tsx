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
import { HOJAS } from "./paginas";

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
      hoja: HOJAS[pagina - 1]?.nombre ?? "",
      etiquetas,
      tamano: info.tamano,
      rango: info.rango,
      provincia: info.provincia,
      setEntidad: onEntidad,
      sectores,
      setSectores,
    };
  }, [filas, fecha, entidad, pagina, etiquetas, onEntidad, sectores]);

  const total = HOJAS.length;
  const ir = (n: number) => onPagina(Math.min(total, Math.max(1, n)));
  const hoja = HOJAS[pagina - 1];

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
              { key: "todo", icon: <FileTextOutlined />, label: `Descargar todo (${HOJAS.length} hojas)` },
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
          <Button size="small" icon={<DoubleLeftOutlined />} onClick={() => ir(1)} disabled={pagina === 1} />
        </Tooltip>
        <Button size="small" icon={<LeftOutlined />} onClick={() => ir(pagina - 1)} disabled={pagina === 1} />
        <Select
          size="small"
          className="w-80"
          value={pagina}
          options={HOJAS.map((h) => ({ value: h.numero, label: `${h.numero}. ${h.nombre}` }))}
          onChange={ir}
        />
        <span className="text-detalle text-tinta-tenue">de {total}</span>
        <Button size="small" icon={<RightOutlined />} onClick={() => ir(pagina + 1)} disabled={pagina === total} />
        <Tooltip title="Última">
          <Button size="small" icon={<DoubleRightOutlined />} onClick={() => ir(total)} disabled={pagina === total} />
        </Tooltip>
      </div>
      <div className="flex flex-wrap justify-center gap-1 print:hidden">
        {HOJAS.map((h) => (
          <button
            key={h.numero}
            type="button"
            title={`${h.numero}. ${h.nombre}`}
            onClick={() => ir(h.numero)}
            className={`h-2.5 w-2.5 cursor-pointer rounded-full border-0 p-0 ${
              h.numero === pagina ? "bg-identidad" : "bg-linea-fuerte"
            }`}
          />
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
                  {(imprimiendo === "todo" ? HOJAS : [hoja]).map((h) => (
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
