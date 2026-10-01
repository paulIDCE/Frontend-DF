import { useMemo, useState, type ReactNode } from "react";
import { Checkbox, Segmented, Select, Spin, Tabs } from "antd";
import {
  FranjaSelectores,
  TEXTO_GRAFICA,
  TablaAnalitica,
  TabsAnaliticas,
  arbolPorNivel,
  color,
  conAlfa,
  showToast,
  useImpresion,
  useService,
  type ColumnaExcel,
} from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, useNombreDescarga } from "../componentes";
import { claseVar } from "../estilos";
import { crearCtx, fechaCorta, fechaLarga, fmt, type Ctx, type FilaReporte, zoomRevista } from "../datos";
import { colorSerie, opcionHistorico } from "../opciones";
import { cargarListaEntidades, cargarReporte } from "../resumenEntidades";
import type { CategoriaIndicadores, GraficoIndicador } from "./tiposIndicadores";
import { INDICADORES_27, INDICADORES_29, INDICADORES_30, INDICADORES_31 } from "./indicadoresConfig";
import { COMPLEMENTARIOS_27 } from "./indicadoresComplementarios";
import { PanelDiagnostico } from "../diagnostico/PanelDiagnostico";
import {
  NAVEGACION_27,
  NAVEGACION_29,
  NAVEGACION_30,
  NAVEGACION_31,
  type NavegacionIndicadores,
} from "./navegacionIndicadores";

/**
 * Hojas 27 (Indicadores Financieros), 28 (CAMELS - PERLAS), 29 (Evolución
 * CAMELS - PERLAS), 30 (Tasas de Interés) y 31 (Comparación entre entidades).
 */

/* ------------------------- Rejilla por categoria ------------------------- */

/** Tasa de equilibrio con bandas ±1SD / ±2SD (`renderHistoricoConBandasVolatilidad`). */
const opcionVolatilidad = (ctx: Ctx, g: GraficoIndicador, etiquetas: boolean) => {
  const por = (t: string) => g.series.find((s) => s.tipo === t);
  const principal = por("principal");
  const secundaria = por("secundaria");
  const banda = (sup: string, inf: string, nombre: string, alfa: number, z: number) => {
    const s = por(sup);
    const i = por(inf);
    if (!s || !i || !ctx.fila(s.code) || !ctx.fila(i.code)) return [];
    const c = color.datos.series[0];
    return [
      // Superior rellena hacia abajo; inferior "corta" con el fondo: queda la franja.
      { name: nombre, type: "line", data: ctx.serie(s.code), symbol: "none", z, lineStyle: { width: 1, type: "dashed", color: c }, color: c, areaStyle: { color: conAlfa(c, alfa) } },
      { name: "", type: "line", data: ctx.serie(i.code), symbol: "none", z: z + 1, lineStyle: { width: 1, type: "dashed", color: c }, color: c, areaStyle: { color: color.superficie.base, opacity: 1 } },
    ];
  };
  const linea = (s: typeof principal, c: string, tipo: "solid" | "dashed") =>
    s
      ? [
          {
            name: s.name,
            type: "line",
            data: ctx.serie(s.code),
            smooth: true,
            symbolSize: 6,
            z: 100,
            color: c,
            lineStyle: { width: 3, type: tipo },
            label: { show: etiquetas, position: "top", ...TEXTO_GRAFICA, formatter: (p: { value: number }) => `${fmt(p.value)}%` },
          },
        ]
      : [];
  return {
    tooltip: {
      trigger: "axis",
      confine: true,
      formatter: (ps: { seriesName: string; value: number; marker: string; name: string }[]) =>
        `<strong>${ps[0]?.name}</strong><br/>` +
        ps.filter((p) => p.seriesName).map((p) => `${p.marker}${p.seriesName}: <strong>${fmt(p.value)}%</strong>`).join("<br/>"),
    },
    legend: { bottom: 26, textStyle: TEXTO_GRAFICA, data: [principal?.name, secundaria?.name, "Banda ±1SD", "Banda ±2SD"].filter(Boolean) },
    grid: { left: 8, right: 16, top: 24, bottom: 70, containLabel: true },
    xAxis: { type: "category", data: ctx.fechas.map(fechaLarga), boundaryGap: false, axisLabel: { ...TEXTO_GRAFICA, rotate: 45 } },
    yAxis: { type: "value", name: "Tasa (%)", scale: true, nameTextStyle: TEXTO_GRAFICA, axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => fmt(v) } },
    dataZoom: zoomRevista(ctx, 12),
    series: [
      ...banda("2SD_superior", "2SD_inferior", "Banda ±2SD", 0.2, 1),
      ...banda("1SD_superior", "1SD_inferior", "Banda ±1SD", 0.35, 3),
      ...linea(principal, color.datos.series[7], "solid"),
      ...linea(secundaria, color.datos.series[0], "dashed"),
    ],
  };
};

