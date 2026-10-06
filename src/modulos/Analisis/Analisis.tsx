import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, Spin } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  BankOutlined,
  BulbOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  DollarOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SettingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useService } from "@idce/kit";
import { archivoEntidad } from "@/services/datosService";
import { apiEntidad, apiMeta } from "@/services/apiDatos";
import { cargarListaEntidades } from "./resumenEntidades";
import Revista from "./Revista";
import { legible } from "./texto";
import { HOJAS } from "./paginas";

/**
 * Análisis Financiero — hub de reportes + revista digital (porte de prueba-data
 * `analisis.html` / `analisis.js`).
 *
 * Diferencia: cada tarjeta abre la revista en la primera hoja de su seccion
 * (el original restauraba siempre la ultima hoja visitada, fuera cual fuera
 * el reporte elegido).
 */

const ENTIDAD_INICIAL = "BP. AMAZONAS";

const REPORTES = [
  { tipo: "resumen", pagina: 36, icono: BulbOutlined, titulo: "Resumen Ejecutivo", texto: "KPIs, grupo par, calificaciones y hallazgos principales" },
  { tipo: "balances", pagina: 1, icono: SettingOutlined, titulo: "Balances Financieros: Principales Cuentas", texto: "Reporte detallado de los balances financieros" },
  { tipo: "intermediacion", pagina: 12, icono: DatabaseOutlined, titulo: "Intermediación Financiera", texto: "Análisis de colocaciones y captaciones" },
  { tipo: "indicadores", pagina: 27, icono: FileTextOutlined, titulo: "Indicadores Financieros", texto: "Métricas clave" },
  { tipo: "tasas", pagina: 30, icono: SwapOutlined, titulo: "Tasas de Interés", texto: "Análisis de tasas de interés" },
  { tipo: "comparativo", pagina: 31, icono: BarChartOutlined, titulo: "Comparativa de Indicadores", texto: "Comparación de métricas clave por entidad financiera" },
];

const cargarInfo = async (entidad: string) => {
  const e = await apiEntidad(archivoEntidad(entidad));
  return {
    tamano: e.tamano ?? "Desconocido",
    rango: e.rango ?? "Desconocido",
    provincia: e.provincia ?? "Desconocido",
  };
};

/** Fecha real de los datos (`versionDatos` de la API); antes se mostraba la hora actual. */
const fmtVersion = (iso: string) =>
  new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

/**
 * La entidad y la hoja abierta van en la URL (`?entidad=BP.%20AMAZONAS&hoja=27`): se pueden
 * compartir, el boton "atras" del navegador vuelve a la hoja anterior y otras pantallas (Monitor
 * del Sistema) abren la revista de una entidad. Plan 06, items 1.17 y 1.20.
 */
const useEstadoUrl = () => {
  const [params, setParams] = useSearchParams();
  const entidad = params.get("entidad") || ENTIDAD_INICIAL;
  const hoja = Number(params.get("hoja"));
  const revista = Number.isInteger(hoja) && hoja >= 1 && hoja <= HOJAS.length ? hoja : null;
  const cambiar = useCallback(
    (cambios: Record<string, string | null>, reemplazar = false) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p);
          Object.entries(cambios).forEach(([k, v]) => (v === null ? n.delete(k) : n.set(k, v)));
          return n;
        },
        { replace: reemplazar },
      ),
    [setParams],
  );
  const setEntidad = useCallback((e: string) => cambiar({ entidad: e }, true), [cambiar]);
  const setRevista = useCallback((n: number | null) => cambiar({ hoja: n === null ? null : String(n) }), [cambiar]);
  return { entidad, revista, setEntidad, setRevista };
};

