# Análisis Financiero (Data Financiero)

Migración a Vite + React + `@idce/kit` del sitio estático **prueba-data**
("DATA FINANCIERO"): Entorno Macroeconómico, Sistema Financiero, Tasas de
Interés y Análisis Financiero por entidad.

> ⚠️ **Esta app NO es un satélite del SSO.** Parte del starter kit, pero tiene
> **login y shell propios** (header/nav/footer), se abre directo en el
> navegador y no dentro del iframe del SSO. Todo lo que el resto de este README
> dice sobre "el SSO es el shell" aplica al kit, no a esta app. Detalles,
> diferencias y pendientes: [docs/ARQUITECTURA_APP.md](docs/ARQUITECTURA_APP.md).

Datos: los JSON de `prueba-data/data` se copian a `public/data/` (≈2.3 GB, no
se versionan):

```bash
cp -r ../prueba-data/data/. public/data/
```

---

# IDCE React Starter Kit

Punto de partida para las **apps servidas** del ecosistema: satélites que se montan
dentro del shell del SSO. Trae ya implementadas las convenciones de
[docs/CONVENCIONES_FRONTEND.md](docs/CONVENCIONES_FRONTEND.md) — configuración en
runtime, capa HTTP, guards, paleta oficial y un CRUD de referencia — más un
catálogo navegable de componentes.

> **El SSO es el shell.** Esta app **no** trae Header ni Sidebar propios: los
> provee el host. Tampoco tiene pantalla de login; la sesión llega del SSO.

## Dos salidas: guía de estilos y librería

Este repo es a la vez la **guía de estilos navegable** (`pnpm dev`) y la **librería `@idce/kit`**
que instalan los demás sistemas (`pnpm build:lib` → `pnpm pack`). Lo que se publica sale de
`src/lib.ts`, y la propia guía y la plantilla la consumen por su nombre (`from "@idce/kit"`),
exactamente como cualquier proyecto. Cómo instalarlo en otro proyecto, versionarlo, añadirle piezas
y arrancar un proyecto nuevo desde la plantilla:
[docs/DISTRIBUCION.md](docs/DISTRIBUCION.md) · [CHANGELOG.md](CHANGELOG.md).

## Stack

| | |
|---|---|
| React 18.3 · TypeScript 5.9 | Vite 7 · pnpm 11 |
| Ant Design 6 · Tailwind CSS 4 | React Router 7 · Axios |
| ECharts 5 · ExcelJS | SweetAlert2 · React-Toastify |

## Arranque

```bash
pnpm install
```

```bash
pnpm dev
```

Abre <http://localhost:3000>. Las apps servidas usan **siempre** el puerto 3000 en
desarrollo (el SSO host usa el 3001).

### Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con HMR |
| `pnpm build` | `tsc -b && vite build` → `dist-app/` (la guía de estilos). **El chequeo de tipos es parte del build**, no opcional |
| `pnpm build:lib` | Construye la librería `@idce/kit` → `dist/` (JS, tipos y CSS) |
| `pnpm pack` | Genera `idce-kit-<version>.tgz` para instalar en otro sistema |
| `pnpm preview` | Sirve el build de producción |
| `pnpm lint` | ESLint (flat config) |
| `pnpm typecheck` | Solo tipos, sin generar bundle |

## Configuración: se carga en runtime, no en el build

Esta es la pieza central de la arquitectura. **Las URLs de las APIs no se
hornean en el bundle.** Al arrancar, `ConfigProvider` hace `fetch` de
`/config/routes.json` e inyecta las bases a los servicios y a las instancias
axios; hasta que resuelve, la app muestra un loader.

Así un **mismo bundle** sirve para todos los despliegues e instituciones: solo
cambia el JSON que sirve el servidor. No hay que recompilar por ambiente.

`public/config/routes.json`:

```json
{
  "VITE_API_URL": "http://localhost:5097/api",
  "VITE_BASE_URL": "http://localhost:5097/",
  "VITE_API_SSO_URL": "http://localhost:82/api",
  "VITE_BASE_SSO_URL": "http://localhost:82/"
}
```

`VITE_API_URL` es la API propia de la app; `VITE_API_SSO_URL` es la del SSO
(Empleado, Oficina, Catálogos y `validateToken`).

El `.env` solo lleva el puerto:

```dotenv
PORT=3000
```

> ⚠️ **Ningún servicio lee `import.meta.env`** para la URL de la API. La recibe
> por su `initializeXService(config)`. Si añades un servicio nuevo, **regístralo
> en el array `allServices`** de [`src/services/indexService.tsx`](src/services/indexService.tsx)
> o su `API_URL` quedará vacío.

## Capa HTTP

Dos instancias axios creadas por el mismo factory, en
[`src/interceptors/authInterceptor.ts`](src/interceptors/authInterceptor.ts):

- **`api`** → API propia de la app
- **`apiSSO`** → API del SSO

Ambas comparten token (`localStorage.authToken`), `withCredentials` y los
interceptores: inyectan `Bearer`, redirigen a `/500` si el backend no responde y
a `/login` ante un 401. **Nunca uses `axios` directo** para endpoints protegidos.

## Estructura

