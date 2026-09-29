/** Ancla de una sección de la página de una pieza (`#tarjeta-grafica-api`). */
export const idSeccion = (
  id: string,
  seccion: "uso" | "ejemplos" | "playground" | "api",
) => `${id}-${seccion}`;
