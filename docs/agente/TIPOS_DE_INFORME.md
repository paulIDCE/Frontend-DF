# Tipos de informe del agente — catálogo objetivo

Complementa el diagrama [`workflow_objetivo_informes.png`](workflow_objetivo_informes.png): el workflow
único de informes **suponiendo que todos los datos ya están en la BD** (`idce_bco_coop`), servidos por
procedimientos almacenados del esquema `api`.

> **Estado al 2026-10-05:** 8 tipos ya funcionan con los datos que hoy tiene la BD, en el workflow n8n local
> **"Informes (determinista, multi-tipo)"** (`InfMultiTipo0001`, `POST /webhook/informes`): `solvencia`,
> `calidad_cartera`, `rentabilidad`, `liquidez`, `posicion_mercado`, `estructura_financiera`, `fuentes_usos` y
> `resumen_ejecutivo`. Se genera con [`n8n/build_informes_multitipo.cjs`](n8n/build_informes_multitipo.cjs)
> (las consultas van en línea; cuando existan los SP `api.Informe*`, cada nodo SQL pasa a `EXEC`). Costo medido:
> **1 llamada al LLM, 1,2–2,2 mil tokens y 15–27 s por informe**. Pendientes por falta de datos en la BD:
> `comparativo_pares` (solo hace falta el parámetro `pares`; los datos ya están), `alertas_camels_perlas`,
> `contexto_sistema` (macro) y `colocaciones_tasas`.

## 1. Cómo funciona el workflow objetivo

```
POST /webhook/informes  (contrato: CONTRATO_INVOCACION_AGENTE.md)
  └─ Normalizar solicitud (Code)  → valida tipoInforme, ifiId, corte (AAAA-MM), parametros
       └─ ¿válida? ── no ──► 200 { output: "PREGUNTA: …" }
            └─ Switch tipoInforme ── 12 salidas + "libre"
                 ├─ <tipo>: EXEC api.Informe<Tipo> @IFIID, @Mes, … → Armar ficha <tipo> (Code)
                 └─ libre:   Agente con herramientas (SP genéricos de solo lectura)
            └─ Unir ramas → ¿ficha con datos? ── no ──► 200 { output: "PREGUNTA: no hay datos…" }
                 └─ Redactar (1 llamada al LLM: prompt común + glosario y reglas del tipo)
                      └─ Componer HTML (plantilla del tipo) → 200 { output, meta }
```

Principios (los mismos que ya funcionan en el informe de solvencia):

1. **La BD responde**: un SP por tipo devuelve todo lo que el informe necesita, **ya agregado** (decenas de filas, nunca series crudas).
2. **El cálculo es código**: deltas, semáforos, rankings, medianas y alertas se calculan en "Armar ficha". El LLM no hace cálculos.
3. **El LLM solo redacta**: recibe la ficha (~1–1,5 mil tokens) y devuelve párrafos en JSON. Es una sola llamada por informe.
4. **Cifras desde los datos**: tablas, KPI y gráficos salen de la plantilla, no del texto del LLM.
5. **La metadata del frontend manda**: `ifiId`, `corte` y `tipoInforme` vienen resueltos. El texto del usuario solo aporta matices.

Costo objetivo por informe: **1 llamada al LLM, ~1,5–2,5 mil tokens, < 30 s**.

## 2. Contrato: campos nuevos del cuerpo

Al contrato actual se agregan `tipoInforme` (enumerado) y `parametros` (opcional según el tipo):

```json
{
  "solicitud": {
    "texto": "…",
    "tipoInforme": "calidad_cartera",
    "corte": "2026-08",
    "parametros": {
      "segmentoCredito": "microcredito",
      "pares": [41, 214, 333],
      "agrupacion": "sector",
      "horizonteMeses": 12,
      "audiencia": "consejo"
    }
  },
  "entidad": { "ifiId": 48, "nombre": "…", "tipo": "cooperativa" },
  "contexto": { "ultimoCorte": "2026-08" }
}
```

