import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: "p-4" | "p-6";
}

const PageContainer = ({ children, className = "", padding = "p-4" }: PageContainerProps) => {
  return (
    <div className={`bg-superficie rounded-contenedor ${padding} shadow-contenedor ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
