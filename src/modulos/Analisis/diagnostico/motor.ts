import { fmt, type Ctx } from "../datos";
import catalogo from "./reglas.json";

/**
 * Motor de diagnostico por reglas (Managerial Analyzer §5.1; plan 06, item 1.12). Las reglas son
 * datos (`reglas.json`): indicador, medida, condicion, severidad y plantilla de texto. El motor
 * solo evalua y redacta; mas adelante el catalogo se sirve desde la API (plan 06, item 5.5).
 */

export type Severidad = "alta" | "media" | "baja" | "positiva";
export type Bloque = "estructura" | "cartera" | "liquidez" | "solvencia" | "rentabilidad" | "tasas";

/**
 * - `nivel`: valor al corte.
 * - `varMensual` / `varAnual`: variacion relativa (%) contra el mes / año anterior.
 * - `difMensual` / `difAnual`: diferencia en puntos (pp) contra el mes / año anterior; para
 *   indicadores que ya son porcentajes.
 */
export type Medida = "nivel" | "varMensual" | "varAnual" | "difMensual" | "difAnual";

export interface Regla {
  id: string;
  indicador: string;
  /** Sujeto de la frase: "La morosidad". */
  nombre: string;
  bloque: Bloque;
  medida: Medida;
  condicion: { op: "<" | "<=" | ">" | ">=" | "entre"; valor: number | number[] };
  severidad: Severidad;
  /** Marcadores: {nombre} {valor} {anterior} {var} {dif}. */
  plantilla: string;
}

export interface Hallazgo {
  regla: Regla;
  /** Valor de la medida evaluada. */
  medida: number;
  texto: string;
}

export const REGLAS = catalogo.reglas as Regla[];
export const UMBRALES_ESTRUCTURA = catalogo.estructura;

export const ORDEN_SEVERIDAD: Record<Severidad, number> = { alta: 0, media: 1, baja: 2, positiva: 3 };

const cumple = (x: number, { op, valor }: Regla["condicion"]): boolean => {
  if (op === "entre") {
    const [min, max] = valor as number[];
    return x >= min && x <= max;
  }
  const v = valor as number;
  return op === "<" ? x < v : op === "<=" ? x <= v : op === ">" ? x > v : x >= v;
};

const dec2 = (n: number) => n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signo = (n: number) => `${n > 0 ? "+" : ""}${dec2(n)} %`;

const redactar = (r: Regla, valores: Record<string, string>) =>
  r.plantilla.replace(/\{(\w+)\}/g, (todo, clave: string) => valores[clave] ?? todo);

/** Hallazgos de una entidad al corte del contexto, de mas a menos severo. */
export const diagnosticar = (ctx: Ctx, reglas: Regla[] = REGLAS): Hallazgo[] =>
  reglas
    .flatMap((r) => {
      const d = ctx.dato(r.indicador);
      if (!d) return [];
      // Sin dato en el periodo de comparacion la variacion no es significativa.
      const anterior = r.medida.endsWith("Mensual") ? d.mesAnterior : d.anioAnterior;
      if (r.medida !== "nivel" && !anterior) return [];
      const medida =
        r.medida === "nivel"
          ? d.actual
          : r.medida === "varMensual"
            ? d.varMensual
            : r.medida === "varAnual"
              ? d.varAnual
              : d.actual - anterior;
      if (!Number.isFinite(medida) || !cumple(medida, r.condicion)) return [];
      const texto = redactar(r, {
        nombre: r.nombre,
        valor: fmt(d.actual),
        anterior: fmt(anterior),
        var: signo(r.medida.startsWith("var") ? medida : d.varAnual),
        dif: dec2(Math.abs(r.medida.startsWith("dif") ? medida : d.actual - anterior)),
      });
      return [{ regla: r, medida, texto }];
    })
    .sort((a, b) => ORDEN_SEVERIDAD[a.regla.severidad] - ORDEN_SEVERIDAD[b.regla.severidad]);
