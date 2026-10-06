import { useState, type ComponentType } from "react";
import { Segmented } from "antd";
import { FranjaSelectores, useImpresion } from "@idce/kit";

export interface OpcionHoja {
  key: string;
  titulo: string;
  Componente: ComponentType;
}

/**
 * Una hoja que reune varias casi identicas (una por segmento) con un selector (plan 06, item
 * 1.20; 03 §7). En el PDF salen todas, una tras otra.
 */
export const HojaConSelector = ({ rotulo, opciones }: { rotulo: string; opciones: OpcionHoja[] }) => {
  const impresion = useImpresion();
  const [key, setKey] = useState(opciones[0].key);
  const activa = opciones.find((o) => o.key === key) ?? opciones[0];

  if (impresion)
    return (
      <div className="flex flex-col gap-6">
        {opciones.map(({ key: k, Componente }) => (
          <Componente key={k} />
        ))}
      </div>
    );

  return (
    <>
      <div className="mb-3">
        <FranjaSelectores
          grupos={[
            {
              rotulo,
              control: <Segmented value={activa.key} onChange={(v) => setKey(String(v))} options={opciones.map((o) => ({ value: o.key, label: o.titulo }))} />,
            },
          ]}
        />
      </div>
      <activa.Componente key={activa.key} />
    </>
  );
};
