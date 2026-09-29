import Swal, { type SweetAlertResult } from "sweetalert2";
import { color } from "@/design/tokens";

/**
 * Feedback UX unificado (§7).
 *
 * - **Dialogos bloqueantes** (confirmar, error que exige atencion): estas funciones.
 * - **Notificaciones no bloqueantes** (guardado OK, aviso): `react-toastify`.
 *
 * Centralizado aqui para que los colores y textos de los botones sean iguales
 * en toda la app. No instancies `Swal.fire` suelto en los componentes.
 */

// Swal no lee las clases de Tailwind: recibe los valores de los tokens.
// Confirmar = accion (texto blanco AA 5.2:1); cancelar = neutro; destructivo = error.
const COLOR_PRIMARY = color.accion.base;
const COLOR_DANGER = color.error.base;

const swal = Swal.mixin({
  confirmButtonColor: COLOR_PRIMARY,
  cancelButtonColor: color.tinta.tenue,
  reverseButtons: true,
});

export const swalSuccess = (
  title: string,
  text?: string
): Promise<SweetAlertResult> => swal.fire({ icon: "success", title, text });

export const swalError = (
  title: string,
  text?: string
): Promise<SweetAlertResult> => swal.fire({ icon: "error", title, text });

export const swalWarning = (
  title: string,
  text?: string
): Promise<SweetAlertResult> => swal.fire({ icon: "warning", title, text });

export const swalInfo = (
  title: string,
  text?: string
): Promise<SweetAlertResult> => swal.fire({ icon: "info", title, text });

/**
 * Confirmacion generica.
 * @returns `true` si el usuario confirmo.
 */
export const swalConfirm = async (
  title: string,
  text?: string,
  confirmButtonText = "Aceptar"
): Promise<boolean> => {
  const result = await swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancelar",
  });
  return result.isConfirmed;
};

/**
 * Confirmacion de una accion destructiva: boton en naranja de acento y
 * cancelar preseleccionado.
 */
export const swalConfirmDelete = async (
  title = "¿Eliminar el registro?",
  text = "Esta accion no se puede deshacer."
): Promise<boolean> => {
  const result = await swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Si, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: COLOR_DANGER,
    focusCancel: true,
  });
  return result.isConfirmed;
};

export const swalAlert = {
  success: swalSuccess,
  error: swalError,
  warning: swalWarning,
  info: swalInfo,
  confirm: swalConfirm,
  confirmDelete: swalConfirmDelete,
};

export default swalAlert;
