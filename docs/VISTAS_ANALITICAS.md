# Vistas analíticas — `src/shared/analitica`

> **Estándar del ecosistema para gráficas, dashboards y reportes analíticos.**
> Nació al rediseñar vistas analíticas sin DevExtreme y se extrajo al kit cuando otros sistemas
> necesitaron lo mismo. **`TarjetaGrafica` es la forma oficial de pintar una gráfica**: no se usa
> `ReactECharts` suelto ni el `toolbox` de ECharts.

Ejemplos vivos en la home del kit:
- pestaña **Gráficos** → `src/guia/graficos/` (ejemplos con su código, playground y API de `TarjetaGrafica`, `MiniGrafica` + `RejillaGraficas`, `opcionesMatrizCalor` y las ayudas de opciones);
- pestaña **Vista analítica** → `src/demos/VistaAnaliticaDemo.tsx` (vista completa: filtros, KPIs,
  pestañas, tabla, Excel y estado de error). **Es la plantilla a copiar.**
- pestaña **Cards** → `src/demos/KpiCardsDemo.tsx` (variantes de `KpiCard` + `FilaKpis` y cuándo usarlas, §5);
- pestaña **Tablas y Datos** → `src/demos/TablaAnaliticaDemo.tsx` (`TablaAnalitica` frente a `CrudTable`, §6);
- pestaña **Navegación** → `src/demos/AlternarVistaDemo.tsx` (`AlternarTablaGrafica` y qué control de navegación usar, §6.1);
- pestaña **Detalle** → `src/demos/BloqueDetalleDemo.tsx` (`BloqueDetalle`, `Dato` y `FichaDatos`, §6.3).

Datos de ejemplo en `src/mocks/analitica.ts`.

---

## 1. Qué hay en `shared/`

Todo se importa desde el barril `@/shared/analitica`, salvo los archivos sueltos de `shared/`.

| Pieza | Para qué |
|---|---|
| `VistaAnalitica` | Contenedor: `ConfigProvider` en español con `TEMA_ANALITICA`, tarjeta blanca y barra de filtros fija. Publica `altoBarra` por contexto (`useAltoBarra`); como función, `children` también lo recibe |
| `PanelAcoplado` | Tabla o matriz densa protagonista: se acopla bajo la barra con la rueda y hace scroll por dentro con todo el alto (§2.1). Hook: `usePanelAcoplado` |
| `TabsAnaliticas` | Pestañas con `destroyOnHidden`, cada una dentro de `LimiteError`; `activa` / `onCambiar` para cambiar de pestaña desde fuera (un resumen que abre su detalle en otra pestaña) |
| `SeccionesColapsables` + `useSeccionesAbiertas` | Secciones apiladas que se abren y cierran (antd `Collapse` estándar), cada una en `LimiteError`; `abrir(key)` abre y desplaza (§6.2) |
| `LimiteError` | Error boundary **por sección** con "Reintentar" (una gráfica rota no tumba la vista) |
| `PantallaInicial` | Lo que se ve antes del primer Filtrar |
| `FranjaSelectores` | Grupos de `Segmented` rotulados (DIMENSIÓN · VISTA) |
| `AlternarTablaGrafica` | Franja VISTA [Tabla / Gráfica] + el contenido que cambia; acciones comunes y solo de tabla (§6.1) |
| `BarraFiltros` | Carcasa del estándar de filtros (§3) |
| `useFiltrosBorrador` | Estado borrador / aplicado, cambios sin aplicar, chips |
| `SelectorRangoCortes`, `FiltroCatalogo` | Desde/Hasta sobre cortes y filtros de catálogo |
| `validacion.ts` | `validarEntero`, `validarRangoCortes`, `validarCatalogoCortes`, `resultadoValidacion`, `primerError`, `mismosFiltros` |
| `TarjetaGrafica` | Marco de toda gráfica (§4) |
| `opcionesMatrizCalor` | Heatmap de dos ejes ordinales; se pinta en `TarjetaGrafica` |
| `TablaDatosModal` | "Ver datos" de una gráfica |
| `RejillaGraficas` + `MiniGrafica` | Varias gráficas iguales, una por elemento (oficina, destino…), montadas una sola vez (§4.1) |
| `opcionesBase.ts` | `punto`, `zoomTemporal`, `inicioZoom`, `tooltipTemporal`, `franjasNiveles`, `maximoEjeConNiveles`, `estiloUmbral` |
| `TablaAnalitica` | antd `Table` con los valores del estándar (§6) y cabecera fija bajo la barra dentro de `VistaAnalitica` |
| `BloqueDetalle`, `Dato`, `FichaDatos` | Bloques y pares etiqueta/valor de un panel de detalle (§6.3) |
| `SelectorColumnas` + `useColumnasVisibles` | Columnas visibles de una `Table` |
| `celdas.tsx` | `TituloAyuda`, `CeldaMoneda`, `CeldaSaldoVariacion`, `CeldaNivel`, `CLASE_COLUMNA_ACTIVA` |
| `exportarExcel` | Excel multihoja / padre-hijo con las mismas columnas que la tabla |
| `FilaKpis` | Rejilla de KPIs (4 por fila en `lg`) con esqueletos mientras carga |
| `Delta`, `COLOR_KPI`, `colorLegible` | Variaciones ▲▼ y colores de KPIs (con `components/charts/KpiCard`) |
| `nivelDe`, `COLOR_SIN_DATOS` | Nivel de riesgo de un valor en % |
| `formato.ts` | `fmtMoneda`, `fmtMonedaCorta`, `fmtPct`, `fmtEntero`, `fmtFecha`, `fmtFechaID`, `fechaDetalleID`, `fmtFechaCompacta` |
| `shared/EstadoError` + `shared/primerApiError` | Aviso cuando **el backend falló** (distinto de "no hay datos") |
| `shared/loading`, `loadingSmallCharts`, `skeletonCustom`, `ellipsisCell`, `modalFullScreen` | Estados de carga de sección, celdas truncadas con tooltip, pantalla completa |

