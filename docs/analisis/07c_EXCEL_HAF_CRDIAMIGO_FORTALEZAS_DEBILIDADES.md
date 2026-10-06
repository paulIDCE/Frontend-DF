# 07c · Excel HAF_CRDIAMIGO — Fortalezas y debilidades

> Semáforo por capa del libro `HAF_CRDIAMIGO_febrero_25.xlsm`. 🟢 sólido · 🟡 con reservas · 🔴 débil.

| Capa | Estado | Detalle |
|---|:---:|---|
| **Estructura del libro** | 🟡 | ✅ Separación clara en bloques (datos → análisis → indicadores SEPS). ✅ Un único origen (`B.G`/`E.R`) alimenta todo. ⚠️ Numeración de hojas desordenada (`1-8`, `12.x`, `9-11`). ⚠️ 4 hojas de cálculo ocultas con lógica clave. |
| **Fórmulas** | 🔴 | ✅ `VLOOKUP` siempre exacto (`FALSE`) y con guarda `IFERROR`/`ISERROR`. ✅ Divisiones protegidas con `IF(den=0,0,…)` en las hojas `12.x`. ❌ **331 fórmulas con `#REF!`** (selector `CHOOSE` de `B.G`, "ajuste diciembre" de `12.6`, 12 denominadores de `12.9`). ❌ Factor de anualización manual `13/3`. |
| **Datos** | 🟡 | ✅ Balance y PyG completos a nivel de cuenta SEPS. ✅ Matriz de 12+ cortes mensuales embebida. ⚠️ Mono-entidad/mono-corte. ⚠️ `INF.ADICIONAL` y promedios de segmento pegados como valores fijos. ❌ **5.001 errores en caché en `B.G`**. |
| **Contenido financiero** | 🟢 | ✅ Cobertura amplia y fiel a la normativa SEPS: suficiencia patrimonial, calidad de activos, morosidad, cobertura, eficiencia micro/financiera, rentabilidad, intermediación, rendimiento, liquidez, vulnerabilidad, **patrimonio técnico y APR con ponderaciones**. ✅ Desglose por 10 segmentos de cartera. 📘 Varias fórmulas por validar con negocio. |
| **UX / UI** | 🟡 | ✅ Flujo guiado por botones y portada. ✅ Gráficos por cada bloque. ⚠️ Navegación atada al VBA. ⚠️ Pasteles 3D y 2 gráficos rotos. ❌ Errores visibles para el usuario. |
| **Rendimiento** | 🟡 | ⚠️ `B.G` con 28.648 celdas y matriz de períodos hace lento abrir/recalcular. ✅ Sin funciones volátiles ni referencias circulares. |
| **Control y seguridad** | 🔴 | ✅ Hojas de salida protegidas. ⚠️ Protección sin contraseña real y hojas de entrada (`B.G`/`E.R`) desprotegidas. ❌ Libro **cifrado con contraseña de apertura hoy olvidada** (riesgo de continuidad). |
| **Operación** | 🔴 | ❌ Cada análisis exige pegar manualmente un balance nuevo; no escala a 229 entidades ni a series largas. ⚠️ Depende de Excel + macros en el equipo del analista. |
| **Documentación** | 🟡 | ✅ Cada hoja de indicador explica concepto y fórmula en texto. ⚠️ Sin notas sobre el origen de los promedios de segmento (2016) ni sobre el factor de anualización. ❌ Metodología de ROA/ROE oculta en hojas no visibles. |

## Síntesis

- **Lo más fuerte:** la **cobertura financiera** (indicadores SEPS completos, patrimonio técnico y APR con
  ponderaciones, desglose por segmento) y la **fidelidad metodológica** al marco regulatorio. Es el activo a rescatar.
- **Lo más débil:** **integridad de fórmulas** (`#REF!`), **control/operación** (cifrado perdido, mono-corte,
  proceso manual) y **benchmark obsoleto (2016)**. Son justamente los problemas que el proyecto resuelve al
  mover el cálculo a la API por entidad y corte.
