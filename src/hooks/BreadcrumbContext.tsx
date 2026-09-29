import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Breadcrumbs de la pagina activa (§5).
 *
 * Cada Menu los declara en un `useEffect` de montaje; el shell del SSO los
 * muestra. La app servida no pinta su propio Header, solo publica el rastro.
 *
 * @example
 * const { setBreadcrumbs } = useBreadcrumb();
 * useEffect(() => {
 *   setBreadcrumbs([
 *     { label: "Administracion" },
 *     { label: "Configuracion", path: "/ModulosSK/Administracion/Configuracion" },
 *   ]);
 * }, [setBreadcrumbs]);
 */

export interface BreadcrumbItem {
  label: string;
  /** Sin `path` el item se renderiza como texto plano (el nivel actual). */
  path?: string;
}

interface BreadcrumbContextValue {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  clearBreadcrumbs: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useBreadcrumb = (): BreadcrumbContextValue => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};

export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[]>([]);

  // Estables: las paginas las usan como dependencia de su useEffect de montaje.
  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    setBreadcrumbsState(items);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbsState([]);
  }, []);

  const value = useMemo(
    () => ({ breadcrumbs, setBreadcrumbs, clearBreadcrumbs }),
    [breadcrumbs, setBreadcrumbs, clearBreadcrumbs]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export default BreadcrumbProvider;
