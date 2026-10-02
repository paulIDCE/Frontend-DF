import { FilaKpis, useService } from "@idce/kit";
import { apiRanking } from "@/services/apiDatos";
import { archivoEntidad } from "@/services/datosService";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, KpiBox, MiniKpi } from "../componentes";
import { calificacion } from "../calificacion";
import { fechaCorta, fmt } from "../datos";
import { PanelDiagnostico } from "../diagnostico/PanelDiagnostico";

/**
 * Hoja "Resumen ejecutivo" v1 (Managerial Analyzer "Cuadro de mando"; plan 06, item 1.19): KPIs
 * con su posicion en el grupo par, calificaciones CAMELS / PERLAS, los 5 hallazgos principales del
 * motor de diagnostico y la posicion en los rankings del sector. La version completa (Z-score
 * bancario, semaforo normativo) es el item 5.1.
 */

const KPIS: [string, string, string][] = [
  ["@1", "Activo", ""],
  ["IF011", "Cartera bruta", ""],
  ["@21", "Depósitos (oblig. con el público)", ""],
  ["Gan_Eje", "Resultado del ejercicio", ""],
];

const RATIOS: [string, string, number][] = [
  ["IF002", "ROA", 0],
  ["IF004", "ROE", 1],
  ["IF012", "MOROSIDAD", 7],
  ["IF006", "LIQUIDEZ (FD / DEP. CP)", 2],
  ["SOLVENCIA", "SOLVENCIA (PAT. TÉCNICO)", 3],
  ["DER_COSTO_FONDEO", "COSTO DE FONDEO", 5],
];

const RANKINGS: [string, string][] = [
  ["@1", "Activos"],
  ["IF011", "Cartera bruta"],
  ["@21", "Depósitos"],
];

const cargarPosiciones = async (fecha: string, entidad: string) =>
  Promise.all(
    RANKINGS.map(async ([cuenta, nombre]) => {
      const r = await apiRanking({ cuenta, fecha, agrupacion: "sector", entidad: archivoEntidad(entidad) });
      return { nombre, posicion: r.posicionEntidad, total: r.filas.length };
    }),
  );

const Calificacion = ({ titulo, code }: { titulo: string; code: string }) => {
  const { ctx } = useRevista();
  const d = ctx.dato(code);
  if (!d) return null;
  const c = calificacion(d.actual);
  const cambio = d.actual - d.anioAnterior;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-tarjeta border border-linea bg-superficie p-3">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-titulo font-extrabold text-tinta-inversa ${c.clase}`}>
        {c.letra}
      </span>
      <span className="flex flex-col">
        <span className="text-rotulo font-bold uppercase text-tinta-secundaria">{titulo}</span>
        <span className="text-cuerpo font-bold text-tinta">
          {fmt(d.actual)} · {c.texto.slice(4)}
        </span>
        <span className="text-detalle text-tinta-tenue">
          {cambio >= 0 ? "+" : ""}
          {fmt(cambio)} puntos vs. {fechaCorta(ctx.anioAnterior)}
        </span>
      </span>
    </div>
  );
};

export const HojaResumen = () => {
  const { ctx, entidad, tamano } = useRevista();
  const { data: posiciones } = useService(cargarPosiciones, [ctx.fecha, entidad], [], true, "No se pudieron cargar los rankings");

  return (
    <>
      <CabeceraPagina titulo={`Resumen ejecutivo - ${entidad}`} subtitulo={`${tamano} · datos al ${fechaCorta(ctx.fecha)} · variaciones anuales`} />
      <FilaKpis columnas={4} className="mb-3">
        {KPIS.map(([code, titulo]) => (
          <KpiBox key={code} titulo={titulo} code={code} grupoPar={code !== "Gan_Eje"} />
        ))}
      </FilaKpis>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {RATIOS.filter(([code]) => ctx.fila(code)).map(([code, titulo, i]) => (
              <MiniKpi key={code} titulo={titulo} code={code} tipo={i % 2 ? "line" : "bar"} grupoPar={!code.startsWith("DER_")} />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <PanelDiagnostico maximo={5} titulo="Hallazgos principales" />
          <div className="flex flex-wrap gap-2">
            <Calificacion titulo="CAMELS" code="Indic_CAMELS_1" />
            <Calificacion titulo="PERLAS" code="efic_perlas_acum" />
          </div>
          <section className="rounded-tarjeta border border-linea bg-superficie p-3">
            <h4 className="m-0 mb-2 text-cuerpo font-semibold text-tinta">Posición en el sector ({tamano})</h4>
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-detalle">
              {(posiciones ?? []).map((p) => (
                <li key={p.nombre} className="flex justify-between">
                  <span>{p.nombre}</span>
                  <strong>{p.posicion ? `${p.posicion}.º de ${p.total}` : "-"}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
};
