import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { RoutesConfig } from "@/types/routesConfig";
import { initializeServices } from "@/services/indexService";
import { RUNTIME_CONFIG_PATH, devError, LoadingScreen } from "@idce/kit";

/**
 * Carga de configuracion en RUNTIME (§4) — la pieza central de la arquitectura.
 *
 * Al arrancar hace `fetch("/config/routes.json")` y con esa config llama a
 * `initializeServices`, que inyecta las bases a los servicios y a las instancias
 * axios. Hasta que resuelve, la app muestra un loader; recien entonces se
 * renderiza el arbol — asi ningun servicio puede disparar una llamada con la
 * base todavia vacia.
 *
 * Ventaja: un mismo bundle sirve para multiples despliegues e instituciones;
 * solo cambia el `routes.json` que sirve el servidor. No hay que recompilar
 * por ambiente.
 */

interface ConfigContextValue {
  config: RoutesConfig;
  isLoading: boolean;
  /** Presente si el fetch fallo; la app arranca con las bases vacias. */
  error?: Error;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

const initialConfig: RoutesConfig = {
  VITE_API_URL: "",
  VITE_BASE_URL: "",
  VITE_API_SSO_URL: "",
  VITE_BASE_SSO_URL: "",
};

// eslint-disable-next-line react-refresh/only-export-components
export const useConfig = (): ConfigContextValue => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<RoutesConfig>(initialConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(RUNTIME_CONFIG_PATH);
        if (!response.ok) {
          throw new Error(
            `Error al cargar la configuracion (${response.status})`
          );
        }
        const value: RoutesConfig = await response.json();
        setConfig(value);
        initializeServices(value);
      } catch (e) {
        const errorObject = e instanceof Error ? e : new Error("Unknown error");
        devError("[config] no se pudo cargar la configuracion:", errorObject);
        setError(errorObject);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (isLoading) return <LoadingScreen tip="Cargando configuracion..." />;

  return (
    <ConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;
