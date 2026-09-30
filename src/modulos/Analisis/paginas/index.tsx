import type { ComponentType } from "react";
import { HojaPendiente } from "../componentes";
import { Hoja1, Hoja2 } from "./balance";
import { Hoja3, Hoja4, Hoja6, Hoja7, Hoja8 } from "./estructuras";
import { Hoja5, Hoja9, Hoja24, Hoja25, Hoja26 } from "./rankings";
import { Hoja10, Hoja11 } from "./pyg";

/** Indice de hojas de la revista (`pageNames` de prueba-data `analisis.js`). */


export interface Hoja {
  numero: number;
  nombre: string;
  Componente: ComponentType;
}

const h = (numero: number, nombre: string, Componente: ComponentType = HojaPendiente): Hoja => ({ numero, nombre, Componente });

export const HOJAS: Hoja[] = [
  h(1, "Balance General", Hoja1),
  h(2, "Evolución Histórica", Hoja2),
  h(3, "Activo Productivo", Hoja3),
  h(4, "Activos Improductivos", Hoja4),
  h(5, "Ranking por Activos", Hoja5),
  h(6, "Estructura Pasivo", Hoja6),
  h(7, "Pasivos Exigibles", Hoja7),
  h(8, "Pasivos con Costo", Hoja8),
  h(9, "Ranking Pasivos", Hoja9),
  h(10, "PyG Mensual", Hoja10),
  h(11, "PyG Anual", Hoja11),
  h(12, "Intermediación Financiera"),
  h(13, "Cartera Productiva"),
  h(14, "Cartera Consumo"),
  h(15, "Cartera Inmobiliario"),
  h(16, "Cartera Microcrédito"),
  h(17, "Índice de Turbulencia"),
  h(18, "Monto Activas y Pasivas"),
  h(19, "Monto Activas Seg. Productivo"),
  h(20, "Monto Activas Seg. Consumo y Educativo"),
  h(21, "Monto Activas Seg. Inmobiliario Y Vivienda"),
  h(22, "Monto Activas Seg. Microcrédito"),
  h(23, "Monto de Operaciones Pasivas"),
  h(24, "Ranking Cartera Neta", Hoja24),
  h(25, "Ranking MOA", Hoja25),
  h(26, "Ranking MOP", Hoja26),
  h(27, "Indicadores Financieros"),
  h(28, "Indicadores CAMELS - PERLAS"),
  h(29, "Evolución Indicadores CAMELS - PERLAS"),
  h(30, "Tasas de Interés"),
  h(31, "Comparación entre entidades"),
];
