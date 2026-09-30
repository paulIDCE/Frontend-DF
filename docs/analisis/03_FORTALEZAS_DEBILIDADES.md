# Punto de partida: fortalezas y debilidades por capa

Evaluación del estado actual de AnalisisFinanciero: la migración de prueba-data a Vite + React
sobre el starter kit IDCE, fases 0 a 3c (commits `3a4611e` a `1bb0446`). Complementa
[01_UX_UI_ERRORES.md](01_UX_UI_ERRORES.md) y [02_ANALISIS_DATOS_JSON.md](02_ANALISIS_DATOS_JSON.md).

**Escala**
- ✅ Fortaleza.
- ⚠️ Debilidad moderada.
- ❌ Debilidad crítica.

**Tamaño actual del código**

| Parte | Líneas |
|---|---|
| Módulos de la app (`src/modulos`) | ≈ 10.100 |
| &nbsp;&nbsp;de ellas, configuración generada automáticamente (árboles de menú, indicadores) | ≈ 4.300 |
| Kit copiado dentro del repo | ≈ 7.200 |
| Catálogo y demos del kit | ≈ 6.300 |
| Original prueba-data (HTML + JS + CSS) | ≈ 36.700 |

---

## 1. Resumen ejecutivo

| Capa | Estado | En una línea |
|---|---|---|
| Arquitectura | 🟡 | Buena base de front (config en runtime, servicio de datos aislado, rutas lazy), pero **no hay backend**: todo el cálculo y los 2,5 GB viven en el navegador. |
| Código | 🟢 | Tipado, lint y build limpios; componentes reutilizables y configuraciones declarativas. **Sin tests.** |
| Kit / diseño | 🟢 | Tokens, paleta validada y componentes analíticos del kit bien aprovechados. El kit va copiado, no como dependencia. |
| Seguridad / auth | 🔴 | El login protege la UI, **no los datos**: cualquiera puede descargar `/data/*.json` sin sesión. Registro abierto. SSO propio pendiente. |
| Datos | 🔴 | Cobertura amplia y valiosa, pero archivos monolíticos, fechas futuras, ceros por nulos, tipos inconsistentes y sin diccionario. |
| Contenido de la app | 🟡 | Muy completo (195 cuadros macro, 229 entidades, 31 hojas, CAMELS/PERLAS), con **reglas de negocio y textos escritos a mano en el front** y erratas. |
| UX / UI | 🟡 | Coherente en escritorio; **no usable en móvil**; navegación de cuadros y revista mejorable. |
| Rendimiento | 🟡 | Hoja activa sola y caché de descargas. Rankings tardan unos 10 s la primera vez y hay descargas de 66 MB. |
| Operación / despliegue | 🔴 | El build pesa 2,5 GB (copia los datos), sin CI, sin monitoreo, sin ambientes definidos. |
| Documentación | 🟢 | Arquitectura, diferencias con el kit, bugs corregidos y pendientes documentados; historial por fase. |

---

## 2. Arquitectura

**Fortalezas**
- ✅ **Configuración en runtime** (`public/config/routes.json`): un mismo build sirve para varios ambientes. URL de datos, Supabase y APIs se inyectan sin recompilar.
- ✅ **Capa de datos aislada** (`services/datosService.ts`): toda lectura pasa por `leerJson`, así que pasar de archivos estáticos a una API cambia un solo archivo. Cachea las promesas, lo que evita descargas duplicadas.
- ✅ **Separación clara por módulos**: `Auth`, `Inicio`, `Explorador` (compartido por Macro, Sistema y Tasas), `Sistema`, `Analisis`.
- ✅ **Rutas lazy** por pantalla: cada módulo se descarga solo al entrar.
- ✅ **Contexto de cálculo único** en la revista (`crearCtx`): fecha de corte, mes y año anteriores, series y variaciones en un solo lugar, en vez de los globales del original.
- ✅ **Autenticación desacoplada** detrás de `useAuth()`: se puede reemplazar Supabase por el SSO propio sin tocar las pantallas.

