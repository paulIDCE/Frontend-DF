# Prompt de Refactorización — Identidad Visual IDCE

> **Propósito:** Este documento es un **prompt para un agente de código** (IA) que debe refactorizar proyectos existentes para alinearlos con la identidad visual del Starter Kit IDCE.  
> **Objetivo principal:** Remover **DevExtreme** por completo y migrar todos los componentes a **Ant Design 6 + Tailwind CSS 4**, unificando la paleta de color institucional y los patrones de UI.

> **⚠️ Contexto Arquitectónico — Renderizado en Iframe:**  
> El SSO (Single Sign-On) orquesta las aplicaciones dentro de un **iframe**. Esto significa que cada aplicación refactorizada se renderizará embebida en un contenedor ajeno.  
> **Consecuencia directa:** El scroll y el contenedor principal de cada página deben acoplarse correctamente al espacio del iframe para **evitar el doble scroll** (scroll dentro del iframe + scroll del SSO).  
> **Regla fundamental:** Cada página debe ocupar exactamente el alto del iframe (`height: 100%`), y el scroll debe manejarse **una sola vez** — ya sea delegándolo al SSO o controlando únicamente el scroll interno de tablas/listas sin que el contenedor principal genere su propio scroll. Este documento incluye directrices específicas en la **Sección 5 (Layout)** y **Sección 9 (CSS Global)** para garantizar esta armonía.

---

## Instrucciones para el Agente

Lee y aplica **cada sección en orden**. No te saltes pasos. Al final debe cumplirse:

1. **DevExtreme eliminado** — sin imports, sin dependencias, sin CSS residual.
2. **Tokens del kit adoptados** — `src/design/` copiado sin cambios, `<ConfigProvider theme={temaAntd}>` y **ningún valor suelto**: colores, tamaños de letra, radios y sombras por rol (`text-cuerpo`, `text-tinta-secundaria`, `rounded-contenedor`…). Seguir **[TOKENS.md §7](TOKENS.md)** y dejar `pnpm lint` (con `tokens:verificar`) en verde.
3. **Escala tipográfica del ecosistema** — 11 · 12 · 14 · 16 · 18 · 24 px por rol ([TOKENS.md §3](TOKENS.md)); nada por debajo de 11 px.
4. **Componentes reutilizables del Starter Kit** usados donde aplique.
5. **Patrones de UI consistentes** (formularios verticales, tablas con paginación, botones alineados a la derecha, etc.).

---

## 1. Stack Tecnológico (Post-Refactorización)

> Versiones alineadas con `CONVENCIONES_FRONTEND.md` §2 (la fuente de verdad
> del ecosistema). Si hay discrepancia, manda ese documento.

| Capa | Tecnología | Versión | Uso |
|------|-----------|---------|-----|
| Framework | **React 18** + TypeScript | `^18.3.1` / TS `~5.9.3` | SPA. Se mantiene React 18 por decisión explícita (ver §2 de CONVENCIONES) |
| Build | **Vite** | `^7.2.7` | Dev server y bundling; `pnpm` como gestor |
| UI Library | **Ant Design 6** | `^6.1.3` | Tablas, formularios, modales, selects, botones, layout |
| Estilos | **Tailwind CSS 4** | `^4.1.18` | Layout, colores de marca, espaciado, utilidades. Sin `tailwind.config.js`: se configura en `@theme` |
| Íconos UI | **@ant-design/icons** | `~6.1.0` | Botones, acciones, header |
| Íconos sidebar | **FontAwesome** (solid + brands) | core `^7.1.0`, react `^3.1.1` | Menú lateral dinámico (solo sidebar) |
| Alertas | **SweetAlert2** | `^11.26.17` | Confirmaciones y mensajes |
| Toasts | **react-toastify** | `^11.0.5` | Feedback rápido |
| Gráficos | **ECharts** (echarts-for-react) | echarts `^5.6.0`, wrapper `3.0.2` **anclado** | Dashboards, reportes. El anclaje del wrapper es intencional (ver §2 de CONVENCIONES) |
| Animaciones | **Framer Motion** | `^12.43.0` | Modales fullscreen, transiciones |
| HTTP | **Axios** | `^1.13.2` | Llamadas API |
| Rutas | **react-router-dom** v7 | `^7.11.0` | Navegación SPA |

### Prohibiciones

- ❌ **DevExtreme** — debe eliminarse por completo (componentes, CSS, dependencias, localización).
- ❌ **Material UI, Chakra UI** o cualquier otra librería de componentes.
- ❌ **Bootstrap** o sus derivados.
- ❌ **jQuery, jQuery UI**.
- ❌ Librerías de íconos que no sean **@ant-design/icons** o **FontAwesome**.
- ❌ Spinners personalizados — usar `<Spin>` de Antd.

---

## 2. Plan de Eliminación de DevExtreme

### 2.1 Dependencias a Remover

```json
// package.json — eliminar estas líneas de "dependencies"
"devextreme": "^22.2.15",
"devextreme-react": "22.2.15",
"globalize": "^1.7.0",

// package.json — eliminar estas líneas de "devDependencies"
"@types/globalize": "^1.5.5",
"devextreme-cldr-data": "^1.0.3",
```

### 2.2 Mapeo DevExtreme → Antd

