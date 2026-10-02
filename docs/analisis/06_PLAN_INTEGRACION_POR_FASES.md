# Plan de integración por fases — Managerial Analyzer (04) y RADAR (05)

Unifica en **una sola hoja de ruta** las funcionalidades propuestas en
[04_INTEGRACION_MANAGERIAL_ANALYZER.md](04_INTEGRACION_MANAGERIAL_ANALYZER.md) (MA) y
[05_COMPARATIVA_RADAR_RFD.md](05_COMPARATIVA_RADAR_RFD.md) (RADAR). Fecha: 01/10/2026.

Contrato de datos de referencia: [../backend/CONTRATO_API.md](../backend/CONTRATO_API.md).

- **Por qué un plan nuevo:** 04 y 05 traen cada uno su prioridad (A–D), con criterios distintos. Aquí las fases se ordenan por **complejidad de datos y de cálculo**, de menor a mayor.
- **Cómo se ejecuta:** cada fase se trabaja en **su propia rama** (`feature/fase-N-…`), con un commit por funcionalidad para poder revertir y hacer regresión. Al cerrar una fase se para y se revisa antes de abrir la siguiente.

**Leyenda**

| Marca | Significado |
|---|---|
| 🟢 | Ya lo tenemos |
| 🟡 | Parcial |
| 🔴 | No lo tenemos |
| ⚪ | No aplica |
| ✅ | El sistema externo (MA o RADAR) lo tiene |
| — | El sistema externo no lo tiene |
| 📘 | Fórmula estándar de la literatura: hay que validarla con negocio |

---

## 1. Fases

| Fase | Criterio de entrada | Ítems | Depende de | Criterio de salida |
|---|---|---|---|---|
| **1** | Solo front, con datos y endpoints que **ya existen** | 20 | Nada | Pantallas funcionando contra BackendDF actual; `typecheck` y `lint` limpios |
| **2** | El backend hace un **cálculo o una segmentación nueva** sobre datos que ya tiene | 8 | Fase 1 (mismas pantallas, ahora con datos del grupo par) | Endpoints nuevos en el contrato, con criterios de aceptación |
| **3** | **Información nueva** que se consume directamente: catálogos y fuentes nuevas | 8 | Exportación del proceso en R, fuentes SB/SEPS | Catálogo de indicadores servido; fuentes nuevas cargadas en el pipeline |
| **4** | **Metodología o cálculos** que hay que definir y validar con negocio | 9 | Fases 2 y 3 (grupo par, catálogo, límites) | Fórmulas firmadas por negocio; conciliación contra `IF002` / `IF004` |
| **5** | Funcionalidades **compuestas** que dependen de las anteriores | 5 | Fases 1 a 4 | Informe a medida, resumen ejecutivo completo |
| **6** | Datos **fuera de nuestras fuentes**: decisión de producto o convenio | 3 | Decisión de negocio | Decisión tomada (sí / no) y fuente identificada |

### 1.1 Hechos verificados que suben ítems a la Fase 1

Se verificaron sobre `public/data/reportes/BP__PICHINCHA.json` (776 CUC), `public/data/base_estru_sistema.json` y `src/services/apiDatos.ts`:

| Hecho | Consecuencia |
|---|---|
| El reporte ya trae `@1`, `@2`, `@3`, `SB007` (pasivos con costo), `IF011` (cartera bruta), `@41A`, `@44A`, `@45A`, `@5A`, `@52A`, `@54A` | Los "indicadores que faltan" de 05 §4.3 (P/A, apalancamiento, gastos op./cartera, costo de fondeo, sostenibilidad) se calculan en el front |
| Existen los saldos de refinanciada y reestructurada (`@190215`, `@190220`, `@14xx` por segmento) y `P4_Castigados` | La fila 7 de 05 y parte de la 34 pasan a la Fase 1 |
| Existen `IF012_5`, `IF012_6`, `SB033`, `SB034` (vivienda de interés social y educativo) | Las filas 9 y 10 de 05 pasan a la Fase 1 |
| `base_estru_sistema` tiene **495 códigos** para los 10 sectores, con `IF012*`, `IF004`, `IF006`, `SOLVENCIA`, `SB0xx`; `GET /sistema/series` acepta cualquier código | La vista **por sector** del Monitor del Sistema es Fase 1 |
| `GET /rankings` acepta cualquier CUC del reporte (contrato §8). Con `agrupacion=todas` devuelve el valor de las 229 entidades en un corte | El indicador × todas las entidades **en un corte**, el ranking por indicador y el percentil puntual del grupo par son Fase 1 (el front reordena por `actual`) |
| `GET /entidades/series` acepta hasta 4 entidades | N entidades en la evolución es Fase 2 |
| El PDF ya existe con `window.print` (`src/shared/analitica/impresion.ts`) | El PDF no es tarea; el constructor de informes sí (Fase 5) |
| El TAM se calcula con la estructura de acumulados verificada (04 §2.1 ✅) | El TAM es Fase 1; **reemplazar** los `@xA` por el TAM es una decisión metodológica (Fase 4) |