| Parámetro | Valores | Usado por |
|---|---|---|
| `segmentoCredito` | `total` (por defecto), `productivo`, `consumo`, `inmobiliario`, `microcredito`, `vivienda`, `educativo` | calidad_cartera, colocaciones_tasas |
| `pares` | hasta 4 `ifiId` (si falta: los 10 de tamaño más cercano) | comparativo_pares y la sección de pares de todos los tipos |
| `agrupacion` | `sector` (por defecto), `activos`, `provincia`, `todas` | posicion_mercado |
| `horizonteMeses` | 12 (por defecto), 24 o 36 | todos (ventana de la serie) |
| `audiencia` | `gerencia` (por defecto), `consejo`, `riesgos`, `auditoria` | redacción: tono y nivel de detalle |

## 3. Catálogo

Prioridad: **P1** = primera ola (lo más pedido en asesoría), **P2** = segunda ola, **P3** = opcional.
Umbrales: son **referenciales**. Negocio debe validarlos contra la norma SB/SEPS vigente antes de mostrarlos como "cumple / no cumple".

> **Ojo con la numeración de hojas.** En este documento "Hojas" usa el **número interno** de cada hoja
> (`src/modulos/Analisis/paginas/index.ts`, el `?hoja=` de la URL). El selector de la revista muestra
> otra cosa: la **posición en el orden de lectura** (`SECCIONES`). Kipu ya muestra la del selector y
> la calcula del índice. Equivalencias al 2026-10-06:
>
> | Interno → selector | Interno → selector | Interno → selector |
> |---|---|---|
> | 36 → 1. Resumen ejecutivo | 7 → 10. Pasivos exigibles | 35 → 20. Ranking por indicador |
> | 1 → 2. Balance general | 8 → 11. Pasivos con costo | 5 → 21. Ranking por activos |
> | 2 → 3. Evolución histórica | 12 → 12. Intermediación financiera | 9 → 22. Ranking pasivos |
> | 10 → 4. PyG mensual | 13 (y 14–16) → 13. Cartera por segmento | 24 → 23. Ranking cartera neta |
> | 11 → 5. PyG anual | 17 → 14. Índice de turbulencia | 25 → 24. Ranking MOA |
> | 34 → 6. Fuentes y usos | 27 → 15. Indicadores financieros | 26 → 25. Ranking MOP |
> | 3 → 7. Activo productivo | 28 → 16. Indicadores CAMELS - PERLAS | 31 → 26. Comparación entre entidades |
> | 4 → 8. Activos improductivos | 29 → 17. Evolución indicadores CAMELS - PERLAS | 18 → 27. Monto activas y pasivas |
> | 6 → 9. Estructura pasivo | 32 → 18. Tendencias · 33 → 19. Auditoría | 19 (y 20–22) → 28. Monto activas por segmento · 23 → 29 · 30 → 30. Tasas de interés |

### 3.1 `solvencia` — Solvencia y suficiencia patrimonial · P1 · ✅ implementado
- **Pregunta:** ¿el patrimonio técnico alcanza para el riesgo que asume la entidad?
- **Audiencia:** gerencia, comité de riesgos, consejo de vigilancia.
- **Hojas de la revista:** 27, 28, 29, 36.
- **SP:** `api.InformeSolvenciaFicha` + `api.InformeSolvenciaPares` ([sql](sql/api_informe_solvencia.sql)). En el objetivo se unifican en `api.InformeSolvencia` (2 result sets).
- **Ficha:** solvencia, PTC, PTP/PTC, activos ponderados (APR), densidad, descubierta/PTC, cobertura, resultado y ROE anualizado; deltas a 12 meses, saltos > 2 p.p., meses bajo 9 %, causa (PTC frente a APR), pares y medianas.
- **Semáforo:** rojo < 9 %; ámbar entre 9 % y 12 %, o caída > 2 p.p. en 12 meses; verde ≥ 12 % y estable.

### 3.2 `calidad_cartera` — Morosidad, cobertura y castigos por segmento · P1
- **Pregunta:** ¿dónde se deteriora la cartera y alcanzan las provisiones?
- **Audiencia:** jefe de riesgos, crédito, auditoría.
- **Hojas:** 12, 13–16, 27 (pestañas "Morosidad" y "Cobertura").
- **SP:** `api.InformeCalidadCartera @IFIID, @Mes, @Segmento`. Devuelve, por mes y segmento: cartera bruta, por vencer, no devenga, vencida, improductiva, provisiones, refinanciada y reestructurada, castigos de 12 meses, y la morosidad de los pares.
- **Ficha:** morosidad total y por segmento (actual, hace 12 meses, Δ), cobertura por segmento, morosidad ajustada por castigos, peso de la refinanciada y reestructurada, segmento con mayor deterioro y posición frente a los pares.
- **Semáforo (referencial):** morosidad > mediana de pares + 2 p.p., o cobertura < 100 % → rojo; subida > 1 p.p. en 12 meses → ámbar.
- **Regla de lectura:** si baja la morosidad y suben los castigos, **no** es mejora: es limpieza de cartera.

