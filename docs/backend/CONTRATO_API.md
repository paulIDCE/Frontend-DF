# Contrato de API — Backend AnalisisFinanciero (.NET)

Documento para el equipo o agente de backend: especifica el proyecto a crear y los endpoints
que consumirá el frontend. Versión 1.0 · 30/09/2026.

---

## 0. Contexto

### 0.1 El proceso de migración por etapas
AnalisisFinanciero es la reconstrucción de **prueba-data** ("DATA FINANCIERO" de IDCE Consulting).
prueba-data es un sitio estático HTML/JS que leía unos 2,5 GB de JSON directamente desde el
navegador. La migración va por etapas:

| Etapa | Estado | Qué es |
|---|---|---|
| 1. Frontend | ✅ hecho | Vite + React 18 + TypeScript sobre el **IDCE React Starter Kit** (antd 6, Tailwind 4, ECharts). Replica las 6 pantallas: login, dashboard, Entorno Macroeconómico, Sistema Financiero, Tasas de Interés y Análisis Financiero (revista de 31 hojas). Hoy lee los JSON como archivos estáticos (`/data/...`). |
| **2. Backend (este documento)** | ⏳ | API .NET que **usa los mismos JSON como base de datos**, con la misma estructura de carpetas, y expone **consultas filtradas** en lugar de archivos monolíticos. |
| 3. Base de datos real | futuro | Reemplazar la fuente JSON por SQL Server u otro motor **sin cambiar este contrato**. |
| 4. SSO propio | futuro | Reemplazar la autenticación actual (Supabase) por el SSO propio de la app. |

### 0.2 La app no es un satélite del SSO
- El starter kit está pensado para **apps satélite**, que se abren dentro del iframe del SSO host y reciben de él la sesión y el menú.
- **AnalisisFinanciero no es un satélite**: tiene su propio login, su propio shell y se abre directo en el navegador.
- Hoy la autenticación es **Supabase** (correo y contraseña). El **SSO propio** está pendiente de definir.
- El backend **no debe depender** del SSO corporativo de los satélites: nada de `ValidarJWT` ni de `GetMenusByUser`.

### 0.3 Por qué hace falta el backend
Estos problemas están detallados en `docs/analisis/02_ANALISIS_DATOS_JSON.md` y `03_FORTALEZAS_DEBILIDADES.md`:
- **Los datos no están protegidos.** Hoy cualquiera descarga `/data/*.json` sin iniciar sesión.
- **Archivos monolíticos:**
  - para ver un sector de balances el navegador baja 66 MB;
  - para un ranking baja los 229 reportes (unos 296 MB y alrededor de 10 s).
- **Toda la lógica de filtrado, jerarquía y ranking corre en el navegador.**

La recomendación que se implementa aquí es **una API por cuadro**,
`GET /cuadros/{id}?sector=&desde=&hasta=`, ampliada con los filtros y consultas que necesita
cada pantalla.

### 0.4 Qué cambia en el frontend
- El frontend ya centraliza toda lectura de datos en `src/services/datosService.ts`. Cuando la API exista, solo cambia esa capa y sus adaptadores; las pantallas no se tocan.
- La URL base viene de `public/config/routes.json` → `VITE_API_URL` (hoy `http://localhost:5097/api`).
- El frontend usa axios (`api`) y envía `Authorization: Bearer <token>`.

---

## 1. Alcance

**Incluye (v1)**
- Proyecto ASP.NET Core con la fuente de datos JSON detrás de una interfaz (`IFuenteDatos`), para poder cambiarla luego por SQL.
- Los endpoints de §5 a §10.
- Autenticación por JWT configurable (§4.2), CORS, compresión, caché HTTP, OpenAPI/Swagger, health check.
- Tests con los criterios de aceptación de §13.

**No incluye (v1)**
- Escribir o cargar datos: la API es de solo lectura.
- Generar Excel, CSV o PDF: los arma el frontend.
- Textos de "análisis dinámico" y calificaciones CAMELS/PERLAS: siguen en el frontend por ahora.
- Gestión de usuarios y roles.

---

## 2. Stack y estructura sugerida

| | |
|---|---|
| Runtime | **.NET 10 (LTS)**, ASP.NET Core Web API |
| Serialización | `System.Text.Json`, **camelCase**, `null` explícito cuando no hay valor |
| Docs | OpenAPI + Swagger UI en `/swagger` (solo en Development) |
| Tests | xUnit + `WebApplicationFactory` |
| Puerto dev | **5097** (el frontend ya apunta a `http://localhost:5097/api`) |

