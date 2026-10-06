import { useMemo } from "react";
import { Tag } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useRevista } from "../RevistaContext";
import { fechaCorta } from "../datos";
import { TituloBloque } from "../componentes";
import { diagnosticar, type Bloque, type Severidad } from "./motor";

const ETIQUETA: Record<Severidad, { texto: string; color: string }> = {
  alta: { texto: "Alta", color: "error" },
  media: { texto: "Media", color: "warning" },
  baja: { texto: "Baja", color: "default" },
  positiva: { texto: "Positivo", color: "success" },
};

/**
 * Panel "Diagnóstico": hallazgos del motor de reglas al corte, de más a menos severo. Con `bloques`
 * muestra solo los de esos temas; con `maximo`, los primeros (resumen ejecutivo).
 */
export const PanelDiagnostico = ({ bloques, maximo, titulo = "Diagnóstico" }: { bloques?: Bloque[]; maximo?: number; titulo?: string }) => {
  const { ctx } = useRevista();
  const hallazgos = useMemo(() => {
    const todos = diagnosticar(ctx).filter((h) => !bloques || bloques.includes(h.regla.bloque));
    return maximo ? todos.slice(0, maximo) : todos;
  }, [ctx, bloques, maximo]);

  return (
    <section className="rounded-tarjeta border border-linea bg-superficie p-3">
      <TituloBloque icono={<SafetyCertificateOutlined />}>{`${titulo} - ${fechaCorta(ctx.fecha)}`}</TituloBloque>
      {hallazgos.length ? (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {hallazgos.map((h) => (
            <li key={h.regla.id} className="flex items-start gap-2 text-detalle leading-relaxed text-tinta-secundaria">
              <Tag color={ETIQUETA[h.regla.severidad].color} className="m-0 shrink-0">
                {ETIQUETA[h.regla.severidad].texto}
              </Tag>
              <span>{h.texto}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-detalle text-tinta-tenue">Sin alertas ni hallazgos destacados para este corte.</p>
      )}
      <p className="m-0 mt-2 text-rotulo text-tinta-tenue">
        Umbrales provisionales, pendientes de calibrar con negocio. Variaciones contra el mismo mes del año anterior.
      </p>
    </section>
  );
};
