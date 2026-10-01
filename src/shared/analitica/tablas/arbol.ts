/**
 * Arbol de filas a partir de una lista plana con nivel (las tablas que antes solo sangraban).
 * El padre de una fila es la ultima anterior de nivel menor; `children` queda como lo pide antd.
 */
export type NodoArbol<T> = T & { children?: NodoArbol<T>[] };

export const arbolPorNivel = <T extends object>(filas: T[], nivelDe: (fila: T) => number): NodoArbol<T>[] => {
  const raices: NodoArbol<T>[] = [];
  const pila: { nivel: number; nodo: NodoArbol<T> }[] = [];
  filas.forEach((fila) => {
    const nodo = { ...fila } as NodoArbol<T>;
    const nivel = nivelDe(fila);
    while (pila.length && pila[pila.length - 1].nivel >= nivel) pila.pop();
    const padre = pila[pila.length - 1]?.nodo;
    if (padre) (padre.children ??= []).push(nodo);
    else raices.push(nodo);
    pila.push({ nivel, nodo });
  });
  return raices;
};

/** Recorrido en orden (padre, luego hijos) con la profundidad de cada fila. */
export const aplanarArbol = <T extends { children?: T[] }>(
  nodos: readonly T[],
  visitar: (nodo: T, profundidad: number, ancestros: T[]) => void,
  profundidad = 0,
  ancestros: T[] = [],
) => {
  nodos.forEach((n) => {
    visitar(n, profundidad, ancestros);
    if (n.children?.length) aplanarArbol(n.children, visitar, profundidad + 1, [...ancestros, n]);
  });
};
