# AnalisisFinanciero — reglas para Claude

## Issues del plan de integración (obligatorio)

El avance de las fases 2 a 6 del plan (`docs/analisis/06_PLAN_INTEGRACION_POR_FASES.md`) vive en
los issues de GitHub `paulIDCE/Frontend-DF` (#2–#34 ítems, #35–#39 épicas).

- Cuando llegue **información nueva** que afecte a esos ítems —sobre todo del **backend** (BackendDF,
  endpoints, contrato de API), de **fuentes de datos** (pipeline en R, SB/SEPS) o **decisiones de
  negocio** (umbrales, fórmulas, sentido de indicadores)— ejecuta la skill **`actualizar-issues`**
  (`.claude/skills/actualizar-issues/SKILL.md`) en el mismo turno.
- Los hooks de `.claude/settings.json` lo recuerdan solos al editar `docs/backend/`, el plan,
  `src/services/apiDatos.ts`, `src/types/api.ts`, `catalogoIndicadores.ts` o `diagnostico/reglas.json`,
  y cuando el mensaje del usuario trae novedades de esos temas.
- Nunca cierres un issue ni cambies su milestone sin evidencia y sin confirmación del usuario.
