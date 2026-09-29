import { ReactNode, useMemo, useState } from "react";
import { Input, Segmented, Select, Slider, Switch, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  TablaDatosModal,
  TarjetaGrafica,
  TEXTO_GRAFICA,
  exportarExcel,
  fmtFechaCompacta,
  fmtFechaID,
  fmtMonedaCorta,
  fmtPct,
  punto,
  tooltipTemporal,
  zoomTemporal,
  type PuntoTemporal,
  type SeleccionRango,
} from "@idce/kit";
import BloqueCodigo from "../../componentes/BloqueCodigo";
import { MOCK_CORTES } from "@/mocks/analitica";
import type { CorteMock } from "@/mocks/analitica";

type Datos = "temporal" | "categorias";
type Estado = "datos" | "cargando" | "vacio";
type Seleccion = "ninguna" | "periodo" | "zoom-x" | "zoom-y" | "zoom-xy";

const CORTES = MOCK_CORTES.slice(-18);

const opcionDe = (
  datos: Datos,
  enPorcentaje: boolean,
  conEtiquetas: boolean,
) => {
  const valor = (c: CorteMock) =>
    enPorcentaje ? c.mora : Math.round((c.saldo * c.mora) / 100);
  const formato = (v: number) =>
    enPorcentaje ? fmtPct(v, 1) : fmtMonedaCorta(v);
  const label = {
    show: conEtiquetas,
    position: "top",
    ...TEXTO_GRAFICA,
    formatter: (p: { value: number | PuntoTemporal }) =>
      formato(Array.isArray(p.value) ? (p.value[1] ?? 0) : p.value),
  };
  const serie = {
    name: enPorcentaje ? "Mora (%)" : "Cartera vencida",
    unitType: enPorcentaje ? "percent" : "money",
    label,
  };
  const eje = {
    type: "value",
    scale: true,
    axisLabel: {
      formatter: enPorcentaje ? "{value}%" : fmtMonedaCorta,
      ...TEXTO_GRAFICA,
    },
  };
  return datos === "temporal"
    ? {
        grid: { left: 8, right: 24, top: 24, bottom: 8, containLabel: true },
        tooltip: tooltipTemporal((item: { data: PuntoTemporal }) =>
          formato(item.data[1] ?? 0),
        ),
        xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
        yAxis: eje,
        series: [
          {
            ...serie,
            type: "line",
            smooth: true,
            data: CORTES.map((c) =>
              punto(`${c.fechaCorte}T12:00:00`, valor(c)),
            ),
          },
        ],
      }
    : {
        grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
        tooltip: { trigger: "axis", confine: true },
        xAxis: {
          type: "category",
          data: CORTES.map((c) => fmtFechaID(c.fechaCorteID, "MMM-yy")),
          axisLabel: TEXTO_GRAFICA,
        },
        yAxis: eje,
        series: [{ ...serie, type: "bar", data: CORTES.map(valor) }],
      };
};

const ampliar = (option: ReturnType<typeof opcionDe>) => ({
  ...option,
  grid: { ...option.grid, bottom: 44 },
  dataZoom: zoomTemporal(),
});

const columnas: ColumnsType<CorteMock> = [
  {
    title: "Corte",
    key: "corte",
    render: (_, c) => fmtFechaID(c.fechaCorteID, "MMM-yyyy"),
  },
  {
    title: "Mora",
    key: "mora",
    align: "right",
    render: (_, c) => fmtPct(c.mora),
  },
];
const descargar = () =>
  exportarExcel("Playground", [
    {
      nombre: "Datos",
      filas: CORTES,
      columnas: [
        { titulo: "Corte", valor: (c) => fmtFechaID(c.fechaCorteID) },
        { titulo: "Mora (%)", valor: (c) => c.mora, formato: "porcentaje" },
      ],
    },
  ]);

