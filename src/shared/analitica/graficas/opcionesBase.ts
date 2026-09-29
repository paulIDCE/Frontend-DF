import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { NivelRiesgo } from "@/types/nivelRiesgo";
import { color, conAlfa, tipografia } from "@/design/tokens";

/**
 * Piezas comunes de las opciones de ECharts de las vistas analiticas. Los puntos de las series
 * temporales van como `[fechaISO, valor, yyyyMMdd]`: el tercer elemento es la fecha que pide el
 * detalle por operacion al hacer clic.
 */

export type PuntoTemporal = [string, number | null, string];

/** Texto de ejes, etiquetas y sliders de ECharts: rótulo (11 px) en tinta tenue. */
export const TEXTO_GRAFICA = { fontSize: tipografia.escala.rotulo.tamano, color: color.tinta.tenue };

export const punto = (fecha: Date | string, valor: number | null | undefined): PuntoTemporal => [
  format(new Date(fecha), "yyyy-MM-dd"),
  valor === undefined || valor === null || Number.isNaN(valor) ? null : valor,
  format(new Date(fecha), "yyyyMMdd"),
];

export const ordenarPorFecha = <T extends { fechaCorte: Date | string }>(filas: T[]): T[] =>
  [...filas].sort((a, b) => new Date(a.fechaCorte).getTime() - new Date(b.fechaCorte).getTime());

/** Slider compacto: 18 px de alto para no robarle lienzo a graficas de ~340 px. */
export const zoomTemporal = (inicio = 0, { conSlider = true } = {}) => [
  ...(conSlider
    ? [
        {
          type: "slider",
          xAxisIndex: [0],
          start: inicio,
          end: 100,
          bottom: 6,
          height: 16,
          borderColor: color.linea.base,
          fillerColor: conAlfa(color.datos.series[0], 0.15),
          textStyle: TEXTO_GRAFICA,
        },
      ]
    : []),
  { type: "inside", xAxisIndex: [0], start: inicio, end: 100 },
];

/** Inicio del zoom para que se vean aprox. los ultimos `visibles` cortes. */
export const inicioZoom = (puntos: number, visibles = 24): number =>
  puntos > visibles ? Math.round((1 - visibles / puntos) * 100) : 0;

export const tooltipTemporal = (formatearValor: (item: any) => string) => ({
  trigger: "axis",
  confine: true,
  backgroundColor: color.superficie.base,
  borderColor: color.linea.base,
  textStyle: { color: color.tinta.base, fontSize: tipografia.escala.detalle.tamano },
  formatter: (params: any[]) => {
    if (!params?.length) return "";
    const fecha = format(new Date(`${params[0].data[0]}T12:00:00`), "MMM yyyy", { locale: es });
    const filas = params
      .filter((item) => item.data?.[1] !== null && item.data?.[1] !== undefined)
      .map((item) => `${item.marker}<span>${item.seriesName}</span>: <strong>${formatearValor(item)}</strong>`)
      .join("<br/>");
    return `<div style="font-weight:600;text-transform:capitalize;margin-bottom:4px">${fecha}</div>${filas}`;
  },
});

/** Franjas de color por nivel de riesgo detras de una serie (valores en porcentaje). */
export const franjasNiveles = (niveles: NivelRiesgo[], { conEtiquetas = true } = {}) => ({
  markArea: {
    silent: true,
    data: niveles.map((n) => [
      {
        name: n.nombre,
        yAxis: n.rangoInicio,
        itemStyle: { color: n.color, opacity: 0.12 },
        label: { show: conEtiquetas, position: "insideRight", ...TEXTO_GRAFICA, color: n.color, formatter: n.nombre },
      },
      { yAxis: n.rangoFin },
    ]),
  },
  markLine: {
    symbol: ["none", "none"],
    silent: true,
    data: niveles.map((n) => ({
      yAxis: n.rangoInicio,
      lineStyle: { color: n.color, type: "dashed", opacity: 0.6 },
      label: { show: false },
    })),
  },
});

/**
 * Tope visible de un eje con franjas de niveles: un poco por encima del mayor valor. Sin esto la
 * franja del ultimo nivel (que llega a 100 %) aplasta la serie contra el piso.
 */
export const maximoEjeConNiveles = (valores: (number | null)[], niveles: NivelRiesgo[]): number => {
  const maximoDato = Math.max(0, ...valores.filter((v): v is number => typeof v === "number"));
  const siguienteUmbral = niveles
    .map((n) => n.rangoInicio)
    .filter((inicio) => inicio > maximoDato)
    .sort((a, b) => a - b)[0];
  const tope = Math.max(maximoDato * 1.15, siguienteUmbral ?? 0);
  return Math.ceil(tope || 1);
};

export const COLOR_UMBRAL_OK = color.exito.base;
export const COLOR_UMBRAL_BRECHA = color.error.base;

/**
 * Estilo de una serie que se juzga contra un umbral (p. ej. cobertura >= 100 %): cada punto rojo
 * por debajo y verde desde el umbral, con la referencia marcada. No se usa `visualMap` por tramos:
 * con puntos nulos ECharts falla en `getVisualGradient` y tumba toda la grafica.
 */
export const estiloUmbral = ({ umbral = 100, referencia = true } = {}) => ({
  itemStyle: {
    color: (p: any) => ((p.data?.[1] ?? 0) >= umbral ? COLOR_UMBRAL_OK : COLOR_UMBRAL_BRECHA),
  },
  lineStyle: { color: color.datos.eje, width: 1.5, type: "dashed" },
  ...(referencia
    ? {
        markLine: {
          symbol: ["none", "none"],
          silent: true,
          data: [{ yAxis: umbral }],
          lineStyle: { color: COLOR_UMBRAL_OK, type: "dotted", opacity: 0.7 },
          label: { show: true, position: "insideEndTop", formatter: `${umbral}%`, ...TEXTO_GRAFICA, color: COLOR_UMBRAL_OK },
        },
      }
    : {}),
});