### 1.2 Equivalencia con las prioridades de 04 y 05

| Prioridad original | Va a la fase |
|---|---|
| 04 A (diagnóstico, base 100, cascada PyG, resumen sin grupo par, navegación) | 1 |
| 04 B (diccionario, percentiles, auditoría, DuPont, fuentes y usos) | Auditoría y fuentes y usos → 1 · percentiles → 1 (puntual) y 2 (series) · diccionario → 3 · DuPont → 4 |
| 04 C (TAM, Z-score, simuladores) | TAM → 1 · Z-score y simuladores → 4 |
| 04 D (informes, desplegable a cuentas, proyecciones) | Desplegable → 3 · informes y proyecciones → 5 |
| 05 A (indicadores faltantes, notas, ranking por indicador, Monitor) | 1 (Monitor completo con evolución por entidad → 2) |
| 05 B (glosario, N entidades, depósitos y micro, capitalización, sostenibilidad) | Ranking de depósitos y micro → 1 · N entidades → 2 · glosario → 3 · capitalización → 4 |
| 05 C/D (castigos, liquidez 1–90 días, depositantes, geografía, alcance social) | 1 / 3 / 6 según la fuente |

---

## 2. Fase 1 — Front con datos existentes

**Rama:** `feature/fase-1-front-datos-existentes`. No se toca el backend.

