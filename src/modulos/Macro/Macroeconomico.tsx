import { useState } from "react";
import { useService } from "@idce/kit";
import { apiCuadro } from "@/services/apiDatos";
import { aCuadroCargado } from "@/services/adaptadores";
import Explorador from "@/modulos/Explorador/Explorador";
import { ARBOL_MACRO } from "@/modulos/Explorador/arboles/macroeconomico";
import { buscarPorCuadro } from "@/modulos/Explorador/arbol";
import type { CuadroCargado, NodoCuadro } from "@/modulos/Explorador/tipos";

/**
 * Entorno Macroeconómico — porte de prueba-data `macroeconomico.html` / `macro.js`.
 * Cada cuadro (con sus notas) llega de la API; antes se bajaban los tres
 * archivos base (~19 MB) y se filtraba por `Cuadro`.
 */

const CUADRO_INICIAL = "IEA111A";

const cargarCuadro = async (id: string): Promise<CuadroCargado> => aCuadroCargado(await apiCuadro(id));

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
