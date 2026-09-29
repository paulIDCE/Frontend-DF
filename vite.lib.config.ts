import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { generarCssTokens } from "./src/design/generarCss";
import fs from "fs";

/**
 * Build de la LIBRERIA (`@idce/kit`). El build de la app de demos sigue en `vite.config.ts`.
 *
 * - `preserveModules`: un .js por archivo fuente, para que el sistema que la instala solo empaquete
 *   lo que importa (sin esto, importar `ExcelButton` arrastraba ECharts y exceljs).
 * - Todo lo que el consumidor ya tiene (React, antd, ECharts...) sale como `external`: son
 *   `peerDependencies`, no se duplican en su bundle y evitan dos copias de React.
 * - Los `.d.ts` los emite `tsc -p tsconfig.lib.json` desde `scripts/construirLib.mjs`, que ademas
 *   reescribe el alias `@/` (el consumidor no lo tiene configurado) y copia los CSS.
 */

const tokens = (): Plugin => ({
  name: "idce-tokens",
  enforce: "pre",
  buildStart() {
    const destino = path.resolve(__dirname, "src/design/tokens.css");
    const css = generarCssTokens();
    const actual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
    if (actual !== css) fs.writeFileSync(destino, css);
  },
});

/** Dependencias del consumidor: nunca entran al paquete. Tambien sus subrutas (`antd/es/table`). */
const externos = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "antd",
  "@ant-design/icons",
  "echarts",
  "echarts-for-react",
  "exceljs",
  "file-saver",
  "date-fns",
  "dayjs",
  "sweetalert2",
  "sweetalert2-react-content",
  "react-toastify",
  "react-router-dom",
];

export default defineConfig({
  plugins: [tokens(), react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  // Sin esto Vite copia `public/` (favicon, config) dentro del paquete.
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: { entry: path.resolve(__dirname, "src/lib.ts"), formats: ["es"] },
    rollupOptions: {
      external: (id) => externos.includes(id) || externos.some((e) => id.startsWith(`${e}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