| # | Funcionalidad | Estado actual | Sistema 04 (MA) | Sistema 05 (RADAR) | Observación | Recomendación de implementación |
|---|---|---|---|---|---|---|
| 1.1 | Patrimonio / Activos y apalancamiento (Pasivo / Patrimonio) | 🔴 Los datos están (`@1`, `@2`, `@3`), el ratio no se muestra | 🟡 Masas patrimoniales y endeudamiento con rango óptimo | ✅ Suficiencia patrimonial II (gráfico + KPI) | Ratios de cálculo directo; RADAR los usa como KPI principal de solvencia | Indicadores derivados en `crearCtx` (`src/modulos/Analisis/datos.ts`) y entradas en `paginas/indicadoresConfig.ts`, bloque de solvencia |
| 1.2 | Gastos operativos / cartera bruta | 🔴 Solo tenemos gastos op. / activo y gastos op. / margen | — | ✅ Eficiencia | Denominador típico de microfinanzas | `@45A / promedio 12m (IF011)` como indicador derivado |
| 1.3 | Costo de fondeo global | 🟡 Solo por fuente (PERLAS R5, R6) y tasas pasivas | — | ✅ Costo de fondeo | Falta el costo global | `@41A / promedio 12m (SB007)`; conciliar contra R5 y R6 |
| 1.4 | Sostenibilidad operacional | 🔴 | — | ✅ ROE y sostenibilidad (KPI) | Fórmula 📘 | `@5A / (@41A + @44A + @45A)` con la marca 📘; la validación es la 4.8 |
| 1.5 | Saldo de cartera refinanciada y reestructurada | 🟡 Tenemos rendimiento y cobertura, no el saldo | — | ✅ Cartera total (evolución) | Los saldos están en el reporte por segmento | Serie de saldos (`@190215`, `@190220`, `@14xx`) en Cartera |
| 1.6 | Castigos | 🔴 | — | ✅ Tasa de cartera castigada | `P4_Castigados` (PERLAS) ya está; el saldo castigado hay que buscarlo en las cuentas de orden de `EFI06` | Mostrar `P4_Castigados`; si el saldo existe en `EFI06`, agregarlo |
| 1.7 | Morosidad y cobertura de educativo y vivienda de interés social; alternar saldo / índice | 🟡 4 segmentos | — | ✅ 11 líneas, en saldo | Los códigos de los 2 segmentos que faltan están en el reporte | Agregar `IF012_5`, `IF012_6`, `SB033`, `SB034`; conmutador saldo / índice |
| 1.8 | Notas metodológicas ⓘ por gráfico | 🔴 | — | ✅ Nota del cambio normativo de 2021 | Sin la nota, el corte de 2021 parece un error | Prop `nota` en `TarjetaGrafica`; primera nota: reclasificación de carteras de mayo 2021 |
| 1.9 | Base 100 y ratios de evolución | 🔴 | ✅ Analítica (índices, ratios de evolución) | — | Comparar series de distinta escala | Conmutador en `TarjetaGrafica` (Saldo / Base 100 / % vertical) sobre `ctx.serie()` |
| 1.10 | Cascada de PyG | 🟡 Tabla en hojas 10 y 11 | ✅ Cuadro analítico de PyG | 🟡 Ingresos / gastos por rubro | Los márgenes ya vienen precalculados | Gráfico de cascada `Mar_Br_Fi` → `Marg_Ne` → `Mar_Ne_Fina` → `Mar_Oper` → `Gan_Pe_Imp` → `Gan_Eje` |
| 1.11 | TAM + Gráfico Z | 🔴 Solo anualización simple (`@xA`) | ✅ TAM + Gráfico Z | — | Fórmula verificada (04 §2.1) | Utilidades `desacumular` y `tam` en `datos.ts`; hoja "Tendencias" con 3 curvas y selector de partida |
| 1.12 | Motor de diagnóstico v1 | 🟡 Texto con reglas fijas en 4 hojas | ✅ Diagnóstico automático | — | Los umbrales actuales no tienen fuente (se calibran en la 4.6) | Catálogo de reglas declarativo en JSON (04 §5.1); migrar `analisisTexto.tsx` sin cambiar los umbrales |
| 1.13 | Auditoría de desviaciones ALTA / MEDIA / BAJA | 🔴 | ✅ 12 auditorías | — | Se puede calcular con `EFI06` horizontal y vertical | Matriz partidas × periodos con `opcionesMatrizCalor`; umbrales por defecto = percentiles históricos de la entidad, editables |
| 1.14 | Fuentes y usos (`EFI04`) en la revista | 🟡 Solo en el explorador | ✅ EOAF | — | | Reutilizar la tabla del explorador en "Estados financieros" |
| 1.15 | Ranking por indicador + depósitos y microcrédito | 🟡 Rankings solo de 5 cuentas | 🟡 Comparativa sectorial | ✅ 5 rankings por indicador | `/rankings` acepta cualquier CUC; para los ratios la participación no tiene sentido | Selector de indicador en `paginas/rankings.tsx`; para los ratios, orden por valor según el sentido favorable (mapa **provisional** en el front) y sin columna de participación |
| 1.16 | Posición en el grupo par en el corte ("P68 del grupo") | 🔴 | 🟡 Ratios sectoriales del Banco de España | 🟡 Barra de todas las entidades | Se calcula en el corte actual con los valores que ya devuelve `/rankings` | Percentil en el front a partir de `apiRanking` con `agrupacion=sector`; distintivo en los KPI |
| 1.17 | Monitor del Sistema v1 | 🔴 | — | ✅ Patrón central (por tipo, por organización, evolución) | Por sector: `/sistema/series` con 495 códigos. Por entidad: un corte con `/rankings` y `agrupacion=todas` | Pantalla en `/sistema` con pestañas Solvencia, Calidad de cartera, Eficiencia, Rentabilidad, Liquidez; barra de 229 entidades con buscador y salto a la revista |
| 1.18 | Monto colocado acumulado | 🟡 MOA por mes | — | ✅ Monto colocado acumulado | | Acumulado anual desde `monto_total` en Operaciones |
| 1.19 | Resumen ejecutivo v1 (sin grupo par) | 🔴 KPIs sueltos en el hub | ✅ Cuadro de mando | 🟡 KPI por tablero | Versión completa en la 5.1 | Hoja de entrada con `FilaKpis`, `MiniGrafica`, CAMELS/PERLAS y los hallazgos del motor v1 |
| 1.20 | Navegación por secciones + estado en la URL; hojas por segmento unificadas | 🟡 31 hojas en lista | ✅ Navegación por tarea | ✅ Tableros por tema | Estructura de 04 §7 | Reagrupar en `Revista.tsx` y `paginas/index.tsx`; hojas 13–16 y 19–22 con selector de segmento |

