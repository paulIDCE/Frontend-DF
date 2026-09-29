import { useMemo } from "react";
import {
  TarjetaGrafica,
  TEXTO_GRAFICA,
  estiloUmbral,
  fmtPct,
  inicioZoom,
  punto,
  tooltipTemporal,
  zoomTemporal,
  type PuntoTemporal,
} from "@idce/kit";
import { MOCK_CORTES } from "@/mocks/analitica";

/**
 * Las ayudas de `opcionesBase` en una serie temporal:
 * - `punto(fecha, valor)` → `[fechaISO, valor, yyyyMMdd]`. Con fechas `yyyy-MM-dd`, añadir la hora
 *   (`T12:00:00`): sin ella se leen como medianoche UTC y en Ecuador caen el día anterior.
 * - `zoomTemporal(inicioZoom(n))`: slider + rueda, arrancando en los últimos ~24 cortes.
 * - `tooltipTemporal(formato)`: fecha del corte + valor formateado.
 * - `estiloUmbral({ umbral })`: verde desde el umbral, rojo por debajo y línea de referencia.
 */
const opcionesCobertura = () => {
  const puntos = MOCK_CORTES.map((c) =>
    punto(`${c.fechaCorte}T12:00:00`, c.cobertura),
  );
  return {
    grid: { left: 44, right: 24, top: 16, bottom: 44 },
    tooltip: tooltipTemporal((item: { data: PuntoTemporal }) =>
      fmtPct(item.data[1]),
    ),
    xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
    yAxis: {
      type: "value",
      min: 60,
      axisLabel: { formatter: "{value}%", ...TEXTO_GRAFICA },
    },
    dataZoom: zoomTemporal(inicioZoom(puntos.length)),
    series: [
      {
        name: "Cobertura",
        type: "line",
        unitType: "percent",
        data: puntos,
        symbolSize: 7,
        ...estiloUmbral({ umbral: 100 }),
      },
    ],
  };
};

const SerieConUmbral = () => {
  const option = useMemo(() => opcionesCobertura(), []);
  return (
    <TarjetaGrafica
      titulo="Cobertura de provisiones"
      subtitulo="Verde desde el 100 %, rojo por debajo"
      option={option}
      alto={260}
    />
  );
};

export default SerieConUmbral;