Dependencias fuera de `shared/`:
`components/charts/{StatsOverlayChart,StatsOverlayChartTiny,KpiCard}`, `utils/{MathOperation,formatter,colors,apiError}`, `types/nivelRiesgo`.

### Cuándo usar cada pieza parecida

| Caso | Usar |
|---|---|
| Error que tumba toda la app | `components/ErrorBoundary` |
| Error al pintar una sección o pestaña | `LimiteError` (ya viene en `TabsAnaliticas` y `SeccionesColapsables`) |
| El backend respondió con error | `EstadoError` con el `apiError` de `useService` |
| Carga de la app completa | `components/LoadingScreen` |
| Carga de una sección / gráfica | `shared/loading`, `loadingSmallCharts` o `cargando` de `TarjetaGrafica` |
| Excel de un CRUD (una hoja) | `useExcelExport` |
| Excel de una vista analítica (varias hojas, padre-hijo, formatos) | `exportarExcel` |
| Catálogo con alta / edición / baja por fila | `components/CrudTable` |
| Datos de solo lectura con indicadores, totales y columnas elegibles | `TablaAnalitica` |
| Mismos datos, dos lecturas (ranking vs. valor exacto) | `AlternarTablaGrafica` |
| Contenidos o consultas distintos, uno a la vez | `TabsAnaliticas` |
| Varias secciones que se ven a la vez, pudiendo ocultar alguna | `SeccionesColapsables` |
| Tabla solo para revisar los números de una gráfica | "Ver datos" de `TarjetaGrafica` + `TablaDatosModal` |
| La misma gráfica repetida por cada oficina / destino / origen | `RejillaGraficas` + `MiniGrafica` |
| Panel de detalle de una fila o un punto (drawer o modal) | `BloqueDetalle` + `Dato` / `FichaDatos` |
| Par etiqueta / valor | `Dato` (**no** `Descriptions` de antd) |
| Una sola gráfica pequeña (p. ej. en una fila de 3) | `TarjetaGrafica compacta` |
| Matriz F×I / cuadrante (color por celda + conteo) | `opcionesMatrizCalor` + `TarjetaGrafica` |
| CRUD denso (código/contacto bajo el nombre) | `IdentityCell` — no `CeldaSaldoVariacion` |
| 3+ catálogos cortos por fila | `AtributosCell` |
| Lista CRUD (filtros + CTA) | `BarraListado` — no `BarraFiltros` |

### Una sola fuente: el paquete

Los sistemas instalan `@idce/kit`; **no** copian `src/shared/` a su repo. Una copia local diverge en
cuanto el kit arregla algo (tokens, antd 6, pantalla completa, interop con Node) y deja de recibir
los arreglos. Si un sistema necesita un cambio, se pide al kit ([ADOPCION.md §6](ADOPCION.md)).

Convenciones internas de estos archivos, a respetar al cambiarlos:
- Imports con alias `@/` en lugar de relativos.
- **Colores, tamaños, radios y sombras desde `src/design/tokens.ts`** (ver [TOKENS.md](TOKENS.md)), no hex sueltos: `TEMA_ANALITICA`, `COLOR_KPI` (`monto`/`riesgo`/`bueno`/`malo`/`neutro`), `COLOR_SIN_DATOS`, `opcionesBase` (`TEXTO_GRAFICA`, umbrales), `KpiCard`, `Delta` y las clases de todos los componentes. La cabecera Excel sale de `excelCabecera` (no `process.env.REACT_APP_*`, que no existe en Vite).
- `exceljs` con `import()` dinámico (no entra al bundle inicial), y los `default` de paquetes CommonJS con `interopDefault` (`utils/interop.ts`): sin eso el barrel no carga en Node (Vitest, SSR).
- APIs de antd 6 (`Alert title`, `Tooltip styles.root`, `Card variant`) y utilidades de Tailwind 4 (`shrink-0`, `grow`, `!absolute`).
- Descargas con `ExcelButton` / `PdfButton` (`components/DownloadButtons`), nunca botones propios.
---

## 2. Área de dibujo y contenedor