interface ExtraSeries {
  /** Series de otras entidades para cada grafico (hoja 31). */
  adicionales?: { nombre: string; ctx: Ctx }[];
}

const opcionIndicador = (ctx: Ctx, g: GraficoIndicador, etiquetas: boolean, { adicionales = [] }: ExtraSeries) => {
  if (g.volatilidad) return opcionVolatilidad(ctx, g, etiquetas);
  const base = opcionHistorico(ctx, g.series.map((s) => ({ ...s, name: s.name ?? s.code })), etiquetas, { izq: g.eje, der: g.eje });
  if (!adicionales.length) return base;
  const tipos = ["solid", "dashed", "dotted"] as const;
  return {
    ...base,
    series: [
      ...base.series,
      ...adicionales.flatMap((a, i) =>
        g.series
          .filter((s) => a.ctx.fila(s.code))
          .map((s) => ({
            name: `${s.name ?? s.code} - ${a.nombre}`,
            type: "line",
            smooth: true,
            symbolSize: 4,
            // Alineadas a las fechas de la entidad principal.
            data: ctx.fechas.map((f) => a.ctx.valor(s.code, f)),
            color: colorSerie(i + 1),
            lineStyle: { width: 2, type: tipos[i % 3] },
            label: { show: etiquetas, position: "top", ...TEXTO_GRAFICA, formatter: (p: { value: number }) => fmt(p.value) },
          }))
      ),
    ],
  };
};

/** Rejilla de graficas de una categoria. */
const GraficasCategoria = ({ cat, extra, alto }: { cat: CategoriaIndicadores; extra?: ExtraSeries; alto: number }) => {
  const { ctx, etiquetas } = useRevista();
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {cat.graficos.map((g, i) => (
        <Grafica
          key={`${cat.key}-${i}`}
          titulo={g.titulo}
          nota={g.nota}
          option={opcionIndicador(ctx, g, etiquetas, extra ?? {})}
          alto={alto}
          cambioTipo={!g.volatilidad}
          base100={!g.volatilidad}
        />
      ))}
    </div>
  );
};

/**
 * Categorias de indicadores en dos niveles, con las piezas que el kit pide para esto
 * (`docs/VISTAS_ANALITICAS.md`): el grupo en un `Segmented` rotulado (`FranjaSelectores`) y la
 * categoria en `TabsAnaliticas` ("contenidos distintos, uno a la vez"). Reemplaza la tira de hasta
 * 11 botones en mayusculas del original. En el PDF salen todas las categorias, cada una con su titulo.
 */
