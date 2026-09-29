import { archivoEntidad, leerJson } from "@/services/datosService";
import { parrafos } from "@/modulos/Explorador/datos";
import type { CuadroCargado, FilaCuadro, TipoCuadro } from "@/modulos/Explorador/tipos";

/**
 * Carga de cuadros de Sistema Financiero y Tasas — porte de `loadTable`,
 * `loadTableEfi`, `loadBalancesTable(Efi)` y `loadCarteraTable(Efi)` de
 * prueba-data `sistema.js` / `tasas.js`, unificados por `TipoCuadro`.
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

/** El `value` es el texto exacto de la columna `ID` en los JSON. */
export const CREDITOS = [
  { value: "Cartera Total", label: "Cartera Total" },
  { value: "Productivo", label: "Productivo" },
  { value: "Consumo", label: "Consumo" },
  { value: "Inmobiliario", label: "Inmobiliario" },
  { value: "Vivienda interés Público y Social", label: "Vivienda interés Público y Social" },
  { value: "Educativo", label: "Educativo" },
  { value: "Microcrédito", label: "Microcrédito" },
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

const etiqueta = (lista: { value: string; label: string }[], valor: string) =>
  lista.find((o) => o.value === valor)?.label ?? valor;

/** `filtrarPorSector` del original: coincidencia exacta o por contenido. */
const deSector = (fila: FilaCuadro, sector: string) => {
  const buscado = etiqueta(SECTORES, sector);
  const filtro = String(fila.Filtro ?? "");
  return filtro === buscado || filtro.includes(buscado);
};

interface Nota {
  Cuadro: string;
  Notas: string;
}

const notasDe = async (id: string) =>
  (await leerJson<Nota[]>("base_notas.json").catch(() => [] as Nota[]))
    .filter((n) => n.Cuadro === id)
    .flatMap((n) => parrafos(n.Notas));

const datosEntidad = (carpeta: "entidades" | "balances", entidad: string) =>
  leerJson<FilaCuadro[]>(`${carpeta}/${archivoEntidad(entidad)}.json`);

export const cargarCuadroSistema = async (
  tipo: TipoCuadro,
  id: string,
  f: Filtros
): Promise<CuadroCargado> => {
  const c = controlesDe(tipo);
  let filas: FilaCuadro[];

  switch (tipo) {
    case "tabla":
      filas = (await leerJson<FilaCuadro[]>("base_estru_sistema.json")).filter(
        (r) => r.Cuadro === id && deSector(r, f.sector)
      );
      break;
    case "tablaEfi":
      filas = (await datosEntidad("entidades", f.entidad)).filter((r) => r.Cuadro === id);
      break;
    case "balances":
      filas = (await leerJson<FilaCuadro[]>("base_balances.json")).filter(
        (r) => r.Cuadro === id && r.ID === etiqueta(ANALISIS, f.analisis) && deSector(r, f.sector)
      );
      break;
    case "balancesEfi":
      filas = (await datosEntidad("balances", f.entidad)).filter(
        (r) => r.Cuadro === id && r.ID === etiqueta(ANALISIS, f.analisis)
      );
      break;
    case "cartera":
      filas = (await leerJson<FilaCuadro[]>("base_cartera.json")).filter(
        (r) => r.Cuadro === id && r.ID === f.credito && deSector(r, f.sector)
      );
      break;
    case "carteraEfi":
      filas = (await datosEntidad("entidades", f.entidad)).filter(
        (r) => r.Cuadro === id && r.ID === f.credito
      );
      break;
  }

  const partes = [
    c.sector ? etiqueta(SECTORES, f.sector) : f.entidad,
    c.analisis ? etiqueta(ANALISIS, f.analisis) : null,
    c.credito ? f.credito : null,
  ].filter(Boolean) as string[];

  const esBalance = c.analisis;
  const unidad = String(filas[0]?.Unidad ?? "");

  return {
    id,
    titulo: String(filas[0]?.Titulo_Cuadro ?? ""),
    unidad: [unidad, ...partes.slice(1), c.entidad ? f.entidad : null].filter(Boolean).join(" - "),
    filas,
    notas: esBalance ? [] : await notasDe(id),
    vista: esBalance ? "arbol" : "grupos",
    sector: partes.join("|"),
    sectorNombre: partes.join(" · "),
  };
};

export interface EntidadLista {
  id: string;
  nombre: string;
  archivo?: string;
}

export const cargarEntidades = async (): Promise<{ value: string; label: string }[]> =>
  (await leerJson<EntidadLista[]>("entidades_lista.json"))
    .map((e) => e.nombre)
    .sort((a, b) => a.localeCompare(b))
    .map((n) => ({ value: n, label: n }));
