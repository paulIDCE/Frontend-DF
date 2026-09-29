/**
 * Construye el paquete `@idce/kit` en `dist/`:
 *
 * 1. `vite build -c vite.lib.config.ts` → JS (un archivo por modulo, con sourcemaps).
 * 2. `tsc -p tsconfig.lib.json` → tipos en `dist/types`.
 * 3. Reescribe el alias `@/...` de los `.d.ts` a rutas relativas: el sistema que instala el
 *    paquete no tiene ese alias en su tsconfig y TypeScript no resolveria los tipos.
 * 4. Escribe los CSS que el consumidor importa: `tokens.css` (generado desde `tokens.ts`),
 *    `shell.css` (comunes: tipografia base, scrollbars, seleccion y foco; lo usa el SSO) y
 *    `base.css` = `shell.css` + `iframe.css` (densidad 90 % y lienzo blanco; lo usan las apps del
 *    iframe). Se concatenan en vez de usar `@import`: Tailwind v4 puede descartar esos imports.
 * 5. `tokens-transicion.css` = `tokens.css` sin el bloque de reinicio (`--color-*: initial`… y su comentario):
 *    los roles del kit conviven con la paleta y escalas por defecto de Tailwind mientras un
 *    consumidor migra sus vistas. Sale del `tokens.css` generado, no de valores a mano, y el
 *    build FALLA si no encuentra exactamente esas 4 lineas.
 * 6. Carga `dist/lib.js` con Node (ESM): el build FALLA si el barrel no carga fuera de Vite.
 *
 * Uso: `pnpm build:lib`. Para generar el .tgz: `pnpm pack` (lo ejecuta antes via `prepack`).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(raiz, "dist");
/** Los binarios se llaman por su entrada de Node: en Windows, `spawn` de un `.cmd` falla (EINVAL). */
const correr = (binario, args) =>
  execFileSync(process.execPath, [path.join(raiz, "node_modules", binario), ...args], {
    cwd: raiz,
    stdio: "inherit",
  });

correr("vite/bin/vite.js", ["build", "-c", "vite.lib.config.ts"]);
correr("typescript/bin/tsc", ["-p", "tsconfig.lib.json"]);

/** Todos los `.d.ts` y `.d.ts.map` emitidos. */
const archivos = [];
const recorrer = (dir) => {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) recorrer(ruta);
    else if (ruta.endsWith(".d.ts")) archivos.push(ruta);
  }
};
recorrer(path.join(dist, "types"));

const tipos = path.join(dist, "types");
let reescritos = 0;
for (const archivo of archivos) {
  const original = fs.readFileSync(archivo, "utf8");
  const nuevo = original.replace(/(["'])@\/([^"']+)\1/g, (_, comilla, resto) => {
    const relativa = path.relative(path.dirname(archivo), path.join(tipos, resto)).split(path.sep).join("/");
    return `${comilla}${relativa.startsWith(".") ? relativa : `./${relativa}`}${comilla}`;
  });
  if (nuevo !== original) {
    fs.writeFileSync(archivo, nuevo);
    reescritos += 1;
  }
}

/** Las lineas de `generarCss.ts` que borran lo de Tailwind; el modo transicion las quita. */
const REINICIO = ["--color-*", "--text-*", "--radius-*", "--shadow-*"].map((v) => `  ${v}: initial;`);

/** Su comentario: sin las lineas de arriba se quedaria huerfano y diria lo contrario del archivo. */
const COMENTARIO_REINICIO = "  /* Reinicio: solo existen los tokens del sistema */";

const CABECERA_TRANSICION = `/* ==========================================================================
   @idce/kit/tokens-transicion.css — MODO TRANSICION.
   Es tokens.css SIN el reinicio (--color-*, --text-*, --radius-*, --shadow-*: initial):
   los roles del kit (text-cuerpo, bg-superficie, rounded-tarjeta…) conviven con la paleta y
   las escalas por defecto de Tailwind (text-gray-500, text-sm, rounded-lg, shadow-md…) mientras
   un sistema migra sus vistas poco a poco. --spacing sigue en 4px, como en tokens.css.
   Al terminar la migracion, cambiar este import por "@idce/kit/tokens.css".
   ========================================================================== */

`;

/** `tokens.css` sin el bloque de reinicio (4 lineas + comentario). Falla si no esta tal cual. */
const tokensTransicion = (css) => {
  const lineas = css.split(/\r?\n/);
  for (const linea of REINICIO) {
    const veces = lineas.filter((l) => l === linea).length;
    if (veces !== 1) {
      throw new Error(`tokens-transicion.css: se esperaba "${linea.trim()}" una vez en tokens.css y aparece ${veces}.`);
    }
  }
  if (lineas.filter((l) => l === COMENTARIO_REINICIO).length !== 1) {
    throw new Error(`tokens-transicion.css: se esperaba "${COMENTARIO_REINICIO.trim()}" una vez en tokens.css.`);
  }
  // Tambien la linea en blanco que dejaba el bloque, para no abrir `@theme` con dos saltos.
  const sinReinicio = lineas.filter((l, i) => {
    const fuera = REINICIO.includes(l) || l === COMENTARIO_REINICIO;
    const blancoSobrante = l.trim() === "" && lineas[i - 1] === REINICIO[REINICIO.length - 1];
    return !fuera && !blancoSobrante;
  });
  if (lineas.length - sinReinicio.length !== REINICIO.length + 2) {
    throw new Error("tokens-transicion.css: no se quito exactamente el bloque de reinicio (4 lineas, su comentario y el blanco).");
  }
  if (/:\s*initial\s*;/.test(sinReinicio.join("\n"))) {
    throw new Error("tokens-transicion.css: queda otro reinicio (`: initial`) que no es de los 4 conocidos.");
  }
  const salto = css.includes("\r\n") ? "\r\n" : "\n";
  return CABECERA_TRANSICION.replace(/\n/g, salto) + sinReinicio.join(salto);
};

const leerCss = (nombre) => fs.readFileSync(path.join(raiz, "src/design", nombre), "utf8");
const tokensCss = leerCss("tokens.css");
fs.writeFileSync(path.join(dist, "tokens.css"), tokensCss);
fs.writeFileSync(path.join(dist, "tokens-transicion.css"), tokensTransicion(tokensCss));
fs.writeFileSync(path.join(dist, "shell.css"), leerCss("shell.css"));
fs.writeFileSync(path.join(dist, "base.css"), `${leerCss("shell.css")}\n${leerCss("iframe.css")}`);

// El barrel tiene que cargar con el resolutor ESM de Node (Vitest, scripts, SSR), no solo con Vite:
// subrutas sin `.js` en paquetes sin mapa `exports` (`antd/locale/es_ES`) o exports con nombre de
// un CommonJS (`saveAs` de `file-saver`) rompen `pnpm test` en los consumidores. Proceso aparte
// para no heredar el cache de modulos de este script.
try {
  execFileSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(pathToFileURL(path.join(dist, "lib.js")).href)});`], {
    cwd: raiz,
    stdio: "pipe",
  });
} catch (e) {
  const detalle = String(e.stderr ?? e.message).split("\n").find((l) => /Error|Cannot|not found/.test(l)) ?? e.message;
  throw new Error(`dist/lib.js no carga en Node (ESM): ${detalle.trim()}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(raiz, "package.json"), "utf8"));
console.log(`\n${pkg.name}@${pkg.version} listo en dist/ (${archivos.length} .d.ts, ${reescritos} con alias reescrito).`);
