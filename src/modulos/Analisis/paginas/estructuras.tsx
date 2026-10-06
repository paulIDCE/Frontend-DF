import { useRevista } from "../RevistaContext";
import { PanelAnalisis, Seccion, Var } from "../componentes";
import { AnalisisEstructura } from "../analisisTexto";
import { fmt, variacion, pct } from "../datos";
import PaginaEstructura, { type ConfigEstructura } from "./PaginaEstructura";

/**
 * Hojas 3, 4, 6, 7 y 8 — configuracion tomada de prueba-data `analisis.js`
 * (`renderEstructuraActivoPage`, `renderImproductivoPage`,
 * `renderEstructuraPasivoPage`, `renderEstructuraExigiblePage`,
 * `renderEstructuraCostoPage`) y de su marcado en `analisis.html`.
 */

// Otros activos (190x) comunes a las tablas de activo productivo e improductivo.
const OTROS_ACTIVOS = [
  { code: "@1901", name: "1901. Inversiones en acciones y participaciones", nivel: 3 },
  { code: "@190205", name: "190205. Inversiones", nivel: 3 },
  { code: "@190210", name: "190210. Cartera de créditos por vencer", nivel: 3 },
  { code: "@190215", name: "190215. Cartera de créditos refinanciada por vencer", nivel: 3 },
  { code: "@190220", name: "190220. Cartera de créditos reestructurada por vencer", nivel: 3 },
  { code: "@190240", name: "190240. Deudores por aceptación", nivel: 3 },
  { code: "@190250", name: "190250. Bienes Realizables", nivel: 3 },
  { code: "@190280", name: "190280. Inversiones en acciones y participaciones", nivel: 3 },
  { code: "@190286", name: "190286. Fondos de liquidez", nivel: 3 },
  { code: "@1903", name: "1903. Otras inversiones en participaciones", nivel: 3 },
];

const BIENES = [
  { code: "@170105", name: "170105. Terrenos", nivel: 3 },
  { code: "@170110", name: "170110. Obras de Urbanización", nivel: 3 },
  { code: "@170115", name: "170115. Obras de Edificación", nivel: 3 },
];

/* ---------------------------- Hoja 3 ---------------------------- */
const ACTIVO_PRODUCTIVO: ConfigEstructura = {
  titulo: "ESTRUCTURA DEL ACTIVO PRODUCTIVO",
  subtitulo: "Análisis detallado de la composición del activo productivo",
  kpis: [
    { code: "@1103", titulo: "BANCOS Y OTRAS INSTITUCIONES FINANCIERAS" },
    { code: "@13", titulo: "INVERSIONES" },
    { code: "IF007", titulo: "CARTERA POR VENCER" },
  ],
  principal: { code: "SB010", titulo: "Activos Productivos" },
  cuentas: [
    { code: "@1103", name: "1103" },
    { code: "@12", name: "12" },
    { code: "@13", name: "13" },
    { code: "IF007", name: "Cartera" },
  ],
  historico: {
    titulo: "Evolución Histórica",
    series: [
      { code: "@1103", name: "1103. Bancos" },
      { code: "IF007", name: "Cartera por Vencer" },
      { code: "@13", name: "13. Inversiones" },
      { code: "@12", name: "12. Operaciones" },
    ],
  },
  tabla: [
    { code: "SB010", name: "ACTIVOS PRODUCTIVOS", nivel: 1 },
    { code: "@1103", name: "1103. Bancos y otras instituciones financieras", nivel: 2 },
    { code: "@12", name: "12. OPERACIONES INTERBANCARIAS", nivel: 2 },
    { code: "@13", name: "13. INVERSIONES", nivel: 2 },
    { code: "IF007", name: "CARTERA POR VENCER", nivel: 2 },
    ...BIENES,
    ...OTROS_ACTIVOS,
  ],
  analisis: (
    <AnalisisEstructura
      config={{
        principal: { code: "SB010", nombre: "Activos Productivos", articulo: "Los" },
        tendenciaEn: "en la composición del activo productivo",
        composicionTitulo: "Composición del Activo Productivo",
        componentes: [
          { code: "@1103", name: "Bancos" },
          { code: "@13", name: "Inversiones" },
          { code: "IF007", name: "Cartera por Vencer" },
        ],
        hallazgos: [
          { code: "@1103", name: "Bancos" },
          { code: "@12", name: "Operaciones Interbancarias" },
          { code: "@13", name: "Inversiones" },
          { code: "IF007", name: "Cartera por Vencer" },
        ],
        concentracion: {
          code: "IF007",
          frase: (p) => ({
            alta: (
              <>
                La <strong>Cartera por Vencer</strong> representa más del 50% del activo productivo ({p}%), indicando
                alta concentración en operaciones de crédito.
              </>
            ),
            baja: (
              <>
                La <strong>Cartera por Vencer</strong> representa menos del 30% del activo productivo ({p}%),
                sugiriendo diversificación en otras operaciones.
              </>
            ),
          }),
        },
        perspectiva: {
          sujeto: "El activo productivo",
          plural: false,
          expansion: "las operaciones de la entidad",
          estrategia: "colocación",
        },
      }}
    />
  ),
};

