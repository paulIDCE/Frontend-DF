import { useState } from "react";
import {
  Progress, Skeleton, Result, Alert, Modal, Drawer, Button, Space, Spin, notification,
} from "antd";
import { SmileOutlined } from "@ant-design/icons";

const FeedbackDemo = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openNotification = () => {
    notification.open({
      message: "Notificación",
      description: "Este es un mensaje de notificación de Ant Design.",
      placement: "topRight",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Progress</h4>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Progress percent={30} />
          <Progress percent={70} status="active" />
          <Progress percent={100} />
          <Progress percent={50} showInfo={false} />
          <Progress percent={50} size="small" />
          <Progress type="circle" percent={75} />
          <Progress type="dashboard" percent={60} />
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Skeleton (esqueleto de carga)</h4>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Skeleton active />
          <Skeleton active avatar paragraph={{ rows: 2 }} />
          <Skeleton.Input active style={{ width: 200 }} />
          <div className="flex gap-4 items-center">
            <Skeleton.Avatar active />
            <Skeleton active title={false} paragraph={{ rows: 1 }} style={{ width: 300 }} />
          </div>
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Spin (loading spinner)</h4>
        <Space size="large">
          <Spin />
          <Spin size="small" />
          <Spin size="large" />
          <Spin description="Cargando...">
            <div className="bg-superficie p-8 rounded-tarjeta" style={{ padding: 50 }}>Contenido con overlay</div>
          </Spin>
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Alert</h4>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Alert title="Success alert" type="success" showIcon closable />
          <Alert title="Info alert" description="Con descripción adicional." type="info" showIcon closable />
          <Alert title="Warning alert" type="warning" showIcon closable />
          <Alert title="Error alert" type="error" showIcon closable />
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Result</h4>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Result
            status="success"
            title="Operación exitosa"
            subTitle="Los cambios han sido guardados correctamente."
            extra={[<Button key="ok" type="primary">OK</Button>]}
          />
          <Result
            status="error"
            title="Error en la operación"
            subTitle="Por favor intente nuevamente."
            extra={[<Button key="retry">Reintentar</Button>]}
          />
          <Result icon={<SmileOutlined />} title="Resultado personalizado" />
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Modal, Drawer, Notification</h4>
        <Space>
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Abrir Modal
          </Button>
          <Button onClick={() => setDrawerOpen(true)}>Abrir Drawer</Button>
          <Button onClick={openNotification}>Notificación</Button>
        </Space>

        <Modal title="Modal de ejemplo" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
          <p className="text-tinta-secundaria">Modal sin footer, siguiendo el patrón SSO. El contenido puede incluir formularios, tablas o mensajes.</p>
        </Modal>

        <Drawer title="Drawer de ejemplo" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <p className="text-tinta-secundaria">Drawer lateral para paneles de detalle o formularios extensos.</p>
        </Drawer>
      </div>
    </div>
  );
};

export default FeedbackDemo;
