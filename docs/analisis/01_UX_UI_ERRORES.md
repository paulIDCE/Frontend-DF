# Errores de UX/UI detectados

Revisión de la app migrada (AnalisisFinanciero) y de lo que hereda de prueba-data. Se probó en el
navegador en escritorio (1440×900), tablet (768×1024) y móvil (375×812) el 30/09/2026.

**Severidad**
- 🔴 **Alta**: impide o confunde una tarea principal.
- 🟠 **Media**: la tarea se completa, pero con fricción.
- 🟡 **Baja**: pulido visual o de consistencia.

**Origen**
- **Heredado**: ya estaba en prueba-data.
- **Migración**: lo introdujo la migración.
- **Ambos**: se arrastró y la migración no lo resolvió.

---

## 1. Transversales (toda la app)

| # | Sev. | Problema | Evidencia / dónde | Origen | Recomendación |
|---|---|---|---|---|---|
| T1 | 🔴 | **El header no es responsive.** En tablet y móvil la marca "DATA FINANCIERO" se monta sobre la navegación, los ítems ocupan media pantalla y el botón "Salir" y el nombre de usuario quedan fuera de la vista. | Móvil 375 px: el header ocupa unos 620 px de alto. Tablet: la marca queda superpuesta a "Sistema Financiero". | Ambos | Menú hamburguesa (antd `Drawer`) por debajo de `lg`, marca compacta y usuario en un dropdown. |
| T2 | 🟠 | **La barra de la revista es sticky con un `top` fijo (76 px)** calculado para el header de escritorio. Si el header crece (tablet), la barra se mete debajo. | `Revista.tsx`: `sticky top-[76px]`. | Migración | Medir la altura real del header (variable CSS o `ResizeObserver`), o que el header no sea sticky dentro de la revista. |
| T3 | 🟠 | **Terminología y nombres inconsistentes.** "Sistema Financiero" en la navegación frente a "Sistema Financiero Nacional" en las tarjetas; "Tasas de Interés" frente a "Sistema de Tasas de Interés"; "Home" en inglés en una UI en español. | Header y Dashboard. | Heredado | Un glosario único de rótulos y usar "Inicio". |
| T4 | 🟠 | **El modal de bienvenida sale en cada visita** al Dashboard, a los 500 ms, y no aporta información. | `Dashboard.tsx`. | Heredado | Mostrarlo solo la primera vez (preferencia guardada) o eliminarlo. |
| T5 | 🟡 | **Confirmaciones modales para acciones triviales.** Tras iniciar sesión aparece un SweetAlert "¡Bienvenido!" que obliga a un clic extra antes de entrar. | `Login.tsx`. | Heredado | Toast no bloqueante y redirección directa. |
| T6 | 🟡 | **El footer corporativo es muy grande en las pantallas de trabajo**: resta espacio en Macro, Sistema y Análisis. | `AppShell`. | Heredado | Footer completo solo en el Dashboard; en el resto, una línea. |
| T7 | 🟡 | **Los logos de redes sociales no tienen enlace** y usan íconos PNG de baja resolución. | Footer. | Heredado | Enlazarlos a las redes reales o quitarlos. |
| T8 | 🟡 | **El título de la pestaña del navegador no cambia de pantalla** (siempre "Data Financiero"). | `index.html`. | Migración | Poner `document.title` por ruta. |
| T9 | 🟡 | **No hay modo oscuro ni control de densidad.** Con muchas tablas numéricas, la densidad importa. | — | Ambos | Evaluar si hace falta. El kit ya tiene la variable `--densidad-ui`. |

## 2. Login

| # | Sev. | Problema | Origen | Recomendación |
|---|---|---|---|---|
| L1 | 🟠 | El registro pide un **"Password provisional" que no se usa**. Confunde y hace pensar que hay un paso de activación. | Heredado | Quitar el campo, o implementar el flujo real con el SSO propio. |
| L2 | 🟠 | **El registro está abierto a cualquiera**, en una herramienta con datos del sistema financiero. No hay aprobación ni invitación. | Heredado | Registro por invitación o desactivado, según el modelo de negocio. |
| L3 | 🟡 | Los botones de redes sociales del original (Facebook, LinkedIn, Instagram) no hacían nada; en la migración se quitaron, pero el panel sigue pensado para ellos. | Heredado | Si habrá SSO/OAuth, diseñar esos botones con su función real. |
| L4 | 🟡 | **El logo del panel azul se ve como un rectángulo blanco**: el filtro `invert` sobre un PNG sin transparencia. | Ambos | Usar un logo blanco en SVG. |
| L5 | 🟡 | En móvil desaparece el panel deslizante y solo queda un enlace de texto para pasar a "Registrarse"; se pierde la jerarquía. | Migración | Pestañas "Ingresar / Crear cuenta" en móvil. |

## 3. Explorador (Macro, Sistema, Tasas)