- Las apps se sirven en un iframe dentro del shell SSO. Área útil ≈ **1264 × 569 px**. Probar siempre a ese tamaño.
- Presupuesto vertical sin scroll (escala de 14 px, ver [TOKENS.md §3](TOKENS.md)), medido en la demo con la tarjeta a 1232 px: relleno 16 · barra de filtros 41 · KPIs 168 · pestañas 54 · **primera gráfica ≈ 252 (`alto={200}` + cabecera)**; termina en 564 px de los 569 útiles. Una gráfica más alta obliga a scroll.
- A 1264 px aplica `lg` (1024), **no** `xl` (1280): usar `lg:` para lo que debe verse en laptop.
- Sin scroll horizontal de página (`scrollWidth === clientWidth`).
- Lo secundario (tablas, detalle) va debajo con scroll de página. `TablaAnalitica` fija su cabecera bajo la barra por sí sola (lee `altoBarra` del contexto); con una `Table` suelta, `sticky={{ offsetHeader: useAltoBarra() ?? 0 }}`.

```tsx
<VistaAnalitica barra={<BarraFiltros … />} modales={<DetalleModal … />}>
  {!aplicado ? <PantallaInicial … /> : <><Kpis /><TabsAnaliticas … /></>}
</VistaAnalitica>
```

### 2.1 Una tabla o matriz densa como protagonista: `PanelAcoplado`

Con KPIs y pestañas encima, una matriz a 569 px se queda en ~240 px. `PanelAcoplado` la acopla bajo
la barra: al bajar con la rueda sobre el panel, la página se desplaza primero hasta dejar el bloque
justo debajo de la barra fija (KPIs y pestañas fuera de pantalla) y después el panel hace scroll por
dentro con todo el alto de la ventana. Al subir, el encadenado nativo del navegador devuelve los KPIs.

```tsx
<PanelAcoplado encima={<LeyendaNiveles />}>          // margen={12} altoMinimo={240} por defecto
  {(alto) => (
    <TablaAnalitica pagination={false} scroll={{ x: "max-content", y: alto - 32 }} … />
    // o: <div className="overflow-auto" style={{ maxHeight: alto }}>…</div>
  )}
</PanelAcoplado>
```

- `alto` = alto visible − barra − `encima` − 2 · margen, nunca menos de `altoMinimo`. Se recalcula
  cuando cambia la barra (avisos, chips), lo de encima o la ventana. A `scroll.y` de una tabla hay
  que descontarle la cabecera (32 px con `size="small"`).
- Solo acopla si la rueda cae sobre algo con scroll propio que **desborda** (el cuerpo de la tabla, el
  `div` con `overflow-auto`). Si el panel no desborda, la página se desplaza como siempre.
- No toca `Ctrl` + rueda (zoom), el desplazamiento horizontal ni la rueda sobre `encima`. La rueda
  por líneas (`deltaMode 1`) se convierte a píxeles.
- Dentro del panel, `TablaAnalitica` no fija su cabecera bajo la barra: ya tiene su propio scroll.
- La pantalla completa de `TarjetaGrafica` y los modales quedan fuera.
- Con marcado propio: `usePanelAcoplado(refDelBloque, { margen, altoMinimo })` devuelve el `alto`;
  el panel dentro del bloque se marca con `data-panel-acoplado` para descontar lo que tiene encima.
- Demo: Vista analítica → pestaña **Matriz**.

---

## 3. Estándar de filtros

```
[Título] [Desde ▾] [Hasta ▾] [Días ▢] [Filtros (n)] [🔍 Filtrar]              [Selector global]
 ⚠ error · ⓘ avisos · "Los datos mostrados no reflejan los cambios… Aplicar | Descartar"
 Filtros aplicados: [Oficina: MATRIZ ×]   (a qué partes de la vista aplican)
```

- **Obligatorios visibles** (fechas, días, parámetro principal) con `prefix` ("Desde", "Hasta").
- **Opcionales en el popover** "Filtros" con badge y "Limpiar"; cada uno con `FiltroCatalogo`.
- **Selector global** (p. ej. Normal/Ajustada) a la derecha: aplicación inmediata, no pasa por Filtrar.
- **Chips** cerrables de los opcionales aplicados: cerrar uno re-consulta sin él.

### Borrador vs aplicado
- `borrador`: lo que el usuario edita. `aplicado`: lo último consultado, `null` hasta el primer Filtrar (se ve `PantallaInicial`). **Nada se consulta antes de Filtrar**, salvo catálogos.
- Las consultas corren en un `useEffect([aplicado])` con argumentos explícitos (`execute(...)`).
- `hayCambiosSinAplicar` compara por valor/ID (`mismosFiltros`), no con `JSON.stringify`.
- En una vista real, el estado vive en un hook `use<Vista>`: **la página no llama servicios directamente**.

### Validación (funciones puras)
`validar(borrador)` devuelve `resultadoValidacion(errores, avisos)`. **Errores bloquean; avisos informan.**

| Caso | Tipo | Tratamiento |
|---|---|---|
| Desde posterior a Hasta | error | Opciones imposibles deshabilitadas en origen; si ocurre, `status="error"` |
| Fecha sin elegir / catálogo vacío | error | Filtrar deshabilitado, motivo en tooltip |
| Número vacío, decimal o fuera de rango | error | **Vacío = `null`**, nunca 0 en silencio |
| Un solo corte | aviso | "no habrá evolución ni variación" |
| Rango amplio (> 36 cortes) | aviso | "la consulta puede tardar" |

