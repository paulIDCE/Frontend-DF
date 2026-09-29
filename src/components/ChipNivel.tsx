/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { Tag, Tooltip } from "antd";
import { propsColorChip, type ColorChip } from "./ChipAtributo";

/** Paleta canónica por profundidad: Tipo → Macro → Proceso → Sub → hoja. */
export const PALETA_NIVEL = ["blue", "geekblue", "cyan", "purple", "default"] as const;

export type ColorNivel = (typeof PALETA_NIVEL)[number];

export const colorNivel = (nivel: number, esHoja = false): ColorNivel => {
  if (esHoja) return "default";
  const idx = Math.max(0, Math.min(nivel, PALETA_NIVEL.length - 1));
  return PALETA_NIVEL[idx];
};

export interface NodoArbolBase {
  key: string;
  children?: NodoArbolBase[];
}

/** Todas las keys visibles de un árbol (para Expandir todo). */
export const clavesDeArbol = (nodos: NodoArbolBase[]): string[] =>
  nodos.flatMap((n) => [n.key, ...(n.children ? clavesDeArbol(n.children) : [])]);

interface ChipNivelProps {
  /** Texto del chip (Tipo, Macro, Proceso…). */
  etiqueta: string;
  /** Profundidad 0…n. Se ignora si se pasa `color`. */
  nivel?: number;
  esHoja?: boolean;
  /**
   * Color fijo en vez del de la profundidad: un preset de `PALETA_NIVEL`, un rol del kit o un color
   * propio.
   */
  color?: ColorNivel | ColorChip;
  /** Sidebar estrecho: chip más chico, nombre con wrap. */
  compacto?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Chrome del nodo: Tag de nivel + nombre.
 * El chip es el nivel de estructura, no el estado del registro.
 */
const ChipNivel = ({
  etiqueta,
  nivel = 0,
  esHoja = false,
  color,
  compacto = false,
  className = "",
  children,
}: ChipNivelProps) => {
  const texto = typeof children === "string" ? children : undefined;
  const chip = (
    <Tag
      {...propsColorChip(color ?? colorNivel(nivel, esHoja))}
      className={compacto ? "m-0 shrink-0 px-1 text-rotulo leading-4" : "m-0 shrink-0"}
    >
      {etiqueta}
    </Tag>
  );

  if (compacto) {
    return (
      <span className={`inline-flex max-w-full items-start gap-1 text-rotulo leading-snug ${className}`}>
        {chip}
        <Tooltip title={texto}>
          <span className="min-w-0 break-words">{children}</span>
        </Tooltip>
      </span>
    );
  }

  return (
    <span className={`inline-flex max-w-full items-center gap-2 ${className}`}>
      {chip}
      <Tooltip title={texto}>
        <span className="min-w-0 truncate text-cuerpo text-tinta">{children}</span>
      </Tooltip>
    </span>
  );
};

export default ChipNivel;
