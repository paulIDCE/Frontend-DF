/**
 * Titulos legibles. La configuracion migrada de prueba-data trae los titulos en MAYUSCULAS
 * ("ÍNDICE DE MOROSIDAD PRODUCITVO"); el kit los escribe en tipo oracion, con la jerarquia por peso
 * y color (IDENTIDAD_VISUAL §4). `legible` convierte solo los textos que vienen enteros en
 * mayusculas y respeta las siglas.
 */

const SIGLAS = new Map(
  [
    "ROA", "ROE", "CAMELS", "PERLAS", "PyG", "MOA", "MOP", "USD", "SD", "COVID-19", "VIS", "TAM", "IVF", "PCC",
    "CP", "SB", "SEPS", "RFD", "PT", "EFI04", "EFI06", "CUC", "COAC", "IF", "N°", "Z",
  ].map((s) => [s.toUpperCase(), s]),
);

/** Una letra entre parentesis es el componente de CAMELS / PERLAS: "(C)", "(A)". */
const RE_PALABRA = /[\p{L}\p{N}°-]+/gu;

export const legible = (texto: string): string => {
  if (!texto || /\p{Ll}/u.test(texto)) return texto; // ya tiene minusculas: se respeta
  const minusculas = texto.toLowerCase().replace(/\s+/g, " ").trim();
  const conSiglas = minusculas.replace(RE_PALABRA, (p, i: number) => {
    const sigla = SIGLAS.get(p.toUpperCase());
    if (sigla) return sigla;
    // "(c)" -> "(C)"
    if (p.length === 1 && minusculas[i - 1] === "(" && minusculas[i + 1] === ")") return p.toUpperCase();
    return p;
  });
  return conSiglas.charAt(0).toUpperCase() + conSiglas.slice(1);
};
