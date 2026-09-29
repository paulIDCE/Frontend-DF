import { useMemo, useState } from "react";
import { Segmented } from "antd";
import {
  TarjetaGrafica,
  TEXTO_GRAFICA,
  fmtMonedaCorta,
  punto,
  type EjesZoom,
} from "@idce/kit";
import { MOCK_CORTES } from "@/mocks/analitica";

const opcionesSaldo = () => ({
  grid: { left: 8, right: 24, top: 16, bottom: 8, containLabel: true },
  tooltip: { trigger: "axis", confine: true, valueFormatter: fmtMonedaCorta },
  xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
  yAxis: {
    type: "value",
    scale: true,
    axisLabel: { formatter: fmtMonedaCorta, ...TEXTO_GRAFICA },
  },
  series: [
    {
      name: "Saldo",
      type: "line",
      unitType: "money",
      symbolSize: 5,
      data: MOCK_CORTES.map((c) =>
        punto(`${c.fechaCorte}T12:00:00`, Math.round(c.saldo)),
      ),
    },
  ],
});

/**
 * Modo zoom: lo seleccionado acota la gráfica (no avisa a la vista). "Restablecer zoom" aparece
 * solo. La pantalla completa comparte el zoom: agrandar, seleccionar y cerrar.
 */
const ZoomSeleccion = () => {
  const option = useMemo(() => opcionesSaldo(), []);
  const [ejes, setEjes] = useState<EjesZoom>("x");
  return (
    <TarjetaGrafica
      titulo="Saldo de la cartera"
      subtitulo="Arrastra sobre la gráfica para acotarla"
      option={option}
      alto={220}
      seleccionRango={{ modo: "zoom", ejes }}
      extra={
        <Segmented
          size="small"
          value={ejes}
          onChange={(v) => setEjes(v as EjesZoom)}
          options={[
            { label: "X", value: "x" },
            { label: "Y", value: "y" },
            { label: "X e Y", value: "xy" },
          ]}
        />
      }
    />
  );
};

export default ZoomSeleccion;
