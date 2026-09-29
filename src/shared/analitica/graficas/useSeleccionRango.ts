import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as PointerEventReact, KeyboardEvent as KeyboardEventReact } from "react";
import type ReactEChartsModulo from "echarts-for-react";
import { withAlphaCss } from "@/design/coloresDato";
import { color } from "@/design/tokens";

/**
 * Modo periodo (por defecto): el rango elegido se devuelve a la vista (`onCambiar`) para filtros o
 * para compartirlo con otras gráficas. Controlado: la franja la dibujan `desde`/`hasta` (ms). Solo
 * con eje X `time`.
 */
export interface SeleccionPeriodo {
  modo?: "periodo";
  desde: number | null;
  hasta: number | null;
  /** Al terminar un arrastre (franja nueva, movida o extendida) o al mover un asa con el teclado. */
  onCambiar: (desde: number, hasta: number) => void;
}

/**
 * Modo zoom: el rango elegido acota la gráfica (no avisa a la vista). `ejes`: `"x"` (por defecto),
 * `"y"` o `"xy"` (rectángulo). Cualquier eje cartesiano; "Restablecer zoom" vuelve al inicio.
 */
export interface SeleccionZoom {
  modo: "zoom";
  ejes?: EjesZoom;
}

export type EjesZoom = "x" | "y" | "xy";
export type SeleccionRango = SeleccionPeriodo | SeleccionZoom;

type Opcion = Record<string, unknown>;
export type Instancia = ReturnType<ReactEChartsModulo["getEchartsInstance"]>;
type TipoBrush = "lineX" | "lineY" | "rect";

const esZoom = (s: SeleccionRango | undefined): s is SeleccionZoom => s?.modo === "zoom";
const tipoBrush = (s: SeleccionRango): TipoBrush => {
  if (!esZoom(s)) return "lineX";
  return s.ejes === "y" ? "lineY" : s.ejes === "xy" ? "rect" : "lineX";
};

/** `dataZoom` propios del modo zoom: `inside` sin rueda ni arrastre, solo los mueve la selección. */
const ID_ZOOM = { x: "idce-zoom-x", y: "idce-zoom-y" } as const;

/** Primer eje X de la opción (ECharts admite objeto o lista). */
const primerEjeX = (option: Opcion): { type?: string } | undefined => {
  const eje = option.xAxis as { type?: string } | { type?: string }[] | undefined;
  return Array.isArray(eje) ? eje[0] : eje;
};

/**
 * El periodo solo tiene sentido en un eje de tiempo (`desde`/`hasta` van en ms); el zoom, en
 * cualquier gráfica cartesiana.
 */
export const admiteSeleccionRango = (option: Opcion | null, seleccion: SeleccionRango | undefined): boolean => {
  if (!option || !seleccion) return false;
  const eje = primerEjeX(option);
  return esZoom(seleccion) ? !!eje : eje?.type === "time";
};

/**
 * Añade el `brush` (toolbox oculto: con `toolbox: []` ECharts pone sus cuatro botones por
 * defecto) y deja el arrastre a la selección: los `dataZoom` `inside` pierden `moveOnMouseMove` (la
 * rueda sigue haciendo zoom). En modo zoom añade los `dataZoom` de los ejes elegidos.
 */
export const conSeleccionRango = (option: Opcion, seleccion: SeleccionRango): Opcion => {
  const tipo = tipoBrush(seleccion);
  const zoom = option.dataZoom as Opcion | Opcion[] | undefined;
  const propios = Array.isArray(zoom) ? zoom : zoom ? [zoom] : [];
  const sinArrastre = propios.map((z) => (z.type === "inside" ? { ...z, moveOnMouseMove: false } : z));
  const quieto = { type: "inside", zoomOnMouseWheel: false, moveOnMouseMove: false, moveOnMouseWheel: false };
  const deZoom = esZoom(seleccion)
    ? [
        ...(tipo !== "lineY" ? [{ ...quieto, id: ID_ZOOM.x, xAxisIndex: 0 }] : []),
        ...(tipo !== "lineX" ? [{ ...quieto, id: ID_ZOOM.y, yAxisIndex: 0, filterMode: "none" }] : []),
      ]
    : [];
  const dataZoom = [...sinArrastre, ...deZoom];
  return {
    ...option,
    brush: {
      xAxisIndex: 0,
      brushType: tipo,
      brushMode: "single",
      toolbox: [tipo],
      // En periodo la franja se mueve y se extiende arrastrándola; en zoom se aplica al soltar y desaparece.
      transformable: !esZoom(seleccion),
      brushStyle: {
        color: withAlphaCss(color.accion.base, 0.12),
        borderColor: withAlphaCss(color.accion.base, 0.6),
        borderWidth: 1,
      },
      // La franja marca el periodo; las series fuera de ella no se atenúan.
      outOfBrush: { colorAlpha: 1 },
    },
    toolbox: { show: false },
    ...(dataZoom.length && { dataZoom }),
  };
};

