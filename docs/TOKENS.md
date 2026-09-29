# Tokens del design system

> **Una sola fuente de verdad:** [`src/design/tokens.ts`](../src/design/tokens.ts).
> Todo color, tamaño de texto, radio, sombra y duración del kit sale de ahí. Ni hex en
> componentes, ni `text-gray-600`, ni `rounded-lg`: **roles**.

---

## 1. Cómo fluye un token

```
src/design/tokens.ts ──► generarCss.ts ──► src/design/tokens.css  (@theme de Tailwind, GENERADO)
         │                                        └─► utilidades: text-tinta-secundaria, rounded-contenedor…
         ├──► temaAntd.ts ──► App.tsx (ConfigProvider de antd)
         └──► import directo en JS: ECharts, SweetAlert2, exceljs, estilos en línea de KpiCard
```

- `tokens.css` lo escribe el plugin `idce-tokens` de `vite.config.ts` al arrancar `pnpm dev` o
  `pnpm build`. Editar `tokens.ts` reinicia el servidor y regenera el CSS. **No se edita a mano.**
- El `@theme` generado **borra** la paleta, los tamaños, radios y sombras por defecto de Tailwind
  (`--color-*: initial`…). `text-gray-600` o `shadow-md` ya no pintan nada.
- **Modo transición** (solo en el paquete): `@idce/kit/tokens-transicion.css` es el mismo CSS **sin**
  ese bloque de reinicio, para un sistema que migra vistas con clases por defecto: los roles
  del kit y `text-gray-600`/`shadow-md` conviven, y `--spacing` sigue en 4px. Lo deriva
  `scripts/construirLib.mjs` del `tokens.css` generado (no repite valores). Ningún rol del kit
  choca con un nombre por defecto de Tailwind 4 en color, texto, radio o sombra. Al terminar la
  migración se cambia por `tokens.css` ([DISTRIBUCION.md §3](DISTRIBUCION.md)).
- `pnpm lint` corre `pnpm tokens:verificar`, que falla si `tokens.css` está desactualizado o si
  algún archivo de `src/` (salvo `src/design/` y `src/mocks/`) usa un valor suelto: hex, `rgba()`,
  colores o tamaños por defecto de Tailwind, `fontSize: 12`, `borderRadius: 6` o `boxShadow` en línea.

| Script | Qué hace |
|---|---|
| `pnpm tokens:generar` | Reescribe `tokens.css` (dev y build ya lo hacen solos) |
| `pnpm tokens:verificar` | Falla con la lista de valores sueltos y el token que corresponde |

---

## 2. Color por rol

Convención de variantes: `base` · `hover` · `activo` (pulsado) · `sutil` (fondo tenue) · `borde`.
En Tailwind `base` no lleva sufijo. En TS: `color.error.base`, `color.error.sutil`.

### Marca y acción

| Rol | Tailwind | Valor | Para qué |
|---|---|---|---|
| Identidad | `bg-identidad`, `text-identidad`, `-hover`, `-activo`, `-sutil` | prussian 700 `#1f3f7a` (10.2:1) | **Shell y marca**: header y menú lateral, scrollbars, `::selection`, cabecera de Excel. **Cambia por cliente.** |
| Acción | `bg-accion`, `text-accion`, `-hover`, `-activo`, `-sutil`, `-borde` | **blue-600 `#2563eb`** (5.2:1) · hover blue-700 `#1d4ed8` (6.7:1) · activo blue-800 `#1e40af` (8.7:1) | **El azul de las vistas internas**: botones, switches, foco, paginación, pestañas, Segmented, cabeceras que se abren (secciones, `SectionHeader`). **Constante.** |
| Enlace | `text-enlace`, `-hover`, `-activo` | = acción (blue-600) | Links de texto dentro de las vistas (antd `colorLink`) |

