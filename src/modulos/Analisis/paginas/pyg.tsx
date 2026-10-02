import { FilaKpis, TablaAnalitica } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, KpiBox, PanelAnalisis, Seccion, TablaEstructura, Var, useNombreDescarga, type CuentaTabla } from "../componentes";
import { fechaCorta, fmt, dec } from "../datos";
import { claseVar } from "../estilos";
import { opcionCascada, opcionComparativoAnual, opcionHistorico, type PasoCascada } from "../opciones";
import type { Ctx } from "../datos";

/**
 * Hojas 10 (PyG mensualizado) y 11 (PyG anualizado) — porte de
 * `renderEstructuraPYG` / `renderEstructuraPYGANUAL`. Mismo esquema; la
 * anualizada usa los codigos con sufijo `A` / `_anual`.
 */

const ESTRUCTURA: [string, string, number][] = [
  ["@5", "5. INGRESOS", 1],
  ["@51", "51. INTERESES Y DESCUENTOS GANADOS", 3],
  ["@41", "41. INTERESES CAUSADOS", 3],
  ["Marg_Ne", "MARGEN NETO INTERESES", 2],
  ["@52", "52. COMISIONES GANADAS", 3],
  ["@54", "54. INGRESOS POR SERVICIOS", 3],
  ["@42", "42. COMISIONES CAUSADAS", 3],
  ["@53", "53. UTILIDADES FINANCIERAS", 3],
  ["@43", "43. PÉRDIDAS FINANCIERAS", 3],
  ["Mar_Br_Fi", "MARGEN BRUTO FINANCIERO", 2],
  ["@44", "44. PROVISIONES", 2],
  ["Mar_Ne_Fina", "MARGEN NETO FINANCIERO", 1],
  ["@45", "45. GASTOS DE OPERACIÓN", 2],
  ["Mar_Inte", "MARGEN DE INTERMEDIACIÓN", 1],
  ["@55", "55. OTROS INGRESOS OPERACIONALES", 1],
  ["@46", "46. OTRAS PÉRDIDAS OPERACIONALES", 2],
  ["@56", "56. OTROS INGRESOS", 2],
  ["@47", "47. OTROS GASTOS Y PÉRDIDAS", 2],
  ["Gan_Pe_Imp", "GANANCIA O (PÉRDIDA) ANTES DE IMPUESTOS", 2],
  ["@48", "48. IMPUESTOS Y PARTICIPACIÓN A EMPLEADOS", 2],
  ["Gan_Eje", "GANANCIA O (PÉRDIDA) DEL EJERCICIO", 2],
];

const MARGENES: [string, string][] = [
  ["Marg_Ne", "MARGEN NETO INTERESES"],
  ["Mar_Br_Fi", "MARGEN BRUTO FINANCIERO"],
  ["Mar_Ne_Fina", "MARGEN NETO FINANCIERO"],
  ["Mar_Inte", "MARGEN DE INTERMEDIACIÓN"],
  ["Mar_Oper", "MARGEN OPERACIONAL"],
  ["Gan_Pe_Imp", "GANANCIA O (PÉRDIDA) ANTES DE IMPUESTOS"],
];

/** Partidas de los ratios de evolucion (Managerial Analyzer, "Analitica"): valor del año / del anterior. */
const EVOLUCION: [string, string][] = [
  ["@5", "Ingresos"],
  ["Marg_Ne", "Margen neto de intereses"],
  ["Mar_Oper", "Margen operacional"],
  ["Gan_Pe_Imp", "Resultado antes de impuestos"],
  ["Gan_Eje", "Resultado del ejercicio"],
];

interface FilaEvolucion {
  key: string;
  nombre: string;
  anterior: number;
  actual: number;
  /** `actual / anterior`; `null` si el año anterior es 0 o el signo cambia (no es interpretable). */
  ratio: number | null;
}

/**
 * Ratios de evolucion: el acumulado al mes de corte contra el del mismo mes del año anterior
 * (los resultados vienen acumulados en el año). Plan 06, item 1.9.
 */
const RatiosEvolucion = ({ codigo }: { codigo: (code: string) => string }) => {
  const { ctx } = useRevista();
  const nombre = useNombreDescarga("ratios_evolucion");
  const filas: FilaEvolucion[] = EVOLUCION.filter(([code]) => ctx.fila(codigo(code))).map(([code, n]) => {
    const actual = ctx.valor(codigo(code));
    const anterior = ctx.valor(codigo(code), ctx.anioAnterior);
    return { key: code, nombre: n, anterior, actual, ratio: anterior > 0 && actual >= 0 ? actual / anterior : null };
  });
  const ratio = (r: FilaEvolucion) =>
    r.ratio === null ? "n/a" : <span className={claseVar(r.ratio - 1)}>{dec(r.ratio)}×</span>;
  return (
    <TablaAnalitica<FilaEvolucion>
      rowKey="key"
      size="small"
      dataSource={filas}
      pagination={false}
      bordered
      excel={{
        nombre,
        columnas: [
          { titulo: "Partida", valor: (r) => r.nombre, ancho: 32 },
          { titulo: fechaCorta(ctx.anioAnterior), valor: (r) => r.anterior, ancho: 14 },
          { titulo: fechaCorta(ctx.fecha), valor: (r) => r.actual, ancho: 14 },
          { titulo: "Ratio de evolución", valor: (r) => r.ratio ?? "", ancho: 16 },
        ],
      }}
      columns={[
        { title: "Ratios de evolución", key: "n", render: (_, r) => <span className="font-medium">{r.nombre}</span> },
        { title: fechaCorta(ctx.anioAnterior), key: "a", align: "right", render: (_, r) => fmt(r.anterior) },
        { title: fechaCorta(ctx.fecha), key: "c", align: "right", render: (_, r) => <strong>{fmt(r.actual)}</strong> },
        { title: "Actual / anterior", key: "r", align: "right", render: (_, r) => ratio(r) },
      ]}
    />
  );
};

