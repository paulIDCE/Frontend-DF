import { ReactNode, useMemo } from "react";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ExcelButton,
  CLASE_COLUMNA_ACTIVA,
  CeldaMoneda,
  CeldaNivel,
  CeldaSaldoVariacion,
  SelectorColumnas,
  TablaAnalitica,
  TituloAyuda,
  exportarExcel,
  fmtEntero,
  fmtPct,
  useColumnasVisibles,
  type ColumnaElegible,
  type ColumnaExcel,
} from "@idce/kit";
import { MOCK_NIVELES, MOCK_OFICINAS } from "@/mocks/analitica";
import type { OficinaMock } from "@/mocks/analitica";
import GuiaUso from "./GuiaUso";

type Fila = OficinaMock & { _clave: string };

/** `rowKey` estable generado al preparar los datos, nunca el indice. */
const FILAS: Fila[] = MOCK_OFICINAS.map((o) => ({ ...o, _clave: `oficina-${o.oficinaID}` }));

const COLUMNAS_ELEGIBLES: ColumnaElegible[] = [
  { key: "saldo", titulo: "Saldo" },
  { key: "mora", titulo: "Mora" },
  { key: "cobertura", titulo: "Cobertura" },
  { key: "operaciones", titulo: "Operaciones" },
];

/** Una definicion por columna para tabla y Excel: asi lo exportado coincide con lo que se ve. */
const EXCEL: Record<string, ColumnaExcel<OficinaMock>> = {
  saldo: { titulo: "Saldo", valor: (o) => o.saldo, formato: "moneda", ancho: 20 },
  mora: { titulo: "Mora (%)", valor: (o) => o.mora, formato: "porcentaje" },
  cobertura: { titulo: "Cobertura (%)", valor: (o) => o.cobertura, formato: "porcentaje" },
  operaciones: { titulo: "Operaciones", valor: (o) => o.operaciones, formato: "entero" },
};

/** Tasa total ponderada por saldo: el promedio simple daria el mismo peso a una oficina pequeña. */
const moraPonderada = (filas: readonly OficinaMock[]) => {
  const saldo = filas.reduce((s, o) => s + o.saldo, 0);
  return saldo ? filas.reduce((s, o) => s + o.mora * o.saldo, 0) / saldo : null;
};

