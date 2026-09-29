import { useMemo, useState } from "react";
import {
  TarjetaGrafica,
  color,
  opcionesMatrizCalor,
  type CeldaMatrizCalor,
} from "@idce/kit";

const EJES_X = ["Rara", "Poco frecuente", "Posible", "Probable", "Casi seguro"];
const EJES_Y = ["Insignificante", "Menor", "Moderado", "Mayor", "Catastrófico"];

// Color por celda (no `visualMap`): aquí, una escala por severidad con la paleta de series.
const ESCALA = [
  color.datos.series[2],
  color.datos.series[3],
  color.datos.series[1],
  color.datos.series[7],
  color.datos.series[6],
];
const celda = (x: number, y: number, valor: number): CeldaMatrizCalor => ({
  x,
  y,
  valor,
  color: ESCALA[Math.min(x + y - 2, ESCALA.length - 1)],
});

const CONTEOS = [
  [2, 4, 1, 0, 0],
  [3, 8, 5, 1, 0],
  [1, 6, 12, 4, 1],
  [0, 2, 7, 9, 3],
  [0, 0, 2, 5, 4],
];
const INHERENTE = CONTEOS.flatMap((fila, y) =>
  fila.map((valor, x) => celda(x + 1, y + 1, valor)),
);
const RESIDUAL = INHERENTE.map((c) => ({
  ...c,
  valor: Math.max(0, c.valor - 2),
}));

type Par = { x: number; y: number };

const opcion = (
  celdas: CeldaMatrizCalor[],
  etiqueta: string,
  resalte: Par & { etiqueta: string },
) =>
  opcionesMatrizCalor({
    celdas,
    ejesX: EJES_X,
    ejesY: EJES_Y,
    nombreEjeX: "Frecuencia",
    nombreEjeY: "Impacto",
    etiquetaTooltip: etiqueta,
    resalte,
  });

/** Clic en una celda: resalta el mismo par en las dos matrices. */
const InherenteResidual = () => {
  const [resalte, setResalte] = useState<Par>({ x: 3, y: 3 });
  const inherente = useMemo(
    () => opcion(INHERENTE, "Inherente", { ...resalte, etiqueta: "RI" }),
    [resalte],
  );
  const residual = useMemo(
    () => opcion(RESIDUAL, "Residual", { ...resalte, etiqueta: "RR" }),
    [resalte],
  );
  const alClic = (e: { data?: Partial<Par> }) => {
    if (e.data?.x != null && e.data.y != null)
      setResalte({ x: e.data.x, y: e.data.y });
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <TarjetaGrafica
        titulo="Mapa inherente"
        subtitulo="Clic en una celda"
        option={inherente}
        alto={280}
        onClickPunto={alClic}
        // Conteos por celda, no una serie de valores: las estadísticas no aplican.
        estadisticas={false}
      />
      <TarjetaGrafica
        titulo="Mapa residual"
        subtitulo="Misma escala, conteos distintos"
        option={residual}
        alto={280}
        onClickPunto={alClic}
        // Conteos por celda, no una serie de valores: las estadísticas no aplican.
        estadisticas={false}
      />
    </div>
  );
};

export default InherenteResidual;
