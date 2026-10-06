# Comparativa con RADAR (RFD) — módulo «Información Financiera»

Qué funcionalidades del módulo **Información Financiera** de RADAR ya tenemos, en qué se diferencian y qué conviene agregar (y dónde). Fecha: 01/10/2026. Corte visto en RADAR: **AGO-26**.

Complementa [03_FORTALEZAS_DEBILIDADES.md](03_FORTALEZAS_DEBILIDADES.md) y [04_INTEGRACION_MANAGERIAL_ANALYZER.md](04_INTEGRACION_MANAGERIAL_ANALYZER.md). Los apartados destino usan la **navegación propuesta en 04 §7**, identificada como «Revista §n».

- **Fuente:** recorrido de solo lectura de `radar.rfd.org.ec/financiera`. El módulo tiene 8 tableros de MicroStrategy y en total 22 páginas.
- **Fuera de alcance:** los demás menús de RADAR (*Mercado*, *Riesgos*, *Desempeño social*, *Económica*, *Inclusión financiera*, *Manuales*). Se listan en §6.

**Leyenda**

| Marca | Significado |
|---|---|
| 🟢 Sí | Ya lo tenemos y es equivalente |
| 🟡 Parcial | Tenemos algo similar, con diferencias importantes |
| 🔴 No | No lo tenemos |

| Prioridad | Significado |
|---|---|
| A | Alta: hay datos y el esfuerzo es bajo o medio |
| B | Media |
| C | Baja |
| D | Depende de conseguir una fuente de datos nueva |

---

## 1. Resumen ejecutivo

- **Hay una diferencia de enfoque.**
  - **RADAR está centrado en el sistema.** Cada página toma **un indicador** y lo muestra para **todas las entidades a la vez**: por tipo de entidad, por organización y en su evolución.
  - **Nosotros estamos centrados en la entidad.** La revista analiza **una entidad**. La comparación se hace con rankings de cuentas, sectores agregados (hoja 2) o un comparativo de hasta 4 entidades (hoja 31).
- **En indicadores estamos cubiertos casi por completo.** Suficiencia patrimonial, morosidad y cobertura por segmento, ROA, ROE, rendimientos, margen de absorción, liquidez e intermediación ya existen en las hojas 27 a 31. En **profundidad analítica estamos por encima** de RADAR: CAMELS/PERLAS con calificación, turbulencia, tasas de equilibrio, texto dinámico y árbol CUC con análisis horizontal y vertical.
- **Los vacíos reales son cuatro:**
  1. **Vista «indicador × todas las entidades».** Es el patrón central de RADAR y no tenemos nada equivalente. Es la mejora de mayor valor (§4.1).
  2. **Rankings por indicador.** Hoy los rankings solo cubren cuentas: activos, pasivos, cartera neta, MOA y MOP. RADAR también ordena por CeR, ROA, ROE, eficiencia y gestión operativa.
  3. **Indicadores sueltos que faltan:**
     - apalancamiento (Pasivo/Patrimonio);
     - Patrimonio/Activos;
     - gastos operativos/cartera;
     - costo de fondeo global;
     - sostenibilidad operacional y financiera;
     - saldo de la cartera refinanciada y reestructurada.
  4. **Datos de alcance social y geográfico** de los miembros de la RFD (clientes, mujeres, metodología, oficiales, provincia/cantón). **No están en nuestras fuentes** (balances SB/SEPS); dependen de conseguir datos nuevos.

| Estado | Nº de funcionalidades (tabla §3) |
|---|---|
| 🟢 Sí | 13 |
| 🟡 Parcial | 11 |
| 🔴 No | 16 |

---

## 2. Cómo es RADAR (para entender la comparación)

### 2.1 Estructura del módulo

| Tablero RADAR | Páginas internas |
|---|---|
| 1. Suficiencia del patrimonio | Suficiencia patrimonial · Suficiencia patrimonial II |
| 2. Estructura de cartera y morosidad | Composición de la cartera total · Composición de la cartera micro · Cartera en riesgo y cobertura |
| 3. Eficiencia y gestión operativa | Eficiencia y gestión operativa · Eficiencia y gestión operativa 2 |
| 4. Rentabilidad y rendimiento | ROA · ROE y sostenibilidad · Rendimiento de cartera |
| 5. Costo y liquidez | Costo de fondeo · Liquidez |
| 6. Balance y E.R | Activos · Pasivos · Patrimonio · Ingresos · Gastos |
| 7. Rankings | Cartera en riesgo · Cartera y ahorros · Gestión operativa · Rentabilidad · Eficiencia |
| 8. Cartera y ahorro miembros RFD | Clientes de crédito · Cartera de crédito · Ahorros · Cobertura geográfica |

