/**
 * Tipos del explorador de cuadros (Macro, Sistema Financiero y Tasas).
 *
 * Los JSON de prueba-data son "anchos": metadatos + una clave por periodo
 * (`YYYY-MM`, `YYYY-Tn`). Se leen tal cual; `datos.ts` sabe separarlos.
 */

/** Como se carga un cuadro (las funciones `loadXxx` de prueba-data). */
export type TipoCuadro =
  | "tabla"
  | "tablaEfi"
  | "balances"
  | "balancesEfi"
  | "cartera"
  | "carteraEfi";

export interface NodoCuadro {
  key: string;
  titulo: string;
  /** Hoja: id del cuadro (`Cuadro` en los JSON). */
  cuadro?: string;
  /** Solo Sistema/Tasas; en Macro todo es `tabla`. */
  tipo?: TipoCuadro;
  hijos?: NodoCuadro[];
}

/** Fila cruda de los JSON: metadatos string + periodos numericos. */
export type FilaCuadro = Record<string, unknown> & {
  Cuadro?: string;
  Titulo_Cuadro?: string;
  Unidad?: string;
  Grupo?: string;
  Variable?: string;
  /** Nivel jerarquico precalculado (balances usan `Codigo_Base`, no `NivelN`). */
  _nivel?: number;
};

export type TipoPeriodo = "mensual" | "trimestral" | "anual";

/** Cuadro listo para pintar. */
export interface CuadroCargado {
  id: string;
  titulo: string;
  unidad: string;
  filas: FilaCuadro[];
  notas: string[];
  /** `arbol`: estados financieros detallados (jerarquia por `Codigo_Base`). */
  vista?: "grupos" | "arbol";
  /** Sector/entidad al que pertenecen los datos (Sistema/Tasas), para la coleccion y los favoritos. */
  sector?: string;
  sectorNombre?: string;
}

/** Serie en "Mi Colección" (hasta 10). */
export interface SerieColeccion {
  /** `cuadro_sector_variable_indice`: identifica la fila de origen. */
  id: string;
  variable: string;
  fila: FilaCuadro;
  cuadroId: string;
  cuadroNombre?: string;
  unidad?: string;
  sectorNombre?: string;
  /** Cuentas ancestro dentro del cuadro (de la raiz al padre): distingue variables homonimas. */
  ruta?: string[];
  /** Ramas del arbol "Contenidos" hasta el cuadro. */
  contenidos?: string[];
  derecha: boolean;
  tipo: "line" | "bar";
}

/**
 * Serie guardada en favoritos (persistente). Misma forma que el carrito de prueba-data
 * (`localStorage['carritoSeries']`), asi se migra lo guardado.
 */
export interface ItemFavorito {
  index: number;
  variable: string;
  cuadroId: string;
  cuadroNombre: string;
  sector?: string;
  sectorNombre?: string;
  /** Cuentas ancestro dentro del cuadro (de la raiz al padre): distingue variables homonimas. */
  ruta?: string[];
  /** Ramas del arbol "Contenidos" hasta el cuadro. */
  contenidos?: string[];
  data: FilaCuadro;
}
