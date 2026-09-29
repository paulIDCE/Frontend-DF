import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useMenuPermissions } from "@/hooks/MenuPermissionsContext";
import { devWarn } from "@idce/kit";

/**
 * Guard de AUTORIZACION (§5) — segundo nivel del doble guard.
 *
 * Compara la ruta actual contra los menus que `GetMenusByUser` devolvio para
 * el perfil del usuario. **Falla cerrado**:
 *
 *   - sin ningun menu asignado -> /401
 *   - con menus, pero no este   -> /403
 *
 * La autorizacion real la impone el backend (endpoints blindados). Este guard
 * es defensa en profundidad, no la unica barrera.
 */

interface AuthorizedRouteProps {
  children: ReactNode;
  /**
   * Ruta a comprobar, tal como viene en `MenuByUserDTO.ruta`
   * (ej. "Administracion/Configuracion"). Si se omite, se deriva de la URL
   * actual quitando el segmento del modulo.
   */
  ruta?: string;
}

const AuthorizedRoute = ({ children, ruta }: AuthorizedRouteProps) => {
  const { pathname } = useLocation();
  const { hasAnyMenu, isRouteAllowed } = useMenuPermissions();

  // "/ModulosSK/Administracion/Configuracion" -> "Administracion/Configuracion"
  const rutaAComprobar =
    ruta ?? pathname.replace(/^\/+/, "").split("/").slice(1).join("/");

  if (!hasAnyMenu) {
    devWarn("[permisos] el usuario no tiene menus asignados");
    return <Navigate to="/401" replace />;
  }

  if (!isRouteAllowed(rutaAComprobar)) {
    devWarn(`[permisos] ruta no permitida: ${rutaAComprobar}`);
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default AuthorizedRoute;