---

## 3. Fase 2 — Cálculo o segmentación en el backend

**Rama:** `feature/fase-2-backend-calculos`. Hay que agregar una adenda al contrato (§8 y §9).

| # | Funcionalidad | Estado actual | Sistema 04 (MA) | Sistema 05 (RADAR) | Observación | Recomendación de implementación |
|---|---|---|---|---|---|---|
| 2.1 | Benchmarks por percentiles en el tiempo | 🟡 Percentil puntual (1.16) | 🟡 Ratios sectoriales externos | — | En el front costaría bajar 296 MB de reportes | `GET /api/benchmarks?codigos=&desde=&hasta=&agrupacion=&entidad=` → P10–P90 y n por periodo. Banda P25–P75 en las gráficas y gráfico de caja |
| 2.2 | Indicador × entidades × periodo | 🟡 Un corte (1.17) | — | ✅ Evolución por organización | Hace falta para la evolución de N entidades y el mapa de calor | `GET /api/sistema/indicador?codigo=&desde=&hasta=&agrupacion=sector\|entidad` |
| 2.3 | Ranking en modo indicador en el backend | 🟡 El front reordena (1.15) | — | ✅ | Los derivados de 1.1–1.4 no se pueden rankear si no están en el índice | `/rankings?modo=indicador` ordena por valor y sentido; materializar los derivados en el índice compacto |
| 2.4 | N entidades en el comparativo | 🟡 Máximo 4 | ✅ Multiempresa | ✅ Leyenda seleccionable | | Subir el tope de `/entidades/series` a 10 |
| 2.5 | Agrupaciones de grupo par normalizadas | 🟡 `Tamaño`, `Rango_Activos`, `DPA_PR` | — | ✅ Tipo y subtipo | Segmentos 4/5 y "Sin segmento" (02 §3, D8) | Agrupación por tipo y segmento SEPS en `/catalogos` y en todos los endpoints de grupo par |
| 2.6 | Auditoría del grupo par | 🟡 Por entidad (1.13) | ✅ | — | Umbrales por segmento a partir de los percentiles del sistema | `GET /api/entidades/{id}/auditoria` |
| 2.7 | Series mensuales y TAM en el backend | 🟡 En el front (1.11) | ✅ | — | Los rankings y los benchmarks deben usar la misma serie | `GET /entidades/{id}/reporte?serie=mensual\|tam` |
| 2.8 | Migrar el percentil puntual a `/benchmarks` | 🟡 (1.16) | — | — | Una sola fuente para el grupo par | Reemplazar el cálculo del front |

---

## 4. Fase 3 — Información nueva consumida directamente

**Rama:** `feature/fase-3-informacion-nueva`.

