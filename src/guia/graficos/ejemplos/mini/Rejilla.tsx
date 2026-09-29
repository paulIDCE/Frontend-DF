import { useMemo, useState } from "react";
import { Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CeldaNivel,
  MiniGrafica,
  RejillaGraficas,
  TablaDatosModal,
  TEXTO_GRAFICA,
  exportarExcel,
  fmtFechaID,
  fmtPct,
} from "@idce/kit";
import { MOCK_CORTES, MOCK_NIVELES, MOCK_OFICINAS } from "@/mocks/analitica";
import type { OficinaMock } from "@/mocks/analitica";

const CORTES = MOCK_CORTES.slice(-12);

const moraOficina = (o: OficinaMock) =>
  CORTES.map((c, i) =>
    Number(
      (o.mora + (c.mora - 4.2) * 0.6 + Math.sin(i + o.oficinaID) * 0.3).toFixed(
        2,
      ),
    ),
  );

/** Grid y ejes mínimos. Las etiquetas traen formato y arrancan apagadas: el botón de la mini cambia `show`. */
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
      symbolSize: 4,
      data: moraOficina(o),
      label: {
        position: "top",
        ...TEXTO_GRAFICA,
        formatter: (p: { value: number }) => fmtPct(p.value, 1),
      },
    },
  ],
});

type Fila = { fechaCorteID: number; mora: number };
const columnas: ColumnsType<Fila> = [
  {
    title: "Corte",
    key: "corte",
    render: (_, f) => fmtFechaID(f.fechaCorteID, "MMM-yyyy"),
  },
  {
    title: "Mora",
    key: "mora",
    align: "right",
    render: (_, f) => <CeldaNivel valor={f.mora} niveles={MOCK_NIVELES} />,
  },
];

// La oficina 3 simula una consulta fallida; la última, una oficina sin movimientos.
const CON_ERROR = 3;
const SIN_DATOS = MOCK_OFICINAS[MOCK_OFICINAS.length - 1].oficinaID;

/** Una mini por oficina. Un solo "Ver datos" para toda la rejilla: guarda qué oficina está abierta. */
const Rejilla = () => {
  const opciones = useMemo(
    () => new Map(MOCK_OFICINAS.map((o) => [o.oficinaID, opcionesMini(o)])),
    [],
  );
  const [cargando, setCargando] = useState(false);
  const [abierta, setAbierta] = useState<OficinaMock | null>(null);
  const filas = useMemo<Fila[]>(
    () =>
      abierta
        ? CORTES.map((c, i) => ({
            fechaCorteID: c.fechaCorteID,
            mora: moraOficina(abierta)[i],
          }))
        : [],
    [abierta],
  );
  const descargar = () =>
    abierta &&
    exportarExcel(`Mora_${abierta.nombre}`, [
      {
        nombre: abierta.nombre,
        filas,
        columnas: [
          { titulo: "Corte", valor: (f) => fmtFechaID(f.fechaCorteID) },
          { titulo: "Mora (%)", valor: (f) => f.mora, formato: "porcentaje" },
        ],
      },
    ]);

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="small"
        className="self-start"
        onClick={() => setCargando((v) => !v)}
      >
        {cargando ? "Terminar carga" : "Simular carga"}
      </Button>
      <RejillaGraficas columnasMaximas={4}>
        {MOCK_OFICINAS.map((o) => (
          <MiniGrafica
            key={o.oficinaID}
            titulo={o.nombre}
            option={
              o.oficinaID === CON_ERROR || o.oficinaID === SIN_DATOS
                ? null
                : opciones.get(o.oficinaID)
            }
            error={o.oficinaID === CON_ERROR}
            cargando={cargando}
            onVerDatos={() => setAbierta(o)}
            nombreImagen={`mora_${o.nombre}`}
          />
        ))}
      </RejillaGraficas>
      <TablaDatosModal
        abierto={!!abierta}
        titulo={`Mora · ${abierta?.nombre ?? ""}`}
        columnas={columnas}
        filas={filas}
        rowKey={(f) => String(f.fechaCorteID)}
        onDescargar={descargar}
        onClose={() => setAbierta(null)}
      />
    </div>
  );
};

export default Rejilla;
