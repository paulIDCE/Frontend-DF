import { Select } from "antd";
import type { OpcionFiltro } from "./tipos";

/**
 * Un filtro de catalogo (oficina, asesor, destino…) dentro del popover de filtros opcionales:
 * rotulo arriba, busqueda y "limpiar". El valor es `{ id, nombre }` para que la vista mande el ID a
 * los endpoints de datos y el nombre a los que filtran por nombre.
 *
 * Mapea el catalogo con sus campos REALES: ya hubo un filtro que nunca filtro por apuntar a un
 * campo inexistente (`origenID` en vez de `estadoOperacionID`).
 */
const FiltroCatalogo = ({
  etiqueta,
  placeholder = "Todos",
  valor,
  opciones,
  cargando,
  onChange,
}: {
  etiqueta: string;
  placeholder?: string;
  valor: OpcionFiltro | null;
  opciones: OpcionFiltro[];
  cargando: boolean;
  onChange: (valor: OpcionFiltro | null) => void;
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-rotulo font-semibold text-tinta-secundaria">{etiqueta}</span>
    <Select<number>
      showSearch
      allowClear
      placeholder={placeholder}
      loading={cargando}
      optionFilterProp="label"
      value={valor?.id ?? null}
      options={opciones.map((o) => ({ value: o.id, label: o.nombre }))}
      onChange={(id) => onChange(opciones.find((o) => o.id === id) ?? null)}
      className="w-full"
      popupMatchSelectWidth={false}
    />
  </label>
);

export default FiltroCatalogo;
