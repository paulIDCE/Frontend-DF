import { apiSSO } from "@/interceptors/authInterceptor";
import type { Provincia } from "@/types/provincia";
import type { RoutesConfig } from "@/types/routesConfig";

/**
 * Provincia es un catalogo que administra el SSO -> usa `apiSSO`.
 * Un servicio de dominio propio usaria `api` en su lugar (§6).
 *
 * Patron de servicio (§4): la base NO se lee de `import.meta.env`; llega por
 * inyeccion desde `initializeServices` y se guarda en este `API_URL` de modulo.
 *
 * ➜ Todo servicio nuevo debe registrarse en `allServices` (indexService).
 */
let API_URL = "";

export const initializeProvinciaService = (config: RoutesConfig): void => {
  API_URL = config.VITE_API_SSO_URL;
};

export const getAllProvincia = async (): Promise<Provincia[]> => {
  const response = await apiSSO.get(`${API_URL}/Provincia/GetAll`);
  return response.data;
};

export const getProvinciaByPais = async (
  pais: string
): Promise<Provincia[]> => {
  const response = await apiSSO.get(
    `${API_URL}/Provincia/GetByPais?paisIso2=${pais}`
  );
  return response.data;
};

export const insertProvincia = async (
  provincia: Omit<Provincia, "provinciaID">
): Promise<Provincia> => {
  const response = await apiSSO.post(`${API_URL}/Provincia/Insert`, provincia);
  return response.data;
};

export const updateProvincia = async (
  provincia: Provincia
): Promise<Provincia> => {
  const response = await apiSSO.put(`${API_URL}/Provincia/Update`, provincia);
  return response.data;
};

export const deleteProvincia = async (provinciaID: number): Promise<void> => {
  await apiSSO.delete(`${API_URL}/Provincia/Delete?provinciaID=${provinciaID}`);
};
