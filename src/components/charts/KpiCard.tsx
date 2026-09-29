import type { ReactNode } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Tooltip } from "antd";
import { color as tokens, espacio, radio, sombra, tipografia } from "@/design/tokens";
import { colorTexto, type ColorKit } from "@/design/colorRol";

interface KpiCardBase {
  /**
   * Borde superior, valor e icono. Un rol (`"monto"`, `"riesgo"`, `"bueno"`, `"malo"`, `"neutro"`,
   * `"accion"`…) o un color propio (el de un nivel de riesgo que viene del backend), que se oscurece
   * solo si no se lee sobre blanco. Por defecto, `"tinta"`.
   */
  color?: ColorKit;
  sufijo?: ReactNode;
  etiquetaSecundaria?: ReactNode;
  /** Normalmente un `Delta` de `shared/analitica`. */
  valorSecundario?: ReactNode;
  /** Pie de la tarjeta. Sin él no se pinta el separador. */
  pie?: ReactNode;
  icono?: ReactNode;
  /** Ayuda junto al título (icono de información con tooltip). */
  ayuda?: ReactNode;
  className?: string;

  /** @deprecated usar `color` */
  mainColor?: string;
  /** @deprecated usar `sufijo` */
  mainSuffix?: ReactNode;
  /** @deprecated usar `etiquetaSecundaria` */
  secondaryLabel?: ReactNode;
  /** @deprecated usar `valorSecundario` */
  secondaryValue?: ReactNode;
  /** @deprecated usar `pie` */
  footerContent?: ReactNode;
  /** @deprecated usar `icono` */
  icon?: ReactNode;
  /** @deprecated usar `ayuda` */
  tooltip?: ReactNode;
}

type KpiCardProps = KpiCardBase &
  ({ titulo: ReactNode; title?: never } | { /** @deprecated usar `titulo` */ title: ReactNode; titulo?: never }) &
  ({ valor: ReactNode; mainValue?: never } | { /** @deprecated usar `valor` */ mainValue: ReactNode; valor?: never });

/**
 * Tarjeta de indicador de dashboard. Va dentro de `FilaKpis`
 * (ver `docs/VISTAS_ANALITICAS.md` §5). Los nombres en inglés (`title`, `mainValue`…) siguen
 * funcionando marcados como obsoletos; se retiran en 1.0.
 */
const { escala } = tipografia;
/** Márgenes en múltiplos de `espacio.unidad`, no en píxeles fijos. */
const u = espacio.unidad;

const KpiCard = (props: KpiCardProps) => {
  const titulo = props.titulo ?? props.title;
  const valor = props.valor ?? props.mainValue;
  const tono = colorTexto(props.color ?? props.mainColor ?? "tinta");
  const sufijo = props.sufijo ?? props.mainSuffix ?? "";
  const etiquetaSecundaria = props.etiquetaSecundaria ?? props.secondaryLabel;
  const valorSecundario = props.valorSecundario ?? props.secondaryValue;
  const pie = props.pie ?? props.footerContent;
  const icono = props.icono ?? props.icon;
  const ayuda = props.ayuda ?? props.tooltip;

  return (
    <Card
      size="small"
      variant="borderless"
      className={props.className}
      style={{
        borderRadius: radio.contenedor,
        boxShadow: sombra.tarjeta,
        height: "100%",
        borderTop: `4px solid ${tono}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: u * 2 }}>
        <span
          style={{
            fontSize: escala.rotulo.tamano,
            lineHeight: `${escala.rotulo.interlineado}px`,
            color: tokens.tinta.tenue,
            fontWeight: tipografia.peso.semibold,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {titulo}
          {ayuda && (
            <Tooltip title={ayuda}>
              <InfoCircleOutlined style={{ marginLeft: u * 1.5, color: tokens.tinta.deshabilitada, cursor: "pointer" }} />
            </Tooltip>
          )}
        </span>
        {icono && <div style={{ color: tono, opacity: 0.4, fontSize: escala.subtitulo.tamano }}>{icono}</div>}
      </div>

      <div style={{ fontSize: escala.cifra.tamano, lineHeight: `${escala.cifra.interlineado}px`, fontWeight: tipografia.peso.black, color: tono }}>
        {valor}
        <span style={{ fontSize: escala.detalle.tamano, fontWeight: tipografia.peso.semibold, color: tokens.tinta.tenue, marginLeft: u }}>{sufijo}</span>
      </div>

      <div style={{ marginTop: u * 3, display: "flex", alignItems: "center", fontSize: escala.cuerpo.tamano, lineHeight: `${escala.cuerpo.interlineado}px`, fontWeight: tipografia.peso.medio }}>
        {valorSecundario}
        <span style={{ marginLeft: u * 1.5, color: tokens.tinta.tenue, fontSize: escala.detalle.tamano }}>{etiquetaSecundaria}</span>
      </div>

      {pie && (
        <div
          style={{
            marginTop: u * 3,
            paddingTop: u * 3,
            borderTop: `1px solid ${tokens.linea.sutil}`,
            fontSize: escala.detalle.tamano,
            lineHeight: `${escala.detalle.interlineado}px`,
            color: tokens.tinta.tenue,
          }}
        >
          {pie}
        </div>
      )}
    </Card>
  );
};

export default KpiCard;
