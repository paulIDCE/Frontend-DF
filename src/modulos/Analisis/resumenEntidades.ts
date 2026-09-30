import { archivoEntidad, leerJson, leerJsonSinCache } from "@/services/datosService";
import type { FilaReporte } from "./datos";

/**
 * Resumen de TODAS las entidades para rankings (hojas 5, 9, 24-26) y el
 * comparativo (hoja 31) — reemplaza `loadRankingData` / `loadAllEntitiesData`.
 *
 * El original descargaba los 229 reportes (~283 MB) una vez POR CUENTA de
 * ranking. Aqui se barren una sola vez, con concurrencia limitada, y de cada
 * reporte se guardan solo las filas de `CODIGOS_RESUMEN`.
 */

export interface EntidadLista {
  id: string;
  nombre: string;
  archivo?: string;
}

export interface ResumenEntidad {
  nombre: string;
  tamano: string;
  rango: string;
  provincia: string;
  /** CUC (en mayusculas) -> fila del reporte. */
  cuentas: Map<string, FilaReporte>;
}

/** Cuentas que usan los rankings y el comparativo entre entidades. */
export const CODIGOS_RESUMEN = new Set<string>();
export const registrarCodigos = (codigos: string[]) => codigos.forEach((c) => CODIGOS_RESUMEN.add(c.toUpperCase()));

registrarCodigos(["@1", "@2", "@14", "monto_total", "mop", "IF007", "SB010", "@21", "@2103", "IF012", "ope_total", "monto_pro", "OPTPE", "pro_MOP"]);

export const cargarListaEntidades = async (): Promise<EntidadLista[]> =>
  [...(await leerJson<EntidadLista[]>("entidades_lista.json"))].sort((a, b) => a.nombre.localeCompare(b.nombre));

export const rutaReporte = (e: EntidadLista | string) =>
  `reportes/${typeof e === "string" ? archivoEntidad(e) : e.archivo || archivoEntidad(e.nombre)}.json`;

export const infoDe = (filas: FilaReporte[]) => ({
  tamano: String(filas[0]?.Tamaño ?? "Desconocido"),
  rango: String(filas[0]?.Rango_Activos ?? "Desconocido"),
  provincia: String(filas[0]?.DPA_PR ?? "Desconocido"),
});

let promesa: Promise<ResumenEntidad[]> | null = null;

const conLimite = async <T, R>(items: T[], limite: number, fn: (t: T) => Promise<R>): Promise<R[]> => {
  const salida: R[] = new Array(items.length);
  let i = 0;
  const trabajador = async () => {
    while (i < items.length) {
      const k = i++;
      salida[k] = await fn(items[k]);
    }
  };
  await Promise.all(Array.from({ length: limite }, trabajador));
  return salida;
};

export const cargarResumenEntidades = (): Promise<ResumenEntidad[]> => {
  if (!promesa) {
    promesa = (async () => {
      const lista = await cargarListaEntidades();
      const res = await conLimite(lista, 8, async (e) => {
        try {
          const filas = await leerJsonSinCache<FilaReporte[]>(rutaReporte(e));
          if (!filas?.length) return null;
          const cuentas = new Map<string, FilaReporte>();
          filas.forEach((f) => {
            for (const k of [f.CUC, f.Variable]) {
              const c = k === undefined || k === null ? "" : String(k).toUpperCase();
              if (c && CODIGOS_RESUMEN.has(c) && !cuentas.has(c)) cuentas.set(c, f);
            }
          });
          return { nombre: e.nombre, ...infoDe(filas), cuentas };
        } catch {
          return null;
        }
      });
      return res.filter(Boolean) as ResumenEntidad[];
    })();
    promesa.catch(() => {
      promesa = null;
    });
  }
  return promesa;
};

export const valorEntidad = (e: ResumenEntidad, code: string, fecha: string): number => {
  const n = parseFloat(String(e.cuentas.get(code.toUpperCase())?.[fecha]));
  return Number.isNaN(n) ? 0 : n;
};
