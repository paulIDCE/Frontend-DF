# 07 · Integración del Excel HAF_CRDIAMIGO al proyecto AnalisisFinanciero

> Qué del libro `HAF_CRDIAMIGO_febrero_25.xlsm` (HAF mono-entidad de **COAC CREDIAMIGO LTDA.**, segmento 2,
> corte feb-2025) vale la pena traer al proyecto, y en qué situación está cada cosa respecto a lo que ya
> tenemos. Acompaña a 07a (UX), 07b (datos) y 07c (fortalezas/debilidades). Sigue el estilo de los
> documentos 04 y 05. Marcas: ✅ verificado · 📘 fórmula estándar por validar · ❓ desconocido.
>
> Conciliaciones hechas con datos reales de nuestros reportes (`public/data/reportes/…`) y backend en
> `http://localhost:5097/api`, corte **2026-07**, para **BP. PICHINCHA** y **COAC CREDIAMIGO** (la propia
> entidad del Excel).

## 1. Resumen ejecutivo

- El Excel es una **réplica fiel de los indicadores financieros de la SEPS** calculados desde el balance
  y el estado de resultados de una entidad. Su valor está en la **metodología**, no en los datos (que el
  proyecto ya tiene para 229 entidades y 10 sectores).
- **La mayoría de sus indicadores ya existen en el proyecto** como códigos del reporte (`IF012`, `IF006`,
  `SB018A`, `SBP002`, `Cart_Depo`, …) o como derivados del front (`DER_*`). Lo que el Excel aporta es el
  **desglose por cuenta y por segmento** y algunos indicadores que todavía no graficamos.
- El proyecto **ya es superior** en escala (multi-entidad, multi-corte, series largas) y en el **benchmark**:
  el Excel compara contra promedios de segmento **fijos de 2016**, mientras el proyecto tiene grupo par vivo
  (`grupoPar.ts`).
- Hay **un choque numérico real y sistemático**: el Excel **anualiza ROA/ROE/rendimientos con un factor
  manual `13/3`** (`DATOS!E22/E24`), lo que infla esos ratios **+8,3 %** frente a nuestra convención ×12/mes.
  Verificado con números (ver §6).
- Lo que **no podemos replicar hoy** es todo lo que necesita **cuentas a nivel de código SEPS** (patrimonio
  técnico, APR por ponderación, maduración por plazos, costos por subcuenta): nuestro reporte trae 776 filas
  de **agregados e indicadores ya calculados**, pero **ninguna cuenta a nivel de código** (`1425`, `210305`,
  `410105`…). Eso define la frontera entre B y C.
- Dependencias externas de la entidad (25/100 mayores depositantes) son dato que no tenemos y que habilita la
  cobertura de liquidez de grandes depositantes.

### Conteo por categoría

| Categoría | Cantidad |
|---|---:|
| **A 🟢** (ya lo tenemos, completo) | 13 |
| **A 🟡** (ya lo tenemos, parcial) | 4 |
| **B front** (cálculo extra en `derivados.ts`) | 2 |
| **B backend** | 0 |
| **C fuentes propias** (fase 3) | 5 |
| **C externas** (fase 6) | 1 |
| **D** (choca) | 1 (+1 matiz) |
| **⚪ No aplica** | 2 |

### Las 5 cosas que más valor aportan

1. **Patrimonio técnico + APR con ponderaciones** (`11.PAT.TECNICO`, `10.REQ APR`) — metodología SEPS completa de solvencia. **C** (necesita cuentas por código).
2. **Anualización correcta de ROA/ROE** — el Excel nos obliga a **decidir y documentar** nuestra convención (×12/mes); hoy hay +8,3 % de diferencia con su método. **D**.
3. **Suficiencia patrimonial y FK** — indicadores SEPS que aún no calculamos y que salen de cuentas que ya tenemos. **B front**.
4. **Maduración por plazos** de cartera, depósitos y obligaciones (los pasteles por bucket 1–30 / 31–90 días). **C** (sub-cuentas por plazo).
5. **Desglose de rendimiento y morosidad por los 10 segmentos** de cartera — presentación más rica que la nuestra. Total **A 🟡**, por segmento **C**.

## 2. Cuadro resumen