- `Enter` en un input llama al mismo `filtrar()` (`controles` como función lo recibe).
- Si un filtro afecta solo a parte de la vista, decirlo en el popover, en `notaChips` y con la `etiqueta` "Toda la cartera" en las pestañas no afectadas.

---

## 4. Gráficas: `TarjetaGrafica`

```tsx
<TarjetaGrafica
  titulo="Evolución de la mora"
  subtitulo="Franjas por nivel · clic en un punto para ver el detalle"
  option={opcionesMora(datos)}          // null → "Sin datos para el periodo"
  cargando={consultando}
  alto={260}
  etiquetas={{ activas, alternar }}      // opcional: botón de etiquetas
  onVerDatos={() => setVerDatos(true)}   // opcional: botón "Ver datos" → TablaDatosModal (siempre con Excel)
  porcentajes={{ activos, alternar }}    // opcional: % / valores (la vista rearma option)
  cambioTipo                             // opcional: barras ↔ líneas (lo resuelve la tarjeta)
  onDescargarDatos={descargar}           // opcional: ExcelButton con exportarExcel
  onClickPunto={(e) => abrirDetalle(e.data[2])}
  extra={<Segmented … />}                // controles propios, también en pantalla completa
  pie={<LeyendaNiveles />}
  compacta                               // gráfica pequeña suelta (una serie de iguales → §4.1)
  estadisticas={false}                   // opcional: sin botón de estadísticas (matriz, pie, treemap…)
  opcionPantallaCompleta={(o) => …}      // opcional: la pantalla completa muestra más que la tarjeta
  seleccionRango={{ desde, hasta, onCambiar }} // opcional: periodo (eje time, ms) o { modo: "zoom", ejes }
/>
```

- La barra antd trae **estadísticas, etiquetas, porcentajes / valores, barras ↔ líneas, ver datos, restablecer zoom, imagen PNG, descargar datos y pantalla completa**. **No usar el `toolbox` de ECharts**: se monta sobre la leyenda y no tiene tooltips legibles.
- **Heatmap / matriz de dos ejes:** `opcionesMatrizCalor({ celdas, ejesX, ejesY })` y se pasa
  a `TarjetaGrafica.option`, con `estadisticas={false}` (no son una serie de valores). Color **por celda**, no `visualMap`. Título y subtítulo en la
  tarjeta. Demo: pestaña **Gráficos**. No usar para preview de configuración ni para
  tablas HTML de cruce área × tipo.
- **Regla: "Ver datos" siempre lleva la descarga en Excel.** `TablaDatosModal` exige `onDescargar`
  (con `exportarExcel` y las mismas columnas de la tabla) y muestra el `ExcelButton` "Descargar
  Excel", deshabilitado si no hay filas. No hay "Ver datos" de solo lectura, tampoco en mini gráficas.
- Equivalencias con el `toolbox` de ECharts (lo que se encuentra al migrar una gráfica):

  | `toolbox` de ECharts | `TarjetaGrafica` |
  |---|---|
  | `myStats` | automático |
  | `myActiveLabel` | `etiquetas={{ activas, alternar }}` |
  | `myPercents` | `porcentajes={{ activos, alternar }}`: la vista rearma `option` con la serie en % o en valores |
  | `myToggleChartType`, `magicType` | `cambioTipo` (+ `onCambiarTipo` si la vista necesita saberlo): cambia el `type` de las series de barras o líneas, también en pantalla completa |
  | `dataView` | `onVerDatos` + `TablaDatosModal` |
  | `myExportCSV`, `myDowloadData` | `onDescargarDatos` con `exportarExcel` (mismas columnas que "Ver datos") |
  | `restore` | automático cuando la opción tiene `dataZoom` |
  | `saveAsImage` | automático |
  | `myFullScreen` | automático |
  | botones propios del dominio (`my*`) | un `Segmented` en `extra` |
- La pantalla completa repite la misma cabecera (título, `extra`, opciones) sobre su propia instancia.
- **Pantalla completa con más que la tarjeta:** `opcionPantallaCompleta` (una opción, o una función
  que recibe el `option` de la tarjeta). Sirve cuando la tarjeta muestra menos de lo que se lee en
  grande: series apagadas, etiquetas más pequeñas o sin slider. Tokens, barras ↔ líneas y etiquetas
  se aplican también a ella. "Restablecer zoom" y barras ↔ líneas se deciden con la opción de cada
  modo: si solo la pantalla completa tiene `dataZoom`, solo ella muestra "Restablecer zoom".
  No usar `media` + `baseOption` de ECharts para esto: con `baseOption` se pierden la paleta y la
  tipografía de la tarjeta, y también "Restablecer zoom".