/** Toma el cursor del brush y dibuja la franja de `desde`–`hasta` (o ninguna). */
const dibujar = (instancia: Instancia, tipo: TipoBrush, rango: [number, number] | null) => {
  instancia.dispatchAction({
    type: "takeGlobalCursor",
    key: "brush",
    brushOption: { brushType: tipo, brushMode: "single" },
  });
  instancia.dispatchAction({
    type: "brush",
    areas: rango ? [{ brushType: tipo, xAxisIndex: 0, coordRange: rango }] : [],
  });
};

/** Posición en píxeles de la franja y del área de trazado, para las asas. */
export interface GeometriaPeriodo {
  izquierda: number;
  derecha: number;
  arriba: number;
  alto: number;
  /** Cada extremo puede quedar fuera de lo visible (zoom): entonces su asa no se muestra. */
  conIzquierda: boolean;
  conDerecha: boolean;
}

type Rect = { x: number; y: number; width: number; height: number };

/** Área de trazado del primer `grid` (API de modelo: estable en ECharts 5 y 6). */
const areaTrazado = (instancia: Instancia): Rect | null => {
  try {
    const modelo = (instancia as unknown as { getModel(): { getComponent(n: string, i: number): any } }).getModel();
    return modelo.getComponent("grid", 0)?.coordinateSystem?.getRect() ?? null;
  } catch {
    return null;
  }
};

const aPixel = (instancia: Instancia, valor: number) => instancia.convertToPixel({ xAxisIndex: 0 }, valor) as number;
const aValor = (instancia: Instancia, pixel: number) => instancia.convertFromPixel({ xAxisIndex: 0 }, pixel) as number;

const medir = (instancia: Instancia, rango: [number, number]): GeometriaPeriodo | null => {
  const area = areaTrazado(instancia);
  if (!area) return null;
  const [a, b] = [aPixel(instancia, rango[0]), aPixel(instancia, rango[1])];
  const inicio = area.x;
  const fin = area.x + area.width;
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < inicio || a > fin) return null;
  return {
    izquierda: Math.max(a, inicio),
    derecha: Math.min(b, fin),
    arriba: area.y,
    alto: area.height,
    conIzquierda: a >= inicio - 0.5,
    conDerecha: b <= fin + 0.5,
  };
};

const mismaGeometria = (a: GeometriaPeriodo | null, b: GeometriaPeriodo | null) =>
  a === b ||
  (!!a &&
    !!b &&
    Math.abs(a.izquierda - b.izquierda) < 0.5 &&
    Math.abs(a.derecha - b.derecha) < 0.5 &&
    a.arriba === b.arriba &&
    a.alto === b.alto &&
    a.conIzquierda === b.conIzquierda &&
    a.conDerecha === b.conDerecha);

type Asa = "mover" | "inicio" | "fin";

type Evento = { areas?: { coordRange?: number[] | number[][] }[] };

/** Zoom aplicado, en valores de cada eje. Lo guarda la tarjeta: lo comparten tarjeta y pantalla completa. */
export interface VentanaZoom {
  x?: [number, number];
  y?: [number, number];
}

export interface ZoomCompartido {
  ventana: VentanaZoom | null;
  onCambiar: (ventana: VentanaZoom | null) => void;
}

const extremos = (valores: number[]): [number, number] => [Math.min(...valores), Math.max(...valores)];

/**
 * Selección de rango de una instancia de `TarjetaGrafica` (la de la tarjeta o la de pantalla
 * completa: cada una llama al hook). `alListo` va en `onChartReady`: guarda la instancia (se recrea
 * sin que cambie `option`: StrictMode al abrir la pantalla completa) y engancha sus eventos.
 *
 * `notMerge` borra la franja y el cursor en cada `setOption`: se redibujan tras cada cambio de
 * `option`, de `desde`/`hasta` y tras "Restablecer zoom" (`restore`).
 *
 * Periodo: un clic sin arrastre deja 0 áreas y se restaura la franja sin avisar. Mientras se
 * arrastra (franja, asas) la franja es la "viva"; al soltar se avisa con `onCambiar`.
 * Zoom: al soltar, el rango pasa a `zoomCompartido` (la tarjeta lo guarda) y cada instancia lo
 * aplica a sus `dataZoom` propios: así lo elegido en pantalla completa sigue al cerrarla, y al revés.
 * "Restablecer zoom" en cualquiera de las dos lo borra en ambas.
 */
