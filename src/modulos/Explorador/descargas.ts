import { exportarExcel, type ColumnaExcel } from "@idce/kit";
import type { CuadroCargado, FilaCuadro } from "./tipos";
import { etiquetaPeriodo, numero, unionPeriodos } from "./datos";

/**
 * Descarga de la tabla completa (todos los periodos, no solo los visibles),
 * igual que `descargarTabla` de prueba-data. Excel pasa de `.xls` HTML a
 * `.xlsx` real con `exportarExcel` del kit.
 */

export const descargarExcel = (cuadro: CuadroCargado) => {
  const periodos = unionPeriodos(cuadro.filas);
  const columnas: ColumnaExcel<FilaCuadro>[] = [
    { titulo: "Grupo", valor: (f) => f.Grupo ?? "", ancho: 28 },
    { titulo: "Variable", valor: (f) => f.Variable ?? "", ancho: 48 },
    ...periodos.map<ColumnaExcel<FilaCuadro>>((p) => ({
      titulo: etiquetaPeriodo(p),
      valor: (f) => numero(f[p]),
      ancho: 12,
    })),
  ];
  const sufijo = cuadro.sectorNombre ? `_${cuadro.sectorNombre}` : "";
  return exportarExcel(`${cuadro.id}${sufijo}_datos`, [
    { nombre: cuadro.titulo || cuadro.id, columnas, filas: cuadro.filas },
  ]);
};

export const descargarCsv = (cuadro: CuadroCargado) => {
  const periodos = unionPeriodos(cuadro.filas);
  const celda = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  let csv = "﻿"; // BOM: Excel reconoce UTF-8
  csv += `Cuadro: ${cuadro.titulo}\n`;
  if (cuadro.unidad) csv += `Unidad: ${cuadro.unidad}\n`;
  if (cuadro.sectorNombre) csv += `Sector: ${cuadro.sectorNombre}\n`;
  csv += "\n";
  csv += ["Grupo", "Variable", ...periodos].map(celda).join(",") + "\n";
  cuadro.filas.forEach((f) => {
    csv += [f.Grupo, f.Variable, ...periodos.map((p) => f[p])].map(celda).join(",") + "\n";
  });

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cuadro.id}_datos.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