### 2.2 Patrón de página (repetido en los tableros 1 a 6)

```
[Título del indicador] [Periodo ▾] [Tipo de entidad ▾] [Subtipo ▾] [🔍 Buscar organización]
┌ Indicador por TIPO DE ENTIDAD (barras) ┐ ┌ 2 KPI ┐ ┌ Indicador por ORGANIZACIÓN (todas, ordenadas) ┐
└────────────────────────────────────────┘ └───────┘ └────────────────────────────────────────────────┘
[════════ deslizador de rango de periodos (13 meses por defecto, desde DIC-14) ════════]
┌ Evolución por TIPO DE ENTIDAD (líneas) ┐ ┌ Evolución por ORGANIZACIÓN (líneas; leyenda seleccionable) ┐
```

- **Tipos de entidad:**
  - B. pública SF;
  - Bancos SF;
  - Coac S1, S2, S3 y Coac SF;
  - Coac 2.º piso;
  - Mutualistas SF;
  - ONG SF;
  - Total sistema.
- **Exportación:** la estándar de MicroStrategy, desde el menú *Archivo* y el ícono de compartir.

---

## 3. Tabla comparativa

| # | Funcionalidad RADAR | Apartado RADAR | ¿La tenemos? | Dónde está en nuestro sistema | Equivalencia o diferencia (motivo) | Recomendación | Apartado destino (existente / **nuevo**) | Prio. |
|---|---|---|---|---|---|---|---|---|
| 1 | Suficiencia patrimonial por tipo de entidad, por organización y en su evolución | 1 · Suficiencia patrimonial | 🟡 Parcial | Hojas 28 y 29 (CAMELS C), explorador `1.5 Patrimonio Técnico` por sector y entidad | El indicador existe, pero solo para **una entidad** o un sector. No hay barra de todas las entidades ni evolución por tipo de entidad en un mismo gráfico | Mostrarlo en la vista por indicador | **Nuevo:** Sistema Financiero › *Monitor del Sistema* › Solvencia | A |
| 2 | KPI Cartera improductiva/Patrimonio y Activos improductivos/Patrimonio | 1 · Suficiencia patrimonial | 🟢 Sí | Hoja 27 *Morosidad-Cobertura-Rentabilidad* («Cartera improductiva/Patrimonio», «Cartera improductiva descubierta», «Vulnerabilidad del patrimonio») | Equivalente | — | — | — |
| 3 | Patrimonio/Activos (por tipo, por organización y en su evolución) | 1 · Suficiencia patrimonial II | 🔴 No | — (se calcula con `@3 / @1`) | El dato existe en el balance, pero el ratio no se muestra | Agregar el ratio | Revista §5 *Liquidez y solvencia* + *Monitor del Sistema* › Solvencia | A |
| 4 | Apalancamiento (Pasivo/Patrimonio) | 1 · Suficiencia patrimonial II (KPI) | 🔴 No | — (se calcula con `@2 / @3`) | Igual que la fila anterior | Agregar el ratio (y relacionarlo con el apalancamiento financiero de 04 §5.6) | Revista §5 *Liquidez y solvencia* | A |
| 5 | Índice de capitalización | 1 · Suficiencia patrimonial II (KPI) | 🟡 Parcial | PERLAS E9 *Capital neto*, «Capitalización neta» (hoja 28) | Las definiciones no coinciden 1 a 1. Hay que validar la fórmula de RADAR | Unificar la definición en el catálogo de indicadores | Revista §5 | B |
| 6 | Composición de la cartera total por tipo y por organización, con su evolución | 2 · Cartera total | 🟡 Parcial | Hoja 12 *Intermediación*, hojas 13 a 16 por segmento, explorador `2.1 Estructura de cartera` por sector, hoja 24 *Ranking cartera neta* | La composición es equivalente. **Falta la comparación de todas las entidades** en un gráfico | Cubrirlo con la vista por indicador | *Monitor del Sistema* › Calidad de cartera | A |
| 7 | Evolución de la cartera refinanciada y reestructurada (saldo) | 2 · Cartera total | 🟡 Parcial | Hoja 27: rendimiento de las carteras refinanciada y reestructurada y «Cobertura de la cartera refinanciada» | Tenemos **rendimiento y cobertura, pero no el saldo** ni su evolución | Agregar una serie de saldos (cuentas del CUC de `EFI06`) | Revista §4 *Cartera y calidad de activos* | B |
| 8 | Composición de la cartera de microcrédito (por tipo, por organización y en su evolución) | 2 · Cartera micro | 🟢 Sí | Hoja 16 *Cartera Microcrédito*; filtro de crédito «Microcrédito» en el explorador | Equivalente por entidad. Para el sistema, ver la fila 6 | — | — | — |
| 9 | Cartera en riesgo por línea de crédito (11 líneas, con educativo e inversión pública) | 2 · Cartera en riesgo y cobertura | 🟡 Parcial | Hoja 27: índice de morosidad de consumo, inmobiliario, microcrédito y productivo; hoja 17 *Turbulencia* | Nosotros mostramos **índices** de morosidad de 4 segmentos. RADAR muestra el **saldo** de cartera en riesgo de 11 líneas, entre ellas educativo, inversión pública y las líneas anteriores a 2021 | Completar los segmentos educativo y vivienda de interés social, y ofrecer «saldo / índice» como alternancia | Revista §4 | B |
| 10 | Cobertura de la cartera en riesgo por línea | 2 · Cartera en riesgo y cobertura | 🟢 Sí | Hoja 27, bloque *Cobertura* (provisiones de consumo, inmobiliario y productivo) y CAMELS A | Equivalente (faltan las mismas líneas que en la fila 9) | Ídem fila 9 | Revista §4 | C |
| 11 | Nota metodológica sobre el cambio normativo de mayo 2021 (reclasificación de carteras) | 2 · Cartera en riesgo | 🔴 No | — | Sin la nota, las series de 2021 parecen cortes de datos | Agregar notas metodológicas por gráfico (ícono ⓘ en `TarjetaGrafica`) | Transversal: `src/shared/analitica/graficas/TarjetaGrafica.tsx` | A |
| 12 | Gastos operacionales / total cartera | 3 · Eficiencia | 🔴 No | — Tenemos gastos de operación / activo promedio y gastos de operación / margen financiero | Es otro denominador. En microfinanzas se usa mucho el de cartera | Agregar el ratio | Revista §6 *Rentabilidad* (sugerido: renombrarla **«Rentabilidad y eficiencia»**) + *Monitor del Sistema* | A |
| 13 | Gastos operacionales / total activos | 3 · Eficiencia | 🟢 Sí | Hoja 27 *Estructura y eficiencia* | Equivalente | — | — | — |
| 14 | Margen de intermediación | 3 · Eficiencia | 🟢 Sí | `Mar_Inte` (PyG), «Margen spread de tasas» (hoja 30) | Equivalente | — | — | — |
| 15 | Margen de absorción | 3 · Eficiencia 2 | 🟢 Sí | Hoja 27 «Gastos de operación / margen financiero» y «Grado de absorción del margen financiero» | Equivalente | — | — | — |
| 16 | Activos productivos / pasivos con costo · Activos improductivos netos / total activos | 3 · Eficiencia 2 (KPI) | 🟢 Sí | Hoja 27 *Estructura y eficiencia* (`ac_prod_pco`, `SB018A`) | Equivalente | — | — | — |
| 17 | ROA (por tipo, por organización y en su evolución) + KPI de ganancia neta y activo promedio | 4 · ROA | 🟢 Sí | Hoja 27 *Rentabilidad*, CAMELS E, PERLAS R12 | Equivalente por entidad. Para el sistema, ver T1 | — | *Monitor del Sistema* › Rentabilidad | A |
| 18 | ROE | 4 · ROE | 🟢 Sí | Ídem (`IF004`) | Equivalente | — | Ídem | — |
| 19 | Sostenibilidad financiera y operacional | 4 · ROE y sostenibilidad (KPI) | 🔴 No | — | Indicador típico de microfinanzas: ingresos financieros / (gasto financiero + provisiones + gasto operativo). Se calcula con la PyG (`@5x`, `@4x`) | Agregarlo (validar la fórmula con negocio) | Revista §6 *Rentabilidad y eficiencia* | B |
| 20 | Rendimiento de la cartera total, de microcrédito y de consumo | 4 · Rendimiento de cartera | 🟢 Sí | Hoja 27 *Rendimientos* (total por vencer, productivo, consumo, inmobiliario y microcrédito) | Equivalente; tenemos más segmentos | — | — | — |
| 21 | Costo de fondeo (intereses causados / pasivos con costo promedio) | 5 · Costo de fondeo | 🟡 Parcial | PERLAS R5 y R6 (costo de los depósitos de ahorro y del crédito externo); tasas pasivas efectivas (hoja 30) | Tenemos costos por fuente, **no el costo global** | Agregar el costo de fondeo global | Revista §5 *Liquidez y solvencia* o §10 *Operaciones y tasas* | A |
| 22 | Fondos disponibles / depósitos a corto plazo | 5 · Liquidez | 🟢 Sí | Hoja 27 «Fondos disponibles / total depósitos a corto plazo», CAMELS L | Equivalente | — | — | — |
| 23 | Intermediación financiera (cartera / depósitos) | 5 · Liquidez (KPI) | 🟢 Sí | Hoja 27 «Cartera bruta / (depósitos a la vista + a plazo)», hoja 12 | Equivalente | — | — | — |
| 24 | Caja y bancos + inversiones de 1 a 90 días / total obligaciones | 5 · Liquidez (KPI) | 🟡 Parcial | «Índice de liquidez», «Índice de liquidez ampliada» y «Índice de liquidez ajustado» (hoja 28) | Concepto similar; el numerador y el denominador **por verificar** | Documentarlo en el catálogo; si difiere, agregarlo | Revista §5 | C |
| 25 | Rubros de activo, pasivo, patrimonio, ingresos y gastos (selector de rubro, por tipo y por organización, con evolución) | 6 · Balance y E.R | 🟡 Parcial | Hojas 1, 6 a 8, 10 y 11; explorador `EFI06`/`SFN06` (árbol CUC, saldo/horizontal/vertical) | **Por entidad o sector estamos por encima** (árbol CUC y análisis horizontal y vertical). **Falta comparar un rubro entre todas las entidades** | Cubrirlo con la vista por indicador o rubro | *Monitor del Sistema* › Balance | B |
| 26 | Ranking de cartera en riesgo (total, consumo y micro), top 20 | 7 · Rankings | 🔴 No | Rankings solo de cuentas: hojas 5, 9, 24, 25 y 26 | Nuestros rankings no ordenan por ratios | Generalizar el ranking a **cualquier indicador** | Revista §9 *Mercado y grupo par* › **Ranking por indicador** (nuevo) | A |
| 27 | Ranking de cartera y ahorros (total de ahorros, cartera total y micro) | 7 · Rankings | 🟡 Parcial | Hoja 24 *Cartera neta*, hoja 9 *Pasivos*, hoja 5 *Activos* | No hay ranking de depósitos ni de cartera de microcrédito | Agregar las cuentas de depósitos y micro al ranking | Revista §9 | B |
| 28 | Ranking de gestión operativa, rentabilidad y eficiencia (intermediación, sostenibilidad, gastos de personal / cartera, ROA, ROE, rendimiento, margen de absorción) | 7 · Rankings | 🔴 No | — | Igual que la fila 26 | Lo cubre el **Ranking por indicador** | Revista §9 | A |
| 29 | Clientes y socios activos de crédito por organización, con su evolución | 8 · Clientes de crédito | 🔴 No | — | **No está en nuestras fuentes** (balances). RADAR usa datos propios de sus miembros | Solo si se consigue la fuente | **Nuevo:** *Alcance y desempeño social* | D |
| 30 | % de clientes mujeres, % de clientes de microcrédito, % de microcrédito a mujeres, % de cartera rural | 8 · Clientes de crédito | 🔴 No | — | Ídem | Ídem | **Nuevo:** *Alcance y desempeño social* | D |
| 31 | Distribución de la cartera por metodología (individual, grupos solidarios, bancos comunales, asociativo, 2.º piso) | 8 · Clientes de crédito | 🔴 No | — | Ídem | Ídem | Ídem | D |
| 32 | Saldo promedio por prestatario · monto colocado acumulado | 8 · Clientes / Cartera | 🟡 Parcial | Hojas 18 a 22 *Monto de operaciones activas* (monto colocado); explorador `2.2 Monto de operaciones activas` y `2.3 Cartera por rango` | El monto colocado sí lo tenemos. El saldo promedio por prestatario requiere el número de clientes | Mostrar el monto colocado acumulado; el saldo promedio depende de la fila 29 | Revista §10 *Operaciones y tasas* | C |
| 33 | Cartera por oficial, costo por crédito, clientes por oficial y por personal | 8 · Cartera de crédito | 🔴 No | — | Requiere datos de personal y de número de créditos | Solo con fuente nueva | *Alcance y desempeño social* | D |
| 34 | Tasa de cartera castigada | 8 · Cartera de crédito | 🔴 No | — | Puede salir de las cuentas de orden del CUC, **por verificar** en `EFI06` | Verificar la disponibilidad; si existe, agregarla | Revista §4 *Cartera y calidad de activos* | C |
| 35 | Clientes de ahorro, % de ahorristas mujeres, saldo promedio por ahorrista | 8 · Ahorros | 🔴 No | Hoja 23 y explorador `2.4 Estructura de depósitos` (saldos, sin número de clientes) | Tenemos saldos, no clientes | Solo con fuente nueva | *Alcance y desempeño social* | D |
| 36 | Cobertura de los 25 y 100 mayores depositantes (concentración) | 8 · Ahorros | 🔴 No | — | Es un indicador de **riesgo de liquidez** valioso. La SB/SEPS lo publican en los reportes de liquidez estructural | Buscar la fuente; encaja en liquidez | Revista §5 *Liquidez y solvencia* | C/D |
| 37 | Cobertura geográfica: cartera, ahorros, clientes y oficinas por provincia y cantón | 8 · Cobertura geográfica | 🔴 No | Solo la provincia de la matriz (`DPA_PR`) en filtros | No tenemos datos por cantón ni de oficinas | Con fuente nueva (p. ej. volumen de crédito por cantón de la SB/SEPS), pantalla con mapa | **Nuevo:** Sistema Financiero › *Cobertura geográfica* | D |
| 38 | Morosidad por organización dentro de la cobertura geográfica | 8 · Cobertura geográfica | 🟡 Parcial | Índice de morosidad por entidad (hoja 27) | Tenemos la morosidad, pero no su cruce geográfico | Depende de la fila 37 | Ídem | D |
| 39 | Manual de indicadores (menú *Manuales*) | Menú global | 🔴 No | Catálogo de indicadores previsto en `docs/backend/CONTRATO_API.md` §14 | No hay glosario visible para el usuario | Pantalla o panel de glosario a partir de `GET /api/catalogos/indicadores` | **Nuevo:** *Glosario de indicadores* (ayuda global del shell) | B |
| 40 | Exportar (PDF, Excel, imagen) | Menú *Archivo* (MicroStrategy) | 🟢 Sí | `exportarExcel`, descargas del explorador, PDF de la revista (`window.print`), imagen de gráfica (`TarjetaGrafica`) | Equivalente | — | — | — |

