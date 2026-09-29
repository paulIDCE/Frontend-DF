/**
 * Logging silencioso fuera de desarrollo.
 *
 * §7 prohibe `console.log` crudo en codigo de produccion. Usa estas funciones
 * en su lugar: en un build de produccion no emiten nada.
 */

const isDev = import.meta.env.DEV;

/* eslint-disable no-console */

export const devLog = (...args: unknown[]): void => {
  if (isDev) console.log(...args);
};

export const devWarn = (...args: unknown[]): void => {
  if (isDev) console.warn(...args);
};

export const devError = (...args: unknown[]): void => {
  if (isDev) console.error(...args);
};

export const devTable = (data: unknown): void => {
  if (isDev) console.table(data);
};

export const devGroupStart = (label: string): void => {
  if (isDev) console.group(label);
};

export const devGroupCollapsed = (label: string): void => {
  if (isDev) console.groupCollapsed(label);
};

export const devGroupEnd = (): void => {
  if (isDev) console.groupEnd();
};

/**
 * Agrupa varios logs bajo una etiqueta colapsable.
 *
 * @example
 * devGroup("Provincias cargadas", () => {
 *   devTable(provincias);
 *   devLog("total:", provincias.length);
 * });
 */
export const devGroup = (label: string, fn: () => void): void => {
  if (!isDev) return;
  console.groupCollapsed(label);
  try {
    fn();
  } finally {
    console.groupEnd();
  }
};

/* eslint-enable no-console */

export default devLog;
