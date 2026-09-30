# Análisis de los JSON de datos

Inventario de `prueba-data/data` (copiado a `public/data`), perfilado con un script el
30/09/2026. Los archivos grandes se leyeron completos. De las carpetas por entidad se leyó una
muestra de 7 archivos por carpeta, pero se contaron y midieron todos.

## 1. Resumen

| | |
|---|---|
| Volumen total | ≈ **2,5 GB** en 800+ archivos |
| Formato | JSON "ancho": **una fila por variable** y **una columna por período** (`YYYY-MM`, `YYYY-Tn`) |
| Familias de datos | **5**: Macroeconómico, Sistema Financiero agregado, Balances detallados, Cartera/Tasas, Reportes por entidad (más catálogos) |
| Cuadros distintos | Macro 195 · Sistema 8 · Balances 1 (+1 por entidad) · Cartera/Tasas 4 · Por entidad 14 · Reportes 1 (REP01, 776 cuentas) |
| Entidades | 229 en el catálogo: **202 cooperativas (COAC), 23 bancos (BP), 4 mutualistas (MUT)** |
| Cobertura temporal | Macro 2000-01 → 2026-08 · Sistema y entidades 2021-05 → **2027-01/02** · Balances y reportes 2021-05 → 2026-07 |
| Tipo de valor | Números (`int`/`float`); en Macro, **~135.000 celdas vienen como texto** (`"123.4"`, `"5.72E-4"`) |

### 1.1 Mapa de archivos

| Familia | Archivo(s) | Tamaño | Filas | Períodos | La usa |
|---|---|---|---|---|---|
| Macro anual | `base_anual.json` | 2,0 MB | 2.292 | 26 (2000-12 → 2025-12) | Macro |
| Macro mensual | `base_mensual.json` | 14,7 MB | 2.041 | 320 (2000-01 → 2026-08) | Macro |
| Macro trimestral | `base_trimestral.json` | 2,4 MB | 1.094 | 105 (2000-T1 → 2026-T1) | Macro |
| Notas | `base_notas.json` | 0,3 MB | 234 | — | Macro, Sistema, Tasas |
| Sistema agregado | `base_estru_sistema.json` | 13,0 MB | 6.650 | 70 (2021-05 → 2027-02) | Sistema, Tasas, Análisis (hoja 2) |
| Balances agregados | `base_balances.json` | **65,8 MB** | 39.207 | 63 (2021-05 → 2026-07) | Sistema (SFN06) |
| Cartera/Tasas agregado | `base_cartera.json` | 14,3 MB | 7.051 | 69 (2021-05 → 2027-01) | Sistema, Tasas |
| Por entidad | `entidades/*.json` (229) | 607 MB (2,5–5 MB c/u) | 1.434 c/u | 69 (2021-05 → 2027-01) | Sistema, Tasas (EFI, TEA02, TPE02) |
| Balance por entidad | `balances/*.json` (**330**) | **1.559 MB** (2–6,6 MB c/u) | 3.294–3.573 c/u | 33–63 | Sistema (EFI06) |
| Reporte por entidad | `reportes/*.json` (231) | 296 MB (0,08–2,4 MB c/u) | 776 c/u | 63 (2021-05 → 2026-07) | Análisis (31 hojas) |
| Catálogo | `entidades_lista.json` | < 0,1 MB | 229 | — | Todos |
| Sin uso | `entidades.json`, `notas.json`, `entidades_lista_repo.json` | < 0,2 MB | — | — | Nadie (no se copiaron) |

---

## 2. Tipos de archivo y sus variables

### Tipo A · Macroeconómico (`base_anual`, `base_mensual`, `base_trimestral`)