/* ---------------------------- Hoja 4 ---------------------------- */
const AnalisisImproductivo = () => {
  const { ctx } = useRevista();
  const sb004 = ctx.valor("SB004");
  const varAnual = variacion(sb004, ctx.valor("SB004", ctx.anioAnterior));
  const total = sb004 || 1;
  return (
    <PanelAnalisis>
      <Seccion tipo="resumen" titulo="Resumen General">
        {ctx.fila("SB003") && (
          <p>
            Los <strong>Activos Improductivos Brutos</strong> registran {fmt(ctx.valor("SB003"))} millones USD.
          </p>
        )}
        {ctx.fila("SB008") && (
          <p>
            Las <strong>Provisiones Totales</strong> ascienden a {fmt(ctx.valor("SB008"))} millones USD.
          </p>
        )}
        {ctx.fila("SB004") && (
          <p>
            💰 Los <strong>Activos Improductivos Netos</strong> son {fmt(sb004)} millones USD, con variación anual de{" "}
            <Var v={varAnual} invertir />.
          </p>
        )}
      </Seccion>
      <Seccion tipo="composicion" titulo="Composición">
        <ul>
          {[
            ["@11", "Fondos Disponibles"],
            ["@13", "Inversiones"],
            ["IF008", "Cartera No Devenga"],
            ["IF009", "Cartera Vencida"],
          ]
            .filter(([code]) => ctx.fila(code))
            .map(([code, nombre]) => (
              <li key={code}>
                <strong>{nombre}:</strong> {fmt(ctx.valor(code))} millones ({pct((ctx.valor(code) / total) * 100, 1)})
              </li>
            ))}
        </ul>
      </Seccion>
    </PanelAnalisis>
  );
};

const ACTIVO_IMPRODUCTIVO: ConfigEstructura = {
  titulo: "ESTRUCTURA DEL ACTIVO IMPRODUCTIVO",
  subtitulo: "Análisis detallado de la composición del activo improductivo",
  kpis: [
    { code: "SB003", titulo: "ACTIVOS IMPRODUCTIVOS BRUTOS" },
    { code: "SB008", titulo: "PROVISIONES TOTALES" },
    { code: "SB004", titulo: "ACTIVOS IMPRODUCTIVOS NETOS" },
  ],
  principal: { code: "SB004", titulo: "Activos Improductivos Netos" },
  cuentas: [
    { code: "@11", name: "Fondos Disp." },
    { code: "@13", name: "Inversiones" },
    { code: "IF008", name: "Cartera No Dev." },
    { code: "IF009", name: "Cartera Vencida" },
  ],
  historico: {
    titulo: "Evolución Histórica - Activos Improductivos",
    series: [
      { code: "@11", name: "Fondos Disponibles" },
      { code: "@13", name: "Inversiones" },
      { code: "IF008", name: "Cartera No Dev." },
      { code: "IF009", name: "Cartera Vencida" },
    ],
  },
  tabla: [
    { code: "SB003", name: "ACTIVOS IMPRODUCTIVOS BRUTOS", nivel: 1 },
    { code: "@11", name: "11. FONDOS DISPONIBLES", nivel: 2 },
    { code: "@13", name: "13. INVERSIONES", nivel: 2 },
    { code: "IF008", name: "CARTERA QUE NO DEVENGA INTERES", nivel: 2 },
    { code: "IF009", name: "CARTERA VENCIDA", nivel: 2 },
    { code: "@16", name: "16. CUENTAS POR COBRAR", nivel: 2 },
    { code: "@1699", name: "1699. (Provisión para cuentas por cobrar)", nivel: 3 },
    { code: "@17", name: "17. BIENES REALIZABLES, ADJUDICADOS POR PAGO...", nivel: 2 },
    ...BIENES,
    { code: "@1799", name: "1799. (Provisión para bienes realizables...)", nivel: 3 },
    { code: "@18", name: "18. PROPIEDADES Y EQUIPO", nivel: 2 },
    { code: "@19", name: "19. OTROS ACTIVOS", nivel: 2 },
    ...OTROS_ACTIVOS,
    { code: "@1999", name: "1999. (Provisión para otros activos irrecuperables)", nivel: 3 },
    { code: "SB008", name: "PROVISIONES", nivel: 1 },
    { code: "@1499", name: "1499. (PROVISIONES PARA CRÉDITOS INCOBRABLES)", nivel: 2 },
    { code: "@1699", name: "1699. (Provisión para cuentas por cobrar)", nivel: 2 },
    { code: "@1799", name: "1799. (Provisión para bienes realizables...)", nivel: 2 },
    { code: "@1999", name: "1999. (Provisión para otros activos irrecuperables)", nivel: 2 },
    { code: "SB004", name: "ACTIVOS IMPRODUCTIVOS NETOS", nivel: 1 },
  ],
  analisis: <AnalisisImproductivo />,
};

