import { createContext, useContext } from "react";

/**
 * Modo impresion (PDF con `window.print()`): las piezas del kit se maquetan para papel. Las
 * graficas se pintan en SVG (vectorial, no se recortan), sin animacion, sin slider y sin barra de
 * botones; las tablas, sin scroll ni cabecera fija, con todas las ramas abiertas y sin su barra.
 */
export const ImpresionContext = createContext(false);

export const useImpresion = () => useContext(ImpresionContext);
