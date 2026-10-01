import { useState } from "react";
import { Alert, Button, Checkbox, Modal, Tag, Tooltip } from "antd";
import { DeleteOutlined, InboxOutlined, StarFilled } from "@ant-design/icons";
import { swalConfirm } from "@idce/kit";
import type { ItemFavorito } from "./tipos";
import { idFavorito } from "./useFavoritos";
import UbicacionSerie from "./UbicacionSerie";

/**
 * Favoritos (antes "Carrito" de prueba-data): series guardadas en este navegador, de cualquier
 * cuadro. Se eligen varias y se añaden juntas al grafico comparativo; si con ellas se pasa del
 * maximo, el modal avisa por cuantas y sigue abierto.
 */

interface Props {
  abierto: boolean;
  items: ItemFavorito[];
  /** Ids de las series que ya estan en el panel. */
  enPanel: Set<string>;
  maximo: number;
  onCerrar: () => void;
  onAlPanel: (items: ItemFavorito[]) => void;
  onQuitar: (item: ItemFavorito) => void;
  onVaciar: () => void;
}

const FavoritosModal = ({ abierto, items, enPanel, maximo, onCerrar, onAlPanel, onQuitar, onVaciar }: Props) => {
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [exceso, setExceso] = useState(0);

  const disponibles = items.filter((i) => !enPanel.has(idFavorito(i)));
  const elegidos = disponibles.filter((i) => marcados.has(idFavorito(i)));
  const libres = maximo - enPanel.size;

  const cambiarMarcados = (nuevos: Set<string>) => {
    setMarcados(nuevos);
    setExceso(0);
  };
  const marcar = (item: ItemFavorito, si: boolean) => {
    const nuevos = new Set(marcados);
    if (si) nuevos.add(idFavorito(item));
    else nuevos.delete(idFavorito(item));
    cambiarMarcados(nuevos);
  };

  const llevar = () => {
    if (elegidos.length > libres) {
      setExceso(elegidos.length - libres);
      return;
    }
    onAlPanel(elegidos);
    cambiarMarcados(new Set());
    onCerrar();
  };

  const vaciar = async () => {
    if (items.length === 0) return;
    const r = await swalConfirm("¿Vaciar favoritos?", "Se eliminarán todas las series guardadas.");
    if (r) {
      onVaciar();
      cambiarMarcados(new Set());
    }
  };

  const cerrar = () => {
    setExceso(0);
    onCerrar();
  };

  return (
    <Modal
      open={abierto}
      onCancel={cerrar}
      title={
        <span className="flex items-center gap-2">
          <StarFilled className="text-advertencia" /> Mis series favoritas
        </span>
      }
      width={680}
      footer={[
        <Button key="vaciar" danger icon={<DeleteOutlined />} onClick={vaciar} disabled={items.length === 0}>
          Vaciar favoritos
        </Button>,
        <Button key="cerrar" onClick={cerrar}>
          Cerrar
        </Button>,
        <Button key="panel" type="primary" onClick={llevar} disabled={elegidos.length === 0}>
          Añadir al gráfico ({elegidos.length})
        </Button>,
      ]}
    >
      {items.length === 0 ? (
        <div className="py-8 text-center text-tinta-tenue">
          <InboxOutlined className="text-display" />
          <p className="mb-0">Aún no tienes series favoritas</p>
          <p className="text-detalle">Pulsa la estrella de una fila de la tabla para guardarla aquí.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {exceso > 0 && (
            <Alert
              type="error"
              showIcon
              title={`Te pasas del máximo de ${maximo} series del gráfico por ${exceso} ${exceso === 1 ? "serie" : "series"}.`}
              description={`El gráfico ya tiene ${enPanel.size} y caben ${Math.max(libres, 0)} más. Desmarca ${exceso} o quita series del gráfico.`}
            />
          )}
          <p className="m-0 text-detalle text-tinta-tenue">
            Marca las que quieras ver juntas y pulsa <strong>Añadir al gráfico</strong>. Se guardan en este navegador.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-detalle text-tinta-secundaria">
            <Button
              size="small"
              onClick={() => cambiarMarcados(new Set(disponibles.map(idFavorito)))}
              disabled={disponibles.length === 0 || elegidos.length === disponibles.length}
            >
              Seleccionar todo
            </Button>
            <Button size="small" onClick={() => cambiarMarcados(new Set())} disabled={elegidos.length === 0}>
              Deseleccionar todo
            </Button>
            <span className="ml-auto">
              {elegidos.length} marcadas · gráfico {enPanel.size}/{maximo}
            </span>
          </div>
          <ul className="m-0 flex max-h-[55vh] list-none flex-col gap-2 overflow-auto p-0">
            {items.map((item) => {
              const id = idFavorito(item);
              const ya = enPanel.has(id);
              return (
                <li key={id} className="flex items-start gap-3 rounded-tarjeta border border-linea p-2">
                  <Checkbox
                    checked={ya || marcados.has(id)}
                    disabled={ya}
                    onChange={(e) => marcar(item, e.target.checked)}
                    className="mt-0.5"
                  />
                  <UbicacionSerie
                    variable={item.variable}
                    ruta={item.ruta}
                    grupo={item.data.Grupo}
                    cuadroNombre={item.cuadroNombre}
                    sectorNombre={item.sectorNombre}
                    contenidos={item.contenidos}
                  />
                  {ya && <Tag color="blue">Ya en el gráfico</Tag>}
                  <Tooltip title="Quitar de favoritos">
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onQuitar(item)} />
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Modal>
  );
};

export default FavoritosModal;
