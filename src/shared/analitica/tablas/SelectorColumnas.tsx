import { useMemo, useState } from "react";
import { Button, Checkbox, Popover, Tooltip } from "antd";
import { SettingOutlined } from "@ant-design/icons";

export interface ColumnaElegible {
  key: string;
  titulo: string;
}

/**
 * Columnas visibles de una tabla antd. Sustituye al `ColumnChooser` de DevExtreme: las tablas
 * definen todas sus columnas y aqui se decide cuales se pintan.
 */
export const useColumnasVisibles = (todas: ColumnaElegible[], ocultasIniciales: string[] = []) => {
  const [ocultas, setOcultas] = useState<string[]>(ocultasIniciales);
  const visibles = useMemo(
    () => todas.map((c) => c.key).filter((key) => !ocultas.includes(key)),
    [todas, ocultas],
  );
  const setVisibles = (keys: string[]) =>
    setOcultas(todas.map((c) => c.key).filter((key) => !keys.includes(key)));
  const esVisible = (key: string) => !ocultas.includes(key);
  return { visibles, setVisibles, esVisible };
};

const SelectorColumnas = ({
  columnas,
  visibles,
  onChange,
}: {
  columnas: ColumnaElegible[];
  visibles: string[];
  onChange: (keys: string[]) => void;
}) => (
  <Popover
    trigger="click"
    placement="bottomRight"
    title={<span className="text-detalle">Columnas visibles</span>}
    content={
      <Checkbox.Group
        className="flex flex-col gap-1 max-h-72 overflow-auto pr-2"
        value={visibles}
        onChange={(keys) => onChange(keys as string[])}
        options={columnas.map((c) => ({ label: <span className="text-detalle">{c.titulo}</span>, value: c.key }))}
      />
    }
  >
    <Tooltip title="Elegir columnas">
      <Button size="small" icon={<SettingOutlined />} />
    </Tooltip>
  </Popover>
);

export default SelectorColumnas;