> **Regla:** **prussian = shell** (lo que rodea al iframe); **blue-600 = vistas internas** (lo que
> se abre en el iframe). Dentro de una vista no se usa prussian.
>
> **De dónde sale.** Se midieron los sistemas del ecosistema. Prussian solo aparece en el shell; en
> las vistas del iframe no se usa. Dentro del iframe el azul escrito a mano es la familia Tailwind
> blue: `blue-600` base y `blue-700` hover, con cientos de clases. El resto es el `#1677ff` que antd pone
> sin tema (ΔE 5.5 con blue-600: se leen como el mismo azul). Se unifican en blue-600, que además
> pasa AA con texto blanco (`#1677ff` no: 4.1:1), así que ya no hace falta una variante "fuerte".
>
> **Decoración que no se opera** (franjas, barritas de acento, iconos de cabecera de página): `accion-sutil`,
> `accion-borde` o `tinta`, nunca el azul pleno, para no confundirla con un control.

### Neutros (escala `slate`, única)

| Rol | Tailwind | Valor | Para qué |
|---|---|---|---|
| Tinta | `text-tinta` | slate 800 (14.6:1) | Texto principal, títulos de sección y tarjeta |
| Tinta secundaria | `text-tinta-secundaria` | slate 600 (7.6:1) | Subtítulos, texto de apoyo |
| Tinta tenue | `text-tinta-tenue` | slate 500 (4.8:1) | Rótulos, pies. **Mínimo para texto que se lee** |
| Tinta deshabilitada | `text-tinta-deshabilitada` | slate 400 (2.6:1) | Solo deshabilitado e iconos decorativos |
| Tinta inversa | `text-tinta-inversa` | blanco | Texto sobre fondos oscuros |
| Superficie | `bg-superficie` | blanco | **Iframe**: html/body, contenedores, tarjetas, modales |
| Superficie sutil | `bg-superficie-sutil` | slate 50 | Cabeceras de tabla, franjas, totales |
| Superficie hundida | `bg-superficie-hundida` | slate 100 | Pistas, filas agrupadoras |
| Lienzo | `bg-lienzo` | slate 200 | **Gutter del SSO**: margen gris entre el layout (header/sidebar) y el iframe. No es el fondo de la app. |
| Línea | `border-linea`, `-sutil`, `-fuerte` | slate 200 / 100 / 300 | Bordes y separadores |
| Velo | `bg-velo` | slate 900 al 80 % | Detrás de un modal a pantalla completa |

### Estados

Un solo valor por estado para botones, diálogos, KPIs, variaciones (`Delta`) y umbrales de gráficas.
Todo en AA (texto blanco sobre base, hover y activo; texto `base` sobre su `sutil`).

**Misma familia que la acción** (escalas de Tailwind): `sutil` = 50, `borde` = 200, hover un tono
más oscuro. Antes eran tonos oscurecidos a mano desde el tema anterior y, junto al blue-600 (croma
0.215), se veían apagados (0.08–0.12). Error va un escalón más oscuro (800) que éxito y advertencia
(700) para separarse del ámbar también por claridad. Medido: visión normal ΔE ≥ 12.7 entre estados;
con daltonismo advertencia/error 11.5 y éxito/advertencia 6.8 (franja mínima, legal porque **un
estado siempre lleva icono o texto**).

| Rol | Tailwind | Base · hover · activo | Contraste (blanco) · texto sobre `sutil` |
|---|---|---|---|
| Éxito | `text-exito`, `bg-exito-sutil`, `border-exito-borde`… | green-700 `#15803d` · 800 · 900 | 5.0 / 7.1 / 9.1 · 4.8 |
| Advertencia | `text-advertencia`… | amber-700 `#b45309` · 800 · 900 | 5.0 / 7.1 / 9.1 · 4.8 |
| Error | `text-error`… | red-800 `#991b1b` · 900 · 950 | 8.3 / 10.0 / 16.1 · 7.6 |
| Info | = acción | blue-600 `#2563eb` · 700 · 800 | 5.2 / 6.7 / 8.7 · 4.75 |

### Formatos de archivo