| # | Funcionalidad | Estado actual | Sistema 04 (MA) | Sistema 05 (RADAR) | Observación | Recomendación de implementación |
|---|---|---|---|---|---|---|
| 3.1 | Catálogo de indicadores | 🔴 Previsto en el contrato §14 | ✅ Fórmulas en la ayuda | ✅ Manual de indicadores | Base de los semáforos, del glosario y del desplegable | `GET /api/catalogos/indicadores`: código, nombre, unidad, formato, sentido favorable, fórmula CUC. Lo exporta el proceso en R. Reemplaza el mapa provisional de 1.15 |
| 3.2 | Límites normativos SEPS / SB | 🔴 | 🟡 Rangos óptimos de empresa | — | Por tipo de entidad y segmento | Tabla de configuración servida por la API; habilita el semáforo normativo (4.7) |
| 3.3 | Glosario de indicadores | 🔴 | ✅ | ✅ Menú *Manuales* | | Panel global en el `AppShell` desde 3.1 |
| 3.4 | Desplegable ratio → cuentas | 🔴 | ✅ Desplegable a cuentas | — | Requiere la fórmula CUC | Desde cualquier KPI: fórmula y cuentas con sus valores (`ctx.dato()`) |
| 3.5 | Banca pública, ONG y COAC de 2.º piso | 🔴 | — | ✅ Tipos de entidad | Verificar si están en la fuente SB/SEPS | Nuevos sectores en `SECTORES` (`src/modulos/Sistema/cargarCuadro.ts`) |
| 3.6 | Concentración de los 25 y 100 mayores depositantes | 🔴 | — | ✅ | Riesgo de liquidez; la SB/SEPS lo publican en la liquidez estructural | Cargar la fuente; indicador en Liquidez y solvencia |
| 3.7 | Cobertura geográfica (provincia y cantón) | 🔴 Solo la provincia de la matriz | — | ✅ Con mapa | La más factible de 05 §4.5: la SB/SEPS publican volumen de crédito y captaciones por cantón | Fuente nueva + pantalla con mapa en Sistema Financiero |
| 3.8 | Liquidez de 1 a 90 días / obligaciones | 🟡 Índices de liquidez de la hoja 28 | — | ✅ KPI | Numerador y denominador por verificar | Buscar el detalle de inversiones por plazo en `EFI06`; si no está, es fuente nueva |

---

## 5. Fase 4 — Metodología y cálculos a validar

**Rama:** `feature/fase-4-metodologia`. Cada ítem necesita la firma de negocio antes de publicarse.

| # | Funcionalidad | Estado actual | Sistema 04 (MA) | Sistema 05 (RADAR) | Observación | Recomendación de implementación |
|---|---|---|---|---|---|---|
| 4.1 | DuPont bancario + cascada del ROE | 🟡 `IF002` e `IF004` sueltos | ✅ Pirámide de ratios | — | Fórmula 📘 (04 §5.4); debe cuadrar con `IF002` / `IF004` | Árbol ECharts con nodo, variación y percentil; cascada año contra año |
| 4.2 | Z-score bancario | 🔴 | 🟡 Índice Z (Altman, no aplica) | — | Se lee relativo al grupo par (2.1) | `Z = (ROA + P/A) / σ(ROA)`, ventana de 12 a 36 meses |
| 4.3 | Simulador de tasa de equilibrio | 🟡 Componentes en la hoja 30 | ✅ Umbral de rentabilidad | — | El más simple: `CF_*`, `GO_*`, `RC_*`, `CK_*` ya existen | Primer simulador de la fase |
| 4.4 | Simuladores de crecimiento con patrimonio técnico, sensibilidad a la morosidad, apalancamiento financiero y autofinanciación | 🔴 | ✅ | — | Hay que validar la ponderación por riesgo y las definiciones de BAI y BAII | Controles deslizantes, real vs. simulado (04 §5.6) |
| 4.5 | Reemplazar `@xA` por el TAM | 🔴 | ✅ | — | Cambia cifras que ya ve el usuario | Decisión de negocio; si se aprueba, conmutador global |
| 4.6 | Umbrales del diagnóstico y de la auditoría por segmento | 🟡 Umbrales sin fuente | ❓ MA no los expone | — | | Calibrarlos con la distribución del sistema (2.1) y validarlos con negocio |
| 4.7 | Semáforo combinado (percentil + norma) | 🔴 | 🟡 | — | Depende de 2.1 y 3.2 | Verde, ámbar y rojo según 04 §5.3 |
| 4.8 | Sostenibilidad financiera (con ajustes) | 🔴 | — | ✅ | La operacional ya está en 1.4 | Validar los ajustes con negocio |
| 4.9 | Índice de capitalización | 🟡 PERLAS E9 | — | ✅ | Las definiciones no coinciden 1 a 1 | Unificar la definición en el catálogo (3.1) |

---

## 6. Fase 5 — Funcionalidades compuestas

**Rama:** `feature/fase-5-compuestas`.

