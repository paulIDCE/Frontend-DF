# Integración de funcionalidades de Managerial Analyzer

Análisis de qué funcionalidades de **Managerial Analyzer** (MA; Make Solutions, v.2014) aporta a la
reestructuración del módulo de Análisis Financiero. Se compara con lo que ya tenemos y se adapta a
las entidades financieras. Fecha: 01/10/2026.

Complementa [02_ANALISIS_DATOS_JSON.md](02_ANALISIS_DATOS_JSON.md),
[03_FORTALEZAS_DEBILIDADES.md](03_FORTALEZAS_DEBILIDADES.md) y
[../backend/CONTRATO_API.md](../backend/CONTRATO_API.md).

- **Fuente:** `Managerial_Analyzer_Funcionalidades_para_Frontend-DF.md`, el análisis de la instalación de MA. Se cita como "MA §n".
- **Alcance decidido:** el módulo sirve **solo a entidades financieras** (bancos, COAC y mutualistas de Ecuador). No incluye empresas reales.

**Leyenda**

| Marca | Significado |
|---|---|
| ✅ | Confirmado: la fórmula está en MA o se verificó en nuestros datos |
| 📘 | Estándar de la literatura: hay que validarlo con negocio |
| ❓ | No se sabe todavía |
| 🟢 Ya tenemos · 🟡 Parcial · 🔵 Adaptable (nuevo) · ⚪ No aplica | Estado de cada funcionalidad |

---

## 1. Resumen ejecutivo

- **MA es una herramienta para empresas reales.** Analiza existencias, clientes y proveedores, NOF, ciclo de maduración, Z de Altman y planes contables PUC/PGC. Su valor para nosotros está en los **patrones de análisis**, no en sus fórmulas concretas:
  - diagnóstico con texto automático;
  - auditoría con semáforo;
  - simuladores "qué pasaría si";
  - pirámide de ratios;
  - TAM;
  - resumen ejecutivo.
- **Ya cubrimos el núcleo descriptivo**, con equivalentes bancarios: balance multiperiodo con análisis vertical y horizontal, estructura del activo y del pasivo, PyG, ratios, CAMELS/PERLAS con calificación y comparativa sectorial.
  - En **comparativa sectorial estamos mejor que MA**: tenemos datos propios de 229 entidades y 10 sectores, y MA depende de tablas externas del Banco de España.
- **Lo que falta es la capa interpretativa y de decisión:**
  - diagnóstico configurable;
  - auditoría de desviaciones;
  - grupo par por percentiles;
  - descomposición de la rentabilidad;
  - indicador de insolvencia;
  - simuladores;
  - tendencia móvil;
  - informes a medida.
- **Casi todo lo propio de empresa real se descarta** (NOF, existencias, Altman, valoración, cuentas anuales PGC).

| Estado | Nº de funcionalidades de MA (§4 de MA, 36 filas) |
|---|---|
| 🟢 Ya tenemos | 6 |
| 🟡 Parcial | 9 |
| 🔵 Adaptable (nuevo para nosotros) | 12 |
| ⚪ No aplica | 9 |

El conteo sigue las 36 filas del catálogo de MA §4. La matriz de §3 suma, además, capacidades transversales de MA (gráficos, multiempresa, exportación, captura de datos) que en MA §4 no tienen fila propia.

**Las 5 que más valor aportan** (detalle en §5):
1. Motor de diagnóstico.
2. Auditoría ALTA / MEDIA / BAJA.
3. Benchmarks por percentiles del grupo par.
4. DuPont bancario.
5. Simuladores (tasa de equilibrio, crecimiento con patrimonio técnico, sensibilidad a la morosidad).

---

## 2. Criterio de integración

1. **La fuente de la verdad son los balances mensuales** (`EFI06`, `REP01`) **y los indicadores calculados a partir de ellos.**
   - Una funcionalidad entra solo si se calcula con esas cuentas (CUC) o con indicadores derivados.
   - Hoy esos indicadores llegan precalculados del proceso en R: `IF*`, `SB*`, CAMELS y PERLAS.
2. **Los insumos de MA que no están en el balance no se piden como dato obligatorio.**
   - Ejemplos: nº de empleados, dividendos, ventas del sector, plusvalías y supuestos manuales.
   - Solo pueden aparecer como **parámetro opcional de un simulador**, con un valor por defecto derivado del balance.
3. **No hay carga manual de balances** (MA §2.1). La captura, el mapeo de cuentas y la consolidación de MA se reemplazan por el pipeline de datos:
   - el catálogo CUC ya viene clasificado;
   - la jerarquía sale por prefijo del `Codigo_Base`.
4. **Se reutiliza el kit:** `TarjetaGrafica`, `TablaAnalitica`, `FilaKpis`, `opcionesMatrizCalor`, `MiniGrafica` y `exportarExcel`, además de la plantilla de pantalla de MA §7.3.

