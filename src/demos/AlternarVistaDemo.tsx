import { useMemo, useState } from "react";
import { Segmented, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ExcelButton,
  AlternarTablaGrafica,
  CeldaMoneda,
  CeldaNivel,
  COLOR_SIN_DATOS,
  SelectorColumnas,
  TEXTO_GRAFICA,
  TablaAnalitica,
  TarjetaGrafica,
  exportarExcel,
  fmtEntero,
  fmtMonedaCorta,
  fmtPct,
  nivelDe,
  useColumnasVisibles,
  type ColumnaElegible,
} from "@idce/kit";
import { MOCK_NIVELES, MOCK_OFICINAS } from "@/mocks/analitica";
import type { OficinaMock } from "@/mocks/analitica";
import GuiaUso from "./GuiaUso";

type Dimension = "Oficina" | "Nivel de riesgo";

interface Grupo {
  _clave: string;
  nombre: string;
  saldo: number;
  /** Ponderada por saldo. */
  mora: number;
  oficinas: number;
}

/** Ranking de oficinas por mora, de mayor a menor. */
const POR_OFICINA: Grupo[] = [...MOCK_OFICINAS]
  .sort((a, b) => b.mora - a.mora)
  .map((o) => ({ _clave: `oficina-${o.oficinaID}`, nombre: o.nombre, saldo: o.saldo, mora: o.mora, oficinas: 1 }));

/** Las mismas oficinas agrupadas por su nivel de riesgo: cambia la agrupacion, no los datos. */
const POR_NIVEL: Grupo[] = MOCK_NIVELES.map((n) => {
  const del = MOCK_OFICINAS.filter((o: OficinaMock) => nivelDe(o.mora, MOCK_NIVELES)?.nivelRiesgoID === n.nivelRiesgoID);
  const saldo = del.reduce((s, o) => s + o.saldo, 0);
  return {
    _clave: `nivel-${n.nivelRiesgoID}`,
    nombre: n.nombre,
    saldo,
    mora: saldo ? del.reduce((s, o) => s + o.mora * o.saldo, 0) / saldo : 0,
    oficinas: del.length,
  };
});

const COLUMNAS_ELEGIBLES: ColumnaElegible[] = [
  { key: "saldo", titulo: "Saldo" },
  { key: "mora", titulo: "Mora" },
  { key: "oficinas", titulo: "Oficinas" },
];

const opcionesRanking = (grupos: Grupo[], campo: "mora" | "saldo") => ({
  grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
  tooltip: { trigger: "axis", confine: true },
  xAxis: {
    type: "value",
    axisLabel: { formatter: campo === "mora" ? "{value}%" : (v: number) => fmtMonedaCorta(v), ...TEXTO_GRAFICA },
  },
  yAxis: { type: "category", inverse: true, data: grupos.map((g) => g.nombre), axisLabel: TEXTO_GRAFICA },
  series: [
    {
      name: campo === "mora" ? "Mora" : "Saldo",
      type: "bar",
      unitType: campo === "mora" ? "percent" : "money",
      // Valores planos: las estadisticas de `TarjetaGrafica` solo leen numeros o tuplas.
      data: grupos.map((g) => Number(g[campo].toFixed(2))),
      label: {
        show: true,
        position: "right",
        ...TEXTO_GRAFICA,
        formatter: (p: { value: number }) => (campo === "mora" ? fmtPct(p.value) : fmtMonedaCorta(p.value)),
      },
      // Mora: color del nivel de riesgo. Saldo: sin color, toma la serie 1 de los tokens.
      itemStyle:
        campo === "mora" ? { color: (p: { value: number }) => nivelDe(p.value, MOCK_NIVELES)?.color ?? COLOR_SIN_DATOS } : {},
    },
  ],
});

/** Columnas de ambos ejemplos; `mostrar` decide cuales se pintan. */
const columnasDe = (titulo: string, mostrar: (key: string) => boolean): ColumnsType<Grupo> =>
  [
    { key: "nombre", title: titulo, dataIndex: "nombre", fixed: "left" as const, width: 170 },
    { key: "saldo", title: "Saldo", align: "right" as const, render: (_: unknown, g: Grupo) => <CeldaMoneda valor={g.saldo} /> },
    {
      key: "mora",
      title: "Mora",
      align: "center" as const,
      render: (_: unknown, g: Grupo) => <CeldaNivel valor={g.mora} niveles={MOCK_NIVELES} />,
    },
    { key: "oficinas", title: "Oficinas", align: "right" as const, render: (_: unknown, g: Grupo) => fmtEntero(g.oficinas) },
  ].filter((c) => c.key === "nombre" || mostrar(c.key));

/** Excel con las mismas columnas que la tabla. */
const botonExcel = (titulo: string, filas: Grupo[]) => (
  <ExcelButton
    size="small"
    disabled={!filas.length}
    onClick={() =>
      exportarExcel(`Cartera_por_${titulo.toLowerCase().replace(/ /g, "_")}`, [
        {
          nombre: titulo,
          filas,
          columnas: [
            { titulo, valor: (g) => g.nombre, ancho: 22 },
            { titulo: "Saldo", valor: (g) => g.saldo, formato: "moneda", ancho: 20 },
            { titulo: "Mora (%)", valor: (g) => g.mora, formato: "porcentaje" },
            { titulo: "Oficinas", valor: (g) => g.oficinas, formato: "entero" },
          ],
        },
      ])
    }
  />
);