const RejillaIndicadores = ({
  categorias,
  navegacion,
  extra,
  alto = 280,
  lateral,
}: {
  categorias: CategoriaIndicadores[];
  navegacion: NavegacionIndicadores;
  extra?: ExtraSeries;
  alto?: number;
  lateral?: ReactNode;
}) => {
  const impresion = useImpresion();
  const porKey = useMemo(() => new Map(categorias.map((c) => [c.key, c])), [categorias]);
  // Solo los items con categoria en la configuracion (y los grupos que queden con alguno).
  const grupos = useMemo(
    () =>
      navegacion.grupos
        .map((g) => ({ ...g, items: g.items.filter((i) => porKey.has(i.key)) }))
        .filter((g) => g.items.length > 0),
    [navegacion, porKey],
  );
  const [grupoKey, setGrupoKey] = useState(grupos[0]?.key);
  const grupo = grupos.find((g) => g.key === grupoKey) ?? grupos[0];
  const [elegidas, setElegidas] = useState<Record<string, string>>({});
  const activa = elegidas[grupo?.key ?? ""] ?? grupo?.items[0]?.key;

  if (!grupo) return null;

  const contenido = impresion ? (
    <div className="flex flex-col gap-4">
      {grupos.flatMap((g) =>
        g.items.map((item) => (
          <section key={`${g.key}-${item.key}`} className="flex flex-col gap-2">
            <h3 className="m-0 text-cuerpo font-bold text-identidad">
              {grupos.length > 1 ? `${g.titulo} · ` : ""}
              {item.titulo}
            </h3>
            <GraficasCategoria cat={porKey.get(item.key)!} extra={extra} alto={alto} />
          </section>
        )),
      )}
    </div>
  ) : (
    <div className="flex min-w-0 flex-col gap-2">
      {grupos.length > 1 && (
        <FranjaSelectores
          grupos={[
            {
              rotulo: navegacion.rotulo,
              control: (
                <Segmented
                  value={grupo.key}
                  onChange={(v) => setGrupoKey(String(v))}
                  options={grupos.map((g) => ({ value: g.key, label: `${g.titulo} (${g.items.length})` }))}
                />
              ),
            },
          ]}
        />
      )}
      <TabsAnaliticas
        key={grupo.key}
        activa={activa}
        onCambiar={(k) => setElegidas((e) => ({ ...e, [grupo.key]: k }))}
        pestanas={grupo.items.map((item) => ({
          key: item.key,
          titulo: item.titulo,
          contenido: <GraficasCategoria cat={porKey.get(item.key)!} extra={extra} alto={alto} />,
        }))}
      />
    </div>
  );

  return lateral ? (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
      {lateral}
      {contenido}
    </div>
  ) : (
    contenido
  );
};

const CATEGORIAS_27 = [...INDICADORES_27, ...COMPLEMENTARIOS_27];

export const Hoja27 = () => (
  <>
    <CabeceraPagina titulo="INDICADORES FINANCIEROS" subtitulo="Métricas clave de desempeño financiero" />
    <div className="mb-3">
      <PanelDiagnostico />
    </div>
    <RejillaIndicadores categorias={CATEGORIAS_27} navegacion={NAVEGACION_27} />
  </>
);

export const Hoja29 = () => (
  <>
    <CabeceraPagina titulo="INDICADORES FINANCIEROS CAMELS - PERLAS" subtitulo="Evolución del desempeño financiero" />
    <RejillaIndicadores categorias={INDICADORES_29} navegacion={NAVEGACION_29} />
  </>
);

export const Hoja30 = () => (
  <>
    <CabeceraPagina titulo="TASAS DE INTERÉS ACTIVAS Y PASIVAS" subtitulo="Evolución de las tasas de interés activas y pasivas" />
    <RejillaIndicadores categorias={INDICADORES_30} navegacion={NAVEGACION_30} alto={340} />
  </>
);

/* ------------------------------ Hoja 28 ------------------------------ */

const calificacion = (v: number) =>
  v >= 80
    ? { letra: "A", texto: "A - Excelente", clase: "bg-exito" }
    : v >= 60
      ? { letra: "B", texto: "B - Muy Bueno", clase: "bg-accion" }
      : v >= 50
        ? { letra: "C", texto: "C - Saludable", clase: "bg-advertencia" }
        : v >= 40
          ? { letra: "D", texto: "D - Regular", clase: "bg-pdf" }
          : { letra: "E", texto: "E - Alto Riesgo", clase: "bg-error" };

const LEYENDA = [
  ["A", "Excelente (≥80%)"],
  ["B", "Muy Bueno (60-79%)"],
  ["C", "Saludable (50-59%)"],
  ["D", "Regular (40-49%)"],
  ["E", "Alto Riesgo (<40%)"],
] as const;

type Indicador = [code: string, nombre: string, meta: string, nivel: 1 | 2];

