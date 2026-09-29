import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExcelButton } from "@/components/DownloadButtons";
import { useStackedOverlayProps } from "@/hooks/useStackedModalZIndex";

/**
 * "Ver datos" de una grafica: la tabla de lo que se esta pintando y su descarga.
 *
 * REGLA: "Ver datos" siempre ofrece descargar en Excel. Por eso `onDescargar` es obligatorio (con
 * `exportarExcel` y las mismas columnas de la tabla); el botón se deshabilita si no hay filas.
 */
const TablaDatosModal = <T extends object>({
  abierto,
  titulo,
  columnas,
  filas,
  rowKey,
  onDescargar,
  onClose,
}: {
  abierto: boolean;
  titulo: string;
  columnas: ColumnsType<T>;
  filas: T[];
  rowKey: (fila: T, indice?: number) => string;
  onDescargar: () => void;
  onClose: () => void;
}) => {
  // Se abre desde la barra de la tarjeta, tambien en pantalla completa: se apila sobre lo visible.
  const apilado = useStackedOverlayProps(abierto);
  return (
    <Modal
      {...apilado}
      open={abierto}
      onCancel={onClose}
      footer={null}
      width="80vw"
      centered
      destroyOnHidden
      title={
        <div className="flex items-center justify-between pr-8">
          <span className="text-cuerpo">{titulo}</span>
          <ExcelButton size="small" onClick={onDescargar} disabled={!filas.length}>
            Descargar Excel
          </ExcelButton>
        </div>
      }
    >
      <Table<T>
        size="small"
        rowKey={rowKey}
        columns={columnas}
        dataSource={filas}
        pagination={false}
        scroll={{ x: "max-content", y: 380 }}
      />
    </Modal>
  );
};

export default TablaDatosModal;
