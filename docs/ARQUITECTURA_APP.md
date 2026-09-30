# Arquitectura de AnalisisFinanciero

## 1. No es un satélite del SSO

El starter kit está pensado para **apps satélite**: se abren dentro de un iframe del SSO host, que
les da header, sidebar y sesión. AnalisisFinanciero parte del kit pero **tiene su propio SSO/login
y su propio shell**. Se abre directo en el navegador.

| Pieza del kit | Satélite (kit) | AnalisisFinanciero |
|---|---|---|
| Shell (header/nav/footer) | Lo da el SSO; `AuthenticatedFrame` sin shell | Propio: `src/layout/AppShell.tsx` |
| Login | No existe; token por cookie del SSO | Propio: `src/modulos/Auth/Login.tsx` |
| Autenticación | `ProtectedRoute` + `ValidarJWT` del SSO | `ProtectedRoute` + `AuthContext` (Supabase) |
| Autorización por menú | `MenuPermissionsProvider` + `AuthorizedRoute` (`GetMenusByUser`) | **No se usa** todavía |
| Rutas | `/Modulos<APP_CODE>/<Modulo>/<Menu>` | Planas: `/dashboard`, `/macro`, `/sistema`, `/tasas`, `/analisis` |
| `iframe.css` (densidad 90 %) | Sí | **No**: escala 100 % (`src/index.css`) |
| Puerto dev | Siempre 3000 | 3000 por defecto; respeta `PORT` |

Las piezas de satélite (`AuthenticatedFrame`, `AuthorizedRoute`, `MenuPermissionsProvider`,
`userService.validateToken`, `menuService`) se conservan sin montar, por si el SSO propio termina
usando el mismo contrato.

## 2. Autenticación actual: Supabase (heredada de prueba-data)

Primer paso de la migración: se reproduce tal cual el login de prueba-data.

- `src/auth/supabase.ts`: cliente creado con `SUPABASE_URL` y `SUPABASE_ANON_KEY` de
  `public/config/routes.json` (runtime, no build). La key es la *publishable*, pública por diseño.
- `src/auth/AuthContext.tsx`: sesión, `signIn` (correo + password), `signUp` (guarda `username`
  en `user_metadata`), `resetPassword` (redirige a `/login`), `signOut`.
- `ProtectedRoute`: sin sesión → `/login` (recuerda la ruta pedida). Falla cerrado.

**Pendiente — SSO propio.** Cuando se defina, se reemplaza `AuthContext` (misma interfaz) y, si
aplica, se montan `MenuPermissionsProvider`/`AuthorizedRoute`. Las pantallas no dependen de
Supabase: solo de `useAuth()`.

Diferencias con el original:
- El campo "Usuario o Correo" ahora pide correo: Supabase solo autentica por correo (el original
  también, aunque el rótulo decía otra cosa).
- El "Password provisional" del registro se sigue pidiendo pero no se usa (igual que en el original).
- En prueba-data, Macro/Sistema/Tasas/Análisis **no estaban protegidas** (llamaban a `supabase`
  sin cargar la librería). Aquí todas pasan por `ProtectedRoute`.

## 3. Datos

- Los datos llegan de la API de `BackendDF` (`VITE_API_URL`); contrato en
  `BackendDF/docs/GUIA_CONSUMO_API_FRONTEND.md` y tipos en `src/types/api.ts`.
- `src/services/apiDatos.ts` hace las llamadas (cachea la promesa por URL) y
  `src/services/adaptadores.ts` devuelve las filas en la forma "ancha" de los JSON de prueba-data,
  así que tablas, gráficas, colección y carrito no cambiaron.
- El token de Supabase va en `Authorization` (`authInterceptor`). `api` no manda cookies: la API
  no permite credenciales por CORS.
- Rankings y comparativo ya no descargan los 229 reportes: el ranking lo calcula la API.
- `public/data` ya no se usa; si sigue en la carpeta local, `pnpm build` lo copiaría a `dist-app/`.

## 4. Pantallas y reutilización del kit

| Pantalla | Origen | Implementación |
|---|---|---|
| Login | `index.html` + `script.js` | `modulos/Auth/Login.tsx` (antd `Form`, `swalSuccess/swalError`) |
| Dashboard | `dashboard.html` | `modulos/Inicio/Dashboard.tsx` |
| Macroeconómico | `macroeconomico.html` + `macro.js` | `modulos/Macro/Macroeconomico.tsx` sobre el explorador |
| Sistema / Tasas | `sistema.*` / `tasas.*` | `modulos/Sistema/ExploradorSistema.tsx` (una sola implementación; Tasas sin "Cartera Total") + `cargarCuadro.ts` por tipo de cuadro; balances en árbol por `Codigo_Base` (`TablaBalances`) |
| Análisis | `analisis.*` | `modulos/Analisis/`: hub (`Analisis.tsx`) + revista de 31 hojas (`Revista.tsx`, `paginas/`) |