```
src/
├── auth/              guards (ProtectedRoute, AuthorizedRoute), frame y páginas de error
├── components/        componentes transversales reutilizables
├── config/            APP_CODE y rutas base
├── demos/             catálogo de componentes (visible en /home)
├── hooks/             configContext, BreadcrumbContext, MenuPermissionsContext, useService
├── interceptors/      authInterceptor (api / apiSSO)
├── modulos/           negocio: <Modulo>/<Menu>.tsx
├── routes/            índice único de rutas
├── services/          un servicio por dominio + indexService (registro)
├── types/             DTOs e interfaces
└── utils/             devLog, swalAlert, constants, useExcelExport
```

Nomenclatura del SSO: un **Modulo** agrupa varios **Menus**; cada Menu es una
página/ruta.

## Rutas y guards

Los Menus cuelgan de `/Modulos{APP_CODE}/*` bajo **doble guard**:

1. `ProtectedRoute` — autenticación contra `validateToken`
2. `AuthorizedRoute` — autorización por perfil vía `GetMenusByUser`

Ambos **fallan cerrado**: ruta no permitida → `/403`; sin ningún menú → `/401`.
La autorización real la impone el backend; el guard del front es defensa en
profundidad.

### Añadir un Menu nuevo

1. Crear `src/modulos/<Modulo>/<Menu>.tsx`
2. Declararlo como `lazy()` en [`src/routes/index.tsx`](src/routes/index.tsx)
3. Añadir su `<Route>` dentro del frame, envuelto en `AuthorizedRoute`
4. Registrarlo en el SSO con esa misma `ruta`, o el guard lo mandará a `/403`

Cambia `APP_CODE` en [`src/config/app.ts`](src/config/app.ts) por el código real
de tu app: es lo único que hay que tocar para renombrar el espacio de rutas.

## CRUD de referencia

[`src/modulos/Administracion/Configuracion.tsx`](src/modulos/Administracion/Configuracion.tsx)
es la plantilla a copiar. Reúne las seis piezas del estándar: `useService` para
los datos, hook *manager* por entidad, tabla y form popup separados, filtros con
`useMemo`, export con `useExcelExport` y breadcrumbs en un `useEffect` de montaje.

## Estilos

**Tokens del design system en [`src/design/tokens.ts`](src/design/tokens.ts)** — única fuente de
color, tipografía, radios, sombras y movimiento. De ahí salen el `@theme` de Tailwind 4
(`src/design/tokens.css`, generado por Vite; no hay `tailwind.config.js`) y el tema de antd
(`src/design/temaAntd.ts`, montado en `App.tsx`).

Usa roles: `text-tinta-secundaria`, `bg-superficie-sutil`, `text-error`, `text-cuerpo`,
`rounded-contenedor`. Nada de hex, `text-gray-*`, `text-sm` ni `rounded-lg`: el `@theme` generado
no los define y `pnpm lint` (que incluye `pnpm tokens:verificar`) los rechaza.
Referencia: [docs/TOKENS.md](docs/TOKENS.md).

## Convenciones de código

- **Logging**: `devLog` / `devGroup` — silenciosos fuera de desarrollo. Prohibido `console.log` crudo.
- **Feedback**: `swalAlert` para diálogos bloqueantes, `react-toastify` para notificaciones.
- **Estado async**: `data` inicia `undefined`; protégelo con `?? EMPTY_ARRAY` para evitar loops de render.
- **Tipado estricto**: DTOs en `src/types/`, `import type` para tipos.
- **Alias `@`** → `src/`.
- **Errores de backend**: `useService` expone `apiError`; píntalo con `shared/EstadoError`, no con un vacío.

## Gráficas y vistas analíticas

`src/shared/` trae el kit analítico (antd + ECharts). **Toda gráfica
se pinta con `TarjetaGrafica`** (`@/shared/analitica`): estadísticas, etiquetas,
ver datos, imagen y pantalla completa ya incluidas. Para dashboards y reportes,
`VistaAnalitica` + `BarraFiltros` + `TabsAnaliticas`.

Guía: [docs/VISTAS_ANALITICAS.md](docs/VISTAS_ANALITICAS.md). Ejemplos en la home,
pestañas **Gráficos** y **Vista analítica**.

Desde 0.4.0 el kit también trae `IdentityCell`, `AtributosCell`, `ChipNivel`,
`BarraListado`, `ColorSwatch` y `opcionesMatrizCalor`. Adoptar el kit en un
sistema existente (prerrequisitos, antipatrones, errores de configuración):
[docs/ADOPCION.md](docs/ADOPCION.md).

## Versiones ancladas

`echarts-for-react` está fijado en **3.0.2** sin `^`. De 3.0.3 en adelante crea
una instancia temporal sin option y espera un evento `'finished'` que nunca
llega: los gráficos quedan en blanco **sin error en consola**. Por eso `echarts`
se queda en la línea 5, que es la que admite el peer de 3.0.2. No subas ninguna
de las dos sin verificar visualmente que los charts pintan.

Eso vale para la guía. Los sistemas que instalan el kit pueden usar ECharts 5.6+ o 6
(peer `^5.6.0 || ^6.0.0`, verificado con 6.1.0): pnpm avisará de que el peer de
`echarts-for-react` 3.0.2 pide ECharts ≤ 5, y es esperado.

## Despliegue

`pnpm build` genera **`dist/`**. Configura el servidor (IIS/nginx) con rewrite
de SPA hacia `index.html` para que las rutas profundas funcionen al recargar, y
sirve el `config/routes.json` del ambiente correspondiente.
