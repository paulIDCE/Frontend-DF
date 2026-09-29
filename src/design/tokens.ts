/**
 * Tokens del design system IDCE — ÚNICA fuente de verdad visual.
 *
 * De aquí salen, sin copias a mano:
 * - las utilidades de Tailwind (`src/design/tokens.css`, GENERADO por `vite.config.ts`
 *   con `generarCssTokens`): `text-tinta-secundaria`, `bg-superficie-sutil`, `rounded-contenedor`…
 * - el tema de antd (`src/design/temaAntd.ts`);
 * - los valores que necesita JS: ECharts, SweetAlert2, exceljs, estilos en línea.
 *
 * Dos niveles:
 * 1. `primitivos`: escalas de color crudas. NO se usan en componentes, salvo
 *    `prussian-blue` para los fondos del shell y la paleta extendida documentada.
 * 2. Tokens por **rol** (`color`, `tipografia`, `radio`, `sombra`, `movimiento`): lo que se
 *    usa. Un rol = un valor. Si un valor nuevo no encaja en ningún rol, se discute el rol,
 *    no se escribe un hex.
 *
 * Reglas (verificadas por `pnpm tokens:verificar`, que corre dentro de `pnpm lint`):
 * - Nada de hex, `rgba()`, colores de la paleta por defecto de Tailwind (`text-gray-600`),
 *   tamaños `text-sm` / `text-[11px]`, `rounded-lg` ni `shadow-md` fuera de `src/design/`.
 *
 * Este archivo lo importa `vite.config.ts` (Node): debe ser TS puro, sin imports.
 *
 * Ver `docs/TOKENS.md`.
 */

/* ============================================================================
 * 1. Primitivos
 * ========================================================================== */

export const primitivos = {
  /**
   * Identidad corporativa — CAMBIA por cliente. Al clonar el kit para otro cliente se
   * reemplaza esta escala (y nada más de color).
   */
  prussianBlue: {
    50: "#ebf0fa",
    100: "#d6e1f5",
    200: "#aec3ea",
    300: "#85a5e0",
    400: "#5d87d5",
    500: "#3469cb",
    600: "#2a54a2",
    700: "#1f3f7a",
    800: "#152a51",
    900: "#0a1529",
    950: "#070f1c",
  },
  /**
   * Azul de las vistas internas — CONSTANTE del design system. Escala `blue` de Tailwind.
   *
   * Sale de medir los sistemas del ecosistema: dentro del iframe el azul escrito a mano es casi
   * siempre `blue-600` con `blue-700` de hover (cientos de usos), y el resto es el
   * `#1677ff` que antd pone por defecto (ΔE 5.5: se leen como el mismo azul). Se unifican en esta
   * escala, que además pasa AA con texto blanco (`#1677ff` no: 4.1:1).
   */
  azul: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  /**
   * Estados y descargas — escalas de Tailwind, la misma familia que `azul`. Antes eran tonos
   * oscurecidos a mano desde el tema anterior (croma 0.08–0.12) y junto al azul (0.215) se veían
   * apagados, de otro sistema. Mismo escalón que la acción: base 700, hover 800, activo 900.
   */
  verde: {
    50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e",
    600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d", 950: "#052e16",
  },
  ambar: {
    50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b",
    600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03",
  },
  rojo: {
    50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444",
    600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d", 950: "#450a0a",
  },
  /** Neutro único del sistema (gris azulado, combina con la identidad). Escala `slate` de Tailwind. */
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  /** Paleta extendida del ecosistema (acentos de marca). No se usa para estados ni para acción. */
  linen: {
    50: "#fff0e5", 100: "#ffe0cc", 200: "#ffc299", 300: "#ffa366", 400: "#ff8533", 500: "#ff6600",
    600: "#cc5200", 700: "#993d00", 800: "#662900", 900: "#331400", 950: "#240e00",
  },
  ivory: {
    50: "#f6f9eb", 100: "#edf3d8", 200: "#dbe7b1", 300: "#c9db8a", 400: "#b8cf63", 500: "#a6c33c",
    600: "#859c30", 700: "#637524", 800: "#424e18", 900: "#21270c", 950: "#171b08",
  },
  lightCyan: {
    50: "#e5fbff", 100: "#ccf7ff", 200: "#99f0ff", 300: "#66e8ff", 400: "#33e0ff", 500: "#00d9ff",
    600: "#00adcc", 700: "#008299", 800: "#005766", 900: "#002b33", 950: "#001e24",
  },
  babyBlueIce: {
    50: "#e5eeff", 100: "#ccdeff", 200: "#99bdff", 300: "#669cff", 400: "#337aff", 500: "#0059ff",
    600: "#0047cc", 700: "#003699", 800: "#002466", 900: "#001233", 950: "#000c24",
  },
} as const;