| Variable | Tipo | Presencia | Descripción |
|---|---|---|---|
| `Cuadro` | texto | 100 % | Id del cuadro. `IEA…A` anual, `IEM…` mensual, `IEM…T` trimestral, `TOU`/`VAB`/`VAA`/`VAP` (cuentas nacionales trimestrales). El primer dígito es el capítulo: 1 Monetario, 2 Fiscal, 3 Externo, 4 Real. |
| `Titulo_Cuadro` | texto | 100 % | Título en mayúsculas. |
| `Unidad` | texto | 99,6 % | **25-27 valores distintos** para pocas unidades reales ("Millones de USD", "Millones USD", "Millones de USD (al final del período)"…). |
| `Grupo` | texto | 99,8 % | Bloque dentro del cuadro (80 distintos: ACTIVOS, PASIVOS, IMPORTACIONES…). |
| `Variable` | texto | 100 % | Rótulo de la fila; a veces con notas al pie "(1)". |
| `Nivel1`…`Nivel6` | texto | 0,1–29 % | Jerarquía: el nivel es la última columna `NivelN` con contenido. |
| `YYYY-MM` / `YYYY-Tn` | número o texto | 100 % | Valores. En el anual las columnas son `YYYY-12`. |
| `...109` … `...330` | — | solo anual | **222 columnas basura** (restos de exportar desde R/Excel). |

- **Cuadros**:
  - anual 68 (`IEA` 2.157 filas + `IEM` 135);
  - mensual 65;
  - trimestral 62.
  - En total, **195 cuadros** con datos.
- **Cuadros más grandes**: `IEA132A` e `IEA172A` (153 filas), `IEA321A` (145).

### Tipo B · Sistema Financiero agregado (`base_estru_sistema`)

| Variable | Tipo | Presencia | Descripción |
|---|---|---|---|
| `Cuadro` | texto | 100 % | 8 cuadros (lista abajo). |
| `Filtro` | texto | 100 % | **Sector**, 10 valores con 665 filas cada uno: SFN (privado + EPS), Sector Privado, Sector Popular y Solidario, Bancos Grandes/Medianos/Pequeños, Coop. Seg. 1/2/3, Mutualistas. |
| `CUC` | texto | 74 % | Código de cuenta (Catálogo Único de Cuentas o calculado, p. ej. `@1`, `Gan_Eje`). |
| `CUC_R` | texto | 0,5 % | Código alternativo (uso no documentado). |
| `Titulo_Cuadro`, `Unidad`, `Grupo`, `Variable` | texto | 100 % | Como en el tipo A. `Unidad`: "Millones USD", "Millones USD / Porcentajes", "Porcentajes". |
| `Nivel1`…`Nivel7` | texto | 0,8–46 % | Jerarquía. |
| `YYYY-MM` | número | 100 % | 70 meses, **incluye 2026-09 → 2027-02** (ver §3). |

Los 8 cuadros son:
- `SFN01` Estado de situación (2.120 filas);
- `SFN02` PyG mensual (1.170);
- `SFN03` PyG anualizado (1.170);
- `SFN04` Fuentes y usos (870);
- `SFN05` Patrimonio técnico (70);
- `CAR04` Estructura de depósitos (700);
- `CAR05` Indicadores financieros (410);
- `TPE01` Tasas pasivas efectivas (140).

### Tipo C · Balances detallados (`base_balances`, `balances/*.json`)

| Variable | Tipo | Presencia | Descripción |
|---|---|---|---|
| `Cuadro` | texto | 100 % | `SFN06` (agregado) o `EFI06` (por entidad). |
| `Filtro` | texto | 100 % | Sector (agregado) o nombre de la entidad. |
| `Titulo_Cuadro` | texto | 100 % | "BALANCE DEL SISTEMA FINANCIERO" / "BALANCE DETALLADO". |
| `ID` | texto | 100 % | **Tipo de análisis**: "Saldo Millones USD", "Análisis Horizontal (%)", "Análisis Vertical (%)". Un tercio de las filas cada uno. |
| `Unidad` | texto | 100 % | Una por `ID`. |
| `Variable` | texto | 100 % | Cuenta con su código ("1101.    Caja"). |
| `Nivel` | entero 1–4 | 100 % | Profundidad en el catálogo (1 = 210 filas, 4 = 29.313). |
| `Codigo_Base` | texto | agregado | Código contable. La jerarquía sale por **prefijo** (`11` → `1101` → `110105`). |
| `YYYY-MM` | número | 100 % | 63 meses. **42,6 % de las celdas son 0.** |

- **El archivo agregado es el más pesado de la app (66 MB) y se descarga entero** para mostrar un sector y un tipo de análisis, es decir, alrededor del 3 % del archivo.
- Por entidad hay 1.098 cuentas × 3 análisis.

