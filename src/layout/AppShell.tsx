import { Suspense, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Spin } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "@/auth/AuthContext";
import { PANTALLAS } from "@/config/app";

/**
 * Shell propio de la app (header + contenido + footer).
 *
 * ⚠️ Difiere del kit: los satelites NO tienen shell porque se lo da el SSO
 * host (ver `AuthenticatedFrame`). AnalisisFinanciero se abre directo en el
 * navegador, con su propio login, asi que el header vive aqui. Es el header
 * de prueba-data (`dashboard.html`) sobre tokens del kit.
 */

const LoadingFallback = () => (
  <div className="flex justify-center items-center w-full py-16">
    <Spin size="large" />
  </div>
);

/**
 * Publica el alto del encabezado en la variable CSS `--alto-encabezado` (en `:root`): las barras
 * fijas de las pantallas (p. ej. la de la revista) se pegan justo debajo. El encabezado crece
 * cuando el menu se envuelve en pantallas angostas, asi que se mide en vivo.
 */
const usePublicarAlto = () => {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publicar = () => document.documentElement.style.setProperty("--alto-encabezado", `${Math.round(el.getBoundingClientRect().height)}px`);
    publicar();
    const observador = new ResizeObserver(publicar);
    observador.observe(el);
    return () => {
      observador.disconnect();
      document.documentElement.style.removeProperty("--alto-encabezado");
    };
  }, []);
  return ref;
};

const Header = () => {
  const { username, signOut } = useAuth();
  const navigate = useNavigate();
  const ref = usePublicarAlto();

  const salir = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header ref={ref} className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-superficie px-8 py-3 shadow-contenedor">
      <div className="flex items-center gap-3">
        <img src="/images/imgdatalux2.png" alt="Data Financiero" className="w-14 h-auto" />
        <div className="flex flex-col">
          <span className="font-extrabold text-subtitulo text-identidad">DATA FINANCIERO</span>
          <span className="text-detalle text-tinta-tenue">Administración de Bases de Datos</span>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {PANTALLAS.map((p) => (
          <NavLink
            key={p.ruta}
            to={p.ruta}
            className={({ isActive }) =>
              `px-4 py-2 rounded-tarjeta font-semibold text-cuerpo no-underline transition-colors ${
                isActive
                  ? "bg-accion text-tinta-inversa"
                  : "text-tinta hover:bg-superficie-hundida hover:text-accion"
              }`
            }
          >
            {p.titulo}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <span className="font-semibold text-identidad">Bienvenido, {username}</span>
        <Button danger type="primary" shape="round" icon={<LogoutOutlined />} onClick={salir}>
          Salir
        </Button>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="mt-auto border-t border-linea bg-superficie px-[5%] py-10">
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 md:grid-cols-[1.2fr_1.5fr_0.8fr]">
      <div className="flex flex-col gap-2">
        <img src="/images/IDCE.png" alt="IDCE Consulting" className="w-40 h-auto" />
        <p className="text-detalle text-tinta-secundaria m-0">© 2025 DataFinanciero by IDCE Consulting.</p>
        <p className="text-detalle text-tinta-tenue m-0">Todos los derechos reservados.</p>
      </div>
      <div className="text-detalle text-tinta-secundaria">
        <h4 className="text-cuerpo font-bold text-identidad mt-0 mb-2">Contacto:</h4>
        <p className="m-0">
          <strong>Dirección:</strong> Av. Orellana E11-75 y Av. La Coruña
          <br />
          Edificio Albra - Piso 4 - Of. 405
          <br />
          Quito - Ecuador
        </p>
        <p className="m-0"><strong>Teléfono:</strong> (+593) 2 382 6201</p>
        <p className="m-0"><strong>Móvil:</strong> (+593) 993 165 074</p>
        <p className="m-0">
          <strong>E-mail:</strong> <a href="mailto:info@idceconsulting.com">info@idceconsulting.com</a>
        </p>
        <p className="m-0">
          <strong>Web:</strong>{" "}
          <a href="https://www.idceconsulting.com" target="_blank" rel="noreferrer">
            www.idceconsulting.com
          </a>
        </p>
      </div>
      <div>
        <h4 className="text-cuerpo font-bold text-identidad mt-0 mb-2">Síguenos:</h4>
        <div className="flex gap-3">
          {["face", "twitter", "linkedin"].map((red) => (
            <img key={red} src={`/images/${red}.png`} alt={red} className="w-8 h-8" />
          ))}
        </div>
      </div>
    </div>
  </footer>
);

const AppShell = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-superficie-hundida">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default AppShell;
