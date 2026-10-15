import { FilaKpis } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { Grafica } from "../componentes";
import { HojaMacro, KpiMacro, PanelLectura, Parrafos } from "../macro/componentesMacro";
import { acumuladoAnio, etiquetaPeriodo, fuentesDe, periodoEnTexto, serie, ultimoComun, valorEn, ventana, type Cuadros } from "../macro/datosMacro";
import { categoriasDe, deSerie, opcionBarrasH, opcionCategorias } from "../macro/opcionesMacro";
import { textoDeuda, textoFiscal } from "../macro/textosMacro";
import { MESES } from "../datos";
import { colorSerie } from "../opciones";

/**
 * Entorno macroeconomico — Sector fiscal. La maqueta solo lo nombra (pestaña "Sector Fiscal" sin
 * contenido): se arma con el mismo estilo a partir de los cuadros de finanzas publicas del BCE
 * (administracion del Estado, base caja; deuda publica interna y externa).
 */

const REJILLA = "grid grid-cols-1 gap-4 xl:grid-cols-2";

/* --------------------------- 51. Resultado e ingresos --------------------------- */

const Resultado = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const global = serie(c.IEM241, "a. RESULTADO GLOBAL", "Resultado global");
  const primario = serie(c.IEM241, "f = e + a", "Resultado primario");
  const ingresos = serie(c.IEM242, "a = b + c", "Ingresos totales");
  const petroleros = serie(c.IEM242, "b. PETROLEROS", "Petroleros");
  const noPetroleros = serie(c.IEM242, "c = d", "No petroleros");
  const tributos = [
    serie(c.IEM242, "d. A las importaciones", "A las importaciones"),
    serie(c.IEM242, "e. A la renta", "A la renta"),
    serie(c.IEM242, "f. Al valor agregado", "Al valor agregado (IVA)"),
    serie(c.IEM242, "g. A los consumos especiales", "A los consumos especiales"),
    serie(c.IEM242, "h. Otros", "Otros no petroleros"),
  ];
  const fin = ultimoComun(global, ingresos);
  const meses = ventana(global.periodos, fin, 24);
  const anio = fin ? Number(fin.slice(0, 4)) : 0;
  const mes = fin ? Number(fin.slice(5, 7)) : 0;
  const acum = (s: typeof global) => acumuladoAnio(s, anio, mes);
  const rango = `enero y ${fin ? periodoEnTexto(fin) : ""}`;

  return (
    <>
      <FilaKpis columnas={3} className="mb-3">
        <KpiMacro titulo={`Resultado global acumulado · ene-${MESES[mes - 1]?.toLowerCase() ?? ""} ${anio}`} valor={acum(global)} sufijo="M USD" />
        <KpiMacro titulo="Resultado primario acumulado" valor={acum(primario)} sufijo="M USD" />
        <KpiMacro titulo="Ingresos acumulados" valor={acum(ingresos)} sufijo="M USD" />
      </FilaKpis>
      <div className={REJILLA}>
        <Grafica
          titulo="Resultado global y primario de la administración del Estado"
          subtitulo={`Base caja, millones de USD por mes, ${meses[0] ? etiquetaPeriodo(meses[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            etiquetas,
            rotar: true,
            series: [deSerie(global, meses, { tipo: "bar" }), deSerie(primario, meses, { color: colorSerie(2) })],
          })}
          fuentes={fuentesDe(global, primario)}
          cambioTipo={false}
        />
        <Grafica
          titulo="Ingresos petroleros y no petroleros"
          subtitulo="Base caja, millones de USD por mes"
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            etiquetas,
            rotar: true,
            series: [deSerie(petroleros, meses, { tipo: "bar", apilar: "ing" }), deSerie(noPetroleros, meses, { tipo: "bar", apilar: "ing" })],
          })}
          fuentes={fuentesDe(petroleros, noPetroleros)}
          cambioTipo={false}
        />
        <Grafica
          titulo={`Ingresos no petroleros por tipo, acumulado ${anio}`}
          subtitulo={`Millones de USD, enero-${MESES[mes - 1]?.toLowerCase() ?? ""}`}
          option={opcionBarrasH({ barras: tributos.map((t) => ({ nombre: t.nombre, valor: acum(t) })), unidad: "musd", etiquetas, nombreSerie: "Acumulado del año" })}
          fuentes={[...fuentesDe(...tributos), { fuente: "calculado", nombre: "Acumulado del año" }]}
          alto={260}
          cambioTipo={false}
        />
      </div>
      {fin && acum(ingresos) !== null && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoFiscal({
                periodo: rango,
                global: acum(global) ?? 0,
                primario: acum(primario) ?? 0,
                ingresos: acum(ingresos) ?? 0,
                petroleros: acum(petroleros) ?? 0,
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroFiscal = () => (
  <HojaMacro titulo="Resultado fiscal e ingresos" subtitulo="Entorno macroeconómico · sector fiscal · administración del Estado (base caja)" cuadros={["IEM241", "IEM242"]}>
    {(c) => <Resultado c={c} />}
  </HojaMacro>
);

/* --------------------------- 52. Erogaciones y deuda --------------------------- */

const Deuda = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const sectores = ["Servicios generales", "Educacion y cultura", "Salud y desarrollo", "Desarrollo agropecuario", "Transportes y comunicaciones", "Otros"].map((v) =>
    serie(c.IEM243, { grupo: "SECTORES", variable: v })
  );
  const servicio = serie(c.IEM243, { grupo: "Servicio de la deuda", variable: "TOTAL" }, "Servicio de la deuda");
  const internaTotal = serie(c.IEM25, { grupo: "ESTADO", variable: "Total" }, "Deuda interna total");
  const interna = [
    serie(c.IEM25, "Bonos del Estado", "Bonos del Estado"),
    serie(c.IEM25, "Certificados de Tesoreria", "Certificados de Tesorería"),
    serie(c.IEM25, "BCE, IESS", "BCE, IESS, BDE y obligaciones"),
  ];
  const externa = serie(c.IEM331, "SALDO FINAL", "Deuda externa pública");
  const pctPib = serie(c.IEM331, "DEUDA TOTAL Porcentajes", "Deuda total (% del PIB)");
  const fin = ultimoComun(sectores[0]);
  const meses = ventana(sectores[0].periodos, fin, 24);
  const finD = ultimoComun(internaTotal, externa);
  const mesesD = ventana(externa.periodos.filter((p) => p >= "2018-01"), finD, 200);

  return (
    <>
      <div className={REJILLA}>
        <Grafica
          titulo="Erogaciones de la administración del Estado por sector"
          subtitulo={`Base caja, excluye amortización; millones de USD por mes, ${meses[0] ? etiquetaPeriodo(meses[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            etiquetas: false,
            rotar: true,
            series: [...sectores.map((s) => deSerie(s, meses, { tipo: "bar" as const, apilar: "ero" })), deSerie(servicio, meses, { color: colorSerie(7), punteada: true })],
          })}
          fuentes={fuentesDe(...sectores, servicio)}
          cambioTipo={false}
        />
        <Grafica
          titulo="Deuda pública interna"
          subtitulo="Saldo en millones de USD por instrumento"
          option={opcionCategorias({
            categorias: categoriasDe(mesesD),
            izq: "musd",
            etiquetas,
            visibles: 36,
            series: interna.map((s) => deSerie(s, mesesD, { area: true, apilar: "int" })),
          })}
          fuentes={fuentesDe(...interna)}
        />
        <Grafica
          titulo="Deuda externa pública"
          subtitulo="Saldo en millones de USD y deuda total en porcentaje del PIB"
          option={opcionCategorias({
            categorias: categoriasDe(mesesD),
            izq: "musd",
            der: "%",
            etiquetas,
            visibles: 36,
            series: [deSerie(externa, mesesD, { tipo: "bar" }), deSerie(pctPib, mesesD, { eje: 1, color: colorSerie(3) })],
          })}
          fuentes={fuentesDe(externa, pctPib)}
          cambioTipo={false}
        />
      </div>
      {finD && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(finD)}>
            <Parrafos textos={textoDeuda({ mes: periodoEnTexto(finD), interna: valorEn(internaTotal, finD) ?? 0, externa: valorEn(externa, finD) ?? 0, pctPib: valorEn(pctPib, finD) })} />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroDeuda = () => (
  <HojaMacro titulo="Erogaciones y deuda pública" subtitulo="Entorno macroeconómico · sector fiscal" cuadros={["IEM243", "IEM25", "IEM331"]}>
    {(c) => <Deuda c={c} />}
  </HojaMacro>
);
