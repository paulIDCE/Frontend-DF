import type { GraficoInforme, InformeEstructurado } from "@/services/agenteService";
import { color, tipografia } from "@idce/kit";
import { altoGrafico, opcionGrafico } from "../graficosInforme";

/**
 * Graficos del informe como PNG para Word y PDF: la misma `option` que en pantalla, dibujada en
 * un ECharts fuera de pantalla y sin animacion. Se dibujan una vez por descarga.
 */

export interface ImagenGrafico {
  /** `data:image/png;base64,…` */
  png: string;
  /** Tamaño logico en px (la imagen sale al doble para que se vea nitida al imprimir). */
  ancho: number;
  alto: number;
}

/** Ancho de dibujo: cerca del ancho util de A4 para que las letras queden a su tamaño. */
const ANCHO = 720;

export const renderizarGraficos = async (informe: InformeEstructurado): Promise<Map<GraficoInforme, ImagenGrafico>> => {
  const echarts = await import("echarts");
  const imagenes = new Map<GraficoInforme, ImagenGrafico>();
  const lienzo = document.createElement("div");
  lienzo.style.cssText = "position:absolute;left:-20000px;top:0;";
  document.body.appendChild(lienzo);
  try {
    for (const g of informe.secciones.flatMap((s) => s.graficos)) {
      const alto = altoGrafico(g);
      const div = document.createElement("div");
      div.style.cssText = `width:${ANCHO}px;height:${alto}px;`;
      lienzo.appendChild(div);
      const grafico = echarts.init(div, null, { renderer: "canvas", width: ANCHO, height: alto });
      try {
        grafico.setOption({
          color: [...color.datos.series],
          textStyle: { fontFamily: tipografia.familia.sans, color: color.tinta.secundaria },
          ...opcionGrafico(g),
          animation: false,
        });
        imagenes.set(g, { png: grafico.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: color.superficie.base }), ancho: ANCHO, alto });
      } finally {
        grafico.dispose();
        div.remove();
      }
    }
  } finally {
    lienzo.remove();
  }
  return imagenes;
};
