import { useMemo } from "react";
import type { TableColumnsType } from "antd";
import { FileTextOutlined, FolderOpenOutlined, FolderOutlined } from "@ant-design/icons";
import { EmptyState, TablaAnalitica, type ColumnaExcel } from "@idce/kit";
import type { FilaCuadro } from "./tipos";
import { etiquetaPeriodo, fmtValor, numero } from "./datos";
import { columnasAcciones, type PropsTablaSeries } from "./accionesTabla";

/**
 * Estados financieros detallados (SFN06 / EFI06) — porte de
 * `renderBalancesTableOptimized`: arbol de cuentas por prefijo de
 * `Codigo_Base` y `Nivel`, contraido por defecto (con expandir / contraer todo) y columna "Código".
 */

interface NodoBalance {
  key: string;
  indice: number;
  fila: FilaCuadro;
  nivel: number;
  codigo: string;
  children?: NodoBalance[];
}

/** Arbol por prefijo de codigo: el padre es el ultimo de nivel menor cuyo codigo es prefijo. */
const arbolBalances = (filas: FilaCuadro[]): NodoBalance[] => {
  const raices: NodoBalance[] = [];
  const pila: NodoBalance[] = [];
  filas.forEach((fila, indice) => {
    if (fila.Variable === undefined || fila.Variable === null) return;
    const nodo: NodoBalance = {
      key: `b-${indice}`,
      indice,
      fila,
      nivel: parseInt(String(fila.Nivel ?? "1"), 10) || 1,
      codigo: String(fila.Codigo_Base ?? "").trim(),
    };
    while (pila.length) {
      const tope = pila[pila.length - 1];
      if (tope.nivel < nodo.nivel && nodo.codigo.startsWith(tope.codigo) && nodo.codigo !== tope.codigo) break;
      pila.pop();
    }
    const padre = pila[pila.length - 1];
    if (padre) (padre.children ??= []).push(nodo);
    else raices.push(nodo);
    pila.push(nodo);
  });
  return raices.sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }));
};

const TablaBalances = ({ filas, periodos, alto = 520, nombreExcel, ...acciones }: PropsTablaSeries) => {
  const datos = useMemo(() => arbolBalances(filas), [filas]);

  const columnas: TableColumnsType<NodoBalance> = [
    {
      title: "Cuenta Contable",
      key: "variable",
      width: 380,
      fixed: "left",
      render: (_, r) => (
        <span className={r.nivel === 1 ? "font-semibold text-identidad" : r.nivel === 2 ? "font-medium" : ""}>
          {r.nivel === 1 ? (
            <FolderOutlined className="mr-1 text-advertencia" />
          ) : r.nivel === 2 ? (
            <FolderOpenOutlined className="mr-1 text-accion" />
          ) : (
            <FileTextOutlined className="mr-1 text-tinta-deshabilitada" />
          )}
          {r.fila.Variable}
        </span>
      ),
    },
    ...columnasAcciones<NodoBalance>(acciones, (r) => r.indice),
    ...periodos.map((p) => ({
      title: etiquetaPeriodo(p),
      key: p,
      width: 96,
      align: "right" as const,
      render: (_: unknown, r: NodoBalance) => fmtValor(r.fila[p]),
    })),
    {
      title: "Código",
      key: "codigo",
      width: 90,
      render: (_, r) => <span className="text-rotulo text-tinta-tenue">{r.codigo}</span>,
    },
  ];

  const columnasExcel: ColumnaExcel<NodoBalance>[] = [
    { titulo: "Código", valor: (r) => r.codigo, ancho: 14 },
    { titulo: "Cuenta Contable", valor: (r) => String(r.fila.Variable ?? ""), ancho: 56 },
    ...periodos.map<ColumnaExcel<NodoBalance>>((p) => ({
      titulo: etiquetaPeriodo(p),
      valor: (r) => numero(r.fila[p]),
      ancho: 12,
    })),
  ];

  if (periodos.length === 0) return <EmptyState mensaje="Sin datos en el período seleccionado" />;

  return (
    <TablaAnalitica<NodoBalance>
      rowKey="key"
      columns={columnas}
      dataSource={datos}
      pagination={false}
      bordered
      arbol="contraido"
      indentSize={20}
      excel={{ nombre: nombreExcel, columnas: columnasExcel }}
      barra={acciones.barra}
      scroll={{ x: "max-content", y: alto }}
    />
  );
};

export default TablaBalances;