| # | Sev. | Problema | Origen | Recomendación |
|---|---|---|---|---|
| E1 | 🔴 | **El árbol "Contenidos" está escondido en un drawer.** Para cambiar de cuadro hay que abrirlo, navegar hasta 4 niveles y elegir; sin buscador. Macro tiene 193 cuadros. | Ambos | Buscador de cuadros (por código y título), "recientes" y árbol fijo en escritorio. |
| E2 | 🔴 | **La tabla en móvil no es usable**: las columnas Selec., Graf. y Carrito ocupan unos 220 px fijos y la variable queda cortada. | Migración | Agrupar las tres acciones en un menú por fila, o en móvil mostrar tarjetas por variable. |
| E3 | 🟠 | **Cambiar de cuadro vacía "Mi Colección" sin avisar.** El usuario pierde las series armadas. | Heredado | Conservar la colección entre cuadros (la identidad ya incluye cuadro y sector) o confirmar antes de vaciar. |
| E4 | 🟠 | **Hay dos conceptos para lo mismo: "Mi Colección" y "Carrito".** No está claro en qué se diferencian: la colección es temporal y el carrito se guarda en el navegador. | Heredado | Unificar en "Series guardadas", con una acción "Graficar". |
| E5 | 🟠 | **Sistema y Tasas: los filtros aparecen y desaparecen según el tipo de cuadro** (sector, entidad, análisis, crédito) sin explicación. Al pasar de un cuadro de sector a uno por entidad, el sector elegido "se pierde" visualmente. | Heredado | Mostrar siempre el contexto elegido (chips) y deshabilitar, no ocultar, los que no aplican. |
| E6 | 🟠 | **La gráfica de "Mi Colección" arranca con zoom en los últimos 5 puntos.** En mensual son 5 meses y el usuario no ve la serie completa. | Heredado | Mostrar el período filtrado en la tabla (Desde/Hasta) o los últimos 24 cortes. |
| E7 | 🟠 | **El filtro Desde/Hasta afecta la tabla pero no la gráfica ni la descarga** (se descargan todos los períodos). | Heredado | Un solo rango que aplique a la tabla, la gráfica y la descarga (o preguntar al descargar). |
| E8 | 🟠 | **Macro mezcla escalas de tiempo**: el "anual" viene como `YYYY-12` y se rotula "Dic 2006", lo que parece mensual. | Heredado | Rotular los anuales como "2006". |
| E9 | 🟡 | **Las celdas sin dato muestran "0,0"** cuando el origen trae 0 en lugar de null (balances: 42 % de ceros). No se distingue "cero" de "sin dato". | Datos | Ver el documento de datos; mostrar "—" cuando el dato no exista. |
| E10 | 🟡 | **Balances (SFN06/EFI06): todo colapsado.** Para llegar a una cuenta de nivel 4 hay que expandir 3 niveles; no hay "expandir todo" ni buscador. | Heredado | `BarraExpandirArbol` del kit y búsqueda por código o nombre. |
| E11 | 🟡 | **Sin estado en la URL**: el cuadro, el sector, la entidad y el período no quedan en la dirección; no se puede compartir un enlace ni volver con "atrás". | Ambos | Guardar la selección en la URL con `useSearchParams`. |
| E12 | 🟡 | **Las notas del cuadro quedan debajo de la tabla**, lejos de la vista, y suelen ser las que explican las unidades. | Heredado | Ícono "i" junto al título que abra las notas. |
| E13 | 🟡 | **Las unidades no aparecen en las celdas ni en los encabezados de columna**; solo en el subtítulo. | Heredado | Unidad en el encabezado ("Dic 2025 (MM USD)") o en un tooltip. |
| E14 | 🟡 | **Los tooltips de las gráficas usan un formato de 1 decimal para todo** (tasas, índices, millones). | Heredado | Formato según la unidad: % con 2 decimales, montos con separador de miles. |

## 4. Análisis Financiero (hub y revista)

