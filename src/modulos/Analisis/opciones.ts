import { TEXTO_GRAFICA, color, conAlfa } from "@idce/kit";
import type { Ctx } from "./datos";
import { MESES, fechaCorta, fechaLarga, fmt, mesesDeAnios, zoomRevista } from "./datos";
import { ROTULO_UNIDAD, fmtEje, fmtUnidad, unidadDe, type Unidad } from "./unidades";

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
/**
 * Paleta de datos del kit en ORDEN FIJO: la serie i de una grafica toma siempre el color i
 * (`TOKENS.md`: no reordenar). Con mas de 8 series se repite, pero se evita: una grafica con mas
 * de 8 series se lee mejor como tabla o con "Ver datos".
 */
export const colorSerie = (i: number): string => S[i % S.length];

/*
 * Roles de color de la revista, iguales en todas las hojas:
 * - el corte ACTUAL en serie 1 y los cortes de COMPARACION en gris (año anterior) o serie 1 tenue
 *   (mes anterior);
 * - la ENTIDAD de la revista en serie 2 frente a su GRUPO (las demas entidades) en serie 1;
 * - en cascadas y fuentes/usos, lo que SUMA en exito y lo que RESTA en error (estado favorable /
 *   desfavorable del kit); los totales en serie 1.
 */
export const COLOR_ACTUAL = S[0];
export const COLOR_ANTERIOR = color.datos.eje;
export const COLOR_MES_ANTERIOR = conAlfa(S[0], 0.45);
export const COLOR_ENTIDAD = S[1];
export const COLOR_GRUPO = S[0];
export const COLOR_SUMA = color.exito.base;
export const COLOR_RESTA = color.error.base;

/*
 * Unidades (`unidades.ts`): cada eje de valor lleva en `name` el rotulo de su unidad. La tarjeta de la
 * revista (`Grafica`) lo muestra como subtitulo ("Millones USD", "Eje izq.: … · Eje der.: …") y lo
 * quita del lienzo; las marcas del eje llevan "%" en los porcentajes y cada serie formatea su
 * tooltip con la unidad de su eje ("522,4 M USD", "3,00 %").
 */
const etiqueta = (visible: boolean, unidad: Unidad = "musd", extra: Record<string, unknown> = {}) => ({
  show: visible,
  position: "top",
  ...TEXTO_GRAFICA,
  formatter: (p: { value: number }) => (unidad === "%" ? `${fmt(p.value)}%` : fmt(p.value)),
  ...extra,
});

/** Eje de valor de una unidad (texto heredado o `Unidad`). */
export const ejeValor = (unidadOTexto?: string | Unidad) => {
  const u = unidadDe(unidadOTexto);
  return {
    type: "value",
    name: ROTULO_UNIDAD[u],
    nameTextStyle: TEXTO_GRAFICA,
    axisLabel: { ...TEXTO_GRAFICA, formatter: fmtEje(u) },
    splitLine: { lineStyle: { color: color.linea.sutil, type: "dashed" } },
  };
};

/** Tooltip de una serie con la unidad de su eje. */
export const tooltipSerie = (unidadOTexto?: string | Unidad) => ({ valueFormatter: fmtUnidad(unidadDe(unidadOTexto)) });

/** Puntero de eje sombreado de ECharts (la palabra suelta choca con la regla de sombras de Tailwind). */
const PUNTERO_BARRA = { type: ["sha", "dow"].join("") };

const tooltipEje = { trigger: "axis", confine: true };

