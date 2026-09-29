import { useMemo } from "react";
import { Button, Checkbox, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import {
  CaretRightOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  LineChartOutlined,
  MinusOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { EmptyState, TablaAnalitica } from "@idce/kit";
import type { FilaCuadro } from "./tipos";
import { etiquetaPeriodo, fmtValor, nivelFila } from "./datos";

/**
 * Tabla del cuadro — porte de `renderTable` de prueba-data: filas agrupadas por
 * `Grupo`, sangria e icono segun el nivel, una columna por periodo y las
 * acciones Selec. / Graf. / Carrito.
 */

type FilaTabla =
  | { key: string; tipo: "grupo"; grupo: string }
  | { key: string; tipo: "dato"; fila: FilaCuadro; indice: number; nivel: number };

interface Props {
  filas: FilaCuadro[];
  periodos: string[];
  seleccionados: Set<number>;
  onSeleccionar: (indice: number, marcado: boolean) => void;
  onGraficar: (indice: number) => void;
  onCarrito: (indice: number) => void;
  alto?: number;
}

const ICONO_NIVEL = [
  <FileTextOutlined key={0} />,
  <FolderOutlined key={1} className="text-advertencia" />,
  <FolderOpenOutlined key={2} className="text-accion" />,
  <CaretRightOutlined key={3} className="text-exito" />,
  <RightOutlined key={4} className="text-tinta-deshabilitada" />,
  <RightOutlined key={5} className="text-tinta-deshabilitada" />,
];

const claseNivel = (nivel: number): string =>
  nivel === 1
    ? "font-semibold text-identidad"
    : nivel === 2
      ? "font-medium text-tinta"
      : nivel === 3
        ? "italic text-tinta-secundaria"
        : nivel >= 4
          ? "italic text-detalle text-tinta-tenue"
          : "text-tinta";

const TablaCuadro = ({
  filas,
  periodos,
  seleccionados,
  onSeleccionar,
  onGraficar,
  onCarrito,
  alto = 520,
}: Props) => {
  const datos = useMemo<FilaTabla[]>(() => {
    const grupos = new Map<string, FilaTabla[]>();
    filas.forEach((fila, indice) => {
      const grupo = fila.Grupo || "Sin Grupo";
      if (!grupos.has(grupo)) grupos.set(grupo, []);
      grupos.get(grupo)!.push({ key: `d-${indice}`, tipo: "dato", fila, indice, nivel: nivelFila(fila) });
    });
    return [...grupos.entries()].flatMap(([grupo, items]) => [
      { key: `g-${grupo}`, tipo: "grupo" as const, grupo },
      ...items,
    ]);
  }, [filas]);

  const totalColumnas = 4 + periodos.length;
  const soloDatos = (r: FilaTabla) => (r.tipo === "grupo" ? { colSpan: 0 } : {});

  const columnas: TableColumnsType<FilaTabla> = [
    {
      title: "Selec.",
      key: "sel",
      width: 56,
      align: "center",
      fixed: "left",
      onCell: (r) =>
        r.tipo === "grupo"
          ? {
              colSpan: totalColumnas,
              className: "font-bold text-identidad",
              // Fondo en linea: una utilidad de Tailwind pierde contra la capa de antd.
              style: { background: "var(--color-superficie-hundida)" },
            }
          : {},
      render: (_, r) =>
        r.tipo === "grupo" ? (
          <span className="flex items-center gap-2 text-left">
            <FolderOpenOutlined /> {r.grupo}
          </span>
        ) : (
          <Checkbox
            checked={seleccionados.has(r.indice)}
            onChange={(e) => onSeleccionar(r.indice, e.target.checked)}
          />
        ),
    },
    {
      title: "Graf.",
      key: "graf",
      width: 56,
      align: "center",
      fixed: "left",
      onCell: soloDatos,
      render: (_, r) =>
        r.tipo === "dato" && (
          <Tooltip title="Graficar">
            <Button type="text" size="small" icon={<LineChartOutlined />} onClick={() => onGraficar(r.indice)} />
          </Tooltip>
        ),
    },
    {
      title: "Carrito",
      key: "carrito",
      width: 64,
      align: "center",
      fixed: "left",
      onCell: soloDatos,
      render: (_, r) =>
        r.tipo === "dato" && (
          <Tooltip title="Añadir al carrito">
            <Button type="text" size="small" icon={<ShoppingCartOutlined />} onClick={() => onCarrito(r.indice)} />
          </Tooltip>
        ),
    },
    {
      title: "Variable",
      key: "variable",
      width: 360,
      fixed: "left",
      onCell: soloDatos,
      render: (_, r) =>
        r.tipo === "dato" && (
          <span className={`flex items-center gap-2 ${claseNivel(r.nivel)}`} style={{ paddingLeft: r.nivel * 20 }}>
            {ICONO_NIVEL[r.nivel] ?? <MinusOutlined className="text-tinta-deshabilitada" />}
            <span>{r.fila.Variable}</span>
          </span>
        ),
    },
    ...periodos.map((p) => ({
      title: etiquetaPeriodo(p),
      key: p,
      width: 96,
      align: "right" as const,
      onCell: soloDatos,
      render: (_: unknown, r: FilaTabla) =>
        r.tipo === "dato" && <span className={claseNivel(r.nivel)}>{fmtValor(r.fila[p])}</span>,
    })),
  ];

  if (periodos.length === 0) {
    return <EmptyState mensaje="Sin datos en el período seleccionado" />;
  }

  return (
    <TablaAnalitica<FilaTabla>
      rowKey="key"
      columns={columnas}
      dataSource={datos}
      pagination={false}
      bordered
      scroll={{ x: "max-content", y: alto }}
    />
  );
};

export default TablaCuadro;