| # | Sev. | Problema | Origen | Recomendación |
|---|---|---|---|---|
| A1 | 🔴 | **Rankings (5, 9, 24-26) y Comparativo (31): la primera carga tarda unos 10 s** (descarga los 229 reportes). Durante ese tiempo solo se ve un spinner, sin progreso. | Ambos (el original era peor) | Endpoint/archivo precalculado de rankings (ver datos). Mientras tanto, barra de progreso "n/229". |
| A2 | 🔴 | **31 hojas con navegación lineal.** El selector y los puntos son la única forma de orientarse; los 31 puntos no tienen rótulo visible y las secciones (Balance, Intermediación, Indicadores, Tasas) no se distinguen. | Heredado | Índice lateral agrupado por sección (las 5 tarjetas del hub) y breadcrumb "Sección › Hoja". |
| A3 | 🟠 | **El hub ofrece 5 "reportes" que en realidad son la misma revista.** El usuario espera documentos distintos y encuentra 31 hojas comunes. | Heredado | Presentarlos como "Ir a sección" de un solo informe, o filtrar las hojas por reporte. |
| A4 | 🟠 | **"Dashboard de Calidad" en el hub no hace nada** (tarjeta decorativa). | Heredado | Quitarla o enlazarla. |
| A4b | 🔴 | **"Datos actualizados" muestra la fecha y hora actuales del navegador**, no la fecha de corte de los datos. El usuario cree que los datos son de hoy (los reportes llegan a jul-26). Igual el Dashboard: dice "análisis en tiempo real" y los datos son archivos estáticos mensuales. | Heredado | Mostrar el último corte disponible y la fecha de generación de los datos. |
| A5 | 🟠 | **El mes elegido no siempre existe para la entidad**: hay reportes que empiezan en 2023 y el selector de año muestra años vacíos. Se deshabilitan los meses sin dato, pero no se explica por qué. | Migración | Tooltip "Sin datos para este mes" y año limitado al rango de la entidad. |
| A6 | 🟠 | **Hay textos de "Análisis Dinámico" que no se sostienen**: por ejemplo, "Turbulencia Alta" en las cuatro carteras de un banco pequeño, porque los percentiles del original se calculan sobre otra escala (P75 = 0,15 frente a valores de 3 a 150). | Heredado | Revisar con el área de negocio la metodología del índice y de los umbrales. |
| A7 | 🟠 | **Hay gráficas con mezcla de ejes difícil de leer**: barras apiladas de 6 series más una línea en el eje derecho (PyG), y 7 barras apiladas por plazo más una línea de total (hoja 23). | Heredado | Dividir en dos gráficas o usar small multiples. |
| A8 | 🟠 | **Las etiquetas de valores vienen activadas por defecto en todas las gráficas.** En los históricos mensuales se solapan. | Heredado | Desactivadas por defecto; el botón de etiquetas de cada tarjeta ya existe. |
| A9 | 🟠 | **KPIs sin contexto de unidad**: "0,1" en Ganancias puede ser millones o porcentaje. | Heredado | Sufijo de unidad en cada KPI (MM USD, %, #). |
| A10 | 🟡 | **CAMELS/PERLAS: la calificación usa letras (A-E) y colores, pero la tabla no destaca qué componente baja la nota.** | Heredado | Semáforo por componente frente a la meta. |
| A11 | 🟡 | **Comparativo (31): hasta 3 entidades, pero la lista de candidatas son 228 checkboxes** sin buscador. | Heredado | `Select` múltiple con búsqueda y límite de 3. |
| A12 | 🟡 | **Los títulos de las hojas están en mayúsculas sostenidas**, largos y a veces con erratas ("DEPÓSTIOS", "lioquidas", "PRODUCITVO", "interes"). | Heredado | Revisión editorial de todos los rótulos (ver contenido). |
| A13 | 🟡 | **"Descargar PDF" imprime las 31 hojas del tirón**, sin elegir cuáles, y el diseño de impresión no está afinado (cortes de página dentro de las tablas). | Ambos | Elegir secciones, con `@page` y `break-inside: avoid` en tarjetas. |
| A14 | 🟡 | **Los cambios de entidad o de fecha no se reflejan en la URL**: no se puede compartir "BP. X, jul-26, hoja 12". | Migración | `?entidad=&fecha=&hoja=`. |

## 5. Accesibilidad

| # | Sev. | Problema | Recomendación |
|---|---|---|---|
| X1 | 🟠 | Los puntos de navegación de la revista son botones de 10 px sin foco visible claro: área táctil insuficiente (mínimo 24 px) en tablet y móvil. | Aumentar el área o reemplazarlos por el índice lateral (A2). |
| X2 | 🟠 | Se codifica información solo con color: verde o rojo en las variaciones, colores del podio en rankings, colores de las calificaciones. Las variaciones tienen flecha, pero los rankings y el treemap no. | Añadir ícono o texto ("▲", "1.º"). |
| X3 | 🟡 | Las gráficas no tienen alternativa textual (aunque `TarjetaGrafica` ofrece "Ver datos", no se habilitó en la revista). | Pasar `onVerDatos` con la tabla de la serie. |
| X4 | 🟡 | Los emojis en los textos de análisis (📈 ⚠️ 🎯) se leen en voz alta y cambian de aspecto según el sistema operativo. | Íconos del kit con `aria-hidden`. |

---

### Prioridad sugerida
1. **Responsive del shell** (T1, T2) y **tabla en móvil** (E2): hoy la app no se puede usar fuera del escritorio.
2. **Velocidad de rankings** (A1): depende de los datos (resumen precalculado).
3. **Navegación**: buscador de cuadros (E1) e índice de la revista (A2).
4. Conceptos confusos: colección/carrito (E3, E4), reportes del hub (A3), password provisional (L1).
5. Revisión editorial y de unidades (A9, A12, E13).