### Tipo D · Cartera y tasas activas (`base_cartera`)

| Variable | Tipo | Presencia | Descripción |
|---|---|---|---|
| `Cuadro` | texto | 100 % | `CAR01` Estructura de cartera (2.860), `CAR02` Monto de operaciones activas (924), `CAR03` Cartera por rango (2.520), `TEA01` Composición de tasas (747). |
| `Filtro` | texto | 100 % | Sector (10 valores). |
| `ID` | texto | 98 % | **Tipo de crédito**: Cartera Total, Productivo, Consumo, Inmobiliario, Vivienda de Interés Público y Social, Educativo, Microcrédito. **114 filas sin `ID`** (CAR02, TEA01), que la app no puede mostrar con ningún filtro. |
| `CUC`, `Titulo_Cuadro`, `Unidad`, `Grupo`, `Variable`, `Nivel1`…`Nivel3` | texto | 76–100 % | Como en el tipo B. |
| `segmento_credito` | texto | 13 % | Subsegmento (solo CAR02). |
| `YYYY-MM` | número | 100 % | 69 meses hasta 2027-01. |

### Tipo E · Por entidad (`entidades/*.json`)

- Tienen las mismas variables que los tipos B y D: `Cuadro`, `Filtro` (= nombre de la entidad), `CUC`, `CUC_R`, `ID`, `Titulo_Cuadro`, `Unidad`, `Grupo`, `Variable` y `Nivel1`…`Nivel7`.
- Cada entidad tiene **1.434 filas repartidas en 14 cuadros**:

| Cuadro | Título | Filas | Filtro por `ID` |
|---|---|---|---|
| EFI01 | Estado de situación | 212 | — |
| EFI02 / EFI03 | PyG mensual / anualizado | 117 / 117 | — |
| EFI04 | Fuentes y usos | 87 | — |
| EFI05 | Patrimonio técnico | 7 | — |
| EFI07 | Estructura de cartera | 286 | Tipo de crédito |
| EFI08 | Monto de operaciones activas | 102 | Tipo de crédito |
| EFI09 | Cartera por rango | 252 | Tipo de crédito |
| EFI10 | Estructura de depósitos | 70 | — |
| EFI11 | Indicadores financieros | 41 | — |
| EFI12 | Indicadores CAMELS | 21 | — |
| EFI13 | Indicadores PERLAS | 40 | — |
| TEA02 | Composición de tasas | 75 | Tipo de crédito |
| TPE02 | Tasas pasivas efectivas | 7 | — |

### Tipo F · Reporte por entidad (`reportes/*.json`) — alimenta la revista de Análisis

| Variable | Tipo | Presencia | Descripción |
|---|---|---|---|
| `Cuadro` | texto | 100 % | Siempre `REP01`. |
| `Filtro` | texto | 100 % | Nombre de la entidad. |
| `CUC` | texto | 100 % | **776 códigos únicos por entidad** (ver familias abajo). |
| `Variable` | texto | 85 % | Descripción. **120 filas sin descripción y 145 donde la descripción es el mismo código.** |
| `Titulo_Cuadro` | texto | 100 % | "REPORTES". |
| `Tamaño` | texto | fila 1 | Segmento: Segmento 1–5, Sin Segmento, Banco Privado Grande/Mediano/Pequeño. |
| `Rango_Activos` | texto | fila 1 | 8 niveles ("Nivel 1: 5 Millones - 13 Millones" … "Nivel 8: 3269 Millones - 22807 Millones"). |
| `DPA_PR` | texto | fila 1 | Provincia (24 valores). |
| `YYYY-MM` | número | 100 % | 63 meses hasta 2026-07. |

**Familias de `CUC` (de 776)**

