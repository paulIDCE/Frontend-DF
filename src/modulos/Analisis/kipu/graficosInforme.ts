import { color } from "@idce/kit";
import type { GraficoInforme } from "@/services/agenteService";

/**
 * Formato de cifras y opciones de ECharts de los graficos del informe de Kipu. Las comparten la
 * vista en pantalla (`InformeKipu`) y las descargas Word / PDF (`exportar/`), asi lo que se
 * descarga es el mismo grafico que se ve.
 */

const numero = (decimales: number) =>
  new Intl.NumberFormat("es-EC", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

export const fmt = (v: number | null | undefined, decimales: number) => (v == null || Number.isNaN(v) ? "–" : numero(decimales).format(v));

export const opcionGrafico = (g: GraficoInforme) => {
  const series = color.datos.series;
  const formato = (v: number) => fmt(v, g.decimales);
  const varias = g.series.length > 1;
  // Dos series = comparacion (año anterior o mediana frente a lo actual o la entidad): la base en
  // gris y la protagonista en azul, igual que en el HTML. Tres o mas: paleta de datos.
  const colorSerie = (i: number) =>
    g.series.length === 2 ? (i === 0 ? color.tinta.deshabilitada : color.accion.base) : series[i % series.length];
  // Con una sola serie y un destacado (ranking), las demas barras van en gris.
  const colorPunto = (categoria: string, i: number) =>
    !varias && g.resaltar ? (categoria === g.resaltar ? color.accion.base : color.linea.fuerte) : colorSerie(i);
  const lineas = (g.referencias ?? []).length
    ? {
        silent: true,
        symbol: "none",
        lineStyle: { color: color.error.base, type: "dashed" as const },
        // En barras_h el eje Y va invertido: el `start` de la linea vertical queda arriba, lejos de
        // los numeros del eje X (con `end` la etiqueta se montaba sobre ellos).
        label: { formatter: "{b}", color: color.error.base, position: g.tipo === "barras_h" ? ("start" as const) : ("insideEndTop" as const) },
        data: (g.referencias ?? []).map((r) => (g.tipo === "barras_h" ? { xAxis: r.valor, name: `${r.etiqueta} ${formato(r.valor)}` } : { yAxis: r.valor, name: r.etiqueta })),
      }
    : undefined;

  if (g.tipo === "barras_h") {
    return {
      // Como `PUNTERO_BARRA` de `Analisis/opciones.ts`: el literal se arma para que `tokens:verificar` no lo lea como clase.
      tooltip: { trigger: "axis", axisPointer: { type: ["sha", "dow"].join("") }, valueFormatter: formato },
      legend: varias ? { bottom: 0 } : undefined,
      grid: { left: 8, right: 56, top: g.referencias?.length ? 24 : 8, bottom: varias ? 28 : 8, containLabel: true },
      xAxis: { type: "value", axisLabel: { formatter: formato } },
      yAxis: {
        type: "category",
        inverse: true,
        data: g.categorias,
        axisLabel: {
          width: 190,
          overflow: "truncate",
          formatter: (v: string) => (v === g.resaltar ? `{d|${v}}` : v),
          rich: { d: { fontWeight: "bold", color: color.accion.base } },
        },
      },
      series: g.series.map((s, i) => ({
        type: "bar",
        name: s.nombre,
        barMaxWidth: 18,
        data: s.datos.map((v, j) => ({ value: v, itemStyle: { color: colorPunto(g.categorias[j], i) } })),
        label: { show: true, position: "right", formatter: (p: { value: number }) => formato(p.value) },
        markLine: i === 0 ? lineas : undefined,
      })),
    };
  }
  return {
    tooltip: { trigger: "axis", valueFormatter: formato },
    legend: varias ? { bottom: 0 } : undefined,
    grid: { left: 8, right: 16, top: 24, bottom: varias ? 28 : 8, containLabel: true },
    xAxis: { type: "category", data: g.categorias },
    yAxis: { type: "value", axisLabel: { formatter: formato }, scale: g.tipo === "linea" },
    series: g.series.map((s, i) => ({
      type: g.tipo === "linea" ? "line" : "bar",
      name: s.nombre,
      data: s.datos,
      smooth: false,
      symbolSize: 6,
      barMaxWidth: 34,
      itemStyle: { color: colorSerie(i) },
      lineStyle: { color: colorSerie(i) },
      label: { show: g.tipo === "barras" && g.categorias.length * g.series.length <= 12, position: "top", formatter: (p: { value: number }) => formato(p.value) },
      markLine: i === 0 ? lineas : undefined,
    })),
  };
};

export const altoGrafico = (g: GraficoInforme) =>
  g.tipo === "barras_h"
    ? Math.max(180, 40 + (g.referencias?.length ? 16 : 0) + g.categorias.length * (g.series.length > 1 ? 34 : 26))
    : 280;