- **Selección de un rango arrastrando sobre la gráfica** (`seleccionRango`), en dos modos:
  - **Periodo** (`{ desde, hasta, onCambiar }`, sin `modo`): controlado, en ms, solo con
    `xAxis.type: "time"`. El rango vuelve a la vista, que lo usa para sus filtros o para
    compartirlo: varias gráficas con el mismo `rango` y los selectores de fecha quedan sincronizados.
    La franja se ajusta así:
    - **asas laterales:** extienden solo el inicio o solo el fin;
    - **asa superior:** mueve la franja entera sin cambiar su ancho;
    - **arrastrando la franja:** también se mueve;
    - **arrastrando fuera de la franja:** empieza una nueva;
    - **teclado:** flechas sobre un asa (paso del 2 %; Mayús + flecha, 10 %).

    `onCambiar` avisa al soltar. Un clic sin arrastre no avisa y la franja se queda. Si un extremo
    queda fuera de lo visible (zoom), su asa no se muestra.
  - **Zoom** (`{ modo: "zoom", ejes: "x" | "y" | "xy" }`, `"x"` por defecto): el rango elegido
    acota la gráfica y no avisa a la vista. `"x"` y `"y"` se seleccionan con una franja; `"xy"`, con
    un rectángulo. Sirve para cualquier gráfica cartesiana (eje `time`, `category` o `value`). Se
    puede seguir acotando dentro de lo acotado; "Restablecer zoom" (aparece solo) vuelve al inicio.
    Un cambio de `option` también lo reinicia. La tarjeta y su pantalla completa comparten el zoom:
    se puede agrandar la gráfica para seleccionar mejor y, al cerrar, la tarjeta queda acotada igual.
  - En los dos modos la pantalla completa se comporta igual, el `dataZoom` `inside` deja de
    arrastrar (la rueda sigue haciendo zoom) y "Restablecer zoom" conserva el periodo.
  - Con un eje que no admite el modo, la tarjeta avisa en consola y lo ignora.

  ```tsx
  seleccionRango={{ desde, hasta, onCambiar: (d, h) => setRango({ desde: d, hasta: h }) }} // periodo
  seleccionRango={{ modo: "zoom", ejes: "xy" }}                                          // zoom
  ```
- Las opciones de ECharts van en **funciones puras** (`opciones*.ts`) que reciben datos ya normalizados; el componente solo maneja layout y estado.
- En cada serie, `unitType: "percent" | "money"` hace que las estadísticas formateen bien. Los datos deben ser números o tuplas (no `{ value }`) para que las estadísticas los lean.
- **Series temporales:** puntos `punto(fecha, valor)` = `[fechaISO, valor, yyyyMMdd]`, eje `time`, `zoomTemporal(inicioZoom(n))` (arranca en los últimos ~24 cortes), `tooltipTemporal`.
- Etiquetas de valor apagadas por defecto; el último valor con `endLabel`.
- **Niveles de riesgo:** `franjasNiveles(niveles)` + `maximoEjeConNiveles` para que la franja 0–100 no aplaste la serie. Celdas sin dato en gris `COLOR_SIN_DATOS`.
- **Umbral** (cobertura ≥ 100 %): `estiloUmbral({ umbral })`. **No** `visualMap` por tramos en líneas con nulos: rompe `getVisualGradient`.
- **Treemap:** `leafDepth: 1`; color de texto por contraste con `isDark`.
- **Heatmap:** ECharts 6 exige `visualMap` (puede ir `show: false`). `opcionesMatrizCalor` ya lo trae, así que funciona igual en 5 y en 6 (verificado con 6.1.0, también en pantalla completa). Un heatmap armado a mano en un sistema con ECharts 6 tiene que llevarlo. La guía sigue en ECharts 5 (el mínimo del peer) por el anclaje de `echarts-for-react` (CONVENCIONES §2).
- Lienzo con `overflow-x-auto overflow-y-hidden`: con solo `overflow-x-auto` el eje Y queda en `auto` y los dos scrollbars se sostienen entre sí (la leyenda quedaba cortada en pantalla completa). `anchoMinimo` sigue dando scroll horizontal.

### 4.1 Varias gráficas iguales: `RejillaGraficas` + `MiniGrafica`

Para la misma gráfica repetida por elemento: una por oficina, por destino, por origen o por celda
de una matriz.

```tsx
<RejillaGraficas columnasMaximas={4}>          // anchoMinimo={220} por defecto
  {oficinas.map((o) => (
    <MiniGrafica
      key={o.oficinaID}
      titulo={o.nombre}
      option={opciones.get(o.oficinaID) ?? null} // null → "Sin datos"
      error={fallos[o.oficinaID]}                // null + error → "No se pudo cargar"
      cargando={consultando}
      onVerDatos={() => setDatosDe(o)}           // opcional: "Ver datos" en pantalla completa
      opcionPantallaCompleta={ampliar}           // opcional: en grande, más de lo que cabe a 200 px
      nombreImagen={`recuperacion_${o.nombre}`}
    />
  ))}
</RejillaGraficas>
```

- **`MiniGrafica` es `TarjetaGrafica`** (`compacta` + `barra="mini"`): en la tarjeta solo **etiquetas
  y pantalla completa**, lo que suele pedir una mini gráfica; en pantalla
  completa aparece la barra entera (estadísticas, etiquetas, **ver datos** con `onVerDatos`, imagen).
  Alto 200 px.