/* ---------------------------- Hoja 6 ---------------------------- */
const PASIVO: ConfigEstructura = {
  titulo: "ESTRUCTURA DEL PASIVO - OBLIGACIONES CON EL PÚBLICO",
  subtitulo: "Análisis detallado de la composición del pasivo",
  kpis: [
    { code: "@21", titulo: "OBLIGACIONES CON EL PÚBLICO" },
    { code: "@2103", titulo: "DEPÓSITOS A PLAZO" },
    { code: "@210135", titulo: "DEPÓSITOS DE AHORRO" },
  ],
  principal: { code: "@21", titulo: "Obligaciones con el Público" },
  cuentas: [
    { code: "@2101", name: "2101" },
    { code: "@2103", name: "2103" },
    { code: "@210135", name: "210135" },
    { code: "@22", name: "22" },
  ],
  historico: {
    titulo: "Evolución Histórica - Obligaciones con el Público",
    series: [
      { code: "@21", name: "Obligaciones con el Público" },
      { code: "@2101", name: "Depósitos a la vista" },
      { code: "@2103", name: "Depósitos a plazo" },
    ],
  },
  tabla: [
    { code: "@21", name: "21. OBLIGACIONES CON EL PÚBLICO", nivel: 1 },
    { code: "@2101", name: "2101. Depósitos a la vista", nivel: 2 },
    { code: "@210135", name: "210135. Depósitos de ahorro", nivel: 3 },
    { code: "@2102", name: "2102. Operaciones de reporto", nivel: 2 },
    { code: "@2103", name: "2103. Depósitos a plazo", nivel: 2 },
    { code: "@2104", name: "2104. Depósitos de garantía", nivel: 2 },
    { code: "@2105", name: "2105. Depósitos restringidos", nivel: 2 },
    { code: "@22", name: "22. OPERACIONES INTERBANCARIAS", nivel: 1 },
    { code: "@23", name: "23. OBLIGACIONES INMEDIATAS", nivel: 1 },
    { code: "@24", name: "24. ACEPTACIONES EN CIRCULACIÓN", nivel: 1 },
    { code: "@25", name: "25. CUENTAS POR PAGAR", nivel: 1 },
    { code: "@26", name: "26. OBLIGACIONES FINANCIERAS", nivel: 1 },
    { code: "@27", name: "27. VALORES EN CIRCULACIÓN", nivel: 1 },
    { code: "@28", name: "28. OBLIGACIONES CONVERTIBLES EN ACCIONES Y APORTES PARA FUTURA CAPITALIZACIÓN", nivel: 1 },
    { code: "@29", name: "29. OTROS PASIVOS", nivel: 1 },
  ],
  analisis: (
    <AnalisisEstructura
      config={{
        principal: { code: "@21", nombre: "Obligaciones con el Público", articulo: "Las" },
        tendenciaEn: "en la captación de recursos",
        composicionTitulo: "Composición del Pasivo",
        componentes: [
          { code: "@2101", name: "Depósitos a la vista" },
          { code: "@2103", name: "Depósitos a plazo" },
          { code: "@210135", name: "Depósitos de ahorro" },
        ],
        hallazgos: [
          { code: "@2101", name: "Depósitos a la vista" },
          { code: "@2103", name: "Depósitos a plazo" },
          { code: "@210135", name: "Depósitos de ahorro" },
          { code: "@22", name: "Operaciones Interbancarias" },
        ],
        concentracion: {
          code: "@2103",
          frase: (p) => ({
            alta: (
              <>
                Los <strong>Depósitos a plazo</strong> representan más del 50% de las obligaciones con el público ({p}%),
                indicando alta dependencia de recursos estables.
              </>
            ),
            baja: (
              <>
                Los <strong>Depósitos a plazo</strong> representan menos del 30% de las obligaciones con el público ({p}
                %), sugiriendo diversificación en fuentes de fondeo.
              </>
            ),
          }),
        },
        perspectiva: {
          sujeto: "Las obligaciones con el público",
          plural: true,
          expansion: "la captación de recursos",
          estrategia: "captación",
        },
      }}
    />
  ),
};

