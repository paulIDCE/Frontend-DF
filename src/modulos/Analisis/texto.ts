/**
 * Titulos legibles en tipo oracion (IDENTIDAD_VISUAL §4: la jerarquia va por peso y color, no por
 * mayusculas). La configuracion migrada de prueba-data trae dos estilos que `legible` unifica:
 * - todo en MAYUSCULAS ("ÍNDICE DE MOROSIDAD PRODUCITVO") -> minusculas;
 * - Cada Palabra Con Mayuscula ("Evolución Histórica - Cartera de Crédito") -> minusculas, salvo las
 *   palabras que siguen enteras en mayusculas (siglas, nombres de entidad: "BP. AMAZONAS").
 * En los dos casos se respetan las siglas conocidas y empieza con mayuscula cada tramo del titulo
 * (al inicio y despues de " - " o " · ": "Índice de turbulencia - Cartera productiva").
 */

const SIGLAS = new Map(
  [
    "ROA", "ROE", "CAMELS", "PERLAS", "PyG", "MOA", "MOP", "USD", "SD", "COVID-19", "VIS", "TAM", "IVF", "PCC",
    "CP", "SB", "SEPS", "RFD", "PT", "EFI04", "EFI06", "CUC", "COAC", "IF", "N°", "Z", "PYMES", "FD",
  ].map((s) => [s.toUpperCase(), s]),
);

/** Nombres propios que mantienen la mayuscula inicial. */
const PROPIOS = new Set(["Ecuador", "Pichincha", "Guayaquil", "Quito"]);

const RE_PALABRA = /[\p{L}\p{N}°-]+/gu;
/** Inicio de cada tramo: comienzo del texto o despues de " - " / " · ". */
const RE_TRAMO = /(^|\s[-·]\s)(\P{L}*)(\p{L})/gu;

/** Fecha corta de la revista ("jul-26"): no se capitaliza al empezar un tramo. */
const RE_FECHA_CORTA = /^[a-z]{3}-\d{2}/;

const mayusculaPorTramo = (t: string) =>
  t.replace(RE_TRAMO, (todo, sep: string, previo: string, letra: string, i: number) =>
    RE_FECHA_CORTA.test(t.slice(i + sep.length + previo.length)) ? todo : `${sep}${previo}${letra.toUpperCase()}`,
  );

export const legible = (texto: string): string => {
  if (!texto) return texto;
  const limpio = texto.replace(/\s+/g, " ").trim();

  // Todo en mayusculas.
  if (!/\p{Ll}/u.test(limpio)) {
    const minusculas = limpio.toLowerCase();
    const conSiglas = minusculas.replace(RE_PALABRA, (p, i: number) => {
      const sigla = SIGLAS.get(p.toUpperCase());
      if (sigla) return sigla;
      // "(c)" -> "(C)": componente de CAMELS / PERLAS.
      if (p.length === 1 && minusculas[i - 1] === "(" && minusculas[i + 1] === ")") return p.toUpperCase();
      return p;
    });
    return mayusculaPorTramo(conSiglas);
  }

  // Cada Palabra Con Mayuscula: se pasan a minusculas las que tienen solo la inicial en mayuscula.
  const oracion = limpio.replace(RE_PALABRA, (p) => {
    const sigla = SIGLAS.get(p.toUpperCase());
    if (sigla && p.toUpperCase() === p) return sigla;
    if (PROPIOS.has(p)) return p;
    return /^\p{Lu}[\p{Ll}\p{N}°-]*$/u.test(p) ? p.toLowerCase() : p;
  });
  return mayusculaPorTramo(oracion);
};
