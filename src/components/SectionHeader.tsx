import React from "react";
import { Typography } from "antd";
import { colorTexto, type ColorKit } from "@/design/colorRol";

const { Title } = Typography;

interface SectionHeaderBase {
  /** Color del icono: un rol (`"exito"`, `"advertencia"`…) o un color propio. Por defecto, `"accion"`. */
  colorIcono?: ColorKit;
  className?: string;
}

type SectionHeaderProps = SectionHeaderBase &
  ({ icono: React.ReactNode; icon?: never } | { /** @deprecated usar `icono` */ icon: React.ReactNode; icono?: never }) &
  ({ titulo: string; title?: never } | { /** @deprecated usar `titulo` */ title: string; titulo?: never });

const SectionHeader = (props: SectionHeaderProps) => {
  const icono = props.icono ?? props.icon;
  const titulo = props.titulo ?? props.title;
  return (
    <div className={`flex items-center gap-2 mb-4 ${props.className ?? ""}`}>
      {/* Sin `colorIcono` va la clase del token (cambia con el tema); con él, el color resuelto. */}
      <span
        className={`text-subtitulo ${props.colorIcono ? "" : "text-accion"}`}
        style={props.colorIcono ? { color: colorTexto(props.colorIcono) } : undefined}
      >
        {icono}
      </span>
      <Title level={5} className="!mb-0 !text-tinta">{titulo}</Title>
    </div>
  );
};

export default SectionHeader;