/* ---------------------------- Hoja 7 ---------------------------- */
const EXIGIBLES: ConfigEstructura = {
  titulo: "PASIVOS EXIGIBLES",
  subtitulo: "Análisis detallado de la composición de los pasivos exigibles",
  kpis: [
    { code: "SB002", titulo: "PASIVOS EXIGIBLES" },
    { code: "@210305", titulo: "DEPÓSITOS A PLAZO: 1 - 30 DÍAS" },
    { code: "@210325", titulo: "DEPÓSITOS A PLAZO: MÁS DE 361 DÍAS" },
  ],
  principal: { code: "SB002", titulo: "Pasivos Exigibles" },
  cuentasTitulo: "Distribución por Plazo",
  cuentas: [
    { code: "@210305", name: "210305" },
    { code: "@210310", name: "210310" },
    { code: "@210315", name: "210315" },
    { code: "@210320", name: "210320" },
    { code: "@210325", name: "210325" },
  ],
  historico: {
    titulo: "Evolución Histórica - Depósitos a plazo",
    series: [
      { code: "@2103", name: "Depósitos a plazo (total)", type: "line" },
      { code: "@210305", name: "1-30 días", type: "bar" },
      { code: "@210310", name: "31-90 días", type: "bar" },
      { code: "@210315", name: "91-180 días", type: "bar" },
      { code: "@210320", name: "181-360 días", type: "bar" },
      { code: "@210325", name: "Más de 361 días", type: "bar" },
    ],
  },
  tabla: [
    { code: "SB002", name: "PASIVOS EXIGIBLES", nivel: 1 },
    { code: "@2101", name: "2101. Depósitos a la vista", nivel: 2 },
    { code: "@210135", name: "210135. Depósitos de ahorro", nivel: 3 },
    { code: "@2102", name: "2102. Operaciones de reporto", nivel: 2 },
    { code: "@2103", name: "2103. Depósitos a plazo", nivel: 2 },
    { code: "@210305", name: "210305. De 1 a 30 días", nivel: 3 },
    { code: "@210310", name: "210310. De 31 a 90 días", nivel: 3 },
    { code: "@210315", name: "210315. De 91 a 180 días", nivel: 3 },
    { code: "@210320", name: "210320. De 181 a 360 días", nivel: 3 },
    { code: "@210325", name: "210325. De más de 361 días", nivel: 3 },
    { code: "@210330", name: "210330. Depósitos por confirmar", nivel: 3 },
    { code: "@2105", name: "2105. Depósitos restringidos", nivel: 2 },
    { code: "@2201", name: "2201. Fondos interbancarios comprados", nivel: 2 },
    { code: "@23", name: "23. OBLIGACIONES INMEDIATAS", nivel: 1 },
    { code: "@24", name: "24. ACEPTACIONES EN CIRCULACIÓN", nivel: 1 },
    { code: "@26", name: "26. OBLIGACIONES FINANCIERAS", nivel: 1 },
    { code: "@27", name: "27. VALORES EN CIRCULACIÓN", nivel: 1 },
    { code: "@2903", name: "2903. Fondos en administración", nivel: 2 },
  ],
  analisis: (
    <AnalisisEstructura
      config={{
        principal: { code: "SB002", nombre: "Pasivos Exigibles", articulo: "Los" },
        tendenciaEn: "en la captación de recursos exigibles",
        composicionTitulo: "Composición de Depósitos",
        componentes: [
          { code: "@2101", name: "Depósitos a la vista" },
          { code: "@2103", name: "Depósitos a plazo" },
        ],
        hallazgos: [],
        hallazgoExtra: (d) => {
          const corto = d("@210305");
          const largo = d("@210325");
          if (!corto || !largo || corto.actual <= 0 || largo.actual <= 0) return null;
          const ratio = corto.actual / largo.actual;
          if (ratio > 2)
            return (
              <p>
                Los <strong>depósitos a corto plazo (1-30 días)</strong> representan más del doble que los de largo
                plazo, indicando alta liquidez pero mayor volatilidad en la captación.
              </p>
            );
          if (ratio < 0.5)
            return (
              <p>
                Los <strong>depósitos a largo plazo (más de 361 días)</strong> predominan sobre los de corto plazo,
                indicando mayor estabilidad en la base de captación.
              </p>
            );
          return null;
        },
        perspectiva: {
          sujeto: "Los pasivos exigibles",
          plural: true,
          expansion: "la captación de recursos",
          estrategia: "captación",
        },
      }}
    />
  ),
};

