import type { PropApi } from "../componentes/TablaApi";

export const API_TARJETA: PropApi[] = [
  {
    nombre: "titulo",
    obligatoria: true,
    tipo: "ReactNode",
    descripcion:
      "Título de la cabecera (14 seminegrita; 12 en `compacta`). Nunca en el `title` de ECharts.",
  },
  {
    nombre: "subtitulo",
    tipo: "ReactNode",
    descripcion:
      "Línea de apoyo bajo el título. En `compacta` solo se ve en pantalla completa.",
  },
  {
    nombre: "option",
    obligatoria: true,
    tipo: "EChartsOption | null",
    descripcion:
      "Opción de ECharts. `null` pinta el estado vacío. La tarjeta añade la paleta de series y la tipografía de los tokens (la opción puede sobrescribirlas).",
  },
  {
    nombre: "alto",
    obligatoria: true,
    tipo: "number",
    descripcion:
      "Alto del lienzo en px, sin la cabecera. Con 200 cabe una fila de gráficas bajo KPIs y pestañas a 569 px.",
  },
  {
    nombre: "cargando",
    tipo: "boolean",
    porDefecto: "false",
    descripcion: "Spinner en lugar del lienzo.",
  },
  {
    nombre: "textoVacio",
    tipo: "ReactNode",
    porDefecto: '"Sin datos para el periodo"',
    descripcion: "Texto del estado vacío (`option={null}`).",
  },
  {
    nombre: "extra",
    tipo: "ReactNode",
    descripcion:
      "Controles propios de la gráfica (p. ej. un `Segmented`), a la izquierda de los botones. También en pantalla completa.",
  },
  {
    nombre: "pie",
    tipo: "ReactNode",
    descripcion: "Contenido bajo la gráfica (leyenda de niveles, fuente).",
  },
  {
    nombre: "estadisticas",
    desde: "0.11",
    tipo: "boolean",
    porDefecto: "true",
    descripcion:
      "Botón de estadísticas. `false` donde no aplican porque los datos no son una serie de valores: matriz de calor, pie, treemap, sankey, radar…",
  },
  {
    nombre: "etiquetas",
    tipo: "{ activas: boolean; alternar: () => void }",
    descripcion:
      "Botón de etiquetas de valor. Controlado: la vista rearma `option` con `label.show`.",
  },
  {
    nombre: "porcentajes",
    tipo: "{ activos: boolean; alternar: () => void }",
    descripcion: "Botón % / valores. Controlado: el cálculo es del dominio.",
  },
  {
    nombre: "cambioTipo",
    tipo: "boolean",
    porDefecto: "false",
    descripcion:
      "Botón barras ↔ líneas. Lo resuelve la tarjeta (también en pantalla completa).",
  },
  {
    nombre: "onCambiarTipo",
    tipo: '(tipo: "bar" | "line") => void',
    descripcion: "Avisa del cambio de tipo, si la vista necesita saberlo.",
  },
  {
    nombre: "onVerDatos",
    tipo: "() => void",
    descripcion:
      'Botón "Ver datos". Abrir un `TablaDatosModal` (siempre con Excel).',
  },
  {
    nombre: "onDescargarDatos",
    tipo: "() => void",
    descripcion:
      'Botón Excel de la barra. Usar `exportarExcel` con las mismas columnas que "Ver datos".',
  },
  {
    nombre: "onClickPunto",
    tipo: "(evento: any) => void",
    descripcion:
      "Clic en un punto de la serie. En series temporales, `evento.data[2]` es el `yyyyMMdd`.",
  },
  {
    nombre: "nombreImagen",
    tipo: "string",
    porDefecto: '"grafica"',
    descripcion: "Nombre del PNG que descarga el botón de imagen.",
  },
  {
    nombre: "compacta",
    tipo: "boolean",
    porDefecto: "false",
    descripcion:
      "Cabecera y botones más pequeños y estadísticas compactas: una gráfica pequeña suelta.",
  },
  {
    nombre: "barra",
    tipo: '"completa" | "mini"',
    porDefecto: '"completa"',
    descripcion:
      "`mini`: solo etiquetas y pantalla completa en la tarjeta; la barra entera aparece al agrandar. Lo usa `MiniGrafica`.",
  },
  {
    nombre: "anchoMinimo",
    tipo: "number",
    descripcion:
      "Ancho mínimo del lienzo; si no cabe, scroll horizontal (mapas de calor anchos).",
  },
  {
    nombre: "opcionPantallaCompleta",
    desde: "0.10",
    tipo: "option | ((option) => option)",
    descripcion:
      "Opción propia de la pantalla completa, cuando en grande conviene mostrar más (series, etiquetas, slider).",
  },
  {
    nombre: "seleccionRango",
    desde: "0.10",
    tipo: "SeleccionPeriodo | SeleccionZoom",
    descripcion:
      "Selección de un rango arrastrando: periodo (devuelve el rango a la vista) o zoom (acota la gráfica). Ver las dos tablas siguientes.",
  },
  {
    nombre: "className",
    tipo: "string",
    descripcion: "Clases del contenedor de la tarjeta.",
  },
];

