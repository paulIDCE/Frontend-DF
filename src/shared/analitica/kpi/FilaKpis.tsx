import { Children, ReactNode } from "react";
import { Col, Row, Skeleton } from "antd";
import { espacio } from "@/design/tokens";

/**
 * Fila estandar de KPIs de una vista analitica: 4 por fila en laptop (`lg`, el area del SSO es
 * de ~1264 px), 2 en tablet y 1 en movil. Mientras `cargando`, pinta esqueletos con la misma
 * rejilla para que la vista no salte al llegar los datos.
 *
 * Cada hijo (normalmente un `components/charts/KpiCard`) ocupa una celda.
 */
const FilaKpis = ({
  cargando = false,
  columnas = 4,
  cantidad = columnas,
  className,
  children,
}: {
  cargando?: boolean;
  /**
   * KPIs por fila en laptop (`lg`). 4 por defecto; admite cualquier número (3, 5, 6…). Más de 5 a
   * 1264 px deja tarjetas de menos de 230 px: la cifra de 24 px no cabe con montos largos.
   */
  columnas?: number;
  /** Esqueletos a pintar mientras carga; por defecto, una fila (`columnas`). */
  cantidad?: number;
  className?: string;
  children?: ReactNode;
}) => {
  const porFila = Math.max(1, Math.floor(columnas));
  // `flex` y no `span`: con 24 columnas de antd, 5 por fila no es entero.
  const celda = {
    xs: 24,
    sm: porFila === 1 ? 24 : 12,
    lg: { flex: `0 0 ${100 / porFila}%` },
  };

  return (
    <Row gutter={[espacio.rejilla, espacio.rejilla]} className={className}>
      {cargando
        ? Array.from({ length: cantidad }, (_, i) => (
            <Col key={i} {...celda}>
              {/* Alto medido de un KpiCard: la vista no salta al llegar los datos. En antd 6 `style`
                  va al nodo interno; el envoltorio es `inline-block` sin ancho y mediría 0 px. */}
              <Skeleton.Node
                active
                styles={{ root: { display: "block", width: "100%" } }}
                style={{ width: "100%", height: 168 }}
              />
            </Col>
          ))
        : Children.toArray(children).map((hijo, i) => (
            <Col key={i} {...celda}>
              {hijo}
            </Col>
          ))}
    </Row>
  );
};

export default FilaKpis;