const p = primitivos;

/* ============================================================================
 * 2. Color por rol
 * ========================================================================== */

/**
 * Convención de variantes (todas las familias interactivas la siguen):
 * `base` reposo · `hover` · `activo` pulsado · `sutil` fondo tenue · `borde` borde tenue.
 * En las utilidades de Tailwind `base` no lleva sufijo: `bg-error`, `bg-error-sutil`.
 *
 * Contraste (WCAG AA): todo `base` usado como texto o como fondo de texto blanco da >= 4.5:1,
 * y el texto `base` sobre su propio `sutil` también. Los números están junto a cada valor.
 */
export const color = {
  /**
   * Marca y SHELL: header y menú lateral del SSO / de la app, scrollbars, selección de texto,
   * cabecera de las exportaciones. En las vistas, solo el título de página (`PageHeader`).
   * Cambia por cliente.
   */
  identidad: {
    base: p.prussianBlue[700], // 10.2:1 sobre blanco
    hover: p.prussianBlue[600],
    activo: p.prussianBlue[900],
    sutil: p.prussianBlue[50],
  },
  /** Enlaces de texto dentro de las vistas. Mismo azul que la acción: como texto pasa AA (5.2:1). */
  enlace: {
    base: p.azul[600],
    hover: p.azul[700],
    activo: p.azul[800],
  },
  /**
   * El azul de las vistas internas: lo que el usuario opera (botones, switches, foco, paginación,
   * pestañas, Segmented) y las cabeceras que se abren o cambian de vista (secciones colapsables,
   * `SectionHeader`). Todos los estados pasan AA con texto blanco, así que no hace falta una
   * variante "fuerte" para texto sobre azul.
   *
   * Decoración que NO se opera (franjas, barritas de acento, iconos de cabecera de página): usar
   * `sutil` / `borde` o `tinta`, no el azul pleno, para no confundirla con un control.
   */
  accion: {
    base: p.azul[600], // 5.2:1
    hover: p.azul[700], // 6.7:1 — más oscuro al pasar el mouse, el hover que ya usaban las vistas
    activo: p.azul[800], // 8.7:1
    sutil: p.azul[50],
    sutilHover: p.azul[100],
    borde: p.azul[200],
    bordeHover: p.azul[300],
  },

  /** Texto. */
  tinta: {
    base: p.slate[800], // 14.6:1
    secundaria: p.slate[600], // 7.6:1
    /** Mínimo para texto que se debe leer: 4.8:1. */
    tenue: p.slate[500],
    /** Solo texto no esencial o deshabilitado e iconos decorativos: 2.6:1. */
    deshabilitada: p.slate[400],
    inversa: "#ffffff",
  },
  /** Fondos. */
  superficie: {
    /** Tarjetas, contenedores, modales. */
    base: "#ffffff",
    /** Cabeceras de tabla, franjas, filas de total. */
    sutil: p.slate[50],
    /** Pistas (Segmented), filas agrupadoras, zonas hundidas. */
    hundida: p.slate[100],
  },
  /**
   * Gutter del shell SSO: el margen gris entre el layout (header/sidebar) y el iframe.
   * El contenido dentro del iframe es `superficie`, no esto.
   */
  lienzo: p.slate[200],
  /** Bordes y separadores. */
  linea: {
    base: p.slate[200],
    sutil: p.slate[100],
    /** Separadores verticales y bordes de controles. */
    fuerte: p.slate[300],
  },
  /** Fondo detrás de un modal a pantalla completa. */
  velo: "rgb(15 23 42 / 0.8)",

  /**
   * Estados. Un solo valor por estado para botones, diálogos, KPIs, variaciones y gráficas.
   * Familias de Tailwind, igual que la acción: `sutil` = 50, `borde` = 200, hover un tono más oscuro.
   * Todo en AA (blanco sobre base / hover / activo; texto base sobre su `sutil`).
   *
   * Error va un escalón más oscuro (800) que éxito y advertencia (700): así se separa del ámbar
   * también por claridad, que es lo que queda con daltonismo rojo-verde.
   * Medido: visión normal ΔE >= 12.7 entre estados y >= 25 contra la acción; con daltonismo
   * advertencia/error 11.5 y éxito/advertencia 6.8 (franja mínima: legal porque un estado nunca
   * va solo por color, siempre con icono o texto).
   */
  exito: { base: p.verde[700], hover: p.verde[800], activo: p.verde[900], sutil: p.verde[50], borde: p.verde[200] }, // 5.0 / 7.1 / 9.1 · texto/sutil 4.8
  advertencia: { base: p.ambar[700], hover: p.ambar[800], activo: p.ambar[900], sutil: p.ambar[50], borde: p.ambar[200] }, // 5.0 / 7.1 / 9.1 · texto/sutil 4.8
  error: { base: p.rojo[800], hover: p.rojo[900], activo: p.rojo[950], sutil: p.rojo[50], borde: p.rojo[200] }, // 8.3 / 10.0 / 16.1 · texto/sutil 7.6

  /**
   * Botones de descarga: el color identifica el FORMATO del archivo, no un estado (por eso no
   * son `exito` / `error`). Excel verde oscuro, PDF rojo vivo: se distinguen del éxito (ΔE 8.4) y
   * del error (ΔE 14.4), y siempre llevan su icono y la palabra "Excel" / "PDF". AA en los tres estados.
   */
  excel: { base: p.verde[800], hover: p.verde[900], activo: p.verde[950] }, // 7.1 / 9.1 / 14.9
  pdf: { base: p.rojo[600], hover: p.rojo[700], activo: p.rojo[800] }, // 4.8 / 6.5 / 8.3

  /**
   * Visualización de datos. Paleta categórica validada (orden fijo = seguridad para daltonismo;
   * no reordenar ni ciclar). Serie 1 también colorea los KPIs de montos.
   * Validada sobre blanco: CVD adyacente >= 9.1, visión normal >= 19.6. Las series 3, 4 y 5
   * quedan bajo 3:1: toda gráfica ofrece etiquetas o "Ver datos" (`TarjetaGrafica`).
   * Los niveles de riesgo NO van aquí: sus colores vienen del backend.
   */
  datos: {
    series: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
    /** Celdas o puntos sin dato (distinto del primer nivel de riesgo). */
    sinDatos: p.slate[200],
    /** Ejes, rejilla y referencias. */
    eje: p.slate[400],
  },
} as const;

