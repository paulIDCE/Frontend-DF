import { Form, Input, Button } from "antd";
import { SaveOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { SectionHeader } from "@idce/kit";

const ConfigurationSectionDemo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      <div className="p-4 md:border-r border-linea-sutil">
        <SectionHeader icono={<LockOutlined />} titulo="Seguridad" />
        <Form layout="vertical">
          <Form.Item label="Configuración">
            <Input placeholder="Valor de configuración" />
          </Form.Item>
          <Button type="primary" icon={<SaveOutlined />}>
            Guardar cambios
          </Button>
        </Form>
      </div>
      <div className="p-4">
        <SectionHeader icono={<SafetyOutlined />} titulo="Permisos" />
        <Form layout="vertical">
          <Form.Item label="Permiso">
            <Input placeholder="Valor de permiso" />
          </Form.Item>
          <Button type="primary" icon={<SaveOutlined />}>
            Guardar cambios
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ConfigurationSectionDemo;
