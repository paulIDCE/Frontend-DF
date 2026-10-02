import { Tag, Tooltip } from "antd";
import { useService } from "@idce/kit";
import { apiRanking } from "@/services/apiDatos";
import { archivoEntidad } from "@/services/datosService";
import { useRevista } from "./RevistaContext";
import { indicador, sentidoDe } from "./catalogoIndicadores";
import { ordenarPorIndicador, percentilFavorable } from "./grupoPar";

/**
 * Distintivo "P68 del grupo" (plan 06, item 1.16): percentil favorable de la entidad entre las de
 * su mismo sector (`Tamaño`) en el corte, calculado con `GET /api/rankings`. Verde en el cuartil
 * favorable, ambar entre P25 y P75, rojo en el desfavorable. En la fase 2 lo reemplaza
 * `GET /api/benchmarks` (item 2.8).
 */

const cargar = (code: string, fecha: string, entidad: string) =>
  apiRanking({ cuenta: code, fecha, agrupacion: "sector", entidad: archivoEntidad(entidad) });

/** Sin grupo par no se muestra el distintivo: el fallo no se avisa (estable: va en las deps de `useService`). */
const ignorar = () => undefined;

export const PosicionGrupo = ({ code }: { code: string }) => {
  const { ctx, entidad, tamano } = useRevista();
  const { data } = useService(cargar, [code, ctx.fecha, entidad], [], true, "", ignorar);
  if (!data) return null;
  const esRatio = (indicador(code)?.unidad ?? "%") === "%";
  const filas = ordenarPorIndicador(data, sentidoDe(code), esRatio);
  const r = percentilFavorable(filas, entidad);
  if (!r) return null;
  const p = Math.round(r.percentil);
  const tono = p >= 75 ? "success" : p >= 25 ? "warning" : "error";
  return (
    <Tooltip
      title={`Percentil ${p} entre las ${r.n} entidades de ${tamano} (${sentidoDe(code) === "sube" ? "mayor" : "menor"} es mejor). P100 = la mejor del grupo.`}
    >
      <Tag color={tono} className="m-0 cursor-help">
        P{p} del grupo
      </Tag>
    </Tooltip>
  );
};
