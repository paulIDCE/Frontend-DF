import { Button, Segmented, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BankOutlined, LineChartOutlined, ReadOutlined } from "@ant-design/icons";
import { useState } from "react";
import {
  ExcelButton,
  CeldaMoneda,
  CeldaNivel,
  SeccionesColapsables,
  TEXTO_GRAFICA,
  TablaAnalitica,
  TarjetaGrafica,
  exportarExcel,
  fmtPct,
  punto,
  tooltipTemporal,
  useSeccionesAbiertas,
  type PuntoTemporal,
} from "@idce/kit";
import { MOCK_CORTES, MOCK_NIVELES, MOCK_OFICINAS } from "@/mocks/analitica";
import type { OficinaMock } from "@/mocks/analitica";
import GuiaUso from "./GuiaUso";

type ParamsPunto = { data: PuntoTemporal };
type Fila = OficinaMock & { _clave: string };

const FILAS: Fila[] = MOCK_OFICINAS.map((o) => ({ ...o, _clave: `oficina-${o.oficinaID}` }));

const COLUMNAS: ColumnsType<Fila> = [
  { key: "nombre", title: "Oficina", dataIndex: "nombre", fixed: "left", width: 160 },
  { key: "saldo", title: "Saldo", align: "right", render: (_, o) => <CeldaMoneda valor={o.saldo} /> },
  { key: "mora", title: "Mora", align: "center", render: (_, o) => <CeldaNivel valor={o.mora} niveles={MOCK_NIVELES} /> },
  { key: "cobertura", title: "Cobertura", align: "right", render: (_, o) => fmtPct(o.cobertura) },
];

const opcionesMora = {
  grid: { left: 44, right: 56, top: 16, bottom: 32 },
  tooltip: tooltipTemporal((item: ParamsPunto) => fmtPct(item.data[1])),
  xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
  yAxis: { type: "value", axisLabel: { formatter: "{value}%", ...TEXTO_GRAFICA } },
  series: [
    {
      name: "Mora",
      type: "line",
      unitType: "percent",
      smooth: true,
      data: MOCK_CORTES.map((c) => punto(`${c.fechaCorte}T12:00:00`, c.mora)),
      endLabel: { show: true, ...TEXTO_GRAFICA, formatter: (p: ParamsPunto) => fmtPct(p.data[1]) },
    },
  ],
};

const DECISION = [
  { situacion: "Varias secciones que conviene ver a la vez o recorrer con scroll", control: "SeccionesColapsables" },
  { situacion: "Contenidos alternativos: se ve uno a la vez", control: "TabsAnaliticas" },
  { situacion: "Los mismos datos leídos en tabla o en gráfica", control: "AlternarTablaGrafica" },
  { situacion: "Muchas secciones largas y el usuario trabaja en una sola", control: "SeccionesColapsables unaALaVez" },
];

/**
 * `SeccionesColapsables` + `useSeccionesAbiertas`: la sección que abre y cierra el usuario.
 */
