export interface Usuario {
  usuarioID: number;
  empleadoID: number;
  usuario: string;
  clave: string;
  institucionID: number;
  institucionPadreID: number;
  padreID: number;
  nombreInstitucion: string;
  nombreInstitucionPadre: string;
  institucionCodigo: string;
  administrador: boolean;
  fechaSistema: Date;
  codigoIngerno: string;
  fechaExpiracion: Date;
  estado: string;
  numeroAcceso: number;
  terminal: string;
  region: string;
  fechaCambioClave: Date;
  estadoClave: boolean;
  bloquearUsuario: number;
  imagenCuenta: Uint8Array;
  clavesAnteriores: number;
  productoID: number;
  codigoProducto: string;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  empleado: string; // FullName Empleado
  perfilIDs: string;
  tiempoNotificacion: number;
  activeDirectory: boolean;
}
export interface GetUsuarioDTO {
  usuarioID: number;
  empleadoID: number;
  usuario: string;
  clave: string;
  perfilIDs: string;
  institucionID: number;
  padreID: number;
  nombreInstitucionPadre: string;
  nombreInstitucion: string;
  institucionCodigo: string;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  empleado: string; // FullName Empleado
  administrador: number;
  fechaYear: number;
  fechaMonth: number;
  fechaDay: number;
  fechaExpiracion: Date;
  numeroAcceso: number;
  terminalNombre: string;
  estado: string;
  fechaSistema: Date;
  fechaCambioClave: Date;
  cambiarClave: number;
  bloquearUsuario: number;
  imagenCuenta: string;
  clavesAnteriores: number;
  tiempoNotificacion: number;
}
export interface GetUsuariosByInstitucionDTO {
  usuarioID: number;
  empleadoID: number;
  usuario: string;
  clave: string;
  perfilIDs: string | number[];
  codigoInterno: number;
  administrador: number;
  nombrePerfil: string;
  nombreEmpleado: string;
  fechaExpiracion: Date;
  institucionID: number;
  nombreInstitucion: string;
  estado: string;
  estadoNombre: string;
  fechaCambioClave: Date;
}
export interface InsertUsuarioDTO {
  empleadoID: number;
  usuario: string;
  clave: string;
  perfilIDs: string;
  fechaExpiracion: Date;
  estado: string;
  imagenCuenta: Uint8Array | string;
  fechaCambioClave: Date;
  activeDirectory: boolean;
}
export interface ChangePassword {
  oldClave?: string;
  newClave?: string;
}
export interface TokenRequest {
  Jwt: string;
}
export interface ImagenUsuarioDTO {
  UserID: number;
  Imagen: string;
}
