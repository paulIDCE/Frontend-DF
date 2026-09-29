/**
 * Formatos heredados, con default export.
 *
 * Solo trae lo que usa `shared/`.
 * Para formatos nuevos en vistas analiticas usar `shared/analitica/formato.ts`.
 */

const moneda = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (valor: number): string => moneda.format(valor);

/** Base de los `fechaCorteID` del data warehouse: dias transcurridos desde esta fecha. */
const FECHA_BASE_ID = { anio: 1950, mes: 0, dia: 1 };

/** `fechaCorteID` → "yyyy-MM-dd". */
const transformToDate = (id: number): string => {
  const fecha = new Date(FECHA_BASE_ID.anio, FECHA_BASE_ID.mes, FECHA_BASE_ID.dia);
  fecha.setDate(fecha.getDate() + id);
  return fecha.toISOString().substring(0, 10);
};

/** Fecha → `fechaCorteID`. Se calcula en UTC para que el horario de verano no reste un dia. */
const transformToId = (fecha: Date | string): number => {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  const diff =
    Date.UTC(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate()) -
    Date.UTC(FECHA_BASE_ID.anio, FECHA_BASE_ID.mes, FECHA_BASE_ID.dia);
  return Math.round(diff / 86400000);
};

const formatter = {
  formatMoney,
  transformToDate,
  transformToId,
};

export default formatter;