| Rol | Valor | Uso |
|---|---|---|
| `excel` | green-800 `#166534` · hover 900 · activo 950 (7.1 / 9.1 / 14.9) | `ExcelButton` |
| `pdf` | red-600 `#dc2626` · hover 700 · activo 800 (4.8 / 6.5 / 8.3) | `PdfButton` |

Identifican el **formato**, no un estado: no se reemplazan por `exito` / `error`. Excel es más oscuro que
éxito (ΔE 8.4) y PDF más vivo que error (ΔE 14.4); siempre llevan su icono y la palabra "Excel" / "PDF".

### Datos

| Rol | Tailwind / TS | Para qué |
|---|---|---|
| Series 1–8 | `bg-serie-1`… / `color.datos.series` | Paleta categórica en **orden fijo** (no reordenar ni ciclar). `TarjetaGrafica` la aplica por defecto |
| Sin datos | `bg-sin-datos` / `COLOR_SIN_DATOS` | Celdas y puntos sin valor |
| Eje | `color.datos.eje` | Ejes, referencias, líneas de umbral |

Validada sobre blanco: CVD adyacente ≥ 9.1, visión normal ≥ 19.6. Las series 3, 4 y 5 quedan bajo
3:1, así que toda gráfica debe ofrecer etiquetas o "Ver datos". Los colores de **niveles de riesgo
vienen del backend** y no son tokens.

**Roles de color para componentes** (`COLOR_ROL` en `src/design/colorRol.ts`): `accion`, `identidad`,
`exito`, `advertencia`, `error`, `tinta`, `neutro` (tinta tenue) y los de KPI `monto` (serie 1),
`riesgo`, `bueno`, `malo`. Los componentes que aceptan color reciben un `ColorKit` = uno de estos
roles **o** un color propio (ver IDENTIDAD_VISUAL §"Ajustes permitidos"). `COLOR_KPI` es el
subconjunto de KPI y da los mismos valores.

### Primitivos

`prussian-blue-*` (fondos del shell) y la paleta extendida `linen`, `ivory`, `light-cyan`,
`baby-blue-ice` siguen disponibles en Tailwind. `slate` y `azul` (escala blue de Tailwind) **no**: se
usan a través de sus roles (`tinta`, `linea`, `accion`…).

---

## 3. Tipografía — estándar del ecosistema

> **De dónde sale.** Se midieron los sistemas en producción. Todos coinciden en
> **14 px de cuerpo** y **12 px de apoyo** (también antd y DevExtreme por defecto). El desorden
> estaba en títulos, rótulos y gráficas: 7, 8, 9, 10, 13, 15, 20 y 22 px sin criterio, el mismo
> rótulo en cinco tamaños y ejes de gráficas en cinco más. Esta escala cierra eso.
>
> **Densidad 90 %.** Las vistas del iframe se pintan como si el navegador estuviera al 90 %,
> a escala 100 %: `DENSIDAD_UI` / `scalePx` en `tokens.ts`, `html { font-size: calc(100% * var(--densidad-ui)) }`
> en `iframe.css` (dentro de `@idce/kit/base.css`), y los px de antd en `temaAntd` (el título de cada vista, `Title level={4}`,
> pinta 16 px). No usar `zoom` ni `transform: scale`.
> La escala de roles (11 · 12 · 14…) se declara a 100 %; antd y el `rem` heredan la densidad.
> Tailwind `text-rotulo` se queda en 11 px (mínimo): no se pasa por `scalePx`.
>
> **Decisión (0.6.0): se mantiene así.** Medido en la guía a 1264 px:
>
> | Qué | Tamaño real |
> |---|---|
> | `html` | 14.4 px (90 % de 16) |
> | Texto de antd (botón, pestaña, celda) | 13 px · alto de control 29 px |
> | `text-cuerpo` / `text-detalle` (clases del kit) | 14 / 12 px |
> | `p-4`, radios, sombras | sin cambios (están en px) |
>
> O sea: la densidad la llevan **antd y lo que esté en `rem`**; los roles de Tailwind no. Escalar
> también los roles bajaría `rotulo` a 10 px, bajo el mínimo de 11. Si en un mismo bloque se nota la
> diferencia de 1 px entre un texto de antd y uno con `text-cuerpo`, usar el componente de antd o el
> rol, no mezclar. La densidad solo aplica **dentro del iframe** (`iframe.css`); el shell no la lleva.

