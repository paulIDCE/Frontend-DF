/**
 * Referencias estables para usar como valor por defecto de estado async.
 *
 * §7: `data` inicia `undefined`; protegerla en el punto de uso con
 * `data ?? EMPTY_ARRAY`. Usar un literal `[]` en su lugar crea un array nuevo
 * en cada render, lo que dispara los `useEffect`/`useMemo` que dependan de el
 * y termina en un loop de render.
 *
 * @example
 * const { data } = useService(getProvincias);
 * const provincias = data ?? EMPTY_ARRAY;   // referencia estable
 */
// Tipada como `never[]` (y no `readonly never[]`) para que sea asignable a
// cualquier `T[]` sin necesidad de un cast en el punto de uso.
export const EMPTY_ARRAY = Object.freeze([]) as never[];

export const EMPTY_OBJECT: Readonly<Record<string, never>> = Object.freeze({});

/** Clave del token de sesion en localStorage. Compartida por `api` y `apiSSO`. */
export const AUTH_TOKEN_KEY = "authToken";

/** Timeout por defecto de las instancias axios (ms). */
export const HTTP_TIMEOUT = 100000;

/** Ruta del JSON de configuracion runtime servido desde `public/`. */
export const RUNTIME_CONFIG_PATH = "/config/routes.json";