export const API_PERIODO: PropApi[] = [
  {
    nombre: "modo",
    tipo: '"periodo"',
    porDefecto: '"periodo"',
    descripcion: "Opcional: sin `modo` es periodo (compatible con 0.10).",
  },
  {
    nombre: "desde",
    obligatoria: true,
    tipo: "number | null",
    descripcion: "Inicio en ms. `null` (o `hasta` `null`) = sin franja.",
  },
  {
    nombre: "hasta",
    obligatoria: true,
    tipo: "number | null",
    descripcion: "Fin en ms.",
  },
  {
    nombre: "onCambiar",
    obligatoria: true,
    tipo: "(desde: number, hasta: number) => void",
    descripcion:
      "Al soltar un arrastre (franja nueva, movida o extendida con las asas) o al mover un asa con el teclado.",
  },
];

export const API_ZOOM: PropApi[] = [
  {
    nombre: "modo",
    obligatoria: true,
    desde: "0.11",
    tipo: '"zoom"',
    descripcion: "Lo seleccionado acota la gráfica; no avisa a la vista.",
  },
  {
    nombre: "ejes",
    desde: "0.11",
    tipo: '"x" | "y" | "xy"',
    porDefecto: '"x"',
    descripcion: "Ejes que se acotan. `xy` selecciona un rectángulo.",
  },
];

export const API_MINI: PropApi[] = [
  {
    nombre: "titulo",
    obligatoria: true,
    tipo: "ReactNode",
    descripcion:
      "Nombre del elemento (oficina, destino, calificación…), en la cabecera.",
  },
  {
    nombre: "option",
    obligatoria: true,
    tipo: "EChartsOption | null",
    descripcion: '`null` → "Sin datos" (o "No se pudo cargar" con `error`).',
  },
  {
    nombre: "alto",
    tipo: "number",
    porDefecto: "200",
    descripcion: "Alto del lienzo.",
  },
  { nombre: "cargando", tipo: "boolean", descripcion: "Spinner." },
  {
    nombre: "error",
    tipo: "boolean",
    porDefecto: "false",
    descripcion:
      'La consulta de este elemento falló: el vacío dice "No se pudo cargar".',
  },
  {
    nombre: "estadisticas",
    desde: "0.11",
    tipo: "boolean",
    porDefecto: "true",
    descripcion:
      "Botón de estadísticas. `false` donde no aplican porque los datos no son una serie de valores: matriz de calor, pie, treemap, sankey, radar…",
  },
  {
    nombre: "etiquetas",
    tipo: "{ activas: boolean; alternar: () => void }",
    descripcion:
      "Controlado: solo si la vista rearma la opción o apaga las de toda la rejilla. Sin él, la mini maneja las suyas.",
  },
  {
    nombre: "etiquetasIniciales",
    tipo: "boolean",
    porDefecto: "false",
    descripcion: "Estado inicial de las etiquetas propias (se lee al montar).",
  },
  {
    nombre: "onVerDatos",
    tipo: "() => void",
    descripcion:
      '"Ver datos", solo en pantalla completa. Un único `TablaDatosModal` en la vista.',
  },
  {
    nombre: "onClickPunto",
    tipo: "(evento: any) => void",
    descripcion: "Como en `TarjetaGrafica`.",
  },
  {
    nombre: "opcionPantallaCompleta",
    desde: "0.10",
    tipo: "option | ((option) => option)",
    descripcion:
      "En grande, más de lo que se lee a 200 px. El botón de etiquetas actúa también sobre ella.",
  },
  { nombre: "nombreImagen", tipo: "string", descripcion: "Nombre del PNG." },
  { nombre: "className", tipo: "string", descripcion: "Clases de la tarjeta." },
];

