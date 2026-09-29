import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MenuByUserDTO } from "@/types/menu";
import { getMenusByUser } from "@/services/menuService";
import { EMPTY_ARRAY, devError, devGroup, devTable, LoadingScreen } from "@idce/kit";

/**
 * Autorizacion por perfil (§5).
 *
 * Carga una sola vez los menus que el perfil del usuario tiene permitidos
 * (`GetMenusByUser`) y los expone a `AuthorizedRoute`.
 *
 * **Falla cerrado**: si la llamada falla, `menus` queda vacio y ninguna ruta
 * pasa el guard. Es deliberado — ante un error preferimos negar el acceso.
 */

interface MenuPermissionsContextValue {
  menus: MenuByUserDTO[];
  isLoading: boolean;
  /** true si `GetMenusByUser` devolvio al menos un menu */
  hasAnyMenu: boolean;
  /** Comprueba una ruta relativa, ej. "Administracion/Configuracion" */
  isRouteAllowed: (ruta: string) => boolean;
}

const MenuPermissionsContext = createContext<MenuPermissionsContextValue | null>(
  null
);

/** Normaliza para comparar rutas sin depender de mayusculas ni de la barra inicial. */
const normalize = (ruta: string) =>
  ruta.replace(/^\/+|\/+$/g, "").toLowerCase();

// eslint-disable-next-line react-refresh/only-export-components
export const useMenuPermissions = (): MenuPermissionsContextValue => {
  const context = useContext(MenuPermissionsContext);
  if (!context) {
    throw new Error(
      "useMenuPermissions must be used within a MenuPermissionsProvider"
    );
  }
  return context;
};

export const MenuPermissionsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [menus, setMenus] = useState<MenuByUserDTO[]>(EMPTY_ARRAY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadMenus = async () => {
      try {
        const data = await getMenusByUser();
        if (cancelled) return;
        setMenus(data ?? EMPTY_ARRAY);
        devGroup(`[permisos] ${data?.length ?? 0} menus permitidos`, () => {
          devTable(data);
        });
      } catch (e) {
        if (cancelled) return;
        // Falla cerrado: sin menus, AuthorizedRoute niega todo.
        devError("[permisos] no se pudieron cargar los menus:", e);
        setMenus(EMPTY_ARRAY);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadMenus();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<MenuPermissionsContextValue>(() => {
    const allowed = new Set(menus.map((menu) => normalize(menu.ruta)));
    return {
      menus,
      isLoading,
      hasAnyMenu: menus.length > 0,
      isRouteAllowed: (ruta: string) => allowed.has(normalize(ruta)),
    };
  }, [menus, isLoading]);

  if (isLoading) return <LoadingScreen tip="Verificando permisos..." />;

  return (
    <MenuPermissionsContext.Provider value={value}>
      {children}
    </MenuPermissionsContext.Provider>
  );
};

export default MenuPermissionsProvider;
