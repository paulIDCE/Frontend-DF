import { createContext, useContext } from "react";
import type { Ctx } from "./datos";

/** Estado compartido por todas las hojas de la revista. */
export interface RevistaValor {
  ctx: Ctx;
  entidad: string;
  /** "Mostrar valores en gráficos" (interruptor de la barra de la revista). */
  etiquetas: boolean;
  tamano: string;
  rango: string;
  provincia: string;
  /** Sectores marcados en la hoja 2 (se conservan al cambiar de hoja o fecha). */
  sectores: string[];
  setSectores: (s: string[]) => void;
  /** Cambia la entidad de la revista (comparativo, rankings). */
  setEntidad: (entidad: string) => void;
}

export const RevistaContext = createContext<RevistaValor | null>(null);

export const useRevista = (): RevistaValor => {
  const v = useContext(RevistaContext);
  if (!v) throw new Error("useRevista debe usarse dentro de la revista");
  return v;
};