| Prefijo | Cantidad | Qué son | Ejemplos |
|---|---|---|---|
| `@` + código | 412 | Cuentas contables del catálogo (el sufijo `A` indica anualizado) | `@1` Activo, `@14` Cartera, `@2103` Depósitos a plazo, `@5A` Ingresos anualizados, `@1425` cartera que no devenga interés |
| `IF` | 45 | Indicadores de cartera, también por segmento `_1`…`_6` | `IF007` Cartera por vencer, `IF012` Morosidad, `IF012_2` Morosidad de consumo |
| `SB`, `SBP` | 31 | Indicadores de la Superintendencia | `SB010` Activos productivos, `SB036` Rendimiento de cartera |
| `S`, `P`, `E`, `R`, `L`, `A`, `C`, `M` | ~75 | Componentes CAMELS y PERLAS | `C1_capit_neta`, `E1_ROA`, `S_P1_acum`, `R9_Gas_Oper` |
| `efic`, `Indic`, `IVF` | ~9 | Puntajes globales | `efic_perlas_acum`, `Indic_CAMELS_1`, `IVF_Cuantitativo` |
| `pro`, `num`, `moa`, `part`, `Plazo`, `OPTPE` | ~73 | Operaciones nuevas activas y pasivas (monto, número, promedio, participación, plazo) | `moa_cor`, `num_mic`, `pro_op30`, `part_proc` |
| `t`, `ref`, `max`, `TAEB`, `TEN`, `TPE`, `CF`, `GO`, `RC`, `CK`, `@1SD`/`@2SD` | ~80 | Tasas activas y pasivas, componentes de la tasa de equilibrio y bandas de volatilidad | `TAEB_Empr`, `CF_Corporativo`, `@2SD_Mino`, `TPE361` |
| `Mar`, `Marg`, `Gan` | ~14 | Márgenes de PyG | `Mar_Inte`, `Gan_Eje_anual` |
| `tasa`, `var`, `turbulencia` | ~10 | Variación de cartera e índice de turbulencia | `tasa_IF0071`, `var_anual_comer` |

Los percentiles de turbulencia y las variaciones reales vienen **por `Variable`, no por `CUC`**: por ejemplo "Percentil 75" o "Tasa de Variación Anual Real Cart. Productiva".

### Tipo G · Catálogos

| Archivo | Variables | Notas |
|---|---|---|
| `entidades_lista.json` | `id`, `nombre`, `archivo`, `_row` | 229 entidades; `archivo` es el nombre del JSON (`BP__PICHINCHA`). `id`, `nombre` y `_row` son iguales. |
| `base_notas.json` | `Cuadro`, `Notas` | 234 notas para 230 cuadros; texto con `\r\n` y numeración "(1)". |
| `entidades.json` | `id` (RUC), `nombre` | No se usa. |
| `notas.json` | `Cuadro`, `Notas` | No se usa; códigos antiguos (`IEA111` sin `A`). |
| `entidades_lista_repo.json` | = `entidades_lista` | Duplicado exacto. |

---

## 3. Hallazgos de calidad de datos

