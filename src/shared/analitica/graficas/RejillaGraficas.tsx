import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { espacio } from "@/design/tokens";

export interface RejillaGraficasProps {
  /** Normalmente `MiniGrafica`, una por elemento. */
  children: ReactNode;
  /** Ancho mínimo de cada gráfica (px). */
  anchoMinimo?: number;
  /** Tope de columnas aunque quepan más. */
  columnasMaximas?: number;
  className?: string;
}

/**
 * Rejilla de gráficas iguales que se pinta UNA sola vez.
 *
 * Reemplaza el antipatrón `block xl:hidden overflow-x-auto` + `hidden xl:grid xl:grid-cols-N`: ahí
 * cada gráfica se montaba dos veces (una oculta con CSS, inicializada con tamaño 0) y el corte `xl`
 * (1280 px) mira la ventana, no el espacio real; dentro del iframe del SSO (≈1264 px) nunca se veía
 * la rejilla.
 *
 * Aquí se mide el contenedor:
 * - caben 2 o más columnas de `anchoMinimo` → rejilla que reparte el ancho (hasta `columnasMaximas`);
 * - cabe 1 → una fila con scroll horizontal, cada gráfica de `anchoMinimo`.
 */
const RejillaGraficas = ({ children, anchoMinimo = 220, columnasMaximas, className = "" }: RejillaGraficasProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState<number | null>(null);
  const hueco = espacio.rejilla;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setAncho(el.clientWidth);
    const observador = new ResizeObserver(([entrada]) => setAncho(entrada.contentRect.width));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const caben = ancho === null ? null : Math.floor((ancho + hueco) / (anchoMinimo + hueco));
  const columnas = caben === null ? null : Math.min(caben, columnasMaximas ?? caben);
  const enFila = columnas !== null && columnas < 2;

  const estilo: CSSProperties = enFila
    ? { gap: hueco, gridAutoFlow: "column", gridAutoColumns: anchoMinimo }
    : {
        gap: hueco,
        // Antes de medir: tantas columnas como quepan, para no parpadear en la primera pintura.
        gridTemplateColumns:
          columnas === null
            ? `repeat(auto-fill, minmax(min(100%, ${anchoMinimo}px), 1fr))`
            : `repeat(${columnas}, minmax(0, 1fr))`,
      };

  return (
    <div ref={ref} className={`min-w-0 ${enFila ? "overflow-x-auto pb-1" : ""} ${className}`}>
      <div className="grid" style={estilo}>
        {children}
      </div>
    </div>
  );
};

export default RejillaGraficas;
