import { apiCuadro } from "@/services/apiDatos";
import type { CuadroApi, FilasPorFuente, FuenteDatosCuadro } from "@/types/api";
import type { FuenteFila } from "@/services/fuenteDatos";
import { MESES } from "../datos";
import type { DatoFuente } from "../FuentesHoja";
import { legible } from "../texto";

/**
 * Datos de las hojas de Entorno macroeconomico: cuadros del BCE (`GET /api/cuadros/{id}`, tipo
 * `macro`) leidos como series. Las tasas y contribuciones que publica el BCE (TOU07/08/11,
 * VAB07/11, IEM431) se usan tal cual; lo que calcula la app (variaciones a 12 meses, sumas) se
 * marca `calculado` para la insignia de fuente.
 */

export type Cuadros = Record<string, CuadroApi>;

/** Cuadros trimestrales (periodos `YYYY-Tn`) y anuales (`YYYY-12`) entre los macro; el resto es mensual. */
const TRIMESTRALES = /^(TOU|VAB|VAA|VAP)\d|^IEM(321|322|425A|426|451A|452)$|^IEM\d+T$/;
const ANUALES = /^IEA|^IEM43\d$/;

/**
 * Desde cuando se piden los datos: las hojas muestran a lo sumo desde 2018 (mensuales) o 2016
 * (trimestrales), y los cuadros traen desde 2000. Recortar en la API baja el peso a un tercio. Los
 * anuales son pequeños y las series largas (inflacion, crudo) los usan completos. El mismo corte
 * por cuadro en todas las hojas: asi la cache de `apiDatos` sirve a las que lo comparten.
 */
export const desdeDe = (id: string): string | undefined =>
  ANUALES.test(id) ? undefined : TRIMESTRALES.test(id) ? "2016-T1" : "2018-01";

export const cargarCuadros = async (ids: string[]): Promise<Cuadros> =>
  Object.fromEntries(await Promise.all(ids.map(async (id) => [id, await apiCuadro(id, { desde: desdeDe(id) })] as const)));

export interface Serie {
  nombre: string;
  periodos: string[];
  valores: (number | null)[];
  fuente: FuenteFila | null;
  /** Cuadro de origen (o los cuadros, en una serie calculada). */
  cuadro: string;
}

const normal = (s: string | null | undefined) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/**
 * Fila de un cuadro por su texto. Las variables se repiten (p. ej. "Exportaciones" bajo bienes y
 * bajo servicios): `tras` son las filas que hay que pasar antes, en orden. Todas las comparaciones
 * son "empieza por", sin tildes ni mayusculas.
 */
export interface Selector {
  variable: string;
  grupo?: string;
  tras?: string[];
}

const coincide = (f: CuadroApi["filas"][number], texto: string, grupo?: string) =>
  normal(f.variable).startsWith(normal(texto)) && (!grupo || normal(f.grupo).startsWith(normal(grupo)));

const buscarFila = (c: CuadroApi, sel: Selector) => {
  let desde = 0;
  for (const paso of sel.tras ?? []) {
    const i = c.filas.findIndex((f, k) => k >= desde && coincide(f, paso, sel.grupo));
    if (i < 0) return undefined;
    desde = i + 1;
  }
  return c.filas.find((f, k) => k >= desde && coincide(f, sel.variable, sel.grupo));
};

const vacia = (c: CuadroApi, nombre: string): Serie => ({
  nombre,
  periodos: c.periodos,
  valores: c.periodos.map(() => null),
  fuente: null,
  cuadro: c.id,
});