| DevExtreme | Antd 6 | Notas |
|-----------|--------|-------|
| `DataGrid` / `dxDataGrid` | `<Table>` (o `<CrudTable>` del kit) | Ver sección Tablas |
| `Form` / `dxForm` | `<Form layout="vertical">` | Ver sección Formularios |
| `TextBox` / `dxTextBox` | `<Input>` | Misma funcionalidad |
| `SelectBox` / `dxSelectBox` | `<Select>` | Usar `showSearch` si tiene búsqueda |
| `DateBox` / `dxDateBox` | `<DatePicker>` | Misma funcionalidad |
| `NumberBox` / `dxNumberBox` | `<InputNumber>` | Misma funcionalidad |
| `Button` / `dxButton` | `<Button>` | Mapear tipos según tabla de tipos |
| `Popup` / `dxPopup` | `<Modal>` (o `<FormModal>` del kit) | Usar `footer={null}` |
| `CheckBox` / `dxCheckBox` | `<Checkbox>` | Misma funcionalidad |
| `Switch` / `dxSwitch` | `<Switch>` | Misma funcionalidad |
| `TextArea` / `dxTextArea` | `<TextArea>` (de `<Input>`) | Usar `showCount` y `maxLength` |
| `LoadPanel` / `dxLoadPanel` | `<Spin>` | Spinner de carga |
| `Toast` / `dxToast` | `showToast` (react-toastify) | Usar helper del kit |
| `ConfirmDialog` / `dxConfirmDialog` | `<ConfirmDialog>` (SweetAlert2 wrapper) | Usar helper del kit |
| `Tabs` / `dxTabs` | `<Tabs>` | Misma funcionalidad |
| `PieChart` / `Chart` | **ECharts** (echarts-for-react) | Migrar a ECharts |
| `Accordion` / `dxAccordion` | `<SeccionesColapsables>` del kit | No usar `Collapse` suelto (ver VISTAS_ANALITICAS §6.2) |
| `Toolbar` / `dxToolbar` | `<Space>` + `<Space.Compact>` | Usar Space de Antd |
| `Menu` / `dxMenu` | `<Menu>` (sidebar) | Antd Menu |
| `Pagination` / `dxPager` | `<Pagination>` (incluido en Table) | Antd Pagination |
| `TagBox` / `dxTagBox` | `<Select mode="multiple">` | Selección múltiple |
| `Lookup` / `dxLookup` | `<Select showSearch>` | Buscador |

### 2.3 CSS Residual de DevExtreme

Buscar y eliminar:
- Archivos `.css` o `.less` que importen DevExtreme (ej. `devextreme/dist/css/dx.light.css`)
- Variables CSS de DevExtreme en `:root`
- Clases CSS con prefijo `dx-`
- Estilos de scrollbar específicos de DevExtreme

---

## 3. Paleta de Colores

> **Los valores viven en [`src/design/tokens.ts`](../src/design/tokens.ts)** y la referencia
> completa (roles, contraste, tabla de migración) está en **[TOKENS.md](TOKENS.md)**. Esta sección
> resume las reglas; no copies hex de aquí.

### 3.1 Color institucional (Prussian Blue)

El azul IDCE es **Prussian Blue** (`primitivos.prussianBlue`, 700 = `#1f3f7a`). Con Tailwind v4 no
hay `tailwind.config.js`: el bloque `@theme` se **genera** desde `tokens.ts` en
`src/design/tokens.css`, que `src/index.css` importa.

En componentes se usa por su **rol** (`bg-identidad`, `text-identidad`, `color.identidad.base`).
La escala `prussian-blue-*` queda para los fondos del shell (`bg-prussian-blue-700`). La paleta
extendida (`linen`, `ivory`, `light-cyan`, `baby-blue-ice`) sigue disponible para acentos de marca,
nunca para estados ni acción.

> ⚠️ **Ant Design se tematiza con `<ConfigProvider theme={temaAntd}>`** (ver §7), derivado de los
> mismos tokens. No reintroduzcas overrides CSS con `!important` sobre clases `ant-*`, ni hex o
> colores por defecto de Tailwind en el markup: `pnpm lint` los rechaza.

### 3.2 Identidad vs acción

| | **Identidad** — `color.identidad` | **Acción** — `color.accion` |
|---|---|---|
| Valor | prussian 700 `#1f3f7a` | Tailwind **blue-600 `#2563eb`** (hover blue-700 `#1d4ed8`) |
| Dónde | **Shell**: lo que rodea al iframe | **Vistas internas**: lo que se abre en el iframe |
| Ciclo de vida | **Cambia por cliente/institución** | **Constante del design system** |
| Contraste sobre blanco | 10.2:1 | 5.2:1 (AA como texto y con texto blanco encima) |

> **La regla para decidir:** *prussian = shell; blue-600 = vistas internas.* Dentro de una vista no
> se usa prussian.
>
> **Origen (medido):** prussian solo aparece en el shell; en las vistas del iframe no se usa. Dentro
> del iframe, los sistemas usan la familia Tailwind blue (600 base, 700 hover, 50–200 tenues) y el
> `#1677ff` por defecto de antd, que es visualmente el mismo azul. El kit los unifica en blue-600.

| Territorio | Elementos | Rol |
|---|---|---|
| **Shell** | Fondos de header y sidebar; menú y su ítem activo; scrollbars; `::selection`; cabecera de exportaciones Excel | `identidad` |
| **Vistas: se opera** | Botones; Switch, Checkbox, Radio; foco; Pagination; Spin; pestañas; Segmented; cabeceras de sección colapsable y `SectionHeader`; enlaces; confirmar en diálogos | `accion` (`enlace` para links) |
| **Vistas: decoración** | Franjas y barritas de acento, bordes de resaltado, chips tenues | `accion-sutil` / `accion-borde` |
| **Vistas: título de página** | `PageHeader` (`Title level={4}`) | `identidad` (`text-identidad`, prussian 700) |
| **Vistas: sección y tarjeta** | `Title level={5}`, cabeceras de tarjeta | `tinta` (no `accion`) |