**Debilidades**
- ❌ **No hay backend ni API.** Filtrado, agregación, rankings y análisis se hacen en el navegador sobre archivos completos. Esto limita el volumen, la seguridad (§5) y el rendimiento (§8).
- ⚠️ **Híbrido "kit de satélite" con "app con SSO propio".** Siguen en el repo piezas que no se usan (`AuthorizedRoute`, `MenuPermissionsProvider`, `menuService`, `apiSSO`, `userService`, interceptor axios) y el catálogo del kit (`/home`, demos, guía). Añade ruido y peso de mantenimiento.
- ⚠️ **Estado de navegación fuera de la URL** (cuadro, sector, entidad, fecha, hoja): no se puede compartir, marcar ni volver atrás.
- ⚠️ **Sin capa de dominio**: los cálculos (variaciones, percentiles, calificaciones CAMELS/PERLAS, participaciones) están mezclados con los componentes de UI.

## 3. Código

**Fortalezas**
- ✅ **TypeScript estricto, ESLint y verificación de tokens limpios**; `pnpm build` pasa.
- ✅ **Componentes reutilizables** en lugar del HTML repetido del original:
  - `TablaCuadro` y `TablaBalances` para las tablas del explorador;
  - `PanelColeccion` para "Mi Colección";
  - `PaginaEstructura`, `PaginaRanking`, `PaginaSegmento` y `RejillaIndicadores` como plantillas de hojas;
  - `KpiBox` y `MiniKpi` para los indicadores.
- ✅ **Configuración declarativa**: las hojas se describen como datos (cuentas, series, títulos). Añadir una hoja o cambiar una cuenta es editar configuración.
- ✅ **Configuración generada desde el original** (árboles de menú e indicadores), con menos riesgo de transcripción.
- ✅ **Bugs del original corregidos y documentados**: entidad EFI08/09, filtro de provincia, KPIs duplicados, cuentas inexistentes, rótulos.
- ✅ Git con **un commit por fase**, rastreable.

**Debilidades**
- ❌ **Cero tests** (unitarios, de integración o e2e). Las funciones puras (`datos.ts`, `graficas.ts`, `opciones.ts`, `crearCtx`, `arbolBalances`) son fáciles de probar y hoy no tienen red de seguridad.
- ⚠️ **Hay cientos de códigos `CUC` y rótulos escritos en el código.** Si el origen de datos renombra una cuenta, la app falla en silencio (muestra 0).
- ⚠️ **Archivos grandes**:
  - `indicadoresConfig.ts` tiene unas 2.700 líneas;
  - `macroeconomico.ts`, unas 1.300.
  - Son configuración que debería venir de los datos o de un JSON de metadatos, no vivir en el código fuente.
- ⚠️ **Textos de análisis dinámico** (umbrales 50 %, 30 %, 10 %, −5 %, percentiles) codificados en el front sin fuente de negocio.
- ⚠️ **Lecturas de datos sin validar el formato**: se asume la forma del JSON (`as FilaCuadro[]`). Un cambio en la exportación rompe la app sin error claro.
- ⚠️ **Bundles grandes**: ECharts 1,05 MB, antd 0,8 MB y ExcelJS 0,94 MB, este último cargado bajo demanda.

## 4. Kit y sistema de diseño

**Fortalezas**
- ✅ **Tokens de diseño únicos** (colores por rol, tipografía, radios, sombras) con verificación automática: no hay colores ni tamaños sueltos.
- ✅ **Paleta de datos validada para daltonismo**, que reemplaza los hex del original.
- ✅ Buen uso del **kit analítico**:
  - `TarjetaGrafica`: pantalla completa, imagen, líneas/barras, estadísticas y etiquetas;
  - `TablaAnalitica`, `MiniGrafica`, `EstadoError`, `LimiteError`, `useService` y `exportarExcel`.
- ✅ Un fallo en una hoja no rompe la revista (`LimiteError` por hoja).

**Debilidades**
- ⚠️ **El kit está copiado dentro del repo** en vez de instalarse como `@idce/kit`: las mejoras del kit no llegan solas y los cambios locales pueden divergir.
- ⚠️ El kit está pensado para satélites (densidad 90 %, sin shell): **el shell propio (header y footer) no es un componente del kit** y no es responsive.
- ⚠️ Faltan piezas en el kit para esta app: índice/navegador de informe, selector de entidad con metadatos, tarjeta de calificación A-E. Hoy están resueltas en el módulo y no se pueden reutilizar.

