import type { ReactNode } from "react";
import { Tooltip } from "antd";
import { MODO_DESARROLLO } from "@/config/desarrollo";
import { MarcaFuenteFila } from "@/modulos/Explorador/FuenteDatos";
import { SIGLA_FILA, TEXTO_FILA, fuenteDeFila, type FuenteFila } from "@/services/fuenteDatos";
import type { Ctx } from "./datos";
import { legible } from "./texto";

/**
 * Detalle de la insignia de la revista: que datos de la hoja abierta (KPIs, graficas, tablas) salen
 * de la base de datos, cuales de archivos JSON y cuales calcula la app. Usa los codigos que la hoja
 * leyo al pintarse (`ctx.usados`).
 */

const GRUPOS: { fuente: FuenteFila; titulo: string }[] = [
  { fuente: "bd", titulo: "De la base de datos" },
  { fuente: "json", titulo: "De archivos JSON" },
  { fuente: "calculado", titulo: "Calculados en la app" },
];

export const FuentesHoja = ({ ctx, resumen }: { ctx: Ctx; resumen: ReactNode }) => {
  const porFuente = new Map<FuenteFila, { code: string; nombre: string }[]>();
  ctx.usados.forEach((code) => {
    const fila = ctx.fila(code);
    const fuente = fuenteDeFila(fila);
    if (!fila || !fuente) return;
    const lista = porFuente.get(fuente) ?? [];
    lista.push({ code: String(fila.CUC ?? code), nombre: legible(String(fila.Variable ?? code)) });
    porFuente.set(fuente, lista);
  });

  return (
    <div className="flex max-w-96 flex-col gap-2 text-detalle">
      <p className="m-0 text-tinta-secundaria">{resumen}</p>
      {porFuente.size === 0 ? (
        <p className="m-0 text-tinta-tenue">Esta hoja no muestra indicadores del reporte de la entidad.</p>
      ) : (
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-2">
          <p className="m-0 font-semibold text-tinta">En esta hoja:</p>
          {GRUPOS.filter((g) => porFuente.has(g.fuente)).map(({ fuente, titulo }) => {
            const lista = porFuente.get(fuente)!.sort((a, b) => a.nombre.localeCompare(b.nombre));
            return (
              <section key={fuente} className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-semibold text-tinta">
                  <MarcaFuenteFila fuente={fuente} sujeto="Este grupo" /> {titulo} ({lista.length})
                </span>
                <ul className="m-0 list-none p-0 pl-1">
                  {lista.map((x) => (
                    <li key={x.code} className="text-tinta-secundaria">
                      {x.nombre} <span className="text-rotulo text-tinta-tenue">· {x.code}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Detalle de la insignia en una hoja que no lee el reporte de la entidad (Entorno macroeconomico):
 * sus cuadros agrupados por fuente.
 */
export const FuentesExternasHoja = ({ titulo, resumen, datos }: { titulo: string; resumen: ReactNode; datos: DatoFuente[] }) => {
  const porFuente = new Map<FuenteFila, string[]>();
  datos.forEach(({ fuente, nombre }) => {
    if (!fuente) return;
    const lista = porFuente.get(fuente) ?? [];
    if (!lista.includes(nombre)) lista.push(nombre);
    porFuente.set(fuente, lista);
  });
  return (
    <div className="flex max-w-96 flex-col gap-2 text-detalle">
      <p className="m-0 text-tinta-secundaria">{resumen}</p>
      <p className="m-0 font-semibold text-tinta">{titulo}:</p>
      {GRUPOS.filter((g) => porFuente.has(g.fuente)).map(({ fuente, titulo: t }) => (
        <section key={fuente} className="flex flex-col gap-1">
          <span className="flex items-center gap-2 font-semibold text-tinta">
            <MarcaFuenteFila fuente={fuente} sujeto="Este grupo" /> {t} ({porFuente.get(fuente)!.length})
          </span>
          <ul className="m-0 list-none p-0 pl-1">
            {porFuente.get(fuente)!.map((n) => (
              <li key={n} className="text-tinta-secundaria">
                {n}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

/** Marca de fuente de un indicador de la revista (KPIs, minis, filas de tabla). */
export const MarcaCodigo = ({ ctx, code, sujeto = "Este indicador" }: { ctx: Ctx; code: string; sujeto?: string }) => (
  <MarcaFuenteFila fuente={fuenteDeFila(ctx.fila(code))} sujeto={sujeto} />
);

/** Un dato con su fuente, para `MarcaFuentes`. */
export interface DatoFuente {
  fuente: FuenteFila | null | undefined;
  nombre: string;
}

/**
 * Marca de fuente de un grupo de datos (una grafica con varias series, un cuadro propio). Si todos
 * salen de la misma fuente es la marca de una fila; si no, lista las fuentes ("BD · CALC") y el
 * detalle por dato al pasar el raton.
 */
export const MarcaFuentes = ({ datos, sujeto = "Esta gráfica" }: { datos: DatoFuente[]; sujeto?: string }) => {
  const porFuente = new Map<FuenteFila, string[]>();
  datos.forEach(({ fuente, nombre }) => {
    if (!fuente) return;
    const lista = porFuente.get(fuente) ?? [];
    if (!lista.includes(nombre)) lista.push(nombre);
    porFuente.set(fuente, lista);
  });
  const fuentes = GRUPOS.map((g) => g.fuente).filter((f) => porFuente.has(f));
  if (fuentes.length === 0 || !MODO_DESARROLLO) return null;
  if (fuentes.length === 1) return <MarcaFuenteFila fuente={fuentes[0]} sujeto={sujeto} />;
  return (
    <Tooltip
      title={
        <div className="flex flex-col gap-1">
          <span>{sujeto} mezcla fuentes:</span>
          {fuentes.map((f) => (
            <span key={f}>
              <strong>{SIGLA_FILA[f]}</strong> ({TEXTO_FILA[f]}): {porFuente.get(f)!.join(", ")}
            </span>
          ))}
        </div>
      }
    >
      <span className="shrink-0 rounded-sm border border-dashed border-identidad px-1 text-rotulo font-normal not-italic leading-4 text-identidad">
        {fuentes.map((f) => SIGLA_FILA[f]).join(" · ")}
      </span>
    </Tooltip>
  );
};

/** `MarcaFuentes` de varios indicadores del reporte de la entidad. */
export const MarcaCodigos = ({ ctx, codigos, sujeto }: { ctx: Ctx; codigos: string[]; sujeto?: string }) => (
  <MarcaFuentes
    sujeto={sujeto}
    datos={codigos.map((code) => {
      const fila = ctx.fila(code);
      return { fuente: fuenteDeFila(fila), nombre: legible(String(fila?.Variable ?? code)) };
    })}
  />
);