- **La pantalla completa puede mostrar más que la mini** con `opcionPantallaCompleta` (§4): p. ej.
  la mini pinta solo las series elegidas y en grande entran todas, o solo la grande lleva slider.
  El botón de etiquetas de la mini actúa también sobre esa opción.
- "Ver datos": **un solo** `TablaDatosModal` en la vista que guarda qué elemento está abierto; se
  apila encima de la pantalla completa (`useStackedOverlayProps`). Un `Modal` propio que la vista
  abra desde ahí necesita lo mismo, o queda detrás. Como todo "Ver datos", con `onDescargar`
  (Excel del elemento abierto).
- El nombre del elemento va en la **cabecera** de la tarjeta, no flotando sobre el lienzo
  (antipatrón: `absolute left-3 top-2 … bg-white/80`, con letra de 9 px fuera de la escala).
- Las etiquetas las maneja la mini gráfica: cambia `label.show` de las series y respeta el resto
  (formato, posición). Definir `label.formatter` en la opción y dejar `show` fuera. Si la vista
  rearma la opción o apaga las de toda la rejilla con un solo botón, pasar `etiquetas` controlado.
- **La rejilla se pinta una sola vez.** Mide su contenedor: si caben 2 o más columnas de
  `anchoMinimo`, reparte el ancho (hasta `columnasMaximas`); si cabe una, pasa a una fila con
  scroll horizontal.
- **No usar el par `block xl:hidden overflow-x-auto` + `hidden xl:grid xl:grid-cols-N`:**
  - monta cada gráfica dos veces (la oculta se inicializa con tamaño 0);
  - `xl` (1280 px) mira la ventana: dentro del iframe del SSO (≈1264 px) nunca se veía la rejilla.
- Muchas rejillas en una vista: meterlas en `SeccionesColapsables` con `destruirAlCerrar` para no
  mantener vivas las gráficas de las secciones cerradas.

---

## 5. KPIs

Demo con guía de uso: pestaña **Cards** (`src/demos/KpiCardsDemo.tsx`).

```tsx
<FilaKpis cargando={consultando}>                {/* columnas={3|5|6} si la vista lo pide; 4 por defecto */}
  <KpiCard titulo="Índice de mora" valor={fmtPct(mora)} color={nivel?.color ?? "neutro"}
    valorSecundario={<Delta valor={mora - moraAnterior} sufijo=" pp" etiqueta="vs. corte anterior" subirEsMalo />} />
  <KpiCard titulo="Saldo" valor={fmtMonedaCorta(saldo)} color="monto" … />
</FilaKpis>
```

- `KpiCard` dentro de `FilaKpis` (esqueletos con la misma rejilla mientras carga). No armar la fila a mano.
- **`FilaKpis columnas`**: 4 por fila en laptop por defecto (2 en tablet, 1 en móvil). Se puede pedir 3, 5 o 6; más de 5 a 1264 px deja tarjetas de menos de 200 px y los montos largos no caben.
- **Usar** para las cifras de cabecera de la vista. **No usar** para listas de valores (→ tabla) ni para agrupar contenido o configuración (→ `Card` de antd).
- **`color`** es un **rol**: `"monto"` (serie 1), `"riesgo"` (advertencia), `"bueno"` / `"malo"` (éxito / error) contra una meta, `"neutro"` sin dato; también `"accion"`, `"exito"`… Un **color propio** solo si viene del dato (el de un nivel de riesgo): `KpiCard` lo oscurece solo si no se lee sobre blanco, ya no hace falta `colorLegible`. `COLOR_KPI` sigue existiendo y da los mismos valores.
- Variaciones con `Delta`: `subirEsMalo` para mora/riesgo, y **siempre** la base ("vs. corte anterior", "mes", "año").

---

## 6. Tablas

Demo con guía de uso: pestaña **Tablas y Datos** (`src/demos/TablaAnaliticaDemo.tsx`), junto al CRUD.

- `TablaAnalitica` ya trae `size="small"`, `scroll={{ x: "max-content" }}`, paginación `size: "small"` con `hideOnSinglePage`, la cabecera fija bajo la barra y el tooltip de orden solo sobre las flechas (`showSorterTooltip={{ target: "sorter-icon" }}`, para que no se solape con la ayuda de `TituloAyuda`). Falta poner la primera columna con `fixed: "left"`.
- **`TablaAnalitica` vs `CrudTable`:** la analítica es de solo lectura (indicadores, totales ponderados, columnas elegibles, Excel multihoja). Los catálogos con alta / edición / baja por fila van en `CrudTable` con `ActionButtons` y `useExcelExport`. No mezclar botones de edición en una tabla analítica.
- **CRUD denso:** `IdentityCell` (nombre + meta etiquetada) no es `CeldaSaldoVariacion`.
  La celda analítica apila números; la de identidad apila código/contacto. Demo:
  pestaña **Tablas y Datos**.
