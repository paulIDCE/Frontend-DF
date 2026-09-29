import { Anchor, ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { TEMA_ANALITICA } from "@idce/kit";
import PaginaPieza, { type PaginaPiezaProps } from "../componentes/PaginaPieza";
import { idSeccion } from "../componentes/ids";
import type { Ejemplo } from "../componentes/CajaEjemplo";
import {
  API_AYUDAS,
  API_MATRIZ,
  API_MINI,
  API_PERIODO,
  API_REJILLA,
  API_TARJETA,
  API_ZOOM,
} from "./api";
import PlaygroundTarjeta from "./playground/PlaygroundTarjeta";
import PlaygroundMini from "./playground/PlaygroundMini";

import Basica from "./ejemplos/tarjeta/Basica";
import codigoBasica from "./ejemplos/tarjeta/Basica.tsx?raw";
import BarraCompleta from "./ejemplos/tarjeta/BarraCompleta";
import codigoBarraCompleta from "./ejemplos/tarjeta/BarraCompleta.tsx?raw";
import NivelesYClic from "./ejemplos/tarjeta/NivelesYClic";
import codigoNivelesYClic from "./ejemplos/tarjeta/NivelesYClic.tsx?raw";
import Periodo from "./ejemplos/tarjeta/Periodo";
import codigoPeriodo from "./ejemplos/tarjeta/Periodo.tsx?raw";
import ZoomSeleccion from "./ejemplos/tarjeta/ZoomSeleccion";
import codigoZoomSeleccion from "./ejemplos/tarjeta/ZoomSeleccion.tsx?raw";
import PantallaCompleta from "./ejemplos/tarjeta/PantallaCompleta";
import codigoPantallaCompleta from "./ejemplos/tarjeta/PantallaCompleta.tsx?raw";
import Estados from "./ejemplos/tarjeta/Estados";
import codigoEstados from "./ejemplos/tarjeta/Estados.tsx?raw";
import Rejilla from "./ejemplos/mini/Rejilla";
import codigoRejilla from "./ejemplos/mini/Rejilla.tsx?raw";
import MiniAmpliada from "./ejemplos/mini/MiniAmpliada";
import codigoMiniAmpliada from "./ejemplos/mini/MiniAmpliada.tsx?raw";
import EtiquetasRejilla from "./ejemplos/mini/EtiquetasRejilla";
import codigoEtiquetasRejilla from "./ejemplos/mini/EtiquetasRejilla.tsx?raw";
import InherenteResidual from "./ejemplos/matriz/InherenteResidual";
import codigoInherenteResidual from "./ejemplos/matriz/InherenteResidual.tsx?raw";
import SerieConUmbral from "./ejemplos/ayudas/SerieConUmbral";
import codigoSerieConUmbral from "./ejemplos/ayudas/SerieConUmbral.tsx?raw";

const ejemplosTarjeta: Ejemplo[] = [
  {
    id: "tarjeta-basica",
    titulo: "Uso básico",
    descripcion:
      "Título, opción y alto. La tarjeta pone la paleta, la tipografía, las estadísticas, la imagen y la pantalla completa.",
    Componente: Basica,
    codigo: codigoBasica,
  },
  {
    id: "tarjeta-estados",
    titulo: "Cargando, vacío y compacta",
    descripcion:
      "`cargando`, `option={null}` con `textoVacio`, y `compacta` para una gráfica pequeña suelta.",
    Componente: Estados,
    codigo: codigoEstados,
  },
  {
    id: "tarjeta-barra",
    titulo: "Botones de la barra",
    descripcion:
      "Etiquetas y % / valores controlados por la vista, barras ↔ líneas, «Ver datos» con su Excel y descarga directa.",
    Componente: BarraCompleta,
    codigo: codigoBarraCompleta,
  },
  {
    id: "tarjeta-niveles",
    titulo: "Niveles de riesgo, clic y pie",
    descripcion:
      "`franjasNiveles` detrás de la serie, `onClickPunto` con el corte en `extra` y la leyenda en `pie`.",
    Componente: NivelesYClic,
    codigo: codigoNivelesYClic,
  },
  {
    id: "tarjeta-pantalla-completa",
    titulo: "Pantalla completa con más detalle",
    descripcion:
      "`opcionPantallaCompleta`: en grande, etiquetas y slider que en la tarjeta no caben.",
    Componente: PantallaCompleta,
    codigo: codigoPantallaCompleta,
  },
  {
    id: "tarjeta-zoom",
    titulo: "Zoom por selección",
    descripcion:
      "`seleccionRango` en modo zoom: lo seleccionado acota la gráfica en X, en Y o en los dos.",
    Componente: ZoomSeleccion,
    codigo: codigoZoomSeleccion,
  },
  {
    id: "tarjeta-periodo",
    titulo: "Periodo compartido",
    descripcion:
      "`seleccionRango` en modo periodo: el rango vuelve a la vista, que lo comparte con otra gráfica y con un selector de fechas. Asas para extender y mover.",
    Componente: Periodo,
    codigo: codigoPeriodo,
    ancho: true,
  },
];

const ejemplosMini: Ejemplo[] = [
  {
    id: "mini-rejilla",
    titulo: "Rejilla con estados y «Ver datos»",
    descripcion:
      "Una mini por oficina, pintada una vez. Estados de error y sin datos, carga simulada y un único `TablaDatosModal` para toda la rejilla.",
    Componente: Rejilla,
    codigo: codigoRejilla,
    ancho: true,
  },
  {
    id: "mini-ampliada",
    titulo: "Pantalla completa con más series",
    descripcion:
      "`opcionPantallaCompleta`: la mini se queda con su serie; en grande entra la de la red, la leyenda y el slider.",
    Componente: MiniAmpliada,
    codigo: codigoMiniAmpliada,
  },
  {
    id: "mini-etiquetas",
    titulo: "Etiquetas de toda la rejilla",
    descripcion:
      "`etiquetas` controlado: un interruptor de la vista las enciende en todas las minis.",
    Componente: EtiquetasRejilla,
    codigo: codigoEtiquetasRejilla,
  },
];

const PIEZAS: PaginaPiezaProps[] = [
  {
    id: "tarjeta-grafica",
    nombre: "TarjetaGrafica",
    resumen:
      "El marco de toda gráfica: cabecera con título, barra de botones fuera del lienzo (estadísticas, etiquetas, % / valores, barras ↔ líneas, ver datos, zoom, imagen, Excel, pantalla completa) y selección de rango.",
    importar: 'import { TarjetaGrafica } from "@idce/kit";',
    usar: [
      "Cualquier gráfica de ECharts en una vista: es la forma oficial.",
      "Reemplazar el `toolbox` de ECharts: cada botón tiene su prop (ver la API).",
      "Elegir un periodo que alimenta filtros u otras gráficas, o acotar la gráfica arrastrando.",
    ],
    evitar: [
      "`ReactECharts` suelto o dentro de una tarjeta propia (`*ChartCard`).",
      "El `toolbox` de ECharts: se monta sobre la leyenda y no tiene tooltips legibles.",
      "Muchas gráficas iguales (una por oficina): `MiniGrafica` + `RejillaGraficas`.",
    ],
    ejemplos: ejemplosTarjeta,
    playground: <PlaygroundTarjeta />,
    api: [
      { props: API_TARJETA },
      {
        titulo: "SeleccionPeriodo (seleccionRango, modo periodo)",
        props: API_PERIODO,
      },
      { titulo: "SeleccionZoom (seleccionRango, modo zoom)", props: API_ZOOM },
    ],
    notas: [
      'Periodo: solo con `xAxis.type: "time"`. Zoom: cualquier gráfica cartesiana. Con otro eje, la tarjeta avisa en consola e ignora la selección.',
      "Con `seleccionRango`, el `dataZoom` `inside` deja de arrastrar (la rueda sigue haciendo zoom).",
      "Tarjeta y pantalla completa comparten la franja del periodo y el zoom. Un cambio de `option` reinicia el zoom.",
      'En cada serie, `unitType: "percent" | "money"` hace que las estadísticas formateen bien. Datos numéricos o tuplas, no `{ value }`.',
    ],
  },
  {
    id: "mini-grafica",
    nombre: "MiniGrafica + RejillaGraficas",
    resumen:
      "La misma gráfica repetida por elemento (oficina, destino, origen). La rejilla mide su contenedor y reparte columnas; cada mini es una `TarjetaGrafica` compacta con dos botones.",
    importar: 'import { MiniGrafica, RejillaGraficas } from "@idce/kit";',
    usar: [
      "Una gráfica por elemento de una lista, todas con la misma forma.",
      "Rejillas dentro del iframe del SSO (≈1264 px): la rejilla mide el espacio real, no la ventana.",
    ],
    evitar: [
      "El par `block xl:hidden overflow-x-auto` + `hidden xl:grid`: monta cada gráfica dos veces.",
      "Rótulos flotantes sobre el lienzo: el nombre va en la cabecera.",
      "Muchas rejillas abiertas a la vez: `SeccionesColapsables` con `destruirAlCerrar`.",
    ],
    ejemplos: ejemplosMini,
    playground: <PlaygroundMini />,
    api: [
      { titulo: "MiniGrafica", props: API_MINI },
      { titulo: "RejillaGraficas", props: API_REJILLA },
    ],
  },
  {
    id: "matriz-calor",
    nombre: "opcionesMatrizCalor",
    resumen:
      "Opción de ECharts para una matriz de dos ejes ordinales (frecuencia × impacto, cuadrantes) con color por celda, conteo y resalte. Se pinta dentro de `TarjetaGrafica`.",
    importar:
      'import { opcionesMatrizCalor, TarjetaGrafica, type CeldaMatrizCalor } from "@idce/kit";',
    usar: [
      "Grilla F×I o de cuadrantes con color de escala + conteo y clic.",
      "Comparar dos matrices (inherente / residual) con el mismo resalte.",
    ],
    evitar: [
      "Preview de configuración o tabla HTML área × tipo.",
      "`visualMap` a mano: el color va en cada celda.",
    ],
    ejemplos: [
      {
        id: "matriz-ejemplo",
        titulo: "Inherente y residual",
        descripcion:
          "Clic en una celda: el resalte se comparte entre las dos matrices.",
        Componente: InherenteResidual,
        codigo: codigoInherenteResidual,
        ancho: true,
      },
    ],
    api: [{ titulo: "opcionesMatrizCalor({ … })", props: API_MATRIZ }],
    notas: [
      "Pasar `estadisticas={false}` a la tarjeta: son conteos por celda, no una serie de valores, y las estadísticas no tienen sentido.",
      "ECharts 6 exige `visualMap` en los heatmaps; `opcionesMatrizCalor` ya lo trae (oculto), así que funciona igual en 5 y en 6.",
    ],
  },
  {
    id: "ayudas-opciones",
    nombre: "Ayudas para las opciones",
    resumen:
      "Funciones puras para armar la `option` de las series temporales y de riesgo con el estándar del sistema.",
    importar:
      'import { punto, zoomTemporal, inicioZoom, tooltipTemporal, franjasNiveles, maximoEjeConNiveles, estiloUmbral, TEXTO_GRAFICA } from "@idce/kit";',
    usar: [
      "Series por corte (eje `time`), niveles de riesgo y umbrales como la cobertura ≥ 100 %.",
    ],
    evitar: [
      "`visualMap` por tramos en líneas con nulos: rompe `getVisualGradient` y tumba la gráfica.",
    ],
    ejemplos: [
      {
        id: "ayudas-ejemplo",
        titulo: "Serie con umbral",
        descripcion:
          "`punto`, `zoomTemporal(inicioZoom(n))`, `tooltipTemporal` y `estiloUmbral` juntos.",
        Componente: SerieConUmbral,
        codigo: codigoSerieConUmbral,
        ancho: true,
      },
    ],
    api: [{ titulo: "Funciones y constantes", props: API_AYUDAS }],
  },
];

const secciones = (p: PaginaPiezaProps) => [
  {
    key: idSeccion(p.id, "uso"),
    href: `#${idSeccion(p.id, "uso")}`,
    title: "Cuándo usarlo",
  },
  {
    key: idSeccion(p.id, "ejemplos"),
    href: `#${idSeccion(p.id, "ejemplos")}`,
    title: "Ejemplos",
  },
  ...(p.playground
    ? [
        {
          key: idSeccion(p.id, "playground"),
          href: `#${idSeccion(p.id, "playground")}`,
          title: "Playground",
        },
      ]
    : []),
  {
    key: idSeccion(p.id, "api"),
    href: `#${idSeccion(p.id, "api")}`,
    title: "API",
  },
];

/**
 * Sección Gráficos de la guía, al estilo de la documentación de antd: por pieza, cuándo usarla,
 * ejemplos vivos con su código, playground y API. Piloto para decidir si se extiende al resto.
 */
const GuiaGraficos = () => (
  // Mismo tema y locale que `VistaAnalitica`: los ejemplos se ven como dentro de una vista real.
  <ConfigProvider locale={esES} theme={TEMA_ANALITICA}>
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_12rem] gap-6">
      <div className="flex flex-col gap-10 min-w-0">
        <div className="rounded-contenedor bg-superficie shadow-contenedor p-4 flex flex-col gap-1">
          <h1 className="m-0 text-titulo font-semibold text-tinta">Gráficas</h1>
          <p className="m-0 text-cuerpo text-tinta-secundaria">
            Toda gráfica va en <code>TarjetaGrafica</code>, con las opciones de
            ECharts en funciones puras. Cada ejemplo es el archivo que se está
            ejecutando: «Ver código» muestra exactamente eso y se puede copiar.
            Los datos vienen de los mocks de la guía (
            <code>@/mocks/analitica</code>); en un sistema serán los de su
            servicio.
          </p>
        </div>
        {PIEZAS.map((p) => (
          <div
            key={p.id}
            className="rounded-contenedor bg-superficie shadow-contenedor p-4"
          >
            <PaginaPieza {...p} />
          </div>
        ))}
      </div>
      <aside className="hidden xl:block">
        <Anchor
          offsetTop={72}
          targetOffset={80}
          items={PIEZAS.map((p) => ({
            key: p.id,
            href: `#${p.id}`,
            title: p.nombre,
            children: secciones(p),
          }))}
        />
      </aside>
    </div>
  </ConfigProvider>
);

export default GuiaGraficos;
