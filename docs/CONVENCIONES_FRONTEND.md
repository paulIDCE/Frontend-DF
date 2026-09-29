# Arquitectura y Reglas del Frontend — Estándar del Equipo

> **Documento canónico.** Estas son las reglas que seguimos de aquí en adelante en **todos los frontends** del ecosistema. La app **SSO (`Reformat_SSO`)** es la referencia (fuente de verdad); cualquier app nueva parte de este documento.

---

## 1. Propósito y alcance

- **Qué es:** el estándar de arquitectura, librerías, versiones, paleta, configuración y buenas prácticas para los frontends del ecosistema.
- **A quién aplica:** a toda app frontend nueva (módulos internos y satélites) que se integre con el SSO.
- **Principio rector:** **el SSO es el _shell_ (host).** Provee el Header, el Sidebar, el layout general y la sesión. Las apps módulo **NO traen su propio shell** — se montan dentro del frame del SSO y solo aportan su contenido.

```
┌──────────────────────────────────────────────┐
│  SSO (host / shell)                           │
│  ┌──────────┬──────────────────────────────┐ │
│  │          │  Header (provisto por el SSO) │ │
│  │ Sidebar  ├──────────────────────────────┤ │
│  │ (SSO)    │                              │ │
│  │          │   👉 TU APP MÓDULO aquí       │ │
│  │          │   (sin Header ni Sidebar)     │ │
│  └──────────┴──────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## 2. Stack tecnológico y versiones

Estas versiones son el **punto de partida obligatorio** para una app nueva. Las marcadas como _ancladas_ (sin `^`/`~`) se copian **exactas** por compatibilidad conocida.

### Core

| Paquete | Versión | Notas |
|---|---|---|
| `react` | `^19.2.0` | |
| `react-dom` | `^19.2.0` | |
| `typescript` | `~5.9.3` | |
| `vite` | `^7.2.7` | Bundler y dev server |
| `@vitejs/plugin-react` | `^5.2.0` | |

### UI / estilos

| Paquete | Versión | Notas |
|---|---|---|
| `antd` | `^6.1.3` | Librería de componentes principal |
| `@ant-design/icons` | `~6.1.0` | |
| `tailwindcss` | `^4.1.18` | Tailwind **v4** (`@theme` generado desde `src/design/tokens.ts`) |
| `@tailwindcss/vite` | `^4.1.18` | Plugin oficial Vite (no PostCSS) |
| `@fortawesome/fontawesome-svg-core` | `^7.1.0` | Íconos dinámicos de menú |
| `@fortawesome/free-solid-svg-icons` | `^7.1.0` | |
| `@fortawesome/free-brands-svg-icons` | `^7.1.0` | |
| `@fortawesome/react-fontawesome` | `^3.1.1` | |

### Grid / reportes / archivos

| Paquete | Versión | Notas |
|---|---|---|
| `exceljs` | `^4.4.0` | Exportación a Excel |
| `xlsx` | `^0.18.5` | Lectura/parsing de Excel. **Opcional** — no viene en el starter kit |
| `file-saver` | `^2.0.5` | Descarga de archivos |

### PDF — opcional

Ninguno viene en el starter kit; instalarlos solo si la app tiene visor de PDF.

| Paquete | Versión | Notas |
|---|---|---|
| `pdfjs-dist` | `4.4.168` | **Anclado.** |
| `react-pdf` | `9.1.1` | **Anclado.** Debe ser compatible con `pdfjs-dist` |

### HTTP / auth / fechas / feedback / routing

| Paquete | Versión | Notas |
|---|---|---|
| `axios` | `^1.13.2` | Todo el HTTP pasa por el interceptor central |
| `jwt-decode` | `^4.0.0` | |
| `dayjs` | `^1.11.19` | Preferido para UI (antd usa dayjs) |
| `date-fns` | `^4.1.0` | Utilidades de fecha |
| `sweetalert2` | `^11.26.17` | Diálogos/alertas |
| `sweetalert2-react-content` | `^5.1.1` | |
| `react-toastify` | `^11.0.5` | Notificaciones no bloqueantes |
| `react-router-dom` | `^7.11.0` | Routing (v7) |
| `react-highlight-words` | `^0.21.0` | Resaltado en búsquedas |

### Tooling de desarrollo

| Paquete | Versión |
|---|---|
| `eslint` | `^9.39.1` (flat config) |
| `typescript-eslint` | `^8.46.4` |
| `eslint-plugin-react-hooks` | `^7.0.1` |
| `eslint-plugin-react-refresh` | `^0.4.24` |
| `@types/node` | `^24.10.1` — en el starter kit `^22.20.1` |
| `@types/react` / `@types/react-dom` | `^19.2.5` / `^19.2.3` — en el starter kit **`^18.3.31` / `^18.3.7`**, para acompañar React 18 (ver desviación abajo) |

### Desviaciones vigentes del starter kit

El `react_IDC_starterKit` está alineado con esta tabla **salvo en dos puntos**,
por decisión explícita y con evidencia:

| Paquete | Estándar | Starter kit | Motivo |
|---|---|---|---|
| `react` / `react-dom` | `^19.2.0` | **`^18.3.1`** | Se decidió mantener React 18. Verificado contra el registro npm: `antd@6`, `@ant-design/icons@6`, `react-router-dom@7`, `@fortawesome/react-fontawesome@3`, `sweetalert2-react-content@5`, `react-toastify@11` y `react-highlight-words@0.21` **declaran todos peer `react >=18`**, así que el resto de la tabla se toma sin cambios. Arrastra `@types/react` / `@types/react-dom` a la línea 18 (`^18.3.31` / `^18.3.7`): los types deben acompañar a la versión de React, no al estándar. |
| `echarts-for-react` | — (no listado) | **`3.0.2` anclado**, con `echarts` en la línea 5 | De 3.0.3 en adelante (verificado hasta 3.0.7) `initEchartsInstance` crea una instancia temporal **sin option** y espera su evento `'finished'` para recrearla. Con un chart vacío ese evento no llega nunca: la promesa no resuelve, `setOption` no se ejecuta y el gráfico queda **en blanco sin error en consola**. El peer de 3.0.2 admite `echarts` `^3/^4/^5`, de ahí que la guía se quede en la línea 5. Desde 0.8.0 el kit **admite** ECharts 6 en el consumidor (peer `^5.6.0 \|\| ^6.0.0`; verificado con 3.0.2: pinta): pnpm avisa por el peer de `echarts-for-react`, pero no rompe. |

**Reglas:**
- El gestor de paquetes es **pnpm** (`"packageManager": "pnpm@11.5.0"`); el build es `tsc -b && vite build` (el chequeo de tipos **es parte del build**, no opcional).

---

## 3. Tokens: color, tipografía, radios y sombras

**Única fuente de verdad: [`src/design/tokens.ts`](../src/design/tokens.ts).** De ahí se generan el
`@theme` de Tailwind v4 (`src/design/tokens.css`, lo escribe el plugin `idce-tokens` de Vite) y el
tema de antd (`src/design/temaAntd.ts`). Referencia completa, contraste y tabla de migración:
**[TOKENS.md](TOKENS.md)**.

### Convenciones de uso

- **Roles, no valores.** `text-tinta-secundaria`, `bg-superficie-sutil`, `border-linea`, `text-error`,
  `text-cuerpo`, `rounded-contenedor`, `shadow-contenedor`. En JS: `color.error.base`,
  `tipografia.escala.detalle.tamano`, `radio.tarjeta`.
- **Prohibido fuera de `src/design/`:** hex, `rgba()`, colores y tamaños por defecto de Tailwind
  (`text-gray-600`, `text-sm`, `text-[11px]`), `rounded-lg`, `shadow-md`, `fontSize: 12`,
  `borderRadius: 6`, `boxShadow` en línea. El `@theme` generado borra esas utilidades y
  `pnpm lint` (→ `pnpm tokens:verificar`) falla si aparecen.
- **Shell vs vistas internas**: `identidad` (prussian-blue, **cambia por cliente**) solo en el shell;
  `accion` (Tailwind **blue-600**, **constante**) es el azul de todo lo que va dentro del iframe:
  controles, pestañas, cabeceras de sección y enlaces. Dentro de una vista no se usa prussian.
  Detalle y origen en `IDENTIDAD_VISUAL.md` §3.2.
- **Neutro único:** escala slate, también en antd.
- **Ant Design se tematiza con `<ConfigProvider theme={temaAntd}>`** en `App.tsx`. No usar overrides
  CSS con `!important` sobre clases `ant-*`.
  - Se importa como `AntdConfigProvider` (alias) para no chocar con el `ConfigProvider` propio de la app (`src/hooks/configContext.tsx`), que carga `routes.json` en runtime y envuelve el árbol en `main.tsx`. Son dos providers distintos con el mismo nombre de export — nunca los importes sin alias en el mismo archivo.
- **Nunca pintes un componente antd con utilidades Tailwind de color.** Tailwind v4 emite sus utilidades dentro de `@layer utilities` y antd 6 inyecta su CSS **sin capa**; en la cascada CSS una declaración sin capa le gana a una con capa sin importar la especificidad. Usa `color` × `variant` o los tokens del tema.
- Success/Warning no existen como `color` de botón en antd: usa `SuccessButton` / `WarningButton` de `src/components/SemanticButtons.tsx`.
- Descargas de archivo: `ExcelButton` (verde) y `PdfButton` (rojo) de `src/components/DownloadButtons.tsx`. No armar `<Button icon={<FileExcelOutlined />}>` ni usar `SuccessButton` / `color="danger"` para descargar (ver IDENTIDAD_VISUAL §7.2).
- Los estilos de scrollbar globales viven en `src/index.css` y leen los tokens con `var()`. No duplicarlos por componente.

---

## 4. Configuración en runtime (patrón central del ecosistema)

Esta es la pieza más importante de la arquitectura. **La configuración NO se hornea en el build.**

### Cómo funciona

1. Al arrancar, `ConfigProvider` (`src/hooks/configContext.tsx`) hace `fetch("/config/routes.json")`.
2. Con esa config, llama a `initializeServices(config)` (`src/services/indexService.tsx`), que **inyecta las bases (`VITE_API_URL` propia y `VITE_API_SSO_URL`) a los servicios y a las instancias axios (`api` / `apiSSO`)**.
3. Hasta que la config carga, la app muestra un loader; recién entonces se renderiza el árbol.

**Ventaja:** un **mismo bundle** sirve para múltiples despliegues/instituciones — solo cambia el `routes.json` del servidor. No hay que recompilar por ambiente.

> **Host vs. app servida.** El **SSO host** tiene una config más rica (fallbacks de redirect, multi-tenant, puerto `3001`). Una **app servida (satélite)** es mucho más simple: config mínima, siempre puerto `3000` en dev, y **la institución sale del token**, no de la config. Lo que sigue es el estándar para **apps servidas**.

### Forma de `public/config/routes.json` (app servida)

```json
{
  "VITE_API_URL": "http://localhost:5097/api",
  "VITE_BASE_URL": "http://localhost:5097/",
  "VITE_API_SSO_URL": "",
  "VITE_BASE_SSO_URL": ""
}
```

| Campo | Uso |
|---|---|
| `VITE_API_URL` / `VITE_BASE_URL` | **API propia** de la app (su dominio de negocio) |
| `VITE_API_SSO_URL` | API del **SSO**; necesaria para `validateToken` y para datos que administra el SSO (**Empleado, Oficina, Catálogos**) |
| `VITE_BASE_SSO_URL` | Base URL del API del SSO |

**No incluir** (aplican solo al SSO host):
- ❌ `VITE_BASE_PATH` — no hace falta.
- ❌ `VITE_INSTITUCION_ID` — el SSO deja el `institucionID` **en el token**; es responsabilidad del backend de la app resolver la institución desde ahí.
- ❌ `VITE_SSO_DEPLOY_PATH` — el fallback es solo del SSO. Las apps en dev **siempre** sirven en `:3000`; en producción manda la BD del SSO.

### Reglas

- ✅ **Ningún servicio lee `import.meta.env` para la URL de la API.** La recibe por su `initializeXService(config)` y la guarda en un `API_URL` de módulo. Ver `src/services/institucionService.tsx` como patrón.
- ✅ Todo servicio nuevo se registra en el array `allServices` de `src/services/indexService.tsx`.
- ✅ Los servicios de datos **administrados por el SSO** (Empleado, Oficina, Catálogos, `validateToken`) apuntan a `VITE_API_SSO_URL`; los del **dominio propio** a `VITE_API_URL`. (Ver §6: dos instancias axios.)
- ✅ Consumir datos con el hook `useService` (`src/hooks/useService.tsx`) y usar `EMPTY_ARRAY` (`src/utils/constants.ts`) como default estable para evitar loops de render. Si el servicio falla, `data` queda en `null` y `apiError` lleno (ver §7).

### `.env` de una app servida

Una app servida **solo necesita el puerto** en su `.env`:

```dotenv
PORT=3000
```

Nada más. **No lleva flag de desarrollo/producción** — el entorno lo administra el SSO. (Las variables extra que usa el SSO host —paths locales, redirects legacy, `VITE_DEVELOPMENT`— son **exclusivas del SSO**, no se copian a las apps servidas.)

---

## 5. Estructura de páginas y routing (todo en el índice, sin shell)

Ver `src/App.tsx`. Existen **dos tipos de ruta**:

- **`/[APP_NAME]` → `Layout`** (Header + Sidebar + Iframe). Para embeber apps externas/legacy. `[APP_NAME]` es el nombre propio de la app (en el SSO esta ruta es `/SAU`).
- **`/Modulos{CODIGO_APP}/*` → `AuthenticatedFrame`** (**sin Header ni Sidebar**). Aquí viven los Menus (páginas React) de la app. El shell lo provee el SSO host. Puede ser simplemente `/Modulos/*` o namespaced con el código de la app (`/ModulosSSO` en el caso del SSO).

> **Terminología del SSO.** Las tablas del SSO se llaman **Modulo** y **Menu**. Un **Modulo** agrupa varios **Menus**; cada **Menu** es una página/ruta. Usamos esos mismos nombres en el código (ver `MenuByUserDTO`: `moduloID`/`moduloNombre` agrupan; `caption`/`menuNombre`/`ruta` describen cada menú).

Cada Menu se monta como **página lazy** dentro de un **único árbol de rutas (index)**:

```tsx
const Compania = lazy(() => import("@/modulos/Administracion/Compania.tsx"));
// ...
<Route path="/Modulos{CODIGO_APP}/*" element={<ProtectedRoute><MenuPermissionsProvider><AuthenticatedFrame /></MenuPermissionsProvider></ProtectedRoute>}>
  {/* Modulo "Administracion" → Menu "Compañía" */}
  <Route path="Administracion/Compañía" element={<Compania />} />
  {/* ... */}
  <Route path="*" element={<Navigate to="/404" replace />} />
