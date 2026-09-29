import { ReactNode } from "react";
import GuiaUso from "@/demos/GuiaUso";
import BloqueCodigo from "./BloqueCodigo";
import CajaEjemplo, { type Ejemplo } from "./CajaEjemplo";
import TablaApi, { type PropApi } from "./TablaApi";
import { idSeccion } from "./ids";
import Texto from "./Texto";

export interface PaginaPiezaProps {
  /** Ancla de la página (`#tarjeta-grafica`); las secciones cuelgan de ella (`#tarjeta-grafica-api`). */
  id: string;
  nombre: string;
  /** Qué es, en una frase. */
  resumen: ReactNode;
  /** Línea de import que se copia. */
  importar: string;
  usar: ReactNode[];
  evitar: ReactNode[];
  ejemplos: Ejemplo[];
  /** Panel para probar la API en vivo. */
  playground?: ReactNode;
  api: { titulo?: ReactNode; props: PropApi[] }[];
  /** Detalles que no caben en la tabla (comportamientos, casos borde). */
  notas?: ReactNode[];
}

const Titulo = ({ id, children }: { id: string; children: ReactNode }) => (
  <h3
    id={id}
    className="scroll-mt-20 m-0 text-subtitulo font-semibold text-tinta"
  >
    {children}
  </h3>
);

/**
 * Página de una pieza en la guía, con el orden de la documentación de antd: qué es y cómo se
 * importa, cuándo usarla, ejemplos con su código, playground y API.
 */
const PaginaPieza = ({
  id,
  nombre,
  resumen,
  importar,
  usar,
  evitar,
  ejemplos,
  playground,
  api,
  notas,
}: PaginaPiezaProps) => {
  return (
    <article id={id} className="@container scroll-mt-20 flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h2 className="m-0 text-titulo font-semibold text-tinta">{nombre}</h2>
        <p className="m-0 text-cuerpo text-tinta-secundaria max-w-3xl">
          <Texto>{resumen}</Texto>
        </p>
        <BloqueCodigo codigo={importar} lenguaje="ts" className="max-w-3xl" />
      </header>

      <div className="flex flex-col gap-2">
        <Titulo id={idSeccion(id, "uso")}>Cuándo usarlo</Titulo>
        <GuiaUso
          usar={usar.map((t, i) => (
            <Texto key={i}>{t}</Texto>
          ))}
          evitar={evitar.map((t, i) => (
            <Texto key={i}>{t}</Texto>
          ))}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Titulo id={idSeccion(id, "ejemplos")}>Ejemplos</Titulo>
        {/* Dos columnas como antd cuando la página mide 896 px o más (container query: el ancho real,
            no la ventana), en el orden de la lista; los ejemplos anchos ocupan la fila entera. */}
        <div className="grid grid-cols-1 @4xl:grid-cols-2 gap-3 items-start">
          {ejemplos.map((e) => (
            <CajaEjemplo key={e.id} ejemplo={e} />
          ))}
        </div>
      </div>

      {playground && (
        <div className="flex flex-col gap-2">
          <Titulo id={idSeccion(id, "playground")}>Playground</Titulo>
          <p className="m-0 text-detalle text-tinta-secundaria">
            Cambia las props y copia el JSX resultante. Los datos son de
            ejemplo.
          </p>
          {playground}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Titulo id={idSeccion(id, "api")}>API</Titulo>
        {api.map((tabla, i) => (
          <TablaApi key={i} titulo={tabla.titulo} props={tabla.props} />
        ))}
        {notas && notas.length > 0 && (
          <ul className="m-0 pl-4 list-disc text-detalle text-tinta-secundaria flex flex-col gap-1">
            {notas.map((n, i) => (
              <li key={i}>
                <Texto>{n}</Texto>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
};

export default PaginaPieza;