```
AnalisisFinanciero.Api/
  Program.cs                 # DI, auth, CORS, compresión, rutas
  Endpoints/                 # Catalogos, Cuadros, Entidades, Rankings, Series, Meta
  Contratos/                 # DTOs de respuesta de este documento (records)
  Dominio/
    CuadrosService.cs        # resuelve tipo de cuadro, filtra, arma filas y jerarquía
    RankingService.cs
    Periodos.cs              # parseo y rango de "YYYY-MM" / "YYYY-Tn" / "YYYY"
  Datos/
    IFuenteDatos.cs          # contrato de acceso (se reemplazará por SQL)
    FuenteJson/              # lectores de cada tipo de archivo + caches
  Common/
    ApiErrorCodes.cs         # lista cerrada (§4.5)
    ErrorMiddleware.cs       # envelope de error (§4.5)
AnalisisFinanciero.Api.Tests/
```

**appsettings.json**
```json
{
  "Datos": { "RutaBase": "C:/datos/prueba-data/data", "MaxEntidadesEnCache": 40 },
  "Auth": { "Habilitada": true, "Modo": "Supabase", "Issuer": "https://<proyecto>.supabase.co/auth/v1", "JwksUrl": "https://<proyecto>.supabase.co/auth/v1/.well-known/jwks.json", "Audience": "authenticated" },
  "Cors": { "Origenes": ["http://localhost:3000", "http://localhost:51646"] }
}
```

La carpeta de datos **no debe servirse como estática**: queda fuera de `wwwroot`.

---

## 3. Fuente de datos (la "BD" JSON)

### 3.1 Estructura de carpetas (sin cambios respecto a hoy)
```
<RutaBase>/
  base_anual.json            # Macro anual       (tipo A)
  base_mensual.json          # Macro mensual     (tipo A)
  base_trimestral.json       # Macro trimestral  (tipo A)
  base_notas.json            # Notas por cuadro
  base_estru_sistema.json    # Sistema agregado  (tipo B)
  base_balances.json         # Balances agregados (tipo C)
  base_cartera.json          # Cartera y tasas activas agregado (tipo D)
  entidades_lista.json       # Catálogo de 229 entidades
  entidades/<archivo>.json   # Por entidad       (tipo E)
  balances/<archivo>.json    # Balance por entidad (tipo C)
  reportes/<archivo>.json    # Reporte por entidad (tipo F)
```
Las variables de cada tipo están en `docs/analisis/02_ANALISIS_DATOS_JSON.md` §2.

### 3.2 Formato de los archivos
- Cada archivo es un **array de filas**.
- Cada fila tiene **metadatos**: `Cuadro`, `Filtro`, `CUC`, `ID`, `Titulo_Cuadro`, `Unidad`, `Grupo`, `Variable`, `Nivel1..7`, `Nivel`, `Codigo_Base`, `Tamaño`, `Rango_Activos`, `DPA_PR`, `segmento_credito`.
- Cada fila tiene además **una clave por período**:
  - `YYYY-MM` en mensual (en el anual viene como `YYYY-12`);
  - `YYYY-Tn` en trimestral.

### 3.3 Reglas de lectura (obligatorias)
| Regla | Detalle |
|---|---|
| R1 Períodos | Una clave es período si cumple `^\d{4}(-(\d{2}\|T\d))?$`. Cualquier otra clave que no sea un metadato conocido se ignora, por ejemplo las 222 columnas `...109`–`...330` de `base_anual`. |
| R2 Números | Los valores pueden venir como número **o como texto**, incluida la notación científica (`"5.7262E-4"`). Se parsean con `CultureInfo.InvariantCulture`. `null`, `""`, `"-"` o un texto no numérico se devuelven como **`null`**. |
| R3 Ceros | Un `0` del origen se devuelve como `0`. No se puede distinguir de "sin dato", así que no se transforma. |
| R4 Orden | Las filas se devuelven **en el orden del archivo**, que es el orden contable. |
| R5 Entidades | La identidad de una entidad es su **`archivo`** en `entidades_lista.json` (p. ej. `BP__PICHINCHA`). El nombre para mostrar es `nombre` (`BP. PICHINCHA`). **El catálogo manda**: los archivos que no estén en él se ignoran y se registran con un warning. Hoy son 101 en `balances/` y 2 en `reportes/`. |
| R6 Metadatos de entidad | `Tamaño`, `Rango_Activos` y `DPA_PR` salen de la **primera fila** de `reportes/<archivo>.json`. Pueden ser `null`. |
| R7 Búsqueda de cuentas | En los reportes una cuenta se busca por `CUC` y, si no aparece, por `Variable`. La comparación **no distingue mayúsculas**. El frontend pide algunos indicadores por su `Variable`, por ejemplo "Percentil 75" (`CUC` `perc75_turb`) o "Tasa de Variación Anual Real Cart. Productiva" (`var_anual_comer`). |
| R8 Fechas futuras | Algunos archivos traen períodos posteriores a hoy (hasta 2027-02). **No se filtran**: se devuelven y se informan en `/meta` (§10), porque es un tema de datos pendiente de aclarar. |

