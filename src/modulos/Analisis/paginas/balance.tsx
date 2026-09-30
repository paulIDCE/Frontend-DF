import { useMemo } from "react";
import { Checkbox, Spin } from "antd";
import { FallOutlined, MinusOutlined, RiseOutlined } from "@ant-design/icons";
import { TEXTO_GRAFICA, TablaAnalitica, inicioZoom, useService, zoomTemporal } from "@idce/kit";
import { apiSeriesSistema } from "@/services/apiDatos";
import { aFilasSistema } from "@/services/adaptadores";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica } from "../componentes";
import { claseVar } from "../estilos";
import { fechaCorta, fechaLarga, fmt, pct } from "../datos";
import { colorSerie, opcionComparativoAnual } from "../opciones";

/** Hojas 1 (Balance General) y 2 (Evolución Histórica). */

const PRINCIPALES = [
  { code: "@1", name: "ACTIVO", kpi: "Activo" },
  { code: "@2", name: "PASIVO", kpi: "Pasivo" },
  { code: "@3", name: "PATRIMONIO", kpi: "Patrimonio" },
  { code: "@5", name: "INGRESOS" },
  { code: "@4", name: "GASTOS" },
  { code: "Gan_Eje", name: "GANANCIAS", kpi: "Ganancias" },
];

const Flecha = ({ v }: { v: number }) =>
  v > 0 ? <RiseOutlined className="text-exito" /> : v < 0 ? <FallOutlined className="text-error" /> : <MinusOutlined className="text-tinta-deshabilitada" />;

export const Hoja1 = () => {
  const { ctx, etiquetas } = useRevista();
  const filas = PRINCIPALES.map((p) => ({ ...p, d: ctx.dato(p.code) })).filter((p) => p.d);

  return (
    <>
      <CabeceraPagina
        titulo="PANEL DE ANÁLISIS: PRINCIPALES CUENTAS DEL BALANCE GENERAL"
        subtitulo="Análisis Comparativo del Activo, Pasivo y Patrimonio"
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="rounded-contenedor bg-identidad p-4 text-tinta-inversa">
          <h3 className="m-0 mb-3 text-subtitulo font-bold">Principales resultados</h3>
          <div className="flex flex-col gap-3">
            {filas
              .filter((f) => f.kpi)
              .map((f) => (
                <div key={f.code} className="rounded-tarjeta bg-superficie p-3 text-tinta">
                  <div className="text-rotulo font-bold uppercase text-tinta-secundaria">{f.kpi}</div>
                  <div className="text-cifra font-extrabold text-identidad">{fmt(f.d!.actual)}</div>
                  <div className={`text-detalle font-semibold ${claseVar(f.d!.varAnual)}`}>
                    {f.d!.varAnual >= 0 ? "+" : ""}
                    {pct(f.d!.varAnual)}
                  </div>
                </div>
              ))}
          </div>
        </section>
        <TablaAnalitica
          rowKey="code"
          pagination={false}
          bordered
          dataSource={filas}
          columns={[
            { title: "Cuentas / Métricas", dataIndex: "name", render: (v) => <strong>{v}</strong> },
            { title: fechaCorta(ctx.anioAnterior), align: "right", render: (_, r) => fmt(r.d!.anioAnterior) },
            { title: fechaCorta(ctx.mesAnterior), align: "right", render: (_, r) => fmt(r.d!.mesAnterior) },
            {
              title: fechaCorta(ctx.fecha),
              align: "right",
              render: (_, r) => <strong className="text-identidad">{fmt(r.d!.actual)}</strong>,
            },
            {
              title: "Variación Mensual",
              align: "right",
              render: (_, r) => (
                <span className="flex items-center justify-end gap-1">
                  {pct(r.d!.varMensual)} <Flecha v={r.d!.varMensual} />
                </span>
              ),
            },
            {
              title: "Variación Anual",
              align: "right",
              render: (_, r) => (
                <span className="flex items-center justify-end gap-1">
                  {pct(r.d!.varAnual)} <Flecha v={r.d!.varAnual} />
                </span>
              ),
            },
          ]}
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {[
          ["@1", "Análisis Comparativo del Activo"],
          ["@2", "Análisis Comparativo del Pasivo"],
          ["@3", "Análisis Comparativo del Patrimonio"],
        ].map(([code, titulo]) => (
          <Grafica key={code} titulo={titulo} option={opcionComparativoAnual(ctx, code, etiquetas)} alto={300} />
        ))}
      </div>
    </>
  );
};

