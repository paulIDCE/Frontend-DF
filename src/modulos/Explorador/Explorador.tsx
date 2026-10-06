import { useMemo, useState, type ReactNode } from "react";
import { Button, Drawer, Modal, Select, Skeleton, Spin, Tabs, Tooltip, Tree } from "antd";
import type { TreeDataNode } from "antd";
import { FileTextOutlined, InfoCircleOutlined, MenuOutlined } from "@ant-design/icons";
import { BarraExpandirArbol, EstadoError, TarjetaGrafica, showToast, type ErrorPresentable } from "@idce/kit";
import type { CuadroCargado, ItemFavorito, NodoCuadro, SerieColeccion } from "./tipos";
import { etiquetaPeriodo, nivelFila, rangoPorDefecto, unionPeriodos } from "./datos";
import { opcionSeries, ventanaSeries } from "./graficas";
import { descargarCsv, nombreDescarga } from "./descargas";
import { idFavorito, useFavoritos } from "./useFavoritos";
import TablaCuadro from "./TablaCuadro";
import TablaBalances from "./TablaBalances";
import PanelColeccion from "./PanelColeccion";
import FavoritosModal from "./FavoritosModal";

/**
 * Explorador de cuadros compartido por Macro, Sistema Financiero y Tasas
 * (layout de prueba-data: arbol "Contenidos" + tabla + grafico comparativo).
 *
 * Es presentacional respecto a los datos: cada pantalla decide como cargar el
 * cuadro (y aporta sus `controles`: sector, entidad, analisis...). Aqui vive
 * el estado de la vista: periodo, coleccion, favoritos y modales.
 *
 * "Contenidos": cada raiz del arbol es una pestaña; dentro, el arbol desde el
 * nivel 1 con expandir / contraer todo.
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

/** Titulos de las ramas de "Contenidos" que llevan a `key` (sin el propio nodo). */
const rutaContenidos = (nodos: NodoCuadro[], key: string, camino: string[] = []): string[] | null => {
  for (const n of nodos) {
    if (n.key === key) return camino;
    const r = n.hijos && rutaContenidos(n.hijos, key, [...camino, n.titulo]);
    if (r) return r;
  }
  return null;
};

const normal = (t: unknown) => String(t ?? "").replace(/\s+/g, " ").trim().toLowerCase();

/**
 * Cuentas ancestro de la fila `indice`: hacia atras, la ultima de cada nivel menor dentro del
 * mismo grupo (vale para cuadros por grupos y para balances por codigo). Si el grupo no es ya la
 * primera cuenta, encabeza la ruta.
 */
const rutaDeFila = (filas: CuadroCargado["filas"], indice: number): string[] => {
  const fila = filas[indice];
  const grupo = fila.Grupo ?? "";
  let nivel = nivelFila(fila);
  const ruta: string[] = [];
  for (let i = indice - 1; i >= 0 && nivel > 0; i--) {
    const f = filas[i];
    if ((f.Grupo ?? "") !== grupo) break;
    const n = nivelFila(f);
    if (n < nivel) {
      ruta.unshift(String(f.Variable ?? ""));
      nivel = n;
    }
  }
  if (grupo && normal(grupo) !== normal(ruta[0] ?? fila.Variable)) ruta.unshift(grupo);
  return ruta;
};

/** Claves de los nodos con hijos (para "Expandir todo"). */
const clavesRama = (nodos: NodoCuadro[]): string[] =>
  nodos.flatMap((n) => (n.hijos ? [n.key, ...clavesRama(n.hijos)] : []));