### 2.1 Datos verificados que condicionan el diseño ✅

Se verificaron sobre `reportes/BP__PICHINCHA.json`:

| Hecho | Evidencia | Consecuencia |
|---|---|---|
| Las cuentas de resultados (`@4`, `@5`, `@51`, `@41`, `@44`, `@45`, `Gan_Eje`…) vienen **acumuladas en el año** y se reinician en enero | `@5`: 2025-01 = 217,9 · 2025-02 = 417,4 · 2025-12 = 2.639,6 · 2026-01 = 229,0 | El valor de un mes es `acum(m) − acum(m−1)`; en enero es `acum(ene)` |
| El sufijo `A` / `_anual` es una **anualización simple** del acumulado (`acum × 12 / mes`), **no** un TAM | `@5A` 2025-02 = 417,4 × 6 = 2.504,2; en diciembre coincide con `@5` | El TAM de MA **no existe** en los datos, pero se puede calcular (§5.7) |
| Hay márgenes de PyG precalculados | `Mar_Br_Fi`, `Marg_Ne`, `Mar_Ne_Fina`, `Mar_Inte`, `Mar_Oper`, `Gan_Pe_Imp`, `Gan_Eje` y sus `_anual` | Son la base de la cascada de PyG y del DuPont |
| Los indicadores vienen en % (`IF002` ROA 1,12; `SOLVENCIA` 16,46) | Mismo archivo | Los semáforos usan %, no fracciones |

---

## 3. Matriz de correspondencia MA → AnalisisFinanciero

Prioridad: **A** (fase A) … **D** (fase D); "—" = no se hace.

### 3.1 Balances y Analítica

| Funcionalidad MA | Estado | Dónde está hoy / equivalente IFI | Datos | Prio. |
|---|---|---|---|---|
| Balance de situación y sus apartados | 🟢 | Hoja 1 *Balance General*; Explorador `EFI06` (árbol por `Codigo_Base`) | `EFI06`, `@1`/`@2`/`@3` | — |
| Activo disponible / realizable · real / ficticio | 🟢 | Hojas 3 *Activo Productivo* y 4 *Activos Improductivos* | `SB010`, `SB004`, `@11`, `@13`, `@14` | — |
| Exigible CP y LP · capitales propios | 🟢 | Hojas 6 *Estructura Pasivo*, 7 *Pasivos Exigibles*, 8 *Pasivos con Costo*; `EFI05` patrimonio técnico | `@21`, `@2101`, `@2103`, `@26`, `@3` | — |
| Estructura de PyG · resultados de explotación y financieros | 🟢 | Hojas 10 *PyG Mensual* y 11 *PyG Anual*; `EFI02`/`EFI03` | `@4*`, `@5*`, `Mar_*`, `Gan_*` | — |
| Activo funcional y extra-funcional | 🟢 | = productivo / improductivo (hojas 3 y 4) | `SB010`, `SB004`, `SB018A` | — |
| Masas patrimoniales (estructura en %) | 🟡 | Análisis vertical de `EFI06` en el explorador; en la revista solo en algunos KPI | `EFI06` `analisis=vertical` | A |
| Base 100 e índices | 🔵 | No existe | Cualquier serie del reporte | A |
| Cuadro analítico de PyG (cascada de márgenes) | 🟡 | Hojas 10 y 11 en tabla; no hay cascada | `Mar_Br_Fi` → `Marg_Ne` → `Mar_Ne_Fina` → `Mar_Oper` → `Gan_Pe_Imp` → `Gan_Eje` | A |
| Cuadro analítico en resumen y % (ratios de evolución + Conan-Holder) | 🔵 / ⚪ | Ratios de evolución: nuevo. Conan-Holder: no aplica | `*_anual` año contra año anterior | A |
| NOF | ⚪ | Concepto de empresa real (circulante operativo) | — | — |
| TAM + Gráfico Z | 🔵 | No existe (verificado en §2.1) | `@5`, `@4`, `@44`, `@45`, `Gan_Eje`, `monto_total` | C |
| Capital circulante | ⚪ | Sustituido por liquidez bancaria (CAMELS L, PERLAS L, `IF006`) | — | — |
| Situación financiera a largo plazo (autofinanciación, solvencia) | 🟡 | Solvencia: `SOLVENCIA`, `SB025`, `P6_Solvencia`. Autofinanciación: nuevo (simulador §5.6) | `Gan_Eje`, `@3`, `SOLVENCIA` | C |
| Flujo de caja · EBITDA · valor añadido | ⚪ | No son métricas de gestión bancaria; el equivalente es el margen operacional (`Mar_Oper`) | — | — |
| Flujos de tesorería · EOAF | 🟡 | `EFI04` / `SFN04` *Fuentes y usos*, solo en el explorador | `EFI04` | B |
| Cuadro de mando financiero | 🟡 | El hub muestra KPIs sueltos; no hay resumen ejecutivo por entidad | KPIs + calificaciones + diagnóstico | A |
| Índice Z (Altman adaptado) | ⚪ → 🔵 | Altman no aplica a bancos; se reemplaza por el **Z-score bancario** | `IF002`/`Gan_Eje_anual`, `@1`, `@3` | C |