## 5. Seguridad y autenticación

**Fortalezas**
- ✅ Todas las pantallas pasan por `ProtectedRoute` (en el original, 4 de 6 páginas estaban abiertas por un error).
- ✅ Se usa la *publishable key* de Supabase, pública por diseño, inyectada por configuración.

**Debilidades**
- ❌ **Los datos no están protegidos.** `public/data/*.json` se sirve estático: cualquiera con la URL descarga los 2,5 GB sin iniciar sesión. El login solo oculta la interfaz.
- ❌ **Registro abierto a cualquier correo**, sin aprobación ni roles.
- ⚠️ **Sin autorización por perfil**: todos ven todas las entidades y módulos. El kit trae permisos por menú, pero no se usan.
- ⚠️ SSO propio **pendiente de definición**. Supabase es una solución puente.
- ⚠️ El campo "password provisional" del registro sugiere un flujo que no existe.

## 6. Datos

(Detalle en [02_ANALISIS_DATOS_JSON.md](02_ANALISIS_DATOS_JSON.md).)

**Fortalezas**
- ✅ **Cobertura amplia y valiosa**:
  - macro desde 2000 (anual, mensual y trimestral);
  - sistema financiero por 10 sectores;
  - 229 entidades con balances, cartera, tasas, CAMELS/PERLAS y operaciones nuevas.
- ✅ **Estructura homogénea** (metadatos + columnas de período), fácil de procesar.
- ✅ **Catálogo de cuentas coherente** (`@` + código contable, sufijo `A` = anualizado) y jerarquía de balances recuperable por prefijo.

**Debilidades**
- ❌ **Fechas futuras con valores** (2026-09 a 2027-02) y cortes distintos entre archivos (sistema hasta 2027, reportes hasta 2026-07).
- ❌ **Archivos monolíticos**: 66 MB para ver un sector de balances; 296 MB para un ranking.
- ⚠️ **Ceros en lugar de nulos** (hasta 42 %), **números como texto** (Macro), **columnas basura**, unidades sin normalizar.
- ⚠️ **101 balances huérfanos** y 2 archivos de sector mezclados con los reportes de entidades.
- ⚠️ **No hay diccionario** de cuentas, unidades ni cuadros; faltan descripciones (265 de 776 cuentas del reporte).
- ⚠️ **Sin fecha de generación ni versión** de los datos; no hay trazabilidad del proceso en R que los produce.

## 7. Contenido de la app (funcional y de negocio)

**Fortalezas**
- ✅ **Cuatro módulos complementarios**: entorno macro, sistema agregado, tasas y análisis profundo por entidad.
- ✅ **Explorador potente**:
  - 195 cuadros macro y 23 del sistema;
  - filtros por sector, entidad, análisis y tipo de crédito;
  - colección de hasta 10 series con doble eje;
  - carrito persistente y descarga a Excel/CSV.
- ✅ **Revista de 31 hojas**: balance, estructura del activo y pasivo, PyG, cartera por segmento, turbulencia, operaciones nuevas, rankings, indicadores, CAMELS/PERLAS con calificación, tasas con bandas de volatilidad y comparativo contra hasta 3 entidades.
- ✅ **Análisis dinámico en texto** que resume variaciones y hallazgos, útil para usuarios no técnicos.

**Debilidades**
- ⚠️ **Metodologías sin documentar ni validar**: índice de turbulencia (umbrales que marcan "Turbulencia Alta" para casi todo), calificación CAMELS (la leyenda contradecía el cálculo), umbrales de los textos.
- ⚠️ **Contenido repetido y difícil de recorrer**: 5 "reportes" en el hub que son la misma revista; hojas 13–16 y 19–22 casi idénticas por segmento.
- ⚠️ **Erratas y rótulos inconsistentes** ("DEPÓSTIOS", "lioquidas", "PRODUCITVO", mayúsculas sostenidas, nombres técnicos de cuentas).
- ⚠️ **Mensajes engañosos**: "Datos actualizados" con la hora actual y "análisis en tiempo real" sobre datos mensuales estáticos.
- ⚠️ **Contenido de menú y datos desalineado** en Macro: entradas vacías y cuadros sin entrada.
- ⚠️ Sin **fuentes citadas** por cuadro (BCE, Superintendencias), salvo en algunas notas.

