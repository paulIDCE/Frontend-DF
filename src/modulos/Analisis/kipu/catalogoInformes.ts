import type { ComponentType } from "react";
import {
  AimOutlined,
  AlertOutlined,
  ApartmentOutlined,
  BankOutlined,
  DashboardOutlined,
  FundOutlined,
  GlobalOutlined,
  PercentageOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  TrophyOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type { Audiencia, TipoInforme } from "@/services/agenteService";

/**
 * Informes que Kipu sabe generar (workflow n8n "Informes (determinista, multi-tipo)").
 * Detalle de cada tipo: docs/agente/TIPOS_DE_INFORME.md. Los "proximamente" esperan datos que
 * aun no estan en la BD; se muestran deshabilitados para que el usuario sepa que vienen.
 */

export interface InformeCatalogo {
  tipo: TipoInforme | null;
  titulo: string;
  descripcion: string;
  Icono: ComponentType<{ className?: string }>;
  /**
   * Hojas de la revista donde se validan las cifras, por su numero estable (`paginas/index.ts`).
   * Al usuario se le muestran como en el selector ("1. Resumen ejecutivo"), no con este numero.
   */
  hojas: number[];
  /** Ejemplo para el campo de personalizacion. */
  ejemplo: string;
  proximamente?: boolean;
}

export const INFORMES: InformeCatalogo[] = [
  {
    tipo: "resumen_ejecutivo",
    titulo: "Resumen ejecutivo",
    descripcion: "Una página con los 12 indicadores clave, los 3 hallazgos del mes y las alertas activas.",
    Icono: DashboardOutlined,
    hojas: [36],
    ejemplo: "Para la sesión del consejo de este mes; destacar lo que cambió frente al año pasado.",
  },
  {
    tipo: "solvencia",
    titulo: "Solvencia y patrimonio técnico",
    descripcion: "Solvencia, PTC, activos ponderados por riesgo, calidad del capital y posición frente a pares.",
    Icono: SafetyCertificateOutlined,
    hojas: [27, 28, 29],
    ejemplo: "Explicar qué movió la solvencia en el año y cuánto margen queda sobre el mínimo.",
  },
  {
    tipo: "calidad_cartera",
    titulo: "Calidad de cartera",
    descripcion: "Morosidad y cobertura total y por segmento, cartera reprogramada y comparación con pares.",
    Icono: AlertOutlined,
    hojas: [12, 13, 27],
    ejemplo: "Poner énfasis en microcrédito y en si las provisiones alcanzan.",
  },
  {
    tipo: "rentabilidad",
    titulo: "Rentabilidad y eficiencia",
    descripcion: "Estado de resultados en cascada, ROA, ROE, absorción del margen y qué movió la utilidad.",
    Icono: PercentageOutlined,
    hojas: [10, 11, 27],
    ejemplo: "¿Por qué cambió el ROE frente al año pasado? Foco en gastos de operación.",
  },
  {
    tipo: "liquidez",
    titulo: "Liquidez y fondeo",
    descripcion: "Liquidez de primera línea y ampliada, depósitos por plazo, volatilidad y pares.",
    Icono: WalletOutlined,
    hojas: [6, 7, 8, 27],
    ejemplo: "Para el comité ALCO: concentración de depósitos de corto plazo.",
  },
  {
    tipo: "posicion_mercado",
    titulo: "Posición de mercado",
    descripcion: "Posición y cuota en activos, cartera, depósitos y patrimonio; si gana o pierde mercado.",
    Icono: TrophyOutlined,
    hojas: [5, 9, 24],
    ejemplo: "¿Estamos ganando cuota o solo creciendo con el mercado?",
  },
  {
    tipo: "estructura_financiera",
    titulo: "Estructura financiera",
    descripcion: "Composición del balance (análisis vertical y horizontal), activo productivo y pasivo con costo.",
    Icono: ApartmentOutlined,
    hojas: [1, 3, 4, 6, 7, 8],
    ejemplo: "Revisar cuánto del activo no genera ingresos.",
  },
  {
    tipo: "fuentes_usos",
    titulo: "Fuentes y usos de fondos",
    descripcion: "De dónde salieron los recursos en el año y en qué se invirtieron.",
    Icono: SwapOutlined,
    hojas: [34],
    ejemplo: "Explicar con qué se financió el crecimiento de la cartera.",
  },
  {
    tipo: null,
    titulo: "Comparativo con competidores",
    descripcion: "Matriz de indicadores frente a hasta 4 entidades elegidas.",
    Icono: AimOutlined,
    hojas: [31],
    ejemplo: "",
    proximamente: true,
  },
  {
    tipo: null,
    titulo: "Alertas CAMELS / PERLAS",
    descripcion: "Semáforo por componente y deterioros de los últimos 6 meses.",
    Icono: FundOutlined,
    hojas: [28, 29, 33],
    ejemplo: "",
    proximamente: true,
  },
  {
    tipo: null,
    titulo: "Contexto sistema y macro",
    descripcion: "La entidad frente a su sector y al entorno económico.",
    Icono: GlobalOutlined,
    hojas: [2],
    ejemplo: "",
    proximamente: true,
  },
  {
    tipo: null,
    titulo: "Colocaciones y tasas",
    descripcion: "Montos colocados por producto y suficiencia de la tasa.",
    Icono: RiseOutlined,
    hojas: [18, 19, 30],
    ejemplo: "",
    proximamente: true,
  },
];

export const AUDIENCIAS: { value: Audiencia; label: string; Icono: ComponentType }[] = [
  { value: "gerencia", label: "Gerencia", Icono: BankOutlined },
  { value: "consejo", label: "Consejo", Icono: TrophyOutlined },
  { value: "riesgos", label: "Riesgos", Icono: AlertOutlined },
  { value: "auditoria", label: "Auditoría", Icono: SafetyCertificateOutlined },
];
