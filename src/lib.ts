/**
 * Superficie pública de `@idce/kit`.
 *
 * Es lo único que ven los sistemas que instalan el paquete. Lo que NO entra aquí es de la app de
 * demos (guía de estilos): `demos/`, `modulos/`, `auth/`, `routes/`, `services/`, `interceptors/`,
 * `mocks/` y los contextos que hablan con la API (`configContext`, `MenuPermissionsContext`).
 *
 * Al añadir una pieza al kit hay que exportarla aquí, o no llega a los demás sistemas.
 * Distribución y versionado: `docs/DISTRIBUCION.md`.
 */

/* ── Design tokens y tema ───────────────────────────────────────────────── */
export * from "./design/tokens";
export { temaAntd } from "./design/temaAntd";
export { generarCssTokens } from "./design/generarCss";
export { COLOR_ROL, resolverColor, colorTexto, estiloChip, esRolColor } from "./design/colorRol";
export type { RolColor, ColorKit } from "./design/colorRol";

/* ── Componentes base ───────────────────────────────────────────────────── */
export { default as ActionButtons } from "./components/ActionButtons";
export { default as BreadcrumbNav } from "./components/BreadcrumbNav";
export { ConfirmDialog, SimpleAlert } from "./components/ConfirmDialog";
export { default as CrudTable } from "./components/CrudTable";
export { ExcelButton, PdfButton } from "./components/DownloadButtons";
export type { DownloadButtonProps } from "./components/DownloadButtons";
export { default as EmptyState } from "./components/EmptyState";
export { default as ErrorBoundary } from "./components/ErrorBoundary";
export { default as FormModal } from "./components/FormModal";
export { default as LoadingScreen } from "./components/LoadingScreen";
export { showToast } from "./components/NotificationToast";
export { default as PageContainer } from "./components/PageContainer";
export { default as PageHeader } from "./components/PageHeader";
export { default as SearchInput } from "./components/SearchInput";
export { default as SectionHeader } from "./components/SectionHeader";
export { SolidColorButton, SuccessButton, WarningButton, GhostButton } from "./components/SemanticButtons";
export type { ButtonColors, FondoGhost } from "./components/SemanticButtons";
export { default as StatusTag } from "./components/StatusTag";
export { default as IdentityCell } from "./components/IdentityCell";
export type { IdentityMetaItem } from "./components/IdentityCell";
export { default as ChipAtributo, AtributosCell, propsColorChip } from "./components/ChipAtributo";
export type { ItemAtributo, ColorAtributo, ColorChip } from "./components/ChipAtributo";
export { default as ChipNivel, colorNivel, clavesDeArbol, PALETA_NIVEL } from "./components/ChipNivel";
export type { ColorNivel, NodoArbolBase } from "./components/ChipNivel";
export { default as BarraExpandirArbol } from "./components/BarraExpandirArbol";
export { default as BarraListado, CampoListado } from "./components/BarraListado";
export { default as ColorSwatch } from "./components/ColorSwatch";

/* ── Gráficas sueltas y estadísticas ────────────────────────────────────── */
export { default as KpiCard } from "./components/charts/KpiCard";
export { default as StatsOverlayChart } from "./components/charts/StatsOverlayChart";
export type { SerieEstadistica } from "./components/charts/StatsOverlayChart";
export { default as StatsOverlayChartTiny } from "./components/charts/StatsOverlayChartTiny";

/* ── Vistas analíticas (ver docs/VISTAS_ANALITICAS.md) ──────────────────── */
export * from "./shared/analitica";

/* ── Piezas compartidas ─────────────────────────────────────────────────── */
export { default as EstadoError } from "./shared/EstadoError";
export { default as EllipsisCell, wrapColumnTitle } from "./shared/ellipsisCell";
export { valorColorHex } from "./utils/colorPickerHex";
export { nextOverlayZIndex, overlayContainer, SWAL_Z_INDEX } from "./utils/overlayZIndex";
export { useStackedModalZIndex, useStackedOverlayProps } from "./hooks/useStackedModalZIndex";
export { default as Loading } from "./shared/loading";
export { default as LoadingSmallCharts } from "./shared/loadingSmallCharts";
export { default as ModalFullscreen } from "./shared/modalFullScreen";
export { default as SkeletonCustom } from "./shared/skeletonCustom";
export { primerApiError } from "./shared/primerApiError";

/* ── Utilidades ─────────────────────────────────────────────────────────── */
export { default as formatter } from "./utils/formatter";
export * from "./utils/apiError";
export * from "./utils/colors";
export * from "./utils/constants";
export * from "./utils/MathOperation";
export { swalAlert, swalSuccess, swalError, swalWarning, swalInfo, swalConfirm, swalConfirmDelete } from "./utils/swalAlert";
export { useExcelExport } from "./utils/useExcelExport";
export type { ExcelColumn } from "./utils/useExcelExport";
export * from "./utils/devLog";

/* ── Hooks y contextos sin dependencia de la API ────────────────────────── */
export { default as useService } from "./hooks/useService";
export { default as BreadcrumbProvider, useBreadcrumb } from "./hooks/BreadcrumbContext";
export type { BreadcrumbItem } from "./hooks/BreadcrumbContext";

/* ── Tipos de dominio compartidos ───────────────────────────────────────── */
export type { NivelRiesgo } from "./types/nivelRiesgo";
