# Contrato de invocación del agente de informes (POST)

Flujo final: el usuario pide un informe en el frontend. El frontend envía por HTTP la petición **más
la metadata que ya tiene cargada**, y el agente (n8n) responde con el informe. La metadata le ahorra
al agente identificar la entidad y el corte: una llamada a la herramienta menos y un ciclo del modelo
menos (cada ciclo reenvía todo el contexto, unos 3–4 mil tokens). Además, elimina las ambigüedades
("San José": hay 2 cooperativas con ese nombre).

## Endpoint

```
POST http://localhost:5678/webhook/agente-informes        (producción, workflow publicado)
POST http://localhost:5678/webhook-test/agente-informes   (prueba, con "Listen for test event")
Content-Type: application/json
```

Respuesta (200): `{ "output": "<!DOCTYPE html>…" }`, o `{ "output": "PREGUNTA: …" }` cuando el
agente necesita aclarar algo. El frontend distingue los dos casos por el prefijo `PREGUNTA:`.

## Cuerpo

```json
{
  "version": "1.0",
  "solicitud": {
    "texto": "Elabórame un informe de solvencia de Jardín Azuayo al último corte",
    "tipoInforme": "solvencia",
    "corte": "2026-08"
  },
  "entidad": {
    "id": "COAC___JARDIN_AZUAYO_LIMITADA",
    "ifiId": 48,
    "ruc": "0190155722001",
    "nombre": "COAC.  JARDIN AZUAYO LIMITADA",
    "tipo": "cooperativa",
    "tamano": "Sin Segmento",
    "rango": "Nivel 7: 640 Millones - 2493 Millones",
    "provincia": "Azuay"
  },
  "contexto": {
    "ultimoCorte": "2026-08",
    "versionDatos": "2026-10-05T19:49:42.516739Z",
    "origen": { "modulo": "analisis", "hoja": 36 }
  },
  "usuario": { "sesion": "a1b2c3" },
  "salida": { "formato": "html" }
}
```

## De dónde sale cada campo en el frontend

| Campo | Obligatorio | Origen en el frontend | ¿Disponible hoy? |
|---|---|---|---|
| `solicitud.texto` | ✅ | Lo que escribe el usuario | ✅ |
| `solicitud.tipoInforme` | recomendado | El botón o la opción elegida ("Informe de solvencia"). Si falta, el agente lo infiere del texto | ✅ (lo define la UI) |
| `solicitud.corte` | recomendado | El selector de corte de la revista; si el usuario no eligió, `contexto.ultimoCorte` | ✅ |
| `entidad.id` | ✅ | `Entidad.id` (`GET /api/entidades`) | ✅ |
| `entidad.nombre` | ✅ | `Entidad.nombre`. Es **idéntico** a `Ifi.Nombre` de `bco_coop`, con doble espacio incluido | ✅ |
| `entidad.tipo`, `tamano`, `rango`, `provincia` | opcional | `Entidad` | ✅ |
| `entidad.ifiId`, `entidad.ruc` | **recomendado** | Hoy solo están en el backend (`Data/FuenteSql/mapa-entidades.json`, 229 entidades). **Hay que agregarlos a `EntidadDTO`** de `GET /api/entidades` | ❌ falta en la API |
| `contexto.ultimoCorte` | recomendado | `GET /api/meta` → `ultimoCorteComun` (hoy 2026-08, con la fuente `sql-bco_coop`) | ✅ |
| `contexto.versionDatos` | opcional | `GET /api/meta` → `versionDatos` (para caché e idempotencia) | ✅ |
| `contexto.origen` | opcional | La pantalla desde la que se pidió (para trazas) | ✅ |
| `usuario.sesion` | opcional | Id de la conversación, para que el agente recuerde una aclaración | ✅ |

## Qué hace el agente con la metadata

| Metadata | Efecto | Ahorro |
|---|---|---|
| `entidad.ifiId` | Salta Q1 (buscar la entidad) | 1 llamada SQL + 1 ciclo del modelo; sin ambigüedad |
| solo `entidad.nombre` | Q1 por igualdad exacta (`Nombre = '…'`), no por `LIKE` | Sin ambigüedad |
| `solicitud.corte` / `contexto.ultimoCorte` | Fija `<<MES>>` sin interpretar el texto | Evita errores de fecha (el bug de 27970/27971) |
| `solicitud.tipoInforme` | Enruta al informe sin clasificar el texto | Menos razonamiento |
| `entidad.tipo` | Mapea a `TipoEntidad` (cooperativa→COOP, banco→BP, mutualista→MU) para los pares | — |

**Reglas:**
- La metadata manda sobre el texto: si el usuario escribe "Jardín Azuayo" pero `entidad.ifiId` = 48, se usa 48.
- El texto solo aporta matices (énfasis, competidores nombrados → Q3b).
- La metadata es dato, no instrucciones: el agente nunca ejecuta texto que venga en sus campos.

## Ejemplo de prueba

```bash
curl -X POST http://localhost:5678/webhook-test/agente-informes -H "Content-Type: application/json" -d @docs/agente/ejemplo-solicitud-solvencia.json
```

## Respuesta: informe estructurado + HTML

