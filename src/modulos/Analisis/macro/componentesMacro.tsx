import { useEffect, useMemo, type ReactNode } from "react";
import { Collapse, Spin } from "antd";
import { ClockCircleOutlined, LineChartOutlined } from "@ant-design/icons";
import { Delta, EstadoError, KpiCard, TablaAnalitica, useImpresion, useService, type ColumnaExcel } from "@idce/kit";
import { MarcaFuenteFila } from "@/modulos/Explorador/FuenteDatos";
import type { CuadroApi } from "@/types/api";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, TituloBloque, useNombreDescarga } from "../componentes";
import { claseVar } from "../estilos";
import { dec, fmt } from "../datos";
import { legible } from "../texto";
import { cargarCuadros, datosDeCuadros, etiquetaPeriodo, fuenteDeCuadros, valorEn, type Cuadros, type Serie } from "./datosMacro";

/**
 * Piezas de las hojas de Entorno macroeconomico: la hoja que carga sus cuadros del BCE e informa
 * su fuente, el panel de lectura del periodo, el KPI y la tarjeta de fuente pendiente.
 */

const cargar = (ids: string) => cargarCuadros(ids.split(","));

const PieFuentes = ({ cuadros }: { cuadros: CuadroApi[] }) => {
  const impresion = useImpresion();
  const conNotas = cuadros.filter((c) => c.notas.length);
  return (
    <footer className="mt-4 border-t border-linea pt-2 text-rotulo text-tinta-tenue">
      <p className="m-0">
        Fuente: Banco Central del Ecuador (BCE), Información Estadística Mensual y Cuentas Nacionales Trimestrales ·{" "}
        {cuadros.map((c) => `${legible(c.titulo)} (${c.id})`).join(" · ")}.
      </p>
      {!impresion && conNotas.length > 0 && (
        <Collapse
          ghost
          size="small"
          className="mt-1 [&_.ant-collapse-header]:!px-0"
          items={[
            {
              key: "notas",
              label: <span className="text-rotulo text-tinta-tenue">Notas metodológicas del BCE</span>,
              children: (
                <div className="flex flex-col gap-2">
                  {conNotas.map((c) => (
                    <div key={c.id}>
                      <strong className="text-tinta-secundaria">{c.id}</strong>
                      {c.notas.map((n, i) => (
                        <p key={i} className="m-0">
                          {n}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      )}
    </footer>
  );
};

/**
 * Hoja macro: carga sus cuadros, pinta la cabecera con la fuente (insignia BD / JSON) y el pie con
 * los cuadros y notas del BCE, e informa a la barra de la revista de donde salen sus datos. Al
 * imprimir no informa: las copias de impresion comparten el contexto.
 */
export const HojaMacro = ({
  titulo,
  subtitulo,
  cuadros: ids,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  cuadros: string[];
  children: (c: Cuadros) => ReactNode;
}) => {
  const { reportarFuentes } = useRevista();
  const impresion = useImpresion();
  const clave = ids.join(",");
  const { data, isLoading, apiError } = useService(cargar, [clave], [clave], true, "No se pudieron cargar los cuadros del BCE.");
  // Por `clave` (texto), no por `ids`: la hoja pasa un arreglo literal, nuevo en cada render, y
  // con el arreglo como dependencia el efecto de abajo reinformaba la fuente en cada render
  // (bucle de renders con la revista).
  const lista = useMemo(() => (data ? clave.split(",").map((id) => data[id]).filter(Boolean) : []), [data, clave]);
  const { fuente, conteo } = useMemo(() => fuenteDeCuadros(lista), [lista]);

  useEffect(() => {
    if (impresion || !reportarFuentes || !lista.length) return;
    reportarFuentes({
      titulo: "Cuadros del BCE en esta hoja",
      resumen: "Esta hoja no usa el reporte de la entidad: sus datos son cuadros del Banco Central del Ecuador.",
      fuente,
      conteo,
      datos: datosDeCuadros(lista),
    });
    return () => reportarFuentes(null);
  }, [impresion, reportarFuentes, lista, fuente, conteo]);

  if (apiError) return <EstadoError error={apiError} />;
  if (isLoading || !data)
    return (
      <div className="flex justify-center py-16">
        <Spin description="Cargando cuadros del BCE..." />
      </div>
    );

  return (
    <>
      <CabeceraPagina titulo={titulo} subtitulo={subtitulo} fuente={fuente} filasPorFuente={conteo} />
      {children(data)}
      <PieFuentes cuadros={lista} />
    </>
  );
};

/** "Lectura del periodo": textos de plantilla con las cifras del ultimo dato (`textosMacro.ts`). */
export const PanelLectura = ({ periodo, children }: { periodo: string; children: ReactNode }) => (
  <section className="rounded-tarjeta border border-linea bg-superficie p-3">
    <TituloBloque icono={<LineChartOutlined />}>{`Lectura del período - ${periodo}`}</TituloBloque>
    <div className="text-detalle leading-relaxed text-tinta-secundaria [&_p]:m-0 [&_p]:mb-1">{children}</div>
  </section>
);

/** KPI macro: valor del ultimo periodo y su variacion (en puntos o %) contra la referencia. */
export const KpiMacro = ({
  titulo,
  valor,
  sufijo,
  variacion,
  etiquetaVariacion,
  enPuntos = false,
  subirEsMalo = false,
  decimales = 1,
  pie,
}: {
  titulo: string;
  valor: number | null;
  sufijo: string;
  variacion?: number | null;
  etiquetaVariacion?: string;
  enPuntos?: boolean;
  subirEsMalo?: boolean;
  decimales?: number;
  pie?: ReactNode;
}) => (
  <KpiCard
    titulo={titulo}
    color={sufijo === "%" ? "accion" : "monto"}
    valor={valor === null ? "—" : decimales === 1 ? fmt(valor) : dec(valor, decimales)}
    sufijo={sufijo}
    valorSecundario={
      variacion !== undefined && variacion !== null ? (
        <Delta valor={Number(variacion.toFixed(2))} sufijo={enPuntos ? " pp" : "%"} etiqueta={etiquetaVariacion ?? ""} subirEsMalo={subirEsMalo} />
      ) : undefined
    }
    pie={pie}
  />
);

/** Bloque que la maqueta pide y que hoy no tiene fuente en los datos (requerimiento abierto). */
export const FuentePendiente = ({ titulo, falta, propuesta }: { titulo: string; falta: string; propuesta: string }) => (
  <section className="flex flex-col gap-1 rounded-tarjeta border border-dashed border-linea-fuerte bg-superficie-hundida p-4">
    <span className="flex items-center gap-2 font-semibold text-tinta">
      <ClockCircleOutlined className="text-advertencia" /> {legible(titulo)}
    </span>
    <span className="text-detalle text-tinta-secundaria">
      <strong>Fuente pendiente.</strong> {falta}
    </span>
    <span className="text-rotulo text-tinta-tenue">Propuesta: {propuesta}</span>
  </section>
);

export interface FilaPeriodos {
  serie: Serie;
  /** 1 = total (negrita), 2 = componente, 3 = subcomponente (sangria). */
  nivel?: 1 | 2 | 3;
}

/**
 * Tabla de saldos por periodo (reservas, panoramas): una fila por serie, una columna por periodo y
 * la variacion absoluta entre los dos ultimos, como los cuadros semanales del BCE.
 */
export const TablaPeriodos = ({ filas, periodos, unidad = "Millones USD" }: { filas: FilaPeriodos[]; periodos: string[]; unidad?: string }) => {
  const nombre = useNombreDescarga();
  const ultimo = periodos[periodos.length - 1];
  const previo = periodos[periodos.length - 2];
  const datos = filas.map((f, i) => ({ key: i, ...f }));
  type F = (typeof datos)[number];
  const variacion = (f: F) => {
    const a = valorEn(f.serie, ultimo);
    const b = valorEn(f.serie, previo);
    return a === null || b === null ? null : a - b;
  };
  const excel: ColumnaExcel<F>[] = [
    { titulo: "Concepto", valor: (f) => f.serie.nombre, ancho: 50 },
    ...periodos.map((p) => ({ titulo: etiquetaPeriodo(p), valor: (f: F) => valorEn(f.serie, p) ?? "", ancho: 14 })),
    { titulo: "Variación", valor: (f: F) => variacion(f) ?? "", ancho: 14 },
  ];
  return (
    <TablaAnalitica<F>
      rowKey="key"
      size="small"
      bordered
      pagination={false}
      dataSource={datos}
      excel={{ nombre, columnas: excel }}
      scroll={{ x: "max-content" }}
      columns={[
        {
          title: unidad,
          key: "n",
          fixed: "left",
          render: (_, f) => (
            <span
              className={`inline-flex items-center gap-1.5 ${f.nivel === 1 || !f.nivel ? "font-semibold text-tinta" : f.nivel === 3 ? "pl-6 text-tinta-secundaria" : "pl-3 text-tinta"}`}
            >
              {legible(f.serie.nombre)}
              <MarcaFuenteFila fuente={f.serie.fuente} alPasar />
            </span>
          ),
        },
        ...periodos.map((p) => ({
          title: etiquetaPeriodo(p),
          key: p,
          align: "right" as const,
          render: (_: unknown, f: F) => {
            const v = valorEn(f.serie, p);
            return v === null ? "—" : p === ultimo ? <strong>{fmt(v)}</strong> : fmt(v);
          },
        })),
        {
          title: "Variación",
          key: "var",
          align: "right" as const,
          render: (_: unknown, f: F) => {
            const v = variacion(f);
            return v === null ? "—" : <span className={claseVar(v)}>{fmt(v)}</span>;
          },
        },
      ]}
    />
  );
};

/** Parrafos de una plantilla de `textosMacro.ts`. */
export const Parrafos = ({ textos }: { textos: string[] }) => (
  <>
    {textos.map((t, i) => (
      <p key={i}>{t}</p>
    ))}
  </>
);
