# Adoptar el kit en un sistema existente

Qué tiene que cumplir un sistema para instalar `@idce/kit`, en qué orden migrarlo, qué patrones
propios sustituye el kit y qué errores de configuración aparecen al consumirlo. Instalación y CSS
según el tipo de app: [DISTRIBUCION.md §3](DISTRIBUCION.md).

> Este documento describe **patrones**, no sistemas. Los casos concretos se detectaron al alinear
> los sistemas del ecosistema; aquí quedan como antipatrones para reconocerlos en cualquiera.

## 1. Prerrequisitos

| Requisito | Por qué | Si el sistema no lo cumple |
|---|---|---|
| **Vite** | El paquete es solo ESM con mapa `exports` | Con CRA / webpack se migra el build primero |
| **React** `^18.3.1 \|\| ^19` | Peer del kit | Subir a 18.3 como mínimo |
| **antd 6** | Peer del kit; `temaAntd` y los componentes usan su API | Migrar antd antes de instalar |
| **Tailwind 4** | Los tokens usan `@theme static` y `@source` | Con Tailwind 3 no hay tokens CSS: mientras tanto solo sirven `temaAntd` y las constantes de JS (`color`, `tipografia`…) |
| **ECharts** `^5.6 \|\| ^6` | Peer del kit | `echarts-for-react` va anclado en **3.0.2** ([CONVENCIONES §2](CONVENCIONES_FRONTEND.md)); con ECharts 6 pnpm avisa por su peer, pero pinta |
| **React Router** `^6.30 \|\| ^7` | Solo `useNavigate` y `useLocation` | — |

**Orden sugerido** (cada paso se puede entregar por separado):

1. Build a Vite.
2. antd 6.
3. Tailwind 4 con `tokens-transicion.css` (§3).
4. Instalar el kit y **reemplazar pieza por pieza** (§4), empezando por la pantalla donde la mejora
   se ve más (una rejilla de gráficas duplicada, un dashboard con KPIs a mano).
5. Cuando no quede ninguna clase por defecto de Tailwind, cambiar a `tokens.css`.

## 2. Shell o app del iframe

- El **shell** (header, menú lateral e iframe) importa `@idce/kit/shell.css`; las **apps del
  iframe**, `@idce/kit/base.css` (trae la densidad y el lienzo blanco). Nunca los dos.
- `identidad` (prussian) es solo del shell. Los estilos propios del menú y del header se quedan en
  el shell: son suyos, no del kit.
- Las rutas de breadcrumb van con `BreadcrumbProvider` / `useBreadcrumb` del kit, no con un
  contexto propio.

## 3. Tokens durante la migración

`tokens.css` **borra** la paleta y las escalas por defecto de Tailwind (`--color-*: initial`…): en
un sistema con cientos de `text-gray-500`, `bg-blue-50`, `text-sm`, `rounded-lg` o `shadow-md`, todas
dejarían de pintar a la vez. `@idce/kit/tokens-transicion.css` es el mismo archivo **sin** ese
reinicio: los roles del kit (`text-cuerpo`, `rounded-tarjeta`…) conviven con lo de Tailwind y las
vistas se migran cuando se tocan. `--spacing` sigue en 4px, así que el espaciado no cambia.

Al terminar, se cambia el import por `tokens.css`: desde ahí una clase por defecto que se cuele
simplemente no pinta, y `pnpm tokens:verificar` la señala ([TOKENS.md §7](TOKENS.md)).

## 4. Antipatrones y la pieza del kit que los sustituye

### Color y tipografía

