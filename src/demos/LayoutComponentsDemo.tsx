import { Row, Col, Space, Divider, Descriptions, Typography, Button } from "antd";


const { Title } = Typography;

const LayoutComponentsDemo = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Title level={5} className="!mb-4 !text-tinta">Grid System (Row / Col)</Title>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col span={8}><div className="bg-accion-activo text-tinta-inversa p-3 rounded-tarjeta text-center">Col 8</div></Col>
            <Col span={8}><div className="bg-accion-hover text-tinta-inversa p-3 rounded-tarjeta text-center">Col 8</div></Col>
            <Col span={8}><div className="bg-accion text-tinta-inversa p-3 rounded-tarjeta text-center">Col 8</div></Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}><div className="bg-accion-sutil text-accion-activo p-3 rounded-tarjeta text-center">Col 6</div></Col>
            <Col span={6}><div className="bg-accion-sutil text-accion-activo p-3 rounded-tarjeta text-center">Col 6</div></Col>
            <Col span={6}><div className="bg-accion-sutil text-accion-activo p-3 rounded-tarjeta text-center">Col 6</div></Col>
            <Col span={6}><div className="bg-accion-sutil text-accion-activo p-3 rounded-tarjeta text-center">Col 6</div></Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="bg-accion-sutil p-3 rounded-tarjeta text-center text-tinta-secundaria">Responsive xs=24 sm=12 md=8 lg=6</div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="bg-accion-sutil p-3 rounded-tarjeta text-center text-tinta-secundaria">Responsive xs=24 sm=12 md=8 lg=6</div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="bg-accion-sutil p-3 rounded-tarjeta text-center text-tinta-secundaria">Responsive xs=24 sm=12 md=8 lg=6</div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="bg-accion-sutil p-3 rounded-tarjeta text-center text-tinta-secundaria">Responsive xs=24 sm=12 md=8 lg=6</div>
            </Col>
          </Row>
        </Space>
      </div>

      <Divider />

      <div>
        <Title level={5} className="!mb-4 !text-tinta">Space (espaciado consistente)</Title>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <p className="text-tinta-secundaria">Space con orientation="vertical" y diferentes tamaños:</p>
          <Space size="small">
            <Button size="small">Small</Button>
            <Button size="small">Small</Button>
            <Button size="small">Small</Button>
          </Space>
          <Space size="middle">
            <Button>Middle</Button>
            <Button>Middle</Button>
            <Button>Middle</Button>
          </Space>
          <Space size="large">
            <Button type="primary">Large</Button>
            <Button type="primary">Large</Button>
            <Button type="primary">Large</Button>
          </Space>
          <p className="text-tinta-secundaria">Space wrap (responsive, los botones se apilan al encoger):</p>
          <Space wrap>
            <Button>Opción 1</Button><Button>Opción 2</Button><Button>Opción 3</Button>
            <Button>Opción 4</Button><Button>Opción 5</Button><Button>Opción 6</Button>
            <Button>Opción 7</Button><Button>Opción 8</Button>
          </Space>
        </Space>
      </div>

      <Divider />

      <div>
        <Title level={5} className="!mb-4 !text-tinta">Divider</Title>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <p>Texto antes del divider</p>
          <Divider />
          <p>Texto después del divider simple</p>
          <Divider dashed />
          <p>Divider dashed</p>
          {/* antd 6: `orientation` pasó a ser horizontal/vertical; la alineación
              del título es ahora `titlePlacement` */}
          <Divider titlePlacement="start" plain>Sección izquierda</Divider>
          <p>Contenido de sección</p>
          <Divider titlePlacement="center" plain>Centrado</Divider>
          <p>Más contenido</p>
        </Space>
      </div>

      <Divider />

      <div>
        <Title level={5} className="!mb-4 !text-tinta">Descriptions (información en columnas)</Title>
        <Descriptions title="Información del usuario" bordered column={2}>
          <Descriptions.Item label="Nombre">Juan Pérez</Descriptions.Item>
          <Descriptions.Item label="Correo">jperez@idce.com</Descriptions.Item>
          <Descriptions.Item label="Teléfono" span={2}>+506 8888-8888</Descriptions.Item>
          <Descriptions.Item label="Dirección" span={2}>San José, Costa Rica</Descriptions.Item>
          <Descriptions.Item label="Estado"><span className="text-exito">Activo</span></Descriptions.Item>
          <Descriptions.Item label="Rol">Administrador</Descriptions.Item>
        </Descriptions>
        <p className="text-detalle text-tinta-tenue mt-2 mb-0">
          Solo para fichas estáticas de un registro. En paneles de detalle (drawer o modal abierto desde una fila o una
          gráfica) va <code>BloqueDetalle</code> + <code>Dato</code> — pestaña <strong>Detalle</strong>.
        </p>
      </div>
    </div>
  );
};

export default LayoutComponentsDemo;
