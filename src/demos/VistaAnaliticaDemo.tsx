import { useEffect, useMemo, useState } from "react";
import { Button, InputNumber, Segmented, Switch, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AlertOutlined,
  AppstoreOutlined,
  BankOutlined,
  LineChartOutlined,
  PercentageOutlined,
  SafetyOutlined,
  TableOutlined,
} from "@ant-design/icons";
import {
  KpiCard,
  ExcelButton,
  EstadoError,
  AlternarTablaGrafica,
  BarraFiltros,
  CeldaMoneda,
  CeldaNivel,
  CeldaSaldoVariacion,
  COLOR_KPI,
  COLOR_SIN_DATOS,
  TEXTO_GRAFICA,
  CLASE_COLUMNA_ACTIVA,
  Delta,
  FilaKpis,
  FiltroCatalogo,
  PanelAcoplado,
  PantallaInicial,
  SelectorColumnas,
  SelectorRangoCortes,
  TablaAnalitica,
  TabsAnaliticas,
  TarjetaGrafica,
  TituloAyuda,
  VistaAnalitica,
  colorLegible,
  exportarExcel,
  fmtEntero,
  fmtFechaID,
  fmtMonedaCorta,
  fmtPct,
  franjasNiveles,
  maximoEjeConNiveles,
  nivelDe,
  primerError,
  punto,
  resultadoValidacion,
  tooltipTemporal,
  useColumnasVisibles,
  useFiltrosBorrador,
  validarCatalogoCortes,
  validarEntero,
  validarRangoCortes,
  zoomTemporal,
  type ColumnaElegible,
  type ColumnaExcel,
  type OpcionFiltro,
  type PuntoTemporal,
  describirError,
  type ErrorPresentable,
} from "@idce/kit";
import {
  MOCK_CATALOGO_OFICINAS,
  MOCK_CORTES,
  MOCK_NIVELES,
  MOCK_OFICINAS,
  MOCK_OPCIONES_CORTE,
} from "@/mocks/analitica";
import type { CorteMock, OficinaMock } from "@/mocks/analitica";

/**
 * Vista analitica completa con datos mock: la plantilla a copiar para una vista nueva
 * (ver `docs/VISTAS_ANALITICAS.md`).
 *
 * Estandar de filtros: el **borrador** es lo que el usuario edita y el **aplicado** lo ultimo
 * consultado. Nada se consulta hasta pulsar Filtrar, y las consultas corren en un
 * `useEffect([aplicado])` con argumentos explicitos.
 */

type Opcionales = { oficina: OpcionFiltro | null };

interface Borrador {
  fechaInicioID: number;
  fechaCorteID: number;
  diasMora: number | null;
  opcionales: Opcionales;
}

interface Aplicado extends Omit<Borrador, "diasMora"> {
  diasMora: number;
}

interface Datos {
  cortes: CorteMock[];
  oficinas: (OficinaMock & { _clave: string })[];
}

type ParamsPunto = { data: PuntoTemporal };

const IDS_CORTE = MOCK_CORTES.map((c) => c.fechaCorteID);
const OPCIONALES_VACIOS: Opcionales = { oficina: null };

const BORRADOR_INICIAL: Borrador = {
  fechaInicioID: IDS_CORTE[IDS_CORTE.length - 12],
  fechaCorteID: IDS_CORTE[IDS_CORTE.length - 1],
  diasMora: 30,
  opcionales: OPCIONALES_VACIOS,
};

/** Orden de los campos en la barra: decide que error se muestra primero. */
const ORDEN_CAMPOS = ["fechas", "diasMora"];

/** Reglas de la vista. Funcion pura: se puede probar sin montar nada. */
const validar = (b: Borrador) => {
  const rango = validarRangoCortes(b.fechaInicioID, b.fechaCorteID, IDS_CORTE);
  return resultadoValidacion(
    {
      general: validarCatalogoCortes(IDS_CORTE),
      fechas: rango.error,
      diasMora: validarEntero(b.diasMora, { nombre: "los días de mora", min: 0, max: 999 }),
    },
    rango.avisos,
  );
};

