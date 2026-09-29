import { Card, Row, Col } from "antd";
import {
  EditOutlined, EllipsisOutlined, SettingOutlined,
} from "@ant-design/icons";

const CardsDemo = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Card básica</h4>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Card con título" variant="outlined">
              <p>Contenido de la card usando el borde por defecto de Ant Design.</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Card sin borde" variant="borderless" className="shadow-tarjeta">
              <p>Card sin borde con sombra ligera para un look más limpio.</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="Card pequeña">
              <p>Card con tamaño "small" para espacios compactos.</p>
            </Card>
          </Col>
        </Row>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Card con acciones</h4>
        <Row gutter={16}>
          <Col span={8}>
            <Card
              title="Configuración"
              actions={[<SettingOutlined key="setting" />, <EditOutlined key="edit" />, <EllipsisOutlined key="ellipsis" />]}
            >
              <p>Card con acciones en el footer. Ideal para tarjetas de configuración, perfiles, o ítems editables.</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              cover={<div className="bg-accion h-32 flex items-center justify-center text-tinta-inversa text-subtitulo font-bold">Cover</div>}
            >
              <Card.Meta title="Card con cover" description="Meta description con cover image arriba" />
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable>
              <Card.Meta
                avatar={<div className="w-10 h-10 bg-accion rounded-full flex items-center justify-center text-tinta-inversa font-bold">JD</div>}
                title="Card hoverable"
                description="Pasa el mouse para ver el efecto hover."
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Card grid (Ant Design Card.Grid)</h4>
        <Card>
          <Card.Grid hoverable={false} style={{ width: "25%" }}>
            <p className="text-center text-tinta-secundaria">Grid 1</p>
          </Card.Grid>
          <Card.Grid hoverable={false} style={{ width: "25%" }}>
            <p className="text-center text-tinta-secundaria">Grid 2</p>
          </Card.Grid>
          <Card.Grid hoverable={false} style={{ width: "25%" }}>
            <p className="text-center text-tinta-secundaria">Grid 3</p>
          </Card.Grid>
          <Card.Grid hoverable={false} style={{ width: "25%" }}>
            <p className="text-center text-tinta-secundaria">Grid 4</p>
          </Card.Grid>
        </Card>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Contenedor página SSO (PageContainer)</h4>
        <div className="bg-superficie rounded-contenedor p-4 shadow-contenedor">
          <p className="text-tinta-secundaria">
            Este es el patrón estándar de contenedor de página del SSO.
            Se implementa como el componente <code>PageContainer</code> del Starter Kit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardsDemo;
