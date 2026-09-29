import { Tooltip } from "antd";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const normalizarHex = (value?: string | null): string | undefined => {
  const raw = (value ?? "").trim();
  if (!raw) return undefined;
  if (HEX.test(raw)) {
    if (raw.length === 4) {
      return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
    }
    return raw.toLowerCase();
  }
  if (raw.startsWith("rgb")) return raw;
  return undefined;
};

interface ColorSwatchProps {
  color?: string | null;
  /** Lado del cuadro en px (22). */
  tamano?: number;
  /** Muestra el valor al lado del cuadro. */
  mostrarHex?: boolean;
  className?: string;

  /** @deprecated usar `tamano` */
  size?: number;
  /** @deprecated usar `mostrarHex` */
  showHex?: boolean;
}

/** Cuadro de color (hex o css). En grilla, no un Input de texto libre. */
const ColorSwatch = ({ color, tamano, mostrarHex, className = "", size, showHex }: ColorSwatchProps) => {
  const css = normalizarHex(color);
  const etiqueta = css ?? "sin color";
  const lado = tamano ?? size ?? 22;
  const conHex = mostrarHex ?? showHex ?? false;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Tooltip title={etiqueta}>
        <span
          aria-label={etiqueta}
          className="inline-block shrink-0 rounded-marca border border-linea"
          style={{
            width: lado,
            height: lado,
            backgroundColor: css ?? undefined,
          }}
        />
      </Tooltip>
      {conHex && css ? (
        <span className="font-mono text-detalle text-tinta-tenue">{css}</span>
      ) : null}
    </span>
  );
};

export default ColorSwatch;