/** Simula el fallo de un backend con el contrato de `utils/apiError`. */
const ERROR_SIMULADO: ErrorPresentable = describirError(
  {
    response: {
      status: 500,
      data: { errorCode: "SQL_ERROR", message: "No se pudo obtener la cartera por oficina.", traceId: "0HN7-DEMO-4F2A" },
    },
  },
  "No se pudo obtener la cartera por oficina.",
);

/** Hace las veces del servicio: en una vista real esto vive en el hook `use<Vista>`. */
const consultar = (aplicado: Aplicado): Promise<Datos> =>
  new Promise((resolver) =>
    setTimeout(
      () =>
        resolver({
          cortes: MOCK_CORTES.filter(
            (c) => c.fechaCorteID >= aplicado.fechaInicioID && c.fechaCorteID <= aplicado.fechaCorteID,
          ),
          oficinas: MOCK_OFICINAS.filter((o) => !aplicado.opcionales.oficina || o.oficinaID === aplicado.opcionales.oficina.id)
            // rowKey estable, nunca el indice.
            .map((o) => ({ ...o, _clave: `oficina-${o.oficinaID}` })),
        }),
      700,
    ),
  );

const COLUMNAS_ELEGIBLES: ColumnaElegible[] = [
  { key: "saldo", titulo: "Saldo" },
  { key: "mora", titulo: "Mora" },
  { key: "cobertura", titulo: "Cobertura" },
  { key: "operaciones", titulo: "Operaciones" },
];

const COLUMNAS_EXCEL: ColumnaExcel<OficinaMock>[] = [
  { titulo: "Oficina", valor: (o) => o.nombre, ancho: 24 },
  { titulo: "Saldo", valor: (o) => o.saldo, formato: "moneda", ancho: 20 },
  { titulo: "Mora (%)", valor: (o) => o.mora, formato: "porcentaje" },
  { titulo: "Cobertura (%)", valor: (o) => o.cobertura, formato: "porcentaje" },
  { titulo: "Operaciones", valor: (o) => o.operaciones, formato: "entero" },
];

const opcionesMora = (cortes: CorteMock[]) => {
  const puntos = cortes.map((c) => punto(`${c.fechaCorte}T12:00:00`, c.mora));
  return {
    grid: { left: 44, right: 60, top: 16, bottom: 40 },
    tooltip: tooltipTemporal((item: ParamsPunto) => fmtPct(item.data[1])),
    xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
    yAxis: {
      type: "value",
      max: maximoEjeConNiveles(puntos.map((p) => p[1]), MOCK_NIVELES),
      axisLabel: { formatter: "{value}%", ...TEXTO_GRAFICA },
    },
    dataZoom: zoomTemporal(0, { conSlider: puntos.length > 12 }),
    series: [
      {
        name: "Mora",
        type: "line",
        unitType: "percent",
        data: puntos,
        smooth: true,
        lineStyle: { width: 2.5 },
        endLabel: { show: true, formatter: (p: ParamsPunto) => fmtPct(p.data[1]) },
        ...franjasNiveles(MOCK_NIVELES, { conEtiquetas: false }),
      },
    ],
  };
};

const opcionesSaldo = (cortes: CorteMock[]) => ({
  grid: { left: 56, right: 16, top: 16, bottom: 40 },
  tooltip: tooltipTemporal((item: ParamsPunto) => fmtMonedaCorta(item.data[1])),
  xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
  yAxis: { type: "value", scale: true, axisLabel: { formatter: (v: number) => fmtMonedaCorta(v), ...TEXTO_GRAFICA } },
  series: [
    {
      name: "Saldo",
      type: "bar",
      unitType: "money",
      data: cortes.map((c) => punto(`${c.fechaCorte}T12:00:00`, Math.round(c.saldo))),
    },
  ],
});

