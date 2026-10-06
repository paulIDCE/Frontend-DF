import type { RoutesConfig, ServiceInitializer } from "@/types/routesConfig";
import { initializeAuthService } from "@/interceptors/authInterceptor";
import { initializeUserService } from "@/services/userService";
import { initializeProvinciaService } from "@/services/provinciaService";
import { initializeMenuService } from "@/services/menuService";
import { initializeSupabase } from "@/auth/supabase";
import { initializeAgenteService } from "@/services/agenteService";
import { devGroup, devLog } from "@idce/kit";

/**
 * Registro central de servicios (§4).
 *
 * ➜ TODO servicio nuevo se agrega a `allServices`. Si se olvida, su `API_URL`
 *   queda vacio y sus llamadas salen contra el origen del propio front.
 *
 * `initializeServices` la llama `ConfigProvider` una sola vez, apenas resuelve
 * el fetch de `/config/routes.json` y antes de renderizar el arbol.
 */
const allServices: ServiceInitializer[] = [
  initializeAuthService,
  initializeUserService,
  initializeProvinciaService,
  initializeMenuService,
  initializeSupabase,
  initializeAgenteService,
];

export const initializeServices = (config: RoutesConfig): void => {
  allServices.forEach((initialize) => initialize(config));

  devGroup(`[config] ${allServices.length} servicios inicializados`, () => {
    devLog("VITE_API_URL    ", config.VITE_API_URL);
    devLog("VITE_API_SSO_URL", config.VITE_API_SSO_URL);
  });
};

export default initializeServices;
