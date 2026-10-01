import { TEXTO_GRAFICA, color, conAlfa } from "@idce/kit";
import type { Ctx } from "./datos";
import { MESES, fechaCorta, fechaLarga, fmt, mesesDeAnios, zoomRevista } from "./datos";

/**
 * Constructores de opciones ECharts de la revista — porte de
 * `createProfessionalChartOption`, `renderBarrasApiladasGenerico`,
 * `renderBarrasCuentasGenerico`, `renderHistoricoEstructuraGenerico`,
 * `renderMiniKPIWithChart` y los comparativos "Año Actual / Año Anterior".
 *
 * Colores: paleta de datos del kit (el original usaba hex sueltos). La barra de
 * herramientas (imagen, lineas/barras, zoom) la pone `TarjetaGrafica`.
 */

const S = color.datos.series;
/** Paleta por indice de serie (ciclica para mas de 8 series). */
export const colorSerie = (i: number): string => S[i % S.length];
export const COLOR_ACTUAL = S[0];
export const COLOR_ANTERIOR = color.datos.eje;
const COLOR_MES_ANT = conAlfa(S[0], 0.55);

const etiqueta = (visible: boolean, extra: Record<string, unknown> = {}) => ({
  show: visible,
  position: "top",
  ...TEXTO_GRAFICA,
  fontWeight: "bold",
  formatter: (p: { value: number }) => fmt(p.value),
  ...extra,
});

const ejeValor = (nombre?: string) => ({
  type: "value",
  name: nombre,
  nameTextStyle: TEXTO_GRAFICA,
  axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => fmt(v) },
  splitLine: { lineStyle: { color: color.linea.sutil, type: "dashed" } },
});

/** Puntero de eje sombreado de ECharts (la palabra suelta choca con la regla de sombras de Tailwind). */
const PUNTERO_BARRA = { type: ["sha", "dow"].join("") };

const tooltipEje = { trigger: "axis", confine: true, valueFormatter: (v: number) => fmt(v) };

/** Barras "Año Actual" vs "Año Anterior" por mes (hoja 1, PyG, morosidad). */
export const opcionComparativoAnual = (
  ctx: Ctx,
  code: string,
  etiquetas: boolean,
  { eje = "millones USD", tipo = "bar" }: { eje?: string; tipo?: "bar" | "line" } = {}
) => {
  const m = mesesDeAnios(ctx);
  return {
    tooltip: { ...tooltipEje, axisPointer: PUNTERO_BARRA },
    legend: { bottom: 0, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: 16, bottom: 36, top: 36, containLabel: true },
    xAxis: { type: "category", data: MESES, axisLabel: TEXTO_GRAFICA, axisTick: { show: false } },
    yAxis: ejeValor(eje),
    series: [
      { name: "Año Actual", type: tipo, data: ctx.serie(code, m.actual), color: COLOR_ACTUAL, label: etiqueta(etiquetas) },
      { name: "Año Anterior", type: tipo, data: ctx.serie(code, m.anterior), color: COLOR_ANTERIOR, label: etiqueta(etiquetas) },
    ],
  };
};

/**
 * Barras de tres cortes (año anterior, mes anterior, actual) por cuenta.
 * Con una sola cuenta es el "barras apiladas" del original.
 */
export const opcionTresCortes = (
  ctx: Ctx,
  cuentas: { code: string; name: string }[],
  etiquetas: boolean,
  eje = "millones USD"
) => {
  const cortes = [
    { f: ctx.anioAnterior, c: COLOR_ANTERIOR },
    { f: ctx.mesAnterior, c: COLOR_MES_ANT },
    { f: ctx.fecha, c: color.identidad.base },
  ];
  return {
    tooltip: { ...tooltipEje, axisPointer: PUNTERO_BARRA },
    legend: { bottom: 0, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: 16, bottom: 36, top: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: cuentas.map((c) => c.name),
      axisLabel: { ...TEXTO_GRAFICA, fontWeight: "bold" },
      axisTick: { show: false },
    },
    yAxis: ejeValor(eje),
    series: cortes.map(({ f, c }) => ({
      name: fechaCorta(f),
      type: "bar",
      barMaxWidth: 48,
      data: cuentas.map((cu) => ctx.valor(cu.code, f)),
      color: c,
      label: etiqueta(etiquetas),
    })),
  };
};

export interface SerieHistorica {
  code: string;
  name: string;
  type?: "line" | "bar";
  /** 1 = eje derecho. */
  yAxisIndex?: 0 | 1;
}

