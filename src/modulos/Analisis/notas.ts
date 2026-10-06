/**
 * Notas metodológicas de las gráficas (ícono ⓘ de `TarjetaGrafica`). Plan 06, item 1.8.
 * Se centralizan aquí para reutilizarlas y, más adelante, servirlas desde el catálogo de
 * indicadores de la API (plan 06, item 3.1).
 */

export const NOTA_SEGMENTACION_2021 =
  "Las series por segmento empiezan en mayo de 2021, cuando entró en vigor la nueva segmentación de la cartera de crédito " +
  "(reclasificación de líneas). No son comparables con cifras publicadas antes de esa fecha con la segmentación anterior.";

export const NOTA_DERIVADO = "Calculado por el sistema con las cuentas del balance de la entidad.";

export const NOTA_ANUALIZADO =
  "Los flujos de resultados están anualizados (acumulado del año × 12 / mes) y los saldos son el promedio de los últimos 12 meses.";

export const NOTA_POR_VALIDAR = "📘 Fórmula estándar de la literatura, pendiente de validar con negocio.";

export const NOTA_COBERTURA_SIN_MORA =
  "Cuando el segmento casi no tiene cartera improductiva (menos de 1.000 USD) la cobertura se deja sin dato: el cociente no es significativo.";

/** Une varias notas en un párrafo. */
export const notas = (...partes: string[]) => partes.join(" ");
