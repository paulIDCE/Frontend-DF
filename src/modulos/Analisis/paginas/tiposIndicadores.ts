import type { SerieHistorica } from "../opciones";

/** Series de las graficas de volatilidad (hoja 30): linea principal, secundaria y bandas ±1/±2 SD. */
export type TipoSerieVolatilidad =
  | "principal"
  | "secundaria"
  | "1SD_superior"
  | "1SD_inferior"
  | "2SD_superior"
  | "2SD_inferior";

export interface GraficoIndicador {
  titulo: string;
  subtitulo?: string;
  /** Tasa de equilibrio con bandas de volatilidad. */
  volatilidad?: boolean;
  eje: string;
  /** Las bandas de volatilidad no llevan nombre (no van en la leyenda). */
  series: (Omit<SerieHistorica, "name"> & { name?: string; tipo?: TipoSerieVolatilidad })[];
}

export interface CategoriaIndicadores {
  key: string;
  /** Rotulo del boton. */
  etiqueta: string;
  titulo: string;
  graficos: GraficoIndicador[];
}
