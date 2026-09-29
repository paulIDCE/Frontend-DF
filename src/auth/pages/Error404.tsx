import ErrorPage from "@/auth/pages/ErrorPage";

const Error404 = () => (
  <ErrorPage
    code="404"
    message="La pagina que buscas no existe o ha sido movida."
  />
);

export default Error404;
