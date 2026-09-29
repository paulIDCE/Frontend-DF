/**
 * Tokens del design system (ver docs/TOKENS.md).
 *
 *   node scripts/tokens.mjs generar    reescribe src/design/tokens.css desde tokens.ts
 *   node scripts/tokens.mjs verificar  falla si tokens.css esta desactualizado o si el codigo
 *                                      usa valores sueltos en lugar de tokens
 *
 * El generador se obtiene del plugin `idce-tokens` de vite.config.ts, que Vite compila: una
 * sola implementacion para dev, build y esta verificacion.
 */
import fs from "node:fs";
import path from "node:path";
import { loadConfigFromFile } from "vite";

const raiz = path.resolve(import.meta.dirname, "..");
const destino = path.join(raiz, "src/design/tokens.css");
const modo = process.argv[2] ?? "verificar";

const cargado = await loadConfigFromFile({ command: "build", mode: "production" }, undefined, raiz, "silent");
const plugin = cargado?.config.plugins?.flat().find((p) => p && p.name === "idce-tokens");
if (!plugin) {
  console.error("No se encontro el plugin idce-tokens en vite.config.ts");
  process.exit(1);
}
const css = plugin.api.generarCssTokens();

if (modo === "generar") {
  fs.writeFileSync(destino, css);
  console.log("tokens.css generado");
  process.exit(0);
}

/* ---------- verificar ---------- */

const problemas = [];

if (!fs.existsSync(destino) || fs.readFileSync(destino, "utf8") !== css) {
  problemas.push("src/design/tokens.css esta desactualizado: ejecutar `pnpm tokens:generar` (o arrancar dev).");
}

/**
 * Lo que NO puede aparecer fuera de src/design/. Cada regla dice que usar en su lugar.
 * src/mocks/ queda fuera: simula datos del backend (p. ej. colores de niveles de riesgo).
 */
const PALETA_TW =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black";
const PREFIJO = "(?<![\\w-])(?:[a-z-]+:)*!?";
const FIN = "(?![\\w-])";
const reglas = [
  { patron: /#[0-9a-fA-F]{3,8}(?![\w-])/g, ayuda: "hex suelto → un token de src/design/tokens.ts" },
  { patron: /\brgba?\(/g, ayuda: "rgb()/rgba() suelto → token (conAlfa() si hace falta transparencia)" },
  {
    patron: new RegExp(
      `${PREFIJO}(?:text|bg|border(?:-[trblxy])?|ring|outline|fill|stroke|divide|from|via|to|accent|caret|placeholder|decoration)-(?:${PALETA_TW})(?:-\\d+)?(?:\\/\\d+)?${FIN}`,
      "g",
    ),
    ayuda: "color de la paleta por defecto de Tailwind → rol (text-tinta-secundaria, bg-superficie-sutil, border-linea…)",
  },
  {
    patron: new RegExp(`${PREFIJO}text-(?:xs|sm|base|lg|xl|[2-9]xl|\\[\\d+px\\])${FIN}`, "g"),
    ayuda: "tamaño suelto → text-rotulo (11) | detalle (12) | cuerpo (14) | subtitulo (16) | titulo (18) | cifra (24) | display (30) | hero (60)",
  },
  {
    patron: new RegExp(`${PREFIJO}rounded(?:-[trblse]{1,2})?(?:-(?:xs|sm|md|lg|xl|2xl|3xl))?${FIN}`, "g"),
    ayuda: "radio suelto → rounded-marca|control|tarjeta|contenedor|full",
  },
  {
    patron: new RegExp(`${PREFIJO}shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl))?${FIN}`, "g"),
    ayuda: "sombra suelta → shadow-tarjeta|contenedor|elevada",
  },
  { patron: /\b(?:fontSize|borderRadius)\s*:\s*["']?\d+/g, ayuda: "tamaño o radio numérico → tipografia.escala.<rol>.tamano / radio.<rol> de tokens.ts (en ECharts: TEXTO_GRAFICA)" },
  { patron: /\bboxShadow\s*:\s*["'`]/g, ayuda: "sombra en línea → sombra de tokens.ts" },
];

/** Quita comentarios conservando las columnas y los saltos de linea, para no marcar la documentacion. */
const sinComentarios = (texto) =>
  texto
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, (m, previo) => previo + " ".repeat(m.length - previo.length));

const excluidos = new Set([path.join(raiz, "src", "design"), path.join(raiz, "src", "mocks")]);

const recorrer = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) return excluidos.has(ruta) ? [] : recorrer(ruta);
    return /\.(tsx?|css)$/.test(e.name) ? [ruta] : [];
  });

/**
 * Tailwind ignora en silencio una clase que no existe: `text-compacto` o `rounded-lg` no pintan
 * nada y no dan error. Los nombres validos se leen del CSS generado, asi un rol eliminado o mal
 * escrito se detecta aqui.
 */
const definidos = (prefijo) => new Set([...css.matchAll(new RegExp(`--${prefijo}-([a-z0-9-]+):`, "g"))].map((m) => m[1]));
const colores = definidos("color");
const tamanos = definidos("text");
const radios = definidos("radius");
const sombras = definidos("shadow");
const TEXTO_NATIVO = new Set(["left", "center", "right", "justify", "start", "end", "wrap", "nowrap", "balance", "pretty", "ellipsis", "clip", "transparent", "current", "inherit"]);

const reNombre = (utilidad) =>
  new RegExp(`(?<![\\w-])(?:[a-z-]+:)*!?${utilidad}-([a-z][a-z0-9-]*?)(?:\\/\\d+)?(?![\\w:-])`, "g");
const clasesDesconocidas = [
  {
    patron: reNombre("text"),
    valido: (n) => colores.has(n) || tamanos.has(n) || TEXTO_NATIVO.has(n),
    ayuda: `clase inexistente (no pinta nada) → tamaños: ${[...tamanos].filter((t) => !t.includes("--")).join(", ")}`,
  },
  {
    patron: reNombre("rounded(?:-[trblse]{1,2})?"),
    valido: (n) => radios.has(n) || n === "full" || n === "none",
    ayuda: `radio inexistente → ${[...radios].join(", ")}, full, none`,
  },
  {
    patron: reNombre("shadow"),
    valido: (n) => sombras.has(n) || n === "none" || colores.has(n),
    ayuda: `sombra inexistente → ${[...sombras].join(", ")}, none`,
  },
];

for (const archivo of recorrer(path.join(raiz, "src"))) {
  const relativo = path.relative(raiz, archivo).split(path.sep).join("/");
  const lineas = sinComentarios(fs.readFileSync(archivo, "utf8")).split("\n");
  lineas.forEach((linea, i) => {
    const marcados = new Set();
    for (const { patron, ayuda } of reglas) {
      for (const m of linea.matchAll(patron)) {
        marcados.add(m.index);
        problemas.push(`${relativo}:${i + 1}  «${m[0]}»  ${ayuda}`);
      }
    }
    for (const { patron, valido, ayuda } of clasesDesconocidas) {
      for (const m of linea.matchAll(patron)) {
        if (valido(m[1]) || marcados.has(m.index)) continue;
        problemas.push(`${relativo}:${i + 1}  «${m[0]}»  ${ayuda}`);
      }
    }
  });
}

if (problemas.length) {
  console.error(`Tokens: ${problemas.length} problema(s)\n\n${problemas.join("\n")}`);
  process.exit(1);
}
console.log("Tokens: OK");
