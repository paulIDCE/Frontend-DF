import { useMemo } from "react";
import { Spin } from "antd";
import { EstadoError, TEXTO_GRAFICA, TablaAnalitica, color, useService, type ColumnaExcel } from "@idce/kit";
import { apiCuadro } from "@/services/apiDatos";
import { archivoEntidad } from "@/services/datosService";
import type { CuadroApi } from "@/types/api";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, Grafica, useNombreDescarga } from "../componentes";
import { fechaCorta, fmt, restarMeses } from "../datos";

/**
 * Hoja "Fuentes y Usos" (`EFI04`, que hasta ahora solo estaba en el explorador; Managerial
 * Analyzer "EOAF"; plan 06, item 1.14). Tabla por grupo (variacion mensual, fuentes, usos y
 * resultados) y las principales fuentes y usos del mes.
 */

const cargarEFI04 = (entidad: string) => apiCuadro("EFI04", { entidad: archivoEntidad(entidad) });

interface FilaFU {
  key: string;
  nombre: string;
  nivel: number;
  anterior: number | null;
  actual: number | null;
  children?: FilaFU[];
}

const valorEn = (c: CuadroApi, valores: (number | null)[], fecha: string) => {
  const i = c.periodos.indexOf(fecha);
  return i < 0 ? null : (valores[i] ?? null);
};

const arbolFU = (c: CuadroApi, fecha: string): FilaFU[] => {
  const anterior = restarMeses(fecha, 1);
  const grupos = new Map<string, FilaFU>();
  let padre: FilaFU | null = null;
  c.filas.forEach((f) => {
    const g = f.grupo ?? "";
    let grupo = grupos.get(g);
    if (!grupo) {
      grupo = { key: `g-${g}`, nombre: g, nivel: 0, anterior: null, actual: null, children: [] };
      grupos.set(g, grupo);
      padre = null;
    }
    const v = f.valores as (number | null)[];
    const fila: FilaFU = {
      key: `${f.indice}`,
      nombre: f.variable ?? "",
      nivel: f.nivel,
      anterior: valorEn(c, v, anterior),
      actual: valorEn(c, v, fecha),
    };
    if (f.nivel === 1 || !padre) {
      grupo.children!.push(fila);
      padre = fila;
    } else (padre.children ??= []).push(fila);
  });
  return [...grupos.values()];
};

/** Las cuentas (nivel 2) de un grupo con valor al corte, de mayor a menor. */
const principales = (c: CuadroApi, grupo: string, fecha: string, n = 6) =>
  c.filas
    .filter((f) => f.grupo === grupo && f.nivel === 2)
    .map((f) => ({ nombre: f.variable ?? "", valor: valorEn(c, f.valores as (number | null)[], fecha) ?? 0 }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, n);

const opcionPrincipales = (fuentes: { nombre: string; valor: number }[], usos: { nombre: string; valor: number }[], etiquetas: boolean) => {
  const corto = (s: string) => (s.length > 34 ? `${s.slice(0, 32)}…` : s);
  const filas = [...fuentes.map((f) => ({ ...f, tipo: "Fuente" })), ...usos.map((u) => ({ ...u, tipo: "Uso" }))].reverse();
  return {
    tooltip: { trigger: "axis", confine: true, axisPointer: { type: "none" }, valueFormatter: (v: number) => fmt(v) },
    legend: { bottom: 0, textStyle: TEXTO_GRAFICA, data: ["Fuente", "Uso"] },
    grid: { left: 8, right: 40, top: 8, bottom: 32, containLabel: true },
    xAxis: { type: "value", axisLabel: { ...TEXTO_GRAFICA, formatter: (v: number) => fmt(v) } },
    yAxis: { type: "category", data: filas.map((f) => `${corto(f.nombre)} (${f.tipo.toLowerCase()})`), axisLabel: TEXTO_GRAFICA },
    series: ["Fuente", "Uso"].map((tipo) => ({
      name: tipo,
      type: "bar",
      stack: "fu",
      barMaxWidth: 18,
      color: tipo === "Fuente" ? color.exito.base : color.error.base,
      data: filas.map((f) => (f.tipo === tipo ? f.valor : null)),
      label: { show: etiquetas, position: "right", ...TEXTO_GRAFICA, formatter: (p: { value: number | null }) => (p.value ? fmt(p.value) : "") },
    })),
  };
};

export const HojaFuentesUsos = () => {
  const { ctx, entidad, etiquetas } = useRevista();
  const nombre = useNombreDescarga();
  const { data: cuadro, isLoading, apiError } = useService(cargarEFI04, [entidad], [entidad], true, "No se pudo cargar el estado de fuentes y usos (EFI04).");
  const filas = useMemo(() => (cuadro ? arbolFU(cuadro, ctx.fecha) : []), [cuadro, ctx.fecha]);

  if (apiError) return <EstadoError error={apiError} />;
  if (isLoading || !cuadro)
    return (
      <div className="flex justify-center py-16">
        <Spin description="Cargando fuentes y usos..." />
      </div>
    );

  const excel: ColumnaExcel<FilaFU>[] = [
    { titulo: "Cuenta", valor: (r) => r.nombre, ancho: 60 },
    { titulo: fechaCorta(restarMeses(ctx.fecha, 1)), valor: (r) => r.anterior ?? "", ancho: 14 },
    { titulo: fechaCorta(ctx.fecha), valor: (r) => r.actual ?? "", ancho: 14 },
  ];

  return (
    <>
      <CabeceraPagina titulo="ESTADO DE FUENTES Y USOS" subtitulo={`${cuadro.unidad ?? "Millones USD"} · variaciones del mes`} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TablaAnalitica<FilaFU>
          rowKey="key"
          size="small"
          dataSource={filas}
          pagination={false}
          bordered
          arbol="contraido"
          indentSize={14}
          excel={{ nombre, columnas: excel }}
          scroll={{ x: "max-content", y: 520 }}
          columns={[
            {
              title: "Cuenta",
              key: "n",
              render: (_, r) => (
                <span className={r.nivel === 0 ? "font-bold uppercase text-identidad" : r.nivel === 1 ? "font-semibold" : ""}>{r.nombre}</span>
              ),
            },
            { title: fechaCorta(restarMeses(ctx.fecha, 1)), key: "a", align: "right", render: (_, r) => (r.anterior === null ? "" : fmt(r.anterior)) },
            { title: fechaCorta(ctx.fecha), key: "c", align: "right", render: (_, r) => (r.actual === null ? "" : <strong>{fmt(r.actual)}</strong>) },
          ]}
        />
        <Grafica
          titulo={`Principales fuentes y usos - ${fechaCorta(ctx.fecha)}`}
          nota={cuadro.notas[0]}
          option={opcionPrincipales(principales(cuadro, "FUENTES", ctx.fecha), principales(cuadro, "USOS", ctx.fecha), etiquetas)}
          alto={520}
          cambioTipo={false}
        />
      </div>
    </>
  );
};