### 3.1 Capacidades transversales de la interfaz

| # | Capacidad RADAR | ¿La tenemos? | Dónde / diferencia | Recomendación | Prio. |
|---|---|---|---|---|---|
| T1 | **Un indicador para todas las entidades a la vez** (barra ordenada con buscador) | 🔴 No | Lo más cercano: rankings de cuentas (hojas 5, 9, 24 a 26) y el comparativo de 4 entidades (hoja 31) | **Monitor del Sistema** (§4.1) | A |
| T2 | Agregados por tipo de entidad en un mismo gráfico | 🟡 Parcial | Hoja 2 y explorador con 10 sectores (incluye bancos por tamaño, **más fino que RADAR**). **No tenemos** banca pública, ONG ni COAC de 2.º piso: verificar si están en la fuente | Reutilizar los 10 sectores; evaluar si se suma la banca pública | A |
| T3 | Filtros de tipo y subtipo de entidad + buscador de organización | 🟢 Sí | `FiltroCatalogo`, `Select showSearch`; filtros de tamaño, provincia y nivel de activos (hoja 31). **Tenemos más filtros** | — | — |
| T4 | Deslizador de rango de periodos | 🟢 Sí | `SelectorRangoCortes`, `useSeleccionRango` / `ControlesPeriodo` (zoom de periodo en `TarjetaGrafica`) | — | — |
| T5 | Selección libre de N organizaciones en la evolución | 🟡 Parcial | Hoja 31: máximo 3 adicionales | En el Monitor, permitir N entidades (con un tope razonable, p. ej. 10) | B |
| T6 | KPI destacados junto al gráfico | 🟢 Sí | `FilaKpis`, `KpiCard` | — | — |
| T7 | Notas metodológicas | 🔴 No | — | Ver fila 11 | A |

