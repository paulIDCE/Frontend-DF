import { Button, Modal, Tooltip } from "antd";
import { CheckOutlined, DeleteOutlined, InboxOutlined, PlusCircleOutlined, TableOutlined } from "@ant-design/icons";
import { swalConfirm } from "@idce/kit";
import type { ItemCarrito } from "./tipos";

/** Modal "Carrito" — porte de `renderizarCarrito` / `vaciarCarrito`. */

interface Props {
  abierto: boolean;
  items: ItemCarrito[];
  enPanel: (item: ItemCarrito) => boolean;
  onCerrar: () => void;
  onAlPanel: (item: ItemCarrito) => void;
  onQuitar: (posicion: number) => void;
  onVaciar: () => void;
}

const CarritoModal = ({ abierto, items, enPanel, onCerrar, onAlPanel, onQuitar, onVaciar }: Props) => {
  const vaciar = async () => {
    if (items.length === 0) return;
    const r = await swalConfirm(
      "¿Vaciar el carrito?",
      "Se eliminarán todas las series guardadas."
    );
    if (r) onVaciar();
  };

  return (
    <Modal
      open={abierto}
      onCancel={onCerrar}
      title="Carrito de series"
      width={640}
      footer={[
        <Button key="vaciar" danger icon={<DeleteOutlined />} onClick={vaciar} disabled={items.length === 0}>
          Vaciar carrito
        </Button>,
        <Button key="cerrar" type="primary" onClick={onCerrar}>
          Cerrar
        </Button>,
      ]}
    >
      {items.length === 0 ? (
        <div className="py-8 text-center text-tinta-tenue">
          <InboxOutlined className="text-display" />
          <p className="mb-0">Tu carrito está vacío</p>
          <p className="text-detalle">Haz clic en el icono del carrito en la tabla para añadir series.</p>
        </div>
      ) : (
        <ul className="m-0 flex max-h-[60vh] list-none flex-col gap-2 overflow-auto p-0">
          {items.map((item, i) => {
            const ya = enPanel(item);
            return (
              <li
                key={`${item.cuadroId}-${item.sector ?? ""}-${item.index}`}
                className="flex items-center gap-3 rounded-tarjeta border border-linea p-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-tinta" title={item.variable}>
                    {item.variable}
                  </div>
                  <div className="text-detalle text-tinta-tenue">
                    <TableOutlined /> {item.cuadroNombre}
                    {item.sectorNombre ? ` · ${item.sectorNombre}` : ""}
                  </div>
                </div>
                <Tooltip title={ya ? "Ya está en el panel" : "Añadir al panel de gráficos"}>
                  <Button
                    type="text"
                    disabled={ya}
                    icon={ya ? <CheckOutlined /> : <PlusCircleOutlined />}
                    onClick={() => onAlPanel(item)}
                  />
                </Tooltip>
                <Tooltip title="Eliminar del carrito">
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onQuitar(i)} />
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
};

export default CarritoModal;
