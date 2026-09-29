import { useMemo, useState } from "react";
import { Tag } from "antd";
import {
  TarjetaGrafica,
  TEXTO_GRAFICA,
  fmtFechaCompacta,
  fmtPct,
  franjasNiveles,
  inicioZoom,
  maximoEjeConNiveles,
  punto,
  tooltipTemporal,
  zoomTemporal,
  type PuntoTemporal,
} from "@idce/kit";
import { MOCK_CORTES, MOCK_NIVELES } from "@/mocks/analitica";

type ParamsPunto = { data: PuntoTemporal };

const opcionesMora = () => {
  const puntos = MOCK_CORTES.map((c) =>
    punto(`${c.fechaCorte}T12:00:00`, c.mora),
  );
  return {
    grid: { left: 44, right: 64, top: 16, bottom: 44 },
    tooltip: tooltipTemporal((item: ParamsPunto) => fmtPct(item.data[1])),
    xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
    // Sin esto la franja 0–100 % de los niveles aplasta la serie.
    yAxis: {
      type: "value",
      max: maximoEjeConNiveles(
        puntos.map((p) => p[1]),
        MOCK_NIVELES,
      ),
      axisLabel: { formatter: "{value}%", ...TEXTO_GRAFICA },
    },
    // Arranca en los últimos ~24 cortes; el slider deja ver el resto.
    dataZoom: zoomTemporal(inicioZoom(puntos.length)),
    series: [
      {
        name: "Mora",
        type: "line",
        unitType: "percent",
        data: puntos,
        smooth: true,
        symbolSize: 6,
        endLabel: {
          show: true,
          formatter: (p: ParamsPunto) => fmtPct(p.data[1]),
        },
        ...franjasNiveles(MOCK_NIVELES),
      },
    ],
  };
};

const Leyenda = () => (
  <div className="flex items-center gap-3 flex-wrap text-rotulo text-tinta-tenue">
    {MOCK_NIVELES.map((n) => (
      <span key={n.nivelRiesgoID} className="flex items-center gap-1">
        <span
          className="inline-block w-2.5 h-2.5 rounded-marca"
          style={{ backgroundColor: n.color }}
        />
        {n.nombre}
      </span>
    ))}
  </div>
);

const NivelesYClic = () => {
  const option = useMemo(() => opcionesMora(), []);
  const [corte, setCorte] = useState<string | null>(null);
  return (
    <TarjetaGrafica
      titulo="Evolución de la mora"
      subtitulo="Clic en un punto para ver el corte"
      option={option}
      alto={260}
      // El tercer elemento del punto es el yyyyMMdd: la clave para abrir el detalle.
      onClickPunto={(e: ParamsPunto) => setCorte(e.data[2])}
      extra={
        corte && (
          <Tag color="blue" className="!m-0">
            Corte {fmtFechaCompacta(corte)}
          </Tag>
        )
      }
      pie={<Leyenda />}
    />
  );
};

export default NivelesYClic;
