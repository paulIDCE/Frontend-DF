/**
 * Datos de la revista de Análisis — porte de las utilidades de prueba-data
 * `analisis.js` (`subtractMonths`, `getPreviousMonthDate`, `formatHeaderDate`,
 * `formatNumber`, busquedas por `CUC`).
 *
 * Cada entidad tiene su `reportes/<archivo>.json` (cuadro REP01): una fila por
 * cuenta (`CUC`) y una columna por mes (`YYYY-MM`).
 */

export type FilaReporte = Record<string, unknown> & {
  CUC?: string;
  Variable?: string;
  Tamaño?: string;
  Rango_Activos?: string;
  DPA_PR?: string;
};

export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const RE_MES = /^\d{4}-\d{2}$/;

export const restarMeses = (fecha: string, meses: number): string => {
  let [y, m] = fecha.split("-").map(Number);
  m -= 1 + meses;
  while (m < 0) {
    m += 12;
    y--;
  }
  return `${y}-${String(m + 1).padStart(2, "0")}`;
};

/** `2026-06` -> `jun-26` */
export const fechaCorta = (fecha: string): string => {
  if (!fecha) return "---";
  const [y, m] = fecha.split("-");
  return `${MESES_CORTOS[parseInt(m, 10) - 1]}-${y.slice(-2)}`;
};

/** `2026-06` -> `Jun 2026` */
export const fechaLarga = (fecha: string): string => {
  const [y, m] = fecha.split("-");
  return `${MESES[parseInt(m, 10) - 1]} ${y}`;
};

/** `formatNumber` del original: es-EC, 1 decimal. */
export const fmt = (n: number | null | undefined): string =>
  n === null || n === undefined || Number.isNaN(n)
    ? "0,0"
    : n.toLocaleString("es-EC", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const pct = (n: number, decimales = 2): string => `${n.toFixed(decimales)}%`;

export const variacion = (actual: number, anterior: number): number =>
  anterior !== 0 ? ((actual - anterior) / Math.abs(anterior)) * 100 : 0;

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
};

export interface Dato {
  code: string;
  actual: number;
  mesAnterior: number;
  anioAnterior: number;
  varMensual: number;
  varAnual: number;
}

/**
 * Contexto de calculo de una revista: datos de la entidad + fecha de corte.
 * Todas las paginas leen de aqui (reemplaza a `currentMagazineData`,
 * `currentYear`, `currentMonth` globales).
 */
export interface Ctx {
  filas: FilaReporte[];
  /** Fecha de corte `YYYY-MM`. */
  fecha: string;
  mesAnterior: string;
  anioAnterior: string;
  /** Todas las fechas disponibles, ordenadas. */
  fechas: string[];
  fila: (code: string) => FilaReporte | undefined;
  valor: (code: string, fecha?: string) => number;
  serie: (code: string, fechas?: string[]) => number[];
  dato: (code: string) => Dato | null;
}

export const fechasDe = (filas: FilaReporte[]): string[] =>
  filas.length ? Object.keys(filas[0]).filter((k) => RE_MES.test(k)).sort() : [];

export const crearCtx = (filas: FilaReporte[], fecha: string): Ctx => {
  const indice = new Map<string, FilaReporte>();
  // Busqueda insensible a mayusculas por CUC o Variable (como `updateKPIGenerico`).
  filas.forEach((f) => {
    for (const k of [f.CUC, f.Variable]) {
      if (k === undefined || k === null) continue;
      const clave = String(k).toUpperCase();
      if (!indice.has(clave)) indice.set(clave, f);
    }
  });
  const fila = (code: string) => indice.get(code.toUpperCase());
  const valor = (code: string, f = fecha) => num(fila(code)?.[f]);
  const fechas = fechasDe(filas);
  const mesAnterior = restarMeses(fecha, 1);
  const anioAnterior = restarMeses(fecha, 12);

  return {
    filas,
    fecha,
    mesAnterior,
    anioAnterior,
    fechas,
    fila,
    valor,
    serie: (code, fs = fechas) => {
      const f = fila(code);
      return fs.map((d) => num(f?.[d]));
    },
    dato: (code) => {
      if (!fila(code)) return null;
      const actual = valor(code);
      const mesAnt = valor(code, mesAnterior);
      const anioAnt = valor(code, anioAnterior);
      return {
        code,
        actual,
        mesAnterior: mesAnt,
        anioAnterior: anioAnt,
        varMensual: variacion(actual, mesAnt),
        varAnual: variacion(actual, anioAnt),
      };
    },
  };
};

/** Meses del año de corte y del anterior (graficos "Año Actual" vs "Año Anterior"). */
export const mesesDeAnios = (ctx: Ctx) => {
  const anio = parseInt(ctx.fecha.slice(0, 4), 10);
  return {
    actual: ctx.fechas.filter((d) => d.startsWith(`${anio}-`)),
    anterior: ctx.fechas.filter((d) => d.startsWith(`${anio - 1}-`)),
  };
};
