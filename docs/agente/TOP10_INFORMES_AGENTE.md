# Agente de informes PDF — Top 10 informes y prompts de usuario

Diseño funcional para el agente (n8n) que genera informes PDF a partir de la API de AnalisisFinanciero
(`docs/backend/CONTRATO_API.md`). Escrito desde la óptica de un analista de solvencia y gestión de
cooperativas y bancos: qué pide realmente un gerente, un jefe de riesgos o un consejo de administración,
y con qué datos mínimos se responde.

> Los códigos (`CUC`/`Variable`) salen de `REP01` y de `src/modulos/Analisis/paginas/indicadoresConfig.ts`.
> Antes de producción, validar cada lista con `GET /api/entidades/{id}/reporte?codigos=...` y revisar el header
> `X-Codigos-No-Encontrados`.
> Los umbrales de semáforo son **orientativos**: validarlos con la norma vigente de la SB / SEPS y con la
> política de riesgos de cada cliente antes de mostrarlos como "cumple / no cumple".

---

## 0. Principios para ahorrar tokens

1. **El LLM no ve series crudas.** n8n llama a la API, calcula en un nodo Code (JS) y le pasa al LLM una
   **ficha compacta** por indicador: `{cod, nombre, ultimo, var_m, var_a, min12, max12, tendencia, pares_p50, posicion}`.
   Una serie de 63 meses cuesta unos 400 tokens y una ficha, unos 40.
2. **Lista blanca de códigos por informe.** Cada informe tiene su lista cerrada (ver abajo). El agente
   **no** pide las 776 cuentas.
3. **Ventana de tiempo por defecto:** los últimos 13 meses (`desde = corte − 12`). Para tendencias largas, se
   pasan datos anuales a diciembre, no mensuales.
4. **Tres pasos, tres modelos:**
   - **Router + extracción de slots** (modelo pequeño, p. ej. Haiku): texto del usuario → JSON `{informe, entidad, pares, corte, segmento, enfoque}`.
   - **Obtención y cálculo** (sin LLM): HTTP Request + Code.
   - **Redacción** (modelo grande): recibe las fichas y devuelve **solo la narrativa** en JSON por sección.
5. **Los gráficos y tablas no los hace el LLM.** Salen de una plantilla HTML (Handlebars) con Chart.js o
   ECharts y se convierten a PDF con Gotenberg o Puppeteer. El LLM solo escribe hallazgos, alertas y
   recomendaciones.
6. **Resolución de entidad sin LLM:** `GET /api/entidades?q=` y, si hay más de un resultado, se le pregunta al usuario.
   Nunca se manda el catálogo de 229 entidades al modelo.
7. **Endpoint sugerido para la v2 del backend:** `GET /api/entidades/{id}/fichas?codigos=&corte=&pares=`, que
   devuelva las fichas ya calculadas (incluida la mediana de pares). Elimina el nodo Code y reduce la carga.

### Esquema de slots (salida del router)
```json
{
  "informe": "solvencia|cartera|liquidez|rentabilidad|pares|ranking|camels|contexto|tasas|ejecutivo",
  "entidad": "texto libre → se resuelve con /entidades?q=",
  "pares": ["opcional, hasta 3"],
  "grupo_pares": "sector|activos|provincia|null",
  "corte": "YYYY-MM | null (último disponible)",
  "horizonte_meses": 12,
  "segmento_credito": "total|productivo|consumo|inmobiliario|microcredito|null",
  "enfoque": "texto corto con la particularidad pedida (p. ej. 'solo microcrédito', 'para el consejo')",
  "audiencia": "consejo|gerencia|riesgos|auditoria|null"
}
```

---

## 1. Diagnóstico de solvencia y suficiencia patrimonial

**Quién lo pide:** gerencia general, comité de riesgos, consejo de vigilancia. Es el informe central de una asesoría de solvencia.
**Pregunta de fondo:** ¿el patrimonio aguanta el riesgo que asume la entidad y cómo evoluciona?