</Route>
```

### Reglas

- ✅ **Menus como módulos lazy** (`lazy(() => import(...))`) montados en el índice de rutas. **La página NO incluye su propio Header/Sidebar.**
- ✅ **Doble guard obligatorio**:
  - `ProtectedRoute` → autenticación (`validateToken`).
  - `AuthorizedRoute` → autorización por perfil vía `MenuPermissionsContext` (`GetMenusByUser`). **Falla cerrado**: ruta no permitida → `/403`; sin ningún menú → `/401`. Ver `src/auth/components/AuthorizedRoute.tsx` y `src/hooks/MenuPermissionsContext.tsx`.
- ✅ **Páginas de error estándar**: `/401`, `/403`, `/404`, `/500`.
- ✅ **Alias `@` → `src/`** (configurado en Vite y tsconfig).
- ✅ Cada página inicializa sus **breadcrumbs** vía `BreadcrumbContext` (el shell del SSO los muestra).

---

## 6. Capa HTTP y seguridad

Una app servida habla con **dos APIs**: la **propia** y la del **SSO**. Por eso se crean **dos instancias axios** desde un mismo factory (`src/interceptors/authInterceptor.ts`):

- **`api`** → `baseURL = VITE_API_URL` (dominio propio de la app).
- **`apiSSO`** → `baseURL = VITE_API_SSO_URL` (datos que administra el SSO: **Empleado, Oficina, Catálogos**, y `validateToken`).

Ambas instancias comparten **la misma configuración e interceptores**:

- `withCredentials: true`, `timeout` configurado.
- **Request:** inyecta `Authorization: Bearer <token>` leyendo `localStorage.authToken` (mismo token para las dos; fallback: cookie legible).
- **Response:**
  - `ERR_NETWORK` (backend caído) → redirige a `/500`.
  - `401` → limpia `authToken` y redirige a `/login` (evita bucle si ya está en `/login`).

### Reglas

- ✅ **Toda llamada usa `api` o `apiSSO`** según el destino. Nunca `axios` directo para endpoints protegidos.
- ✅ Servicios de datos del SSO → `apiSSO`; servicios de dominio propio → `api`.
- ✅ El token vive en `localStorage.authToken` y es **compartido** por ambas instancias; el login lo setea y `validateToken` lo mantiene sincronizado con la cookie.
- ✅ La autorización real la impone el backend (`GetMenusByUser`, endpoints blindados). El guard del front es defensa en profundidad, no la única barrera.

---

## 7. Buenas prácticas de código

### Organización por dominio

```
src/
├── auth/                 # login, guards, páginas de error, hooks de auth
│   ├── components/
│   ├── hooks/
│   └── pages/
├── components/           # componentes transversales (Header, Layout, TableFilter…)
│   └── charts/           # KpiCard y overlays de estadísticas de TarjetaGrafica
├── config/               # localPaths y config estática (app.ts)
├── design/               # tokens.ts (fuente unica), generarCss.ts, tokens.css (generado), temaAntd.ts
├── hooks/                # contextos y hooks reutilizables (useService, contexts)
├── interceptors/         # authInterceptor (instancias api / apiSSO)
├── modulos/              # módulos de negocio (tabla Modulo del SSO)
│   └── <Modulo>/         # un Modulo agrupa varios Menus
│       ├── <Menu>.tsx    # cada Menu es una página/ruta
│       └── components/<Entidad>/   # tabla, form popups
├── services/             # un servicio por dominio + indexService (registro)
├── shared/               # piezas comunes a todos los módulos (EstadoError, loading…)
│   └── analitica/        # kit de vistas analíticas: TarjetaGrafica, BarraFiltros, tablas, Excel
├── types/                # DTOs e interfaces
└── utils/                # helpers (devLog, swalAlert, constants…)
```

> Nomenclatura alineada con el SSO: la carpeta de negocio es **`modulos/`**, cada subcarpeta es un **Modulo** y cada archivo de página es un **Menu** (así se llaman las tablas del SSO). El SSO host usa `modulosSSO/` por herencia histórica; las apps nuevas usan `modulos/`.

### Patrón de página (Menu) CRUD (referencia: `Compania.tsx`)

- Datos con `useService(servicio, params, deps, executeOnMount, mensajeError)`. `mensajeError` dice **qué** no se pudo cargar; es lo que ve el usuario si el backend no manda texto.
- Hook _manager_ por entidad para save/update/delete (ej. `useInstitucionManager`).
- **Tabla y form popups separados** en `components/<Entidad>/`.
- Filtros con `useMemo` sobre la data cargada.
- Export a Excel con `useExcelExport`.
- Breadcrumbs vía `useBreadcrumb` en un `useEffect` de montaje.
- Toolbar de lista: `BarraListado` + `CampoListado` (filtros a la izquierda, CTA a la derecha).
  **No** `BarraFiltros` (esa es de `VistaAnalitica`).
- **Columnas:** pocos campos (~≤6–7 + acciones) → una columna por dato (Provincia).
  Muchos campos → `IdentityCell` con meta etiquetada (`Código: 02`). Tres o más
  catálogos cortos → una columna `AtributosCell`. No mezclar el mismo dato en meta y
  chips. Demo: pestaña **Tablas y Datos**.
- Celdas estrechas: `EllipsisCell` + `wrapColumnTitle`. Identidad no usa ellipsis.
- Color editable: `ColorSwatch` en grilla; `ColorPicker` + `valorColorHex` en
  `Form.Item`. Solo hex. `FormModal` apila z-index solo.
- Árbol: `ChipNivel` + `BarraExpandirArbol` + indent 16. Grilla jerárquica →
  `CrudTable tree` (no combinar con `expandable`). Sidebar estrecho → chip compacto.

### Patrón de vista analítica (dashboards, reportes, gráficas)

Se arma con el kit `src/shared/analitica`. Guía completa en
[VISTAS_ANALITICAS.md](VISTAS_ANALITICAS.md); plantilla viva en `src/demos/VistaAnaliticaDemo.tsx`.

- `VistaAnalitica` + `BarraFiltros` + `useFiltrosBorrador`: **nada se consulta hasta pulsar Filtrar**.
- **Toda gráfica va en `TarjetaGrafica`.** No `ReactECharts` suelto, no `toolbox` de ECharts.
- Matriz F×I (color por celda + conteo): `opcionesMatrizCalor` dentro de `TarjetaGrafica`.
  Demo: pestaña **Gráficos**.
- Pestañas con `TabsAnaliticas` (cada una aislada por `LimiteError`).
- Excel multihoja con `exportarExcel`.

### Reglas generales

- ✅ **Tipado estricto**: DTOs en `src/types/`; usar `import type` para tipos.
- ✅ **Estado async**: `data` inicia `undefined`; proteger con `?? EMPTY_ARRAY` / `?.` en el punto de uso.
- ✅ **Logging**: usar `devLog` / `devGroup*` (`src/utils/devLog.tsx`) — silenciosos fuera de desarrollo. **Prohibido `console.log` crudo** en código de producción.
- ✅ **Feedback UX unificado**: `swalAlert` (`src/utils/swalAlert.ts`) para diálogos y `react-toastify` para notificaciones.
- ✅ **Fallo ≠ vacío**: los servicios propagan el error (no `catch → return []`). `useService` lo normaliza con `utils/apiError` en `apiError`, y la pantalla lo pinta con `shared/EstadoError` (varias llamadas: `primerApiError`). `detalle` del backend **nunca** va a pantalla.
- ✅ Marcar código obsoleto con **`@deprecated`** indicando el reemplazo (patrón en `institucionService`).
- ✅ **Props en español** en todo componente del kit (`titulo`, `etiqueta`, `acciones`, `cargando`, `color`). Al renombrar una prop pública, el nombre viejo sigue funcionando una versión con `@deprecated` (patrón: unión `{ titulo: X; title?: never } | { /** @deprecated */ title: X; titulo?: never }` para no perder la obligatoriedad). En 0.6.0 se renombraron `KpiCard`, `PageHeader`, `SectionHeader`, `EmptyState`, `StatusTag`, `IdentityCell`, `BarraListado` / `CampoListado` y `ColorSwatch`; los alias se retiran en 1.0.
- ✅ **ESLint flat config** obligatorio (`eslint.config.js`); no romper `react-hooks` ni `react-refresh`.
- ✅ El build **debe pasar `tsc -b`** (sin errores de tipos) antes de `vite build`.

---

## 8. Plantilla para arrancar una app nueva (copy-paste)

### 8.1 Scaffold + dependencias

El gestor del ecosistema es **pnpm** (el starter kit declara
`"packageManager": "pnpm@11.5.0"`). No mezclar con `npm install`: genera un
`package-lock.json` paralelo que se desincroniza del `pnpm-lock.yaml`.

```bash
pnpm create vite mi-app --template react-ts
cd mi-app
pnpm add antd@^6.1.3 @ant-design/icons@~6.1.0 axios@^1.13.2 jwt-decode@^4.0.0 \
  react-router-dom@^7.11.0 dayjs@^1.11.19 date-fns@^4.1.0 \
  sweetalert2@^11.26.17 sweetalert2-react-content@^5.1.1 react-toastify@^11.0.5 \
  @fortawesome/fontawesome-svg-core@^7.1.0 @fortawesome/free-solid-svg-icons@^7.1.0 \
  @fortawesome/free-brands-svg-icons@^7.1.0 @fortawesome/react-fontawesome@^3.1.1 \
  exceljs@^4.4.0 file-saver@^2.0.5
