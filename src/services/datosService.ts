/**
 * `BP. PICHINCHA` -> `BP__PICHINCHA`: id de la entidad en la API (el mismo
 * nombre de archivo que usaba prueba-data). Las pantallas manejan el nombre
 * visible y lo convierten al llamar.
 */
export const archivoEntidad = (nombre: string): string =>
  nombre
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // marcas diacriticas (tildes) tras NFD
    .replace(/[^A-Za-z0-9]/g, "_");
