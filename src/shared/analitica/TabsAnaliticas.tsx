import { ReactNode } from "react";
import { Tabs, Tag, Tooltip } from "antd";
import LimiteError from "./LimiteError";

export interface PestanaAnalitica {
  key: string;
  icono?: ReactNode;
  titulo: string;
  /** Etiqueta junto al titulo cuando algo no aplica a la pestaña (p. ej. "Toda la cartera"). */
  etiqueta?: { texto: string; ayuda?: string };
  contenido: ReactNode;
}

/**
 * Pestañas de una vista analitica.
 * - `destroyOnHidden`: solo se monta la pestaña visible.
 * - Cada pestaña va dentro de `LimiteError`: una grafica rota no tumba la vista entera.
 * - `claveReinicio` (p. ej. filtros aplicados) reintenta pintar tras un error cuando cambia.
 * - `activa` / `onCambiar`: modo controlado, para cambiar de pestaña desde fuera (un resumen que abre
 *   su detalle en otra pestaña). Sin `activa`, no controlado con `activaInicial`.
 */
const TabsAnaliticas = ({
  pestanas,
  claveReinicio,
  activaInicial,
  activa,
  onCambiar,
}: {
  pestanas: PestanaAnalitica[];
  claveReinicio?: string;
  /** Modo no controlado: pestaña abierta al montar. Por defecto, la primera. */
  activaInicial?: string;
  /**
   * Modo controlado: pestaña abierta. Con `activa`, `activaInicial` se ignora y el clic solo avisa
   * por `onCambiar` (sin él, las pestañas no cambian). Una key que no existe abre la primera.
   */
  activa?: string;
  /** Avisa de cada cambio de pestaña, controlado o no. */
  onCambiar?: (key: string) => void;
}) => {
  const valida = (key?: string) => (key !== undefined && pestanas.some((p) => p.key === key) ? key : pestanas[0]?.key);

  return (
    <Tabs
      {...(activa !== undefined ? { activeKey: valida(activa) } : { defaultActiveKey: valida(activaInicial) })}
      onChange={(key) => onCambiar?.(key)}
      destroyOnHidden
      className="mt-1 [&_.ant-tabs-ink-bar]:!h-[3px] [&_.ant-tabs-ink-bar]:rounded-t-marca [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!font-semibold [&>.ant-tabs-nav]:before:!border-linea"
      items={pestanas.map((p) => ({
        key: p.key,
        label: (
          <span className="flex items-center gap-1.5">
            {p.icono} {p.titulo}
            {p.etiqueta && (
              <Tooltip title={p.etiqueta.ayuda}>
                <Tag className="ml-1 text-rotulo leading-4 m-0">{p.etiqueta.texto}</Tag>
              </Tooltip>
            )}
          </span>
        ),
        children: <LimiteError claveReinicio={claveReinicio}>{p.contenido}</LimiteError>,
      }))}
    />
  );
};

export default TabsAnaliticas;
