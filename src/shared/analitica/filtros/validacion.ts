import type { OpcionesFiltro, ResultadoValidacion } from "./tipos";

/**
 * Validaciones genericas del estandar de filtros. Funciones puras: cada vista compone las suyas
 * en un `validacionFiltros.ts` junto a la vista y las cubre con tests sin montarla.
 */

/** A partir de cuantos cortes el rango se considera amplio (la consulta tarda y las graficas se saturan). */
export const CORTES_RANGO_AMPLIO = 36;

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * Numero entero obligatorio dentro de un rango. Vacio es error: nunca se convierte a 0 en
 * silencio. `nombre` en minusculas y en plural con articulo ("los días de mora").
 */
export const validarEntero = (
  valor: number | null | undefined,
  { nombre, min, max }: { nombre: string; min: number; max: number },
): string | undefined => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return `Indique ${nombre}.`;
  if (!Number.isInteger(valor)) return `${capitalizar(nombre)} deben ser un número entero.`;
  if (valor < min || valor > max) return `${capitalizar(nombre)} deben estar entre ${min} y ${max}.`;
  return undefined;
};

/**
 * Rango de cortes: ambos elegidos y desde <= hasta. Avisa (sin bloquear) con un solo corte o con
 * un rango amplio.
 * @param idsDisponibles `fechaCorteID` de todos los cortes cargados, en cualquier orden.
 */
export const validarRangoCortes = (
  fechaInicioID: number | null | undefined,
  fechaCorteID: number | null | undefined,
  idsDisponibles: number[],
  { umbralAmplio = CORTES_RANGO_AMPLIO } = {},
): { error?: string; avisos: string[]; cortesEnRango: number } => {
  if (!fechaInicioID || !fechaCorteID) {
    return { error: "Seleccione la fecha desde y la fecha hasta.", avisos: [], cortesEnRango: 0 };
  }
  if (fechaInicioID > fechaCorteID) {
    return { error: "La fecha desde no puede ser posterior a la fecha hasta.", avisos: [], cortesEnRango: 0 };
  }
  const cortesEnRango = idsDisponibles.filter((id) => id >= fechaInicioID && id <= fechaCorteID).length;
  const avisos: string[] = [];
  if (cortesEnRango === 1) {
    avisos.push("Un solo corte: no habrá evolución ni variación contra el corte anterior.");
  } else if (cortesEnRango > umbralAmplio) {
    avisos.push(`Rango amplio (${cortesEnRango} cortes): la consulta puede tardar más de lo habitual.`);
  }
  return { avisos, cortesEnRango };
};

/** Error general cuando el catalogo de cortes llego vacio. */
export const validarCatalogoCortes = (idsDisponibles: number[]): string | undefined =>
  idsDisponibles.length === 0 ? "No hay fechas de corte disponibles para consultar." : undefined;

/** Arma el resultado descartando errores vacios. */
export const resultadoValidacion = <C extends string>(
  errores: Partial<Record<C | "general", string | undefined>>,
  avisos: string[] = [],
): ResultadoValidacion<C> => {
  const limpios = Object.fromEntries(
    Object.entries(errores).filter(([, valor]) => !!valor),
  ) as ResultadoValidacion<C>["errores"];
  return { errores: limpios, avisos, valido: Object.keys(limpios).length === 0 };
};

/** Primer error a mostrar, en el orden de los campos de la barra ("general" siempre primero). */
export const primerError = (errores: Partial<Record<string, string>>, orden: string[] = []): string | undefined =>
  errores.general ?? orden.map((campo) => errores[campo]).find(Boolean) ?? Object.values(errores).find(Boolean);

type FiltrosComparables = { opcionales?: object } & Record<string, unknown>;

/**
 * Mismos filtros por valor: campos simples con `===` y opcionales por ID, sin depender del orden
 * de las claves. Sirve para saber si hay cambios sin aplicar.
 */
export const mismosFiltros = (a: FiltrosComparables | null, b: FiltrosComparables | null): boolean => {
  if (!a || !b) return a === b;
  const campos = new Set([...Object.keys(a), ...Object.keys(b)].filter((k) => k !== "opcionales"));
  if (Array.from(campos).some((k) => a[k] !== b[k])) return false;
  const opA = (a.opcionales ?? {}) as OpcionesFiltro;
  const opB = (b.opcionales ?? {}) as OpcionesFiltro;
  const claves = new Set([...Object.keys(opA), ...Object.keys(opB)]);
  return Array.from(claves).every((k) => (opA[k]?.id ?? null) === (opB[k]?.id ?? null));
};
