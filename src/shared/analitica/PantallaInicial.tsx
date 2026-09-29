import { ReactNode } from "react";

export interface PuntoPantallaInicial {
  icono: ReactNode;
  titulo: string;
  texto: ReactNode;
}

/**
 * Lo que se ve antes del primer Filtrar: que muestra la vista, sus 2-3 conceptos clave y como
 * empezar. Nada se consulta hasta entonces, asi que nunca se pintan graficas vacias.
 */
const PantallaInicial = ({
  titulo,
  descripcion,
  puntos,
}: {
  titulo: string;
  descripcion: ReactNode;
  puntos: PuntoPantallaInicial[];
}) => (
  <div className="bg-superficie border border-linea rounded-tarjeta p-5">
    <h2 className="text-subtitulo font-bold text-tinta m-0">{titulo}</h2>
    <p className="text-cuerpo text-tinta-tenue mt-1 mb-4 max-w-3xl">{descripcion}</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {puntos.map((p) => (
        <div key={p.titulo} className="border-l-2 border-accion-borde pl-3">
          <div className="flex items-center gap-2 text-tinta text-detalle font-bold uppercase">
            {p.icono} {p.titulo}
          </div>
          <p className="text-detalle text-tinta-tenue leading-relaxed mt-1 mb-0">{p.texto}</p>
        </div>
      ))}
    </div>
  </div>
);

export default PantallaInicial;
