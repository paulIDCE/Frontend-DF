/**
 * Bandera de desarrollo (`VITE_DEVELOPMENT` en `.env`). Con `true` se ven las ayudas de
 * desarrollo: de donde sale cada dato (banda de origen, insignias BD / JSON / Mixto, marca por fila,
 * KPI y grafica, columna "Fuente" del Excel). Con `false` o sin definir no aparecen: para desplegar
 * basta apagarla, sin tocar el codigo.
 *
 * Vite solo pasa al navegador las variables con prefijo `VITE_`, y las lee al compilar: cambiarla
 * pide reiniciar `pnpm dev` o volver a construir.
 */
export const MODO_DESARROLLO = import.meta.env.VITE_DEVELOPMENT === "true";
