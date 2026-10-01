import type { ComponentType } from "react";
import { Hoja1, Hoja2 } from "./balance";
import { Hoja3, Hoja4, Hoja6, Hoja7, Hoja8 } from "./estructuras";
import { Hoja5, Hoja9, Hoja24, Hoja25, Hoja26 } from "./rankings";
import { Hoja10, Hoja11 } from "./pyg";
import { Hoja12, Hoja13, Hoja14, Hoja15, Hoja16 } from "./cartera";
import { Hoja27, Hoja28, Hoja29, Hoja30, Hoja31 } from "./indicadores";
import { Hoja17, Hoja18, Hoja19, Hoja20, Hoja21, Hoja22, Hoja23 } from "./operaciones";
import { HojaTendencias } from "./tendencias";
import { HojaAuditoria } from "./auditoria";

/** Indice de hojas de la revista (`pageNames` de prueba-data `analisis.js`). */


export interface Hoja {
  numero: number;
  nombre: string;
  Componente: ComponentType;
}

const h = (numero: number, nombre: string, Componente: ComponentType): Hoja => ({ numero, nombre, Componente });

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
  h(12, "Intermediación Financiera", Hoja12),
  h(13, "Cartera Productiva", Hoja13),
  h(14, "Cartera Consumo", Hoja14),
  h(15, "Cartera Inmobiliario", Hoja15),
  h(16, "Cartera Microcrédito", Hoja16),
  h(17, "Índice de Turbulencia", Hoja17),
  h(18, "Monto Activas y Pasivas", Hoja18),
  h(19, "Monto Activas Seg. Productivo", Hoja19),
  h(20, "Monto Activas Seg. Consumo y Educativo", Hoja20),
  h(21, "Monto Activas Seg. Inmobiliario Y Vivienda", Hoja21),
  h(22, "Monto Activas Seg. Microcrédito", Hoja22),
  h(23, "Monto de Operaciones Pasivas", Hoja23),
  h(24, "Ranking Cartera Neta", Hoja24),
  h(25, "Ranking MOA", Hoja25),
  h(26, "Ranking MOP", Hoja26),
  h(27, "Indicadores Financieros", Hoja27),
  h(28, "Indicadores CAMELS - PERLAS", Hoja28),
  h(29, "Evolución Indicadores CAMELS - PERLAS", Hoja29),
  h(30, "Tasas de Interés", Hoja30),
  h(31, "Comparación entre entidades", Hoja31),
  h(32, "Tendencias (TAM y Gráfico Z)", HojaTendencias),
  h(33, "Auditoría de desviaciones", HojaAuditoria),
];
