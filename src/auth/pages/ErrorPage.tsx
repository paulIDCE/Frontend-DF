import { Button } from "antd";
import { useNavigate } from "react-router-dom";

/**
 * Base presentacional de las cuatro paginas de error estandar (§5).
 * Las paginas concretas (401/403/404/500) solo aportan codigo y mensaje.
 */
interface ErrorPageProps {
  code: string;
  message: string;
  /** Ruta del boton de salida. Por defecto la raiz. */
  redirectTo?: string;
  actionLabel?: string;
}

const ErrorPage = ({
  code,
  message,
  redirectTo = "/",
  actionLabel = "Volver al inicio",
}: ErrorPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-superficie-hundida px-4">
      <div className="bg-superficie rounded-contenedor p-8 shadow-contenedor text-center max-w-md">
        <h1 className="text-hero font-bold text-accion mb-4">
          {code}
        </h1>
        <p className="text-subtitulo mb-6 text-tinta-secundaria">{message}</p>
        <Button type="primary" onClick={() => navigate(redirectTo)}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
