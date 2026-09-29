import type { ReactNode } from "react";

interface CampoListadoProps {
  /** Rótulo en mayúsculas sobre el control. */
  etiqueta?: string;
  children: ReactNode;
  /** Búsqueda libre: ocupa el espacio que sobre (hasta 384 px). */
  amplio?: boolean;
  className?: string;

  /** @deprecated usar `etiqueta` */
  label?: string;
}

/** Un filtro o búsqueda de la barra CRUD. Rótulo en mayúsculas. */
export const CampoListado = ({ etiqueta, label, children, amplio = false, className = "" }: CampoListadoProps) => {
  const rotulo = etiqueta ?? label;
  return (
    <label className={`flex min-w-44 flex-col gap-1 ${amplio ? "max-w-96 min-w-56 flex-1" : ""} ${className}`}>
      {rotulo ? (
        <span className="text-rotulo font-semibold uppercase tracking-wide text-tinta-tenue">{rotulo}</span>
      ) : null}
      {children}
    </label>
  );
};

interface BarraListadoBase {
  /** Botones a la derecha (el CTA "Nuevo", Excel…). */
  acciones?: ReactNode;
  className?: string;

  /** @deprecated usar `acciones` */
  actions?: ReactNode;
}

type BarraListadoProps = BarraListadoBase &
  ({ campos: ReactNode; fields?: never } | { /** @deprecated usar `campos` */ fields: ReactNode; campos?: never });

/**
 * Toolbar de listas CRUD: filtros a la izquierda, CTA a la derecha.
 * No usar en `VistaAnalitica` (ahí va `BarraFiltros`).
 */
const BarraListado = (props: BarraListadoProps) => {
  const campos = props.campos ?? props.fields;
  const acciones = props.acciones ?? props.actions;
  return (
    <div
      className={
        `mb-3.5 flex flex-wrap items-end justify-between gap-3 rounded-tarjeta ` +
        `border border-linea bg-superficie px-3.5 py-3 ${props.className ?? ""}`
      }
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">{campos}</div>
      {acciones ? <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div> : null}
    </div>
  );
};

export default BarraListado;