| # | Elemento del Excel | Dónde (Hoja!Celda) | Cat. | Estado | Dónde en el proyecto | Qué falta / qué choca | Fase 06 | Esf. | Valor |
|---|---|---|---|:--:|---|---|:--:|:--:|:--:|
| 1 | Morosidad total y por segmento | `12.3!F29…F135` | A | 🟢 | `IF012` (+`IF012_*`), `catalogoIndicadores.ts:36` | Total idéntico; el desglose fino por 10 segmentos es más detallado | — | S | ⭐⭐ |
| 2 | Liquidez (FD / depósitos corto plazo) | `12.10!F15` | A | 🟢 | `IF006`, `catalogoIndicadores.ts` | Coincide | — | S | ⭐⭐ |
| 3 | Calidad de activos | `12.2!E14…` | A | 🟢 | `SB018A`, `ac_prod_neto_acti`, `ac_prod_pco` | Coincide | — | S | ⭐ |
| 4 | Eficiencia microeconómica | `12.5!E8…E10` | A | 🟢 | `gast_oper_ac`, `gast_operacion`, `gasto_personal` | Coincide | — | S | ⭐⭐ |
| 5 | Eficiencia financiera (margen) | `12.8!E10` | A | 🟢 | `marg_int_ac` | Coincide | — | S | ⭐ |
| 6 | Vulnerabilidad del patrimonio | `12.11!F39` | A | 🟢 | `SBP002` | Coincide | — | S | ⭐⭐ |
| 7 | Análisis horizontal BG/ER | `1.BG A.HOR`, `2.ER A.HOR` | A | 🟢 | Revista: balance y PyG; `datos.ts` (variaciones) | Ya calculamos variación absoluta/relativa | — | S | ⭐ |
| 8 | Análisis vertical BG/ER | `3.BG A.VERT`, `4.ER A.VERT` | A | 🟢 | Revista: estructura | Coincide | — | S | ⭐ |
| 9 | Composición/variación de depósitos | `5.DEPOSITOS ` | A | 🟢 | Revista; `@21`,`@2101`,`@2103` | Coincide | — | S | ⭐ |
| 10 | Composición/variación oblig. financieras | `6.OBLIGACIONES FINANCIERAS` | A | 🟢 | Revista | Coincide | — | S | ⭐ |
| 11 | Cartera: variación/composición/evolución por segmento | `7.CARTERA` | A | 🟢 | Revista cartera; `IF011_*` | Coincide | — | S | ⭐⭐ |
| 12 | Tendencias activo/pasivo/patrimonio | `8.A.TEND` | A | 🟢 | Revista tendencias | Coincide y con series más largas | — | S | ⭐ |
| 13 | Promedio de segmento (benchmark) | `12.IND SEPS!D10…` | A | 🟢 | `grupoPar.ts`, rankings | **Somos mejores**: el Excel usa promedios fijos de 2016 | — | S | ⭐⭐ |
| 14 | Intermediación financiera | `12.7!F17` | A | 🟡 | `Cart_Depo` | Denominador: Excel usa `dep. vista + plazo`; nuestro `Cart_Depo` difiere (ver §6) | 4 | S | ⭐⭐ |
| 15 | Cobertura de provisiones por segmento | `12.4` | A | 🟡 | `SB033`,`SB034`,`DER_COB_VIS`,`DER_COB_EDU` | Tenemos algunos segmentos; faltan el resto | 1 | M | ⭐⭐ |
| 16 | Rendimiento de cartera (total) | `12.9!F189` | A | 🟡 | `SB036` (rend. cartera por vencer) | Total sí; **por segmento → C** | 4 | M | ⭐⭐ |
| 17 | Solvencia (ratio) | `11!E44` / `10!F44` | A | 🟡 | `SOLVENCIA` | Tenemos el ratio; **el desglose PT/APR → C** | 4 | S | ⭐⭐ |
| 18 | **ROA / ROE** | `12.6!F22`,`F48` | **D** | 🟡 | `IF002`, `IF004` | **Anualización ×13/3 vs ×12/mes → +8,3 %** | **4** | S | ⭐⭐⭐ |
| 19 | Suficiencia patrimonial | `12.1!F16` | **B front** | 🔴 | — (no existe) | Calculable: `(@3+(@5−@4))/IF010` | **1** | S | ⭐⭐ |
| 20 | FK (patrimonio+result−ing. extra)/activo | `12.11!F60` | **B front** | 🔴 | — | Calculable con `@3,@5,@4,@1`; "ing. extraordinarios" por precisar | **1** | M | ⭐ |
| 21 | Patrimonio técnico (por código + ponderación) | `11.PAT.TECNICO` | **C** | 🔴 | `SOLVENCIA` (solo ratio) | Falta **catálogo de cuentas por código SEPS** | **3** | L | ⭐⭐⭐ |
| 22 | APR por tramo de ponderación | `10.REQ APR` | **C** | 🔴 | — | Falta detalle de cuentas y sus ponderaciones | **3** | L | ⭐⭐ |
| 23 | Maduración por plazos (cartera/depósitos/oblig.) | `7.CARTERA!Q`, `6!Q`, `5!N` | **C** | 🔴 | — | Faltan sub-cuentas por banda de plazo (210305, …) | **3** | M | ⭐⭐ |
| 24 | Rendimiento/morosidad por los 10 segmentos (detalle fino) | `12.9`, `12.3` | **C** | 🔴 | parcial | Falta cartera por vencer e improductiva **por cuenta** | **3** | M | ⭐⭐ |
| 25 | Determinación de costos por subcuenta | `9.EST COSTOS` | **C** | 🔴 | — | Faltan subcuentas 410105/210105… | **3** | M | ⭐ |
| 26 | 25/100 mayores depositantes y su cobertura | `INF.ADICIONAL!C10`, `12.10!F42` | **C** | 🔴 | — | Dato que la entidad/SEPS no publica en el reporte | **6** | M | ⭐⭐ |
| 27 | Navegación VBA + userform + proceso mono-corte | `vbaProject.bin`, `INICIO_1.frm` | ⚪ | — | AppShell/rutas | UI propia de Excel; el proyecto ya tiene shell y navegación | — | — | — |
| 28 | Columnas "ajuste diciembre" rotas (`#REF!`) | `12.6!J33`, `12.9!F31` | ⚪ | — | — | Artefacto roto del libro; no se porta | — | — | — |