const CAMELS: Indicador[] = [
  ["C_1", "COMPONENTE GLOBAL SUFICIENCIA PATRIMONIAL (C)", "-", 1],
  ["C1_capit_neta", "Capitalización Neta", "-", 2],
  ["C2_Cobertura", "Cobertura Patrimonial", "-", 2],
  ["C3", "Proporción de la cartera improductiva neta sobre capital regulatorio", "-", 2],
  ["A_1", "COMPONENTE GLOBAL CALIDAD DE ACTIVOS (A)", "-", 1],
  ["Porce_activ_impro", "Porcentaje de activos improductivos", "-", 2],
  ["A2_Inter_credi", "Intermediación Crediticia", "-", 2],
  ["A3_Calid_credi", "Calidad de Créditos", "-", 2],
  ["A4_Cober_credi", "Cobertura Crediticia", "-", 2],
  ["M_1", "COMPONENTE GLOBAL MANEJO ADMINISTRATIVO (M)", "-", 1],
  ["M1_Grado_absor_marge_finan", "Grado de absorción del margen financiero", "-", 2],
  ["Efici_opera", "Eficiencia Operativa", "-", 2],
  ["M3_des_estr", "Manejo Administrativo", "-", 2],
  ["E_1", "COMPONENTE GLOBAL RENTABILIDAD (E)", "-", 1],
  ["E1_ROA", "Rentabilidad sobre Activos (ROA)", "-", 2],
  ["E4_ROE", "Rentabilidad sobre Patrimonio (ROE)", "-", 2],
  ["Efici_negoc", "Eficiencia del negocio", "-", 2],
  ["E6_Margen_Spread", "Margen spread tasas", "-", 2],
  ["L_1", "COMPONENTE GLOBAL LIQUIDEZ (L)", "-", 1],
  ["Indic_liqui", "Índice de Liquidez", "-", 2],
  ["L2_moderado", "Índice de Liquidez ampliada", "-", 2],
  ["L3_severo", "Índice de Liquidez ajustado", "-", 2],
  ["L4_liquidez", "Porcentaje de activos líquidos", "-", 2],
  ["Tasa_inter_impli", "TASA DE INTERÉS IMPLICITA", "-", 1],
  ["Indic_CAMELS_1", "INDICADOR CAMELS", "-", 1],
  ["SOLVENCIA", "Patrimonio Técnico", "-", 1],
  ["IVF_Cuantitativo", "ÍNDICE DE VULNERABILIDAD FINANCIERA", "-", 1],
];

const PERLAS: Indicador[] = [
  ["efic_RA_AC", "RIESGO A (Riesgo Crítico)", "50%", 1],
  ["S_P1_acum", "Cobertura saldos morosos > 1 año", "100% Mínimo", 2],
  ["S_E9_acum", "Capital Institucional", "10% Mínimo", 2],
  ["S_L1_acum", "Liquidez", "15 - 20%", 2],
  ["S_A1_acum", "Morosidad", "5% Máximo", 2],
  ["S_A2_acum", "Activos Improductivos", "5% Máximo", 2],
  ["efic_RB_AC", "RIESGO B (Alto Riesgo)", "30%", 1],
  ["S_P2_acum", "Cobertura saldos morosos < 1 año", "35% Mínimo", 2],
  ["S_P6_acum", "Solvencia", "9% Mínimo", 2],
  ["S_E6_acum", "Endeudamiento Externo", "5% Máximo", 2],
  ["S_S2_acum", "Crecimiento inversiones", "16% Máximo", 2],
  ["S_R9_acum", "Gastos Operativos", "5% Máximo", 2],
  ["efic_RC_AC", "RIESGO C (Riesgo Medio)", "20%", 1],
  ["S_E1_acum", "Cartera de Créditos vs Activos", "70 - 80%", 2],
  ["S_E3_acum", "Inversiones Financieras", "12% Mínimo", 2],
  ["S_E5_acum", "Captaciones de Ahorro vs Activos", "70 - 80%", 2],
  ["S_E7_acum", "Aportaciones socios vs activos", "4% Mínimo", 2],
  ["S_S9_acum", "Crecimiento de Activos", "Mas que Inflación", 2],
  ["perlas_acumulado", "puntaje PERLAS alcanzado", "-", 1],
  ["efic_perlas_acum", "EFICIENCIA GLOBAL EN PERLAS", "-", 1],
];

