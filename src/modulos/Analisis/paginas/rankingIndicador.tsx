import { useState } from "react";
import { Radio, Segmented, Select, Spin } from "antd";
import { EstadoError, FranjaSelectores, TEXTO_GRAFICA, TablaAnalitica, useService, type ColumnaExcel } from "@idce/kit";
import { apiRanking } from "@/services/apiDatos";
import { archivoEntidad } from "@/services/datosService";
import type { Agrupacion } from "@/types/api";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, useNombreDescarga } from "../componentes";
import { claseVar } from "../estilos";
import { fechaCorta, fmt, variacion, pct } from "../datos";
import { GRUPOS_INDICADORES, type IndicadorCatalogo } from "../catalogoIndicadores";
import { ordenarPorIndicador, type FilaIndicador } from "../grupoPar";
import { COLOR_ENTIDAD, COLOR_GRUPO } from "../opciones";

/**
 * Hoja "Ranking por indicador" (RADAR tablero 7; plan 06, item 1.15). Generaliza los rankings de
 * cuentas (hojas 5, 9, 24-26) a cualquier indicador del catalogo: el orden sigue el sentido
 * favorable (en morosidad o gasto, menor es mejor) y la participacion solo se muestra en saldos.
 */

const cargar = (cuenta: string, fecha: string, agrupacion: Agrupacion, entidad: string) =>
  apiRanking({ cuenta, fecha, agrupacion, entidad: agrupacion === "todas" ? undefined : archivoEntidad(entidad) });

const opcionBarras = (filas: FilaIndicador[], ind: IndicadorCatalogo, entidad: string, etiquetas: boolean) => {
  const visibles = filas.filter((f) => f.actual !== null).slice(0, 25);
  const propia = filas.find((f) => f.nombre === entidad);
  if (propia && propia.actual !== null && !visibles.includes(propia)) visibles.push(propia);
  const datos = [...visibles].reverse();
  const corto = (s: string) => (s.length > 28 ? `${s.slice(0, 26)}…` : s);
  return {
    tooltip: { trigger: "axis", confine: true, axisPointer: { type: "none" }, valueFormatter: (v: number) => `${fmt(v)}${ind.unidad === "%" ? " %" : ""}` },
    grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "value", axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => fmt(v) } },
    yAxis: { type: "category", data: datos.map((f) => `${f.posicion}. ${corto(f.nombre)}`), axisLabel: TEXTO_GRAFICA },
    series: [
      {
        name: ind.nombre,
        type: "bar",
        barMaxWidth: 16,
        data: datos.map((f) => f.actual),
        itemStyle: { color: (p: { dataIndex: number }) => (datos[p.dataIndex]?.nombre === entidad ? COLOR_ENTIDAD : COLOR_GRUPO) },
        label: { show: etiquetas, position: "right", ...TEXTO_GRAFICA, formatter: (p: { value: number }) => fmt(p.value) },
      },
    ],
  };
};