### 3.2 Ratios y Rentabilidad

| Funcionalidad MA | Estado | Dónde está hoy / equivalente IFI | Datos | Prio. |
|---|---|---|---|---|
| Ratios de liquidez y endeudamiento con rango óptimo | 🟡 | Hoja 27 (36 indicadores) y hojas 28 y 29. Tienen valores, pero **no rango de referencia** | `IF*`, `SB*`, `L*` | B |
| Comparativa de ratios sectoriales | 🟢 | Hoja 2 (10 sectores), rankings de las hojas 5, 9, 24, 25 y 26, hoja 31 | `base_estru_sistema`, reportes | — |
| Simulación con otros sectores o tramos | 🟡 | Rankings y comparativo por `Tamaño`, `Rango_Activos` y `DPA_PR`; falta la posición en percentiles | Índice de reportes | B |
| Pirámide de ratios (44) | 🔵 | Se adapta como **DuPont bancario** (§5.4) | `Marg_Ne_anual`, `@52`, `@54`, `@44`, `@45`, `@1`, `@3` | B |
| ROI / ROE y su descomposición | 🟡 | `IF002` ROA e `IF004` ROE sueltos; no hay descomposición | Igual que la fila anterior | B |
| Umbral de rentabilidad | 🔵 | Se adapta como **simulador de tasa de equilibrio** (CF + GO + RC + CK, que ya están en la hoja 30) | `CF_*`, `GO_*`, `RC_*`, `CK_*`, `TAEB_*` | C |
| Apalancamiento financiero | 🔵 | Nuevo: `AF = (BAI/BAII) × (A/PN)`, con definiciones bancarias de BAI y BAII | `Gan_Pe_Imp`, `Mar_Oper`, `@1`, `@3` | C |
| Nivel máximo de endeudamiento (simulador) | 🔵 | Se adapta como **capacidad máxima de crecimiento** sin bajar del patrimonio técnico mínimo | `SOLVENCIA`, `EFI05`, `@14` | C |
| Capacidad de autofinanciación | 🔵 | Simulador: excedente retenido = `Gan_Eje × (1 − reparto)` | `Gan_Eje_anual`, `@3` | C |
| Capacidad de crecimiento | 🔵 | `g = ROE × (1 − reparto)` 📘 (mismo simulador) | `IF004` | C |
| Fondo de maniobra | ⚪ | Concepto de empresa real | — | — |
| Periodos de maduración y ciclo de caja | ⚪ | Requiere existencias, clientes y proveedores | — | — |

### 3.3 Valoraciones, Auditoría, Cuentas anuales e Informes

| Funcionalidad MA | Estado | Dónde está hoy / equivalente IFI | Datos | Prio. |
|---|---|---|---|---|
| Proyecciones a 5 años | 🔵 | Proyección a 12–36 meses para planificación (prioridad baja) | Series del reporte + supuestos | D |
| Flujos descontados · múltiplos · activo neto real · valor substancial | ⚪ | Las COAC no cotizan y el valor de una IFI no se analiza así en este producto | — | — |
| Proyecto de inversión (TIR / VAN / PRI) | ⚪ | Fuera del dominio del módulo | — | — |
| 12 auditorías ALTA / MEDIA / BAJA | 🔵 | Se adaptan a apartados IFI (§5.2). De las 12, prueba ácida, disponibilidad, plazos de cobro y pago y existencias **no aplican** | `EFI06` horizontal y vertical | B |
| EVA · cash flow directo | ⚪ | No aplican | — | — |
| Cuentas anuales (formatos legales PGC) | ⚪ | Formatos españoles. El formato regulatorio local ya es el CUC de `EFI01`/`EFI02` | — | — |
| Informes, estudios y comentarios de gestión | 🟡 | Revista fija de 31 hojas, exportación a Excel, textos en 4 hojas; **sin PDF ni informe a medida** | Todo | A (texto) / D (PDF) |
| Gráficos (columnas, barras, circular, evolución) | 🟢 | ECharts con `TarjetaGrafica` (líneas/barras, pantalla completa, imagen) | — | — |
| Multiempresa y multiperiodo | 🟢 | 229 entidades, 63 meses, selector de corte | — | — |
| Exportar a Excel | 🟢 | `exportarExcel`, descargas del explorador | — | — |
| Captura, importación y mapeo de cuentas · distribución analítica de costes · divisas · consolidación | ⚪ | La fuente es el pipeline de R; el CUC ya está clasificado; la economía está dolarizada. La consolidación queda como posible para grupos financieros | — | — |

