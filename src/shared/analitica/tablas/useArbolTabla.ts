import { useCallback, useMemo, useState } from "react";
import type { Key } from "react";
import { aplanarArbol } from "./arbol";

type ClaveDe<T> = (fila: T) => Key;

/**
 * Expansion controlada de una tabla arbol (antd `children`) con "Expandir todo" / "Contraer todo".
 * El estado se liga a las ramas de los datos: con otro arbol vuelve a `inicial` sin un efecto.
 * `fijas`: ramas que "Contraer todo" deja abiertas (encabezados de grupo sin valores propios).
 */
export const useArbolTabla = <T extends { children?: T[] }>(
  datos: readonly T[],
  claveDe: ClaveDe<T>,
  inicial: "expandido" | "contraido" = "contraido",
  fijas: readonly Key[] = [],
) => {
  const padres = useMemo(() => {
    const claves: Key[] = [];
    aplanarArbol(datos, (n) => {
      if (n.children?.length) claves.push(claveDe(n));
    });
    return claves;
  }, [datos, claveDe]);
  const base = padres.join("|");

  const [estado, setEstado] = useState<{ base: string; claves: readonly Key[] } | null>(null);
  const abiertasFijas = useMemo(() => fijas.filter((k) => padres.includes(k)), [fijas, padres]);
  const expandidas = estado && estado.base === base ? estado.claves : inicial === "expandido" ? padres : abiertasFijas;

  const expandirTodo = useCallback(() => setEstado({ base, claves: padres }), [base, padres]);
  const contraerTodo = useCallback(() => setEstado({ base, claves: abiertasFijas }), [base, abiertasFijas]);
  const alCambiar = useCallback((claves: readonly Key[]) => setEstado({ base, claves }), [base]);

  return { expandidas, padres, alCambiar, expandirTodo, contraerTodo, hayRamas: padres.length > 0 };
};
