/**
 * Colores que vienen de datos (escala de una matriz). Aceptan hex y rgb/rgba.
 * El formato legado `r;g;b` no entra al kit. Vive en design/ para poder construir
 * rgb()/rgba() (el verificador de tokens lo permite solo aquí).
 */

const parseRgb = (
  value: string | null | undefined,
): [number, number, number] | null => {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  const rgb = raw.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  if (raw.startsWith("#")) {
    const hex = raw.slice(1);
    const full = hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex;
    if (full.length < 6) return null;
    return [
      Number.parseInt(full.slice(0, 2), 16),
      Number.parseInt(full.slice(2, 4), 16),
      Number.parseInt(full.slice(4, 6), 16),
    ];
  }
  return null;
};

export const rgbToCss = (value: string | null | undefined): string | undefined => {
  const rgb = parseRgb(value);
  if (!rgb) return undefined;
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};

export const withAlphaCss = (
  value: string | null | undefined,
  alpha: number,
): string | undefined => {
  const rgb = parseRgb(value);
  if (!rgb) return undefined;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
};

export const isDarkCss = (value: string | null | undefined): boolean => {
  const rgb = parseRgb(value);
  if (!rgb) return false;
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] < 150;
};