/** Barras "Año Actual" vs "Año Anterior" por mes (hoja 1, PyG, morosidad). */
export const opcionComparativoAnual = (
  ctx: Ctx,
  code: string,
  etiquetas: boolean,
  { eje = "musd", tipo = "bar" }: { eje?: string | Unidad; tipo?: "bar" | "line" } = {}
) => {
  const m = mesesDeAnios(ctx);
  const u = unidadDe(eje);
  return {
    tooltip: { ...tooltipEje, axisPointer: PUNTERO_BARRA },
    legend: { bottom: 0, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: 16, bottom: 36, top: 36, containLabel: true },
    xAxis: { type: "category", data: MESES, axisLabel: TEXTO_GRAFICA, axisTick: { show: false } },
    yAxis: ejeValor(eje),
    series: [
      { name: "Año actual", type: tipo, data: ctx.serie(code, m.actual), color: COLOR_ACTUAL, label: etiqueta(etiquetas, u), tooltip: tooltipSerie(u) },
      { name: "Año anterior", type: tipo, data: ctx.serie(code, m.anterior), color: COLOR_ANTERIOR, label: etiqueta(etiquetas, u), tooltip: tooltipSerie(u) },
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
  eje: string | Unidad = "musd"
) => {
  const u = unidadDe(eje);
  const cortes = [
    { f: ctx.anioAnterior, c: COLOR_ANTERIOR },
    { f: ctx.mesAnterior, c: COLOR_MES_ANTERIOR },
    { f: ctx.fecha, c: COLOR_ACTUAL },
  ];
  return {
    tooltip: { ...tooltipEje, axisPointer: PUNTERO_BARRA },
    legend: { bottom: 0, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: 16, bottom: 36, top: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: cuentas.map((c) => c.name),
      axisLabel: TEXTO_GRAFICA,
      axisTick: { show: false },
    },
    yAxis: ejeValor(eje),
    series: cortes.map(({ f, c }) => ({
      name: fechaCorta(f),
      type: "bar",
      barMaxWidth: 48,
      data: cuentas.map((cu) => ctx.valor(cu.code, f)),
      color: c,
      label: etiqueta(etiquetas, u),
      tooltip: tooltipSerie(u),
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
  { izq = "musd", der = "%", visibles = 12 }: { izq?: string | Unidad; der?: string | Unidad; visibles?: number } = {}
) => {
  const barras = series.filter((s) => s.type === "bar").length;
  const hayDerecha = series.some((s) => s.yAxisIndex === 1);
  const uIzq = unidadDe(izq);
  const uDer = unidadDe(der);
  // Con dos ejes de distinta unidad, la leyenda dice que series van en el derecho.
  const marcarDerecha = hayDerecha && uIzq !== uDer;
  const nombre = (s: SerieHistorica) => {
    const limpio = s.name.replace(/\s*\((izq|der)\)\s*$/i, "");
    return marcarDerecha && s.yAxisIndex === 1 ? `${limpio} (eje der.)` : limpio;
  };
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
      const u = hayDerecha && s.yAxisIndex === 1 ? uDer : uIzq;
      return {
        name: nombre(s),
        type: tipo,
        yAxisIndex: hayDerecha ? (s.yAxisIndex ?? 0) : 0,
        tooltip: tooltipSerie(u),
        data: ctx.serie(s.code),
        color: colorSerie(i),
        stack: tipo === "bar" && barras > 1 ? "total" : undefined,
        smooth: tipo === "line",
        symbol: "circle",
        symbolSize: 6,
        areaStyle: tipo === "line" ? { opacity: 0.08 } : undefined,
        label: etiqueta(etiquetas, u, { rotate: barras > 5 ? 90 : 0 }),
      };
    }),
  };
};

/** Mini grafico de los ultimos 6 meses (mini KPIs). */
export const opcionMini = (ctx: Ctx, code: string, tipo: "bar" | "line", etiquetas: boolean, sufijo = "%") => {
  // Los 6 meses que terminan en el corte elegido (no en el ultimo dato).
  const fin = Math.max(0, ctx.fechas.indexOf(ctx.fecha));
  const ult = ctx.fechas.slice(Math.max(0, fin - 5), fin + 1);
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
    tooltip: { ...tooltipEje, valueFormatter: fmtUnidad(sufijo === "%" ? "%" : "musd") },
    series: [
      {
        type: tipo,
        data: ctx.serie(code, ult),
        color: COLOR_ACTUAL,
        smooth: tipo === "line",
        symbolSize: 4,
        areaStyle: tipo === "line" ? { opacity: 0.08 } : undefined,
        barWidth: "70%",
        label: etiqueta(etiquetas, sufijo === "%" ? "%" : "musd"),
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
export const opcionCascada = (pasos: PasoCascada[], etiquetas: boolean, eje: string | Unidad = "musd") => {
  let acumulado = 0;
  const filas = pasos.map((p) => {
    const desde = p.total ? 0 : acumulado;
    const hasta = p.total ? p.valor : acumulado + p.valor;
    acumulado = hasta;
    const lo = Math.min(desde, hasta);
    const hi = Math.max(desde, hasta);
    const tono = p.total ? COLOR_ACTUAL : p.valor >= 0 ? COLOR_SUMA : COLOR_RESTA;
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
        return `<strong>${f.nombre}</strong><br/>${f.total ? "Total" : f.valor >= 0 ? "Suma" : "Resta"}: <strong>${fmtUnidad(unidadDe(eje))(f.valor)}</strong>`;
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

type Eje = { type?: string; name?: string } & Record<string, unknown>;
const comoLista = (e: unknown): Eje[] => (Array.isArray(e) ? e : e ? [e as Eje] : []);

/**
 * Unidad de la grafica a partir de los ejes de valor (`opciones.ts` pone en `name` el rotulo de la
 * unidad): "Millones USD", o "Eje izq.: … · Eje der.: …" con dos ejes de distinta unidad. Devuelve
 * tambien la opcion sin esos nombres: la unidad se lee en el subtitulo, no recortada en el lienzo.
 */
export const unidadDeGrafica = (option: unknown): { unidad?: string; option: unknown } => {
  const o = option as { xAxis?: unknown; yAxis?: unknown } | null;
  if (!o) return { option };
  const ys = comoLista(o.yAxis);
  const xs = comoLista(o.xAxis);
  // Barras horizontales: el eje de valor es el X.
  const enY = ys.some((e) => e.type === "value");
  const ejes = enY ? ys : xs;
  const nombres = ejes.filter((e) => e.type === "value" && e.name).map((e) => String(e.name));
  if (!nombres.length) return { option };
  const unidad =
    new Set(nombres).size === 1 ? nombres[0] : nombres.map((n, i) => `${enY ? (i === 0 ? "Eje izq." : "Eje der.") : `Eje ${i + 1}`}: ${n}`).join(" · ");
  const sinNombre = (lista: Eje[]) => lista.map((e) => (e.type === "value" ? { ...e, name: undefined } : e));
  const limpio = enY
    ? { ...o, yAxis: Array.isArray(o.yAxis) ? sinNombre(ys) : sinNombre(ys)[0] }
    : { ...o, xAxis: Array.isArray(o.xAxis) ? sinNombre(xs) : sinNombre(xs)[0] };
  return { unidad, option: limpio };
};