> Nota: 21 y 24 comparten causa raíz (falta de cuentas por código); se listan por separado porque habilitan
> entregables distintos (solvencia detallada vs. desglose por segmento).

## 3. A — Lo que ya tenemos

- **Indicadores SEPS (filas 1–6, 14–17 del cuadro).** El reporte por entidad ya trae estos códigos calculados
  (`IF012`, `IF006`, `SB018A`, `ac_prod_neto_acti`, `ac_prod_pco`, `gast_oper_ac`, `gast_operacion`,
  `gasto_personal`, `marg_int_ac`, `SBP002`, `Cart_Depo`, `SB036`, `SOLVENCIA`). Verificado: para CREDIAMIGO
  2026-07, `IF010/IF011 = 0,441/23,3713 = 1,887 %` coincide con `IF012 = 1,8869`. ✅
- **Análisis horizontal/vertical y composición/tendencias (filas 7–12).** Son exactamente las hojas de la
  revista (balance, estructura, PyG, cartera, tendencias). El Excel no aporta nada nuevo salvo presentación.
- **Dónde el Excel es mejor:** el **desglose por 10 segmentos de cartera** (morosidad, rendimiento, cobertura)
  es más fino que lo que hoy se grafica, y las **notas metodológicas por indicador** (concepto + fórmula en
  texto) son un buen modelo para `notas.ts`.
- **Dónde el proyecto es mejor:** el **benchmark**. El Excel compara contra promedios de segmento **fijos de
  julio de 2016** (`12.IND SEPS!B7`, `D10=1,3955`…); el proyecto tiene grupo par y rankings vivos. No portar
  los promedios del Excel.

## 4. B — Cálculos extra (los datos ya existen)

Ambos van en el **front (`src/modulos/Analisis/derivados.ts`)**, como los `DER_*` actuales.

1. **Suficiencia patrimonial** (fila 19) — 📘 por validar con negocio.
   - Excel: `(Patrimonio + (Ingresos − Gastos)) / Activos inmovilizados` (`12.1!F13=+G22+G24-G23`, `F14=cartera improductiva`).
   - Propuesta: `DER_SUF_PATR = (@3 + (@5 − @4)) / IF010 × 100`. Todos los CUC existen (verificado: `@3`, `@5`,
     `@4`, `IF010` presentes en el reporte). ✅
   - ⚠️ Confirmar con negocio que "activos inmovilizados" = cartera improductiva (`IF010`) y no otra base.

2. **FK (Factor K / vulnerabilidad extendida)** (fila 20) — 📘.
   - Excel: `(Patrimonio + Resultados − Ingresos extraordinarios) / Activo total` (`12.11!F57/F58`).
   - Propuesta: `DER_FK = (@3 + (@5 − @4) − <ingresos extraordinarios>) / @1 × 100`.
   - ❓ Falta precisar qué cuenta son los "ingresos extraordinarios" (¿`@56`?). Hasta confirmarlo, calcularlo
     sin ese término o dejarlo pendiente.

## 5. C — Requiere información extra

