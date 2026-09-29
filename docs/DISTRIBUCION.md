# Distribución del kit — `@idce/kit`

> El repo tiene **dos salidas**: la **app de demos** (la guía de estilos que se abre en el
> navegador, `pnpm dev` → `dist-app`) y la **librería** que instalan los demás sistemas
> (`pnpm build:lib` → `dist`). El mismo código alimenta las dos, así que la guía nunca se
> desincroniza de lo que se publica.

## 1. Qué se publica

| Entra | No entra |
|---|---|
| `design/` (tokens, `temaAntd`, `generarCssTokens`) | `demos/` — la guía de estilos |
| `components/` y `components/charts/` | `modulos/`, `auth/`, `routes/`, `services/`, `interceptors/` |
| `shared/` completo (incluye `shared/analitica`) | `mocks/`, `config/`, `App.tsx`, `home.tsx`, `main.tsx` |
| `utils/`, `types/nivelRiesgo`, `hooks/useService`, `hooks/BreadcrumbContext` | `configContext` y `MenuPermissionsContext` (hablan con la API de la app) |
| `dist/tokens.css`, `dist/tokens-transicion.css`, `dist/base.css` y `dist/shell.css` | `public/` |

La superficie pública es **`src/lib.ts`**. Una pieza que no esté exportada ahí no llega a los
demás sistemas, aunque exista en el repo.

## 2. Generar el paquete

```bash
pnpm build:lib     # JS + tipos + CSS en dist/
pnpm pack          # idce-kit-<version>.tgz (ejecuta build:lib antes, vía prepack)
```

`scripts/construirLib.mjs` hace, en orden:

1. `vite build -c vite.lib.config.ts`: un `.js` por módulo (`preserveModules`), con sourcemaps.
   Así, quien importe solo `ExcelButton` no arrastra ECharts ni exceljs.
2. `tsc -p tsconfig.lib.json`: los `.d.ts` en `dist/types`.
3. Reescribe el alias `@/…` de los `.d.ts` a rutas relativas: el sistema que instala el paquete
   no tiene ese alias y TypeScript no resolvería los tipos.
4. Escribe los CSS: `tokens.css` (generado desde `tokens.ts`), `shell.css` (comunes) y
   `base.css` = `shell.css` + `iframe.css` (densidad 90 % y lienzo blanco). Se concatenan en vez de
   usar `@import` entre ellos, porque Tailwind v4 puede descartar esos imports.
5. Deriva `tokens-transicion.css` del `tokens.css` recién escrito: el mismo archivo sin las 4 líneas
   de reinicio (`--color-*`, `--text-*`, `--radius-*`, `--shadow-*: initial`) y con una cabecera que
   lo explica. No duplica ningún valor, y el build **falla** si no encuentra exactamente esas 4 líneas.

Las dependencias del consumidor (React, antd, ECharts, exceljs…) son
**`peerDependencies`**: quedan fuera del paquete, no se duplican en su bundle y evitan dos copias
de React. Siguen en `devDependencies` para que la app de demos funcione.

## 3. Instalar en otro sistema

Hoy se reparte como **tarball**. Pasarle el `.tgz` al compañero y, en su proyecto:

```bash
pnpm add ./idce-kit-0.8.0.tgz
```

Requisitos del proyecto destino: **React 18 o 19, antd 6, Tailwind 4 y Vite**, más las demás
`peerDependencies`. Las dos que más varían entre sistemas:

| Peer | Rango | Nota |
|---|---|---|
| `react-router-dom` | `^6.30.0 \|\| ^7.0.0` | Lo publicado solo usa `useNavigate` y `useLocation` (`BreadcrumbNav`) |
| `echarts` | `^5.6.0 \|\| ^6.0.0` | Con 6, pnpm avisa de que `echarts-for-react` 3.0.2 (anclado) pide ECharts ≤ 5: es esperado, pinta igual |

En su CSS principal:

```css
@import "tailwindcss";

/* Tailwind tiene que ver las clases que usan los componentes del kit ya compilados. */
@source "../node_modules/@idce/kit/dist";

@import "@idce/kit/tokens.css";   /* roles: text-cuerpo, bg-superficie, rounded-contenedor… */
```

**Qué CSS de tokens importar** (uno de los dos, nunca ambos):

| Consumidor | Importa | Qué pasa con lo de Tailwind |
|---|---|---|
| Ya alineado al sistema, o proyecto nuevo | `@idce/kit/tokens.css` | **Estricto**: borra la paleta y las escalas por defecto. `text-gray-500`, `text-sm`, `rounded-lg` o `shadow-md` no generan nada; solo existen los roles |
| **Migrando** vistas con clases por defecto | `@idce/kit/tokens-transicion.css` | Mismo archivo **sin** el reinicio: los roles del kit y la paleta/escalas de Tailwind conviven. `--spacing` sigue en 4px |

