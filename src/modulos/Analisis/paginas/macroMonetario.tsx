import { FilaKpis } from "@idce/kit";
import { useRevista } from "../RevistaContext";
import { Grafica, TituloBloque } from "../componentes";
import { HojaMacro, KpiMacro, PanelLectura, Parrafos, TablaPeriodos, type FilaPeriodos } from "../macro/componentesMacro";
import {
  etiquetaPeriodo,
  fuentesDe,
  periodoAnterior,
  periodoEnTexto,
  serie,
  serieVariacion,
  sumaSeries,
  ultimoComun,
  valorEn,
  ventana,
  type Cuadros,
  type Serie,
} from "../macro/datosMacro";
import { categoriasDe, deSerie, opcionCategorias } from "../macro/opcionesMacro";
import { textoAgregados, textoCaptacionesCartera, textoPanoramas, textoReservas, textoSistemaBalances } from "../macro/textosMacro";
import { COLOR_RESTA, colorSerie } from "../opciones";

/**
 * Entorno macroeconomico — Sector monetario (maqueta "Entorno Macro 2"): reservas internacionales,
 * sistema de balances del BCE, agregados monetarios, captaciones y cartera, y panoramas del BCE y
 * de las OSD. La maqueta usa cifras semanales; la base del BCE es mensual, asi que las tablas
 * comparan los ultimos meses.
 */

const REJILLA = "grid grid-cols-1 gap-4 xl:grid-cols-2";

/** Diciembre del año anterior + los ultimos `n` meses (como los cuadros semanales del BCE). */
const cortesTabla = (fin: string | undefined, n = 3) => {
  if (!fin) return [];
  const dic = `${Number(fin.slice(0, 4)) - 1}-12`;
  const ultimos = Array.from({ length: n }, (_, i) => periodoAnterior(fin, n - 1 - i));
  return ultimos.includes(dic) ? ultimos : [dic, ...ultimos];
};

/* ------------------------- 43. Reservas internacionales ------------------------- */

