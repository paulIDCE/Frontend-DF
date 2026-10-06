import type { ReactNode } from "react";
import { useRevista } from "./RevistaContext";
import { fmt, type Dato, pct, dec } from "./datos";
import { PanelAnalisis, Seccion, Var } from "./componentes";
import { UMBRALES_ESTRUCTURA } from "./diagnostico/motor";

/**
 * Textos de "Análisis Dinámico" de las hojas de estructura — porte de
 * `generateDynamicAnalysis*` (3, 6, 7, 8). Mismas reglas y umbrales que el
 * original; las frases que cambian por hoja van en la configuracion y los umbrales, en el
 * catalogo del motor de diagnostico (`diagnostico/reglas.json`, seccion `estructura`).
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

const { perspectiva: UMBRAL_PERSPECTIVA, concentracion: UMBRAL_CONCENTRACION } = UMBRALES_ESTRUCTURA;

const tendencia = (v: number) => (v > 0 ? "crecimiento" : v < 0 ? "decrecimiento" : "estabilidad");

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
              {c.principal.articulo} <strong>{c.principal.nombre}</strong> registran{" "}
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
              {pct(p ? (x.d.actual / p.actual) * 100 : 0, 1)} del total) - Variación mensual:{" "}
              <Var v={x.d.varMensual} />
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion tipo="hallazgos" titulo="Hallazgos Destacados">
        {mayor && mayor.d.varMensual > 0 && (
          <p>
            <strong>{mayor.name}</strong> presenta el mayor crecimiento mensual con{" "}
            <span className="font-semibold text-exito">+{pct(mayor.d.varMensual)}</span>.
          </p>
        )}
        {menor && menor.d.varMensual < 0 && (
          <p>
            <strong>{menor.name}</strong> registra el mayor decrecimiento mensual con{" "}
            <span className="font-semibold text-error">{pct(menor.d.varMensual)}</span>.
          </p>
        )}
        {pctConc !== null && c.concentracion && (
          <>
            {pctConc > UMBRAL_CONCENTRACION.alta && <p>{c.concentracion.frase(dec(pctConc, 1)).alta}</p>}
            {pctConc < UMBRAL_CONCENTRACION.baja && <p>{c.concentracion.frase(dec(pctConc, 1)).baja}</p>}
          </>
        )}
        {c.hallazgoExtra?.(ctx.dato)}
      </Seccion>

      <Seccion tipo="perspectiva" titulo="Perspectiva">
        {p && p.varAnual > UMBRAL_PERSPECTIVA.crecimientoSolido ? (
          <p>
            {c.perspectiva.sujeto} {pl ? "muestran" : "muestra"} un <strong>crecimiento anual sólido</strong> del{" "}
            {pct(p.varAnual)}, reflejando expansión en {c.perspectiva.expansion}.
          </p>
        ) : p && p.varAnual < UMBRAL_PERSPECTIVA.contraccion ? (
          <p>
            {c.perspectiva.sujeto} {pl ? "presentan" : "presenta"} una <strong>contracción anual</strong> del{" "}
            {pct(p.varAnual)}, lo cual requiere atención en la estrategia de {c.perspectiva.estrategia}.
          </p>
        ) : (
          <p>
            {c.perspectiva.sujeto} {pl ? "mantienen" : "mantiene"} una <strong>evolución estable</strong> con
            variación anual del {pct(p ? p.varAnual : 0)}, dentro de parámetros normales.
          </p>
        )}
      </Seccion>
    </PanelAnalisis>
  );
};
