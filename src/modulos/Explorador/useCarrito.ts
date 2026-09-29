import { useCallback, useState } from "react";
import type { ItemCarrito } from "./tipos";

/**
 * Carrito persistente de series, compartido por Macro, Sistema y Tasas.
 * Misma clave y forma que prueba-data: `localStorage['carritoSeries']`.
 */
const CLAVE = "carritoSeries";

const leer = (): ItemCarrito[] => {
  try {
    const crudo = localStorage.getItem(CLAVE);
    const valor = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(valor) ? valor : [];
  } catch {
    return [];
  }
};

const guardar = (items: ItemCarrito[]) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items));
  } catch {
    // Sin almacenamiento (modo privado): el carrito vive solo en memoria.
  }
};

/** Identidad de un item: misma fila de origen del mismo cuadro y sector. */
export const mismoItem = (a: ItemCarrito, b: ItemCarrito): boolean =>
  a.index === b.index && a.cuadroId === b.cuadroId && (a.sector ?? "") === (b.sector ?? "");

export const useCarrito = () => {
  const [items, setItems] = useState<ItemCarrito[]>(leer);

  const actualizar = useCallback((fn: (actual: ItemCarrito[]) => ItemCarrito[]) => {
    setItems((actual) => {
      const nuevo = fn(actual);
      guardar(nuevo);
      return nuevo;
    });
  }, []);

  /** Devuelve `false` si ya estaba. */
  const agregar = useCallback(
    (item: ItemCarrito): boolean => {
      if (leer().some((i) => mismoItem(i, item))) return false;
      actualizar((actual) => [...actual, item]);
      return true;
    },
    [actualizar]
  );

  const quitar = useCallback(
    (posicion: number) => actualizar((actual) => actual.filter((_, i) => i !== posicion)),
    [actualizar]
  );

  const vaciar = useCallback(() => actualizar(() => []), [actualizar]);

  return { items, agregar, quitar, vaciar };
};
