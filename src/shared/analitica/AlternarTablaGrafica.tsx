import { ReactNode, useState } from "react";
import { Segmented } from "antd";
import FranjaSelectores from "./FranjaSelectores";

export type VistaDatos = "Tabla" | "Gráfica";

export interface AlternarTablaGraficaProps {
  tabla: ReactNode;
  grafica: ReactNode;
  /** Acciones que valen para los dos modos (p. ej. Excel). Van al final de la franja. */
  acciones?: ReactNode;
  /** Acciones que solo tienen sentido sobre la tabla (p. ej. `SelectorColumnas`): se ocultan en Gráfica. */
  accionesTabla?: ReactNode;
  /** Grupos de `FranjaSelectores` que van antes de VISTA (p. ej. DIMENSIÓN). */
  grupos?: { rotulo: string; control: ReactNode }[];
  /** Modo controlado; si se omite, el componente guarda su propio estado. */
  vista?: VistaDatos;
  onCambiarVista?: (vista: VistaDatos) => void;
  /** Modo inicial en uso no controlado. */
  inicial?: VistaDatos;
  /** Sustituye al contenido de ambos modos (p. ej. `EstadoError` cuando el backend fallo). */
  reemplazo?: ReactNode;
}

/**
 * Los mismos datos leidos de dos formas: la grafica para comparar o ver el ranking, la tabla para
 * el valor exacto y la descarga. Si los dos modos muestran datos distintos, son pestañas
 * (`TabsAnaliticas`), no este selector. Guia completa: `docs/VISTAS_ANALITICAS.md` §6.1.
 */
const AlternarTablaGrafica = ({
  tabla,
  grafica,
  acciones,
  accionesTabla,
  grupos = [],
  vista,
  onCambiarVista,
  inicial = "Tabla",
  reemplazo,
}: AlternarTablaGraficaProps) => {
  const [vistaPropia, setVistaPropia] = useState<VistaDatos>(inicial);
  const actual = vista ?? vistaPropia;
  const cambiar = (nueva: VistaDatos) => {
    setVistaPropia(nueva);
    onCambiarVista?.(nueva);
  };
  const enTabla = actual === "Tabla";

  return (
    <div className="flex flex-col gap-2">
      <FranjaSelectores
        grupos={[
          ...grupos,
          {
            rotulo: "Vista",
            control: <Segmented<VistaDatos> size="small" options={["Tabla", "Gráfica"]} value={actual} onChange={cambiar} />,
          },
        ]}
        extra={
          (acciones || (enTabla && accionesTabla)) && (
            <div className="ml-auto flex items-center gap-2">
              {enTabla && accionesTabla}
              {acciones}
            </div>
          )
        }
      />
      {/* `||` y no `??`: se suele pasar `condicion && <EstadoError />`, que vale `false`. */}
      {reemplazo || (enTabla ? tabla : grafica)}
    </div>
  );
};

export default AlternarTablaGrafica;