> ✅ **Nota WCAG.** blue-600 da 5.2:1 como texto y con texto blanco encima; hover 6.7:1 y activo
> 8.7:1. No hace falta una variante "fuerte" para Segmented ni diálogos.

#### Estados semánticos

Un solo valor por estado, de la **misma familia Tailwind que la acción**: éxito green-700, advertencia amber-700, error red-800 (más oscuro para separarse del ámbar). AA y siempre con icono o texto. Detalle en [TOKENS.md §2](TOKENS.md).

| Rol | Uso |
|---|---|
| `error` | `<Button color="danger">`, validación, destructivo en diálogos, KPIs malos, umbral no cumplido |
| `exito` | `<SuccessButton>`, Tags, Progress, KPIs buenos, variaciones favorables |
| `advertencia` | `<WarningButton>`, Alerts, KPIs de riesgo |
| info = `accion` | Alerts/Tags informativos |

> ⚠️ **No pintes botones antd con utilidades Tailwind de color.** Tailwind v4
> emite sus utilidades dentro de `@layer utilities` y antd 6 inyecta su CSS
> **sin capa**; en la cascada, una declaración sin capa le gana a una con capa
> sin importar la especificidad. Una clase de color sobre un `<Button type="primary">`
> **no hace nada** (el botón sale del color primario), mientras que una con `!` sí gana
> y deja el hover de otro color. Usa la API nativa (`color` × `variant`) o los tokens del tema.

### 3.3 Texto

| Clase | Uso |
|---|---|
| `text-tinta` | Títulos y texto principal (también títulos de celda, `font-semibold`) |
| `text-tinta-secundaria` | Texto secundario, subtítulos |
| `text-tinta-tenue` | Rótulos, pies, placeholders — mínimo AA para texto que se lee |
| `text-tinta-deshabilitada` | Solo deshabilitado e iconos decorativos |

---

## 4. Tipografía

Familia `font-sans` (`tipografia.familia.sans`), aplicada en `:root` y en `token.fontFamily` de
antd desde el mismo token. **Estándar del ecosistema** (medido en los sistemas en producción; detalle en [TOKENS.md §3](TOKENS.md)):
`text-rotulo` (11) · `detalle` (12) · `cuerpo` (14) · `subtitulo` (16) · `titulo` (18) · `cifra` (24)
· `display` (30) · `hero` (60). Mínimo 11 px. Jerarquía por peso y color antes que por tamaño; en
gráficas solo 11 (ejes, etiquetas) y 12 (tooltip), con el título en la cabecera de `TarjetaGrafica`.

| Elemento | Estilo |
|----------|--------|
| Título login | `text-display font-bold text-tinta` |
| Subtítulo login | `text-cuerpo text-tinta-secundaria` |
| Header usuario (shell) | `text-subtitulo font-bold text-identidad` |
| Título de página | `PageHeader` → `Title level={4}` `text-identidad` (18→16 a 90 %) |
| Título de sección | `Title level={5}` `text-tinta` (16→14) |
| Labels formulario | `Form.Item label` — hereda `text-cuerpo` |
| Título de tarjeta o celda | `text-cuerpo font-semibold text-tinta` |
| Subtítulo celda tabla | `text-detalle text-tinta-tenue` |
| Datos tabulares (IDs/códigos) | `font-mono` |
| Breadcrumb | `text-detalle uppercase tracking-wider` |

---

## 5. Layout y Espaciado

### Contenedor de página

```tsx
// Usar PageContainer del kit
<PageContainer>                     // bg-superficie rounded-contenedor p-4 shadow-contenedor
<PageContainer padding="p-6">       // Variante para reportes
```

> **⚠️ Iframe — fondo:** el documento dentro del iframe es **`superficie` (blanco)**. El **`lienzo`**
> (slate 200) es el margen gris del SSO entre header/sidebar y el iframe. `temaAntd.colorBgLayout`
> y `base.css` (`html`, `body`, `#root`, `.App`) van en blanco. No pintar la app con `bg-lienzo`.
>
> **⚠️ Iframe — scroll:** el contenedor raíz debe incluir `h-full` (o `height: 100%`) para ocupar
> exactamente el alto del iframe, y `overflow` se maneja **en el contenedor que lo requiera**, no
> en `<body>` ni `<html>`. Evita `min-height: 100vh`.
>
> **⚠️ Iframe — densidad:** ≈ zoom 90 % a escala 100 % (`DENSIDAD_UI`). Viene en `base.css` +
> `temaAntd`. No usar `zoom` ni `transform: scale`.

### Grid responsive

```tsx
<Row gutter={16}>
  <Col xs={24} sm={12} md={8} lg={6}>
    {/* contenido */}
  </Col>
</Row>
```

### Espaciado

```tsx
<Space size="small | middle | large">      // Horizontal
<Space direction="vertical">                // Vertical
<Space wrap>                                // Wrap responsivo
```

### Bordes redondeados

