import { apiSSO } from "@/interceptors/authInterceptor";
import type { GetUsuariosByInstitucionDTO, TokenRequest } from "@/types/user";
import type { RoutesConfig } from "@/types/routesConfig";

/**
 * Usuario y validateToken los administra el SSO -> usa `apiSSO`.
 *
 * Patron de servicio (§4): la base llega por inyeccion, no de `import.meta.env`.
 */
let API_URL = "";

export const initializeUserService = (config: RoutesConfig): void => {
  API_URL = config.VITE_API_SSO_URL;
};

const validateToken = async (token: TokenRequest) => {
  const response = await apiSSO.post(`${API_URL}/Usuario/ValidarJWT`, token);
  return response.data;
};

const getUsersByIntitucion = async (
  institucionID: number
): Promise<GetUsuariosByInstitucionDTO[]> => {
  const response = await apiSSO.get(
    `${API_URL}/Usuario/GetUsuarioByInstitucion?institucionID=${institucionID}`
  );
  return response.data;
};

export { validateToken, getUsersByIntitucion };
