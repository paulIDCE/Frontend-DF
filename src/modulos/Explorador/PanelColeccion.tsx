import { useMemo, useState } from "react";
import { Badge, Button, Switch, Tooltip } from "antd";
import { CloseOutlined, EyeOutlined, InfoCircleOutlined, LineChartOutlined, StarOutlined } from "@ant-design/icons";
import { TarjetaGrafica, color, swalConfirm } from "@idce/kit";
import type { SerieColeccion } from "./tipos";
import { opcionSeries, ventanaSeries } from "./graficas";
import UbicacionSerie from "./UbicacionSerie";

/**
 * "Gráfico comparativo" (antes "Mi Colección" de prueba-data) — hasta 10 series en una sola
 * grafica, cada una con linea/barras y una sola en el eje derecho. Se conserva al cambiar de cuadro
 * (mezcla series de cuadros distintos) mientras dure la visita a la pantalla; lo permanente son los
 * favoritos (★), que se traen aqui con "Añadir desde favoritos".
 *
 * Vocabulario de la pantalla, para no mezclar conceptos:
 * - casilla "Comparar" = entra al grafico comparativo;
 * - ojo "Ver serie" = grafico rapido de una sola serie;
 * - estrella = guardada en favoritos (y solo eso).
 *
 * La grafica abre y restablece su zoom en el filtro Periodo Desde–Hasta.
 */

interface Props {
  series: SerieColeccion[];
  maximo: number;
  /** Filtro Periodo Desde–Hasta de la vista. */
  rango: [string, string];
  totalFavoritos: number;
  onAbrirFavoritos: () => void;
  onCambiar: (id: string, cambios: Partial<Pick<SerieColeccion, "derecha" | "tipo">>) => void;
  onGraficar: (serie: SerieColeccion) => void;
  onQuitar: (id: string) => void;
  onQuitarTodas: () => void;
}

const PanelColeccion = ({
  series,
  maximo,
  rango,
  totalFavoritos,
  onAbrirFavoritos,
  onCambiar,
  onGraficar,
  onQuitar,
  onQuitarTodas,
}: Props) => {
  const [etiquetas, setEtiquetas] = useState(false);

  const option = useMemo(() => opcionSeries(series, { etiquetas, rango }), [series, etiquetas, rango]);
  const zoomBase = useMemo(() => ventanaSeries(series, rango), [series, rango]);
  const lleno = series.length >= maximo;
  // Con series de cuadros distintos la unidad puede no ser comun: solo se muestra si lo es.
  const unidades = new Set(series.map((s) => s.unidad ?? ""));
  const unidadComun = unidades.size === 1 ? series[0]?.unidad : undefined;

  const vaciar = async () => {
    if (await swalConfirm("¿Vaciar el gráfico comparativo?", "Se quitan todas las series del gráfico. Tus favoritos no cambian."))
      onQuitarTodas();
  };

  return (
    <aside className="flex flex-col gap-3 rounded-contenedor bg-superficie p-4 shadow-tarjeta">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="m-0 flex items-center gap-2 text-subtitulo font-bold text-identidad">
            <LineChartOutlined /> Gráfico comparativo
          </h3>
          <Tooltip title={lleno ? "Llegaste al máximo: quita alguna serie para añadir otra" : `Puedes comparar hasta ${maximo} series`}>
            <span className={`text-detalle font-semibold ${lleno ? "text-advertencia-activo" : "text-tinta-tenue"}`}>
              {series.length}/{maximo}
            </span>
          </Tooltip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge count={totalFavoritos} size="small" color={color.advertencia.base}>
            <Button size="small" icon={<StarOutlined />} onClick={onAbrirFavoritos}>
              Añadir desde favoritos
            </Button>
          </Badge>
          {series.length > 0 && (
            <Button size="small" type="text" className="ml-auto" onClick={vaciar}>
              Vaciar gráfico
            </Button>
          )}
        </div>
      </div>

      <TarjetaGrafica
        titulo="Evolución de las series comparadas"
        subtitulo={unidadComun ?? (series.length ? "Series con unidades distintas: usa el eje derecho si las escalas no encajan" : undefined)}
        option={option}
        zoomBase={zoomBase}
        alto={340}
        compacta
        etiquetas={{ activas: etiquetas, alternar: () => setEtiquetas((v) => !v) }}
        textoVacio="Aún no hay series para comparar"
        nombreImagen="grafico_comparativo"
      />

      {series.length === 0 ? (
        <div className="flex flex-col gap-1 rounded-tarjeta border border-dashed border-linea p-4 text-center text-detalle text-tinta-tenue">
          <p className="m-0 text-cuerpo text-tinta-secundaria">Compara hasta {maximo} series en un mismo gráfico.</p>
          <p className="m-0">
            Marca la casilla <strong>Comparar</strong> en la tabla o usa <strong>Añadir desde favoritos</strong>.
          </p>
        </div>
      ) : (
        <>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {series.map((s, i) => (
              <li key={s.id} className="rounded-tarjeta border border-linea p-2">
                <div className="flex items-start gap-2">
                  {/* Mismo color que su linea en el grafico: la lista se lee como leyenda. */}
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: color.datos.series[i % color.datos.series.length] }}
                    aria-hidden
                  />
                  <UbicacionSerie
                    variable={s.variable}
                    ruta={s.ruta}
                    grupo={s.fila.Grupo}
                    cuadroNombre={s.cuadroNombre}
                    sectorNombre={s.sectorNombre}
                    contenidos={s.contenidos}
                  />
                  <Tooltip title="Ver solo esta serie">
                    <Button size="small" type="text" icon={<EyeOutlined />} aria-label="Ver serie" onClick={() => onGraficar(s)} />
                  </Tooltip>
                  <Tooltip title="Quitar del gráfico">
                    <Button size="small" type="text" icon={<CloseOutlined />} aria-label="Quitar del gráfico" onClick={() => onQuitar(s.id)} />
                  </Tooltip>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 pl-4.5 text-detalle text-tinta-secundaria">
                  <Tooltip title="Solo una serie puede usar el eje derecho: útil cuando su escala es muy distinta (p. ej. % frente a millones)">
                    <label className="flex items-center gap-1">
                      <Switch size="small" checked={s.derecha} onChange={(v) => onCambiar(s.id, { derecha: v })} />
                      Eje derecho
                    </label>
                  </Tooltip>
                  <label className="flex items-center gap-1">
                    <Switch
                      size="small"
                      checked={s.tipo === "bar"}
                      onChange={(v) => onCambiar(s.id, { tipo: v ? "bar" : "line" })}
                    />
                    Barras
                  </label>
                </div>
              </li>
            ))}
          </ul>
          <p className="m-0 flex items-start gap-1 text-rotulo text-tinta-tenue">
            <InfoCircleOutlined className="mt-0.5" />
            Puedes cambiar de cuadro y seguir añadiendo series. El gráfico se pierde al salir de la pantalla: guarda
            con ★ las que quieras conservar.
          </p>
        </>
      )}
    </aside>
  );
};

export default PanelColeccion;
