import { ReactNode } from "react";
import { Table, Tag } from "antd";
import Texto from "./Texto";

export interface PropApi {
  nombre: string;
  descripcion: ReactNode;
  tipo: string;
  porDefecto?: string;
  obligatoria?: boolean;
  /** Versión de `@idce/kit` en la que apareció (solo las recientes). */
  desde?: string;
}

const Codigo = ({ children }: { children: ReactNode }) => (
  <code className="rounded-marca bg-superficie-sutil px-1 py-0.5 text-detalle text-tinta break-words">
    {children}
  </code>
);

/** Tabla de props de una pieza, como la sección "API" de antd. */
const TablaApi = ({
  props,
  titulo,
}: {
  props: PropApi[];
  titulo?: ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    {titulo && (
      <div className="text-cuerpo font-semibold text-tinta">{titulo}</div>
    )}
    <Table<PropApi>
      size="small"
      rowKey="nombre"
      pagination={false}
      dataSource={props}
      // Ancho mínimo, no `max-content`: la descripción se parte en líneas en vez de estirar la tabla.
      scroll={{ x: 720 }}
      columns={[
        {
          title: "Propiedad",
          key: "nombre",
          width: 190,
          render: (_, p) => (
            <span className="flex items-center gap-1 flex-wrap">
              <Codigo>{p.nombre}</Codigo>
              {p.obligatoria && (
                <span className="text-error text-detalle">*</span>
              )}
              {p.desde && (
                <Tag color="blue" className="!m-0 !text-rotulo">
                  {p.desde}
                </Tag>
              )}
            </span>
          ),
        },
        {
          title: "Descripción",
          key: "descripcion",
          render: (_, p) => (
            <span className="text-detalle">
              <Texto>{p.descripcion}</Texto>
            </span>
          ),
        },
        {
          title: "Tipo",
          key: "tipo",
          width: 240,
          render: (_, p) => <Codigo>{p.tipo}</Codigo>,
        },
        {
          title: "Por defecto",
          key: "porDefecto",
          width: 110,
          render: (_, p) =>
            p.porDefecto ? (
              <Codigo>{p.porDefecto}</Codigo>
            ) : (
              <span className="text-tinta-tenue">—</span>
            ),
        },
      ]}
    />
    <div className="text-rotulo text-tinta-tenue">
      <span className="text-error">*</span> obligatoria ·{" "}
      <Tag color="blue" className="!m-0 !text-rotulo">
        0.x
      </Tag>{" "}
      versión de <code>@idce/kit</code> en la que apareció
    </div>
  </div>
);

export default TablaApi;