**Prompts típicos**
- "Hazme un informe de solvencia de la COAC Jardín Azuayo a julio 2026."
- "¿Cómo está la suficiencia patrimonial de Cooperativa X frente al año pasado? Lo necesito en PDF para el consejo."
- "Quiero ver si el patrimonio de BP. Amazonas cubre la cartera improductiva, con los últimos 12 meses."
- "Informe de solvencia de X comparado con la mediana del segmento 1."

**Datos (lista blanca)**
- Endpoint: `GET /api/entidades/{id}/reporte?codigos=...&desde=&hasta=`
- Códigos: `SB025` (suficiencia patrimonial), `C1_capit_neta`, `C2_Cobertura`, `C3`, `SBP001` (cartera improductiva descubierta / patrimonio + resultados), `P6_Solvencia`, `A3_Capi_neto`, `S8_K_neto`, `@3` (patrimonio), `@1`, `Gan_Eje`.
- Pares (opcional): `GET /api/entidades/series?ids=...&codigos=SB025,C1_capit_neta,SBP001`

**Estructura del PDF:** 1) Conclusión en tres líneas. 2) Indicadores clave con semáforo. 3) Evolución a 12 meses. 4) Cartera descubierta frente a patrimonio. 5) Generación interna de capital (utilidad/patrimonio). 6) Alertas y recomendaciones.

**Reglas para el LLM:** separar el crecimiento de patrimonio por utilidades del crecimiento por aportes. Si `SBP001` sube mientras `SB025` baja, marcarlo como **alerta de erosión patrimonial**.

---

## 2. Calidad de cartera, morosidad y cobertura por segmento

**Quién lo pide:** jefe de riesgos, jefe de crédito, auditoría.
**Pregunta de fondo:** ¿dónde se está deteriorando la cartera y si las provisiones alcanzan?

**Prompts típicos**
- "Dame un informe de morosidad por tipo de crédito de COAC X, a junio."
- "Quiero ver solo el microcrédito: morosidad, cobertura y cómo va frente a los pares del segmento."
- "¿La cobertura de provisiones de X alcanza para la cartera improductiva? Hazme el PDF."
- "Compara la morosidad de consumo de X contra Y y Z en el último año."

**Datos**
- Reporte: `IF012`, `IF012_1..4` (morosidad total y por segmento), `SB029`–`SB032` (cobertura por segmento), `SB028` (cobertura de refinanciada), `IF007`, `IF008`, `IF009` (por vencer, no devenga, vencida), `P1_Provisiones`, `P2_Provisiones`, `P4_Castigados`, `A1_Moro`, `@14` (cartera neta).
- Estructura de cartera por segmento: `GET /api/cuadros/EFI07?entidad=&credito=` (solo si piden un segmento concreto).
- Si `segmento_credito` viene lleno, se filtran los códigos `_1`/`_2`/`_3`/`_4` del segmento pedido.

**Estructura del PDF:** mapa de calor de morosidad por segmento y mes, tabla de cobertura, evolución de castigos, y una sección de "morosidad aparente frente a real" (morosidad + castigos de 12 meses).

**Reglas para el LLM:** una baja de morosidad acompañada de un alza de castigos (`P4_Castigados`) **no** es mejora, es limpieza de cartera. Hay que decirlo explícitamente.

---

## 3. Liquidez, fondeo y volatilidad de depósitos

**Quién lo pide:** tesorería, ALCO, riesgos de liquidez.
**Pregunta de fondo:** ¿la entidad resiste una salida de depósitos? ¿su fondeo está concentrado a corto plazo?

**Prompts típicos**
- "Informe de liquidez de X para el comité ALCO de este mes."
- "¿Cómo está el calce entre depósitos a plazo y cartera? Quiero la estructura de plazos."
- "Analiza la volatilidad de depósitos de X y dime si los fondos disponibles la cubren."
- "Liquidez de X frente a los bancos pequeños."

**Datos**
- Reporte: `IF006` (fondos disponibles / depósitos a corto plazo), `Indic_liqui`, `L2_moderado`, `L3_severo`, `L4_liquidez`, `L1_Prov_Inc`, `Cart_Depo` (intermediación), `@2101`, `@2103`, `@210135` (vista, plazo, ahorro), `Plazo30`, `Plazo61`, `Plazo91`, `Plazo121`, `Plazo181`, `Plazo361`, y las cuentas de turbulencia (`perc75_turb` y afines de la hoja de turbulencia).

