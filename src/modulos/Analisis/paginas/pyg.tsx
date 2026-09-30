import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, KpiBox, PanelAnalisis, Seccion, TablaEstructura, Var, type CuentaTabla } from "../componentes";
import { fmt } from "../datos";
import { opcionComparativoAnual, opcionHistorico } from "../opciones";

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

/** Codigo anualizado: `@5` -> `@5A`; `Marg_Ne` -> `Marg_Ne_anual`. */
const anual = (code: string) => (code.startsWith("@") ? `${code}A` : `${code}_anual`);

const PaginaPyG = ({ anualizado }: { anualizado: boolean }) => {
  const { ctx, etiquetas } = useRevista();
  const c = (code: string) => (anualizado ? anual(code) : code);
  const tabla: CuentaTabla[] = ESTRUCTURA.map(([code, name, nivel]) => ({ code: c(code), name, nivel }));
  const ingresos = ctx.dato(c("@5"));
  const ganancia = ctx.dato(c("Gan_Eje"));
  const icono = ingresos ? (ingresos.varMensual > 0 ? "📈" : ingresos.varMensual < 0 ? "📉" : "➡️") : "";

  return (
    <>
      <CabeceraPagina
        titulo={anualizado ? "ESTADO DE PÉRDIDAS Y GANANCIAS ANUALIZADO" : "ESTADO DE PÉRDIDAS Y GANANCIAS MENSUALIZADO"}
        subtitulo={`Análisis detallado de ingresos, gastos y resultados del ejercicio${anualizado ? " (Anualizado)" : ""}`}
      />
      <div className="mb-3 flex flex-wrap gap-3">
        <KpiBox titulo="INGRESOS" code={c("@5")} />
        <KpiBox titulo="GASTOS" code={c("@4")} />
        <KpiBox titulo="GANANCIA O (PÉRDIDA) DEL EJERCICIO" code={c("Gan_Eje")} />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <TablaEstructura cuentas={tabla} alto={440} />
          <PanelAnalisis>
            <Seccion tipo="resumen" titulo="Resumen General">
              {ingresos && (
                <p>
                  {icono} Los <strong>Ingresos</strong> registran {fmt(ingresos.actual)} millones USD, con variación
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
            titulo={`Análisis Comparativo Ganancias y Pérdidas${anualizado ? " (Anualizado)" : ""}`}
            option={opcionComparativoAnual(ctx, c("Gan_Eje"), etiquetas)}
            alto={300}
          />
          <Grafica
            titulo={`Evolución Histórica - Componentes PYG${anualizado ? " Anualizado" : ""}`}
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