/** Mora de una oficina en un corte: la de la oficina movida con la tendencia de la cartera. */
const moraOficinaCorte = (oficina: OficinaMock, corte: CorteMock, i: number) =>
  Math.max(0, Number((oficina.mora + (corte.mora - 4.2) * 0.6 + Math.sin(i + oficina.oficinaID) * 0.3).toFixed(2)));

const FILAS_MATRIZ = MOCK_CORTES.map((c, i) => ({ ...c, _i: i })).reverse();

/** Matriz cortes × oficinas: la tabla densa protagonista que se acopla bajo la barra. */
const columnasMatriz: ColumnsType<CorteMock & { _i: number }> = [
  { key: "corte", title: "Corte", fixed: "left", width: 96, render: (_, c) => fmtFechaID(c.fechaCorteID, "MMM-yyyy") },
  ...MOCK_OFICINAS.map((o) => ({
    key: String(o.oficinaID),
    title: o.nombre,
    align: "center" as const,
    render: (_: unknown, c: CorteMock & { _i: number }) => (
      <CeldaNivel valor={moraOficinaCorte(o, c, c._i)} niveles={MOCK_NIVELES} />
    ),
  })),
];

const LeyendaNiveles = () => (
  <div className="flex items-center gap-3 flex-wrap text-rotulo text-tinta-tenue">
    <span>Baja con la rueda sobre la matriz: la página sube hasta la barra y después la matriz hace scroll por dentro.</span>
    {MOCK_NIVELES.map((n) => (
      <span key={n.nivelRiesgoID} className="flex items-center gap-1">
        <span className="inline-block w-2.5 h-2.5 rounded-marca" style={{ backgroundColor: n.color }} />
        {n.nombre}
      </span>
    ))}
  </div>
);

const Kpis = ({ datos }: { datos: Datos | null }) => {
  if (!datos) return <FilaKpis cargando />;
  const ultimo = datos.cortes[datos.cortes.length - 1];
  const anterior = datos.cortes[datos.cortes.length - 2];
  const nivel = nivelDe(ultimo?.mora, MOCK_NIVELES);
  const colorMora = colorLegible(nivel?.color);
  return (
    <FilaKpis>
      <KpiCard
        titulo="Saldo de cartera"
        valor={fmtMonedaCorta(ultimo?.saldo)}
        color={COLOR_KPI.monto}
        icono={<BankOutlined />}
        valorSecundario={
          <Delta
            valor={anterior ? ((ultimo.saldo - anterior.saldo) / anterior.saldo) * 100 : null}
            sufijo="%"
            etiqueta="vs. corte anterior"
          />
        }
        pie={`Corte ${fmtFechaID(ultimo?.fechaCorteID, "MMM-yyyy")}`}
      />
      <KpiCard
        titulo="Índice de mora"
        ayuda="Cartera vencida / cartera total"
        valor={fmtPct(ultimo?.mora)}
        color={colorMora}
        icono={<PercentageOutlined />}
        valorSecundario={
          <Delta valor={anterior ? ultimo.mora - anterior.mora : null} sufijo=" pp" etiqueta="vs. corte anterior" subirEsMalo />
        }
        pie={nivel ? `Nivel ${nivel.nombre}` : "Sin nivel"}
      />
      <KpiCard
        titulo="Cobertura"
        valor={fmtPct(ultimo?.cobertura)}
        color={(ultimo?.cobertura ?? 0) >= 100 ? COLOR_KPI.bueno : COLOR_KPI.malo}
        icono={<SafetyOutlined />}
        valorSecundario={
          <Delta valor={anterior ? ultimo.cobertura - anterior.cobertura : null} sufijo=" pp" etiqueta="vs. corte anterior" />
        }
        pie="Meta: 100 %"
      />
      <KpiCard
        titulo="Oficinas en riesgo alto"
        valor={datos.oficinas.filter((o) => o.mora >= 5).length}
        sufijo={`de ${datos.oficinas.length}`}
        color={COLOR_KPI.riesgo}
        icono={<AlertOutlined />}
        etiquetaSecundaria="mora ≥ 5 %"
        pie="Según los filtros aplicados"
      />
    </FilaKpis>
  );
};

