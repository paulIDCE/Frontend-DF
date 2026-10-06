import { useMemo, useState } from "react";
import { Radio, Spin, Table } from "antd";
import { CLASE_COLUMNA_ACTIVA, KpiCard, TablaAnalitica, TituloAyuda, color, useService, type ColumnaExcel } from "@idce/kit";
import { archivoEntidad } from "@/services/datosService";
import { apiRanking } from "@/services/apiDatos";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, CeldaNumero, CeldaValor, Grafica, TituloBloque, useNombreDescarga } from "../componentes";
import type { UnidadCelda } from "../unidades";
import { legible } from "../texto";
import { TrophyOutlined } from "@ant-design/icons";
import { fechaCorta, fmt, pct, variacion } from "../datos";
import { COLOR_ENTIDAD, COLOR_GRUPO } from "../opciones";

/**
 * Rankings de entidades (hojas 5, 9, 24, 25, 26) — porte de `RANKING_CONFIGS`
 * y `renderRankingGenerico`: filtro por sector (Tamaño), nivel de activos o
 * provincia; tabla con participaciones, resumen de la entidad, posicion y
 * treemap de las 20 primeras.
 *
 * El ranking lo calcula la API (`GET /api/rankings`), con el filtro "Por
 * Provincia" ya corregido: el original comparaba `DPR_PA` (columna
 * inexistente) y terminaba mostrando todas las entidades.
 */

interface ConfigRanking {
  titulo: string;
  subtitulo: string;
  cuenta: string;
  nombre: string;
  resumen: { code: string; name: string }[];
}

type Filtro = "sector" | "activos" | "provincia";

const cargarRanking = (cuenta: string, fecha: string, agrupacion: Filtro, entidad: string) =>
  apiRanking({ cuenta, fecha, agrupacion, entidad: archivoEntidad(entidad) });

/** Unidad de las cuentas del resumen: morosidad en %, numero de operaciones, el resto montos. */
const unidadResumen = (code: string): UnidadCelda =>
  /^IF012/i.test(code) ? "%" : /^(ope_total|OPTPE)$/i.test(code) ? "numero" : "monto";

