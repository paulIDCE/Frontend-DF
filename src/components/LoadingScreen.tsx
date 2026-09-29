import React from "react";
import { Spin } from "antd";

interface LoadingScreenProps {
  tip?: string;
}

const LoadingScreen = ({ tip = "Cargando datos..." }: LoadingScreenProps) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Spin size="large" />
        <p className="text-tinta-tenue mt-4">{tip}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
