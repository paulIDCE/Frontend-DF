import type { ReactNode } from "react";
import { useRevista } from "./RevistaContext";
import { fmt, type Dato } from "./datos";
import { PanelAnalisis, Seccion, Var } from "./componentes";

/**
 * Textos de "Análisis Dinámico" de las hojas de estructura — porte de
 * `generateDynamicAnalysis*` (3, 6, 7, 8). Mismas reglas y umbrales que el
 * original; las frases que cambian por hoja van en la configuracion.
 */

export interface ConfigAnalisis {
  principal: { code: string; nombre: string; articulo: "Los" | "Las" };
  /** "en la composición del activo productivo". */
  tendenciaEn: string;
  composicionTitulo: string;
  /** Componentes listados con su % del principal. */
  componentes: { code: string; name: string }[];
  /** Cuentas para "mayor crecimiento / decrecimiento" (sin el principal). */
  hallazgos: { code: string; name: string }[];
  concentracion?: {
    code: string;
    frase: (p: string) => { alta: ReactNode; baja: ReactNode };
  };
  hallazgoExtra?: (d: (code: string) => Dato | null) => ReactNode;
  perspectiva: {
    sujeto: string;
    plural: boolean;
    expansion: string;
    estrategia: string;
  };
}

const tendencia = (v: number) => (v > 0 ? "crecimiento" : v < 0 ? "decrecimiento" : "estabilidad");
const icono = (v: number) => (v > 0 ? "📈" : v < 0 ? "📉" : "➡️");

export const AnalisisEstructura = ({ config: c }: { config: ConfigAnalisis }) => {
  const { ctx } = useRevista();
  const p = ctx.dato(c.principal.code);
  const pl = c.perspectiva.plural;

  const componentes = c.componentes
    .map((x) => ({ ...x, d: ctx.dato(x.code) }))
    .filter((x) => x.d && x.d.actual > 0) as { code: string; name: string; d: Dato }[];

  const conVar = c.hallazgos
    .map((x) => ({ ...x, d: ctx.dato(x.code) }))
    .filter((x) => x.d && x.d.actual > 0) as { code: string; name: string; d: Dato }[];
  const mayor = conVar.length ? conVar.reduce((a, b) => (b.d.varMensual > a.d.varMensual ? b : a)) : null;
  const menor = conVar.length ? conVar.reduce((a, b) => (b.d.varMensual < a.d.varMensual ? b : a)) : null;

  const conc = c.concentracion && p && ctx.dato(c.concentracion.code);
  const pctConc = conc && p ? (conc.actual / p.actual) * 100 : null;

  return (
    <PanelAnalisis>
      <Seccion tipo="resumen" titulo="Resumen General">
        {p && (
          <>
            <p>
              {icono(p.varMensual)} {c.principal.articulo} <strong>{c.principal.nombre}</strong> registran{" "}
              {fmt(p.actual)} millones USD, con una variación mensual de <Var v={p.varMensual} /> y anual de{" "}
              <Var v={p.varAnual} />.
            </p>
            <p>
              La tendencia del período es de <strong>{tendencia(p.varMensual)}</strong> {c.tendenciaEn}.
            </p>
          </>
        )}
      </Seccion>

      <Seccion tipo="composicion" titulo={c.composicionTitulo}>
        <ul>
          {componentes.map((x) => (
            <li key={x.code}>
              <strong>{x.name}:</strong> {fmt(x.d.actual)} millones (
              {(p ? (x.d.actual / p.actual) * 100 : 0).toFixed(1)}% del total) - Variación mensual:{" "}
              <Var v={x.d.varMensual} />
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion tipo="hallazgos" titulo="Hallazgos Destacados">
        {mayor && mayor.d.varMensual > 0 && (
          <p>
            ✅ <strong>{mayor.name}</strong> presenta el mayor crecimiento mensual con{" "}
            <span className="font-semibold text-exito">+{mayor.d.varMensual.toFixed(2)}%</span>.
          </p>
        )}
        {menor && menor.d.varMensual < 0 && (
          <p>
            ⚠️ <strong>{menor.name}</strong> registra el mayor decrecimiento mensual con{" "}
            <span className="font-semibold text-error">{menor.d.varMensual.toFixed(2)}%</span>.
          </p>
        )}
        {pctConc !== null && c.concentracion && (
          <>
            {pctConc > 50 && <p>📊 {c.concentracion.frase(pctConc.toFixed(1)).alta}</p>}
            {pctConc < 30 && <p>📊 {c.concentracion.frase(pctConc.toFixed(1)).baja}</p>}
          </>
        )}
        {c.hallazgoExtra?.(ctx.dato)}
      </Seccion>

      <Seccion tipo="perspectiva" titulo="Perspectiva">
        {p && p.varAnual > 10 ? (
          <p>
            {c.perspectiva.sujeto} {pl ? "muestran" : "muestra"} un <strong>crecimiento anual sólido</strong> del{" "}
            {p.varAnual.toFixed(2)}%, reflejando expansión en {c.perspectiva.expansion}.
          </p>
        ) : p && p.varAnual < -5 ? (
          <p>
            🎯 {c.perspectiva.sujeto} {pl ? "presentan" : "presenta"} una <strong>contracción anual</strong> del{" "}
            {p.varAnual.toFixed(2)}%, lo cual requiere atención en la estrategia de {c.perspectiva.estrategia}.
          </p>
        ) : (
          <p>
            {c.perspectiva.sujeto} {pl ? "mantienen" : "mantiene"} una <strong>evolución estable</strong> con
            variación anual del {p ? p.varAnual.toFixed(2) : 0}%, dentro de parámetros normales.
          </p>
        )}
      </Seccion>
    </PanelAnalisis>
  );
};