/**
 * Cascada de PyG (cuadro analitico de Managerial Analyzer): de los intereses ganados al resultado
 * del ejercicio, pasando por cada margen precalculado. Cada variacion es la diferencia entre dos
 * margenes consecutivos, asi la cascada siempre concilia con los totales del reporte.
 */
const pasosCascada = (ctx: Ctx, c: (code: string) => string): PasoCascada[] => {
  const v = (code: string) => ctx.valor(c(code));
  const tramos: [string, string, string][] = [
    ["Intereses causados", "@51", "Marg_Ne"],
    ["Comisiones y otros financieros", "Marg_Ne", "Mar_Br_Fi"],
    ["Provisiones", "Mar_Br_Fi", "Mar_Ne_Fina"],
    ["Gastos de operación", "Mar_Ne_Fina", "Mar_Inte"],
    ["Otros operacionales", "Mar_Inte", "Mar_Oper"],
    ["Otros ingresos y gastos", "Mar_Oper", "Gan_Pe_Imp"],
    ["Impuestos y participación", "Gan_Pe_Imp", "Gan_Eje"],
  ];
  const subtotales: Record<string, string> = {
    Marg_Ne: "Margen neto de intereses",
    Mar_Br_Fi: "Margen bruto financiero",
    Mar_Ne_Fina: "Margen neto financiero",
    Mar_Inte: "Margen de intermediación",
    Mar_Oper: "Margen operacional",
    Gan_Pe_Imp: "Resultado antes de impuestos",
    Gan_Eje: "Resultado del ejercicio",
  };
  return [
    { nombre: "Intereses ganados", valor: v("@51"), total: true },
    ...tramos.flatMap(([nombre, desde, hasta]) => [
      { nombre, valor: v(hasta) - v(desde) },
      { nombre: subtotales[hasta], valor: v(hasta), total: true },
    ]),
  ];
};

/** Codigo anualizado: `@5` -> `@5A`; `Marg_Ne` -> `Marg_Ne_anual`. */
const anual = (code: string) => (code.startsWith("@") ? `${code}A` : `${code}_anual`);

const PaginaPyG = ({ anualizado }: { anualizado: boolean }) => {
  const { ctx, etiquetas } = useRevista();
  const c = (code: string) => (anualizado ? anual(code) : code);
  const tabla: CuentaTabla[] = ESTRUCTURA.map(([code, name, nivel]) => ({ code: c(code), name, nivel }));
  const ingresos = ctx.dato(c("@5"));
  const ganancia = ctx.dato(c("Gan_Eje"));

  return (
    <>
      <CabeceraPagina
        titulo={anualizado ? "ESTADO DE PÉRDIDAS Y GANANCIAS ANUALIZADO" : "ESTADO DE PÉRDIDAS Y GANANCIAS MENSUALIZADO"}
        subtitulo={`Análisis detallado de ingresos, gastos y resultados del ejercicio${anualizado ? " (Anualizado)" : ""}`}
      />
      <FilaKpis columnas={3} className="mb-3">
        <KpiBox titulo="INGRESOS" code={c("@5")} />
        <KpiBox titulo="GASTOS" code={c("@4")} />
        <KpiBox titulo="GANANCIA O (PÉRDIDA) DEL EJERCICIO" code={c("Gan_Eje")} color={(ganancia?.actual ?? 0) >= 0 ? "bueno" : "malo"} />
      </FilaKpis>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <TablaEstructura cuentas={tabla} alto={440} />
          <RatiosEvolucion codigo={c} />
          <PanelAnalisis>
            <Seccion tipo="resumen" titulo="Resumen General">
              {ingresos && (
                <p>
                  Los <strong>Ingresos</strong> registran {fmt(ingresos.actual)} millones USD, con variación
                  mensual de <Var v={ingresos.varMensual} />.
                </p>
              )}
              {ganancia && (
                <p>
                  La <strong>Ganancia del Ejercicio</strong> es de {fmt(ganancia.actual)} millones USD con variación
                  anual de <Var v={ganancia.varAnual} />.
                </p>
              )}
            </Seccion>
          </PanelAnalisis>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <Grafica
            titulo={`Cascada de resultados${anualizado ? " (Anualizado)" : ""} - ${fechaCorta(ctx.fecha)}`}
            nota="De los intereses ganados al resultado del ejercicio. Verde suma, rojo resta; en azul, los márgenes del reporte."
            option={opcionCascada(pasosCascada(ctx, c), etiquetas)}
            alto={360}
            cambioTipo={false}
            estadisticas={false}
          />
          <Grafica
            titulo={`Análisis Comparativo Ganancias y Pérdidas${anualizado ? " (Anualizado)" : ""}`}
            option={opcionComparativoAnual(ctx, c("Gan_Eje"), etiquetas)}
            alto={300}
          />
          <Grafica
            titulo={`Evolución Histórica - Componentes PYG${anualizado ? " Anualizado" : ""}`}
            base100
            option={opcionHistorico(
              ctx,
              [
                ...MARGENES.map(([code, name]) => ({ code: c(code), name, type: "bar" as const })),
                { code: c("Gan_Eje"), name: "GANANCIA O (PÉRDIDA) DEL EJERCICIO", type: "line" as const, yAxisIndex: 1 as const },
              ],
              etiquetas,
              { izq: "millones USD", der: "millones USD" }
            )}
            alto={400}
          />
        </div>
      </div>
    </>
  );
};

export const Hoja10 = () => <PaginaPyG anualizado={false} />;
export const Hoja11 = () => <PaginaPyG anualizado />;
