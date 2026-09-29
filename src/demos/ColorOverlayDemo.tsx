import { useState } from "react";
import { Button, ColorPicker, Form, Input, Space } from "antd";
import { ColorSwatch, FormModal, valorColorHex, color } from "@idce/kit";
import GuiaUso from "./GuiaUso";

type ValoresColor = { nombre: string; colorHex?: string };

const ColorOverlayDemo = () => {
  const [form] = Form.useForm<ValoresColor>();
  const [formHijo] = Form.useForm<{ nota: string }>();
  const [abierto, setAbierto] = useState(false);
  const [hijo, setHijo] = useState(false);
  const [guardado, setGuardado] = useState<ValoresColor>({
    nombre: "Rango alto",
    colorHex: color.advertencia.base,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ColorSwatch color={guardado.colorHex} mostrarHex />
        <span className="text-cuerpo text-tinta">{guardado.nombre}</span>
        <Button
          type="primary"
          onClick={() => {
            form.setFieldsValue(guardado);
            setAbierto(true);
          }}
        >
          Editar color
        </Button>
      </div>

      <FormModal<ValoresColor>
        open={abierto}
        form={form}
        title="Color de la escala"
        onCancel={() => setAbierto(false)}
        onFinish={(values) => {
          setGuardado({
            nombre: values.nombre,
            colorHex: values.colorHex,
          });
          setAbierto(false);
        }}
      >
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="colorHex"
          label="Color"
          getValueFromEvent={valorColorHex}
          rules={[{ required: true, message: "Elija un color" }]}
        >
          <ColorPicker showText format="hex" />
        </Form.Item>
        <Space>
          <Button onClick={() => setHijo(true)}>Abrir segundo modal</Button>
          <span className="text-detalle text-tinta-tenue">
            Debe quedar encima de este (z-index apilado).
          </span>
        </Space>
      </FormModal>

      <FormModal
        open={hijo}
        form={formHijo}
        title="Modal encima"
        width={420}
        onCancel={() => setHijo(false)}
        onFinish={() => setHijo(false)}
      >
        <Form.Item name="nota" label="Nota">
          <Input placeholder="El segundo FormModal no queda tapado" />
        </Form.Item>
      </FormModal>

      <GuiaUso
        pieza={<code>ColorSwatch</code>}
        usar={[
          "El API guarda un color editable en hex.",
          "En grilla: swatch. En form: ColorPicker + valorColorHex.",
        ]}
        evitar={[
          "Input de texto libre para un color.",
          "Formato legado r;g;b: se queda en el sistema de origen.",
          "Semáforo de riesgo: ChipNivel o tokens de KPI, no este swatch.",
        ]}
      />
    </div>
  );
};

export default ColorOverlayDemo;
