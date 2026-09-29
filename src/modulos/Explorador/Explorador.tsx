import { useMemo, useState, type ReactNode } from "react";
import { Button, Drawer, Dropdown, Modal, Select, Spin, Tree } from "antd";
import type { TreeDataNode } from "antd";
import { DownloadOutlined, FileExcelOutlined, FileTextOutlined, InfoCircleOutlined, MenuOutlined } from "@ant-design/icons";
import { EstadoError, TarjetaGrafica, showToast, type ErrorPresentable } from "@idce/kit";
import type { CuadroCargado, ItemCarrito, NodoCuadro, SerieColeccion } from "./tipos";
import { etiquetaPeriodo, rangoPorDefecto, unionPeriodos } from "./datos";
import { opcionSeries } from "./graficas";
import { descargarCsv, descargarExcel } from "./descargas";
import { useCarrito } from "./useCarrito";
import TablaCuadro from "./TablaCuadro";
import PanelColeccion from "./PanelColeccion";
import CarritoModal from "./CarritoModal";

/**
 * Explorador de cuadros compartido por Macro, Sistema Financiero y Tasas
 * (layout de prueba-data: arbol "Contenidos" + tabla + "Mi Colección").
 *
 * Es presentacional respecto a los datos: cada pantalla decide como cargar el
 * cuadro (y aporta sus `controles`: sector, entidad, analisis...). Aqui vive
 * el estado de la vista: periodo, coleccion, carrito y modales.
 */

const MAX_SERIES = 10;

interface Props {
  arbol: NodoCuadro[];
  nodoActivo?: string;
  onElegir: (nodo: NodoCuadro) => void;
  cuadro: CuadroCargado | null;
  cargando: boolean;
  error?: ErrorPresentable | null;
  onReintentar?: () => void;
  /** Controles propios de la pantalla (junto al periodo). */
  controles?: ReactNode;
}

const aArbolAntd = (nodos: NodoCuadro[]): TreeDataNode[] =>
  nodos.map((n) => ({
    key: n.key,
    title: n.titulo,
    isLeaf: !n.hijos,
    selectable: !n.hijos,
    children: n.hijos ? aArbolAntd(n.hijos) : undefined,
  }));

const buscarNodo = (nodos: NodoCuadro[], key: string): NodoCuadro | undefined => {
  for (const n of nodos) {
    if (n.key === key) return n;
    const h = n.hijos && buscarNodo(n.hijos, key);
    if (h) return h;
  }
  return undefined;
};

/** Claves de los ancestros de `key` (para abrir el arbol en el cuadro activo). */
const ancestros = (key?: string): string[] => {
  if (!key) return [];
  const partes = key.split("-");
  return partes.slice(2).map((_, i) => partes.slice(0, i + 2).join("-"));
};

