/**
 * Base 100: cada serie se expresa como índice respecto de su valor en un periodo base
 * (`índice(t) = valor(t) / valor(base) × 100`). Sirve para comparar la evolución de series de
 * distinta escala (cuentas de distinto tamaño, entidades grandes y pequeñas).
 *
 * El periodo base es el primero visible al abrir la gráfica (el `startValue` del `dataZoom`) o, sin
 * zoom, el primero del eje. Si una serie vale 0 o no tiene dato en la base, toma su primer valor
 * distinto de 0 desde ahí.
 */

type Punto = number | null | undefined | { value?: unknown } | unknown[];

const numero = (p: Punto): number | null => {
  const v = Array.isArray(p) ? p[1] : p && typeof p === "object" ? (p as { value?: unknown }).value : p;
  const n = typeof v === "number" ? v : v === null || v === undefined || v === "" ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
};

const conValor = (p: Punto, v: number | null): Punto =>
  Array.isArray(p) ? [p[0], v, ...p.slice(2)] : p && typeof p === "object" ? { ...p, value: v } : v;

const primerEje = (eje: unknown) => (Array.isArray(eje) ? eje[0] : eje) as { type?: string; data?: unknown[] } | undefined;

/** Índice del periodo base en el eje X de categorías. */
const indiceBase = (option: any): number => {
  const datos = primerEje(option?.xAxis)?.data ?? [];
  const zoom = Array.isArray(option?.dataZoom) ? option.dataZoom[0] : option?.dataZoom;
  if (zoom?.startValue !== undefined) {
    const i = typeof zoom.startValue === "number" ? zoom.startValue : datos.indexOf(zoom.startValue);
    if (i >= 0) return i;
  }
  return 0;
};

/** ¿La opción admite base 100? Gráfica cartesiana con eje X de categorías y series de líneas o barras. */
export const admiteBase100 = (option: any): boolean => {
  const x = primerEje(option?.xAxis);
  const series = Array.isArray(option?.series) ? option.series : [];
  return !!x && (x.type === "category" || Array.isArray(x.data)) && series.some((s: any) => s?.type === "line" || s?.type === "bar");
};

const formato = (v: number) => v.toLocaleString("es-EC", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Devuelve la opción con las series en base 100. No modifica `option`. */
export const aBase100 = (option: any): any => {
  if (!admiteBase100(option)) return option;
  const base = indiceBase(option);
  const etiquetaBase = primerEje(option.xAxis)?.data?.[base];
  const nombreEje = `Índice (base 100${etiquetaBase !== undefined ? ` = ${String(etiquetaBase)}` : ""})`;
  const eje = (y: any) => ({
    ...y,
    name: nombreEje,
    scale: true,
    axisLabel: { ...(y?.axisLabel ?? {}), formatter: (v: number) => formato(v) },
  });

  return {
    ...option,
    // Las series ya no son montos ni porcentajes: un solo eje, sin apilar.
    yAxis: Array.isArray(option.yAxis) ? eje(option.yAxis[0]) : eje(option.yAxis),
    tooltip: { ...(option.tooltip ?? {}), formatter: undefined, valueFormatter: (v: number) => (v === null || v === undefined ? "-" : formato(v)) },
    series: option.series.map((s: any) => {
      if (!Array.isArray(s?.data) || (s.type !== "line" && s.type !== "bar")) return s;
      const datos: Punto[] = s.data;
      let ref: number | null = null;
      for (let i = base; i < datos.length && ref === null; i++) {
        const v = numero(datos[i]);
        if (v) ref = v;
      }
      return {
        ...s,
        yAxisIndex: 0,
        stack: undefined,
        areaStyle: undefined,
        data: datos.map((p) => {
          const v = numero(p);
          return conValor(p, ref && v !== null ? (v / ref) * 100 : null);
        }),
        label: s.label ? { ...s.label, formatter: (p: { value: unknown }) => { const v = numero(p.value as Punto); return v === null ? "" : formato(v); } } : s.label,
      };
    }),
  };
};