const SeccionesDemo = () => {
  const [unaALaVez, setUnaALaVez] = useState(false);
  const [periodo, setPeriodo] = useState<"12 cortes" | "36 cortes">("12 cortes");
  const secciones = useSeccionesAbiertas(["evolucion", "oficinas"]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-detalle text-tinta-tenue m-0">
            Metodología arranca cerrada. El botón abre una sección y la trae a la vista; los controles de la cabecera no
            la abren ni la cierran.
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-detalle text-tinta-tenue">
              <Switch size="small" checked={unaALaVez} onChange={setUnaALaVez} /> Una a la vez
            </span>
            <Button size="small" onClick={() => secciones.abrir("metodologia")}>
              Ir a Metodología
            </Button>
          </div>
        </div>

        <SeccionesColapsables
          abiertas={secciones.abiertas}
          onCambiar={secciones.setAbiertas}
          unaALaVez={unaALaVez}
          secciones={[
            {
              key: "evolucion",
              icono: <LineChartOutlined />,
              titulo: "Evolución de la mora",
              descripcion: "Índice de mora por corte, toda la cartera",
              etiqueta: { texto: "Toda la cartera", ayuda: "El filtro de oficina no aplica a esta sección" },
              ayuda: "Cartera vencida sobre cartera total en cada corte. Clic en un punto para ver el detalle.",
              extra: (
                <Segmented<"12 cortes" | "36 cortes">
                  size="small"
                  options={["12 cortes", "36 cortes"]}
                  value={periodo}
                  onChange={setPeriodo}
                />
              ),
              contenido: (
                <TarjetaGrafica
                  titulo="Mora"
                  option={{
                    ...opcionesMora,
                    series: [
                      {
                        ...opcionesMora.series[0],
                        data: opcionesMora.series[0].data.slice(periodo === "12 cortes" ? -12 : 0),
                      },
                    ],
                  }}
                  alto={200}
                />
              ),
            },
            {
              key: "oficinas",
              icono: <BankOutlined />,
              titulo: "Detalle por oficina",
              ayuda: "Saldo, mora coloreada por nivel de riesgo y cobertura de cada oficina.",
              extra: (
                <ExcelButton
                  size="small"
                  onClick={() =>
                    exportarExcel("Detalle_por_oficina", [
                      {
                        nombre: "Oficinas",
                        filas: FILAS,
                        columnas: [
                          { titulo: "Oficina", valor: (o) => o.nombre, ancho: 22 },
                          { titulo: "Saldo", valor: (o) => o.saldo, formato: "moneda", ancho: 20 },
                          { titulo: "Mora (%)", valor: (o) => o.mora, formato: "porcentaje" },
                          { titulo: "Cobertura (%)", valor: (o) => o.cobertura, formato: "porcentaje" },
                        ],
                      },
                    ])
                  }
                />
              ),
              contenido: <TablaAnalitica<Fila> rowKey="_clave" columns={COLUMNAS} dataSource={FILAS} />,
            },
            {
              key: "metodologia",
              icono: <ReadOutlined />,
              titulo: "Metodología",
              descripcion: "Cómo se calcula cada indicador",
              contenido: (
                <ul className="list-disc pl-4 m-0 text-cuerpo text-tinta flex flex-col gap-1">
                  <li>
                    <b>Mora:</b> saldo vencido sobre saldo total del corte.
                  </li>
                  <li>
                    <b>Cobertura:</b> provisiones constituidas sobre cartera vencida.
                  </li>
                  <li>
                    <b>Niveles de riesgo:</b> los rangos vienen de la parametrización, no del frontend.
                  </li>
                </ul>
              ),
            },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria m-0">¿Secciones, pestañas o tabla / gráfica?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DECISION.map((d) => (
            <div key={d.control} className="rounded-tarjeta border border-linea px-3 py-2">
              <div className="text-cuerpo text-tinta">{d.situacion}</div>
              <code className="text-detalle text-accion">{d.control}</code>
            </div>
          ))}
        </div>
        <GuiaUso
          usar={[
            "Varias secciones apiladas que el usuario quiere ver juntas o comparar con scroll (evolución, detalle, metodología).",
            "Contenido secundario que conviene poder ocultar para ganar espacio (metodología, parámetros).",
            <>Todas abiertas por defecto; cerrar de inicio solo lo secundario (<code>abiertasIniciales</code>).</>,
            <>Acciones de la sección en <code>extra</code> (Excel, periodo) y explicación en <code>ayuda</code>, no en el título.</>,
            <>Llevar al usuario a una sección desde otra parte: <code>useSeccionesAbiertas().abrir(key)</code>.</>,
          ]}
          evitar={[
            <>Contenidos que se ven de a uno → <code>TabsAnaliticas</code>.</>,
            <>Los mismos datos en tabla o gráfica → <code>AlternarTablaGrafica</code>.</>,
            "Una sola sección en la página: un colapsable solo no aporta, basta el título.",
            "Iconos o títulos que crecen al pasar el mouse, o un onChange que solo registra: la cabecera ya indica que se puede abrir.",
            <>Envolver <code>Collapse</code> de antd a mano con clases de color: usar este componente.</>,
          ]}
          pieza={
            <>
              <code>SeccionesColapsables</code> y <code>useSeccionesAbiertas</code> de <code>@idce/kit</code>
            </>
          }
        />
      </div>
    </div>
  );
};

export default SeccionesDemo;
