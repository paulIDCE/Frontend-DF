import { createContext } from "react";

/**
 * Alto de la barra fija de `VistaAnalitica`; `null` fuera de ella (no hay barra que respetar).
 * Interno: `PanelAcoplado` lo pone a `null` para lo que tiene dentro. Los consumidores leen
 * `useAltoBarra`.
 */
export const ContextoVistaAnalitica = createContext<number | null>(null);
