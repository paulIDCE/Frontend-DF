import { ReactNode } from "react";
import { CheckCircleOutlined, StopOutlined } from "@ant-design/icons";

/**
 * Bloque "cuándo usarlo" de las demos: qué casos resuelve una pieza y cuándo conviene otra.
 * Solo para la guía de estilos; no es un componente de producto.
 */
const GuiaUso = ({
  usar,
  evitar,
  pieza,
}: {
  usar: ReactNode[];
  evitar: ReactNode[];
  /** Import o ruta de la pieza que se documenta. */
  pieza?: ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="rounded-tarjeta border border-exito-borde bg-exito-sutil/60 px-3 py-2">
        <div className="text-rotulo font-semibold uppercase tracking-wide text-exito mb-1 flex items-center gap-1.5">
          <CheckCircleOutlined /> Usar cuando
        </div>
        <ul className="list-disc pl-4 text-cuerpo text-tinta flex flex-col gap-0.5">
          {usar.map((texto, i) => (
            <li key={i}>{texto}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-tarjeta border border-linea bg-superficie-sutil px-3 py-2">
        <div className="text-rotulo font-semibold uppercase tracking-wide text-tinta-tenue mb-1 flex items-center gap-1.5">
          <StopOutlined /> Evitar / usar otra cosa
        </div>
        <ul className="list-disc pl-4 text-cuerpo text-tinta flex flex-col gap-0.5">
          {evitar.map((texto, i) => (
            <li key={i}>{texto}</li>
          ))}
        </ul>
      </div>
    </div>
    {pieza && <div className="text-detalle text-tinta-tenue">Pieza: {pieza}</div>}
  </div>
);

export default GuiaUso;
