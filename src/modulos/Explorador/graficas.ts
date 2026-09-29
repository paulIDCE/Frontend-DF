import { TEXTO_GRAFICA, color, inicioZoom, tipografia, zoomTemporal } from "@idce/kit";
import type { SerieColeccion } from "./tipos";
import { etiquetaPeriodo, numero, tipoPeriodo, unionPeriodos } from "./datos";

/**
 * Opcion ECharts de "Mi Colección" y del grafico individual (porte de
 * `renderMainChart` / `renderSingleChart`). Colores, fuente y barra de
 * herramientas los pone `TarjetaGrafica`; aqui solo los datos y los ejes.
 */

const fmt1 = (v: number) =>
  v.toLocaleString("es-EC", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface Opciones {
  etiquetas: boolean;
  /** Puntos visibles al abrir (el original arranca mostrando los ultimos 5). */
  visibles?: number;
}

export const opcionSeries = (series: SerieColeccion[], { etiquetas, visibles = 5 }: Opciones) => {
  if (series.length === 0) return null;

  const periodos = unionPeriodos(series.map((s) => s.fila));
  const mensual = tipoPeriodo(periodos) === "mensual";
  const hayDerecha = series.some((s) => s.derecha);
  const hayBarras = series.some((s) => s.tipo === "bar");

  const eje = (posicion: "left" | "right") => ({
    type: "value",
    position: posicion,
    scale: true,
    axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => v.toFixed(1) },
    splitLine:
      posicion === "left"
        ? { lineStyle: { color: color.linea.sutil, type: "dashed" } }
        : { show: false },
    axisLine: { show: posicion === "right" },
  });

  return {
    tooltip: {
      trigger: "axis",
      confine: true,
      axisPointer: { type: "cross" },
      valueFormatter: (v: number | null) => (v === null || v === undefined ? "-" : fmt1(v)),
    },
    legend: { type: "scroll", bottom: 30, textStyle: TEXTO_GRAFICA },
    grid: { left: 12, right: hayDerecha ? 24 : 16, top: 24, bottom: 70, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: hayBarras,
      data: periodos.map(etiquetaPeriodo),
      axisLabel: {
        ...TEXTO_GRAFICA,
        rotate: mensual ? 45 : 0,
        fontSize: mensual ? tipografia.escala.rotulo.tamano - 2 : tipografia.escala.rotulo.tamano,
      },
      axisTick: { show: false },
    },
    yAxis: hayDerecha ? [eje("left"), eje("right")] : [eje("left")],
    dataZoom: zoomTemporal(inicioZoom(periodos.length, visibles)),
    series: series.map((s) => ({
      name: s.variable,
      type: s.tipo,
      yAxisIndex: s.derecha && hayDerecha ? 1 : 0,
      data: periodos.map((p) => numero(s.fila[p])),
      smooth: s.tipo === "line",
      symbol: s.tipo === "line" ? "circle" : "none",
      symbolSize: 6,
      connectNulls: true,
      emphasis: { focus: "series" },
      areaStyle: s.tipo === "line" && series.length === 1 ? { opacity: 0.12 } : undefined,
      label: {
        show: etiquetas,
        position: "top",
        ...TEXTO_GRAFICA,
        formatter: (p: { value: number | null }) => (p.value === null ? "" : fmt1(p.value)),
      },
    })),
  };
};
