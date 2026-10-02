import { useMemo, useState } from "react";
import { InputNumber, Segmented, Spin, Switch } from "antd";
import { EstadoError, FranjaSelectores, TablaAnalitica, useService, type ColumnaExcel } from "@idce/kit";
import type { CuadroApi } from "@/types/api";
import { useRevista } from "../RevistaContext";
import { CabeceraPagina, useNombreDescarga } from "../componentes";
import { fechaCorta, fmt, restarMeses } from "../datos";
import { cargarBalanceEFI06 } from "../resumenEntidades";

/**
 * Hoja "Auditoría de desviaciones" (Managerial Analyzer §5.2; plan 06, item 1.13). Para cada partida
 * del balance y de resultados (arbol `EFI06`, niveles 1 a 3) y cada uno de los ultimos 12 cortes:
 * - importancia RELATIVA: variacion contra el mismo mes del año anterior (%). Como las cuentas de
 *   resultados vienen acumuladas en el año, comparar el mismo mes es correcto para las dos.
 * - importancia ABSOLUTA: esa variacion en USD, como % del activo total (materialidad).
 * Cada una se clasifica ALTA / MEDIA / BAJA y la celda toma la MENOR de las dos: un cambio grande
 * en una cuenta pequeña, o uno pequeño en una grande, no es una desviacion importante.
 */

type Nivel = 0 | 1 | 2;
const NOMBRE_NIVEL = ["BAJA", "MEDIA", "ALTA"] as const;
const CLASE_NIVEL = ["", "bg-advertencia-sutil text-advertencia", "bg-error-sutil text-error font-semibold"];

interface Umbrales {
  relMedia: number;
  relAlta: number;
  absMedia: number;
  absAlta: number;
}

const UMBRALES_INICIALES: Umbrales = { relMedia: 10, relAlta: 25, absMedia: 0.5, absAlta: 2 };

interface Celda {
  rel: number | null;
  abs: number | null;
  nivel: Nivel;
}

interface FilaAuditoria {
  key: string;
  nombre: string;
  nivel: number;
  celdas: Celda[];
  maximo: Nivel;
  children?: FilaAuditoria[];
}

/** Percentil (0-100) por interpolacion lineal. */
const percentil = (xs: number[], p: number) => {
  if (!xs.length) return Infinity;
  const o = [...xs].sort((a, b) => a - b);
  const i = ((o.length - 1) * p) / 100;
  const lo = Math.floor(i);
  return o[lo] + (o[Math.min(lo + 1, o.length - 1)] - o[lo]) * (i - lo);
};

const clasificar = (x: number, media: number, alta: number): Nivel => (x >= alta ? 2 : x >= media ? 1 : 0);

