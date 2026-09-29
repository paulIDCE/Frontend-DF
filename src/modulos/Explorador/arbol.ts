import type { NodoCuadro } from "./tipos";

/** Primera hoja del arbol que apunta a `cuadro`. */
export const buscarPorCuadro = (nodos: NodoCuadro[], cuadro: string): NodoCuadro | undefined => {
  for (const n of nodos) {
    if (n.cuadro === cuadro) return n;
    const h = n.hijos && buscarPorCuadro(n.hijos, cuadro);
    if (h) return h;
  }
  return undefined;
};
