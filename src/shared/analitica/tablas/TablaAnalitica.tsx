import { useMemo, useState } from "react";
import type { Key, ReactNode } from "react";
import { Table } from "antd";
import type { TableProps } from "antd";
import BarraExpandirArbol from "@/components/BarraExpandirArbol";
import { ExcelBotonBarra } from "@/components/DownloadButtons";
import { useAltoBarra } from "../VistaAnalitica";
import { useImpresion } from "../impresion";
import { exportarExcel, type ColumnaExcel } from "../exportarExcel";
import { aplanarArbol } from "./arbol";
import { useArbolTabla } from "./useArbolTabla";

/** Descarga Excel de la tabla: las mismas columnas que se ven (sin las de acciones). */
export interface ExcelTabla<T> {
  /** Nombre del archivo (sin extension). */
  nombre: string;
  /** Nombre de la hoja; por defecto, `nombre`. */
  hoja?: string;
  columnas: ColumnaExcel<T>[];
  /**
   * Filas a escribir. Por defecto, las de la tabla: si es un arbol, todas (tambien las de ramas
   * contraidas) agrupadas con los +/- de Excel y cerradas como en pantalla.
   */
  filas?: T[];
}

export interface TablaAnaliticaProps<T> extends TableProps<T> {
  /** Si se pasa, aparece el boton de Excel sobre la tabla. Toda tabla de datos deberia tenerlo. */
  excel?: ExcelTabla<T>;
  /**
   * Tabla arbol (`children` en los datos): expansion controlada con "Expandir todo" / "Contraer todo".
   * `"expandido"` abre todas las ramas al cargar; `true` o `"contraido"`, ninguna.
   */
  arbol?: boolean | "expandido" | "contraido";
  /** Ramas que "Contraer todo" deja abiertas: encabezados de grupo sin valores propios. */
  ramasFijas?: readonly Key[];
  /** Contenido extra a la izquierda de la barra de la tabla (filtros, leyendas…). */
  barra?: ReactNode;
}

type ConHijos<T> = T & { children?: ConHijos<T>[] };

/**
 * Tabla de lectura de una vista analitica: antd `Table` con los valores del estandar
 * (`docs/VISTAS_ANALITICAS.md` §6) ya puestos. Todo se puede sobrescribir por props.
 *
 * Dentro de `VistaAnalitica` la cabecera queda fija justo debajo de la barra de filtros; fuera de
 * ella no hay barra que respetar y la cabecera no se fija.
 *
 * El tooltip "Click para ordenar" sale solo sobre las flechas (`target: "sorter-icon"`): por
 * defecto antd lo pone en toda la cabecera y se solapaba con la ayuda de `TituloAyuda`.
 *
 * Con `excel` ofrece la descarga de lo que se ve; con `arbol`, expandir y contraer todo.
 *
 * Para catalogos con alta/edicion/baja usar `components/CrudTable`.
 */
const TablaAnalitica = <T extends object>({
  pagination,
  excel,
  arbol,
  ramasFijas,
  barra,
  ...props
}: TablaAnaliticaProps<T>) => {
  const altoBarra = useAltoBarra();
  const impresion = useImpresion();
  const { rowKey, dataSource } = props;
  const datos = (dataSource ?? []) as readonly ConHijos<T>[];

  const claveDe = useMemo(
    () =>
      (fila: ConHijos<T>): Key =>
        typeof rowKey === "function"
          ? rowKey(fila)
          : ((fila as Record<string, unknown>)[(rowKey as string | undefined) ?? "key"] as Key),
    [rowKey],
  );
  const conArbol = !!arbol;
  const arbolTabla = useArbolTabla<ConHijos<T>>(
    datos,
    claveDe,
    arbol === "expandido" ? "expandido" : "contraido",
    ramasFijas,
  );
  const [descargando, setDescargando] = useState(false);

  const descargar = async () => {
    if (!excel) return;
    const nivel = new Map<T, number>();
    const ocultas = new Set<T>();
    const filas: T[] = excel.filas ?? [];
    if (!excel.filas) {
      const abiertas = new Set(arbolTabla.expandidas);
      aplanarArbol(datos, (n, profundidad, ancestros) => {
        filas.push(n);
        nivel.set(n, profundidad);
        if (conArbol && ancestros.some((a) => !abiertas.has(claveDe(a)))) ocultas.add(n);
      });
    }
    setDescargando(true);
    try {
      await exportarExcel(excel.nombre, [
        {
          nombre: excel.hoja ?? excel.nombre,
          columnas: excel.columnas,
          filas,
          ...(nivel.size && [...nivel.values()].some((v) => v > 0) && {
            nivel: (f: T) => nivel.get(f) ?? 0,
            oculta: (f: T) => ocultas.has(f),
          }),
        },
      ]);
    } finally {
      setDescargando(false);
    }
  };

  const botonExcel = excel && (
    <ExcelBotonBarra
      size="small"
      tooltip="Descargar Excel (lo que se ve)"
      loading={descargando}
      disabled={!datos.length}
      onClick={descargar}
    />
  );
  const conBarraArbol = conArbol && arbolTabla.hayRamas;

  // En papel: todo abierto, sin scroll, sin cabecera fija y sin barra (la cabecera de la tabla se
  // repite en cada pagina por CSS).
  if (impresion)
    return (
      <Table<T>
        size="small"
        {...props}
        className={`tabla-impresion ${props.className ?? ""}`}
        pagination={false}
        scroll={undefined}
        sticky={false}
        expandable={conArbol ? { ...props.expandable, expandedRowKeys: arbolTabla.padres as Key[] } : props.expandable}
      />
    );

  return (
    <div className="flex min-w-0 flex-col">
      {conBarraArbol ? (
        <BarraExpandirArbol
          onExpandir={arbolTabla.expandirTodo}
          onContraer={arbolTabla.contraerTodo}
          extra={
            <div className="flex items-center gap-2">
              {barra}
              {botonExcel}
            </div>
          }
        />
      ) : (
        (barra || botonExcel) && (
          <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
            {barra}
            {botonExcel}
          </div>
        )
      )}
      <Table<T>
        size="small"
        scroll={{ x: "max-content" }}
        showSorterTooltip={{ target: "sorter-icon" }}
        sticky={altoBarra === null ? undefined : { offsetHeader: altoBarra }}
        pagination={
          pagination === false ? false : { size: "small", pageSize: 10, hideOnSinglePage: true, ...pagination }
        }
        {...props}
        expandable={
          conArbol
            ? {
                expandedRowKeys: arbolTabla.expandidas as Key[],
                onExpandedRowsChange: arbolTabla.alCambiar,
                ...props.expandable,
              }
            : props.expandable
        }
      />
    </div>
  );
};

export default TablaAnalitica;
