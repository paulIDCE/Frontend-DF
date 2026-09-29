import type { ErrorPresentable } from "@/utils/apiError";

/**
 * El primer fallo de un grupo de llamadas a `useService`, si lo hay.
 *
 * Muchas vistas piden media docena de cosas para pintar un solo bloque -los datos y los
 * catalogos de sus filtros-, y cada `useService` devuelve su propio `apiError`. Preguntar
 * "¿fallo alguna?" encadenando `??` en el JSX ensucia el render y se olvida facilmente al
 * anadir una llamada mas.
 *
 * @example
 * const error = primerApiError(datos.apiError, oficinas.apiError);
 * if (error) return <EstadoError error={error} />;
 */
export const primerApiError = (
  ...errores: Array<ErrorPresentable | null | undefined>
): ErrorPresentable | null => {
  for (const error of errores) {
    if (error) return error;
  }
  return null;
};

export default primerApiError;
