import { useState } from "react";
import { useService } from "@idce/kit";
import { leerJson } from "@/services/datosService";
import Explorador from "@/modulos/Explorador/Explorador";
import { ARBOL_MACRO } from "@/modulos/Explorador/arboles/macroeconomico";
import { buscarPorCuadro } from "@/modulos/Explorador/arbol";
import { parrafos } from "@/modulos/Explorador/datos";
import type { CuadroCargado, FilaCuadro, NodoCuadro } from "@/modulos/Explorador/tipos";

/**
 * Entorno Macroeconómico — porte de prueba-data `macroeconomico.html` / `macro.js`.
 * Une base_anual + base_mensual + base_trimestral y filtra por `Cuadro`.
 */

const ARCHIVOS = ["base_anual.json", "base_mensual.json", "base_trimestral.json"];
const CUADRO_INICIAL = "IEA111A";

interface Nota {
  Cuadro: string;
  Notas: string;
}

const cargarTodo = async (): Promise<FilaCuadro[]> =>
  (await Promise.all(ARCHIVOS.map((a) => leerJson<FilaCuadro[]>(a)))).flat();

const cargarCuadro = async (id: string): Promise<CuadroCargado> => {
  const [todo, notas] = await Promise.all([
    cargarTodo(),
    leerJson<Nota[]>("base_notas.json").catch(() => [] as Nota[]),
  ]);
  const filas = todo.filter((f) => f.Cuadro === id);
  return {
    id,
    titulo: String(filas[0]?.Titulo_Cuadro ?? ""),
    unidad: String(filas[0]?.Unidad ?? ""),
    filas,
    notas: notas.filter((n) => n.Cuadro === id).flatMap((n) => parrafos(n.Notas)),
  };
};

const Macroeconomico = () => {
  const [nodo, setNodo] = useState<NodoCuadro | undefined>(() => buscarPorCuadro(ARBOL_MACRO, CUADRO_INICIAL));
  const id = nodo?.cuadro ?? CUADRO_INICIAL;

  const { data, isLoading, apiError, execute } = useService(
    cargarCuadro,
    [id],
    [],
    true,
    "No se pudieron cargar los datos del cuadro"
  );

  return (
    <Explorador
      arbol={ARBOL_MACRO}
      nodoActivo={nodo?.key}
      onElegir={setNodo}
      cuadro={data}
      cargando={isLoading}
      error={apiError}
      onReintentar={() => execute()}
    />
  );
};

export default Macroeconomico;