const Reservas = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const s = (v: string, n?: string) => serie(c.IEM121, v, n);
  const ri = s("Reservas Internacionales (RI)", "Reservas internacionales");
  const divisas = s("1. Posicion neta", "Posición neta en divisas");
  const caja = s("1.1 Caja", "Caja en divisas");
  const depositos = s("1.2 Depositos", "Depósitos netos en bancos del exterior");
  const inversiones = s("1.3 Inversiones", "Inversiones, depósitos a plazo y títulos");
  const oro = s("2. Oro", "Oro");
  const deg = s("3. DEG", "DEG");
  const fmi = s("4. Posicion de reserva", "Posición de reserva en FMI");
  const fin = ultimoComun(ri);
  const meses = ventana(ri.periodos.filter((p) => p >= "2018-01"), fin, 200);
  const componentes = [caja, depositos, inversiones, oro, deg, fmi];
  const filas: FilaPeriodos[] = [
    { serie: divisas, nivel: 1 },
    { serie: caja, nivel: 3 },
    { serie: depositos, nivel: 3 },
    { serie: inversiones, nivel: 3 },
    { serie: oro, nivel: 1 },
    { serie: deg, nivel: 1 },
    { serie: fmi, nivel: 1 },
    { serie: ri, nivel: 1 },
  ];
  const mayor = fin ? [divisas, oro].sort((a, b) => (valorEn(b, fin) ?? 0) - (valorEn(a, fin) ?? 0))[0] : null;
  const dic = fin ? `${Number(fin.slice(0, 4)) - 1}-12` : undefined;
  const dif = (a: string | undefined) => {
    const x = valorEn(ri, fin);
    const y = valorEn(ri, a);
    return x === null || y === null ? null : x - y;
  };

  return (
    <>
      <FilaKpis columnas={3} className="mb-3">
        <KpiMacro titulo={`Reservas internacionales · ${fin ? etiquetaPeriodo(fin) : ""}`} valor={valorEn(ri, fin)} sufijo="M USD" variacion={fin ? valorEn(serieVariacion(ri, 1), fin) : null} etiquetaVariacion="frente al mes anterior" />
        <KpiMacro titulo="Posición neta en divisas" valor={valorEn(divisas, fin)} sufijo="M USD" variacion={fin ? valorEn(serieVariacion(divisas, 12), fin) : null} etiquetaVariacion="anual" />
        <KpiMacro titulo="Oro" valor={valorEn(oro, fin)} sufijo="M USD" variacion={fin ? valorEn(serieVariacion(oro, 12), fin) : null} etiquetaVariacion="anual" />
      </FilaKpis>
      <div className="flex flex-col gap-4">
        <section>
          <TituloBloque>Composición de las reservas internacionales</TituloBloque>
          <TablaPeriodos filas={filas} periodos={cortesTabla(fin)} />
        </section>
        <Grafica
          titulo="Evolución del saldo de las reservas internacionales"
          subtitulo={`Millones de USD, ${meses[0] ? etiquetaPeriodo(meses[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            etiquetas: false,
            visibles: 36,
            series: [...componentes.map((x) => deSerie(x, meses, { tipo: "bar" as const, apilar: "ri" })), deSerie(ri, meses, { color: colorSerie(7) })],
          })}
          fuentes={fuentesDe(ri, ...componentes)}
          alto={360}
          cambioTipo={false}
        />
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoReservas({
                mes: periodoEnTexto(fin),
                ri: valorEn(ri, fin) ?? 0,
                varMes: dif(periodoAnterior(fin, 1)),
                varAnio: dif(dic),
                mayor: mayor ? { nombre: mayor.nombre, valor: valorEn(mayor, fin) ?? 0 } : null,
              })}
            />
            {etiquetas && <p>Los valores de cada barra se ven al pasar el ratón: con seis componentes apilados, las etiquetas no caben.</p>}
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroReservas = () => (
  <HojaMacro titulo="Reservas internacionales" subtitulo="Entorno macroeconómico · sector monetario" cuadros={["IEM121"]}>
    {(c) => <Reservas c={c} />}
  </HojaMacro>
);

/* ------------------------- 44. Sistema de balances ------------------------- */

const SistemaBalances = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const p1 = serie(c.IEM124, { grupo: "PRIMER SISTEMA", variable: "Pasivo" }, "Pasivos primer sistema");
  const p2 = serie(c.IEM124, { grupo: "SEGUNDO SISTEMA", variable: "Pasivo" }, "Pasivos segundo sistema");
  const p3 = serie(c.IEM124, { grupo: "TERCER SISTEMA", variable: "Pasivo" }, "Pasivos tercer sistema");
  const ri = serie(c.IEM124, "Total reservas internacionales", "Reserva internacional");
  const fin = ultimoComun(ri, p1);
  const meses = ventana(ri.periodos.filter((p) => p >= "2018-01"), fin, 200);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Grafica
          titulo="Sistema de balances del BCE"
          subtitulo={`Millones de USD, ${meses[0] ? etiquetaPeriodo(meses[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            etiquetas,
            visibles: 36,
            series: [
              deSerie(p1, meses, { area: true, apilar: "pasivos" }),
              deSerie(p2, meses, { area: true, apilar: "pasivos" }),
              deSerie(p3, meses, { area: true, apilar: "pasivos" }),
              deSerie(ri, meses, { color: COLOR_RESTA }),
            ],
          })}
          fuentes={fuentesDe(p1, p2, p3, ri)}
          alto={380}
          cambioTipo={false}
        />
        <section className="flex flex-col gap-2 text-detalle leading-relaxed text-tinta-secundaria">
          <TituloBloque>Cómo se lee</TituloBloque>
          <p className="m-0">
            <strong>Primer sistema:</strong> especies monetarias en circulación y depósitos de las otras sociedades de depósito (bancos, mutualistas,
            cooperativas). Se cubren al 100% con reservas internacionales.
          </p>
          <p className="m-0">
            <strong>Segundo sistema:</strong> depósitos de otras entidades financieras (CFN, BIESS y otras públicas e intermediarios).
          </p>
          <p className="m-0">
            <strong>Tercer sistema:</strong> depósitos del sector público no financiero y de personas jurídicas autorizadas.
          </p>
          <p className="m-0">
            <strong>Cuarto sistema:</strong> el resto de cuentas del activo y del pasivo del BCE, incluido el patrimonio.
          </p>
        </section>
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoSistemaBalances({
                mes: periodoEnTexto(fin),
                ri: valorEn(ri, fin) ?? 0,
                p1: valorEn(p1, fin) ?? 0,
                p2: valorEn(p2, fin) ?? 0,
                p3: valorEn(p3, fin) ?? 0,
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroSistemaBalances = () => (
  <HojaMacro titulo="Sistema de balances del BCE" subtitulo="Entorno macroeconómico · sector monetario" cuadros={["IEM124"]}>
    {(c) => <SistemaBalances c={c} />}
  </HojaMacro>
);

/* ------------------------- 45. Agregados monetarios ------------------------- */

const Agregados = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const m2 = serie(c.IEM111, "Liquidez Total M2", "Liquidez total (M2)");
  const m1 = serie(c.IEM111, "Oferta Monetaria M1", "Oferta monetaria (M1)");
  const emc = serie(c.IEM111, "Especies Monetarias", "Especies monetarias en circulación");
  const fin = ultimoComun(m2, m1);
  const meses = ventana(m2.periodos.filter((p) => p >= "2020-01"), fin, 200);
  const tasa = (s: Serie) => serieVariacion(s, 12, s.nombre);
  const t2 = tasa(m2);
  const t1 = tasa(m1);
  const te = tasa(emc);

  return (
    <>
      <div className={REJILLA}>
        <Grafica
          titulo="Oferta monetaria (M1) y liquidez total (M2)"
          subtitulo={`Millones de USD, ${meses[0] ? etiquetaPeriodo(meses[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            etiquetas,
            visibles: 36,
            series: [deSerie(m2, meses, { area: true }), deSerie(m1, meses, { area: true }), deSerie(emc, meses, { area: true })],
          })}
          fuentes={fuentesDe(m2, m1, emc)}
        />
        <Grafica
          titulo="Agregados monetarios"
          subtitulo="Tasa de variación anual"
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "%",
            etiquetas,
            visibles: 36,
            series: [deSerie(t2, meses, { punteada: true }), deSerie(t1, meses), deSerie(te, meses)],
          })}
          fuentes={fuentesDe(t2, t1, te)}
        />
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoAgregados({
                mes: periodoEnTexto(fin),
                m2: valorEn(m2, fin) ?? 0,
                m1: valorEn(m1, fin) ?? 0,
                emc: valorEn(emc, fin) ?? 0,
                tM2: valorEn(t2, fin),
                tM1: valorEn(t1, fin),
                tEmc: valorEn(te, fin),
              })}
            />
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroAgregados = () => (
  <HojaMacro titulo="Principales agregados monetarios" subtitulo="Entorno macroeconómico · sector monetario" cuadros={["IEM111"]}>
    {(c) => <Agregados c={c} />}
  </HojaMacro>
);

/* ------------------------- 46. Captaciones y cartera ------------------------- */

const CaptacionesCartera = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  // Sector privado: otras sociedades no financieras (empresas) y otros sectores residentes (hogares).
  const vistaEmp = serie(c.IEM112, { variable: "Otras sociedades no financieras", tras: ["Depositos a la Vista"] }, "Vista empresas");
  const vistaHog = serie(c.IEM112, { variable: "Otros sectores residentes", tras: ["Depositos a la Vista"] }, "Vista hogares");
  const cuasiEmp = serie(c.IEM112, { variable: "Otras sociedades no financieras", tras: ["Cuasidinero"] }, "Cuasidinero empresas");
  const cuasiHog = serie(c.IEM112, { variable: "Otros sectores residentes", tras: ["Cuasidinero"] }, "Cuasidinero hogares");
  const capHog = sumaSeries("Captaciones hogares", vistaHog, cuasiHog);
  const capEmp = sumaSeries("Captaciones empresas", vistaEmp, cuasiEmp);
  const capTotal = sumaSeries("Captaciones totales", capHog, capEmp);
  const tCap = serieVariacion(capTotal, 12, "Tasa de variación anual");
  const carEmp = serie(c.IEM112, "Por vencer (empresas)", "Cartera por vencer empresas");
  const carHog = serie(c.IEM112, "Por vencer (hogares)", "Cartera por vencer hogares");
  const carTotal = sumaSeries("Cartera por vencer", carEmp, carHog);
  const tCar = serieVariacion(carTotal, 12, "Tasa de variación anual");
  const fin = ultimoComun(vistaHog, carHog);
  const meses = ventana(vistaHog.periodos.filter((p) => p >= "2020-01"), fin, 200);
  const sub = `Millones de USD y porcentaje, ${meses[0] ? etiquetaPeriodo(meses[0]) : ""}-${fin ? etiquetaPeriodo(fin) : ""}`;

  return (
    <>
      <div className={REJILLA}>
        <Grafica
          titulo="Captaciones del sistema financiero"
          subtitulo={sub}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            der: "%",
            etiquetas,
            visibles: 36,
            series: [
              deSerie(capHog, meses, { area: true, apilar: "cap" }),
              deSerie(capEmp, meses, { area: true, apilar: "cap" }),
              deSerie(tCap, meses, { eje: 1, color: colorSerie(3) }),
            ],
          })}
          fuentes={fuentesDe(vistaHog, cuasiHog, vistaEmp, cuasiEmp, capHog, tCap)}
        />
        <Grafica
          titulo="Cartera por vencer del sistema financiero"
          subtitulo={sub}
          option={opcionCategorias({
            categorias: categoriasDe(meses),
            izq: "musd",
            der: "%",
            etiquetas,
            visibles: 36,
            series: [
              deSerie(carHog, meses, { area: true, apilar: "car" }),
              deSerie(carEmp, meses, { area: true, apilar: "car" }),
              deSerie(tCar, meses, { eje: 1, color: colorSerie(3) }),
            ],
          })}
          fuentes={fuentesDe(carHog, carEmp, tCar)}
        />
      </div>
      {fin && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(fin)}>
            <Parrafos
              textos={textoCaptacionesCartera({
                mes: periodoEnTexto(fin),
                captaciones: valorEn(capTotal, fin) ?? 0,
                tCap: valorEn(tCap, fin),
                cartera: valorEn(carTotal, fin) ?? 0,
                tCar: valorEn(tCar, fin),
              })}
            />
            <p>Empresas: otras sociedades no financieras; hogares: otros sectores residentes (panorama financiero del BCE, IEM112).</p>
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroCaptaciones = () => (
  <HojaMacro titulo="Captaciones y cartera por vencer del sistema financiero" subtitulo="Entorno macroeconómico · sector monetario · empresas y hogares" cuadros={["IEM112"]}>
    {(c) => <CaptacionesCartera c={c} />}
  </HojaMacro>
);

/* ------------------------------ 47. Panoramas ------------------------------ */

const Panoramas = ({ c }: { c: Cuadros }) => {
  const { etiquetas } = useRevista();
  const b = (v: string, n: string) => serie(c.IEM122, v, n);
  const aen = b("I. ACTIVOS EXTERNOS NETOS", "Activos externos netos");
  const ain = b("II. ACTIVOS INTERNOS NETOS", "Activos internos netos");
  const pasivos = b("III. PASIVOS MONETARIOS", "Pasivos monetarios y otras obligaciones");
  const filasBce: FilaPeriodos[] = [
    { serie: aen, nivel: 1 },
    { serie: b("a. Reservas internacionales", "Reservas internacionales"), nivel: 2 },
    { serie: ain, nivel: 1 },
    { serie: b("c. Credito interno", "Crédito interno"), nivel: 2 },
    { serie: b("c.1 Credito neto al gobierno central", "Crédito neto al gobierno central"), nivel: 3 },
    { serie: b("c.2 Credito a los gobiernos", "Crédito a los gobiernos provinciales y locales"), nivel: 3 },
    { serie: b("c.3 Credito neto fondos", "Crédito neto fondos de seguridad social"), nivel: 3 },
    { serie: b("c.4 Credito al sistema financiero", "Crédito al sistema financiero"), nivel: 3 },
    { serie: b("c.5 Credito al sector privado", "Crédito al sector privado"), nivel: 3 },
    { serie: pasivos, nivel: 1 },
    { serie: b("e. Pasivos monetarios", "Pasivos monetarios"), nivel: 2 },
    { serie: b("f. Otras obligaciones", "Otras obligaciones del BCE"), nivel: 2 },
  ];
  const o = (v: string, n: string) => serie(c.IEM131, v, n);
  const vista = o("f.1 Depositos a la vista", "Depósitos a la vista");
  const cuasi = o("f.2 Cuasidinero", "Cuasidinero");
  const filasOsd: FilaPeriodos[] = [
    { serie: o("I. ACTIVOS EXTERNOS NETOS", "Activos externos netos"), nivel: 1 },
    { serie: o("II. ACTIVOS INTERNOS NETOS", "Activos internos netos"), nivel: 1 },
    { serie: o("c. Credito interno", "Crédito interno"), nivel: 2 },
    { serie: o("c.7 Credito al sector privado", "Crédito al sector privado (empresas y hogares)"), nivel: 3 },
    { serie: o("III. PASIVOS FINANCIEROS", "Pasivos financieros"), nivel: 1 },
    { serie: vista, nivel: 2 },
    { serie: cuasi, nivel: 2 },
    { serie: o("f.2.1 Depositos de ahorro", "Depósitos de ahorro"), nivel: 3 },
    { serie: o("f.2.2 Depositos a plazo", "Depósitos a plazo fijo"), nivel: 3 },
  ];
  const componentesVista = [
    o("f.1.1 Sociedades publicas", "Sociedades públicas no financieras"),
    o("f.1.2 Gobiernos provinciales", "Gobiernos provinciales y locales"),
    o("f.1.3 Otras sociedades", "Otras sociedades no financieras"),
    o("f.1.4 Otros sectores", "Otros sectores residentes"),
  ];
  const componentesCuasi = [
    o("f.2.1 Depositos de ahorro", "Depósitos de ahorro"),
    o("f.2.2 Depositos a plazo", "Depósitos a plazo fijo"),
    o("f.2.3 Depositos restringidos", "Depósitos restringidos"),
    o("f.2.4 Operaciones de reporto", "Operaciones de reporto"),
    o("f.2.5 Otros depositos", "Otros depósitos"),
  ];
  const finB = ultimoComun(aen);
  const finO = ultimoComun(vista);
  const mesesAen = ventana(aen.periodos, finB, 7);
  const cambio = (s: Serie) => {
    const a = valorEn(s, finO);
    const x = finO ? valorEn(s, periodoAnterior(finO, 1)) : null;
    return a === null || x === null ? null : a - x;
  };
  const barrasVar = (lista: Serie[]) =>
    opcionCategorias({
      categorias: lista.map((s) => s.nombre),
      izq: "musd",
      etiquetas,
      rotar: true,
      series: [{ nombre: "Variación mensual", tipo: "bar", datos: lista.map(cambio) }],
    });

  return (
    <>
      <div className="flex flex-col gap-4">
        <section>
          <TituloBloque>Panorama del Banco Central del Ecuador</TituloBloque>
          <TablaPeriodos filas={filasBce} periodos={cortesTabla(finB)} />
        </section>
        <div className={REJILLA}>
          <Grafica
            titulo="Activos externos netos del BCE"
            subtitulo="Saldos en millones de USD"
            option={opcionCategorias({ categorias: categoriasDe(mesesAen), izq: "musd", etiquetas: true, series: [deSerie(aen, mesesAen, { tipo: "bar" })] })}
            fuentes={fuentesDe(aen)}
            alto={280}
          />
          <section>
            <TituloBloque>Panorama de las otras sociedades de depósito (OSD)</TituloBloque>
            <TablaPeriodos filas={filasOsd} periodos={cortesTabla(finO, 2)} />
          </section>
        </div>
        <div className={REJILLA}>
          <Grafica
            titulo={`Variación mensual de los depósitos a la vista, ${finO ? etiquetaPeriodo(finO) : ""}`}
            subtitulo="Otras sociedades de depósito, millones de USD"
            option={barrasVar(componentesVista)}
            fuentes={fuentesDe(...componentesVista)}
            alto={300}
            cambioTipo={false}
          />
          <Grafica
            titulo={`Variación mensual del cuasidinero, ${finO ? etiquetaPeriodo(finO) : ""}`}
            subtitulo="Otras sociedades de depósito, millones de USD"
            option={barrasVar(componentesCuasi)}
            fuentes={fuentesDe(...componentesCuasi)}
            alto={300}
            cambioTipo={false}
          />
        </div>
      </div>
      {finB && (
        <div className="mt-4">
          <PanelLectura periodo={etiquetaPeriodo(finB)}>
            <Parrafos
              textos={textoPanoramas({
                mes: periodoEnTexto(finB),
                aen: valorEn(aen, finB) ?? 0,
                ain: valorEn(ain, finB) ?? 0,
                pasivos: valorEn(pasivos, finB) ?? 0,
                vista: cambio(vista),
                cuasi: cambio(cuasi),
              })}
            />
            <p>La maqueta compara semanas; la base del BCE tiene saldos mensuales, así que la tabla compara diciembre del año anterior y los últimos meses.</p>
          </PanelLectura>
        </div>
      )}
    </>
  );
};

export const HojaMacroPanoramas = () => (
  <HojaMacro titulo="Panorama del BCE y de las otras sociedades de depósito" subtitulo="Entorno macroeconómico · sector monetario · saldos en millones de USD" cuadros={["IEM122", "IEM131"]}>
    {(c) => <Panoramas c={c} />}
  </HojaMacro>
);
