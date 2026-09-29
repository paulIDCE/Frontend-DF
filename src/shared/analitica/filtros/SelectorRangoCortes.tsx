import { Select } from "antd";
import type { OpcionCorte } from "./tipos";

/**
 * Par Desde / Hasta sobre el catalogo de fechas de corte.
 *
 * Las opciones imposibles se deshabilitan en origen: "Desde" no ofrece cortes posteriores a
 * "Hasta" ni "Hasta" anteriores a "Desde". Nunca hay bloqueo, porque Hasta siempre puede ir mas
 * tarde y Desde mas temprano. Si aun asi el rango es invalido, `conError` marca ambos en rojo.
 */
const SelectorRangoCortes = ({
  opciones,
  desde,
  hasta,
  onCambiarDesde,
  onCambiarHasta,
  cargando = false,
  conError = false,
  ancho = 160,
}: {
  opciones: OpcionCorte[];
  desde: number | null | undefined;
  hasta: number | null | undefined;
  onCambiarDesde: (fechaCorteID: number) => void;
  onCambiarHasta: (fechaCorteID: number) => void;
  cargando?: boolean;
  conError?: boolean;
  ancho?: number;
}) => {
  const comunes = {
    showSearch: true,
    optionFilterProp: "label" as const,
    loading: cargando,
    status: conError ? ("error" as const) : undefined,
    placeholder: "Seleccione",
    notFoundContent: "Sin cortes",
    style: { width: ancho },
  };
  return (
    <>
      <Select<number>
        {...comunes}
        prefix={<span className="text-tinta-tenue text-detalle">Desde</span>}
        value={desde || undefined}
        options={opciones.map((o) => ({ ...o, disabled: !!hasta && o.value > hasta }))}
        onChange={onCambiarDesde}
      />
      <Select<number>
        {...comunes}
        prefix={<span className="text-tinta-tenue text-detalle">Hasta</span>}
        value={hasta || undefined}
        options={opciones.map((o) => ({ ...o, disabled: !!desde && o.value < desde }))}
        onChange={onCambiarHasta}
      />
    </>
  );
};

export default SelectorRangoCortes;
