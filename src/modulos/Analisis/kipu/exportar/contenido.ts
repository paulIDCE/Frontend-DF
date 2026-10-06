import FileSaver from "file-saver";
import type { InformeEstructurado, KpiInforme } from "@/services/agenteService";
import { color, tipografia } from "@idce/kit";
import { fmt } from "../graficosInforme";

/**
 * Textos y colores comunes a las descargas Word y PDF, para que ambos documentos digan lo mismo
 * que la vista en pantalla (`InformeKipu`).
 */

export const COLOR_SEMAFORO_DOC = { v: color.exito.base, a: color.advertencia.base, r: color.error.base } as const;

export const subtituloInforme = (i: InformeEstructurado) =>
  `${i.entidad} · ${i.tipoEntidad} · Corte ${i.corte} · Comparado con ${i.comparado_con}`;

export const fuenteInforme = (corte: string) =>
  `Fuente: estados financieros e indicadores de patrimonio técnico (SB/SEPS), base bco_coop. Corte ${corte}. ` +
  "Umbrales de semáforo referenciales. Generado por Kipu · IDCE Consulting: no constituye calificación de riesgo.";

export const valorKpi = (k: KpiInforme) =>
  k.texto ?? `${fmt(k.valor, k.decimales)}${k.unidad === "%" ? " %" : k.unidad ? ` ${k.unidad}` : ""}`;

/** Variacion del KPI como en `Delta`: subir es bueno salvo `subirEsMalo`; sin dato, nada. */
export const deltaKpi = (k: KpiInforme, comparadoCon: string): { texto: string; tono: string } | null => {
  if (k.deltaTexto) return { texto: k.deltaTexto, tono: color.tinta.secundaria };
  if (k.delta == null || Number.isNaN(k.delta)) return null;
  const decimales = k.deltaUnidad === "%" ? 1 : k.decimales;
  const malo = k.subirEsMalo ? k.delta > 0 : k.delta < 0;
  const tono = k.delta === 0 ? color.tinta.secundaria : malo ? color.error.base : color.exito.base;
  const signo = k.delta > 0 ? "+" : k.delta < 0 ? "−" : "";
  return { texto: `${signo}${fmt(Math.abs(k.delta), decimales)} ${k.deltaUnidad} vs. ${comparadoCon}`, tono };
};

/**
 * Tamaños de letra en papel, en pt: la escala tipografica del sistema (px de pantalla) a 0,75 pt/px,
 * la equivalencia CSS. Asi el documento guarda la jerarquia de la app: cuerpo 10,5 pt, rotulo 8,25 pt.
 */
export const pt = (rol: keyof typeof tipografia.escala) => tipografia.escala[rol].tamano * 0.75;

/** Tablas hasta este numero de filas no se dividen entre paginas (se pasan enteras a la siguiente). */
export const FILAS_TABLA_INDIVISIBLE = 15;

/**
 * `default` de un modulo CommonJS (`file-saver`, `pdfmake`), envuelto o no segun el entorno. Copia
 * de `@/utils/interop`, que es interno del kit.
 */
export const interopDefault = <T,>(modulo: T): T => (modulo as { default?: T }).default ?? modulo;

export const { saveAs } = interopDefault(FileSaver);
