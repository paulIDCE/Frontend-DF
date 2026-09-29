import { ReactNode } from "react";

/**
 * Encabezado y contenedor de un bloque de un panel de detalle (drawer o modal que se abre desde
 * una fila o un punto de una gráfica).
 *
 * Nació en un drawer de detalle cuyos bloques compartían la misma estructura: un título,
 * opcionalmente algo alineado a la derecha, y el contenido debajo. Vive aquí para que no haya una
 * versión del mismo `<h2>` por cada panel.
 *
 * Diferencia con el original: colores y tamaños salen de los tokens (`text-subtitulo`, `text-tinta`,
 * `border-linea`…), no de clases `slate-*` sueltas.
 */

interface BloqueDetalleProps {
  titulo: string;
  /** Contenido alineado a la derecha del titulo: chips, marcas, contadores. */
  extra?: ReactNode;
  /** Linea de contexto bajo el titulo, cuando el bloque necesita una aclaracion fija. */
  subtitulo?: ReactNode;
  className?: string;
  children: ReactNode;
}

const BloqueDetalle = ({ titulo, extra, subtitulo, className = "", children }: BloqueDetalleProps) => (
  <section className={`flex flex-col gap-4 ${className}`}>
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 text-subtitulo font-semibold text-tinta">{titulo}</h2>
        {extra && <div className="flex flex-wrap items-center gap-2">{extra}</div>}
      </div>
      {subtitulo && <p className="m-0 text-detalle text-tinta-tenue">{subtitulo}</p>}
    </div>

    {children}
  </section>
);

/**
 * Par etiqueta / valor.
 *
 * Es el equivalente de casa a `Descriptions` de antd, que **no se usa en el ecosistema**: nació
 * dentro de un bloque de detalle y se extrajo cuando los demás necesitaron lo mismo.
 * El valor va como `children` para poder darle formato (moneda, `tabular-nums`, color de alerta).
 */
export const Dato = ({ etiqueta, className = "", children }: { etiqueta: string; className?: string; children: ReactNode }) => (
  <div className={`flex flex-col min-w-0 ${className}`}>
    <span className="text-rotulo uppercase tracking-wide text-tinta-tenue">{etiqueta}</span>
    <span className="text-cuerpo text-tinta-secundaria">{children}</span>
  </div>
);

/** Columnas de `FichaDatos`. Clases literales: Tailwind no lee nombres armados en tiempo de ejecucion. */
const COLUMNAS_FICHA: Record<2 | 3 | 4 | 5, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
};

/**
 * Rejilla de `Dato` sobre fondo hundido: la "ficha" de cabecera de un bloque (identificación,
 * conteos, exposición…). Sin ella cada panel repite el mismo `grid … rounded … border … p-3`.
 */
export const FichaDatos = ({
  columnas = 3,
  enmarcada = true,
  children,
  className = "",
}: {
  columnas?: 2 | 3 | 4 | 5;
  /** `false`: solo la rejilla, sin caja (para datos sueltos dentro de otro contenedor). */
  enmarcada?: boolean;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`grid ${COLUMNAS_FICHA[columnas]} gap-x-6 gap-y-3 ${
      enmarcada ? "rounded-tarjeta border border-linea bg-superficie-hundida p-3" : ""
    } ${className}`}
  >
    {children}
  </div>
);

export default BloqueDetalle;
