import { useState } from "react";
import { Form, Input, InputNumber, Button, Row, Col } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  useService,
  CrudTable,
  ActionButtons,
  StatusTag,
  EmptyState,
  FormModal,
  SearchInput,
  ExcelButton,
  ConfirmDialog,
  BarraListado,
  CampoListado,
  devLog,
} from "@idce/kit";
import { Provincia } from "../types/provincia";
import { getAllProvincia } from "../services/provinciaService";
import { MOCK_PROVINCIAS } from "../mocks/provincias";
import Swal from "sweetalert2";
import GuiaUso from "./GuiaUso";

const ProvinciaTableDemo = () => {
  const {
    data: provincia,
    loading: provinciaLoading,
    execute: executeProvincia,
  } = useService<Provincia[]>(getAllProvincia, [], [], true, "No se pudieron cargar las provincias");

  const dataSource = provincia ?? MOCK_PROVINCIAS;

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const filteredData = searchText
    ? dataSource.filter((p) =>
        Object.values(p).some((v) =>
          String(v).toLowerCase().includes(searchText.toLowerCase())
        )
      )
    : dataSource;

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      devLog("Guardando datos:", values);
      setCreateLoading(false);
      setIsCreateModalVisible(false);
      createForm.resetFields();
      Swal.fire({ icon: "success", title: "Éxito", text: "El catálogo ha sido agregado correctamente." });
      executeProvincia();
    } catch {
      setCreateLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      setUpdateLoading(true);
      devLog("Actualizando datos:", values);
      setUpdateLoading(false);
      setIsUpdateModalVisible(false);
      updateForm.resetFields();
      Swal.fire({ icon: "success", title: "Éxito", text: "La provincia ha sido actualizado correctamente." });
      executeProvincia();
    } catch {
      setUpdateLoading(false);
    }
  };

  const handleDelete = (record: Provincia) => {
    ConfirmDialog({
      title: "¿Está seguro?",
      text: `¿Desea eliminar el catalogo "${record.nombre}"?`,
      confirmText: "Sí, eliminar",
      destructive: true,
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          Swal.fire({ icon: "success", title: "Éxito", text: "La provincia ha sido eliminado correctamente." });
          executeProvincia();
        } catch {
          Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar el Catalogo." });
        }
      }
    });
  };

  const columns = [
    { title: "Código", dataIndex: "codigo", key: "codigo" },
    { title: "País ISO2", dataIndex: "paisIso2", key: "paisIso2" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Región", dataIndex: "region", key: "region" },
    { title: "Peso", dataIndex: "peso", key: "peso" },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (text: string) => <StatusTag activo={text === "A"} />,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 120,
      render: (_: unknown, record: Provincia) => (
        <ActionButtons
          onEdit={() => {
            updateForm.setFieldsValue(record);
            setIsUpdateModalVisible(true);
          }}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  const renderFormFields = () => (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item name="codigo" label="Código" rules={[{ required: true, message: "El código es requerido" }]}>
          <Input placeholder="Ingrese código" />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: "El nombre es requerido" }]}>
          <Input placeholder="Ingrese nombre" />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name="paisIso2" label="País ISO2" rules={[{ required: true, message: "El país ISO2 es requerido" }]}>
          <Input placeholder="Ingrese país ISO2" />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name="region" label="Región" rules={[{ required: true, message: "La región es requerida" }]}>
          <Input placeholder="Ingrese región" />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name="peso" label="Peso" rules={[{ required: true, message: "El peso es requerido" }]}>
          <InputNumber style={{ width: "100%" }} placeholder="Ingrese peso" />
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <div className="w-full">
      <BarraListado
        campos={
          <CampoListado etiqueta="Buscar" amplio>
            <SearchInput
              value={searchText}
              onChange={setSearchText}
              placeholder="Buscar provincia..."
              style={{ width: "100%" }}
            />
          </CampoListado>
        }
        acciones={
          <>
            <ExcelButton onClick={() => devLog("Exportar Excel")} />
            <Button icon={<ReloadOutlined />} onClick={() => executeProvincia()}>
              Limpiar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              Nueva Provincia
            </Button>
          </>
        }
      />

      {filteredData.length === 0 && !provinciaLoading ? (
        <EmptyState onRecargar={() => executeProvincia()} />
      ) : (
        <CrudTable
          columns={columns}
          dataSource={filteredData}
          loading={provinciaLoading}
          rowKey="provinciaID"
        />
      )}

      <FormModal
        open={isCreateModalVisible}
        onCancel={() => { setIsCreateModalVisible(false); createForm.resetFields(); }}
        onFinish={handleCreate}
        form={createForm}
        title="Nuevo Catálogo"
        loading={createLoading}
      >
        {renderFormFields()}
      </FormModal>

      <FormModal
        open={isUpdateModalVisible}
        onCancel={() => { setIsUpdateModalVisible(false); updateForm.resetFields(); }}
        onFinish={handleUpdate}
        form={updateForm}
        title="Actualizar Producto"
        loading={updateLoading}
      >
        {renderFormFields()}
      </FormModal>

      <div className="mt-4">
        <GuiaUso
          pieza={<><code>BarraListado</code> y <code>CrudTable</code></>}
          usar={[
            "CRUD de pocas columnas: una cabecera por campo (esta mesa). No doblar el código en meta.",
            "BarraListado en listas CRUD. VistaAnalitica sigue usando BarraFiltros.",
          ]}
          evitar={[
            "IdentityCell aquí: el código y el país merecen columna propia.",
            "Toolbar suelta sin panel (flex suelto) en un listado de catálogo.",
          ]}
        />
      </div>
    </div>
  );
};

export default ProvinciaTableDemo;
