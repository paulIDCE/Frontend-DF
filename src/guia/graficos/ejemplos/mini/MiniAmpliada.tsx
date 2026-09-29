import { useMemo } from "react";
import {
  MiniGrafica,
  RejillaGraficas,
  TEXTO_GRAFICA,
  fmtFechaID,
  fmtPct,
} from "@idce/kit";
import { MOCK_CORTES, MOCK_OFICINAS } from "@/mocks/analitica";
import type { OficinaMock } from "@/mocks/analitica";

const CORTES = MOCK_CORTES.slice(-12);
const OFICINAS = MOCK_OFICINAS.slice(0, 3);

const opcionesMini = (o: OficinaMock) => ({
  grid: { left: 8, right: 12, top: 16, bottom: 4, containLabel: true },
  tooltip: {
    trigger: "axis",
    confine: true,
    valueFormatter: (v: number) => fmtPct(v),
  },
  xAxis: {
    type: "category",
    data: CORTES.map((c) => fmtFechaID(c.fechaCorteID, "MMM")),
    axisLabel: TEXTO_GRAFICA,
  },
  yAxis: {
    type: "value",
    scale: true,
    axisLabel: { formatter: "{value}%", ...TEXTO_GRAFICA },
  },
  series: [
    {
      name: "Mora",
      type: "line",
      unitType: "percent",
      smooth: true,
      data: CORTES.map((c) =>
        Number((o.mora + (c.mora - 4.2) * 0.6).toFixed(2)),
      ),
    },
  ],
});

/**
 * A 200 px no se lee una segunda serie; en grande sí. La función recibe la `option` de la mini y
 * añade la mora de la red, leyenda y slider. El botón de etiquetas de la mini actúa también aquí.
 */
const ampliar = (option: ReturnType<typeof opcionesMini>) => ({
  ...option,
  grid: { ...option.grid, top: 32, bottom: 36 },
  legend: { top: 0, textStyle: TEXTO_GRAFICA },
  dataZoom: [{ type: "slider", bottom: 6, height: 16 }, { type: "inside" }],
  series: [
    ...option.series,
    {
      name: "Mora de la red",
      type: "line",
      unitType: "percent",
      lineStyle: { type: "dashed" },
      data: CORTES.map((c) => c.mora),
    },
  ],
});

const MiniAmpliada = () => {
  const opciones = useMemo(() => OFICINAS.map((o) => opcionesMini(o)), []);
  return (
    <RejillaGraficas columnasMaximas={3}>
      {OFICINAS.map((o, i) => (
        <MiniGrafica
          key={o.oficinaID}
          titulo={o.nombre}
          option={opciones[i]}
          opcionPantallaCompleta={ampliar}
        />
      ))}
    </RejillaGraficas>
  );
};

export default MiniAmpliada;
