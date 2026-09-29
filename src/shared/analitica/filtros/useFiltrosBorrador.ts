import { useCallback, useMemo, useState } from "react";
import type { OpcionesFiltro, ResultadoValidacion } from "./tipos";
import { mismosFiltros } from "./validacion";

interface ConOpcionales<O extends OpcionesFiltro> {
  opcionales: O;
}

interface OpcionesUseFiltrosBorrador<B extends ConOpcionales<O>, A extends ConOpcionales<O>, O extends OpcionesFiltro> {
  /** Borrador inicial (lo que ve la barra antes de tocar nada). */
  inicial: B;
  /** Opcionales vacios: los que quedan al "Limpiar" o al quitar todos los aplicados. */
  opcionalesVacios: O;
  /** Reglas de la vista. Se recalcula con cada cambio del borrador. */
  validar: (borrador: B) => ResultadoValidacion;
  /**
   * Convierte un borrador valido en filtros aplicados (p. ej. `diasMora: number | null` →
   * `number`). Por defecto se copia tal cual.
   */
  aAplicado?: (borrador: B) => A;
}

/**
 * Estandar de filtros de las vistas analiticas: **borrador** (lo que el usuario edita) frente a
 * **aplicado** (lo ultimo consultado, `null` hasta el primer Filtrar).
 *
 * La vista ejecuta sus consultas en un `useEffect([aplicado])` con argumentos explicitos. Este
 * hook solo gobierna el estado: validacion, aplicar, cambios sin aplicar, descartar y los chips de
 * filtros opcionales.
 */
const useFiltrosBorrador = <B extends ConOpcionales<O>, A extends ConOpcionales<O>, O extends OpcionesFiltro>({
  inicial,
  opcionalesVacios,
  validar,
  aAplicado = (borrador) => borrador as unknown as A,
}: OpcionesUseFiltrosBorrador<B, A, O>) => {
  const [borrador, setBorrador] = useState<B>(inicial);
  const [aplicado, setAplicado] = useState<A | null>(null);

  const actualizarBorrador = useCallback(
    (cambios: Partial<B>) => setBorrador((previo) => ({ ...previo, ...cambios })),
    [],
  );
  const actualizarOpcionales = useCallback(
    (cambios: Partial<O>) =>
      setBorrador((previo) => ({ ...previo, opcionales: { ...previo.opcionales, ...cambios } })),
    [],
  );
  const limpiarOpcionales = useCallback(
    () => setBorrador((previo) => ({ ...previo, opcionales: opcionalesVacios })),
    [opcionalesVacios],
  );

  const validacion = useMemo(() => validar(borrador), [validar, borrador]);

  const aplicar = useCallback(() => {
    if (!validacion.valido) return;
    const nuevo = aAplicado(borrador);
    setAplicado({ ...nuevo, opcionales: { ...nuevo.opcionales } });
    // aAplicado suele ser una funcion en linea; depender de ella recrearia `aplicar` en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrador, validacion.valido]);

  /** Vuelve el borrador a lo ultimo consultado. */
  const descartarCambios = useCallback(() => {
    if (aplicado) setBorrador((previo) => ({ ...previo, ...aplicado, opcionales: { ...aplicado.opcionales } }));
  }, [aplicado]);

  const hayCambiosSinAplicar =
    !!aplicado &&
    !mismosFiltros(aplicado as unknown as Record<string, unknown>, borrador as unknown as Record<string, unknown>);

  /** Quita un filtro opcional ya aplicado (el chip cerrable) y vuelve a consultar sin el. */
  const quitarOpcionalAplicado = useCallback((clave: keyof O) => {
    setBorrador((previo) => ({ ...previo, opcionales: { ...previo.opcionales, [clave]: null } }));
    setAplicado((previo) => (previo ? { ...previo, opcionales: { ...previo.opcionales, [clave]: null } } : previo));
  }, []);

  /** Quita todos los filtros opcionales aplicados y vuelve a consultar. */
  const quitarOpcionalesAplicados = useCallback(() => {
    setBorrador((previo) => ({ ...previo, opcionales: opcionalesVacios }));
    setAplicado((previo) => (previo ? { ...previo, opcionales: opcionalesVacios } : previo));
  }, [opcionalesVacios]);

  const hayOpcionalesAplicados = !!aplicado && Object.values(aplicado.opcionales).some((valor) => valor !== null);

  return {
    borrador,
    setBorrador,
    actualizarBorrador,
    actualizarOpcionales,
    limpiarOpcionales,
    validacion,
    aplicar,
    aplicado,
    descartarCambios,
    hayCambiosSinAplicar,
    quitarOpcionalAplicado,
    quitarOpcionalesAplicados,
    hayOpcionalesAplicados,
  };
};

export default useFiltrosBorrador;
