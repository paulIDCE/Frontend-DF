import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import type { Provincia, ProvinciaFormValues } from "@/types/provincia";
import {
  insertProvincia,
  updateProvincia,
  deleteProvincia,
} from "@/services/provinciaService";
import { devError, swalConfirmDelete, swalError } from "@idce/kit";

/**
 * Hook *manager* de la entidad Provincia (§7).
 *
 * Un manager por entidad concentra save/update/delete: la pagina se queda solo
 * con la orquestacion de UI y no repite manejo de errores ni de toasts.
 *
 * Convenciones que aplica:
 *   - `swalAlert` para lo bloqueante (confirmar borrado, error), `react-toastify`
 *     para el exito no bloqueante.
 *   - `devError` en vez de `console.error`.
 *   - Devuelve `boolean` para que la pagina decida si cerrar el modal y recargar.
 */
export const useProvinciaManager = (onSuccess?: () => void) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /** Crea si no hay `provinciaID`, actualiza si lo hay. */
  const save = useCallback(
    async (values: ProvinciaFormValues, provinciaID?: number) => {
      setIsSaving(true);
      try {
        if (provinciaID) {
          await updateProvincia({ ...values, provinciaID });
          toast.success("Provincia actualizada correctamente");
        } else {
          await insertProvincia(values);
          toast.success("Provincia creada correctamente");
        }
        onSuccess?.();
        return true;
      } catch (e) {
        devError("[provincia] fallo al guardar:", e);
        await swalError(
          "No se pudo guardar",
          "Revisa los datos e intentalo de nuevo."
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [onSuccess]
  );

  const remove = useCallback(
    async (provincia: Provincia) => {
      const confirmed = await swalConfirmDelete(
        `¿Eliminar "${provincia.nombre}"?`,
        "Esta accion no se puede deshacer."
      );
      if (!confirmed) return false;

      setIsDeleting(true);
      try {
        await deleteProvincia(provincia.provinciaID);
        toast.success("Provincia eliminada correctamente");
        onSuccess?.();
        return true;
      } catch (e) {
        devError("[provincia] fallo al eliminar:", e);
        await swalError(
          "No se pudo eliminar",
          "Es posible que la provincia este en uso."
        );
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [onSuccess]
  );

  return { save, remove, isSaving, isDeleting };
};

export default useProvinciaManager;