### 3.4 Carga y caché (recomendado)
| Fuente | Estrategia |
|---|---|
| `base_*.json`, `entidades_lista.json`, `base_notas.json` (≈ 115 MB) | Cargar al iniciar, en memoria, ya parseados e indexados por `Cuadro` y, donde aplique, por `Filtro` e `ID`. |
| `reportes/*` (231 archivos, 296 MB) | Al iniciar, en segundo plano, construir un índice compacto: por entidad, `Dictionary<string CUC, double?[]>` y la lista de períodos (unos 90 MB). Alimenta los rankings, las series y el reporte. `/health` responde `Degraded` hasta que termine. |
| `entidades/*`, `balances/*` (2,1 GB) | Bajo demanda, con `MemoryCache` limitado (`MaxEntidadesEnCache`, LRU). |

- Las respuestas llevan **`ETag`** (derivado de la "versión de datos", §10) y `Cache-Control: private, max-age=3600`.
- **Compresión** Brotli y Gzip habilitada: las respuestas son series numéricas y comprimen mucho.

---

## 4. Convenciones generales

### 4.1 Base
- Prefijo **`/api`**. Todos los endpoints son `GET`.
- Nombres de parámetros y campos en **español camelCase**, alineados con el frontend.

### 4.2 Autenticación
- Todo `/api/**` requiere `Authorization: Bearer <jwt>`, salvo `/api/health`.
- **Modo actual, Supabase:** validar el access token de Supabase:
  - firma contra `JwksUrl` (o secreto HS256 si el proyecto es antiguo);
  - `iss` = `Issuer`;
  - `aud` = `authenticated`;
  - vigencia.
- La validación se configura en `Auth`, para cambiar al **SSO propio** sin tocar los endpoints.
- `Auth:Habilitada=false` desactiva la auth **solo en Development**.
- Si el token es inválido o falta: **401** con el envelope de §4.5. El frontend redirige a `/login`.

### 4.3 Períodos
| Frecuencia | Formato | `desde`/`hasta` aceptan |
|---|---|---|
| `mensual` | `YYYY-MM` | `YYYY-MM` |
| `trimestral` | `YYYY-Tn` | `YYYY-Tn` |
| `anual` | `YYYY-12` (formato del origen) | `YYYY` o `YYYY-12` |

- `desde` y `hasta` son **inclusivos** y **opcionales**. Si faltan, se devuelven todos los períodos.
- Si `desde > hasta` → 400 `VALIDATION_ERROR`.
- **Siempre** se devuelve `periodos: string[]` y, en cada serie, `valores: (number|null)[]` **alineado posición a posición** con `periodos`.

### 4.4 Identificadores de catálogo
| Parámetro | Valores | Texto en el origen |
|---|---|---|
| `sector` | `nacional`, `privado`, `popular`, `grande`, `medianos`, `peque`, `seg1`, `seg2`, `seg3`, `mut` | `Filtro`: "Sistema Financiero Nacional (privado y eps)", "Sector Financiero Privado", "Sector Financiero Popular y Solidario", "Bancos Privados Grandes", "Bancos Privados Medianos", "Bancos Privados Pequeños", "Coop. Segmento 1", "Coop. Segmento 2", "Coop. Segmento 3", "Asociación Mutualistas de Ahorro y Crédito para la Vivienda" |
| `analisis` | `saldo`, `horizontal`, `vertical` | `ID`: "Saldo Millones USD", "Análisis Horizontal (%)", "Análisis Vertical (%)" |
| `credito` | `total`, `productivo`, `consumo`, `inmobiliario`, `vip`, `educativo`, `microcredito` | `ID`: "Cartera Total", "Productivo", "Consumo", "Inmobiliario", "Vivienda interés Público y Social", "Educativo", "Microcrédito" |
| `entidad` | `archivo` del catálogo | p. ej. `BP__AMAZONAS` |

El mapeo **vive en el backend** y se expone en `/api/catalogos` (§5). La coincidencia con el texto del origen es **exacta**.