---

## 4. Recomendaciones

### 4.1 Monitor del Sistema ⭐⭐⭐ (nuevo; cierra T1, T2, T5 y las filas 1, 3, 6, 12, 17 y 25)

- **Qué es:** una pantalla nueva en **Sistema Financiero**, en la ruta `/sistema/monitor` o como pestaña de `/sistema`. Replica el patrón de página de RADAR (§2.2) con nuestras piezas:

| Bloque | Pieza existente |
|---|---|
| Indicador por sector (10 sectores) | `TarjetaGrafica` (barras) |
| 2–3 KPI del sistema | `FilaKpis` |
| Indicador por entidad (229, ordenadas, buscador, resaltar la entidad elegida) | `TarjetaGrafica` + `dataZoom` / `TablaAnalitica` (alternar con `AlternarTablaGrafica`) |
| Rango de periodos | `SelectorRangoCortes` |
| Evolución por sector y por N entidades | `TarjetaGrafica` (líneas) |

- **Pestañas sugeridas,** con los nombres en el lenguaje de RADAR para facilitar la adopción:
  - *Solvencia*: suficiencia patrimonial, Patrimonio/Activos, apalancamiento.
  - *Calidad de cartera*: morosidad, cartera en riesgo, cobertura, composición.
  - *Eficiencia*: gastos operativos/activos, gastos operativos/cartera, margen de absorción.
  - *Rentabilidad*: ROA, ROE, rendimiento de la cartera, sostenibilidad.
  - *Liquidez y fondeo*: fondos disponibles/depósitos a corto plazo, intermediación, costo de fondeo.
  - *Balance*: cualquier rubro del CUC.
