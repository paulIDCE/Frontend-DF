import { ReactNode, useRef } from "react";
import { ContextoVistaAnalitica } from "./contextoVistaAnalitica";
import { ATRIBUTO_PANEL_ACOPLADO, usePanelAcoplado } from "./usePanelAcoplado";
import type { OpcionesPanelAcoplado } from "./usePanelAcoplado";

export interface PanelAcopladoProps extends OpcionesPanelAcoplado {
  /** Lo que acompaña al panel y sube con él (leyenda, selectores): queda entre la barra y el panel. */
  encima?: ReactNode;
  /**
   * El panel. Recibe el alto disponible: usarlo como `maxHeight` de un `div` con `overflow-auto`, o
   * en `scroll={{ y: alto - cabecera }}` de una `TablaAnalitica`.
   */
  children: (alto: number) => ReactNode;
  className?: string;
}

/**
 * Bloque protagonista de una vista densa (matriz, tabla larga) dentro de `VistaAnalitica`: al bajar
 * con la rueda sobre el panel, la página se desplaza hasta dejarlo justo bajo la barra fija y
 * después el panel hace scroll por dentro con todo el alto de la ventana. Ver `usePanelAcoplado`.
 *
 * Dentro del panel no hay barra que respetar: las `TablaAnalitica` no fijan su cabecera bajo la
 * barra (tienen su propio scroll). La pantalla completa de `TarjetaGrafica` y los modales quedan fuera.
 */
const PanelAcoplado = ({ encima, children, className = "", ...opciones }: PanelAcopladoProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const alto = usePanelAcoplado(ref, opciones);
  return (
    <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
      {encima}
      <div {...{ [ATRIBUTO_PANEL_ACOPLADO]: "" }} className="min-w-0">
        <ContextoVistaAnalitica.Provider value={null}>{children(alto)}</ContextoVistaAnalitica.Provider>
      </div>
    </div>
  );
};

export default PanelAcoplado;