| Elemento | Clase (valor en `radio` de tokens.ts) |
|----------|---------------|
| Contenedor de página, vista analítica, KPI, modal | `rounded-contenedor` (12px) |
| Gráficas, franjas, avisos, tarjetas internas | `rounded-tarjeta` (8px) |
| Botones, inputs, chips | `rounded-control` (6px) — antd lo aplica solo |
| Tags de estado, avatares | `rounded-full` |
| Cuadros de leyenda, barra de pestaña | `rounded-marca` (2px) |

---

## 6. Patrones de Componentes

### 6.1 Botones

antd 6 expone `color` × `variant`. **Nunca** agregues clases Tailwind de color:
el color sale del token del tema (§3.2).

```tsx
// Primario institucional — sin className, hereda colorPrimary
<Button type="primary">Guardar</Button>

// Default (secundario)
<Button>Cancelar</Button>

// Danger (destructivo) — hereda colorError
<Button color="danger" variant="solid">Eliminar</Button>

// Success / Warning: antd NO tiene color="success" ni "warning".
// Usa los wrappers del kit, que leen colorSuccess/colorWarning del tema.
<SuccessButton>Aprobar</SuccessButton>
<WarningButton>Revisar</WarningButton>

// Sobre fondos de color (nunca sobre blanco). No usar <Button ghost>: su hover toma
// accion.hover y sobre azul queda en 1.3:1. GhostButton: blanco en todos los estados y
// hover con el tono del rol de fondo.
<GhostButton sobre="accion">Ver detalle</GhostButton>      // banner azul dentro de una vista
<GhostButton sobre="identidad">Salir</GhostButton>         // header del shell

// Descargas: Excel verde, PDF rojo (§7.2). Nunca un Button armado a mano.
<ExcelButton onClick={descargarExcel} disabled={!filas.length} />
<PdfButton onClick={descargarPdf} />
<ExcelButton size="small" soloIcono />   // cabeceras estrechas, con tooltip

// Circular (acciones de tabla) — el icono hereda el color del botón
<Button color="primary" variant="text" shape="circle" icon={<EditOutlined />} />
<Button color="danger"  variant="text" shape="circle" icon={<DeleteOutlined />} />

// Grupo compacto
<Space.Compact><Button type="primary" /><Button type="primary" /></Space.Compact>
```

`variant` acepta `solid | outlined | dashed | filled | text | link`, combinable
con cualquier `color`. Ver la matriz completa en la pestaña **Botones →
Variantes completas** del kit (`src/demos/ButtonsVariantsDemo.tsx`).

### 6.2 Formularios e Inputs

```tsx
<Form form={form} layout="vertical" onFinish={handleFinish}>
  <Row gutter={16}>
    <Col span={8}>
      <Form.Item name="campo" label="Label" rules={[{ required: true, message: "Requerido" }]}>
        <Input placeholder="Placeholder" />
      </Form.Item>
    </Col>
  </Row>
  {/* Botones al final, alineados a la derecha */}
  <Form.Item className="mb-0 mt-4">
    <Space className="w-full justify-end">
      <Button icon={<CloseOutlined />}>Cancelar</Button>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Guardar
      </Button>
    </Space>
  </Form.Item>
</Form>
```

Si se usa modal: `<FormModal>` del kit.

### 6.3 Tablas de Datos

```tsx
// Usar CrudTable del kit
<CrudTable columns={columns} dataSource={data} loading={loading} rowKey="id" />

// O Table directa con:
<Table
  columns={columns}
  dataSource={data}
  loading={loading}
  rowKey="id"
  scroll={{ x: 500 }}
  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} registros` }}
/>
```

Toolbar de tabla:
```tsx
<div className="mb-4 flex justify-between items-center flex-wrap gap-2">
  <SearchInput value={searchText} onChange={setSearchText} placeholder="Buscar..." />
  <Space>
    <ExcelButton onClick={handleExport} disabled={!data.length} />
    <Button icon={<ReloadOutlined />}>Limpiar</Button>
    <Button type="primary" icon={<PlusOutlined />}>
      Nuevo
    </Button>
  </Space>
</div>
```

### 6.4 Alertas y Diálogos

```ts
// Confirmación destructiva
const confirmed = await ConfirmDialog({ text: '¿Desea continuar?', destructive: true });
if (confirmed) { ... }

// Toast rápido
showToast.success('Operación exitosa');
showToast.error('Error al guardar');
showToast.warning('Advertencia');
showToast.info('Información');

// SweetAlert2 directo (raro)
Swal.fire({ icon: 'success', title: 'Éxito', text: 'Mensaje' });
```

### 6.5 Loading

```tsx
// Pantalla completa
<LoadingScreen />

// Spinner inline
<Spin size="large" tip="Cargando..." />

// Esqueleto
<Skeleton active />

// Sección o gráfica (no pantalla completa)
import Loading from '@/shared/loading';
<Loading />
```

Si la consulta **falló** (no es que no haya datos), se muestra `EstadoError` con el
`apiError` de `useService`, no un vacío:

```tsx
import EstadoError from '@/shared/EstadoError';
{apiError ? <EstadoError error={apiError} /> : <MiTabla />}
```

### 6.6 Gráficos

**La forma oficial es `TarjetaGrafica` de `@/shared/analitica`.** Trae estadísticas,
etiquetas, ver datos, imagen y pantalla completa en una barra antd fuera del lienzo.
No usar `ReactECharts` suelto ni el `toolbox` de ECharts.

**Regla: "Ver datos" siempre lleva la opción de descargar en Excel** (`TablaDatosModal` exige
`onDescargar`).

```tsx
import { TarjetaGrafica } from '@/shared/analitica';

