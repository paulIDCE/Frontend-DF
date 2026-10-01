import type { CategoriaIndicadores } from "./tiposIndicadores";

/**
 * Indicadores que no estaban en el original y se calculan con cuentas del reporte
 * (`../derivados.ts`). Vienen de las comparativas con RADAR y Managerial Analyzer
 * (`docs/analisis/06_PLAN_INTEGRACION_POR_FASES.md`, items 1.1 a 1.4 y 1.7).
 */
export const COMPLEMENTARIOS_27: CategoriaIndicadores[] = [
  {
    key: "complementarios",
    etiqueta: "Solvencia, eficiencia y fondeo",
    titulo: "Solvencia, eficiencia y fondeo",
    graficos: [
      { titulo: "PATRIMONIO / ACTIVOS", eje: "porcentajes (%)", series: [{ code: "DER_PAT_ACT", name: "Patrimonio / Activos" }] },
      { titulo: "APALANCAMIENTO (PASIVO / PATRIMONIO)", eje: "veces", series: [{ code: "DER_APALANC", name: "Apalancamiento" }] },
      {
        titulo: "GASTOS DE OPERACIÓN / CARTERA BRUTA PROMEDIO",
        eje: "porcentajes (%)",
        series: [{ code: "DER_GOP_CART", name: "Gastos op. / Cartera" }],
      },
      {
        titulo: "COSTO DE FONDEO (INTERESES CAUSADOS / PASIVOS CON COSTO PROMEDIO)",
        eje: "porcentajes (%)",
        series: [{ code: "DER_COSTO_FONDEO", name: "Costo de fondeo" }],
      },
      {
        titulo: "SOSTENIBILIDAD OPERACIONAL",
        eje: "porcentajes (%)",
        series: [{ code: "DER_SOST_OPER", name: "Sostenibilidad operacional" }],
      },
    ],
  },
  {
    key: "segmentos",
    etiqueta: "Educativo y vivienda de interés social",
    titulo: "Educativo y vivienda de interés social",
    graficos: [
      { titulo: "ÍNDICE DE MOROSIDAD EDUCATIVO", eje: "porcentajes (%)", series: [{ code: "IF012_6", name: "Morosidad educativo" }] },
      {
        titulo: "ÍNDICE DE MOROSIDAD VIVIENDA DE INTERÉS SOCIAL Y PÚBLICO",
        eje: "porcentajes (%)",
        series: [{ code: "IF012_5", name: "Morosidad VIS" }],
      },
      { titulo: "COBERTURA PROVISIONES EDUCATIVO", eje: "porcentajes (%)", series: [{ code: "DER_COB_EDU", name: "Cobertura educativo" }] },
      {
        titulo: "COBERTURA PROVISIONES VIVIENDA DE INTERÉS SOCIAL Y PÚBLICO",
        eje: "porcentajes (%)",
        series: [{ code: "DER_COB_VIS", name: "Cobertura VIS" }],
      },
    ],
  },
];