| # | Funcionalidad | Estado actual | Sistema 04 (MA) | Sistema 05 (RADAR) | Observación | Recomendación de implementación |
|---|---|---|---|---|---|---|
| 5.1 | Resumen ejecutivo completo | 🟡 v1 (1.19) | ✅ | 🟡 | Suma el grupo par, el Z-score y el top 5 de hallazgos | Extender la 1.19 con 2.1, 4.2 y 4.6 |
| 5.2 | Constructor de informes (PDF / Excel) | 🟡 Revista fija + `window.print` | ✅ 438 informes | 🟡 Exportación de MicroStrategy | | Se eligen bloques; portada con "datos al <corte>"; reutiliza `ImpresionContext` y `exportarExcel` |
| 5.3 | Proyecciones a 12–36 meses | 🔴 | ✅ A 5 años | — | Sobre los simuladores (4.3, 4.4) | Modo manual y automático (media histórica) |
| 5.4 | Redacción con LLM | 🔴 | — | — | El LLM solo redacta; las cifras salen del motor | Sobre los hallazgos de 1.12 |
| 5.5 | Diagnóstico en el backend | 🟡 En el front (1.12) | — | — | Contrato §14 | Servir el catálogo de reglas y los hallazgos desde la API |

---

## 7. Fase 6 — Fuera de nuestras fuentes

| # | Funcionalidad | Estado actual | Sistema 04 (MA) | Sistema 05 (RADAR) | Observación | Recomendación de implementación |
|---|---|---|---|---|---|---|
| 6.1 | Alcance y desempeño social | 🔴 | — | ✅ Clientes, % mujeres, % rural, metodología, oficiales, ahorristas | Son datos operativos de los miembros de la RFD; no están en los balances SB/SEPS | Primero, decidir si el producto compite en esta dimensión |
| 6.2 | Morosidad por zona geográfica | 🔴 | — | ✅ | Depende de la 3.7 y de datos de morosidad por cantón | Después de la 3.7 |
| 6.3 | Consolidación de grupos financieros | ⚪ | ✅ | — | Hoy no aplica | Solo si aparece un caso de uso |

---

## 8. Anexos

### 8.1 Ya lo tenemos (sin acción)

| Capacidad | Sistema | Dónde |
|---|---|---|
| Balance multiperiodo con análisis horizontal y vertical | MA | Explorador `EFI06` / `SFN06` |
| Estructura del activo y del pasivo, productivo e improductivo | MA | Hojas 3, 4, 6–8 |
| PyG mensual y anualizada | MA | Hojas 10 y 11 |
| Comparativa sectorial | MA | Hoja 2, rankings, hoja 31 |
| Gráficos, multiempresa y multiperiodo, exportar a Excel | MA, RADAR | Kit `src/shared/analitica` |
| KPI de cartera improductiva / patrimonio | RADAR 2 | Hoja 27 |
| Microcrédito | RADAR 8 | Hoja 16 |
| Gastos op. / activos, margen de intermediación, margen de absorción, activos productivos / PCC | RADAR 13–16 | Hoja 27 |
| ROA, ROE, rendimiento de cartera | RADAR 17, 18, 20 | Hoja 27, CAMELS E, PERLAS R |
| Fondos disponibles / depósitos CP, intermediación | RADAR 22, 23 | Hoja 27 |
| Exportar (PDF, Excel, imagen) | RADAR 40 | `exportarExcel`, `window.print`, `TarjetaGrafica` |
| Filtros, buscador, rango de periodos, KPI junto al gráfico | RADAR T3, T4, T6 | `FiltroCatalogo`, `SelectorRangoCortes`, `FilaKpis` |

### 8.2 No aplica

NOF, fondo de maniobra y capital circulante · periodos de maduración · auditorías de prueba ácida y disponibilidad · distribución analítica de costes · Altman y Conan-Holder · flujo de caja, EBITDA, valor añadido y EVA · cuentas anuales PGC · DCF, múltiplos y valor substancial · TIR / VAN / PRI · captura manual y mapeo de cuentas · divisas. El motivo de cada uno está en 04 §6.

### 8.3 Trazabilidad

**MA (04 §3)**

