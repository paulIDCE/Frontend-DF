import { ReactNode, useMemo, useState } from "react";
import { InputNumber, Segmented, Slider, Switch } from "antd";
import {
  MiniGrafica,
  RejillaGraficas,
  TEXTO_GRAFICA,
  fmtFechaID,
  fmtPct,
} from "@idce/kit";
import BloqueCodigo from "../../componentes/BloqueCodigo";
import { MOCK_CORTES, MOCK_OFICINAS } from "@/mocks/analitica";
import type { OficinaMock } from "@/mocks/analitica";

const CORTES = MOCK_CORTES.slice(-12);
type Estado = "datos" | "cargando" | "error";

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
      data: CORTES.map((c, i) =>
        Number(
          (
            o.mora +
            (c.mora - 4.2) * 0.6 +
            Math.sin(i + o.oficinaID) * 0.3
          ).toFixed(2),
        ),
      ),
      label: {
        position: "top",
        ...TEXTO_GRAFICA,
        formatter: (p: { value: number }) => fmtPct(p.value, 1),
      },
    },
  ],
});

const Control = ({
  etiqueta,
  prop,
  children,
}: {
  etiqueta: string;
  prop?: string;
  children: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3 min-h-7">
    <span className="text-detalle text-tinta">
      {etiqueta}
      {prop && (
        <code className="ml-1 text-rotulo text-tinta-tenue">{prop}</code>
      )}
    </span>
    {children}
  </div>
);

const PlaygroundMini = () => {
  const [cantidad, setCantidad] = useState(6);
  const [columnasMaximas, setColumnasMaximas] = useState<number | null>(3);
  const [anchoMinimo, setAnchoMinimo] = useState(220);
  const [alto, setAlto] = useState(200);
  const [etiquetasIniciales, setEtiquetasIniciales] = useState(false);
  const [estado, setEstado] = useState<Estado>("datos");
  const oficinas = MOCK_OFICINAS.slice(0, cantidad);
  const opciones = useMemo(
    () => new Map(MOCK_OFICINAS.map((o) => [o.oficinaID, opcionesMini(o)])),
    [],
  );

  const codigo = [
    `<RejillaGraficas${columnasMaximas ? ` columnasMaximas={${columnasMaximas}}` : ""}${anchoMinimo !== 220 ? ` anchoMinimo={${anchoMinimo}}` : ""}>`,
    "  {oficinas.map((o) => (",
    "    <MiniGrafica",
    "      key={o.oficinaID}",
    "      titulo={o.nombre}",
    `      option={${estado === "error" ? "null" : "opciones.get(o.oficinaID) ?? null"}}`,
    estado === "error" && "      error",
    estado === "cargando" && "      cargando",
    alto !== 200 && `      alto={${alto}}`,
    etiquetasIniciales && "      etiquetasIniciales",
    "    />",
    "  ))}",
    "</RejillaGraficas>",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="grid grid-cols-1 @2xl:grid-cols-[16rem_minmax(0,1fr)] gap-4 rounded-tarjeta border border-linea bg-superficie p-4">
      <div className="flex flex-col gap-1">
        <Control etiqueta="Elementos">
          <InputNumber
            size="small"
            min={1}
            max={MOCK_OFICINAS.length}
            value={cantidad}
            onChange={(v) => setCantidad(v ?? 1)}
          />
        </Control>
        <Control etiqueta="Columnas máx." prop="columnasMaximas">
          <InputNumber
            size="small"
            min={1}
            max={6}
            placeholder="sin tope"
            value={columnasMaximas}
            onChange={setColumnasMaximas}
          />
        </Control>
        <Control etiqueta="Ancho mínimo" prop="anchoMinimo">
          <Slider
            className="!w-32 !my-1"
            min={160}
            max={400}
            step={20}
            value={anchoMinimo}
            onChange={setAnchoMinimo}
          />
        </Control>
        <Control etiqueta="Alto" prop="alto">
          <Slider
            className="!w-32 !my-1"
            min={140}
            max={280}
            step={20}
            value={alto}
            onChange={setAlto}
          />
        </Control>
        <Control etiqueta="Etiquetas al inicio" prop="etiquetasIniciales">
          <Switch
            size="small"
            checked={etiquetasIniciales}
            onChange={setEtiquetasIniciales}
          />
        </Control>
        <Control etiqueta="Estado">
          <Segmented<Estado>
            size="small"
            value={estado}
            onChange={setEstado}
            options={[
              { label: "Datos", value: "datos" },
              { label: "Cargando", value: "cargando" },
              { label: "Error", value: "error" },
            ]}
          />
        </Control>
        <p className="mt-2 mb-0 text-rotulo text-tinta-tenue">
          Con un ancho mínimo grande la rejilla pasa a una fila con scroll
          horizontal cuando no caben dos columnas.
        </p>
      </div>
      <div className="flex flex-col gap-3 min-w-0">
        <RejillaGraficas
          columnasMaximas={columnasMaximas ?? undefined}
          anchoMinimo={anchoMinimo}
        >
          {oficinas.map((o) => (
            <MiniGrafica
              // `key` con las iniciales: `etiquetasIniciales` solo se lee al montar.
              key={`${o.oficinaID}-${etiquetasIniciales}`}
              titulo={o.nombre}
              option={
                estado === "error" ? null : (opciones.get(o.oficinaID) ?? null)
              }
              error={estado === "error"}
              cargando={estado === "cargando"}
              alto={alto}
              etiquetasIniciales={etiquetasIniciales}
            />
          ))}
        </RejillaGraficas>
        <BloqueCodigo codigo={codigo} />
      </div>
    </div>
  );
};

export default PlaygroundMini;
