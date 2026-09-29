import type { FilaCuadro, TipoPeriodo } from "./tipos";

/**
 * Utilidades puras sobre los JSON anchos de prueba-data (porte de las funciones
 * `detectDataType`, `getAllDateColumns`, `formatDateLabel`, `formatNumber`).
 */

const RE_MENSUAL = /^\d{4}-\d{2}$/;
const RE_TRIMESTRAL = /^\d{4}-T\d$/;
const RE_ANUAL = /^\d{4}$/;

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/** Deja fuera metadatos y claves basura (`...109` de base_anual). */
export const esPeriodo = (col: string): boolean =>
  RE_MENSUAL.test(col) || RE_TRIMESTRAL.test(col) || RE_ANUAL.test(col);

export const columnasPeriodo = (fila: FilaCuadro | undefined): string[] =>
  fila ? Object.keys(fila).filter(esPeriodo).sort() : [];

/** Union ordenada de periodos de varias filas (series de cuadros distintos). */
export const unionPeriodos = (filas: FilaCuadro[]): string[] =>
  [...new Set(filas.flatMap((f) => columnasPeriodo(f)))].sort();

export const tipoPeriodo = (cols: string[]): TipoPeriodo =>
  cols.some((c) => RE_MENSUAL.test(c))
    ? "mensual"
    : cols.some((c) => RE_TRIMESTRAL.test(c))
      ? "trimestral"
      : "anual";

/** `2007-01` -> `Ene 2007`; `2007-T1` -> `T1 2007`. */
export const etiquetaPeriodo = (col: string): string => {
  if (RE_MENSUAL.test(col)) {
    const [anio, mes] = col.split("-");
    return `${MESES[parseInt(mes, 10) - 1]} ${anio}`;
  }
  if (RE_TRIMESTRAL.test(col)) {
    const [anio, trimestre] = col.split("-");
    return `${trimestre} ${anio}`;
  }
  return col;
};

/** Rango por defecto del original: ~5 años segun la frecuencia. */
export const rangoPorDefecto = (cols: string[]): [string, string] => {
  const n = cols.length;
  if (n === 0) return ["", ""];
  const desde = n >= 60 ? n - 60 : n >= 20 ? n - 20 : n >= 5 ? n - 5 : 0;
  return [cols[desde], cols[n - 1]];
};

export const numero = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "" || v === "-") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isNaN(n) ? null : n;
};

/** Formato de celda del original: es-EC con 1 decimal; `-` si no hay dato. */
export const fmtValor = (v: unknown): string => {
  if (v === null || v === undefined || v === "" || v === "-") return "-";
  const n = numero(v);
  if (n === null) return String(v);
  return n.toLocaleString("es-EC", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

/** Nivel jerarquico: ultimo `NivelN` con contenido (o `_nivel` precalculado). */
export const nivelFila = (fila: FilaCuadro): number => {
  if (typeof fila._nivel === "number") return fila._nivel;
  let nivel = 0;
  for (let i = 1; i <= 7; i++) {
    const v = fila[`Nivel${i}`];
    if (v !== null && v !== undefined && String(v).trim() !== "") nivel = i;
  }
  return nivel;
};

/** Normaliza texto de notas (`\r\n`) a parrafos. */
export const parrafos = (texto: string): string[] =>
  texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