/* ============================================================================
 * 3. Tipografía
 * ========================================================================== */

export const tipografia = {
  familia: {
    sans: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    mono: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
  },
  /**
   * ESTÁNDAR TIPOGRÁFICO DEL ECOSISTEMA. Escala cerrada: `tamano` / `interlineado` en px.
   * En Tailwind: `text-cuerpo`, `text-rotulo`… En JS: `tipografia.escala.cuerpo.tamano`.
   *
   * Sale de medir los sistemas en producción: todos usan 14 px de cuerpo y
   * 12 px de apoyo (también antd y DevExtreme por defecto). El desorden estaba en títulos,
   * rótulos y gráficas (8, 9, 10, 13, 15, 20, 22 px…); esta escala lo cierra.
   *
   * Reglas:
   * - Mínimo absoluto 11 px. Nada de 7–10 px.
   * - La jerarquía se hace con PESO y COLOR antes que con tamaño: un título de tarjeta es
   *   `text-cuerpo font-semibold text-tinta`, no un tamaño nuevo.
   * - Gráficas: `rotulo` (ejes, etiquetas, leyenda) y `detalle` (tooltip). El título de la
   *   gráfica va en la cabecera HTML de `TarjetaGrafica`, no en el `title` de ECharts.
   * - Si algo no encaja, se discute el rol; no se agrega `text-[13px]`.
   */
  escala: {
    /** Rótulos en MAYÚSCULAS, ejes y etiquetas de gráficas, notas al pie. Mínimo del sistema. */
    rotulo: { tamano: 11, interlineado: 16 },
    /** Texto de apoyo: ayudas, pies de tarjeta, tooltips, leyendas (antd `fontSizeSM`). */
    detalle: { tamano: 12, interlineado: 16 },
    /** Todo lo demás: tablas, formularios, filtros, párrafos. Títulos de tarjeta en seminegrita (antd `fontSize`). */
    cuerpo: { tamano: 14, interlineado: 22 },
    /** Título de sección dentro de una página (antd `fontSizeLG`, `Title level={5}`). */
    subtitulo: { tamano: 16, interlineado: 24 },
    /** Título de página (`Title level={4}`). */
    titulo: { tamano: 18, interlineado: 26 },
    /** Valor principal de un KPI. */
    cifra: { tamano: 24, interlineado: 26 },
    /** Solo login y pantallas de error. */
    display: { tamano: 30, interlineado: 38 },
    /** Solo el código de error (404, 500). */
    hero: { tamano: 60, interlineado: 60 },
  },
  peso: { normal: 400, medio: 500, semibold: 600, bold: 700, black: 800 },
} as const;

