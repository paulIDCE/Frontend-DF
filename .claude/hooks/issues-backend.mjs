#!/usr/bin/env node
/**
 * Hook: obliga a revisar los issues del plan (fases 2-6) cuando llega informacion nueva, sobre
 * todo del backend. Lo usan dos eventos (.claude/settings.json):
 *
 * - PostToolUse (Edit|Write): si se edito un archivo ligado al backend o al plan, inyecta la
 *   instruccion de ejecutar la skill `actualizar-issues` antes de terminar el turno.
 * - UserPromptSubmit: si el mensaje del usuario trae novedades del backend (endpoint, contrato,
 *   BackendDF, API...) o de negocio/datos, inyecta el mismo recordatorio.
 *
 * No bloquea nada: solo agrega contexto. Si algo falla, sale en silencio (exit 0).
 */

import { readFileSync } from "node:fs";

/** Archivos cuyo cambio implica revisar issues. */
const ARCHIVOS = [
  /docs\/backend\//i,
  /docs\/analisis\/0[4-9]_/i,
  /src\/services\/apiDatos\.ts$/i,
  /src\/services\/adaptadores\.ts$/i,
  /src\/types\/api\.ts$/i,
  /src\/modulos\/Analisis\/catalogoIndicadores\.ts$/i,
  /src\/modulos\/Analisis\/diagnostico\/reglas\.json$/i,
  /public\/config\/routes\.json$/i,
];

/** Palabras que indican informacion nueva relevante para los issues. */
const TEMAS =
  /\b(backend|backenddf|endpoint|endpoints|\/api\/|api\s*\.net|contrato|swagger|benchmarks?|catalogos?\/indicadores|sistema\/indicador|rankings?|pipeline|proceso en r|fuente nueva|seps|superintendencia|negocio (aprob|valid|confirm)|validad[oa] por negocio|umbral(es)?)\b/i;

const MENSAJE =
  "OBLIGATORIO (regla del proyecto): hay informacion nueva que puede afectar los issues del plan de integracion " +
  "(paulIDCE/Frontend-DF, fases 2-6, issues #2-#39). Antes de terminar este turno ejecuta la skill `actualizar-issues`: " +
  "identifica los items afectados (tabla de la skill), comenta en cada issue lo nuevo con su fuente, marca los criterios " +
  "cumplidos, ajusta etiquetas y, si algo no estaba cubierto, crea el issue y agregalo a su epica. No cierres issues sin " +
  "evidencia ni sin confirmar con el usuario. Si nada aplica, dilo explicitamente en la respuesta.";

const salir = () => process.exit(0);

let entrada;
try {
  entrada = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  salir();
}

const evento = entrada.hook_event_name;
let aplica = false;
let detalle = "";

if (evento === "PostToolUse") {
  const ruta = String(entrada.tool_input?.file_path ?? entrada.tool_response?.filePath ?? "").replace(/\\/g, "/");
  aplica = ARCHIVOS.some((re) => re.test(ruta));
  detalle = aplica ? ` Archivo modificado: ${ruta}.` : "";
} else if (evento === "UserPromptSubmit") {
  aplica = TEMAS.test(String(entrada.prompt ?? ""));
  detalle = aplica ? " El mensaje del usuario menciona backend, API, fuentes o decisiones de negocio." : "";
}

if (!aplica) salir();

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: evento, additionalContext: MENSAJE + detalle },
  }),
);
salir();
