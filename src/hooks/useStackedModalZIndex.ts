import { useState } from "react";
import { nextOverlayZIndex, overlayContainer } from "@/utils/overlayZIndex";

/**
 * Cada vez que un Modal/Drawer se abre, toma un z-index mayor que lo visible.
 * Así el 2.º popup queda sobre el 1.º.
 */
export const useStackedModalZIndex = (open: boolean): number | undefined => {
  const [state, setState] = useState<{ open: boolean; z?: number }>(() => ({
    open,
    z: open ? nextOverlayZIndex() : undefined,
  }));

  if (open !== state.open) {
    const next = { open, z: open ? nextOverlayZIndex() : undefined };
    setState(next);
    return next.z;
  }

  return state.z;
};

/** Props comunes de Ant Design Modal para apilarse sobre lo que ya está en pantalla. */
export const useStackedOverlayProps = (open: boolean) => ({
  zIndex: useStackedModalZIndex(open),
  getContainer: overlayContainer,
});
