import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface EmptyStateProps {
  mensaje?: string;
  /** Si se pasa, aparece el botón para volver a cargar. */
  onRecargar?: () => void;
  textoBoton?: string;
  className?: string;

  /** @deprecated usar `mensaje` */
  message?: string;
  /** @deprecated usar `onRecargar` */
  onReload?: () => void;
  /** @deprecated usar `textoBoton` */
  buttonText?: string;
}

const MENSAJE = "No hay datos disponibles. Por favor, intente nuevamente más tarde.";

const EmptyState = (props: EmptyStateProps) => {
  const mensaje = props.mensaje ?? props.message ?? MENSAJE;
  const onRecargar = props.onRecargar ?? props.onReload;
  const textoBoton = props.textoBoton ?? props.buttonText ?? "Cargar datos";
  return (
    <div className={`text-center py-8 ${props.className ?? ""}`}>
      <p className="text-tinta-tenue mb-4">{mensaje}</p>
      {onRecargar && (
        <Button type="primary" icon={<ReloadOutlined />} onClick={onRecargar}>
          {textoBoton}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