### 3.3 `liquidez` — Liquidez, fondeo y volatilidad de depósitos · P1
- **Pregunta:** ¿resiste una salida de depósitos? ¿el fondeo está concentrado a corto plazo?
- **Audiencia:** tesorería, ALCO.
- **Hojas:** 6, 7, 8, 17, 27 (pestaña "Liquidez").
- **SP:** `api.InformeLiquidez @IFIID, @Mes`. Devuelve: fondos disponibles, inversiones líquidas, depósitos a la vista, de ahorro y a plazo por tramo (30, 60, 90, 180, 360 días y más), obligaciones financieras, cartera/depósitos y percentiles de volatilidad (turbulencia).
- **Ficha:** liquidez de primera y de segunda línea, estructura de plazos, concentración a menos de 90 días, intermediación, volatilidad frente a fondos disponibles y tendencia.
- **Semáforo (referencial):** fondos disponibles / depósitos a corto plazo por debajo del mínimo interno → rojo; intermediación > 100 % con depósitos a corto plazo en alza → ámbar.

### 3.4 `rentabilidad` — Rentabilidad y eficiencia · P1
- **Pregunta:** ¿de dónde sale la utilidad y qué se la come?
- **Audiencia:** gerencia financiera, consejo (presupuesto).
- **Hojas:** 10, 11, 27 (pestaña "Rendimientos"), 34.
- **SP:** `api.InformeRentabilidad @IFIID, @Mes`. Devuelve: ingresos y gastos por grupo (51–56, 41–48), margen bruto, margen neto financiero, gastos de operación y de personal, provisiones, resultado; activo y patrimonio promedio.
- **Ficha:** cascada del estado de resultados, ROA, ROE, DuPont simplificado (margen × rotación × apalancamiento), grado de absorción del margen, eficiencia; los 3 factores que más movieron el ROE frente al año anterior.
- **Semáforo (referencial):** grado de absorción > 100 % → rojo; ROE < mediana de pares → ámbar.
- **Regla de lectura:** el resultado se acumula en el año (se compara contra el mismo mes del año anterior). Si ingresos y gastos son casi iguales, marcarlo "a verificar" (caso de Policía Nacional).

### 3.5 `comparativo_pares` — Benchmarking frente a competidores · P1
- **Pregunta:** ¿en qué estoy mejor o peor que mis competidores?
- **Audiencia:** gerencia y consejo.
- **Hojas:** 31, 35.
- **SP:** `api.InformeComparativo @IFIID, @Mes, @Pares` (`@Pares` NULL = los 10 de tamaño más cercano). Devuelve 8–12 indicadores clave × entidad, al corte y hace 12 meses.
- **Ficha:** matriz de indicadores × entidades con el sentido favorable aplicado (normalizada de 0 a 100), mejor y peor por indicador, brecha frente al mejor par, fortalezas y debilidades relativas.
- **Semáforo:** por indicador, cuartil frente a los pares (Q1 verde … Q4 rojo).

### 3.6 `posicion_mercado` — Rankings y cuota de mercado · P2
- **Pregunta:** ¿qué puesto ocupo y gano o pierdo participación?
- **Audiencia:** gerencia comercial, consejo.
- **Hojas:** 5, 9, 24, 25, 26, 35.
- **SP:** `api.InformeMercado @IFIID, @Mes, @Agrupacion`. Devuelve: para activos, cartera, depósitos, patrimonio y colocaciones (MOA), la posición y la participación actual y de hace 12 meses, el top 10 y ±2 posiciones alrededor de la entidad.
- **Ficha:** posición, Δ posición, cuota, Δ cuota, crecimiento propio frente al del grupo ("crecer" no es lo mismo que "ganar cuota").
- **Semáforo:** pérdida de cuota en 3 o más de 5 rubros → ámbar.

