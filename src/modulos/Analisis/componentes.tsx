import { useMemo, type ReactNode } from "react";
import {
  Delta,
  KpiCard,
  MiniGrafica,
  TablaAnalitica,
  TarjetaGrafica,
  arbolPorNivel,
  type ColorKit,
  type ColumnaExcel,
  type VentanaEje,
} from "@idce/kit";
import {
  BarChartOutlined,
  BulbOutlined,
  EyeOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { useRevista } from "./RevistaContext";
import { fechaCorta, fmt, pct, type Dato } from "./datos";
import { opcionMini } from "./opciones";
import { claseVar } from "./estilos";
import { PosicionGrupo } from "./PosicionGrupo";
import { sentidoDe } from "./catalogoIndicadores";
import { legible } from "./texto";

/**
 * Piezas visuales comunes de la revista, sobre las del kit (`docs/VISTAS_ANALITICAS.md`,
 * `docs/IDENTIDAD_VISUAL.md`):
 * - titulo de pagina como `PageHeader` (identidad, tipo oracion); secciones y tarjetas en `tinta`
 *   con el icono en `accion`. Dentro de una vista no se usa el azul de identidad para decorar.
 * - KPIs con `KpiCard` + `Delta` dentro de `FilaKpis` (la vista arma la fila).
 * - graficas con `TarjetaGrafica` y la paleta de datos en orden fijo (`opciones.ts`).
 */

export const CabeceraPagina = ({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) => (
  <header className="mb-4 border-b border-linea pb-2">
    <h2 className="m-0 text-titulo font-semibold text-identidad">{legible(titulo)}</h2>
    {subtitulo && <p className="m-0 text-detalle text-tinta-tenue">{subtitulo}</p>}
  </header>
);

/** Titulo de bloque dentro de una hoja (`Title level={5}` del kit: tinta, no identidad). */
export const TituloBloque = ({ children, icono }: { children: ReactNode; icono?: ReactNode }) => (
  <h3 className="m-0 mb-2 flex items-center gap-2 text-cuerpo font-semibold text-tinta">
    {icono && <span className="text-accion">{icono}</span>}
    {typeof children === "string" ? legible(children) : children}
  </h3>
);

const flecha = (v: number) => (v > 0 ? "▲" : v < 0 ? "▼" : "─");

/** Porcentaje coloreado (los `highlight-positive/negative` del original). */
export const Var = ({ v, invertir = false, decimales = 2 }: { v: number; invertir?: boolean; decimales?: number }) => (
  <span className={`font-semibold ${claseVar(invertir ? -v : v)}`}>{pct(v, decimales)}</span>
);

/** Unidad escrita al final del titulo ("… (MILLONES USD)", "(#)", "(USD)", "(%)") -> sufijo del KPI. */
const UNIDADES: [RegExp, string][] = [
  [/\s*\(millones usd\)\s*$/i, "M USD"],
  [/\s*\(usd\)\s*$/i, "USD"],
  [/\s*\(#\)\s*$/i, ""],
  [/\s*\(%\)\s*$/i, "%"],
];

const separarUnidad = (titulo: string, sufijo?: string): [string, string] => {
  for (const [re, unidad] of UNIDADES) if (re.test(titulo)) return [titulo.replace(re, ""), sufijo ?? unidad];
  return [titulo, sufijo ?? "M USD"];
};

/**
 * KPI de la revista: `KpiCard` con el valor al corte, la variacion anual (`Delta`) y la mensual en
 * el pie. La unidad sale del titulo o de `sufijo` (por defecto, millones USD). En los porcentajes
 * las variaciones van en puntos (pp). `grupoPar`: percentil de la entidad en su sector (1.16).
 */
export const KpiBox = ({
  titulo,
  code,
  sufijo,
  grupoPar = false,
  color,
}: {
  titulo: string;
  code: string;
  sufijo?: string;
  grupoPar?: boolean;
  color?: ColorKit;
}) => {
  const { ctx } = useRevista();
  const d = ctx.dato(code);
  const [nombre, unidad] = separarUnidad(titulo, sufijo);
  const enPuntos = unidad === "%";
  const subirEsMalo = sentidoDe(code) === "baja";
  const anual = d ? (enPuntos ? d.actual - d.anioAnterior : d.varAnual) : null;
  const mensual = d ? (enPuntos ? d.actual - d.mesAnterior : d.varMensual) : null;
  const delta = enPuntos ? " pp" : "%";
  return (
    <KpiCard
      titulo={legible(nombre)}
      color={color ?? (enPuntos ? "accion" : "monto")}
      valor={d ? fmt(d.actual) : "—"}
      sufijo={unidad}
      valorSecundario={<Delta valor={anual} sufijo={delta} subirEsMalo={subirEsMalo} etiqueta={`vs. ${fechaCorta(ctx.anioAnterior)}`} />}
      pie={
        <span className="flex flex-wrap items-center justify-between gap-1">
          <Delta valor={mensual} sufijo={delta} subirEsMalo={subirEsMalo} etiqueta={`vs. ${fechaCorta(ctx.mesAnterior)}`} />
          {grupoPar && <PosicionGrupo code={code} />}
        </span>
      }
    />
  );
};

/** Nombre de archivo de las descargas de la hoja: `<hoja>_<entidad>_<fecha>`. */
export const useNombreDescarga = (detalle?: string) => {
  const { hoja, entidad, ctx } = useRevista();
  return [hoja, detalle, entidad, ctx.fecha]
    .filter(Boolean)
    .join("_")
    .replace(/[\\/:*?"<>|.]+/g, "")
    .replace(/\s+/g, "_");
};

export interface CuentaTabla {
  code: string;
  name: string;
  nivel?: number;
}

type FilaEstructura = CuentaTabla & { key: string; d: Dato };

/**
 * Tabla "Cuentas/Meses" con los tres cortes y variaciones (`renderTablaEstructuraGenerico`). Las
 * cuentas de nivel 2 y 3 cuelgan de la anterior de nivel menor: arbol con expandir / contraer todo.
 */
export const TablaEstructura = ({ cuentas, alto }: { cuentas: CuentaTabla[]; alto?: number }) => {
  const { ctx } = useRevista();
  const nombre = useNombreDescarga();
  const filas = useMemo(
    () =>
      arbolPorNivel(
        cuentas
          .map((c, i) => {
            const d = ctx.dato(c.code);
            return d ? { key: `${c.code}-${i}`, ...c, d } : null;
          })
          .filter(Boolean) as FilaEstructura[],
        (r) => r.nivel ?? 1,
      ),
    [cuentas, ctx],
  );
  const excel: ColumnaExcel<FilaEstructura>[] = [
    { titulo: "Cuentas/Meses", valor: (r) => r.name, ancho: 48 },
    { titulo: fechaCorta(ctx.anioAnterior), valor: (r) => r.d.anioAnterior, ancho: 14 },
    { titulo: fechaCorta(ctx.mesAnterior), valor: (r) => r.d.mesAnterior, ancho: 14 },
    { titulo: fechaCorta(ctx.fecha), valor: (r) => r.d.actual, ancho: 14 },
    { titulo: "Variación Mensual", valor: (r) => r.d.varMensual, formato: "porcentaje", ancho: 14 },
    { titulo: "Variación Anual", valor: (r) => r.d.varAnual, formato: "porcentaje", ancho: 14 },
  ];

  const celdaVar = (v: number) => (
    <span className={claseVar(v)}>
      {pct(v)} {flecha(v)}
    </span>
  );

  return (
    <TablaAnalitica<FilaEstructura>
      rowKey="key"
      dataSource={filas}
      pagination={false}
      bordered
      arbol="expandido"
      indentSize={14}
      excel={{ nombre, columnas: excel }}
      scroll={alto ? { x: "max-content", y: alto } : { x: "max-content" }}
      columns={[
        {
          title: "Cuentas/Meses",
          key: "n",
          fixed: "left",
          render: (_, r) => (
            <span className={r.nivel === 1 || !r.nivel ? "font-semibold text-tinta" : r.nivel === 3 ? "text-tinta-secundaria" : "text-tinta"}>
              {legible(r.name)}
            </span>
          ),
        },
        { title: fechaCorta(ctx.anioAnterior), key: "a", align: "right", render: (_, r) => fmt(r.d.anioAnterior) },
        { title: fechaCorta(ctx.mesAnterior), key: "m", align: "right", render: (_, r) => fmt(r.d.mesAnterior) },
        { title: fechaCorta(ctx.fecha), key: "c", align: "right", render: (_, r) => <strong>{fmt(r.d.actual)}</strong> },
        { title: "Variación mensual", key: "vm", align: "right", render: (_, r) => celdaVar(r.d.varMensual) },
        { title: "Variación anual", key: "va", align: "right", render: (_, r) => celdaVar(r.d.varAnual) },
      ]}
    />
  );
};

/** Ventana inicial del `dataZoom` de la opcion (la de `zoomRevista`): vuelve a ella "Restablecer zoom". */
const ventanaDeOpcion = (option: unknown): VentanaEje | undefined => {
  const zoom = (option as { dataZoom?: { startValue?: string | number; endValue?: string | number }[] } | null)?.dataZoom?.[0];
  return zoom?.startValue !== undefined && zoom.endValue !== undefined
    ? { desde: zoom.startValue, hasta: zoom.endValue }
    : undefined;
};

interface PropsGrafica {
  titulo: ReactNode;
  nota?: ReactNode;
  option: unknown;
  alto?: number;
  cambioTipo?: boolean;
  estadisticas?: boolean;
  /** Botón "Base 100" (series de distinta escala: sectores, entidades, cuentas). */
  base100?: boolean;
  /** Controles propios de la grafica (`extra` de `TarjetaGrafica`). */
  extra?: ReactNode;
  onClickPunto?: (evento: { dataIndex: number; name?: string }) => void;
}

/**
 * Grafica de la revista: `TarjetaGrafica` con cambio lineas/barras y titulo en tipo oracion. El
 * interruptor "Mostrar valores" de la revista da el estado inicial de las etiquetas; cada grafica
 * puede alternarlas.
 */
export const Grafica = (props: PropsGrafica) => {
  const { etiquetas } = useRevista();
  return <GraficaRevista key={String(etiquetas)} {...props} />;
};

const GraficaRevista = ({ titulo, nota, option, alto = 300, cambioTipo = true, estadisticas, base100, extra, onClickPunto }: PropsGrafica) => {
  const texto = typeof titulo === "string" ? legible(titulo) : titulo;
  return (
    <TarjetaGrafica
      titulo={texto}
      nota={nota}
      option={option}
      alto={alto}
      cambioTipo={cambioTipo}
      estadisticas={estadisticas}
      base100={base100}
      extra={extra}
      onClickPunto={onClickPunto}
      zoomBase={ventanaDeOpcion(option)}
      nombreImagen={typeof texto === "string" ? texto : "grafico"}
    />
  );
};

const ICONOS = { resumen: BarChartOutlined, composicion: PieChartOutlined, hallazgos: BulbOutlined, perspectiva: EyeOutlined };

export const Seccion = ({ tipo, titulo, children }: { tipo: keyof typeof ICONOS; titulo: string; children: ReactNode }) => {
  const Icono = ICONOS[tipo];
  return (
    <div className="mb-3">
      <h5 className="m-0 mb-1 flex items-center gap-2 text-cuerpo font-semibold text-tinta">
        <span className="inline-flex text-accion">
          <Icono />
        </span>{" "}
        {titulo}
      </h5>
      <div className="text-detalle leading-relaxed text-tinta-secundaria [&_p]:m-0 [&_p]:mb-1 [&_ul]:m-0 [&_ul]:pl-4">
        {children}
      </div>
    </div>
  );
};

/** Contenedor "Análisis dinámico - <fecha>". */
export const PanelAnalisis = ({ children }: { children: ReactNode }) => {
  const { ctx } = useRevista();
  return (
    <section className="rounded-tarjeta border border-linea bg-superficie p-3">
      <TituloBloque icono={<LineChartOutlined />}>{`Análisis dinámico - ${fechaCorta(ctx.fecha)}`}</TituloBloque>
      {children}
    </section>
  );
};

/**
 * Mini KPI (`renderMiniKPIWithChart`): valor al corte, grafica de los 6 meses que terminan en el
 * corte y variacion mensual. Todas las minis usan el mismo color (serie 1): el color no codifica
 * nada entre ellas. La variacion se colorea segun el sentido favorable del indicador.
 */
export const MiniKpi = ({
  titulo,
  code,
  tipo,
  sufijo = "%",
  grupoPar = false,
}: {
  titulo: string;
  code: string;
  tipo: "bar" | "line";
  sufijo?: string;
  /** Distintivo con el percentil de la entidad en su sector (plan 06, item 1.16). */
  grupoPar?: boolean;
}) => {
  const { ctx, etiquetas } = useRevista();
  const d = ctx.dato(code);
  const enPuntos = sufijo === "%";
  const mensual = d ? (enPuntos ? d.actual - d.mesAnterior : d.varMensual) : null;
  return (
    <div className="flex flex-col gap-1 rounded-tarjeta border border-linea bg-superficie p-2">
      <div className="flex items-baseline justify-between gap-2">
        {grupoPar ? <PosicionGrupo code={code} /> : <span />}
        <span className="text-subtitulo font-semibold text-tinta">
          {d ? fmt(d.actual) : "—"}
          {enPuntos ? " %" : ""}
        </span>
      </div>
      <MiniGrafica
        titulo={legible(titulo)}
        option={opcionMini(ctx, code, tipo, etiquetas, sufijo)}
        alto={130}
        key={String(etiquetas)}
        etiquetasIniciales={etiquetas}
      />
      <Delta
        className="text-rotulo"
        valor={mensual}
        sufijo={enPuntos ? " pp" : "%"}
        subirEsMalo={sentidoDe(code) === "baja"}
        etiqueta={`vs. ${fechaCorta(ctx.mesAnterior)}`}
      />
    </div>
  );
};
