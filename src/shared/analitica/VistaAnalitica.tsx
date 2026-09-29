import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { ConfigProvider } from "antd";
import type { ThemeConfig } from "antd";
import esESModulo from "antd/locale/es_ES.js";
import { interopDefault } from "@/utils/interop";
import { color, espacio, tipografia } from "@/design/tokens";
import { ContextoVistaAnalitica } from "./contextoVistaAnalitica";

// Con `.js`: antd no tiene mapa `exports` y el ESM de Node exige la extension. Es CommonJS, de
// ahi `interopDefault` (en Node llega `{ default: locale }`).
const esES = interopDefault(esESModulo);

/**
 * Tema comun de las vistas analiticas. Solo ajusta densidad y contraste; los colores son los
 * tokens del sistema (`src/design/tokens.ts`), repartidos por rol:
 * - Tablas compactas (el area util dentro del SSO es de ~1264 x 569 px).
 * - Pestañas en accion (el azul de las vistas internas), con aire y la activa bien marcada: con
 *   size="small" se veian pegadas y el cambio de seccion pasaba desapercibido.
 * - Segmented en accion, opcion activa solida (blanco 5.2:1): blanco sobre gris claro casi no se
 *   distinguia.
 */
export const TEMA_ANALITICA: ThemeConfig = {
  components: {
    Table: { cellPaddingBlockSM: 5, cellPaddingInlineSM: 8, headerBg: color.superficie.sutil },
    Tabs: {
      // Espaciados en múltiplos de `espacio.unidad`, no en píxeles fijos.
      horizontalMargin: `0 0 ${espacio.rejilla}px 0`,
      horizontalItemGutter: espacio.unidad * 9,
      horizontalItemPadding: `${espacio.unidad * 2.5}px ${espacio.unidad}px`,
      titleFontSize: tipografia.escala.cuerpo.tamano,
      itemColor: color.tinta.tenue,
      itemHoverColor: color.accion.hover,
      itemSelectedColor: color.accion.base,
      inkBarColor: color.accion.base,
    },
    Segmented: {
      itemSelectedBg: color.accion.base,
      itemSelectedColor: color.tinta.inversa,
      itemColor: color.tinta.secundaria,
      itemHoverColor: color.accion.base,
      trackBg: color.superficie.hundida,
    },
  },
};

/**
 * Alto real de la barra de filtros fija. Lo usa `TablaAnalitica` para su `sticky`, asi las tablas
 * no necesitan recibir `altoBarra` por props. Fuera de una vista devuelve `null`.
 */
export const useAltoBarra = () => useContext(ContextoVistaAnalitica);

interface VistaAnaliticaProps {
  /** Barra de filtros: queda fija arriba al hacer scroll. */
  barra: ReactNode;
  /**
   * Contenido bajo la barra. Como funcion recibe el alto real de la barra fija, que las tablas
   * usan en `sticky={{ offsetHeader: altoBarra }}` para quedar justo debajo.
   */
  children: ReactNode | ((contexto: { altoBarra: number }) => ReactNode);
  /** Modales de la vista (detalle, etc.): van fuera de la tarjeta. */
  modales?: ReactNode;
}

/**
 * Contenedor estandar de una vista analitica: `ConfigProvider` en español con el tema comun,
 * la misma tarjeta blanca que el resto de vistas del sistema y la barra de filtros fija.
 */
const VistaAnalitica = ({ barra, children, modales }: VistaAnaliticaProps) => {
  const barraRef = useRef<HTMLDivElement>(null);
  const [altoBarra, setAltoBarra] = useState(56);

  useEffect(() => {
    const nodo = barraRef.current;
    if (!nodo) return;
    const observador = new ResizeObserver(() => setAltoBarra(nodo.offsetHeight));
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <ConfigProvider locale={esES} theme={TEMA_ANALITICA}>
      <ContextoVistaAnalitica.Provider value={altoBarra}>
        <div className="pb-4">
          <div className="bg-superficie rounded-contenedor p-4 shadow-contenedor flex flex-col gap-2 w-full">
            {/* Ocupa todo el ancho de la tarjeta (-mx-4) para que el contenido no asome por los
                lados al pasar debajo. */}
            <div ref={barraRef} className="sticky top-0 z-20 -mx-4 px-4 pb-2 bg-superficie border-b border-linea-sutil">
              {barra}
            </div>
            {typeof children === "function" ? children({ altoBarra }) : children}
          </div>
        </div>
        {modales}
      </ContextoVistaAnalitica.Provider>
    </ConfigProvider>
  );
};

export default VistaAnalitica;