/** Raiz (pestaña) a la que pertenece `key`: `n-1-0-2` -> `n-1`. */
const raizDe = (key?: string) => (key ? key.split("-").slice(0, 2).join("-") : undefined);

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
  const [favoritosAbierto, setFavoritosAbierto] = useState(false);
  const favoritos = useFavoritos();

  const [pestana, setPestana] = useState(() => raizDe(nodoActivo) ?? arbol[0]?.key);
  const raizActiva = arbol.find((r) => r.key === pestana) ?? arbol[0];
  const datosArbol = useMemo(() => aArbolAntd(raizActiva?.hijos ?? []), [raizActiva]);
  const ramasPestana = useMemo(() => clavesRama(raizActiva?.hijos ?? []), [raizActiva]);
  const tituloNodo = (nodoActivo && buscarNodo(arbol, nodoActivo)?.titulo) || "";

  // --- Periodo Desde / Hasta ---
  const periodos = useMemo(() => (cuadro ? unionPeriodos(cuadro.filas) : []), [cuadro]);
  // El rango elegido vale para un juego de periodos; si cambia el cuadro, vuelve al por defecto.
  const [eleccion, setEleccion] = useState<{ base: string[]; rango: [string, string] } | null>(null);
  const rango: [string, string] =
    eleccion && eleccion.base === periodos ? eleccion.rango : rangoPorDefecto(periodos);
  const setRango = (fn: (r: [string, string]) => [string, string]) =>
    setEleccion({ base: periodos, rango: fn(rango) });
  const [desde, hasta] = rango;
  const rangoMemo = useMemo<[string, string]>(() => [desde, hasta], [desde, hasta]);
  const visibles = useMemo(() => periodos.filter((p) => p >= desde && p <= hasta), [periodos, desde, hasta]);
  const opcionesPeriodo = periodos.map((p) => ({ value: p, label: etiquetaPeriodo(p) }));

  // A diferencia del original, el grafico comparativo se conserva al cambiar de cuadro o de
  // filtros: se pueden comparar series de cuadros distintos (cada una lleva su origen).
  const prefijo = cuadro ? `${cuadro.id}_${cuadro.sector ?? ""}_` : "";
  const seleccionados = useMemo(
    () =>
      new Set(
        coleccion.filter((s) => s.id.startsWith(prefijo)).map((s) => Number(s.id.slice(prefijo.length)))
      ),
    [coleccion, prefijo]
  );

  /** Donde vive la fila: cuentas ancestro y ramas de "Contenidos". */
  const ubicacionDeFila = (indice: number) =>
    cuadro
      ? {
          ruta: rutaDeFila(cuadro.filas, indice),
          contenidos: (nodoActivo && rutaContenidos(arbol, nodoActivo)) || undefined,
        }
      : {};

  const serieDeFila = (indice: number): SerieColeccion | null => {
    const fila = cuadro?.filas[indice];
    if (!cuadro || !fila) return null;
    return {
      ...ubicacionDeFila(indice),
      id: `${prefijo}${indice}`,
      variable: String(fila.Variable ?? ""),
      fila,
      cuadroId: cuadro.id,
      cuadroNombre: cuadro.titulo || cuadro.id,
      unidad: cuadro.unidad,
      sectorNombre: cuadro.sectorNombre,
      derecha: false,
      tipo: "line",
    };
  };

  // Los checkbox se deshabilitan al llegar al maximo: aqui no hace falta avisar.
  const lleno = coleccion.length >= MAX_SERIES;

  const onSeleccionar = (indice: number, marcado: boolean) => {
    const serie = serieDeFila(indice);
    if (!serie) return;
    if (marcado) setColeccion((c) => (c.length >= MAX_SERIES || c.some((s) => s.id === serie.id) ? c : [...c, serie]));
    else setColeccion((c) => c.filter((s) => s.id !== serie.id));
  };

  /** Quita del panel las series del cuadro actual. */
  const deseleccionarTodo = () => setColeccion((c) => c.filter((s) => !s.id.startsWith(prefijo)));

  /** Una sola serie en el eje derecho: la nueva reemplaza a la anterior. */
  const cambiarSerie = (id: string, cambios: Partial<Pick<SerieColeccion, "derecha" | "tipo">>) => {
    if (cambios.derecha) {
      const anterior = coleccion.find((s) => s.derecha && s.id !== id);
      const nueva = coleccion.find((s) => s.id === id);
      if (anterior && nueva)
        showToast.info(`«${nueva.variable}» pasa al eje derecho; «${anterior.variable}» vuelve al eje izquierdo.`);
      setColeccion((c) => c.map((s) => (s.id === id ? { ...s, ...cambios } : { ...s, derecha: false })));
      return;
    }
    setColeccion((c) => c.map((s) => (s.id === id ? { ...s, ...cambios } : s)));
  };

  const itemDeFila = (indice: number): ItemFavorito | null => {
    const fila = cuadro?.filas[indice];
    if (!cuadro || !fila) return null;
    return {
      ...ubicacionDeFila(indice),
      index: indice,
      variable: String(fila.Variable ?? ""),
      cuadroId: cuadro.id,
      cuadroNombre: cuadro.titulo || cuadro.id,
      sector: cuadro.sector,
      sectorNombre: cuadro.sectorNombre,
      data: fila,
    };
  };

  const esFavorito = (indice: number) => {
    const item = itemDeFila(indice);
    return !!item && favoritos.es(item);
  };

  const onFavorito = (indice: number) => {
    const item = itemDeFila(indice);
    if (!item) return;
    if (favoritos.alternar(item)) showToast.success(`"${item.variable}" guardada en favoritos.`);
    else showToast.info(`"${item.variable}" quitada de favoritos.`);
  };

  const enPanel = useMemo(() => new Set(coleccion.map((s) => s.id)), [coleccion]);

  /** El modal ya valida que quepan (y avisa por cuantas se pasa). */
  const alPanelDesdeFavoritos = (items: ItemFavorito[]) => {
    const nuevas: SerieColeccion[] = items.map((item) => ({
      id: idFavorito(item),
      variable: item.variable,
      fila: item.data,
      cuadroId: item.cuadroId,
      cuadroNombre: item.cuadroNombre,
      unidad: item.data.Unidad,
      sectorNombre: item.sectorNombre,
      ruta: item.ruta,
      contenidos: item.contenidos,
      derecha: false,
      tipo: "line",
    }));
    setColeccion((c) => [...c, ...nuevas.filter((n) => !c.some((s) => s.id === n.id))].slice(0, MAX_SERIES));
    showToast.success(
      nuevas.length === 1
        ? `"${nuevas[0].variable}" añadida al gráfico comparativo.`
        : `${nuevas.length} series añadidas al gráfico comparativo.`
    );
  };

  const opcionModal = useMemo(
    () => (serieModal ? opcionSeries([serieModal], { etiquetas: etiquetasModal, rango: rangoMemo }) : null),
    [serieModal, etiquetasModal, rangoMemo]
  );
  const zoomModal = useMemo(
    () => (serieModal ? ventanaSeries([serieModal], rangoMemo) : undefined),
    [serieModal, rangoMemo]
  );

  /** Abre "Contenidos" en la pestaña y la rama del cuadro activo. */
  const abrirContenidos = () => {
    const raiz = raizDe(nodoActivo);
    if (raiz) setPestana(raiz);
    setExpandidos((e) => [...new Set([...e, ...ancestros(nodoActivo)])]);
    setArbolAbierto(true);
  };

  const elegir = (key: React.Key) => {
    const nodo = buscarNodo(arbol, String(key));
    if (nodo?.cuadro) {
      onElegir(nodo);
      setArbolAbierto(false);
    }
  };

  /** Tabla del cuadro, o su esqueleto mientras llega el primero. */
  const contenido = () => {
    if (error)
      return (
        <div className="flex flex-col items-center gap-3">
          <EstadoError error={error} />
          {onReintentar && <Button onClick={onReintentar}>Reintentar</Button>}
        </div>
      );
    if (cargando && !cuadro) return <Skeleton active title={false} paragraph={{ rows: 12 }} />;
    if (!cuadro || cuadro.filas.length === 0)
      return (
        <div className="py-16 text-center text-tinta-tenue">
          No se encontraron datos{cuadro ? ` para: ${cuadro.id}` : ""}
        </div>
      );
    const props = {
      filas: cuadro.filas,
      periodos: visibles,
      seleccionados,
      lleno,
      maximo: MAX_SERIES,
      onSeleccionar,
      onDeseleccionarTodo: deseleccionarTodo,
      onGraficar: (i: number) => setSerieModal(serieDeFila(i)),
      esFavorito,
      onFavorito,
      nombreExcel: nombreDescarga(cuadro),
      barra: (
        <Tooltip title="Descargar CSV">
          <Button
            size="small"
            type="text"
            icon={<FileTextOutlined />}
            aria-label="Descargar CSV"
            onClick={() => descargarCsv(cuadro, visibles)}
          />
        </Tooltip>
      ),
    };
    // Al cambiar de cuadro o de filtro la tabla anterior se queda atenuada bajo el indicador: sin
    // saltos de altura ni un "sin datos" de paso.
    return (
      <Spin spinning={cargando} description="Cargando datos..." size="large">
        {cuadro.vista === "arbol" ? <TablaBalances {...props} /> : <TablaCuadro {...props} />}
      </Spin>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main className="flex min-w-0 flex-col gap-3 rounded-contenedor bg-superficie p-4 shadow-tarjeta">
        <div className="flex items-start gap-3">
          <Button icon={<MenuOutlined />} onClick={abrirContenidos}>
            Contenidos
          </Button>
          <div className="min-w-0 flex-1">
            {/* Mientras carga, el titulo del cuadro elegido (no el del anterior). */}
            <h2 className="m-0 text-titulo font-bold text-identidad">
              {(cargando ? tituloNodo : cuadro?.titulo || tituloNodo) || "\u00a0"}
            </h2>
            {!cargando && cuadro?.unidad && <p className="m-0 text-detalle text-tinta-tenue">{cuadro.unidad}</p>}
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
              disabled={!periodos.length || cargando}
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
              disabled={!periodos.length || cargando}
              onChange={(v: string) => setRango(([d]) => [v < d ? v : d, v])}
              showSearch
            />
          </label>
        </div>

        {contenido()}

        {!cargando && cuadro && cuadro.notas.length > 0 && (
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
        maximo={MAX_SERIES}
        rango={rangoMemo}
        totalFavoritos={favoritos.items.length}
        onAbrirFavoritos={() => setFavoritosAbierto(true)}
        onCambiar={cambiarSerie}
        onGraficar={setSerieModal}
        onQuitar={(id) => setColeccion((c) => c.filter((s) => s.id !== id))}
        onQuitarTodas={() => setColeccion([])}
      />

      <Drawer
        title="Contenidos"
        placement="left"
        size={440}
        open={arbolAbierto}
        onClose={() => setArbolAbierto(false)}
      >
        {arbol.length > 1 ? (
          <Tabs
            activeKey={raizActiva?.key}
            onChange={setPestana}
            items={arbol.map((r) => ({ key: r.key, label: r.titulo }))}
          />
        ) : (
          raizActiva && <h4 className="m-0 mb-3 text-cuerpo font-bold text-identidad">{raizActiva.titulo}</h4>
        )}
        <BarraExpandirArbol
          onExpandir={() => setExpandidos((e) => [...new Set([...e, ...ramasPestana])])}
          onContraer={() => setExpandidos((e) => e.filter((k) => !ramasPestana.includes(String(k))))}
        />
        <Tree
          treeData={datosArbol}
          showLine
          blockNode
          selectedKeys={nodoActivo ? [nodoActivo] : []}
          expandedKeys={expandidos}
          onExpand={setExpandidos}
          onSelect={(_, info) => {
            if (info.node.isLeaf) elegir(info.node.key);
            else
              setExpandidos((e) =>
                e.includes(info.node.key) ? e.filter((k) => k !== info.node.key) : [...e, info.node.key]
              );
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
          zoomBase={zoomModal}
          alto={420}
          cambioTipo
          etiquetas={{ activas: etiquetasModal, alternar: () => setEtiquetasModal((v) => !v) }}
          nombreImagen="grafico_individual"
        />
      </Modal>

      <FavoritosModal
        abierto={favoritosAbierto}
        items={favoritos.items}
        enPanel={enPanel}
        maximo={MAX_SERIES}
        onCerrar={() => setFavoritosAbierto(false)}
        onAlPanel={alPanelDesdeFavoritos}
        onQuitar={favoritos.quitar}
        onVaciar={favoritos.vaciar}
      />
    </div>
  );
};

export default Explorador;
