import { Tag } from "antd";
import { Delta, FilaKpis, KpiCard, TablaAnalitica, TarjetaGrafica } from "@idce/kit";
import type { InformeEstructurado, KpiInforme, TablaInforme } from "@/services/agenteService";
import { altoGrafico, fmt, opcionGrafico } from "./graficosInforme";

/**
 * Pinta el informe estructurado que devuelve el workflow de Kipu con los componentes del kit:
 * `KpiCard` + `Delta` (FilaKpis), `TarjetaGrafica` (ECharts) y `TablaAnalitica`. Los KPI y los
 * graficos llegan como datos calculados por codigo: aqui solo se dibujan. Las descargas Word y
 * PDF salen del mismo informe (`exportar/`).
 */

const COLOR_SEMAFORO = { v: "success", a: "warning", r: "error" } as const;

const Kpi = ({ k, comparadoCon }: { k: KpiInforme; comparadoCon: string }) => (
  <KpiCard
    titulo={k.titulo}
    color="accion"
    valor={k.texto ?? fmt(k.valor, k.decimales)}
    sufijo={k.texto == null && k.unidad === "%" ? " %" : undefined}
    valorSecundario={
      k.deltaTexto ? (
        <span className="text-detalle text-tinta-secundaria">{k.deltaTexto}</span>
      ) : (
        <Delta
          valor={k.delta}
          sufijo={` ${k.deltaUnidad}`}
          etiqueta={`vs. ${comparadoCon}`}
          subirEsMalo={k.subirEsMalo}
          decimales={k.deltaUnidad === "%" ? 1 : k.decimales}
        />
      )
    }
  />
);

const Tabla = ({ t }: { t: TablaInforme }) => {
  const filas = t.rows.map((celdas, i) => ({ key: i, ...Object.fromEntries(celdas.map((c, j) => [`c${j}`, c])) }));
  return (
    <TablaAnalitica
      size="small"
      pagination={false}
      dataSource={filas}
      columns={t.cols.map((titulo, j) => ({ title: titulo, dataIndex: `c${j}`, key: `c${j}`, align: j === 0 ? "left" : "right" }))}
      rowClassName={(_, i) => (t.yo?.includes(i) ? "kipu-fila-entidad" : t.med?.includes(i) ? "kipu-fila-mediana" : "")}
    />
  );
};

const InformeKipu = ({ informe }: { informe: InformeEstructurado }) => (
  <article className="kipu-informe flex flex-col gap-4 text-cuerpo text-tinta">
    <header className="flex flex-col gap-1">
      <h2 className="m-0 text-titulo font-bold text-identidad">{informe.titulo}</h2>
      <span className="text-detalle text-tinta-secundaria">
        {informe.entidad} · {informe.tipoEntidad} · Corte {informe.corte} · Comparado con {informe.comparado_con}
      </span>
    </header>

    <section className="rounded-tarjeta border-l-4 border-identidad bg-identidad-sutil px-4 py-3">
      {informe.semaforo && (
        <Tag color={COLOR_SEMAFORO[informe.semaforo.nivel]} className="mb-1 font-bold">
          {informe.semaforo.color}
        </Tag>
      )}
      <p className="m-0">{informe.conclusion}</p>
      {informe.semaforo && <p className="m-0 mt-1 text-rotulo text-tinta-tenue">Semáforo: {informe.semaforo.motivo}</p>}
    </section>

    {informe.kpis.length > 0 && (
      <FilaKpis columnas={Math.min(4, informe.kpis.length)}>
        {informe.kpis.map((k) => (
          <Kpi key={k.titulo} k={k} comparadoCon={informe.comparado_con} />
        ))}
      </FilaKpis>
    )}

    {informe.secciones.map((s, i) => {
      const dos = s.graficos.length > 1 && !s.graficos.some((g) => g.tipo === "barras_h");
      return (
        <section key={s.clave} className="flex flex-col gap-3">
          <h3 className="m-0 border-0 border-b-2 border-solid border-identidad pb-1 text-subtitulo font-bold text-identidad">
            {i + 1}. {s.titulo}
          </h3>
          {s.graficos.length > 0 && (
            <div className={`grid gap-3 ${dos ? "lg:grid-cols-2" : "grid-cols-1"}`}>
              {s.graficos.map((g) => (
                <TarjetaGrafica
                  key={g.titulo}
                  titulo={g.titulo}
                  subtitulo={g.unidad || undefined}
                  option={opcionGrafico(g)}
                  alto={altoGrafico(g)}
                  estadisticas={g.tipo !== "barras_h"}
                />
              ))}
            </div>
          )}
          {s.texto && <p className="m-0">{s.texto}</p>}
          {s.tablas.map((t, j) => (
            <Tabla key={j} t={t} />
          ))}
        </section>
      );
    })}

    {informe.alertas.length > 0 && (
      <section className="flex flex-col gap-2">
        <h3 className="m-0 border-0 border-b-2 border-solid border-identidad pb-1 text-subtitulo font-bold text-identidad">
          {informe.secciones.length + 1}. Alertas y recomendaciones
        </h3>
        <ul className="m-0 flex flex-col gap-1 pl-5">
          {informe.alertas.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
    )}

    <footer className="border-0 border-t border-solid border-linea pt-2 text-rotulo text-tinta-tenue">
      {informe.notas.length > 0 && <p className="m-0 mb-1">Notas: {informe.notas.join(" · ")}</p>}
      Fuente: estados financieros e indicadores de patrimonio técnico (SB/SEPS), base bco_coop. Corte {informe.corte}. Umbrales de
      semáforo referenciales. Generado por Kipu · IDCE Consulting: no constituye calificación de riesgo.
    </footer>
  </article>
);

export default InformeKipu;
