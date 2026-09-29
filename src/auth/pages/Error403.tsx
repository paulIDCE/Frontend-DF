import ErrorPage from "@/auth/pages/ErrorPage";

/** El usuario tiene menus, pero no este en concreto. */
const Error403 = () => (
  <ErrorPage
    code="403"
    message="No tienes permisos para acceder a esta pagina."
  />
);

export default Error403;
