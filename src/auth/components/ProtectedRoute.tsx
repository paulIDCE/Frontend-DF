import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingScreen } from "@idce/kit";
import { useAuth } from "@/auth/AuthContext";

/**
 * Guard de AUTENTICACION.
 *
 * ⚠️ Difiere del kit: esta app NO es satelite del SSO, tiene login propio
 * (hoy Supabase, ver docs/ARQUITECTURA_APP.md). Sin sesion se va a `/login`
 * recordando la ruta pedida. **Falla cerrado**.
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { session, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <LoadingScreen tip="Validando sesion..." />;

  if (!session) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
