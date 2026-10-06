import { dec, fmt } from "./datos";

/**
 * Unidades de la revista: UNA forma de nombrarlas y de formatearlas en tablas y graficas.
 * - `musd`: millones de USD (saldos y flujos del balance y la PyG).
 * - `usd`: dolares (montos promedio por operacion).
 * - `%`: porcentajes (indicadores, tasas, participaciones).
 * - `numero`: conteos (numero de operaciones) e indices sin unidad.
 * - `veces`: multiplos (apalancamiento).
 */
export type Unidad = "musd" | "usd" | "%" | "numero" | "veces";

/** Unidad de una celda de valor de la revista (`CeldaValor`). */
export type UnidadCelda = "monto" | "%" | "numero";

export const ROTULO_UNIDAD: Record<Unidad, string> = {
  musd: "Millones USD",
  usd: "USD",
  "%": "Porcentaje (%)",
  numero: "Número",
  veces: "Veces",
};

/**
 * Unidad a partir de los textos heredados de la configuracion ("millones USD", "porcentajes (%)",
 * "porcentaje", "%", "número", "veces", "Tasa (%)"…) o de una `Unidad`. Sin texto: millones USD.
 */
export const unidadDe = (texto?: string | Unidad): Unidad => {
  if (!texto) return "musd";
  const t = texto.toLowerCase();
  if (t === "musd" || /millones|m usd/.test(t)) return "musd";
  if (/%|porcent|tasa/.test(t)) return "%";
  if (/veces/.test(t)) return "veces";
  if (/n[uú]mero|#|índice|indice/.test(t)) return "numero";
  if (/usd|d[oó]lar/.test(t)) return "usd";
  return "musd";
};

/** Marca del eje: sin la unidad larga (va en el subtitulo), pero con "%" en los porcentajes. */
export const fmtEje = (u: Unidad) => (v: number) => (u === "%" ? `${fmt(v)}%` : u === "veces" ? `${fmt(v)}x` : fmt(v));

/** Valor con su unidad, para tooltips y etiquetas: "522,4 M USD", "3,00 %", "1.234", "1,25 veces". */
export const fmtUnidad = (u: Unidad) => (v: number | null | undefined) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return "-";
  switch (u) {
    case "musd":
      return `${fmt(v)} M USD`;
    case "usd":
      return `${dec(v, 2)} USD`;
    case "%":
      return `${dec(v, 2)} %`;
    case "veces":
      return `${dec(v, 2)} veces`;
    default:
      return v.toLocaleString("es-EC", { maximumFractionDigits: 2 });
  }
};

/** Unidad de celda a partir del rotulo del eje de la configuracion ("millones USD", "porcentajes (%)", "número"). */
export const unidadDeEje = (eje: string): UnidadCelda => {
  const u = unidadDe(eje);
  return u === "musd" || u === "usd" ? "monto" : u === "%" ? "%" : "numero";
};