pnpm add -D tailwindcss@^4.1.18 @tailwindcss/vite@^4.1.18

# React 18 (desviacion vigente del kit, ver §2): fijar tambien los types
pnpm add react@^18.3.1 react-dom@^18.3.1
pnpm add -D @types/react@^18.3.31 @types/react-dom@^18.3.7

# Opcionales — instalar SOLO si la app los usa. El starter kit NO los trae:
# pnpm add xlsx@^0.18.5                        # lectura/parsing de Excel
# pnpm add pdfjs-dist@4.4.168 react-pdf@9.1.1  # visor de PDF
```

### 8.2 `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 3000 }, // el SSO usa 3001; las apps en dev usan 3000
})
```

### 8.3 `main.tsx` — árbol de providers

```tsx
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { ConfigProvider } from './hooks/configContext.tsx'
import { BreadcrumbProvider } from './hooks/BreadcrumbContext.tsx'

createRoot(document.getElementById('root')!).render(
  <ConfigProvider>
    <Router>
      <BreadcrumbProvider>
        <App />
      </BreadcrumbProvider>
    </Router>
  </ConfigProvider>
)
```

### 8.4 `hooks/configContext.tsx` — carga runtime

`src/types/routesConfig.ts` (app servida):

```ts
export interface RoutesConfig {
  VITE_API_URL: string      // API propia
  VITE_BASE_URL: string     // base API propia
  VITE_API_SSO_URL: string  // API del SSO (Empleado, Oficina, Catálogos, validateToken)
  VITE_BASE_SSO_URL: string // base API del SSO
}
```

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { RoutesConfig } from '@/types/routesConfig'
import { initializeServices } from '@/services/indexService'

const ConfigContext = createContext<{ config: RoutesConfig; isLoading: boolean } | null>(null)

const initialConfig: RoutesConfig = {
  VITE_API_URL: '', VITE_BASE_URL: '',
  VITE_API_SSO_URL: '', VITE_BASE_SSO_URL: '',
}

export const useConfig = () => {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within a ConfigProvider')
  return ctx
}

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<RoutesConfig>(initialConfig)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/config/routes.json')
        if (!res.ok) throw new Error('Error al cargar la configuración')
        const value: RoutesConfig = await res.json()
        setConfig(value)
        initializeServices(value)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  if (isLoading) return <div>Cargando...</div>
  return <ConfigContext.Provider value={{ config, isLoading }}>{children}</ConfigContext.Provider>
}
```

