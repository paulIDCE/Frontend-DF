import { color, conAlfa, radio, tipografia } from "@/design/tokens";
import { rgbToCss, withAlphaCss } from "@/design/coloresDato";

export interface CeldaMatrizCalor {
  /** Índice 1-based del eje X. */
  x: number;
  /** Índice 1-based del eje Y. */
  y: number;
  valor: number;
  color?: string | null;
}

export interface ResalteMatrizCalor {
  x: number;
  y: number;
  etiqueta?: string;
}

export interface OpcionesMatrizCalor {
  celdas: CeldaMatrizCalor[];
  ejesX: string[];
  ejesY: string[];
  nombreEjeX?: string;
  nombreEjeY?: string;
  resalte?: ResalteMatrizCalor;
  etiquetaTooltip?: string;
}

type HeatPoint = {
  value: [number, number, number];
  x: number;
  y: number;
  count: number;
  overlayLabel?: string;
  itemStyle: {
    color: string;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    shadowBlur: number;
    shadowColor: string;
  };
  label?: { color?: string };
};

const DIMMED_ALPHA = 0.38;
const ejeIndex = (n: number) => Math.round(Number(n));

const mismaCelda = (
  c: CeldaMatrizCalor,
  resalte?: ResalteMatrizCalor,
) =>
  resalte != null
  && Number.isFinite(resalte.x)
  && Number.isFinite(resalte.y)
  && ejeIndex(c.x) === ejeIndex(resalte.x)
  && ejeIndex(c.y) === ejeIndex(resalte.y);

const toPoint = (
  c: CeldaMatrizCalor,
  selected: boolean,
  overlayLabel?: string,
  dimOthers = false,
): HeatPoint => {
  const baseColor = rgbToCss(c.color) ?? color.datos.sinDatos;
  const dimmed = dimOthers && !selected;
  return {
    value: [ejeIndex(c.x) - 1, ejeIndex(c.y) - 1, 1],
    x: c.x,
    y: c.y,
    count: c.valor,
    overlayLabel: selected ? overlayLabel : undefined,
    itemStyle: {
      color: dimmed ? (withAlphaCss(baseColor, DIMMED_ALPHA) ?? baseColor) : baseColor,
      borderRadius: radio.control,
      borderWidth: selected ? 3 : 2,
      borderColor: selected ? color.tinta.base : color.superficie.base,
      shadowBlur: selected ? 10 : 0,
      shadowColor: selected ? conAlfa(color.tinta.base, 0.45) : "transparent",
    },
    label: {
      color: dimmed ? color.tinta.deshabilitada : color.tinta.base,
    },
  };
};

const labelFormatter = (param: { data: HeatPoint }) => {
  const count = param.data.count === 0 ? "" : String(param.data.count);
  const tag = param.data.overlayLabel?.trim();
  if (tag && count) return `{tag|${tag}}\n{num|${count}}`;
  if (tag) return `{tag|${tag}}`;
  return count;
};

/**
 * Opción ECharts de una matriz F×I (u otros ejes ordinales).
 * Pintar con `TarjetaGrafica` — el título va en la cabecera, no aquí.
 */
export const opcionesMatrizCalor = ({
  celdas,
  ejesX,
  ejesY,
  nombreEjeX,
  nombreEjeY,
  resalte,
  etiquetaTooltip = "Celda",
}: OpcionesMatrizCalor) => {
  const selected = (c: CeldaMatrizCalor) => mismaCelda(c, resalte);
  const dimOthers = celdas.some(selected);
  const base = celdas
    .filter((c) => !selected(c))
    .map((c) => toPoint(c, false, undefined, dimOthers));
  const marked = celdas
    .filter(selected)
    .map((c) => toPoint(c, true, resalte?.etiqueta, dimOthers));
  const rotulo = tipografia.escala.rotulo.tamano;

  return {
    tooltip: {
      formatter: (p: { data?: HeatPoint }) => {
        const d = p.data;
        if (!d?.value) return "";
        const [xi, yi] = d.value;
        const tag = d.overlayLabel ? `<br/>${d.overlayLabel}` : "";
        return `${etiquetaTooltip}<br/>${nombreEjeX ?? "X"}: ${ejesX[xi] ?? xi + 1}`
          + `<br/>${nombreEjeY ?? "Y"}: ${ejesY[yi] ?? yi + 1}`
          + `<br/>${d.count}${tag}`;
      },
    },
    grid: { top: 8, bottom: 28, left: 36, right: 10, containLabel: false },
    xAxis: {
      type: "category",
      data: ejesX,
      name: nombreEjeX,
      nameLocation: "center",
      nameGap: 12,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { show: false },
    },
    yAxis: {
      type: "category",
      data: ejesY,
      name: nombreEjeY,
      nameLocation: "center",
      nameGap: 10,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { show: false },
    },
    visualMap: {
      show: false,
      min: 1,
      max: 1,
      inRange: { color: [color.datos.sinDatos, color.datos.sinDatos] },
    },
    series: [
      {
        id: "base",
        type: "heatmap",
        data: [...base, ...marked],
        z: 1,
        label: {
          show: true,
          formatter: labelFormatter,
          fontSize: rotulo,
          fontWeight: tipografia.peso.semibold,
          lineHeight: tipografia.escala.rotulo.interlineado,
          rich: {
            tag: {
              fontSize: rotulo,
              fontWeight: tipografia.peso.bold,
              lineHeight: tipografia.escala.rotulo.interlineado,
              padding: [0, 0, 6, 0],
            },
            num: {
              fontSize: rotulo,
              fontWeight: tipografia.peso.semibold,
              lineHeight: tipografia.escala.rotulo.interlineado,
            },
          },
        },
        emphasis: {
          focus: "self",
          itemStyle: {
            shadowBlur: 10,
            shadowColor: conAlfa(color.tinta.base, 0.5),
          },
        },
      },
    ],
  };
};
