import type { Content, TableCell, TDocumentDefinitions, TVirtualFileSystem } from "pdfmake/interfaces";
import type { GraficoInforme, InformeEstructurado, KpiInforme, TablaInforme } from "@/services/agenteService";
import { color } from "@idce/kit";
import type { ImagenGrafico } from "./imagenesGraficos";
import { COLOR_SEMAFORO_DOC, FILAS_TABLA_INDIVISIBLE, deltaKpi, fuenteInforme, interopDefault, pt, subtituloInforme, valorKpi } from "./contenido";

/**
 * Informe de Kipu en PDF con `pdfmake`, descarga directa (sin el dialogo de impresion). Reglas de
 * paginacion:
 * - cada grafico va con su titulo en un bloque `unbreakable`: nunca se parte;
 * - las filas de tabla no se parten (`dontBreakRows`), la cabecera se repite en cada pagina y las
 *   tablas cortas pasan enteras a la pagina siguiente;
 * - conclusion y KPI son bloques indivisibles;
 * - un titulo de seccion se pega a su primer bloque y, si aun asi quedara solo al pie, salta.
 *
 * `pdfmake` y sus fuentes (Roboto) se cargan con `import()` dinamico: pesan ~1 MB.
 */

/** A4 con margenes de 40 pt: 595 − 80. */
const ANCHO_UTIL = 515;

const lineasFinas = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => color.linea.fuerte,
  vLineColor: () => color.linea.fuerte,
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 2.5,
  paddingBottom: () => 2.5,
};

const tituloSeccion = (texto: string): Content => ({
  stack: [
    { text: texto, style: "seccion" },
    { canvas: [{ type: "line", x1: 0, y1: 0, x2: ANCHO_UTIL, y2: 0, lineWidth: 1.5, lineColor: color.identidad.base }] },
  ],
  margin: [0, 14, 0, 6],
  headlineLevel: 1,
});

const bloqueGrafico = (g: GraficoInforme, img: ImagenGrafico | undefined): Content => ({
  stack: [
    {
      text: [{ text: g.titulo, bold: true }, ...(g.unidad ? [{ text: ` · ${g.unidad}`, color: color.tinta.secundaria, fontSize: pt("detalle") }] : [])],
      fontSize: pt("cuerpo"),
      margin: [0, 0, 0, 4],
    },
    ...(img ? [{ image: img.png, width: Math.min(ANCHO_UTIL, img.ancho), alignment: "center" as const }] : []),
  ],
  unbreakable: true,
  margin: [0, 4, 0, 10],
});

const bloqueTabla = (t: TablaInforme): Content => {
  const cabecera: TableCell[] = t.cols.map((c) => ({ text: c, style: "cabeceraTabla" }));
  const filas: TableCell[][] = t.rows.map((fila, i) => {
    const yo = t.yo?.includes(i);
    const med = t.med?.includes(i);
    return fila.map((c, j) => ({
      text: c,
      alignment: j === 0 ? ("left" as const) : ("right" as const),
      bold: yo,
      italics: med,
      color: med ? color.tinta.secundaria : undefined,
      fillColor: yo ? color.accion.sutil : med ? color.superficie.sutil : undefined,
    }));
  });
  const tabla: Content = {
    table: {
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: 1,
      widths: t.cols.map((_, j) => (j === 0 ? "*" : "auto")),
      body: [cabecera, ...filas],
    },
    layout: lineasFinas,
    fontSize: pt("detalle"),
    margin: [0, 2, 0, 10],
  };
  return t.rows.length <= FILAS_TABLA_INDIVISIBLE ? { stack: [tabla], unbreakable: true } : tabla;
};

const bloqueKpis = (kpis: KpiInforme[], comparadoCon: string): Content => {
  const porFila = Math.min(4, kpis.length);
  const filas: TableCell[][] = [];
  for (let i = 0; i < kpis.length; i += porFila) {
    const fila: TableCell[] = kpis.slice(i, i + porFila).map((k) => {
      const delta = deltaKpi(k, comparadoCon);
      return {
        stack: [
          { text: k.titulo, fontSize: pt("rotulo"), color: color.tinta.secundaria },
          { text: valorKpi(k), fontSize: pt("titulo"), bold: true, color: color.accion.base, margin: [0, 2, 0, 2] },
          ...(delta ? [{ text: delta.texto, fontSize: pt("rotulo"), color: delta.tono }] : []),
        ],
      };
    });
    while (fila.length < porFila) fila.push({ text: "", border: [false, false, false, false] });
    filas.push(fila);
  }
  return {
    table: { widths: Array(porFila).fill("*"), body: filas, dontBreakRows: true },
    layout: { ...lineasFinas, paddingLeft: () => 7, paddingRight: () => 7, paddingTop: () => 6, paddingBottom: () => 6 },
    unbreakable: true,
    margin: [0, 0, 0, 6],
  };
};

