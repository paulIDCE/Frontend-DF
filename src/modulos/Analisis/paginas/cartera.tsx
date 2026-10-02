import { useState } from "react";
import { Segmented } from "antd";
import { useService } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, KpiBox, MiniKpi } from "../componentes";
import { NOTA_DERIVADO, NOTA_SEGMENTACION_2021, notas } from "../notas";
import { cargarBalanceEFI06 } from "../resumenEntidades";
import { fechaLarga, fmt, zoomRevista } from "../datos";
import { colorSerie, opcionComparativoAnual, opcionHistorico, opcionTresCortes } from "../opciones";

/**
 * Hojas 12 (Intermediación) y 13-16 (cartera por segmento) — porte de
 * `renderIntermediacionPage` y `renderCartera{Productiva,Consumo,Inmobiliario,Microcredito}Page`.
 *
 * Corrige: los mini KPIs de 13-16 son montos, pero el original les agregaba
 * "%" (reutilizaba el formato de morosidad de la hoja 12).
 */

/** Los 6 segmentos del catalogo (sufijo `_n` de `IF010` / `IF012`). */
const SEGMENTOS: [number, string][] = [
  [1, "Productivo"],
  [2, "Consumo"],
  [3, "Inmobiliario"],
  [4, "Microcrédito"],
  [5, "Vivienda int. social"],
  [6, "Educativo"],
];

/** Cartera en riesgo por segmento, en saldo (improductiva, apilada) o en indice (morosidad). */
const CarteraRiesgoSegmentos = () => {
  const { ctx, etiquetas } = useRevista();
  const [vista, setVista] = useState<"saldo" | "indice">("indice");
  const series = SEGMENTOS.filter(([n]) => ctx.fila(`IF012_${n}`)).map(([n, name]) =>
    vista === "saldo" ? { code: `IF010_${n}`, name, type: "bar" as const } : { code: `IF012_${n}`, name },
  );
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Segmented
        size="small"
        className="self-end"
        value={vista}
        onChange={(v) => setVista(v as "saldo" | "indice")}
        options={[
          { value: "indice", label: "Índice (%)" },
          { value: "saldo", label: "Saldo (millones USD)" },
        ]}
      />
      <Grafica
        titulo={vista === "saldo" ? "Cartera improductiva por segmento" : "Morosidad por segmento"}
        nota={NOTA_SEGMENTACION_2021}
        option={opcionHistorico(ctx, series, etiquetas, { izq: vista === "saldo" ? "millones USD" : "porcentajes (%)" })}
        alto={320}
      />
    </div>
  );
};

/**
 * Activos castigados (cuenta de orden 7103 del balance `EFI06`; plan 06, item 1.6): saldo
 * acumulado de lo castigado que la entidad sigue gestionando. Complementa el indicador P4 de PERLAS.
 */
const ActivosCastigados = () => {
  const { ctx, entidad, etiquetas } = useRevista();
  const { data: cuadro } = useService(cargarBalanceEFI06, [entidad], [entidad], true, "No se pudo cargar el balance (EFI06).");
  const fila = cuadro?.filas.find((f) => f.codigoBase === "7103");
  if (!cuadro || !fila) return null;
  const idx = new Map(cuadro.periodos.map((p, i) => [p, i]));
  const data = ctx.fechas.map((f) => {
    const i = idx.get(f);
    return i === undefined ? null : ((fila.valores as (number | null)[])[i] ?? null);
  });
  return (
    <Grafica
      titulo="Activos castigados (cuenta de orden 7103)"
      nota="Saldo de los activos castigados que la entidad mantiene en cuentas de orden. Fuente: balance EFI06."
      option={{
        tooltip: { trigger: "axis", confine: true, valueFormatter: (v: number) => fmt(v) },
        grid: { left: 8, right: 16, top: 24, bottom: 50, containLabel: true },
        xAxis: { type: "category", data: ctx.fechas.map(fechaLarga), axisLabel: { rotate: 45 } },
        yAxis: { type: "value", name: "millones USD", axisLabel: { formatter: (v: number) => fmt(v) } },
        dataZoom: zoomRevista(ctx, 12),
        series: [
          { name: "Activos castigados", type: "bar", data, color: colorSerie(5), label: { show: etiquetas, position: "top", formatter: (p: { value: number }) => fmt(p.value) } },
        ],
      }}
      alto={300}
    />
  );
};