/** Serie de una fila. Si el cuadro no la trae, una serie vacia (la grafica queda en blanco, no falla). */
export const serie = (c: CuadroApi | undefined, sel: Selector | string, nombre?: string): Serie => {
  const s = typeof sel === "string" ? { variable: sel } : sel;
  const etiqueta = nombre ?? s.variable;
  if (!c) return { nombre: etiqueta, periodos: [], valores: [], fuente: null, cuadro: "" };
  const f = buscarFila(c, s);
  if (!f) return vacia(c, etiqueta);
  return {
    nombre: etiqueta,
    periodos: c.periodos,
    valores: f.valores.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null)),
    fuente: f.fuenteDatos,
    cuadro: c.id,
  };
};

/** Todas las filas de un grupo (nivel `nivel`, si se pide), como series. */
export const seriesDeGrupo = (c: CuadroApi | undefined, grupo: string, nivel?: number): Serie[] =>
  (c?.filas ?? [])
    .filter((f) => normal(f.grupo).startsWith(normal(grupo)) && (nivel === undefined || f.nivel === nivel))
    .map((f) => ({
      nombre: f.variable ?? "",
      periodos: c!.periodos,
      valores: f.valores.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null)),
      fuente: f.fuenteDatos,
      cuadro: c!.id,
    }));

/* ------------------------------ Periodos ------------------------------ */

const ROMANOS = ["I", "II", "III", "IV"];

/** `2026-T1` -> `2026.I`; `2025-12` de un cuadro anual -> `2025`; `2026-05` -> `May 2026`. */
export const etiquetaPeriodo = (p: string, anual = false): string => {
  const t = /^(\d{4})-T(\d)$/.exec(p);
  if (t) return `${t[1]}.${ROMANOS[Number(t[2]) - 1]}`;
  const m = /^(\d{4})-(\d{2})$/.exec(p);
  if (!m) return p;
  return anual ? m[1] : `${MESES[Number(m[2]) - 1]} ${m[1]}`;
};

