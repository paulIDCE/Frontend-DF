import { useMemo } from "react";
import type { TableColumnsType } from "antd";
import {
  CaretRightOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MinusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { EmptyState, TablaAnalitica, arbolPorNivel, type ColumnaExcel, type NodoArbol } from "@idce/kit";
import type { FilaCuadro } from "./tipos";
import { etiquetaPeriodo, fmtValor, nivelFila, numero } from "./datos";
import { columnasAcciones, type PropsTablaSeries } from "./accionesTabla";

/**
 * Tabla del cuadro — porte de `renderTable` de prueba-data: arbol segun el nivel (expandir /
 * contraer), una columna por periodo y las acciones Selec. / Graf. / Favorito.
 *
 * `Grupo`: si el grupo tiene una sola cuenta raiz (ACTIVO -> ACTIVO en los estados financieros) no
 * se pinta su fila, que repetia la cuenta sin valores: la cuenta queda arriba. Si agrupa varias
 * raices (secciones del PyG, "MILLONES USD" / "TASA DE VARIACIÓN" en cartera) se conserva como
 * encabezado y "Contraer todo" lo deja abierto, para seguir viendo las cuentas con sus valores.
 */

type FilaTabla =
  | { key: string; tipo: "grupo"; grupo: string }
  | {
      key: string;
      tipo: "dato";
      fila: FilaCuadro;
      indice: number;
      nivel: number;
      /** Grupo sin fila propia cuyo nombre no es el de la cuenta: se muestra junto a ella. */
      seccion?: string;
    };

const normal = (t: unknown) => String(t ?? "").trim().toLowerCase();

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

/** Fondo de la fila de grupo en linea: una utilidad de Tailwind pierde contra la capa de antd. */
const FONDO_GRUPO = { background: "var(--color-superficie-hundida)" };

const TablaCuadro = ({ filas, periodos, alto = 520, nombreExcel, ...acciones }: PropsTablaSeries) => {
  const { datos, gruposFijos } = useMemo(() => {
    const grupos = new Map<string, FilaTabla[]>();
    filas.forEach((fila, indice) => {
      const grupo = fila.Grupo || "Sin Grupo";
      if (!grupos.has(grupo)) grupos.set(grupo, []);
      grupos.get(grupo)!.push({ key: `d-${indice}`, tipo: "dato", fila, indice, nivel: nivelFila(fila) });
    });
    const fijos: string[] = [];
    const nodos = [...grupos.entries()].flatMap(([grupo, items]): NodoArbol<FilaTabla>[] => {
      const raices = arbolPorNivel(items, (r) => (r.tipo === "dato" ? r.nivel : 0));
      // Una sola raiz: el grupo no agrupa nada, sobra su fila.
      if (raices.length === 1 || grupos.size === 1) {
        const [raiz] = raices;
        return raices.length === 1 && raiz.tipo === "dato" && normal(raiz.fila.Variable) !== normal(grupo) && grupo !== "Sin Grupo"
          ? [{ ...raiz, seccion: grupo }]
          : raices;
      }
      fijos.push(`g-${grupo}`);
      return [{ key: `g-${grupo}`, tipo: "grupo", grupo, children: raices }];
    });
    return { datos: nodos, gruposFijos: fijos };
  }, [filas]);

  const deGrupo = (r: FilaTabla) => (r.tipo === "grupo" ? { style: FONDO_GRUPO } : {});
  const soloDatos = (r: FilaTabla) => (r.tipo === "grupo" ? { colSpan: 0 } : {});

  const columnas: TableColumnsType<FilaTabla> = [
    ...columnasAcciones<FilaTabla>(acciones, (r) => (r.tipo === "dato" ? r.indice : null), deGrupo),
    {
      title: "Variable",
      key: "variable",
      width: 380,
      fixed: "left",
      onCell: (r) =>
        r.tipo === "grupo"
          ? { colSpan: 1 + periodos.length, className: "font-bold text-identidad", style: FONDO_GRUPO }
          : {},
      render: (_, r) =>
        r.tipo === "grupo" ? (
          <span className="inline-flex items-center gap-2">
            <FolderOpenOutlined /> {r.grupo}
          </span>
        ) : (
          <span className={`inline-flex items-center gap-2 ${claseNivel(r.nivel)}`}>
            {ICONO_NIVEL[r.nivel] ?? <MinusOutlined className="text-tinta-deshabilitada" />}
            <span>{r.fila.Variable}</span>
            {r.seccion && <span className="text-rotulo font-normal not-italic text-tinta-tenue">· {r.seccion}</span>}
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

  const columnasExcel: ColumnaExcel<FilaTabla>[] = [
    { titulo: "Variable", valor: (r) => (r.tipo === "grupo" ? r.grupo : String(r.fila.Variable ?? "")), ancho: 56 },
    ...periodos.map<ColumnaExcel<FilaTabla>>((p) => ({
      titulo: etiquetaPeriodo(p),
      valor: (r) => (r.tipo === "dato" ? numero(r.fila[p]) : null),
      ancho: 12,
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
      arbol="expandido"
      ramasFijas={gruposFijos}
      expandable={{ expandIconColumnIndex: 3 }}
      indentSize={18}
      excel={{ nombre: nombreExcel, columnas: columnasExcel }}
      barra={acciones.barra}
      scroll={{ x: "max-content", y: alto }}
    />
  );
};

export default TablaCuadro;
