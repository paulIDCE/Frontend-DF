/**
 * Estadisticas descriptivas de una serie de ECharts. Las usa el boton "Estadisticas" de
 * `TarjetaGrafica` (via `StatsOverlayChart`).
 */

/** Metricas ya calculadas, en el orden en que se muestran. Las claves son el rotulo visible. */
export type SeriesStats = Record<string, number>;

function calcularDesviacionEstandar(lista: number[]): number {
  const n = lista.length;
  if (n === 0) return 0;

  const media = lista.reduce((sum, val) => sum + val, 0) / n;
  const sumaCuadrados = lista.reduce((sum, val) => sum + Math.pow(val - media, 2), 0);
  return Math.sqrt(sumaCuadrados / n); // Poblacional
}

/** Percentil con interpolacion lineal sobre datos ya ordenados. */
const percentil = (ordenados: number[], p: number): number => {
  const pos = (ordenados.length - 1) * p;
  const base = Math.floor(pos);
  const resto = pos - base;
  return ordenados[base + 1] !== undefined
    ? ordenados[base] + resto * (ordenados[base + 1] - ordenados[base])
    : ordenados[base];
};

/**
 * Acepta los dos formatos de punto de ECharts: valor plano (`12.3`) o tupla (`[fecha, 12.3, ...]`,
 * el que usan las series temporales de `opcionesBase`). Los nulos y no numericos se ignoran.
 */
const getSeriesStats = (data: readonly unknown[]): SeriesStats => {
  const values = data
    .map((item) => (Array.isArray(item) ? item[1] : item))
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

  if (values.length === 0) return {};

  const n = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const stdDev = calcularDesviacionEstandar(values);

  const q1 = percentil(sorted, 0.25);
  const q3 = percentil(sorted, 0.75);

  return {
    // Grupo 1: Tendencia
    Promedio: mean,
    Mediana: percentil(sorted, 0.5),
    // Grupo 2: Extremos y Rangos
    "Valor Mínimo": sorted[0],
    "Valor Máximo": sorted[n - 1],
    "Primer Cuartil (Q1)": q1,
    "Tercer Cuartil (Q3)": q3,
    "Rango Intercuartil (IQR)": q3 - q1,
    // Grupo 3: Dispersión
    "Desv. Estándar": stdDev,
    "Desv. Estándar (95%)": stdDev * 100,
    "Coef. Variación (%)": mean !== 0 ? (stdDev / mean) * 100 : 0,
    // Grupo 4: Volumen
    "Muestras (N)": n,
    "Suma Total": sum,
  };
};

export { calcularDesviacionEstandar, getSeriesStats };
