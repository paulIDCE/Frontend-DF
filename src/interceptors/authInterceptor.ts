import axios, { type AxiosInstance } from "axios";
import type { RoutesConfig } from "@/types/routesConfig";
import { AUTH_TOKEN_KEY, HTTP_TIMEOUT, devError } from "@idce/kit";
import { getSupabase, supabaseDisponible } from "@/auth/supabase";

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
 * Token de la sesion de Supabase (login propio de la app): `getSession()`
 * devuelve la sesion guardada y la renueva si el access_token expiro.
 * `localStorage` y la cookie quedan como fallback para el SSO propio futuro.
 */
const getAuthToken = async (): Promise<string | undefined> => {
  if (supabaseDisponible()) {
    const { data } = await getSupabase().auth.getSession();
    if (data.session) return data.session.access_token;
  }

  const stored = localStorage.getItem(AUTH_TOKEN_KEY);
  if (stored) return stored;

  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${AUTH_TOKEN_KEY}=`))
    ?.replace(`${AUTH_TOKEN_KEY}=`, "");
};

/**
 * `withCredentials` solo donde el backend lo permite: BackendDF no usa cookies y no manda
 * `Access-Control-Allow-Credentials`, asi que con `true` el navegador descarta cada respuesta
 * (CORS) y el interceptor la confunde con un backend caido.
 */
const createClient = (withCredentials: boolean): AxiosInstance => {
  const instance = axios.create({
    timeout: HTTP_TIMEOUT,
    withCredentials,
  });

  instance.interceptors.request.use(
    async (config) => {
      const token = await getAuthToken();
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
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
        // Sin esto la sesion vencida de Supabase seguiria mandando el mismo token.
        if (supabaseDisponible()) await getSupabase().auth.signOut().catch(() => undefined);
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
export const api = createClient(false);

/** API del SSO: Empleado, Oficina, Catalogos y validateToken. */
export const apiSSO = createClient(true);

/** Registrada en `allServices` (indexService); la llama `ConfigProvider` al arrancar. */
export const initializeAuthService = (config: RoutesConfig): void => {
  api.defaults.baseURL = config.VITE_API_URL;
  apiSSO.defaults.baseURL = config.VITE_API_SSO_URL;
};

export default api;
