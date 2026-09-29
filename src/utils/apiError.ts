/**
 * Lectura unificada de los errores de la API.
 *
 * Implementa el contrato de error del backend, donde todo fallo
 * responde con un envelope JSON:
 *
 *   { success, message, detalle, errorCode, sqlNumber, traceId, status, data }
 *
 * La regla que separa un fallo de un resultado de negocio la fija el backend: si el cuerpo trae
 * **`errorCode`** lo construyo el middleware y es un fallo; si trae **`codigoError`** lo
 * construyo el controlador y es negocio. Nunca aparecen juntos.
 *
 * DOS REGLAS QUE NO SE DEBEN ROMPER:
 *
 * 1. `detalle` NO participa jamas del mensaje visible. Trae el texto crudo de SQL Server
 *    ("Invalid column name 'FechaCorteID'") y viaja en todos los entornos. Va a consola.
 *    Que esta decision viva aqui y no en cada `catch` es lo que evita que cada pantalla
 *    arme el mensaje en un orden distinto.
 *
 * 2. Tiene que acertar con el contrato **viejo y nuevo a la vez**: un backend que aun no lo
 *    implementa responde con `string` planos ("Internal server error: ...") o
 *    `{message, detalle}`. Los formatos estan cubiertos y ordenados de mas especifico a mas
 *    general en `describirError`.
 *
 * Se consume a traves de `useService` (campo `apiError`) y se pinta con `shared/EstadoError`.
 */

/** Lista cerrada y estable, espejo de `Common/Utils/ApiErrorCodes.cs` en el backend. */
export type ApiErrorCode =
  | "BUSINESS_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "SP_ERROR"
  | "SQL_ERROR"
  | "INTERNAL_ERROR";

/** El envelope de error del contrato nuevo. Los campos opcionales se omiten cuando no aplican. */
export interface ApiError {
  success?: false;
  message?: string;
  detalle?: string;
  errorCode: ApiErrorCode;
  sqlNumber?: number;
  traceId?: string;
  status?: number;
  data?: null;
}

/**
 * Resultado de negocio de las cuatro cargas (`HistoricoCartera`, `Colocacion`, `AnexoCartera`,
 * `Balance`). Llega con 422 en duplicados y 400 en estructura invalida, y se queda tal cual.
 */
export interface ResultadoNegocioCarga {
  codigoError: number;
  message?: string;
}

/** Lo que una pantalla necesita para reaccionar a un error, ya normalizado. */
export interface ErrorPresentable {
  /** Apto para mostrarle a un usuario final. Nunca el volcado tecnico. */
  mensaje: string;
  /** Causa tecnica. Para consola, nunca para pantalla. */
  detalle?: string;
  /** Identificador de la peticion en el log del backend (Serilog, 30 dias). */
  traceId?: string;
  errorCode?: ApiErrorCode;
  sqlNumber?: number;
  status?: number;
  /** Fallo que el usuario no puede resolver por su cuenta: toca avisarnos. */
  esTecnico: boolean;
}

/**
 * Fallos donde el usuario no tiene nada que corregir y lo unico util es que nos dicte el
 * `traceId`. En `VALIDATION_ERROR` y `BUSINESS_ERROR` el mensaje si es accionable
 * ("Celda D2 (ValorOperacion) debe ser un numero decimal"), asi que ahi el codigo estorba.
 */
const CODIGOS_TECNICOS: readonly ApiErrorCode[] = ["SQL_ERROR", "INTERNAL_ERROR"];

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null;

const textoNoVacio = (valor: unknown): string | undefined =>
  typeof valor === "string" && valor.trim() !== "" ? valor : undefined;

/** Cuerpo de la respuesta de error, leido estructuralmente para no atarse a axios. */
const cuerpoDeRespuesta = (error: unknown): unknown => {
  if (!esObjeto(error)) return undefined;
  const respuesta = error.response;
  return esObjeto(respuesta) ? respuesta.data : undefined;
};

const statusDeRespuesta = (error: unknown): number | undefined => {
  if (!esObjeto(error)) return undefined;
  const respuesta = error.response;
  if (!esObjeto(respuesta)) return undefined;
  return typeof respuesta.status === "number" ? respuesta.status : undefined;
};

/** El cuerpo es un fallo construido por el middleware del backend. */
export const esFalloApi = (data: unknown): data is ApiError =>
  esObjeto(data) && typeof data.errorCode === "string";