- Columnas definidas una vez; visibilidad con `SelectorColumnas` + `useColumnasVisibles(todas, ocultasIniciales)`.
- Cabeceras cortas con `TituloAyuda`; montos con `CeldaMoneda` / `CeldaSaldoVariacion` (variaciones en **fracción** relativa); porcentajes por nivel con `CeldaNivel`.
- `rowKey` estable (`_clave` generada al preparar los datos). **Nunca el índice.**
- `Table.Summary` con totales sobre **todas** las filas; tasas totales **ponderadas** (Σnumerador / Σdenominador).
- Resaltar solo la celda relevante, no la fila entera.
- Excel con `exportarExcel(nombre, hojas)` usando las mismas definiciones de columnas; botón `<ExcelButton size="small" />` (verde, `components/DownloadButtons`) deshabilitado sin filas. PDF, si existe, con `PdfButton` (rojo).

### 6.1 Tabla / Gráfica: `AlternarTablaGrafica`

Demo con guía de uso: pestaña **Navegación** (`src/demos/AlternarVistaDemo.tsx`).

```tsx
<AlternarTablaGrafica
  vista={vista} onCambiarVista={setVista}                         // controlado: TabsAnaliticas desmonta la pestaña oculta
  grupos={[{ rotulo: "Dimensión", control: <Segmented … /> }]}    // opcional
  accionesTabla={<SelectorColumnas … />}                          // solo en modo Tabla
  acciones={<ExcelButton size="small" onClick={descargar} />}       // en ambos modos
  reemplazo={apiError && <EstadoError error={apiError} />}        // sustituye a los dos modos
  tabla={<TablaAnalitica … />}
  grafica={<TarjetaGrafica … />}
/>
```

| Situación | Control |
|---|---|
| Mismos datos, dos lecturas: comparar / ranking (gráfica) o valor exacto / exportar (tabla) | `AlternarTablaGrafica` |
| Contenidos o consultas distintos (Evolución · Por oficina) | `TabsAnaliticas` |
| La gráfica es lo principal y la tabla solo sirve para revisar los números | "Ver datos" (`onVerDatos` + `TablaDatosModal`) |
| Cambiar la agrupación del mismo dato | grupo DIMENSIÓN (`grupos`) |
| Serie temporal larga | gráfica sola con zoom |
| Pocas cifras (< 4) | KPIs |

- Los dos modos deben mostrar **los mismos datos y filtros**; si no, son pestañas.
- Lo que solo afecta a la tabla (`SelectorColumnas`) va en `accionesTabla`: sobre la gráfica no hace nada y confundía.

### 6.2 Secciones colapsables: `SeccionesColapsables`

Demo con guía de uso: pestaña **Navegación** (`src/demos/SeccionesDemo.tsx`).

```tsx
const secciones = useSeccionesAbiertas(["evolucion", "oficinas"]);   // opcional: modo controlado

<SeccionesColapsables
  abiertas={secciones.abiertas} onCambiar={secciones.setAbiertas}   // sin esto: todas abiertas
  claveReinicio={JSON.stringify(aplicado)}
  secciones={[
    {
      key: "evolucion",                                   // única en la página → id "seccion-evolucion"
      icono: <LineChartOutlined />,
      titulo: "Evolución de la mora",                     // 16 px seminegrita
      descripcion: "Índice de mora por corte",            // 12 px, opcional
      etiqueta: { texto: "Toda la cartera", ayuda: "…" }, // qué filtro no aplica
      ayuda: "Qué muestra y cómo leerla",                 // icono ? a la derecha
      extra: <ExcelButton size="small" … />,              // no abre ni cierra la sección
      contenido: <TarjetaGrafica … />,
    },
  ]}
/>
<Button onClick={() => secciones.abrir("evolucion")}>Ver evolución</Button>  // abre y desplaza
```

| Situación | Control |
|---|---|
| Varias secciones que conviene ver a la vez o recorrer con scroll | `SeccionesColapsables` |
| Contenidos alternativos, uno a la vez | `TabsAnaliticas` |
| Los mismos datos en tabla o gráfica | `AlternarTablaGrafica` |
| Muchas secciones largas y se trabaja en una | `SeccionesColapsables unaALaVez` |

- **Todas abiertas por defecto.** Cerrar de inicio solo lo secundario (`abiertasIniciales`), p. ej. metodología.
- El contenido **se conserva al cerrar** (las gráficas no se recalculan ni pierden el zoom); `destruirAlCerrar` solo si pesa mucho.
- Al desplazarse a una sección se respeta la barra de filtros fija (`scroll-margin-top` con `useAltoBarra`) y `prefers-reduced-motion`.
- No hace falta `onChange` para registrar ni iconos que crecen al pasar el mouse: la cabecera ya es un botón accesible (`role="button"`, `aria-expanded`, teclado).
- Reemplaza el antipatrón de `Collapse` con la cabecera hecha a mano, repetida archivo por archivo.

### 6.3 Panel de detalle: `BloqueDetalle`, `Dato` y `FichaDatos`

Demo con guía de uso: pestaña **Detalle** (`src/demos/BloqueDetalleDemo.tsx`). Es lo que se abre al
pinchar una fila de la tabla o un punto de una gráfica, en `Drawer` (lista larga, se sigue viendo la
tabla) o en `Modal` (ficha corta).

