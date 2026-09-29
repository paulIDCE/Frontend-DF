import { useState } from "react";
import {
  Form, Input, InputNumber, Select, DatePicker, Switch, Checkbox, Radio,
  Slider, Rate, Upload, Button, Space, Row, Col, Typography,
} from "antd";
import { UploadOutlined, InboxOutlined, UserOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Title } = Typography;

const FormInputsDemo = () => {
  const [form] = Form.useForm();
  const [size, setSize] = useState<"small" | "middle" | "large">("middle");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Title level={5} className="!mb-4 !text-tinta">Tamaños de input</Title>
        <Space className="mb-4">
          <Button onClick={() => setSize("small")} type={size === "small" ? "primary" : "default"}>Small</Button>
          <Button onClick={() => setSize("middle")} type={size === "middle" ? "primary" : "default"}>Middle</Button>
          <Button onClick={() => setSize("large")} type={size === "large" ? "primary" : "default"}>Large</Button>
        </Space>
        <Space orientation="vertical" style={{ width: 400 }}>
          <Input size={size} placeholder="Input básico" />
          <Input size={size} placeholder="Con prefijo" prefix={<UserOutlined />} />
          <Input size={size} placeholder="Con sufijo" suffix=".com" />
          <Input.Search size={size} placeholder="Input.Search" />
          <Input.Password size={size} placeholder="Input.Password" />
        </Space>
      </div>

      <div>
        <Title level={5} className="!mb-4 !text-tinta">Estados de input</Title>
        <Space orientation="vertical" style={{ width: 400 }}>
          <Input placeholder="Normal" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Con error" status="error" />
          <Input placeholder="Con warning" status="warning" />
          <Input placeholder="Read only" readOnly value="Valor fijo" />
        </Space>
      </div>

      <div>
        <Title level={5} className="!mb-4 !text-tinta">TextArea</Title>
        <Space orientation="vertical" style={{ width: 400 }}>
          <TextArea placeholder="TextArea básico" rows={3} />
          <TextArea placeholder="TextArea con contador" showCount maxLength={100} rows={3} />
        </Space>
      </div>

      <div>
        <Title level={5} className="!mb-4 !text-tinta">Select</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Select placeholder="Seleccione" style={{ width: "100%" }}
              options={[
                { value: "op1", label: "Opción 1" },
                { value: "op2", label: "Opción 2" },
                { value: "op3", label: "Opción 3" },
              ]}
            />
          </Col>
          <Col span={8}>
            <Select placeholder="Múltiple" mode="multiple" style={{ width: "100%" }}
              options={[
                { value: "a", label: "Opción A" },
                { value: "b", label: "Opción B" },
                { value: "c", label: "Opción C" },
              ]}
            />
          </Col>
          <Col span={8}>
            <Select placeholder="Con búsqueda" showSearch style={{ width: "100%" }}
              options={[
                { value: "cr", label: "Costa Rica" },
                { value: "pa", label: "Panamá" },
                { value: "ni", label: "Nicaragua" },
              ]}
            />
          </Col>
        </Row>
      </div>

      <div>
        <Title level={5} className="!mb-4 !text-tinta">DatePicker</Title>
        <Row gutter={16}>
          <Col span={8}><DatePicker style={{ width: "100%" }} /></Col>
          <Col span={8}><DatePicker picker="month" style={{ width: "100%" }} /></Col>
          <Col span={8}><DatePicker.RangePicker style={{ width: "100%" }} /></Col>
        </Row>
      </div>

      <div>
        <Title level={5} className="!mb-4 !text-tinta">Switch, Checkbox, Radio</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Space orientation="vertical">
              <Switch defaultChecked />
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <Switch loading />
              <Switch disabled />
            </Space>
          </Col>
          <Col span={8}>
            <Space orientation="vertical">
              <Checkbox>Checkbox</Checkbox>
              <Checkbox defaultChecked>Checked</Checkbox>
              <Checkbox indeterminate>Indeterminate</Checkbox>
              <Checkbox disabled>Disabled</Checkbox>
            </Space>
          </Col>
          <Col span={8}>
            <Space orientation="vertical">
              <Radio value={1}>Radio</Radio>
              <Radio value={2} defaultChecked>Checked</Radio>
              <Radio value={3} disabled>Disabled</Radio>
            </Space>
          </Col>
        </Row>
      </div>

      <div>
        <Title level={5} className="!mb-4 !text-tinta">InputNumber, Slider, Rate</Title>
        <Row gutter={16}>
          <Col span={8}><InputNumber style={{ width: "100%" }} placeholder="Número" /></Col>
          <Col span={8}><Slider defaultValue={50} /></Col>
          <Col span={8}><Rate defaultValue={3} /></Col>
        </Row>
      </div>

      <div>
        <Title level={5} className="!mb-4 !text-tinta">Upload</Title>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Upload>
            <Button icon={<UploadOutlined />}>Click para subir</Button>
          </Upload>
          <Dragger>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Haga clic o arrastre archivos aquí</p>
          </Dragger>
        </Space>
      </div>

      <div>
        <Title level={5} className="!mb-4 !text-tinta">Form layout vertical con validación</Title>
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: "Requerido" }]}>
                <Input placeholder="Ingrese nombre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Correo" name="correo" rules={[{ type: "email", message: "Correo inválido" }]}>
                <Input placeholder="correo@ejemplo.com" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Edad" name="edad" rules={[{ type: "number", min: 18, message: "Debe ser mayor de edad" }]}>
                <InputNumber style={{ width: "100%" }} placeholder="Edad" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="País" name="pais" rules={[{ required: true, message: "Seleccione un país" }]}>
                <Select placeholder="Seleccione" options={[{ value: "cr", label: "Costa Rica" }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Enviar
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default FormInputsDemo;
