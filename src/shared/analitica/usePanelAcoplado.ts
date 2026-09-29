import { RefObject, useEffect, useLayoutEffect, useState } from "react";
import { useAltoBarra } from "./VistaAnalitica";

export interface OpcionesPanelAcoplado {
  /** Aire entre la barra fija y el bloque, y bajo el panel. 12 px por defecto. */
  margen?: number;
  /** El panel nunca baja de este alto (ventanas muy bajas). 240 px por defecto. */
  altoMinimo?: number;
}

/** Atributo que marca dónde empieza el panel dentro del bloque: lo de encima se descuenta del alto. */
export const ATRIBUTO_PANEL_ACOPLADO = "data-panel-acoplado";

/** Primer ancestro con scroll vertical propio, o el documento. */
const contenedorScroll = (nodo: HTMLElement): HTMLElement => {
  for (let el = nodo.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") return el;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
};

const esDocumento = (el: HTMLElement) => el === document.scrollingElement || el === document.documentElement;

/** Parte visible del contenedor: arriba y alto (en el documento, la ventana). */
const ventanaDe = (contenedor: HTMLElement) =>
  esDocumento(contenedor)
    ? { arriba: 0, alto: window.innerHeight }
    : { arriba: contenedor.getBoundingClientRect().top, alto: contenedor.clientHeight };

/** ¿Hay, entre `desde` y `bloque`, un elemento con scroll vertical propio que desborda? */
const hayScrollPropio = (desde: EventTarget | null, bloque: HTMLElement) => {
  for (let el = desde instanceof Element ? desde : null; el && el !== bloque; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1) return true;
  }
  return false;
};

/**
 * Alto disponible para un panel con scroll propio (matriz, `TablaAnalitica` con `scroll.y`) cuando
 * el bloque queda justo bajo la barra fija de `VistaAnalitica`, y el acople con la rueda: al bajar
 * sobre un panel que desborda, la página se desplaza primero hasta dejar el bloque bajo la barra
 * (KPIs y pestañas fuera) y solo entonces el panel hace scroll por dentro. Al subir, el encadenado
 * nativo del navegador devuelve los KPIs.
 *
 * `ref` es el bloque (lo de encima del panel + el panel); el panel se marca con
 * `data-panel-acoplado`. Alto = alto visible − barra − lo de encima − 2 · margen, nunca menos que
 * `altoMinimo`. Lo usa `PanelAcoplado`; el hook suelto sirve cuando el marcado es propio.
 *
 * No toca `Ctrl` + rueda (zoom), el desplazamiento horizontal ni la rueda fuera de un panel que
 * desborde.
 */
export const usePanelAcoplado = (
  ref: RefObject<HTMLElement | null>,
  { margen = 12, altoMinimo = 240 }: OpcionesPanelAcoplado = {},
) => {
  const altoBarra = useAltoBarra() ?? 0;
  const [alto, setAlto] = useState(altoMinimo);

  // Alto disponible: se recalcula si cambia la barra (avisos, chips), lo de encima o la ventana.
  useLayoutEffect(() => {
    const bloque = ref.current;
    if (!bloque) return;
    const contenedor = contenedorScroll(bloque);
    const medir = () => {
      const panel = bloque.querySelector<HTMLElement>(`[${ATRIBUTO_PANEL_ACOPLADO}]`);
      const encima = panel ? panel.getBoundingClientRect().top - bloque.getBoundingClientRect().top : 0;
      setAlto(Math.max(altoMinimo, Math.floor(ventanaDe(contenedor).alto - altoBarra - encima - 2 * margen)));
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(bloque);
    if (!esDocumento(contenedor)) observador.observe(contenedor);
    window.addEventListener("resize", medir);
    return () => {
      observador.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [ref, altoBarra, margen, altoMinimo]);

  // Rueda: listener nativo, porque React registra `wheel` como pasivo y no deja `preventDefault`.
  useEffect(() => {
    const bloque = ref.current;
    if (!bloque) return;
    const contenedor = contenedorScroll(bloque);
    const alGirar = (evento: WheelEvent) => {
      if (evento.ctrlKey || evento.deltaY <= 0 || Math.abs(evento.deltaX) > Math.abs(evento.deltaY)) return;
      if (!hayScrollPropio(evento.target, bloque)) return;
      const ventana = ventanaDe(contenedor);
      const distancia = bloque.getBoundingClientRect().top - ventana.arriba - (altoBarra + margen);
      if (distancia <= 1) return; // Ya acoplado: el panel hace scroll por dentro.
      const escala = evento.deltaMode === 1 ? 16 : evento.deltaMode === 2 ? ventana.alto : 1;
      evento.preventDefault();
      contenedor.scrollBy({ top: Math.min(evento.deltaY * escala, distancia) });
    };
    bloque.addEventListener("wheel", alGirar, { passive: false });
    return () => bloque.removeEventListener("wheel", alGirar);
  }, [ref, altoBarra, margen]);

  return alto;
};
