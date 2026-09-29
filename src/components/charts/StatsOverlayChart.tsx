import React from "react";
import { getSeriesStats } from "@/utils/MathOperation";
import formatter from "@/utils/formatter";
import FileSaver from "file-saver";
import { interopDefault } from "@/utils/interop";
import { excelCabecera } from "@/design/tokens";
import { ExcelBotonBarra } from "@/components/DownloadButtons";

// `file-saver` es CommonJS: en Node no expone `saveAs` como export con nombre.
const { saveAs } = interopDefault(FileSaver);

/** Lo que se lee de cada serie de `getOption().series`: `unitType` es un campo propio ("money" | "percent"). */
export interface SerieEstadistica {
  name?: string;
  unitType?: string;
  data?: unknown[];
}

interface StatsOverlayProps {
  series: SerieEstadistica[];
  onClose: () => void;
  title?: string;
}

const StatsOverlay = ({
  series,
  onClose,
  title = "Estadísticas",
}: StatsOverlayProps) => {

  const allStats = series.map(s => ({
    name: s.name || 'Serie',
    format: s.unitType || 'number',
    data: getSeriesStats(s.data ?? [])
  }));

  const metricKeys = Object.keys(allStats[0]?.data || []) as string[];

  // Definimos dónde queremos poner separadores
  const sections: Record<string, string> = {
    "Muestras (N)": "Volumen y Totales",
    Promedio: "Tendencia Central",
    "Valor Mínimo": "Distribución y Cuartiles",
    "Desv. Estándar": "Análisis de Dispersión",
  };

  /////// EXPORTAR A EXCEL ////////
  const handleDownloadAll = async () => {
    // Carga diferida: exceljs no entra al bundle inicial (igual que `useExcelExport`).
    const ExcelJS = interopDefault(await import("exceljs"));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Estadísticas");

    // =========================
    // 1️⃣ ENCABEZADOS DINÁMICOS
    // =========================
    const headers = ["Métrica", ...allStats.map(s => s.name)];
    worksheet.addRow(headers);

    // Estilo encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: excelCabecera.relleno },
      };
      cell.font = {
        color: { argb: excelCabecera.texto },
        bold: true,
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // =========================
    // 2️⃣ FILAS CON SECCIONES
    // =========================
    metricKeys.forEach((metric) => {

      // 🔹 Insertar sección si corresponde
      if (sections[metric]) {
        const sectionRow = worksheet.addRow([sections[metric]]);
        worksheet.mergeCells(
          sectionRow.number,
          1,
          sectionRow.number,
          allStats.length + 1
        );

        sectionRow.font = { bold: true };
        sectionRow.alignment = { horizontal: "left" };
      }

      // 🔹 Construir fila normal
      const rowData = [
        metric,
        ...allStats.map((s) => {
          const val = s.data[metric];

          if (typeof val !== "number") return val ?? "-";
          if (metric === "Muestras (N)") return val;

          if (s.format === "percent" || metric.includes("(%)")) {
            return val / 100; // Excel maneja % como decimal
          }

          return val;
        }),
      ];

      const row = worksheet.addRow(rowData);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // =========================
    // 3️⃣ FORMATO DE COLUMNAS
    // =========================
    worksheet.columns.forEach((column, index) => {
      if (index === 0) {
        column.width = 32;
      } else {
        column.width = 18;
        column.numFmt = "0.00";
      }
    });

    // =========================
    // 4️⃣ CONGELAR ENCABEZADO
    // =========================
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // =========================
    // 5️⃣ DESCARGAR
    // =========================
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${title}.xlsx`
    );
  };




  return (
    <div
      className="absolute inset-0 z-[10] bg-superficie/95 backdrop-blur-sm p-4 flex flex-col"
      style={{ margin: "1px", marginTop: "10px" }} // Evita tapar los bordes del contenedor padre
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-subtitulo font-bold text-tinta flex items-center gap-2">
          <span className="w-1 h-6 bg-accion-borde rounded-full"></span>
          {title}
        </h3>

        <div className="flex items-center gap-2">

          <ExcelBotonBarra tooltip="Exportar estadísticas a Excel" onClick={handleDownloadAll} />

          {/* BOTÓN CERRAR */}
          <button
            onClick={onClose}
            className="text-tinta-tenue hover:text-tinta-secundaria p-2 rounded-full hover:bg-superficie-hundida transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grow overflow-auto border border-linea rounded-contenedor shadow-tarjeta">
        <table className="w-full divide-y divide-linea text-cuerpo">
          <thead className="bg-superficie-hundida text-tinta font-bold">
            <tr>
              <th className="px-4 py-2 text-left font-bold  uppercase tracking-wider border-b">
                Métrica
              </th>
              {allStats.map((s, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-center font-bold  border-b border-l border-linea-sutil"
                >
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-superficie divide-y divide-linea text-tinta">
            {metricKeys.map((metric) => (
              <React.Fragment key={metric}>
                {/* SI LA MÉTRICA ES EL INICIO DE UNA SECCIÓN, RENDERIZAMOS UN SUBHEADER */}
                {sections[metric] && (
                  <tr className="bg-superficie-hundida/50">
                    <td
                      colSpan={allStats.length + 1}
                      className="px-2 py-1.5 text-rotulo font-black uppercase tracking-widest text-tinta-tenue"
                    >
                      {sections[metric]}
                    </td>
                  </tr>
                )}

                <tr className="hover:bg-accion-sutil/30 transition-colors border-b border-linea-sutil">
                  <td className="px-4 py-1.5 font-medium text-tinta-secundaria">
                    {metric}
                  </td>
                  {allStats.map((s, i) => (
                    <td key={i} className="px-2 py-1.5 text-center font-mono border-l border-linea-sutil">
                      <span className={metric.includes("Total") || metric.includes("Promedio") ? "font-bold text-tinta" : "text-tinta"}>
                        {(() => {
                          const val = s.data[metric];
                          if (typeof val !== 'number') return val ?? '-';

                          // Lógica de Formateo basada en Metadatos
                          if (metric === "Muestras (N)") return val.toLocaleString();

                          if (s.format === 'money') return formatter.formatMoney(val);

                          if (s.format === 'percent' || metric.includes("(%)")) {
                            return `${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}%`;
                          }

                          return val.toLocaleString(undefined, { minimumFractionDigits: 2 });
                        })()}
                      </span>
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsOverlay;
