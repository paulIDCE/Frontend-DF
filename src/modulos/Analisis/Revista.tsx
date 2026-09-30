import { useEffect, useMemo, useState } from "react";
import { Button, Select, Spin, Switch, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  FilePdfOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { EstadoError, LimiteError, useService } from "@idce/kit";
import { leerJson } from "@/services/datosService";
import { RevistaContext, type RevistaValor } from "./RevistaContext";
import { MESES, crearCtx, fechasDe, type FilaReporte } from "./datos";
import { cargarListaEntidades, infoDe, rutaReporte } from "./resumenEntidades";
import { HOJAS } from "./paginas";

/**
 * Revista digital de 31 hojas — porte de `#digital-magazine-view` de
 * prueba-data. Solo se monta la hoja activa (el original renderizaba las 31
 * en cada cambio de fecha); "Descargar PDF" monta todas y llama a
 * `window.print()`.
 */

interface Props {
  entidad: string;
  pagina: number;
  onPagina: (n: number) => void;
  onEntidad: (e: string) => void;
  onVolver: () => void;
}

const cargarReporte = (entidad: string) => leerJson<FilaReporte[]>(rutaReporte(entidad));

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
  const [imprimiendo, setImprimiendo] = useState(false);

  useEffect(() => {
    if (!imprimiendo) return;
    const fin = () => setImprimiendo(false);
    window.addEventListener("afterprint", fin);
    // Deja que ECharts pinte las 31 hojas antes de abrir el dialogo.
    const t = setTimeout(() => window.print(), 1500);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", fin);
    };
  }, [imprimiendo]);

  const valor = useMemo<RevistaValor | null>(() => {
    if (!filas?.length || !fecha) return null;
    const info = infoDe(filas);
    return {
      ctx: crearCtx(filas, fecha),
      entidad,
      etiquetas,
      tamano: info.tamano,
      rango: info.rango,
      provincia: info.provincia,
      setEntidad: onEntidad,
      sectores,
      setSectores,
    };
  }, [filas, fecha, entidad, etiquetas, onEntidad, sectores]);

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
        <Button danger icon={<FilePdfOutlined />} onClick={() => setImprimiendo(true)} disabled={!valor}>
          Descargar PDF
        </Button>
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
          {imprimiendo ? (
            HOJAS.map((h) => (
              <article key={h.numero} className="break-after-page rounded-contenedor bg-superficie p-5">
                <LimiteError>
                  <h.Componente />
                </LimiteError>
              </article>
            ))
          ) : (
            <article className="rounded-contenedor bg-superficie p-5 shadow-tarjeta">
              <LimiteError key={`${pagina}-${entidad}`}>
                <hoja.Componente />
              </LimiteError>
            </article>
          )}
        </RevistaContext.Provider>
      )}
    </div>
  );
};

export default Revista;
