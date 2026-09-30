import { useMemo, useState } from "react";
import { Radio, Spin, Table } from "antd";
import { TablaAnalitica, color, useService } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica } from "../componentes";
import { claseVar } from "../estilos";
import { fechaCorta, fmt, variacion } from "../datos";
import { colorSerie } from "../opciones";
import { cargarResumenEntidades, valorEntidad } from "../resumenEntidades";

/**
 * Rankings de entidades (hojas 5, 9, 24, 25, 26) — porte de `RANKING_CONFIGS`
 * y `renderRankingGenerico`: filtro por sector (Tamaño), nivel de activos o
 * provincia; tabla con participaciones, resumen de la entidad, posicion y
 * treemap de las 20 primeras.
 *
 * Corrige el filtro "Por Provincia": el original comparaba `DPR_PA` (columna
 * inexistente) y terminaba mostrando todas las entidades; aqui usa `DPA_PR`.
 */

interface ConfigRanking {
  titulo: string;
  subtitulo: string;
  cuenta: string;
  nombre: string;
  resumen: { code: string; name: string }[];
}

type Filtro = "sector" | "activos" | "provincia";

const PaginaRanking = ({ c }: { c: ConfigRanking }) => {
  const { ctx, entidad, tamano, rango, provincia } = useRevista();
  const [filtro, setFiltro] = useState<Filtro>("sector");
  const { data: todas, isLoading } = useService(cargarResumenEntidades, [], [], true, "No se pudieron cargar las entidades");

  const ranking = useMemo(() => {
    if (!todas) return [];
    const ref = filtro === "sector" ? tamano : filtro === "activos" ? rango : provincia;
    const campo = filtro === "sector" ? "tamano" : filtro === "activos" ? "rango" : "provincia";
    const filas = todas
      .filter((e) => e[campo] === ref)
      .map((e) => ({
        entidad: e.nombre,
        anterior: valorEntidad(e, c.cuenta, ctx.anioAnterior),
        actual: valorEntidad(e, c.cuenta, ctx.fecha),
      }));
    const tAnt = filas.reduce((s, f) => s + f.anterior, 0);
    const tAct = filas.reduce((s, f) => s + f.actual, 0);
    return filas
      .map((f) => ({
        ...f,
        partAnterior: tAnt > 0 ? (f.anterior / tAnt) * 100 : 0,
        partActual: tAct > 0 ? (f.actual / tAct) * 100 : 0,
      }))
      .sort((a, b) => b.partActual - a.partActual)
      .map((f, i) => ({ ...f, posicion: i + 1 }));
  }, [todas, filtro, tamano, rango, provincia, c.cuenta, ctx]);

  const posicion = ranking.find((r) => r.entidad === entidad)?.posicion ?? 0;
  const totales = {
    anterior: ranking.reduce((s, f) => s + f.anterior, 0),
    actual: ranking.reduce((s, f) => s + f.actual, 0),
  };

  const podio = [color.advertencia.base, color.datos.eje, color.advertencia.activo];
  const treemap = {
    tooltip: {
      confine: true,
      formatter: (p: { name: string; value: number }) => {
        const r = ranking.find((x) => x.entidad === p.name);
        return `<strong>${p.name}</strong><br/>Participación: ${p.value}%<br/>${c.nombre}: ${fmt(r?.actual ?? 0)}<br/>${fechaCorta(ctx.fecha)}`;
      },
    },
    series: [
      {
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        width: "100%",
        height: "100%",
        itemStyle: { borderColor: color.superficie.base, borderWidth: 2, gapWidth: 2 },
        label: {
          show: true,
          formatter: (p: { name: string; value: number }) =>
            `${p.name.length > 22 ? `${p.name.slice(0, 22)}…` : p.name}\n${p.value}%`,
          color: color.tinta.inversa,
          fontWeight: "bold",
        },
        data: ranking.slice(0, 20).map((r, i) => ({
          name: r.entidad,
          value: Number(r.partActual.toFixed(2)),
          itemStyle: { color: i < 3 ? podio[i] : colorSerie(i - 3) },
        })),
      },
    ],
  };

  const claseFila = (r: { posicion: number; entidad: string }) =>
    [
      r.entidad === entidad ? "font-bold" : "",
      r.posicion <= 3 ? "text-advertencia-activo" : "",
    ].join(" ");

  return (
    <>
      <CabeceraPagina titulo={c.titulo} subtitulo={c.subtitulo} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col gap-3">
          <section className="rounded-tarjeta border border-linea bg-superficie p-3">
            <h4 className="m-0 mb-2 text-cuerpo font-bold text-identidad">Filtros Ranking</h4>
            <Radio.Group value={filtro} onChange={(e) => setFiltro(e.target.value)} className="flex flex-col gap-1">
              <Radio value="sector">Por Sector Financiero</Radio>
              <Radio value="activos">Por nivel de Activos</Radio>
              <Radio value="provincia">Por Provincia</Radio>
            </Radio.Group>
          </section>
          <section className="rounded-tarjeta border border-linea bg-superficie p-3">
            <h4 className="m-0 mb-2 text-cuerpo font-bold text-identidad">RESUMEN DEL CUADRO</h4>
            <table className="w-full text-detalle">
              <thead>
                <tr className="text-tinta-tenue">
                  <th className="text-left">Cuenta</th>
                  <th className="text-right">{fechaCorta(ctx.anioAnterior)}</th>
                  <th className="text-right">{fechaCorta(ctx.fecha)}</th>
                  <th className="text-right">Variación</th>
                </tr>
              </thead>
              <tbody>
                {c.resumen
                  .filter((r) => ctx.fila(r.code))
                  .map((r) => {
                    const a = ctx.valor(r.code, ctx.anioAnterior);
                    const v = ctx.valor(r.code);
                    const va = variacion(v, a);
                    return (
                      <tr key={r.code}>
                        <td className="font-bold">{r.name}</td>
                        <td className="text-right">{fmt(a)}</td>
                        <td className="text-right font-bold">{fmt(v)}</td>
                        <td className={`text-right ${claseVar(va)}`}>
                          {va.toFixed(1)}% {va > 0 ? "▲" : va < 0 ? "▼" : "─"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="mt-4 flex flex-col items-center rounded-tarjeta bg-identidad p-3 text-tinta-inversa">
              <span className="text-display font-extrabold">{isLoading ? "…" : posicion || "-"}</span>
              <span className="text-rotulo font-bold">POSICIÓN EN EL RANKING</span>
            </div>
          </section>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spin description="Cargando entidades (puede tardar la primera vez)..." size="large" />
          </div>
        ) : (
          <TablaAnalitica
            rowKey="entidad"
            size="small"
            bordered
            pagination={false}
            scroll={{ x: "max-content", y: 520 }}
            dataSource={ranking}
            rowClassName={claseFila}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>TOTAL</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">{fmt(totales.anterior)}</Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">100.00%</Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">{fmt(totales.actual)}</Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">100.00%</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            columns={[
              { title: "Posición", dataIndex: "posicion", width: 80, align: "center" },
              { title: "Entidad", dataIndex: "entidad" },
              { title: `${c.nombre} ${fechaCorta(ctx.anioAnterior)}`, align: "right", render: (_, r) => fmt(r.anterior) },
              { title: `Part. ${fechaCorta(ctx.anioAnterior)}`, align: "right", render: (_, r) => `${r.partAnterior.toFixed(2)}%` },
              { title: `${c.nombre} ${fechaCorta(ctx.fecha)}`, align: "right", render: (_, r) => fmt(r.actual) },
              { title: `Part. ${fechaCorta(ctx.fecha)}`, align: "right", render: (_, r) => `${r.partActual.toFixed(2)}%` },
            ]}
          />
        )}

        <Grafica
          titulo={`Distribución de Participación - ${fechaCorta(ctx.fecha)}`}
          option={ranking.length ? treemap : null}
          alto={560}
          cambioTipo={false}
          estadisticas={false}
        />
      </div>
    </>
  );
};

const RANKINGS: Record<string, ConfigRanking> = {
  activos: {
    titulo: "RANKING DE ENTIDADES FINANCIERAS POR ACTIVOS",
    subtitulo: "Comparativa de indicadores clave por entidad",
    cuenta: "@1",
    nombre: "ACTIVOS",
    resumen: [
      { code: "@1", name: "ACTIVOS" },
      { code: "IF007", name: "CARTERA VENCER" },
      { code: "SB010", name: "ACTIVOS PRODUCTIVOS" },
    ],
  },
  pasivo: {
    titulo: "RANKING DE ENTIDADES FINANCIERAS POR PASIVOS",
    subtitulo: "Comparativa de pasivos por entidad financiera",
    cuenta: "@2",
    nombre: "PASIVO",
    resumen: [
      { code: "@2", name: "PASIVO" },
      { code: "@21", name: "OBLIGACIONES PÚBLICO" },
      { code: "@2103", name: "DEPÓSITOS PLAZO" },
    ],
  },
  cartera: {
    titulo: "RANKING DE LAS ENTIDADES FINANCIERAS POR CARTERA DE CRÉDITOS",
    subtitulo: "Comparativa de la Cartera de Crédito por entidad financiera",
    cuenta: "@14",
    nombre: "CARTERA",
    resumen: [
      { code: "@14", name: "CARTERA NETA" },
      { code: "IF007", name: "CARTERA POR VENCER" },
      { code: "IF012", name: "MOROSIDAD" },
    ],
  },
  moa: {
    titulo: "RANKING DE LAS ENTIDADES FINANCIERAS POR MONTO DE OPERACIONES ACTIVAS",
    subtitulo: "Comparativa del MOA por entidad financiera",
    cuenta: "monto_total",
    nombre: "MOA",
    resumen: [
      { code: "monto_total", name: "MOA" },
      { code: "ope_total", name: "# OPERACIONES" },
      { code: "monto_pro", name: "PROMEDIO USD" },
    ],
  },
  mop: {
    // El original repetia el titulo de MOA en esta hoja.
    titulo: "RANKING DE LAS ENTIDADES FINANCIERAS POR MONTO DE OPERACIONES PASIVAS",
    subtitulo: "Comparativa del MOP por entidad financiera",
    cuenta: "mop",
    nombre: "MOP",
    resumen: [
      { code: "mop", name: "MOP" },
      { code: "OPTPE", name: "# OPERACIONES" },
      { code: "pro_MOP", name: "PROMEDIO USD" },
    ],
  },
};

export const Hoja5 = () => <PaginaRanking c={RANKINGS.activos} />;
export const Hoja9 = () => <PaginaRanking c={RANKINGS.pasivo} />;
export const Hoja24 = () => <PaginaRanking c={RANKINGS.cartera} />;
export const Hoja25 = () => <PaginaRanking c={RANKINGS.moa} />;
export const Hoja26 = () => <PaginaRanking c={RANKINGS.mop} />;