const VistaAnaliticaDemo = () => {
  const filtros = useFiltrosBorrador<Borrador, Aplicado, Opcionales>({
    inicial: BORRADOR_INICIAL,
    opcionalesVacios: OPCIONALES_VACIOS,
    validar,
    aAplicado: (b) => ({ ...b, diasMora: b.diasMora ?? 0 }),
  });
  const { borrador, aplicado, validacion } = filtros;

  // Cada resultado recuerda con que filtros se obtuvo: "consultando" se deriva de ahi en lugar de
  // guardarse en otro estado (que obligaria a un setState sincrono dentro del efecto).
  const [resultado, setResultado] = useState<{ filtros: Aplicado; datos: Datos } | null>(null);
  const datos = resultado?.datos ?? null;
  const consultando = !!aplicado && resultado?.filtros !== aplicado;
  const [simularFallo, setSimularFallo] = useState(false);
  const [tipo, setTipo] = useState<"Normal" | "Ajustada">("Normal");
  const [vistaOficinas, setVistaOficinas] = useState<"Tabla" | "Gráfica">("Tabla");
  // Controlada: "Ver por oficina" (pestaña Evolución) cambia de pestaña desde fuera.
  const [pestana, setPestana] = useState("evolucion");
  const { visibles, setVisibles, esVisible } = useColumnasVisibles(COLUMNAS_ELEGIBLES, ["operaciones"]);

  // Consultas: solo cuando cambia lo aplicado, con argumentos explicitos.
  useEffect(() => {
    if (!aplicado) return;
    let vigente = true;
    consultar(aplicado).then((nuevos) => {
      if (vigente) setResultado({ filtros: aplicado, datos: nuevos });
    });
    return () => {
      vigente = false;
    };
  }, [aplicado]);

  const errorFechas = validacion.errores.fechas;
  const chips = aplicado?.opcionales.oficina
    ? [{ clave: "oficina", texto: `Oficina: ${aplicado.opcionales.oficina.nombre}` }]
    : [];

  const columnas = useMemo<ColumnsType<Datos["oficinas"][number]>>(
    () =>
      [
        { key: "nombre", title: "Oficina", dataIndex: "nombre", fixed: "left" as const, width: 170 },
        {
          key: "saldo",
          title: <TituloAyuda titulo="Saldo" ayuda="Variación mensual (M) y anual (A)" />,
          align: "right" as const,
          render: (_: unknown, o: OficinaMock) => (
            <CeldaSaldoVariacion valor={o.saldo} mensual={o.variacionMensual} anual={o.variacionAnual} />
          ),
        },
        {
          key: "mora",
          title: <TituloAyuda titulo="Mora" ayuda="Coloreada según el nivel de riesgo" />,
          align: "center" as const,
          className: CLASE_COLUMNA_ACTIVA,
          render: (_: unknown, o: OficinaMock) => <CeldaNivel valor={o.mora} niveles={MOCK_NIVELES} />,
        },
        {
          key: "cobertura",
          title: "Cobertura",
          align: "right" as const,
          render: (_: unknown, o: OficinaMock) => (
            <span className={o.cobertura < 100 ? "text-error font-semibold" : ""}>{fmtPct(o.cobertura)}</span>
          ),
        },
        {
          key: "operaciones",
          title: "Operaciones",
          align: "right" as const,
          render: (_: unknown, o: OficinaMock) => fmtEntero(o.operaciones),
        },
      ].filter((c) => c.key === "nombre" || esVisible(c.key)),
    [esVisible],
  );

  const barra = (
    <BarraFiltros
      titulo="Cartera por oficina"
      controles={(filtrar) => (
        <>
          <SelectorRangoCortes
            opciones={MOCK_OPCIONES_CORTE}
            desde={borrador.fechaInicioID}
            hasta={borrador.fechaCorteID}
            onCambiarDesde={(fechaInicioID) => filtros.actualizarBorrador({ fechaInicioID })}
            onCambiarHasta={(fechaCorteID) => filtros.actualizarBorrador({ fechaCorteID })}
            conError={!!errorFechas}
          />
          <InputNumber
            prefix={<span className="text-tinta-tenue text-detalle">Días mora</span>}
            value={borrador.diasMora}
            status={validacion.errores.diasMora ? "error" : undefined}
            onChange={(diasMora) => filtros.actualizarBorrador({ diasMora })}
            onPressEnter={filtrar}
            style={{ width: 140 }}
          />
        </>
      )}
      opcionales={{
        cantidad: borrador.opcionales.oficina ? 1 : 0,
        onLimpiar: filtros.limpiarOpcionales,
        contenido: (
          <div className="w-64">
            <FiltroCatalogo
              etiqueta="Oficina"
              valor={borrador.opcionales.oficina}
              opciones={MOCK_CATALOGO_OFICINAS}
              cargando={false}
              onChange={(oficina) => filtros.actualizarOpcionales({ oficina })}
            />
          </div>
        ),
      }}
      derecha={
        <>
          <Tooltip title="Muestra EstadoError en lugar de la tabla, como si el backend fallara">
            <span className="flex items-center gap-1 text-detalle text-tinta-tenue">
              <Switch size="small" checked={simularFallo} onChange={setSimularFallo} /> Simular fallo
            </span>
          </Tooltip>
          <Segmented size="small" options={["Normal", "Ajustada"]} value={tipo} onChange={setTipo} />
        </>
      }
      error={primerError(validacion.errores, ORDEN_CAMPOS)}
      avisos={validacion.avisos}
      valido={validacion.valido}
      consultando={consultando}
      hayCambiosSinAplicar={filtros.hayCambiosSinAplicar}
      onFiltrar={filtros.aplicar}
      onDescartar={filtros.descartarCambios}
      chips={chips}
      onQuitarChip={() => filtros.quitarOpcionalAplicado("oficina")}
      notaChips="solo aplica a Por oficina"
    />
  );

  return (
    <VistaAnalitica barra={barra}>
      {!aplicado ? (
        <PantallaInicial
          titulo="Cartera por oficina"
          descripcion="Evolución de la mora y la cobertura de la cartera, y su detalle por oficina. Elija el rango de cortes y pulse Filtrar."
          puntos={[
            { icono: <PercentageOutlined />, titulo: "Mora", texto: "Cartera vencida sobre cartera total, coloreada según el nivel de riesgo." },
            { icono: <SafetyOutlined />, titulo: "Cobertura", texto: "Provisiones sobre cartera vencida. Por debajo del 100 % hay brecha." },
            { icono: <TableOutlined />, titulo: "Por oficina", texto: "Tabla con columnas elegibles y descarga a Excel. Admite filtrar por oficina." },
          ]}
        />
      ) : (
        <>
          <Kpis datos={consultando ? null : datos} />
          <TabsAnaliticas
            claveReinicio={JSON.stringify(aplicado)}
            activa={pestana}
            onCambiar={setPestana}
            pestanas={[
              {
                key: "evolucion",
                icono: <LineChartOutlined />,
                titulo: "Evolución",
                etiqueta: { texto: "Toda la cartera", ayuda: "El filtro de oficina no aplica a esta pestaña" },
                contenido: (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <TarjetaGrafica
                        titulo={`Mora ${tipo.toLowerCase()} (${aplicado.diasMora}+ días)`}
                        subtitulo="Franjas por nivel de riesgo"
                        option={datos && opcionesMora(datos.cortes)}
                        cargando={consultando}
                        alto={200}
                      />
                      <TarjetaGrafica
                        titulo="Saldo de cartera"
                        option={datos && opcionesSaldo(datos.cortes)}
                        cargando={consultando}
                        alto={200}
                      />
                    </div>
                    {/* Un resumen que abre su detalle en otra pestaña: `TabsAnaliticas` controlado. */}
                    <Button size="small" type="link" className="!px-0 mt-2" onClick={() => setPestana("oficinas")}>
                      Ver por oficina
                    </Button>
                  </>
                ),
              },
              {
                key: "matriz",
                icono: <AppstoreOutlined />,
                titulo: "Matriz",
                etiqueta: { texto: "Todos los cortes", ayuda: "La matriz muestra el histórico completo, sin el rango de la barra" },
                contenido: (
                  // La matriz se lleva todo el alto de la ventana al acoplarse: `scroll.y` descuenta la cabecera (32 px en `size="small"`).
                  <PanelAcoplado encima={<LeyendaNiveles />}>
                    {(alto) => (
                      <TablaAnalitica
                        rowKey="fechaCorteID"
                        loading={consultando}
                        columns={columnasMatriz}
                        dataSource={datos ? FILAS_MATRIZ : []}
                        pagination={false}
                        scroll={{ x: "max-content", y: alto - 32 }}
                      />
                    )}
                  </PanelAcoplado>
                ),
              },
              {
                key: "oficinas",
                icono: <BankOutlined />,
                titulo: "Por oficina",
                contenido: (
                  <AlternarTablaGrafica
                    // Controlado: `TabsAnaliticas` desmonta la pestaña oculta y el modo elegido se perderia.
                    vista={vistaOficinas}
                    onCambiarVista={setVistaOficinas}
                    accionesTabla={<SelectorColumnas columnas={COLUMNAS_ELEGIBLES} visibles={visibles} onChange={setVisibles} />}
                    acciones={
                      <ExcelButton
                        size="small"
                        disabled={!datos?.oficinas.length || simularFallo}
                        onClick={() =>
                          datos && exportarExcel("Cartera_por_oficina", [{ nombre: "Oficinas", columnas: COLUMNAS_EXCEL, filas: datos.oficinas }])
                        }
                      />
                    }
                    reemplazo={simularFallo && <EstadoError error={ERROR_SIMULADO} className="min-h-[200px]" />}
                    tabla={
                      <TablaAnalitica
                        rowKey="_clave"
                        loading={consultando}
                        columns={columnas}
                        dataSource={datos?.oficinas}
                        summary={(filas) => (
                          <Table.Summary.Row className="font-semibold bg-superficie-sutil">
                            <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                            {esVisible("saldo") && (
                              <Table.Summary.Cell index={1} align="right">
                                <CeldaMoneda valor={filas.reduce((s, o) => s + o.saldo, 0)} />
                              </Table.Summary.Cell>
                            )}
                          </Table.Summary.Row>
                        )}
                      />
                    }
                    grafica={
                      <TarjetaGrafica
                        titulo="Mora por oficina"
                        option={
                          datos && {
                            grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
                            tooltip: { trigger: "axis", confine: true },
                            xAxis: { type: "value", axisLabel: { formatter: "{value}%" } },
                            yAxis: { type: "category", inverse: true, data: datos.oficinas.map((o) => o.nombre) },
                            series: [
                              {
                                name: "Mora",
                                type: "bar",
                                unitType: "percent",
                                // Valores planos (no `{ value }`): las estadisticas solo leen numeros o tuplas.
                                data: datos.oficinas.map((o) => o.mora),
                                itemStyle: {
                                  color: (p: { value: number }) => nivelDe(p.value, MOCK_NIVELES)?.color ?? COLOR_SIN_DATOS,
                                },
                              },
                            ],
                          }
                        }
                        cargando={consultando}
                        alto={260}
                      />
                    }
                  />
                ),
              },
            ]}
          />
        </>
      )}
    </VistaAnalitica>
  );
};

export default VistaAnaliticaDemo;
