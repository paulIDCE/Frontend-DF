import { useState } from "react";
import { Button, Drawer, Empty, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ProfileOutlined } from "@ant-design/icons";
import {
  BloqueDetalle,
  Dato,
  FichaDatos,
  CeldaNivel,
  fmtEntero,
  fmtMoneda,
  fmtPct,
  nivelDe,
} from "@idce/kit";
import { MOCK_NIVELES, MOCK_OFICINAS } from "@/mocks/analitica";
import type { OficinaMock } from "@/mocks/analitica";
import GuiaUso from "./GuiaUso";

/**
 * `BloqueDetalle` + `Dato` + `FichaDatos`: los paneles de detalle que se abren desde una fila de
 * una tabla o un punto de una gráfica.
 */

const OFICINA = MOCK_OFICINAS[1];
const OTRAS = MOCK_OFICINAS.slice(2, 6);

const columnasOtras: ColumnsType<OficinaMock> = [
  { title: "Oficina", dataIndex: "nombre", key: "nombre" },
  { title: "Saldo", key: "saldo", align: "right", render: (_, o) => <span className="tabular-nums">{fmtMoneda(o.saldo)}</span> },
  { title: "Mora", key: "mora", align: "right", render: (_, o) => <CeldaNivel valor={o.mora} niveles={MOCK_NIVELES} /> },
];

const Resumen = ({ oficina }: { oficina: OficinaMock }) => {
  const nivel = nivelDe(oficina.mora, MOCK_NIVELES);
  return (
    <BloqueDetalle
      titulo="Resumen"
      extra={
        <>
          <span className="text-cifra font-bold tabular-nums text-tinta">{fmtPct(oficina.mora)}</span>
          <Tag style={{ marginInlineEnd: 0, color: nivel?.color, borderColor: nivel?.color }}>{nivel?.nombre}</Tag>
        </>
      }
      subtitulo="Cifras del último corte. La variación compara contra el mismo mes del año anterior."
    >
      <FichaDatos columnas={4}>
        <Dato etiqueta="Saldo">
          <span className="tabular-nums">{fmtMoneda(oficina.saldo)}</span>
        </Dato>
        <Dato etiqueta="Operaciones">
          <span className="tabular-nums">{fmtEntero(oficina.operaciones)}</span>
        </Dato>
        <Dato etiqueta="Cobertura">
          <span className="tabular-nums">{fmtPct(oficina.cobertura)}</span>
        </Dato>
        <Dato etiqueta="Variación anual">
          <span className={`tabular-nums ${oficina.variacionAnual > 0 ? "font-medium text-error" : ""}`}>
            {fmtPct(oficina.variacionAnual * 100, 1)}
          </span>
        </Dato>
      </FichaDatos>
    </BloqueDetalle>
  );
};

const Comparables = ({ filas }: { filas: OficinaMock[] }) => (
  <BloqueDetalle titulo="Oficinas comparables" extra={<Tag className="m-0">{filas.length}</Tag>}>
    {filas.length === 0 ? (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin oficinas comparables" />
    ) : (
      <Table<OficinaMock>
        size="small"
        rowKey={(o) => String(o.oficinaID)}
        columns={columnasOtras}
        dataSource={filas}
        pagination={false}
        scroll={{ x: "max-content" }}
      />
    )}
  </BloqueDetalle>
);

const BloqueDetalleDemo = () => {
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="primary" icon={<ProfileOutlined />} onClick={() => setDrawer(true)}>
          Detalle en drawer
        </Button>
        <Button icon={<ProfileOutlined />} onClick={() => setModal(true)}>
          Detalle en modal
        </Button>
        <span className="text-detalle text-tinta-tenue">
          Los mismos bloques sirven en drawer (desde una fila) y en modal (desde una gráfica).
        </span>
      </div>

      {/* Fuera del panel, para verlo sin abrir nada. */}
      <div className="rounded-tarjeta border border-linea bg-superficie p-3">
        <Resumen oficina={OFICINA} />
      </div>

      <GuiaUso
        usar={[
          "Paneles de detalle que se abren desde una fila o un punto: varios bloques con título, chips a la derecha y aclaración debajo.",
          <>
            Pares etiqueta / valor con formato propio (moneda, <code>tabular-nums</code>, color de alerta) con <code>Dato</code>.
          </>,
          <>
            Ficha de cabecera de un bloque: <code>FichaDatos</code> (2 a 5 columnas, fondo hundido).
          </>,
        ]}
        evitar={[
          <>
            <code>Descriptions</code> de antd: no se usa en el ecosistema; deja el valor sin control de formato y no acepta chips por bloque.
          </>,
          "Repetir el <h2> y el grid a mano en cada panel.",
          "Usarlo como layout de una vista completa: es para el panel de detalle, no para la página.",
        ]}
        pieza={<code>@idce/kit</code>}
      />

      {/* El ancho va en `size`: en antd 6 `width` está deprecado. */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        size={640}
        title={`Oficina ${OFICINA.nombre}`}
        styles={{ body: { display: "flex", flexDirection: "column", gap: 24 } }}
      >
        <Resumen oficina={OFICINA} />
        <Comparables filas={OTRAS} />
      </Drawer>

      <Modal open={modal} onCancel={() => setModal(false)} footer={null} width={720} title={`Oficina ${OFICINA.nombre}`}>
        <div className="flex flex-col gap-6">
          <Resumen oficina={OFICINA} />
          <Comparables filas={[]} />
        </div>
      </Modal>
    </div>
  );
};

export default BloqueDetalleDemo;
