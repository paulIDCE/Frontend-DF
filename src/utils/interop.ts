/**
 * `default` de un paquete CommonJS, igual en Vite y en Node.
 *
 * Vite (navegador y build) desenvuelve el `default` de los paquetes CommonJS con `__esModule`;
 * el resolutor ESM de Node (Vitest sin `server.deps.inline`, scripts, SSR) no: entrega
 * `module.exports` entero, es decir `{ default: X }`. Sin esto el kit funciona en la app pero en
 * una prueba `ConfigProvider` recibe un locale vacio, `ReactECharts` no es un componente y
 * `exceljs` no tiene `Workbook`.
 *
 * Usar con `antd/locale/*`, `echarts-for-react`, `file-saver` y el `import()` de `exceljs`.
 * Interno: no se exporta en `src/lib.ts`.
 */
export const interopDefault = <T>(modulo: T): T => (modulo as { default?: T }).default ?? modulo;
