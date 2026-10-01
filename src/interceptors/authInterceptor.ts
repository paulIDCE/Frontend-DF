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
/**
 * Ultima config aplicada, fuera del modulo: si el HMR de Vite vuelve a ejecutar este archivo, las
 * instancias nuevas nacen con su `baseURL` (sin ella las peticiones caen en el servidor de la app).
 */
const configGlobal = globalThis as { __rutasApi?: Pick<RoutesConfig, "VITE_API_URL" | "VITE_API_SSO_URL"> };

const createClient = (withCredentials: boolean, baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    timeout: HTTP_TIMEOUT,
    withCredentials,
    baseURL,
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
export const api = createClient(false, configGlobal.__rutasApi?.VITE_API_URL);

/** API del SSO: Empleado, Oficina, Catalogos y validateToken. */
export const apiSSO = createClient(true, configGlobal.__rutasApi?.VITE_API_SSO_URL);

/** Registrada en `allServices` (indexService); la llama `ConfigProvider` al arrancar. */
export const initializeAuthService = (config: RoutesConfig): void => {
  configGlobal.__rutasApi = { VITE_API_URL: config.VITE_API_URL, VITE_API_SSO_URL: config.VITE_API_SSO_URL };
  api.defaults.baseURL = config.VITE_API_URL;
  apiSSO.defaults.baseURL = config.VITE_API_SSO_URL;
};

export default api;