Causa raíz común: **el reporte por entidad trae agregados e indicadores ya calculados, no cuentas a nivel de
código SEPS**. Todo lo que el Excel arma con `VLOOKUP(cuenta, B.G!…)` necesita ese detalle.

| Dato necesario | Fuente probable | Frecuencia | Qué habilita | Fase |
|---|---|---|---|---|
| **Catálogo de cuentas por código SEPS** (balance y PyG a nivel `1425`, `1499`, `210305`, `410105`…) por entidad y corte | Pipeline en R / SB / SEPS (ya alimenta los agregados) | mensual | Patrimonio técnico, APR, maduración por plazos, costos por subcuenta, morosidad/rendimiento por los 10 segmentos | **3** |
| **Ponderaciones de riesgo por cuenta** (0 / 0,2 / 0,5 / 1) | Normativa SEPS (tabla fija) | estable | APR y solvencia detallada | **3** |
| **25 y 100 mayores depositantes** (saldo) por entidad y corte | La propia entidad / SEPS | mensual/trimestral | Cobertura de liquidez de grandes depositantes (`12.10` parte 2) | **6** |

### Información a pedir (lista lista para enviar al responsable de datos)

1. ¿El pipeline en R puede exponer el **balance y el estado de resultados a nivel de código de cuenta SEPS**
   (no solo los agregados `@…`) por entidad y corte? Es el insumo que desbloquea patrimonio técnico, APR,
   maduración por plazos y el desglose por segmento.
2. ¿Existe la **tabla oficial de ponderaciones de riesgo por cuenta** (APR) que usa la SEPS para el segmento 2?
   ¿Se versiona cuando cambia la normativa?
3. ¿Disponemos (o podemos pedir a la entidad / SEPS) del **saldo de los 25 y 100 mayores depositantes** por
   corte? Hoy el Excel lo tiene pegado a mano (`INF.ADICIONAL`).
4. Confirmar la definición de "**activos inmovilizados**" (denominador de suficiencia patrimonial) y de
   "**ingresos extraordinarios**" (término de FK) para fijar los derivados `DER_SUF_PATR` y `DER_FK`.

## 6. D — Choques

Conciliado sobre **nuestros datos**, corte **2026-07**. "Valor Excel" = indicador recalculado con la fórmula
del Excel sobre nuestros datos; "Valor nuestro" = nuestra convención (×12/mes), con el dato almacenado como
referencia.

| Indicador | Fórmula Excel | Fórmula nuestra | Valor Excel | Valor nuestro | Diferencia | Causa probable | Decisión requerida |
|---|---|---|---|---|---|---|---|
| **ROA — BP. PICHINCHA** | `(Resultado/Activo) × 13/3` (anualiz. 13 meses) | `(Resultado/Activo) × 12/mes` | **1,1915 %** | 1,0999 % (almacenado `IF002`=1,1255) | **+8,3 %** | Excel usa 13 meses de ejercicio (`DATOS!E22=13`) en lugar de 12 | ¿Nuestra anualización oficial es ×12/mes transcurridos? |
| **ROE — BP. PICHINCHA** | ídem sobre patrimonio | ídem | **12,7318 %** | 11,7524 % (almacenado `IF004`=11,6374) | **+8,3 %** | ídem | ídem |
| **ROA — COAC CREDIAMIGO** | `× 13/3` | `× 12/mes` | **0,0116 %** | 0,0107 % (almacenado `IF002`=0,0107) | **+8,3 %** | ídem | ídem |
| **ROE — COAC CREDIAMIGO** | `× 13/3` | `× 12/mes` | **0,1412 %** | 0,1303 % (almacenado `IF004`=0,1389) | **+8,3 %** | ídem | ídem |
| **Intermediación — matiz** | `Cartera bruta / (Dep. vista + Dep. plazo)` = `IF011/(@2101+@2103)` | `Cart_Depo` (almacenado) | 78,06 % (PICHINCHA) · 81,26 % (CREDIAMIGO) | 80,42 % · 82,05 % | ~−2,4 pp · −0,8 pp | Denominador: solo vista+plazo vs. base más amplia | Fijar el denominador oficial de intermediación |

- **Validación cruzada:** nuestro recálculo de ROA ×12/mes para CREDIAMIGO (0,0107 %) **coincide exacto** con
  el `IF002` almacenado (0,0107), lo que confirma que **nuestro dato ya viene anualizado ×12/mes** y que la
  diferencia con el Excel es **solo** el uso de 13 meses (13/12 = +8,33 %). ✅ (Las pequeñas diferencias en
  PICHINCHA vienen de que `IF002/IF004` usan activo/patrimonio **promedio**, no el saldo puntual `@1`/`@3`.)