/** Filas de la tabla de decision "¿qué control uso?". */
const DECISION = [
  { situacion: "Mismos datos, dos lecturas: comparar / ranking (gráfica) o valor exacto / exportar (tabla)", control: "AlternarTablaGrafica" },
  { situacion: "Contenidos o consultas distintos (Evolución · Por oficina)", control: "TabsAnaliticas" },
  { situacion: "Varias secciones que conviene ver a la vez, apiladas, pudiendo ocultar alguna", control: "SeccionesColapsables" },
  { situacion: "La gráfica es lo principal y la tabla solo sirve para revisar los números", control: "“Ver datos” de TarjetaGrafica + TablaDatosModal" },
  { situacion: "Cambiar la agrupación del mismo dato (oficina, nivel, producto)", control: "Grupo DIMENSIÓN (grupos de AlternarTablaGrafica o FranjaSelectores)" },
  { situacion: "Serie temporal larga (36 cortes)", control: "Gráfica sola con zoom; la tabla va a “Ver datos”" },
  { situacion: "Pocas cifras (menos de 4)", control: "KPIs (FilaKpis), sin selector" },
].map((f, i) => ({ ...f, _clave: `decision-${i}` }));

const AlternarVistaDemo = () => {
  const [dimension, setDimension] = useState<Dimension>("Oficina");
  const { visibles, setVisibles, esVisible } = useColumnasVisibles(COLUMNAS_ELEGIBLES);
  const grupos = dimension === "Oficina" ? POR_OFICINA : POR_NIVEL;

  const columnasBasico = useMemo(() => columnasDe("Oficina", esVisible), [esVisible]);
  const columnasDimension = useMemo(() => columnasDe(dimension, () => true), [dimension]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria m-0">Básico: mismo ranking, dos lecturas</h4>
        <p className="text-detalle text-tinta-tenue m-0">
          La gráfica responde “¿qué oficina está peor?” de un vistazo; la tabla da el valor exacto y la descarga. El
          selector de columnas solo aparece en Tabla: sobre la gráfica no hace nada.
        </p>
        <AlternarTablaGrafica
          inicial="Gráfica"
          accionesTabla={<SelectorColumnas columnas={COLUMNAS_ELEGIBLES} visibles={visibles} onChange={setVisibles} />}
          acciones={botonExcel("Oficina", POR_OFICINA)}
          tabla={<TablaAnalitica<Grupo> rowKey="_clave" columns={columnasBasico} dataSource={POR_OFICINA} />}
          grafica={<TarjetaGrafica titulo="Mora por oficina" subtitulo="Ordenado de mayor a menor" option={opcionesRanking(POR_OFICINA, "mora")} alto={240} />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria m-0">Con dimensión: cambiar la agrupación y la lectura</h4>
        <p className="text-detalle text-tinta-tenue m-0">
          Los grupos se separan con rótulo (DIMENSIÓN · VISTA): dos <code>Segmented</code> juntos sin rótulo se leen
          como un solo control.
        </p>
        <AlternarTablaGrafica
          grupos={[
            {
              rotulo: "Dimensión",
              control: (
                <Segmented<Dimension> size="small" options={["Oficina", "Nivel de riesgo"]} value={dimension} onChange={setDimension} />
              ),
            },
          ]}
          acciones={botonExcel(dimension, grupos)}
          tabla={
            <TablaAnalitica<Grupo>
              rowKey="_clave"
              columns={columnasDimension}
              dataSource={grupos}
              summary={(filas) => {
                const saldo = filas.reduce((s, g) => s + g.saldo, 0);
                return (
                  <Table.Summary.Row className="font-semibold bg-superficie-sutil">
                    <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <CeldaMoneda valor={saldo} />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="center">
                      {fmtPct(saldo ? filas.reduce((s, g) => s + g.mora * g.saldo, 0) / saldo : null)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      {fmtEntero(filas.reduce((s, g) => s + g.oficinas, 0))}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          }
          grafica={
            <TarjetaGrafica
              titulo={`Saldo por ${dimension.toLowerCase()}`}
              option={opcionesRanking(grupos, "saldo")}
              alto={240}
            />
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria m-0">¿Qué control de navegación uso?</h4>
        <Table
          size="small"
          rowKey="_clave"
          pagination={false}
          dataSource={DECISION}
          columns={[
            { key: "situacion", title: "Situación", dataIndex: "situacion" },
            { key: "control", title: "Control", dataIndex: "control", render: (c: string) => <code className="text-detalle">{c}</code> },
          ]}
        />
        <GuiaUso
          usar={[
            "Los dos modos muestran exactamente los mismos datos y filtros.",
            "Hay que comparar o ver un ranking (gráfica) y también consultar el valor exacto o exportar (tabla).",
            "Hay espacio para una sola de las dos: en el SSO (~1264 × 569 px) no caben tabla y gráfica juntas sin scroll.",
            <>Si el modo debe sobrevivir al cambiar de pestaña, controlarlo (<code>vista</code> / <code>onCambiarVista</code>): <code>TabsAnaliticas</code> desmonta la pestaña oculta.</>,
          ]}
          evitar={[
            <>Los modos muestran datos o consultas distintos → <code>TabsAnaliticas</code>.</>,
            <>La tabla es solo para revisar los números de la gráfica → botón “Ver datos” (<code>onVerDatos</code>).</>,
            "Series temporales largas: una tabla de 36 cortes no aporta frente a la gráfica con zoom.",
            "Pocas filas o cifras: KPIs.",
            <>Armar la franja a mano con <code>FranjaSelectores</code> + <code>Segmented</code> + ternario: usar <code>AlternarTablaGrafica</code>.</>,
          ]}
          pieza={<><code>AlternarTablaGrafica</code> de <code>@idce/kit</code></>}
        />
      </div>
    </div>
  );
};

export default AlternarVistaDemo;
