import { useMemo, useState } from "react";
import { Switch } from "antd";
import {
  MiniGrafica,
  RejillaGraficas,
  TEXTO_GRAFICA,
  fmtMonedaCorta,
  radio,
} from "@idce/kit";
import { MOCK_OFICINAS } from "@/mocks/analitica";

const DESTINOS = ["Consumo", "Microcrédito", "Vivienda", "Productivo"];

const opcionesDestino = (i: number) => ({
  grid: { left: 8, right: 8, top: 18, bottom: 4, containLabel: true },
  tooltip: { trigger: "axis", confine: true, valueFormatter: fmtMonedaCorta },
  xAxis: {
    type: "category",
    data: MOCK_OFICINAS.slice(0, 5).map((o) => o.nombre.slice(0, 3)),
    axisLabel: TEXTO_GRAFICA,
  },
  yAxis: {
    type: "value",
    axisLabel: { formatter: fmtMonedaCorta, ...TEXTO_GRAFICA },
  },
  series: [
    {
      name: DESTINOS[i],
      type: "bar",
      unitType: "money",
      data: MOCK_OFICINAS.slice(0, 5).map((o) =>
        Math.round(o.saldo * (0.15 + i * 0.1)),
      ),
      itemStyle: { borderRadius: [radio.control, radio.control, 0, 0] },
      label: {
        position: "top",
        ...TEXTO_GRAFICA,
        formatter: (p: { value: number }) => fmtMonedaCorta(p.value),
      },
    },
  ],
});

/**
 * `etiquetas` controlado: un interruptor de la vista las enciende en toda la rejilla. Sin él, cada
 * mini maneja las suyas (`etiquetasIniciales`).
 */
const EtiquetasRejilla = () => {
  const opciones = useMemo(
    () => DESTINOS.map((_, i) => opcionesDestino(i)),
    [],
  );
  const [todas, setTodas] = useState(false);
  const etiquetas = { activas: todas, alternar: () => setTodas((v) => !v) };
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-detalle text-tinta-secundaria">
        <Switch size="small" checked={todas} onChange={setTodas} /> Etiquetas en
        toda la rejilla
      </label>
      <RejillaGraficas columnasMaximas={2} anchoMinimo={200}>
        {DESTINOS.map((d, i) => (
          <MiniGrafica
            key={d}
            titulo={d}
            alto={160}
            // Con `etiquetas` la vista rearma la opción: aquí basta con encender `label.show`.
            option={{
              ...opciones[i],
              series: opciones[i].series.map((s) => ({
                ...s,
                label: { ...s.label, show: todas },
              })),
            }}
            etiquetas={etiquetas}
          />
        ))}
      </RejillaGraficas>
    </div>
  );
};

export default EtiquetasRejilla;
