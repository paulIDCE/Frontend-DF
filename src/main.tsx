import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "@/App";
import { ConfigProvider } from "@/hooks/configContext";
import { BreadcrumbProvider } from "@idce/kit";
import { AuthProvider } from "@/auth/AuthContext";

/**
 * Arbol de providers (§8.3). El orden importa:
 *
 * ConfigProvider va primero y bloquea el render hasta que carga
 * `/config/routes.json`, de modo que ningun componente pueda disparar una
 * llamada HTTP antes de que los servicios tengan su baseURL.
 */
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider>
      <Router>
        <AuthProvider>
          <BreadcrumbProvider>
            <App />
          </BreadcrumbProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  </React.StrictMode>
);