export const HojaRankingIndicador = () => {
  const { ctx, entidad, etiquetas, setEntidad } = useRevista();
  const [grupoKey, setGrupoKey] = useState(GRUPOS_INDICADORES[0].key);
  const grupo = GRUPOS_INDICADORES.find((g) => g.key === grupoKey) ?? GRUPOS_INDICADORES[0];
  const [code, setCode] = useState(grupo.items[0].code);
  const ind = grupo.items.find((x) => x.code === code) ?? grupo.items[0];
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("sector");
  const nombre = useNombreDescarga(`ranking_${ind.code}`);

  const { data: respuesta, isLoading, apiError } = useService(
    cargar,
    [ind.code, ctx.fecha, agrupacion, entidad],
    [ind.code, ctx.fecha, agrupacion, entidad],
    true,
    "No se pudo cargar el ranking",
  );
  const esRatio = ind.unidad === "%";
  const filas = respuesta ? ordenarPorIndicador(respuesta, ind.sentido, esRatio) : [];
  const propia = filas.find((f) => f.nombre === entidad);
  const conDato = filas.filter((f) => f.actual !== null).length;

  const cambio = (f: FilaIndicador) =>
    f.actual === null || f.anterior === null ? null : esRatio ? f.actual - f.anterior : variacion(f.actual, f.anterior);
  /** Color de la variacion segun el sentido: en "menor es mejor", bajar es verde. */
  const claseCambio = (v: number) => claseVar(ind.sentido === "sube" ? v : -v);

  const excel: ColumnaExcel<FilaIndicador>[] = [
    { titulo: "Posición", valor: (r) => r.posicion || "", formato: "entero", ancho: 10 },
    { titulo: "Entidad", valor: (r) => r.nombre, ancho: 44 },
    { titulo: `${ind.nombre} ${fechaCorta(ctx.anioAnterior)}`, valor: (r) => r.anterior ?? "", ancho: 18 },
    { titulo: `${ind.nombre} ${fechaCorta(ctx.fecha)}`, valor: (r) => r.actual ?? "", ancho: 18 },
    { titulo: esRatio ? "Variación (pp)" : "Variación (%)", valor: (r) => cambio(r) ?? "", ancho: 14 },
    ...(esRatio ? [] : [{ titulo: "Participación (%)", valor: (r: FilaIndicador) => r.participacion, formato: "porcentaje" as const, ancho: 14 }]),
  ];

  return (
    <>
      <CabeceraPagina titulo="RANKING POR INDICADOR" subtitulo="Posición de las entidades en cualquier indicador, ordenadas según su sentido favorable" />
      <FranjaSelectores
        grupos={[
          {
            rotulo: "Tema",
            control: (
              <Segmented
                value={grupo.key}
                onChange={(v) => {
                  const g = GRUPOS_INDICADORES.find((x) => x.key === v)!;
                  setGrupoKey(g.key);
                  setCode(g.items[0].code);
                }}
                options={GRUPOS_INDICADORES.map((g) => ({ value: g.key, label: g.titulo }))}
              />
            ),
          },
          {
            rotulo: "Indicador",
            control: (
              <Select className="min-w-72" value={ind.code} onChange={setCode} options={grupo.items.map((x) => ({ value: x.code, label: x.nombre }))} />
            ),
          },
          {
            rotulo: "Grupo",
            control: (
              <Radio.Group value={agrupacion} onChange={(e) => setAgrupacion(e.target.value)} optionType="button" size="small">
                <Radio value="sector">Mismo sector</Radio>
                <Radio value="activos">Mismo nivel de activos</Radio>
                <Radio value="provincia">Misma provincia</Radio>
                <Radio value="todas">Todas</Radio>
              </Radio.Group>
            ),
          },
        ]}
      />
      <p className="my-2 text-detalle text-tinta-tenue">
        {ind.sentido === "sube" ? "Mayor es mejor." : "Menor es mejor."}{" "}
        {propia && propia.posicion ? (
          <>
            <strong className="text-tinta">{entidad}</strong> ocupa el puesto <strong>{propia.posicion}</strong> de {conDato}
            {" "}con {fmt(propia.actual)}
            {esRatio ? " %" : " millones USD"}.
          </>
        ) : (
          <>{entidad} no tiene dato en este indicador.</>
        )}{" "}
        Sentido favorable provisional, hasta el catálogo de indicadores (plan 06, item 3.1).
      </p>
      {apiError ? (
        <EstadoError error={apiError} />
      ) : isLoading || !respuesta ? (
        <div className="flex justify-center py-16">
          <Spin description="Cargando ranking..." size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <TablaAnalitica<FilaIndicador>
            rowKey="entidadId"
            size="small"
            bordered
            pagination={false}
            dataSource={filas}
            excel={{ nombre, columnas: excel }}
            scroll={{ x: "max-content", y: 560 }}
            rowClassName={(r) => (r.nombre === entidad ? "font-bold bg-advertencia-sutil" : "")}
            onRow={(r) => ({ onDoubleClick: () => setEntidad(r.nombre), title: "Doble clic: abrir la revista de esta entidad" })}
            columns={[
              { title: "#", key: "p", width: 56, align: "center", render: (_, r) => r.posicion || "-" },
              { title: "Entidad", key: "e", render: (_, r) => r.nombre },
              { title: fechaCorta(ctx.anioAnterior), key: "a", align: "right", render: (_, r) => (r.anterior === null ? "-" : fmt(r.anterior)) },
              { title: fechaCorta(ctx.fecha), key: "c", align: "right", render: (_, r) => (r.actual === null ? "-" : <strong>{fmt(r.actual)}</strong>) },
              {
                title: esRatio ? "Var. (pp)" : "Var. (%)",
                key: "v",
                align: "right",
                render: (_, r) => {
                  const v = cambio(r);
                  return v === null ? "-" : <span className={claseCambio(v)}>{v > 0 ? "+" : ""}{fmt(v)}</span>;
                },
              },
              ...(esRatio
                ? []
                : [{ title: "Part.", key: "pt", align: "right" as const, render: (_: unknown, r: FilaIndicador) => pct(r.participacion) }]),
            ]}
          />
          <Grafica
            titulo={`${ind.nombre} - ${fechaCorta(ctx.fecha)} (25 primeras)`}
            nota="En naranja, la entidad de la revista (se agrega al final si no está entre las 25 primeras)."
            option={filas.length ? opcionBarras(filas, ind, entidad, etiquetas) : null}
            alto={600}
            cambioTipo={false}
          />
        </div>
      )}
    </>
  );
};
