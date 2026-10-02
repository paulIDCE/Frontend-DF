import { useState } from "react";
import { Segmented } from "antd";
import { Delta, FilaKpis, FranjaSelectores, KpiCard, TEXTO_GRAFICA } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, KpiBox } from "../componentes";
import { fechaCorta, fechaLarga, fmt, seriesFlujo, variacion, zoomRevista, type Ctx } from "../datos";
import { colorSerie } from "../opciones";
import { sentidoDe } from "../catalogoIndicadores";

/**
 * Hoja "Tendencias": TAM + Grafico Z (Managerial Analyzer §5.7; plan 06, item 1.11). El TAM (total
 * de los ultimos 12 meses) quita la estacionalidad y el reinicio de enero de los acumulados, y no
 * depende del mes como la anualizacion simple (`@xA` = acumulado × 12 / mes).
 */

interface Partida {
  code: string;
  nombre: string;
  /** Las cuentas de PyG vienen acumuladas en el año; los montos de operaciones, por mes. */
  acumulada: boolean;
}

const PARTIDAS: Partida[] = [
  { code: "@5", nombre: "Ingresos", acumulada: true },
  { code: "@51", nombre: "Intereses ganados", acumulada: true },
  { code: "@41", nombre: "Intereses causados", acumulada: true },
  { code: "@44", nombre: "Provisiones", acumulada: true },
  { code: "@45", nombre: "Gastos de operación", acumulada: true },
  { code: "Gan_Eje", nombre: "Resultado del ejercicio", acumulada: true },
  { code: "monto_total", nombre: "Monto de operaciones activas", acumulada: false },
  { code: "mop", nombre: "Monto de operaciones pasivas", acumulada: false },
];

/** Grafico Z: valor del mes, acumulado del año y TAM en el mismo eje. */
const opcionGraficoZ = (ctx: Ctx, p: Partida, etiquetas: boolean) => {
  const s = seriesFlujo(ctx, p.code, p.acumulada);
  const linea = (name: string, data: (number | null)[], i: number, extra: Record<string, unknown> = {}) => ({
    name,
    type: "line",
    data,
    color: colorSerie(i),
    smooth: false,
    symbol: "circle",
    symbolSize: 5,
    connectNulls: false,
    label: { show: etiquetas, position: "top", ...TEXTO_GRAFICA, formatter: (x: { value: number }) => fmt(x.value) },
    ...extra,
  });
  return {
    tooltip: { trigger: "axis", confine: true, valueFormatter: (v: number | null) => (v === null || v === undefined ? "-" : fmt(v)) },
    legend: { bottom: 26, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: 16, top: 24, bottom: 70, containLabel: true },
    xAxis: { type: "category", data: ctx.fechas.map(fechaLarga), axisLabel: { ...TEXTO_GRAFICA, rotate: 45 }, axisTick: { show: false } },
    yAxis: { type: "value", name: "millones USD", nameTextStyle: TEXTO_GRAFICA, axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => fmt(v) } },
    dataZoom: zoomRevista(ctx, 36),
    series: [
      // Orden fijo de la paleta: la serie i lleva el color i.
      linea("TAM (últimos 12 meses)", s.tam, 0, { lineStyle: { width: 3 } }),
      linea("Acumulado del año", s.acumulado, 1, { lineStyle: { type: "dashed" } }),
      linea("Valor del mes", s.mensual, 2, { type: "bar", barMaxWidth: 18 }),
    ],
  };
};

const valorEn = (serie: (number | null)[], ctx: Ctx, fecha: string) => serie[ctx.fechas.indexOf(fecha)] ?? null;

export const HojaTendencias = () => {
  const { ctx, etiquetas } = useRevista();
  const disponibles = PARTIDAS.filter((p) => ctx.fila(p.code));
  const [code, setCode] = useState(disponibles[0]?.code ?? "@5");
  const partida = disponibles.find((p) => p.code === code) ?? disponibles[0];
  if (!partida) return <CabeceraPagina titulo="TENDENCIAS" subtitulo="Sin partidas de resultados en el reporte" />;

  const s = seriesFlujo(ctx, partida.code, partida.acumulada);
  const tamActual = valorEn(s.tam, ctx, ctx.fecha);
  const tamAnterior = valorEn(s.tam, ctx, ctx.anioAnterior);
  const varTam = tamActual !== null && tamAnterior !== null ? variacion(tamActual, tamAnterior) : null;

  return (
    <>
      <CabeceraPagina
        titulo="TENDENCIAS: TAM Y GRÁFICO Z"
        subtitulo="Valor del mes, acumulado del año y total de los últimos 12 meses (TAM)"
      />
      <FranjaSelectores
        grupos={[
          {
            rotulo: "Partida",
            control: (
              <Segmented value={partida.code} onChange={(v) => setCode(String(v))} options={disponibles.map((p) => ({ value: p.code, label: p.nombre }))} />
            ),
          },
        ]}
      />
      <FilaKpis columnas={3} className="my-3">
        <KpiCard
          titulo={`TAM · ${partida.nombre}`}
          color="monto"
          valor={tamActual === null ? "—" : fmt(tamActual)}
          sufijo="M USD"
          valorSecundario={<Delta valor={varTam} sufijo="%" subirEsMalo={sentidoDe(partida.code) === "baja"} etiqueta={`vs. ${fechaCorta(ctx.anioAnterior)}`} />}
          pie={<span className="text-rotulo text-tinta-tenue">Total de los últimos 12 meses</span>}
        />
        {partida.acumulada && <KpiBox titulo={`Acumulado del año · ${partida.nombre}`} code={partida.code} />}
        {partida.acumulada && (
          <KpiBox titulo="Anualizado simple (× 12 / mes)" code={partida.code.startsWith("@") ? `${partida.code}A` : `${partida.code}_anual`} />
        )}
      </FilaKpis>
      <Grafica
        titulo={`Gráfico Z - ${partida.nombre}`}
        nota="TAM(m) = acumulado(m) + acumulado de diciembre del año anterior − acumulado del mismo mes del año anterior. Necesita 12 meses previos: el primero sale un año después del primer dato."
        option={opcionGraficoZ(ctx, partida, etiquetas)}
        alto={420}
        cambioTipo={false}
      />
    </>
  );
};