export const useSeleccionRango = (
  seleccion: SeleccionRango | undefined,
  option: unknown,
  zoomCompartido?: ZoomCompartido,
) => {
  const [instancia, setInstancia] = useState<Instancia | null>(null);
  const [geometria, setGeometria] = useState<GeometriaPeriodo | null>(null);
  const ultima = useRef(seleccion);
  // Rango mostrado mientras se arrastra, o el último avisado hasta que la vista lo confirme.
  const vivo = useRef<[number, number] | null>(null);
  const ultimoZoom = useRef(zoomCompartido);
  useLayoutEffect(() => {
    ultima.current = seleccion;
    ultimoZoom.current = zoomCompartido;
  });
  const ventana = zoomCompartido?.ventana ?? null;

  const zoom = esZoom(seleccion);
  const tipo = seleccion ? tipoBrush(seleccion) : null;
  const desde = seleccion && !zoom ? seleccion.desde : null;
  const hasta = seleccion && !zoom ? seleccion.hasta : null;

  // La vista confirmó (o cambió) el rango: deja de valer el "vivo".
  useEffect(() => {
    vivo.current = null;
  }, [desde, hasta]);

  // Eventos de la instancia. Leen la selección vigente por ref: se enganchan una vez por instancia.
  useEffect(() => {
    // Con StrictMode la primera instancia llega ya destruida; la nueva vuelve a pasar por aquí.
    if (!instancia || instancia.isDisposed() || !tipo) return;
    const actual = () => ultima.current;
    const rangoControlado = (): [number, number] | null => {
      const s = actual();
      return s && !esZoom(s) && s.desde != null && s.hasta != null ? [s.desde, s.hasta] : null;
    };
    const remedir = () => {
      const s = actual();
      if (!s || esZoom(s) || instancia.isDisposed()) return setGeometria(null);
      const rango = vivo.current ?? rangoControlado();
      const nueva = rango ? medir(instancia, rango) : null;
      setGeometria((previa) => (mismaGeometria(previa, nueva) ? previa : nueva));
    };
    const alSoltar = (bruto: unknown) => {
      const evento = bruto as Evento;
      const s = actual();
      if (!s) return;
      const area = evento.areas?.[0]?.coordRange;
      if (esZoom(s)) {
        dibujar(instancia, tipo, null);
        if (!area) return;
        const [x, y] = tipo === "rect" ? (area as number[][]) : tipo === "lineY" ? [null, area] : [area, null];
        // Lo del otro eje se conserva: con `ejes: "x"` un zoom previo en Y sigue.
        const previa = ultimoZoom.current?.ventana ?? {};
        ultimoZoom.current?.onCambiar({
          ...previa,
          ...(x && { x: extremos(x as number[]) }),
          ...(y && { y: extremos(y as number[]) }),
        });
        return;
      }
      const rango = area as number[] | undefined;
      if (!rango || rango.length < 2) {
        dibujar(instancia, tipo, vivo.current ?? rangoControlado());
        return;
      }
      const nuevo: [number, number] = [Math.round(Math.min(...rango)), Math.round(Math.max(...rango))];
      vivo.current = nuevo;
      s.onCambiar(nuevo[0], nuevo[1]);
    };
    // Durante el arrastre nativo (mover o extender la franja) las asas la siguen.
    const alArrastrar = (bruto: unknown) => {
      const evento = bruto as Evento;
      const s = actual();
      const rango = evento.areas?.[0]?.coordRange as number[] | undefined;
      if (!s || esZoom(s) || !rango || rango.length < 2) return;
      vivo.current = [Math.min(...rango), Math.max(...rango)];
      remedir();
    };
    // `restore` vuelve a la opción inicial: sin franja ni cursor.
    const alRestaurar = () => {
      if (!instancia.isDisposed()) dibujar(instancia, tipo, zoom ? null : (vivo.current ?? rangoControlado()));
      if (zoom) ultimoZoom.current?.onCambiar(null);
    };
    instancia.on("brushEnd", alSoltar);
    instancia.on("brush", alArrastrar);
    instancia.on("finished", remedir);
    instancia.on("restore", alRestaurar);
    return () => {
      if (instancia.isDisposed()) return;
      instancia.off("brushEnd", alSoltar);
      instancia.off("brush", alArrastrar);
      instancia.off("finished", remedir);
      instancia.off("restore", alRestaurar);
    };
  }, [instancia, tipo, zoom]);

  // Después de enganchar los eventos: el `finished` de este dibujo ya coloca las asas.
  // Redibujo tras cada cambio. `option` va en las dependencias: tras un `setOption` con `notMerge`.
  useEffect(() => {
    if (!instancia || instancia.isDisposed() || !tipo) return;
    const rango: [number, number] | null = !zoom && desde != null && hasta != null ? [desde, hasta] : null;
    dibujar(instancia, tipo, vivo.current ?? rango);
    if (!zoom) return;
    // El zoom compartido (o ninguno) sobre los `dataZoom` propios que tenga esta opción.
    const eje = (id: string, valores: [number, number] | undefined) =>
      valores ? { dataZoomId: id, startValue: valores[0], endValue: valores[1] } : { dataZoomId: id, start: 0, end: 100 };
    instancia.dispatchAction({
      type: "dataZoom",
      batch: [
        ...(tipo !== "lineY" ? [eje(ID_ZOOM.x, ventana?.x)] : []),
        ...(tipo !== "lineX" ? [eje(ID_ZOOM.y, ventana?.y)] : []),
      ],
    });
  }, [instancia, option, tipo, zoom, desde, hasta, ventana]);

  const alListo = (nueva: Instancia) => setInstancia(nueva);

  /**
   * Arrastre de un asa (HTML sobre el lienzo). El rango se calcula en valores del eje, acotado a lo
   * visible; la franja se redibuja en vivo y `onCambiar` avisa al soltar.
   */
  const alPulsarAsa = (asa: Asa) => (evento: PointerEventReact<HTMLElement>) => {
    const s = ultima.current;
    if (!instancia || !s || esZoom(s) || s.desde == null || s.hasta == null) return;
    const area = areaTrazado(instancia);
    if (!area) return;
    evento.preventDefault();
    const elemento = evento.currentTarget;
    elemento.setPointerCapture(evento.pointerId);
    const origen = instancia.getDom().getBoundingClientRect().left;
    const minimo = aValor(instancia, area.x);
    const maximo = aValor(instancia, area.x + area.width);
    const [d0, h0] = vivo.current ?? [s.desde, s.hasta];
    const v0 = aValor(instancia, evento.clientX - origen);
    const mover = (e: PointerEvent) => {
      const delta = aValor(instancia, e.clientX - origen) - v0;
      let nuevo: [number, number];
      if (asa === "mover") {
        const d = Math.min(Math.max(d0 + delta, minimo), maximo - (h0 - d0));
        nuevo = [d, d + (h0 - d0)];
      } else if (asa === "inicio") nuevo = [Math.min(Math.max(d0 + delta, minimo), h0), h0];
      else nuevo = [d0, Math.max(Math.min(h0 + delta, maximo), d0)];
      vivo.current = nuevo;
      dibujar(instancia, "lineX", nuevo);
    };
    const soltar = () => {
      elemento.removeEventListener("pointermove", mover);
      elemento.removeEventListener("pointerup", soltar);
      elemento.removeEventListener("pointercancel", soltar);
      const final = vivo.current;
      if (final && (final[0] !== d0 || final[1] !== h0)) {
        const redondo: [number, number] = [Math.round(final[0]), Math.round(final[1])];
        vivo.current = redondo;
        const vigente = ultima.current;
        if (vigente && !esZoom(vigente)) vigente.onCambiar(redondo[0], redondo[1]);
      }
    };
    elemento.addEventListener("pointermove", mover);
    elemento.addEventListener("pointerup", soltar);
    elemento.addEventListener("pointercancel", soltar);
  };

  /** Flechas sobre un asa: un 2 % de lo visible por pulsación (Mayús: 10 %). */
  const alTeclaAsa = (asa: Asa) => (evento: KeyboardEventReact<HTMLElement>) => {
    const s = ultima.current;
    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
    if (!instancia || !s || esZoom(s) || s.desde == null || s.hasta == null) return;
    const area = areaTrazado(instancia);
    if (!area) return;
    evento.preventDefault();
    const minimo = aValor(instancia, area.x);
    const maximo = aValor(instancia, area.x + area.width);
    const paso = (maximo - minimo) * (evento.shiftKey ? 0.1 : 0.02) * (evento.key === "ArrowLeft" ? -1 : 1);
    const [d, h] = vivo.current ?? [s.desde, s.hasta];
    const nuevo: [number, number] =
      asa === "mover"
        ? [Math.min(Math.max(d + paso, minimo), maximo - (h - d)), 0]
        : asa === "inicio"
          ? [Math.min(Math.max(d + paso, minimo), h), h]
          : [d, Math.max(Math.min(h + paso, maximo), d)];
    if (asa === "mover") nuevo[1] = nuevo[0] + (h - d);
    const redondo: [number, number] = [Math.round(nuevo[0]), Math.round(nuevo[1])];
    vivo.current = redondo;
    dibujar(instancia, "lineX", redondo);
    s.onCambiar(redondo[0], redondo[1]);
  };

  return { alListo, geometria: zoom ? null : geometria, alPulsarAsa, alTeclaAsa };
};