| Fila de 04 §3 | Fase |
|---|---|
| Balance de situación · activo disponible/realizable · exigible y capitales propios · estructura de PyG · activo funcional · gráficos · multiempresa · exportar | 8.1 |
| Masas patrimoniales (%) | 1.9 |
| Base 100 e índices · ratios de evolución | 1.9 |
| Cascada de PyG | 1.10 |
| Conan-Holder · NOF · capital circulante · flujo de caja · fondo de maniobra · maduración · valoraciones · TIR/VAN · EVA · cuentas anuales · captura | 8.2 |
| TAM + Gráfico Z | 1.11 (reemplazar `@xA`: 4.5) |
| Situación a largo plazo (solvencia, autofinanciación) | 1.1, 4.4 |
| Flujos de tesorería · EOAF | 1.14 |
| Cuadro de mando | 1.19, 5.1 |
| Índice Z | 4.2 |
| Ratios con rango óptimo | 1.16, 2.1, 3.2, 4.7 |
| Comparativa sectorial | 8.1 |
| Simulación con otros sectores o tramos | 1.16, 2.1, 2.5 |
| Pirámide de ratios · ROI/ROE | 4.1 |
| Umbral de rentabilidad | 4.3 |
| Apalancamiento financiero · nivel máximo de endeudamiento · autofinanciación · capacidad de crecimiento | 4.4 |
| Proyecciones | 5.3 |
| 12 auditorías | 1.13, 2.6, 4.6 |
| Informes y comentarios de gestión | 1.12, 5.2, 5.4 |
| Desplegable a cuentas | 3.4 |
| Consolidación | 6.3 |

**RADAR (05 §3)**

| Fila de 05 §3 | Fase |
|---|---|
| 1 Suficiencia patrimonial por tipo y organización | 1.17, 2.2 |
| 2, 8, 13–18, 20, 22, 23, 40 | 8.1 |
| 3 Patrimonio / Activos · 4 Apalancamiento | 1.1 |
| 5 Índice de capitalización | 4.9 |
| 6 Composición de la cartera de todas las entidades | 1.17, 2.2 |
| 7 Refinanciada y reestructurada | 1.5 |
| 9, 10 Cartera en riesgo y cobertura por línea | 1.7 |
| 11 Nota metodológica | 1.8 |
| 12 Gastos op. / cartera | 1.2 |
| 19 Sostenibilidad | 1.4, 4.8 |
| 21 Costo de fondeo | 1.3 |
| 24 Liquidez de 1 a 90 días | 3.8 |
| 25 Rubro en todas las entidades | 1.17, 2.2 |
| 26, 28 Rankings por indicador | 1.15, 2.3 |
| 27 Ranking de cartera y ahorros | 1.15 |
| 29–31, 33, 35 Clientes, metodología, oficiales, ahorristas | 6.1 |
| 32 Monto colocado acumulado | 1.18 (saldo promedio por prestatario: 6.1) |
| 34 Cartera castigada | 1.6 |
| 36 Mayores depositantes | 3.6 |
| 37 Cobertura geográfica | 3.7 |
| 38 Morosidad geográfica | 6.2 |
| 39 Manual de indicadores | 3.3 |
| T1 Indicador para todas las entidades | 1.17, 2.2 |
| T2 Agregados por tipo de entidad | 1.17, 3.5 |
| T3, T4, T6 | 8.1 |
| T5 N organizaciones | 2.4 |
| T7 Notas metodológicas | 1.8 |

---

## 9. Estado de ejecución

### 9.1 Fase 1 — rama `feature/fase-1-front-datos-existentes` (02/10/2026)

Hechos los 20 ítems (1.1–1.20), un commit por funcionalidad. Además, a pedido de revisión:

- Estandarización visual con el kit: `KpiCard` + `Delta` en `FilaKpis`, títulos en tipo oración, identidad solo en el título de página, roles de color de las gráficas (actual / anterior, entidad / grupo, suma / resta).
- En todas las tablas las variaciones son metadato de su valor (celda del corte con M y A debajo); tabla comparativa en la hoja 31.
- Unidad visible en todas las gráficas (subtítulo de la tarjeta, tooltip y marcas del eje) con cinco unidades: Millones USD, USD, Porcentaje (%), Número y Veces.
- Coma decimal en toda la revista.

Verificación: `pnpm typecheck` y `pnpm lint` sin errores (los 23 avisos ya existían), `Tokens: OK`; revisión en el navegador contra BackendDF local.

