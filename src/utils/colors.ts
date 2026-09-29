/**
 * Utilidades de color: solo las que usa `shared/`.
 */

/** `#1f3f7a` → `FF1F3F7A`, el ARGB que espera `exceljs`. */
export const hexToArgb = (hex: string): string => {
  const limpio = hex.startsWith("#") ? hex.substring(1) : hex;
  return `FF${limpio.toUpperCase()}`;
};

/**
 * El color es oscuro (luminosidad YIQ < 128): sobre el va texto blanco. Sirve para colores que
 * vienen de datos, como los de los niveles de riesgo.
 */
export const isDark = (hexColor: string): boolean => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};