/* ---------------------------- Hoja 8 ---------------------------- */
const COSTO: ConfigEstructura = {
  titulo: "PASIVOS CON COSTO",
  subtitulo: "Análisis detallado de la composición de los pasivos con costo",
  kpis: [
    { code: "SB007", titulo: "PASIVOS CON COSTO" },
    { code: "@2104", titulo: "DEPÓSITOS DE GARANTÍA" },
    { code: "@2105", titulo: "DEPÓSITOS RESTRINGIDOS" },
  ],
  principal: { code: "SB007", titulo: "Pasivos con Costo" },
  cuentas: [
    { code: "@22", name: "22" },
    { code: "@26", name: "26" },
    { code: "@27", name: "27" },
  ],
  historico: {
    // El original rotulaba este grafico "Depósitos a plazo" (copiado de la hoja 7).
    titulo: "Evolución Histórica - Pasivos con Costo",
    series: [{ code: "SB007", name: "Pasivos con Costo" }],
  },
  tabla: [
    { code: "SB007", name: "PASIVOS CON COSTO", nivel: 1 },
    { code: "@2101", name: "2101. Depósitos a la vista", nivel: 2 },
    { code: "@210110", name: "210110. Depósitos monetarios que no generan INTERESES", nivel: 3 },
    { code: "@210130", name: "210130. Cheques certificados", nivel: 3 },
    { code: "@210150", name: "210150. Depósitos por confirmar", nivel: 3 },
    { code: "@2102", name: "2102. Operaciones de reporto", nivel: 2 },
    { code: "@210210", name: "210210. Operaciones de reporto por confirmar", nivel: 3 },
    { code: "@2103", name: "2103. Depósitos a plazo", nivel: 2 },
    { code: "@210330", name: "210330. Depósitos por confirmar", nivel: 3 },
    { code: "@2104", name: "2104. Depósitos de garantía", nivel: 2 },
    { code: "@2105", name: "2105. Depósitos restringidos", nivel: 2 },
    { code: "@22", name: "22. OPERACIONES INTERBANCARIAS", nivel: 1 },
    { code: "@2203", name: "2203. Operaciones por confirmar", nivel: 2 },
    { code: "@26", name: "26. OBLIGACIONES FINANCIERAS", nivel: 1 },
    { code: "@27", name: "27. VALORES EN CIRCULACIÓN", nivel: 1 },
    { code: "@2790", name: "2790. Prima o descuento en colocación de valores en circulación", nivel: 2 },
    { code: "@280105", name: "280105. Obligaciones convertibles en acciones", nivel: 2 },
    { code: "@2903", name: "2903. Fondos en administración", nivel: 2 },
  ],
  analisis: (
    <AnalisisEstructura
      config={{
        principal: { code: "SB007", nombre: "Pasivos con Costo", articulo: "Los" },
        tendenciaEn: "en la captación de recursos con costo",
        composicionTitulo: "Composición de Pasivos con Costo",
        componentes: [
          { code: "@2101", name: "Depósitos a la vista" },
          { code: "@2103", name: "Depósitos a plazo" },
          { code: "@2104", name: "Depósitos de garantía" },
          { code: "@2105", name: "Depósitos restringidos" },
        ],
        hallazgos: [
          { code: "@2101", name: "Depósitos a la vista" },
          { code: "@2103", name: "Depósitos a plazo" },
          { code: "@2104", name: "Depósitos de garantía" },
          { code: "@2105", name: "Depósitos restringidos" },
          { code: "@22", name: "Operaciones Interbancarias" },
          { code: "@26", name: "Obligaciones Financieras" },
          { code: "@27", name: "Valores en Circulación" },
        ],
        perspectiva: {
          sujeto: "Los pasivos con costo",
          plural: true,
          expansion: "la captación de recursos",
          estrategia: "captación",
        },
      }}
    />
  ),
};

export const Hoja3 = () => <PaginaEstructura c={ACTIVO_PRODUCTIVO} />;
export const Hoja4 = () => <PaginaEstructura c={ACTIVO_IMPRODUCTIVO} />;
export const Hoja6 = () => <PaginaEstructura c={PASIVO} />;
export const Hoja7 = () => <PaginaEstructura c={EXIGIBLES} />;
export const Hoja8 = () => <PaginaEstructura c={COSTO} />;