const Explorador = ({ arbol, nodoActivo, onElegir, cuadro, cargando, error, onReintentar, controles }: Props) => {
  const [arbolAbierto, setArbolAbierto] = useState(false);
  const [expandidos, setExpandidos] = useState<React.Key[]>(() => ancestros(nodoActivo));
  const [coleccion, setColeccion] = useState<SerieColeccion[]>([]);
  const [serieModal, setSerieModal] = useState<SerieColeccion | null>(null);
  const [etiquetasModal, setEtiquetasModal] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const carrito = useCarrito();

  const datosArbol = useMemo(() => aArbolAntd(arbol), [arbol]);

  // --- Periodo Desde / Hasta ---
  const periodos = useMemo(() => (cuadro ? unionPeriodos(cuadro.filas) : []), [cuadro]);
  // El rango elegido vale para un juego de periodos; si cambia el cuadro, vuelve al por defecto.
  const [eleccion, setEleccion] = useState<{ base: string[]; rango: [string, string] } | null>(null);
  const rango: [string, string] =
    eleccion && eleccion.base === periodos ? eleccion.rango : rangoPorDefecto(periodos);
  const setRango = (fn: (r: [string, string]) => [string, string]) =>
    setEleccion({ base: periodos, rango: fn(rango) });
  const visibles = useMemo(
    () => periodos.filter((p) => p >= rango[0] && p <= rango[1]),
    [periodos, rango]
  );
  const opcionesPeriodo = periodos.map((p) => ({ value: p, label: etiquetaPeriodo(p) }));

  // Como en el original, cambiar de cuadro vacia la coleccion (el carrito persiste).
  const cuadroId = cuadro?.id;
  const [cuadroColeccion, setCuadroColeccion] = useState(cuadroId);
  if (cuadroColeccion !== cuadroId) {
    setCuadroColeccion(cuadroId);
    setColeccion([]);
  }

  const prefijo = cuadro ? `${cuadro.id}_${cuadro.sector ?? ""}_` : "";
  const seleccionados = useMemo(
    () =>
      new Set(
        coleccion.filter((s) => s.id.startsWith(prefijo)).map((s) => Number(s.id.slice(prefijo.length)))
      ),
    [coleccion, prefijo]
  );

  const serieDeFila = (indice: number): SerieColeccion | null => {
    const fila = cuadro?.filas[indice];
    if (!cuadro || !fila) return null;
    return {
      id: `${prefijo}${indice}`,
      variable: String(fila.Variable ?? ""),
      fila,
      cuadroId: cuadro.id,
      unidad: cuadro.unidad,
      sectorNombre: cuadro.sectorNombre,
      derecha: false,
      tipo: "line",
    };
  };

  const agregarSerie = (serie: SerieColeccion): boolean => {
    if (coleccion.some((s) => s.id === serie.id)) return false;
    if (coleccion.length >= MAX_SERIES) {
      showToast.warning("Máximo 10 series en el panel. Elimina alguna para agregar otra.");
      return false;
    }
    setColeccion((c) => [...c, serie]);
    return true;
  };

  const onSeleccionar = (indice: number, marcado: boolean) => {
    const serie = serieDeFila(indice);
    if (!serie) return;
    if (marcado) agregarSerie(serie);
    else setColeccion((c) => c.filter((s) => s.id !== serie.id));
  };

  const onCarrito = (indice: number) => {
    const fila = cuadro?.filas[indice];
    if (!cuadro || !fila) return;
    const item: ItemCarrito = {
      index: indice,
      variable: String(fila.Variable ?? ""),
      cuadroId: cuadro.id,
      cuadroNombre: cuadro.titulo || cuadro.id,
      sector: cuadro.sector,
      sectorNombre: cuadro.sectorNombre,
      data: fila,
    };
    if (carrito.agregar(item)) showToast.success(`"${item.variable}" añadida al carrito.`);
    else showToast.warning(`La serie "${item.variable}" ya se encuentra en el carrito.`);
  };

  const idDeItem = (item: ItemCarrito) => `${item.cuadroId}_${item.sector ?? ""}_${item.index}`;

  const alPanelDesdeCarrito = (item: ItemCarrito) => {
    const ok = agregarSerie({
      id: idDeItem(item),
      variable: item.variable,
      fila: item.data,
      cuadroId: item.cuadroId,
      cuadroNombre: item.cuadroNombre,
      unidad: item.data.Unidad,
      sectorNombre: item.sectorNombre,
      derecha: false,
      tipo: "line",
    });
    if (ok) showToast.success(`"${item.variable}" añadida al panel de gráficos.`);
  };

  const opcionModal = useMemo(
    () => (serieModal ? opcionSeries([serieModal], { etiquetas: etiquetasModal, visibles: Number.MAX_SAFE_INTEGER }) : null),
    [serieModal, etiquetasModal]
  );

  const elegir = (key: React.Key) => {
    const nodo = buscarNodo(arbol, String(key));
    if (nodo?.cuadro) {
      onElegir(nodo);
      setArbolAbierto(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main className="flex min-w-0 flex-col gap-3 rounded-contenedor bg-superficie p-4 shadow-tarjeta">
        <div className="flex items-start gap-3">
          <Button icon={<MenuOutlined />} onClick={() => setArbolAbierto(true)}>
            Contenidos
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-titulo font-bold text-identidad">{cuadro?.titulo || " "}</h2>
            {cuadro?.unidad && <p className="m-0 text-detalle text-tinta-tenue">{cuadro.unidad}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-y border-linea py-2">
          {controles}
          <label className="flex items-center gap-2 text-detalle text-tinta-secundaria">
            Período: Desde
            <Select
              size="small"
              className="w-32"
              value={rango[0] || undefined}
              options={opcionesPeriodo}
              disabled={!periodos.length}
              onChange={(v: string) => setRango(([, h]) => [v, v > h ? v : h])}
              showSearch
            />
          </label>
          <label className="flex items-center gap-2 text-detalle text-tinta-secundaria">
            Hasta
            <Select
              size="small"
              className="w-32"
              value={rango[1] || undefined}
              options={opcionesPeriodo}
              disabled={!periodos.length}
              onChange={(v: string) => setRango(([d]) => [v < d ? v : d, v])}
              showSearch
            />
          </label>
          <Dropdown
            disabled={!cuadro?.filas.length}
            menu={{
              items: [
                { key: "xlsx", icon: <FileExcelOutlined />, label: "Excel (.xlsx)" },
                { key: "csv", icon: <FileTextOutlined />, label: "CSV (.csv)" },
              ],
              onClick: ({ key }) => cuadro && (key === "xlsx" ? descargarExcel(cuadro) : descargarCsv(cuadro)),
            }}
          >
            <Button size="small" className="ml-auto" icon={<DownloadOutlined />}>
              Descargar tabla
            </Button>
          </Dropdown>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3">
            <EstadoError error={error} />
            {onReintentar && <Button onClick={onReintentar}>Reintentar</Button>}
          </div>
        ) : cargando ? (
          <div className="flex justify-center py-16">
            <Spin size="large" tip="Cargando datos..." />
          </div>
        ) : !cuadro || cuadro.filas.length === 0 ? (
          <div className="py-16 text-center text-tinta-tenue">
            No se encontraron datos{cuadro ? ` para: ${cuadro.id}` : ""}
          </div>
        ) : (
          <TablaCuadro
            filas={cuadro.filas}
            periodos={visibles}
            seleccionados={seleccionados}
            onSeleccionar={onSeleccionar}
            onGraficar={(i) => setSerieModal(serieDeFila(i))}
            onCarrito={onCarrito}
          />
        )}

        {cuadro && cuadro.notas.length > 0 && (
          <section className="rounded-tarjeta border border-linea bg-superficie-sutil p-3">
            <h4 className="m-0 mb-2 flex items-center gap-2 text-cuerpo font-bold text-identidad">
              <InfoCircleOutlined /> Notas del Cuadro
            </h4>
            {cuadro.notas.map((n, i) => (
              <p key={i} className="m-0 mb-1 text-detalle text-tinta-secundaria">
                {n}
              </p>
            ))}
          </section>
        )}
      </main>

      <PanelColeccion
        series={coleccion}
        totalCarrito={carrito.items.length}
        onAbrirCarrito={() => setCarritoAbierto(true)}
        onCambiar={(id, cambios) => setColeccion((c) => c.map((s) => (s.id === id ? { ...s, ...cambios } : s)))}
        onGraficar={setSerieModal}
        onQuitar={(id) => setColeccion((c) => c.filter((s) => s.id !== id))}
      />

      <Drawer
        title="Contenidos"
        placement="left"
        width={420}
        open={arbolAbierto}
        onClose={() => setArbolAbierto(false)}
      >
        <Tree
          treeData={datosArbol}
          showLine
          blockNode
          selectedKeys={nodoActivo ? [nodoActivo] : []}
          expandedKeys={expandidos}
          onExpand={setExpandidos}
          onSelect={(keys, info) => {
            if (info.node.isLeaf) elegir(info.node.key);
            else
              setExpandidos((e) =>
                e.includes(info.node.key) ? e.filter((k) => k !== info.node.key) : [...e, info.node.key]
              );
            void keys;
          }}
        />
      </Drawer>

      <Modal
        open={!!serieModal}
        onCancel={() => setSerieModal(null)}
        footer={null}
        width={960}
        title={serieModal?.variable}
        destroyOnHidden
      >
        <TarjetaGrafica
          titulo={serieModal?.variable ?? ""}
          subtitulo={serieModal?.unidad}
          option={opcionModal}
          alto={420}
          cambioTipo
          etiquetas={{ activas: etiquetasModal, alternar: () => setEtiquetasModal((v) => !v) }}
          nombreImagen="grafico_individual"
        />
      </Modal>

      <CarritoModal
        abierto={carritoAbierto}
        items={carrito.items}
        enPanel={(item) => coleccion.some((s) => s.id === idDeItem(item))}
        onCerrar={() => setCarritoAbierto(false)}
        onAlPanel={alPanelDesdeCarrito}
        onQuitar={carrito.quitar}
        onVaciar={carrito.vaciar}
      />
    </div>
  );
};

export default Explorador;
