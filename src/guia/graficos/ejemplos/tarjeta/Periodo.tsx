import { useMemo, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  TarjetaGrafica,
  TEXTO_GRAFICA,
  estiloUmbral,
  fmtPct,
  punto,
  tooltipTemporal,
  zoomTemporal,
  type PuntoTemporal,
  type SeleccionPeriodo,
} from "@idce/kit";
import { MOCK_CORTES } from "@/mocks/analitica";

const serie = (campo: "mora" | "cobertura", extra: object = {}) => ({
  grid: { left: 44, right: 16, top: 16, bottom: 44 },
  tooltip: tooltipTemporal((item: { data: PuntoTemporal }) =>
    fmtPct(item.data[1]),
  ),
  xAxis: { type: "time", axisLabel: TEXTO_GRAFICA },
  yAxis: {
    type: "value",
    scale: true,
    axisLabel: { formatter: "{value}%", ...TEXTO_GRAFICA },
  },
  dataZoom: zoomTemporal(),
  series: [
    {
      name: campo,
      type: "line",
      unitType: "percent",
      data: MOCK_CORTES.map((c) => punto(`${c.fechaCorte}T12:00:00`, c[campo])),
      ...extra,
    },
  ],
});

type Rango = { desde: number | null; hasta: number | null };

/**
 * Modo periodo: el rango es de la vista. Las dos gráficas y el selector de fechas leen y escriben
 * el mismo estado, así que quedan sincronizados. Asas: extender el inicio o el fin, mover la franja.
 */
const Periodo = () => {
  const mora = useMemo(() => serie("mora", { smooth: true }), []);
  const cobertura = useMemo(
    () => serie("cobertura", estiloUmbral({ umbral: 100 })),
    [],
  );
  const [rango, setRango] = useState<Rango>({ desde: null, hasta: null });
  const seleccion: SeleccionPeriodo = {
    ...rango,
    onCambiar: (desde, hasta) => setRango({ desde, hasta }),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap text-detalle text-tinta-secundaria">
        Periodo del aprendizaje:
        <DatePicker.RangePicker
          size="small"
          value={
            rango.desde != null && rango.hasta != null
              ? [dayjs(rango.desde), dayjs(rango.hasta)]
              : null
          }
          onChange={(f) =>
            setRango(
              f?.[0] && f[1]
                ? {
                    desde: f[0].startOf("day").valueOf(),
                    hasta: f[1].endOf("day").valueOf(),
                  }
                : { desde: null, hasta: null },
            )
          }
        />
        <span className="text-tinta-tenue">
          (o arrastra sobre cualquiera de las dos curvas)
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <TarjetaGrafica
          titulo="Mora"
          option={mora}
          alto={220}
          seleccionRango={seleccion}
        />
        <TarjetaGrafica
          titulo="Cobertura"
          option={cobertura}
          alto={220}
          seleccionRango={seleccion}
        />
      </div>
    </div>
  );
};

export default Periodo;
