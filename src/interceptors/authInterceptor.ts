import axios, { type AxiosInstance } from "axios";
import type { RoutesConfig } from "@/types/routesConfig";
import { AUTH_TOKEN_KEY, HTTP_TIMEOUT, devError } from "@idce/kit";

/**
 * Capa HTTP central (§6).
 *
 * Una app servida habla con DOS APIs, asi que se exportan dos instancias axios
 * creadas por el mismo factory y con los mismos interceptores:
 *
 *   - `api`    -> VITE_API_URL     (dominio propio de la app)
 *   - `apiSSO` -> VITE_API_SSO_URL (Empleado, Oficina, Catalogos, validateToken)
 *
 * Ninguna llamada debe usar `axios` directo para endpoints protegidos.
 */

/**
 * El token vive en `localStorage` y lo comparten ambas instancias.
 * Se deja la cookie como fallback porque el SSO la escribe al redirigir.
 */
const getAuthToken = (): string | undefined => {
  const stored = localStorage.getItem(AUTH_TOKEN_KEY);
  if (stored) return stored;

  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${AUTH_TOKEN_KEY}=`))
    ?.replace(`${AUTH_TOKEN_KEY}=`, "");
};

const createClient = (): AxiosInstance => {
  const instance = axios.create({
    timeout: HTTP_TIMEOUT,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Backend caido: no tiene sentido propagar el error a cada pantalla.
      if (!error.response && error.code === "ERR_NETWORK") {
        devError("Error de red detectado. Redirigiendo a /500.");
        window.location.href = "/500";
        // Promesa que nunca resuelve: corta la cadena antes de llegar a React.
        return new Promise(() => {});
      }

      if (error.response?.status === 401) {
        devError("Sesion expirada o token invalido.");
        localStorage.removeItem(AUTH_TOKEN_KEY);
        // Evita el bucle si la propia pantalla de login devolvio 401.
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

/** API propia de la app. */
export const api = createClient();

/** API del SSO: Empleado, Oficina, Catalogos y validateToken. */
export const apiSSO = createClient();

/** Registrada en `allServices` (indexService); la llama `ConfigProvider` al arrancar. */
export const initializeAuthService = (config: RoutesConfig): void => {
  api.defaults.baseURL = config.VITE_API_URL;
  apiSSO.defaults.baseURL = config.VITE_API_SSO_URL;
};

export default api;