Familia: `font-sans` (`system-ui, Avenir, Helvetica, Arial, sans-serif`) y `font-mono`.

| Rol (Tailwind) | px / interlineado | Cuándo | antd |
|---|---|---|---|
| `text-rotulo` | **11** / 16 | Rótulos en MAYÚSCULAS, ejes y etiquetas de gráficas, notas al pie. **Mínimo absoluto** | — |
| `text-detalle` | **12** / 16 | Texto de apoyo: ayudas, pies de tarjeta, tooltips, leyendas | `fontSizeSM` |
| `text-cuerpo` | **14** / 22 | Todo lo demás: tablas, formularios, filtros, párrafos. **Títulos de tarjeta: 14 seminegrita** | `fontSize` |
| `text-subtitulo` | **16** / 24 | Título de sección dentro de una página | `fontSizeLG`, `Title level={5}` |
| `text-titulo` | **18** / 26 | Título de página (también el de la barra de filtros de una vista analítica) | `Title level={4}` |
| `text-cifra` | **24** / 26 | Valor principal de un KPI | `Title level={3}` |
| `text-display` | 30 / 38 | Solo login y pantallas de error | `Title level={1..2}` |
| `text-hero` | 60 / 60 | Solo el código de error (404, 500) | — |

### Reglas

1. **Mínimo 11 px.** Nada de 7, 8, 9 ni 10 px, tampoco en gráficas.
2. **Jerarquía por peso y color antes que por tamaño.** Cuatro niveles con tres tamaños:
   | Nivel | Clases |
   |---|---|
   | Título de tarjeta | `text-cuerpo font-semibold text-tinta` |
   | Cuerpo | `text-cuerpo text-tinta` |
   | Apoyo | `text-detalle text-tinta-secundaria` |
   | Rótulo | `text-rotulo font-semibold uppercase text-tinta-tenue` |
3. **Gráficas: dos tamaños.** `rotulo` (11) para ejes, etiquetas de valor y leyenda (`TEXTO_GRAFICA`
   de `@/shared/analitica`); `detalle` (12) para el tooltip. **El título de la gráfica va en la
   cabecera HTML de `TarjetaGrafica`** (14 seminegrita), nunca en el `title` de ECharts.
4. **Títulos de antd fijados** en la escala (`temaAntd.ts`): sin eso antd deriva 38/30/24/20/16 y
   mete tamaños fuera del sistema. En apps se usan `level={4}` (página) y `level={5}` (sección).
5. **Densidad global = `DENSIDAD_UI` (90 %).** Encima, `size="small"` en tablas y controles
   reduce relleno, no inventa tamaños de letra.
6. 13, 15, 20 y 22 px no existen. Si algo no encaja en un rol, se discute el rol.

Pesos: los de Tailwind (`font-medium`, `font-semibold`…); en JS, `tipografia.peso`.

---

## 4. Forma, profundidad, movimiento y espacio

| Tailwind | Valor | Para qué |
|---|---|---|
| `rounded-marca` | 2 px | Cuadros de leyenda, barra de pestaña |
| `rounded-control` | 6 px | Botones, inputs, chips (antd `borderRadius`) |
| `rounded-tarjeta` | 8 px | Gráficas, franjas, avisos (antd `borderRadiusLG`) |
| `rounded-contenedor` | 12 px | Contenedor de página, vista analítica, KPI, modal |
| `rounded-full` | — | Pastillas y avatares |
| `shadow-tarjeta` | suave | KPIs y tarjetas sobre un contenedor |
| `shadow-contenedor` | media | Contenedor sobre el lienzo |
| `shadow-elevada` | alta | Modales y overlays |
| `ease-estandar`, `var(--duracion-base)` | 250 ms | Transiciones (`movimiento` en framer-motion) |

