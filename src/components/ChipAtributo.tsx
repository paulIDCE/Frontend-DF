/* eslint-disable react-refresh/only-export-components */
import { Tag, Tooltip } from "antd";
import { estiloChip, type ColorKit } from "@/design/colorRol";

export type ColorAtributo =
  | "blue"
  | "cyan"
  | "geekblue"
  | "gold"
  | "green"
  | "orange"
  | "purple"
  | "red"
  | "default";

const PRESETS_ATRIBUTO = new Set<string>(["blue", "cyan", "geekblue", "gold", "green", "orange", "purple", "red", "default"]);

/**
 * Color de un chip: un preset de antd (`"blue"`…, como siempre), un rol del kit (`"exito"`,
 * `"riesgo"`…) o un color propio (el de un catálogo que viene del backend).
 */
export type ColorChip = ColorAtributo | ColorKit;

/** Props de `Tag` para un `ColorChip`: el preset va a antd; rol o color propio, a `estiloChip`. */
export const propsColorChip = (color: ColorChip) =>
  PRESETS_ATRIBUTO.has(color) ? { color } : { style: estiloChip(color) };

export interface ItemAtributo {
  categoria: string;
  valor?: string | null;
  color?: ColorChip;
}

interface ChipAtributoProps {
  categoria: string;
  valor?: string | null;
  color?: ColorChip;
  className?: string;
}

/** Chip corto: visible el valor; tooltip `categoría: valor`. */
export const ChipAtributo = ({
  categoria,
  valor,
  color = "blue",
  className = "",
}: ChipAtributoProps) => {
  const text = (valor ?? "").trim();
  if (!text) {
    return (
      <Tooltip title={`${categoria}: sin valor`}>
        <Tag className={`m-0 px-1.5 text-rotulo leading-4 ${className}`} color="default">
          —
        </Tag>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={`${categoria}: ${text}`}>
      <Tag className={`m-0 max-w-28 px-1.5 text-rotulo leading-4 ${className}`} {...propsColorChip(color)}>
        <span className="block truncate">{text}</span>
      </Tag>
    </Tooltip>
  );
};

interface AtributosCellProps {
  items: ItemAtributo[];
  className?: string;
}

/** Une varios catálogos cortos en una sola columna. */
export const AtributosCell = ({ items, className = "" }: AtributosCellProps) => (
  <div className={`flex flex-wrap gap-1 ${className}`}>
    {items.map((item) => (
      <ChipAtributo
        key={item.categoria}
        categoria={item.categoria}
        valor={item.valor}
        color={item.color}
      />
    ))}
  </div>
);

export default ChipAtributo;
