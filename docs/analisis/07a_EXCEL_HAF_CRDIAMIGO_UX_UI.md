# 07a · Excel HAF_CRDIAMIGO — UX / UI

> Revisión de usabilidad del libro `HAF_CRDIAMIGO_febrero_25.xlsm` como herramienta de análisis.
> Severidad: 🔴 alta (confunde o entrega un número erróneo) · 🟠 media · 🟡 baja.

## Navegación y estructura

| # | Sev. | Problema | Evidencia (Hoja!Celda) | Recomendación |
|---|---|---|---|---|
| 1 | 🟠 | La navegación depende de **botones VBA** (`CommandButton1_Click` en las 28 hojas + userform `INICIO_1`). Sin macros habilitadas no hay forma cómoda de moverse | `vbaProject.bin`; `Hoja1…Hoja28.cls` | Añadir un índice con hipervínculos nativos como respaldo al VBA |
| 2 | 🟠 | **4 hojas de cálculo ocultas** (`12.5.E.MICRO`, `12.6.RENTAB`, `12.8.E.FINAN`, `12.9.RENDIMIENTO CARTERA`) contienen lógica clave (ROA/ROE, márgenes) | `workbook.xml` `state="hidden"` | Si la metodología es válida, mostrarla; si es borrador, señalarlo |
| 3 | 🟡 | Nombres de hoja con numeración mixta (`1…8`, luego `12.x`, luego `9`, `10`, `11`) rompen el orden lógico | pestañas | Renumerar o agrupar por bloque |

## Entradas frente a salidas

| # | Sev. | Problema | Evidencia | Recomendación |
|---|---|---|---|---|
| 4 | 🔴 | No se distingue visualmente la **única hoja de entrada** (`DATOS`, desprotegida) de las de salida (protegidas). El usuario podría escribir en `B.G`/`E.R`, también desprotegidas | `DATOS` prot=No; `B.G`/`E.R` prot=No; resto prot=Sí | Marcar celdas de entrada con color y proteger el resto de forma consistente |
| 5 | 🟠 | El **corte se cambia con un selector numérico oculto** (`CHOOSE($J$7,…)`), sin rótulo visible de qué período está activo | `B.G!$J$7`, `$M$7` | Mostrar el período activo en un encabezado grande y con lista desplegable rotulada |

## Rótulos, unidades y números

| # | Sev. | Problema | Evidencia | Recomendación |
|---|---|---|---|---|
| 6 | 🔴 | **Benchmark obsoleto y fijo:** `12.IND SEPS` rotula "CORTE A 31 DE JULIO DE **2016**" y trae los promedios de segmento como valores pegados | `12.IND SEPS!B7`, `D10=1.3955`, `D13=0.1345` | Reemplazar por el promedio de segmento vigente (dato del sistema) |
| 7 | 🔴 | **Ratios mostrados sin anualizar de forma transparente:** ROA/ROE se multiplican por `DATOS!E22/E24` (= 13/3) sin explicar el factor al lector | `12.6!F22`, `F48`; `DATOS!E22=13`, `E24=3` | Mostrar el factor y la base; ver choque numérico en 07 §6 |
| 8 | 🟠 | Unidades inconsistentes: unas hojas en USD, `10.REQ APR` en "MILES DÓLARES", ratios a veces como fracción (0,138) y a veces como % | `10.REQ APR!B7`; `12.6` resultados | Unificar a una convención y rotular la unidad en cada tabla |
| 9 | 🟡 | Descripciones metodológicas con erratas ("Lo ganancia", "Super­ávit") | `12.6!D7`, `11!C24` | Corregir textos |

## Gráficos

| # | Sev. | Problema | Evidencia | Recomendación |
|---|---|---|---|---|
| 10 | 🔴 | **2 gráficos con series rotas** apuntando a un libro externo inexistente | `chart18`,`chart19` → `[1]Cartera!#REF!`, `[1]Bal Hor!#REF!` | Reapuntar a rangos locales de `7.CARTERA` o eliminarlos |
| 11 | 🟠 | **11 de 29 gráficos son pastel 3D**, que distorsiona la lectura de proporciones | `chart7,8,10,12,13,15,17,20…` `pie3DChart` | Cambiar a barras o pastel 2D |
| 12 | 🟡 | 3 gráficos comparten el mismo título genérico "ANÁLISIS DE TENDENCIAS" | `chart27,28,29` | Títulos específicos (activo / pasivo / patrimonio) |

## Robustez y presentación

| # | Sev. | Problema | Evidencia | Recomendación |
|---|---|---|---|---|
| 13 | 🔴 | Celdas de error visibles para el usuario: **5.001 errores en `B.G`** (muchos `#DIV/0!` en análisis vertical) y `#REF!` en "ajuste diciembre"/rendimientos | `B.G!P14:P…` `#DIV/0!`; `12.6!J33`, `12.9!F31` `#REF!` | Guardas `IF(den=0,…)` y limpiar las referencias rotas |
| 14 | 🟡 | Hoja `B.G` con **28.648 celdas** y matriz de 12+ períodos: abrir/recalcular es lento | `B.G` | El cálculo por corte en backend elimina el problema |

## Prioridad sugerida (3–5 puntos)

1. **Arreglar los `#REF!`** del selector `CHOOSE` y de los "ajustes diciembre"/rendimientos (#1, #13): hoy devuelven números erróneos o error.
2. **Actualizar el benchmark de segmento** (#6): comparar contra promedios de 2016 invalida la lectura.
3. **Transparentar y corregir la anualización** ROA/ROE (#7): es la diferencia que más afecta cifras (ver 07 §6).
4. **Separar entrada de salida** y proteger de forma consistente (#4, #5).
5. **Depurar gráficos**: eliminar los 2 rotos y sustituir pasteles 3D (#10, #11).
