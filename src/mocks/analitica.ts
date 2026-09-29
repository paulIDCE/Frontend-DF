import { type NivelRiesgo, type OpcionCorte, type OpcionFiltro, fmtFechaStr, formatter } from "@idce/kit";

/**
 * Datos de ejemplo para las demos de `shared/analitica`. Son deterministas (senos, sin
 * `Math.random`) para que capturas y estadisticas no cambien entre recargas.
 */

export interface CorteMock {
  fechaCorte: string;
  fechaCorteID: number;
  saldo: number;
  /** En porcentaje (5.23), como lo esperan `nivelDe` y `franjasNiveles`. */
  mora: number;
  cobertura: number;
}

export interface OficinaMock {
  oficinaID: number;
  nombre: string;
  saldo: number;
  /** Fracciones relativas (0.052 = +5.2 %), como las pinta `CeldaSaldoVariacion`. */
  variacionMensual: number;
  variacionAnual: number;
  mora: number;
  cobertura: number;
  operaciones: number;
}

export const MOCK_NIVELES: NivelRiesgo[] = [
  { nombre: "Bajo", color: "#3cb371", rangoInicio: 0, rangoFin: 3 },
  { nombre: "Moderado", color: "#ffe600", rangoInicio: 3, rangoFin: 5 },
  { nombre: "Alto", color: "#ff962d", rangoInicio: 5, rangoFin: 8 },
  { nombre: "Crítico", color: "#ff0000", rangoInicio: 8, rangoFin: 100 },
].map((n, i) => ({
  ...n,
  nivelRiesgoID: i + 1,
  configuracionLimiteID: 1,
  descripcion: `Nivel ${n.nombre.toLowerCase()}`,
  fechaLog: "2026-01-01",
  estado: "A",
}));

/** Ultimo dia de cada mes, de oct-2023 a sep-2026 (36 cortes). */
export const MOCK_CORTES: CorteMock[] = Array.from({ length: 36 }, (_, i) => {
  const fecha = new Date(Date.UTC(2023, 9 + i + 1, 0, 12));
  const fechaCorte = fecha.toISOString().substring(0, 10);
  return {
    fechaCorte,
    fechaCorteID: formatter.transformToId(`${fechaCorte}T12:00:00`),
    saldo: 48_000_000 + i * 650_000 + Math.sin(i / 2) * 1_200_000,
    mora: Number((4.2 + Math.sin(i / 4) * 1.6 + (i > 28 ? (i - 28) * 0.35 : 0)).toFixed(2)),
    cobertura: Number((104 + Math.cos(i / 3) * 9 - (i > 28 ? (i - 28) * 1.5 : 0)).toFixed(2)),
  };
});

export const MOCK_OPCIONES_CORTE: OpcionCorte[] = MOCK_CORTES.map((c) => ({
  value: c.fechaCorteID,
  label: fmtFechaStr(`${c.fechaCorte}T12:00:00`, "MMM-yyyy"),
})).reverse();

const NOMBRES_OFICINA = ["Matriz", "Norte", "Sur", "Valle", "Costa", "Oriente", "Centro Histórico", "Aeropuerto"];

export const MOCK_OFICINAS: OficinaMock[] = NOMBRES_OFICINA.map((nombre, i) => ({
  oficinaID: i + 1,
  nombre,
  saldo: 9_500_000 - i * 950_000 + Math.sin(i) * 400_000,
  variacionMensual: Number((Math.sin(i * 1.7) * 0.04).toFixed(4)),
  variacionAnual: Number((Math.cos(i * 1.3) * 0.12).toFixed(4)),
  mora: Number((2.1 + i * 1.15 + Math.sin(i) * 0.6).toFixed(2)),
  cobertura: Number((128 - i * 6.5).toFixed(2)),
  operaciones: 1800 - i * 170,
}));

export const MOCK_CATALOGO_OFICINAS: OpcionFiltro[] = MOCK_OFICINAS.map((o) => ({ id: o.oficinaID, nombre: o.nombre }));

/**
 * Color que llega del backend (p. ej. el de un producto o catálogo configurado por el cliente).
 * Sirve para mostrar el color PROPIO de `KpiCard`, chips y `StatusTag`: vive aquí porque es un dato,
 * no un token (el verificador de tokens no revisa `src/mocks/`).
 */
export const MOCK_COLOR_CATALOGO = "#7c3aed";
