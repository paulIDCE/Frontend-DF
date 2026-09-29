import { COLOR_ROL, colorLegible } from "@/design/colorRol";

/**
 * Color de un KPI por lo que SIGNIFICA la cifra. Es un subconjunto de `COLOR_ROL`
 * (`src/design/colorRol.ts`): las claves son roles, no colores; si cambia el token, cambian todos
 * los KPIs. `KpiCard` acepta directamente el nombre del rol (`color="riesgo"`).
 */
export const COLOR_KPI = {
  monto: COLOR_ROL.monto,
  riesgo: COLOR_ROL.riesgo,
  bueno: COLOR_ROL.bueno,
  malo: COLOR_ROL.malo,
  neutro: COLOR_ROL.neutro,
};

/**
 * Los colores de datos (p. ej. el amarillo #ffe600 de un nivel de riesgo) no se leen como texto
 * sobre blanco: se oscurecen. Vive en `design/colorRol.ts`; se reexporta aquí por compatibilidad.
 */
export { colorLegible };
