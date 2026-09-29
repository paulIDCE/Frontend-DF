import type { ReactNode } from "react";
import { Button, Space } from "antd";

interface BarraExpandirArbolProps {
  onExpandir: () => void;
  onContraer: () => void;
  extra?: ReactNode;
}

/** Expandir / Contraer todo. No depender solo del caret fila a fila. */
const BarraExpandirArbol = ({
  onExpandir,
  onContraer,
  extra,
}: BarraExpandirArbolProps) => (
  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
    <Space size="small">
      <Button size="small" onClick={onExpandir}>
        Expandir todo
      </Button>
      <Button size="small" onClick={onContraer}>
        Contraer todo
      </Button>
    </Space>
    {extra}
  </div>
);

export default BarraExpandirArbol;