<TarjetaGrafica
  titulo="Evolución de la mora"
  subtitulo="Clic en un punto para ver el detalle"
  option={option}          // null → "Sin datos para el periodo"
  cargando={loading}
  alto={260}
/>
```

Guía completa (filtros, KPIs, tablas, opciones de ECharts): [VISTAS_ANALITICAS.md](VISTAS_ANALITICAS.md).

### 6.7 Paneles de detalle

Lo que se abre al pinchar una fila o un punto (drawer o modal) se arma con `BloqueDetalle`,
`Dato` y `FichaDatos` de `@/shared/analitica`: un bloque por tema, con título, chips a la derecha
y pares etiqueta / valor. **`Descriptions` de antd no se usa en el ecosistema.** Ver
[VISTAS_ANALITICAS.md §6.3](VISTAS_ANALITICAS.md).

### 6.8 Ajustes permitidos

Los componentes traen el valor del estándar por defecto; se puede ajustar lo que la vista necesite
**sin salir del sistema**:

| Ajuste | Dónde | Por defecto |
|---|---|---|
| `className` (márgenes, ancho, posición) | todos los componentes | — |
| `columnas` | `FilaKpis` (cualquier número), `FichaDatos` (2–5), `RejillaGraficas` (`columnasMaximas`) | 4 / 3 / según ancho |
| `color` | `KpiCard` | `"tinta"` |
| `colorIcono` | `SectionHeader`, `SeccionesColapsables` (global y por sección) | `"accion"` |
| `color` de chip | `ChipAtributo`, `ChipNivel` | preset de antd (`"blue"`, por profundidad) |
| `colorActivo` / `colorInactivo` | `StatusTag` | `processing` / `default` de antd |

**Color: rol o propio (`ColorKit`).** Un color se pide por **rol** —`"accion"`, `"identidad"`,
`"exito"`, `"advertencia"`, `"error"`, `"tinta"`, `"neutro"`, y los de KPI `"monto"`, `"riesgo"`,
`"bueno"`, `"malo"`— y sale del token (`COLOR_ROL`). Un **color propio** (`"#7c3aed"`, `"rgb(…)"`) se
acepta solo cuando lo dicta el dato: el color de un nivel de riesgo o de un catálogo que viene del
backend. Se vuelve legible solo (`colorTexto`), y en chips toma el mismo aspecto que los presets
(`estiloChip`).

- ✅ `color="riesgo"`, `colorIcono="exito"`, `color={nivel.color}` (viene del backend).
- ❌ `color="#7c3aed"` escrito a mano para "que se vea distinto": si tiene significado, tiene rol. El
  verificador de tokens rechaza ese hex en el código.

---

## 7. Configuración Global (ConfigProvider de Antd)

En `App.tsx`. Se importa con alias `AntdConfigProvider` porque el nombre
`ConfigProvider` ya lo usa el provider propio de la app (`src/hooks/configContext.tsx`,
runtime config de rutas, montado en `main.tsx`) — **no importar ambos sin alias
en el mismo archivo**, y no eliminar el `ConfigProvider` propio.

El tema **no se escribe a mano**: [`src/design/temaAntd.ts`](../src/design/temaAntd.ts) lo deriva
de los tokens, así `colorTextSecondary` de antd y `text-tinta-secundaria` de Tailwind son el mismo
valor. Refleja la separación de §3.2: **`token` global en acción** (blue-600), **identidad acotada al menú del shell**.

```tsx
// src/design/temaAntd.ts (extracto)
export const temaAntd: ThemeConfig = {
  token: {
    colorPrimary: color.accion.base,          // lo que se opera
    colorLink: color.enlace.base,             // blue-600, pasa AA como texto
    colorSuccess: color.exito.base,           // estados AA
    colorError: color.error.base,
    colorText: color.tinta.base,              // neutros slate
    colorBorder: color.linea.fuerte,
    fontFamily: tipografia.familia.sans,
    fontSize: tipografia.escala.cuerpo.tamano,
    borderRadius: radio.control,
    // …
  },
  components: {
    Button: { defaultColor: color.accion.base /* … */ },
    Menu: { itemSelectedColor: color.identidad.base, itemSelectedBg: color.identidad.sutil },
    Tabs: { inkBarColor: color.accion.base, itemSelectedColor: color.accion.base },
  },
};

// src/App.tsx
<AntdConfigProvider theme={temaAntd}>{/* Routes */}</AntdConfigProvider>
```

Con esto, botones, switches, checkboxes, radios, sliders, foco de inputs,
paginación, Spin, Progress y pestañas heredan la **acción** solos, mientras el menú del shell
mantiene la **identidad** — sin overrides CSS con `!important`.

**Para cambiar el color de un cliente:** tocar `primitivos.prussianBlue` en
`src/design/tokens.ts`. Cambia el shell; las vistas internas (acción, blue-600) no se tocan.

### 7.1 Success / Warning — `SemanticButtons`

antd solo acepta `color="primary" | "danger" | <preset>`; **no existe
`color="success"` ni `color="warning"`**. Esos tokens alimentan Alert, Tag,
Progress y la validación de formularios, pero no el botón. Para un botón sólido
con esos colores, `src/components/SemanticButtons.tsx` remapea `colorPrimary`
en un `ConfigProvider` anidado, leyendo el valor real con `theme.useToken()`:

```tsx
const { token } = theme.useToken();

