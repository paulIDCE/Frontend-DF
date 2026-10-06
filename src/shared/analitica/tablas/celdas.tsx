import { ReactNode } from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { NivelRiesgo } from "@/types/nivelRiesgo";
import { isDark } from "@/utils/colors";
import { nivelDe } from "../niveles";
import { fmtMoneda, fmtPct } from "../formato";
import { color } from "@/design/tokens";

/** Cabecera con ayuda en tooltip: el texto largo va al tooltip, no a la columna. */
export const TituloAyuda = ({ titulo, ayuda }: { titulo: ReactNode; ayuda?: string }) =>
  ayuda ? (
    <Tooltip title={ayuda}>
      <span className="whitespace-nowrap">
        {titulo} <InfoCircleOutlined className="text-tinta-tenue text-rotulo" />
      </span>
    </Tooltip>
  ) : (
    <span className="whitespace-nowrap">{titulo}</span>
  );

export const CeldaMoneda = ({ valor }: { valor: number | null | undefined }) => (
  <span className="font-mono text-detalle whitespace-nowrap">{fmtMoneda(valor)}</span>
);

/**
 * Variacion en fraccion relativa (0.052 = +5.2 %) con flecha, para la segunda linea de celdas de monto.
 * `subirEsMalo` (gastos, mora, provisiones) pinta en rojo las subidas, como `Delta`.
 */
const Variacion = ({ valor, etiqueta, subirEsMalo = false }: { valor: number | null | undefined; etiqueta: string; subirEsMalo?: boolean }) => {
  if (valor === null || valor === undefined) return null;
  const pct = valor * 100;
  const favorable = subirEsMalo ? pct < 0 : pct > 0;
  const color = pct === 0 ? "text-tinta-tenue" : favorable ? "text-exito" : "text-error";
  return (
    <Tooltip title={etiqueta === "M" ? "Variación mensual" : "Variación anual"}>
      <span className={`whitespace-nowrap ${color}`}>
        {etiqueta} {pct > 0 ? "▲" : pct < 0 ? "▼" : ""}
        {Math.abs(pct).toFixed(1)}%
      </span>
    </Tooltip>
  );
};

export const CeldaSaldoVariacion = ({
  valor,
  mensual,
  anual,
  subirEsMalo = false,
}: {
  valor: number | null | undefined;
  mensual: number | null | undefined;
  anual: number | null | undefined;
  /** En rojo las subidas (gastos, mora, provisiones). Por defecto, subir es bueno. */
  subirEsMalo?: boolean;
}) => (
  <div className="leading-tight text-right">
    <div className="font-mono text-detalle whitespace-nowrap">{fmtMoneda(valor)}</div>
    <div className="text-rotulo flex gap-2 justify-end">
      <Variacion valor={mensual} etiqueta="M" subirEsMalo={subirEsMalo} />
      <Variacion valor={anual} etiqueta="A" subirEsMalo={subirEsMalo} />
    </div>
  </div>
);

/** Variacion en puntos (pp) con flecha, para la segunda linea de celdas de indicadores (%, indices). */
const VariacionPuntos = ({
  valor,
  etiqueta,
  subirEsMalo,
  formato,
  sufijo,
}: {
  valor: number | null | undefined;
  etiqueta: "M" | "A";
  subirEsMalo: boolean;
  formato: (v: number) => string;
  sufijo: string;
}) => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return null;
  const favorable = subirEsMalo ? valor < 0 : valor > 0;
  const color = valor === 0 ? "text-tinta-tenue" : favorable ? "text-exito" : "text-error";
  return (
    <Tooltip title={etiqueta === "M" ? "Variación mensual (puntos)" : "Variación anual (puntos)"}>
      <span className={`whitespace-nowrap ${color}`}>
        {etiqueta} {valor > 0 ? "▲" : valor < 0 ? "▼" : ""}
        {formato(Math.abs(valor))}
        {sufijo}
      </span>
    </Tooltip>
  );
};

/**
 * Como `CeldaSaldoVariacion`, para indicadores que ya son porcentajes o indices (CAMELS, PERLAS,
 * morosidad…): el valor y debajo sus variaciones mensual (M) y anual (A) en PUNTOS, no relativas.
 * `formato` da el valor (por defecto `fmtPct`) y `formatoVariacion` los puntos.
 */
export const CeldaIndicadorVariacion = ({
  valor,
  mensual,
  anual,
  subirEsMalo = false,
  formato = (v: number) => fmtPct(v),
  formatoVariacion = (v: number) => v.toFixed(2),
  sufijoVariacion = " pp",
}: {
  valor: number | null | undefined;
  /** Diferencia en puntos contra el mes anterior. */
  mensual: number | null | undefined;
  /** Diferencia en puntos contra el mismo mes del año anterior. */
  anual: number | null | undefined;
  subirEsMalo?: boolean;
  formato?: (v: number) => string;
  formatoVariacion?: (v: number) => string;
  /** Unidad de la variacion: " pp" (por defecto) o "%" si la vista pasa variaciones relativas. */
  sufijoVariacion?: string;
}) => (
  <div className="leading-tight text-right">
    <div className="font-mono text-detalle whitespace-nowrap">{valor === null || valor === undefined ? "—" : formato(valor)}</div>
    <div className="text-rotulo flex gap-2 justify-end">
      <VariacionPuntos valor={mensual} etiqueta="M" subirEsMalo={subirEsMalo} formato={formatoVariacion} sufijo={sufijoVariacion} />
      <VariacionPuntos valor={anual} etiqueta="A" subirEsMalo={subirEsMalo} formato={formatoVariacion} sufijo={sufijoVariacion} />
    </div>
  </div>
);

/**
 * Valor en porcentaje pintado con el color de su nivel de riesgo. Con `niveles` vacio se muestra
 * el valor plano (p. ej. la columna de un indicador que no es el activo).
 */
export const CeldaNivel = ({ valor, niveles }: { valor: number | null | undefined; niveles: NivelRiesgo[] }) => {
  const nivel = nivelDe(valor, niveles);
  if (!nivel) return <span className="text-detalle">{fmtPct(valor)}</span>;
  return (
    <Tooltip title={nivel.nombre}>
      <span
        className="inline-block rounded-control px-1.5 py-0.5 text-rotulo font-semibold whitespace-nowrap min-w-[56px] text-center"
        style={{ backgroundColor: nivel.color, color: isDark(nivel.color) ? color.tinta.inversa : color.tinta.base }}
      >
        {fmtPct(valor)}
      </span>
    </Tooltip>
  );
};

/** Clase para resaltar la columna activa (la que manda en graficas o selectores globales). */
export const CLASE_COLUMNA_ACTIVA = "!bg-accion-sutil";
