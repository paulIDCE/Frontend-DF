import type { CategoriaIndicadores } from "./tiposIndicadores";

/**
 * Configuracion de las hojas 27, 29, 30 y 31 — generada desde prueba-data
 * `analisis.js` (`CONFIG_INDICADORES`, `_29`, `_30`, `_31`). Los colores
 * del original se reemplazan por la paleta del kit.
 */

export const INDICADORES_27: CategoriaIndicadores[] = [
  {
    "key": "estructura",
    "etiqueta": "Estructura y Eficiencia",
    "titulo": "Estructura y Eficiencia",
    "graficos": [
      {
        "titulo": "ACTIVOS IMPRODUCTIVOS NETOS / TOTAL ACTIVOS",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB018A",
            "name": "Act. Imp. Netos"
          }
        ]
      },
      {
        "titulo": "ACTIVOS PRODUCTIVOS / TOTAL ACTIVOS",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ac_prod_neto_acti",
            "name": "Act. Prod."
          }
        ]
      },
      {
        "titulo": "ACTIVOS PRODUCTIVOS / PASIVOS CON COSTO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ac_prod_pco",
            "name": "Act. Prd/ PCC"
          }
        ]
      },
      {
        "titulo": "GASTOS DE OPERACION ESTIMADOS / TOTAL ACTIVO PROMEDIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "gast_oper_ac",
            "name": "Gastos Operación Estimada"
          }
        ]
      },
      {
        "titulo": "GASTOS DE OPERACION  / MARGEN FINANCIERO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "gast_operacion",
            "name": "Gastos Operación"
          }
        ]
      },
      {
        "titulo": "GASTOS DE PERSONAL ESTIMADOS / ACTIVO PROMEDIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "gasto_personal",
            "name": "Gastos Personal Estimada"
          }
        ]
      },
      {
        "titulo": "MARGEN DE INTERMEDIACIÓN ESTIMADO / PATRIMONIO PROMEDIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "marg_int_pas",
            "name": "Mar. Int. Est./Patr."
          }
        ]
      },
      {
        "titulo": "MARGEN DE INTERMEDIACIÓN ESTIMADO / ACTIVO PROMEDIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "marg_int_ac",
            "name": "Mar. Int. Est./Act."
          }
        ]
      },
      {
        "titulo": "FONDOS DISPONIBLES / TOTAL DEPOSITOS A CORTO PLAZO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF006",
            "name": "Liquidez"
          }
        ]
      }
    ]
  },
  {
    "key": "endeudamiento",
    "etiqueta": "Morosidad - Cobertura - Rentabilidad",
    "titulo": "Morosidad - Cobertura - Rentabilidad",
    "graficos": [
      {
        "titulo": "ÍNDICE DE MOROSIDAD",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF012",
            "name": "Morosidad"
          }
        ]
      },
      {
        "titulo": "COBERTURA DE LA CARTERA REFINANCIADA",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB028",
            "name": "Cart. Refinanciada"
          }
        ]
      },
      {
        "titulo": "CARTERA IMPRODUCTIVA DESCUBIERTA / (PATRIMONIO + RESULTADOS)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SBP001",
            "name": "Cart. Imp. Descubierta"
          }
        ]
      },
      {
        "titulo": "RESULTADOS DEL EJERCICIO / PATRIMONIO PROMEDIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF004",
            "name": "ROE"
          }
        ]
      },
      {
        "titulo": "RESULTADOS DEL EJERCICIO / ACTIVO PROMEDIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF002",
            "name": "ROA"
          }
        ]
      },
      {
        "titulo": "CARTERA BRUTA / (DEPOSITOS A LA VISTA + DEPOSITOS A PLAZO)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Cart_Depo",
            "name": "Intermediación Financiera"
          }
        ]
      },
      {
        "titulo": "RENDIMIENTO CARTERAS DE CRÉDITOS  REFINANCIADAS",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB044",
            "name": "Cart. Refinanciada"
          }
        ]
      },
      {
        "titulo": "RENDIMIENTO CARTERAS DE CRÉDITOS  REESTRUCTURADAS",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB045",
            "name": "Cart. Reestructurada"
          }
        ]
      },
      {
        "titulo": "RENDIMIENTO CARTERA POR VENCER TOTAL",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB036",
            "name": "Cart. Vencer"
          }
        ]
      }
    ]
  },
  {
    "key": "cobertura",
    "etiqueta": "Cobertura",
    "titulo": "Cobertura y  Morosidad por Cartera",
    "graficos": [
      {
        "titulo": "ÍNDICE DE MOROSIDAD PRODUCITVO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF012_1",
            "name": "Morosidad Productivo"
          }
        ]
      },
      {
        "titulo": "ÍNDICE DE MOROSIDAD CONSUMO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF012_2",
            "name": "Morosidad Consumo"
          }
        ]
      },
      {
        "titulo": "ÍNDICE DE MOROSIDAD INMOBILIARIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF012_3",
            "name": "Morosidad Inmobiliario"
          }
        ]
      },
      {
        "titulo": "ÍNDICE DE MOROSIDAD MICROCRÉDITO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF012_4",
            "name": "Morosidad Microcrédito"
          }
        ]
      },
      {
        "titulo": "COBERTURA PROVISIONES PRODUCTIVO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB029",
            "name": "Cober. Prod."
          }
        ]
      },
      {
        "titulo": "COBERTURA PROVISIONES CONSUMO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB030",
            "name": "Cober. Cons."
          }
        ]
      },
      {
        "titulo": "COBERTURA PROVISIONES INMOBILIARIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB031",
            "name": "Cober. Inm."
          }
        ]
      },
      {
        "titulo": "COBERTURA PROVISIONES INMOBILIARIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB032",
            "name": "Cober. Mic."
          }
        ]
      },
      {
        "titulo": "VULNERABILIDAD DEL PATRIMONIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SBP002",
            "name": "Vuln. Patr"
          }
        ]
      }
    ]
  },
  {
    "key": "roa",
    "etiqueta": "Rendimientos",
    "titulo": "Rendimientos",
    "graficos": [
      {
        "titulo": "RENDIMIENTO CART. PROD.",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB037",
            "name": "Rendi. Cart. Prod"
          }
        ]
      },
      {
        "titulo": "RENDIMIENTO CART. CONSUMO.",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB038",
            "name": "Rendi. Cart. Cons."
          }
        ]
      },
      {
        "titulo": "RENDIMIENTO CART. INMOBILIARIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB039",
            "name": "Rendi. Cart. Inmobiliario"
          }
        ]
      },
      {
        "titulo": "RENDIMIENTO CART. MICROCRÉDITO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB040",
            "name": "Rendi. Cart. Microcrédito"
          }
        ]
      },
      {
        "titulo": "VULNERABILIDAD DEL PATRIMONIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SBP003",
            "name": "FK"
          }
        ]
      },
      {
        "titulo": "VULNERABILIDAD DEL PATRIMONIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB018B",
            "name": "FI"
          }
        ]
      },
      {
        "titulo": "VULNERABILIDAD DEL PATRIMONIO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SBP005",
            "name": "Índice de Capitalización"
          }
        ]
      },
      {
        "titulo": "SUFICIENCIA PATRIMONIAL",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB025",
            "name": "Sufi. Patr."
          }
        ]
      },
      {
        "titulo": "PATRIMONIO TÉCNICO",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SOLVENCIA",
            "name": "Patrimonio Técnico"
          }
        ]
      }
    ]
  }
];