const PaginaRanking = ({ c }: { c: ConfigRanking }) => {
  const { ctx, entidad } = useRevista();
  const [filtro, setFiltro] = useState<Filtro>("sector");
  // `fechaComparacion` de la API es `ctx.anioAnterior` (fecha - 12 meses).
  const { data: respuesta, isLoading } = useService(
    cargarRanking,
    [c.cuenta, ctx.fecha, filtro, entidad],
    [],
    true,
    "No se pudo cargar el ranking"
  );

  const ranking = useMemo(
    () =>
      (respuesta?.filas ?? []).map((f) => ({
        entidad: f.nombre,
        anterior: f.anterior,
        actual: f.actual,
        partAnterior: f.participacionAnterior,
        partActual: f.participacionActual,
        posicion: f.posicion,
      })),
    [respuesta]
  );
  type FilaRanking = (typeof ranking)[number];
  const archivo = useNombreDescarga("ranking");
  const archivoResumen = useNombreDescarga("resumen");
  const excelRanking: ColumnaExcel<FilaRanking>[] = [
    { titulo: "Posición", valor: (r) => r.posicion, formato: "entero", ancho: 10 },
    { titulo: "Entidad", valor: (r) => r.entidad, ancho: 40 },
    { titulo: `${c.nombre} ${fechaCorta(ctx.anioAnterior)}`, valor: (r) => r.anterior, ancho: 18 },
    { titulo: `Part. ${fechaCorta(ctx.anioAnterior)}`, valor: (r) => r.partAnterior, formato: "porcentaje", ancho: 14 },
    { titulo: `${c.nombre} ${fechaCorta(ctx.fecha)}`, valor: (r) => r.actual, ancho: 18 },
    { titulo: `Part. ${fechaCorta(ctx.fecha)}`, valor: (r) => r.partActual, formato: "porcentaje", ancho: 14 },
  ];

  const resumen = c.resumen
    .filter((r) => ctx.fila(r.code))
    .map((r) => {
      const anterior = ctx.valor(r.code, ctx.anioAnterior);
      const actual = ctx.valor(r.code);
      return { ...r, anterior, actual, variacion: variacion(actual, anterior) };
    });
  type FilaResumen = (typeof resumen)[number];
  const excelResumen: ColumnaExcel<FilaResumen>[] = [
    { titulo: "Cuenta", valor: (r) => r.name, ancho: 28 },
    { titulo: fechaCorta(ctx.anioAnterior), valor: (r) => r.anterior, ancho: 14 },
    { titulo: fechaCorta(ctx.fecha), valor: (r) => r.actual, ancho: 14 },
    { titulo: "Variación", valor: (r) => r.variacion, formato: "porcentaje", ancho: 12 },
  ];

  const posicion = respuesta?.posicionEntidad ?? 0;
  const totales = respuesta?.total ?? { anterior: 0, actual: 0 };

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
        // La entidad de la revista en el color de la entidad; las demas, en el del grupo.
        data: ranking.slice(0, 20).map((r) => ({
          name: r.entidad,
          value: Number(r.partActual.toFixed(2)),
          itemStyle: { color: r.entidad === entidad ? COLOR_ENTIDAD : COLOR_GRUPO },
        })),
      },
    ],
  };

  const claseFila = (r: { posicion: number; entidad: string }) =>
    [
      r.entidad === entidad ? "font-semibold" : "",
    ].join(" ");

  return (
    <>
      <CabeceraPagina titulo={c.titulo} subtitulo={c.subtitulo} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col gap-3">
          <KpiCard
            titulo="Posición en el ranking"
            color="accion"
            icono={<TrophyOutlined />}
            valor={isLoading ? "…" : posicion || "-"}
            sufijo={respuesta ? `de ${respuesta.filas.length}` : ""}
            pie={<span className="text-rotulo text-tinta-tenue">{c.nombre.toLowerCase()} · {fechaCorta(ctx.fecha)}</span>}
          />
          <section className="rounded-tarjeta border border-linea bg-superficie p-3">
            <TituloBloque>Grupo del ranking</TituloBloque>
            <Radio.Group value={filtro} onChange={(e) => setFiltro(e.target.value)} className="flex flex-col gap-1">
              <Radio value="sector">Mismo sector</Radio>
              <Radio value="activos">Mismo nivel de activos</Radio>
              <Radio value="provincia">Misma provincia</Radio>
            </Radio.Group>
          </section>
          <section className="rounded-tarjeta border border-linea bg-superficie p-3">
            <TituloBloque>Resumen del cuadro</TituloBloque>
            <TablaAnalitica<FilaResumen>
              rowKey="code"
              size="small"
              pagination={false}
              dataSource={resumen}
              excel={{ nombre: archivoResumen, columnas: excelResumen }}
              columns={[
                { title: "Cuenta", render: (_, r) => <span className="font-semibold">{legible(r.name)}</span> },
                { title: fechaCorta(ctx.anioAnterior), align: "right", render: (_, r) => <CeldaNumero valor={r.anterior} unidad={unidadResumen(r.code)} /> },
                {
                  title: <TituloAyuda titulo={fechaCorta(ctx.fecha)} ayuda="Valor del corte con su variación anual (A)" />,
                  align: "right",
                  onCell: () => ({ className: CLASE_COLUMNA_ACTIVA }),
                  render: (_, r) => <CeldaValor code={r.code} unidad={unidadResumen(r.code)} valor={r.actual} anterior={r.anterior} />,
                },
              ]}
            />
          </section>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spin description="Cargando ranking..." size="large" />
          </div>
        ) : (
          <TablaAnalitica<FilaRanking>
            rowKey="entidad"
            size="small"
            bordered
            pagination={false}
            excel={{ nombre: archivo, columnas: excelRanking }}
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
                <Table.Summary.Cell index={3} align="right">{pct(100)}</Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">{fmt(totales.actual)}</Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">{pct(100)}</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            columns={[
              { title: "Posición", dataIndex: "posicion", width: 80, align: "center" },
              { title: "Entidad", dataIndex: "entidad" },
              { title: `${legible(c.nombre)} ${fechaCorta(ctx.anioAnterior)}`, align: "right", render: (_, r) => <CeldaNumero valor={r.anterior} /> },
              { title: `Part. ${fechaCorta(ctx.anioAnterior)}`, align: "right", render: (_, r) => <CeldaNumero valor={r.partAnterior} unidad="%" /> },
              {
                title: <TituloAyuda titulo={`${legible(c.nombre)} ${fechaCorta(ctx.fecha)}`} ayuda="Valor del corte con su variación anual (A)" />,
                align: "right",
                onCell: () => ({ className: CLASE_COLUMNA_ACTIVA }),
                render: (_, r) => <CeldaValor code={c.cuenta} unidad="monto" valor={r.actual} anterior={r.anterior} />,
              },
              {
                title: <TituloAyuda titulo={`Part. ${fechaCorta(ctx.fecha)}`} ayuda="Participación del corte con su cambio anual (A) en puntos" />,
                align: "right",
                onCell: () => ({ className: CLASE_COLUMNA_ACTIVA }),
                render: (_, r) => <CeldaValor code={c.cuenta} unidad="%" valor={r.partActual} anterior={r.partAnterior} />,
              },
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
