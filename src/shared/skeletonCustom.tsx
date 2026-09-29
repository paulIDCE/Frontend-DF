import React from "react";
import { Card, Skeleton, Space } from "antd";
interface SkeletonCustomProps {
  direccion?: "horizontal" | "vertical";
  isCard?: boolean;
  rows?: number;
  lines?: number; // Solo aplica si isCard es false
}
const SkeletonCustom = ({
  direccion = "vertical",
  isCard = false,
  rows = 1,
  lines = 1,
}: SkeletonCustomProps) => {
  // Generamos un array basado en el número de filas/cards solicitadas
  const items = Array.from({ length: rows });

  // Función interna para renderizar el contenido específico
  const renderItemContent = () => {
    if (isCard) {
      // ✅ Estructura correcta para Card en AntD v5 usando Skeleton modular
      return (
        <Card
          style={{
            width: direccion === "horizontal" ? 300 : "100%",
            minWidth: 250, // Asegura un ancho mínimo en horizontal
          }}
        >
          <Space align="start" style={{ width: "100%" }}>
            {/* Simulamos el Avatar */}
            <Skeleton.Avatar active size="large" shape="circle" />

            {/* Simulamos Título y Descripción con bloques */}
            <div style={{ flex: 1 }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: "60%", marginBottom: 8, display: "block" }}
              />
              <Skeleton.Input active size="small" style={{ width: "100%" }} />
            </div>
          </Space>
        </Card>
      );
    }

    // ✅ Estructura estándar para Párrafo
    return (
      <div style={{ width: "100%" }}>
        <Skeleton active paragraph={{ rows: lines }} title={true} />
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direccion === "horizontal" ? "row" : "column",
        gap: "16px", // Espaciado entre elementos
        flexWrap: "wrap", // Importante para horizontal en pantallas pequeñas
        width: "100%",
      }}
    >
      {items.map((_, index) => (
        <React.Fragment key={index}>{renderItemContent()}</React.Fragment>
      ))}
    </div>
  );
};

export default SkeletonCustom;