const Analisis = () => {
  const { entidad, revista, setEntidad, setRevista } = useEstadoUrl();

  const { data: lista } = useService(cargarListaEntidades, [], [], true, "No se pudo cargar la lista de entidades");
  const { data: info, isLoading: cargandoInfo } = useService(cargarInfo, [entidad], [], true, "No se pudo cargar la entidad");
  const { data: meta } = useService(apiMeta, [], [], true, "No se pudo obtener la fecha de los datos");

  const volver = useCallback(() => setRevista(null), [setRevista]);

  if (revista !== null) {
    return <Revista entidad={entidad} pagina={revista} onPagina={setRevista} onEntidad={setEntidad} onVolver={volver} />;
  }

  return (
    <div className="mx-auto flex max-w-[1300px] flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="m-0 text-titulo font-semibold text-identidad">Reportes interactivos</h1>
          <p className="m-0 text-tinta-tenue">Explora los reportes de forma fácil y rápida.</p>
        </div>
        <div className="flex items-center gap-3 rounded-contenedor bg-superficie px-4 py-2 shadow-tarjeta">
          <span className="text-titulo text-accion inline-flex"><CalendarOutlined /></span>
          <div className="flex flex-col">
            <span className="text-rotulo text-tinta-tenue">Datos actualizados</span>
            <span className="font-semibold text-tinta">{meta ? fmtVersion(meta.versionDatos) : "…"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="rounded-contenedor border-t-4 border-accion bg-superficie p-4 shadow-tarjeta">
            <div className="flex items-center gap-2 font-semibold text-tinta">
              <span className="text-accion inline-flex"><AppstoreOutlined /></span> Dashboard de calidad
            </div>
            <p className="m-0 mt-1 text-detalle text-tinta-tenue">Seguimiento de indicadores y métricas</p>
          </div>
          <div className="rounded-contenedor bg-superficie p-4 shadow-tarjeta">
            <label className="mb-2 block font-semibold text-tinta">Entidad financiera</label>
            <Select
              className="w-full"
              showSearch
              value={entidad}
              loading={!lista}
              options={(lista ?? []).map((e) => ({ value: e.nombre, label: e.nombre }))}
              onChange={setEntidad}
              placeholder="Buscar entidad financiera..."
              notFoundContent="No se encontró la entidad"
            />
            <div className="mt-4 rounded-tarjeta border border-linea p-3">
              <div className="mb-2 flex items-center gap-2 font-semibold text-tinta">
                <span className="text-accion inline-flex"><BankOutlined /></span> {entidad}
              </div>
              {cargandoInfo ? (
                <Spin size="small" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-rotulo text-tinta-tenue">
                      <LineChartOutlined /> Tamaño
                    </div>
                    <div className="font-semibold">{info?.tamano ?? "No disponible"}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-rotulo text-tinta-tenue">
                      <DollarOutlined /> Nivel Activos
                    </div>
                    <div className="font-semibold">{info?.rango ?? "No disponible"}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {REPORTES.map((r) => (
            <button
              key={r.tipo}
              type="button"
              onClick={() => setRevista(r.pagina)}
              className="flex cursor-pointer items-center gap-4 rounded-contenedor border border-linea bg-superficie p-4 text-left shadow-tarjeta transition-colors hover:border-accion hover:bg-accion-sutil"
            >
              <span className="inline-flex text-cifra text-accion">
                <r.icono />
              </span>
              <div>
                <h4 className="m-0 text-cuerpo font-semibold text-tinta">{legible(r.titulo)}</h4>
                <p className="m-0 text-detalle text-tinta-tenue">{r.texto}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-contenedor bg-superficie p-5 shadow-tarjeta">
        <div className="flex items-center gap-3">
          <span className="text-cifra text-accion inline-flex"><BulbOutlined /></span>
          <div>
            <h4 className="m-0 font-semibold text-tinta">Todo lo que necesitas, en un solo lugar.</h4>
            <p className="m-0 text-detalle text-tinta-tenue">Explora los reportes del equipo de forma fácil y rápida.</p>
          </div>
        </div>
        <div className="flex gap-2 text-cifra text-accion">
          <LineChartOutlined />
          <PieChartOutlined />
        </div>
      </div>
    </div>
  );
};

export default Analisis;
