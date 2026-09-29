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

- Los JSON de `prueba-data/data` se sirven desde `public/data/` (≈2.3 GB, en `.gitignore`).
  Base configurable con `DATA_BASE_URL` en `routes.json`.
- Toda lectura pasa por `src/services/datosService.ts` (`leerJson`, cachea la promesa por archivo).
  Cuando haya API, solo cambia este servicio.
- Pendiente: los archivos grandes (`base_balances.json` 63 MB, `base_mensual.json` 15 MB) y la
  carga de los 229 `reportes/*.json` para rankings deberían pasar a una API.

## 4. Pantallas y reutilización del kit

| Pantalla | Origen | Implementación |
|---|---|---|
| Login | `index.html` + `script.js` | `modulos/Auth/Login.tsx` (antd `Form`, `swalSuccess/swalError`) |
| Dashboard | `dashboard.html` | `modulos/Inicio/Dashboard.tsx` |
| Macroeconómico | `macroeconomico.html` + `macro.js` | `modulos/Macro/Macroeconomico.tsx` sobre el explorador |
| Sistema / Tasas | `sistema.*` / `tasas.*` | Fase 2, mismo explorador |
| Análisis | `analisis.*` | Fase 3 |

Explorador compartido (`src/modulos/Explorador/`): árbol "Contenidos" (antd `Tree` en `Drawer`,
generado de los HTML a `arboles/*.ts`), tabla por grupo/nivel (`TablaAnalitica`), "Mi Colección"
(hasta 10 series, eje derecho, línea/barra) con `TarjetaGrafica` (su pantalla completa reemplaza
"AMPLIAR"), gráfico individual, carrito persistente (`localStorage['carritoSeries']`, misma forma
que el original) y descarga Excel (`exportarExcel`, ahora `.xlsx` real) o CSV.

## 5. Bugs del original corregidos

- Menú Macro: `IEA413`/`IEA414` apuntaban a cuadros inexistentes → `IEA413A`/`IEA414A`.
- Menú Macro trimestral: "2.2.5 Empresas Públicas No Financieras" cargaba `IEM224T` → `IEM225T`.
- Filtro Desde/Hasta comparaba con `parseInt` ("2020-01" → 2020); ahora compara periodos completos.
- Descarga Excel repetía la columna "Grupo" en cada fila y abría `<tr>` sin cerrar.

Pendientes de decidir (el menú apunta a cuadros que no están en los datos):
- `IEA1102`, `IEA1103` (versiones "Agosto 2015 – Abril 2021"): en los datos, `IEA1102A`/`IEA1103A`
  tienen justamente ese título, y no hay versión "desde mayo 2021".
- `IEA32A` (3.2 Balanza de Pagos…): sin datos.
- Cuadros con datos pero sin entrada en el menú: `IEA323A`, `IEM331`, `IEM332`, `IEM351`,
  `IEM352`, `IEM425`.
