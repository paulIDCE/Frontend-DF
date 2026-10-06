import api from "@/interceptors/authInterceptor";
import type {
  Agrupacion,
  CuadroApi,
  Entidad,
  MetaApi,
  RankingApi,
  ReporteApi,
  SeriesSistemaApi,
} from "@/types/api";

/**
 * Lectura de datos desde la API de BackendDF (reemplaza los JSON de
 * `public/data`). Contrato en `@/types/api`.
 *
 * Cachea la PROMESA por URL + parametros, como la lectura de JSON a la que
 * reemplaza: dos pantallas que piden lo mismo a la vez comparten una sola
 * llamada y un fallo no queda cacheado. Encima, el navegador revalida con ETag.
 */

type Params = Record<string, string | number | boolean | undefined | null>;

/** Quita los parametros vacios: mandar uno que no aplica al cuadro es 400. */
const limpiar = (p: Params) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ""));

const cache = new Map<string, Promise<unknown>>();

const leer = <T>(url: string, params: Params = {}): Promise<T> => {
  const limpios = limpiar(params);
  const clave = url + JSON.stringify(limpios);
  let promesa = cache.get(clave) as Promise<T> | undefined;
  if (!promesa) {
    promesa = api.get<T>(url, { params: limpios }).then((r) => {
      // Sin `baseURL` (p. ej. el cliente se recreo en un HMR antes de `initializeAuthService`) la
      // peticion cae en el servidor de la app y vuelve el `index.html` con 200: no es un dato.
      if (r.data === null || typeof r.data !== "object") {
        throw new Error(`Respuesta inesperada de la API en ${url}: se esperaba JSON.`);
      }
      return r.data;
    });
    promesa.catch(() => cache.delete(clave));
    cache.set(clave, promesa);
  }
  return promesa;
};

const seg = encodeURIComponent;

/** Las 229 entidades del catalogo, en orden alfabetico. */
export const apiEntidades = () => leer<Entidad[]>("/entidades");

export const apiEntidad = (id: string) => leer<Entidad>(`/entidades/${seg(id)}`);

export interface FiltrosCuadro {
  sector?: string;
  entidad?: string;
  analisis?: string;
  credito?: string;
  desde?: string;
  hasta?: string;
}

/** Solo se mandan los filtros que aplican al tipo de cuadro (los demas dan 400). */
export const apiCuadro = (id: string, f: FiltrosCuadro = {}) => leer<CuadroApi>(`/cuadros/${seg(id)}`, { ...f });

/** Las 776 cuentas de una entidad (≈170 KB comprimido): se pide completo una vez y queda cacheado. */
export const apiReporte = (entidadId: string) => leer<ReporteApi>(`/entidades/${seg(entidadId)}/reporte`);

export const apiRanking = (p: { cuenta: string; fecha: string; agrupacion: Agrupacion; entidad?: string }) =>
  leer<RankingApi>("/rankings", p);

export const apiSeriesSistema = (codigos: string[], cuadros?: string[], sectores?: string[]) =>
  leer<SeriesSistemaApi>("/sistema/series", {
    codigos: codigos.join(","),
    cuadros: cuadros?.join(","),
    sectores: sectores?.join(","),
  });

export const apiMeta = () => leer<MetaApi>("/meta");

export type EstadoSalud = "Healthy" | "Degraded" | "Unhealthy";

/**
 * `GET /api/health` (sin cache: se consulta en cada cambio de pantalla). Pasa a `Degraded` si SQL
 * cae —y entonces todos los endpoints responden solo con JSON— o mientras se construye el indice.
 * Responde `{ status, detalle }`; si el host lo sirviera como texto plano, se toma el cuerpo.
 */
export const apiSalud = async (): Promise<EstadoSalud> => {
  const r = await api.get<{ status?: string } | string>("/health", { validateStatus: () => true });
  const estado = typeof r.data === "string" ? r.data : r.data?.status ?? "";
  if (/Unhealthy/i.test(estado)) return "Unhealthy";
  if (/Degraded/i.test(estado)) return "Degraded";
  return "Healthy";
};
