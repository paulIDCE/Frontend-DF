import { FilaKpis } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { Grafica } from "../componentes";
import { FuentePendiente, HojaMacro, KpiMacro, PanelLectura, Parrafos } from "../macro/componentesMacro";
import {
  acumuladoAnio,
  etiquetaPeriodo,
  fuentesDe,
  periodoAnterior,
  periodoEnTexto,
  promedioAnio,
  serie,
  serieVariacion,
  sumaSeries,
  ultimoComun,
  valorEn,
  ventana,
  type Cuadros,
} from "../macro/datosMacro";
import { categoriasDe, deSerie, opcionCategorias } from "../macro/opcionesMacro";
import { textoBalanza, textoCuentaCorriente, textoRemesas } from "../macro/textosMacro";
import { MESES } from "../datos";
import { colorSerie } from "../opciones";

/**
 * Entorno macroeconomico — Sector externo (maqueta "Entorno Macro 3"): cuenta corriente, remesas,
 * inversion directa y balanza comercial. Cuadros del BCE (balanza de pagos trimestral y anual,
 * balanza comercial mensual).
 */

const REJILLA = "grid grid-cols-1 gap-4 xl:grid-cols-2";

/* --------------------------- 48. Cuenta corriente --------------------------- */

const componentesCC = (c: Cuadros[string] | undefined) => ({
  cc: serie(c, "CUENTA CORRIENTE", "Cuenta corriente"),
  bienes: serie(c, "BIENES (2)", "Cuenta bienes"),
  servicios: serie(c, "SERVICIOS", "Cuenta servicios"),
  primario: serie(c, "INGRESO PRIMARIO", "Ingreso primario"),
  secundario: serie(c, "INGRESO SECUNDARIO", "Ingreso secundario"),
});

