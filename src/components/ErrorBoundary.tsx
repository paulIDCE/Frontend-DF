import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "antd";
import { devError } from "@/utils/devLog";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // §7: nada de console crudo. Si en el futuro hace falta telemetria en
    // produccion, engancharla aqui explicitamente (Sentry, App Insights...).
    devError("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-superficie-hundida px-4">
          <div className="bg-superficie rounded-contenedor p-8 shadow-contenedor text-center max-w-md">
            <h1 className="text-display font-bold text-accion mb-4">
              Algo salió mal
            </h1>
            <p className="text-tinta-secundaria mb-6">
              Ocurrió un error inesperado. Por favor, recargue la página.
            </p>
            <Button
              type="primary"
              onClick={this.handleReload}
            >
              Recargar página
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