const construir = (cuadro: CuadroApi, fechas: string[], u: Umbrales, porPercentiles: boolean): FilaAuditoria[] => {
  const idx = new Map(cuadro.periodos.map((p, i) => [p, i]));
  const activo = cuadro.filas.find((f) => f.nivel === 1 && f.codigoBase === "1");
  const en = (valores: (number | null)[], fecha: string) => {
    const i = idx.get(fecha);
    return i === undefined ? null : (valores[i] ?? null);
  };

  const filas = cuadro.filas.filter((f) => f.nivel <= 3 && /^[1-5]/.test(f.codigoBase ?? ""));
  const nodos = new Map<number, FilaAuditoria>();
  const raices: FilaAuditoria[] = [];

  filas.forEach((f) => {
    const valores = f.valores as (number | null)[];
    // Variaciones relativas de toda la historia: base de los umbrales por percentiles de la partida.
    const historia = porPercentiles
      ? cuadro.periodos
          .map((p) => {
            const a = en(valores, p);
            const b = en(valores, restarMeses(p, 12));
            return a !== null && b ? Math.abs(((a - b) / Math.abs(b)) * 100) : null;
          })
          .filter((x): x is number => x !== null)
      : [];
    const relMedia = porPercentiles ? Math.max(percentil(historia, 75), u.relMedia / 2) : u.relMedia;
    const relAlta = porPercentiles ? Math.max(percentil(historia, 90), relMedia) : u.relAlta;

    const celdas = fechas.map((fecha): Celda => {
      const a = en(valores, fecha);
      const b = en(valores, restarMeses(fecha, 12));
      const tot = activo ? en(activo.valores as (number | null)[], fecha) : null;
      if (a === null || b === null || !tot) return { rel: null, abs: null, nivel: 0 };
      const rel = b ? ((a - b) / Math.abs(b)) * 100 : null;
      const abs = a - b;
      const nRel = rel === null ? 2 : clasificar(Math.abs(rel), relMedia, relAlta);
      const nAbs = clasificar((Math.abs(abs) / tot) * 100, u.absMedia, u.absAlta);
      return { rel, abs, nivel: Math.min(nRel, nAbs) as Nivel };
    });
    const nodo: FilaAuditoria = {
      key: `${f.indice}`,
      nombre: f.variable ?? f.codigoBase ?? "",
      nivel: f.nivel,
      celdas,
      maximo: celdas.reduce((m, c) => Math.max(m, c.nivel) as Nivel, 0 as Nivel),
    };
    nodos.set(f.indice, nodo);
    const padre = f.padre === null ? undefined : nodos.get(f.padre);
    if (padre) (padre.children ??= []).push(nodo);
    else raices.push(nodo);
  });
  return raices;
};

/** Deja solo las ramas con alguna celda ALTA (y sus ancestros, para no perder el contexto). */
const soloAltas = (filas: FilaAuditoria[]): FilaAuditoria[] =>
  filas.flatMap((f) => {
    const hijos = f.children ? soloAltas(f.children) : [];
    if (f.maximo < 2 && !hijos.length) return [];
    return [{ ...f, children: hijos.length ? hijos : undefined }];
  });

