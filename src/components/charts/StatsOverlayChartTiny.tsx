import { getSeriesStats } from "@/utils/MathOperation";
import formatter from "@/utils/formatter";
import FileSaver from "file-saver";
import { interopDefault } from "@/utils/interop";
import { excelCabecera } from "@/design/tokens";
import { ExcelBotonBarra } from "@/components/DownloadButtons";
import type { SerieEstadistica } from "./StatsOverlayChart";

// `file-saver` es CommonJS: en Node no expone `saveAs` como export con nombre.
const { saveAs } = interopDefault(FileSaver);

interface StatsOverlayProps {
  series: SerieEstadistica[];
  onClose: () => void;
  title?: string;
}

const StatsOverlayTiny = ({
  series,
  onClose,
  title = "Stats",
}: StatsOverlayProps) => {
  const allStats = series.map(s => ({
    name: s.name || 'Serie',
    format: s.unitType || 'number',
    data: getSeriesStats(s.data ?? [])
  }));

  const metricKeys = Object.keys(allStats[0]?.data || []) as string[];

  //////// EXPORTAR A EXCEL ////////
  const handleDownloadAll = async () => {
    // Carga diferida: exceljs no entra al bundle inicial (igual que `useExcelExport`).
    const ExcelJS = interopDefault(await import("exceljs"));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stats");

    // ===============================
    // 1️⃣ CREAR ENCABEZADOS DINÁMICOS
    // ===============================
    const headers = ["Métrica", ...allStats.map(s => s.name)];

    worksheet.addRow(headers);

    // ===============================
    // 2️⃣ ESTILO ENCABEZADO
    // ===============================
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

    // ===============================
    // 3️⃣ AGREGAR FILAS POR MÉTRICA
    // ===============================
    metricKeys.forEach((metric) => {
      const rowData = [
        metric,
        ...allStats.map((s) => {
          const val = s.data[metric];

          if (typeof val !== "number") return val ?? "-";
          if (metric === "Muestras (N)") return val;

          if (s.format === "percent" || metric.includes("(%)")) {
            return val / 100; // 👈 Excel maneja % como decimal
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

    // ===============================
    // 4️⃣ FORMATO NUMÉRICO POR COLUMNA
    // ===============================
    worksheet.columns.forEach((column, index) => {
      if (index === 0) {
        column.width = 30;
      } else {
        column.width = 18;
        column.numFmt = "0.00";
      }
    });

    // ===============================
    // 5️⃣ DESCARGAR ARCHIVO
    // ===============================
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "Estadísticas.xlsx"
    );
  };



  return (
    <div
      className="absolute inset-0 z-[10] bg-lienzo backdrop-blur-sm rounded-tarjeta p-1.5 flex flex-col"
    >
      {/* Header Minimalista */}
      <div className="flex items-center justify-between mb-1 border-b pb-1">
        <h3 className="text-rotulo font-bold text-tinta truncate pr-2">
          {title}
        </h3>

        <div className="flex items-center gap-2">
          <ExcelBotonBarra size="small" tooltip="Exportar estadísticas a Excel" onClick={handleDownloadAll} />

          {/* BOTÓN CERRAR */}
          <button
            onClick={onClose}
            className="text-tinta-tenue hover:text-error transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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


      {/* Contenedor de Tabla Ultra-Compacto */}
      <div className="grow overflow-auto rounded-marca border border-linea-sutil">
        <table className="w-full text-rotulo leading-tight">
          <thead className="bg-superficie-hundida text-tinta font-bold sticky top-0">
            <tr>
              <th className="px-1.5 py-1 text-left font-bold border-b">Métrica</th>
              {allStats.map((s, i) => (
                <th key={i} className="px-1 py-1 text-left font-bold border-b border-l border-linea/50">
                  {s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-linea-sutil">
            {metricKeys.map((metric) => (
              <tr key={metric} className="hover:bg-accion-sutil/40">
                <td className="px-1.5 py-1 font-medium text-tinta-tenue truncate max-w-[60px]">
                  {metric}
                </td>
                {allStats.map((s, i) => (
                  <td key={i} className="px-1 py-1 text-right font-mono border-l border-linea-sutil">
                    <span className={metric.includes("Total") || metric.includes("Promedio") ? "font-bold text-tinta" : "text-tinta"}>
                      {(() => {
                        const val = s.data[metric];
                        if (typeof val !== 'number') return val ?? '-';

                        if (metric === "Muestras (N)") return val;
                        if (s.format === 'money') return formatter.formatMoney(val);
                        if (s.format === 'percent' || metric.includes("(%)")) {
                          return `${val.toFixed(1)}%`;
                        }
                        // Usamos toFixed para ahorrar espacio horizontal vs toLocaleString
                        return val > 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(1);
                      })()}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsOverlayTiny;