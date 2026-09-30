import { TEXTO_GRAFICA, color, inicioZoom, zoomTemporal } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, KpiBox, MiniKpi } from "../componentes";
import { fechaCorta, fechaLarga, fmt, type Ctx } from "../datos";
import { opcionHistorico, opcionTresCortes, type SerieHistorica } from "../opciones";

/**
 * Hojas 17 (Turbulencia), 18 (Operaciones activas y pasivas) y 19-23
 * (monto de operaciones por segmento y pasivas) — porte de
 * `renderTurbulenciaPage`, `renderOperacionesActivasPasivasPage`,
 * `renderSeg*Page`.
 */

/* ---------------------------- Hoja 17 ---------------------------- */

const percentil = (ordenados: number[], p: number) => ordenados[Math.floor(ordenados.length * p)] ?? 0;

const opcionTurbulencia = (ctx: Ctx, varAnual: string) => {
  const turb = ctx.serie("turbulencia");
  const validos = turb.filter((v) => v !== 0).sort((a, b) => a - b);
  const p75 = percentil(validos, 0.75);
  const p50 = percentil(validos, 0.5);
  const tono = (v: number) => (v <= p50 ? color.datos.series[0] : v <= p75 ? color.datos.eje : color.tinta.tenue);
  const nivel = (v: number) => (v <= p50 ? "Normal" : v <= p75 ? "Turbulencia media" : "Turbulencia alta");
  const linea = (nombre: string, valor: number, c: string) => ({
    name: nombre,
    type: "line",
    data: ctx.fechas.map(() => valor),
    symbol: "none",
    silent: true,
    color: c,
    lineStyle: { type: "dashed", width: 2 },
    label: { show: true, position: "insideEndTop", ...TEXTO_GRAFICA, formatter: `${nombre.replace("Percentil ", "P").replace("%", "")}: ${valor.toFixed(2)}` },
  });
  return {
    tooltip: {
      trigger: "axis",
      confine: true,
      formatter: (ps: { seriesName: string; value: number; axisValue: string; marker: string }[]) =>
        `<strong>${ps[0]?.axisValue}</strong><br/>` +
        ps
          .map((p) =>
            p.seriesName === "Índice de Turbulencia"
              ? `${p.marker}${p.seriesName}: <strong>${p.value.toFixed(3)}</strong> (${nivel(p.value)})`
              : p.seriesName.startsWith("Percentil")
                ? `${p.marker}${p.seriesName}: <strong>${p.value.toFixed(3)}</strong>`
                : `${p.marker}${p.seriesName}: <strong>${p.value.toFixed(2)}%</strong>`
          )
          .join("<br/>"),
    },
    legend: { bottom: 26, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: 8, top: 24, bottom: 70, containLabel: true },
    xAxis: { type: "category", data: ctx.fechas.map(fechaLarga), axisLabel: { ...TEXTO_GRAFICA, rotate: 45 }, axisTick: { show: false } },
    yAxis: [
      { type: "value", name: "Índice", min: "dataMin", max: "dataMax", nameTextStyle: TEXTO_GRAFICA, axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => v.toFixed(1) } },
      {
        type: "value",
        name: "Var. Cartera Bruta Real",
        min: "dataMin",
        max: "dataMax",
        nameTextStyle: TEXTO_GRAFICA,
        axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => `${v.toFixed(2)}%` },
        splitLine: { show: false },
      },
    ],
    dataZoom: zoomTemporal(inicioZoom(ctx.fechas.length, 12)),
    series: [
      {
        name: "Índice de Turbulencia",
        type: "bar",
        barMaxWidth: 40,
        color: color.datos.series[0],
        data: turb.map((v) => ({ value: v, itemStyle: { color: tono(v) } })),
      },
      linea("Percentil 75%", p75, color.tinta.secundaria),
      linea("Percentil 50%", p50, color.datos.series[0]),
      {
        name: "Var. Cartera Bruta Real",
        type: "line",
        yAxisIndex: 1,
        data: ctx.serie(varAnual),
        color: color.datos.series[7],
        symbolSize: 4,
        areaStyle: { opacity: 0.1 },
      },
    ],
  };
};

