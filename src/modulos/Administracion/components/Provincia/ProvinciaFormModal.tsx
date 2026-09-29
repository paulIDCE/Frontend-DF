import { useEffect } from "react";
import { Form, Input, InputNumber, Select, Row, Col } from "antd";
import { FormModal } from "@idce/kit";
import type { Provincia, ProvinciaFormValues } from "@/types/provincia";

/**
 * Form popup de Provincia (§7: separado de la tabla y del Menu).
 *
 * Sirve para alta y edicion: si llega `provincia`, precarga el formulario.
 * `FormModal` monta con `destroyOnHidden`, pero el `useEffect` sincroniza los
 * valores igual cuando se pasa de un registro a otro sin cerrar el modal.
 */
interface ProvinciaFormModalProps {
  open: boolean;
  /** `undefined` = alta */
  provincia?: Provincia;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: ProvinciaFormValues) => void;
}

const ProvinciaFormModal = ({
  open,
  provincia,
  loading,
  onCancel,
  onSubmit,
}: ProvinciaFormModalProps) => {
  const [form] = Form.useForm<ProvinciaFormValues>();

  useEffect(() => {
    if (!open) return;
    if (provincia) {
      form.setFieldsValue(provincia);
    } else {
      form.resetFields();
      form.setFieldsValue({ estado: "A", peso: 0 });
    }
  }, [open, provincia, form]);

  return (
    <FormModal
      open={open}
      form={form}
      title={provincia ? "Editar provincia" : "Nueva provincia"}
      loading={loading}
      onCancel={onCancel}
      onFinish={onSubmit}
      width={640}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="codigo"
            label="Codigo"
            rules={[{ required: true, message: "El codigo es obligatorio" }]}
          >
            <Input maxLength={10} placeholder="Ej. PIC" />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: "El nombre es obligatorio" }]}
          >
            <Input maxLength={100} placeholder="Ej. Pichincha" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="paisIso2"
            label="Pais (ISO2)"
            rules={[
              { required: true, message: "El pais es obligatorio" },
              { len: 2, message: "Deben ser 2 caracteres" },
            ]}
          >
            <Input maxLength={2} placeholder="EC" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="region" label="Region">
            <Input maxLength={50} placeholder="Ej. Sierra" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="peso" label="Peso">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="estado" label="Estado">
        <Select
          options={[
            { value: "A", label: "Activo" },
            { value: "I", label: "Inactivo" },
          ]}
        />
      </Form.Item>
    </FormModal>
  );
};

export default ProvinciaFormModal;
