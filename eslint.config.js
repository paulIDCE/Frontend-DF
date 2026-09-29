import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // `.claude/`: worktrees y archivos de sesiones de Claude Code (copias del repo que no son este codigo).
  { ignores: ["dist", "dist-app", "node_modules", ".claude"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // §7: prohibido console crudo en produccion, usar devLog
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // La plantilla y la guía usan el kit como cualquier proyecto: `import { … } from "@idce/kit"`.
    // Así el código de ejemplo enseña el import correcto, y una pieza que no esté exportada en
    // `src/lib.ts` (y por tanto no llega a los demás sistemas) se detecta aquí mismo.
    files: [
      "src/demos/**", "src/guia/**", "src/modulos/**", "src/auth/**", "src/routes/**", "src/services/**",
      "src/interceptors/**", "src/config/**", "src/mocks/**", "src/*.{ts,tsx}",
      "src/hooks/configContext.tsx", "src/hooks/MenuPermissionsContext.tsx",
    ],
    ignores: ["src/lib.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: [
            "@/components/**", "@/shared/**", "@/design/**", "@/utils/**", "@/types/nivelRiesgo",
            "@/hooks/useService", "@/hooks/BreadcrumbContext", "@/hooks/useStackedModalZIndex",
            "../components/**", "../shared/**", "../design/**", "../utils/**",
          ],
          message: 'Importar desde "@idce/kit": la plantilla consume el kit como un proyecto real (docs/DISTRIBUCION.md).',
        }],
      }],
    },
  },
  {
    // Lo que se publica no puede depender de la app ni importarse a sí mismo por el nombre.
    files: [
      "src/design/**", "src/components/**", "src/shared/**", "src/utils/**", "src/types/nivelRiesgo.ts",
      "src/hooks/useService.tsx", "src/hooks/BreadcrumbContext.tsx", "src/hooks/useStackedModalZIndex.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "@idce/kit", message: "Dentro del kit se importa por ruta (@/…), no por el nombre del paquete." }],
        patterns: [{
          group: ["@/demos/**", "@/modulos/**", "@/auth/**", "@/routes/**", "@/services/**", "@/interceptors/**", "@/config/**", "@/mocks/**"],
          message: "El kit publicado no puede depender de la app de demos (no viajaría en el paquete).",
        }],
      }],
    },
  }
);
