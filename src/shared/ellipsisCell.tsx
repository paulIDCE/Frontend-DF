/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { Tooltip } from "antd";

interface EllipsisCellProps {
  value?: string | number | null;
  /** Qué pintar si no hay valor. Por defecto no se pinta nada. */
  vacio?: ReactNode;
}

/**
 * Celda truncada con tooltip del texto completo.
 * No usar para identidad (`IdentityCell`) ni para chips.
 */
const EllipsisCell = ({ value, vacio = null }: EllipsisCellProps) => {
  if (value == null || value === "") return <>{vacio}</>;
  const text = String(value);
  return (
    <Tooltip title={text}>
      <span className="block truncate">{text}</span>
    </Tooltip>
  );
};

/** Cabecera de columna que puede partir en dos líneas. */
export const wrapColumnTitle = (text: string) => (
  <span className="inline-block whitespace-normal text-rotulo font-semibold leading-tight">
    {text}
  </span>
);

export default EllipsisCell;
