import React from "react";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";

interface CrudTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string);
  scrollX?: number | false;
  scrollY?: number;
  pageSize?: number;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  totalLabel?: string;
  emptyText?: string;
  /** Densidad Ant Design (`small` = filas/cabecera más bajas). */
  size?: "small" | "middle" | "large";
  /** Si false, oculta el pager (útil en tablas cortas / compactas). */
  pagination?: boolean;
  className?: string;
  bordered?: boolean;
  /** Activa comportamiento de árbol (hijos en `children`, expandir todo). */
  tree?: boolean;
  /** Por nivel. Con `tree` el estándar del kit es 16 px. */
  indentSize?: number;
  /**
   * Detalle expandible (fila anidada). No combinar con `tree`:
   * si `tree` es true, este prop se ignora.
   */
  expandable?: TableProps<T>["expandable"];
  onRow?: (record: T) => React.HTMLAttributes<HTMLElement>;
  rowClassName?: (record: T) => string;
  /** Pie de tabla Ant (`Table.Summary`). El callback recibe la página actual. */
  summary?: (currentData: readonly T[]) => React.ReactNode;
}

const CrudTable = <T extends object>(props: CrudTableProps<T>) => {
  const {
    columns,
    dataSource,
    loading = false,
    rowKey = "id",
    scrollX = 500,
    scrollY,
    pageSize = 10,
    showSizeChanger = true,
    showTotal = true,
    totalLabel = "registros",
    emptyText = "No hay datos disponibles",
    size = "middle",
    pagination = true,
    className,
    bordered = false,
    tree = false,
    indentSize = 16,
    expandable,
    onRow,
    rowClassName,
    summary,
  } = props;
  return (
    <div
      className={className}
      style={{
        width: "100%",
        minWidth: 0,
        overflowX: scrollX === false ? "visible" : "hidden",
        overflowY: "visible",
      }}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        size={size}
        bordered={bordered}
        tableLayout={scrollX === false ? "fixed" : undefined}
        scroll={
          scrollX === false
            ? undefined
            : { x: scrollX, y: scrollY }
        }
        locale={{ emptyText }}
        defaultExpandAllRows={tree}
        indentSize={tree ? indentSize : undefined}
        expandable={tree ? undefined : expandable}
        onRow={onRow}
        rowClassName={rowClassName}
        summary={summary}
        pagination={
          tree || !pagination
            ? false
            : {
                defaultPageSize: pageSize,
                pageSizeOptions: ["10", "15", "20", "50", "100"],
                size: size === "small" ? "small" : undefined,
                showSizeChanger,
                showTotal: showTotal
                  ? (total) => `Total ${total} ${totalLabel}`
                  : undefined,
              }
        }
      />
    </div>
  );
};

export default CrudTable;