### 8.5 `public/config/routes.json` y `.env`

`public/config/routes.json`:

```json
{
  "VITE_API_URL": "http://localhost:5097/api",
  "VITE_BASE_URL": "http://localhost:5097/",
  "VITE_API_SSO_URL": "http://localhost:5097/api-sso",
  "VITE_BASE_SSO_URL": "http://localhost:5097/"
}
```

`.env` (solo el puerto):

```dotenv
PORT=3000
```

### 8.6 `interceptors/authInterceptor.ts` — dos instancias axios (api / apiSSO)

```ts
import axios from 'axios'
import type { RoutesConfig } from '@/types/routesConfig'

const getAuthToken = () => localStorage.getItem('authToken') ?? undefined

// Factory: crea una instancia con el token compartido y los interceptores comunes.
const createClient = () => {
  const instance = axios.create({ timeout: 100000, withCredentials: true })

  instance.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  })

  instance.interceptors.response.use(
    (r) => r,
    (error) => {
      if (!error.response && error.code === 'ERR_NETWORK') {
        window.location.href = '/500'
        return new Promise(() => {})
      }
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken')
        if (window.location.pathname !== '/login') window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// api    → API propia de la app
// apiSSO → API del SSO (Empleado, Oficina, Catálogos, validateToken)
export const api = createClient()
export const apiSSO = createClient()

export const initializeAuthService = (config: RoutesConfig) => {
  api.defaults.baseURL = config.VITE_API_URL
  apiSSO.defaults.baseURL = config.VITE_API_SSO_URL
}

export default api
```