- **Datos:** el índice compacto de reportes que ya alimenta los rankings (CONTRATO_API §3.4) tiene los indicadores de todas las entidades por corte. Hace falta un endpoint del tipo `GET /api/sistema/indicador?codigo=&desde=&hasta=&agrupacion=sector|entidad` (alineado con `/api/benchmarks` de 04 §8).
- **Ventaja sobre RADAR:** desde una barra de entidad se salta a su revista; RADAR no tiene ficha por entidad. Además se le puede sumar la banda de percentiles del grupo par (04 §5.3).

### 4.2 Ranking por indicador ⭐⭐⭐ (generaliza las hojas 5, 9 y 24 a 26; cierra las filas 26 a 28)

- Convertir `PaginaRanking` (`src/modulos/Analisis/paginas/rankings.tsx`) en una hoja con un **selector de indicador** agrupado por los mismos bloques de RADAR:
  - Cartera en riesgo;
  - Cartera y ahorros;
  - Gestión operativa;
  - Rentabilidad;
  - Eficiencia.
- Se mantiene lo que RADAR no tiene: participación, posición de la entidad, treemap y filtros por sector, nivel de activos y provincia.
- **El orden depende del sentido favorable del indicador.** Por ejemplo, morosidad y gasto operativo van de menor a mayor. El sentido sale del catálogo de indicadores.
- **Destino:** Revista §9 *Mercado y grupo par* › «Ranking por indicador». La API de rankings necesita aceptar códigos de indicador además de cuentas.