export const INDICADORES_29: CategoriaIndicadores[] = [
  {
    "key": "estructura",
    "etiqueta": "CAMELS: SUFICIENCIA PATRIMONIAL (C)",
    "titulo": "Estructura y Eficiencia",
    "graficos": [
      {
        "titulo": "SUFICIENCIA PATRIMONIAL (C)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "C1_1",
            "name": "SUFICIENCIA PATRIMONIAL (C)"
          }
        ]
      },
      {
        "titulo": "Capitalización Neta",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "C1_capit_neta",
            "name": "Capitalización Neta"
          }
        ]
      },
      {
        "titulo": "Cobertura Patrimonial",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "C2_Cobertura",
            "name": "Cobertura Patrimonial"
          }
        ]
      },
      {
        "titulo": "Cartera improductiva neta sobre capital regulatorio",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "C3",
            "name": "Cartera improductiva neta sobre capital regulatorio"
          }
        ]
      }
    ]
  },
  {
    "key": "liquidez",
    "etiqueta": "CAMELS: CALIDAD DE ACTIVOS (A)",
    "titulo": "CALIDAD DE ACTIVOS (A)",
    "graficos": [
      {
        "titulo": "CALIDAD DE ACTIVOS (A)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "A1_1",
            "name": "CALIDAD DE ACTIVOS (A)"
          }
        ]
      },
      {
        "titulo": "Porcentaje de activos improductivos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Porce_activ_impro",
            "name": "Porcentaje de activos improductivos"
          }
        ]
      },
      {
        "titulo": "Intermediación Crediticia",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "A2_Inter_credi",
            "name": "Intermediación Crediticia"
          }
        ]
      },
      {
        "titulo": "Calidad de Créditos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "A3_Calid_credi",
            "name": "Calidad de Créditos"
          }
        ]
      },
      {
        "titulo": "Cobertura Crediticia",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "A4_Cober_credi",
            "name": "Cobertura Crediticia"
          }
        ]
      }
    ]
  },
  {
    "key": "solvencia",
    "etiqueta": "CAMELS: MANEJO ADMINISTRATIVO (M)",
    "titulo": "CAMELS: MANEJO ADMINISTRATIVO (M)",
    "graficos": [
      {
        "titulo": "MANEJO ADMINISTRATIVO (M)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "M1_1",
            "name": "MANEJO ADMINISTRATIVO (M)"
          }
        ]
      },
      {
        "titulo": "Grado de absorción del margen financiero",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "M1_Grado_absor_marge_finan",
            "name": "Grado de absorción del margen financiero"
          }
        ]
      },
      {
        "titulo": "Eficiencia Operativa",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Efici_opera",
            "name": "Eficiencia Operativa"
          }
        ]
      },
      {
        "titulo": "Manejo Administrativo",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "M3_des_estr",
            "name": "Manejo Administrativo"
          }
        ]
      }
    ]
  },
  {
    "key": "endeudamiento",
    "etiqueta": "CAMELS: RENTABILIDAD (E)",
    "titulo": "CAMELS: RENTABILIDAD (E)",
    "graficos": [
      {
        "titulo": "RENTABILIDAD (E)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E1_1",
            "name": "RENTABILIDAD (E)"
          }
        ]
      },
      {
        "titulo": "Rentabilidad sobre Activos (ROA)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E1_ROA",
            "name": "Rentabilidad sobre Activos (ROA)"
          }
        ]
      },
      {
        "titulo": "Rentabilidad sobre Patrimonio (ROE)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E4_ROE",
            "name": "Rentabilidad sobre Patrimonio (ROE)"
          }
        ]
      },
      {
        "titulo": "Eficiencia del negocio",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Efici_negoc",
            "name": "Eficiencia del negocio"
          }
        ]
      },
      {
        "titulo": "Margen spread tasas",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E6_Margen_Spread",
            "name": "Margen spread tasas"
          }
        ]
      }
    ]
  },
  {
    "key": "cobertura",
    "etiqueta": "CAMELS: LIQUIDEZ (L) Y RIESGO DE MERCADO (S)",
    "titulo": "CAMELS: LIQUIDEZ (L) Y RIESGO DE MERCADO (S)",
    "graficos": [
      {
        "titulo": "LIQUIDEZ (L)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "L1_1",
            "name": "LIQUIDEZ (L)"
          }
        ]
      },
      {
        "titulo": "Índice de Liquidez",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Indic_liqui",
            "name": "Índice de Liquidez"
          }
        ]
      },
      {
        "titulo": "Índice de Liquidez ampliada",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "L2_moderado",
            "name": "Índice de Liquidez ampliada"
          }
        ]
      },
      {
        "titulo": "Índice de Liquidez ajustado",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "L3_severo",
            "name": "Índice de Liquidez ajustado"
          }
        ]
      },
      {
        "titulo": "Porcentaje de activos líquidos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "L4_liquidez",
            "name": "Porcentaje de activos líquidos"
          }
        ]
      },
      {
        "titulo": "TASA DE INTERÉS IMPLICITA (S)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Tasa_inter_impli",
            "name": "TASA DE INTERÉS IMPLICITA (S)"
          }
        ]
      }
    ]
  },
  {
    "key": "maniobra",
    "etiqueta": "PERLAS: PROTECCIÓN (P)",
    "titulo": "PERLAS: PROTECCIÓN (P)",
    "graficos": [
      {
        "titulo": "P1: Provisiones Cuentas Incobrables > 12",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "P1_Provisiones",
            "name": "P1: Provisiones Cuentas Incobrables > 12"
          }
        ]
      },
      {
        "titulo": "P2: Provisiones Cuentas Incobrables < 12",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "P2_Provisiones",
            "name": "P2: Provisiones Cuentas Incobrables < 12"
          }
        ]
      },
      {
        "titulo": "P4: Préstamos Castigados (Promedios móviles de 12 meses)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "P4_Castigados",
            "name": "P4: Préstamos Castigados (Promedios móviles de 12 meses)"
          }
        ]
      },
      {
        "titulo": "P6: Solvencia",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "P6_Solvencia",
            "name": "P6: Solvencia"
          }
        ]
      }
    ]
  },
  {
    "key": "roa",
    "etiqueta": "PERLAS: ESTRUCTURA FINANCIERA EFICAZ (E)",
    "titulo": "PERLAS: ESTRUCTURA FINANCIERA EFICAZ (E)",
    "graficos": [
      {
        "titulo": "E1: Cartera Neta",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E1_Cartera",
            "name": "E1: Cartera Neta"
          }
        ]
      },
      {
        "titulo": "E2: Inversiones Líquidas",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E2_Inversiones",
            "name": "E2: Inversiones Líquidas"
          }
        ]
      },
      {
        "titulo": "E3: Inversiones Financieras",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E3_Inversiones",
            "name": "E3: Inversiones Financieras"
          }
        ]
      },
      {
        "titulo": "E4: Inversiones No Financieras",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E4_INNF",
            "name": "E4: Inversiones No Financieras"
          }
        ]
      },
      {
        "titulo": "E5: Depósitos de Ahorro",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E5_Depo_Aho",
            "name": "E5: Depósitos de Ahorro"
          }
        ]
      },
      {
        "titulo": "E6: Créditos Exterior",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E6_Cre_Exte",
            "name": "E6: Créditos Exterior"
          }
        ]
      },
      {
        "titulo": "E7: Aporte Socios",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E7_Aporte",
            "name": "E7: Aporte Socios"
          }
        ]
      },
      {
        "titulo": "E8: Capital",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E8_Capital",
            "name": "E8: Capital"
          }
        ]
      },
      {
        "titulo": "E9: Capital Neto",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E9_Capital_Neto",
            "name": "E9: Capital Neto"
          }
        ]
      }
    ]
  },
  {
    "key": "apalancamiento",
    "etiqueta": "PERLAS: TASA DE RENDIMIENTOS Y COSTO (R)",
    "titulo": "PERLAS: TASA DE RENDIMIENTOS Y COSTO (R)",
    "graficos": [
      {
        "titulo": "R1: Cartera Préstamos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R1_Cartera",
            "name": "R1: Cartera Préstamos"
          }
        ]
      },
      {
        "titulo": "R2: Inversiones inversiones lioquidas",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R2_Inve_Liqu",
            "name": "R2: Inversiones inversiones lioquidas"
          }
        ]
      },
      {
        "titulo": "R5: Costo financiero: intereses sobre depósitos de ahorro / Promedio de depósitos de ahorro",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R5_C_fina_DA",
            "name": "R5: Costo financiero"
          }
        ]
      },
      {
        "titulo": "R6. Costo financiero: intereses sobre el crédito externo / Promedio de crédito externo",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R6_In_crex",
            "name": "R6. Costo financiero"
          }
        ]
      },
      {
        "titulo": "R8. Margen bruto / Promedio de activo total",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R8_Marg",
            "name": "R8. Margen bruto / Promedio de activo total"
          }
        ]
      },
      {
        "titulo": "R9: Gastos de Operación",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R9_Gas_Oper",
            "name": "R9: Gastos de Operación"
          }
        ]
      },
      {
        "titulo": "R10. Provisiones para préstamos incobrables / Promedio de activo total",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R10_Pr_Inc",
            "name": "R10. Provisiones para préstamos incobrables / Promedio de activo total"
          }
        ]
      },
      {
        "titulo": "R11: Ingresos y Gastos extraordinarios",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R11_IngEx",
            "name": "R11: Ingresos extraordinarios"
          },
          {
            "code": "R11_GasEx",
            "name": "R11: Gastos extraordinarios"
          }
        ]
      },
      {
        "titulo": "R12: ROA y ROE",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "R12_ROA",
            "name": "R12: ROA"
          },
          {
            "code": "R13_ROE",
            "name": "R13: ROE"
          }
        ]
      }
    ]
  },
  {
    "key": "activo",
    "etiqueta": "PERLAS: LIQUIDEZ (L)",
    "titulo": "PERLAS: LIQUIDEZ (L)",
    "graficos": [
      {
        "titulo": "L1: Disponibles",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "L1_Prov_Inc",
            "name": "L1: Disponibles"
          }
        ]
      },
      {
        "titulo": "L2: Reservas Liquidación",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "L2_Reservas",
            "name": "L2: Reservas Liquidación"
          }
        ]
      },
      {
        "titulo": "L3: Liquidación Improductivo",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "L3_Improductivos",
            "name": "L3: Liquidación Improductivo"
          }
        ]
      }
    ]
  },
  {
    "key": "roe",
    "etiqueta": "PERLAS: CALIDAD DE ACTIVOS (A)",
    "titulo": "PERLAS: CALIDAD DE ACTIVOS (A)",
    "graficos": [
      {
        "titulo": "A1: Morosidad",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "A1_Moro",
            "name": "A1: Morosidad"
          }
        ]
      },
      {
        "titulo": "A2: Activos Improductivos Netos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "A2_Act_Imp",
            "name": "A2: Activos Improductivos Netos"
          }
        ]
      },
      {
        "titulo": "A3: Capital Neto / Activos Improductivos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "A3_Capi_neto",
            "name": "A3: Capital Neto / Activos Improductivos"
          }
        ]
      }
    ]
  },
  {
    "key": "autonomia",
    "etiqueta": "PERLAS: SEÑALES (S)",
    "titulo": "PERLAS: SEÑALES (S)",
    "graficos": [
      {
        "titulo": "S1: Crecimiento Préstamos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S1_Crec_14",
            "name": "S1: Crecimiento Préstamos"
          }
        ]
      },
      {
        "titulo": "S2: Crecimiento Inversiones Líquidas",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S2_Crec_INL",
            "name": "S2: Crecimiento Inversiones Líquidas"
          }
        ]
      },
      {
        "titulo": "S3: Crecimiento Inversiones Financieras",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S3_Crec_INF",
            "name": "S3: Crecimiento Inversiones Financieras"
          }
        ]
      },
      {
        "titulo": "S4: Crecimiento Inversiones No Financieras",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S4_Crec_INNF",
            "name": "S4: Crecimiento Inversiones No Financieras"
          }
        ]
      },
      {
        "titulo": "S5: Crecimiento Depósitos Ahorro",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S5_Cre_Ahorro",
            "name": "S5: Crecimiento Depósitos Ahorro"
          }
        ]
      },
      {
        "titulo": "S6: Crecimiento Aportaciones de Socios",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S6_Apor_Soci",
            "name": "S6: Crecimiento Aportaciones de Socios"
          }
        ]
      },
      {
        "titulo": "S7: Crecimiento Participación de Reservas",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S7_Par_Reservas",
            "name": "S7: Crecimiento Participación de Reservas"
          }
        ]
      },
      {
        "titulo": "S8: Crecimiento Capital Institucional Neto",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S8_K_neto",
            "name": "S8: Crecimiento Capital Institucional Neto"
          }
        ]
      },
      {
        "titulo": "S9: Crecimiento Activos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "S9_Cre_Activos",
            "name": "S9: Crecimiento Activos"
          }
        ]
      }
    ]
  }
];

