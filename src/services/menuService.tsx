import { apiSSO } from "@/interceptors/authInterceptor";
import type { MenuByUserDTO } from "@/types/menu";
import type { RoutesConfig } from "@/types/routesConfig";

/**
 * Los permisos de menu los administra el SSO -> usa `apiSSO`.
 *
 * Esta es la fuente del guard de autorizacion (`AuthorizedRoute`). La
 * autorizacion real la impone el backend; el guard del front es defensa en
 * profundidad, no la unica barrera (§6).
 */
let API_URL = "";

export const initializeMenuService = (config: RoutesConfig): void => {
  API_URL = config.VITE_API_SSO_URL;
};

/** Menus que el perfil del usuario autenticado tiene permitidos. */
export const getMenusByUser = async (): Promise<MenuByUserDTO[]> => {
  const response = await apiSSO.get(`${API_URL}/Menu/GetMenusByUser`);
  return response.data;
};
