/** Opcion elegida en un filtro de catalogo: el ID va a los endpoints de datos, el nombre a los que filtran por nombre. */
export interface OpcionFiltro {
  id: number;
  nombre: string;
}

/** Filtros opcionales de una vista: cada clave es un catalogo, `null` = sin filtrar. */
export type OpcionesFiltro = Record<string, OpcionFiltro | null>;

/** Opcion de un selector de cortes: `value` es el `fechaCorteID`. */
export interface OpcionCorte {
  value: number;
  label: string;
}

/**
 * Resultado de validar el borrador de filtros. Los **errores** impiden Filtrar (la consulta no
 * tendria sentido o el backend la rechazaria); los **avisos** dejan consultar pero explican que se
 * va a ver. Las claves de `errores` son las de los campos, para marcar cada control en rojo.
 */
export interface ResultadoValidacion<C extends string = string> {
  errores: Partial<Record<C | "general", string>>;
  avisos: string[];
  valido: boolean;
}
