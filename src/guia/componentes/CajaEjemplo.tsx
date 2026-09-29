import { ComponentType, useState } from "react";
import { Button, Tooltip } from "antd";
import { CodeOutlined } from "@ant-design/icons";
import BloqueCodigo, { BotonCopiar } from "./BloqueCodigo";
import Texto from "./Texto";

export interface Ejemplo {
  id: string;
  titulo: string;
  /** Qué enseña el ejemplo, en una o dos frases. */
  descripcion: string;
  Componente: ComponentType;
  /** El archivo del ejemplo tal cual (`import codigo from "./Ejemplo.tsx?raw"`): nunca se desincroniza. */
  codigo: string;
  /** Ocupa las dos columnas (gráficas anchas o pares de gráficas). */
  ancho?: boolean;
}

/**
 * Caja de ejemplo al estilo de la documentación de antd: el ejemplo vivo arriba, título y
 * descripción, y el código del archivo que se está ejecutando (desplegable y copiable).
 */
const CajaEjemplo = ({ ejemplo }: { ejemplo: Ejemplo }) => {
  const [conCodigo, setConCodigo] = useState(false);
  const { id, titulo, descripcion, Componente, codigo } = ejemplo;
  return (
    <section
      id={id}
      className={`scroll-mt-20 rounded-tarjeta border border-linea bg-superficie min-w-0 ${ejemplo.ancho ? "@4xl:col-span-2" : ""}`}
    >
      <div className="p-4">
        <Componente />
      </div>
      <div className="relative border-t border-linea-sutil px-4 pt-4 pb-2">
        <span className="absolute -top-2.5 left-3 bg-superficie px-2 text-cuerpo font-semibold text-tinta">
          {titulo}
        </span>
        <p className="m-0 text-detalle text-tinta-secundaria">
          <Texto>{descripcion}</Texto>
        </p>
        <div className="flex justify-center gap-1 mt-2 pt-2 border-t border-dashed border-linea-sutil">
          <Tooltip title={conCodigo ? "Ocultar código" : "Ver código"}>
            <Button
              size="small"
              type={conCodigo ? "link" : "text"}
              icon={<CodeOutlined />}
              aria-expanded={conCodigo}
              onClick={() => setConCodigo((v) => !v)}
            />
          </Tooltip>
          <BotonCopiar texto={codigo} />
        </div>
      </div>
      {conCodigo && (
        <div className="border-t border-linea-sutil p-2">
          <BloqueCodigo codigo={codigo} conCopiar={false} />
        </div>
      )}
    </section>
  );
};

export default CajaEjemplo;