### 3.7 `alertas_camels_perlas` — Semáforo CAMELS / PERLAS y alertas tempranas · P2
- **Pregunta:** ¿qué componente se está deteriorando?
- **Audiencia:** riesgos, auditoría interna, consejo de vigilancia.
- **Hojas:** 28, 29, 33.
- **SP:** `api.InformeCamelsPerlas @IFIID, @Mes`. Devuelve los componentes CAMELS (C, A, M, E, L), los indicadores PERLAS con su meta y el IVF, al corte y en una serie de 6 meses.
- **Ficha:** calificación global, semáforo por componente, los 5 mayores deterioros de 6 meses y los indicadores fuera de meta.
- **Variante:** `parametros.soloAlertas = true` envía al LLM solo lo que está en ámbar o rojo.
- **Requisito:** las fórmulas de CAMELS y PERLAS deben estar migradas a la BD (hoy salen del proceso en R).

### 3.8 `contexto_sistema` — La entidad en su sistema y su entorno macro · P2
- **Pregunta:** ¿crecí más o menos que mi sector? ¿qué pasa en la economía?
- **Audiencia:** consejo, asamblea, planificación estratégica.
- **Hojas:** 2, módulo Macro y módulo Sistema.
- **SP:** `api.InformeContexto @IFIID, @Mes`. Devuelve el crecimiento del activo, la cartera, los depósitos y el patrimonio de la entidad, su sector y el sistema, más 4–6 series macro (PIB, inflación, desempleo, tasas de referencia).
- **Ficha:** crecimientos comparados, diferencial frente al sector y lecturas macro relevantes.
- **Requisito:** cargar en la BD los cuadros macro del BCE (hoy solo existen en JSON).

### 3.9 `colocaciones_tasas` — Colocaciones y suficiencia de la tasa · P2
- **Pregunta:** ¿la tasa que cobro cubre fondeo, riesgo, gasto operativo y capital?
- **Audiencia:** negocios, crédito, ALCO.
- **Hojas:** 18–23, 30.
- **SP:** `api.InformeColocaciones @IFIID, @Mes, @Segmento`. Devuelve el monto y número de operaciones por producto, la tasa efectiva cobrada, el costo de fondeo, el riesgo de crédito, el gasto operativo y el costo de capital por segmento, más la tasa del sistema.
- **Ficha:** dinámica de colocaciones, mezcla por producto y cascada de la tasa mínima (fondeo + riesgo + operación + capital) frente a la cobrada; los productos con margen negativo.
- **Regla:** nunca sugerir superar la tasa máxima regulada; solo señalar la brecha.

### 3.10 `resumen_ejecutivo` — Resumen mensual de una página · P1
- **Pregunta:** ¿qué cambió este mes y qué tiene que saber el consejo?
- **Audiencia:** gerente general → consejo de administración. Es recurrente: se puede programar con un Schedule Trigger.
- **Hojas:** 36.
- **SP:** `api.InformeResumen @IFIID, @Mes`. Devuelve 12 KPI fijos (activo, cartera, depósitos, patrimonio, resultado, morosidad, cobertura, liquidez, solvencia, ROA, ROE, eficiencia) con el valor actual, de hace 1 mes y de hace 12 meses, más la posición en activos.
- **Ficha:** 12 tarjetas con flecha de tendencia, los 3 hallazgos (las variaciones más grandes según su sentido favorable) y las 2 alertas.
- **Límite:** una página, unas 250 palabras. Es el más barato (~1 mil tokens).

### 3.11 `estructura_financiera` — Estructura del balance · P3
- **Pregunta:** ¿cómo está compuesto el balance y qué parte del activo no produce?
- **Hojas:** 1, 3, 4, 6, 7, 8.
- **SP:** `api.InformeEstructura @IFIID, @Mes`. Devuelve el árbol de cuentas de nivel 1–2 con análisis vertical y horizontal.
- **Ficha:** activo productivo frente a improductivo, pasivo con costo frente a sin costo, exigible, y cambios relevantes de composición.

### 3.12 `fuentes_usos` — Fuentes y usos de fondos · P3
- **Pregunta:** ¿con qué se financió el crecimiento y en qué se usó?
- **Hojas:** 34.
- **SP:** `api.InformeFuentesUsos @IFIID, @Mes, @HorizonteMeses`. Devuelve la variación de saldos por grupo entre dos cortes.
- **Ficha:** fuentes (aumentos de pasivo y patrimonio, disminuciones de activo) frente a usos, y las 5 partidas principales de cada lado.

