import { useMemo, useState } from "react";
import { Segmented } from "antd";
import {
  TarjetaGrafica,
  TEXTO_GRAFICA,
  fmtMonedaCorta,
  radio,
} from "@idce/kit";
import { MOCK_OFICINAS } from "@/mocks/analitica";

const opcionesSaldo = () => ({
  grid: { left: 8, right: 16, top: 8, bottom: 8, containLabel: true },
  tooltip: { trigger: "axis", confine: true },
  xAxis: {
    type: "value",
    axisLabel: { formatter: fmtMonedaCorta, ...TEXTO_GRAFICA },
  },
  yAxis: {
    type: "category",
    inverse: true,
    data: MOCK_OFICINAS.map((o) => o.nombre),
    axisLabel: TEXTO_GRAFICA,
  },
  series: [
    {
      name: "Saldo",
      type: "bar",
      unitType: "money",
      data: MOCK_OFICINAS.map((o) => Math.round(o.saldo)),
      itemStyle: { borderRadius: [0, radio.control, radio.control, 0] },
    },
  ],
});

type Estado = "Con datos" | "Cargando" | "Sin datos";

/** `cargando` pinta un spinner; `option={null}` el estado vacío con `textoVacio`. `compacta` achica la cabecera. */
const Estados = () => {
  const option = useMemo(() => opcionesSaldo(), []);
  const [estado, setEstado] = useState<Estado>("Con datos");
  return (
    <div className="flex flex-col gap-2">
      <Segmented<Estado>
        size="small"
        value={estado}
        onChange={setEstado}
        options={["Con datos", "Cargando", "Sin datos"]}
      />
      <TarjetaGrafica
        titulo="Saldo por oficina"
        subtitulo="Compacta"
        option={estado === "Sin datos" ? null : option}
        cargando={estado === "Cargando"}
        textoVacio="Sin saldo en el corte elegido"
        alto={200}
        compacta
      />
    </div>
  );
};

export default Estados;
