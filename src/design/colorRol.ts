import type { CSSProperties } from "react";
import { color } from "./tokens";
import { isDark } from "../utils/colors";

/**
 * Color por ROL o color PROPIO: el mecanismo único de los ajustes de color del kit.
 *
 * Los componentes que aceptan un color (`KpiCard`, `SectionHeader`, `SeccionesColapsables`,
 * `ChipAtributo`, `ChipNivel`, `StatusTag`) reciben un `ColorKit`:
 * - un **rol** (`"accion"`, `"riesgo"`, `"exito"`…): sale del token y cambia con él. Es lo normal;
 * - un **color propio** (`"#7c3aed"`, `"rgb(…)"`): solo cuando lo dicta el dato (el color de un nivel
 *   de riesgo o de un catálogo que viene del backend). Se hace legible solo.
 *
 * Ver docs/IDENTIDAD_VISUAL.md §"Ajustes permitidos".
 */

/** Roles de color que entiende cualquier componente del kit. */
export const COLOR_ROL = {
  accion: color.accion.base,
  identidad: color.identidad.base,
  exito: color.exito.base,
  advertencia: color.advertencia.base,
  error: color.error.base,
  tinta: color.tinta.base,
  /** Sin dato y textos de apoyo (tinta tenue, AA). */
  neutro: color.tinta.tenue,
  /* Roles de KPI: lo que SIGNIFICA la cifra. */
  /** Montos y valores neutros: serie 1 de la paleta de datos. */
  monto: color.datos.series[0],
  /** Riesgo o alerta. */
  riesgo: color.advertencia.base,
  /** Contra una meta: se cumple. */
  bueno: color.exito.base,
  /** Contra una meta: no se cumple. */
  malo: color.error.base,
} as const;

export type RolColor = keyof typeof COLOR_ROL;

/** Un rol del kit o cualquier color CSS. `string & {}` conserva el autocompletado de los roles. */
export type ColorKit = RolColor | (string & {});

export const esRolColor = (valor: string): valor is RolColor => valor in COLOR_ROL;

/** Rol → valor del token; color propio → tal cual. */
export const resolverColor = (valor: ColorKit): string => (esRolColor(valor) ? COLOR_ROL[valor] : valor);

const esHex6 = (valor: string) => /^#[0-9a-f]{6}$/i.test(valor);

/**
 * Los colores de datos (p. ej. el amarillo #ffe600 de un nivel de riesgo) no se leen como texto
 * sobre blanco: se oscurecen. Lo que ya es oscuro no cambia, así que aplicarlo dos veces es inocuo.
 * Solo sabe oscurecer hex de 6 dígitos; otro formato se devuelve igual.
 */
export const colorLegible = (valor: string | undefined): string => {
  if (!valor) return COLOR_ROL.neutro;
  if (!esHex6(valor) || isDark(valor)) return valor;
  const n = parseInt(valor.slice(1), 16);
  const oscurecer = (c: number) => Math.round(c * 0.72);
  const r = oscurecer((n >> 16) & 255);
  const g = oscurecer((n >> 8) & 255);
  const b = oscurecer(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

/**
 * Color para texto, bordes e iconos: los roles ya son legibles (AA); un color propio se oscurece
 * si hace falta.
 */
export const colorTexto = (valor: ColorKit): string =>
  esRolColor(valor) ? COLOR_ROL[valor] : colorLegible(valor);

/**
 * Estilo de un chip (antd `Tag`) con el mismo aspecto que los presets de antd 6: fondo muy claro,
 * sin borde y texto legible. `color-mix` acepta cualquier color CSS, no solo hex.
 */
export const estiloChip = (valor: ColorKit): CSSProperties => ({
  color: colorTexto(valor),
  background: `color-mix(in srgb, ${resolverColor(valor)} 10%, ${color.superficie.base})`,
  borderColor: "transparent",
});
