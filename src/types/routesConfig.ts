/**
 * Configuracion que la app carga en RUNTIME desde `/config/routes.json`.
 *
 * No se hornea en el build: un mismo bundle sirve para todos los despliegues
 * e instituciones, y solo cambia el JSON que sirve el servidor.
 *
 * Este es el perfil de una **app servida** (satelite del SSO): cuatro campos.
 * El SSO host tiene una config mas rica (VITE_BASE_PATH, VITE_INSTITUCION_ID,
 * VITE_SSO_DEPLOY_PATH) que NO se copia aqui — la institucion sale del token.
 */
export interface RoutesConfig {
  /** API propia de la app (su dominio de negocio) */
  VITE_API_URL: string;
  /** Base URL del API propia */
  VITE_BASE_URL: string;
  /** API del SSO: validateToken y datos que administra el SSO (Empleado, Oficina, Catalogos) */
  VITE_API_SSO_URL: string;
  /** Base URL del API del SSO */
  VITE_BASE_SSO_URL: string;
  /**
   * Autenticacion propia (esta app NO es satelite del SSO, ver
   * docs/ARQUITECTURA_APP.md). Hoy es Supabase, heredado de prueba-data.
   */
  SUPABASE_URL?: string;
  /** Publishable key de Supabase (publica por diseño, no es un secreto). */
  SUPABASE_ANON_KEY?: string;
  /**
   * Webhook del agente de informes (Kipu), workflow n8n "Informes (determinista, multi-tipo)".
   * Sin este campo el boton de Kipu se muestra deshabilitado.
   */
  VITE_AGENTE_INFORMES_URL?: string;
}

/** Funcion que cada servicio expone para recibir las bases por inyeccion. */
export type ServiceInitializer = (config: RoutesConfig) => void;