const TablaAnaliticaDemo = () => {
  const { visibles, setVisibles, esVisible } = useColumnasVisibles(COLUMNAS_ELEGIBLES, ["operaciones"]);

  const columnas = useMemo<ColumnsType<Fila>>(
    () =>
      [
        { key: "nombre", title: "Oficina", dataIndex: "nombre", fixed: "left" as const, width: 160 },
        {
          key: "saldo",
          title: <TituloAyuda titulo="Saldo" ayuda="Variación mensual (M) y anual (A)" />,
          align: "right" as const,
          // Con ayuda y orden: la ayuda sale sobre el texto y "Click para ordenar" solo en las flechas.
          sorter: (a: Fila, b: Fila) => a.saldo - b.saldo,
          render: (_: unknown, o: Fila) => (
            <CeldaSaldoVariacion valor={o.saldo} mensual={o.variacionMensual} anual={o.variacionAnual} />
          ),
        },
        {
          key: "mora",
          title: <TituloAyuda titulo="Mora" ayuda="Columna activa: coloreada según el nivel de riesgo" />,
          align: "center" as const,
          className: CLASE_COLUMNA_ACTIVA,
          render: (_: unknown, o: Fila) => <CeldaNivel valor={o.mora} niveles={MOCK_NIVELES} />,
        },
        {
          key: "cobertura",
          title: "Cobertura",
          align: "right" as const,
          sorter: (a: Fila, b: Fila) => a.cobertura - b.cobertura,
          // Resaltar solo la celda relevante, no la fila entera.
          render: (_: unknown, o: Fila) => (
            <span className={o.cobertura < 100 ? "text-error font-semibold" : ""}>{fmtPct(o.cobertura)}</span>
          ),
        },
        {
          key: "operaciones",
          title: "Operaciones",
          align: "right" as const,
          render: (_: unknown, o: Fila) => fmtEntero(o.operaciones),
        },
      ].filter((c) => c.key === "nombre" || esVisible(c.key)),
    [esVisible],
  );

  /** Totales en el mismo orden que las columnas visibles. */
  const totales: Record<string, (filas: readonly Fila[]) => ReactNode> = {
    saldo: (filas) => <CeldaMoneda valor={filas.reduce((s, o) => s + o.saldo, 0)} />,
    mora: (filas) => (
      <Tooltip title="Ponderada por saldo: Σ(mora × saldo) / Σ saldo">
        <span>{fmtPct(moraPonderada(filas))}</span>
      </Tooltip>
    ),
    cobertura: () => <span className="text-tinta-tenue">—</span>,
    operaciones: (filas) => fmtEntero(filas.reduce((s, o) => s + o.operaciones, 0)),
  };

  const descargar = () =>
    exportarExcel("Cartera_por_oficina", [
      {
        nombre: "Oficinas",
        filas: FILAS,
        columnas: [{ titulo: "Oficina", valor: (o) => o.nombre, ancho: 24 }, ...visibles.map((key) => EXCEL[key])],
      },
    ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-end gap-2">
          <SelectorColumnas columnas={COLUMNAS_ELEGIBLES} visibles={visibles} onChange={setVisibles} />
          <ExcelButton size="small" disabled={!FILAS.length} onClick={descargar} />
        </div>
        <TablaAnalitica<Fila>
          rowKey="_clave"
          columns={columnas}
          dataSource={FILAS}
          summary={(filas) => (
            <Table.Summary.Row className="font-semibold bg-superficie-sutil">
              <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
              {visibles.map((key, i) => (
                <Table.Summary.Cell key={key} index={i + 1} align={key === "mora" ? "center" : "right"}>
                  {totales[key](filas)}
                </Table.Summary.Cell>
              ))}
            </Table.Summary.Row>
          )}
        />
      </div>

      <GuiaUso
        usar={[
          <>
            <b>TablaAnalitica</b>: datos de solo lectura de una vista analítica (indicadores por oficina, producto,
            corte…).
          </>,
          <>Valores con formato o nivel de riesgo: <code>CeldaMoneda</code>, <code>CeldaSaldoVariacion</code>, <code>CeldaNivel</code>.</>,
          <>Totales en <code>Table.Summary</code> sobre todas las filas; tasas <b>ponderadas</b>, nunca promedio simple.</>,
          <>Muchas columnas: <code>SelectorColumnas</code> y Excel con las mismas columnas visibles (<code>exportarExcel</code>, varias hojas).</>,
          <>Dentro de <code>VistaAnalitica</code> la cabecera queda fija bajo la barra de filtros sin pasar nada.</>,
        ]}
        evitar={[
          <>
            Catálogos con alta, edición y baja por fila → <b>CrudTable</b> (arriba) con <code>ActionButtons</code>,{" "}
            <code>SearchInput</code> y <code>useExcelExport</code> de una hoja.
          </>,
          "Botones de editar o eliminar dentro de una tabla analítica.",
          <><code>rowKey</code> con el índice: generar una <code>_clave</code> estable al preparar los datos.</>,
          "Resaltar la fila entera: solo la celda que importa.",
          "Menos de 4 valores → KPIs; si lo que importa es comparar, ofrecer también la gráfica (pestaña Navegación).",
        ]}
        pieza={
          <>
            <code>TablaAnalitica</code>, <code>SelectorColumnas</code>, <code>useColumnasVisibles</code>, celdas y{" "}
            <code>exportarExcel</code> de <code>@idce/kit</code>
          </>
        }
      />
    </div>
  );
};

export default TablaAnaliticaDemo;