**Estructura del PDF:** indicadores de liquidez de primera y segunda línea, estructura de depósitos por plazo (barras apiladas), intermediación, volatilidad/turbulencia frente a disponibles y conclusión.

**Reglas para el LLM:** si `Cart_Depo` es mayor a 100 % y los depósitos de 30 a 90 días crecen, advertir **presión de liquidez estructural**. Nunca recomendar montos concretos de inversión.

---

## 4. Rentabilidad y eficiencia operativa

**Quién lo pide:** gerencia financiera, consejo de administración (en época de presupuesto).
**Pregunta de fondo:** ¿de dónde sale la utilidad y qué se la está comiendo?

**Prompts típicos**
- "¿Por qué bajó el ROE de X este año? Hazme un informe."
- "Informe de eficiencia: gastos operativos frente a margen financiero de X."
- "Descompón la rentabilidad de X: margen, gastos, provisiones."
- "Quiero la rentabilidad de X comparada con sus pares de la misma provincia."

**Datos**
- Reporte: `IF002` (ROA), `IF004` (ROE), `Mar_Inte`, `Mar_Br_Fi`, `Mar_Ne_Fina`, `Marg_Ne`, `Gan_Pe_Imp`, `Gan_Eje`, `gast_operacion` (gasto operativo / margen), `gasto_personal`, `gast_oper_ac`, `marg_int_ac`, `marg_int_pas`, `M1_Grado_absor_marge_finan`, `Efici_opera`, `Efici_negoc`, `@4A`, `@5A`.

**Estructura del PDF:** cascada del estado de resultados (ingresos → margen bruto → margen neto → utilidad), un DuPont simplificado (margen × rotación × apalancamiento), la eficiencia y los factores que movieron el resultado.

**Reglas para el LLM:** si el grado de absorción es mayor a 100 %, la operación no se paga con el margen: **alerta**. Explicar cada cambio en el ROE con máximo tres factores ordenados por impacto.

---

## 5. Benchmarking frente a pares (comparativo entre entidades)

**Quién lo pide:** gerencia y consejo. Es el informe **más pedido** en asesoría: "¿cómo estoy frente a mis competidores?"

**Prompts típicos**
- "Compara X con Y, Z y W en morosidad, liquidez, solvencia y ROE."
- "Ponme frente a mis tres competidores más cercanos en tamaño."
- "¿En qué indicadores estamos peor que el promedio del segmento 2?"
- "Informe comparativo de X frente a las cooperativas de Loja."

**Datos**
- Pares explícitos: `GET /api/entidades/series?ids=principal,p1,p2,p3&codigos=IF012,SB029,IF006,SB025,IF002,IF004,gast_operacion,Cart_Depo`
- Pares implícitos ("mis competidores"): `GET /api/rankings?cuenta=@1&fecha=&agrupacion=sector&entidad=` y se toman las tres entidades más cercanas por posición. No se usa el LLM para elegirlas.
- **Máximo 4 entidades** (límite de la API). Si el usuario pide más, el agente lo explica y ofrece agrupar.

**Estructura del PDF:** una tabla de 8 indicadores × 4 entidades con la mejor y la peor marcadas, un radar normalizado, fortalezas y debilidades relativas, y la brecha frente al mejor par.

**Reglas para el LLM:** normalizar el sentido de cada indicador (en morosidad "menor es mejor", en ROE "mayor es mejor") **antes** de pasarlo al modelo, con un campo `mejor_si: "alto" | "bajo"` en la ficha.

---

## 6. Posicionamiento de mercado y rankings

**Quién lo pide:** gerencia comercial, marketing, consejo.

**Prompts típicos**
- "¿En qué puesto estamos en activos dentro de los bancos pequeños?"
- "Ranking de cartera neta de las cooperativas de Azuay a julio, y dónde está X."
- "¿Ganamos o perdimos participación de mercado en colocaciones en el último año?"
- "Top 10 del segmento 1 por depósitos."