---

## 4. Lo que ya tenemos

| Capacidad (MA) | Nuestro equivalente | Archivo |
|---|---|---|
| Balance multiperiodo con análisis vertical y horizontal | `EFI06` / `SFN06` con `analisis=saldo\|horizontal\|vertical`, árbol por prefijo | `src/modulos/Explorador/TablaBalances.tsx` |
| Estructura del activo y del pasivo con texto | Hojas 3, 4, 6, 7, 8 (`PaginaEstructura`) | `src/modulos/Analisis/paginas/estructuras.tsx`, `PaginaEstructura.tsx` |
| PyG mensual y anualizada | Hojas 10 y 11 | `src/modulos/Analisis/paginas/pyg.tsx` |
| Ratios por bloques | Hoja 27: estructura y eficiencia, morosidad, cobertura, rendimientos | `paginas/indicadoresConfig.ts` (`INDICADORES_27`) |
| Indicadores de riesgo con semáforo | Calificación A–E de CAMELS (`Indic_CAMELS_1`) y PERLAS (`efic_perlas_acum`) | `paginas/indicadores.tsx:173`, `:276` |
| Alerta por umbral | Índice de turbulencia por percentiles 50 y 75 (Normal / Media / Alta) | `paginas/operaciones.tsx:24`, `:103` |
| Diagnóstico con texto (parcial) | "Análisis dinámico" con reglas fijas (umbrales 50 %, 30 %, 10 %, −5 %) | `src/modulos/Analisis/analisisTexto.tsx` |
| Comparativa sectorial | Sectores agregados (hoja 2), 5 rankings, comparativo de 4 entidades (hoja 31) | `paginas/balance.tsx`, `rankings.tsx`, `indicadores.tsx` |
| Variaciones mensual y anual | Contexto `crearCtx` → `ctx.dato(code)` con `actual`, `varMensual`, `varAnual` | `src/modulos/Analisis/datos.ts` |
| Mapa de calor | `opcionesMatrizCalor` (hoy sin uso en Análisis) | `src/shared/analitica/graficas/opcionesMatrizCalor.ts` |

**Lo que MA tiene y a nosotros nos falta** (resumen de §3):
- rangos de referencia por ratio;
- reglas de diagnóstico configurables y un informe consolidado;
- clasificación de desviaciones;
- descomposición de la rentabilidad;
- simuladores;
- TAM;
- base 100;
- resumen ejecutivo;
- informe a medida y PDF.

---

## 5. Funcionalidades nuevas propuestas

Todas siguen la plantilla de pantalla de MA §7.3:
1. cabecera con "qué mide" y fórmula;
2. tarjetas KPI con semáforo;
3. gráfico principal;
4. grilla de detalle;
5. panel de diagnóstico;
6. simulación, si aplica;
7. acciones.

### 5.1 Motor de diagnóstico por reglas ⭐⭐⭐ (MA §5.1)

- **Objetivo:** un texto automático por hoja y un informe de "comentarios de gestión" por entidad.
- **Adaptación:** se generaliza `analisisTexto.tsx`. Hoy son 4 hojas con umbrales escritos a mano. Pasa a ser un **catálogo de reglas declarativo**:
  ```ts
  interface Regla {
    id: string;
    indicador: string;            // CUC o código de indicador
    medida: "nivel" | "varMensual" | "varAnual" | "percentilGrupo";
    condicion: { op: "<" | "<=" | ">" | ">=" | "entre"; valor: number | [number, number] };
    sentidoFavorable: "sube" | "baja";
    severidad: "alta" | "media" | "baja" | "positiva";
    plantilla: string;            // "La morosidad {sube|baja} {var} pp hasta {valor} %, {pos} del grupo par."
    bloque: "estructura" | "cartera" | "liquidez" | "solvencia" | "rentabilidad" | "tasas";
  }
  ```
- **Datos:** `ctx.dato()` y los percentiles de §5.3 cuando existan.
- **UI:**
  - un panel "Diagnóstico" en cada hoja (reemplaza el actual `PanelAnalisis`);
  - un bloque de "hallazgos principales" en el resumen ejecutivo;
  - un informe consolidado ordenado por severidad.
- **Backend:** queda en el front en la v1. El catálogo de reglas vive en un JSON de configuración, no en el código, y luego pasa al backend (contrato §14).
- **Opcional:** redacción con un LLM sobre los hallazgos ya calculados. El LLM solo redacta; las cifras salen del motor.
- **Validar:** umbrales y redacción con negocio. Los umbrales actuales del original no tienen fuente (03 §3).

