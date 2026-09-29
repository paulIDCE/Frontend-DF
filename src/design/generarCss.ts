import { color, DENSIDAD_UI, espacio, movimiento, primitivos, radio, sombra, tipografia } from "./tokens";

/**
 * Convierte `tokens.ts` en el bloque `@theme` de Tailwind v4 (`src/design/tokens.css`).
 * Lo llama el plugin `tokens` de `vite.config.ts` al arrancar dev y build: el CSS nunca se
 * edita a mano.
 *
 * `--color-*: initial` y compañía BORRAN la paleta, los tamaños, radios y sombras por defecto
 * de Tailwind: `text-gray-600` o `rounded-lg` dejan de existir y solo quedan las utilidades
 * del sistema. `pnpm tokens:verificar` avisa si alguien las escribe igual.
 *
 * El paquete publica además `tokens-transicion.css`: este mismo CSS sin esas 4 líneas de
 * reinicio, para sistemas que migran poco a poco (lo deriva `scripts/construirLib.mjs`).
 */

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** `{ base, hover, sutilHover }` bajo `error` → `--color-error`, `--color-error-hover`, `--color-error-sutil-hover`. */
const variables = (prefijo: string, valor: unknown): [string, string][] => {
  if (typeof valor === "string" || typeof valor === "number") return [[prefijo, String(valor)]];
  if (Array.isArray(valor)) return valor.flatMap((v, i) => variables(`${prefijo}-${i + 1}`, v));
  return Object.entries(valor as Record<string, unknown>).flatMap(([clave, v]) =>
    variables(clave === "base" ? prefijo : `${prefijo}-${kebab(clave)}`, v),
  );
};

export const generarCssTokens = (): string => {
  const { series, ...datos } = color.datos;
  const roles = Object.fromEntries(Object.entries(color).filter(([rol]) => rol !== "datos"));

  const bloques: [string, [string, string][]][] = [
    [
      "Reinicio: solo existen los tokens del sistema",
      [
        ["--color-*", "initial"],
        ["--text-*", "initial"],
        ["--radius-*", "initial"],
        ["--shadow-*", "initial"],
      ],
    ],
    [
      "Primitivos (solo shell y paleta extendida; en componentes usar roles)",
      Object.entries(primitivos)
        .filter(([nombre]) => !["slate", "azul", "verde", "ambar", "rojo"].includes(nombre))
        .flatMap(([nombre, escala]) => variables(`--color-${kebab(nombre)}`, escala)),
    ],
    ["Color por rol", Object.entries(roles).flatMap(([rol, v]) => variables(`--color-${kebab(rol)}`, v))],
    [
      "Datos",
      [
        ...variables("--color-serie", series),
        ...Object.entries(datos).flatMap(([k, v]) => variables(`--color-${kebab(k)}`, v)),
      ],
    ],
    [
      "Tipografía",
      [
        ["--font-sans", tipografia.familia.sans],
        ["--font-mono", tipografia.familia.mono],
        ...Object.entries(tipografia.escala).flatMap(([nombre, { tamano, interlineado }]): [string, string][] => [
          [`--text-${nombre}`, `${tamano}px`],
          [`--text-${nombre}--line-height`, `${interlineado}px`],
        ]),
      ],
    ],
    ["Densidad del iframe (≈ zoom 90 %, sin CSS zoom)", [["--densidad-ui", String(DENSIDAD_UI)]]],
    ["Espaciado (paso de p-*, m-*, gap-*, w-*, h-*)", [["--spacing", `${espacio.unidad}px`]]],
    ["Radios", Object.entries(radio).map(([k, v]): [string, string] => [`--radius-${k}`, `${v}px`])],
    ["Sombras", Object.entries(sombra).map(([k, v]): [string, string] => [`--shadow-${k}`, v])],
    [
      "Movimiento",
      [
        ...Object.entries(movimiento.curva).map(([k, v]): [string, string] => [`--ease-${k}`, `cubic-bezier(${v.join(", ")})`]),
        ...Object.entries(movimiento.duracion).map(([k, v]): [string, string] => [`--duracion-${k}`, `${v}ms`]),
      ],
    ],
  ];

  const cuerpo = bloques
    .map(([titulo, vars]) => `  /* ${titulo} */\n${vars.map(([n, v]) => `  ${n}: ${v};`).join("\n")}`)
    .join("\n\n");

  return `/* ==========================================================================
   GENERADO desde src/design/tokens.ts por vite.config.ts — NO EDITAR A MANO.
   Cambiar el token en tokens.ts; este archivo se reescribe al arrancar dev o build.
   ========================================================================== */

/* \`static\`: todas las variables se emiten en :root aunque ninguna clase las use, para que
   el CSS global (scrollbars, foco) pueda leerlas con var(). */
@theme static {
${cuerpo}
}

/* Tailwind no expone --densidad-ui desde @theme (no es un namespace suyo). */
:root {
  --densidad-ui: ${DENSIDAD_UI};
}
`;
};
