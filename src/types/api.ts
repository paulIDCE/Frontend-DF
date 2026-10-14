/**
 * Contrato de la API de BackendDF (`VITE_API_URL`), ver
 * BackendDF/docs/GUIA_CONSUMO_API_FRONTEND.md.
 *
 * Series "largas": `periodos` y cada `valores` van alineados posicion a
 * posicion; `null` es "sin dato". Los adaptadores (`services/adaptadores.ts`)
 * las vuelven a la forma "ancha" que usan las pantallas.
 */

export type Valores = (number | null)[];

export interface Rango {
  desde: string;
  hasta: string;
}

export interface Item {
  id: string;
  nombre: string;
}

export interface Catalogos {
  sectores: Item[];
  analisis: Item[];
  creditos: Item[];
  tamanos: string[];
  rangosActivos: string[];
  provincias: string[];
}

export interface Entidad {
  /** Id de archivo: `BP__AMAZONAS`. */
  id: string;
  /** Nombre visible: `BP. AMAZONAS`. */
  nombre: string;
  tipo: "banco" | "cooperativa" | "mutualista";
  tamano: string | null;
  rango: string | null;
  provincia: string | null;
  tieneBalance: boolean;
  periodos: Rango | null;
}

export type TipoCuadroApi =
  | "macro"
  | "sistema"
  | "balances"
  | "cartera"
  | "entidad"
  | "balancesEntidad"
  | "carteraEntidad";

export type Frecuencia = "mensual" | "trimestral" | "anual";

export interface CuadroResumen {
  id: string;
  titulo: string;
  origen: "macro" | "sistema" | "entidad";
  tipo: TipoCuadroApi;
  frecuencia: Frecuencia;
  vista: "grupos" | "arbol";
  parametros: ("sector" | "entidad" | "analisis" | "credito")[];
  periodos: Rango | null;
}

/**
 * De donde salen los numeros (BackendDF/docs/contrato-fuente-datos.md): la BD `idce_bco_coop` o
 * los JSON de siempre. No confundir con `CuadroResumen.origen` (tipo de cuadro). Puede cambiar entre
 * llamadas (si la BD cae, todo vuelve como `json`): se lee en cada respuesta.
 */
export type FuenteDatos = "bd" | "json";
export type FuenteDatosCuadro = FuenteDatos | "mixto";

export interface FilasPorFuente {
  bd: number;
  json: number;
  /** Filas sin dato en ninguna fuente (todos sus valores `null`). */
  sinFuente: number;
}

/** `true` si el `null` del periodo se debe a falta de meses anteriores en la BD (no es un dato faltante). */
export const esSinHistoria = (fila: { sinHistoriaHasta?: string | null }, periodo: string) =>
  fila.sinHistoriaHasta != null && periodo <= fila.sinHistoriaHasta;

export interface FilaApi {
  indice: number;
  /** Estable entre exportaciones: `SFN01|nacional|@1`. */
  clave: string;
  grupo: string | null;
  variable: string | null;
  cuc: string | null;
  /** Solo balances. */
  codigoBase: string | null;
  nivel: number;
  /** `indice` del padre (solo vista `arbol`). */
  padre: number | null;
  valores: Valores;
  /** `YYYY-MM`: un `null` hasta esa fecha es "sin historia previa", no un dato faltante. */
  sinHistoriaHasta: string | null;
  /** Una fila nunca mezcla fuentes; `null` = sin dato en ninguna. */
  fuenteDatos: FuenteDatos | null;
}

export interface CuadroApi {
  id: string;
  titulo: string;
  unidad: string | null;
  tipo: TipoCuadroApi;
  frecuencia: Frecuencia;
  vista: "grupos" | "arbol";
  contexto: {
    sector: string | null;
    sectorNombre: string | null;
    entidad: string | null;
    entidadNombre: string | null;
    analisis: string | null;
    analisisNombre: string | null;
    credito: string | null;
    creditoNombre: string | null;
  };
  periodosDisponibles: Rango | null;
  periodos: string[];
  filas: FilaApi[];
  notas: string[];
  fuenteDatos: FuenteDatosCuadro | null;
  filasPorFuente: FilasPorFuente;
}

export interface ReporteApi {
  entidad: { id: string; nombre: string; tamano: string | null; rango: string | null; provincia: string | null };
  periodos: string[];
  cuentas: {
    cuc: string;
    variable: string | null;
    valores: Valores;
    sinHistoriaHasta: string | null;
    fuenteDatos: FuenteDatos | null;
  }[];
  /** Sobre las cuentas devueltas. */
  fuenteDatos: FuenteDatosCuadro | null;
  filasPorFuente: FilasPorFuente;
}

export type Agrupacion = "sector" | "activos" | "provincia" | "todas";

export interface RankingApi {
  cuenta: string;
  fecha: string;
  fechaComparacion: string;
  agrupacion: { tipo: Agrupacion; valor: string | null };
  total: { anterior: number; actual: number };
  posicionEntidad: number | null;
  filas: {
    posicion: number;
    entidadId: string;
    nombre: string;
    anterior: number;
    actual: number;
    /** En %, sin redondear. */
    participacionAnterior: number;
    participacionActual: number;
  }[];
}

export interface SeriesEntidadesApi {
  periodos: string[];
  series: { entidadId: string; codigo: string; variable: string | null; valores: Valores }[];
}

export interface SeriesSistemaApi {
  periodos: string[];
  series: {
    sector: string;
    sectorNombre: string;
    codigo: string;
    cuadro: string;
    variable: string | null;
    valores: Valores;
  }[];
}

export interface MetaApi {
  /** ISO UTC: fecha real de los datos. */
  versionDatos: string;
  fuentes: {
    fuente: string;
    archivo: string | null;
    archivos: number | null;
    desde: string | null;
    hasta: string | null;
    modificado: string | null;
  }[];
  /** Ultimo mes con datos a la vez en reportes, balances y sistema. */
  ultimoCorteComun: string | null;
  advertencias: string[];
  /** Cuadros que salen solo de la BD, solo del JSON o de ambas. `null` si la BD no informa el catalogo. */
  cuadrosPorFuente: { bd: number; json: number; mixto: number } | null;
}
