import { useMemo } from "react";
import {
  TarjetaGrafica,
  TEXTO_GRAFICA,
  fmtPct,
  punto,
  tooltipTemporal,
  zoomTemporal,
  type PuntoTemporal,
} from "@idce/kit";
import { MOCK_CORTES } from "@/mocks/analitica";

const opcionesMora = () => ({
  grid: { left: 40, right: 16, top: 16, bottom: 24 },
  tooltip: tooltipTemporal((item: { data: PuntoTemporal }) =>
    fmtPct(item.data[1]),
  ),
  xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
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
      data: MOCK_CORTES.map((c) => punto(`${c.fechaCorte}T12:00:00`, c.mora)),
    },
  ],
});

/**
 * En grande cabe más: la función recibe la `option` de la tarjeta y devuelve la de la pantalla
 * completa (aquí, etiquetas y slider). "Restablecer zoom" solo aparece en pantalla completa,
 * que es la que tiene `dataZoom`.
 */
const ampliar = (option: ReturnType<typeof opcionesMora>) => ({
  ...option,
  grid: { ...option.grid, bottom: 44, top: 28 },
  dataZoom: zoomTemporal(),
  series: option.series.map((s) => ({
    ...s,
    label: {
      show: true,
      ...TEXTO_GRAFICA,
      formatter: (p: { data: PuntoTemporal }) => fmtPct(p.data[1], 1),
    },
  })),
});

const PantallaCompleta = () => {
  const option = useMemo(() => opcionesMora(), []);
  return (
    <TarjetaGrafica
      titulo="Mora · la pantalla completa trae más"
      subtitulo="Abre la pantalla completa (esquina superior derecha)"
      option={option}
      alto={200}
      opcionPantallaCompleta={ampliar}
    />
  );
};

export default PantallaCompleta;