### 3.13 `libre` — Pedido no tipificado (fallback)
- El texto del usuario no encaja en ningún tipo, o el frontend no envía `tipoInforme`.
- Va al **agente con herramientas** (workflow "AgenteIA DataFinanciera"), con acceso solo a SP genéricos de lectura (`api.ObtenerSaldosEntidad`, `api.ObtenerIndicadoresEntidad`, `api.ObtenerSaldosAgregado`). Es más caro (2–4 llamadas al LLM) y se reserva para lo excepcional.
- Si el agente detecta que el pedido sí es un tipo del catálogo, responde `PREGUNTA:` y sugiere el informe tipado.

## 4. Matriz resumen

| # | tipoInforme | Prioridad | SP | Hojas | ¿Datos en la BD hoy? |
|---|---|---|---|---|---|
| 1 | `solvencia` | P1 ✅ | `api.InformeSolvencia` | 27, 28, 29, 36 | ✅ sí (`IndicadorData` + `B11`) |
| 2 | `calidad_cartera` | P1 | `api.InformeCalidadCartera` | 12–16, 27 | 🟡 parcial: los saldos 14xx sí; castigos y segmentos por recalcular |
| 3 | `liquidez` | P1 | `api.InformeLiquidez` | 6–8, 17, 27 | 🟡 parcial: saldos sí; plazos y turbulencia no |
| 4 | `rentabilidad` | P1 | `api.InformeRentabilidad` | 10, 11, 27, 34 | 🟡 parcial: PyG sí; promedios e índices por calcular |
| 5 | `comparativo_pares` | P1 | `api.InformeComparativo` | 31, 35 | 🟡 depende de los indicadores migrados |
| 6 | `posicion_mercado` | P2 | `api.InformeMercado` | 5, 9, 24–26, 35 | ✅ saldos sí; MOA/MOP no |
| 7 | `alertas_camels_perlas` | P2 | `api.InformeCamelsPerlas` | 28, 29, 33 | ❌ fórmulas en R |
| 8 | `contexto_sistema` | P2 | `api.InformeContexto` | 2, Macro, Sistema | 🟡 sistema sí (`vSaldoAgregado`); macro no |
| 9 | `colocaciones_tasas` | P2 | `api.InformeColocaciones` | 18–23, 30 | ❌ operaciones y tasas no |
| 10 | `resumen_ejecutivo` | P1 | `api.InformeResumen` | 36 | 🟡 depende de los 12 KPI |
| 11 | `estructura_financiera` | P3 | `api.InformeEstructura` | 1, 3, 4, 6–8 | ✅ sí (`B11` + `Cuenta`) |
| 12 | `fuentes_usos` | P3 | `api.InformeFuentesUsos` | 34 | ✅ sí (`B11`) |
| — | `libre` | fallback | SP genéricos | — | ✅ |

**Orden sugerido de construcción:** solvencia ✅ → resumen_ejecutivo → calidad_cartera → rentabilidad →
estructura_financiera → comparativo_pares → liquidez → posicion_mercado → el resto, a medida que se
migren a la BD las fórmulas (CAMELS/PERLAS), las operaciones y tasas, y la macro.

## 5. Plantilla de cada rama (cómo agregar un tipo)

Cada tipo nuevo agrega **4 piezas** y no toca el resto del workflow:

| Pieza | Dónde | Contenido |
|---|---|---|
| 1. SP | BD, esquema `api` | `api.Informe<Tipo> @IFIID int, @Mes char(7), …`. Devuelve los datos agregados en 1–3 result sets, con `GRANT EXECUTE` al usuario de n8n |
| 2. Armar ficha | Nodo Code de la rama | Calcula deltas, semáforo y alertas. Devuelve `{ ficha, tablas, sem }` con la misma forma para todos los tipos |
| 3. Reglas de redacción | Tabla de configuración (Data Table de n8n o JSON) | Glosario del tipo, claves del JSON de salida y límite de palabras |
| 4. Plantilla HTML | Tabla de configuración | Secciones, tablas y KPI del tipo |

El nodo LLM y el de componer HTML son **compartidos**: leen las reglas y la plantilla del tipo desde la configuración.