### 4.5 Errores
Todo error responde con el **envelope que ya interpreta el kit** (`src/utils/apiError.ts`):
```json
{
  "success": false,
  "message": "El cuadro SFN06 requiere el parámetro 'analisis'.",
  "detalle": "texto técnico opcional (solo para consola)",
  "errorCode": "VALIDATION_ERROR",
  "traceId": "00-4bf92f35...",
  "status": 400,
  "data": null
}
```
| Situación | HTTP | `errorCode` |
|---|---|---|
| Parámetro faltante, inválido o incompatible con el cuadro | 400 | `VALIDATION_ERROR` |
| Token faltante o inválido | 401 | `UNAUTHORIZED` |
| Cuadro, entidad o cuenta inexistente | 404 | `NOT_FOUND` |
| Error no controlado o archivo corrupto | 500 | `INTERNAL_ERROR` |

- `message` va redactado para el usuario final, en español.
- Las respuestas **exitosas** devuelven el recurso directamente, sin envelope.

---

## 5. Catálogos

### `GET /api/catalogos`
Todo lo que el frontend necesita para armar filtros, en una sola llamada.
```json
{
  "sectores":  [{ "id": "nacional", "nombre": "Sistema Financiero Nacional (privado y eps)" }],
  "analisis":  [{ "id": "saldo", "nombre": "Saldo Millones USD" }],
  "creditos":  [{ "id": "total", "nombre": "Cartera Total" }],
  "tamanos":   ["Banco Privado Grande", "Segmento 1", "Sin Segmento"],
  "rangosActivos": ["Nivel 1: 5 Millones - 13 Millones"],
  "provincias": ["Azuay", "Pichincha"]
}
```
`tamanos`, `rangosActivos` y `provincias` son los valores distintos, ordenados, de las entidades del catálogo (R6).

### `GET /api/entidades`
| Query | Tipo | Descripción |
|---|---|---|
| `q` | string? | Busca en el nombre, sin distinguir mayúsculas ni tildes |
| `tamano`, `rango`, `provincia` | string? | Filtro exacto |

```json
[
  {
    "id": "BP__AMAZONAS",
    "nombre": "BP. AMAZONAS",
    "tipo": "banco",                       // "banco" | "cooperativa" | "mutualista" (por prefijo BP./COAC./MUT.)
    "tamano": "Banco Privado Pequeño",
    "rango": "Nivel 6: 261 Millones - 598 Millones",
    "provincia": "Pichincha",
    "tieneBalance": true,                   // existe balances/<id>.json
    "periodos": { "desde": "2021-05", "hasta": "2026-07" }   // del reporte
  }
]
```
Orden alfabético por `nombre`. Son 229 elementos, sin paginar.

### `GET /api/entidades/{id}`
Un elemento con la forma anterior. 404 si no está en el catálogo.

---

## 6. Cuadros — Macro, Sistema y Tasas

### 6.1 `GET /api/cuadros`
Lista de cuadros disponibles con sus metadatos. Sirve para la validación, el menú y el buscador.

| Query | Descripción |
|---|---|
| `origen` | `macro` \| `sistema` \| `entidad` (opcional) |
| `q` | Busca en el id y el título (opcional) |

```json
[
  {
    "id": "SFN06",
    "titulo": "BALANCE DEL SISTEMA FINANCIERO",
    "origen": "sistema",
    "tipo": "balances",
    "frecuencia": "mensual",
    "vista": "arbol",
    "parametros": ["sector", "analisis"],
    "periodos": { "desde": "2021-05", "hasta": "2026-07" }
  }
]
```

### 6.2 Tipos de cuadro y cómo se resuelven
El `tipo` se deduce del id:

| `tipo` | Ids | Fuente | Filtros | Parámetros requeridos | `vista` |
|---|---|---|---|---|---|
| `macro` | `IEA*`, `IEM*`, `TOU*`, `VAB*`, `VAA*`, `VAP*` | `base_anual` + `base_mensual` + `base_trimestral` | `Cuadro` | — | `grupos` |
| `sistema` | `SFN01`–`SFN05`, `CAR04`, `CAR05`, `TPE01` | `base_estru_sistema` | `Cuadro`, `Filtro`=sector | `sector` | `grupos` |
| `balances` | `SFN06` | `base_balances` | `Cuadro`, `Filtro`=sector, `ID`=análisis | `sector`, `analisis` | `arbol` |
| `cartera` | `CAR01`–`CAR03`, `TEA01` | `base_cartera` | `Cuadro`, `Filtro`=sector, `ID`=crédito | `sector`, `credito` | `grupos` |
| `entidad` | `EFI01`–`EFI05`, `EFI10`–`EFI13`, `TPE02` | `entidades/<entidad>` | `Cuadro` | `entidad` | `grupos` |
| `balancesEntidad` | `EFI06` | `balances/<entidad>` | `Cuadro`, `ID`=análisis | `entidad`, `analisis` | `arbol` |
| `carteraEntidad` | `EFI07`–`EFI09`, `TEA02` | `entidades/<entidad>` | `Cuadro`, `ID`=crédito | `entidad`, `credito` | `grupos` |