/* ---------------------------- Hoja 2 ---------------------------- */

/** Solo las cuentas y cuadros que usa la hoja (unos KB; antes, base_estru_sistema completo: 13 MB). */
const cargarSectores = async () =>
  aFilasSistema(await apiSeriesSistema(["@1", "@2", "@3", "Gan_Eje"], ["SFN01", "SFN02"]));

const HISTORICOS = [
  { code: "@1", titulo: "Evolución histórica de Activo" },
  { code: "@2", titulo: "Evolución histórica de Pasivo" },
  { code: "@3", titulo: "Evolución histórica de Patrimonio" },
  { code: "Gan_Eje", titulo: "Evolución histórica de Ganancias" },
];

export const Hoja2 = () => {
  const { ctx, etiquetas, sectores: marcados, setSectores } = useRevista();
  const { data: sistema, isLoading } = useService(cargarSectores, [], [], true, "No se pudieron cargar los sectores");

  // La API ya devuelve solo SFN01/SFN02.
  const filasSfn = useMemo(() => sistema ?? [], [sistema]);
  const sectores = useMemo(() => [...new Set(filasSfn.map((f) => f.Filtro).filter(Boolean))] as string[], [filasSfn]);

  const alternar = (s: string, v: boolean) => setSectores(v ? [...marcados, s] : marcados.filter((x) => x !== s));

  const opcion = (code: string) => {
    const series = [
      { name: "Entidad Actual", data: ctx.serie(code) },
      ...marcados.map((s) => {
        const f = filasSfn.find((r) => r.Filtro === s && r.CUC === code);
        return { name: s, data: ctx.fechas.map((d) => (f ? parseFloat(String(f[d])) || 0 : 0)) };
      }),
    ];
    return {
      tooltip: { trigger: "axis", confine: true, valueFormatter: (v: number) => fmt(v) },
      legend: { type: "scroll", bottom: 26, textStyle: TEXTO_GRAFICA },
      grid: { left: 8, right: 16, top: 24, bottom: 80, containLabel: true },
      xAxis: {
        type: "category",
        data: ctx.fechas.map(fechaLarga),
        boundaryGap: false,
        axisLabel: { ...TEXTO_GRAFICA, rotate: 45 },
      },
      yAxis: { type: "value", axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => fmt(v) } },
      dataZoom: zoomTemporal(inicioZoom(ctx.fechas.length, 12)),
      series: series.map((s, i) => ({
        ...s,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        color: colorSerie(i),
        lineStyle: { width: i === 0 ? 3 : 2 },
        areaStyle: { opacity: i === 0 ? 0.15 : 0.05 },
        label: { show: etiquetas, position: "top", ...TEXTO_GRAFICA, formatter: (p: { value: number }) => fmt(p.value) },
      })),
    };
  };

  return (
    <>
      <CabeceraPagina
        titulo="Evolución Histórica de Cuentas Clave"
        subtitulo="Tendencias de los últimos 12 meses y comparativas sectoriales"
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-tarjeta border border-linea bg-superficie p-3">
          <h3 className="m-0 mb-2 text-cuerpo font-bold text-identidad">Series a graficar:</h3>
          {isLoading ? (
            <Spin />
          ) : (
            <div className="flex flex-col gap-1">
              {sectores.map((s) => (
                <Checkbox key={s} checked={marcados.includes(s)} onChange={(e) => alternar(s, e.target.checked)}>
                  <span className="text-detalle">{s}</span>
                </Checkbox>
              ))}
            </div>
          )}
        </aside>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {HISTORICOS.map((h) => (
            <Grafica key={h.code} titulo={h.titulo} option={opcion(h.code)} alto={320} />
          ))}
        </div>
      </div>
    </>
  );
};
