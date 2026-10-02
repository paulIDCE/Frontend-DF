/**
 * Catalogo PROVISIONAL de indicadores para rankings, grupo par y Monitor del Sistema (plan 06,
 * items 1.15 a 1.17). Lo reemplaza `GET /api/catalogos/indicadores` (item 3.1): ahi vendran el
 * nombre, la unidad, la formula y el sentido favorable validados por negocio.
 *
 * `sentido`: hacia donde es mejor el indicador. Ordena los rankings (1.º = el mejor) y colorea la
 * posicion en el grupo par. `unidad`: "%" (ratio, variacion en pp) o "musd" (saldo, con
 * participacion y variacion en %).
 *
 * Solo codigos que la API ya tiene en el indice de reportes (los derivados `DER_*` del frontend no
 * se pueden rankear hasta la fase 2, item 2.3).
 */

export type Sentido = "sube" | "baja";
export type Unidad = "%" | "musd";

export interface IndicadorCatalogo {
  code: string;
  nombre: string;
  unidad: Unidad;
  sentido: Sentido;
}

export interface GrupoIndicadores {
  key: string;
  titulo: string;
  items: IndicadorCatalogo[];
}

const i = (code: string, nombre: string, unidad: Unidad, sentido: Sentido): IndicadorCatalogo => ({ code, nombre, unidad, sentido });

/** Grupos con los nombres de RADAR (05 §4.2) para facilitar la adopcion. */
export const GRUPOS_INDICADORES: GrupoIndicadores[] = [
  {
    key: "riesgo",
    titulo: "Cartera en riesgo",
    items: [
      i("IF012", "Morosidad de la cartera total", "%", "baja"),
      i("IF012_1", "Morosidad productivo", "%", "baja"),
      i("IF012_2", "Morosidad consumo", "%", "baja"),
      i("IF012_3", "Morosidad inmobiliario", "%", "baja"),
      i("IF012_4", "Morosidad microcrédito", "%", "baja"),
      i("SBP002", "Vulnerabilidad del patrimonio", "%", "baja"),
      i("IF010", "Cartera improductiva", "musd", "baja"),
    ],
  },
  {
    key: "cartera",
    titulo: "Cartera y ahorros",
    items: [
      i("IF011", "Cartera bruta", "musd", "sube"),
      i("IF011_4", "Cartera de microcrédito", "musd", "sube"),
      i("IF011_2", "Cartera de consumo", "musd", "sube"),
      i("@21", "Obligaciones con el público (depósitos)", "musd", "sube"),
      i("@2101", "Depósitos a la vista", "musd", "sube"),
      i("@2103", "Depósitos a plazo", "musd", "sube"),
    ],
  },
  {
    key: "gestion",
    titulo: "Gestión operativa",
    items: [
      i("Cart_Depo", "Intermediación (cartera bruta / depósitos)", "%", "sube"),
      i("gast_operacion", "Gastos de operación / margen financiero", "%", "baja"),
      i("gasto_personal", "Gastos de personal / activo promedio", "%", "baja"),
      i("ac_prod_neto_acti", "Activos productivos / total activos", "%", "sube"),
    ],
  },
  {
    key: "rentabilidad",
    titulo: "Rentabilidad",
    items: [
      i("IF002", "ROA", "%", "sube"),
      i("IF004", "ROE", "%", "sube"),
      i("SB036", "Rendimiento de la cartera por vencer", "%", "sube"),
      i("marg_int_ac", "Margen de intermediación / activo promedio", "%", "sube"),
    ],
  },
  {
    key: "eficiencia",
    titulo: "Eficiencia",
    items: [
      i("gast_oper_ac", "Gastos de operación / activo promedio", "%", "baja"),
      i("SB018A", "Activos improductivos netos / total activos", "%", "baja"),
      i("ac_prod_pco", "Activos productivos / pasivos con costo", "%", "sube"),
    ],
  },
  {
    key: "solvencia",
    titulo: "Solvencia y liquidez",
    items: [
      i("SOLVENCIA", "Solvencia (patrimonio técnico)", "%", "sube"),
      i("IF006", "Fondos disponibles / depósitos a corto plazo", "%", "sube"),
      i("Indic_CAMELS_1", "Indicador CAMELS", "%", "sube"),
      i("efic_perlas_acum", "Indicador PERLAS", "%", "sube"),
    ],
  },
];

const POR_CODIGO = new Map(GRUPOS_INDICADORES.flatMap((g) => g.items).map((x) => [x.code.toUpperCase(), x]));

/** Indicadores derivados del frontend (`derivados.ts`): solo para el sentido favorable. */
const SENTIDO_DERIVADOS: Record<string, Sentido> = {
  DER_PAT_ACT: "sube",
  DER_APALANC: "baja",
  DER_GOP_CART: "baja",
  DER_COSTO_FONDEO: "baja",
  DER_SOST_OPER: "sube",
};

export const indicador = (code: string): IndicadorCatalogo | undefined => POR_CODIGO.get(code.toUpperCase());

/**
 * Cuentas donde subir es desfavorable (gastos, cartera en mora, activos improductivos): colorean las
 * variaciones de los KPIs. Patrones sobre el CUC, con o sin sufijo anualizado (`A`) o de segmento.
 */
const CUENTAS_BAJA = [/^@4\d*A?$/, /^IF00[89](_\d)?$/, /^IF01[02](_\d)?$/, /^SB00[34]$/, /^SB018A$/];

export const sentidoDe = (code: string): Sentido =>
  indicador(code)?.sentido ??
  SENTIDO_DERIVADOS[code.toUpperCase()] ??
  (CUENTAS_BAJA.some((re) => re.test(code.toUpperCase())) ? "baja" : "sube");
