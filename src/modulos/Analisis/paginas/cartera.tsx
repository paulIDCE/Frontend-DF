import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, KpiBox, MiniKpi } from "../componentes";
import { opcionComparativoAnual, opcionHistorico, opcionTresCortes } from "../opciones";

/**
 * Hojas 12 (Intermediación) y 13-16 (cartera por segmento) — porte de
 * `renderIntermediacionPage` y `renderCartera{Productiva,Consumo,Inmobiliario,Microcredito}Page`.
 *
 * Corrige: los mini KPIs de 13-16 son montos, pero el original les agregaba
 * "%" (reutilizaba el formato de morosidad de la hoja 12).
 */

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
          <KpiBox key={code} titulo={KPIS_CARTERA[i]} code={code} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <Grafica
            titulo="Evolución Histórica - Cartera de Crédito"
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
        </div>
        <div className="grid grid-cols-2 content-start gap-2">
          <MiniKpi titulo="MOROSIDAD" code="IF012" tipo="bar" indiceColor={7} />
          <MiniKpi titulo="REND. CART. TOTAL" code="SB036" tipo="line" indiceColor={0} />
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
