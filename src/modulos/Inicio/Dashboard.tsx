import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Modal } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

/** Home — porte de prueba-data `dashboard.html`. */

const SECTORES = [
  { ruta: "/macro", imagen: "ecuador.png", titulo: "Entorno Macroeconómico" },
  { ruta: "/sistema", imagen: "sistema.png", titulo: "Sistema Financiero Nacional" },
  { ruta: "/tasas", imagen: "tasas.png", titulo: "Sistema de Tasas de Interés" },
  { ruta: "/analisis", imagen: "evaluacion.png", titulo: "Análisis Financiero" },
];

const Dashboard = () => {
  const [bienvenida, setBienvenida] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBienvenida(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-10 py-12">
      <h1 className="text-center text-display font-extrabold text-identidad mt-0 mb-10">
        BIENVENIDO A DATA FINANCIERO
      </h1>

      <div className="mx-auto mb-12 grid max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SECTORES.map((s) => (
          <Link
            key={s.ruta}
            to={s.ruta}
            className="block rounded-contenedor bg-superficie px-5 py-8 text-center no-underline shadow-tarjeta transition-all duration-300 hover:-translate-y-2 hover:shadow-elevada"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
              <img src={`/images/${s.imagen}`} alt={s.titulo} className="max-h-full max-w-full object-contain" />
            </div>
            <h3 className="m-0 text-cuerpo font-semibold text-tinta">{s.titulo}</h3>
          </Link>
        ))}
      </div>

      <section className="mx-auto max-w-[1200px] rounded-contenedor bg-superficie px-10 py-8 shadow-tarjeta">
        <h2 className="mt-0 mb-4 text-titulo font-bold text-identidad">DATA FINANCIERO</h2>
        <p className="m-0 leading-relaxed text-tinta-secundaria">
          Es una aplicación web que integra y maneja datos del sistema financiero y del entorno
          macroeconómico para la toma de decisiones oportuna y basada en evidencia. Esta herramienta
          permite acceder de forma centralizada a información clave sobre indicadores económicos, tasas
          de interés, balanza comercial, inflación, crecimiento del PIB y desempeño financiero,
          facilitando su análisis en tiempo real.
        </p>
      </section>

      <Modal open={bienvenida} footer={null} closable={false} centered width={400} onCancel={() => setBienvenida(false)}>
        <div className="text-center py-4">
          <InfoCircleOutlined className="text-hero text-accion" />
          <h2 className="mt-4 mb-2 text-titulo font-bold text-identidad">DATA FINANCIERO</h2>
          <p className="m-0 font-semibold text-tinta">Seleccione el sector que desea analizar</p>
          <p className="text-tinta-tenue">Cada panel presenta datos abiertos y visualizaciones comprensibles.</p>
          <Button type="primary" shape="round" onClick={() => setBienvenida(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