### Puntos a validar con negocio

1. **Convención de anualización oficial**: ×12/meses transcurridos (nuestra) vs. ×(meses del ejercicio/mes de
   análisis) del Excel. El `13` del Excel parece un parámetro mal cargado; confirmarlo. **Decisión que manda.**
2. **Base de ROA/ROE**: ¿saldo puntual o promedio 12 meses en el denominador? (nuestro `IF002/IF004` usa promedio).
3. **Denominador de intermediación financiera** (`Cart_Depo`): depósitos vista+plazo vs. base actual.
4. Si se adopta nuestra convención, **documentarla en `notas.ts`** para que la revista lo explique al usuario.

## 7. ⚪ No aplica

- **Navegación VBA, userform `INICIO_1` y el proceso mono-corte manual** (fila 27): son la interfaz propia de
  Excel. El proyecto ya tiene shell, rutas y selección de entidad/corte; portar las macros no aporta.
- **Columnas "ajuste diciembre" y celdas `#REF!`** (fila 28): artefactos rotos del libro (referencias a un
  rango inexistente). No se portan; si acaso, sirven de recordatorio de recomputar esos ajustes correctamente.

## 8. Propuesta para el plan y los issues (no aplicada)

> Solo propuesta. El equipo decide y, si procede, ejecuta la skill `actualizar-issues`.

### Ítems nuevos sugeridos

| # sugerido | Fase | Título | Criterio de aceptación | Amplía issue |
|---|:--:|---|---|---|
| 1.18 | 1 | `DER_SUF_PATR` y `DER_FK` en `derivados.ts` | Ambos derivados calculan para CREDIAMIGO y PICHINCHA 2026-07 con los CUC `@3/@5/@4/@1/IF010`; aparecen en la revista con nota metodológica; marcados 📘 hasta validación de negocio | épica fase 1 (#35) |
| 1.19 | 1 | Completar cobertura de provisiones por segmento | Los 10 segmentos de `12.4` tienen cobertura calculada (reutilizando `SB033/SB034` y añadiendo los `DER_COB_*` faltantes) | ítem de cobertura existente |
| 4.7 | 4 | Fijar y documentar la **anualización** de ROA/ROE y el denominador de intermediación | Decisión de negocio registrada (×12/mes vs ×13/mes; saldo vs promedio); `notas.ts` lo explica; test que compara con el corte 2026-07 | #4.6 (umbrales) / épica fase 4 |
| 3.N | 3 | Exponer **balance y PyG a nivel de código de cuenta SEPS** en la API | `GET /entidades/{id}/reporte` (o endpoint nuevo) devuelve cuentas por código; habilita PT, APR, maduración y desglose por segmento | épica fase 3 |
| 3.N+1 | 3 | **Patrimonio técnico + APR** con ponderaciones | Reproduce `11.PAT.TECNICO`/`10.REQ APR` para una entidad; el ratio cuadra con `SOLVENCIA` ±tolerancia | depende de 3.N |
| 3.N+2 | 3 | **Maduración por bandas de plazo** (cartera, depósitos, obligaciones) | Gráficos de bucket 1–30 / 31–90 / … con las sub-cuentas por plazo | depende de 3.N |
| 6.N | 6 | **25/100 mayores depositantes** y cobertura de liquidez | Dato incorporado por corte; indicador de cobertura calculado | épica fase 6 |

### Cambios a ítems existentes

- **Benchmark de segmento (rankings/grupo par):** dejar constancia de que el promedio fijo de 2016 del Excel
  **no se adopta**; el grupo par vivo del proyecto lo reemplaza. Reafirma el enfoque de la fase 2/4.
- **Catálogo de indicadores (ítem 3.1):** al definir nombre/unidad/fórmula/sentido, incluir suficiencia
  patrimonial, FK y rendimiento de cartera por vencer, con la convención de anualización ya decidida (ítem 4.7).

## Anexo · Reproducibilidad

- Extracción (solo lectura) sobre copia descifrada: `openpyxl`/XML para fórmulas y valores, `olevba` para VBA,
  parseo de `xl/charts/chart*.xml` para gráficos. Conteos: 28 hojas, 2.756 fórmulas, 331 `#REF!`, 29 gráficos.
- Conciliación: `@5,@4,@1,@3,IF002,IF004,IF010,IF011,IF012,@21,@2101,@2103` leídos de
  `public/data/reportes/{COAC___CREDIAMIGO_LTDA,BP__PICHINCHA}.json`, corte 2026-07.
