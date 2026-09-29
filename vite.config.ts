import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import { generarCssTokens } from "./src/design/generarCss";

/**
 * Escribe `src/design/tokens.css` desde `src/design/tokens.ts` (la unica fuente de verdad).
 * `tokens.ts` es dependencia de este config: al editarlo Vite reinicia el servidor y el CSS
 * se regenera. Solo escribe si cambio, para no disparar recargas en vano.
 */
const tokens = (): Plugin => ({
  name: "idce-tokens",
  enforce: "pre",
  // `scripts/tokens.mjs` usa el mismo generador sin duplicarlo ni compilar TS aparte.
  api: { generarCssTokens },
  buildStart() {
    const destino = path.resolve(__dirname, "src/design/tokens.css");
    const css = generarCssTokens();
    const actual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
    if (actual !== css) fs.writeFileSync(destino, css);
  },
});

export default defineConfig({
  plugins: [tokens(), react(), tailwindcss()],
  resolve: {
    alias: {
      // La plantilla y la guía consumen el kit por su nombre, como cualquier proyecto: al arrancar
      // uno nuevo se instala `@idce/kit` y se borra esta línea; ningún import cambia.
      "@idce/kit": path.resolve(__dirname, "./src/lib.ts"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // App servida: siempre 3000 en dev. El SSO host usa 3001.
  server: { port: Number(process.env.PORT) || 3000 },
  // Nota: exceljs NO necesita `define: { global: "globalThis" }` ni polyfills
  // de Node. Su package.json declara `"browser": "./dist/exceljs.min.js"` y
  // resolve.mainFields de Vite prioriza `browser`. Verificado generando un
  // .xlsx en el navegador. Evitar ese `define`: reemplaza el identificador
  // `global` en TODO el bundle, incluidas variables locales de terceros.
  build: {
    // La app de demos sale en `dist-app`: `dist/` es del paquete `@idce/kit` (vite.lib.config.ts).
    outDir: "dist-app",
    sourcemap: true,
    rollupOptions: {
      output: {
        // Separa las librerias pesadas para que un cambio en el codigo de la
        // app no invalide su cache en el navegador.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          antd: ["antd", "@ant-design/icons"],
          echarts: ["echarts", "echarts-for-react"],
        },
      },
    },
  },
});
