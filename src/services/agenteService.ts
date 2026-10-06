import type { RoutesConfig } from "@/types/routesConfig";

/**
 * Agente de informes (Kipu): invoca el workflow de n8n "Informes (determinista, multi-tipo)".
 * Contrato del cuerpo: docs/agente/CONTRATO_INVOCACION_AGENTE.md.
 *
 * Se usa `fetch` y no la instancia `api`: el interceptor agrega el token de sesion y el webhook
 * de n8n no lo necesita (no hay que mandarlo a otro servicio).
 */

let URL_INFORMES = "";

export const initializeAgenteService = (config: RoutesConfig): void => {
  URL_INFORMES = config.VITE_AGENTE_INFORMES_URL ?? "";
};

export const agenteConfigurado = (): boolean => URL_INFORMES !== "";

export type TipoInforme =
  | "solvencia"
  | "calidad_cartera"
  | "rentabilidad"
  | "liquidez"
  | "posicion_mercado"
  | "estructura_financiera"
  | "fuentes_usos"
  | "resumen_ejecutivo";

export type Audiencia = "gerencia" | "consejo" | "riesgos" | "auditoria";

export interface SolicitudInforme {
  version: "1.0";
  solicitud: {
    texto: string;
    tipoInforme: TipoInforme;
    /** `AAAA-MM`. */
    corte: string;
    parametros: { audiencia: Audiencia };
  };
  entidad: {
    /** Id de la API (`COAC___JARDIN_AZUAYO_LIMITADA`). */
    id?: string;
    /** Nombre exacto (igual a `Ifi.Nombre` de la BD): el agente identifica la entidad con el. */
    nombre: string;
    tamano?: string;
    rango?: string;
    provincia?: string;
  };
  contexto: {
    ultimoCorte: string;
    origen: { modulo: "analisis"; hoja: number };
  };
  usuario?: { sesion?: string };
  salida: { formato: "html" };
}

export interface MetaInforme {
  tipoInforme: TipoInforme;
  titulo: string;
  entidad: string;
  corte: string;
  semaforo: string | null;
  generado: string;
}

/**
 * Informe estructurado: el frontend lo pinta con sus propios componentes (KpiCard, TarjetaGrafica,
 * TablaAnalitica). Los KPI y los graficos los calcula el workflow con codigo, nunca el LLM; el LLM
 * solo escribe `conclusion`, el `texto` de cada seccion y las `alertas`.
 */
export interface KpiInforme {
  titulo: string;
  valor: number | null;
  /** `%`, `USD M` o vacio. */
  unidad: string;
  decimales: number;
  /** Variacion contra `comparado_con`, ya en `deltaUnidad`. */
  delta: number | null;
  deltaUnidad: string;
  subirEsMalo: boolean;
  /** Si viene, se muestra en lugar del valor (p. ej. "2 de 297"). */
  texto: string | null;
  /** Si viene, reemplaza la variacion (p. ej. "grupo 6,1 %"). */
  deltaTexto: string | null;
}

export interface GraficoInforme {
  tipo: "linea" | "barras" | "barras_h";
  titulo: string;
  unidad: string;
  categorias: string[];
  series: { nombre: string; datos: (number | null)[] }[];
  decimales: number;
  /** Categoria a destacar (la entidad en los rankings). */
  resaltar?: string;
  /** Lineas de referencia (minimo normativo, mediana de pares…). */
  referencias?: { valor: number; etiqueta: string }[];
}

export interface TablaInforme {
  cols: string[];
  /** Celdas ya formateadas. */
  rows: string[][];
  /** Filas de la entidad (resaltadas). */
  yo?: number[];
  /** Filas de mediana o total. */
  med?: number[];
}

export interface InformeEstructurado {
  version: 1;
  tipo: TipoInforme;
  titulo: string;
  entidad: string;
  tipoEntidad: string;
  corte: string;
  comparado_con: string;
  semaforo: { nivel: "v" | "a" | "r"; color: string; motivo: string } | null;
  conclusion: string;
  kpis: KpiInforme[];
  secciones: { clave: string; titulo: string; texto: string; graficos: GraficoInforme[]; tablas: TablaInforme[] }[];
  alertas: string[];
  notas: string[];
}

export type ResultadoInforme =
  | { tipo: "informe"; html: string; informe?: InformeEstructurado; meta?: MetaInforme }
  | { tipo: "pregunta"; texto: string };

/** Margen amplio: el workflow tarda 15–30 s (consultas + una llamada al LLM). */
const TIEMPO_MAXIMO_MS = 120_000;

export const solicitarInforme = async (cuerpo: SolicitudInforme, signal?: AbortSignal): Promise<ResultadoInforme> => {
  if (!URL_INFORMES) {
    throw new Error("El asistente no está configurado: falta VITE_AGENTE_INFORMES_URL en /config/routes.json.");
  }
  const limite = AbortSignal.timeout(TIEMPO_MAXIMO_MS);
  const respuesta = await fetch(URL_INFORMES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
    signal: signal ? AbortSignal.any([signal, limite]) : limite,
  });
  if (!respuesta.ok) {
    throw new Error(
      respuesta.status === 404
        ? "El servicio de informes no está activo (el workflow de n8n no está publicado)."
        : `El servicio de informes respondió con error ${respuesta.status}.`
    );
  }
  const datos = (await respuesta.json()) as { output?: unknown; informe?: InformeEstructurado; meta?: MetaInforme };
  const salida = String(datos.output ?? "");
  if (salida.startsWith("PREGUNTA:")) return { tipo: "pregunta", texto: salida.slice("PREGUNTA:".length).trim() };
  if (!/<html/i.test(salida)) throw new Error("El servicio de informes devolvió una respuesta inesperada.");
  // Sin `informe` (version anterior del workflow) se muestra el HTML tal cual.
  const informe = datos.informe?.version === 1 ? datos.informe : undefined;
  return { tipo: "informe", html: salida, informe, meta: datos.meta };
};
