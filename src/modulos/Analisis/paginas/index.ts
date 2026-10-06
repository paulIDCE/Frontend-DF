import type { ComponentType } from "react";
import { legible } from "../texto";
import { Hoja1, Hoja2 } from "./balance";
import { Hoja3, Hoja4, Hoja6, Hoja7, Hoja8 } from "./estructuras";
import { Hoja5, Hoja9, Hoja24, Hoja25, Hoja26 } from "./rankings";
import { Hoja10, Hoja11 } from "./pyg";
import { Hoja12, Hoja14, Hoja15, Hoja16 } from "./cartera";
import { Hoja27, Hoja28, Hoja29, Hoja30, Hoja31 } from "./indicadores";
import { Hoja17, Hoja18, Hoja20, Hoja21, Hoja22, Hoja23 } from "./operaciones";
import { HojaTendencias } from "./tendencias";
import { HojaAuditoria } from "./auditoria";
import { HojaFuentesUsos } from "./fuentesUsos";
import { HojaRankingIndicador } from "./rankingIndicador";
import { HojaResumen } from "./resumen";
import { CarteraPorSegmento, MontosPorSegmento } from "./segmentos";

/**
 * Indice de hojas de la revista (`pageNames` de prueba-data `analisis.js`) y su navegacion por
 * secciones (04 §7; plan 06, item 1.20).
 *
 * El `numero` es el id estable de la hoja (va en la URL `?hoja=` y en las tarjetas del hub): las
 * 31 originales conservan el suyo y las nuevas siguen desde 32. El ORDEN de lectura lo dan las
 * `SECCIONES`. Las hojas por segmento casi identicas (13-16 de cartera, 19-22 de montos) se
 * presentan como una sola con selector; las demas quedan accesibles por URL pero fuera del indice.
 */

export interface Hoja {
  numero: number;
  nombre: string;
  Componente: ComponentType;
}

/** El nombre en tipo oracion, como los titulos de las hojas (`legible`). */
const h = (numero: number, nombre: string, Componente: ComponentType): Hoja => ({ numero, nombre: legible(nombre), Componente });

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
  h(13, "Cartera por Segmento", CarteraPorSegmento),
  h(14, "Cartera Consumo", Hoja14),
  h(15, "Cartera Inmobiliario", Hoja15),
  h(16, "Cartera Microcrédito", Hoja16),
  h(17, "Índice de Turbulencia", Hoja17),
  h(18, "Monto Activas y Pasivas", Hoja18),
  h(19, "Monto Activas por Segmento", MontosPorSegmento),
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
  h(34, "Fuentes y Usos", HojaFuentesUsos),
  h(35, "Ranking por Indicador", HojaRankingIndicador),
  h(36, "Resumen Ejecutivo", HojaResumen),
];

export interface Seccion {
  titulo: string;
  hojas: number[];
}

/** Secciones por tarea del usuario (04 §7), en orden de lectura. */
export const SECCIONES: Seccion[] = [
  { titulo: "Resumen", hojas: [36] },
  { titulo: "Estados financieros", hojas: [1, 2, 10, 11, 34] },
  { titulo: "Estructura", hojas: [3, 4, 6, 7, 8] },
  { titulo: "Cartera y calidad de activos", hojas: [12, 13, 17] },
  { titulo: "Indicadores, liquidez y solvencia", hojas: [27, 28, 29] },
  { titulo: "Tendencias", hojas: [32] },
  { titulo: "Auditoría y alertas", hojas: [33] },
  { titulo: "Mercado y grupo par", hojas: [35, 5, 9, 24, 25, 26, 31] },
  { titulo: "Operaciones y tasas", hojas: [18, 19, 23, 30] },
];

const POR_NUMERO = new Map(HOJAS.map((x) => [x.numero, x]));

export const hojaPorNumero = (n: number): Hoja | undefined => POR_NUMERO.get(n);

/** Hojas del indice, en orden de lectura (las de segmento sueltas no estan: van dentro de 13 y 19). */
export const HOJAS_ORDENADAS: Hoja[] = SECCIONES.flatMap((s) => s.hojas.map((n) => POR_NUMERO.get(n)!));

export const seccionDe = (n: number): string => SECCIONES.find((s) => s.hojas.includes(n))?.titulo ?? "";
