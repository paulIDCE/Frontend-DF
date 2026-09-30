import { archivoEntidad } from "@/services/datosService";
import { apiCuadro, apiEntidades } from "@/services/apiDatos";
import { aCuadroCargado } from "@/services/adaptadores";
import type { CuadroCargado, TipoCuadro } from "@/modulos/Explorador/tipos";

/**
 * Carga de cuadros de Sistema Financiero y Tasas — porte de `loadTable`,
 * `loadTableEfi`, `loadBalancesTable(Efi)` y `loadCarteraTable(Efi)` de
 * prueba-data `sistema.js` / `tasas.js`. El filtrado por sector, entidad,
 * analisis y credito lo hace la API; aqui solo se eligen los parametros.
 */

export const SECTORES = [
  { value: "nacional", label: "Sistema Financiero Nacional (privado y eps)" },
  { value: "privado", label: "Sector Financiero Privado" },
  { value: "popular", label: "Sector Financiero Popular y Solidario" },
  { value: "grande", label: "Bancos Privados Grandes" },
  { value: "medianos", label: "Bancos Privados Medianos" },
  { value: "peque", label: "Bancos Privados Pequeños" },
  { value: "seg1", label: "Coop. Segmento 1" },
  { value: "seg2", label: "Coop. Segmento 2" },
  { value: "seg3", label: "Coop. Segmento 3" },
  { value: "mut", label: "Asociación Mutualistas de Ahorro y Crédito para la Vivienda" },
];

export const ANALISIS = [
  { value: "saldo", label: "Saldo Millones USD" },
  { value: "horizontal", label: "Análisis Horizontal (%)" },
  { value: "vertical", label: "Análisis Vertical (%)" },
];

/** El `value` es el id de credito de la API (`GET /api/catalogos`). */
export const CREDITOS = [
  { value: "total", label: "Cartera Total" },
  { value: "productivo", label: "Productivo" },
  { value: "consumo", label: "Consumo" },
  { value: "inmobiliario", label: "Inmobiliario" },
  { value: "vip", label: "Vivienda interés Público y Social" },
  { value: "educativo", label: "Educativo" },
  { value: "microcredito", label: "Microcrédito" },
];

export const ENTIDAD_INICIAL = "BP. AMAZONAS";

export interface Filtros {
  sector: string;
  entidad: string;
  analisis: string;
  credito: string;
}

/** Que controles aplican a cada tipo de cuadro. */
export const controlesDe = (tipo: TipoCuadro) => ({
  sector: !tipo.endsWith("Efi"),
  entidad: tipo.endsWith("Efi"),
  analisis: tipo.startsWith("balances"),
  credito: tipo.startsWith("cartera"),
});

export const cargarCuadroSistema = async (
  tipo: TipoCuadro,
  id: string,
  f: Filtros
): Promise<CuadroCargado> => {
  const c = controlesDe(tipo);
  const cuadro = await apiCuadro(id, {
    sector: c.sector ? f.sector : undefined,
    // La pantalla maneja el nombre ("BP. PICHINCHA"); la API, el id ("BP__PICHINCHA").
    entidad: c.entidad ? archivoEntidad(f.entidad) : undefined,
    analisis: c.analisis ? f.analisis : undefined,
    credito: c.credito ? f.credito : undefined,
  });
  return aCuadroCargado(cuadro);
};

export const cargarEntidades = async (): Promise<{ value: string; label: string }[]> =>
  (await apiEntidades()).map((e) => ({ value: e.nombre, label: e.nombre }));
