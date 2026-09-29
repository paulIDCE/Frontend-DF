import { Tooltip } from "antd";

/**
 * Un dato de la segunda línea. `etiqueta` / `valor`; `label` / `value` siguen funcionando
 * (obsoletos, se retiran en 1.0).
 */
export type IdentityMetaItem =
  | { etiqueta: string; valor: string | null | undefined; label?: never; value?: never }
  | { /** @deprecated usar `etiqueta` */ label: string; /** @deprecated usar `valor` */ value: string | null | undefined; etiqueta?: never; valor?: never };

interface IdentityCellBase {
  /** Segunda línea etiquetada (`Código: 02 · Teléfonos: …`). Vacío no se pinta. */
  meta?: IdentityMetaItem[];
  /** Tooltip del nombre; por defecto, el propio nombre. */
  tooltipTitulo?: string;
  className?: string;

  /** @deprecated usar `tooltipTitulo` */
  titleTooltip?: string;
}

type IdentityCellProps = IdentityCellBase &
  ({ titulo: string; title?: never } | { /** @deprecated usar `titulo` */ title: string; titulo?: never });

type MetaNorm = { etiqueta: string; valor: string };

const normalizarMeta = (meta?: IdentityMetaItem[]): MetaNorm[] =>
  (meta ?? [])
    .map((item): MetaNorm | null => {
      const valor = ((item.valor ?? item.value) ?? "").toString().trim();
      const etiqueta = (item.etiqueta ?? item.label ?? "").trim();
      if (!valor || !etiqueta) return null;
      return { etiqueta, valor };
    })
    .filter((item): item is MetaNorm => item != null);

/**
 * Columna primaria de un CRUD denso: nombre + meta etiquetada.
 * Usar cuando hay más de ~6–7 columnas útiles. No usar en mesas cortas.
 */
const IdentityCell = (props: IdentityCellProps) => {
  const titulo = props.titulo ?? props.title;
  const partes = normalizarMeta(props.meta);

  return (
    <div className={`min-w-0 ${props.className ?? ""}`}>
      <Tooltip title={props.tooltipTitulo ?? props.titleTooltip ?? titulo}>
        <div className="line-clamp-2 font-semibold text-cuerpo text-tinta">
          {titulo || "—"}
        </div>
      </Tooltip>
      {partes.length > 0 && (
        <div className="mt-0.5 text-detalle text-tinta-tenue">
          {partes.map((part, index) => (
            <span key={`${part.etiqueta}-${part.valor}-${index}`}>
              {index > 0 ? <span> · </span> : null}
              <span>
                {part.etiqueta}: {part.valor}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdentityCell;