type FilaIndicador = { code: string; nombre: string; meta: string; nivel: 1 | 2 };

/**
 * Tabla de indicadores: variaciones en puntos porcentuales (`renderTablaIndicadoresGenerico`). Los
 * indicadores de nivel 2 cuelgan del componente (nivel 1) anterior: arbol con expandir / contraer.
 */
const TablaIndicadores = ({ filas, nombre }: { filas: Indicador[]; nombre: string }) => {
  const { ctx } = useRevista();
  const archivo = useNombreDescarga(nombre);
  const datos = useMemo(
    () =>
      arbolPorNivel<FilaIndicador>(
        filas.filter(([code]) => ctx.fila(code)).map(([code, n, meta, nivel]) => ({ code, nombre: n, meta, nivel })),
        (r) => r.nivel,
      ),
    [filas, ctx],
  );
  const vm = (r: FilaIndicador) => ctx.valor(r.code) - ctx.valor(r.code, ctx.mesAnterior);
  const va = (r: FilaIndicador) => ctx.valor(r.code) - ctx.valor(r.code, ctx.anioAnterior);
  const excel: ColumnaExcel<FilaIndicador>[] = [
    { titulo: "Indicador", valor: (r) => r.nombre, ancho: 48 },
    { titulo: "Meta", valor: (r) => r.meta, ancho: 18 },
    { titulo: fechaCorta(ctx.anioAnterior), valor: (r) => ctx.valor(r.code, ctx.anioAnterior), ancho: 14 },
    { titulo: fechaCorta(ctx.mesAnterior), valor: (r) => ctx.valor(r.code, ctx.mesAnterior), ancho: 14 },
    { titulo: fechaCorta(ctx.fecha), valor: (r) => ctx.valor(r.code), ancho: 14 },
    { titulo: "Var. Mensual (pp)", valor: vm, ancho: 14 },
    { titulo: "Var. Anual (pp)", valor: va, ancho: 14 },
  ];
  const pp = (v: number) => (
    <span className={claseVar(v)}>
      {v.toFixed(2)} pp {v > 0 ? "▲" : v < 0 ? "▼" : "─"}
    </span>
  );
  return (
    <TablaAnalitica<FilaIndicador>
      rowKey="code"
      dataSource={datos}
      pagination={false}
      bordered
      arbol="expandido"
      excel={{ nombre: archivo, columnas: excel }}
      scroll={{ x: "max-content", y: 460 }}
      columns={[
        { title: "Indicador", render: (_, r) => <span className={r.nivel === 1 ? "font-bold text-identidad" : ""}>{r.nombre}</span> },
        { title: "Meta", render: (_, r) => r.meta },
        { title: fechaCorta(ctx.anioAnterior), align: "right", render: (_, r) => fmt(ctx.valor(r.code, ctx.anioAnterior)) },
        { title: fechaCorta(ctx.mesAnterior), align: "right", render: (_, r) => fmt(ctx.valor(r.code, ctx.mesAnterior)) },
        { title: fechaCorta(ctx.fecha), align: "right", render: (_, r) => <strong>{fmt(ctx.valor(r.code))}</strong> },
        { title: "Var. Mensual", align: "right", render: (_, r) => pp(vm(r)) },
        { title: "Var. Anual", align: "right", render: (_, r) => pp(va(r)) },
      ]}
    />
  );
};

