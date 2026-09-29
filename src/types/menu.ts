/**
 * Nomenclatura del SSO: un **Modulo** agrupa varios **Menus**, y cada **Menu**
 * es una pagina/ruta. Son los nombres de las tablas del SSO, y los usamos igual
 * en el codigo y en la carpeta `src/modulos/<Modulo>/<Menu>.tsx`.
 */
export interface MenuByUserDTO {
  /** Modulo que agrupa este menu */
  moduloID: number;
  moduloNombre: string;

  /** Menu (pagina) */
  menuID: number;
  menuNombre: string;
  /** Etiqueta que se muestra al usuario */
  caption: string;
  /** Ruta relativa dentro de /Modulos{CODIGO_APP}, ej. "Administracion/Configuracion" */
  ruta: string;
  /** Nombre del icono FontAwesome, ej. "faGear" */
  icono?: string;
  orden?: number;
}
