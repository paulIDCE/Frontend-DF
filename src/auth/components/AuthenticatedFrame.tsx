import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";

/**
 * Contenedor de los Menus autenticados (§5).
 *
 * ⚠️ **Sin Header ni Sidebar, a proposito.** El SSO es el shell (host) y ya los
 * provee; esta app se monta dentro de su frame y solo aporta contenido. Si
 * agregas aqui una barra de navegacion propia, se vera duplicada.
 */

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-full w-full py-8">
    <Spin size="large" />
  </div>
);

const AuthenticatedFrame = () => {
  const location = useLocation();

  // Cada Menu es una pagina distinta: arranca desde arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default AuthenticatedFrame;
