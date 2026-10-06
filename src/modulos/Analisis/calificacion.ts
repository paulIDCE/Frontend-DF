/**
 * Calificacion A-E de los indicadores globales CAMELS / PERLAS (hoja 28 y resumen ejecutivo). Colores
 * por rol de estado (no el rojo del boton PDF, que identifica un formato y no un estado).
 */
export const calificacion = (v: number) =>
  v >= 80
    ? { letra: "A", texto: "A - Excelente", clase: "bg-exito" }
    : v >= 60
      ? { letra: "B", texto: "B - Muy Bueno", clase: "bg-accion" }
      : v >= 50
        ? { letra: "C", texto: "C - Saludable", clase: "bg-advertencia" }
        : v >= 40
          ? { letra: "D", texto: "D - Regular", clase: "bg-advertencia-activo" }
          : { letra: "E", texto: "E - Alto Riesgo", clase: "bg-error" };
