import { createContext, useContext } from "react";
import type { Ctx } from "./datos";
import type { FilasPorFuente, FuenteDatosCuadro } from "@/types/api";
import type { DatoFuente } from "./FuentesHoja";

/**
 * Fuente de una hoja que no lee el reporte de la entidad (Entorno macroeconomico): sus cuadros,
 * para la insignia de la barra de la revista.
 */
export interface FuentesExternas {
  /** "Cuadros del BCE". */
  titulo: string;
  resumen: string;
  fuente: FuenteDatosCuadro | null;
  conteo: FilasPorFuente;
  datos: DatoFuente[];
}

/** Estado compartido por todas las hojas de la revista. */
export interface RevistaValor {
  ctx: Ctx;
  entidad: string;
  /** Nombre de la hoja que se ve (para nombrar las descargas). */
  hoja: string;
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
  /** Las hojas con datos propios (macro) informan aqui de donde salen; `null` al desmontarse. */
  reportarFuentes?: (fuentes: FuentesExternas | null) => void;
}

export const RevistaContext = createContext<RevistaValor | null>(null);

export const useRevista = (): RevistaValor => {
  const v = useContext(RevistaContext);
  if (!v) throw new Error("useRevista debe usarse dentro de la revista");
  return v;
};
