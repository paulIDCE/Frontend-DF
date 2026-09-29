import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RoutesConfig } from "@/types/routesConfig";
import { devError } from "@idce/kit";

/**
 * Cliente de Supabase — autenticacion propia de la app.
 *
 * A diferencia de los satelites del kit (token del SSO host + ValidarJWT),
 * AnalisisFinanciero tiene su propio login. Por ahora es Supabase, igual que en
 * prueba-data; ver docs/ARQUITECTURA_APP.md para el reemplazo por el SSO propio.
 *
 * Patron de servicio (§4): la URL y la key llegan por `routes.json`.
 */
let client: SupabaseClient | null = null;

export const initializeSupabase = (config: RoutesConfig): void => {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    devError("[auth] routes.json sin SUPABASE_URL / SUPABASE_ANON_KEY");
    return;
  }
  client = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
};

export const supabaseDisponible = (): boolean => client !== null;

export const getSupabase = (): SupabaseClient => {
  if (!client) {
    throw new Error("Supabase no inicializado: revisar /config/routes.json");
  }
  return client;
};
