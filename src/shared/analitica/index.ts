/**
 * Kit de vistas analiticas (antd + ECharts). Es la forma oficial de pintar graficas en el
 * ecosistema: `TarjetaGrafica`, no `ReactECharts` suelto.
 *
 * Nacio al extraer lo generico de una vista analitica y es la unica fuente: los sistemas instalan
 * `@idce/kit`, no copian esta carpeta. Guia de uso: `docs/VISTAS_ANALITICAS.md`; ejemplos vivos en
 * `src/guia/graficos/` y `src/demos/VistaAnaliticaDemo.tsx`.
 *
 * Lo propio de un dominio (servicios, indicadores, reglas de negocio) NO entra aqui: se queda en
 * su modulo.
 */

/* Contenedor, pestañas y estados */
export { default as VistaAnalitica, TEMA_ANALITICA, useAltoBarra } from "./VistaAnalitica";
export { default as TabsAnaliticas } from "./TabsAnaliticas";
export type { PestanaAnalitica } from "./TabsAnaliticas";
export { default as SeccionesColapsables } from "./SeccionesColapsables";
export type { SeccionColapsable } from "./SeccionesColapsables";
export { useSeccionesAbiertas, idSeccion } from "./useSeccionesAbiertas";
export { default as LimiteError } from "./LimiteError";
export { default as PantallaInicial } from "./PantallaInicial";
export type { PuntoPantallaInicial } from "./PantallaInicial";
export { default as FranjaSelectores } from "./FranjaSelectores";
export { default as AlternarTablaGrafica } from "./AlternarTablaGrafica";
export type { AlternarTablaGraficaProps, VistaDatos } from "./AlternarTablaGrafica";
export { default as PanelAcoplado } from "./PanelAcoplado";
export type { PanelAcopladoProps } from "./PanelAcoplado";
export { usePanelAcoplado } from "./usePanelAcoplado";
export type { OpcionesPanelAcoplado } from "./usePanelAcoplado";

/* Filtros */
export { default as BarraFiltros } from "./filtros/BarraFiltros";
export type { ChipFiltro } from "./filtros/BarraFiltros";
export { default as SelectorRangoCortes } from "./filtros/SelectorRangoCortes";
export { default as FiltroCatalogo } from "./filtros/FiltroCatalogo";
export { default as useFiltrosBorrador } from "./filtros/useFiltrosBorrador";
export * from "./filtros/validacion";
export type { OpcionFiltro, OpcionesFiltro, OpcionCorte, ResultadoValidacion } from "./filtros/tipos";

/* Graficas */
export { default as TarjetaGrafica } from "./graficas/TarjetaGrafica";
export type { EjesZoom, SeleccionPeriodo, SeleccionRango, SeleccionZoom } from "./graficas/useSeleccionRango";
export { default as TablaDatosModal } from "./graficas/TablaDatosModal";
export { default as MiniGrafica } from "./graficas/MiniGrafica";
export type { MiniGraficaProps } from "./graficas/MiniGrafica";
export { default as RejillaGraficas } from "./graficas/RejillaGraficas";
export type { RejillaGraficasProps } from "./graficas/RejillaGraficas";
export * from "./graficas/opcionesBase";
export { opcionesMatrizCalor } from "./graficas/opcionesMatrizCalor";
export type {
  CeldaMatrizCalor,
  OpcionesMatrizCalor,
  ResalteMatrizCalor,
} from "./graficas/opcionesMatrizCalor";
export { rgbToCss, withAlphaCss, isDarkCss } from "@/design/coloresDato";

/* Paneles de detalle */
export { default as BloqueDetalle, Dato, FichaDatos } from "./detalle/BloqueDetalle";

/* Tablas */
export { default as TablaAnalitica } from "./tablas/TablaAnalitica";
export { default as SelectorColumnas, useColumnasVisibles } from "./tablas/SelectorColumnas";
export type { ColumnaElegible } from "./tablas/SelectorColumnas";
export * from "./tablas/celdas";
export { exportarExcel } from "./exportarExcel";
export type { ColumnaExcel, HojaExcel, FormatoExcel } from "./exportarExcel";

/* KPIs, niveles y formato */
export { default as FilaKpis } from "./kpi/FilaKpis";
export { default as Delta } from "./kpi/Delta";
export { COLOR_KPI, colorLegible } from "./kpi/colores";
export { COLOR_SIN_DATOS, nivelDe } from "./niveles";
export * from "./formato";
