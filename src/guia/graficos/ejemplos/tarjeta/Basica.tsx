import { useMemo } from "react";
import {
  TarjetaGrafica,
  TEXTO_GRAFICA,
  fmtPct,
  punto,
  tooltipTemporal,
  type PuntoTemporal,
} from "@idce/kit";
import { MOCK_CORTES } from "@/mocks/analitica";

// Las opciones de ECharts van en funciones puras que reciben datos ya normalizados.
const opcionesCobertura = (
  cortes: { fechaCorte: string; cobertura: number }[],
) => ({
  grid: { left: 44, right: 16, top: 16, bottom: 28 },
  tooltip: tooltipTemporal((item: { data: PuntoTemporal }) =>
    fmtPct(item.data[1]),
  ),
  xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
  yAxis: {
    type: "value",
    min: 60,
    axisLabel: { formatter: "{value}%", ...TEXTO_GRAFICA },
  },
  // Sin `color`: la tarjeta aplica la paleta de series de los tokens en orden fijo.
  series: [
    {
      name: "Cobertura",
      type: "line",
      unitType: "percent",
      data: cortes.map((c) => punto(`${c.fechaCorte}T12:00:00`, c.cobertura)),
    },
  ],
});

const Basica = () => {
  const option = useMemo(() => opcionesCobertura(MOCK_CORTES), []);
  return (
    <TarjetaGrafica
      titulo="Cobertura de provisiones"
      subtitulo="Últimos 36 cortes"
      option={option}
      alto={220}
    />
  );
};

export default Basica;