/* ============================================================================
 * 4. Forma, profundidad y movimiento
 * ========================================================================== */

/** Radios en px. En Tailwind: `rounded-control`, `rounded-tarjeta`, `rounded-contenedor`, `rounded-full`. */
export const radio = {
  /** Marcas pequeñas: cuadros de leyenda, barra indicadora de pestaña. */
  marca: 2,
  /** Botones, inputs, chips de nivel (antd `borderRadius`). */
  control: 6,
  /** Tarjetas internas: gráficas, franjas, avisos (antd `borderRadiusLG`). */
  tarjeta: 8,
  /** Contenedor de página, vista analítica, KPI, modal a pantalla completa. */
  contenedor: 12,
} as const;

/** En Tailwind: `shadow-tarjeta`, `shadow-contenedor`, `shadow-elevada`. */
export const sombra = {
  /** KPIs y tarjetas sobre un contenedor. */
  tarjeta: "0 4px 12px rgb(15 23 42 / 0.05)",
  /** Contenedor de página (sobre `superficie` en el iframe; sobre `lienzo` en el gutter del SSO). */
  contenedor: "0 4px 6px -1px rgb(15 23 42 / 0.1), 0 2px 4px -2px rgb(15 23 42 / 0.1)",
  /** Capas flotantes: modales, overlays. */
  elevada: "0 10px 15px -3px rgb(15 23 42 / 0.1), 0 4px 6px -4px rgb(15 23 42 / 0.1)",
} as const;

/**
 * Duraciones en ms y curvas como puntos de control de `cubic-bezier`.
 * CSS: `var(--duracion-base)`, `ease-estandar`. framer-motion:
 * `{ duration: movimiento.duracion.base / 1000, ease: movimiento.curva.estandar }`.
 */
export const movimiento = {
  duracion: { rapida: 150, base: 250 },
  curva: { estandar: [0.2, 0, 0, 1] },
} as const;

/** Alturas de controles (botones, inputs, selects) en px a escala 100 %. `temaAntd` las pasa por `scalePx`. */
export const control = {
  alto: { sm: 24, base: 32, lg: 40 },
} as const;

/**
 * Densidad de las vistas en el iframe: ≈ zoom 90 % del navegador, a escala 100 %.
 * No usar `zoom` ni `transform: scale` (rompe iframe SSO, getBoundingClientRect y Firefox).
 * `html { font-size }` en `iframe.css` (dentro de `@idce/kit/base.css`) usa este valor; antd lo aplica con `scalePx`.
 */
export const DENSIDAD_UI = 0.9;

/** Píxeles de diseño → píxeles pintados a `DENSIDAD_UI`. */
export const scalePx = (px: number) => Math.round(px * DENSIDAD_UI);

/**
 * Espaciado: la unidad es 4 px (la escala numérica de Tailwind `p-1` = 4 px y el `sizeUnit` de antd).
 * Estos son los valores de maquetación con nombre. Para más densidad se reduce el relleno
 * (`size="small"` en tablas y controles), nunca el tamaño de letra.
 */
export const espacio = {
  unidad: 4,
  /** Separación entre tarjetas de una rejilla (KPIs, gráficas). */
  rejilla: 12,
  /** Relleno interno de un contenedor de página. */
  contenedor: 16,
} as const;

/* ============================================================================
 * Utilidades
 * ========================================================================== */

/** `#1d4ed8` + 0.15 → `rgb(29 78 216 / 0.15)`. Para transparencias en ECharts. */
export const conAlfa = (hex: string, alfa: number): string => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alfa})`;
};

/** `#1f3f7a` → `FF1F3F7A`, el ARGB que espera exceljs. */
export const argb = (hex: string): string => `FF${hex.replace("#", "").toUpperCase()}`;

/** Cabecera de las exportaciones a Excel (`useExcelExport`, `exportarExcel`, estadísticas). */
export const excelCabecera = {
  relleno: argb(color.identidad.base),
  texto: argb(color.tinta.inversa),
} as const;