Parámetros que **no aplican** al tipo (p. ej. `sector` en un cuadro `EFI`) → 400 `VALIDATION_ERROR`, para evitar ambigüedad.

### 6.3 `GET /api/cuadros/{id}` — endpoint principal
| Query | Tipo | Descripción |
|---|---|---|
| `sector` | id §4.4 | Según el tipo |
| `entidad` | id §4.4 | Según el tipo |
| `analisis` | id §4.4 | Según el tipo |
| `credito` | id §4.4 | Según el tipo |
| `desde`, `hasta` | período | Opcionales (§4.3) |
| `notas` | bool, default `true` | Incluye las notas del cuadro |

**Respuesta**
```json
{
  "id": "SFN01",
  "titulo": "ESTADO DE SITUACION CONSOLIDADO Y CONDENSADO",
  "unidad": "Millones USD",
  "tipo": "sistema",
  "frecuencia": "mensual",
  "vista": "grupos",
  "contexto": {
    "sector": "nacional", "sectorNombre": "Sistema Financiero Nacional (privado y eps)",
    "entidad": null, "entidadNombre": null,
    "analisis": null, "analisisNombre": null,
    "credito": null, "creditoNombre": null
  },
  "periodosDisponibles": { "desde": "2021-05", "hasta": "2027-02" },
  "periodos": ["2025-01", "2025-02", "2025-03"],
  "filas": [
    {
      "indice": 0,
      "clave": "SFN01|nacional|@1",
      "grupo": "ACTIVO",
      "variable": "ACTIVO",
      "cuc": "@1",
      "codigoBase": null,
      "nivel": 1,
      "padre": null,
      "valores": [110001.2, 110532.9, null]
    }
  ],
  "notas": ["Balance consolidado del Sector Financiero Privado y de la Economía Popular y Solidaria (segmentos 1 al 3). Fuente: ..."]
}
```

**Reglas de cada campo**

| Campo | Regla |
|---|---|
| `unidad`, `titulo` | De la primera fila resultante. Si no hay filas, los del cuadro según §6.1. |
| `indice` | Posición 0..n-1 dentro de la respuesta. |
| `clave` | **Estable entre exportaciones**, para el carrito y la colección del frontend. Formato: `{cuadro}\|{contexto}\|{cuc}`. Sin `cuc`: `{cuadro}\|{contexto}\|{grupo}\|{variable}`, y si se repite se agrega `#n` (hay 95 variables repetidas en Macro). `{contexto}` = sector o entidad + análisis o crédito, unidos por `-`. |
| `nivel` (vista `grupos`) | Índice del último `Nivel1..Nivel7` con texto no vacío; 0 si ninguno. |
| `nivel` (vista `arbol`) | `Nivel` del origen (1–4). |
| `padre` (vista `arbol`) | `indice` del padre: la **última fila anterior de nivel menor cuyo `codigoBase` sea prefijo** del de la fila y distinto de él. Es el algoritmo de pila del frontend (`TablaBalances.tsx`). Nivel 1 → `null`. |
| `padre` (vista `grupos`) | Siempre `null`. |
| `codigoBase` | Solo en balances. |
| `notas` | Párrafos de `base_notas.json` para ese `Cuadro`, separados por salto de línea y sin líneas vacías. En los cuadros de balances, `[]`. |
| Resultado vacío | Si los filtros no dan filas: **200** con `filas: []`, no 404. El 404 queda para un cuadro o entidad inexistente. |

**Ejemplos**
```
GET /api/cuadros/IEA111A?desde=2015&hasta=2025
GET /api/cuadros/SFN01?sector=seg1&desde=2024-01
GET /api/cuadros/SFN06?sector=nacional&analisis=vertical
GET /api/cuadros/TEA01?sector=nacional&credito=productivo
GET /api/cuadros/EFI06?entidad=BP__PICHINCHA&analisis=saldo
GET /api/cuadros/EFI08?entidad=BP__PICHINCHA&credito=productivo
```

---

## 7. Reporte por entidad — Análisis Financiero

La revista de 31 hojas trabaja sobre el reporte `REP01` de **una** entidad. Calcula las variaciones
mensuales y anuales, los KPIs y los textos en el frontend, así que necesita las series de las cuentas.

### `GET /api/entidades/{id}/reporte`
| Query | Descripción |
|---|---|
| `codigos` | Lista separada por comas de `CUC` o `Variable` (R7). **Opcional**: sin ella se devuelven las 776 cuentas. |
| `desde`, `hasta` | Opcionales (mensual). |