`tokens-transicion.css` es temporal: cuando no quede ninguna clase por defecto en el sistema, se
cambia el import por `tokens.css` ([TOKENS.md §1](TOKENS.md), [ADOPCION.md §3](ADOPCION.md)).

Y en `main.tsx` (no solo como `@import` en el CSS: Tailwind v4 puede descartar
`@idce/kit/base.css` al empaquetar). **Qué CSS base importar depende de dónde vive la app:**

| App | Importa | Qué trae |
|---|---|---|
| Satélite que se abre **dentro del iframe** | `@idce/kit/base.css` | Comunes + densidad 90 % + lienzo blanco |
| **Shell** (SSO) | `@idce/kit/shell.css` | Solo comunes: tipografía base, scrollbars, selección, foco. Sin densidad ni fondo: el shell tiene su gutter gris (`lienzo`) |

```tsx
import "@idce/kit/base.css";      /* en una app del iframe; en el SSO: "@idce/kit/shell.css" */
import { ConfigProvider } from "antd";
import { temaAntd } from "@idce/kit";

<ConfigProvider theme={temaAntd}>…</ConfigProvider>
```

> Sin el `@source`, las utilidades que usan los componentes del kit (`text-tinta-secundaria`,
> `rounded-tarjeta`…) no se generan y todo se ve sin estilos. Es el error más común.

Y a usarlo:

```tsx
import { TarjetaGrafica, RejillaGraficas, MiniGrafica, ExcelButton, color } from "@idce/kit";
```

En `vite.config.ts` del consumidor, para no duplicar React al linkear el kit:

```ts
resolve: { dedupe: ["react", "react-dom"] },
```

> **No** añadir `optimizeDeps: { exclude: ["@idce/kit"] }`. Sin pre-empaquetar el kit, Vite
> tampoco pre-empaqueta sus dependencias CommonJS (locale de antd, `file-saver`,
> `echarts-for-react`…) y la app no arranca (`does not provide an export named 'default'`). Solo
> funciona si la app importa esas mismas dependencias por su cuenta, y se rompe con la primera que
> no. Con `link:` (§4) tampoco hace falta. Este y otros errores de configuración:
> [ADOPCION.md §5](ADOPCION.md).

## 4. Trabajar en paralelo con otro sistema

Para no rehacer el `.tgz` en cada cambio, en la máquina donde estén los dos repos:

```bash
pnpm add "link:../ruta/al/react_IDC_starterKit"   # en el proyecto destino
pnpm --filter … build:lib                          # tras cada cambio del kit
```

Vite no pre-empaqueta un paquete linkeado (su ruta real queda fuera de `node_modules`): sirve el
`dist/` del kit como código fuente y recarga en caliente al reconstruirlo. No hace falta ningún
`optimizeDeps`.

En máquinas distintas (el caso del compañero) el ciclo es: cambiar el kit → `pnpm pack` → pasarle
el `.tgz` → `pnpm add ./idce-kit-<version>.tgz`. **Subir siempre la versión** aunque sea un cambio
pequeño: pnpm cachea por versión y si no cambia se queda con la copia vieja.

## 5. Versionado

Semver, con el criterio de siempre:

| Cambio | Versión |
|---|---|
| Pieza nueva o prop opcional nueva | **menor** (0.4.0 → 0.5.0) |
| Arreglo sin cambiar la API | **parche** (0.3.0 → 0.3.1) |
| Prop obligatoria nueva, renombre o pieza retirada | **mayor** (aún en 0.x, se anota en grande en el CHANGELOG) |

Ejemplo de la vida real: hacer `onDescargar` obligatorio en `TablaDatosModal` (regla de que
"Ver datos" siempre lleva Excel) rompe a quien lo usaba sin descarga. Ese cambio se anuncia.

```bash
npm version minor        # sube package.json y crea el tag
git push --follow-tags
```

Anotar cada versión en [CHANGELOG.md](../CHANGELOG.md).

## 6. Añadir una pieza nueva al kit

El flujo que seguimos (así es como entraron `RejillaGraficas`, `MiniGrafica` y `BloqueDetalle`):

1. **Detectarla** en un sistema real: algo que ya se repite, no algo que "podría servir".
2. Crearla en el kit con **tokens** (nada de hex ni tamaños sueltos; `pnpm lint` lo verifica).
3. **Exportarla en `src/lib.ts`** (y en el barrel de `shared/analitica` si vive ahí).
4. **Demo viva** en la pestaña que corresponda, con `GuiaUso`: cuándo usarla y cuándo no.
5. **Documentarla** en `VISTAS_ANALITICAS.md` o `IDENTIDAD_VISUAL.md`.
6. `pnpm lint` + `pnpm build:lib`, subir versión, CHANGELOG y repartir el `.tgz`.

## 7. La plantilla usa su propia librería

Este repo es tres cosas: la **librería** (`design/`, `components/`, `shared/`, `utils/`), la **guía
de estilos** (`demos/`) y la **plantilla** para arrancar proyectos (`App.tsx`, `main.tsx`, `auth/`,
`routes/`, `services/`, `interceptors/`, `config/`, `modulos/`, `public/config/`).

