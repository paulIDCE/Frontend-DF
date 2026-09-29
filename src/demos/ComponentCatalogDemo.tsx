import { Typography, Button, Space } from "antd";
import { PlusOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  StatusTag,
  ChipAtributo,
  ChipNivel,
  SearchInput,
  ExcelButton,
  PdfButton,
  ActionButtons,
  EmptyState,
  LoadingScreen,
  showToast,
} from "@idce/kit";
import { MOCK_COLOR_CATALOGO } from "../mocks/analitica";

const { Title } = Typography;

const ComponentCatalogDemo = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Title level={5} className="!mb-2 !text-tinta">PageContainer</Title>
        <PageContainer>
          <p className="text-tinta-secundaria">Contenido envuelto en bg-superficie rounded-contenedor p-4 shadow-contenedor</p>
        </PageContainer>
      </div>
      <div>
        <Title level={5} className="!mb-2 !text-tinta">PageHeader + BreadcrumbNav</Title>
        <PageHeader
          titulo="Usuarios"
          migas={[
            { label: "Inicio", path: "/home" },
            { label: "Administración" },
            { label: "Usuarios" },
          ]}
          acciones={<Button type="primary" icon={<PlusOutlined />}>Nuevo</Button>}
        />
      </div>
      <div>
        <Title level={5} className="!mb-2 !text-tinta">SectionHeader</Title>
        <SectionHeader icono={<LockOutlined />} titulo="Configuración de Seguridad" />
        <SectionHeader icono={<SafetyOutlined />} titulo="Con colorIcono=&quot;exito&quot;" colorIcono="exito" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Title level={5} className="!mb-2 !text-tinta">StatusTag</Title>
          <Space>
            <StatusTag activo={true} />
            <StatusTag activo={false} />
            <StatusTag activo colorActivo="exito" textoActivo="Aprobado" />
            <StatusTag activo={false} colorInactivo="error" textoInactivo="Rechazado" />
          </Space>
        </div>
        <div className="col-span-2">
          <Title level={5} className="!mb-2 !text-tinta">Color de chips: preset, rol o propio</Title>
          <Space wrap>
            <ChipAtributo categoria="Preset antd" valor="blue" color="blue" />
            <ChipAtributo categoria="Rol del kit" valor="riesgo" color="riesgo" />
            <ChipAtributo categoria="Rol del kit" valor="exito" color="exito" />
            <ChipAtributo categoria="Color propio (backend)" valor="Microcrédito" color={MOCK_COLOR_CATALOGO} />
            <ChipNivel etiqueta="Proceso" nivel={2}>Por profundidad</ChipNivel>
            <ChipNivel etiqueta="Proceso" color="accion">Con rol accion</ChipNivel>
          </Space>
          <p className="text-detalle text-tinta-tenue mt-2 mb-0">
            Los presets de antd se ven como siempre. Un rol o un color propio toman el mismo aspecto (fondo claro, borde suave,
            texto legible) con <code>estiloChip</code>.
          </p>
        </div>
        <div>
          <Title level={5} className="!mb-2 !text-tinta">SearchInput</Title>
          <SearchInput />
        </div>
      </div>
      <div>
        <Title level={5} className="!mb-2 !text-tinta">ExcelButton / PdfButton</Title>
        <Space>
          <ExcelButton onClick={() => showToast.success("Excel descargado")} />
          <PdfButton onClick={() => showToast.success("PDF descargado")} />
        </Space>
      </div>
      <div>
        <Title level={5} className="!mb-2 !text-tinta">ActionButtons</Title>
        <ActionButtons
          onEdit={() => showToast.info("Editar click")}
          onDelete={() => showToast.warning("Eliminar click")}
        />
      </div>
      <div>
        <Title level={5} className="!mb-2 !text-tinta">EmptyState</Title>
        <PageContainer>
          <EmptyState onRecargar={() => showToast.success("Recargando...")} />
        </PageContainer>
      </div>
      <div>
        <Title level={5} className="!mb-2 !text-tinta">LoadingScreen</Title>
        <div style={{ height: 200, overflow: "hidden" }}>
          <LoadingScreen tip="Cargando componente de ejemplo..." />
        </div>
      </div>
    </div>
  );
};

export default ComponentCatalogDemo;
