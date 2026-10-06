import type { Borders } from "exceljs";
import FileSaver from "file-saver";
import { interopDefault } from "@/utils/interop";
import { excelCabecera } from "@/design/tokens";

// `file-saver` es CommonJS: en Node no expone `saveAs` como export con nombre.
const { saveAs } = interopDefault(FileSaver);

export type FormatoExcel = "moneda" | "porcentaje" | "entero" | "texto";

export interface ColumnaExcel<T> {
  titulo: string;
  /** `esHijo` distingue las filas de desglose en las hojas padre-hijo. */
  valor: (fila: T, esHijo: boolean) => string | number | null | undefined;
  /** Los porcentajes se esperan ya en porcentaje (5.23), como los muestra la vista. */
  formato?: FormatoExcel;
  ancho?: number;
}

export interface HojaExcel<T> {
  nombre: string;
  columnas: ColumnaExcel<T>[];
  filas: T[];
  /** Filas de desglose que se escriben debajo de cada fila (la fila padre va en negrita). */
  hijos?: (fila: T) => T[];
  /**
   * Profundidad de la fila en un arbol (0 = raiz). Con ella Excel agrupa las filas (botones +/-) y
   * las que tienen hijos van en negrita.
   */
  nivel?: (fila: T) => number;
  /** Fila dentro de una rama contraida en pantalla: se escribe oculta (el grupo queda cerrado). */
  oculta?: (fila: T) => boolean;
}

const bordeFino: Partial<Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

const FORMATOS: Record<FormatoExcel, string | undefined> = {
  moneda: "$#,##0.00",
  porcentaje: '0.00"%"',
  entero: "#,##0",
  texto: undefined,
};

/** Excel no admite mas de 31 caracteres ni : \ / ? * [ ] en el nombre de la hoja. */
const nombreHojaValido = (nombre: string, usados: Set<string>): string => {
  const base = nombre.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Datos";
  let candidato = base;
  let i = 2;
  while (usados.has(candidato.toLowerCase())) {
    const sufijo = ` (${i++})`;
    candidato = base.slice(0, 31 - sufijo.length) + sufijo;
  }
  usados.add(candidato.toLowerCase());
  return candidato;
};

/**
 * Exportacion generica de la vista: una o varias hojas con el mismo estilo de cabecera que el
 * resto de exportaciones del sistema. Las columnas son las mismas definiciones que usa la tabla,
 * asi lo que se descarga coincide con lo que se ve.
 *
 * `exceljs` se carga con `import()` dinamico, como en `useExcelExport`: pesa demasiado para el
 * bundle inicial y solo hace falta cuando alguien pulsa Descargar.
 */
export const exportarExcel = async <T,>(nombreArchivo: string, hojas: HojaExcel<T>[]): Promise<void> => {
  const ExcelJS = interopDefault(await import("exceljs"));
  const workbook = new ExcelJS.Workbook();
  const usados = new Set<string>();

  hojas.forEach((hoja) => {
    const worksheet = workbook.addWorksheet(nombreHojaValido(hoja.nombre, usados));
    worksheet.columns = hoja.columnas.map((c) => ({ header: c.titulo, width: c.ancho ?? 18 }));

    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: excelCabecera.relleno } };
      cell.font = { color: { argb: excelCabecera.texto }, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = bordeFino;
    });

    const escribir = (fila: T, esHijo: boolean, resaltar: boolean) => {
      const row = worksheet.addRow(hoja.columnas.map((c) => c.valor(fila, esHijo) ?? null));
      const nivel = hoja.nivel?.(fila) ?? 0;
      if (nivel > 0) row.outlineLevel = Math.min(nivel, 7);
      if (hoja.oculta?.(fila)) row.hidden = true;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = bordeFino;
        const formato = FORMATOS[hoja.columnas[colNumber - 1]?.formato ?? "texto"];
        if (formato) cell.numFmt = formato;
        if (resaltar) {
          cell.font = { bold: true };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E6E6" } };
        }
      });
    };

    hoja.filas.forEach((fila, i) => {
      const hijos = hoja.hijos?.(fila) ?? [];
      // En un arbol, es padre la fila seguida de una mas profunda.
      const siguiente = hoja.filas[i + 1];
      const esPadre = !!hoja.nivel && !!siguiente && hoja.nivel(siguiente) > hoja.nivel(fila);
      escribir(fila, false, hijos.length > 0 || esPadre);
      hijos.forEach((hijo) => escribir(hijo, true, false));
    });
    // El +/- de cada grupo va en la fila padre (encima), como en la tabla.
    if (hoja.nivel) worksheet.properties.outlineProperties = { summaryBelow: false, summaryRight: false };

    worksheet.views = [{ state: "frozen", ySplit: 1 }];
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    nombreArchivo.endsWith(".xlsx") ? nombreArchivo : `${nombreArchivo}.xlsx`,
  );
};