| Antipatrón | Kit |
|---|---|
| `@theme` propio que redefine paletas que el kit ya trae | `@import "@idce/kit/tokens.css"`. Borrar el `@theme` propio: si todo se ve igual, los tokens están bien |
| `ConfigProvider` de antd sin tema (o un contexto propio con ese nombre) | `<ConfigProvider theme={temaAntd}>`. Es el cambio más visible (radios, alturas y fuentes de antd cambian a la vez): hacerlo en rama y comparar pantalla por pantalla |
| Azul escrito a mano en las vistas (`text-blue-600`, `hover:text-blue-700`, `#1677ff`) | `text-accion` / `hover:text-accion-hover` |
| Prussian dentro de una vista | `accion`: prussian es solo del shell |
| Tamaños sueltos (`text-[9px]`, `text-[11px]`, `text-sm`, `text-base`…) | Escala de roles: `text-rotulo`, `text-detalle`, `text-cuerpo`, `text-subtitulo`… Decidir por uso, no por píxel |
| Color de KPI como decoración: un hex que no significa bueno, malo, riesgo ni monto | Un rol de `COLOR_ROL` por lo que significa la cifra (`monto`, `riesgo`, `bueno`, `malo`, `neutro`). Si el KPI es una categoría que también se grafica, el color de su serie (`color.datos.series[n]`), igual que en la gráfica |
| Tokens o colores definidos en el sistema | Se piden al kit (§6). Un sistema no define su propio tamaño ni color |

### Gráficas

| Antipatrón | Kit |
|---|---|
| `ReactECharts` suelto, o dentro de una tarjeta propia (`*ChartCard`) | `TarjetaGrafica` |
| `toolbox` de ECharts con botones propios (estadísticas, etiquetas, %, barras ↔ líneas, `dataView`, exportar CSV) | La barra de `TarjetaGrafica` ([VISTAS_ANALITICAS §4](VISTAS_ANALITICAS.md), tabla de equivalencias). Pasar **solo** lo que el caso necesita; lo del dominio va en `extra` (`Segmented`) |
| La misma rejilla de mini gráficas pintada dos veces (`block xl:hidden overflow-x-auto` + `hidden xl:grid`) | `RejillaGraficas` + `MiniGrafica`: se pinta una vez y mide su contenedor |
| Rótulo flotante sobre el lienzo (`absolute left-3 top-2 … bg-white/80`, letra fuera de la escala) | La cabecera de `MiniGrafica` / `TarjetaGrafica` |
| "Ver datos" de solo lectura | `TablaDatosModal`: `onDescargar` es obligatorio, siempre con Excel |
| Un `Modal` propio que se abre desde la pantalla completa de una gráfica (detalle de un punto) sin apilar | `{...useStackedOverlayProps(open)}`: sin eso queda en z-index 1000, **detrás** de la pantalla completa |
| Heatmap de matriz (F×I, cuadrantes) armado a mano | `opcionesMatrizCalor` + `TarjetaGrafica` |
| `brush` de ECharts manejado a mano (`getInstanceByDom` sobre `.echarts-for-react`, redibujar la franja tras cada `option`) | `seleccionRango={{ desde, hasta, onCambiar }}` en `TarjetaGrafica` (eje `time`, ms), con asas para mover y extender; también en pantalla completa |
| `toolbox.feature.dataZoom` (zoom por selección) | `seleccionRango={{ modo: "zoom", ejes: "x" \| "y" \| "xy" }}` + "Restablecer zoom" de la tarjeta |
| `media` + `baseOption` para que la pantalla completa de una mini muestre más | `opcionPantallaCompleta` en `MiniGrafica` / `TarjetaGrafica`. Con `baseOption` se pierden la paleta y la tipografía de la tarjeta, y también "Restablecer zoom" |

### Vistas, tablas y detalle

| Antipatrón | Kit |
|---|---|
| `Collapse` con la cabecera hecha a mano, repetida en muchos archivos | `SeccionesColapsables` (+ `useSeccionesAbiertas`) |
| Matriz o tabla densa con `maxHeight` calculado a mano y la rueda interceptada para acoplarla bajo la barra | `PanelAcoplado` (o `usePanelAcoplado`) ([VISTAS_ANALITICAS §2.1](VISTAS_ANALITICAS.md)) |
| `showSorterTooltip={{ target: "sorter-icon" }}` en cada tabla con `TituloAyuda` | Ya viene en `TablaAnalitica` (0.9.1) |
| KPIs con `Row` / `Col` a mano | `FilaKpis` (`columnas` si no son 4) + `KpiCard` con `color` por rol |
| Pares etiqueta / valor a mano, o `Descriptions` de antd | `Dato`, `FichaDatos` y `BloqueDetalle` |
| Celda de identidad (nombre + código / contacto debajo) copiada por módulo | `IdentityCell` (meta con `{ label, value }`) |
| Chips de atributo locales | `ChipAtributo` / `AtributosCell` |
| Barra de filtros de listado con CSS propio por módulo | `BarraListado` + `CampoListado` |
| Texto truncado con tooltip hecho a mano | `EllipsisCell` / `wrapColumnTitle` |
| Árbol con chip de nivel y expandir / contraer a mano | `ChipNivel` + `BarraExpandirArbol` + `CrudTable` con `tree` |
| `CrudTable` propio para tener tree, expandable o summary | Las mismas props opcionales del `CrudTable` del kit |
| z-index de modales y drawers ajustado a mano | `FormModal`, o `useStackedOverlayProps` en un Modal / Drawer suelto |
| Botón de descarga armado a mano (`Button` + `FileExcelOutlined`, `SuccessButton`) | `ExcelButton` / `PdfButton` |
| Selector de color con parseo propio a hex | `ColorSwatch` + `valorColorHex` |
| **Copia local** de `shared/analitica` (u otra carpeta del kit) sincronizada a mano | Instalar `@idce/kit`: la copia diverge en cuanto el kit arregla algo |