**Alturas de control** (`control.alto` a 100 %): pequeño 24 · normal 32 · grande 40. En antd
se pintan con `scalePx` (22 · 29 · 36 a 90 %).

**Espacio:** unidad de 4 px (`espacio.unidad`: la escala numérica de Tailwind y el `sizeUnit` de
antd). Con nombre: `espacio.rejilla` = 12 (gutter de KPIs y gráficas) y `espacio.contenedor` = 16
(relleno de página). Los estilos en línea usan múltiplos de `espacio.unidad` (ver `KpiCard`), no
píxeles fijos.

---

## 5. Cómo se cambia algo

| Quiero… | Toco |
|---|---|
| La identidad de otro cliente | `primitivos.prussianBlue` en `tokens.ts`: cambia el shell; las vistas internas (acción) no se tocan |
| Un color de estado | `color.error` (etc.): mantener AA y recalcular `sutil` / `borde` |
| Un tamaño de texto | `tipografia.escala`; si hace falta un rol nuevo, se agrega el rol, no un `text-[13px]` |
| Un valor que no encaja en ningún rol | Se discute el rol primero |

Después: `pnpm lint` (incluye la verificación de tokens) y revisar las pestañas del kit.

---

## 6. Tabla de migración (clases viejas → roles)

| Antes | Ahora |
|---|---|
| `text-gray-900/800/700`, `text-slate-800/700` | `text-tinta` |
| `text-gray-600`, `text-slate-600` | `text-tinta-secundaria` |
| `text-gray-500/400`, `text-slate-500/400` | `text-tinta-tenue` |
| `text-white` / `bg-white` | `text-tinta-inversa` / `bg-superficie` |
| `bg-slate-50` / `bg-gray-100` / `bg-gray-200` | `bg-superficie-sutil` / `bg-superficie-hundida` / `bg-lienzo` |
| `border-gray-100` / `border-slate-200` / `bg-slate-300` | `border-linea-sutil` / `border-linea` / `bg-linea-fuerte` |
| `text-red-*`, `bg-red-50`, `border-red-200` | `text-error`, `bg-error-sutil`, `border-error-borde` |
| `text-emerald-*`, `text-green-*` | `text-exito` (y `-sutil`, `-borde`) |
| `text-amber-*` | `text-advertencia` |
| `text-blue-600` / `hover:text-blue-700`, `bg-blue-600` (iconos de sección, pestañas, botones, enlaces) | `text-accion` / `hover:text-accion-hover`, `bg-accion` |
| `text-blue-*`, `text-indigo-*` en títulos de sección/tarjeta | `text-tinta` (el azul de acción no es color de título) |
| `border-l-* border-blue-600`, `bg-blue-600 w-1` (franjas y barritas decorativas) | `border-accion-borde`, `bg-accion-borde` |
| `text-prussian-blue-*` **título de página** | `text-identidad` (`PageHeader`) |
| `text-prussian-blue-*` / `bg-prussian-blue-*` **resto de la vista** | `text-tinta` / `bg-accion` (prussian en vistas solo el título de página) |
| `#1677ff` (antd sin tema), `#1976d2`, `#337ab7` en controles | `accion` vía `temaAntd` |
| `bg-blue-50`, `border-blue-200` (resaltados, spinners) | `bg-accion-sutil`, `border-accion-borde` |
| `bg-black/80` | `bg-velo` |
| `text-xs` / `text-sm` / `text-base` / `text-lg`, `text-xl` / `text-2xl` / `text-3xl`, `text-4xl` / `text-6xl` | `text-detalle` / `cuerpo` / `subtitulo` / `titulo` / `cifra` / `display` / `hero` |
| `text-[7px]`…`text-[11px]` / `[12px]` / `[13px]` / `[15px]` / `[20px]`, `[22px]` | `text-rotulo` / `detalle` / `detalle` (apoyo) o `cuerpo` (contenido) / `subtitulo` / `titulo` o `cifra` según uso |
| `fontSize: 7…11` en ECharts / `fontSize: 12` en tooltips | `...TEXTO_GRAFICA` / `tipografia.escala.detalle.tamano` |
| `title` de ECharts | `titulo` de `TarjetaGrafica` |
| `rounded-sm` / `rounded` / `rounded-lg` / `rounded-xl`, `rounded-2xl` | `rounded-marca` / `control` / `tarjeta` / `contenedor` |
| `shadow-sm` / `shadow-md` / `shadow-lg` | `shadow-tarjeta` / `contenedor` / `elevada` |
| `palette.ts`: `IDENTITY`, `CTA`, `DESCARGA`, `EXCEL_HEADER_*` | `color.identidad`, `color.accion`, `color.excel` / `pdf`, `excelCabecera` |
| `COLOR_KPI.azul / ambar / verde / rojo / gris` | `COLOR_KPI.monto / riesgo / bueno / malo / neutro` |