| # | Severidad | Hallazgo | Impacto | Recomendación |
|---|---|---|---|---|
| D1 | 🔴 | **Períodos futuros con datos**: `base_estru_sistema`, `base_cartera` y `entidades/*` traen valores para **2026-09 → 2027-01/02** (p. ej. Activo SFN 2027-01 = 115.145), cuando hoy es 30/09/2026. Balances y reportes terminan en 2026-07. | La app muestra como reales cifras que no pueden serlo (¿proyecciones? ¿fechas corridas?). Sistema y Análisis no coinciden en su último mes. | Confirmar con quien genera los datos (script de R). Si son proyecciones, marcarlas en una columna aparte; si es un desfase, corregir las fechas. |
| D2 | 🔴 | **101 archivos de balances huérfanos**: `balances/` tiene 330 archivos y el catálogo 229 entidades. | 1 GB descargable que nadie puede ver (o entidades que faltan en el catálogo). | Decidir si esas COAC van al catálogo o se eliminan. |
| D3 | 🟠 | **Números guardados como texto** en Macro (~135.000 celdas, a veces en notación científica `"5.7262E-4"`). | Hay que convertirlos en cada lectura; sumas o comparaciones directas fallan. | Exportar como número. |
| D4 | 🟠 | **222 columnas basura** (`...109`…`...330`) en `base_anual`. | Peso extra; la app las filtra. | Limpiar en la exportación. |
| D5 | 🟠 | **No se distingue cero de "sin dato"**: 42,6 % de ceros en balances, 21,6 % en sistema y 16 % en cartera. Hay entidades que empiezan en 2023 y su balance trae 0 antes de esa fecha. | Gráficas que caen a 0; promedios y variaciones distorsionados (variación −100 %). | Usar `null` cuando no exista el dato. |
| D6 | 🟠 | **Unidades sin normalizar**: 25-27 textos distintos para 6-7 unidades reales. | No se puede formatear por unidad de forma automática. | Catálogo de unidades (código + etiqueta + formato). |
| D7 | 🟠 | **Metadatos de la entidad solo en la primera fila** del reporte (`Tamaño`, `Rango_Activos`, `DPA_PR`) y **ausentes en 2 archivos** (agregados de sector que se colaron en `reportes/`). | Hay que leer el reporte entero para saber el tamaño de una entidad; rankings más lentos. | Mover esos atributos a `entidades_lista.json`. |
| D8 | 🟠 | **Segmentos inconsistentes**: los reportes usan Segmento 1–5 y "Sin Segmento" (37 entidades), pero los filtros de sector de Sistema solo cubren Seg. 1-3; los Segmentos 4 y 5 no son sector en ningún archivo agregado. | Una entidad de Segmento 4 no tiene contra quién compararse en Sistema. | Alinear la clasificación de entidades con los sectores agregados. |
| D9 | 🟠 | **114 filas sin `ID`** en `base_cartera` (CAR02 y TEA01). | Nunca se muestran, porque todo filtro exige un tipo de crédito. | Completar el `ID` o documentar qué son. |
| D10 | 🟡 | **Descripciones faltantes o técnicas** en reportes: 120 sin `Variable` y 145 con `Variable = CUC`. | La app debe escribir los rótulos a mano (hay cientos en el código). | Diccionario de cuentas (CUC → nombre, unidad, formato). |
| D11 | 🟡 | **Menú de Macro frente a datos**: 5 entradas sin datos (`IEA1102`, `IEA1103`, `IEA32A`…; dos se corrigieron) y 9 cuadros con datos sin entrada en el menú (`IEA323A`, `IEM331`, `IEM332`, `IEM351`, `IEM352`, `IEM425`, …). El título de `IEA1102A` dice "Agosto 2015 – Abril 2021", pero el menú lo presenta como "desde mayo 2021". | Contenido inaccesible o mal rotulado. | Generar el árbol del menú a partir de los datos (cuadro + capítulo + título). |
| D12 | 🟡 | **95 variables repetidas** (mismo cuadro, grupo y rótulo) en `base_mensual`. | Filas "duplicadas" en la tabla; la selección en la colección se confunde. | Clave única por fila (código de variable). |
| D13 | 🟡 | **Faltan claves de fila estables** en todos los tipos: la identidad de una serie es "cuadro + sector + índice de fila". | Si cambia el orden de exportación, el carrito guardado apunta a otra fila. | Agregar un `id_serie` estable. |
| D14 | 🟡 | **Archivos sin uso y duplicados** (`entidades.json`, `notas.json`, `entidades_lista_repo.json`). | Confusión. | Eliminarlos del origen. |

## 4. Peso y forma de acceso

| Pantalla | Qué descarga hoy | Tamaño |
|---|---|---|
| Macro | anual + mensual + trimestral + notas (una vez) | ≈ 19 MB |
| Sistema, cuadro de balances SFN06 | `base_balances.json` completo | **66 MB** |
| Sistema, un cuadro EFI | 1 archivo de entidad (+ 1 de balances si es EFI06) | 3–12 MB |
| Análisis, una entidad | 1 reporte | 0,1–2,4 MB |
| Análisis, rankings y comparativo | **229 reportes** (una vez por sesión) | ≈ 296 MB |

**Recomendaciones de estructura**
1. **Formato largo o particionado**: un archivo por cuadro y sector (o una API `GET /cuadros/{id}?sector=&desde=&hasta=`) en vez de archivos monolíticos.
2. **Resumen de entidades precalculado**: un solo `resumen_entidades.json` con catálogo, atributos y las ~15 cuentas de rankings. Pasaría de 296 MB a menos de 1 MB.
3. **Diccionarios**: cuentas (CUC), unidades, cuadros (con capítulo y frecuencia) y sectores/segmentos.
4. **Contrato de exportación** para el script de R: tipos numéricos, `null` para lo faltante, sin columnas basura, sin fechas futuras sin marcar.
