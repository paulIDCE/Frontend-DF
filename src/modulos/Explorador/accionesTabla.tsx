import type { ReactNode } from "react";
import { Button, Checkbox, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { EyeOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import type { FilaCuadro } from "./tipos";

/** Props comunes de las tablas del explorador (`TablaCuadro`, `TablaBalances`). */
export interface PropsTablaSeries {
  filas: FilaCuadro[];
  periodos: string[];
  seleccionados: Set<number>;
  /** Panel lleno (maximo de series): los checkbox sin marcar se deshabilitan. */
  lleno: boolean;
  maximo: number;
  onSeleccionar: (indice: number, marcado: boolean) => void;
  onDeseleccionarTodo: () => void;
  onGraficar: (indice: number) => void;
  esFavorito: (indice: number) => boolean;
  onFavorito: (indice: number) => void;
  /** Archivo del Excel de la tabla. */
  nombreExcel: string;
  /** Botones extra en la barra de la tabla (CSV…). */
  barra?: ReactNode;
  alto?: number;
}

type Acciones = Pick<
  PropsTablaSeries,
  "seleccionados" | "lleno" | "maximo" | "onSeleccionar" | "onDeseleccionarTodo" | "onGraficar" | "esFavorito" | "onFavorito"
>;

/**
 * Columnas de acciones, una por concepto (mismo vocabulario que el panel):
 * - "Comparar": casilla que lleva la serie al grafico comparativo; su cabecera la vacia.
 * - "Ver": ojo, grafico rapido de esa sola serie (no agrega nada a ningun lado).
 * - Estrella: guardar en favoritos (permanente). La estrella solo significa eso en la pantalla.
 * `indiceDe` devuelve `null` en filas sin serie (encabezados de grupo).
 */
export const columnasAcciones = <R,>(
  a: Acciones,
  indiceDe: (r: R) => number | null,
  onCell: (r: R) => object = () => ({}),
): TableColumnsType<R> => [
  {
    title: (
      <span className="inline-flex items-center gap-1">
        <Tooltip title={a.seleccionados.size ? "Quitar del gráfico comparativo todas las de este cuadro" : undefined}>
          <Checkbox
            checked={false}
            indeterminate={a.seleccionados.size > 0}
            disabled={a.seleccionados.size === 0}
            onChange={a.onDeseleccionarTodo}
            aria-label="Deseleccionar todo"
          />
        </Tooltip>
        <Tooltip title={`Marca hasta ${a.maximo} series para verlas juntas en el gráfico comparativo`}>
          <span>Comparar</span>
        </Tooltip>
      </span>
    ),
    key: "sel",
    width: 104,
    align: "center",
    fixed: "left",
    onCell,
    render: (_, r) => {
      const i = indiceDe(r);
      if (i === null) return null;
      const marcado = a.seleccionados.has(i);
      const bloqueado = a.lleno && !marcado;
      return (
        <Tooltip
          title={
            bloqueado
              ? `El gráfico comparativo ya tiene ${a.maximo} series: quita alguna para añadir esta`
              : marcado
                ? "Quitar del gráfico comparativo"
                : "Añadir al gráfico comparativo"
          }
        >
          <Checkbox checked={marcado} disabled={bloqueado} onChange={(e) => a.onSeleccionar(i, e.target.checked)} />
        </Tooltip>
      );
    },
  },
  {
    title: "Ver",
    key: "graf",
    width: 52,
    align: "center",
    fixed: "left",
    onCell,
    render: (_, r) => {
      const i = indiceDe(r);
      return (
        i !== null && (
          <Tooltip title="Ver solo esta serie">
            <Button type="text" size="small" icon={<EyeOutlined />} aria-label="Ver serie" onClick={() => a.onGraficar(i)} />
          </Tooltip>
        )
      );
    },
  },
  {
    title: (
      <Tooltip title="Guarda series en favoritos para usarlas en cualquier cuadro y sesión">
        <StarOutlined aria-label="Favoritos" />
      </Tooltip>
    ),
    key: "favorito",
    width: 52,
    align: "center",
    fixed: "left",
    onCell,
    render: (_, r) => {
      const i = indiceDe(r);
      if (i === null) return null;
      const es = a.esFavorito(i);
      return (
        <Tooltip title={es ? "Guardada en favoritos (clic para quitar)" : "Guardar en favoritos"}>
          <Button
            type="text"
            size="small"
            aria-pressed={es}
            icon={es ? <StarFilled className="text-advertencia" /> : <StarOutlined />}
            onClick={() => a.onFavorito(i)}
          />
        </Tooltip>
      );
    },
  },
];