### 5.2 Auditoría de desviaciones ALTA / MEDIA / BAJA ⭐⭐⭐ (MA §5.2)

- **Objetivo:** detectar qué partidas cambiaron de forma anómala entre periodos.
- **Metodología** (la de MA ✅, sobre apartados IFI):
  - Para cada partida y periodo se calculan la variación relativa (%), la variación absoluta (USD) y el peso sobre el total (análisis vertical).
  - Se clasifican **dos** importancias, relativa y absoluta, cada una ALTA, MEDIA o BAJA, con umbrales por apartado.
- **Apartados IFI propuestos:**
  - **Balance:** fondos disponibles (`@11`), inversiones (`@13`), cartera neta (`@14`), cuentas por cobrar (`@16`), bienes y activo fijo (`@17`, `@18`), otros activos (`@19`), obligaciones con el público (`@21`), obligaciones financieras (`@26`), patrimonio (`@3`).
  - **PyG:** intereses ganados (`@51`), intereses causados (`@41`), margen neto de intereses (`Marg_Ne`), comisiones e ingresos por servicios (`@52`, `@54`), provisiones (`@44`), gastos de operación (`@45`), otros ingresos y gastos, resultado antes de impuestos (`Gan_Pe_Imp`).
  - Al ser acumulada, la PyG se compara contra el **mismo mes del año anterior**, o se pasa antes a valores mensuales (§2.1).
- **Datos:** `EFI06` con `analisis=horizontal` y `vertical` (ya existen) y los saldos del reporte.
- **UI:**
  - una matriz partidas × periodos con mapa de calor (`opcionesMatrizCalor`);
  - filtro "solo ALTA";
  - desplegable de partida a subcuentas (árbol de `EFI06`);
  - umbrales editables en un panel de configuración, con valores por defecto por segmento.
- **Backend:** se puede calcular en el front con `EFI06`. Endpoint opcional en §8.
- **Validar:** umbrales por defecto. MA no los expone (❓ en MA §8.2); se propone partir de los percentiles históricos de la propia entidad.

### 5.3 Benchmarks por percentiles del grupo par ⭐⭐⭐ (sustituye MA §5.9 y §7.4)

- **Objetivo:** que cada ratio muestre **dónde está la entidad frente a sus pares**, y no solo su valor.
- **Adaptación:**
  - MA usa 28 ratios sectoriales del Banco de España y rangos óptimos fijos pensados para empresas.
  - Nosotros tenemos las 229 entidades: calculamos **P25, mediana y P75** de cada indicador por `Tamaño`, `Rango_Activos` o `DPA_PR`.
  - Esto se combina con los **límites normativos** de la SEPS y la SB 📘 (p. ej., patrimonio técnico ≥ 9 %; liquidez de primera y segunda línea), que hay que confirmar con la norma vigente.
- **Semáforo:**
  - verde si está en el cuartil favorable y cumple la norma;
  - ámbar si está entre P25 y P75;
  - rojo si está en el cuartil desfavorable o incumple la norma.
  - El "sentido favorable" de cada indicador (p. ej., morosidad ↓, solvencia ↑) va en el diccionario de indicadores.
- **UI:**
  - un distintivo de posición en cada KPI ("P68 del grupo");
  - una banda P25–P75 en las gráficas de evolución (las bandas grises ya se usan en la hoja 30);
  - un gráfico de caja por indicador.
- **Backend:** **endpoint nuevo** sobre el índice compacto de reportes (§8). En el front costaría bajar los 296 MB de reportes.
- **Validar:** grupo par por defecto (tamaño o segmento) y alineación de segmentos (02 §3, D8).

### 5.4 Descomposición DuPont / pirámide de rentabilidad bancaria ⭐⭐ (MA §5.4, §5.5)

- **Objetivo:** explicar **por qué** cambia el ROE.
- **Fórmula 📘** (a 12 meses, preferiblemente con TAM de §5.7, y saldos promedio):
  ```
  ROE = ROA × Multiplicador de capital               (Activo prom. / Patrimonio prom.)
  ROA = Margen neto de intereses / Activo           (Marg_Ne)
      + Comisiones y servicios / Activo             (@52 + @54)
      − Provisiones / Activo                        (@44)
      − Gastos de operación / Activo                (@45)
      ± Otros (ingresos y gastos, impuestos) / Activo
  Margen neto de intereses / Activo = Rendimiento de activos productivos × (Act. prod. / Activo)
                                    − Costo de pasivos con costo × (PCC / Activo)
  ```
- **Datos:** todo está en el reporte. Además, `SB010` (activos productivos), `SB036` (rendimiento de cartera) y los indicadores R1, R5 y R9 de PERLAS sirven para validar la conciliación.
- **UI:**
  - un árbol interactivo de arriba abajo (ECharts `tree`);
  - cada nodo muestra el valor, la variación anual y la posición en el grupo par (§5.3);
  - un panel lateral con la serie del nodo.
  - Una cascada que concilia el ROE de un año con el del siguiente: aporte de cada palanca.
