/**
 * Identidad de la app.
 *
 * ⚠️ AnalisisFinanciero NO es satelite del SSO (tiene login y shell propios,
 * ver docs/ARQUITECTURA_APP.md), asi que sus pantallas cuelgan de rutas planas
 * y no de `/Modulos<APP_CODE>`. `MODULOS_BASE_PATH` / `menuPath` se conservan
 * por compatibilidad con el kit (breadcrumbs, pagina de ejemplo).
 */
export const APP_CODE = "AF";

export const MODULOS_BASE_PATH = `/Modulos${APP_CODE}`;

export const menuPath = (ruta: string): string =>
  `${MODULOS_BASE_PATH}/${ruta.replace(/^\/+/, "")}`;

/**
 * De donde salen los datos de una pantalla (banda de `AvisoOrigenDatos`, solo en produccion):
 * - `bd`: todo de la BD (verde). Hoy ninguna: BackendDF siempre toma del JSON el orden de filas,
 *   los titulos y el catalogo de entidades.
 * - `mixto`: saldos de cuentas @NNNN desde SQL y el resto del JSON (amarillo).
 * - `json`: valores desde los JSON del backend, no de la BD (rojo).
 * Es el origen por defecto; los exploradores lo ajustan segun el cuadro (`useReportarOrigen`).
 * Sin `origen` (Home, que no muestra datos) no hay banda. Detalle por endpoint en `origenDatos.ts`.
 */
export type OrigenDatos = "bd" | "mixto" | "json";

/** Pantallas de la app (rutas planas), su rotulo en la navegacion y el origen de sus datos. */
export const PANTALLAS: readonly { ruta: string; titulo: string; origen?: OrigenDatos }[] = [
  { ruta: "/dashboard", titulo: "Home" },
  // Cuadros macro del BCE (IEA, IEM): solo JSON.
  { ruta: "/macro", titulo: "Entorno Macroeconómico", origen: "json" },
  // Depende del cuadro: lo reporta ExploradorSistema.
  { ruta: "/sistema", titulo: "Sistema Financiero", origen: "json" },
  // /sistema/series y /rankings: cuentas desde SQL, indicadores y agrupaciones desde JSON.
  { ruta: "/monitor", titulo: "Monitor del Sistema", origen: "mixto" },
  // Depende del cuadro: lo reporta ExploradorSistema.
  { ruta: "/tasas", titulo: "Tasas de Interés", origen: "json" },
  // Reporte REP01 y rankings: cuentas desde SQL, indicadores (PERLAS, CAMELS…) desde JSON.
  { ruta: "/analisis", titulo: "Análisis Financiero", origen: "mixto" },
];
