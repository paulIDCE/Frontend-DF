import { TEXTO_GRAFICA, zoomTemporal } from "@idce/kit";
import { fmt } from "../datos";
import { COLOR_ACTUAL, COLOR_ANTERIOR, colorSerie, ejeValor, tooltipSerie } from "../opciones";
import type { Unidad } from "../unidades";
import { en, etiquetaPeriodo, type Serie } from "./datosMacro";

/**
 * Opciones ECharts de las hojas macro, con las mismas piezas que el resto de la revista (paleta en
 * orden fijo, `ejeValor` con el rotulo de la unidad que `Grafica` sube al subtitulo, tooltip con la
 * unidad de su eje).
 */

export interface SerieOpcion {
  nombre: string;
  datos: (number | null)[];
  tipo?: "line" | "bar";
  /** 1 = eje derecho. */
  eje?: 0 | 1;
  /** Barras o areas apiladas con la misma clave. */
  apilar?: string;
  area?: boolean;
  color?: string;
  punteada?: boolean;
}

interface OpcionCategorias {
  categorias: string[];
  series: SerieOpcion[];
  izq?: Unidad;
  der?: Unidad;
  etiquetas: boolean;
  /** Con mas categorias, zoom a las ultimas `visibles`. */
  visibles?: number;
  /** Rotar las etiquetas del eje X. */
  rotar?: boolean;
}

/** Puntero de eje sombreado de ECharts (la palabra suelta choca con la regla de sombras de Tailwind). */
const SOMBREADO = ["sha", "dow"].join("");

const etiqueta = (visible: boolean, u: Unidad, posicion = "top") => ({
  show: visible,
  position: posicion,
  ...TEXTO_GRAFICA,
  formatter: (p: { value: number | null }) => (p.value === null || p.value === undefined ? "" : u === "%" ? `${fmt(p.value)}%` : fmt(p.value)),
});

/** Series por categoria (periodos u otras): lineas, barras (apiladas o no) y dos ejes. */
export const opcionCategorias = ({ categorias, series, izq = "musd", der = "%", etiquetas, visibles, rotar }: OpcionCategorias) => {
  const hayDerecha = series.some((s) => s.eje === 1);
  const barras = series.some((s) => (s.tipo ?? "line") === "bar");
  const zoom = visibles !== undefined && categorias.length > visibles;
  const nombre = (s: SerieOpcion) => (hayDerecha && izq !== der && s.eje === 1 ? `${s.nombre} (eje der.)` : s.nombre);
  return {
    tooltip: { trigger: "axis", confine: true, axisPointer: { type: barras ? SOMBREADO : "line" } },
    legend: { type: "scroll", bottom: zoom ? 26 : 0, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: 16, top: 28, bottom: zoom ? 64 : 36, containLabel: true },
    xAxis: {
      type: "category",
      data: categorias,
      boundaryGap: barras,
      axisLabel: { ...TEXTO_GRAFICA, rotate: rotar ? 45 : 0 },
      axisTick: { show: false },
    },
    yAxis: hayDerecha ? [ejeValor(izq), { ...ejeValor(der), splitLine: { show: false } }] : ejeValor(izq),
    dataZoom: zoom ? zoomTemporal({ desde: categorias[categorias.length - visibles!], hasta: categorias[categorias.length - 1] }) : undefined,
    series: series.map((s, i) => {
      const tipo = s.tipo ?? "line";
      const u = hayDerecha && s.eje === 1 ? der : izq;
      return {
        name: nombre(s),
        type: tipo,
        yAxisIndex: hayDerecha ? (s.eje ?? 0) : 0,
        data: s.datos,
        color: s.color ?? colorSerie(i),
        stack: s.apilar,
        smooth: tipo === "line",
        symbol: "circle",
        symbolSize: 5,
        connectNulls: false,
        barMaxWidth: 36,
        lineStyle: s.punteada ? { type: "dashed" } : undefined,
        areaStyle: s.area ? { opacity: s.apilar ? 0.85 : 0.12 } : undefined,
        tooltip: tooltipSerie(u),
        label: etiqueta(etiquetas, u, tipo === "bar" && s.apilar ? "inside" : "top"),
      };
    }),
  };
};

/** `SerieOpcion` de una `Serie` en los periodos dados. */
export const deSerie = (s: Serie, periodos: string[], extra: Omit<SerieOpcion, "nombre" | "datos"> = {}): SerieOpcion => ({
  nombre: s.nombre,
  datos: en(s, periodos),
  ...extra,
});

/** Etiquetas de eje de una lista de periodos. */
export const categoriasDe = (periodos: string[], anual = false) => periodos.map((p) => etiquetaPeriodo(p, anual));

export interface Barra {
  nombre: string;
  valor: number | null;
  /** Total o referencia (PIB, IPC general): otro color. */
  resaltar?: boolean;
}

/** Barras horizontales ordenadas (tasas y contribuciones por industria, divisiones del IPC). */
export const opcionBarrasH = ({
  barras,
  unidad = "%",
  etiquetas,
  nombreSerie,
  ordenar = true,
}: {
  barras: Barra[];
  unidad?: Unidad;
  etiquetas: boolean;
  nombreSerie: string;
  ordenar?: boolean;
}) => {
  const filas = (ordenar ? [...barras].sort((a, b) => (a.valor ?? 0) - (b.valor ?? 0)) : [...barras].reverse()).filter((b) => b.valor !== null);
  const corto = (s: string) => (s.length > 38 ? `${s.slice(0, 36)}…` : s);
  return {
    tooltip: { trigger: "axis", confine: true, axisPointer: { type: SOMBREADO }, ...tooltipSerie(unidad) },
    grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
    xAxis: ejeValor(unidad),
    yAxis: { type: "category", data: filas.map((f) => corto(f.nombre)), axisLabel: TEXTO_GRAFICA, axisTick: { show: false } },
    series: [
      {
        name: nombreSerie,
        type: "bar",
        barMaxWidth: 16,
        data: filas.map((f) => ({ value: f.valor, itemStyle: { color: f.resaltar ? colorSerie(1) : COLOR_ACTUAL } })),
        label: { ...etiqueta(etiquetas, unidad, "right"), position: "right" },
      },
    ],
  };
};

/** Barras de dos cortes por categoria: actual en serie 1 y anterior en gris (rol de la revista). */
export const opcionDosCortes = ({
  categorias,
  actual,
  anterior,
  unidad,
  etiquetas,
}: {
  categorias: string[];
  actual: { nombre: string; datos: (number | null)[] };
  anterior: { nombre: string; datos: (number | null)[] };
  unidad: Unidad;
  etiquetas: boolean;
}) =>
  opcionCategorias({
    categorias,
    izq: unidad,
    etiquetas,
    series: [
      { ...anterior, tipo: "bar", color: COLOR_ANTERIOR },
      { ...actual, tipo: "bar", color: COLOR_ACTUAL },
    ],
  });
