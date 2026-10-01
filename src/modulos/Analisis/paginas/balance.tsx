import { useMemo, useState, type ReactNode } from "react";
import { Button, Checkbox, Spin } from "antd";
import { AuditOutlined, BankOutlined, RiseOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import {
  CLASE_COLUMNA_ACTIVA,
  CeldaMoneda,
  CeldaSaldoVariacion,
  Delta,
  FilaKpis,
  KpiCard,
  TEXTO_GRAFICA,
  TablaAnalitica,
  TituloAyuda,
  useImpresion,
  useService,
  type ColumnaExcel,
} from "@idce/kit";
import { apiSeriesSistema } from "@/services/apiDatos";
import { aFilasSistema } from "@/services/adaptadores";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, useNombreDescarga } from "../componentes";
import { fechaCorta, fechaLarga, fmt, zoomRevista, type Dato } from "../datos";
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

type FilaPrincipal = (typeof PRINCIPALES)[number] & { d: Dato | null };

const ICONO_KPI: Record<string, ReactNode> = {
  "@1": <BankOutlined />,
  "@2": <AuditOutlined />,
  "@3": <SafetyCertificateOutlined />,
  Gan_Eje: <RiseOutlined />,
};

/** Variaciones de la revista (en %) a la fraccion que esperan las celdas del kit. */
const fraccion = (v: number) => v / 100;

/**
 * Hoja 1 — Balance General. Arriba, los principales resultados como KPIs; debajo, la tabla de
 * cuentas (saldo con variacion mensual y anual, `CeldaSaldoVariacion` del kit) enlazada con la
 * grafica comparativa: clic en una cuenta y la grafica muestra su año actual contra el anterior.
 * En el PDF no hay clic: salen las comparativas de Activo, Pasivo y Patrimonio.
 */
export const Hoja1 = () => {
  const { ctx, etiquetas } = useRevista();
  const impresion = useImpresion();
  const nombre = useNombreDescarga();
  const [activa, setActiva] = useState("@1");
  const filas: FilaPrincipal[] = PRINCIPALES.map((p) => ({ ...p, d: ctx.dato(p.code) })).filter((p) => p.d);
  const cuentaActiva = filas.find((f) => f.code === activa) ?? filas[0];

  const excel: ColumnaExcel<FilaPrincipal>[] = [
    { titulo: "Cuentas / Métricas", valor: (r) => r.name, ancho: 28 },
    { titulo: fechaCorta(ctx.anioAnterior), valor: (r) => r.d!.anioAnterior, ancho: 14 },
    { titulo: fechaCorta(ctx.mesAnterior), valor: (r) => r.d!.mesAnterior, ancho: 14 },
    { titulo: fechaCorta(ctx.fecha), valor: (r) => r.d!.actual, ancho: 14 },
    { titulo: "Variación Mensual", valor: (r) => r.d!.varMensual, formato: "porcentaje", ancho: 14 },
    { titulo: "Variación Anual", valor: (r) => r.d!.varAnual, formato: "porcentaje", ancho: 14 },
  ];

  const resaltar = (r: FilaPrincipal) => ({
    className: !impresion && r.code === cuentaActiva?.code ? CLASE_COLUMNA_ACTIVA : "",
  });

  const grafica = (code: string, titulo: string) => (
    <Grafica key={code} titulo={titulo} option={opcionComparativoAnual(ctx, code, etiquetas)} alto={impresion ? 260 : 340} />
  );

  return (
    <>
      <CabeceraPagina
        titulo="PANEL DE ANÁLISIS: PRINCIPALES CUENTAS DEL BALANCE GENERAL"
        subtitulo={`Análisis comparativo del Activo, Pasivo y Patrimonio · cifras en millones USD a ${fechaLarga(ctx.fecha)}`}
      />

      <FilaKpis columnas={4}>
        {filas
          .filter((f) => f.kpi)
          .map((f) => (
            <KpiCard
              key={f.code}
              titulo={f.kpi}
              icono={ICONO_KPI[f.code]}
              color={f.code === "Gan_Eje" ? (f.d!.actual >= 0 ? "bueno" : "malo") : f.code === "@3" ? "accion" : "monto"}
              valor={fmt(f.d!.actual)}
              sufijo="M USD"
              valorSecundario={<Delta valor={f.d!.varAnual} sufijo="%" etiqueta={`vs. ${fechaCorta(ctx.anioAnterior)}`} />}
              pie={<Delta valor={f.d!.varMensual} sufijo="%" etiqueta={`vs. ${fechaCorta(ctx.mesAnterior)}`} />}
            />
          ))}
      </FilaKpis>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="flex min-w-0 flex-col gap-2">
          <h3 className="m-0 text-cuerpo font-bold text-identidad">Cuentas principales</h3>
          {!impresion && (
            <p className="m-0 text-rotulo text-tinta-tenue">Haz clic en una cuenta para ver su comparativo anual.</p>
          )}
          <TablaAnalitica<FilaPrincipal>
            rowKey="code"
            pagination={false}
            dataSource={filas}
            excel={{ nombre, columnas: excel }}
            onRow={(r) => ({ onClick: () => setActiva(r.code), className: impresion ? "" : "cursor-pointer" })}
            columns={[
              {
                title: "Cuenta",
                dataIndex: "name",
                onCell: resaltar,
                render: (v: string, r) => (
                  <span className={`font-semibold ${r.code === cuentaActiva?.code && !impresion ? "text-accion" : "text-identidad"}`}>
                    {v}
                  </span>
                ),
              },
              { title: fechaCorta(ctx.anioAnterior), align: "right", onCell: resaltar, render: (_, r) => <CeldaMoneda valor={r.d!.anioAnterior} /> },
              { title: fechaCorta(ctx.mesAnterior), align: "right", onCell: resaltar, render: (_, r) => <CeldaMoneda valor={r.d!.mesAnterior} /> },
              {
                title: <TituloAyuda titulo={fechaCorta(ctx.fecha)} ayuda="Saldo del corte con su variación mensual (M) y anual (A)" />,
                align: "right",
                onCell: resaltar,
                render: (_, r) => (
                  <CeldaSaldoVariacion valor={r.d!.actual} mensual={fraccion(r.d!.varMensual)} anual={fraccion(r.d!.varAnual)} />
                ),
              },
            ]}
          />
        </section>

        {impresion ? null : (
          cuentaActiva && grafica(cuentaActiva.code, `Comparativo anual · ${cuentaActiva.name}`)
        )}
      </div>

      {impresion && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {grafica("@1", "Comparativo anual del Activo")}
          {grafica("@2", "Comparativo anual del Pasivo")}
          {grafica("@3", "Comparativo anual del Patrimonio")}
        </div>
      )}
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
      dataZoom: zoomRevista(ctx, 12),
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
          <div className="mb-2 flex flex-wrap gap-2 print:hidden">
            <Button size="small" onClick={() => setSectores(sectores)} disabled={!sectores.length || marcados.length === sectores.length}>
              Seleccionar todo
            </Button>
            <Button size="small" onClick={() => setSectores([])} disabled={!marcados.length}>
              Deseleccionar todo
            </Button>
          </div>
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
