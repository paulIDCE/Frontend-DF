import type { ColumnsType } from "antd/es/table";
import { CrudTable, ActionButtons, StatusTag } from "@idce/kit";
import type { Provincia } from "@/types/provincia";

/**
 * Tabla de Provincia (§7: tabla y form popup SEPARADOS del Menu).
 *
 * Componente controlado: no carga datos ni guarda nada, solo pinta lo que
 * recibe y notifica hacia arriba. Asi la pagina es la unica que orquesta.
 */
interface ProvinciaTableProps {
  data: readonly Provincia[];
  loading?: boolean;
  onEdit: (provincia: Provincia) => void;
  onDelete: (provincia: Provincia) => void;
}

const ProvinciaTable = ({
  data,
  loading,
  onEdit,
  onDelete,
}: ProvinciaTableProps) => {
  const columns: ColumnsType<Provincia> = [
    { title: "Codigo", dataIndex: "codigo", key: "codigo", width: 110 },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    { title: "Pais", dataIndex: "paisIso2", key: "paisIso2", width: 90 },
    { title: "Region", dataIndex: "region", key: "region" },
    { title: "Peso", dataIndex: "peso", key: "peso", width: 90 },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      render: (estado: string) => <StatusTag activo={estado === "A"} />,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <ActionButtons
          onEdit={() => onEdit(record)}
          onDelete={() => onDelete(record)}
        />
      ),
    },
  ];

  return (
    <CrudTable<Provincia>
      columns={columns}
      dataSource={data as Provincia[]}
      loading={loading}
      rowKey="provinciaID"
      scrollX={900}
      totalLabel="provincias"
      emptyText="No hay provincias que coincidan con el filtro"
    />
  );
};

export default ProvinciaTable;
