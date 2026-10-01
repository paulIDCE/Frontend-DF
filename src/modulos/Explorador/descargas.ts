import type { CuadroCargado } from "./tipos";

/**
 * CSV de la tabla con los periodos que se ven (filtro Desde–Hasta). El Excel lo ofrece la propia
 * tabla (`TablaAnalitica` con `excel`), con la jerarquia agrupada.
 */

export const nombreDescarga = (cuadro: CuadroCargado) =>
  `${cuadro.id}${cuadro.sectorNombre ? `_${cuadro.sectorNombre}` : ""}_datos`;

export const descargarCsv = (cuadro: CuadroCargado, periodos: string[]) => {
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
  a.download = `${nombreDescarga(cuadro)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
