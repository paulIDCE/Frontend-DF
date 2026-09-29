export interface Provincia {
  provinciaID: number;
  codigo: string;
  nombre: string;
  paisIso2: string;
  region: string;
  peso: number;
  /** "A" activo / "I" inactivo */
  estado: string;
}

/** Valores del formulario: al crear todavia no hay `provinciaID`. */
export type ProvinciaFormValues = Omit<Provincia, "provinciaID">;
