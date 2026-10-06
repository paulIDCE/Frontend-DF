import type { CategoriaIndicadores } from "./tiposIndicadores";
import {
  NOTA_ANUALIZADO,
  NOTA_COBERTURA_SIN_MORA,
  NOTA_DERIVADO,
  NOTA_POR_VALIDAR,
  NOTA_SEGMENTACION_2021,
  notas,
} from "../notas";

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
      { titulo: "PATRIMONIO / ACTIVOS", nota: notas("Patrimonio (3) / Activo (1).", NOTA_DERIVADO), eje: "porcentajes (%)", series: [{ code: "DER_PAT_ACT", name: "Patrimonio / Activos" }] },
      { titulo: "APALANCAMIENTO (PASIVO / PATRIMONIO)", nota: notas("Pasivo (2) / Patrimonio (3), en veces.", NOTA_DERIVADO), eje: "veces", series: [{ code: "DER_APALANC", name: "Apalancamiento" }] },
      {
        titulo: "GASTOS DE OPERACIÓN / CARTERA BRUTA PROMEDIO",
        nota: notas("Gastos de operación (45) / cartera bruta.", NOTA_ANUALIZADO, NOTA_DERIVADO),
        eje: "porcentajes (%)",
        series: [{ code: "DER_GOP_CART", name: "Gastos op. / Cartera" }],
      },
      {
        titulo: "COSTO DE FONDEO (INTERESES CAUSADOS / PASIVOS CON COSTO PROMEDIO)",
        nota: notas("Intereses causados (41) / pasivos con costo.", NOTA_ANUALIZADO, NOTA_DERIVADO),
        eje: "porcentajes (%)",
        series: [{ code: "DER_COSTO_FONDEO", name: "Costo de fondeo" }],
      },
      {
        titulo: "SOSTENIBILIDAD OPERACIONAL",
        nota: notas(
          "Ingresos (5) / (intereses causados (41) + provisiones (44) + gastos de operación (45)). Sobre 100 % los ingresos cubren los costos.",
          NOTA_ANUALIZADO,
          NOTA_POR_VALIDAR,
        ),
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
      { titulo: "ÍNDICE DE MOROSIDAD EDUCATIVO", nota: NOTA_SEGMENTACION_2021, eje: "porcentajes (%)", series: [{ code: "IF012_6", name: "Morosidad educativo" }] },
      {
        titulo: "ÍNDICE DE MOROSIDAD VIVIENDA DE INTERÉS SOCIAL Y PÚBLICO",
        nota: NOTA_SEGMENTACION_2021,
        eje: "porcentajes (%)",
        series: [{ code: "IF012_5", name: "Morosidad VIS" }],
      },
      { titulo: "COBERTURA PROVISIONES EDUCATIVO", nota: notas(NOTA_COBERTURA_SIN_MORA, NOTA_SEGMENTACION_2021), eje: "porcentajes (%)", series: [{ code: "DER_COB_EDU", name: "Cobertura educativo" }] },
      {
        titulo: "COBERTURA PROVISIONES VIVIENDA DE INTERÉS SOCIAL Y PÚBLICO",
        nota: notas(NOTA_COBERTURA_SIN_MORA, NOTA_SEGMENTACION_2021),
        eje: "porcentajes (%)",
        series: [{ code: "DER_COB_VIS", name: "Cobertura VIS" }],
      },
    ],
  },
];
