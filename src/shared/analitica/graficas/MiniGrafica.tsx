import { ReactNode, useMemo, useState } from "react";
import TarjetaGrafica from "./TarjetaGrafica";
import type { TarjetaGraficaProps } from "./TarjetaGrafica";

type SerieConEtiqueta = { label?: Record<string, unknown> } & Record<string, unknown>;

/** Enciende o apaga `label` en todas las series; el resto de la etiqueta (formato, posición) se respeta. */
const conEtiquetas = (option: { series?: SerieConEtiqueta[] }, visibles: boolean) => ({
  ...option,
  series: (option.series ?? []).map((s) => ({ ...s, label: { ...s.label, show: visibles } })),
});

export interface MiniGraficaProps {
  /** Nombre del elemento (oficina, destino, calificación…). */
  titulo: ReactNode;
  option: TarjetaGraficaProps["option"];
  /** 200 px por defecto: cabe una fila de mini gráficas sin empujar la vista. */
  alto?: number;
  cargando?: boolean;
  /** La consulta de este elemento falló: el estado vacío dice "No se pudo cargar". */
  error?: boolean;
  /**
   * Sin `etiquetas`, la mini gráfica las enciende y apaga sola (cambia `label.show` de las series).
   * Pasarlo solo si la vista rearma `option` con otro formato o si un botón apaga las de toda la rejilla.
   */
  etiquetas?: { activas: boolean; alternar: () => void };
  etiquetasIniciales?: boolean;
  /**
   * "Ver datos": el botón aparece solo en pantalla completa (la tarjeta se queda con dos). Abrir un
   * único `TablaDatosModal` en la vista con los datos del elemento; se monta encima de la pantalla completa.
   */
  onVerDatos?: () => void;
  onClickPunto?: TarjetaGraficaProps["onClickPunto"];
  /** Botón de estadísticas en pantalla completa. Por defecto sí; `false` si no aplican (ver `TarjetaGrafica`). */
  estadisticas?: boolean;
  /**
   * Opción de la pantalla completa cuando la mini debe mostrar menos (p. ej. solo las series
   * elegidas, y en grande todas). Como función recibe el `option` de la mini. El botón de etiquetas
   * actúa también sobre ella.
   */
  opcionPantallaCompleta?: TarjetaGraficaProps["opcionPantallaCompleta"];
  nombreImagen?: string;
  className?: string;
}

/**
 * Una gráfica pequeña de una serie de gráficas iguales (una por oficina, destino, origen…). Va
 * dentro de `RejillaGraficas`.
 *
 * Es `TarjetaGrafica` compacta con dos botones: etiquetas y pantalla completa, lo que suele pedir
 * una mini gráfica. En pantalla completa aparece la barra entera (estadísticas,
 * etiquetas, ver datos si se pasa `onVerDatos`, imagen). El nombre va en la cabecera de la
 * tarjeta, no flotando sobre el lienzo.
 */
const MiniGrafica = ({
  titulo,
  option,
  alto = 200,
  cargando,
  error = false,
  etiquetas,
  etiquetasIniciales = false,
  onVerDatos,
  onClickPunto,
  estadisticas,
  opcionPantallaCompleta,
  nombreImagen,
  className,
}: MiniGraficaProps) => {
  const [propias, setPropias] = useState(etiquetasIniciales);
  const activas = etiquetas ? etiquetas.activas : propias;
  const opcion = useMemo(
    () => (option && !etiquetas ? conEtiquetas(option, propias) : option),
    [option, etiquetas, propias],
  );
  const opcionCompleta = useMemo(() => {
    if (opcionPantallaCompleta === undefined) return undefined;
    const completa = typeof opcionPantallaCompleta === "function" ? option && opcionPantallaCompleta(option) : opcionPantallaCompleta;
    return completa && !etiquetas ? conEtiquetas(completa, propias) : completa;
  }, [opcionPantallaCompleta, option, etiquetas, propias]);

  return (
    <TarjetaGrafica
      titulo={titulo}
      option={opcion}
      alto={alto}
      cargando={cargando}
      compacta
      barra="mini"
      etiquetas={etiquetas ?? { activas, alternar: () => setPropias((v) => !v) }}
      textoVacio={error ? "No se pudo cargar" : "Sin datos"}
      onVerDatos={onVerDatos}
      onClickPunto={onClickPunto}
      estadisticas={estadisticas}
      opcionPantallaCompleta={opcionCompleta}
      nombreImagen={nombreImagen}
      className={className}
    />
  );
};

export default MiniGrafica;
