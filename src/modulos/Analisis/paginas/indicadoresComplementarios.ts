import type { CategoriaIndicadores } from "./tiposIndicadores";

/**
 * Indicadores que no estaban en el original y se calculan con cuentas del reporte
 * (`../derivados.ts`). Vienen de las comparativas con RADAR y Managerial Analyzer
 * (`docs/analisis/06_PLAN_INTEGRACION_POR_FASES.md`, items 1.1 a 1.4).
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
];
