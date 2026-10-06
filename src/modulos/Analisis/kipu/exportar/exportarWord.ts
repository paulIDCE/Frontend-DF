import type { InformeEstructurado, KpiInforme, TablaInforme } from "@/services/agenteService";
import { color } from "@idce/kit";
import type { ImagenGrafico } from "./imagenesGraficos";
import type { GraficoInforme } from "@/services/agenteService";
import {
  COLOR_SEMAFORO_DOC,
  FILAS_TABLA_INDIVISIBLE,
  deltaKpi,
  fuenteInforme,
  pt,
  saveAs,
  subtituloInforme,
  valorKpi,
} from "./contenido";

/**
 * Informe de Kipu en Word (.docx) con `docx`. Reglas de paginacion:
 * - los graficos son imagenes en linea (Word nunca las parte) y van pegados a su titulo (`keepNext`);
 * - las filas de tabla no se parten (`cantSplit`) y la cabecera se repite en cada pagina;
 * - las tablas cortas, los KPI y la conclusion se mantienen enteros (`keepNext` en sus filas);
 * - los titulos de seccion nunca quedan solos al pie (`keepNext`).
 *
 * `docx` se carga con `import()` dinamico: solo hace falta al pulsar Descargar.
 */

/** A4 con margenes de 2 cm, en twips (1 cm = 567). */
const PAGINA = { ancho: 11906, alto: 16838, margen: 1134 };
/** Ancho util en px (96 dpi) para las imagenes: (11906 - 2·1134) twips / 15. */
const ANCHO_UTIL_PX = Math.floor((PAGINA.ancho - 2 * PAGINA.margen) / 15);

/** Tamaño de letra de `docx`: medios puntos. */
const medios = (rol: Parameters<typeof pt>[0]) => Math.round(pt(rol) * 2);

const hex = (c: string) => c.replace("#", "").toUpperCase();

const base64ABytes = (dataUrl: string) => {
  const binario = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
};