- **Validar:** que la suma de componentes cuadre con `IF002` y `IF004` (definiciones de la SB) y el tratamiento de impuestos y participación de trabajadores.

### 5.5 Z-score bancario (riesgo de insolvencia) ⭐⭐ (sustituye MA §5.3)

- **Objetivo:** un indicador sintético de distancia a la insolvencia, análogo al Índice Z de MA.
- **Fórmula 📘** (literatura bancaria estándar): `Z = (ROA + Patrimonio/Activo) / σ(ROA)`.
  - σ se calcula en una ventana móvil de 12 a 36 meses, con ROA mensualizado a partir de §2.1.
  - Se interpreta como el número de desviaciones estándar que el ROA tendría que caer para agotar el patrimonio.
- **Por qué no Altman ni Conan-Holder:** usan fondo de maniobra, ventas y valor añadido. No tienen sentido en el balance de un banco.
- **UI:**
  - indicador tipo velocímetro;
  - serie histórica;
  - posición en el grupo par.
  - Va junto a la calificación CAMELS/PERLAS en el resumen ejecutivo.
- **Validar:** la ventana y si se usa ROA contable o ajustado. No tiene umbrales universales: se lee de forma relativa al grupo par.

### 5.6 Simuladores "qué pasaría si" ⭐⭐ (MA §5.5)

Se calculan en el front, con controles deslizantes, y comparan **real vs. simulado**. Los valores iniciales son los del último corte.

| Simulador | Análogo en MA | Variables | Resultado |
|---|---|---|---|
| **Tasa de equilibrio** | Umbral de rentabilidad | Costo de fondeo, gasto operativo, riesgo de crédito y costo de capital por segmento (`CF_*`, `GO_*`, `RC_*`, `CK_*`) | Tasa mínima vs. tasa efectiva de la EFI (`t_*`) y tasa máxima (`max_*`) |
| **Crecimiento con patrimonio técnico** | Nivel máximo de endeudamiento + capacidad de crecimiento | Crecimiento de cartera, % de reparto de excedentes, ROA esperado, ponderación de riesgo | Patrimonio técnico proyectado y **crecimiento máximo** sin bajar del mínimo normativo; `g = ROE × (1 − reparto)` 📘 |
| **Sensibilidad a la morosidad** | Auditoría del apalancamiento con simulador | Δ morosidad (pp), cobertura objetivo | Provisiones adicionales → ROA, ROE y solvencia simulados |
| **Apalancamiento financiero** | Apalancamiento financiero ✅ | Estructura de fondeo, costo de los pasivos | `AF = (BAI/BAII) × (A/PN)`: positivo si es > 1 |
| **Autofinanciación** | Capacidad de autofinanciación | % de reparto | Excedente retenido y su efecto en patrimonio y solvencia |

- **Validar:** la ponderación por riesgo (activos ponderados), porque no se puede deducir solo del balance. Se propone usar la relación histórica `patrimonio técnico requerido / @1` de la entidad (`EFI05`).

### 5.7 TAM + Gráfico Z ⭐⭐ (MA §5.7)

- **Objetivo:** ver la tendencia sin la estacionalidad ni el reinicio de enero de los acumulados.
- **Cálculo ✅** (con la estructura verificada en §2.1):
  ```
  mensual(m) = acum(m) − acum(m−1)       (enero: mensual = acum(ene))
  TAM(m)     = acum(m) + acum(dic año anterior) − acum(mismo mes del año anterior)
  ```
  - Hace falta tener 12 meses previos: con datos desde 2021-05, el primer TAM es de 2022-05.
- **Partidas:** ingresos (`@5`), intereses ganados (`@51`), intereses causados (`@41`), provisiones (`@44`), gastos de operación (`@45`), resultado (`Gan_Eje`), montos de operaciones activas (MOA).
- **UI:** Gráfico Z con 3 curvas (valor mensual, acumulado del año y TAM) y un selector de partida.
- **Efecto colateral:** reemplazar `@xA` (anualización simple) por el TAM en los ratios anualizados da cifras más estables, sobre todo en los primeros meses del año.

### 5.8 Base 100 y ratios de evolución ⭐ (MA §3, Analítica)

- **Base 100:** `índice(t) = valor(t) / valor(base) × 100`, con la base elegible (el primer corte por defecto). Sirve para comparar la evolución de partidas de distinta escala y entre entidades en la hoja 31.
- **Ratios de evolución ✅:** `valor del año / valor del año anterior` para ingresos, margen neto de intereses, margen operacional, resultado antes de impuestos y resultado del ejercicio.
- **Costo bajo:** se derivan de `ctx.serie()`. Se resuelve con un conmutador en `TarjetaGrafica` (Saldo / Base 100 / % vertical).

