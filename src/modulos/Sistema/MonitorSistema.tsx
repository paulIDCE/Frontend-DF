import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Segmented, Select, Spin } from "antd";
import { Delta, EstadoError, FilaKpis, FranjaSelectores, KpiCard, TEXTO_GRAFICA, TarjetaGrafica, color, useService } from "@idce/kit";
import { CabeceraPagina } from "@/modulos/Analisis/componentes";
import { apiMeta, apiRanking, apiSeriesSistema } from "@/services/apiDatos";
import { cargarListaEntidades } from "@/modulos/Analisis/resumenEntidades";
import { GRUPOS_INDICADORES } from "@/modulos/Analisis/catalogoIndicadores";
import { ordenarPorIndicador } from "@/modulos/Analisis/grupoPar";
import { fechaCorta, fechaLarga, fmt, restarMeses } from "@/modulos/Analisis/datos";
import { SECTORES } from "./cargarCuadro";
import { COLOR_ANTERIOR, COLOR_ENTIDAD, COLOR_GRUPO, ejeValor, tooltipSerie, unidadDeGrafica } from "@/modulos/Analisis/opciones";
import { fmtUnidad } from "@/modulos/Analisis/unidades";

/**
 * Monitor del Sistema (RADAR "Información Financiera"; plan 06, item 1.17): UN indicador para TODO
 * el sistema a la vez. Por sector (10 sectores, `GET /api/sistema/series`), por entidad en un corte
 * (las 229, `GET /api/rankings?agrupacion=todas`) y evolucion por sector. Desde la barra de una
 * entidad se abre su revista (RADAR no tiene ficha por entidad).
 *
 * La evolucion de N entidades necesita `GET /api/sistema/indicador` (fase 2, item 2.2).
 */

const TODOS = "__todos__";

const cargarSectores = (code: string) => apiSeriesSistema([code]);
const cargarEntidades = (code: string, fecha: string) => apiRanking({ cuenta: code, fecha, agrupacion: "todas" });