// OJO: el override va en `components.Button`, NO en `token`.
<AntdConfigProvider theme={{ components: { Button: {
  colorPrimary: token.colorSuccess,
  colorPrimaryHover: token.colorSuccessHover,
  colorPrimaryActive: token.colorSuccessActive,
}}}}>
  <Button color="primary" variant="solid">Aprobar</Button>
</AntdConfigProvider>
```

> ⚠️ Los `ConfigProvider` anidados fusionan `token` y `components` **por
> separado** (ver `useTheme.js` de antd), y **el override de componente le gana
> a `token`** para ese componente. Si esto se escribiera en `token.colorPrimary`,
> cualquier `components.Button.colorPrimary` de `App.tsx` lo pisaría y los
> botones saldrían del color equivocado.

Como lee del tema y no hardcodea hex, cambiar `color.exito` en `tokens.ts`
actualiza `<SuccessButton>` solo. Exporta `SuccessButton`, `WarningButton` y
`SolidColorButton` (el mecanismo, para crear botones del kit como los de §7.2) y `GhostButton` (fondos de color, ver §6.1).

### 7.2 Descargas — `ExcelButton` (verde) y `PdfButton` (rojo)

Toda descarga de archivo usa `src/components/DownloadButtons.tsx`:

| Botón | Color | Icono | Texto por defecto |
|---|---|---|---|
| `ExcelButton` | verde oscuro green-800 `#166534` | `FileExcelOutlined` | "Excel" |
| `PdfButton` | rojo vivo red-600 `#dc2626` | `FilePdfOutlined` | "PDF" |

```tsx
<ExcelButton onClick={exportar} loading={isExporting} disabled={!filas.length} />  // barra de página / CRUD
<ExcelButton size="small" onClick={exportar} />                                   // vistas analíticas, franjas, modales
<ExcelButton size="small">Descargar Excel</ExcelButton>                           // texto propio
<PdfButton size="small" soloIcono tooltip="Descargar ficha" />                    // solo icono, con tooltip
```

- Los colores son los tokens `color.excel` y `color.pdf` de `src/design/tokens.ts`,
  **constantes del design system** como la acción: identifican el **formato del archivo**,
  no un estado. Por eso no son `exito` ni `error`: Excel es un verde más oscuro que éxito y
  PDF un rojo más vivo que error (un PDF en el rojo "de peligro" se leería como *eliminar*).
  Texto blanco con contraste AA en reposo, hover y pulsado.
- No aceptan `color`, `variant` ni `type`: el color no se cambia.
- Deshabilitar cuando no hay filas que descargar.
- Todo "Ver datos" (tabla de los números de una gráfica) incluye `ExcelButton` "Descargar Excel".
- Excel se genera con `useExcelExport` (una hoja) o `exportarExcel` (vistas
  analíticas). El kit **no trae generador de PDF**: `PdfButton` solo define el botón.
- Demo: pestaña **Botones → Variantes completas**.

---

## 8. Componentes Reutilizables del Starter Kit

Cuando el proyecto destino sea el Starter Kit IDCE o un proyecto que lo extienda, usar estos componentes en lugar de escribirlos inline:

| Componente | Reemplaza | Ubicación |
|-----------|-----------|-----------|
| `PageContainer` | `div.bg-superficie.rounded-contenedor.p-4.shadow-contenedor` | `src/components/PageContainer.tsx` |
| `PageHeader` | Título + Breadcrumb + acciones | `src/components/PageHeader.tsx` |
| `BreadcrumbNav` | Antd Breadcrumb manual | `src/components/BreadcrumbNav.tsx` |
| `CrudTable` | Antd Table + paginación | `src/components/CrudTable.tsx` |
| `ActionButtons` | Botones Editar/Eliminar circulares | `src/components/ActionButtons.tsx` |
| `StatusTag` | Tag Activo/Inactivo | `src/components/StatusTag.tsx` |
| `EmptyState` | Estado vacío con recarga | `src/components/EmptyState.tsx` |
| `ExcelButton`, `PdfButton` | Botones de descarga Excel (verde) y PDF (rojo) — reemplazan al antiguo `ExportButton` | `src/components/DownloadButtons.tsx` |
| `FormModal` | Modal + Form vertical + botones | `src/components/FormModal.tsx` |
| `SectionHeader` | Icono + título de sección | `src/components/SectionHeader.tsx` |
| `SearchInput` | Input búsqueda 280px | `src/components/SearchInput.tsx` |
| `ConfirmDialog` | SweetAlert2 wrapper | `src/components/ConfirmDialog.tsx` |
| `LoadingScreen` | Spin full-height | `src/components/LoadingScreen.tsx` |
| `NotificationToast` | showToast helper | `src/components/NotificationToast.tsx` |
| `ProtectedRoute` | Guard de ruta | `src/components/ProtectedRoute.tsx` |
| `TarjetaGrafica` | `ReactECharts` suelto / `toolbox` de ECharts | `src/shared/analitica` |
| `SeccionesColapsables` | `Collapse` de antd con cabecera hecha a mano (icono + título + ayuda) | `src/shared/analitica` — ver [VISTAS_ANALITICAS.md §6.2](VISTAS_ANALITICAS.md) |
| `VistaAnalitica`, `BarraFiltros`, `TabsAnaliticas`… | Dashboards y reportes armados a mano | `src/shared/analitica` — ver [VISTAS_ANALITICAS.md](VISTAS_ANALITICAS.md) |
| `KpiCard` + `Delta` | Tarjetas de indicador | `src/components/charts/KpiCard.tsx`, `src/shared/analitica` |
| `EstadoError` + `primerApiError` | Vacío que oculta un fallo del backend | `src/shared/` |
| `Loading`, `SkeletonCustom`, `EllipsisCell`, `wrapColumnTitle` | Carga, esqueletos, celda truncada, título de columna | `src/shared/` |
| `IdentityCell` | Nombre + meta etiquetada en CRUD denso | `src/components/IdentityCell.tsx` |
| `ChipAtributo`, `AtributosCell` | Varios catálogos cortos en una columna | `src/components/ChipAtributo.tsx` |
| `ChipNivel`, `BarraExpandirArbol` | Nodo de árbol (nivel + nombre) y Expandir/Contraer | `src/components/` |
| `BarraListado` | Toolbar de listas CRUD (no `BarraFiltros`) | `src/components/BarraListado.tsx` |
| `ColorSwatch` + `valorColorHex` | Color editable hex en grilla y form | `src/components/ColorSwatch.tsx` |
| `opcionesMatrizCalor` | Heatmap F×I dentro de `TarjetaGrafica` | `src/shared/analitica` |

