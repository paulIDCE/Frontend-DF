import { useState } from "react";
import { Tabs, Steps, Dropdown, Pagination, Badge, Space, Button, MenuProps } from "antd";
import { DownOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { color } from "@idce/kit";

const NavigationComponentsDemo = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const items: MenuProps["items"] = [
    { key: "1", label: "Mi perfil", icon: <UserOutlined /> },
    { key: "2", label: "Configuración", icon: <SettingOutlined /> },
    { type: "divider" },
    { key: "3", label: "Cerrar sesión", icon: <LogoutOutlined />, danger: true },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Tabs</h4>
        <Tabs
          defaultActiveKey="1"
          items={[
            { key: "1", label: "Información", children: <p className="text-tinta-secundaria">Contenido de información general.</p> },
            { key: "2", label: "Seguridad", children: <p className="text-tinta-secundaria">Configuración de seguridad y permisos.</p> },
            { key: "3", label: "Auditoría", children: <p className="text-tinta-secundaria">Registro de actividades del sistema.</p> },
            { key: "4", label: "Notificaciones", children: <p className="text-tinta-secundaria">Preferencias de notificación.</p> },
          ]}
        />
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Steps (Pasos)</h4>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Steps
            current={currentStep}
            items={[
              { title: "Registro", content: "Datos básicos" },
              { title: "Verificación", content: "Confirmar identidad" },
              { title: "Completado", content: "Cuenta activa" },
            ]}
          />
          <Space>
            <Button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
              Anterior
            </Button>
            <Button onClick={() => setCurrentStep(Math.min(2, currentStep + 1))} disabled={currentStep === 2}>
              Siguiente
            </Button>
          </Space>
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Dropdown</h4>
        <Dropdown menu={{ items }} placement="bottomLeft">
          <Button>
            Menú dropdown <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Pagination</h4>
        <Space orientation="vertical">
          <Pagination defaultCurrent={1} total={50} pageSize={10} showSizeChanger showTotal={(total) => `Total ${total} registros`} />
          <Pagination defaultCurrent={1} total={50} pageSize={10} simple />
          <Pagination defaultCurrent={1} total={5} size="small" />
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Badge</h4>
        <Space size="large">
          <Badge count={5}>
            <Button>Notificaciones</Button>
          </Badge>
          <Badge count={0} showZero>
            <Button>Sin novedades</Button>
          </Badge>
          <Badge dot>
            <Button>Dot activo</Button>
          </Badge>
          <Badge count="Nuevo" style={{ backgroundColor: color.accion.base }}>
            <Button>Custom</Button>
          </Badge>
        </Space>
      </div>
    </div>
  );
};

export default NavigationComponentsDemo;
