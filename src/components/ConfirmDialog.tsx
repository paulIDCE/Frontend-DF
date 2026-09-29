import Swal from "sweetalert2";
import { color } from "@/design/tokens";

interface ConfirmDialogOptions {
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "question" | "info" | "error";
  destructive?: boolean;
}

const ConfirmDialog = async ({
  title = "¿Está seguro?",
  text = "",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  icon = "warning",
  destructive = false,
}: ConfirmDialogOptions = {}): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    // Cancelar es neutro: en rojo competia con la accion destructiva.
    confirmButtonColor: destructive ? color.error.base : color.accion.base,
    cancelButtonColor: color.tinta.tenue,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
};

const SimpleAlert = (icon: "success" | "error" | "warning" | "info", title: string, text?: string) => {
  Swal.fire({ icon, title, text });
};

export { ConfirmDialog, SimpleAlert };
export default ConfirmDialog;
