import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

import ProtectedRoute from "@/auth/components/ProtectedRoute";
import AppShell from "@/layout/AppShell";

/**
 * Indice unico de rutas.
 *
 * ⚠️ Difiere del kit: AnalisisFinanciero NO es satelite del SSO. Tiene login
 * propio (`/login`) y su propio shell (`AppShell`), y sus pantallas cuelgan
 * de rutas planas. No se usan `AuthorizedRoute` / `MenuPermissionsProvider`
 * (permisos por menu del SSO) hasta definir el SSO propio — ver
 * docs/ARQUITECTURA_APP.md.
 *
 * ➜ Para agregar una pantalla: crear `src/modulos/<Modulo>/<Pantalla>.tsx`,
 *   declararla `lazy()` aqui, anadir su `<Route>` dentro del shell y su
 *   entrada en `PANTALLAS` (src/config/app.ts) si va en la navegacion.
 */

const Error401 = lazy(() => import("@/auth/pages/Error401"));
const Error403 = lazy(() => import("@/auth/pages/Error403"));
const Error404 = lazy(() => import("@/auth/pages/Error404"));
const Error500 = lazy(() => import("@/auth/pages/Error500"));

const Login = lazy(() => import("@/modulos/Auth/Login"));
const Dashboard = lazy(() => import("@/modulos/Inicio/Dashboard"));
const Macroeconomico = lazy(() => import("@/modulos/Macro/Macroeconomico"));
const SistemaFinanciero = lazy(() => import("@/modulos/Sistema/SistemaFinanciero"));
const TasasInteres = lazy(() => import("@/modulos/Tasas/TasasInteres"));
const Analisis = lazy(() => import("@/modulos/Analisis/Analisis"));

// Catalogo de componentes del kit: solo en desarrollo.
const Home = import.meta.env.DEV ? lazy(() => import("@/home")) : null;

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen w-full">
    <Spin size="large" />
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      {Home && <Route path="/home" element={<Home />} />}

      <Route path="/401" element={<Error401 />} />
      <Route path="/403" element={<Error403 />} />
      <Route path="/404" element={<Error404 />} />
      <Route path="/500" element={<Error500 />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/macro" element={<Macroeconomico />} />
        <Route path="/sistema" element={<SistemaFinanciero />} />
        <Route path="/tasas" element={<TasasInteres />} />
        <Route path="/analisis" element={<Analisis />} />
      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