const Control = ({
  etiqueta,
  prop,
  children,
}: {
  etiqueta: string;
  prop?: string;
  children: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3 min-h-7">
    <span className="text-detalle text-tinta">
      {etiqueta}
      {prop && (
        <code className="ml-1 text-rotulo text-tinta-tenue">{prop}</code>
      )}
    </span>
    {children}
  </div>
);

const Grupo = ({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <div className="text-rotulo font-semibold uppercase tracking-wide text-tinta-tenue">
      {titulo}
    </div>
    {children}
  </div>
);

/** Prop por línea, con la sangría del JSX. */
const linea = (texto: string) => `  ${texto}`;

const PlaygroundTarjeta = () => {
  const [titulo, setTitulo] = useState("Cartera vencida");
  const [datos, setDatos] = useState<Datos>("temporal");
  const [estado, setEstado] = useState<Estado>("datos");
  const [alto, setAlto] = useState(240);
  const [compacta, setCompacta] = useState(false);
  const [barra, setBarra] = useState<"completa" | "mini">("completa");
  const [conEtiquetas, setConEtiquetas] = useState(true);
  const [conPorcentajes, setConPorcentajes] = useState(false);
  const [cambioTipo, setCambioTipo] = useState(true);
  const [verDatos, setVerDatos] = useState(true);
  const [excel, setExcel] = useState(true);
  const [clic, setClic] = useState(false);
  const [conEstadisticas, setConEstadisticas] = useState(true);
  const [conPie, setConPie] = useState(false);
  const [ampliada, setAmpliada] = useState(false);
  const [seleccion, setSeleccion] = useState<Seleccion>("ninguna");

  // Estado que en una vista real es de la vista.
  const [etiquetas, setEtiquetas] = useState(false);
  const [enPorcentaje, setEnPorcentaje] = useState(false);
  const [modal, setModal] = useState(false);
  const [corte, setCorte] = useState<string | null>(null);
  const [rango, setRango] = useState<{
    desde: number | null;
    hasta: number | null;
  }>({ desde: null, hasta: null });

  const option = useMemo(
    () =>
      opcionDe(
        datos,
        conPorcentajes && enPorcentaje,
        conEtiquetas && etiquetas,
      ),
    [datos, conPorcentajes, enPorcentaje, conEtiquetas, etiquetas],
  );
  const periodoPosible = datos === "temporal";
  const seleccionEfectiva: Seleccion =
    seleccion === "periodo" && !periodoPosible ? "ninguna" : seleccion;
  const seleccionRango: SeleccionRango | undefined =
    seleccionEfectiva === "periodo"
      ? { ...rango, onCambiar: (desde, hasta) => setRango({ desde, hasta }) }
      : seleccionEfectiva.startsWith("zoom")
        ? { modo: "zoom", ejes: seleccionEfectiva.slice(5) as "x" | "y" | "xy" }
        : undefined;

  const codigo = [
    "<TarjetaGrafica",
    linea(`titulo="${titulo}"`),
    linea(estado === "vacio" ? "option={null}" : "option={option}"),
    linea(`alto={${alto}}`),
    estado === "cargando" && linea("cargando"),
    compacta && linea("compacta"),
    barra === "mini" && linea('barra="mini"'),
    conEtiquetas &&
      linea(
        "etiquetas={{ activas: etiquetas, alternar: () => setEtiquetas((v) => !v) }}",
      ),
    conPorcentajes &&
      linea(
        "porcentajes={{ activos: enPorcentaje, alternar: () => setEnPorcentaje((v) => !v) }}",
      ),
    !conEstadisticas && linea("estadisticas={false}"),
    cambioTipo && linea("cambioTipo"),
    verDatos &&
      linea(
        "onVerDatos={() => setVerDatos(true)} // + <TablaDatosModal onDescargar={…} />",
      ),
    excel && linea("onDescargarDatos={descargarExcel}"),
    clic && linea("onClickPunto={(e) => abrirDetalle(e.data[2])}"),
    clic && linea("extra={corte && <Tag>Corte {corte}</Tag>}"),
    conPie && linea("pie={<Leyenda />}"),
    ampliada &&
      linea(
        "opcionPantallaCompleta={(o) => ({ ...o, dataZoom: zoomTemporal() })}",
      ),
    seleccionEfectiva === "periodo" &&
      linea(
        "seleccionRango={{ desde, hasta, onCambiar: (d, h) => setRango({ desde: d, hasta: h }) }}",
      ),
    seleccionEfectiva.startsWith("zoom") &&
      linea(
        `seleccionRango={{ modo: "zoom", ejes: "${seleccionEfectiva.slice(5)}" }}`,
      ),
    "/>",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="grid grid-cols-1 @2xl:grid-cols-[16rem_minmax(0,1fr)] gap-4 rounded-tarjeta border border-linea bg-superficie p-4">
      <div className="flex flex-col gap-3">
        <Grupo titulo="Contenido">
          <Control etiqueta="Título" prop="titulo">
            <Input
              size="small"
              className="!w-36"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </Control>
          <Control etiqueta="Datos">
            <Segmented<Datos>
              size="small"
              value={datos}
              onChange={setDatos}
              options={[
                { label: "Tiempo", value: "temporal" },
                { label: "Categorías", value: "categorias" },
              ]}
            />
          </Control>
          <Control etiqueta="Estado">
            <Segmented<Estado>
              size="small"
              value={estado}
              onChange={setEstado}
              options={[
                { label: "Datos", value: "datos" },
                { label: "Cargando", value: "cargando" },
                { label: "Vacío", value: "vacio" },
              ]}
            />
          </Control>
          <Control etiqueta="Alto" prop="alto">
            <Slider
              className="!w-32 !my-1"
              min={160}
              max={360}
              step={20}
              value={alto}
              onChange={setAlto}
            />
          </Control>
        </Grupo>
        <Grupo titulo="Aspecto">
          <Control etiqueta="Compacta" prop="compacta">
            <Switch size="small" checked={compacta} onChange={setCompacta} />
          </Control>
          <Control etiqueta="Barra" prop="barra">
            <Segmented
              size="small"
              value={barra}
              onChange={(v) => setBarra(v as "completa" | "mini")}
              options={["completa", "mini"]}
            />
          </Control>
          <Control etiqueta="Pie (leyenda)" prop="pie">
            <Switch size="small" checked={conPie} onChange={setConPie} />
          </Control>
        </Grupo>
        <Grupo titulo="Botones de la barra">
          <Control etiqueta="Estadísticas" prop="estadisticas">
            <Switch
              size="small"
              checked={conEstadisticas}
              onChange={setConEstadisticas}
            />
          </Control>
          <Control etiqueta="Etiquetas" prop="etiquetas">
            <Switch
              size="small"
              checked={conEtiquetas}
              onChange={setConEtiquetas}
            />
          </Control>
          <Control etiqueta="% / valores" prop="porcentajes">
            <Switch
              size="small"
              checked={conPorcentajes}
              onChange={setConPorcentajes}
            />
          </Control>
          <Control etiqueta="Barras ↔ líneas" prop="cambioTipo">
            <Switch
              size="small"
              checked={cambioTipo}
              onChange={setCambioTipo}
            />
          </Control>
          <Control etiqueta="Ver datos" prop="onVerDatos">
            <Switch size="small" checked={verDatos} onChange={setVerDatos} />
          </Control>
          <Control etiqueta="Excel" prop="onDescargarDatos">
            <Switch size="small" checked={excel} onChange={setExcel} />
          </Control>
        </Grupo>
        <Grupo titulo="Interacción">
          <Control etiqueta="Clic en un punto" prop="onClickPunto">
            <Switch size="small" checked={clic} onChange={setClic} />
          </Control>
          <Control
            etiqueta="Pantalla completa ampliada"
            prop="opcionPantallaCompleta"
          >
            <Switch size="small" checked={ampliada} onChange={setAmpliada} />
          </Control>
          <Control etiqueta="Selección" prop="seleccionRango">
            <Select<Seleccion>
              size="small"
              className="!w-32"
              value={seleccionEfectiva}
              onChange={setSeleccion}
              options={[
                { label: "Ninguna", value: "ninguna" },
                {
                  label: "Periodo",
                  value: "periodo",
                  disabled: !periodoPosible,
                  title: "Solo con eje de tiempo",
                },
                { label: "Zoom X", value: "zoom-x" },
                { label: "Zoom Y", value: "zoom-y" },
                { label: "Zoom X e Y", value: "zoom-xy" },
              ]}
            />
          </Control>
        </Grupo>
      </div>

      <div className="flex flex-col gap-3 min-w-0">
        <TarjetaGrafica
          titulo={titulo}
          subtitulo={
            seleccionEfectiva === "periodo" && rango.desde
              ? `Periodo: ${new Date(rango.desde).toLocaleDateString()} – ${new Date(rango.hasta ?? 0).toLocaleDateString()}`
              : undefined
          }
          option={estado === "vacio" ? null : option}
          cargando={estado === "cargando"}
          alto={alto}
          compacta={compacta}
          barra={barra}
          etiquetas={
            conEtiquetas
              ? { activas: etiquetas, alternar: () => setEtiquetas((v) => !v) }
              : undefined
          }
          porcentajes={
            conPorcentajes
              ? {
                  activos: enPorcentaje,
                  alternar: () => setEnPorcentaje((v) => !v),
                }
              : undefined
          }
          estadisticas={conEstadisticas}
          cambioTipo={cambioTipo}
          onVerDatos={verDatos ? () => setModal(true) : undefined}
          onDescargarDatos={excel ? descargar : undefined}
          onClickPunto={
            clic
              ? (e: { data: PuntoTemporal | number; name?: string }) =>
                  setCorte(
                    Array.isArray(e.data)
                      ? fmtFechaCompacta(e.data[2])
                      : (e.name ?? null),
                  )
              : undefined
          }
          extra={
            clic && corte ? (
              <Tag color="blue" className="!m-0">
                Corte {corte}
              </Tag>
            ) : undefined
          }
          pie={
            conPie ? (
              <span className="text-rotulo text-tinta-tenue">
                Fuente: datos de ejemplo de la guía
              </span>
            ) : undefined
          }
          opcionPantallaCompleta={ampliada ? ampliar : undefined}
          seleccionRango={seleccionRango}
        />
        <BloqueCodigo codigo={codigo} />
      </div>

      <TablaDatosModal
        abierto={modal}
        titulo={titulo}
        columnas={columnas}
        filas={CORTES}
        rowKey={(c) => String(c.fechaCorteID)}
        onDescargar={descargar}
        onClose={() => setModal(false)}
      />
    </div>
  );
};

export default PlaygroundTarjeta;