### Cambios visibles de esta unificación

- Neutros de antd en slate (antes gris puro): textos, bordes y fondos algo más fríos.
- Estados hasta AA y separados por claridad; un único rojo de peligro (antes había cinco) y la
  advertencia en ámbar (antes naranja-rojo, casi igual al error).
- **Azul de acción = blue-600** (antes `#1677ff`): pestañas, Segmented, botones, enlaces y cabeceras de
  sección en blue-600 con hover blue-700. `accion-fuerte` desaparece (el base ya pasa AA). Prussian
  sale de las vistas salvo el título de página: `PageHeader` en `text-identidad`.
- Vistas analíticas: pestañas y Segmented en acción,
  KPIs de monto y series en la paleta de datos.
- Contenedor de página a 12 px (antes 16 en `PageContainer`).
- Textos de 10 px suben a 11 px. `#94a3b8` como texto (2.6:1) pasa a tinta tenue (4.8:1).
- Escala tipográfica cerrada (§3): títulos de antd fijados, título de gráfica 14 seminegrita en la
  cabecera, título de la barra de filtros 18, cifra de KPI 24 (antes 22).
- Diálogos (SweetAlert2): confirmar en `accion`, cancelar neutro (antes rojo), destructivo en `error`.

---

## 7. Guía para agentes: adoptar los tokens en un sistema existente

El kit es la **referencia**. Un agente que actualiza otro sistema sigue estos pasos (el orden de la
migración completa y los antipatrones a buscar: [ADOPCION.md](ADOPCION.md)):

1. **Traer la base** sin modificarla: `src/design/` (`tokens.ts`, `generarCss.ts`, `temaAntd.ts`),
   el plugin `idce-tokens` de `vite.config.ts`, `scripts/tokens.mjs` y los scripts `tokens:*` y
   `lint` de `package.json`. `src/index.css` importa `./design/tokens.css`; `App.tsx` monta
   `<AntdConfigProvider theme={temaAntd}>`.
   - Requiere **Vite + Tailwind 4**. En un sistema con CRA / Tailwind 3, primero se
     migra el build o se deja el tema de antd (`temaAntd`) y las constantes de JS, que no dependen
     de Tailwind.
2. **Correr `pnpm tokens:verificar`** para obtener la lista completa de valores sueltos con el rol
   que corresponde a cada uno.
3. **Migrar por vista, cuando se toca**, no todo el sistema de una vez. Usar la tabla del §6:
   primero clases (mecánico), después `fontSize`/colores en TS y opciones de ECharts (a mano,
   decidiendo el rol por uso: apoyo vs. contenido, sección vs. página).
4. **Decidir por uso, no por píxel**: un rótulo en MAYÚSCULAS de 9 px es `rotulo`, no "el más
   cercano a 9"; un título de tarjeta de 16 px es `cuerpo font-semibold`.
5. **Verificar**: `pnpm lint` en verde (incluye clases inexistentes, que Tailwind ignora en
   silencio) y la vista en el navegador a 1264 px.
6. **No crear tokens locales.** Si falta un rol, se agrega en el kit (`tokens.ts`) y de ahí se
   propaga; un sistema no define su propio tamaño ni color.
