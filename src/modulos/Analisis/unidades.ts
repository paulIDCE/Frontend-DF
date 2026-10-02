/** Unidad de una celda de valor de la revista (`CeldaValor`). */
export type UnidadCelda = "monto" | "%" | "numero";

/** Unidad de celda a partir del rotulo del eje de la configuracion ("millones USD", "porcentajes (%)", "número"). */
export const unidadDeEje = (eje: string): UnidadCelda =>
  /millones|usd/i.test(eje) ? "monto" : /porcent|%/i.test(eje) ? "%" : "numero";
