import { createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { OrigenDatos } from "@/config/app";

/**
 * Origen de los datos de la pantalla actual, para `AvisoOrigenDatos`.
 *
 * Por defecto vale el `origen` de la pantalla en `PANTALLAS`; las pantallas cuyo origen depende de
 * lo que se muestra (los exploradores de cuadros) lo reportan con `useReportarOrigen`.
 *
 * Fuente: BackendDF con `Datos:Sql:Habilitado = true` (05/10/2026). Ningun endpoint es 100 % SQL
 * (orden de filas, titulos y catalogo de entidades salen siempre del JSON), asi que hoy no hay
 * pantalla en `bd`. "Mixto" = los saldos de las cuentas @NNNN vienen de SQL y el resto del JSON.
 */

export interface Reportado {
  ruta: string;
  origen: OrigenDatos;
}

type Ctx = [Reportado | null, (r: Reportado | null) => void];

/** Lo provee `OrigenDatosProvider` (en `AppShell`). */
export const OrigenDatosContext = createContext<Ctx>([null, () => {}]);

/** Origen reportado para la ruta actual (o `undefined` si la pantalla no reporto nada). */
export const useOrigenReportado = (): OrigenDatos | undefined => {
  const [reportado] = useContext(OrigenDatosContext);
  const { pathname } = useLocation();
  return reportado?.ruta === pathname ? reportado.origen : undefined;
};

/** La pantalla informa el origen de lo que esta mostrando. */
export const useReportarOrigen = (origen: OrigenDatos) => {
  const [, reportar] = useContext(OrigenDatosContext);
  const { pathname } = useLocation();
  useEffect(() => {
    reportar({ ruta: pathname, origen });
    return () => reportar(null);
  }, [reportar, pathname, origen]);
};

/** Cuadros con filas de cuenta @NNNN servidas desde SQL (el resto de filas, del JSON). */
const CUADROS_MIXTOS = new Set(["EFI01", "SFN01", "EFI02", "SFN02", "EFI05", "EFI07", "EFI10"]);

/**
 * Origen de `GET /api/cuadros/{id}`. EFI06 / SFN06 solo traen SQL en el analisis "saldo"
 * (horizontal y vertical salen del JSON). Los demas cuadros (macro BCE, anualizados, fuentes y
 * usos, indicadores, CAMELS, PERLAS, cartera, tasas, SFN05/07/08) son JSON.
 */
export const origenCuadro = (id: string, analisis?: string): OrigenDatos => {
  if (id === "EFI06" || id === "SFN06") return analisis === "saldo" ? "mixto" : "json";
  return CUADROS_MIXTOS.has(id) ? "mixto" : "json";
};
