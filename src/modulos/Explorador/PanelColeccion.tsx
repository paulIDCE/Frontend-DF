import { useMemo, useState } from "react";
import { Badge, Button, Switch, Tooltip } from "antd";
import { DeleteOutlined, LineChartOutlined, ShoppingCartOutlined, StarFilled } from "@ant-design/icons";
import { TarjetaGrafica } from "@idce/kit";
import type { SerieColeccion } from "./tipos";
import { opcionSeries } from "./graficas";

/**
 * "Mi Colección" — hasta 10 series en una sola grafica, cada una con eje
 * derecho y linea/barra. "AMPLIAR" del original = pantalla completa de
 * `TarjetaGrafica`; "Mostrar valores" = su boton de etiquetas.
 */

interface Props {
  series: SerieColeccion[];
  totalCarrito: number;
  onAbrirCarrito: () => void;
  onCambiar: (id: string, cambios: Partial<Pick<SerieColeccion, "derecha" | "tipo">>) => void;
  onGraficar: (serie: SerieColeccion) => void;
  onQuitar: (id: string) => void;
}

const PanelColeccion = ({ series, totalCarrito, onAbrirCarrito, onCambiar, onGraficar, onQuitar }: Props) => {
  const [etiquetas, setEtiquetas] = useState(false);

  const option = useMemo(() => opcionSeries(series, { etiquetas }), [series, etiquetas]);
  const opcionAmpliada = useMemo(
    () => opcionSeries(series, { etiquetas, visibles: Number.MAX_SAFE_INTEGER }),
    [series, etiquetas]
  );

  return (
    <aside className="flex flex-col gap-3 rounded-contenedor bg-superficie p-4 shadow-tarjeta">
      <div className="flex items-center justify-between gap-2">
        <h3 className="m-0 flex items-center gap-2 text-subtitulo font-bold text-identidad">
          <StarFilled className="text-advertencia" /> Mi Colección
          <Tooltip title="Ver carrito">
            <Badge count={totalCarrito} size="small">
              <Button size="small" shape="circle" icon={<ShoppingCartOutlined />} onClick={onAbrirCarrito} />
            </Badge>
          </Tooltip>
        </h3>
        <span className="text-detalle text-tinta-tenue">{series.length} series</span>
      </div>

      <TarjetaGrafica
        titulo="Evolución de las Estadísticas del Sector"
        subtitulo={series[0]?.unidad}
        option={option}
        opcionPantallaCompleta={opcionAmpliada}
        alto={340}
        compacta
        etiquetas={{ activas: etiquetas, alternar: () => setEtiquetas((v) => !v) }}
        textoVacio="Selecciona una serie para ver su gráfico"
        nombreImagen="mi_coleccion"
      />

      {series.length === 0 ? (
        <div className="rounded-tarjeta border border-dashed border-linea p-4 text-center text-tinta-tenue">
          <p className="m-0">Activa hasta 10 series que quieras analizar.</p>
          <p className="m-0 text-detalle">Selecciona tus series del cuadro y agrégalas aquí.</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {series.map((s) => (
            <li key={s.id} className="rounded-tarjeta border border-linea p-2">
              <div className="text-cuerpo font-semibold text-tinta">{s.variable}</div>
              {(s.cuadroNombre || s.sectorNombre) && (
                <div className="text-rotulo text-tinta-tenue">
                  {[s.cuadroNombre, s.sectorNombre].filter(Boolean).join(" · ")}
                </div>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-detalle text-tinta-secundaria">
                <label className="flex items-center gap-1">
                  <Switch size="small" checked={s.derecha} onChange={(v) => onCambiar(s.id, { derecha: v })} />
                  Eje Der
                </label>
                <label className="flex items-center gap-1">
                  <Switch
                    size="small"
                    checked={s.tipo === "bar"}
                    onChange={(v) => onCambiar(s.id, { tipo: v ? "bar" : "line" })}
                  />
                  Barra
                </label>
                <span className="ml-auto flex gap-1">
                  <Tooltip title="Graficar">
                    <Button size="small" type="text" icon={<LineChartOutlined />} onClick={() => onGraficar(s)} />
                  </Tooltip>
                  <Tooltip title="Quitar">
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onQuitar(s.id)} />
                  </Tooltip>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default PanelColeccion;
