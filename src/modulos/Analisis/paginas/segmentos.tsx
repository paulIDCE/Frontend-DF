import { Hoja13, Hoja14, Hoja15, Hoja16 } from "./cartera";
import { Hoja19, Hoja20, Hoja21, Hoja22 } from "./operaciones";
import { HojaConSelector } from "./HojaConSelector";

/** Hojas por segmento reunidas en una con selector (plan 06, item 1.20). */

export const CarteraPorSegmento = () => (
  <HojaConSelector
    rotulo="Segmento"
    opciones={[
      { key: "productivo", titulo: "Productivo", Componente: Hoja13 },
      { key: "consumo", titulo: "Consumo", Componente: Hoja14 },
      { key: "inmobiliario", titulo: "Inmobiliario", Componente: Hoja15 },
      { key: "micro", titulo: "Microcrédito", Componente: Hoja16 },
    ]}
  />
);

export const MontosPorSegmento = () => (
  <HojaConSelector
    rotulo="Segmento"
    opciones={[
      { key: "productivo", titulo: "Productivo", Componente: Hoja19 },
      { key: "consumo", titulo: "Consumo y educativo", Componente: Hoja20 },
      { key: "inmobiliario", titulo: "Inmobiliario y vivienda", Componente: Hoja21 },
      { key: "micro", titulo: "Microcrédito", Componente: Hoja22 },
    ]}
  />
);
