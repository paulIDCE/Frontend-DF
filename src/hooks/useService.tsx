import { useState, useEffect, useCallback, useRef } from 'react';
import { describirError, registrarError, type ErrorPresentable } from '@/utils/apiError';

type ServiceState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  statusCode?: number;
  /**
   * El error ya normalizado segun el contrato de la API (`utils/apiError`): mensaje apto para
   * el usuario, `errorCode` y `traceId`.
   *
   * Existe porque los servicios no deben devolver `[]` cuando fallan. Si lo hacen, `data: []`
   * significa a la vez "no hay datos" y "el backend fallo"; asi, un fallo deja `data` en `null`
   * y **este** campo lleno, que es como una pantalla distingue los dos casos (`EstadoError` de
   * `shared/`) sin repetir la lectura del error en cada componente.
   */
  apiError: ErrorPresentable | null;
};

/**
 * Hook para consumir servicios (§7).
 *
 * `mensajeError` es lo que vera el usuario cuando el backend falle y no mande ningun texto
 * aprovechable. Conviene darlo siempre y que diga QUE no se pudo cargar ("No se pudo obtener
 * la recuperacion historica"): un "No se pudo cargar la información" repetido en toda la
 * aplicacion no le dice nada a nadie. Va delante de `errorHandler` porque es el que se usa a
 * diario.
 */
const useService = <T,>(
  // `never[]`/`unknown[]` en vez de `any[]`: los argumentos son variadicos por diseno,
  // pero no queremos que el `any` se propague al llamador.
  serviceFunction: (...args: never[]) => Promise<T>,
  serviceParams: unknown[] = [],
  dependencies: unknown[] = [],
  executeOnMount = true,
  mensajeError = 'No se pudo cargar la información',
  errorHandler?: (error: Error) => void
) => {
  const [state, setState] = useState<ServiceState<T>>({
    data: null,
    loading: false,
    error: null,
    apiError: null,
  });

  const isMountedRef = useRef(true);

  // Peticion en curso JUNTO con los parametros con que se lanzo.
  //
  // Guardar la promesa sin los parametros causaba un fallo intermitente: el guard
  // devolvia la peticion en vuelo fuera cual fuera lo que se pedia ahora, asi que una llamada
  // con parametros NUEVOS se descartaba en silencio y el estado se quedaba con la respuesta
  // anterior (un filtro que "unas veces si y otras no" se aplicaba).
  const pendingRequestRef = useRef<Promise<T> | null>(null);
  const pendingParamsRef = useRef<string | null>(null);

  // Contador para que solo la ULTIMA peticion escriba el estado. Sin el, dos respuestas que
  // llegan desordenadas dejan en pantalla la del filtro viejo.
  const requestIdRef = useRef(0);

  // Serializar params para estabilidad en dependencias
  const paramsKey = JSON.stringify(serviceParams);
  const depsKey = JSON.stringify(dependencies);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      const paramsToUse = args.length > 0 ? args : serviceParams;
      const claveParams = JSON.stringify(paramsToUse);

      // Misma peticion ya en vuelo: se reaprovecha (el proposito del guard es no duplicarla).
      // Con parametros distintos, la nueva tiene que salir y mandar ella.
      if (pendingRequestRef.current && pendingParamsRef.current === claveParams) {
        return pendingRequestRef.current;
      }

      const idPeticion = ++requestIdRef.current;

      try {
        setState(prev => ({ ...prev, loading: true, error: null, apiError: null }));

        // El hook es variadico por diseno: acepta cualquier servicio y le pasa los params tal
        // cual. TypeScript no puede correlacionar la firma con `serviceParams`; el cast se
        // aisla aqui.
        const promesa = serviceFunction(...(paramsToUse as never[]));
        pendingRequestRef.current = promesa;
        pendingParamsRef.current = claveParams;
        const response = await promesa;

        // Si mientras tanto salio otra peticion, esta ya no manda: escribirla pisaria la buena.
        if (idPeticion !== requestIdRef.current) {
          return response;
        }

        if (isMountedRef.current) {
          setState(prev => ({ ...prev, loading: false, data: response }));
        }

        pendingRequestRef.current = null;
        pendingParamsRef.current = null;
        return response;
      } catch (error) {
        const errorObject = error instanceof Error ? error : new Error('Unknown error');

        let statusCode: number | undefined;
        if (error && typeof error === 'object' && 'response' in error) {
          statusCode = (error as { response?: { status?: number } }).response?.status;
        }

        // Lectura unica del cuerpo del error: aqui el fallo se convierte en algo mostrable y
        // deja rastro en consola con el `traceId` para pedirle el log al backend.
        const apiError = describirError(error, mensajeError);
        registrarError(serviceFunction.name || 'useService', apiError, error);

        if (errorHandler) {
          errorHandler(errorObject);
        }

        // Mismo criterio que en el exito: si ya salio otra peticion, pintar este fallo taparia
        // los datos buenos que vienen en camino.
        if (idPeticion !== requestIdRef.current) {
          return null;
        }

        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorObject,
            statusCode,
            apiError,
          }));
        }

        pendingRequestRef.current = null;
        pendingParamsRef.current = null;
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serviceFunction, errorHandler, mensajeError, paramsKey]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (executeOnMount && isMountedRef.current) {
      execute();
    }
  }, [execute, executeOnMount]);

  // Re-ejecuta cuando cambian las dependencias explicitas (comparadas por valor serializado).
  useEffect(() => {
    if (isMountedRef.current && dependencies.length > 0) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  return {
    ...state,
    execute,
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data,
    statusCode: state.statusCode,
    apiError: state.apiError,
    reset: () => {
      setState({ data: null, loading: false, error: null, apiError: null });
      pendingRequestRef.current = null;
      pendingParamsRef.current = null;
    },
  };
};

export default useService;
