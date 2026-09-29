import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { CrudTable, IdentityCell, AtributosCell, StatusTag, EllipsisCell, wrapColumnTitle } from "@idce/kit";
import GuiaUso from "./GuiaUso";

type FilaCorta = {
  id: string;
  codigo: string;
  perdida: string;
  frecuencia: string;
  impacto: string;
  estado: "A" | "I";
};

type FilaDensa = {
  id: string;
  nombre: string;
  codigo: string;
  telefonos: string;
  direccion: string;
  estado: "A" | "I";
};

type FilaChips = {
  id: string;
  nombre: string;
  aplicacion: string;
  periodicidad: string;
  responsabilidad: string;
  documentacion: string;
};

const CORTAS: FilaCorta[] = [
  {
    id: "1",
    codigo: "NT-01",
    perdida: "Menor",
    frecuencia: "Rara",
    impacto: "1.000 – 5.000",
    estado: "A",
  },
  {
    id: "2",
    codigo: "NT-02",
    perdida: "Moderada",
    frecuencia: "Posible",
    impacto: "5.001 – 20.000",
    estado: "A",
  },
];

const DENSAS: FilaDensa[] = [
  {
    id: "1",
    nombre: "Seguros del Pacífico",
    codigo: "ASE-04",
    telefonos: "02 244 1100 · 099 120 3344",
    direccion: "Av. Amazonas N34-120 y Pereira",
    estado: "A",
  },
  {
    id: "2",
    nombre: "Cuenta de ahorros digital",
    codigo: "PRD-18",
    telefonos: "1800 555 010",
    direccion: "Canal digital",
    estado: "I",
  },
];

const CHIPS: FilaChips[] = [
  {
    id: "1",
    nombre: "Conciliación diaria de tesorería",
    aplicacion: "Automático",
    periodicidad: "Diaria",
    responsabilidad: "1.ª línea",
    documentacion: "Procedimiento",
  },
  {
    id: "2",
    nombre: "Revisión de límites operativos",
    aplicacion: "Manual",
    periodicidad: "Mensual",
    responsabilidad: "2.ª línea",
    documentacion: "Política",
  },
];

const CrudColumnasDemo = () => {
  const colsCortas = useMemo<ColumnsType<FilaCorta>>(
    () => [
      { title: wrapColumnTitle("Código"), dataIndex: "codigo", width: 100 },
      { title: wrapColumnTitle("Pérdida / Nivel"), dataIndex: "perdida", width: 140 },
      { title: wrapColumnTitle("Nombre frecuencia"), dataIndex: "frecuencia", width: 150 },
      {
        title: wrapColumnTitle("Rango impacto"),
        dataIndex: "impacto",
        render: (v: string) => <EllipsisCell value={v} />,
      },
      {
        title: "Estado",
        dataIndex: "estado",
        width: 110,
        render: (e: FilaCorta["estado"]) => <StatusTag activo={e === "A"} />,
      },
    ],
    [],
  );

  const colsDensas = useMemo<ColumnsType<FilaDensa>>(
    () => [
      {
        title: "Identidad",
        key: "identidad",
        render: (_, row) => (
          <IdentityCell
            titulo={row.nombre}
            meta={[
              { etiqueta: "Código", valor: row.codigo },
              { etiqueta: "Teléfonos", valor: row.telefonos },
              { etiqueta: "Dirección", valor: row.direccion },
            ]}
          />
        ),
      },
      {
        title: "Estado",
        dataIndex: "estado",
        width: 110,
        render: (e: FilaDensa["estado"]) => <StatusTag activo={e === "A"} />,
      },
    ],
    [],
  );

  const colsChips = useMemo<ColumnsType<FilaChips>>(
    () => [
      { title: "Control", dataIndex: "nombre" },
      {
        title: wrapColumnTitle("Atributos"),
        key: "atributos",
        width: 340,
        render: (_, row) => (
          <AtributosCell
            items={[
              { categoria: "Aplicación", valor: row.aplicacion, color: "blue" },
              { categoria: "Periodicidad", valor: row.periodicidad, color: "cyan" },
              { categoria: "Responsabilidad", valor: row.responsabilidad, color: "geekblue" },
              { categoria: "Documentación", valor: row.documentacion, color: "gold" },
            ]}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h4 className="m-0 text-cuerpo font-semibold text-tinta">Columnas propias</h4>
        <CrudTable
          columns={colsCortas}
          dataSource={CORTAS}
          rowKey="id"
          scrollX={720}
          pagination={false}
          totalLabel="niveles"
        />
        <GuiaUso
          pieza={<code>CrudTable</code>}
          usar={[
            "La grilla cabe cómoda (~≤6–7 columnas útiles + acciones).",
            "QA o el legado piden una cabecera por campo (código, rangos, estado).",
          ]}
          evitar={[
            "Meter código o rangos en meta de identidad solo por compactar.",
            "IdentityCell en mesas cortas: se pierde el sort/filtro por columna.",
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="m-0 text-cuerpo font-semibold text-tinta">Identidad + metaInfo</h4>
        <CrudTable
          columns={colsDensas}
          dataSource={DENSAS}
          rowKey="id"
          scrollX={640}
          pagination={false}
        />
        <GuiaUso
          pieza={<code>IdentityCell</code>}
          usar={[
            "Más de ~6–7 columnas: código, teléfonos o dirección apoyan el nombre.",
            "Cada fragmento lleva etiqueta (`Código: 02`), nunca el valor suelto.",
          ]}
          evitar={[
            "Meta sin etiqueta (`T141721` suelto).",
            "Meter en meta un dato que se filtra u ordena como columna principal.",
            "Mezclar el mismo dato en meta y en chips.",
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="m-0 text-cuerpo font-semibold text-tinta">Columna de atributos</h4>
        <CrudTable
          columns={colsChips}
          dataSource={CHIPS}
          rowKey="id"
          scrollX={720}
          pagination={false}
        />
        <GuiaUso
          pieza={<code>AtributosCell</code>}
          usar={[
            "3 o más catálogos cortos por fila (aplicación, periodicidad, …).",
            "Abrir una columna por cada uno empeora el scrollX.",
          ]}
          evitar={[
            "1–2 atributos: mejor columnas propias.",
            "Un atributo que es el criterio principal de sort o filtro visible.",
          ]}
        />
      </section>
    </div>
  );
};

export default CrudColumnasDemo;
