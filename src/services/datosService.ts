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

const url = (ruta: string) => `${BASE}/${ruta.replace(/^\/+/, "")}`;

export const leerJson = <T>(ruta: string): Promise<T> => {
  const u = url(ruta);
  let promesa = cache.get(u) as Promise<T> | undefined;
  if (!promesa) {
    promesa = fetch(u).then(async (r) => {
      if (!r.ok) throw new Error(`No se pudo cargar ${ruta} (${r.status})`);
      return (await r.json()) as T;
    });
    // Un fallo no se queda cacheado: el siguiente intento vuelve a pedirlo.
    promesa.catch((e) => {
      devError("[datos]", e);
      cache.delete(u);
    });
    cache.set(u, promesa);
  }
  return promesa;
};

/**
 * Lectura sin cache, para barridos grandes (los 229 reportes de rankings):
 * quien llama se queda solo con lo que necesita y el resto se libera.
 */
export const leerJsonSinCache = async <T>(ruta: string): Promise<T> => {
  const r = await fetch(url(ruta));
  if (!r.ok) throw new Error(`No se pudo cargar ${ruta} (${r.status})`);
  return (await r.json()) as T;
};

/** `BP. PICHINCHA` -> `BP__PICHINCHA` (nombre de archivo por entidad, igual que prueba-data). */
export const archivoEntidad = (nombre: string): string =>
  nombre
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // marcas diacriticas (tildes) tras NFD
    .replace(/[^A-Za-z0-9]/g, "_");
