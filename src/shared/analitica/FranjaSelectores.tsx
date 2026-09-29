import { Fragment, ReactNode } from "react";

/**
 * Franja con grupos de selectores rotulados y separados (p. ej. DIMENSIÓN | VISTA). Dos
 * `Segmented` juntos sin rotulo se leian como un solo control.
 */
const FranjaSelectores = ({
  grupos,
  extra,
  className = "",
}: {
  grupos: { rotulo: string; control: ReactNode }[];
  /** Texto o controles al final de la franja. */
  extra?: ReactNode;
  className?: string;
}) => (
  <div className={`flex items-center gap-4 flex-wrap bg-superficie-sutil border border-linea rounded-tarjeta px-3 py-2 ${className}`}>
    {grupos.map((g, i) => (
      <Fragment key={g.rotulo}>
        {i > 0 && <span className="h-6 w-px bg-linea-fuerte" aria-hidden />}
        <span className="text-rotulo font-semibold uppercase tracking-wide text-tinta-tenue">{g.rotulo}</span>
        {g.control}
      </Fragment>
    ))}
    {extra}
  </div>
);

export default FranjaSelectores;
