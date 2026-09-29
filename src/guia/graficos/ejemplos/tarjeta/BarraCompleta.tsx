import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  TablaDatosModal,
  TarjetaGrafica,
  TEXTO_GRAFICA,
  exportarExcel,
  fmtFechaID,
  fmtMonedaCorta,
  fmtPct,
} from "@idce/kit";
import { MOCK_CORTES } from "@/mocks/analitica";
import type { CorteMock } from "@/mocks/analitica";

const CORTES = MOCK_CORTES.slice(-12);

/** La vista rearma la opción: en % o en monto, con o sin etiquetas. */
const opcionesVencida = (enPorcentaje: boolean, conEtiquetas: boolean) => ({
  grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
  tooltip: { trigger: "axis", confine: true },
  xAxis: {
    type: "category",
    data: CORTES.map((c) => fmtFechaID(c.fechaCorteID, "MMM-yy")),
    axisLabel: TEXTO_GRAFICA,
  },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: enPorcentaje ? "{value}%" : fmtMonedaCorta,
      ...TEXTO_GRAFICA,
    },
  },
  series: [
    {
      name: enPorcentaje ? "Mora (%)" : "Cartera vencida",
      type: "bar",
      unitType: enPorcentaje ? "percent" : "money",
      data: CORTES.map((c) =>
        enPorcentaje ? c.mora : Math.round((c.saldo * c.mora) / 100),
      ),
      label: {
        show: conEtiquetas,
        position: "top",
        ...TEXTO_GRAFICA,
        formatter: (p: { value: number }) =>
          enPorcentaje ? fmtPct(p.value, 1) : fmtMonedaCorta(p.value),
      },
    },
  ],
});

const columnas: ColumnsType<CorteMock> = [
  {
    title: "Corte",
    key: "corte",
    render: (_, c) => fmtFechaID(c.fechaCorteID, "MMM-yyyy"),
  },
  {
    title: "Cartera vencida",
    key: "vencida",
    align: "right",
    render: (_, c) => fmtMonedaCorta((c.saldo * c.mora) / 100),
  },
  {
    title: "Mora",
    key: "mora",
    align: "right",
    render: (_, c) => fmtPct(c.mora),
  },
];

// "Ver datos" siempre lleva el Excel: la descarga usa las mismas columnas que la tabla.
const descargar = () =>
  exportarExcel("Cartera_vencida", [
    {
      nombre: "Cartera vencida",
      filas: CORTES,
      columnas: [
        { titulo: "Corte", valor: (c) => fmtFechaID(c.fechaCorteID) },
        {
          titulo: "Cartera vencida",
          valor: (c) => (c.saldo * c.mora) / 100,
          formato: "moneda",
          ancho: 20,
        },
        { titulo: "Mora (%)", valor: (c) => c.mora, formato: "porcentaje" },
      ],
    },
  ]);

const BarraCompleta = () => {
  const [enPorcentaje, setEnPorcentaje] = useState(false);
  const [etiquetas, setEtiquetas] = useState(false);
  const [verDatos, setVerDatos] = useState(false);
  const option = useMemo(
    () => opcionesVencida(enPorcentaje, etiquetas),
    [enPorcentaje, etiquetas],
  );

  return (
    <>
      <TarjetaGrafica
        titulo="Cartera vencida por corte"
        subtitulo="Etiquetas, % / valores, barras ↔ líneas, ver datos y Excel"
        option={option}
        alto={220}
        etiquetas={{
          activas: etiquetas,
          alternar: () => setEtiquetas((v) => !v),
        }}
        porcentajes={{
          activos: enPorcentaje,
          alternar: () => setEnPorcentaje((v) => !v),
        }}
        cambioTipo
        onVerDatos={() => setVerDatos(true)}
        onDescargarDatos={descargar}
        nombreImagen="cartera_vencida"
      />
      <TablaDatosModal
        abierto={verDatos}
        titulo="Cartera vencida por corte"
        columnas={columnas}
        filas={CORTES}
        rowKey={(c) => String(c.fechaCorteID)}
        onDescargar={descargar}
        onClose={() => setVerDatos(false)}
      />
    </>
  );
};

export default BarraCompleta;
