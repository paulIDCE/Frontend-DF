import type { ReactNode } from "react";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, KpiBox, TablaEstructura, type CuentaTabla } from "../componentes";
import { opcionHistorico, opcionTresCortes, type SerieHistorica } from "../opciones";

/**
 * Plantilla de las hojas de estructura (3, 4, 6, 7, 8): tres KPIs, barras del
 * total, barras por cuenta, historico, tabla "Cuentas/Meses" y analisis.
 */

export interface ConfigEstructura {
  titulo: string;
  subtitulo: string;
  kpis: { code: string; titulo: string }[];
  principal: { code: string; titulo: string };
  cuentasTitulo?: string;
  cuentas: { code: string; name: string }[];
  historico: { titulo: string; series: SerieHistorica[] };
  tabla: CuentaTabla[];
  analisis: ReactNode;
}

const PaginaEstructura = ({ c }: { c: ConfigEstructura }) => {
  const { ctx, etiquetas } = useRevista();
  return (
    <>
      <CabeceraPagina titulo={c.titulo} subtitulo={c.subtitulo} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {c.kpis.map((k) => (
              <KpiBox key={k.code} titulo={k.titulo} code={k.code} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Grafica titulo={c.principal.titulo} option={opcionTresCortes(ctx, [{ code: c.principal.code, name: c.principal.titulo }], etiquetas)} alto={260} />
            <Grafica titulo={c.cuentasTitulo ?? "Distribución por Cuenta"} option={opcionTresCortes(ctx, c.cuentas, etiquetas)} alto={260} />
          </div>
          <Grafica titulo={c.historico.titulo} option={opcionHistorico(ctx, c.historico.series, etiquetas)} alto={340} />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <TablaEstructura cuentas={c.tabla} alto={420} />
          {c.analisis}
        </div>
      </div>
    </>
  );
};

export default PaginaEstructura;