export const Hoja17 = () => {
  const { ctx } = useRevista();
  const kpis: [string, string][] = [
    ["tasa_14", "CARTERA TOTAL - VAR. ANUAL (%)"],
    ["tasa_IF0071", "CART. PRODUCTIVA - VAR. ANUAL (%)"],
    ["tasa_IF0072", "CART. CONSUMO - VAR. ANUAL (%)"],
    ["tasa_IF0073", "CART. INMOBILIARIO - VAR. ANUAL (%)"],
    ["tasa_IF0074", "CART. MICROCRÉDITO - VAR. ANUAL (%)"],
  ];
  // Los niveles de la cartera por segmento (percentiles y tasas reales) vienen por `Variable`.
  const p75 = ctx.valor("Percentil 75");
  const p50 = ctx.valor("Percentil 50");
  const nivel = (v: number) =>
    v < p50 ? ["text-exito", "Normal"] : v < p75 ? ["text-advertencia", "Turbulencia Media"] : ["text-error", "Turbulencia Alta"];
  const RESUMEN: [string, string][] = [
    ["Cartera Productiva", "Tasa de Variación Anual Real Cart. Productiva"],
    ["Cartera Consumo", "Tasa de Variación Anual Real Cart. Consumo"],
    ["Cartera Inmobiliario", "Tasa de Variación Anual Real Cart. Inmobiliario"],
    ["Cartera Microcrédito", "Tasa de Variación Anual Real Cart. Microcrédito"],
  ];
  return (
    <>
      <CabeceraPagina titulo="ÍNDICE DE TURBULENCIA" />
      <div className="mb-3 flex flex-wrap gap-3">
        {kpis.map(([code, t]) => (
          <div key={code} className="flex min-w-40 flex-1 flex-col rounded-tarjeta border-l-4 border-identidad bg-superficie p-3 shadow-tarjeta">
            <span className="text-rotulo font-bold text-tinta-secundaria">{t}</span>
            <span className="text-cifra font-extrabold text-identidad">{ctx.valor(code).toFixed(2)}%</span>
            <span className="text-detalle text-tinta-tenue">{fechaCorta(ctx.fecha)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {[
            ["var_anual_comer", "Índice de Turbulencia - Cartera Productiva"],
            ["var_anual_cons", "Índice de Turbulencia - Cartera Consumo"],
            ["var_anual_inmo", "Índice de Turbulencia - Cartera Inmobiliario"],
            ["var_anual_micro", "Índice de Turbulencia - Cartera Microcrédito"],
          ].map(([code, titulo]) => (
            <Grafica key={code} titulo={titulo} option={opcionTurbulencia(ctx, code)} alto={320} cambioTipo={false} />
          ))}
        </div>
        <section className="rounded-tarjeta border border-linea bg-superficie-sutil p-3 text-detalle">
          <h4 className="m-0 mb-3 text-subtitulo font-bold text-identidad">ANÁLISIS DEL ÍNDICE DE TURBULENCIA</h4>
          <strong className="text-identidad">Resumen Actual:</strong>
          <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
            {RESUMEN.map(([t, v]) => {
              const val = ctx.valor(v);
              const [cls, txt] = nivel(val);
              return (
                <li key={t} className="rounded-tarjeta border-l-4 border-accion bg-superficie p-2">
                  <strong>{t}:</strong> {val.toFixed(3)} - <span className={`font-semibold ${cls}`}>{txt}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 rounded-tarjeta border-l-4 border-advertencia bg-advertencia-sutil p-2">
            <strong>Interpretación:</strong>
            <p className="m-0 mt-1">
              Los valores por encima del percentil 75% ({p75.toFixed(2)}) indican{" "}
              <span className="font-semibold text-error">turbulencia alta</span>, lo que sugiere variaciones anómalas en
              la cartera de crédito que requieren atención especial.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

/* ---------------------------- Hoja 18 ---------------------------- */

export const Hoja18 = () => {
  const { ctx, etiquetas } = useRevista();
  const v = (c: string) => ctx.valor(c);
  return (
    <>
      <CabeceraPagina titulo="MONTO DE OPERACIONES ACTIVAS Y PASIVAS" subtitulo="Operaciones de Crédito y Depósitos a Plazo Nuevos" />
      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiBox titulo="MONTO OPER. ACTIVAS (MILLONES USD)" code="monto_total" />
        <KpiBox titulo="NÚMERO OPER. ACTIVAS (#)" code="ope_total" />
        <KpiBox titulo="MONTO PROMEDIO ACTIVAS (USD)" code="monto_pro" />
        <KpiBox titulo="MONTO OPER. PASIVAS (MILLONES USD)" code="mop" />
        <KpiBox titulo="NÚMERO OPER. PASIVAS (#)" code="OPTPE" />
        <KpiBox titulo="MONTO PROMEDIO PASIVAS (USD)" code="pro_MOP" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Grafica
              titulo="Evolución Histórica - Operaciones Activas"
              option={opcionHistorico(
                ctx,
                [
                  { code: "monto_total", name: "Monto Activas (der)", type: "line", yAxisIndex: 0 },
                  { code: "ope_total", name: "Número Operaciones (izq)", type: "bar", yAxisIndex: 1 },
                ],
                etiquetas,
                { izq: "millones USD", der: "número" }
              )}
              alto={320}
            />
            <Grafica
              titulo="Evolución Histórica - Operaciones Pasivas"
              option={opcionHistorico(
                ctx,
                [
                  { code: "mop", name: "Monto Pasivas (der)", type: "line", yAxisIndex: 0 },
                  { code: "OPTPE", name: "Número Operaciones (izq)", type: "bar", yAxisIndex: 1 },
                ],
                etiquetas,
                { izq: "millones USD", der: "número" }
              )}
              alto={320}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Grafica
              titulo="Composición de Operaciones Activas"
              option={opcionTresCortes(
                ctx,
                [
                  { code: "part_proc", name: "Part. Prod. Corp." },
                  { code: "part_empr", name: "Part. Prod. Empr." },
                  { code: "part_pyme", name: "Part. Prod. PYMES" },
                  { code: "partmon_cons", name: "Part. Consumo" },
                  { code: "partmon_inmo", name: "Part. Inmo." },
                  { code: "part_mino", name: "Part. Mic. Minorista" },
                  { code: "part_simp", name: "Part. Mic. Acu. Simple" },
                  { code: "part_amp", name: "Part. Mic. Acu. Ampliada" },
                ],
                etiquetas,
                "%"
              )}
              alto={300}
            />
            <Grafica
              titulo="Composición de Depósitos por Plazo"
              option={opcionTresCortes(
                ctx,
                [
                  { code: "part_30", name: "Part. Dep. 30-60" },
                  { code: "part_60", name: "Part. Dep. 61-90" },
                  { code: "part_90", name: "Part. Dep. 91-120" },
                  { code: "part_120", name: "Part. Dep. 121-180" },
                  { code: "part_180", name: "Part. Dep. 181-360" },
                  { code: "part_360", name: "Part. Dep. 361" },
                ],
                etiquetas,
                "%"
              )}
              alto={300}
            />
          </div>
        </div>
        <section className="rounded-tarjeta border border-linea bg-superficie-sutil p-3 text-detalle">
          <h4 className="m-0 mb-3 text-subtitulo font-bold text-identidad">ANÁLISIS DE CRÉDITO Y DEPÓSITOS</h4>
          <strong className="text-identidad">Resumen de Operaciones:</strong>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["OPERACIONES ACTIVAS", "monto_total", "ope_total", "monto_pro", "border-accion"],
              ["OPERACIONES PASIVAS", "mop", "OPTPE", "pro_MOP", "border-exito"],
            ].map(([t, m, n, p, borde]) => (
              <div key={t} className={`rounded-tarjeta border-l-4 bg-superficie p-2 ${borde}`}>
                <strong className="text-identidad">{t}</strong>
                <p className="m-0">
                  Monto Total: <strong>{fmt(v(m))} millones USD</strong>
                </p>
                <p className="m-0">
                  Número Operaciones: <strong>{fmt(v(n))}</strong>
                </p>
                <p className="m-0">
                  Monto Promedio: <strong>{fmt(v(p))} USD</strong>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-tarjeta border-l-4 border-advertencia bg-advertencia-sutil p-2">
            <strong>Composición del Crédito:</strong>
            <p className="m-0 mt-1">
              Corporativo: <strong>{v("part_proc").toFixed(2)}%</strong> | Empresarial:{" "}
              <strong>{v("part_empr").toFixed(2)}%</strong> | PYMES: <strong>{v("part_pyme").toFixed(2)}%</strong> |
              Consumo: <strong>{v("partmon_cons").toFixed(2)}%</strong>
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

/* ---------------------------- Hojas 19-23 ---------------------------- */

interface ConfigSegmento {
  titulo: string;
  subtitulo: string;
  kpis: [string, string][];
  montos: { titulo: string; series: SerieHistorica[] };
  numeros: { series: SerieHistorica[] };
  composicionMontos?: string;
  composicionNumeros?: string;
  minis: [string, string][];
}

const PaginaSegmento = ({ c }: { c: ConfigSegmento }) => {
  const { ctx, etiquetas } = useRevista();
  return (
    <>
      <CabeceraPagina titulo={c.titulo} subtitulo={c.subtitulo} />
      <div className="mb-3 flex flex-wrap gap-3">
        {c.kpis.map(([code, t]) => (
          <KpiBox key={code} titulo={t} code={code} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Grafica titulo={c.montos.titulo} option={opcionHistorico(ctx, c.montos.series, etiquetas)} alto={320} />
            <Grafica
              titulo="Evolución Histórica - Número de Operaciones"
              option={opcionHistorico(ctx, c.numeros.series, etiquetas, { izq: "número" })}
              alto={320}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Grafica
              titulo={c.composicionMontos ?? "Composición de Montos"}
              option={opcionTresCortes(ctx, c.montos.series.map((s) => ({ code: s.code, name: s.name })), etiquetas)}
              alto={280}
            />
            <Grafica
              titulo={c.composicionNumeros ?? "Composición de Número de Operaciones"}
              option={opcionTresCortes(ctx, c.numeros.series.map((s) => ({ code: s.code, name: s.name })), etiquetas, "número")}
              alto={280}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 content-start gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {c.minis.map(([code, t], i) => (
            <MiniKpi key={code} titulo={t} code={code} tipo={i % 2 ? "line" : "bar"} indiceColor={i} sufijo="" />
          ))}
        </div>
      </div>
    </>
  );
};

const serie = (code: string, name: string, type: "line" | "bar" = "line"): SerieHistorica => ({ code, name, type });

const SEG_PRODUCTIVO: ConfigSegmento = {
  titulo: "MONTO DE OPERACIONES ACTIVAS SEGMENTO PRODUCTIVO",
  subtitulo: "Operaciones de Crédito Nuevos",
  kpis: [
    ["moa_cor", "MONTO CRÉDITO TOTAL (MILLONES USD)"],
    ["num_cor", "NÚMERO DE OPERACIONES TOTAL (#)"],
    ["proc", "PRODUCTIVO CORPORATIVO (MILLONES USD)"],
    // El original volvia a pintar `proc` aqui: el KPI empresarial quedaba en 0.
    ["prodem", "PRODUCTIVO EMPRESARIAL (MILLONES USD)"],
    ["prodpy", "PRODUCTIVO PYMES (MILLONES USD)"],
  ],
  montos: {
    titulo: "Evolución Histórica - Segmento Productivo",
    series: [serie("moa_cor", "Seg. Productivo"), serie("proc", "Prod. Corporativo", "bar"), serie("prodem", "Prod. Empresarial", "bar"), serie("prodpy", "Prod. PYMES", "bar")],
  },
  numeros: {
    series: [serie("num_cor", "Seg. Productivo"), serie("num_proc", "Prod. Corporativo", "bar"), serie("num_prodem", "Prod. Empresarial", "bar"), serie("num_prodpy", "Prod. PYMES", "bar")],
  },
  minis: [
    ["pro_cor", "CRÉDITO PROMEDIO SEG. PRODUCTIVO"],
    ["pro_proc", "CRÉDITO PROMEDIO PROD. CORPORATIVO"],
    ["pro_prodem", "CRÉDITO PROMEDIO PROD. EMPRESARIAL"],
    ["pro_prodpy", "CRÉDITO PROMEDIO PROD. PYMES"],
  ],
};

const SEG_CONSUMO: ConfigSegmento = {
  titulo: "MONTO DE OPERACIONES ACTIVAS SEGMENTO CONSUMO Y EDUCATIVO",
  subtitulo: "Operaciones de Crédito Nuevos",
  kpis: [
    ["cons", "MONTO CRÉDITO DE CONSUMO (MILLONES USD)"],
    ["num_cons", "NÚMERO DE OPERACIONES DE CONSUMO (#)"],
    ["moa_educ", "EDUCATIVO TOTAL (MILLONES USD)"],
    ["edu", "EDUCATIVO (MILLONES USD)"],
    ["eduso", "EDUCATIVO SOCIAL (MILLONES USD)"],
  ],
  montos: {
    titulo: "Evolución Histórica - Segmento Consumo y Educativo",
    series: [serie("cons", "Consumo"), serie("edu", "Educativo"), serie("eduso", "Educativo Social")],
  },
  numeros: { series: [serie("num_cons", "Consumo"), serie("num_edu", "Educativo"), serie("num_eduso", "Educativo Social")] },
  minis: [
    ["pro_cons", "CONSUMO"],
    ["pro_edu", "EDUCATIVO"],
    ["pro_eduso", "EDUCATIVO SOCIAL"],
  ],
};

const SEG_INMOBILIARIO: ConfigSegmento = {
  titulo: "MONTO DE OPERACIONES ACTIVAS SEGMENTO INMOBILIARIO - VIVIENDA DE INTERÉS PÚBLICO Y SOCIAL",
  subtitulo: "Operaciones de Crédito Nuevos",
  kpis: [
    ["inmo", "MONTO CRÉDITO DE INMOBILIARIO (MILLONES USD)"],
    ["num_in", "NÚMERO DE OPERACIONES DE INMOBILIARIO (#)"],
    ["moa_vi", "MONTO CRÉDITO VIVIENDA DE INTERÉS PÚBLICO Y SOCIAL (MILLONES USD)"],
    ["vip", "MONTO CRÉDITO VIVIENDA DE INTERÉS PÚBLICO (MILLONES USD)"],
    ["vis", "MONTO CRÉDITO VIVIENDA DE INTERÉS SOCIAL (MILLONES USD)"],
  ],
  montos: {
    titulo: "Evolución Histórica - Segmento Inmobiliario y Viv. Int. Pub. y Social",
    series: [serie("inmo", "Inmobiliario"), serie("vip", "Vivienda de Interés Público"), serie("vis", "Vivienda de Interés Social")],
  },
  // El original graficaba `num_inmo` (inexistente); la cuenta es `num_in`.
  numeros: { series: [serie("num_in", "Inmobiliario"), serie("num_vip", "Vivienda de Interés Público"), serie("num_vis", "Vivienda de Interés Social")] },
  minis: [
    ["pro_in", "CRÉDITO PROMEDIO INMOBILIARIO (USD)"],
    ["pro_vip", "CRÉDITO PROMEDIO VIVIENDA INTERÉS PÚBLICO (USD)"],
    ["pro_vis", "CRÉDITO PROMEDIO VIVIENDA INTERÉS SOCIAL (USD)"],
  ],
};

const SEG_MICRO: ConfigSegmento = {
  titulo: "MONTO DE OPERACIONES ACTIVAS SEGMENTO MICROCRÉDITO",
  subtitulo: "Operaciones de Crédito Nuevos",
  kpis: [
    ["moa_mic", "MONTO CRÉDITO MICROCRÉDITO TOTAL (MILLONES USD)"],
    ["num_mic", "NÚMERO DE OPERACIONES DE MICROCRÉDITO TOTAL (#)"],
    ["mino", "MONTO CRÉDITO MIC. MINORISTA (MILLONES USD)"],
    ["mas", "MONTO CRÉDITO MIC. ACUM. SIMPLE (MILLONES USD)"],
    ["maa", "MONTO CRÉDITO MIC. ACUM. AMPLIADA (MILLONES USD)"],
  ],
  montos: {
    titulo: "Evolución Histórica - Segmento Microcrédito",
    series: [serie("moa_mic", "Microcrédito Total"), serie("mino", "Mic. Minorista", "bar"), serie("mas", "Mic. Acum. Simple", "bar"), serie("maa", "Mic. Acum. Ampliada", "bar")],
  },
  // El original mezclaba montos (`mino`, `mas`, `maa`) en la composicion de numero de operaciones.
  numeros: {
    series: [serie("num_mic", "Microcrédito Total"), serie("num_mino", "Mic. Minorista", "bar"), serie("num_mas", "Mic. Acum. Simple", "bar"), serie("num_maa", "Mic. Acum. Ampliada", "bar")],
  },
  minis: [
    ["pro_mic", "CRÉDITO PROMEDIO MICROCRÉDITO TOTAL (USD)"],
    ["pro_mino", "CRÉDITO PROMEDIO MIC. MINORISTA (USD)"],
    ["pro_mas", "CRÉDITO PROMEDIO MIC. ACUM. SIMPLE (USD)"],
    ["pro_maa", "CRÉDITO PROMEDIO MIC. ACUM. AMPLIADA (USD)"],
  ],
};

const PLAZOS: [string, string, string][] = [
  ["30", "61", "Plazo 30-60"],
  ["61", "91", "Plazo 61-90"],
  ["91", "121", "Plazo 91-120"],
  ["121", "181", "Plazo 121-180"],
  ["181", "361", "Plazo 181-360"],
  ["361", "", "Plazo +360"],
];

const SEG_PASIVAS: ConfigSegmento = {
  titulo: "MONTO DE OPERACIONES PASIVAS",
  subtitulo: "Depósitos a Plazo Nuevos",
  kpis: [
    ["mop", "DEPÓSITOS A PLAZO TOTAL (MILLONES USD)"],
    ["OPTPE", "NÚMERO DE OPERACIONES TOTAL (#)"],
    ["pro_MOP", "MONTO PLAZO PROMEDIO (USD)"],
  ],
  montos: {
    titulo: "Evolución Histórica - Monto de Operaciones Pasivas",
    series: [serie("mop", "Depósitos a Plazo"), ...PLAZOS.map(([d, , n]) => serie(`Plazo${d}`, n, "bar"))],
  },
  numeros: { series: [serie("OPTPE", "Depósitos a Plazo"), ...PLAZOS.map(([d, , n]) => serie(`OPTPE${d}`, n, "bar"))] },
  composicionMontos: "Composición de Montos por Plazo",
  composicionNumeros: "Composición de Número de Operaciones por Plazo",
  minis: [
    ["pro_MOP", "MONTO PROMEDIO PLAZO (USD)"],
    ...PLAZOS.map(([d, , n]): [string, string] => [`pro_op${d}`, `PROMEDIO ${n.toUpperCase().replace("-", " - ")} (USD)`]),
  ],
};

export const Hoja19 = () => <PaginaSegmento c={SEG_PRODUCTIVO} />;
export const Hoja20 = () => <PaginaSegmento c={SEG_CONSUMO} />;
export const Hoja21 = () => <PaginaSegmento c={SEG_INMOBILIARIO} />;
export const Hoja22 = () => <PaginaSegmento c={SEG_MICRO} />;
export const Hoja23 = () => <PaginaSegmento c={SEG_PASIVAS} />;