export const INDICADORES_30: CategoriaIndicadores[] = [
  {
    "key": "estructura",
    "etiqueta": "SEG. PROD. CORPORATIVO",
    "titulo": "SEGMENTO PRODUCTIVO CORPORATIVO",
    "graficos": [
      {
        "titulo": "COMPONENTES: PRODUCTIVO CORPORATIVO",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "CF_Corporativo",
            "name": "Costo Fondeo",
            "type": "bar"
          },
          {
            "code": "GO_Produc",
            "name": "Gastos Operativos",
            "type": "bar"
          },
          {
            "code": "RC_Corp",
            "name": "Riesgo de Crédito",
            "type": "bar"
          },
          {
            "code": "CK_Prod",
            "name": "Costo de Capital",
            "type": "bar"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_corp",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_cor",
            "name": "Tasa Activa Máxima"
          }
        ]
      },
      {
        "titulo": "Tasa de Interés de Mercado (EFI)",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_proc",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      }
    ]
  },
  {
    "key": "solvencia",
    "etiqueta": "SEG. PROD. EMPRESARIAL",
    "titulo": "COMPONENTES: PRODUCTIVO EMPRESARIAL",
    "graficos": [
      {
        "titulo": "COMPONENTES: PRODUCTIVO EMPRESARIAL",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "CF_Empresarial",
            "name": "Costo Fondeo",
            "type": "bar"
          },
          {
            "code": "GO_Produc",
            "name": "Gastos Operativos",
            "type": "bar"
          },
          {
            "code": "RC_Emp",
            "name": "Riesgo de Crédito",
            "type": "bar"
          },
          {
            "code": "CK_Prod",
            "name": "Costo de Capital",
            "type": "bar"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_emp",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_emp",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_prodem",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa de Interés de Equilibrio (EFI)",
        "subtitulo": "En porcentajes | Bandas grises: ±1SD y ±2SD",
        "volatilidad": true,
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Empr",
            "name": "TAEB (Efectiva Anual %)",
            "tipo": "principal"
          },
          {
            "code": "TEN_Empr",
            "name": "TEN (Nominal %)",
            "tipo": "secundaria"
          },
          {
            "code": "@1mSD_Emp",
            "tipo": "1SD_superior"
          },
          {
            "code": "@1SD_Emp",
            "tipo": "1SD_inferior"
          },
          {
            "code": "@2mSD_Emp",
            "tipo": "2SD_superior"
          },
          {
            "code": "@2SD_Emp",
            "tipo": "2SD_inferior"
          }
        ]
      }
    ]
  },
  {
    "key": "endeudamiento",
    "etiqueta": "SEG. PROD. PYMES",
    "titulo": "COMPONENTES: PRODUCTIVO PYMES",
    "graficos": [
      {
        "titulo": "COMPONENTES: PRODUCTIVO PYMES",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "CF_PYMES",
            "name": "Costo Fondeo",
            "type": "bar"
          },
          {
            "code": "GO_Produc",
            "name": "Gastos Operativos",
            "type": "bar"
          },
          {
            "code": "RC_PYM",
            "name": "Riesgo de Crédito",
            "type": "bar"
          },
          {
            "code": "CK_Prod",
            "name": "Costo de Capital",
            "type": "bar"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_pym",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_pym",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_prodpy",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa de Interés de Equilibrio (EFI)",
        "subtitulo": "En porcentajes | Bandas grises: ±1SD y ±2SD",
        "volatilidad": true,
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_PYM",
            "name": "TAEB (Efectiva Anual %)",
            "tipo": "principal"
          },
          {
            "code": "TEN_PYM",
            "name": "TEN (Nominal %)",
            "tipo": "secundaria"
          },
          {
            "code": "@1mSD_Pym",
            "tipo": "1SD_superior"
          },
          {
            "code": "@1SD_Pym",
            "tipo": "1SD_inferior"
          },
          {
            "code": "@2mSD_Pym",
            "tipo": "2SD_superior"
          },
          {
            "code": "@2SD_Pym",
            "tipo": "2SD_inferior"
          }
        ]
      }
    ]
  },
  {
    "key": "cobertura",
    "etiqueta": "SEG. CONSUMO",
    "titulo": "COMPONENTES: CONSUMO",
    "graficos": [
      {
        "titulo": "COMPONENTES: CONSUMO",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "CF_Consumo",
            "name": "Costo Fondeo",
            "type": "bar"
          },
          {
            "code": "GO_Consu",
            "name": "Gastos Operativos",
            "type": "bar"
          },
          {
            "code": "RC_Cons",
            "name": "Riesgo de Crédito",
            "type": "bar"
          },
          {
            "code": "CK_Cons",
            "name": "Costo de Capital",
            "type": "bar"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_cons",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_cons",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_cons",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa de Interés de Equilibrio (EFI)",
        "subtitulo": "En porcentajes | Bandas grises: ±1SD y ±2SD",
        "volatilidad": true,
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Cons",
            "name": "TAEB (Efectiva Anual %)",
            "tipo": "principal"
          },
          {
            "code": "TEN_Cons",
            "name": "TEN (Nominal %)",
            "tipo": "secundaria"
          },
          {
            "code": "@1mSD_Con",
            "tipo": "1SD_superior"
          },
          {
            "code": "@1SD_Con",
            "tipo": "1SD_inferior"
          },
          {
            "code": "@2mSD_Con",
            "tipo": "2SD_superior"
          },
          {
            "code": "@2SD_Con",
            "tipo": "2SD_inferior"
          }
        ]
      }
    ]
  },
  {
    "key": "maniobra",
    "etiqueta": "SEG. EDUCATIVO",
    "titulo": "COMPONENTES: EDUCATIVO",
    "graficos": [
      {
        "titulo": "SEGMENTO EDUCATIVO",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_educ",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_educ",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_edu",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      }
    ]
  },
  {
    "key": "roa",
    "etiqueta": "SEG. INMOBILIARIO",
    "titulo": "COMPONENTES: INMOBILIARIO",
    "graficos": [
      {
        "titulo": "COMPONENTES: INMOBILIARIO",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "CF_Inmobiliario",
            "name": "Costo Fondeo",
            "type": "bar"
          },
          {
            "code": "GO_Inmobi",
            "name": "Gastos Operativos",
            "type": "bar"
          },
          {
            "code": "RC_Inm",
            "name": "Riesgo de Crédito",
            "type": "bar"
          },
          {
            "code": "CK_Inmo",
            "name": "Costo de Capital",
            "type": "bar"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_inmo",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_inmo",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_inmo",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa de Interés de Equilibrio (EFI)",
        "subtitulo": "En porcentajes | Bandas grises: ±1SD y ±2SD",
        "volatilidad": true,
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Inmo",
            "name": "TAEB (Efectiva Anual %)",
            "tipo": "principal"
          },
          {
            "code": "TEN_Inmo",
            "name": "TEN (Nominal %)",
            "tipo": "secundaria"
          },
          {
            "code": "@1mSD_Inm",
            "tipo": "1SD_superior"
          },
          {
            "code": "@1SD_Inm",
            "tipo": "1SD_inferior"
          },
          {
            "code": "@2mSD_Inm",
            "tipo": "2SD_superior"
          },
          {
            "code": "@2SD_Inm",
            "tipo": "2SD_inferior"
          }
        ]
      }
    ]
  },
  {
    "key": "apalancamiento",
    "etiqueta": "SEG. VIV. INT. PUBL. Y SOC.",
    "titulo": "COMPONENTES: VIVIENDA DE INTERÉS PÚBLICO Y SOCIAL",
    "graficos": [
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima VIP",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_vip",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_vip",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_vip",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima VIS",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_vis",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_vis",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_vis",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      }
    ]
  },
  {
    "key": "activo",
    "etiqueta": "SEG. MICR. MINORISTA",
    "titulo": "COMPONENTES: MICROCRÉDITO MINORISTA",
    "graficos": [
      {
        "titulo": "COMPONENTES: MICROCRÉDITO MINORISTA",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "CF_Minorista",
            "name": "Costo Fondeo",
            "type": "bar"
          },
          {
            "code": "GO_Micro",
            "name": "Gastos Operativos",
            "type": "bar"
          },
          {
            "code": "RC_Mino",
            "name": "Riesgo de Crédito",
            "type": "bar"
          },
          {
            "code": "CK_Mino",
            "name": "Costo de Capital",
            "type": "bar"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_mino",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_mino",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_mino",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa de Interés de Equilibrio (EFI)",
        "subtitulo": "En porcentajes | Bandas grises: ±1SD y ±2SD",
        "volatilidad": true,
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Mino",
            "name": "TAEB (Efectiva Anual %)",
            "tipo": "principal"
          },
          {
            "code": "TEN_Mino",
            "name": "TEN (Nominal %)",
            "tipo": "secundaria"
          },
          {
            "code": "@1mSD_Mino",
            "tipo": "1SD_superior"
          },
          {
            "code": "@1SD_Mino",
            "tipo": "1SD_inferior"
          },
          {
            "code": "@2mSD_Mino",
            "tipo": "2SD_superior"
          },
          {
            "code": "@2SD_Mino",
            "tipo": "2SD_inferior"
          }
        ]
      }
    ]
  },
  {
    "key": "simple",
    "etiqueta": "SEG. MICR ACU. SIMPLE",
    "titulo": "COMPONENTES: MICROCRÉDITO ACUMULACIÓN SIMPLE",
    "graficos": [
      {
        "titulo": "COMPONENTES: MICROCRÉDITO ACUMULACIÓN SIMPLE",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "CF_Simple",
            "name": "Costo Fondeo",
            "type": "bar"
          },
          {
            "code": "GO_Micro",
            "name": "Gastos Operativos",
            "type": "bar"
          },
          {
            "code": "RC_Simp",
            "name": "Riesgo de Crédito",
            "type": "bar"
          },
          {
            "code": "CK_Mino",
            "name": "Costo de Capital",
            "type": "bar"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_simp",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_simp",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_mas",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa de Interés de Equilibrio (EFI)",
        "subtitulo": "En porcentajes | Bandas grises: ±1SD y ±2SD",
        "volatilidad": true,
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Simpl",
            "name": "TAEB (Efectiva Anual %)",
            "tipo": "principal"
          },
          {
            "code": "TEN_Simpl",
            "name": "TEN (Nominal %)",
            "tipo": "secundaria"
          },
          {
            "code": "@1mSD_Simp",
            "tipo": "1SD_superior"
          },
          {
            "code": "@1SD_Simp",
            "tipo": "1SD_inferior"
          },
          {
            "code": "@2mSD_Simp",
            "tipo": "2SD_superior"
          },
          {
            "code": "@2SD_Simp",
            "tipo": "2SD_inferior"
          }
        ]
      }
    ]
  },
  {
    "key": "ampli",
    "etiqueta": "SEG. MICR ACU. AMPLIADA",
    "titulo": "COMPONENTES: MICROCRÉDITO ACUMULACIÓN AMPLIADA",
    "graficos": [
      {
        "titulo": "COMPONENTES: MICROCRÉDITO ACUMULACIÓN AMPLIADA",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "CF_Ampliado",
            "name": "Costo Fondeo",
            "type": "bar"
          },
          {
            "code": "GO_Micro",
            "name": "Gastos Operativos",
            "type": "bar"
          },
          {
            "code": "RC_Amp",
            "name": "Riesgo de Crédito",
            "type": "bar"
          },
          {
            "code": "CK_Mino",
            "name": "Costo de Capital",
            "type": "bar"
          }
        ]
      },
      {
        "titulo": "Tasa Activa Efectiva Referencial y Tasa Activa Máxima",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "ref_ampl",
            "name": "Tasa Activa Efectiva Referencial"
          },
          {
            "code": "max_ampl",
            "name": "Tasa Activa Máxima"
          },
          {
            "code": "t_maa",
            "name": "Tasa Activa Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa de Interés de Equilibrio (EFI)",
        "subtitulo": "En porcentajes | Bandas grises: ±1SD y ±2SD",
        "volatilidad": true,
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Ampli",
            "name": "TAEB (Efectiva Anual %)",
            "tipo": "principal"
          },
          {
            "code": "TEN_Ampli",
            "name": "TEN (Nominal %)",
            "tipo": "secundaria"
          },
          {
            "code": "@1mSD_Amp",
            "tipo": "1SD_superior"
          },
          {
            "code": "@1SD_Amp",
            "tipo": "1SD_inferior"
          },
          {
            "code": "@2mSD_Amp",
            "tipo": "2SD_superior"
          },
          {
            "code": "@2SD_Amp",
            "tipo": "2SD_inferior"
          }
        ]
      }
    ]
  },
  {
    "key": "depo",
    "etiqueta": "TASAS PASIVAS",
    "titulo": "DEPÓSTIOS A PLAZO: OPERACIONES NUEVAS",
    "graficos": [
      {
        "titulo": "Tasa Pasiva Efectiva EFI",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE",
            "name": "Tasa Pasiva Efectiva EFI"
          }
        ]
      },
      {
        "titulo": "Tasa Pasiva Efectiva por Plazo EFI",
        "subtitulo": "En porcentajes",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE30",
            "name": "1-60 días"
          },
          {
            "code": "TPE61",
            "name": "61-90 días"
          },
          {
            "code": "TPE91",
            "name": "91-120 días"
          },
          {
            "code": "TPE121",
            "name": "121-180 días"
          },
          {
            "code": "TPE181",
            "name": "181-360 días"
          },
          {
            "code": "TPE361",
            "name": "Más de 361 días"
          }
        ]
      }
    ]
  }
];