```json
{
  "entidad": { "id": "BP__AMAZONAS", "nombre": "BP. AMAZONAS", "tamano": "Banco Privado Pequeño", "rango": "Nivel 6: ...", "provincia": "Pichincha" },
  "periodos": ["2021-05", "2021-06", "2026-07"],
  "cuentas": [
    { "cuc": "@1", "variable": "1.    ACTIVO", "valores": [301.2, 305.8, 522.4] },
    { "cuc": "perc75_turb", "variable": "Percentil 75", "valores": [0.1, 0.12, 0.15] }
  ]
}
```
- Un código pedido que no exista **no es error**: se omite, y se lista en el header `X-Codigos-No-Encontrados`.
- La respuesta completa (776 × 63) comprimida pesa unos 150 KB. El frontend la pedirá **completa una vez por entidad** y la cacheará.

---

## 8. Rankings (hojas 5, 9, 24, 25, 26)

### `GET /api/rankings`
| Query | Requerido | Descripción |
|---|---|---|
| `cuenta` | ✅ | `CUC` a rankear. Hoy se usan `@1` (Activos), `@2` (Pasivo), `@14` (Cartera neta), `monto_total` (MOA) y `mop` (MOP). Debe aceptar cualquier `CUC` del reporte. |
| `fecha` | ✅ | Corte `YYYY-MM` |
| `agrupacion` | ✅ | `sector` (mismo `Tamaño`) \| `activos` (mismo `Rango_Activos`) \| `provincia` (mismo `DPA_PR`) \| `todas` |
| `entidad` | ✅ salvo `todas` | Entidad de referencia: define el grupo y su posición |

**Cálculo.** Replica `renderRankingGenerico` del original, con el bug de provincia corregido.
1. `fechaComparacion` = `fecha` − 12 meses.
2. El grupo son las entidades del catálogo con el mismo valor de agrupación que la de referencia, incluida ella misma.
3. Por entidad: `anterior` = valor en `fechaComparacion` y `actual` = valor en `fecha`. Un nulo cuenta como 0.
4. `participacionX` = `valor / Σ valores del grupo × 100`. Si la suma es ≤ 0, es 0.
5. Orden por `participacionActual` de mayor a menor; `posicion` va de 1 a n.

```json
{
  "cuenta": "@1",
  "fecha": "2026-07",
  "fechaComparacion": "2025-07",
  "agrupacion": { "tipo": "sector", "valor": "Banco Privado Pequeño" },
  "total": { "anterior": 2250.9, "actual": 2546.5 },
  "posicionEntidad": 2,
  "filas": [
    { "posicion": 1, "entidadId": "BP__PROCREDIT", "nombre": "BP. PROCREDIT", "anterior": 726.4, "actual": 717.8, "participacionAnterior": 32.27, "participacionActual": 28.19 },
    { "posicion": 2, "entidadId": "BP__AMAZONAS",  "nombre": "BP. AMAZONAS",  "anterior": 424.7, "actual": 522.4, "participacionAnterior": 18.87, "participacionActual": 20.51 }
  ]
}
```
Se calcula sobre el índice compacto de reportes (§3.4): **objetivo < 200 ms**. Hoy tarda unos 10 s en el navegador.

---

## 9. Series para comparar

### 9.1 `GET /api/entidades/series` — comparativo entre entidades (hoja 31)
| Query | Descripción |
|---|---|
| `ids` | Hasta **4** entidades separadas por coma (principal + 3). Si son más → 400. |
| `codigos` | Lista de `CUC`/`Variable` (máx. 50) |
| `desde`, `hasta` | Opcionales |

```json
{
  "periodos": ["2021-05", "2026-07"],
  "series": [
    { "entidadId": "BP__AMAZONAS", "codigo": "@1", "variable": "1.    ACTIVO", "valores": [301.2, 522.4] },
    { "entidadId": "BP__ATLANTIDA", "codigo": "@1", "variable": "1.    ACTIVO", "valores": [120.0, 150.3] }
  ]
}
```
`periodos` es la **unión** de los períodos de las entidades pedidas. Si a una entidad le falta un período, en esa posición va `null`.

### 9.2 `GET /api/sistema/series` — sectores como referencia (hoja 2)
| Query | Descripción |
|---|---|
| `codigos` | `CUC` de `base_estru_sistema` (hoy `@1,@2,@3,Gan_Eje`) |
| `sectores` | Ids de sector (§4.4). Opcional: sin él, los 10. |
| `cuadros` | Opcional. Restringe `Cuadro` (hoy `SFN01,SFN02`). |
| `desde`, `hasta` | Opcionales |

