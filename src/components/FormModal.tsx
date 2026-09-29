import React from "react";
import { Modal, Form, Button, Space, FormInstance } from "antd";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { useStackedOverlayProps } from "@/hooks/useStackedModalZIndex";

interface FormModalProps<T = Record<string, unknown>> {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: T) => void;
  form: FormInstance;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  width?: number;
}

const FormModal = <T,>({
  open,
  onCancel,
  onFinish,
  form,
  title,
  children,
  loading = false,
  width = 800,
}: FormModalProps<T>) => {
  const overlay = useStackedOverlayProps(open);

  return (
    <Modal
      title={title}
      style={{ top: 30 }}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={width}
      destroyOnHidden
      zIndex={overlay.zIndex}
      getContainer={overlay.getContainer}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {children}
        <Form.Item className="mb-0 mt-4">
          <Space className="w-full justify-end">
            <Button onClick={onCancel} icon={<CloseOutlined />}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Guardar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;