const CuentaCorriente = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const a = componentesCC(c.IEA321A);
  const t = componentesCC(c.IEM321);
  const servPrim = sumaSeries("Cuenta servicios e ingreso primario", t.servicios, t.primario);
  const finA = ultimoComun(a.cc);
  const anios = ventana(a.cc.periodos, finA, 10);
  const finT = ultimoComun(t.cc);
  const trims = ventana(t.cc.periodos, finT, 12);

  return (
    <>
      <div className="flex flex-col gap-4">
        <Grafica
          titulo="Evolución de la cuenta corriente y sus componentes"
          subtitulo={`Millones de USD, ${anios[0] ? etiquetaPeriodo(anios[0], true) : ""}-${finA ? etiquetaPeriodo(finA, true) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(anios, true),
            izq: "musd",
            etiquetas,
            series: [
              deSerie(a.bienes, anios, { tipo: "bar", apilar: "cc" }),
              deSerie(a.servicios, anios, { tipo: "bar", apilar: "cc" }),
              deSerie(a.primario, anios, { tipo: "bar", apilar: "cc" }),
              deSerie(a.secundario, anios, { tipo: "bar", apilar: "cc" }),
              deSerie(a.cc, anios, { punteada: true, color: colorSerie(4) }),
            ],
          })}
          fuentes={fuentesDe(a.cc, a.bienes, a.servicios, a.primario, a.secundario)}
          alto={360}
          cambioTipo={false}
        />
        <Grafica
          titulo="Cuenta corriente trimestral"
          subtitulo={`Millones de USD, ${trims[0] ? etiquetaPeriodo(trims[0]) : ""}-${finT ? etiquetaPeriodo(finT) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(trims),
            izq: "musd",
            etiquetas,
            series: [
              deSerie(servPrim, trims, { tipo: "bar" }),
              deSerie(t.secundario, trims, { tipo: "bar" }),
              deSerie(t.cc, trims, { color: colorSerie(2) }),
              deSerie(t.bienes, trims, { color: colorSerie(3) }),
            ],
          })}
          fuentes={fuentesDe(servPrim, t.secundario, t.cc, t.bienes)}
          alto={340}
          cambioTipo={false}
        />
      </div>
      {finA && finT && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(finT)}>
            <Parrafos
              textos={textoCuentaCorriente({
                anio: etiquetaPeriodo(finA, true),
                cc: valorEn(a.cc, finA) ?? 0,
                ccAnt: valorEn(a.cc, periodoAnterior(finA, 12)),
                trimestre: periodoEnTexto(finT),
                ccT: valorEn(t.cc, finT) ?? 0,
                bienesT: valorEn(t.bienes, finT),
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroCuentaCorriente = () => (
  <HojaMacro titulo="Cuenta corriente y sus componentes" subtitulo="Entorno macroeconómico · sector externo · balanza de pagos" cuadros={["IEA321A", "IEM321"]}>
    {(c) => <CuentaCorriente c={c} />}
  </HojaMacro>
);

/* ------------------------ 49. Remesas e inversion directa ------------------------ */

const remesas = (c: Cuadros[string] | undefined) => serie(c, { variable: "Remesas de trabajadores", tras: ["INGRESO SECUNDARIO", "Credito"] }, "Remesas recibidas");
const inversionDirecta = (c: Cuadros[string] | undefined) => serie(c, { variable: "Inversion directa", tras: ["Pasivos netos incurridos"] }, "Inversión directa");

const RemesasInversion = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const r = remesas(c.IEM321);
  const rA = remesas(c.IEA321A);
  const rVar = serieVariacion(r, 4, "Variación interanual (t/t-4)");
  const id = inversionDirecta(c.IEM321);
  const idA = inversionDirecta(c.IEA321A);
  const fin = ultimoComun(r);
  const trims = ventana(r.periodos, fin, 12);
  const finA = ultimoComun(rA);
  const anios = ventana(idA.periodos, finA, 9);

  return (
    <>
      <FilaKpis columnas={3} className="mb-3">
        <KpiMacro titulo={`Remesas recibidas · ${fin ? etiquetaPeriodo(fin) : ""}`} valor={valorEn(r, fin)} sufijo="M USD" variacion={valorEn(rVar, fin)} etiquetaVariacion="frente al mismo trimestre del año anterior" />
        <KpiMacro titulo={`Remesas recibidas · ${finA ? etiquetaPeriodo(finA, true) : ""}`} valor={valorEn(rA, finA)} sufijo="M USD" variacion={finA ? valorEn(serieVariacion(rA, 12), finA) : null} etiquetaVariacion="anual" />
        <KpiMacro titulo={`Inversión directa · ${fin ? etiquetaPeriodo(fin) : ""}`} valor={valorEn(id, fin)} sufijo="M USD" />
      </FilaKpis>
      <div className={REJILLA}>
        <Grafica
          titulo="Remesas recibidas"
          subtitulo="Millones de USD y tasa de variación interanual"
          option={opcionCategorias({
            categorias: categoriasDe(trims),
            izq: "musd",
            der: "%",
            etiquetas,
            series: [deSerie(r, trims, { tipo: "bar" }), deSerie(rVar, trims, { eje: 1, punteada: true, color: colorSerie(3) })],
          })}
          fuentes={fuentesDe(r, rVar)}
          cambioTipo={false}
        />
        <Grafica
          titulo="Inversión directa"
          subtitulo={`Flujo anual en millones de USD, ${anios[0] ? etiquetaPeriodo(anios[0], true) : ""}-${finA ? etiquetaPeriodo(finA, true) : ""}`}
          option={opcionCategorias({ categorias: categoriasDe(anios, true), izq: "musd", etiquetas, series: [deSerie(idA, anios, { tipo: "bar" })] })}
          fuentes={fuentesDe(idA)}
        />
        <FuentePendiente
          titulo="Remesas recibidas por país de origen"
          falta="La balanza de pagos del BCE en la base trae solo el total de remesas; el desglose por país (Estados Unidos, España, Italia…) se publica aparte."
          propuesta="ingerir el cuadro de remesas por país del BCE (trimestral) en el pipeline de datos."
        />
        <FuentePendiente
          titulo="Inversión directa por modalidad"
          falta="Solo está el flujo total de inversión directa; falta la apertura en acciones y participaciones, utilidades reinvertidas y otro capital."
          propuesta="ingerir el cuadro de inversión directa por modalidad del BCE en el pipeline de datos."
        />
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoRemesas({
                trimestre: periodoEnTexto(fin),
                remesas: valorEn(r, fin) ?? 0,
                varT4: valorEn(rVar, fin),
                anio: finA ? etiquetaPeriodo(finA, true) : "",
                anual: valorEn(rA, finA),
                id: valorEn(id, fin),
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroRemesas = () => (
  <HojaMacro titulo="Remesas e inversión directa" subtitulo="Entorno macroeconómico · sector externo · balanza de pagos" cuadros={["IEM321", "IEA321A"]}>
    {(c) => <RemesasInversion c={c} />}
  </HojaMacro>
);

/* --------------------------- 50. Balanza comercial --------------------------- */

const Balanza = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const total = serie(c.IEM323, { grupo: "BALANZA COMERCIAL", variable: "BALANZA COMERCIAL" }, "Total");
  const pet = serie(c.IEM323, "Total Balanza Comercial Petrolera", "Petrolera");
  const noPet = serie(c.IEM323, "Total Balanza Comercial no Petrolera", "No petrolera");
  const cesta = serie(c.IEM412B, "CESTA ORIENTE Y NAPO", "Precio promedio del crudo (eje der.)");
  const fin = ultimoComun(total);
  const anio = fin ? Number(fin.slice(0, 4)) : 0;
  const mes = fin ? Number(fin.slice(5, 7)) : 0;
  const anios = [anio - 2, anio - 1, anio];
  const rango = `ene-${MESES[mes - 1]?.toLowerCase() ?? ""}`;
  const acum = (s: typeof total) => anios.map((a) => acumuladoAnio(s, a, mes));
  const meses = ventana(total.periodos, fin, 13);

  return (
    <>
      <div className={REJILLA}>
        <Grafica
          titulo="Balanza comercial acumulada"
          subtitulo={`Millones de USD FOB y USD por barril, acumulado ${rango} de ${anios[0]} a ${anio}`}
          option={opcionCategorias({
            categorias: anios.map((a) => `${rango} ${a}`),
            izq: "musd",
            der: "usd",
            etiquetas,
            series: [
              { nombre: "Total", tipo: "bar", datos: acum(total) },
              { nombre: "Petrolera", tipo: "bar", datos: acum(pet) },
              { nombre: "No petrolera", tipo: "bar", datos: acum(noPet) },
              { nombre: "Precio promedio del crudo", eje: 1, punteada: true, color: colorSerie(3), datos: anios.map((a) => promedioAnio(cesta, a, mes)) },
            ],
          })}
          fuentes={[...fuentesDe(total, pet, noPet, cesta), { fuente: "calculado", nombre: "Acumulados y promedios del período" }]}
          cambioTipo={false}
        />
        <Grafica
          titulo="Balanza comercial mensual"
          subtitulo={`Millones de USD FOB, ${meses[0] ? etiquetaPeriodo(meses[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            etiquetas,
            rotar: true,
            series: [deSerie(pet, meses, { tipo: "bar", apilar: "bc" }), deSerie(noPet, meses, { tipo: "bar", apilar: "bc" }), deSerie(total, meses, { color: colorSerie(2) })],
          })}
          fuentes={fuentesDe(pet, noPet, total)}
          cambioTipo={false}
        />
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoBalanza({
                periodo: `enero y ${periodoEnTexto(fin)}`,
                total: acumuladoAnio(total, anio, mes) ?? 0,
                totalAnt: acumuladoAnio(total, anio - 1, mes),
                pet: acumuladoAnio(pet, anio, mes) ?? 0,
                noPet: acumuladoAnio(noPet, anio, mes) ?? 0,
                mes: periodoEnTexto(fin),
                mensual: valorEn(total, fin) ?? 0,
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroBalanza = () => (
  <HojaMacro titulo="Balanza comercial petrolera y no petrolera" subtitulo="Entorno macroeconómico · sector externo" cuadros={["IEM323", "IEM412B"]}>
    {(c) => <Balanza c={c} />}
  </HojaMacro>
);