La guía y la plantilla importan el kit **por su nombre**, igual que cualquier sistema que lo instala:

```tsx
import { CrudTable, PageHeader, TarjetaGrafica, color } from "@idce/kit";
```

Dentro de este repo ese nombre es un alias a `src/lib.ts` (`vite.config.ts` y `tsconfig.app.json`).
ESLint lo hace cumplir en los dos sentidos: la plantilla no puede importar `@/components/…` ni
`@/shared/…`, y la librería no puede importar `@idce/kit` ni nada de la app. Si una pieza nueva no se
exporta en `src/lib.ts`, la guía deja de compilar: es la señal de que tampoco llegaría a los demás
sistemas.

## 8. Arrancar un proyecto nuevo desde la plantilla

Mientras no exista el script `crear-proyecto`, a mano:

1. Copiar el repo y **borrar la librería y la guía**: `src/design`, `src/components`, `src/shared`,
   `src/utils`, `src/types/nivelRiesgo.ts`, `src/hooks/useService.tsx`,
   `src/hooks/BreadcrumbContext.tsx`, `src/hooks/useStackedModalZIndex.ts`, `src/lib.ts`,
   `src/demos`, `src/mocks`, `vite.lib.config.ts`, `tsconfig.lib.json`, `scripts/construirLib.mjs`.
2. `pnpm add ./idce-kit-<versión>.tgz` (o del feed, §9).
3. Quitar la línea `"@idce/kit"` del alias en `vite.config.ts` y de `paths` en `tsconfig.app.json`.
4. En `src/index.css`, cambiar los `@import` de `./design/…` por los del paquete (§3) y añadir el
   `@source` de `node_modules/@idce/kit/dist`.
5. `pnpm lint && pnpm build`. Ningún import de la app cambia.

Lo que queda es exactamente la arquitectura del equipo: módulos por dominio, configuración en
runtime (`routes.json`), capa HTTP con interceptores, guards de auth y un CRUD de referencia.

## 9. Cuando exista el feed de Azure Artifacts

El código ya está listo; solo cambia el reparto. **Feed con alcance de proyecto**, dentro del
proyecto *Starter Kit React* (es lo que Microsoft recomienda y no hace falta ningún permiso de
organización). Los sistemas de otros proyectos lo consumen igual.

1. **Crear el feed:** *Starter Kit React → Artifacts → Create Feed*, nombre `idce-kit`,
   **Scope: Project**. Quien lo crea queda como *Feed Owner*. (Si el botón está deshabilitado, lo
   habilita un administrador en *Azure Artifacts settings → Who can create feeds*.)
2. **Compartirlo con los otros proyectos:** *Feed settings → Views → @Release → Edit →*
   visibilidad **People in my organization**. Quien consume instala desde esa vista
   (`idce-kit@Release`) sin tener que ser miembro del proyecto del kit. Cada versión que se quiera
   repartir se **promueve** a `@Release` (Feed Publisher u Owner).
3. **En `package.json` del kit:** quitar `"private": true` y añadir
   `"publishConfig": { "registry": "https://pkgs.dev.azure.com/idceconsulting/Starter%20Kit%20React/_packaging/idce-kit/npm/registry/" }`.
4. **`.npmrc` commiteado** (solo la dirección, sin secretos; solo `@idce/*` va al feed y lo público
   sigue en npmjs). No usar la línea `registry=…` que propone *Connect to feed*: manda todos los
   paquetes por el feed.
   - En cada **consumidor**, la vista `@Release` (solo ve lo promovido):
     `@idce:registry=https://pkgs.dev.azure.com/idceconsulting/Starter%20Kit%20React/_packaging/idce-kit@Release/npm/registry/`
   - En el **kit**, el feed completo (publica ahí, y `vsts-npm-auth` lee esta línea para saber a qué
     feed autenticar):
     `@idce:registry=https://pkgs.dev.azure.com/idceconsulting/Starter%20Kit%20React/_packaging/idce-kit/npm/registry/`
5. **Credenciales en cada máquina** (una vez, y de nuevo cuando npm devuelva 401): en Windows
   `vsts-npm-auth -config .npmrc`; en otros sistemas, un PAT con *Packaging → Read & write* en el
   `.npmrc` del usuario (nunca en el del proyecto).
6. `pnpm publish` en lugar de repartir el `.tgz`, promover a `@Release`, y los sistemas instalan
   `pnpm add @idce/kit@^0.8.0`. En 0.x el `^` no cruza de menor: `^0.7.0` **no** instala 0.8.0; hay que
   subir el rango a mano en cada versión menor.
7. **Pipelines de otros proyectos** (opcional): añadir su `[Proyecto] Build Service` al grupo
   *Readers* del proyecto *Starter Kit React* y al feed como *Feed and Upstream Reader*. Esto sí lo
   hace un administrador de *Starter Kit React*.
