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

/** Pantallas de la app (rutas planas) y su rotulo en la navegacion. */
export const PANTALLAS = [
  { ruta: "/dashboard", titulo: "Home" },
  { ruta: "/macro", titulo: "Entorno Macroeconómico" },
  { ruta: "/sistema", titulo: "Sistema Financiero" },
  { ruta: "/tasas", titulo: "Tasas de Interés" },
  { ruta: "/analisis", titulo: "Análisis Financiero" },
] as const;