const definicion = (informe: InformeEstructurado, imagenes: Map<GraficoInforme, ImagenGrafico>): TDocumentDefinitions => {
  const contenido: Content[] = [
    { text: informe.titulo, style: "titulo" },
    { text: subtituloInforme(informe), fontSize: pt("detalle"), color: color.tinta.secundaria, margin: [0, 2, 0, 12] },
    {
      // Recuadro de la conclusion: celda con franja izquierda de identidad.
      table: {
        widths: ["*"],
        body: [
          [
            {
              stack: [
                ...(informe.semaforo ? [{ text: informe.semaforo.color, bold: true, color: COLOR_SEMAFORO_DOC[informe.semaforo.nivel], margin: [0, 0, 0, 3] as [number, number, number, number] }] : []),
                { text: informe.conclusion, alignment: "justify" as const },
                ...(informe.semaforo ? [{ text: `Semáforo: ${informe.semaforo.motivo}`, fontSize: pt("rotulo"), color: color.tinta.tenue, margin: [0, 4, 0, 0] as [number, number, number, number] }] : []),
              ],
              fillColor: color.identidad.sutil,
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: (i) => (i === 0 ? 3 : 0),
        vLineColor: () => color.identidad.base,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 8,
        paddingBottom: () => 8,
      },
      unbreakable: true,
      margin: [0, 0, 0, 12],
    },
  ];

  if (informe.kpis.length) contenido.push(bloqueKpis(informe.kpis, informe.comparado_con));

  informe.secciones.forEach((s, i) => {
    const bloques: Content[] = [
      ...s.graficos.map((g) => bloqueGrafico(g, imagenes.get(g))),
      ...(s.texto ? [{ text: s.texto, alignment: "justify" as const, margin: [0, 0, 0, 8] as [number, number, number, number] }] : []),
      ...s.tablas.map(bloqueTabla),
    ];
    const titulo = tituloSeccion(`${i + 1}. ${s.titulo}`);
    // El titulo viaja con su primer bloque si este es indivisible (grafico, tabla corta o texto);
    // con una tabla larga lo cubre `pageBreakBefore`.
    const [primero, ...resto] = bloques;
    const primeroIndivisible = primero && !(primero as { table?: unknown }).table;
    contenido.push(...(primeroIndivisible ? [{ stack: [titulo, primero], unbreakable: true }, ...resto] : [titulo, ...bloques]));
  });

  if (informe.alertas.length) {
    contenido.push({
      stack: [
        tituloSeccion(`${informe.secciones.length + 1}. Alertas y recomendaciones`),
        { ul: informe.alertas.map((a) => ({ text: a, margin: [0, 0, 0, 3] as [number, number, number, number] })) },
      ],
      // Las alertas suelen ser pocas: van juntas; si no caben en una pagina, fluyen.
      unbreakable: informe.alertas.length <= 8,
    });
  }

  contenido.push({
    stack: [
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: ANCHO_UTIL, y2: 0, lineWidth: 0.5, lineColor: color.linea.base }], margin: [0, 14, 0, 4] },
      ...(informe.notas.length ? [{ text: `Notas: ${informe.notas.join(" · ")}`, margin: [0, 0, 0, 2] as [number, number, number, number] }] : []),
      { text: fuenteInforme(informe.corte) },
    ],
    fontSize: pt("rotulo"),
    color: color.tinta.tenue,
    unbreakable: true,
  });

  return {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 44],
    info: { title: informe.titulo, author: "Kipu · IDCE Consulting", subject: subtituloInforme(informe) },
    defaultStyle: { font: "Roboto", fontSize: pt("cuerpo"), color: color.tinta.base, lineHeight: 1.2 },
    styles: {
      titulo: { fontSize: pt("cifra"), bold: true, color: color.identidad.base },
      seccion: { fontSize: pt("subtitulo"), bold: true, color: color.identidad.base, margin: [0, 0, 0, 3] },
      cabeceraTabla: { bold: true, color: color.tinta.inversa, fillColor: color.identidad.base, alignment: "center" },
    },
    footer: (pagina, total) => ({
      columns: [
        { text: `${informe.entidad} · Corte ${informe.corte}`, alignment: "left" },
        { text: `Página ${pagina} de ${total}`, alignment: "right", width: "auto" },
      ],
      fontSize: pt("rotulo"),
      color: color.tinta.tenue,
      margin: [40, 14, 40, 0],
    }),
    // Un titulo nunca queda como lo ultimo de la pagina.
    pageBreakBefore: (nodo, consultas) => nodo.headlineLevel === 1 && consultas.getFollowingNodesOnPage().length === 0,
    content: contenido,
  };
};

export const exportarPdf = async (
  informe: InformeEstructurado,
  imagenes: Map<GraficoInforme, ImagenGrafico>,
  nombreArchivo: string,
): Promise<void> => {
  const pdfMake = interopDefault(await import("pdfmake/build/pdfmake"));
  // El `default` de vfs_fonts (CommonJS) llega envuelto o no segun el entorno.
  const vfs = interopDefault((await import("pdfmake/build/vfs_fonts")) as unknown as TVirtualFileSystem);
  pdfMake.addVirtualFileSystem(vfs);
  await pdfMake.createPdf(definicion(informe, imagenes)).download(`${nombreArchivo}.pdf`);
};
