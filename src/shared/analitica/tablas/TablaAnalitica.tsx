import { Table } from "antd";
import type { TableProps } from "antd";
import { useAltoBarra } from "../VistaAnalitica";

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
 * Para catalogos con alta/edicion/baja usar `components/CrudTable`.
 */
const TablaAnalitica = <T extends object>({ pagination, ...props }: TableProps<T>) => {
  const altoBarra = useAltoBarra();
  return (
    <Table<T>
      size="small"
      scroll={{ x: "max-content" }}
      showSorterTooltip={{ target: "sorter-icon" }}
      sticky={altoBarra === null ? undefined : { offsetHeader: altoBarra }}
      pagination={
        pagination === false ? false : { size: "small", pageSize: 10, hideOnSinglePage: true, ...pagination }
      }
      {...props}
    />
  );
};

export default TablaAnalitica;
