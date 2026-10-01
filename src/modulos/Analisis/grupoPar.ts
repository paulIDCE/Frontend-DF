import type { RankingApi } from "@/types/api";
import type { Sentido } from "./catalogoIndicadores";

/**
 * Utilidades de grupo par sobre la respuesta de `GET /api/rankings` (plan 06, items 1.15 y 1.16).
 * La API ordena por participacion, que solo tiene sentido para saldos; para un indicador (ratio) se
 * reordena por valor segun el sentido favorable.
 */

export interface FilaIndicador {
  entidadId: string;
  nombre: string;
  anterior: number | null;
  actual: number | null;
  participacion: number;
  /** 1 = la mejor segun el sentido del indicador; 0 = sin dato. */
  posicion: number;
}

/**
 * Filas del ranking ordenadas por valor (mejor primero). Las entidades sin dato van al final.
 * La API cuenta un nulo como 0: en un ratio, 0 en los dos cortes es "sin dato" (p. ej. morosidad de
 * microcredito de un banco que no da microcredito) y no debe salir primero en un "menor es mejor".
 */
export const ordenarPorIndicador = (r: RankingApi, sentido: Sentido, esRatio = true): FilaIndicador[] => {
  const sinDato = (actual: number, anterior: number) => !Number.isFinite(actual) || (esRatio && actual === 0 && anterior === 0);
  const filas = r.filas.map((f) => ({
    entidadId: f.entidadId,
    nombre: f.nombre,
    anterior: Number.isFinite(f.anterior) && !(esRatio && f.anterior === 0 && f.actual === 0) ? f.anterior : null,
    actual: sinDato(f.actual, f.anterior) ? null : f.actual,
    participacion: f.participacionActual,
    posicion: 0,
  }));
  const signo = sentido === "sube" ? -1 : 1;
  filas.sort((a, b) => {
    if (a.actual === null || b.actual === null) return (a.actual === null ? 1 : 0) - (b.actual === null ? 1 : 0);
    return signo * (a.actual - b.actual);
  });
  // Sin dato: sin posicion (0).
  filas.forEach((f, i) => (f.posicion = f.actual === null ? 0 : i + 1));
  return filas;
};
