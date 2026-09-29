import { MouseEvent, ReactNode } from "react";
import { Collapse, Tag, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { color, espacio, radio, tipografia } from "@/design/tokens";
import { colorTexto, type ColorKit } from "@/design/colorRol";
import LimiteError from "./LimiteError";
import { useAltoBarra } from "./VistaAnalitica";
import { idSeccion } from "./useSeccionesAbiertas";

export interface SeccionColapsable {
  /** Única en la página: también forma el `id` del panel (`seccion-<key>`) para desplazarse a él. */
  key: string;
  titulo: ReactNode;
  icono?: ReactNode;
  /** Color del icono de esta sección; si no, el de `colorIcono` de las secciones. */
  colorIcono?: ColorKit;
  /** Una línea de apoyo bajo el título. */
  descripcion?: ReactNode;
  /** Texto del icono "?" a la derecha: qué muestra la sección y cómo leerla. */
  ayuda?: ReactNode;
  /** Cuando algo no aplica a la sección (p. ej. "Toda la cartera"), igual que en `TabsAnaliticas`. */
  etiqueta?: { texto: string; ayuda?: string };
  /** Acciones de la cabecera (Excel, selector…). Hacer clic en ellas no abre ni cierra la sección. */
  extra?: ReactNode;
  contenido: ReactNode;
  deshabilitada?: boolean;
}

interface SeccionesColapsablesProps {
  secciones: SeccionColapsable[];
  /** Modo controlado (con `useSeccionesAbiertas` para abrir y desplazarse por código). */
  abiertas?: string[];
  onCambiar?: (abiertas: string[]) => void;
  /** Modo no controlado. Por defecto, todas abiertas. */
  abiertasIniciales?: string[];
  /** Solo una abierta a la vez (acordeón). */
  unaALaVez?: boolean;
  /** Si cambia (p. ej. los filtros aplicados), las secciones con error vuelven a intentar pintarse. */
  claveReinicio?: string;
  /**
   * Desmontar el contenido al cerrar. Por defecto se conserva: al reabrir, las gráficas no se
   * recalculan ni pierden el zoom. Activarlo solo si una sección cerrada consume mucho.
   */
  destruirAlCerrar?: boolean;
  /** Color de los iconos de cabecera: un rol o un color propio. Por defecto, `"accion"`. */
  colorIcono?: ColorKit;
  className?: string;
}

const u = espacio.unidad;

/** El clic en ayuda o acciones no debe alternar la sección. */
const sinAlternar = (e: MouseEvent) => e.stopPropagation();

/**
 * Secciones apiladas que el usuario abre y cierra (antd `Collapse` con el estándar del kit).
 *
 * Cuándo usarlas y cuándo no (ver `docs/VISTAS_ANALITICAS.md` §6.2):
 * - Varias secciones que conviene ver **a la vez** o comparar haciendo scroll → estas secciones.
 * - Contenidos alternativos, **uno a la vez** → `TabsAnaliticas`.
 * - Los mismos datos en tabla o gráfica → `AlternarTablaGrafica`.
 *
 * Sustituye el antipatrón de `Collapse` repetidos archivo por archivo con la misma cabecera hecha a mano
 * (icono azul + título que crece al pasar el mouse) y un `onChange` que solo hacía `devLog`.
 */
const SeccionesColapsables = ({
  secciones,
  abiertas,
  onCambiar,
  abiertasIniciales,
  unaALaVez = false,
  claveReinicio,
  destruirAlCerrar = false,
  colorIcono,
  className,
}: SeccionesColapsablesProps) => {
  const altoBarra = useAltoBarra();

  return (
    <Collapse
      ghost
      className={className}
      accordion={unaALaVez}
      destroyOnHidden={destruirAlCerrar}
      expandIconPlacement="end"
      {...(abiertas
        ? { activeKey: abiertas }
        : { defaultActiveKey: abiertasIniciales ?? secciones.map((s) => s.key) })}
      onChange={(keys) => onCambiar?.(([] as string[]).concat(keys))}
      styles={{
        root: { display: "flex", flexDirection: "column", gap: espacio.rejilla },
        header: { alignItems: "center", padding: `${u * 2.5}px ${u * 4}px` },
        body: { padding: `0 ${u * 4}px ${u * 4}px` },
      }}
      items={secciones.map((s) => ({
        key: s.key,
        id: idSeccion(s.key),
        collapsible: s.deshabilitada ? "disabled" : undefined,
        style: {
          background: color.superficie.base,
          border: `1px solid ${color.linea.base}`,
          borderRadius: radio.tarjeta,
          overflow: "hidden",
          // Al desplazarse a la sección, que no quede tapada por la barra de filtros fija.
          scrollMarginTop: (altoBarra ?? 0) + espacio.rejilla,
        },
        label: (
          <div className="flex items-center gap-2 min-w-0">
            {s.icono && (
              <span
                className={`flex shrink-0 ${s.colorIcono ?? colorIcono ? "" : "text-accion"}`}
                style={{
                  fontSize: tipografia.escala.titulo.tamano,
                  // Sin color elegido va la clase del token; con él, el color resuelto.
                  ...(s.colorIcono ?? colorIcono ? { color: colorTexto((s.colorIcono ?? colorIcono)!) } : {}),
                }}
              >
                {s.icono}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-subtitulo font-semibold text-tinta truncate">{s.titulo}</span>
                {s.etiqueta && (
                  <Tooltip title={s.etiqueta.ayuda}>
                    <Tag className="m-0 shrink-0">{s.etiqueta.texto}</Tag>
                  </Tooltip>
                )}
              </div>
              {s.descripcion && <div className="text-detalle text-tinta-tenue truncate">{s.descripcion}</div>}
            </div>
          </div>
        ),
        extra:
          s.ayuda || s.extra ? (
            <span className="flex items-center gap-3" onClick={sinAlternar}>
              {s.extra}
              {s.ayuda && (
                <Tooltip title={s.ayuda} placement="left">
                  <QuestionCircleOutlined
                    className="text-tinta-tenue"
                    style={{ fontSize: tipografia.escala.subtitulo.tamano, cursor: "help" }}
                    aria-label="Ayuda de la sección"
                  />
                </Tooltip>
              )}
            </span>
          ) : undefined,
        children: <LimiteError claveReinicio={claveReinicio}>{s.contenido}</LimiteError>,
      }))}
    />
  );
};

export default SeccionesColapsables;
