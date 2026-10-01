import { TEXTO_GRAFICA, color, inicioZoom, tipografia, zoomTemporal, type VentanaEje } from "@idce/kit";
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
  /** Filtro Periodo Desde–Hasta de la vista: la grafica abre (y restablece) en el. */
  rango?: [string, string];
}

/**
 * Ventana del filtro sobre los periodos de las series (en etiquetas del eje X). Las series pueden
 * venir de otro cuadro (favoritos): se toma el primer periodo >= Desde y el ultimo <= Hasta.
 */
export const ventanaSeries = (series: SerieColeccion[], rango?: [string, string]): VentanaEje | undefined => {
  if (!rango || !rango[0] || series.length === 0) return undefined;
  const periodos = unionPeriodos(series.map((s) => s.fila));
  const desde = periodos.find((p) => p >= rango[0]);
  const hasta = [...periodos].reverse().find((p) => p <= rango[1]);
  return desde && hasta && desde <= hasta ? { desde: etiquetaPeriodo(desde), hasta: etiquetaPeriodo(hasta) } : undefined;
};

export const opcionSeries = (series: SerieColeccion[], { etiquetas, rango }: Opciones) => {
  if (series.length === 0) return null;

  const periodos = unionPeriodos(series.map((s) => s.fila));
  const ventana = ventanaSeries(series, rango);
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
    // Sin filtro, como el original: los ultimos 5 puntos.
    dataZoom: zoomTemporal(ventana ?? inicioZoom(periodos.length, 5)),
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
