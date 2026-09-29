import ErrorPage from "@/auth/pages/ErrorPage";

/** El usuario esta autenticado pero no tiene ningun menu asignado. */
const Error401 = () => (
  <ErrorPage
    code="401"
    message="Tu usuario no tiene menus asignados en esta aplicacion. Contacta al administrador del sistema."
  />
);

export default Error401;