### 9.2 Pendientes

**Validar con negocio (bloquean la Fase 4)**

| Pendiente | Dónde | Notas |
|---|---|---|
| Sentido favorable de cada indicador | `src/modulos/Analisis/catalogoIndicadores.ts` | Provisional. Incluye los componentes CAMELS donde menor es mejor (improductivos, calidad de créditos, absorción, eficiencia operativa, IVF). Lo reemplaza el catálogo de la API (3.1) |
| Umbrales del motor de diagnóstico | `src/modulos/Analisis/diagnostico/reglas.json` | Las reglas bancarias no tienen fuente (4.6). Los de "estructura" son los del original |
| Umbrales de la auditoría (10 % / 25 %, 0,5 % / 2 % del activo) | `paginas/auditoria.tsx` | Editables en pantalla; calibrar por segmento (4.6) |
| Fórmula de sostenibilidad operacional | `derivados.ts` (`DER_SOST_OPER`) | Marcada 📘 (4.8) |
| Límite de solvencia del 9 % en el diagnóstico | `reglas.json` (`solvencia.minimo`) | Confirmar con la norma vigente (3.2) |

**Datos de origen a revisar (pipeline en R / BackendDF)**

| Hallazgo | Evidencia |
|---|---|
| `SOLVENCIA` repite el mismo valor en casi todos los sectores | `GET /sistema/series?codigos=SOLVENCIA` (el Monitor lo avisa en la gráfica) |
| `base_estru_sistema`, `base_cartera` y `entidades/` traen meses futuros (2026-11…2027-02) | `GET /api/meta` → `advertencias`; el Monitor corta en `ultimoCorteComun` |
| Cobertura VIS (`SB033`) da millones de % cuando la improductiva es ~0 | Se deja sin dato con improductiva < 1.000 USD (`DER_COB_VIS`) |
| `EFI04` fuentes y usos no cuadran (fuentes ≠ usos + resultados) | Hoja 34 |
| Saltos bruscos en CAMELS: Cobertura patrimonial 78,2 → −78,3 y Componente C 57,5 → 3,5 en un mes | BP. Pichincha, jun-26 → jul-26 |
| `SB036` (rendimiento de la cartera) en una escala distinta (≈1.235) | BP. Pichincha, jul-26 |

**Kit (`@idce/kit`)**

- `Delta` y las celdas de monto (`CeldaMoneda`, `CeldaSaldoVariacion`, `fmtMoneda`, `fmtPct`) formatean en en-US (punto decimal). La revista usa sus propias `CeldaValor` / `CeldaNumero` en es-EC; conviene una opción de locale en el kit.
- Nuevas en esta fase y a revisar por el kit: `base100` y `nota` en `TarjetaGrafica`, `subirEsMalo` en `CeldaSaldoVariacion`, `CeldaIndicadorVariacion` (con `sufijoVariacion`).

**Técnicos**

- `.claude/launch.json` tiene una configuración local para el puerto 3000 sin commitear: BackendDF solo acepta CORS desde el puerto 51646.
- La rama parte de `feature/consumo-api` (front conectado a BackendDF + trabajo en curso), que no está en `origin/main`: el PR de esta rama incluye esos commits.
- Hojas nuevas (32–36) agregadas al final del índice; el orden de lectura lo dan las secciones.

### 9.3 Seguimiento en GitHub

Cada ítem de las fases 2 a 6 tiene su issue en `paulIDCE/Frontend-DF`: #2–#34, más las épicas #35–#39. Hay un milestone y una etiqueta por fase, y etiquetas de área (`backend`, `frontend`, `datos`, `negocio`).

La información nueva, sobre todo la que viene del backend, se registra en los issues con la skill `actualizar-issues` (`.claude/skills/actualizar-issues/`). Los hooks de `.claude/settings.json` la exigen al editar el contrato, la capa de API o este plan, y cuando el mensaje trae novedades del backend, de datos o de negocio.

**Siguiente:** Fase 2 (rama `feature/fase-2-backend-calculos`), empezando por `GET /api/benchmarks` (2.1) y `GET /api/sistema/indicador` (2.2), que reemplazan los cálculos provisionales de grupo par y Monitor de esta fase.
