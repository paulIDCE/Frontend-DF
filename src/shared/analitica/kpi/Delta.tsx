import { COLOR_KPI } from "./colores";
import { tipografia } from "@/design/tokens";

/**
 * Variacion con flecha para la linea secundaria o el pie de un `KpiCard`.
 * - `valor` ya en la unidad que se muestra (pp o %): convierte antes las fracciones del backend.
 * - `subirEsMalo` pinta en rojo las subidas (mora, riesgo) y en verde las bajadas.
 * - `etiqueta` dice contra que se compara ("vs. corte anterior", "mes", "año"). Sin base de
 *   comparacion una variacion no se puede leer.
 */
const Delta = ({
  valor,
  sufijo,
  etiqueta,
  subirEsMalo = false,
  decimales = 2,
  className,
}: {
  valor: number | null | undefined;
  sufijo: string;
  etiqueta: string;
  subirEsMalo?: boolean;
  decimales?: number;
  className?: string;
}) => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return null;
  const sube = valor > 0;
  const malo = subirEsMalo ? sube : !sube;
  const tono = valor === 0 ? COLOR_KPI.neutro : malo ? COLOR_KPI.malo : COLOR_KPI.bueno;
  return (
    <span className={className} style={{ color: tono }}>
      {valor === 0 ? "" : sube ? "▲ " : "▼ "}
      {Math.abs(valor).toFixed(decimales)}
      {sufijo} <span style={{ color: COLOR_KPI.neutro, fontSize: tipografia.escala.detalle.tamano, fontWeight: tipografia.peso.normal }}>{etiqueta}</span>
    </span>
  );
};

export default Delta;