/**
 * El cuerpo es un resultado de negocio de las cargas, no un fallo.
 *
 * Ninguna pantalla ramifica por `codigoError`: solo muestran el `message` que lo acompaña, que es
 * lo que distingue un duplicado de una estructura invalida. Se expone igual porque descartar que
 * un resultado de negocio se trate como fallo si importa, y para cuando alguna pantalla lo
 * necesite el discriminador ya esta escrito en un solo sitio.
 */
export const esResultadoNegocio = (data: unknown): data is ResultadoNegocioCarga =>
  esObjeto(data) && typeof data.codigoError === "number";

/**
 * Normaliza cualquier error de una llamada a la API.
 *
 * `mensajeFallback` es lo que se muestra cuando no llego ningun texto aprovechable; conviene
 * que sea especifico de la pantalla ("Error al obtener la proyeccion") y no generico.
 */
export const describirError = (
  error: unknown,
  mensajeFallback: string,
): ErrorPresentable => {
  const cuerpo = cuerpoDeRespuesta(error);
  const status = statusDeRespuesta(error);

  // 1. Contrato nuevo: el envelope del middleware.
  if (esFalloApi(cuerpo)) {
    return {
      mensaje: textoNoVacio(cuerpo.message) ?? mensajeFallback,
      detalle: textoNoVacio(cuerpo.detalle),
      traceId: textoNoVacio(cuerpo.traceId),
      errorCode: cuerpo.errorCode,
      sqlNumber: typeof cuerpo.sqlNumber === "number" ? cuerpo.sqlNumber : undefined,
      status: typeof cuerpo.status === "number" ? cuerpo.status : status,
      esTecnico: CODIGOS_TECNICOS.includes(cuerpo.errorCode),
    };
  }

  // 2. Resultado de negocio de las cargas: su `message` esta redactado para el analista.
  if (esResultadoNegocio(cuerpo)) {
    return {
      mensaje: textoNoVacio(cuerpo.message) ?? mensajeFallback,
      status,
      esTecnico: false,
    };
  }

  // 3. Contrato viejo `{message, detalle}` de las cargas, o cualquier objeto con `message`.
  if (esObjeto(cuerpo)) {
    return {
      mensaje: textoNoVacio(cuerpo.message) ?? mensajeFallback,
      detalle: textoNoVacio(cuerpo.detalle),
      status,
      esTecnico: false,
    };
  }

  // 4. Contrato viejo: el cuerpo es un `string` plano. Feo, pero es lo que hay hasta que el
  //    backend despliegue, y mostrarlo es mejor que caer al generico.
  const plano = textoNoVacio(cuerpo);
  if (plano) {
    return { mensaje: plano, status, esTecnico: false };
  }

  // 5. El servidor respondio, pero sin nada legible en el cuerpo. Se usa el texto de la
  //    pantalla: `error.message` aqui seria el sintetico de axios ("Request failed with
  //    status code 500"), que no le dice nada a un usuario.
  if (status !== undefined) {
    return { mensaje: mensajeFallback, status, esTecnico: false };
  }

  // 6. Ni siquiera hubo respuesta: error de red, timeout o un Error de JS.
  const mensajeDelError = esObjeto(error) ? textoNoVacio(error.message) : undefined;
  return { mensaje: mensajeDelError ?? mensajeFallback, esTecnico: false };
};

/**
 * Texto final para el usuario. Solo en los fallos tecnicos añade el `traceId`, que es el
 * dato con el que soporte llega a la excepcion exacta en el log del backend.
 */
export const textoParaUsuario = (error: ErrorPresentable): string =>
  error.esTecnico && error.traceId
    ? `${error.mensaje}\n\nCódigo de seguimiento: ${error.traceId}`
    : error.mensaje;

/**
 * Deja el rastro tecnico en consola.
 *
 * Usa `console.error` y no `devError` de `utils/devLog` a proposito: aquel se silencia fuera
 * de desarrollo, y este es justamente el rastro que hace falta en produccion.
 */
export const registrarError = (
  contexto: string,
  error: ErrorPresentable,
  errorOriginal?: unknown,
): void => {
  console.error(`[${contexto}] ${error.mensaje}`, {
    errorCode: error.errorCode,
    detalle: error.detalle,
    traceId: error.traceId,
    sqlNumber: error.sqlNumber,
    status: error.status,
    errorOriginal,
  });
};
