import { Button, Popover, Tooltip } from "antd";
import { ApartmentOutlined } from "@ant-design/icons";

/**
 * Donde vive una serie. Hay variables con el mismo nombre en ramas distintas ("Otros",
 * "OPERACIONES INTERBANCARIAS"…), asi que el nombre solo no basta: se ven la serie (ultimo nivel)
 * y el nivel 0 de su ubicacion, y "Ver ubicación" despliega la cadena completa:
 * Contenidos › cuadro › sector/entidad › cuentas › serie.
 */

export interface DatosUbicacion {
  variable: string;
  /** Cuentas ancestro dentro del cuadro, de la raiz al padre. */
  ruta?: string[];
  /** Respaldo para favoritos guardados antes de `ruta`. */
  grupo?: string;
  cuadroNombre?: string;
  sectorNombre?: string;
  /** Ramas del arbol "Contenidos" hasta el cuadro (sin el cuadro). */
  contenidos?: string[];
}

const limpio = (t?: string) => (t ?? "").replace(/\s+/g, " ").trim();

const Paso = ({ texto, nivel, tipo }: { texto: string; nivel: number; tipo: "menu" | "cuadro" | "cuenta" | "serie" }) => (
  <li className="flex items-start gap-1.5" style={{ paddingLeft: nivel * 12 }}>
    {nivel > 0 && <span className="text-tinta-deshabilitada">└</span>}
    <span
      className={
        tipo === "serie"
          ? "font-bold text-identidad"
          : tipo === "cuadro"
            ? "font-semibold text-tinta"
            : tipo === "menu"
              ? "text-tinta-tenue"
              : "text-tinta-secundaria"
      }
    >
      {texto}
    </span>
  </li>
);

/** Cadena completa, indentada como un arbol. */
const CadenaCompleta = ({ d }: { d: DatosUbicacion }) => {
  const ruta = d.ruta ?? (d.grupo ? [d.grupo] : []);
  const pasos: { texto: string; tipo: "menu" | "cuadro" | "cuenta" | "serie" }[] = [
    ...(d.contenidos ?? []).map((t) => ({ texto: limpio(t), tipo: "menu" as const })),
    ...(d.cuadroNombre ? [{ texto: limpio(d.cuadroNombre), tipo: "cuadro" as const }] : []),
    ...(d.sectorNombre ? [{ texto: limpio(d.sectorNombre), tipo: "menu" as const }] : []),
    ...ruta.map((t) => ({ texto: limpio(t), tipo: "cuenta" as const })),
    { texto: limpio(d.variable), tipo: "serie" as const },
  ];
  return (
    <ol className="m-0 flex max-w-[420px] list-none flex-col gap-1 p-0 text-detalle">
      {pasos.map((p, i) => (
        <Paso key={i} texto={p.texto} nivel={i} tipo={p.tipo} />
      ))}
    </ol>
  );
};

/**
 * Lectura inmediata: la serie (ultimo nivel) y, debajo, el nivel 0 de su ubicacion (la raiz de
 * "Contenidos": Sistema Financiero Nacional, Estadísticas Mensuales…). Lo de en medio queda en
 * "Ver ubicación". Favoritos guardados sin `contenidos` muestran el cuadro.
 */
const UbicacionSerie = (d: DatosUbicacion) => {
  const nivel0 = limpio(d.contenidos?.[0] ?? d.cuadroNombre);

  return (
    <div className="flex min-w-0 flex-1 items-start gap-1">
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-tinta" title={limpio(d.variable)}>
          {limpio(d.variable)}
        </div>
        {nivel0 && (
          <div className="truncate text-rotulo text-tinta-tenue" title={nivel0}>
            {nivel0}
          </div>
        )}
      </div>
      <Popover
        trigger="click"
        placement="leftTop"
        title={
          <span className="flex items-center gap-2">
            <ApartmentOutlined /> Ubicación de la serie
          </span>
        }
        content={<CadenaCompleta d={d} />}
      >
        <Tooltip title="Ver ubicación completa">
          <Button size="small" type="text" icon={<ApartmentOutlined />} aria-label="Ver ubicación" />
        </Tooltip>
      </Popover>
    </div>
  );
};

export default UbicacionSerie;
