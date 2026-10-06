import { archivoEntidad } from "@/services/datosService";
import { apiCuadro, apiEntidades, apiReporte } from "@/services/apiDatos";
import { aFilasReporte } from "@/services/adaptadores";
import type { FilaReporte } from "./datos";
import { agregarDerivados } from "./derivados";

/**
 * Entidades y reportes de la revista. Los rankings (hojas 5, 9, 24-26) y el
 * comparativo (hoja 31) ya no barren los 229 reportes: la API calcula el
 * ranking y lista las entidades con su tamaño, rango y provincia.
 */

export interface EntidadLista {
  /** Nombre visible (`BP. AMAZONAS`): es lo que manejan las pantallas. */
  id: string;
  nombre: string;
  /** Id de la API (`BP__AMAZONAS`). */
  archivo: string;
  tamano: string;
  rango: string;
  provincia: string;
}

const DESCONOCIDO = "Desconocido";

export const cargarListaEntidades = async (): Promise<EntidadLista[]> =>
  (await apiEntidades()).map((e) => ({
    id: e.nombre,
    nombre: e.nombre,
    archivo: e.id,
    tamano: e.tamano ?? DESCONOCIDO,
    rango: e.rango ?? DESCONOCIDO,
    provincia: e.provincia ?? DESCONOCIDO,
  }));

/** Reporte completo de la entidad (cuadro REP01) en la forma ancha de siempre, con los indicadores derivados. */
export const cargarReporte = async (entidad: string): Promise<FilaReporte[]> =>
  agregarDerivados(aFilasReporte(await apiReporte(archivoEntidad(entidad))));

/** Balance en arbol CUC de la entidad (`EFI06`, saldos). La API cachea la peticion: auditoria y castigos la comparten. */
export const cargarBalanceEFI06 = (entidad: string) => apiCuadro("EFI06", { entidad: archivoEntidad(entidad), analisis: "saldo" });

export const infoDe = (filas: FilaReporte[]) => ({
  tamano: String(filas[0]?.Tamaño ?? DESCONOCIDO),
  rango: String(filas[0]?.Rango_Activos ?? DESCONOCIDO),
  provincia: String(filas[0]?.DPA_PR ?? DESCONOCIDO),
});