```json
{
  "periodos": ["2021-05", "2027-02"],
  "series": [
    { "sector": "nacional", "sectorNombre": "Sistema Financiero Nacional (privado y eps)", "codigo": "@1", "valores": [66925.4, 115145.0] }
  ]
}
```

---

## 10. Metadatos y salud

### `GET /api/meta`
Reemplaza el "Datos actualizados" falso del hub, que hoy muestra la hora actual.
```json
{
  "versionDatos": "2026-08-15T10:22:00Z",
  "fuentes": [
    { "fuente": "macro-mensual", "archivo": "base_mensual.json", "desde": "2000-01", "hasta": "2026-08", "modificado": "2026-08-15T10:22:00Z" },
    { "fuente": "reportes", "archivos": 229, "desde": "2021-05", "hasta": "2026-07" }
  ],
  "ultimoCorteComun": "2026-07",
  "advertencias": [
    "base_estru_sistema.json trae períodos posteriores a hoy (2026-09..2027-02).",
    "balances/: 101 archivos sin entidad en el catálogo (ignorados)."
  ]
}
```
- `versionDatos` es la fecha de modificación más reciente entre los archivos base. Se usa también para el `ETag`.
- `ultimoCorteComun` es el menor de los "hasta" de reportes, balances y sistema.

### `GET /api/health` (sin auth)
- `Healthy` si los archivos base están cargados y el índice de reportes está listo.
- `Degraded` mientras el índice se construye.
- `Unhealthy` si falta `RutaBase`.
- Respuesta: `{ "status": "Healthy", "detalle": "..." }`.
- Con `Datos:Sql:Habilitado = true` también pasa a `Degraded` si SQL cae: mientras tanto todos los endpoints responden solo con JSON (BackendDF, 05/10/2026). El front lo usa en la banda de origen de datos (`src/layout/AvisoOrigenDatos.tsx`).

**Origen SQL / JSON por endpoint (05/10/2026).** Ningún endpoint es 100 % SQL: el orden de las filas, los títulos y el catálogo de entidades salen del JSON. De SQL salen los saldos de las cuentas @NNNN y los 5 indicadores de solvencia de EFI05. Son *mixtos* EFI01/SFN01, EFI02/SFN02, EFI05, EFI06/SFN06 (solo con el análisis "saldo"), EFI07, EFI10, `/entidades/{id}/reporte`, `/entidades/series`, `/rankings` y `/sistema/series`. El resto (macro BCE, anualizados, fuentes y usos, indicadores, CAMELS, PERLAS, cartera, tasas, SFN05/07/08) sale del JSON. Las fechas ya son las de la ventana de la BD, salvo EFI09, TPE02 y CAR03, que no salen del .sav. Mapa en el front: `origenCuadro` (`src/layout/origenDatos.ts`).

---

## 11. Qué endpoint usa cada pantalla

| Pantalla | Hoy (estático) | Con la API |
|---|---|---|
| Login, Dashboard | — | — (auth con Supabase) |
| Macro | 3 archivos base + notas (≈ 19 MB) | `GET /cuadros/{IEA…}` |
| Sistema, Tasas: filtros | `entidades_lista.json` | `GET /catalogos`, `GET /entidades` |
| Sistema, Tasas: cuadros | archivos base o por entidad (hasta 66 MB) | `GET /cuadros/{id}?sector\|entidad&analisis&credito` |
| Análisis, hub | `entidades_lista` + 1 reporte | `GET /entidades`, `GET /entidades/{id}`, `GET /meta` |
| Análisis, hojas 1, 3, 4, 6–8, 10–23, 27–30 | 1 reporte | `GET /entidades/{id}/reporte` |
| Análisis, hoja 2 | `base_estru_sistema` (13 MB) | `GET /sistema/series?codigos=@1,@2,@3,Gan_Eje` |
| Análisis, hojas 5, 9, 24–26 | 229 reportes (≈ 296 MB) | `GET /rankings?cuenta=&fecha=&agrupacion=&entidad=` |
| Análisis, hoja 31 | 229 reportes + hasta 3 | `GET /entidades?tamano&provincia&rango` + `GET /entidades/series` |

---

## 12. Requisitos no funcionales

| Requisito | Meta |
|---|---|
| Latencia p95 (datos ya en caché) | `/cuadros` < 150 ms · `/rankings` < 200 ms · `/entidades/{id}/reporte` < 100 ms |
| Primer acceso a una entidad o balance no cacheado | < 1,5 s |
| Memoria | < 1,5 GB con `MaxEntidadesEnCache=40` |
| Arranque | Base lista en menos de 20 s; índice de reportes en segundo plano |
| Logs | Estructurados, con `traceId` en cada error (el mismo del envelope) |
| CORS | Solo los orígenes de `Cors:Origenes` |
| Seguridad | Sin rutas de archivos en los parámetros: la entidad se resuelve **solo** por el catálogo. Así se evita path traversal. |