const MonitorSistema = () => {
  const navigate = useNavigate();
  const [grupoKey, setGrupoKey] = useState("riesgo");
  const grupo = GRUPOS_INDICADORES.find((g) => g.key === grupoKey) ?? GRUPOS_INDICADORES[0];
  const [code, setCode] = useState(grupo.items[0].code);
  const ind = grupo.items.find((x) => x.code === code) ?? grupo.items[0];
  const [tamano, setTamano] = useState(TODOS);
  const [resaltada, setResaltada] = useState<string | null>(null);

  const { data: meta } = useService(apiMeta, [], [], true, "No se pudo leer la fecha de los datos");
  const { data: lista } = useService(cargarListaEntidades, [], [], true, "No se pudo cargar la lista de entidades");
  const { data: sectores, isLoading: cargandoSectores } = useService(cargarSectores, [ind.code], [], true, "No se pudieron cargar los sectores");

  // Cortes: los del sistema hasta el ultimo comun (la fuente trae meses futuros, ver /api/meta).
  const ultimo = meta?.ultimoCorteComun ?? null;
  const cortes = useMemo(
    () => (sectores?.periodos ?? []).filter((p) => !ultimo || p <= ultimo),
    [sectores, ultimo],
  );
  const [corteElegido, setCorte] = useState<string | null>(null);
  const corte = corteElegido && cortes.includes(corteElegido) ? corteElegido : (cortes[cortes.length - 1] ?? ultimo ?? "");

  const { data: ranking, isLoading: cargandoRanking, apiError } = useService(
    cargarEntidades,
    [ind.code, corte],
    [],
    !!corte,
    "No se pudo cargar el indicador por entidad",
  );

  const tamanos = useMemo(() => [...new Set((lista ?? []).map((e) => e.tamano))].sort(), [lista]);
  const tamanoDe = useMemo(() => new Map((lista ?? []).map((e) => [e.archivo, e.tamano])), [lista]);
  const esRatio = ind.unidad === "%";
  const unidadEje = esRatio ? "%" : "musd";
  const filas = (ranking ? ordenarPorIndicador(ranking, ind.sentido, esRatio) : []).filter(
    (f) => f.actual !== null && (tamano === TODOS || tamanoDe.get(f.entidadId) === tamano),
  );

  /* ---------------------------- por sector ---------------------------- */
  const porSector = SECTORES.map((s) => {
    const serie = sectores?.series.find((x) => x.sector === s.value);
    const i = sectores?.periodos.indexOf(corte) ?? -1;
    return { ...s, serie, valor: serie && i >= 0 ? (serie.valores[i] ?? null) : null };
  });
  const hayDatosSector = porSector.some((s) => s.valor !== null);
  const nacional = porSector.find((s) => s.value === "nacional");
  const iAnterior = sectores?.periodos.indexOf(restarMeses(corte, 12)) ?? -1;
  const nacionalAnterior = nacional?.serie && iAnterior >= 0 ? nacional.serie.valores[iAnterior] : null;
  // La fuente repite el mismo valor en varios sectores para algunos indicadores (p. ej. SOLVENCIA).
  const valoresSector = porSector.filter((s) => s.value !== "nacional" && s.valor !== null).map((s) => s.valor);
  const repetido = valoresSector.length > 3 && new Set(valoresSector).size <= 2;

  const opcionSectores = {
    tooltip: { trigger: "axis", confine: true, axisPointer: { type: "none" }, ...tooltipSerie(unidadEje) },
    grid: { left: 8, right: 40, top: 8, bottom: 8, containLabel: true },
    xAxis: ejeValor(unidadEje),
    yAxis: { type: "category", inverse: true, data: porSector.map((s) => s.label), axisLabel: { ...TEXTO_GRAFICA, width: 200, overflow: "truncate" } },
    series: [
      {
        name: ind.nombre,
        type: "bar",
        barMaxWidth: 18,
        data: porSector.map((s) => s.valor),
        // El total nacional en gris de referencia; los sectores en el color del grupo.
        itemStyle: { color: (p: { dataIndex: number }) => (porSector[p.dataIndex]?.value === "nacional" ? COLOR_ANTERIOR : COLOR_GRUPO) },
        label: { show: true, position: "right", ...TEXTO_GRAFICA, formatter: (p: { value: number }) => fmt(p.value) },
      },
    ],
  };

  /* ---------------------------- por entidad ---------------------------- */
  const corto = (s: string) => (s.length > 30 ? `${s.slice(0, 28)}…` : s);
  const visibles = Math.min(filas.length, 30);
  const opcionEntidades = {
    tooltip: {
      trigger: "axis",
      confine: true,
      axisPointer: { type: "none" },
      formatter: (ps: { dataIndex: number }[]) => {
        const f = filas[ps[0]?.dataIndex ?? 0];
        return f ? `<strong>${f.posicion}. ${f.nombre}</strong><br/>${fmtUnidad(unidadEje)(f.actual)}<br/><em>Clic: abrir su revista</em>` : "";
      },
    },
    grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
    xAxis: ejeValor(unidadEje),
    yAxis: { type: "category", inverse: true, data: filas.map((f) => `${f.posicion}. ${corto(f.nombre)}`), axisLabel: TEXTO_GRAFICA },
    dataZoom: [
      { type: "slider", yAxisIndex: 0, startValue: 0, endValue: Math.max(0, visibles - 1), right: 4, width: 14, showDetail: false },
      { type: "inside", yAxisIndex: 0, zoomOnMouseWheel: false, moveOnMouseWheel: true },
    ],
    series: [
      {
        name: ind.nombre,
        type: "bar",
        barMaxWidth: 14,
        cursor: "pointer",
        data: filas.map((f) => f.actual),
        itemStyle: { color: (p: { dataIndex: number }) => (filas[p.dataIndex]?.nombre === resaltada ? COLOR_ENTIDAD : COLOR_GRUPO) },
        label: { show: true, position: "right", ...TEXTO_GRAFICA, formatter: (p: { value: number }) => fmt(p.value) },
      },
    ],
  };

  /* ---------------------------- evolucion ---------------------------- */
  const hasta = sectores ? sectores.periodos.indexOf(corte) : -1;
  const desde = Math.max(0, hasta - 23);
  const periodosEvol = sectores && hasta >= 0 ? sectores.periodos.slice(desde, hasta + 1) : [];
  const opcionEvolucion = {
    tooltip: { trigger: "axis", confine: true, ...tooltipSerie(unidadEje) },
    legend: { type: "scroll", bottom: 0, textStyle: TEXTO_GRAFICA },
    grid: { left: 8, right: 16, top: 16, bottom: 40, containLabel: true },
    xAxis: { type: "category", data: periodosEvol.map(fechaLarga), axisLabel: { ...TEXTO_GRAFICA, rotate: 45 } },
    yAxis: { ...ejeValor(unidadEje), scale: true },
    series: porSector
      .filter((s) => s.serie)
      .map((s, i) => ({
        name: s.label,
        type: "line",
        smooth: true,
        symbolSize: 4,
        data: s.serie!.valores.slice(desde, hasta + 1),
        color: s.value === "nacional" ? color.tinta.base : color.datos.series[i % color.datos.series.length],
        lineStyle: { width: s.value === "nacional" ? 3 : 1.5 },
      })),
  };

  const unidadCorta = esRatio ? "%" : "M USD";
  const mejor = filas[0];
  const peor = filas[filas.length - 1];

  return (
    <div className="flex flex-col gap-3 p-4">
      <CabeceraPagina
        titulo="Monitor del Sistema"
        subtitulo={`Un indicador para todo el sistema: por sector, por entidad y en su evolución. ${ind.sentido === "sube" ? "Mayor" : "Menor"} es mejor.`}
      />
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
            control: <Select className="min-w-72" value={ind.code} onChange={setCode} options={grupo.items.map((x) => ({ value: x.code, label: x.nombre }))} />,
          },
          {
            rotulo: "Corte",
            control: (
              <Select className="w-28" value={corte} onChange={setCorte} options={[...cortes].reverse().map((p) => ({ value: p, label: fechaCorta(p) }))} />
            ),
          },
        ]}
      />

      <FilaKpis columnas={4}>
        <KpiCard
          titulo="Sistema nacional"
          color="monto"
          valor={nacional?.valor == null ? "—" : fmt(nacional.valor)}
          sufijo={unidadCorta}
          valorSecundario={
            <Delta
              valor={
                nacional?.valor != null && nacionalAnterior != null
                  ? esRatio
                    ? nacional.valor - nacionalAnterior
                    : ((nacional.valor - nacionalAnterior) / Math.abs(nacionalAnterior)) * 100
                  : null
              }
              sufijo={esRatio ? " pp" : "%"}
              subirEsMalo={ind.sentido === "baja"}
              etiqueta={`vs. ${fechaCorta(restarMeses(corte, 12))}`}
            />
          }
        />
        <KpiCard titulo="Mejor entidad" color="bueno" valor={mejor?.actual == null ? "—" : fmt(mejor.actual)} sufijo={unidadCorta} pie={<span className="truncate text-detalle text-tinta-tenue">{mejor?.nombre ?? ""}</span>} />
        <KpiCard titulo="Peor entidad" color="malo" valor={peor?.actual == null ? "—" : fmt(peor.actual)} sufijo={unidadCorta} pie={<span className="truncate text-detalle text-tinta-tenue">{peor?.nombre ?? ""}</span>} />
        <KpiCard titulo="Entidades con dato" color="neutro" valor={filas.length} pie={<span className="text-detalle text-tinta-tenue">{tamano === TODOS ? "Todos los tipos" : tamano}</span>} />
      </FilaKpis>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <TarjetaGrafica
          titulo={`${ind.nombre} por sector - ${fechaCorta(corte)}`}
          nota={repetido ? "La fuente (base del sistema) repite el mismo valor en varios sectores para este indicador: revisar el origen." : undefined}
          subtitulo={unidadDeGrafica(opcionSectores).unidad}
          option={hayDatosSector ? unidadDeGrafica(opcionSectores).option : null}
          textoVacio="Este indicador no está en la base del sistema por sector."
          cargando={cargandoSectores}
          alto={420}
          estadisticas={false}
        />
        <TarjetaGrafica
          titulo={`${ind.nombre} por entidad - ${fechaCorta(corte)}`}
          subtitulo={`${unidadDeGrafica(opcionEntidades).unidad} · clic en una barra para abrir la revista de la entidad`}
          extra={
            <span className="flex items-center gap-2">
              <Select
                size="small"
                className="w-48"
                value={tamano}
                onChange={setTamano}
                options={[{ value: TODOS, label: "Todos los tipos" }, ...tamanos.map((t) => ({ value: t, label: t }))]}
              />
              <Select
                size="small"
                className="w-56"
                showSearch
                allowClear
                placeholder="Resaltar entidad"
                value={resaltada ?? undefined}
                onChange={(v) => setResaltada(v ?? null)}
                options={filas.map((f) => ({ value: f.nombre, label: `${f.posicion}. ${f.nombre}` }))}
              />
            </span>
          }
          option={apiError ? null : filas.length ? unidadDeGrafica(opcionEntidades).option : null}
          textoVacio={apiError ? <EstadoError error={apiError} /> : "Sin entidades con dato."}
          cargando={cargandoRanking}
          onClickPunto={(e: { dataIndex: number }) => {
            const f = filas[e.dataIndex];
            if (f) navigate(`/analisis?entidad=${encodeURIComponent(f.nombre)}&hoja=27`);
          }}
          alto={420}
          estadisticas={false}
        />
      </div>

      {cargandoSectores && !sectores ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <TarjetaGrafica
          titulo={`Evolución por sector - ${ind.nombre} (24 meses)`}
          subtitulo={unidadDeGrafica(opcionEvolucion).unidad}
          option={hayDatosSector ? unidadDeGrafica(opcionEvolucion).option : null}
          textoVacio="Este indicador no está en la base del sistema por sector."
          alto={360}
          base100={!esRatio}
          cambioTipo
        />
      )}
    </div>
  );
};

export default MonitorSistema;
