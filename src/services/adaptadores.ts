import type { CuadroApi, ReporteApi, SeriesSistemaApi, Valores } from "@/types/api";
import type { CuadroCargado, FilaCuadro } from "@/modulos/Explorador/tipos";
import type { FilaReporte } from "@/modulos/Analisis/datos";

/**
 * De la API (series largas) a la forma "ancha" de los JSON de prueba-data
 * (metadatos + una clave por periodo). Asi las tablas, graficas, descargas,
 * la coleccion y los favoritos siguen igual, y los favoritos guardados en
 * `localStorage` siguen siendo compatibles.
 */

/** `{ "2025-01": v1, "2025-02": v2, ... }` */
const columnas = (periodos: string[], valores: Valores) =>
  Object.fromEntries(periodos.map((p, i) => [p, valores[i]]));

const texto = (v: string | null) => v ?? undefined;

/** Cuadro de la API -> `CuadroCargado` del Explorador. */
export const aCuadroCargado = (c: CuadroApi): CuadroCargado => {
  const ctx = c.contexto;
  // Misma composicion que armaba cargarCuadroSistema con las etiquetas de los filtros.
  const partes = [ctx.sectorNombre ?? ctx.entidadNombre, ctx.analisisNombre ?? ctx.creditoNombre].filter(
    Boolean
  ) as string[];
  return {
    id: c.id,
    titulo: c.titulo,
    unidad: [c.unidad, ...partes.slice(1), ctx.entidadNombre].filter(Boolean).join(" - "),
    notas: c.notas,
    vista: c.vista,
    sector: partes.join("|") || undefined,
    sectorNombre: partes.join(" · ") || undefined,
    filas: c.filas.map<FilaCuadro>((f) => ({
      Cuadro: c.id,
      Titulo_Cuadro: c.titulo,
      Unidad: texto(c.unidad),
      Grupo: texto(f.grupo),
      Variable: texto(f.variable),
      CUC: texto(f.cuc),
      Codigo_Base: texto(f.codigoBase),
      // `Nivel` lo lee TablaBalances (arbol); `_nivel`, nivelFila (grupos).
      Nivel: f.nivel,
      _nivel: f.nivel,
      ...columnas(c.periodos, f.valores),
    })),
  };
};

/** Reporte de la API -> `FilaReporte[]`, lo que leen la revista y sus hojas. */
export const aFilasReporte = (r: ReporteApi): FilaReporte[] =>
  r.cuentas.map((c, i) => ({
    CUC: c.cuc,
    Variable: texto(c.variable),
    // Los metadatos de la entidad iban en la primera fila (`infoDe`).
    ...(i === 0
      ? { Tamaño: texto(r.entidad.tamano), Rango_Activos: texto(r.entidad.rango), DPA_PR: texto(r.entidad.provincia) }
      : {}),
    ...columnas(r.periodos, c.valores),
  }));

/** Fila de `base_estru_sistema`: `Filtro` es el nombre del sector. */
export type FilaSistema = Record<string, unknown> & {
  Cuadro: string;
  Filtro: string;
  CUC: string;
  Variable?: string;
};

/** Series del sistema -> filas como las de `base_estru_sistema` (hoja 2). */
export const aFilasSistema = (s: SeriesSistemaApi): FilaSistema[] =>
  s.series.map((x) => ({
    Cuadro: x.cuadro,
    Filtro: x.sectorNombre,
    CUC: x.codigo,
    Variable: texto(x.variable),
    ...columnas(s.periodos, x.valores),
  }));
