import type { NivelRiesgo } from "@/types/nivelRiesgo";
import { color } from "@/design/tokens";

/** Celdas y nodos sin dato. Gris neutro: con el color del primer nivel parecian de riesgo bajo. */
export const COLOR_SIN_DATOS = color.datos.sinDatos;

/** Nivel de riesgo de un valor **en porcentaje** (5.23, no 0.0523). */
export const nivelDe = (
  valorPct: number | null | undefined,
  niveles: NivelRiesgo[] | null | undefined,
): NivelRiesgo | null => {
  if (valorPct === null || valorPct === undefined || Number.isNaN(valorPct)) return null;
  return (niveles ?? []).find((n) => valorPct >= n.rangoInicio && valorPct <= n.rangoFin) ?? null;
};
