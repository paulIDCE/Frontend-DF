import { fechasDe, type FilaReporte } from "./datos";

/**
 * Indicadores derivados: se calculan en el frontend con cuentas que ya trae el reporte (plan de
 * integracion, fase 1 · `docs/analisis/06_PLAN_INTEGRACION_POR_FASES.md`). Se agregan como filas
 * mas del reporte, asi que `ctx.serie()` / `ctx.dato()`, las graficas y el comparativo (hoja 31)
 * los leen como cualquier otra cuenta.
 *
 * Los flujos de PyG usan la version anualizada (`@xA` = acumulado × 12 / mes) y los saldos de
 * balance, el promedio de los ultimos 12 meses disponibles. Codigos con prefijo `DER_`.
 */

type Valor = (code: string, i: number) => number;

interface Derivado {
  cuc: string;
  variable: string;
  /** Valor en el periodo `i`; `null` si no se puede calcular (denominador 0 o sin datos). */
  calcular: (v: Valor, i: number, promedio: (code: string, i: number) => number) => number | null;
}

const cociente = (a: number, b: number, factor = 100): number | null => (b ? (a / b) * factor : null);

export const DERIVADOS: Derivado[] = [
  {
    cuc: "DER_PAT_ACT",
    variable: "PATRIMONIO / ACTIVOS",
    calcular: (v, i) => cociente(v("@3", i), v("@1", i)),
  },
  {
    cuc: "DER_APALANC",
    variable: "APALANCAMIENTO (PASIVO / PATRIMONIO)",
    calcular: (v, i) => cociente(v("@2", i), v("@3", i), 1),
  },
  {
    cuc: "DER_GOP_CART",
    variable: "GASTOS DE OPERACIÓN / CARTERA BRUTA PROMEDIO",
    calcular: (v, i, prom) => cociente(v("@45A", i), prom("IF011", i)),
  },
  {
    cuc: "DER_COSTO_FONDEO",
    variable: "COSTO DE FONDEO (INTERESES CAUSADOS / PASIVOS CON COSTO PROMEDIO)",
    calcular: (v, i, prom) => cociente(v("@41A", i), prom("SB007", i)),
  },
  {
    cuc: "DER_SOST_OPER",
    variable: "SOSTENIBILIDAD OPERACIONAL",
    calcular: (v, i) => cociente(v("@5A", i), v("@41A", i) + v("@44A", i) + v("@45A", i)),
  },
];

const num = (x: unknown): number | null => {
  const n = typeof x === "number" ? x : parseFloat(String(x));
  return Number.isFinite(n) ? n : null;
};

/** Devuelve el reporte con las filas derivadas al final (no modifica `filas`). */
export const agregarDerivados = (filas: FilaReporte[]): FilaReporte[] => {
  const fechas = fechasDe(filas);
  if (!fechas.length) return filas;
  const porCuc = new Map(filas.map((f) => [String(f.CUC ?? "").toUpperCase(), f]));
  const crudo = (code: string, i: number) => num(porCuc.get(code.toUpperCase())?.[fechas[i]]);
  const v: Valor = (code, i) => crudo(code, i) ?? 0;
  const promedio = (code: string, i: number) => {
    const vals: number[] = [];
    for (let k = Math.max(0, i - 11); k <= i; k++) {
      const x = crudo(code, k);
      if (x !== null) vals.push(x);
    }
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const nuevas = DERIVADOS.map((d) => {
    const fila: FilaReporte = { CUC: d.cuc, Variable: d.variable };
    fechas.forEach((f, i) => {
      const x = d.calcular(v, i, promedio);
      fila[f] = x === null || !Number.isFinite(x) ? null : x;
    });
    return fila;
  });
  return [...filas, ...nuevas];
};
