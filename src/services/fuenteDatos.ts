import { esSinHistoria, type FilasPorFuente, type FuenteDatos, type FuenteDatosCuadro } from "@/types/api";

/**
 * Fuente de los datos (BackendDF/docs/contrato-fuente-datos.md): textos y utilidades puras que
 * comparten la pantalla, las descargas (Excel/CSV) y los informes.
 */

export const ETIQUETA_FUENTE: Record<FuenteDatosCuadro, string> = {
  bd: "Base de datos",
  json: "Archivos JSON",
  mixto: "Mixto (BD + JSON)",
};

/** Corta, para la marca por fila y la columna "Fuente" de las descargas. */
export const SIGLA_FUENTE: Record<FuenteDatos, string> = { bd: "BD", json: "JSON" };

export const TEXTO_SIN_HISTORIA = "Sin historia previa en la base de datos";

/** Fuente de un conjunto de filas anchas (`_fuente`): la revista solo tiene filas, no el reporte. */
export const fuenteDeFilas = (filas: Record<string, unknown>[]): FuenteDatosCuadro | null => {
  const hay = new Set(filas.map((f) => f._fuente).filter((f): f is FuenteDatos => f === "bd" || f === "json"));
  return hay.size === 2 ? "mixto" : hay.size === 1 ? [...hay][0] : null;
};

/** Conteo como `filasPorFuente`, para filas anchas. */
export const conteoDeFilas = (filas: Record<string, unknown>[]): FilasPorFuente => ({
  bd: filas.filter((f) => f._fuente === "bd").length,
  json: filas.filter((f) => f._fuente === "json").length,
  sinFuente: filas.filter((f) => f._fuente === null).length,
});

/** `true` si el vacio de la fila ancha en `periodo` es por falta de meses anteriores en la BD. */
export const vacioSinHistoria = (fila: Record<string, unknown>, periodo: string, valor: unknown) =>
  (valor === null || valor === undefined || valor === "") &&
  typeof fila._sinHistoriaHasta === "string" &&
  esSinHistoria({ sinHistoriaHasta: fila._sinHistoriaHasta }, periodo);

const filas = (n: number) => `${n} ${n === 1 ? "fila" : "filas"}`;

/** Texto de la insignia de un cuadro: de donde sale todo el cuadro, con el conteo de filas. */
export const detalleFuente = (fuente: FuenteDatosCuadro, conteo?: FilasPorFuente) => {
  const sinDato = conteo?.sinFuente ? ` ${filas(conteo.sinFuente)} sin dato en ninguna fuente.` : "";
  if (fuente === "mixto") {
    if (!conteo) return "El cuadro combina la base de datos y archivos JSON; cada fila indica su fuente.";
    return `El cuadro combina fuentes: ${filas(conteo.bd)} de la base de datos y ${filas(conteo.json)} de archivos JSON. Cada fila indica la suya.${sinDato}`;
  }
  const n = conteo ? ` (${filas(fuente === "bd" ? conteo.bd : conteo.json)})` : "";
  const origen = fuente === "bd" ? "de la base de datos" : "de archivos JSON";
  return `Todos los datos de este cuadro${n} salen ${origen}.${sinDato}`;
};