```tsx
<BloqueDetalle
  titulo="Resumen"
  extra={<><span className="text-cifra font-bold tabular-nums text-tinta">{fmtPct(mora)}</span><Tag …/></>}
  subtitulo="Cifras del último corte. La variación compara contra el mismo mes del año anterior."
>
  <FichaDatos columnas={4}>                     {/* 2 a 5; `enmarcada={false}` para no pintar la caja */}
    <Dato etiqueta="Saldo"><span className="tabular-nums">{fmtMoneda(saldo)}</span></Dato>
    <Dato etiqueta="Operaciones"><span className="tabular-nums">{fmtEntero(operaciones)}</span></Dato>
  </FichaDatos>

  <TablaAnalitica … />                          {/* o una gráfica, o un Empty si no hay nada */}
</BloqueDetalle>
```

- **Un bloque por tema**, todos con la misma estructura: título (`text-subtitulo` semibold), `extra`
  a la derecha (cifra grande, chips, contador) y `subtitulo` para la aclaración fija. Separación
  entre bloques: `gap: 24` en el cuerpo del drawer / modal.
- `Dato` es el par etiqueta / valor del ecosistema: etiqueta `text-rotulo` en mayúsculas, valor
  `text-cuerpo`. El valor va como `children` para darle formato (moneda, `tabular-nums`, color de
  alerta). **No usar `Descriptions` de antd**: no se usa en ningún sistema y no deja controlar el valor.
- `FichaDatos` es la rejilla de `Dato` sobre fondo hundido (la ficha de cabecera del bloque). Evita
  repetir `grid … rounded … border … p-3` en cada panel.
- Sin datos, `Empty` con `PRESENTED_IMAGE_SIMPLE` dentro del bloque, no un bloque vacío.
- Nació dentro de un panel de detalle y se extrajo cuando los demás bloques necesitaron lo mismo;
  `FichaDatos` se añadió en el kit. Un panel que aún arma los pares etiqueta / valor a mano se migra
  a `Dato`.

---

## 7. Errores de backend

`useService` normaliza el fallo con `utils/apiError` y lo expone en `apiError`:

```tsx
const datos = useService(getCartera, [], [], false, "No se pudo obtener la cartera");
const oficinas = useService(getOficinas, [], [], true, "No se pudo obtener el catálogo de oficinas");
const error = primerApiError(datos.apiError, oficinas.apiError);

{error ? <EstadoError error={error} className="min-h-[240px]" /> : <TarjetaGrafica … />}
```

- `data` en `null` + `apiError` lleno = **el backend falló**. `data: []` = **no hay datos**. Los servicios no deben tragarse el error devolviendo `[]`.
- El `traceId` solo se muestra en fallos técnicos (`SQL_ERROR`, `INTERNAL_ERROR`).

---

## 8. QA en navegador

- [ ] Pantalla inicial antes de Filtrar; nada se consulta.
- [ ] Filtrar carga KPIs y la pestaña activa, con `loading` y sin doble consulta.
- [ ] Casos límite de filtros: rango invertido, número vacío o fuera de rango, un solo corte, cambios sin aplicar con Aplicar/Descartar.
- [ ] Cada pestaña renderiza sin errores; el selector global actualiza KPIs, gráficas y tablas.
- [ ] Ver datos (**siempre con "Descargar Excel"**), Excel, imagen, estadísticas, etiquetas y **pantalla completa con las mismas opciones**.
- [ ] Tabla / Gráfica: el modo se conserva al cambiar de pestaña y el selector de columnas solo aparece en Tabla.
- [ ] Secciones: los controles de la cabecera no la abren ni cierran; `abrir(key)` deja la sección visible bajo la barra de filtros.
- [ ] Chips de opcionales: re-consulta al quitarlos y aviso de alcance.
- [ ] `EstadoError` visible cuando el servicio falla.
- [ ] A 1264×569: primera gráfica completa sin scroll y sin scroll horizontal.
- [ ] Consola sin errores ni avisos de antd (`destroyOnClose`, `rowKey` con índice, props deprecadas).

Lecciones ya pagadas:

| Síntoma | Causa | Solución |
|---|---|---|
| `Cannot read properties of undefined (reading 'coord')` | `visualMap` por tramos con puntos `null` | `estiloUmbral` |
| KPI "▲0.03 pp" con la mora bajando | Variaciones del backend en **fracción relativa** | pp restando cortes; % = fracción × 100 |
| Mismo indicador distinto entre tarjeta y tabla | Denominadores distintos | Una sola función por indicador en `utils/` del módulo |
| Celdas "Sin datos" que parecen riesgo bajo | Color del primer nivel por defecto | `COLOR_SIN_DATOS` + leyenda |
| Filtro que nunca filtra | Campo inexistente del catálogo | Verificar campos reales en la respuesta |
| Scroll horizontal de 1 px | Margen negativo en el contenedor fijo | `-mx-*` solo con padding igual en el padre |
| Contenido que se sale en laptop | Cortes `xl` con área de 1264 | Usar `lg` |
| Botón de cerrar del modal en el flujo, contenido desbordado | `.ant-btn { position: relative }` sin capa le gana a `absolute` de Tailwind 4 | `!absolute` (ver CONVENCIONES §3) |
