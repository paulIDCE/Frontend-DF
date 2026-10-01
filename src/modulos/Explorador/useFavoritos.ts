import { useCallback, useState } from "react";
import type { ItemFavorito } from "./tipos";

/**
 * Favoritos persistentes de series, compartidos por Macro, Sistema y Tasas.
 * Antes "carrito" (`localStorage['carritoSeries']` de prueba-data): lo guardado alli se migra una vez.
 */
const CLAVE = "favoritosSeries";
const CLAVE_ANTIGUA = "carritoSeries";

const leerClave = (clave: string): ItemFavorito[] | null => {
  const crudo = localStorage.getItem(clave);
  if (crudo === null) return null;
  const valor = JSON.parse(crudo);
  return Array.isArray(valor) ? valor : [];
};

const leer = (): ItemFavorito[] => {
  try {
    const actuales = leerClave(CLAVE);
    if (actuales) return actuales;
    const antiguos = leerClave(CLAVE_ANTIGUA) ?? [];
    if (antiguos.length) {
      localStorage.setItem(CLAVE, JSON.stringify(antiguos));
      localStorage.removeItem(CLAVE_ANTIGUA);
    }
    return antiguos;
  } catch {
    return [];
  }
};

const guardar = (items: ItemFavorito[]) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items));
  } catch {
    // Sin almacenamiento (modo privado): los favoritos viven solo en memoria.
  }
};

/** Identidad de un item: misma fila de origen del mismo cuadro y sector. */
export const mismoItem = (a: ItemFavorito, b: ItemFavorito): boolean =>
  a.index === b.index && a.cuadroId === b.cuadroId && (a.sector ?? "") === (b.sector ?? "");

/** Id del item igual al de la serie de la coleccion (`cuadro_sector_indice`). */
export const idFavorito = (item: Pick<ItemFavorito, "cuadroId" | "sector" | "index">) =>
  `${item.cuadroId}_${item.sector ?? ""}_${item.index}`;

export const useFavoritos = () => {
  const [items, setItems] = useState<ItemFavorito[]>(leer);

  const actualizar = useCallback((fn: (actual: ItemFavorito[]) => ItemFavorito[]) => {
    setItems((actual) => {
      const nuevo = fn(actual);
      guardar(nuevo);
      return nuevo;
    });
  }, []);

  const es = useCallback((item: ItemFavorito) => items.some((i) => mismoItem(i, item)), [items]);

  /** Añade o quita. Devuelve `true` si quedo en favoritos. */
  const alternar = useCallback(
    (item: ItemFavorito): boolean => {
      const estaba = leer().some((i) => mismoItem(i, item));
      actualizar((actual) => (estaba ? actual.filter((i) => !mismoItem(i, item)) : [...actual, item]));
      return !estaba;
    },
    [actualizar]
  );

  const quitar = useCallback(
    (item: ItemFavorito) => actualizar((actual) => actual.filter((i) => !mismoItem(i, item))),
    [actualizar]
  );

  const vaciar = useCallback(() => actualizar(() => []), [actualizar]);

  return { items, es, alternar, quitar, vaciar };
};