### 4.3 Indicadores que faltan (filas 3, 4, 7, 12, 19, 21 y 34) ⭐⭐

| Indicador | Fórmula base (validar con negocio) | Destino |
|---|---|---|
| Patrimonio / Activos | `@3 / @1` | Revista §5 *Liquidez y solvencia* |
| Apalancamiento | `@2 / @3` (veces) | Revista §5 |
| Gastos operativos / cartera bruta | gasto de operación / cartera bruta promedio | Revista §6 *Rentabilidad y eficiencia* |
| Sostenibilidad operacional | ingresos financieros / (gasto financiero + provisiones + gasto operativo) | Revista §6 |
| Costo de fondeo global | intereses causados / pasivos con costo promedio | Revista §5 |
| Saldo de la cartera refinanciada y reestructurada | cuentas del CUC de `EFI06` | Revista §4 *Cartera y calidad de activos* |
| Tasa de cartera castigada | cuentas de orden (verificar) | Revista §4 |

- Todos se agregan como entradas de configuración en `src/modulos/Analisis/paginas/indicadoresConfig.ts` (mismo formato que `INDICADORES_27`). Si el backend no los trae precalculados, se suman al cálculo del índice de reportes.

### 4.4 Notas metodológicas y glosario ⭐⭐ (filas 11 y 39)