export const INDICADORES_31: CategoriaIndicadores[] = [
  {
    "key": "estructura",
    "etiqueta": "CUC DEL BALANCE",
    "titulo": "CUC DEL BALANCE",
    "graficos": [
      {
        "titulo": "Activos",
        "eje": "millones USD",
        "series": [
          {
            "code": "@1",
            "name": "Activos"
          }
        ]
      },
      {
        "titulo": "Activos Productivos",
        "eje": "millones USD",
        "series": [
          {
            "code": "SB010",
            "name": "Activos Productivos"
          }
        ]
      },
      {
        "titulo": "Activos improductivos netos",
        "eje": "millones USD",
        "series": [
          {
            "code": "SB004",
            "name": "Act. Imp. Netos"
          }
        ]
      },
      {
        "titulo": "Pasivos",
        "eje": "millones USD",
        "series": [
          {
            "code": "@2",
            "name": "Pasivos"
          }
        ]
      },
      {
        "titulo": "Depósitos Ahorro",
        "eje": "millones USD",
        "series": [
          {
            "code": "@210135",
            "name": "Dep. Ahorro"
          }
        ]
      },
      {
        "titulo": "Depósitos Plazo",
        "eje": "millones USD",
        "series": [
          {
            "code": "@2103",
            "name": "Dep. Plazo"
          }
        ]
      },
      {
        "titulo": "Ingresos Anualizados",
        "eje": "millones USD",
        "series": [
          {
            "code": "@5A",
            "name": "Ingresos Anualizados"
          }
        ]
      },
      {
        "titulo": "Gastos Anualizados",
        "eje": "millones USD",
        "series": [
          {
            "code": "@4A",
            "name": "Gastos Anualizados"
          }
        ]
      },
      {
        "titulo": "Pérdidas y Ganancias Anualizadas",
        "eje": "millones USD",
        "series": [
          {
            "code": "Gan_Eje_anual",
            "name": "PYG Anualizados"
          }
        ]
      }
    ]
  },
  {
    "key": "liquidez",
    "etiqueta": "IND. FINANCIEROS",
    "titulo": "IND. FINANCIEROS",
    "graficos": [
      {
        "titulo": "Morosidad",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF012",
            "name": "Morosidad"
          }
        ]
      },
      {
        "titulo": "Índice de Liquidez",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF006",
            "name": "Liquidez"
          }
        ]
      },
      {
        "titulo": "Intermediación Financiera",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Cart_Depo",
            "name": "Intermediación Financiera"
          }
        ]
      },
      {
        "titulo": "ROA",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF002",
            "name": "ROA"
          }
        ]
      },
      {
        "titulo": "ROE",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IF004",
            "name": "ROE"
          }
        ]
      },
      {
        "titulo": "Rendimiento Cartera de Créditos",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SB036",
            "name": "Rendimiento Cartera"
          }
        ]
      },
      {
        "titulo": "Carter Improductiva descubierta",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SBP001",
            "name": "Carter Improductiva descubierta"
          }
        ]
      },
      {
        "titulo": "Carter Improductiva/Patrimonio",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SBP002",
            "name": "Carter Improductiva/Patrimonio"
          }
        ]
      },
      {
        "titulo": "Patrimonio Técnico",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "SOLVENCIA",
            "name": "Patrimonio Técnico"
          }
        ]
      }
    ]
  },
  {
    "key": "solvencia",
    "etiqueta": "IND. CAMELS",
    "titulo": "IND. CAMELS",
    "graficos": [
      {
        "titulo": "Suficiencia Patrimonial (C)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "C1_1",
            "name": "Suficiencia Patrimonial"
          }
        ]
      },
      {
        "titulo": "Calidad de Activos (A)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "A1_1",
            "name": "Calidad de Activos"
          }
        ]
      },
      {
        "titulo": "Manejo Administrativo (M)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "M1_1",
            "name": "Manejo Administrativo"
          }
        ]
      },
      {
        "titulo": "Rentabilidad (E)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "E1_1",
            "name": "Rentabilidad"
          }
        ]
      },
      {
        "titulo": "Liquidez (L)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "L1_1",
            "name": "Liquidez"
          }
        ]
      },
      {
        "titulo": "Riesgo de Mercado (S)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Tasa_inter_impli",
            "name": "Riesgo de Mercado"
          }
        ]
      },
      {
        "titulo": "Índice CAMELS",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "Indic_CAMELS_1",
            "name": "Índice CAMELS"
          }
        ]
      },
      {
        "titulo": "Índice de Vulnerabilidad Financiera (IVF)",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "IVF_Cuantitativo",
            "name": "Índice de Vulnerabilidad Financiera (IVF)"
          }
        ]
      }
    ]
  },
  {
    "key": "endeudamiento",
    "etiqueta": "IND. PERLAS",
    "titulo": "IND. PERLAS",
    "graficos": [
      {
        "titulo": "Riesgo Crítico",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "efic_RA_AC",
            "name": "Riesgo Crítico"
          }
        ]
      },
      {
        "titulo": "Alto Riesgo",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "efic_RB_AC",
            "name": "Alto Riesgo"
          }
        ]
      },
      {
        "titulo": "Riesgo Medio",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "efic_RC_AC",
            "name": "Riesgo Medio"
          }
        ]
      },
      {
        "titulo": "Puntaje alcanzado por la entidad",
        "eje": "número",
        "series": [
          {
            "code": "perlas_acumulado",
            "name": "Puntaje alcanzado"
          }
        ]
      },
      {
        "titulo": "Eficienca Global PERLAS",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "efic_perlas_acum",
            "name": "Eficienca Global"
          }
        ]
      }
    ]
  },
  {
    "key": "cobertura",
    "etiqueta": "CRÉDITOS",
    "titulo": "CRÉDITOS",
    "graficos": [
      {
        "titulo": "Cartera por Vencer",
        "eje": "millones USD",
        "series": [
          {
            "code": "IF007",
            "name": "Cartera por Vencer"
          }
        ]
      },
      {
        "titulo": "Cartera Vencida",
        "eje": "millones USD",
        "series": [
          {
            "code": "IF009",
            "name": "Cartera Vencida"
          }
        ]
      },
      {
        "titulo": "Cartera no dev. int.",
        "eje": "millones USD",
        "series": [
          {
            "code": "IF008",
            "name": "Cartera no dev. int."
          }
        ]
      },
      {
        "titulo": "Cart. Productiva vencer",
        "eje": "millones USD",
        "series": [
          {
            "code": "IF007_1",
            "name": "Cart. Productiva vencer"
          }
        ]
      },
      {
        "titulo": "Cart. Consumo vencer",
        "eje": "millones USD",
        "series": [
          {
            "code": "IF007_2",
            "name": "Cart. Consumo vencer"
          }
        ]
      },
      {
        "titulo": "Cart. Inmobiliario vencer",
        "eje": "millones USD",
        "series": [
          {
            "code": "IF007_3",
            "name": "Cart. Inmobiliario vencer"
          }
        ]
      },
      {
        "titulo": "Cart. Microcrédito vencer",
        "eje": "millones USD",
        "series": [
          {
            "code": "IF007_4",
            "name": "Cart. Microcrédito vencer"
          }
        ]
      }
    ]
  },
  {
    "key": "maniobra",
    "etiqueta": "CRÉDITOS (FLUJOS)",
    "titulo": "CRÉDITOS (FLUJOS)",
    "graficos": [
      {
        "titulo": "MOA",
        "eje": "millones USD",
        "series": [
          {
            "code": "monto_total",
            "name": "MOA"
          }
        ]
      },
      {
        "titulo": "Prod. Corporativo",
        "eje": "millones USD",
        "series": [
          {
            "code": "proc",
            "name": "Prod. Corporativo"
          }
        ]
      },
      {
        "titulo": "Prod. Empresarial",
        "eje": "millones USD",
        "series": [
          {
            "code": "prodem",
            "name": "Prod. Empresarial"
          }
        ]
      },
      {
        "titulo": "Prod. PYMES",
        "eje": "millones USD",
        "series": [
          {
            "code": "prodpy",
            "name": "P6: Prod. PYMES"
          }
        ]
      },
      {
        "titulo": "Consumo",
        "eje": "millones USD",
        "series": [
          {
            "code": "cons",
            "name": "Consumo"
          }
        ]
      },
      {
        "titulo": "Inmobiliario",
        "eje": "millones USD",
        "series": [
          {
            "code": "inmo",
            "name": "Inmobiliario"
          }
        ]
      },
      {
        "titulo": "Mic. Minorista",
        "eje": "millones USD",
        "series": [
          {
            "code": "mino",
            "name": "Mic. Minorista"
          }
        ]
      },
      {
        "titulo": "Mic. Acumulación Simple",
        "eje": "millones USD",
        "series": [
          {
            "code": "mas",
            "name": "Mic. Acumulación Simple"
          }
        ]
      },
      {
        "titulo": "Mic. Acumulación Ampliada",
        "eje": "millones USD",
        "series": [
          {
            "code": "maa",
            "name": "Mic. Acumulación Ampliada"
          }
        ]
      }
    ]
  },
  {
    "key": "roa",
    "etiqueta": "DEP. PLAZO (FLUJOS)",
    "titulo": "DEP. PLAZO (FLUJOS)",
    "graficos": [
      {
        "titulo": "Depósitos a Plazo",
        "eje": "millones USD",
        "series": [
          {
            "code": "mop",
            "name": "Depósitos a Plazo"
          }
        ]
      },
      {
        "titulo": "Dep. Plazo 30 - 60 días",
        "eje": "millones USD",
        "series": [
          {
            "code": "Plazo30",
            "name": "Dep. Plazo 30 - 60 días"
          }
        ]
      },
      {
        "titulo": "Dep. Plazo 61 - 90 días",
        "eje": "millones USD",
        "series": [
          {
            "code": "Plazo61",
            "name": "Dep. Plazo 61 - 90 días"
          }
        ]
      },
      {
        "titulo": "Dep. Plazo 91 - 120 días",
        "eje": "millones USD",
        "series": [
          {
            "code": "Plazo91",
            "name": "Dep. Plazo 91 - 120 días"
          }
        ]
      },
      {
        "titulo": "Dep. Plazo 121 - 180 días",
        "eje": "millones USD",
        "series": [
          {
            "code": "Plazo121",
            "name": "Dep. Plazo 121 - 180 días"
          }
        ]
      },
      {
        "titulo": "Dep. Plazo 181 - 360 días",
        "eje": "millones USD",
        "series": [
          {
            "code": "Plazo181",
            "name": "Dep. Plazo 181 - 360 días"
          }
        ]
      },
      {
        "titulo": "Dep. Plazo 361 días o más",
        "eje": "millones USD",
        "series": [
          {
            "code": "Plazo361",
            "name": "Dep. Plazo 361 días o más"
          }
        ]
      }
    ]
  },
  {
    "key": "apalancamiento",
    "etiqueta": "TASAS DE INT. ACTIVAS",
    "titulo": "TASAS DE INT. ACTIVAS",
    "graficos": [
      {
        "titulo": "Tasa Seg. Pro. Corporativo",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_proc",
            "name": "Seg. Pro. Corporativo"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Pro. Empresarial",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_prodem",
            "name": "Seg. Pro. Empresarial"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Pro. PYMES",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_prodpy",
            "name": "Seg. Pro. PYMES"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Consumo",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_cons",
            "name": "Seg. Consumo"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Inmobiliario",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_inmo",
            "name": "Seg. Inmobiliario"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Microcrédito Minorista",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_mino",
            "name": "Seg. Microcrédito Minorista"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Micro. Acumulación Simple",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_mas",
            "name": "Seg. Micro. Acumulación Simple"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Micro. Acumulación Ampliada",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "t_maa",
            "name": "Seg. Micro. Acumulación Ampliada"
          }
        ]
      }
    ]
  },
  {
    "key": "activo",
    "etiqueta": "TASAS ACTIVAS EQUILIBRIO",
    "titulo": "TASAS ACTIVAS EQUILIBRIO",
    "graficos": [
      {
        "titulo": "Tasa Seg. Pro. Empresarial",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Empr",
            "name": "Seg. Pro. Empresarial"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Pro. PYMES",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_PYM",
            "name": "Seg. Pro. PYMES"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Consumo",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Cons",
            "name": "Seg. Consumo"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Inmobiliario",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Inmo",
            "name": "Seg. Inmobiliario"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Microcrédito Minorista",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Mino",
            "name": "Seg. Microcrédito Minorista"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Micro. Acumulación Simple",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Simpl",
            "name": "Seg. Micro. Acumulación Simple"
          }
        ]
      },
      {
        "titulo": "Tasa Seg. Micro. Acumulación Ampliada",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TAEB_Ampli",
            "name": "Seg. Micro. Acumulación Ampliada"
          }
        ]
      }
    ]
  },
  {
    "key": "roe",
    "etiqueta": "TASAS PASIVAS",
    "titulo": "TASAS PASIVAS",
    "graficos": [
      {
        "titulo": "Tasa Pasiva Efectiva",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE",
            "name": "Tasa Pasiva Efectiva"
          }
        ]
      },
      {
        "titulo": "Tasa Plazo 30 - 60 días",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE30",
            "name": "Tasa Plazo 30 - 60 días"
          }
        ]
      },
      {
        "titulo": "Tasa Plazo 61 - 90 días",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE61",
            "name": "Tasa Plazo 61 - 90 días"
          }
        ]
      },
      {
        "titulo": "Tasa Plazo 91 - 120 días",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE91",
            "name": "Tasa Plazo 91 - 120 días"
          }
        ]
      },
      {
        "titulo": "Tasa Plazo 121 - 180 días",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE121",
            "name": "Tasa Plazo 121 - 180 días"
          }
        ]
      },
      {
        "titulo": "Tasa Plazo 181 - 360 días",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE181",
            "name": "Tasa Plazo 181 - 360 días"
          }
        ]
      },
      {
        "titulo": "Tasa Plazo más 360 días",
        "eje": "porcentajes (%)",
        "series": [
          {
            "code": "TPE361",
            "name": "Tasa Plazo más 360 días"
          }
        ]
      }
    ]
  }
];