**Datos**
- `GET /api/rankings?cuenta={@1|@2|@14|monto_total|mop}&fecha=&agrupacion={sector|activos|provincia|todas}&entidad=`
- Al LLM solo le llegan las 10 primeras filas, la fila de la entidad y ±2 posiciones alrededor. Nunca la tabla completa.

**Estructura del PDF:** posición actual frente a hace 12 meses, participación (anterior y actual), barras de las 10 primeras, y la variación de cuota frente al crecimiento del grupo.

**Reglas para el LLM:** distinguir "creció" de "ganó cuota": una entidad puede crecer 10 % y perder participación si el grupo creció 15 %.

---

## 7. Semáforo CAMELS / PERLAS y alertas tempranas

**Quién lo pide:** riesgos, auditoría interna, consejo de vigilancia y organismos de integración.

**Prompts típicos**
- "Dame el semáforo CAMELS de X a junio."
- "Evaluación PERLAS de COAC X con alertas."
- "¿Qué componentes CAMELS se deterioraron en los últimos seis meses?"
- "Alertas tempranas de X: solo lo que esté en rojo."

**Datos**
- CAMELS: `Indic_CAMELS_1`, `C1_1`, `A1_1`, `M1_1`, `E1_1`, `L1_1`, y los subindicadores `A2_Inter_credi`, `A3_Calid_credi`, `A4_Cober_credi`, `E1_ROA`, `E4_ROE`, `E6_Margen_Spread`, `IVF_Cuantitativo`.
- PERLAS: `perlas`, `perlas_acumulado`, `efic_perlas_acum`, P (`P1_Provisiones`, `P2_Provisiones`, `P4_Castigados`, `P6_Solvencia`), E (`E1_Cartera` … `E9_Capital_Neto`), R (`R1_Cartera` … `R13_ROE`), L (`L1_Prov_Inc`, `L2_Reservas`, `L3_Improductivos`), A (`A1_Moro`, `A2_Act_Imp`, `A3_Capi_neto`), S (`S1_Crec_14` … `S9_Cre_Activos`).
- Si piden "solo alertas", n8n filtra **antes** del LLM y le pasa únicamente los indicadores en amarillo o rojo.

**Estructura del PDF:** calificación global, semáforo por componente, los cinco mayores deterioros de 6 meses y un plan de acción sugerido por componente.

---

## 8. La entidad en su contexto: sistema, sector y entorno macro

**Quién lo pide:** consejo y asamblea; informes anuales y planificación estratégica.

**Prompts típicos**
- "¿Cómo le fue a X frente al sistema cooperativo este año?"
- "Crecimiento de activos y cartera de X frente al segmento 1 y el sistema nacional."
- "Dame un contexto macro y del sistema financiero para el informe anual del consejo."
- "¿X creció más o menos que su sector?"

**Datos**
- Sectores: `GET /api/sistema/series?codigos=@1,@2,@3,Gan_Eje&sectores=nacional,{segmento de la entidad}`
- Cartera del sistema: `GET /api/cuadros/CAR01?sector=&credito=total` (solo totales).
- Macro (opcional, solo si lo piden): `GET /api/cuadros/{IEA…|IEM…}` con 3 o 4 series clave (PIB, inflación, desempleo). Hay que definir una lista blanca de cuadros macro, porque el catálogo es grande.
- Entidad: `@1`, `@2`, `@3`, `@14`, `Gan_Eje`.

**Estructura del PDF:** entorno macro (media página), el sistema y el segmento, la entidad frente a su segmento (crecimientos) y lecturas para la planificación.

---

## 9. Colocaciones, tasas y suficiencia del precio (pricing de riesgo)

**Quién lo pide:** gerencia de negocios, crédito, ALCO. Es un informe con mucho valor de asesoría, porque responde si la entidad **cobra lo suficiente** por el riesgo que asume.

**Prompts típicos**
- "¿La tasa de microcrédito de X cubre el costo de fondeo, el riesgo y el gasto operativo?"
- "Informe de colocaciones del último año: montos, número de operaciones y participación por producto."
- "Descompón la tasa de consumo de X: fondeo, riesgo de crédito, gasto operativo y costo de capital."
- "¿Qué producto de crédito es el más rentable para X?"