/** Historico con zoom a los ultimos 12 meses; barras apiladas si hay varias. */
export const opcionHistorico = (
  ctx: Ctx,
  series: SerieHistorica[],
  etiquetas: boolean,
  { izq = "millones USD", der = "%", visibles = 12 }: { izq?: string; der?: string; visibles?: number } = {}
) => {
  const barras = series.filter((s) => s.type === "bar").length;
  const hayDerecha = series.some((s) => s.yAxisIndex === 1);
  return {
    tooltip: { ...tooltipEje, axisPointer: barras ? PUNTERO_BARRA : { type: "cross" } },
    legend: { type: "scroll", bottom: 26, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: hayDerecha ? 16 : 16, bottom: 70, top: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: ctx.fechas.map(fechaLarga),
      boundaryGap: barras > 0,
      axisLabel: { ...TEXTO_GRAFICA, rotate: ctx.fechas.length > 15 ? 45 : 0 },
      axisTick: { show: false },
    },
    yAxis: hayDerecha ? [ejeValor(izq), { ...ejeValor(der), splitLine: { show: false } }] : ejeValor(izq),
    dataZoom: zoomRevista(ctx, visibles),
    series: series.map((s, i) => {
      const tipo = s.type ?? "line";
      return {
        name: s.name,
        type: tipo,
        yAxisIndex: hayDerecha ? (s.yAxisIndex ?? 0) : 0,
        data: ctx.serie(s.code),
        color: colorSerie(i),
        stack: tipo === "bar" && barras > 1 ? "total" : undefined,
        smooth: tipo === "line",
        symbol: "circle",
        symbolSize: 6,
        areaStyle: tipo === "line" ? { opacity: 0.08 } : undefined,
        label: etiqueta(etiquetas, { rotate: barras > 5 ? 90 : 0 }),
      };
    }),
  };
};

/** Mini grafico de los ultimos 6 meses (mini KPIs). */
export const opcionMini = (
  ctx: Ctx,
  code: string,
  tipo: "bar" | "line",
  indiceColor: number,
  etiquetas: boolean,
  sufijo = "%"
) => {
  const ult = ctx.fechas.slice(-6);
  return {
    grid: { top: 18, bottom: 18, left: 4, right: 4 },
    xAxis: {
      type: "category",
      data: ult.map((d) => MESES[parseInt(d.slice(5), 10) - 1]),
      axisLabel: TEXTO_GRAFICA,
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: { type: "value", axisLabel: { show: false }, splitLine: { show: false }, scale: true },
    tooltip: { ...tooltipEje, valueFormatter: (v: number) => `${fmt(v)}${sufijo}` },
    series: [
      {
        type: tipo,
        data: ctx.serie(code, ult),
        color: colorSerie(indiceColor),
        smooth: tipo === "line",
        symbolSize: 4,
        areaStyle: tipo === "line" ? { opacity: 0.2 } : undefined,
        barWidth: "70%",
        label: etiqueta(etiquetas, { formatter: (p: { value: number }) => `${p.value.toFixed(1)}${sufijo}` }),
      },
    ],
  };
};

/** Paso de una cascada: total / subtotal (barra desde 0) o variacion (desde el acumulado). */
export interface PasoCascada {
  nombre: string;
  valor: number;
  total?: boolean;
}

/**
 * Cascada (waterfall) con barras apiladas: una serie transparente de base y dos visibles (parte
 * positiva y negativa). El apilado de ECharts separa los signos, asi que un paso que cruza el 0
 * (resultado negativo) se dibuja bien sin series personalizadas.
 */
export const opcionCascada = (pasos: PasoCascada[], etiquetas: boolean, eje = "millones USD") => {
  let acumulado = 0;
  const filas = pasos.map((p) => {
    const desde = p.total ? 0 : acumulado;
    const hasta = p.total ? p.valor : acumulado + p.valor;
    acumulado = hasta;
    const lo = Math.min(desde, hasta);
    const hi = Math.max(desde, hasta);
    const tono = p.total ? S[0] : p.valor >= 0 ? color.exito.base : color.error.base;
    if (lo >= 0) return { ...p, base: lo, pos: hi - lo, neg: 0, tono };
    if (hi <= 0) return { ...p, base: hi, pos: 0, neg: lo - hi, tono };
    return { ...p, base: 0, pos: hi, neg: lo, tono };
  });
  const visible = (clave: "pos" | "neg") => ({
    name: clave,
    type: "bar",
    stack: "cascada",
    barMaxWidth: 48,
    data: filas.map((f) => ({ value: f[clave], itemStyle: { color: f.tono } })),
    label: {
      show: etiquetas,
      position: clave === "pos" ? "top" : "bottom",
      ...TEXTO_GRAFICA,
      fontWeight: "bold",
      // La etiqueta va en la parte que lleva el signo del paso (en una que cruza el 0, la positiva).
      formatter: (p: { dataIndex: number }) => {
        const f = filas[p.dataIndex];
        const enEsta = clave === "pos" ? f.pos !== 0 : f.pos === 0 && f.neg !== 0;
        return enEsta ? fmt(f.valor) : "";
      },
    },
  });
  return {
    tooltip: {
      trigger: "axis",
      confine: true,
      axisPointer: PUNTERO_BARRA,
      formatter: (ps: { dataIndex: number }[]) => {
        const f = filas[ps[0]?.dataIndex ?? 0];
        return `<strong>${f.nombre}</strong><br/>${f.total ? "Total" : f.valor >= 0 ? "Suma" : "Resta"}: <strong>${fmt(f.valor)}</strong>`;
      },
    },
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: filas.map((f) => f.nombre),
      axisTick: { show: false },
      axisLabel: { ...TEXTO_GRAFICA, interval: 0, rotate: 35 },
    },
    yAxis: ejeValor(eje),
    series: [
      { name: "base", type: "bar", stack: "cascada", silent: true, itemStyle: { color: "transparent" }, data: filas.map((f) => f.base) },
      visible("pos"),
      visible("neg"),
    ],
  };
};