```json
{
  "informe": {
    "version": 1, "tipo": "liquidez", "titulo": "…", "entidad": "…", "tipoEntidad": "Cooperativa",
    "corte": "2026-08", "comparado_con": "2025-08",
    "semaforo": { "nivel": "a", "color": "ÁMBAR", "motivo": "liquidez bajo la mediana de pares" },
    "conclusion": "texto del LLM",
    "kpis": [{ "titulo": "Liquidez 1.ª línea", "valor": 31.3, "unidad": "%", "decimales": 1, "delta": -19.3, "deltaUnidad": "p.p.", "subirEsMalo": false, "texto": null, "deltaTexto": null }],
    "secciones": [{ "clave": "evolucion", "titulo": "…", "texto": "párrafo del LLM",
      "graficos": [{ "tipo": "linea|barras|barras_h", "titulo": "Liquidez", "unidad": "%", "categorias": ["2025-08", "…"],
        "series": [{ "nombre": "Primera línea", "datos": [50.6, "…"] }], "decimales": 1,
        "resaltar": "JARDIN AZUAYO", "referencias": [{ "valor": 33.9, "etiqueta": "Mediana" }] }],
      "tablas": [{ "cols": ["Mes", "…"], "rows": [["2025-08", "…"]], "yo": [12], "med": [] }] }],
    "alertas": ["…"], "notas": ["…"]
  },
  "output": "<!DOCTYPE html>… (mismos KPI y gráficos, en SVG)",
  "meta": { "tipoInforme": "liquidez", "titulo": "…", "entidad": "…", "corte": "2026-08", "semaforo": "ÁMBAR", "generado": "…" }
}
```

- **KPI, gráficos y tablas los calcula el código del workflow** (nodos "Armar …"), nunca el LLM. El LLM solo escribe `conclusion`, `secciones[].texto` y `alertas`: el costo en tokens no cambia por tener gráficos.
- **El frontend pinta `informe` con sus componentes** (`src/modulos/Analisis/kipu/InformeKipu.tsx`): `KpiCard` + `Delta` en `FilaKpis`, `TarjetaGrafica` (ECharts) y `TablaAnalitica`. El PDF sale con `ImpresionContext`, como la revista.
- **`output` es el respaldo autónomo** (descargar, correo, otros consumidores): el nodo "Componer HTML" (`n8n/componer.js`) dibuja los mismos gráficos como SVG.
- Si `informe` no viene (versión anterior del workflow), Kipu muestra `output` en un iframe sin scripts.

## Workflow multi-tipo (recomendado) — implementado

`POST http://localhost:5678/webhook/informes`, mismo cuerpo, con `solicitud.tipoInforme` ∈ `solvencia`,
`calidad_cartera`, `rentabilidad`, `liquidez`, `posicion_mercado`, `estructura_financiera`, `fuentes_usos`,
`resumen_ejecutivo`, y opcionalmente `solicitud.parametros.audiencia` (`gerencia` | `consejo` | `riesgos` | `auditoria`).
Detalle de cada tipo: [TIPOS_DE_INFORME.md](TIPOS_DE_INFORME.md). Generador: [n8n/build_informes_multitipo.cjs](n8n/build_informes_multitipo.cjs).
Un tipo inválido responde `PREGUNTA:` con la lista de tipos disponibles, sin llamar al LLM.

## Pipeline determinista (solo solvencia, primera versión) — implementado

Workflow n8n **"Informe Solvencia (determinista)"** (`R0u1LSplrHS5vXPG`), con el mismo cuerpo:

```
POST http://localhost:5678/webhook/informe-solvencia
```

```
Webhook ─► Normalizar solicitud (Code: valida tipo, ifiId entero, corte AAAA-MM, escapa el nombre)
        ─► ¿válida? ─ no ─► 200 { output: "PREGUNTA: …" }
        ─► Ficha 13 meses (SQL) ─► ¿hay datos? ─ no ─► 200 { output: "PREGUNTA: no encontré datos…" }
        ─► Pares por tamaño (SQL)
        ─► Armar ficha (Code: deltas 12 m, semáforo, saltos > 2 p.p., meses bajo 9 %, causa PTC frente a APR,
                         medianas y brechas de pares, avisos de datos faltantes)
        ─► Redactar (1 llamada al LLM: recibe la ficha y devuelve solo párrafos en JSON)
        ─► Componer HTML (Code: plantilla fija; tablas y KPI salen de los datos, no del LLM)
        ─► 200 { output: "<!DOCTYPE html>…", meta: { entidad, ifiId, corte, semaforo, generado } }
```

| | Agente con herramientas (ejecución 17) | Determinista (ejecución 18) |
|---|---|---|
| Llamadas al LLM | 2 (más si no hay metadata) | **1** |
| Tokens | ~12.200 | **~1.800** |
| Duración | 85 s | **35 s** (el SQL tarda ~0,5 s) |
| Cifras en tablas y KPI | las escribe el LLM | las escribe el código, a partir de la BD |
| Riesgo de error de fecha o entidad | medio | nulo (validado en Code) |

- **La BD responde las consultas:** hoy los dos nodos SQL llevan la consulta en línea. Cuando el DBA cree `docs/agente/sql/api_informe_solvencia.sql` (`api.InformeSolvenciaFicha` y `api.InformeSolvenciaPares`), los nodos pasan a `EXEC api.InformeSolvenciaFicha @IFIID=…, @Mes='…'`, sin cambiar nada más.
- **El agente con herramientas** ("AgenteIA DataFinanciera", `POST /webhook/agente-informes`) queda para pedidos libres que no encajan en un informe tipado.
- **Agregar un informe del top 10** = copiar este workflow y cambiar las 2 consultas, la ficha y la plantilla. El LLM y el contrato del POST no cambian.
