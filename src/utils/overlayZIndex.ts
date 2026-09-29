/** Piso de Modal antd (`zIndexPopupBase` + offset de contenedor). */
const MODAL_Z_FLOOR = 1100;
/** Hueco para Select/Dropdown internos (+50) sin tapar el siguiente Modal. */
const MODAL_Z_STEP = 100;

/** SweetAlert2 debe quedar por encima de cualquier pila de Modal/Drawer. */
export const SWAL_Z_INDEX = 10_000;

/** Atributo de los overlays propios del kit (`ModalFullscreen`), que no son un Modal antd. */
export const OVERLAY_ATRIBUTO = "data-overlay-idce";

const OVERLAY_SELECTORS = [
  ".ant-modal-wrap",
  ".ant-modal-mask",
  ".ant-drawer",
  ".ant-drawer-mask",
  // Sin esto, un Modal abierto desde la pantalla completa ("Ver datos") calculaba su z-index sin
  // verla y quedaba debajo.
  `[${OVERLAY_ATRIBUTO}]`,
].join(",");

/** Portal estable en `body` para no atrapar el overlay en el stacking del padre. */
export const overlayContainer = (): HTMLElement => document.body;

/**
 * Siguiente z-index por encima de los overlays visibles.
 * No supera `SWAL_Z_INDEX`: el alert siempre gana.
 */
export const nextOverlayZIndex = (): number => {
  if (typeof document === "undefined") return MODAL_Z_FLOOR;
  let max = MODAL_Z_FLOOR - MODAL_Z_STEP;
  document.querySelectorAll(OVERLAY_SELECTORS).forEach((el) => {
    const z = Number.parseInt(getComputedStyle(el).zIndex, 10);
    if (!Number.isNaN(z) && z < SWAL_Z_INDEX) max = Math.max(max, z);
  });
  return Math.min(max + MODAL_Z_STEP, SWAL_Z_INDEX - MODAL_Z_STEP);
};
