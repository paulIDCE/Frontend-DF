import type { ErrorPresentable } from "@/utils/apiError";

interface EstadoErrorProps {
  /** El fallo ya normalizado, tal como lo entrega `apiError` de `useService`. */
  error: ErrorPresentable;
  /** Para ajustar el alto al hueco que deja el grafico que no se pudo pintar. */
  className?: string;
}

/**
 * Lo que se pinta en lugar de un grafico o una tabla cuando el backend fallo.
 *
 * Existe para separar los dos casos que hasta ahora se veian igual: **no hay datos** —la
 * consulta respondio y no habia filas— y **el backend fallo**. Mientras los servicios se
 * tragaban el error y devolvian `[]`, los dos terminaban en el mismo grafico vacio, y un
 * analista que entraba durante una caida no tenia como notarlo: la pantalla mentia por
 * omision. Desde que los servicios propagan, el fallo llega hasta `apiError` y aqui se dice.
 *
 * El `traceId` aparece solo en los fallos tecnicos, el mismo criterio que en el resto de la
 * aplicacion (`utils/apiError`): es donde el usuario no puede hacer nada salvo avisarnos.
 *
 * Para varias llamadas a la vez, combinar con `primerApiError`.
 */
const EstadoError = ({ error, className = "" }: EstadoErrorProps) => (
  <div
    role="alert"
    className={`flex flex-col items-center justify-center gap-1 rounded-tarjeta border border-error-borde bg-error-sutil px-4 py-6 text-center ${className}`}
  >
    <span className="text-cuerpo font-semibold text-error">
      No se pudo cargar esta sección
    </span>
    <span className="text-detalle text-error">{error.mensaje}</span>
    {error.esTecnico && error.traceId && (
      <span className="mt-1 font-mono text-rotulo text-error">
        Código de seguimiento: {error.traceId}
      </span>
    )}
  </div>
);

export default EstadoError;