/** "segundo trimestre de 2026", "mayo de 2026", "2025". */
export const periodoEnTexto = (p: string, anual = false): string => {
  const t = /^(\d{4})-T(\d)$/.exec(p);
  if (t) return `${["primer", "segundo", "tercer", "cuarto"][Number(t[2]) - 1]} trimestre de ${t[1]}`;
  const m = /^(\d{4})-(\d{2})$/.exec(p);
  if (!m) return p;
  if (anual) return m[1];
  const mes = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${mes[Number(m[2]) - 1]} de ${m[1]}`;
};

/** Periodo `n` pasos antes en la misma frecuencia (meses o trimestres). */
export const periodoAnterior = (p: string, n: number): string => {
  const t = /^(\d{4})-T(\d)$/.exec(p);
  if (t) {
    const k = Number(t[1]) * 4 + Number(t[2]) - 1 - n;
    return `${Math.floor(k / 4)}-T${(k % 4) + 1}`;
  }
  const [y, m] = p.split("-").map(Number);
  const k = y * 12 + m - 1 - n;
  return `${Math.floor(k / 12)}-${String((k % 12) + 1).padStart(2, "0")}`;
};

/** Ultimo periodo con dato (no nulo ni cero: hay cuadros que rellenan con 0) en TODAS las series. */
export const ultimoComun = (...series: Serie[]): string | undefined => {
  const base = series[0];
  if (!base) return undefined;
  for (let i = base.periodos.length - 1; i >= 0; i--) {
    const p = base.periodos[i];
    if (series.every((s) => {
      const v = valorEn(s, p);
      return v !== null && v !== 0;
    }))
      return p;
  }
  return undefined;
};

export const valorEn = (s: Serie, p: string | undefined): number | null => {
  if (!p) return null;
  const i = s.periodos.indexOf(p);
  return i < 0 ? null : s.valores[i];
};

/** Los `n` periodos que terminan en `fin` (incluido). */
export const ventana = (periodos: string[], fin: string | undefined, n: number): string[] => {
  const i = fin ? periodos.indexOf(fin) : periodos.length - 1;
  const hasta = i < 0 ? periodos.length - 1 : i;
  return periodos.slice(Math.max(0, hasta - n + 1), hasta + 1);
};

/** Valores de la serie en los periodos dados. */
export const en = (s: Serie, periodos: string[]) => periodos.map((p) => valorEn(s, p));

/* ------------------------------ Calculos ------------------------------ */

export const variacionPct = (actual: number | null, anterior: number | null): number | null =>
  actual === null || anterior === null || anterior === 0 ? null : ((actual - anterior) / Math.abs(anterior)) * 100;

/** Variacion porcentual contra `desfase` periodos antes (12 meses, 4 trimestres). Serie calculada. */
export const serieVariacion = (s: Serie, desfase: number, nombre = `${s.nombre} (variación)`): Serie => ({
  nombre,
  periodos: s.periodos,
  valores: s.periodos.map((p) => variacionPct(valorEn(s, p), valorEn(s, periodoAnterior(p, desfase)))),
  fuente: "calculado",
  cuadro: s.cuadro,
});

/** Suma periodo a periodo (nulos como 0 si al menos una serie tiene dato). Serie calculada. */
export const sumaSeries = (nombre: string, ...series: Serie[]): Serie => {
  const base = series[0];
  return {
    nombre,
    periodos: base.periodos,
    valores: base.periodos.map((p) => {
      const vs = series.map((s) => valorEn(s, p));
      return vs.every((v) => v === null) ? null : vs.reduce<number>((a, v) => a + (v ?? 0), 0);
    }),
    fuente: "calculado",
    cuadro: [...new Set(series.map((s) => s.cuadro))].join(", "),
  };
};

/** Suma de los meses de `anio` hasta el mes `mes` (acumulado enero–mes). */
export const acumuladoAnio = (s: Serie, anio: number, mes: number): number | null => {
  const vs = Array.from({ length: mes }, (_, i) => valorEn(s, `${anio}-${String(i + 1).padStart(2, "0")}`));
  return vs.some((v) => v === null) ? null : vs.reduce<number>((a, v) => a + (v ?? 0), 0);
};

/** Promedio de los meses de `anio` hasta `mes`. */
export const promedioAnio = (s: Serie, anio: number, mes: number): number | null => {
  const total = acumuladoAnio(s, anio, mes);
  return total === null ? null : total / mes;
};

/* ------------------------------ Fuente ------------------------------ */

/** Fuente de las series de una grafica, para `Grafica fuentes`. */
export const fuentesDe = (...series: Serie[]): DatoFuente[] => series.map((s) => ({ fuente: s.fuente, nombre: s.nombre }));

/** Fuente y conteo de varios cuadros juntos (cabecera de la hoja). */
export const fuenteDeCuadros = (cuadros: CuadroApi[]): { fuente: FuenteDatosCuadro | null; conteo: FilasPorFuente } => {
  const fuentes = new Set(cuadros.map((c) => c.fuenteDatos).filter(Boolean));
  const fuente = fuentes.size === 0 ? null : fuentes.size === 1 ? [...fuentes][0]! : "mixto";
  const conteo = cuadros.reduce<FilasPorFuente>(
    (a, c) => ({
      bd: a.bd + (c.filasPorFuente?.bd ?? 0),
      json: a.json + (c.filasPorFuente?.json ?? 0),
      sinFuente: a.sinFuente + (c.filasPorFuente?.sinFuente ?? 0),
    }),
    { bd: 0, json: 0, sinFuente: 0 }
  );
  return { fuente, conteo };
};

/** Un dato por cuadro (los mixtos, uno por fuente), para el detalle de la insignia de la revista. */
export const datosDeCuadros = (cuadros: CuadroApi[]): DatoFuente[] =>
  cuadros.flatMap((c) => {
    const nombre = `${legible(c.titulo)} (${c.id})`;
    if (c.fuenteDatos === "mixto") return [{ fuente: "bd" as const, nombre }, { fuente: "json" as const, nombre }];
    return [{ fuente: c.fuenteDatos, nombre }];
  });