const KPIS_CARTERA = ["CARTERA BRUTA", "CARTERA NETA", "CARTERA POR VENCER", "CARTERA VENCIDA", "CARTERA NO DEV. INT."];

export const Hoja12 = () => {
  const { ctx, etiquetas } = useRevista();
  return (
    <>
      <CabeceraPagina
        titulo="PRINCIPALES INDICADORES: COLOCACIONES DEL SISTEMA FINANCIERO NACIONAL"
        subtitulo="Colocaciones (Crédito) de la Entidad Financiera"
      />
      <div className="mb-3 flex flex-wrap gap-3">
        {["IF011", "@14", "IF007", "IF009", "IF008"].map((code, i) => (
          <KpiBox key={code} titulo={KPIS_CARTERA[i]} code={code} grupoPar={code === "IF011"} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <Grafica
            titulo="Evolución Histórica - Cartera de Crédito"
            base100
            option={opcionHistorico(
              ctx,
              [
                { code: "IF011", name: "Cart. Bruta", type: "line" },
                { code: "IF007", name: "Cart. Vencer", type: "bar" },
                { code: "IF010", name: "Cart. Improductiva", type: "bar" },
              ],
              etiquetas
            )}
            alto={340}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Grafica
              titulo="Composición de Cartera"
              option={opcionTresCortes(
                ctx,
                [
                  { code: "IF011", name: "Cart. Bruta" },
                  { code: "IF007", name: "Por vencer" },
                  { code: "IF009", name: "Vencida" },
                  { code: "IF008", name: "No dev. int." },
                ],
                etiquetas
              )}
              alto={280}
            />
            <Grafica titulo="Índice de Morosidad" option={opcionComparativoAnual(ctx, "IF012", etiquetas, { eje: "porcentaje (%)" })} alto={280} />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <CarteraRiesgoSegmentos />
            <Grafica
              titulo="Cartera Refinanciada y Reestructurada (todos los segmentos)"
              nota={notas(
                "Suma de la cartera por vencer, vencida y que no devenga intereses de los 6 segmentos, incluidas las líneas COVID-19.",
                NOTA_DERIVADO
              )}
              option={opcionHistorico(
                ctx,
                [
                  { code: "DER_CART_REFIN", name: "Refinanciada", type: "bar" },
                  { code: "DER_CART_REEST", name: "Reestructurada", type: "bar" },
                ],
                etiquetas
              )}
              alto={348}
            />
          </div>
          <ActivosCastigados />
        </div>
        <div className="grid grid-cols-2 content-start gap-2">
          <MiniKpi titulo="MOROSIDAD" code="IF012" tipo="bar" indiceColor={7} grupoPar />
          <MiniKpi titulo="CASTIGOS (PERLAS P4)" code="P4_Castigados" tipo="line" indiceColor={5} />
          <MiniKpi titulo="REND. CART. TOTAL" code="SB036" tipo="line" indiceColor={0} grupoPar />
          <MiniKpi titulo="REND. CART. PRODUCTIVO" code="SB037" tipo="bar" indiceColor={2} />
          <MiniKpi titulo="REND. CART. CONSUMO" code="SB038" tipo="line" indiceColor={3} />
          <MiniKpi titulo="REND. CART. INMOBILIARIO" code="SB039" tipo="bar" indiceColor={6} />
          <MiniKpi titulo="REND. CART. MICROCRÉDITO" code="SB040" tipo="line" indiceColor={1} />
        </div>
      </div>
    </>
  );
};

/** Segmento n (1 productivo, 2 consumo, 3 inmobiliario, 4 microcredito). */
const PaginaCarteraSegmento = ({ n, titulo }: { n: 1 | 2 | 3 | 4; titulo: string }) => {
  const { ctx, etiquetas } = useRevista();
  const s = `_${n}`;
  // Codigos del catalogo SB por segmento: neta @140n, refinanciada @14(08+n), reestructurada @14(16+n),
  // no devenga @14(24+n) / @14(32+n) / @14(40+n), vencida @14(48+n) / @14(56+n) / @14(64+n).
  const c = (base: number) => `@${1400 + base + n}`;
  const MINIS: [string, number][] = [
    ["CART. NO DEV. INT.", 24],
    ["CART. REF. NO DEV. INT.", 32],
    ["CART. REES. NO DEV. INT.", 40],
    ["CARTERA VENCIDA", 48],
    ["CART. REF. VENCIDA", 56],
    ["CART. REES. VENCIDA", 64],
  ];
  return (
    <>
      <CabeceraPagina titulo={titulo} subtitulo="Colocaciones (Crédito) de la Entidad Financiera" />
      <div className="mb-3 flex flex-wrap gap-3">
        {[`IF011${s}`, c(0), `IF007${s}`, `IF009${s}`, `IF008${s}`].map((code, i) => (
          <KpiBox key={code} titulo={KPIS_CARTERA[i]} code={code} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Grafica
              titulo="Evolución Histórica - Cartera de Crédito"
              nota={NOTA_SEGMENTACION_2021}
              option={opcionHistorico(
                ctx,
                [
                  { code: c(0), name: "Cart. Bruta (der)", type: "line", yAxisIndex: 0 },
                  { code: `IF010${s}`, name: "Cart. Vencer (der)", type: "line", yAxisIndex: 0 },
                  { code: `IF012${s}`, name: "Cart. Improductiva (izq)", type: "bar", yAxisIndex: 1 },
                ],
                etiquetas,
                { izq: "millones USD", der: "porcentajes (%)" }
              )}
              alto={320}
            />
            <Grafica
              titulo="Evolución Histórica - Cartera Refinanciada y Reestructurada"
              nota={NOTA_SEGMENTACION_2021}
              option={opcionHistorico(
                ctx,
                [
                  { code: c(8), name: "Cart. Refinanciada" },
                  { code: c(16), name: "Cart. Reestructurada" },
                ],
                etiquetas
              )}
              alto={320}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Grafica
              titulo="Composición de Cartera"
              option={opcionTresCortes(
                ctx,
                [
                  { code: `IF011${s}`, name: "Cart. Bruta" },
                  { code: `IF007${s}`, name: "Por vencer" },
                  { code: `IF009${s}`, name: "Vencida" },
                  { code: `IF008${s}`, name: "No dev. int." },
                ],
                etiquetas
              )}
              alto={280}
            />
            <Grafica titulo="Índice de Morosidad" option={opcionComparativoAnual(ctx, `IF012${s}`, etiquetas, { eje: "porcentaje (%)" })} alto={280} />
          </div>
        </div>
        <div className="grid grid-cols-2 content-start gap-2">
          {MINIS.map(([t, base], i) => (
            <MiniKpi key={t} titulo={t} code={c(base)} tipo={i % 2 ? "line" : "bar"} indiceColor={i} sufijo="" />
          ))}
        </div>
      </div>
    </>
  );
};

export const Hoja13 = () => <PaginaCarteraSegmento n={1} titulo="CARTERA DE CRÉDITO PRODUCTIVO" />;
export const Hoja14 = () => <PaginaCarteraSegmento n={2} titulo="CARTERA DE CRÉDITO CONSUMO" />;
export const Hoja15 = () => <PaginaCarteraSegmento n={3} titulo="CARTERA DE CRÉDITO INMOBILIARIO" />;
export const Hoja16 = () => <PaginaCarteraSegmento n={4} titulo="CARTERA DE CRÉDITO MICROCRÉDITO" />;