---

## 13. Criterios de aceptación

Valores medidos sobre los datos actuales, con la misma lógica que hoy usa el frontend:

| # | Petición | Resultado esperado |
|---|---|---|
| 1 | `GET /api/cuadros/IEA111A` | 13 filas, 26 períodos (2000-12 … 2025-12), `titulo` "OFERTA MONETARIA (M1) Y LIQUIDEZ TOTAL (M2)"; la fila 0 es "Especies Monetarias en Circulación (1)" con valor 2025-12 = 21549.2 (redondeado). |
| 2 | `GET /api/cuadros/SFN01?sector=nacional` | 212 filas, 69 períodos (2021-05 … 2027-01). Solo TPE01 llega a 2027-02. |
| 3 | `GET /api/cuadros/SFN06?sector=nacional&analisis=saldo` | 1.517 filas, `vista: "arbol"`; 7 filas de nivel 1 con `padre: null` (ACTIVO … CUENTAS DE ORDEN); la fila "11.    FONDOS DISPONIBLES" tiene como `padre` a "1.    ACTIVO". |
| 4 | `GET /api/cuadros/CAR01?sector=nacional&credito=total` | 42 filas. |
| 5 | `GET /api/cuadros/TEA01?sector=seg1&credito=productivo` | 21 filas, `unidad` "Porcentajes". |
| 6 | `GET /api/cuadros/EFI06?entidad=BP__PICHINCHA&analisis=vertical` | 1.098 filas. |
| 7 | `GET /api/cuadros/EFI08?entidad=BP__PICHINCHA&credito=productivo` | 24 filas. |
| 8 | `GET /api/cuadros/TPE02?entidad=BP__PICHINCHA` | 7 filas. |
| 9 | `GET /api/cuadros/SFN06?sector=nacional` | 400 `VALIDATION_ERROR` (falta `analisis`). |
| 10 | `GET /api/cuadros/EFI01?entidad=NO_EXISTE` | 404 `NOT_FOUND`. |
| 11 | `GET /api/cuadros/EFI01?entidad=BP__PICHINCHA&sector=nacional` | 400 (`sector` no aplica). |
| 12 | `GET /api/rankings?cuenta=@1&fecha=2026-07&agrupacion=sector&entidad=BP__AMAZONAS` | 10 filas; `total.actual` 2546.5; `total.anterior` 2250.9; 1.º BP. PROCREDIT 28.19 %; 2.º BP. AMAZONAS 20.51 %; 3.º BP. BANCODESARROLLO 12.19 %; `posicionEntidad` 2. |
| 13 | `GET /api/entidades?tamano=Banco%20Privado%20Pequeño` | 10 entidades. |
| 14 | `GET /api/entidades` | 229 entidades (los 2 reportes de sector y los 101 balances huérfanos **no** aparecen). |
| 15 | `GET /api/entidades/BP__PICHINCHA/reporte` | 776 cuentas, 63 períodos (2021-05 … 2026-07); `entidad.tamano` "Banco Privado Grande", `provincia` "Pichincha". |
| 16 | `GET /api/entidades/BP__PICHINCHA/reporte?codigos=@1,Percentil 75,NOPE` | 2 cuentas; header `X-Codigos-No-Encontrados: NOPE`. |
| 17 | Cualquier `/api/**` sin token (Auth habilitada) | 401 `UNAUTHORIZED` con el envelope. |
| 18 | `GET /api/cuadros/IEA111A?desde=2026&hasta=2020` | 400 `VALIDATION_ERROR`. |
| 19 | Macro, valor guardado como `"5.7262000000000003E-4"` | Se devuelve el número `0.00057262`. |

---

## 14. Evolución prevista (no implementar en v1, pero no bloquearla)

- **Cambiar `FuenteJson` por SQL** detrás de `IFuenteDatos`, sin cambios en el contrato.
- **Diccionarios** (`/api/catalogos/cuentas`, `/unidades`): nombre, unidad y formato por `CUC`, para quitar los rótulos que hoy están en el frontend.
- **Árbol de menú de Macro** servido por la API: `GET /api/cuadros/arbol?origen=macro`, generado desde los datos. Hoy está copiado en el frontend (`src/modulos/Explorador/arboles/`).
- **Autorización por rol o entidad** cuando exista el SSO propio.
- Mover al backend los cálculos de dominio de la revista: variaciones, calificaciones CAMELS/PERLAS y percentiles de turbulencia.
