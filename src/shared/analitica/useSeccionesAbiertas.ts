import { useCallback, useState } from "react";
import { movimiento } from "@/design/tokens";

/** `id` del panel de una sección: permite enlazarla o desplazarse a ella. */
export const idSeccion = (key: string) => `seccion-${key}`;

/**
 * Estado de `SeccionesColapsables` en modo controlado, con `abrir` para llevar al usuario a una
 * sección desde otra parte de la vista (p. ej. clic en una fila que abre su detalle más abajo).
 *
 * ```tsx
 * const secciones = useSeccionesAbiertas(["evolucion", "detalle"]);
 * <SeccionesColapsables abiertas={secciones.abiertas} onCambiar={secciones.setAbiertas} … />
 * <Button onClick={() => secciones.abrir("detalle")}>Ver detalle</Button>
 * ```
 */
export const useSeccionesAbiertas = (inicial: string[]) => {
  const [abiertas, setAbiertas] = useState<string[]>(inicial);

  /** Abre la sección (si estaba cerrada) y, por defecto, la trae a la vista cuando termina de abrirse. */
  const abrir = useCallback((key: string, { desplazar = true }: { desplazar?: boolean } = {}) => {
    setAbiertas((actuales) => (actuales.includes(key) ? actuales : [...actuales, key]));
    if (!desplazar) return;
    // Esperar la animación de apertura: si se desplaza antes, la posición final queda corta.
    window.setTimeout(() => {
      // Sin animación si el usuario pidió reducir el movimiento en su sistema.
      const reducir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(idSeccion(key))?.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });
    }, movimiento.duracion.base);
  }, []);

  return { abiertas, setAbiertas, abrir };
};
