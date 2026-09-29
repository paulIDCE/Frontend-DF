import { Tag } from "antd";
import { estiloChip, type ColorKit } from "@/design/colorRol";

interface StatusTagBase {
  textoActivo?: string;
  textoInactivo?: string;
  /** Color en estado activo: un rol o un color propio. Por defecto, el azul `processing` de antd. */
  colorActivo?: ColorKit;
  /** Color en estado inactivo. Por defecto, el gris `default` de antd. */
  colorInactivo?: ColorKit;
  className?: string;

  /** @deprecated usar `textoActivo` */
  activeLabel?: string;
  /** @deprecated usar `textoInactivo` */
  inactiveLabel?: string;
}

type StatusTagProps = StatusTagBase &
  ({ activo: boolean; active?: never } | { /** @deprecated usar `activo` */ active: boolean; activo?: never });

const StatusTag = (props: StatusTagProps) => {
  const activo = props.activo ?? props.active;
  const texto = activo ? props.textoActivo ?? props.activeLabel ?? "Activo" : props.textoInactivo ?? props.inactiveLabel ?? "Inactivo";
  const propio = activo ? props.colorActivo : props.colorInactivo;
  return (
    <Tag
      color={propio ? undefined : activo ? "processing" : "default"}
      className={`rounded-full ${props.className ?? ""}`}
      style={{ padding: "0 12px", ...(propio ? estiloChip(propio) : {}) }}
    >
      {texto}
    </Tag>
  );
};

export default StatusTag;
