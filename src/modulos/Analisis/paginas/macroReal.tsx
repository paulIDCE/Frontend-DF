import { useState } from "react";
import { Segmented, Select } from "antd";
import { FilaKpis, FranjaSelectores } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { Grafica } from "../componentes";
import { legible } from "../texto";
import { HojaMacro, FuentePendiente, KpiMacro, PanelLectura, Parrafos } from "../macro/componentesMacro";
import {
  en,
  etiquetaPeriodo,
  fuentesDe,
  periodoAnterior,
  periodoEnTexto,
  serie,
  serieVariacion,
  ultimoComun,
  valorEn,
  ventana,
  type Cuadros,
  type Serie,
} from "../macro/datosMacro";
import { categoriasDe, deSerie, opcionBarrasH, opcionCategorias, opcionDosCortes } from "../macro/opcionesMacro";
import { textoEmpleo, textoGasto, textoInflacion, textoPetroleo, textoPib, textoVab } from "../macro/textosMacro";
import { COLOR_ANTERIOR, colorSerie } from "../opciones";
import { MESES } from "../datos";

/**
 * Entorno macroeconomico — Sector real (maqueta "Entorno Macro 1" de `Libro1.xlsx`): PIB, VAB por
 * industria, enfoque del gasto, inflacion, empleo, petroleo y riesgo pais. Cuadros del BCE.
 */

const REJILLA = "grid grid-cols-1 gap-4 xl:grid-cols-2";

/* -------------------------------- 37. PIB -------------------------------- */

