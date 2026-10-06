/**
 * Como se navegan las categorias de las hojas 27, 29, 30 y 31. `indicadoresConfig.ts` es una
 * migracion de prueba-data (rotulos en mayusculas con prefijos repetidos: "CAMELS: …",
 * "SEG. PROD. …"); aqui va la presentacion: grupos (un `Segmented` rotulado) y nombres cortos de
 * pestaña. Cada item apunta a la `key` de su categoria en la configuracion.
 */

export interface ItemNavegacion {
  key: string;
  titulo: string;
}

export interface GrupoNavegacion {
  key: string;
  titulo: string;
  items: ItemNavegacion[];
}

export interface NavegacionIndicadores {
  /** Rotulo del selector de grupo (no se muestra si hay un solo grupo). */
  rotulo: string;
  grupos: GrupoNavegacion[];
}

export const NAVEGACION_27: NavegacionIndicadores = {
  rotulo: "Tema",
  grupos: [
    {
      key: "todos",
      titulo: "Indicadores",
      items: [
        { key: "estructura", titulo: "Estructura y eficiencia" },
        { key: "endeudamiento", titulo: "Morosidad, cobertura y rentabilidad" },
        { key: "cobertura", titulo: "Cobertura y morosidad por cartera" },
        { key: "roa", titulo: "Rendimientos" },
        { key: "segmentos", titulo: "Educativo y vivienda de interés social" },
        { key: "complementarios", titulo: "Solvencia, eficiencia y fondeo" },
      ],
    },
  ],
};

export const NAVEGACION_29: NavegacionIndicadores = {
  rotulo: "Metodología",
  grupos: [
    {
      key: "camels",
      titulo: "CAMELS",
      items: [
        { key: "estructura", titulo: "C · Suficiencia patrimonial" },
        { key: "liquidez", titulo: "A · Calidad de activos" },
        { key: "solvencia", titulo: "M · Manejo administrativo" },
        { key: "endeudamiento", titulo: "E · Rentabilidad" },
        { key: "cobertura", titulo: "L/S · Liquidez y riesgo de mercado" },
      ],
    },
    {
      key: "perlas",
      titulo: "PERLAS",
      items: [
        { key: "maniobra", titulo: "P · Protección" },
        { key: "roa", titulo: "E · Estructura financiera" },
        { key: "apalancamiento", titulo: "R · Rendimientos y costos" },
        { key: "activo", titulo: "L · Liquidez" },
        { key: "roe", titulo: "A · Calidad de activos" },
        { key: "autonomia", titulo: "S · Señales de crecimiento" },
      ],
    },
  ],
};

export const NAVEGACION_30: NavegacionIndicadores = {
  rotulo: "Tipo de tasa",
  grupos: [
    {
      key: "activas",
      titulo: "Activas (por segmento)",
      items: [
        { key: "estructura", titulo: "Corporativo" },
        { key: "solvencia", titulo: "Empresarial" },
        { key: "endeudamiento", titulo: "PYMES" },
        { key: "cobertura", titulo: "Consumo" },
        { key: "maniobra", titulo: "Educativo" },
        { key: "roa", titulo: "Inmobiliario" },
        { key: "apalancamiento", titulo: "Vivienda de interés público" },
        { key: "activo", titulo: "Microcrédito minorista" },
        { key: "simple", titulo: "Micro. acumulación simple" },
        { key: "ampli", titulo: "Micro. acumulación ampliada" },
      ],
    },
    {
      key: "pasivas",
      titulo: "Pasivas",
      items: [{ key: "depo", titulo: "Depósitos a plazo" }],
    },
  ],
};

export const NAVEGACION_31: NavegacionIndicadores = {
  rotulo: "Tema",
  grupos: [
    {
      key: "balance",
      titulo: "Balance e indicadores",
      items: [
        { key: "estructura", titulo: "Cuentas del balance" },
        { key: "liquidez", titulo: "Indicadores financieros" },
        { key: "solvencia", titulo: "CAMELS" },
        { key: "endeudamiento", titulo: "PERLAS" },
      ],
    },
    {
      key: "creditos",
      titulo: "Créditos y depósitos",
      items: [
        { key: "cobertura", titulo: "Créditos (saldos)" },
        { key: "maniobra", titulo: "Créditos (flujos)" },
        { key: "roa", titulo: "Depósitos a plazo (flujos)" },
      ],
    },
    {
      key: "tasas",
      titulo: "Tasas de interés",
      items: [
        { key: "apalancamiento", titulo: "Activas" },
        { key: "activo", titulo: "Activas de equilibrio" },
        { key: "roe", titulo: "Pasivas" },
      ],
    },
  ],
};
