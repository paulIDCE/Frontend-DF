import { format } from "date-fns";
import { es } from "date-fns/locale";
import formatter from "@/utils/formatter";

/** Formatos de las vistas analiticas. Todas las funciones toleran null/undefined y devuelven "—". */

const moneda = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const fmtMoneda = (valor: number | null | undefined): string =>
  valor === null || valor === undefined || Number.isNaN(valor) ? "—" : moneda.format(valor);

/** Monto compacto para ejes y KPIs: $12.35M, $845.2K. */
export const fmtMonedaCorta = (valor: number | null | undefined): string => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) return `$${(valor / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(valor / 1_000).toFixed(1)}K`;
  return `$${valor.toFixed(0)}`;
};

/** Valor ya expresado en porcentaje (5.23 → "5.23%"). */
export const fmtPct = (valor: number | null | undefined, decimales = 2): string =>
  valor === null || valor === undefined || Number.isNaN(valor) ? "—" : `${valor.toFixed(decimales)}%`;

export const fmtEntero = (valor: number | null | undefined): string =>
  valor === null || valor === undefined ? "—" : valor.toLocaleString("en-US");

export const fmtFecha = (valor: Date | string | null | undefined, patron = "dd/MM/yyyy"): string =>
  valor ? format(new Date(valor), patron, { locale: es }) : "—";

export const fmtFechaStr = (valor: Date | string | null | undefined, patron = "MMM-yyyy"): string =>
  valor ? format(new Date(valor), patron, { locale: es }) : "—";

/**
 * Fecha a partir de un `fechaCorteID` (dias desde 1950-01-01). Se ancla a mediodia para que la
 * zona horaria no la corra al dia anterior.
 */
export const fmtFechaID = (fechaCorteID: number, patron = "dd/MM/yyyy"): string =>
  fechaCorteID ? fmtFecha(`${formatter.transformToDate(fechaCorteID)}T12:00:00`, patron) : "—";

/** yyyyMMdd a partir de un `fechaCorteID`: el formato que espera el detalle por operacion. */
export const fechaDetalleID = (fechaCorteID: number): string =>
  formatter.transformToDate(fechaCorteID).replace(/-/g, "");

/** yyyyMMdd → yyyy/MM/dd, para los titulos del detalle. */
export const fmtFechaCompacta = (yyyymmdd: string): string =>
  yyyymmdd && yyyymmdd.length >= 8
    ? `${yyyymmdd.substring(0, 4)}/${yyyymmdd.substring(4, 6)}/${yyyymmdd.substring(6, 8)}`
    : yyyymmdd;
