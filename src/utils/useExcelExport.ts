import { useCallback, useState } from "react";
import FileSaver from "file-saver";
import { interopDefault } from "@/utils/interop";
import { devError } from "@/utils/devLog";
import { swalError } from "@/utils/swalAlert";
import { excelCabecera } from "@/design/tokens";

// `file-saver` es CommonJS: en Node no expone `saveAs` como export con nombre.
const { saveAs } = interopDefault(FileSaver);

/**
 * Exportacion a Excel con `exceljs` (§7).
 *
 * `exceljs` pesa bastante, asi que se carga con `import()` dinamico: no entra
 * en el bundle inicial, solo cuando el usuario pulsa Exportar.
 */

export interface ExcelColumn<T> {
  /** Encabezado que se ve en la hoja */
  header: string;
  /** Propiedad de la fila, o funcion para valores derivados */
  key: keyof T | ((row: T) => unknown);
  width?: number;
}

interface ExportOptions<T> {
  data: readonly T[];
  columns: ExcelColumn<T>[];
  /** Sin extension; se le agrega `.xlsx` */
  fileName: string;
  sheetName?: string;
}

// Paleta oficial (§3): la misma cabecera que `exportarExcel` de shared/analitica.
const HEADER_FILL = excelCabecera.relleno;

export const useExcelExport = <T,>() => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = useCallback(
    async ({ data, columns, fileName, sheetName = "Datos" }: ExportOptions<T>) => {
      setIsExporting(true);
      try {
        const ExcelJS = interopDefault(await import("exceljs"));
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(sheetName);

        sheet.columns = columns.map((column, index) => ({
          header: column.header,
          key: String(index),
          width: column.width ?? 20,
        }));

        data.forEach((row) => {
          sheet.addRow(
            columns.map((column) =>
              typeof column.key === "function"
                ? column.key(row)
                : (row[column.key] as unknown)
            )
          );
        });

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: excelCabecera.texto } };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: HEADER_FILL },
        };

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
          new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          `${fileName}.xlsx`
        );
      } catch (e) {
        devError("[excel] fallo la exportacion:", e);
        await swalError(
          "No se pudo exportar",
          "Ocurrio un error al generar el archivo de Excel."
        );
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return { exportToExcel, isExporting };
};

export default useExcelExport;
