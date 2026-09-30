/** Clase de color para una variacion (verde sube, rojo baja). */
export const claseVar = (v: number) => (v > 0 ? "text-exito" : v < 0 ? "text-error" : "text-tinta-tenue");
