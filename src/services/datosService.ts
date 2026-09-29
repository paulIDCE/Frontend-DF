import type { RoutesConfig } from "@/types/routesConfig";
import { devError } from "@idce/kit";

/**
 * Lectura de los JSON estaticos migrados de prueba-data (`public/data`).
 *
 * Primer paso de la migracion: los datos se sirven tal cual, como archivos.
 * Cuando exista API propia, solo cambia este servicio (ver
 * docs/ARQUITECTURA_APP.md). Cachea la PROMESA por ruta: dos pantallas que
 * piden el mismo archivo a la vez comparten una sola descarga (reemplaza los
 * `allDataCache` / `entidadDataCache` globales del original).
 */
let BASE = "/data";

export const initializeDatosService = (config: RoutesConfig): void => {
  BASE = (config.DATA_BASE_URL || "/data").replace(/\/+$/, "");
};

const cache = new Map<string, Promise<unknown>>();

export const leerJson = <T>(ruta: string): Promise<T> => {
  const url = `${BASE}/${ruta.replace(/^\/+/, "")}`;
  let promesa = cache.get(url) as Promise<T> | undefined;
  if (!promesa) {
    promesa = fetch(url).then(async (r) => {
      if (!r.ok) throw new Error(`No se pudo cargar ${ruta} (${r.status})`);
      return (await r.json()) as T;
    });
    // Un fallo no se queda cacheado: el siguiente intento vuelve a pedirlo.
    promesa.catch((e) => {
      devError("[datos]", e);
      cache.delete(url);
    });
    cache.set(url, promesa);
  }
  return promesa;
};

/** `BP. PICHINCHA` -> `BP__PICHINCHA` (nombre de archivo por entidad, igual que prueba-data). */
export const archivoEntidad = (nombre: string): string =>
  nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "_");
