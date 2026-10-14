import { Tag, Tooltip } from "antd";
import { DatabaseOutlined, FileTextOutlined, PartitionOutlined, WarningOutlined } from "@ant-design/icons";
import type { FilasPorFuente, FuenteDatos, FuenteDatosCuadro } from "@/types/api";
import { ETIQUETA_FUENTE, SIGLA_FUENTE, TEXTO_SIN_HISTORIA, detalleFuente } from "@/services/fuenteDatos";
import { propsColorChip } from "@idce/kit";

/**
 * Piezas visuales de la fuente de los datos (BD / JSON / mixto). Siempre visibles: sirven para decir
 * en una presentacion de donde sale cada cifra.
 */

const COLOR = { bd: "accion", json: "neutro", mixto: "identidad" } as const;
const ICONO = { bd: <DatabaseOutlined />, json: <FileTextOutlined />, mixto: <PartitionOutlined /> };

interface InsigniaFuenteProps {
  fuente: FuenteDatosCuadro | null | undefined;
  filasPorFuente?: FilasPorFuente;
  className?: string;
}

/** Insignia junto al titulo de un cuadro o reporte. Sin fuente (backend anterior) no pinta nada. */
export const InsigniaFuente = ({ fuente, filasPorFuente, className = "" }: InsigniaFuenteProps) => {
  if (!fuente) return null;
  return (
    // Pasar el raton o hacer clic (tactil, presentaciones) muestra el detalle.
    <Tooltip title={detalleFuente(fuente, filasPorFuente)} trigger={["hover", "click"]}>
      <Tag
        icon={ICONO[fuente]}
        role="button"
        tabIndex={0}
        aria-label={`Fuente de los datos: ${ETIQUETA_FUENTE[fuente]}. ${detalleFuente(fuente, filasPorFuente)}`}
        className={`m-0 shrink-0 cursor-pointer text-rotulo font-normal ${className}`}
        {...propsColorChip(COLOR[fuente])}
      >
        {ETIQUETA_FUENTE[fuente]}
      </Tag>
    </Tooltip>
  );
};

/**
 * Marca por fila. En cuadros mixtos siempre visible; en los de una sola fuente (`alPasar`) aparece
 * al pasar el raton por la fila, para no recargar la tabla.
 */
export const MarcaFuenteFila = ({ fuente, alPasar = false }: { fuente: FuenteDatos | null | undefined; alPasar?: boolean }) => {
  if (!fuente) return null;
  return (
    <Tooltip title={`Esta fila sale de: ${ETIQUETA_FUENTE[fuente]}${alPasar ? " (como todo el cuadro)" : ""}`}>
      <span
        className={`rounded-sm border px-1 text-rotulo font-normal not-italic leading-4 ${
          fuente === "bd" ? "border-accion text-accion" : "border-linea text-tinta-tenue"
        } ${alPasar ? "opacity-0 transition-opacity [.ant-table-row:hover_&]:opacity-100" : ""}`}
      >
        {SIGLA_FUENTE[fuente]}
      </span>
    </Tooltip>
  );
};

interface EstadoFuentesProps {
  /** `cuadrosPorFuente` de `/api/meta` (`undefined` con un backend anterior al contrato). */
  cuadros: { bd: number; json: number; mixto: number } | null | undefined;
  advertencias: string[];
}

/**
 * Resumen global de fuentes (`/api/meta`): cuantos cuadros salen de la BD, del JSON o de ambas, y
 * las advertencias del backend. Todo en `json` con advertencias = la BD no esta disponible.
 */
export const EstadoFuentes = ({ cuadros, advertencias }: EstadoFuentesProps) => {
  if (cuadros === undefined && !advertencias.length) return null;
  const sinBd = cuadros === null || (cuadros !== undefined && cuadros.bd + cuadros.mixto === 0);
  return (
    <div className="flex flex-col border-0 border-l border-solid border-linea pl-3">
      <span className="text-rotulo text-tinta-tenue">Fuente de los datos</span>
      <span className="flex items-center gap-2 text-detalle text-tinta">
        {sinBd ? (
          <span className="font-semibold text-advertencia">Base de datos no disponible: solo archivos JSON</span>
        ) : (
          cuadros && (
            <Tooltip title="Cuadros que salen solo de la base de datos, solo de archivos JSON o de ambas">
              <span>
                BD <strong>{cuadros.bd}</strong> · JSON <strong>{cuadros.json}</strong> · Mixto <strong>{cuadros.mixto}</strong>
              </span>
            </Tooltip>
          )
        )}
        {advertencias.length > 0 && (
          <Tooltip
            title={
              <ul className="m-0 pl-4">
                {advertencias.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            }
          >
            <WarningOutlined className="cursor-help text-advertencia" aria-label={`${advertencias.length} advertencias de los datos`} />
          </Tooltip>
        )}
      </span>
    </div>
  );
};

/** Celda vacia por falta de meses anteriores en la BD (no es un dato faltante). */
export const CeldaSinHistoria = () => (
  <Tooltip title={TEXTO_SIN_HISTORIA}>
    <span className="cursor-help text-tinta-deshabilitada">—</span>
  </Tooltip>
);