## 8. Rendimiento

**Fortalezas**
- ✅ La revista **monta solo la hoja activa** (el original redibujaba las 31 en cada cambio).
- ✅ **Rankings con un solo barrido** de reportes y concurrencia limitada (el original descargaba unos 283 MB por cada ranking).
- ✅ Caché de promesas por archivo; ExcelJS se carga bajo demanda.

**Debilidades**
- ❌ **La primera carga de rankings y del comparativo tarda unos 10 s** y descarga unos 296 MB.
- ⚠️ `base_balances.json` pesa 66 MB y se parsea en el hilo principal (la UI se congela).
- ⚠️ La caché vive en memoria: se pierde al recargar y todo se vuelve a descargar. No hay compresión garantizada ni caché HTTP configurada.
- ⚠️ Tablas grandes (balances con más de 1.000 filas y hasta 63 columnas) sin virtualización.

## 9. Operación y despliegue

**Fortalezas**
- ✅ Vite con build reproducible, `pnpm` con lockfile y configuración de puerto por `PORT`.
- ✅ Configuración de ambientes sin recompilar (`routes.json`).

**Debilidades**
- ❌ **`pnpm build` genera 2,5 GB** porque copia `public/data`. No es desplegable tal cual en la mayoría de hostings.
- ❌ **Sin CI/CD** (lint, typecheck, build y tests en cada PR) y **sin repositorio remoto**: el git es solo local.
- ⚠️ Sin monitoreo de errores (Sentry o similar) ni analítica de uso.
- ⚠️ Sin definición de ambientes (dev, QA, producción) ni del proceso de actualización mensual de datos.

## 10. Documentación y proceso

**Fortalezas**
- ✅ `docs/ARQUITECTURA_APP.md`: diferencias con los satélites, auth, datos, pantallas, bugs corregidos y pendientes.
- ✅ Convenciones del kit disponibles (`docs/CONVENCIONES_FRONTEND.md`, `TOKENS.md`, `VISTAS_ANALITICAS.md`).
- ✅ Historial por fase en git y estos tres documentos de diagnóstico.

**Debilidades**
- ⚠️ `README.md` sigue siendo mayormente el del kit (con un aviso al inicio).
- ⚠️ No hay documentación funcional para el usuario (qué es cada hoja, cómo leer CAMELS/PERLAS) ni del proceso de datos en R.

---

## 11. Hoja de ruta sugerida

| Horizonte | Acción | Capas |
|---|---|---|
| **Inmediato** | Proteger los datos: servirlos detrás de autenticación, o al menos fuera de `public/` y del build. | Seguridad, Operación |
| | Aclarar las fechas futuras y la fecha de corte real; mostrar "datos al <corte>". | Datos, Contenido |
| | Shell responsive (menú móvil) y tabla usable en móvil. | UX |
| | Repositorio remoto + CI (lint, typecheck, build). | Operación |
| **Corto plazo** | Resumen de entidades precalculado (rankings de ~10 s a menos de 1 s). | Datos, Rendimiento |
| | Diccionarios de cuentas, unidades y cuadros, y árbol del menú generado desde los datos. | Datos, Contenido |
| | Tests de las funciones puras y un e2e básico (login → Macro → revista). | Código |
| | Estado en la URL; buscador de cuadros; índice de la revista por secciones. | UX, Arquitectura |
| **Mediano plazo** | API propia (filtrado por cuadro, sector y período, rankings, comparativos) y el front solo como presentación. | Arquitectura, Datos, Seguridad |
| | SSO propio + roles y permisos por módulo o entidad. | Seguridad |
| | Validar con negocio las metodologías (turbulencia, CAMELS/PERLAS, umbrales) y mover las reglas al backend. | Contenido, Código |
| | Consumir `@idce/kit` como paquete y quitar el código del kit que no se usa. | Kit, Código |