**Datos**
- Operaciones: `monto_total`, `ope_total`, `monto_pro`, `num_cons`, `num_mic`, `num_in`, `num_cor`, `moa_mic`, `moa_cor`, `part_proc`, `part_empr`, `part_pyme`, `partmon_cons`, `pro_MOP`.
- Descomposición de la tasa por segmento: `CF_*` (costo de fondeo), `RC_*` (riesgo de crédito), `GO_*` (gasto operativo), `CK_*` (costo de capital), las tasas `t_*`, y el rendimiento de cartera `SB036`–`SB038`.
- Tasas del sistema como referencia: `GET /api/cuadros/TEA02?entidad=&credito=` y `TEA01?sector=&credito=`.

**Estructura del PDF:** dinámica de colocaciones, mezcla por producto, una cascada de la tasa por producto (fondeo + riesgo + operación + capital = tasa mínima frente a la tasa cobrada), y los productos con margen negativo o ajustado.

**Reglas para el LLM:** si la tasa cobrada es menor que la suma de sus componentes, el producto **destruye valor**. Nunca sugerir superar la tasa máxima regulada: solo señalar la brecha.

---

## 10. Resumen ejecutivo mensual para el consejo (una página)

**Quién lo pide:** gerente general, cada mes, para el consejo de administración. Es el informe más **recurrente**, así que conviene programarlo en n8n (Schedule Trigger).

**Prompts típicos**
- "Hazme el resumen ejecutivo del mes de X para el consejo."
- "Informe de una página con lo más importante de julio de X."
- "¿Qué cambió en X este mes? Solo lo relevante, en PDF."
- "Mándame todos los meses el resumen de X."

**Datos:** una ficha con 12 indicadores fijos: `@1`, `@14`, `@2`, `@3`, `Gan_Eje`, `IF012`, `SB029` (o cobertura total), `IF006`, `SB025`, `IF002`, `IF004`, `gast_operacion`, más la posición en el ranking de activos (`/rankings?cuenta=@1&agrupacion=sector`).

**Estructura del PDF:** 12 tarjetas KPI (valor, variación mensual, variación anual, flecha), tres hallazgos, dos alertas y una recomendación. **Límite duro:** una página y unos 250 palabras de narrativa.

**Ahorro:** es el informe más barato. Si se programa, la ficha se precalcula y el LLM solo redacta de 200 a 300 tokens de salida.

---

## 11. Particularidades que el agente debe saber manejar (modificadores)

Los usuarios casi nunca piden el informe "limpio": le añaden un giro. El router lo captura en `enfoque` y se
traduce en filtros deterministas, no en más contexto para el LLM.

| El usuario dice | Qué hace el agente |
|---|---|
| "solo microcrédito / consumo…" | Filtra los códigos `_n` del segmento y usa `credito=` en EFI07–09 |
| "frente al año pasado" / "interanual" | Usa `var_a` y el corte menos 12 meses; no manda la serie completa |
| "desde 2023" | Pasa `desde=2023-01` y usa puntos trimestrales o anuales en lugar de mensuales |
| "frente a mis pares" / "competidores" | Aplica la regla de pares del informe 5 |
| "de la provincia de…" | `agrupacion=provincia` o `/entidades?provincia=` |
| "para el consejo" | Tono ejecutivo, sin jerga, máximo dos páginas |
| "para auditoría" / "para riesgos" | Más detalle técnico, fórmulas y anexos de tabla |
| "solo lo que está mal" | Filtra en n8n los indicadores en amarillo o rojo antes del LLM |
| "cruza X con Y" (p. ej. morosidad frente a crecimiento de cartera) | Ficha de correlación: dos series de 12 puntos y un coeficiente calculado en Code |

---

## 12. Límites del agente (qué debe responder que no)

- No da recomendaciones de inversión ni califica la entidad como "segura / insegura" ante terceros: describe indicadores y tendencias.
- No inventa datos. Si falta un código o un período, lo dice en el PDF ("dato no disponible para el corte").
- No compara más de 4 entidades en series (límite de la API): ofrece usar un ranking.
- Todo informe lleva en el pie la fuente, la fecha de corte y la leyenda "los umbrales son referenciales".
