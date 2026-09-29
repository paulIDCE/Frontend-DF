import { ConfigProvider as AntdConfigProvider } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "@/routes";
import { temaAntd } from "@idce/kit";

/**
 * El tema de antd se deriva de los tokens (`src/design/temaAntd.ts` ← `src/design/tokens.ts`),
 * la misma fuente que las utilidades de Tailwind. Cambiar un color, tamaño o radio = tocar
 * `tokens.ts`; nunca overrides CSS con `!important` sobre clases `ant-*`.
 *
 * Importado como `AntdConfigProvider` para no chocar con el `ConfigProvider`
 * propio de la app (src/hooks/configContext.tsx), que carga `routes.json`
 * en runtime y envuelve el arbol en `main.tsx`.
 */
function App() {
  return (
    <AntdConfigProvider theme={temaAntd}>
      <div className="App">
        <AppRoutes />
        {/* Notificaciones no bloqueantes; los dialogos van por swalAlert (§7) */}
        <ToastContainer position="top-right" autoClose={4000} newestOnTop />
      </div>
    </AntdConfigProvider>
  );
}

export default App;