## 5. Errores de configuración del consumidor

| Síntoma | Causa | Arreglo |
|---|---|---|
| Los componentes del kit salen sin estilos | Falta `@source "../node_modules/@idce/kit/dist"` en el CSS: Tailwind no genera sus clases | Añadir el `@source` ([DISTRIBUCION §3](DISTRIBUCION.md)) |
| La app no arranca en desarrollo: `does not provide an export named 'default'` (o `'ForwardRef'`, o `'saveAs'`) | `optimizeDeps: { exclude: ["@idce/kit"] }`. Vite no pre-empaqueta el kit **ni sus dependencias CommonJS** (locale de antd, `file-saver`, `echarts-for-react`…), y el navegador las recibe crudas. Si la app importa esas mismas dependencias por su cuenta, funciona **por casualidad** y se rompe con el primer import que la app no tenga | **No excluir el kit.** Tampoco hace falta con `pnpm add link:`: Vite no pre-empaqueta un paquete linkeado (su ruta real está fuera de `node_modules`) y conserva el recargado en caliente |
| Dos copias de React (`Invalid hook call`) | El kit y la app resuelven React distinto (típico con `link:`) | `resolve: { dedupe: ["react", "react-dom"] }` |
| Clases de Tailwind por defecto que dejan de pintar | Se importó `tokens.css` en un sistema que aún las usa | `tokens-transicion.css` (§3) |
| Densidad o fondo del iframe dentro del shell (o al revés) | `base.css` en el shell, o `shell.css` en una app del iframe | §2 |
| `pnpm update` no trae la versión menor nueva | En 0.x el `^` no cruza de menor: `^0.7.0` no instala 0.8.0 | Subir el rango a mano |
| Gráfica en blanco sin error en consola | `echarts-for-react` ≥ 3.0.3 | Anclar en 3.0.2 ([CONVENCIONES §2](CONVENCIONES_FRONTEND.md)) |
| Una prueba (Vitest) falla al importar el kit | Kit anterior a 0.8.3: no cargaba con el resolutor ESM de Node | Actualizar. `test.server.deps.inline: ["@idce/kit"]` ya no hace falta |

## 6. Qué se queda en el sistema y cómo pedir una pieza

Se queda en el sistema lo que es de su dominio: parseos de formatos propios, fórmulas, pivots,
asistentes, selectores específicos, carga diferida o arrastrar y soltar de un árbol concreto. El
kit no porta el CSS de un módulo ni una pieza que solo usa una pantalla.

Cuando un patrón **se repite** (en dos sistemas, o en muchas vistas de uno), se pide al kit en vez de
resolverlo localmente. Un pedido útil trae:

- **Qué resuelve**, en una frase.
- **Dónde se repite** y cuántas veces.
- **API propuesta**, en props (propias en español; las estándar de antd en inglés: `disabled`,
  `loading`, `size`…).
- **Valor por defecto**: lo que ven quienes no pasan la prop.
- **Casos borde** conocidos.
- **¿Rompe algo?** Prop opcional nueva → versión menor; arreglo sin cambio de API → parche
  ([DISTRIBUCION §5](DISTRIBUCION.md)).
