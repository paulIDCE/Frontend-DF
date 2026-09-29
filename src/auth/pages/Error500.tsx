import ErrorPage from "@/auth/pages/ErrorPage";

/** Destino del interceptor cuando el backend no responde (ERR_NETWORK). */
const Error500 = () => (
  <ErrorPage
    code="500"
    message="El servidor no esta disponible en este momento."
  />
);

export default Error500;