- **Notas:** agregar una prop opcional `nota` a `TarjetaGrafica` que muestre un ícono ⓘ con texto. La primera nota es el cambio normativo de mayo de 2021 en las carteras.
- **Glosario:** un panel global en el `AppShell` alimentado por `GET /api/catalogos/indicadores` (CONTRATO_API §14), con código, nombre, fórmula, unidad y sentido favorable.

### 4.5 Solo si se consigue la fuente de datos (filas 29 a 33, 35 a 38) — prioridad D

- **Alcance y desempeño social** (módulo nuevo): clientes de crédito y ahorro, % mujeres, % rural, metodología, productividad por oficial, saldo promedio por prestatario y por ahorrista.
  - Requiere datos operativos que la RFD obtiene de sus miembros; no están en los balances de la SB/SEPS.
  - Antes de diseñarlo hay que decidir **si el producto quiere competir en esta dimensión**.
- **Cobertura geográfica** (Sistema Financiero): cartera, captaciones y oficinas por provincia y cantón, con mapa. La SB/SEPS publican volumen de crédito y captaciones por cantón. Es la opción **más factible** de este grupo.
- **Concentración de depositantes** (25 y 100 mayores): si aparece la fuente, va en Revista §5.

---

## 5. Lo que tenemos y RADAR no (para no perderlo de vista)

| Capacidad | Dónde |
|---|---|
| Ficha completa de **una entidad** (revista de 31 hojas con texto dinámico) | `src/modulos/Analisis/Revista.tsx`, `analisisTexto.tsx` |
| CAMELS y PERLAS con calificación y evolución | Hojas 28 y 29 (`paginas/indicadores.tsx`) |
| Índice de turbulencia (percentiles 50 y 75) | Hoja 17 (`paginas/operaciones.tsx`) |
| Tasas de equilibrio (CF + GO + RC + CK) vs. tasa efectiva y máxima | Hoja 30 |
| Montos de operaciones activas y pasivas por segmento | Hojas 18 a 23 |
| Árbol CUC con análisis horizontal y vertical, fuentes y usos, PyG anualizado | Explorador (`src/modulos/Explorador/`, `Sistema/ExploradorSistema.tsx`) |
| Rankings con participación, posición de la entidad, treemap y filtro por provincia o nivel de activos | `paginas/rankings.tsx` |
| Sectores bancarios por tamaño (grandes, medianos y pequeños) | `src/modulos/Sistema/cargarCuadro.ts` (`SECTORES`) |
| Favoritos y colecciones de cuadros | `src/modulos/Explorador/useFavoritos.ts`, `FavoritosModal.tsx` |
| Entorno macroeconómico y tasas en el mismo producto | `/macro`, `/tasas` (RADAR los tiene en otros menús; ver §6) |

---

## 6. Otros menús de RADAR (no revisados en detalle)

| Menú RADAR | Páginas | Relación con nosotros |
|---|---|---|
| Mercado | Captaciones · Colocaciones · Volumen · Tasas de interés | Cercano a `/tasas` y a las hojas 18 a 23 y 30. Conviene una segunda pasada |
| Riesgos | Crédito · Liquidez | Cercano a la hoja 17 y a CAMELS/PERLAS. Conviene una segunda pasada |
| Desempeño social | Productos adecuados I y II · Trato responsable a clientes · Trato responsable a empleados · Equilibrio financiero y social | Sin equivalente (ver §4.5) |
| Económica | Empleo y sectores económicos · Inflación · Exportaciones e importaciones | Cercano a `/macro` |
| Inclusión financiera | Global Findex · Microscopio global · ENEMDU acceso-uso | Sin equivalente |
| Manuales | Indicadores · Usuario | Ver fila 39 |

---

## 7. Orden sugerido

1. **A:** las 7 filas de §4.3 (son datos que ya tenemos), las notas metodológicas (§4.4) y **Ranking por indicador** (§4.2).
2. **A:** **Monitor del Sistema** (§4.1). Requiere el endpoint de indicador × entidades × periodo.
3. **B:** el glosario de indicadores, N entidades en el comparativo y el ranking de depósitos y micro.
4. **D:** evaluar las fuentes para la cobertura geográfica y para alcance y desempeño social.
