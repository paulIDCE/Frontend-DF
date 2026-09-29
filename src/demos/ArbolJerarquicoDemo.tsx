import { useMemo, useState, type Key } from "react";
import { ConfigProvider, Tree } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DataNode } from "antd/es/tree";
import { BarraExpandirArbol, ChipNivel, clavesDeArbol, CrudTable } from "@idce/kit";
import GuiaUso from "./GuiaUso";

type NodoDemo = {
  key: string;
  nombre: string;
  etiqueta: string;
  nivel: number;
  esHoja?: boolean;
  responsable?: string;
  children?: NodoDemo[];
};

const ARBOL: NodoDemo[] = [
  {
    key: "tipo",
    nombre: "Procesos de negocio",
    etiqueta: "Tipo",
    nivel: 0,
    responsable: "Gerencia",
    children: [
      {
        key: "macro",
        nombre: "Tesorería",
        etiqueta: "Macro",
        nivel: 1,
        responsable: "Tesorería",
        children: [
          {
            key: "proc",
            nombre: "Conciliación de cuentas",
            etiqueta: "Proceso",
            nivel: 2,
            responsable: "Operaciones",
            children: [
              {
                key: "hoja",
                nombre: "Cuadre diario de caja",
                etiqueta: "Actividad",
                nivel: 4,
                esHoja: true,
                responsable: "Cajero",
              },
            ],
          },
        ],
      },
    ],
  },
];

const aTree = (nodos: NodoDemo[], compacto: boolean): DataNode[] =>
  nodos.map((n) => ({
    key: n.key,
    title: (
      <ChipNivel etiqueta={n.etiqueta} nivel={n.nivel} esHoja={n.esHoja} compacto={compacto}>
        {n.nombre}
      </ChipNivel>
    ),
    children: n.children ? aTree(n.children, compacto) : undefined,
  }));

const ArbolJerarquicoDemo = () => {
  const keys = useMemo(() => clavesDeArbol(ARBOL), []);
  const [expandidas, setExpandidas] = useState<Key[]>(keys);
  const [expandidasSidebar, setExpandidasSidebar] = useState<Key[]>(keys);

  const columnas = useMemo<ColumnsType<NodoDemo>>(
    () => [
      {
        title: "Nodo",
        key: "nodo",
        render: (_, n) => (
          <ChipNivel etiqueta={n.etiqueta} nivel={n.nivel} esHoja={n.esHoja}>
            {n.nombre}
          </ChipNivel>
        ),
      },
      { title: "Responsable", dataIndex: "responsable", width: 160 },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h4 className="m-0 text-cuerpo font-semibold text-tinta">Árbol ancho (panel o grilla)</h4>
        <BarraExpandirArbol
          onExpandir={() => setExpandidas(keys)}
          onContraer={() => setExpandidas([])}
        />
        <ConfigProvider theme={{ components: { Tree: { indentSize: 16 } } }}>
          <Tree
            treeData={aTree(ARBOL, false)}
            expandedKeys={expandidas}
            onExpand={(next) => setExpandidas(next)}
            blockNode
            showLine
          />
        </ConfigProvider>
        <GuiaUso
          pieza={<code>ChipNivel</code>}
          usar={[
            "El árbol es la grilla o hay sitio para ver el nivel de un vistazo.",
            "Chip = nivel de estructura (Tipo, Macro, Proceso), no el estado.",
          ]}
          evitar={[
            "Nombre suelto sin chip; solo carets fila a fila.",
            "Árbol lazy + arrastrar o editor de ubicación: se quedan en el módulo.",
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="m-0 text-cuerpo font-semibold text-tinta">Árbol compacto (sidebar)</h4>
        <div className="max-w-xs rounded-tarjeta border border-linea bg-superficie p-3">
          <BarraExpandirArbol
            onExpandir={() => setExpandidasSidebar(keys)}
            onContraer={() => setExpandidasSidebar([])}
          />
          <ConfigProvider theme={{ components: { Tree: { indentSize: 16 } } }}>
            <Tree
              className="text-rotulo"
              treeData={aTree(ARBOL, true)}
              expandedKeys={expandidasSidebar}
              onExpand={(next) => setExpandidasSidebar(next)}
              blockNode
              switcherIcon={({ expanded }) => <span>{expanded ? "−" : "+"}</span>}
            />
          </ConfigProvider>
        </div>
        <GuiaUso
          pieza={<code>ChipNivel compacto</code>}
          usar={[
            "Filtro en columna estrecha: nombres largos, poco ancho.",
            "Misma paleta; switcher +/−; wrap, no truncate.",
          ]}
          evitar={["Usarlo en una tabla ancha: ahí va el chip de tamaño normal."]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="m-0 text-cuerpo font-semibold text-tinta">CrudTable tree</h4>
        <CrudTable
          columns={columnas}
          dataSource={ARBOL}
          rowKey="key"
          tree
          indentSize={16}
          size="small"
          scrollX={560}
          emptyText="Sin nodos"
        />
        <GuiaUso
          pieza={<code>CrudTable tree</code>}
          usar={["La jerarquía vive en una grilla con más columnas."]}
          evitar={[
            "Combinar tree y expandable: tree gana y el detalle anidado se ignora.",
          ]}
        />
      </section>
    </div>
  );
};

export default ArbolJerarquicoDemo;
