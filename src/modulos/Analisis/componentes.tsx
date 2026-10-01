import { useMemo, type ReactNode } from "react";
import { MiniGrafica, TablaAnalitica, TarjetaGrafica, arbolPorNivel, type ColumnaExcel, type VentanaEje } from "@idce/kit";
import {
  BarChartOutlined,
  BulbOutlined,
  EyeOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { useRevista } from "./RevistaContext";
import { fechaCorta, fmt, pct, variacion, type Dato } from "./datos";
import { opcionMini } from "./opciones";
import { claseVar } from "./estilos";

/**
 * Piezas visuales comunes de la revista (cabecera, KPIs, tabla de estructura,
 * graficas, panel de analisis, mini KPIs). Reemplazan el HTML repetido en las
 * 31 hojas de prueba-data `analisis.html`.
 */

export const CabeceraPagina = ({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) => (
  <header className="mb-4 border-b-2 border-identidad pb-2">
    <h2 className="m-0 text-titulo font-extrabold uppercase text-identidad">{titulo}</h2>
    {subtitulo && <p className="m-0 text-detalle text-tinta-tenue">{subtitulo}</p>}
  </header>
);

const flecha = (v: number) => (v > 0 ? "▲" : v < 0 ? "▼" : "─");

/** Porcentaje coloreado (los `highlight-positive/negative` del original). */
export const Var = ({ v, invertir = false, decimales = 2 }: { v: number; invertir?: boolean; decimales?: number }) => (
  <span className={`font-semibold ${claseVar(invertir ? -v : v)}`}>{pct(v, decimales)}</span>
);

/** KPI de las hojas de estructura: valor actual + variacion anual. */
export const KpiBox = ({ titulo, code, sufijo = "" }: { titulo: string; code: string; sufijo?: string }) => {
  const { ctx } = useRevista();
  const d = ctx.dato(code);
  const v = d?.varAnual ?? 0;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-tarjeta border-l-4 border-identidad bg-superficie p-3 shadow-tarjeta">
      <span className="text-rotulo font-bold uppercase text-tinta-secundaria">{titulo}</span>
      <span className="text-cifra font-extrabold text-identidad">
        {fmt(d?.actual ?? 0)}
        {sufijo}
      </span>
      <span className="flex gap-2 text-detalle">
        <span className={`font-semibold ${claseVar(v)}`}>
          {v >= 0 ? "+" : ""}
          {pct(v)}
        </span>
        <span className="text-tinta-tenue">{fechaCorta(ctx.fecha)}</span>
      </span>
    </div>
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
          render: (_, r) => (
            <span
              className={r.nivel === 1 || !r.nivel ? "font-bold text-identidad" : r.nivel === 3 ? "text-tinta-secundaria" : "font-medium"}
            >
              {r.name}
            </span>
          ),
        },
        { title: fechaCorta(ctx.anioAnterior), key: "a", align: "right", render: (_, r) => fmt(r.d.anioAnterior) },
        { title: fechaCorta(ctx.mesAnterior), key: "m", align: "right", render: (_, r) => fmt(r.d.mesAnterior) },
        { title: fechaCorta(ctx.fecha), key: "c", align: "right", render: (_, r) => <strong>{fmt(r.d.actual)}</strong> },
        { title: "Variación Mensual", key: "vm", align: "right", render: (_, r) => celdaVar(r.d.varMensual) },
        { title: "Variación Anual", key: "va", align: "right", render: (_, r) => celdaVar(r.d.varAnual) },
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

/**
 * Grafica de la revista: `TarjetaGrafica` con cambio lineas/barras. El interruptor "Mostrar valores"
 * de la revista da el estado inicial de las etiquetas; cada grafica puede alternarlas.
 */
export const Grafica = (props: {
  titulo: ReactNode;
  nota?: ReactNode;
  option: unknown;
  alto?: number;
  cambioTipo?: boolean;
  estadisticas?: boolean;
}) => {
  const { etiquetas } = useRevista();
  return <GraficaRevista key={String(etiquetas)} {...props} />;
};

const GraficaRevista = ({
  titulo,
  nota,
  option,
  alto = 300,
  cambioTipo = true,
  estadisticas,
}: {
  titulo: ReactNode;
  nota?: ReactNode;
  option: unknown;
  alto?: number;
  cambioTipo?: boolean;
  estadisticas?: boolean;
}) => (
  <TarjetaGrafica
    titulo={titulo}
    nota={nota}
    option={option}
    alto={alto}
    cambioTipo={cambioTipo}
    estadisticas={estadisticas}
    zoomBase={ventanaDeOpcion(option)}
    nombreImagen={typeof titulo === "string" ? titulo : "grafico"}
  />
);

const ICONOS = { resumen: BarChartOutlined, composicion: PieChartOutlined, hallazgos: BulbOutlined, perspectiva: EyeOutlined };

export const Seccion = ({ tipo, titulo, children }: { tipo: keyof typeof ICONOS; titulo: string; children: ReactNode }) => {
  const Icono = ICONOS[tipo];
  return (
    <div className="mb-3">
      <h5 className="m-0 mb-1 flex items-center gap-2 text-cuerpo font-bold text-identidad">
        <Icono /> {titulo}
      </h5>
      <div className="text-detalle leading-relaxed text-tinta-secundaria [&_p]:m-0 [&_p]:mb-1 [&_ul]:m-0 [&_ul]:pl-4">
        {children}
      </div>
    </div>
  );
};

/** Contenedor "Análisis Dinámico - <fecha>". */
export const PanelAnalisis = ({ children }: { children: ReactNode }) => {
  const { ctx } = useRevista();
  return (
    <section className="rounded-tarjeta border border-linea bg-superficie-sutil p-3">
      <h4 className="m-0 mb-2 flex items-center gap-2 text-subtitulo font-bold text-identidad">
        <LineChartOutlined /> Análisis Dinámico - {fechaCorta(ctx.fecha)}
      </h4>
      {children}
    </section>
  );
};

/** Mini KPI con grafica de 6 meses y tendencia mensual (`renderMiniKPIWithChart`). */
export const MiniKpi = ({
  titulo,
  code,
  tipo,
  indiceColor,
  sufijo = "%",
}: {
  titulo: string;
  code: string;
  tipo: "bar" | "line";
  indiceColor: number;
  sufijo?: string;
}) => {
  const { ctx, etiquetas } = useRevista();
  const actual = ctx.valor(code);
  const vm = variacion(actual, ctx.valor(code, ctx.mesAnterior));
  const tendencia = vm > 0.5 ? ["↑", "Subiendo"] : vm < -0.5 ? ["↓", "Bajando"] : ["→", "Estable"];
  return (
    <div className="flex flex-col rounded-tarjeta border border-linea bg-superficie p-2">
      <div className="flex items-baseline justify-end gap-2">
        <span className="text-subtitulo font-extrabold text-identidad">
          {sufijo === "%" ? `${actual.toFixed(2)}%` : fmt(actual)}
        </span>
      </div>
      <MiniGrafica
        titulo={titulo}
        option={opcionMini(ctx, code, tipo, indiceColor, etiquetas, sufijo)}
        alto={130}
        key={String(etiquetas)}
        etiquetasIniciales={etiquetas}
      />
      <div className="text-rotulo text-tinta-tenue">
        {tendencia[0]} <span className={claseVar(vm)}>{tendencia[1]}</span> · Mensual:{" "}
        <span className={claseVar(vm)}>
          {vm > 0 ? "+" : ""}
          {vm.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