### 5.9 Resumen ejecutivo por entidad ⭐⭐ (MA "Cuadro de mando")

Pantalla de entrada de la revista. Contiene:
- tarjetas KPI (activo, cartera, depósitos, resultado, ROA, ROE, morosidad, liquidez, solvencia), con variación y semáforo de grupo par;
- calificaciones CAMELS/PERLAS y el Z-score bancario;
- los 5 hallazgos principales del motor de diagnóstico;
- la posición en los rankings.

Reutiliza `FilaKpis`, `MiniGrafica` y las calificaciones de `indicadores.tsx`.

### 5.10 Desplegable de ratio a cuentas ⭐ (MA §7.5)

- Desde cualquier indicador se puede ver su fórmula y las cuentas CUC que lo componen, con sus valores.
- **Requiere** un **diccionario de indicadores** (código, nombre, fórmula en CUC, unidad, sentido favorable). Hoy los indicadores llegan precalculados desde R, y el diccionario ya está previsto en el contrato §14.
- Sirve también para §5.3 (sentido favorable) y §5.1 (nombres en las plantillas).

### 5.11 Constructor de informe y PDF ⭐ (MA §6)

- Se eligen bloques: resumen, hojas, diagnóstico, auditoría, simulaciones.
- Se exporta a PDF y Excel con portada, fecha de corte ("datos al <corte>") y fuentes.
- Reemplaza los 438 `.rpt` fijos de MA y los "5 reportes" del hub que hoy son la misma revista (03 §7).

### 5.12 Proyecciones a 12–36 meses (prioridad baja) (MA §5.8)

- Supuestos de crecimiento (cartera por segmento, depósitos, tasas, morosidad, gasto operativo), en modo **manual** o **automático** (media histórica, como el modo A de MA).
- Salidas: balance, PyG e indicadores clave proyectados frente a los históricos.
- Se apoya en los simuladores de §5.6.

---

## 6. Lo que no aplica, y por qué

| Funcionalidad MA | Motivo |
|---|---|
| NOF, fondo de maniobra, capital circulante | El "circulante" de una IFI es su negocio (cartera y depósitos). La liquidez se mide con CAMELS L y PERLAS L e `IF006` |
| Periodos de maduración, plazos de cobro y pago, rotación de existencias | No hay existencias ni proveedores comerciales |
| Auditoría de prueba ácida y de disponibilidad | Ratios de empresa real; sustituidos por los índices de liquidez bancarios |
| Distribución analítica de costes F / C / A y umbral de rentabilidad clásico | No hay fabricación ni comercialización; el análogo es la tasa de equilibrio (§5.6) |
| Índice Z de Altman y Conan-Holder | Diseñados para empresas industriales; sustituidos por el Z-score bancario (§5.5) |
| Flujo de caja, EBITDA, valor añadido, EVA | No son métricas de gestión ni regulatorias en banca |
| Cuentas anuales PGC (EFE, ECPN, EIGR, PYMES) | Formatos españoles; el formato local es el CUC (`EFI01`, `EFI02`) |
| DCF, múltiplos, activo neto real, valor substancial | Las COAC no cotizan; no es un caso de uso de este producto |
| Proyecto de inversión (TIR / VAN / PRI) | Fuera del dominio del módulo |
| Captura manual, importación de Excel, mapeo de cuentas, cambio de signo fiscal | La fuente de la verdad es el pipeline de balances de los reguladores; el CUC ya está clasificado |
| Conversión de divisas, miles de u.m. | Economía dolarizada; los datos ya vienen en millones de USD |
| Consolidación de empresas | No aplica hoy. Queda como posible a futuro para grupos financieros |

---

## 7. Propuesta de navegación de la revista

Se reagrupan las 31 hojas por tarea del usuario (adaptación de MA §7.2), **sin perder ninguna**. Las secciones nuevas van marcadas con 🔵.

