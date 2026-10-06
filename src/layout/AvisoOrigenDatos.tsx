import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircleFilled, CloseOutlined, ExclamationCircleFilled, WarningFilled } from "@ant-design/icons";
import { PANTALLAS, type OrigenDatos } from "@/config/app";
import { apiSalud } from "@/services/apiDatos";
import { useOrigenReportado } from "./origenDatos";

/**
 * Banda entre el encabezado y el contenido que avisa de donde salen los datos de la pantalla
 * (al estilo del aviso de licencia de DevExtreme). Solo en el build desplegado; en desarrollo se
 * fuerza con `VITE_AVISO_ORIGEN_DATOS=true`.
 *
 * El origen es el que reporta la pantalla (`useReportarOrigen`) o, si no reporta, el de
 * `PANTALLAS`. Si `/api/health` no esta `Healthy` (SQL caido), todo es JSON.
 *
 * Se puede cerrar, pero vuelve al cambiar de pantalla o recargar.
 */

const ACTIVO = import.meta.env.PROD || import.meta.env.VITE_AVISO_ORIGEN_DATOS === "true";

type Aviso = OrigenDatos | "sinSql";

const ESTILO: Record<Aviso, { clase: string; icono: React.ReactNode; titulo: string; texto: string }> = {
  bd: {
    clase: "bg-exito",
    icono: <CheckCircleFilled />,
    titulo: "Datos de la base de datos",
    texto: "Toda la información de esta vista proviene de la base de datos.",
  },
  mixto: {
    clase: "bg-advertencia",
    icono: <WarningFilled />,
    titulo: "Datos mixtos",
    texto:
      "Los saldos contables vienen de la base de datos; los indicadores, fórmulas, títulos y el orden de las filas, de archivos JSON.",
  },
  json: {
    clase: "bg-error",
    icono: <ExclamationCircleFilled />,
    titulo: "Datos de archivos JSON",
    texto: "Los valores de esta vista no vienen de la base de datos sino de archivos JSON (las fechas sí son las de la base).",
  },
  sinSql: {
    clase: "bg-error",
    icono: <ExclamationCircleFilled />,
    titulo: "Base de datos no disponible",
    texto: "El servicio no responde desde la base de datos: toda la información viene de archivos JSON hasta que vuelva.",
  },
};

/** `true` si el backend no esta `Healthy`; se consulta en cada cambio de pantalla. */
const useSinSql = (pathname: string) => {
  const [sinSql, setSinSql] = useState(false);
  useEffect(() => {
    if (!ACTIVO) return;
    let vigente = true;
    apiSalud()
      .then((estado) => vigente && setSinSql(estado !== "Healthy"))
      .catch(() => vigente && setSinSql(false)); // sin respuesta, la pantalla ya muestra su propio error
    return () => {
      vigente = false;
    };
  }, [pathname]);
  return sinSql;
};

const AvisoOrigenDatos = () => {
  const { pathname } = useLocation();
  // Se guarda la ruta en la que se cerro: al cambiar de pantalla vuelve a aparecer.
  const [cerradoEn, setCerradoEn] = useState<string | null>(null);
  const reportado = useOrigenReportado();
  const sinSql = useSinSql(pathname);

  const origen = reportado ?? PANTALLAS.find((p) => pathname === p.ruta || pathname.startsWith(`${p.ruta}/`))?.origen;
  if (!ACTIVO || !origen || cerradoEn === pathname) return null;

  const { clase, icono, titulo, texto } = ESTILO[sinSql ? "sinSql" : origen];
  return (
    <div role="status" className={`${clase} flex items-center gap-3 px-8 py-2 text-tinta-inversa`}>
      <span className="text-subtitulo leading-none">{icono}</span>
      <p className="m-0 flex-1 text-cuerpo">
        <strong>{titulo}.</strong> {texto}
      </p>
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={() => setCerradoEn(pathname)}
        className="cursor-pointer border-0 bg-transparent p-1 text-tinta-inversa opacity-80 hover:opacity-100"
      >
        <CloseOutlined />
      </button>
    </div>
  );
};

export default AvisoOrigenDatos;