const Pib = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const nivel = serie(c.IEM431, { grupo: "Millones de USD encadenados", variable: "Producto Interno Bruto" }, "PIB en volumen (millones USD de 2018)");
  // La fila "Contribución a la variación" del PIB en IEM431 llega SIN SIGNO (2020: 9,25 en vez de
  // -9,25; 2024: 1,94 en vez de -1,94): la tasa se calcula con los niveles encadenados.
  const tasa = serieVariacion(nivel, 12, "Tasa de variación anual");
  const t4 = serie(c.TOU07, "PIB", "Interanual (t/t-4)");
  const t1 = serie(c.TOU08, "PIB", "Trimestral (t/t-1)");
  const finA = ultimoComun(nivel);
  const anios = ventana(nivel.periodos, finA, 8);
  const finT = ultimoComun(t4);
  const trims = ventana(t4.periodos.filter((p) => p >= "2016-T1"), finT, 200);
  const ultimoT = finT ? valorEn(t4, finT) : null;

  return (
    <>
      <FilaKpis columnas={3} className="mb-3">
        <KpiMacro titulo={`PIB interanual · ${finT ? etiquetaPeriodo(finT) : ""}`} valor={ultimoT} sufijo="%" variacion={finT ? valorEn(t1, finT) : null} etiquetaVariacion="frente al trimestre anterior (t/t-1)" />
        <KpiMacro
          titulo={`PIB en volumen · ${finA ? etiquetaPeriodo(finA, true) : ""}`}
          valor={finA ? valorEn(nivel, finA) : null}
          sufijo="M USD"
          variacion={finA ? valorEn(tasa, finA) : null}
          etiquetaVariacion="crecimiento anual"
        />
        <KpiMacro
          titulo={`PIB en volumen · ${finA ? etiquetaPeriodo(periodoAnterior(finA, 12), true) : ""}`}
          valor={finA ? valorEn(nivel, periodoAnterior(finA, 12)) : null}
          sufijo="M USD"
          variacion={finA ? valorEn(tasa, periodoAnterior(finA, 12)) : null}
          etiquetaVariacion="crecimiento anual"
        />
      </FilaKpis>
      <div className={REJILLA}>
        <Grafica
          titulo="Producto interno bruto"
          subtitulo={`Millones de USD encadenados (2018 = 100) y tasa de variación anual, ${anios[0] ? etiquetaPeriodo(anios[0], true) : ""}-${finA ? etiquetaPeriodo(finA, true) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(anios, true),
            izq: "musd",
            der: "%",
            etiquetas,
            series: [deSerie(nivel, anios, { tipo: "bar" }), deSerie(tasa, anios, { eje: 1 })],
          })}
          fuentes={fuentesDe(nivel, tasa)}
        />
        <Grafica
          titulo="Evolución del PIB"
          subtitulo="Volumen encadenado 2018 = 100, serie ajustada de estacionalidad"
          option={opcionCategorias({
            categorias: categoriasDe(trims),
            izq: "%",
            etiquetas,
            visibles: 24,
            series: [deSerie(t1, trims, { color: colorSerie(2) }), deSerie(t4, trims)],
          })}
          fuentes={fuentesDe(t4, t1)}
        />
      </div>
      {finT && ultimoT !== null && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(finT)}>
            <Parrafos
              textos={textoPib({
                trimestre: periodoEnTexto(finT),
                interanual: ultimoT,
                trimestral: valorEn(t1, finT),
                anio: finA ? etiquetaPeriodo(finA, true) : undefined,
                anual: finA ? valorEn(tasa, finA) : null,
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroPib = () => (
  <HojaMacro titulo="Producto interno bruto" subtitulo="Entorno macroeconómico · sector real" cuadros={["IEM431", "TOU07", "TOU08"]}>
    {(c) => <Pib c={c} />}
  </HojaMacro>
);

/* ------------------------- 38. VAB por industria ------------------------- */

const NO_INDUSTRIA = ["vab total", "otros elementos", "pib"];
const esIndustria = (nombre: string) => !NO_INDUSTRIA.some((x) => nombre.toLowerCase().startsWith(x));

/** Tasas (o contribuciones) de las industrias en un periodo, con su serie. */
const porIndustria = (cuadro: Cuadros[string] | undefined, periodo: string | undefined) =>
  (cuadro?.filas ?? [])
    .filter((f) => esIndustria(f.variable ?? ""))
    .map((f) => {
      const s = serie(cuadro, f.variable ?? "", legible(f.variable ?? ""));
      return { nombre: s.nombre, valor: valorEn(s, periodo), serie: s };
    });

const Vab = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const pibT4 = serie(c.VAB07, "PIB");
  const fin = ultimoComun(pibT4);
  const tasas = porIndustria(c.VAB07, fin);
  const contribuciones = porIndustria(c.VAB11, fin);
  const mayor = [...contribuciones].sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0))[0];
  const [elegida, setElegida] = useState<string | null>(null);
  const industria = elegida ?? mayor?.nombre ?? tasas[0]?.nombre ?? "";
  const original = c.VAB07?.filas.find((f) => legible(f.variable ?? "") === industria)?.variable ?? industria;
  const t4 = serie(c.VAB07, original, "Interanual (t/t-4)");
  const t1 = serie(c.VAB08, original, "Trimestral (t/t-1)");
  const trims = ventana(t4.periodos.filter((p) => p >= "2016-T1"), fin, 200);
  const periodo = fin ? etiquetaPeriodo(fin) : "";

  const ordenadas = [...contribuciones].filter((x) => x.valor !== null).sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0));
  return (
    <>
      <div className={REJILLA}>
        <Grafica
          titulo={`Tasas de variación del VAB por industria, ${periodo}`}
          subtitulo="Variación interanual t/t-4, serie ajustada"
          option={opcionBarrasH({ barras: tasas, etiquetas, nombreSerie: "Variación interanual" })}
          fuentes={fuentesDe(...tasas.map((t) => t.serie))}
          alto={520}
          cambioTipo={false}
        />
        <Grafica
          titulo={`Contribuciones a la variación interanual del PIB, ${periodo}`}
          subtitulo="Puntos porcentuales"
          option={opcionBarrasH({ barras: contribuciones, etiquetas, nombreSerie: "Contribución (pp)" })}
          fuentes={fuentesDe(...contribuciones.map((t) => t.serie))}
          alto={520}
          cambioTipo={false}
        />
      </div>
      <div className="mt-4">
        <Grafica
          titulo={`VAB de ${industria.toLowerCase()}`}
          subtitulo="Volumen encadenado 2018 = 100, serie ajustada"
          extra={
            <Select
              size="small"
              className="w-72"
              showSearch
              value={industria}
              options={tasas.map((t) => ({ value: t.nombre, label: t.nombre }))}
              onChange={setElegida}
            />
          }
          option={opcionCategorias({
            categorias: categoriasDe(trims),
            izq: "%",
            etiquetas,
            visibles: 24,
            series: [deSerie(t1, trims, { color: colorSerie(2) }), deSerie(t4, trims)],
          })}
          fuentes={fuentesDe(t4, t1)}
        />
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={periodo}>
            <Parrafos
              textos={textoVab({
                trimestre: periodoEnTexto(fin),
                positivas: tasas.filter((t) => (t.valor ?? 0) > 0).length,
                total: tasas.length,
                mayores: ordenadas.slice(0, 3).map((x) => ({ nombre: x.nombre, contribucion: x.valor ?? 0 })),
                menores: ordenadas
                  .filter((x) => (x.valor ?? 0) < 0)
                  .slice(-2)
                  .map((x) => ({ nombre: x.nombre, contribucion: x.valor ?? 0 })),
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroVab = () => (
  <HojaMacro titulo="Análisis del VAB por industria" subtitulo="Entorno macroeconómico · sector real · enfoque de la producción" cuadros={["VAB07", "VAB08", "VAB11"]}>
    {(c) => <Vab c={c} />}
  </HojaMacro>
);

/* --------------------------- 39. Enfoque del gasto --------------------------- */

const NOMBRES_GASTO: Record<string, string> = {
  pib: "PIB",
  "gasto de consumo final hogares": "Consumo final de hogares",
  "gasto de consumo final gobierno": "Consumo final del gobierno",
  fbkf: "FBKF",
  "variacion de existencias": "Variación de existencias",
  exportaciones: "Exportaciones",
  importaciones: "Importaciones",
};

const nombreGasto = (v: string) => {
  const n = v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
  const k = Object.keys(NOMBRES_GASTO).find((x) => n.startsWith(x));
  return k ? NOMBRES_GASTO[k] : legible(v);
};

const Gasto = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const pib = serie(c.TOU07, "PIB");
  const fin = ultimoComun(pib);
  const componentes = (c.TOU11?.filas ?? []).map((f) => ({
    nombre: nombreGasto(f.variable ?? ""),
    original: f.variable ?? "",
    contribucion: serie(c.TOU11, f.variable ?? "", nombreGasto(f.variable ?? "")),
    tasa: serie(c.TOU07, f.variable ?? "", nombreGasto(f.variable ?? "")),
  }));
  const conTasa = componentes.filter((x) => x.tasa.fuente !== null);
  const [elegido, setElegido] = useState("Consumo final de hogares");
  const comp = componentes.find((x) => x.nombre === elegido) ?? componentes[1];
  const t4 = serie(c.TOU07, comp?.original ?? "", "Interanual (t/t-4)");
  const t1 = serie(c.TOU08, comp?.original ?? "", "Trimestral (t/t-1)");
  const trims = ventana(t4.periodos.filter((p) => p >= "2016-T1"), fin, 200);
  const periodo = fin ? etiquetaPeriodo(fin) : "";

  return (
    <>
      <div className={REJILLA}>
        <Grafica
          titulo={`Oferta y utilización de bienes y servicios, ${periodo}`}
          subtitulo="Variación interanual t/t-4, serie ajustada"
          option={opcionBarrasH({
            barras: conTasa.map((x) => ({ nombre: x.nombre, valor: valorEn(x.tasa, fin), resaltar: x.nombre === "PIB" })),
            etiquetas,
            nombreSerie: "Variación interanual",
          })}
          fuentes={fuentesDe(...conTasa.map((x) => x.tasa))}
          cambioTipo={false}
        />
        <Grafica
          titulo={`Contribuciones a la variación interanual del PIB, ${periodo}`}
          subtitulo="Puntos porcentuales"
          option={opcionBarrasH({
            barras: componentes.map((x) => ({ nombre: x.nombre, valor: valorEn(x.contribucion, fin), resaltar: x.nombre === "PIB" })),
            etiquetas,
            nombreSerie: "Contribución (pp)",
          })}
          fuentes={fuentesDe(...componentes.map((x) => x.contribucion))}
          cambioTipo={false}
        />
      </div>
      <div className="mt-4">
        <Grafica
          titulo={`Evolución: ${elegido.toLowerCase()}`}
          subtitulo="Volumen encadenado 2018 = 100, serie ajustada"
          extra={
            <Select
              size="small"
              className="w-64"
              value={elegido}
              options={conTasa.filter((x) => x.nombre !== "PIB").map((x) => ({ value: x.nombre, label: x.nombre }))}
              onChange={setElegido}
            />
          }
          option={opcionCategorias({
            categorias: categoriasDe(trims),
            izq: "%",
            etiquetas,
            visibles: 24,
            series: [deSerie(t1, trims, { color: colorSerie(2) }), deSerie(t4, trims)],
          })}
          fuentes={fuentesDe(t4, t1)}
        />
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={periodo}>
            <Parrafos
              textos={textoGasto({
                trimestre: periodoEnTexto(fin),
                pib: valorEn(pib, fin) ?? 0,
                componentes: componentes
                  .filter((x) => x.nombre !== "PIB")
                  .map((x) => ({ nombre: x.nombre, tasa: valorEn(x.tasa, fin), contribucion: valorEn(x.contribucion, fin) })),
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroGasto = () => (
  <HojaMacro titulo="Componentes del PIB por el enfoque del gasto" subtitulo="Entorno macroeconómico · sector real" cuadros={["TOU07", "TOU08", "TOU11"]}>
    {(c) => <Gasto c={c} />}
  </HojaMacro>
);

/* ------------------------------ 40. Inflacion ------------------------------ */

/** "SALUD 7.34%" -> { nombre: "Salud", ponderacion: 7.34 }. */
const division = (grupo: string) => {
  const m = /^(.*?)\s*(\d+[.,]\d+)\s*%?\s*$/.exec(grupo.trim());
  const nombre = (m ? m[1] : grupo).replace(/ponderaci[oó]n:?\s*$/i, "").trim();
  return { nombre: legible(nombre), ponderacion: m ? Number(m[2].replace(",", ".")) : null };
};

const Inflacion = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const anual = serie(c.IEA421A, { grupo: "TOTAL", variable: "Variacion Anual" }, "Inflación anual (diciembre)");
  const mensual = serie(c.IEM421, { grupo: "TOTAL", variable: "Variacion Anual" }, "IPC general");
  const eeuu = serie(c.IEM343, "Tasa de inflacion", "Estados Unidos");
  const fin = ultimoComun(mensual);
  const anios = ventana(anual.periodos, ultimoComun(anual), 19);
  const anio = fin ? Number(fin.slice(0, 4)) : 0;
  const mesesDe = (a: number) => MESES.map((_, i) => `${a}-${String(i + 1).padStart(2, "0")}`);
  const divisiones = (c.IEM421?.filas ?? [])
    .filter((f) => !/^total/i.test(f.grupo ?? "") && /^variaci/i.test(f.variable ?? ""))
    .map((f) => {
      const d = division(f.grupo ?? "");
      const s = serie(c.IEM421, { grupo: f.grupo ?? "", variable: f.variable ?? "" }, d.nombre);
      return { ...d, serie: s, valor: valorEn(s, fin) };
    });
  const recientes = ventana(mensual.periodos, fin, 36);
  const eeuuFin = ultimoComun(eeuu);
  const ordenadas = [...divisiones].filter((x) => x.valor !== null).sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0));

  return (
    <>
      <div className={REJILLA}>
        <Grafica
          titulo="Inflación anual del IPC"
          subtitulo={`Variación a diciembre de cada año, ${anios[0] ? etiquetaPeriodo(anios[0], true) : ""}-${anios.length ? etiquetaPeriodo(anios[anios.length - 1], true) : ""}`}
          option={opcionCategorias({ categorias: categoriasDe(anios, true), izq: "%", etiquetas, series: [deSerie(anual, anios, { tipo: "bar" })] })}
          fuentes={fuentesDe(anual)}
        />
        <Grafica
          titulo="Inflación interanual por mes"
          subtitulo={`${anio - 1} frente a ${anio}`}
          option={opcionDosCortes({
            categorias: MESES,
            unidad: "%",
            etiquetas,
            anterior: { nombre: `Interanual ${anio - 1}`, datos: en(mensual, mesesDe(anio - 1)) },
            actual: { nombre: `Interanual ${anio}`, datos: en(mensual, mesesDe(anio)) },
          })}
          fuentes={fuentesDe(mensual)}
        />
        <Grafica
          titulo={`Inflación interanual por divisiones de consumo, ${fin ? etiquetaPeriodo(fin) : ""}`}
          subtitulo="Entre paréntesis, la ponderación de la división en la canasta"
          option={opcionBarrasH({
            barras: [
              { nombre: "IPC general", valor: valorEn(mensual, fin), resaltar: true },
              ...divisiones.map((d) => ({ nombre: d.ponderacion !== null ? `${d.nombre} (${d.ponderacion.toLocaleString("es-EC")}%)` : d.nombre, valor: d.valor })),
            ],
            etiquetas,
            nombreSerie: "Variación interanual",
          })}
          fuentes={fuentesDe(mensual, ...divisiones.map((d) => d.serie))}
          alto={420}
          cambioTipo={false}
        />
        <div className="flex flex-col gap-4">
          <Grafica
            titulo="Inflación anual: Ecuador y Estados Unidos"
            subtitulo="Últimos 36 meses"
            option={opcionCategorias({
              categorias: categoriasDe(recientes),
              izq: "%",
              etiquetas,
              series: [{ ...deSerie(mensual, recientes), nombre: "Ecuador" }, deSerie(eeuu, recientes, { color: COLOR_ANTERIOR })],
            })}
            fuentes={fuentesDe(mensual, eeuu)}
            alto={260}
          />
          <FuentePendiente
            titulo="Inflación internacional: América Latina"
            falta="Los cuadros del BCE en la base solo traen la inflación de Estados Unidos; la comparación con los países de la región no tiene serie."
            propuesta="ingerir la inflación interanual por país (CEPAL / bancos centrales) en el pipeline de datos."
          />
        </div>
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoInflacion({
                mes: periodoEnTexto(fin),
                anual: valorEn(mensual, fin) ?? 0,
                anualAnterior: valorEn(mensual, periodoAnterior(fin, 12)),
                sube: ordenadas.slice(0, 3).map((d) => ({ nombre: d.nombre, valor: d.valor ?? 0 })),
                baja: ordenadas.filter((d) => (d.valor ?? 0) < 0).map((d) => ({ nombre: d.nombre, valor: d.valor ?? 0 })),
                eeuu: eeuuFin ? valorEn(eeuu, eeuuFin) : null,
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroInflacion = () => (
  <HojaMacro titulo="Inflación nacional e internacional" subtitulo="Entorno macroeconómico · sector real · índice de precios al consumidor (2014 = 100)" cuadros={["IEA421A", "IEM421", "IEM343"]}>
    {(c) => <Inflacion c={c} />}
  </HojaMacro>
);

/* ------------------------------- 41. Empleo ------------------------------- */

const AMBITOS = ["NACIONAL", "URBANO", "RURAL"] as const;

const Empleo = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const [ambito, setAmbito] = useState<(typeof AMBITOS)[number]>("NACIONAL");
  const s = (v: string, n: string) => serie(c.IEM425A, { grupo: ambito, variable: v }, n);
  const adecuado = s("EMPLEO ADECUADO", "Empleo adecuado");
  const subempleo = s("SUBEMPLEO", "Subempleo");
  const desempleo = s("DESEMPLEO", "Desempleo");
  const fin = ultimoComun(adecuado);
  const trims = ventana(adecuado.periodos, fin, 200);
  const anterior = fin ? periodoAnterior(fin, 4) : undefined;
  const dif = (x: Serie) => {
    const a = valorEn(x, fin);
    const b = valorEn(x, anterior);
    return a === null || b === null ? null : a - b;
  };
  const graf = (x: Serie, i: number, titulo: string) => (
    <Grafica
      titulo={`${titulo} · ${legible(ambito)}`}
      subtitulo={`En porcentaje de la PEA, ${trims[0] ? etiquetaPeriodo(trims[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`}
      option={opcionCategorias({ categorias: categoriasDe(trims), izq: "%", etiquetas, series: [deSerie(x, trims, { color: colorSerie(i), area: true })] })}
      fuentes={fuentesDe(x)}
      alto={260}
    />
  );

  return (
    <>
      <div className="mb-3">
        <FranjaSelectores
          grupos={[
            {
              rotulo: "Ámbito",
              control: <Segmented value={ambito} onChange={(v) => setAmbito(v as (typeof AMBITOS)[number])} options={AMBITOS.map((a) => ({ value: a, label: legible(a) }))} />,
            },
          ]}
        />
      </div>
      <FilaKpis columnas={3} className="mb-3">
        <KpiMacro titulo={`Empleo adecuado · ${fin ? etiquetaPeriodo(fin) : ""}`} valor={valorEn(adecuado, fin)} sufijo="%" variacion={dif(adecuado)} enPuntos etiquetaVariacion="frente a un año antes" />
        <KpiMacro titulo={`Subempleo · ${fin ? etiquetaPeriodo(fin) : ""}`} valor={valorEn(subempleo, fin)} sufijo="%" variacion={dif(subempleo)} enPuntos subirEsMalo etiquetaVariacion="frente a un año antes" />
        <KpiMacro titulo={`Desempleo · ${fin ? etiquetaPeriodo(fin) : ""}`} valor={valorEn(desempleo, fin)} sufijo="%" variacion={dif(desempleo)} enPuntos subirEsMalo etiquetaVariacion="frente a un año antes" />
      </FilaKpis>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {graf(adecuado, 0, "Tasa de empleo adecuado")}
        {graf(subempleo, 1, "Tasa de subempleo")}
        {graf(desempleo, 2, "Tasa de desempleo")}
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoEmpleo({
                trimestre: periodoEnTexto(fin),
                ambito: legible(ambito),
                adecuado: valorEn(adecuado, fin) ?? 0,
                subempleo: valorEn(subempleo, fin) ?? 0,
                desempleo: valorEn(desempleo, fin) ?? 0,
                difAdecuado: dif(adecuado),
                difDesempleo: dif(desempleo),
              })}
            />
            <p>La serie mensual del BCE (IEM425) llega solo hasta 2016; la hoja usa la encuesta trimestral (IEM425A).</p>
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroEmpleo = () => (
  <HojaMacro titulo="Indicadores de empleo" subtitulo="Entorno macroeconómico · sector real · mercado laboral (ENEMDU trimestral)" cuadros={["IEM425A"]}>
    {(c) => <Empleo c={c} />}
  </HojaMacro>
);

/* ------------------------- 42. Petroleo y riesgo pais ------------------------- */

const Petroleo = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const cestaA = serie(c.IEA412BA, "CESTA ORIENTE Y NAPO", "Precio Ecuador (cesta Oriente y Napo)");
  const wtiA = serie(c.IEA412BA, "PETROLEO WTI", "Precio WTI");
  const cesta = serie(c.IEM412B, "CESTA ORIENTE Y NAPO", "Crudo Ecuador");
  const wti = serie(c.IEM412B, "PETROLEO WTI", "WTI");
  const riesgo = serie(c.IEM343, "Riesgo Pais (Fin", "Riesgo país (fin de período)");
  const finA = ultimoComun(cestaA);
  const anios = ventana(cestaA.periodos.filter((p) => p >= "2001"), finA, 30);
  const fin = ultimoComun(cesta, wti);
  const meses = ventana(cesta.periodos, fin, 22);
  const finR = ultimoComun(riesgo);
  const mesesR = ventana(riesgo.periodos.filter((p) => p >= "2019-01"), finR, 200);
  const var12 = (s: Serie) => serieVariacion(s, 12);

  return (
    <>
      <div className={REJILLA}>
        <Grafica
          titulo="Precios de petróleo crudo"
          subtitulo={`USD por barril, promedio anual ${anios[0] ? etiquetaPeriodo(anios[0], true) : ""}-${finA ? etiquetaPeriodo(finA, true) : ""}`}
          option={opcionCategorias({ categorias: categoriasDe(anios, true), izq: "usd", etiquetas, series: [deSerie(cestaA, anios), deSerie(wtiA, anios, { color: colorSerie(3) })] })}
          fuentes={fuentesDe(cestaA, wtiA)}
        />
        <Grafica
          titulo="Precios del WTI y crudo Ecuador"
          subtitulo={`USD por barril, ${meses[0] ? etiquetaPeriodo(meses[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "usd",
            etiquetas,
            rotar: true,
            series: [deSerie(wti, meses, { punteada: true, color: colorSerie(3) }), deSerie(cesta, meses)],
          })}
          fuentes={fuentesDe(wti, cesta)}
        />
        <Grafica
          titulo="Riesgo país de Ecuador"
          subtitulo="Índice EMBI, puntos básicos al fin de cada mes"
          option={opcionCategorias({ categorias: categoriasDe(mesesR), izq: "numero", etiquetas, visibles: 36, series: [deSerie(riesgo, mesesR, { area: true })] })}
          fuentes={fuentesDe(riesgo)}
        />
        <FuentePendiente
          titulo="Riesgo país en América Latina"
          falta="El BCE publica solo el EMBI de Ecuador (IEM343); la comparación con Brasil, Colombia, Perú y Argentina no tiene serie en la base."
          propuesta="ingerir el EMBI por país (JP Morgan, vía BCE o un proveedor) en el pipeline de datos."
        />
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoPetroleo({
                mes: periodoEnTexto(fin),
                wti: valorEn(wti, fin) ?? 0,
                varWti: valorEn(var12(wti), fin),
                cesta: valorEn(cesta, fin) ?? 0,
                varCesta: valorEn(var12(cesta), fin),
                riesgo: finR ? valorEn(riesgo, finR) : null,
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroPetroleo = () => (
  <HojaMacro titulo="Precios del crudo y riesgo país" subtitulo="Entorno macroeconómico · sector real" cuadros={["IEA412BA", "IEM412B", "IEM343"]}>
    {(c) => <Petroleo c={c} />}
  </HojaMacro>
);