const Calificaciones = ({ code, titulo, subtitulo, puntaje }: { code: string; titulo: string; subtitulo: string; puntaje?: string }) => {
  const { ctx } = useRevista();
  const cortes = [
    [ctx.fecha, "Actual"],
    [ctx.mesAnterior, "Mes anterior"],
    [ctx.anioAnterior, "Año anterior"],
  ];
  return (
    <section className="rounded-tarjeta border border-linea bg-superficie p-3">
      <h3 className="m-0 text-subtitulo font-bold text-identidad">{titulo}</h3>
      <p className="m-0 mb-3 text-detalle text-tinta-tenue">{subtitulo}</p>
      <div className="flex justify-around gap-2">
        {cortes.map(([f, rot]) => {
          const v = ctx.valor(code, f);
          const c = calificacion(v);
          return (
            <div key={f} className="flex flex-col items-center gap-1" title={c.texto}>
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-cifra font-extrabold text-tinta-inversa ${c.clase}`}>
                {c.letra}
              </div>
              <span className="text-rotulo text-tinta-tenue">
                {rot} · {fechaCorta(f)}
              </span>
              <span className="text-detalle font-semibold">{v.toFixed(2)}%</span>
              {puntaje && <span className="text-rotulo text-tinta-secundaria">Puntaje: {ctx.valor(puntaje, f).toFixed(2)}</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-rotulo text-tinta-secundaria">
        {LEYENDA.map(([l, t]) => (
          <span key={l} className="flex items-center gap-1">
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-tinta-inversa ${calificacion(l === "A" ? 80 : l === "B" ? 60 : l === "C" ? 50 : l === "D" ? 40 : 0).clase}`}>
              {l}
            </span>
            {t}
          </span>
        ))}
      </div>
    </section>
  );
};

export const Hoja28 = () => {
  const { ctx, etiquetas } = useRevista();
  return (
    <>
      <CabeceraPagina titulo="INDICADORES DE EVALUACIÓN" subtitulo="Sistema CAMELS y Metodología PERLAS" />
      <Tabs
        items={[
          {
            key: "camels",
            label: "CAMELS",
            children: (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <div className="flex flex-col gap-3">
                  {/* El original calificaba con `Indic_CAMELS_1` aunque el rotulo decia IVF. */}
                  <Calificaciones code="Indic_CAMELS_1" titulo="CALIFICACIÓN CAMELS" subtitulo="Basado en el Indicador CAMELS" />
                  <Grafica
                    titulo="EVOLUCIÓN HISTÓRICA CAMELS"
                    option={opcionHistorico(
                      ctx,
                      [
                        { code: "Indic_CAMELS_1", name: "Indicador CAMELS (%)" },
                        { code: "IVF_Cuantitativo", name: "Índice de Vulnerabilidad Financiera (%)" },
                      ],
                      etiquetas,
                      { izq: "porcentaje" }
                    )}
                    alto={300}
                  />
                </div>
                <TablaIndicadores filas={CAMELS} nombre="CAMELS" />
              </div>
            ),
          },
          {
            key: "perlas",
            label: "PERLAS",
            children: (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <div className="flex flex-col gap-3">
                  <Calificaciones code="efic_perlas_acum" titulo="CALIFICACIÓN PERLAS" subtitulo="Basado en Eficiencia Global PERLAS" puntaje="perlas_acumulado" />
                  <Grafica
                    titulo="EVOLUCIÓN HISTÓRICA PERLAS"
                    option={opcionHistorico(
                      ctx,
                      [
                        { code: "efic_perlas_acum", name: "Eficiencia PERLAS (%)", yAxisIndex: 0 },
                        { code: "efic_RA_AC", name: "Riesgo A (%)", yAxisIndex: 1 },
                        { code: "efic_RB_AC", name: "Riesgo B (%)", yAxisIndex: 1 },
                        { code: "efic_RC_AC", name: "Riesgo C (%)", yAxisIndex: 1 },
                      ],
                      etiquetas,
                      { izq: "%", der: "%" }
                    )}
                    alto={300}
                  />
                </div>
                <TablaIndicadores filas={PERLAS} nombre="PERLAS" />
              </div>
            ),
          },
        ]}
      />
    </>
  );
};

/* ------------------------------ Hoja 31 ------------------------------ */

const MAX_ADICIONALES = 3;

const cargarAdicional = async (nombre: string) => ({ nombre, filas: await cargarReporte(nombre) });