---

## 9. CSS Global Requerido

```css
/* ════════════════════════════════ */
/* PREVENIR DOBLE SCROLL EN IFRAME  */
/* ════════════════════════════════ */

/* Deshabilitar scroll en html/body — el scroll se maneja dentro del contenedor */
html, body, #root {
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  background-color: var(--color-superficie);
}

/* El contenedor principal de cada página usa overflow-y: auto si necesita scroll */
.app-container {
  height: 100%;
  overflow-y: auto;
}

/* ════════════════════════════════ */
/* SCROLLBAR INSTITUCIONAL          */
/* ════════════════════════════════ */

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--color-superficie-hundida); border-radius: 4px; }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--color-prussian-blue-600), var(--color-prussian-blue-700)); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, var(--color-prussian-blue-500), var(--color-prussian-blue-600)); }

/* Tablas Antd */
.ant-table-body::-webkit-scrollbar-thumb { background: var(--color-prussian-blue-600); }
.ant-table-body::-webkit-scrollbar-thumb:hover { background: var(--color-prussian-blue-500); }

/* Selection */
::selection { background-color: var(--color-identidad); color: var(--color-tinta-inversa); }

/* Focus: territorio de accion */
*:focus-visible { outline: 2px solid var(--color-accion); outline-offset: 2px; }
```

---

## 10. Checklist de Refactorización

### Pre-refactorización

- [ ] Identificar todos los archivos que importan DevExtreme (`grep -r "devextreme" src/`)
- [ ] Identificar imports de CSS de DevExtreme (`dx.light.css`, etc.)
- [ ] Identificar clases CSS prefijo `dx-`
- [ ] Identificar dependencias relacionadas (`globalize`, `devextreme-cldr-data`)
- [ ] Hacer backup del proyecto o commit antes de empezar

### Durante la refactorización

- [ ] Copiar `src/design/` (tokens, generador, tema antd), el plugin `idce-tokens` de `vite.config.ts` y el `@import "./design/tokens.css"` de `src/index.css`
- [ ] Migrar cada componente DevExtreme → Antd según la tabla de mapeo
- [ ] Reemplazar DevExtreme DataGrid → CrudTable o Table de Antd
- [ ] Reemplazar DevExtreme Form → FormModal o Form vertical
- [ ] Reemplazar DevExtreme Popup → Modal con footer={null}
- [ ] Reemplazar DevExtreme Toast → showToast (react-toastify)
- [ ] Reemplazar DevExtreme ConfirmDialog → ConfirmDialog (SweetAlert2)
- [ ] Reemplazar DevExtreme LoadPanel → Spin
- [ ] Reemplazar DevExtreme Chart → ECharts
- [ ] Verificar que los botones sigan el patrón institucional
- [ ] `pnpm tokens:verificar` sin problemas (sin hex, `text-gray-*`, `text-sm`, `rounded-lg`…)
- [ ] Agregar CSS global de scrollbar institucional

### Post-refactorización

- [ ] Eliminar dependencias DevExtreme de package.json
- [ ] Eliminar CSS residual de DevExtreme
- [ ] Ejecutar build y verificar que no haya errores de compilación
- [ ] `grep -r "devextreme" src/` → 0 resultados
- [ ] `grep -r "dx-" src/` → 0 resultados (o solo falsos positivos)
- [ ] Verificar que el tema de ConfigProvider se aplique correctamente
- [ ] Verificar que los colores institucionales estén en todos los elementos de marca
- [ ] Verificar que **no hay doble scroll**: `html, body` deben tener `overflow: hidden` y la página debe ocupar exactamente el alto del iframe sin generar scroll extra

---

## 11. Reglas de Refactorización

### Hacer

- Usar `prussian-blue-700` como color institucional en headers, sidebars y elementos de marca
- Envolver páginas en `PageContainer` (`bg-superficie rounded-contenedor p-4 shadow-contenedor`)
- Usar roles de [TOKENS.md](TOKENS.md) para todo color, tamaño, radio y sombra
- Formularios con `layout="vertical"` y botones al final alineados a la derecha
- Tablas con paginación `pageSize: 10`, `showSizeChanger`, `showTotal`
- Acciones de fila con `ActionButtons` (circulares con tooltip)
- Usar `ConfirmDialog` para confirmaciones destructivas
- Usar `showToast` para notificaciones rápidas
- Preferir `Spin` sobre spinners personalizados
- Preferir `Skeleton` para estados de carga en listas
- Usar `<Space wrap>` para grupos de botones responsivos
- Usar `Row gutter={16}` para grids de formularios

