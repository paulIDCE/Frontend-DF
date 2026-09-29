import type { KeyboardEvent, PointerEvent } from "react";
import type { GeometriaPeriodo } from "./useSeleccionRango";

type Asa = "mover" | "inicio" | "fin";

interface ControlesPeriodoProps {
  geometria: GeometriaPeriodo | null;
  alPulsar: (asa: Asa) => (evento: PointerEvent<HTMLElement>) => void;
  alTecla: (asa: Asa) => (evento: KeyboardEvent<HTMLElement>) => void;
}

const BASE =
  "absolute z-10 bg-superficie border border-accion rounded-control shadow-tarjeta touch-none " +
  "focus-visible:outline-2 focus-visible:outline-accion hover:bg-accion-sutil";

/** Dos rayas: el asa se ve agarrable sin depender de un icono. */
const Rayas = ({ vertical }: { vertical: boolean }) => (
  <span className={`absolute inset-0 flex items-center justify-center gap-0.5 ${vertical ? "" : "flex-col"}`}>
    <span className={`bg-accion rounded-marca ${vertical ? "w-px h-3" : "h-px w-3"}`} />
    <span className={`bg-accion rounded-marca ${vertical ? "w-px h-3" : "h-px w-3"}`} />
  </span>
);

/**
 * Asas del periodo sobre el lienzo: una a cada lado para extender solo el inicio o solo el fin, y
 * una arriba para mover la franja entera. Con el teclado: flechas (Mayús = paso largo).
 * Un extremo fuera de lo visible (zoom) no muestra su asa.
 */
const ControlesPeriodo = ({ geometria, alPulsar, alTecla }: ControlesPeriodoProps) => {
  if (!geometria) return null;
  const { izquierda, derecha, arriba, alto, conIzquierda, conDerecha } = geometria;
  const centro = arriba + alto / 2;
  const ancho = derecha - izquierda;
  return (
    <>
      {conIzquierda && (
        <span
          role="slider"
          tabIndex={0}
          aria-label="Inicio del periodo"
          aria-valuetext="Arrastrar o usar las flechas para mover el inicio"
          title="Arrastrar para cambiar el inicio"
          className={`${BASE} w-2.5 h-7 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize`}
          style={{ left: izquierda, top: centro }}
          onPointerDown={alPulsar("inicio")}
          onKeyDown={alTecla("inicio")}
        >
          <Rayas vertical />
        </span>
      )}
      {conDerecha && (
        <span
          role="slider"
          tabIndex={0}
          aria-label="Fin del periodo"
          aria-valuetext="Arrastrar o usar las flechas para mover el fin"
          title="Arrastrar para cambiar el fin"
          className={`${BASE} w-2.5 h-7 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize`}
          style={{ left: derecha, top: centro }}
          onPointerDown={alPulsar("fin")}
          onKeyDown={alTecla("fin")}
        >
          <Rayas vertical />
        </span>
      )}
      {ancho >= 32 && (
        <span
          role="slider"
          tabIndex={0}
          aria-label="Periodo"
          aria-valuetext="Arrastrar o usar las flechas para mover el periodo"
          title="Arrastrar para mover el periodo"
          className={`${BASE} w-7 h-2.5 -translate-x-1/2 cursor-grab active:cursor-grabbing`}
          style={{ left: izquierda + ancho / 2, top: arriba + 2 }}
          onPointerDown={alPulsar("mover")}
          onKeyDown={alTecla("mover")}
        >
          <Rayas vertical={false} />
        </span>
      )}
    </>
  );
};

export default ControlesPeriodo;