export const HojaAuditoria = () => {
  const { ctx, entidad } = useRevista();
  const nombre = useNombreDescarga();
  const { data: cuadro, isLoading, apiError } = useService(cargarBalanceEFI06, [entidad], [entidad], true, "No se pudo cargar el balance (EFI06).");
  const [u, setU] = useState<Umbrales>(UMBRALES_INICIALES);
  const [modo, setModo] = useState<"fijos" | "percentiles">("fijos");
  const [altas, setAltas] = useState(false);

  // Ultimos 12 cortes hasta la fecha elegida.
  const fechas = useMemo(() => {
    const fin = ctx.fechas.indexOf(ctx.fecha);
    return ctx.fechas.slice(Math.max(0, fin - 11), fin + 1);
  }, [ctx.fechas, ctx.fecha]);

  const arbol = useMemo(() => (cuadro ? construir(cuadro, fechas, u, modo === "percentiles") : []), [cuadro, fechas, u, modo]);
  const datos = useMemo(() => (altas ? soloAltas(arbol) : arbol), [arbol, altas]);

  const conteo = useMemo(() => {
    const c = [0, 0, 0];
    const contar = (fs: FilaAuditoria[]) =>
      fs.forEach((f) => {
        const ultima = f.celdas[f.celdas.length - 1];
        if (ultima) c[ultima.nivel]++;
        if (f.children) contar(f.children);
      });
    contar(arbol);
    return c;
  }, [arbol]);

  const numero = (clave: keyof Umbrales, sufijo: string) => (
    <InputNumber
      size="small"
      min={0}
      step={clave.startsWith("abs") ? 0.1 : 1}
      value={u[clave]}
      disabled={modo === "percentiles" && clave.startsWith("rel")}
      onChange={(v) => setU((x) => ({ ...x, [clave]: Number(v ?? 0) }))}
      suffix={sufijo}
      className="w-28"
    />
  );

  const excel: ColumnaExcel<FilaAuditoria>[] = [
    { titulo: "Partida", valor: (r) => r.nombre, ancho: 48 },
    ...fechas.flatMap((f, i): ColumnaExcel<FilaAuditoria>[] => [
      { titulo: `${fechaCorta(f)} var. %`, valor: (r) => r.celdas[i]?.rel ?? "", formato: "porcentaje", ancho: 12 },
      { titulo: `${fechaCorta(f)} importancia`, valor: (r) => NOMBRE_NIVEL[r.celdas[i]?.nivel ?? 0], ancho: 12 },
    ]),
  ];

  return (
    <>
      <CabeceraPagina
        titulo="AUDITORÍA DE DESVIACIONES"
        subtitulo="Partidas con variaciones anómalas contra el mismo mes del año anterior (importancia ALTA / MEDIA / BAJA)"
      />
      <FranjaSelectores
        grupos={[
          {
            rotulo: "Umbral relativo",
            control: (
              <Segmented
                value={modo}
                onChange={(v) => setModo(v as "fijos" | "percentiles")}
                options={[
                  { value: "fijos", label: "Fijo" },
                  { value: "percentiles", label: "Percentiles de la partida (P75 / P90)" },
                ]}
              />
            ),
          },
          {
            rotulo: "Variación relativa",
            control: (
              <span className="flex items-center gap-2">
                Media {numero("relMedia", "%")} Alta {numero("relAlta", "%")}
              </span>
            ),
          },
          {
            rotulo: "Variación absoluta / activo",
            control: (
              <span className="flex items-center gap-2">
                Media {numero("absMedia", "%")} Alta {numero("absAlta", "%")}
              </span>
            ),
          },
          {
            rotulo: "Filtro",
            control: (
              <label className="flex items-center gap-2 text-detalle">
                <Switch size="small" checked={altas} onChange={setAltas} /> Solo ALTA
              </label>
            ),
          },
        ]}
      />
      <p className="my-2 text-detalle text-tinta-tenue">
        Al {fechaCorta(ctx.fecha)}: <strong className="text-error">{conteo[2]} ALTA</strong> ·{" "}
        <strong className="text-advertencia">{conteo[1]} MEDIA</strong> · {conteo[0]} BAJA. Una celda es ALTA solo si la
        variación es alta en % <em>y</em> material frente al activo. Umbrales por defecto provisionales (plan 06, item 4.6).
      </p>
      {apiError ? (
        <EstadoError error={apiError} />
      ) : isLoading || !cuadro ? (
        <div className="flex justify-center py-16">
          <Spin description="Cargando balance..." />
        </div>
      ) : (
        <TablaAnalitica<FilaAuditoria>
          rowKey="key"
          size="small"
          dataSource={datos}
          pagination={false}
          bordered
          arbol={altas ? "expandido" : "contraido"}
          indentSize={14}
          excel={{ nombre, columnas: excel }}
          scroll={{ x: "max-content", y: 560 }}
          columns={[
            {
              title: "Partida",
              key: "n",
              fixed: "left",
              width: 320,
              render: (_, r) => <span className={r.nivel === 1 ? "font-bold text-identidad" : r.nivel === 2 ? "font-medium" : ""}>{r.nombre}</span>,
            },
            ...fechas.map((f, i) => ({
              title: fechaCorta(f),
              key: f,
              align: "right" as const,
              width: 78,
              onCell: (r: FilaAuditoria) => ({ className: CLASE_NIVEL[r.celdas[i]?.nivel ?? 0] }),
              render: (_: unknown, r: FilaAuditoria) => {
                const c = r.celdas[i];
                if (!c || c.rel === null) return <span className="text-tinta-tenue">-</span>;
                return (
                  <span title={`Var. ${fmt(c.rel)} % · ${fmt(c.abs)} millones USD · ${NOMBRE_NIVEL[c.nivel]}`}>
                    {c.rel > 0 ? "+" : ""}
                    {fmt(c.rel)}%
                  </span>
                );
              },
            })),
          ]}
        />
      )}
    </>
  );
};
