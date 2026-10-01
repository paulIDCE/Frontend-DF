import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactEChartsModulo from "echarts-for-react";
import { Button, Empty, Spin, Tooltip } from "antd";
import {
  BarChartOutlined,
  CameraOutlined,
  ExpandOutlined,
  FontSizeOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  SwapOutlined,
  TableOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { ExcelBotonBarra } from "@/components/DownloadButtons";
import { interopDefault } from "@/utils/interop";
import ModalFullscreen from "@/shared/modalFullScreen";
import StatsOverlay from "@/components/charts/StatsOverlayChart";
import StatsOverlayTiny from "@/components/charts/StatsOverlayChartTiny";
import { color, tipografia } from "@/design/tokens";
import { admiteSeleccionRango, conSeleccionRango, useSeleccionRango } from "./useSeleccionRango";
import type { EjesZoom, SeleccionRango, VentanaZoom } from "./useSeleccionRango";
import ControlesPeriodo from "./ControlesPeriodo";
import { conEtiquetas, type VentanaEje } from "./opcionesBase";
import { useImpresion } from "../impresion";

// CommonJS: en Node (Vitest) el `default` llega envuelto. Ver `interopDefault`.
const ReactECharts = interopDefault(ReactEChartsModulo);
type ReactECharts = ReactEChartsModulo;

/** Lo que toda gráfica hereda de los tokens: series en orden fijo y fuente del sistema. */
const OPCIONES_TOKENS = {
  color: [...color.datos.series],
  textStyle: { fontFamily: tipografia.familia.sans, color: color.tinta.secundaria },
};

export type TipoSerie = "bar" | "line";

type Manejador = (...args: any[]) => void;

/** Función de identidad fija que siempre llama a la última `fn` recibida. */
const useManejadorEstable = (fn: Manejador | undefined) => {
  const ultima = useRef(fn);
  useLayoutEffect(() => {
    ultima.current = fn;
  });
  return useCallback<Manejador>((...args) => ultima.current?.(...args), []);
};

/**
 * `onEvents` de una instancia. echarts-for-react destruye y recrea la gráfica si cambia la
 * identidad de `onEvents`: el objeto solo cambia cuando aparece o desaparece el manejador. Los
 * eventos de la selección de rango los engancha `useSeleccionRango` sobre la instancia.
 */
const useEventos = (onClick: Manejador | undefined) => {
  const alClic = useManejadorEstable(onClick);
  const hayClick = !!onClick;
  return useMemo(() => (hayClick ? { click: alClic } : undefined), [hayClick, alClic]);
};

/** Lo que la opción necesita saber de la selección: modo y ejes (no `desde`/`hasta`). */
type FormaSeleccion = "periodo" | `zoom-${EjesZoom}` | null;
const formaDe = (s: SeleccionRango | undefined): FormaSeleccion =>
  !s ? null : s.modo === "zoom" ? `zoom-${s.ejes ?? "x"}` : "periodo";
const seleccionDeForma = (forma: FormaSeleccion): SeleccionRango | undefined =>
  !forma
    ? undefined
    : forma === "periodo"
      ? { desde: null, hasta: null, onCambiar: () => {} }
      : { modo: "zoom", ejes: forma.slice(5) as EjesZoom };

/** Lo mínimo que se lee de una opción de ECharts para los botones nuevos. */
type SerieBasica = { type?: string } & Record<string, unknown>;
type OpcionBasica = { series?: SerieBasica[]; dataZoom?: unknown } & Record<string, unknown>;

const esBarraOLinea = (s: SerieBasica): s is SerieBasica & { type: TipoSerie } => s.type === "bar" || s.type === "line";

/** Tipo (barras o líneas) de la primera serie que lo sea: el que la gráfica muestra hoy. */
const tipoDeOpcion = (option: OpcionBasica | null): TipoSerie | null => option?.series?.find(esBarraOLinea)?.type ?? null;

/** Cambia a `tipo` las series de barras o líneas; las demás (dispersión, franjas…) no se tocan. */
const conTipo = (option: OpcionBasica, tipo: TipoSerie): OpcionBasica => ({
  ...option,
  series: (option.series ?? []).map((s) => (esBarraOLinea(s) ? { ...s, type: tipo } : s)),
});

const tieneDataZoom = (option: OpcionBasica | null) =>
  Array.isArray(option?.dataZoom) ? option.dataZoom.length > 0 : !!option?.dataZoom;

type SerieConEtiqueta = SerieBasica & { label?: Record<string, unknown> };

/** ¿La opción trae las etiquetas encendidas? (la primera serie con `label` manda). */
const etiquetasDeOpcion = (option: OpcionBasica | null): boolean =>
  !!((option?.series ?? []) as SerieConEtiqueta[]).find((s) => s.label)?.label?.show;

type ZoomBasico = Record<string, unknown> & { id?: string };
/** `dataZoom` del eje X que maneja la vista (los del modo zoom por selección van aparte). */
const esZoomDeVista = (z: ZoomBasico) => !String(z.id ?? "").startsWith("idce-zoom");
const listaZoom = (option: OpcionBasica): ZoomBasico[] =>
  Array.isArray(option.dataZoom) ? option.dataZoom : option.dataZoom ? [option.dataZoom as ZoomBasico] : [];

/** Pone la ventana (valores del eje X) en los `dataZoom` de la vista; `null` = todo (0–100 %). */
const conVentana = (option: OpcionBasica, ventana: VentanaEje | null): OpcionBasica => {
  if (!tieneDataZoom(option)) return option;
  return {
    ...option,
    dataZoom: listaZoom(option).map((z) => {
      if (!esZoomDeVista(z)) return z;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { start, end, startValue, endValue, ...resto } = z;
      return ventana ? { ...resto, startValue: ventana.desde, endValue: ventana.hasta } : { ...resto, start: 0, end: 100 };
    }),
  };
};

/** Ventana actual de una instancia, en valores del eje X (las categorías por su etiqueta, no su índice). */
const ventanaDeInstancia = (instancia: ReturnType<ReactECharts["getEchartsInstance"]> | undefined): VentanaEje | null => {
  if (!instancia || instancia.isDisposed()) return null;
  const opcion = instancia.getOption() as { dataZoom?: ZoomBasico[]; xAxis?: { type?: string; data?: unknown[] }[] };
  const zoom = opcion.dataZoom?.find(esZoomDeVista);
  if (!zoom || zoom.startValue === undefined || zoom.endValue === undefined) return null;
  const eje = opcion.xAxis?.[0];
  const valor = (v: unknown): string | number => {
    if (eje?.type === "category" && Array.isArray(eje.data) && typeof v === "number") {
      const dato = eje.data[v] as unknown;
      return (dato && typeof dato === "object" && "value" in dato ? (dato as { value: string }).value : dato) as string;
    }
    return v as number;
  };
  return { desde: valor(zoom.startValue), hasta: valor(zoom.endValue) };
};

/** Para papel: sin animacion ni slider (se queda el zoom `inside` con su ventana). */
const paraImpresion = (option: OpcionBasica): OpcionBasica => ({
  ...option,
  animation: false,
  ...(tieneDataZoom(option) && { dataZoom: listaZoom(option).filter((z) => z.type !== "slider") }),
});

const OPTS_IMPRESION = { renderer: "svg" as const };

/**
 * Lo que se pinta a partir de una `option` (la de la tarjeta o la de pantalla completa): tokens,
 * etiquetas, barras ↔ líneas, ventana de zoom y selección de rango. Cada modo decide sus botones con la suya.
 * `ventana`: `undefined` deja el zoom de la opción; `null` muestra todo; un valor lo fija.
 */
const prepararOpcion = (
  option: OpcionBasica | null,
  tipoElegido: TipoSerie | null,
  cambioTipo: boolean,
  forma: FormaSeleccion,
  etiquetasPropias: boolean | null = null,
  ventana?: VentanaEje | null,
) => {
  if (!option) return { opcion: null, tipoOriginal: null, tieneZoom: false };
  // Paleta de series y tipografía del sistema por defecto; cada gráfica puede sobrescribirlas.
  let opcion: OpcionBasica = { ...OPCIONES_TOKENS, ...option };
  if (etiquetasPropias !== null) opcion = conEtiquetas(opcion, etiquetasPropias);
  if (ventana !== undefined) opcion = conVentana(opcion, ventana);
  if (cambioTipo && tipoElegido) opcion = conTipo(opcion, tipoElegido);
  const seleccion = seleccionDeForma(forma);
  if (seleccion) opcion = conSeleccionRango(opcion, seleccion);
  // Con el modo zoom la opción trae sus `dataZoom`: también muestra "Restablecer zoom".
  return { opcion, tipoOriginal: tipoDeOpcion(option), tieneZoom: tieneDataZoom(opcion) };
};


export interface TarjetaGraficaProps {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  /**
   * Nota metodológica (cambios normativos, fórmula, fuente): ícono ⓘ junto al título con el texto
   * en un tooltip. En impresión se escribe bajo el título, porque el tooltip no sale en papel.
   */
  nota?: ReactNode;
  /** Controles propios de la grafica, a la izquierda de la barra de herramientas. */
  extra?: ReactNode;
  option: any | null;
  alto: number;
  cargando?: boolean;
  onClickPunto?: (evento: any) => void;
  /**
   * Botón de estadísticas (mín., máx., media… por serie). Por defecto sí; `false` en las gráficas
   * donde no aplican porque los datos no son una serie de valores: matriz de calor, pie, treemap,
   * sankey, radar…
   */
  estadisticas?: boolean;
  /**
   * Etiquetas de valores. Sin pasarlo, la tarjeta las enciende y apaga sola (cambia `label.show` de
   * las series) y el botón está siempre en pantalla completa (en la tarjeta, salvo `compacta`).
   * Pasarlo solo si la vista rearma `option` con otro formato; `false` quita el botón.
   */
  etiquetas?: { activas: boolean; alternar: () => void } | false;
  /** Estado inicial de las etiquetas automáticas. Por defecto, el que trae `option`. */
  etiquetasIniciales?: boolean;
  /**
   * Ventana del filtro temporal de la vista (valores del eje X). La tarjeta arranca en ella (si su
   * `option` trae `dataZoom`), la pantalla completa muestra todo y "Restablecer zoom" vuelve a ella en
   * las dos. El zoom hecho en pantalla completa se conserva al cerrarla.
   */
  zoomBase?: VentanaEje;
  /** "Ver datos": si se pasa, aparece el boton. */
  onVerDatos?: () => void;
  /**
   * Alternar porcentajes / valores: si se pasa, aparece el botón. Controlado como `etiquetas`:
   * la vista rearma `option` con la serie que corresponda (el cálculo es del dominio).
   */
  porcentajes?: { activos: boolean; alternar: () => void };
  /**
   * Botón barras ↔ líneas. La tarjeta cambia el `type` de las series de barras o líneas (también
   * en pantalla completa); `onCambiarTipo` avisa a la vista si necesita saberlo.
   */
  cambioTipo?: boolean;
  onCambiarTipo?: (tipo: TipoSerie) => void;
  /**
   * Descargar los datos de la gráfica (Excel): si se pasa, aparece el Excel de la barra, atenuado
   * (`type="text"`, icono verde) como el resto de iconos. Usar `exportarExcel` con las mismas
   * columnas que "Ver datos".
   */
  onDescargarDatos?: () => void;
  nombreImagen?: string;
  /** Mini grafica: cabecera y botones mas pequenos, estadisticas en version compacta. */
  compacta?: boolean;
  /**
   * Botones de la tarjeta. `"mini"`: solo etiquetas y pantalla completa (lo que suele pedir una
   * mini gráfica); al abrir la pantalla completa aparece la barra entera (incluido
   * "Ver datos" si se pasa `onVerDatos`). Lo usa `MiniGrafica`.
   */
  barra?: "completa" | "mini";
  /** Texto del estado sin `option`. */
  textoVacio?: ReactNode;
  /** Ancho minimo del lienzo; si no cabe, la grafica hace scroll horizontal (mapa de calor). */
  anchoMinimo?: number;
  /** Contenido bajo la grafica (leyendas de niveles). */
  pie?: ReactNode;
  /**
   * Opción de la pantalla completa, si debe mostrar más que la tarjeta (todas las series, etiquetas
   * más grandes, slider…). Como función recibe el `option` de la tarjeta. Sin ella, la misma `option`.
   * "Restablecer zoom" y barras ↔ líneas se deciden con la opción de cada modo.
   */
  opcionPantallaCompleta?: any | ((option: any) => any);
  /**
   * Selección de un rango arrastrando sobre la gráfica, en dos modos:
   * - **periodo** (`{ desde, hasta, onCambiar }`, sin `modo`): controlado, en ms, solo con
   *   `xAxis.type: "time"`. Devuelve el rango a la vista (filtros, gráficas hermanas). La franja
   *   lleva asas para extender el inicio o el fin y para moverla; también se arrastra directamente.
   * - **zoom** (`{ modo: "zoom", ejes: "x" | "y" | "xy" }`): el rango elegido acota la gráfica.
   *   Cualquier gráfica cartesiana; "Restablecer zoom" vuelve al inicio.
   *
   * La pantalla completa se comporta igual. Con ella, el `dataZoom` `inside` ya no arrastra (la
   * rueda sí hace zoom).
   */
  seleccionRango?: SeleccionRango;
  className?: string;
}

/**
 * Marco comun de las graficas de las vistas analiticas (kit `shared/analitica`).
 *
 * Reemplaza el `toolbox` de ECharts por una barra antd fuera del lienzo: los iconos del toolbox
 * se montaban sobre la leyenda en graficas bajas y no tenian tooltip legible. La barra ofrece lo
 * mismo que la vista original: estadisticas, pantalla completa, etiquetas, ver datos e imagen.
 *
 * Y lo que faltaba para reemplazar los `toolbox` habituales de ECharts: porcentajes / valores
 * (`myPercents`), barras ↔ líneas (`myToggleChartType`, `magicType`), descargar datos
 * (`myExportCSV`, `myDowloadData`) y restablecer zoom (`restore`, automático si hay `dataZoom`).
 * Botones propios de un dominio (p. ej. mora normal / ajustada) van en `extra`.
 */
const TarjetaGrafica = (props: TarjetaGraficaProps) => {
  const {
    titulo,
    subtitulo,
    nota,
    extra,
    option,
    alto,
    cargando = false,
    onClickPunto,
    estadisticas: conEstadisticas = true,
    etiquetas: etiquetasProp,
    etiquetasIniciales,
    zoomBase,
    onVerDatos,
    porcentajes,
    cambioTipo = false,
    onCambiarTipo,
    onDescargarDatos,
    nombreImagen = "grafica",
    compacta = false,
    barra = "completa",
    textoVacio = "Sin datos para el periodo",
    anchoMinimo,
    pie,
    opcionPantallaCompleta,
    seleccionRango,
    className = "",
  } = props;
  const impresion = useImpresion();
  const claseDesborde = anchoMinimo ? "overflow-x-auto" : "overflow-x-hidden";
  const chartRef = useRef<ReactECharts>(null);
  // Tipo elegido con el botón barras ↔ líneas; `null` = el que trae `option`.
  const [tipoElegido, setTipoElegido] = useState<TipoSerie | null>(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const optionCompleta =
    opcionPantallaCompleta === undefined
      ? option
      : typeof opcionPantallaCompleta === "function"
        ? option && opcionPantallaCompleta(option)
        : opcionPantallaCompleta;

  const conRango = admiteSeleccionRango(option, seleccionRango);
  const conRangoCompleta = conRango && admiteSeleccionRango(optionCompleta, seleccionRango);
  const rangoIgnorado = !!seleccionRango && !!option && !conRango;
  const modoIgnorado = seleccionRango?.modo === "zoom" ? "zoom" : "periodo";
  useEffect(() => {
    if (!rangoIgnorado) return;
    console.warn(
      modoIgnorado === "zoom"
        ? "TarjetaGrafica: `seleccionRango` en modo zoom necesita una gráfica cartesiana (`xAxis`); se ignora."
        : 'TarjetaGrafica: `seleccionRango` (periodo) necesita `xAxis.type: "time"`; se ignora.',
    );
  }, [rangoIgnorado, modoIgnorado]);
  const forma = conRango ? formaDe(seleccionRango) : null;
  const formaCompleta = conRangoCompleta ? forma : null;

  // Etiquetas automáticas (sin `etiquetas`): `null` = las que trae la opción.
  const [etiquetasPropias, setEtiquetasPropias] = useState<boolean | null>(etiquetasIniciales ?? null);
  const autoEtiquetas = etiquetasProp === undefined;
  const etiquetas =
    etiquetasProp === false
      ? undefined
      : (etiquetasProp ?? {
          activas: etiquetasPropias ?? etiquetasDeOpcion(option),
          alternar: () => setEtiquetasPropias((v) => !(v ?? etiquetasDeOpcion(option))),
        });
  const propias = autoEtiquetas ? etiquetasPropias : null;

  // Zoom con que se cerró la pantalla completa. Ligado al filtro (`zoomBase`) o, sin él, a la
  // `option`: cambiar el filtro o los datos lo descarta sin necesidad de un efecto.
  const desdeBase = zoomBase?.desde;
  const hastaBase = zoomBase?.hasta;
  const claveZoom = zoomBase ? `${desdeBase}|${hastaBase}` : option;
  const [zoomCerrado, setZoomCerrado] = useState<{ clave: unknown; ventana: VentanaEje } | null>(null);
  const ventanaGuardada = zoomCerrado && zoomCerrado.clave === claveZoom ? zoomCerrado.ventana : null;
  const ventanaTarjeta = useMemo<VentanaEje | undefined>(
    () => ventanaGuardada ?? (desdeBase !== undefined && hastaBase !== undefined ? { desde: desdeBase, hasta: hastaBase } : undefined),
    [ventanaGuardada, desdeBase, hastaBase],
  );
  // La pantalla completa, con filtro, abre mostrando todo.
  const ventanaCompleta = zoomBase ? null : undefined;

  // Memorizadas: cada opción nueva redibuja la selección, y la vista puede volver a renderizar sin
  // que cambie nada (p. ej. al mover las asas).
  const tarjeta = useMemo(() => {
    const preparada = prepararOpcion(option, tipoElegido, cambioTipo, forma, propias, ventanaTarjeta);
    return impresion && preparada.opcion ? { ...preparada, opcion: paraImpresion(preparada.opcion) } : preparada;
  }, [option, tipoElegido, cambioTipo, forma, propias, ventanaTarjeta, impresion]);
  const completa = useMemo(
    () => prepararOpcion(optionCompleta, tipoElegido, cambioTipo, formaCompleta, propias, ventanaCompleta),
    [optionCompleta, tipoElegido, cambioTipo, formaCompleta, propias, ventanaCompleta],
  );
  const modo = (enPantallaCompleta: boolean) => (enPantallaCompleta ? completa : tarjeta);
  // Instancia propia de la pantalla completa: estadisticas e imagen deben actuar sobre la grafica
  // que el usuario tiene delante, no sobre la de la tarjeta que queda detras del modal.
  const chartRefCompleta = useRef<ReactECharts>(null);
  const [series, setSeries] = useState<any[] | null>(null);

  // Zoom por selección de las dos instancias, ligado a la `option` en la que se hizo: con datos
  // nuevos vuelve a empezar sin necesidad de un efecto que lo borre.
  const [zoomGuardado, setZoomGuardado] = useState<{ base: unknown; ventana: VentanaZoom } | null>(null);
  const zoomCompartido = {
    ventana: zoomGuardado && zoomGuardado.base === option ? zoomGuardado.ventana : null,
    onCambiar: (ventana: VentanaZoom | null) => setZoomGuardado(ventana ? { base: option, ventana } : null),
  };
  const rangoTarjeta = useSeleccionRango(conRango ? seleccionRango : undefined, tarjeta.opcion, zoomCompartido);
  const rangoCompleta = useSeleccionRango(
    conRangoCompleta ? seleccionRango : undefined,
    completa.opcion,
    zoomCompartido,
  );
  const eventos = useEventos(onClickPunto);
  // ¿Se movió el zoom en pantalla completa? Entonces, al cerrarla, la tarjeta se queda con él.
  const zoomTocadoCompleta = useRef(false);
  const alZoomCompleta = useCallback(() => {
    zoomTocadoCompleta.current = true;
  }, []);
  const eventosCompleta = useMemo(() => ({ ...eventos, datazoom: alZoomCompleta }), [eventos, alZoomCompleta]);

  const instanciaActiva = () =>
    (pantallaCompleta ? chartRefCompleta : chartRef).current?.getEchartsInstance();

  const verEstadisticas = () => {
    const instancia = instanciaActiva();
    if (instancia) setSeries(instancia.getOption().series as any[]);
  };

  const descargarImagen = () => {
    const instancia = instanciaActiva();
    if (!instancia) return;
    const enlace = document.createElement("a");
    enlace.href = instancia.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: color.superficie.base });
    enlace.download = `${nombreImagen}.png`;
    enlace.click();
  };

  const alternarTipo = (tipoActual: TipoSerie) => {
    const nuevo: TipoSerie = tipoActual === "bar" ? "line" : "bar";
    setSeries(null);
    setTipoElegido(nuevo);
    onCambiarTipo?.(nuevo);
  };

  /**
   * Vuelve al zoom inicial (lo que hacía `restore` del toolbox). Con `zoomBase`, a la ventana del
   * filtro de la vista, también en pantalla completa (que abre mostrando todo).
   */
  const restablecerZoom = () => {
    const instancia = instanciaActiva();
    setZoomCerrado(null);
    if (!zoomBase) return instancia?.dispatchAction({ type: "restore" });
    instancia?.dispatchAction({ type: "dataZoom", startValue: zoomBase.desde, endValue: zoomBase.hasta });
  };

  const abrirPantallaCompleta = () => {
    setSeries(null);
    zoomTocadoCompleta.current = false;
    setPantallaCompleta(true);
  };
  const cerrarPantallaCompleta = () => {
    if (zoomTocadoCompleta.current) {
      const ventana = ventanaDeInstancia(chartRefCompleta.current?.getEchartsInstance());
      if (ventana) setZoomCerrado({ clave: claveZoom, ventana });
    }
    setSeries(null);
    setPantallaCompleta(false);
  };

  /** Barra de opciones. En pantalla completa no ofrece "pantalla completa" (el modal ya cierra). */
  const botones = (enPantallaCompleta: boolean) => {
    if (!option || impresion) return null;
    const todas = enPantallaCompleta || barra === "completa";
    const { tipoOriginal, tieneZoom } = modo(enPantallaCompleta);
    const tipoActual = tipoElegido ?? tipoOriginal;
    return (
      <div className="flex items-center gap-1">
        {todas && conEstadisticas && (
          <Tooltip title="Estadísticas">
            <Button size="small" type="text" icon={<BarChartOutlined />} onClick={verEstadisticas} />
          </Tooltip>
        )}
        {etiquetas && (!autoEtiquetas || enPantallaCompleta || !compacta) && (
          <Tooltip title={etiquetas.activas ? "Ocultar etiquetas" : "Mostrar etiquetas"}>
            <Button
              size="small"
              type={etiquetas.activas ? "link" : "text"}
              icon={<FontSizeOutlined />}
              onClick={etiquetas.alternar}
            />
          </Tooltip>
        )}
        {todas && porcentajes && (
          <Tooltip title={porcentajes.activos ? "Ver valores" : "Ver porcentajes"}>
            <Button
              size="small"
              type={porcentajes.activos ? "link" : "text"}
              icon={<PercentageOutlined />}
              onClick={porcentajes.alternar}
            />
          </Tooltip>
        )}
        {todas && cambioTipo && tipoActual && (
          <Tooltip title={tipoActual === "bar" ? "Ver como líneas" : "Ver como barras"}>
            <Button size="small" type="text" icon={<SwapOutlined />} onClick={() => alternarTipo(tipoActual)} />
          </Tooltip>
        )}
        {todas && onVerDatos && (
          <Tooltip title="Ver datos">
            <Button size="small" type="text" icon={<TableOutlined />} onClick={onVerDatos} />
          </Tooltip>
        )}
        {todas && tieneZoom && (
          <Tooltip title="Restablecer zoom">
            <Button size="small" type="text" icon={<UndoOutlined />} onClick={restablecerZoom} />
          </Tooltip>
        )}
        {todas && (
          <Tooltip title="Descargar imagen">
            <Button size="small" type="text" icon={<CameraOutlined />} onClick={descargarImagen} />
          </Tooltip>
        )}
        {todas && onDescargarDatos && (
          <ExcelBotonBarra size="small" tooltip="Descargar datos (Excel)" onClick={onDescargarDatos} />
        )}
        {!enPantallaCompleta && (
          <Tooltip title="Pantalla completa">
            <Button size="small" type="text" icon={<ExpandOutlined />} onClick={abrirPantallaCompleta} />
          </Tooltip>
        )}
      </div>
    );
  };

  /**
   * Cabecera comun a la tarjeta y a la pantalla completa. Antes el modal solo pintaba la grafica:
   * al mover las opciones del `toolbox` de ECharts (que viaja dentro de la grafica) a esta barra
   * antd, la pantalla completa se quedo sin estadisticas, etiquetas, ver datos, imagen ni `extra`.
   */
  const cabecera = (enPantallaCompleta: boolean) => (
    <div
      className={`flex items-center justify-between gap-2 border-b border-linea-sutil ${
        enPantallaCompleta ? "pb-2 mb-2 pr-12" : compacta ? "px-2 py-1" : "px-3 py-1.5"
      }`}
    >
      <div className="min-w-0">
        <div
          className={`font-semibold text-tinta truncate ${
            enPantallaCompleta ? "text-subtitulo" : compacta ? "text-detalle" : "text-cuerpo"
          }`}
        >
          {titulo}
          {nota && !impresion && (
            <Tooltip title={nota} placement="bottomLeft">
              <InfoCircleOutlined
                aria-label="Nota metodológica"
                className="ml-1.5 cursor-help align-middle text-detalle text-tinta-tenue"
              />
            </Tooltip>
          )}
        </div>
        {subtitulo && (enPantallaCompleta || !compacta) && (
          <div className="text-tinta-tenue truncate text-detalle">{subtitulo}</div>
        )}
        {nota && impresion && <div className="text-tinta-tenue text-detalle">ⓘ {nota}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {extra}
        {botones(enPantallaCompleta)}
      </div>
    </div>
  );

  const estadisticas = (version: "tiny" | "completa") =>
    series &&
    (version === "tiny" ? (
      <StatsOverlayTiny series={series} title="Estadísticas" onClose={() => setSeries(null)} />
    ) : (
      <StatsOverlay series={series} title="Estadísticas" onClose={() => setSeries(null)} />
    ));

  return (
    <div
      className={`bg-superficie border border-linea rounded-tarjeta flex flex-col min-w-0 break-inside-avoid ${className}`}
    >
      {cabecera(false)}

      {/* Contenedor de scroll solo si la gráfica pide `anchoMinimo`: con `overflow-x: auto` fijo,
          Chromium reserva los 8 px de la barra, el lienzo de ECharts conserva el alto con el que se
          midió al montar y esos 8 px tapan la leyenda (`legend.bottom: 0`). */}
      <div className={`relative ${claseDesborde} overflow-y-hidden`} style={{ height: alto }}>
        {cargando ? (
          <div className="h-full flex items-center justify-center">
            <Spin />
          </div>
        ) : option ? (
          <div className="relative h-full" style={{ minWidth: anchoMinimo }}>
            <ReactECharts
              ref={chartRef}
              option={tarjeta.opcion}
              opts={impresion ? OPTS_IMPRESION : undefined}
              notMerge
              onEvents={eventos}
              onChartReady={rangoTarjeta.alListo}
              style={{ height: "100%", width: "100%" }}
            />
            <ControlesPeriodo
              geometria={rangoTarjeta.geometria}
              alPulsar={rangoTarjeta.alPulsarAsa}
              alTecla={rangoTarjeta.alTeclaAsa}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={textoVacio} />
          </div>
        )}
        {!pantallaCompleta && estadisticas(compacta ? "tiny" : "completa")}
      </div>

      {pie && <div className="border-t border-linea-sutil px-3 py-1.5">{pie}</div>}

      {pantallaCompleta && completa.opcion && (
        <ModalFullscreen onClose={cerrarPantallaCompleta}>
          <div className="w-full h-full flex flex-col">
            {cabecera(true)}
            {/* `overflow-y-hidden`: con solo `overflow-x-auto` el eje Y queda en `auto`, y si el
                lienzo se pinta un pixel mas alto aparece un scrollbar vertical que encoge el ancho,
                que a su vez saca el horizontal: los dos se sostenian y la leyenda quedaba cortada.
                El scroll horizontal (mapas de calor con `anchoMinimo`) se conserva. */}
            <div className={`relative flex-1 min-h-0 ${claseDesborde} overflow-y-hidden`}>
              <div className="relative h-full" style={{ minWidth: anchoMinimo }}>
                <ReactECharts
                  ref={chartRefCompleta}
                  option={completa.opcion}
                  notMerge
                  onEvents={eventosCompleta}
                  onChartReady={rangoCompleta.alListo}
                  style={{ height: "100%", width: "100%" }}
                />
                <ControlesPeriodo
                  geometria={rangoCompleta.geometria}
                  alPulsar={rangoCompleta.alPulsarAsa}
                  alTecla={rangoCompleta.alTeclaAsa}
                />
              </div>
              {estadisticas("completa")}
            </div>
            {pie && <div className="border-t border-linea-sutil pt-2 mt-2">{pie}</div>}
          </div>
        </ModalFullscreen>
      )}
    </div>
  );
};

export default TarjetaGrafica;