export const exportarWord = async (
  informe: InformeEstructurado,
  imagenes: Map<GraficoInforme, ImagenGrafico>,
  nombreArchivo: string,
): Promise<void> => {
  const d = await import("docx");
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    HeadingLevel,
    ImageRun,
    Packer,
    PageNumber,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType,
  } = d;

  const SIN_BORDE = { style: BorderStyle.NONE, size: 0, color: "auto" } as const;
  const LINEA = { style: BorderStyle.SINGLE, size: 4, color: hex(color.linea.base) } as const;
  const bordes = (b: typeof LINEA | typeof SIN_BORDE) => ({ top: b, bottom: b, left: b, right: b });
  const relleno = (c: string) => ({ type: ShadingType.CLEAR, color: "auto", fill: hex(c) });

  type Hijo = InstanceType<typeof Paragraph> | InstanceType<typeof Table>;
  const cuerpo: Hijo[] = [];

  const titulo = (texto: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      keepNext: true,
      keepLines: true,
      spacing: { before: 320, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: hex(color.identidad.base), space: 2 } },
      children: [new TextRun({ text: texto, bold: true, size: medios("subtitulo"), color: hex(color.identidad.base) })],
    });

  // ---- Encabezado
  cuerpo.push(
    new Paragraph({
      keepNext: true,
      spacing: { after: 60 },
      children: [new TextRun({ text: informe.titulo, bold: true, size: medios("cifra"), color: hex(color.identidad.base) })],
    }),
    new Paragraph({
      keepNext: true,
      spacing: { after: 200 },
      children: [new TextRun({ text: subtituloInforme(informe), size: medios("detalle"), color: hex(color.tinta.secundaria) })],
    }),
  );

  // ---- Conclusion (recuadro con franja a la izquierda; una sola fila, no se parte)
  const conclusion: InstanceType<typeof Paragraph>[] = [];
  if (informe.semaforo) {
    conclusion.push(
      new Paragraph({
        keepNext: true,
        spacing: { after: 60 },
        children: [new TextRun({ text: informe.semaforo.color, bold: true, color: hex(COLOR_SEMAFORO_DOC[informe.semaforo.nivel]) })],
      }),
    );
  }
  conclusion.push(new Paragraph({ keepLines: true, children: [new TextRun(informe.conclusion)] }));
  if (informe.semaforo) {
    conclusion.push(
      new Paragraph({
        spacing: { before: 60 },
        children: [new TextRun({ text: `Semáforo: ${informe.semaforo.motivo}`, size: medios("rotulo"), color: hex(color.tinta.tenue) })],
      }),
    );
  }
  cuerpo.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // Sin esto Word dibuja el borde negro por defecto de la tabla alrededor del recuadro.
      borders: { ...bordes(SIN_BORDE), insideHorizontal: SIN_BORDE, insideVertical: SIN_BORDE },
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              shading: relleno(color.identidad.sutil),
              borders: { ...bordes(SIN_BORDE), left: { style: BorderStyle.SINGLE, size: 24, color: hex(color.identidad.base) } },
              margins: { top: 120, bottom: 120, left: 200, right: 200 },
              children: conclusion,
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  );

  // ---- KPIs: rejilla de hasta 4 por fila, toda junta
  if (informe.kpis.length) {
    const porFila = Math.min(4, informe.kpis.length);
    const filas: KpiInforme[][] = [];
    for (let i = 0; i < informe.kpis.length; i += porFila) filas.push(informe.kpis.slice(i, i + porFila));
    const celdaKpi = (k: KpiInforme | undefined, ultimaFila: boolean) => {
      const delta = k ? deltaKpi(k, informe.comparado_con) : null;
      const mantener = !ultimaFila;
      return new TableCell({
        width: { size: Math.floor(100 / porFila), type: WidthType.PERCENTAGE },
        borders: bordes(k ? LINEA : SIN_BORDE),
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        verticalAlign: VerticalAlign.TOP,
        children: k
          ? [
              new Paragraph({ keepNext: true, children: [new TextRun({ text: k.titulo, size: medios("rotulo"), color: hex(color.tinta.secundaria) })] }),
              new Paragraph({ keepNext: true, children: [new TextRun({ text: valorKpi(k), bold: true, size: medios("titulo"), color: hex(color.accion.base) })] }),
              new Paragraph({
                keepNext: mantener,
                children: delta ? [new TextRun({ text: delta.texto, size: medios("rotulo"), color: hex(delta.tono) })] : [],
              }),
            ]
          : [new Paragraph({ children: [] })],
      });
    };
    cuerpo.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: filas.map(
          (fila, i) =>
            new TableRow({
              cantSplit: true,
              children: Array.from({ length: porFila }, (_, j) => celdaKpi(fila[j], i === filas.length - 1)),
            }),
        ),
      }),
    );
  }

  // ---- Tablas de datos
  const tabla = (t: TablaInforme) => {
    const indivisible = t.rows.length <= FILAS_TABLA_INDIVISIBLE;
    const celda = (texto: string, j: number, opciones: { cabecera?: boolean; fondo?: string; negrita?: boolean; cursiva?: boolean; mantener: boolean }) =>
      new TableCell({
        borders: bordes(LINEA),
        shading: opciones.fondo ? relleno(opciones.fondo) : undefined,
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            keepNext: opciones.mantener,
            alignment: opciones.cabecera ? AlignmentType.CENTER : j === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: texto,
                size: medios("detalle"),
                bold: opciones.cabecera || opciones.negrita,
                italics: opciones.cursiva,
                color: opciones.cabecera ? hex(color.tinta.inversa) : opciones.cursiva ? hex(color.tinta.secundaria) : undefined,
              }),
            ],
          }),
        ],
      });
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: t.cols.map((c, j) => celda(c, j, { cabecera: true, fondo: color.identidad.base, mantener: true })),
        }),
        ...t.rows.map((fila, i) => {
          const yo = t.yo?.includes(i);
          const med = t.med?.includes(i);
          return new TableRow({
            cantSplit: true,
            children: fila.map((c, j) =>
              celda(c, j, {
                fondo: yo ? color.accion.sutil : med ? color.superficie.sutil : undefined,
                negrita: yo,
                cursiva: med,
                // Una tabla corta se mantiene entera; una larga, al menos la cabecera con su primera fila.
                mantener: indivisible ? i < t.rows.length - 1 : false,
              }),
            ),
          });
        }),
      ],
    });
  };

  // ---- Secciones
  informe.secciones.forEach((s, i) => {
    cuerpo.push(titulo(`${i + 1}. ${s.titulo}`));
    s.graficos.forEach((g) => {
      const img = imagenes.get(g);
      cuerpo.push(
        new Paragraph({
          keepNext: true,
          keepLines: true,
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({ text: g.titulo, bold: true, size: medios("cuerpo"), color: hex(color.tinta.base) }),
            ...(g.unidad ? [new TextRun({ text: ` · ${g.unidad}`, size: medios("detalle"), color: hex(color.tinta.secundaria) })] : []),
          ],
        }),
      );
      if (img) {
        const ancho = Math.min(ANCHO_UTIL_PX, img.ancho);
        cuerpo.push(
          new Paragraph({
            keepLines: true,
            spacing: { after: 160 },
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                type: "png",
                data: base64ABytes(img.png),
                transformation: { width: ancho, height: Math.round((img.alto * ancho) / img.ancho) },
                altText: { name: g.titulo, title: g.titulo, description: g.titulo },
              }),
            ],
          }),
        );
      }
    });
    if (s.texto) cuerpo.push(new Paragraph({ spacing: { before: 60, after: 120 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun(s.texto)] }));
    s.tablas.forEach((t) => {
      cuerpo.push(tabla(t), new Paragraph({ spacing: { after: 120 }, children: [] }));
    });
  });

  // ---- Alertas
  if (informe.alertas.length) {
    cuerpo.push(titulo(`${informe.secciones.length + 1}. Alertas y recomendaciones`));
    informe.alertas.forEach((a, i) =>
      cuerpo.push(
        new Paragraph({
          bullet: { level: 0 },
          keepLines: true,
          // La primera alerta va pegada al titulo; las demas fluyen.
          keepNext: i === 0 && informe.alertas.length > 1,
          spacing: { after: 60 },
          children: [new TextRun(a)],
        }),
      ),
    );
  }

  // ---- Notas y fuente
  cuerpo.push(
    new Paragraph({
      keepLines: true,
      spacing: { before: 240 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: hex(color.linea.base), space: 4 } },
      children: [
        ...(informe.notas.length ? [new TextRun({ text: `Notas: ${informe.notas.join(" · ")}`, size: medios("rotulo"), color: hex(color.tinta.tenue) })] : []),
        new TextRun({ text: fuenteInforme(informe.corte), size: medios("rotulo"), color: hex(color.tinta.tenue), ...(informe.notas.length ? { break: 1 } : {}) }),
      ],
    }),
  );

  const documento = new Document({
    creator: "Kipu · IDCE Consulting",
    title: informe.titulo,
    description: subtituloInforme(informe),
    styles: { default: { document: { run: { font: "Calibri", size: medios("cuerpo"), color: hex(color.tinta.base) }, paragraph: { spacing: { line: 276 } } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGINA.ancho, height: PAGINA.alto },
            margin: { top: PAGINA.margen, bottom: PAGINA.margen, left: PAGINA.margen, right: PAGINA.margen },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `${informe.entidad} · Corte ${informe.corte}    `, size: medios("rotulo"), color: hex(color.tinta.tenue) }),
                  new TextRun({ children: ["Página ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES], size: medios("rotulo"), color: hex(color.tinta.tenue) }),
                ],
              }),
            ],
          }),
        },
        children: cuerpo,
      },
    ],
  });

  const blob = await Packer.toBlob(documento);
  saveAs(blob, `${nombreArchivo}.docx`);
};