Explorador compartido (`src/modulos/Explorador/`): árbol "Contenidos" (antd `Tree` en `Drawer`,
generado de los HTML a `arboles/*.ts`), tabla por grupo/nivel (`TablaAnalitica`), "Mi Colección"
(hasta 10 series, eje derecho, línea/barra) con `TarjetaGrafica` (su pantalla completa reemplaza
"AMPLIAR"), gráfico individual, carrito persistente (`localStorage['carritoSeries']`, misma forma
que el original) y descarga Excel (`exportarExcel`, ahora `.xlsx` real) o CSV.

### Análisis Financiero (revista de 31 hojas)

- `Revista.tsx`: barra (volver, PDF, etiquetas, año, mes, entidad), navegación y puntos. Solo se
  monta la hoja activa (el original repintaba las 31 en cada cambio). "Descargar PDF" monta todas y
  llama a `window.print()`.
- `datos.ts`: contexto de cálculo por fecha de corte (`crearCtx`: mes y año anteriores, series,
  variaciones). Reemplaza los globales `currentMagazineData`, `currentYear`, `currentMonth`.
- `opciones.ts`: constructores ECharts (tres cortes, histórico con zoom a 12 meses, comparativo año
  actual/anterior, mini de 6 meses) sobre la paleta del kit; todo se pinta con `TarjetaGrafica`.
- Plantillas por configuración: `PaginaEstructura` (3, 4, 6-8), `PaginaPyG` (10-11), rankings
  (5, 9, 24-26), cartera por segmento (13-16), segmentos de operaciones (19-23) y rejillas de
  indicadores por categoría (27, 29, 30, 31). `paginas/indicadoresConfig.ts` se generó desde los
  `CONFIG_INDICADORES*` del original.
- `resumenEntidades.ts`: rankings y comparativo necesitan las 229 entidades. El original bajaba los
  229 reportes (~283 MB) una vez por cada cuenta de ranking; aquí se barren una sola vez con
  concurrencia 8 y se guardan solo las cuentas usadas.
- Cada tarjeta del hub abre la revista en la primera hoja de su sección (1, 12, 27, 30, 31); el
  original restauraba siempre la última hoja visitada.

## 5. Bugs del original corregidos

- Menú Macro: `IEA413`/`IEA414` apuntaban a cuadros inexistentes → `IEA413A`/`IEA414A`.
- Menú Macro trimestral: "2.2.5 Empresas Públicas No Financieras" cargaba `IEM224T` → `IEM225T`.
- Filtro Desde/Hasta comparaba con `parseInt` ("2020-01" → 2020); ahora compara periodos completos.
- Sistema/Tasas: al cambiar de entidad solo EFI06/EFI07/TEA02 recargaban con su loader; EFI08 y
  EFI09 perdían el filtro de tipo de crédito. Ahora todo se recarga según el tipo de cuadro.
- Sistema: el selector "Hasta" tenía una opción `2026` rotulada "2024"; los periodos ahora salen de
  los datos.
- Sistema/Tasas: código suelto que filtraba `balancesData` vacío al cargar el script (eliminado).
- Descarga Excel repetía la columna "Grupo" en cada fila y abría `<tr>` sin cerrar.
- Análisis, rankings: el filtro "Por Provincia" comparaba `DPR_PA` (columna inexistente) y mostraba
  todas las entidades; ahora usa `DPA_PR`.
- Análisis, hoja 26: repetía el título del ranking MOA; hoja 8: el histórico se rotulaba
  "Depósitos a plazo".
- Análisis, hoja 13-16: los mini KPIs son montos pero se mostraban con "%"; las series
  `@1409..@1420` (refinanciada/reestructurada) se rotulaban "Cart. Bruta"/"Cart. Vencer".
- Análisis, hoja 19: el KPI "Productivo Empresarial" volvía a pintar el corporativo (`proc`).
- Análisis, hoja 21: el histórico de número de operaciones usaba `num_inmo` (inexistente) → `num_in`.
- Análisis, hoja 22: la composición del número de operaciones usaba montos (`mino`, `mas`, `maa`).
- Análisis, hoja 28: la leyenda CAMELS (vulnerabilidad <20% = A) contradecía el cálculo
  (≥80 = A); la calificación se basa en `Indic_CAMELS_1` y ahora se rotula así.
- Análisis, hoja 17: el resumen de turbulencia usaba siempre el último mes disponible; ahora usa la
  fecha elegida en la barra.

Pendientes de decidir (el menú apunta a cuadros que no están en los datos):
- `IEA1102`, `IEA1103` (versiones "Agosto 2015 – Abril 2021"): en los datos, `IEA1102A`/`IEA1103A`
  tienen justamente ese título, y no hay versión "desde mayo 2021".
- `IEA32A` (3.2 Balanza de Pagos…): sin datos.
- Cuadros con datos pero sin entrada en el menú: `IEA323A`, `IEM331`, `IEM332`, `IEM351`,
  `IEM352`, `IEM425`.

## 6. Despliegue y pendientes

- Borrar `public/data` antes de `pnpm build`: la app ya no lo lee y Vite copiaría los ≈2.3 GB.
- SSO propio: reemplazar `AuthContext` (ver §2).
- El catálogo del kit (`/home`, `src/demos`, `src/guia`) solo se monta en desarrollo, pero sigue en
  el repositorio.
