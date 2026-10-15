import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { color, conAlfa, tipografia } from "@idce/kit";

/**
 * Hub de reportes en acordeon (maqueta "Pantalla Inicial" de `Libro1.xlsx` y `analisis.html` de
 * data-financiero): la tarjeta activa se expande con titulo, descripcion y "Explorar reporte"; las
 * demas muestran numero y titulo vertical. Rota sola cada 6 s hasta que el usuario interactua, y
 * no rota con `prefers-reduced-motion`. En pantallas angostas las tarjetas se apilan.
 *
 * Colores: degradado del azul de identidad (oscuro) al color de la serie i de la paleta de datos,
 * en orden fijo; el texto va en blanco sobre un velo oscuro. Nada de hex sueltos (TOKENS.md).
 */

/** Marca de agua: el icono del reporte, muy grande y casi transparente. */
const TAMANO_MARCA = tipografia.escala.hero.tamano * 2.5;

export interface ReporteHub {
  clave: string;
  pagina: number;
  titulo: string;
  /** Rotulo corto en mayusculas sobre el titulo ("Estado de situación"). */
  tagline: string;
  /** Distintivo de la esquina ("Balances"). */
  badge: string;
  texto: string;
  icono: ComponentType<{ className?: string; style?: CSSProperties }>;
}

const ROTACION_MS = 6000;

const fondo = (i: number) =>
  `radial-gradient(120% 90% at 85% 10%, ${conAlfa(color.tinta.inversa, 0.22)}, transparent 55%), ` +
  `linear-gradient(160deg, ${color.identidad.activo} 0%, ${color.identidad.base} 35%, ${color.datos.series[i % color.datos.series.length]} 100%)`;

const VELO = `linear-gradient(to top, ${conAlfa(color.identidad.activo, 0.85)} 0%, ${conAlfa(color.identidad.activo, 0.25)} 45%, transparent 75%)`;

const reducirMovimiento = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const AcordeonReportes = ({ reportes, onAbrir }: { reportes: ReporteHub[]; onAbrir: (pagina: number) => void }) => {
  const [activo, setActivo] = useState(0);
  const [rotando, setRotando] = useState(() => !reducirMovimiento());
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rotando) return;
    const t = setInterval(() => setActivo((i) => (i + 1) % reportes.length), ROTACION_MS);
    return () => clearInterval(t);
  }, [rotando, reportes.length]);

  const elegir = (i: number) => {
    setRotando(false);
    setActivo(i);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-detalle text-tinta-tenue">
        Haz clic en una tarjeta para previsualizarla y ábrela con <strong>Explorar reporte</strong>.
      </p>
      <div
        ref={contenedor}
        role="tablist"
        aria-label="Reportes interactivos"
        className="flex flex-col gap-3 md:h-[440px] md:flex-row"
        onMouseEnter={() => setRotando(false)}
        onFocus={() => setRotando(false)}
      >
        {reportes.map((r, i) => {
          const abierta = i === activo;
          const numero = String(i + 1).padStart(2, "0");
          return (
            <article
              key={r.clave}
              role="tab"
              aria-selected={abierta}
              tabIndex={0}
              onClick={() => elegir(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (abierta) onAbrir(r.pagina);
                  else elegir(i);
                }
                if (e.key === "ArrowRight" || e.key === "ArrowDown") elegir((i + 1) % reportes.length);
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") elegir((i - 1 + reportes.length) % reportes.length);
              }}
              className={`relative isolate overflow-hidden rounded-contenedor shadow-contenedor outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-accion ${
                abierta ? "h-[340px] cursor-default md:h-auto md:flex-[1_1_460px]" : "h-16 cursor-pointer hover:-translate-y-1 hover:shadow-elevada md:h-auto md:flex-[0_0_72px]"
              }`}
              style={{ background: fondo(i) }}
            >
              <span aria-hidden className="absolute inset-0 -z-10" style={{ background: VELO }} />
              <r.icono className="pointer-events-none absolute -bottom-6 -right-3 -z-10 rotate-[-12deg] text-tinta-inversa opacity-15" style={{ fontSize: TAMANO_MARCA }} />
              <span
                className={`absolute z-10 flex h-9 w-9 items-center justify-center rounded-full border border-solid text-rotulo font-bold text-tinta-inversa transition-all duration-500 ${
                  abierta ? "left-4 top-4" : "left-4 top-1/2 -translate-y-1/2 md:left-1/2 md:top-4 md:-translate-x-1/2 md:translate-y-0"
                }`}
                style={{ background: conAlfa(color.tinta.inversa, 0.22), borderColor: conAlfa(color.tinta.inversa, 0.35) }}
              >
                {numero}
              </span>
              <span
                className={`absolute right-4 top-4 z-10 rounded-full border border-solid px-3 py-1 text-rotulo font-bold uppercase tracking-wider text-tinta-inversa transition-all duration-300 ${
                  abierta ? "opacity-100" : "-translate-y-2 opacity-0"
                }`}
                style={{ background: conAlfa(color.tinta.inversa, 0.2), borderColor: conAlfa(color.tinta.inversa, 0.3) }}
              >
                {r.badge}
              </span>
              <span
                className={`absolute z-10 whitespace-nowrap text-detalle font-semibold text-tinta-inversa transition-opacity duration-300 left-16 top-1/2 -translate-y-1/2 md:bottom-4 md:left-1/2 md:top-auto md:-translate-x-1/2 md:translate-y-0 md:rotate-180 md:[writing-mode:vertical-rl] ${
                  abierta ? "opacity-0" : "opacity-100"
                }`}
              >
                {r.titulo}
              </span>
              <div
                className={`absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-6 transition-all duration-300 ${
                  abierta ? "pointer-events-auto translate-y-0 opacity-100 delay-200" : "pointer-events-none translate-y-4 opacity-0"
                }`}
              >
                <span className="text-rotulo font-bold uppercase tracking-widest text-tinta-inversa opacity-75">{r.tagline}</span>
                <h2 className="m-0 text-cifra font-bold leading-tight text-tinta-inversa">{r.titulo}</h2>
                <p className="m-0 max-w-[520px] text-detalle leading-relaxed text-tinta-inversa opacity-85">{r.texto}</p>
                <button
                  type="button"
                  tabIndex={abierta ? 0 : -1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAbrir(r.pagina);
                  }}
                  className="group mt-2 inline-flex cursor-pointer items-center gap-3 self-start rounded-full border-0 bg-superficie px-4 py-2 text-detalle font-bold text-tinta shadow-contenedor transition-transform hover:-translate-y-0.5"
                >
                  Explorar reporte
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-identidad-activo text-tinta-inversa transition-transform group-hover:translate-x-0.5">
                    <ArrowRightOutlined />
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