```
Análisis Financiero — <entidad> — datos al <corte>
 1. Resumen ejecutivo 🔵                    KPIs + grupo par + CAMELS/PERLAS + Z bancario + hallazgos
 2. Estados financieros                     Hoja 1 Balance · Hoja 2 Evolución · Hojas 10-11 PyG (+ cascada 🔵)
                                            · Fuentes y usos (EFI04) 🔵
 3. Estructura                              Hojas 3-4 Activo productivo/improductivo · Hojas 6-8 Pasivo
 4. Cartera y calidad de activos            Hoja 12 Intermediación · Hojas 13-16 por segmento (unificables
                                            con selector) · Hoja 17 Turbulencia
 5. Liquidez y solvencia                    Bloques de las hojas 27-29 (liquidez, patrimonio técnico, CAMELS C/L,
                                            PERLAS P/E/L) + semáforo de grupo par 🔵
 6. Rentabilidad                            DuPont 🔵 · Rendimientos (hoja 27) · CAMELS E · PERLAS R
 7. Tendencias 🔵                           TAM + Gráfico Z · Base 100 · ratios de evolución
 8. Auditoría y alertas 🔵                  Mapa de desviaciones · Z bancario · configuración de umbrales
 9. Mercado y grupo par                     Rankings (hojas 5, 9, 24-26) · Comparativo (hoja 31) · percentiles 🔵
10. Operaciones y tasas                     Hojas 18-23 Montos · Hoja 30 Tasas (+ simulador de tasa de equilibrio 🔵)
11. Simuladores 🔵                          Crecimiento/PT · Sensibilidad a la morosidad · Apalancamiento · Autofinanciación
12. Informes 🔵                             Constructor por bloques · PDF / Excel · comentarios de gestión
```

- Las hojas 13–16 y 19–22 son casi idénticas por segmento (03 §7): se proponen como **una hoja con selector de segmento**.
- El estado de navegación (entidad, corte, sección y hoja) va en la URL (03 §2).

---

## 8. Impacto en el contrato de API (adenda propuesta)

El contrato v1 deja los textos y las calificaciones en el front (`CONTRATO_API.md` §1). Para las funcionalidades nuevas:

| Endpoint | Para | Motivo |
|---|---|---|
| `GET /api/benchmarks?codigos=&fecha=&agrupacion=sector\|activos\|provincia\|todas&entidad=` | §5.3, §5.1, §5.9 | Percentiles (P10, P25, P50, P75, P90, n) por indicador del grupo par, y la posición de la entidad. Se calcula sobre el índice compacto de reportes (§3.4 del contrato); objetivo < 200 ms. |
| `GET /api/catalogos/indicadores` | §5.10, §5.3, §5.1 | Diccionario: código, nombre, unidad, formato, **sentido favorable**, fórmula CUC, límite normativo. Ya previsto en el contrato §14. |
| `GET /api/entidades/{id}/auditoria?desde=&hasta=&umbrales=` | §5.2 | **Opcional.** También se calcula en el front con `EFI06`; conviene en el backend si se quiere auditar a todo el grupo par. |
| `GET /api/entidades/{id}/reporte?serie=mensual\|tam` | §5.7, §5.4 | **Opcional.** Desacumula o calcula el TAM en el backend; si no, se hace en el front. |

- Se quedan en el front en la v1: el motor de diagnóstico, los simuladores, el DuPont y el Z-score bancario. Se mueven al backend según §14 del contrato.

---

## 9. Hoja de ruta y puntos abiertos

### 9.1 Fases

| Fase | Contenido | Depende de |
|---|---|---|
| **A** (bajo costo, alto valor) | Motor de diagnóstico (§5.1) sobre los textos actuales · Base 100 y ratios de evolución (§5.8) · Cascada de PyG · Resumen ejecutivo (§5.9) sin grupo par · Nueva navegación por secciones (§7) | Solo el front |
| **B** | Diccionario de indicadores (§5.10) · Benchmarks por percentiles (§5.3) y semáforos · Auditoría de desviaciones (§5.2) · DuPont (§5.4) · Fuentes y usos en la revista | Endpoints `/benchmarks` y `/catalogos/indicadores` |
| **C** | TAM + Gráfico Z (§5.7) · Z-score bancario (§5.5) · Simuladores (§5.6) | Validar fórmulas 📘 |
| **D** | Constructor de informes y PDF (§5.11) · Desplegable a cuentas · Proyecciones (§5.12) | Diccionario con fórmulas CUC |

### 9.2 Puntos abiertos que hay que validar con negocio

1. **Fórmulas 📘:** DuPont bancario (que cuadre con `IF002` / `IF004`), Z-score bancario (ventana, ROA), crecimiento sostenible con patrimonio técnico (ponderación por riesgo).
2. **Umbrales:** del diagnóstico y de la auditoría, por segmento. Los del original no tienen fuente.
3. **Límites normativos vigentes** de la SEPS y la SB por tipo de entidad y segmento (solvencia, liquidez).
4. **Grupo par por defecto:** `Tamaño` (segmento) o `Rango_Activos`, y cómo tratar los segmentos 4 y 5 y "Sin Segmento" (02 §3, D8).
5. **Sentido favorable** de cada indicador `IF` / `SB` / CAMELS / PERLAS, para los semáforos.
6. **Anualizados:** si se reemplaza `@xA` (anualización simple, §2.1) por el TAM en los ratios mostrados.
7. **Diccionario de fórmulas:** ¿lo puede exportar el proceso en R que hoy calcula los indicadores?