export const Hoja31 = () => {
  const { ctx, entidad } = useRevista();
  const { data: todas, isLoading } = useService(cargarListaEntidades, [], [], true, "No se pudieron cargar las entidades");
  const [filtros, setFiltros] = useState({ tamano: "todos", provincia: "todos", rango: "todos" });
  const [elegidas, setElegidas] = useState<{ nombre: string; filas: FilaReporte[] }[]>([]);

  const opciones = (campo: "tamano" | "provincia" | "rango") => [
    { value: "todos", label: "Todos" },
    ...[...new Set((todas ?? []).map((e) => e[campo]))].sort().map((v) => ({ value: v, label: v })),
  ];

  const candidatas = useMemo(
    () =>
      (todas ?? []).filter(
        (e) =>
          e.nombre !== entidad &&
          (filtros.tamano === "todos" || e.tamano === filtros.tamano) &&
          (filtros.provincia === "todos" || e.provincia === filtros.provincia) &&
          (filtros.rango === "todos" || e.rango === filtros.rango)
      ),
    [todas, filtros, entidad]
  );

  const adicionales = useMemo(() => elegidas.map((e) => ({ nombre: e.nombre, ctx: crearCtx(e.filas, ctx.fecha) })), [elegidas, ctx.fecha]);

  const alternar = async (nombre: string, marcar: boolean) => {
    if (!marcar) {
      setElegidas((l) => l.filter((e) => e.nombre !== nombre));
      showToast.info(`${nombre} removida de la comparación`);
      return;
    }
    if (elegidas.length >= MAX_ADICIONALES) {
      showToast.warning("Solo puede seleccionar hasta 3 entidades adicionales");
      return;
    }
    try {
      const e = await cargarAdicional(nombre);
      setElegidas((l) => (l.some((x) => x.nombre === nombre) ? l : [...l, e]));
      showToast.success(`${nombre} agregada para comparación`);
    } catch {
      showToast.error(`No se pudo cargar ${nombre}`);
    }
  };

  const filtro = (campo: "tamano" | "provincia" | "rango", etiqueta: string) => (
    <label className="flex flex-col gap-1 text-detalle font-semibold text-tinta-secundaria">
      {etiqueta}
      <Select
        size="small"
        value={filtros[campo]}
        options={opciones(campo)}
        onChange={(v: string) => setFiltros((f) => ({ ...f, [campo]: v }))}
        popupMatchSelectWidth={false}
      />
    </label>
  );

  const lateral = (
    <aside className="flex flex-col gap-3 rounded-tarjeta border border-linea bg-superficie p-3">
      <h4 className="m-0 text-cuerpo font-bold text-identidad">Filtros de Búsqueda para Comparación</h4>
      {filtro("tamano", "Tamaño/Segmento")}
      {filtro("provincia", "Provincia")}
      {filtro("rango", "Nivel de Activos")}
      <div className="text-detalle font-semibold text-tinta-secundaria">
        Entidades adicionales ({elegidas.length}/{MAX_ADICIONALES}):
      </div>
      {isLoading ? (
        <Spin size="small" />
      ) : candidatas.length === 0 ? (
        <p className="m-0 text-detalle italic text-tinta-tenue">No hay entidades disponibles con estos filtros</p>
      ) : (
        <div className="flex max-h-[420px] flex-col gap-1 overflow-auto">
          {candidatas.map((e) => {
            const marcada = elegidas.some((x) => x.nombre === e.nombre);
            return (
              <Checkbox
                key={e.nombre}
                checked={marcada}
                disabled={!marcada && elegidas.length >= MAX_ADICIONALES}
                onChange={(ev) => alternar(e.nombre, ev.target.checked)}
              >
                <span className="text-detalle">{e.nombre}</span>
              </Checkbox>
            );
          })}
        </div>
      )}
    </aside>
  );

  return (
    <>
      <CabeceraPagina titulo="COMPARATIVO CON OTRAS ENTIDADES FINANCIERAS" subtitulo="Análisis comparativo de indicadores clave" />
      <RejillaIndicadores categorias={INDICADORES_31} navegacion={NAVEGACION_31} extra={{ adicionales }} lateral={lateral} />
    </>
  );
};