### 8.7 Tokens — Tailwind v4 + tema antd desde una sola fuente

Copiar del kit, sin modificar:

- `src/design/tokens.ts` — **la única fuente**. Para otro cliente, cambiar solo `primitivos.prussianBlue`.
- `src/design/generarCss.ts` y `src/design/temaAntd.ts`.
- `scripts/tokens.mjs` y en `package.json`: `"lint": "eslint . && node scripts/tokens.mjs verificar"`,
  `"tokens:generar"`, `"tokens:verificar"`.
- El plugin `idce-tokens` de `vite.config.ts` (escribe `src/design/tokens.css` en dev y build).

```css
/* src/index.css */
@import "tailwindcss";
@import "./design/tokens.css"; /* GENERADO: no se edita */

:root {
  font-family: var(--font-sans);
  color: var(--color-tinta);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

```tsx
// src/App.tsx
import { ConfigProvider as AntdConfigProvider } from "antd";
import { temaAntd } from "@/design/temaAntd";

<AntdConfigProvider theme={temaAntd}>…</AntdConfigProvider>
```

### 8.8 Estructura de carpetas recomendada

Ver §7 (organización por dominio). Como mínimo: `auth/`, `components/`, `hooks/`, `interceptors/`, `modulos/<Modulo>/<Menu>.tsx`, `services/` (con `indexService`), `types/`, `utils/`.

### 8.9 Checklist antes de considerar lista una app nueva

- [ ] Config cargada en runtime desde `/config/routes.json` (no `import.meta.env` en servicios).
- [ ] `routes.json` con los 4 campos (`VITE_API_URL`/`VITE_BASE_URL` propios + `VITE_API_SSO_URL`/`VITE_BASE_SSO_URL`); **sin** `BASE_PATH`/`INSTITUCION_ID`/`SSO_DEPLOY_PATH`.
- [ ] `.env` = solo `PORT=3000`. La institución se resuelve del token, no de la config.
- [ ] Servicios registrados en `indexService`; datos del SSO → `apiSSO`, dominio propio → `api`.
- [ ] Todo el HTTP pasa por `api` / `apiSSO` (nunca `axios` directo).
- [ ] Menus montados como **lazy** en un único árbol de rutas (`/Modulos{CODIGO_APP}/*`), **sin shell propio**.
- [ ] Guards `ProtectedRoute` + `AuthorizedRoute` aplicados y fallando cerrado.
- [ ] Páginas de error `/401 /403 /404 /500` presentes.
- [ ] `src/design/` copiado, plugin `idce-tokens` en `vite.config.ts`, `index.css` importando `./design/tokens.css` y `pnpm tokens:verificar` en verde.
- [ ] Alias `@` → `src/` en Vite y tsconfig; carpeta de negocio `modulos/` con nomenclatura Modulo/Menu.
- [ ] `devLog`/`swalAlert`/`EMPTY_ARRAY` en uso; sin `console.log` crudo.
- [ ] `pnpm build` (con `tsc -b`) pasa sin errores.

---

_Referencia canónica: app SSO `Reformat_SSO`. Ante duda, el código del SSO manda; si el SSO cambia un patrón aquí descrito, actualizar este documento en el mismo PR._