export const API_REJILLA: PropApi[] = [
  {
    nombre: "children",
    obligatoria: true,
    tipo: "ReactNode",
    descripcion: "Normalmente `MiniGrafica`, una por elemento.",
  },
  {
    nombre: "anchoMinimo",
    tipo: "number",
    porDefecto: "220",
    descripcion:
      "Ancho mínimo de cada gráfica. Si no caben dos columnas, pasa a una fila con scroll horizontal.",
  },
  {
    nombre: "columnasMaximas",
    tipo: "number",
    descripcion: "Tope de columnas aunque quepan más.",
  },
  {
    nombre: "className",
    tipo: "string",
    descripcion: "Clases del contenedor.",
  },
];

export const API_MATRIZ: PropApi[] = [
  {
    nombre: "celdas",
    obligatoria: true,
    tipo: "CeldaMatrizCalor[]",
    descripcion:
      "`{ x, y, valor, color? }`, con `x` / `y` 1-based. El color va por celda (no `visualMap`).",
  },
  {
    nombre: "ejesX",
    obligatoria: true,
    tipo: "string[]",
    descripcion: "Rótulos del eje X, en orden.",
  },
  {
    nombre: "ejesY",
    obligatoria: true,
    tipo: "string[]",
    descripcion: "Rótulos del eje Y, en orden.",
  },
  {
    nombre: "nombreEjeX",
    tipo: "string",
    descripcion: 'Nombre del eje X (p. ej. "Frecuencia").',
  },
  {
    nombre: "nombreEjeY",
    tipo: "string",
    descripcion: 'Nombre del eje Y (p. ej. "Impacto").',
  },
  {
    nombre: "resalte",
    tipo: "{ x: number; y: number; etiqueta?: string }",
    descripcion: "Celda resaltada con borde y una marca (RI, RR…).",
  },
  {
    nombre: "etiquetaTooltip",
    tipo: "string",
    descripcion: 'Nombre del conteo en el tooltip ("Inherente").',
  },
];

export const API_AYUDAS: PropApi[] = [
  {
    nombre: "punto(fecha, valor)",
    tipo: "=> [fechaISO, valor | null, yyyyMMdd]",
    descripcion:
      "Punto de una serie temporal. El tercer elemento sirve de clave en `onClickPunto`. Con `yyyy-MM-dd`, añadir `T12:00:00`.",
  },
  {
    nombre: "zoomTemporal(inicio?, { conSlider? })",
    tipo: "=> DataZoom[]",
    descripcion:
      "Slider compacto (16 px) + zoom con la rueda desde `inicio` (%).",
  },
  {
    nombre: "inicioZoom(puntos, visibles?)",
    tipo: "=> number",
    porDefecto: "visibles = 24",
    descripcion: "Inicio del zoom para ver los últimos `visibles` cortes.",
  },
  {
    nombre: "tooltipTemporal(formato)",
    tipo: "=> TooltipOption",
    descripcion:
      "Tooltip con el mes del corte y cada serie con su valor formateado.",
  },
  {
    nombre: "franjasNiveles(niveles, { conEtiquetas? })",
    tipo: "=> { markArea }",
    descripcion:
      "Franjas de color por nivel de riesgo detrás de la serie (valores en %).",
  },
  {
    nombre: "maximoEjeConNiveles(valores, niveles)",
    tipo: "=> number",
    descripcion:
      "Máximo del eje Y para que la franja 0–100 no aplaste la serie.",
  },
  {
    nombre: "estiloUmbral({ umbral?, referencia? })",
    tipo: "=> SeriesStyle",
    porDefecto: "umbral = 100",
    descripcion:
      "Puntos verdes desde el umbral y rojos por debajo, con la referencia. No usar `visualMap` por tramos (falla con nulos).",
  },
  {
    nombre: "TEXTO_GRAFICA",
    tipo: "{ fontSize, color }",
    descripcion: "Estilo de ejes y etiquetas (11 px, tinta tenue).",
  },
  {
    nombre: "ordenarPorFecha(filas)",
    tipo: "=> filas",
    descripcion: "Ordena por `fechaCorte` sin mutar.",
  },
];