### Evitar

- Introducir otra librería de componentes (Material, Chakra, Bootstrap, etc.)
- Mantener código DevExtreme (debe eliminarse por completo)
- Hex, `rgba()`, colores o tamaños por defecto de Tailwind (`text-gray-600`, `text-sm`) fuera de `src/design/`
- Modales con footer por defecto (usar `footer={null}`)
- Tablas sin scroll horizontal (mínimo `scroll={{ x: 500 }}`)
- Radios fuera de la escala (`rounded-md`, `rounded-2xl`, `borderRadius: 6`)
- Botones de eliminar con estilo primario (usar `danger` o `ConfirmDialog`)
- Spinners personalizados cuando `Spin` funciona
- Importar componentes enteros de antd cuando solo necesitas uno
- Poner lógica de negocio en componentes de UI

---

## 12. Iconografía

| Contexto | Librería | Ejemplos |
|----------|----------|----------|
| Acciones CRUD | Ant Design Icons | `PlusOutlined`, `EditOutlined`, `DeleteOutlined`, `SaveOutlined` |
| Filtros | Ant Design Icons | `SearchOutlined`, `ReloadOutlined` |
| Descargas | `ExcelButton` / `PdfButton` (ya traen el icono) | `FileExcelOutlined`, `FilePdfOutlined` |
| Seguridad | Ant Design Icons | `LockOutlined`, `SafetyOutlined`, `KeyOutlined` |
| Navegación | Ant Design Icons | `SettingFilled`, `ExportOutlined`, `CloseOutlined` |
| Menú lateral | FontAwesome | Mapeo desde BD (`fa fa-home` → `fas fa-home`) |

---

## 13. Ejemplo de Refactorización

### Antes (DevExtreme)

```tsx
import DataGrid, { Column, Paging, Pager } from 'devextreme-react/data-grid';

<DataGrid dataSource={data} keyExpr="id">
  <Column dataField="nombre" caption="Nombre" />
  <Column dataField="email" caption="Email" />
  <Paging defaultPageSize={10} />
  <Pager showPageSizeSelector={true} showInfo={true} />
</DataGrid>
```

### Después (Antd + Starter Kit)

```tsx
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const columns: ColumnsType<Tipo> = [
  { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
];

<Table
  columns={columns}
  dataSource={data}
  rowKey="id"
  scroll={{ x: 500 }}
  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} registros` }}
/>
```

O usando el componente del kit:

```tsx
<CrudTable columns={columns} dataSource={data} rowKey="id" />
```

---

## 14. Configuración Post-Build (`routes.json`)

> **Propósito:** Permitir cambiar la URL de la API y otras variables de entorno **sin recompilar la aplicación**. Útil para despliegue en diferentes entornos (dev, QA, prod) con el mismo build.

### Mecanismo

La aplicación carga en runtime el archivo `public/config/routes.json` mediante un `fetch` en el `ConfigProvider` (`src/hooks/configContext.tsx`). Esto ocurre **antes** de que cualquier servicio o componente intente consumir la API.

### Estructura del archivo

```json
{
  "VITE_API_URL": "http://localhost:5097/api",
  "VITE_BASE_URL": "http://localhost:5097/",
  "VITE_BASE_PATH": "",
  "VITE_INSTITUCION_ID": [
    {"id": 8204, "nombre": "CREDIAMIGO"},
    {"id": 12013, "nombre": "SIDETAM"}
  ],
  "VITE_SSO_DEPLOY_PATH": "http://localhost:82/"
}
```

### Reglas para el agente

| Regla | Detalle |
|-------|---------|
| **No hardcodear URLs de API** | Toda URL debe venir de `config.VITE_API_URL` o `config.VITE_BASE_URL`, nunca de variables de build (`import.meta.env`) para URLs de backend. |
| **Usar `useConfig` hook** | `const { config } = useConfig();` — disponible en cualquier componente bajo `ConfigProvider`. |
| **Servicios** | Los servicios Axios se inicializan con `initializeServices(config)` que lee `VITE_API_URL`. No crear instancias de Axios con URLs fijas. |
| **Ubicación** | El archivo debe estar siempre en `public/config/routes.json` para que sea servido estáticamente y accesible en `fetch("/config/routes.json")`. |
| **Despliegue** | En cada entorno se edita este archivo — no requiere rebuild. |

### Estructura del tipo TypeScript

```ts
interface RoutesConfig {
  VITE_API_URL: string;
  VITE_BASE_URL: string;
  VITE_BASE_PATH: string;
  VITE_INSTITUCION_ID: number | Array<{ id: number; nombre: string }>;
  VITE_SSO_DEPLOY_PATH: string;
}
```

### ⚠️ Importante — Iframe + Configuración

Las aplicaciones que se sirven dentro del iframe del SSO **deben implementar el mismo patrón** (`public/config/routes.json` + `ConfigProvider`). Esto garantiza que:
- La URL de la API se pueda ajustar por entorno sin rebuild.
- El SSO pueda redirigir tráfico a diferentes instancias de la app según el entorno.
- No haya URLs quemadas en el bundle que obliguen a recompilar por cada entorno.

---

*Última actualización: junio 2026 — Versión 3.0*  
*Este documento es parte del Starter Kit IDCE y debe usarse como prompt para refactorización por agentes de código.*
