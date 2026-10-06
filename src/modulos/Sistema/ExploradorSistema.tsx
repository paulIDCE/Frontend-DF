import { useState } from "react";
import { Select } from "antd";
import { useService } from "@idce/kit";
import Explorador from "@/modulos/Explorador/Explorador";
import { buscarPorCuadro } from "@/modulos/Explorador/arbol";
import type { NodoCuadro } from "@/modulos/Explorador/tipos";
import { origenCuadro, useReportarOrigen } from "@/layout/origenDatos";
import {
  ANALISIS,
  CREDITOS,
  ENTIDAD_INICIAL,
  SECTORES,
  cargarCuadroSistema,
  cargarEntidades,
  controlesDe,
  type Filtros,
} from "./cargarCuadro";

/**
 * Explorador de Sistema Financiero / Tasas (sistema.js ≈ tasas.js en el
 * original: una sola implementacion parametrizada).
 *
 * Corrige el cambio de entidad del original: alli solo EFI06 y EFI07
 * recargaban con su loader; EFI08/EFI09 perdian el filtro de credito. Aqui
 * todo se recarga segun el `tipo` del cuadro.
 */

interface Props {
  arbol: NodoCuadro[];
  cuadroInicial: string;
  /** Tipos de credito ofrecidos (Tasas no tiene "Cartera Total"). */
  creditos?: string[];
}

const Control = ({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) => (
  <label className="flex items-center gap-2 text-detalle text-tinta-secundaria">
    {etiqueta}
    {children}
  </label>
);

const ExploradorSistema = ({ arbol, cuadroInicial, creditos = CREDITOS.map((c) => c.value) }: Props) => {
  const [nodo, setNodo] = useState<NodoCuadro | undefined>(() => buscarPorCuadro(arbol, cuadroInicial));
  const [filtros, setFiltros] = useState<Filtros>({
    sector: "nacional",
    entidad: ENTIDAD_INICIAL,
    analisis: "saldo",
    credito: creditos[0],
  });
  const cambiar = (c: Partial<Filtros>) => setFiltros((f) => ({ ...f, ...c }));

  const tipo = nodo?.tipo ?? "tabla";
  const id = nodo?.cuadro ?? cuadroInicial;
  const visibles = controlesDe(tipo);
  useReportarOrigen(origenCuadro(id, filtros.analisis));

  const { data, isLoading, apiError, execute } = useService(
    cargarCuadroSistema,
    [tipo, id, filtros],
    [],
    true,
    "No se pudieron cargar los datos del cuadro"
  );
  const { data: entidades } = useService(cargarEntidades, [], [], true, "No se pudo cargar la lista de entidades");

  const controles = (
    <>
      {visibles.sector && (
        <Control etiqueta="Sector Financiero:">
          <Select
            size="small"
            className="w-72"
            value={filtros.sector}
            options={SECTORES}
            onChange={(sector) => cambiar({ sector })}
            popupMatchSelectWidth={false}
          />
        </Control>
      )}
      {visibles.entidad && (
        <Control etiqueta="Entidad Financiera:">
          <Select
            size="small"
            className="w-72"
            showSearch
            value={filtros.entidad}
            options={entidades ?? []}
            loading={!entidades}
            placeholder="Buscar entidad financiera..."
            notFoundContent="No se encontró la entidad"
            onChange={(entidad) => cambiar({ entidad })}
          />
        </Control>
      )}
      {visibles.analisis && (
        <Control etiqueta="Análisis:">
          <Select
            size="small"
            className="w-52"
            value={filtros.analisis}
            options={ANALISIS}
            onChange={(analisis) => cambiar({ analisis })}
          />
        </Control>
      )}
      {visibles.credito && (
        <Control etiqueta="Tipo Crédito:">
          <Select
            size="small"
            className="w-60"
            value={filtros.credito}
            options={CREDITOS.filter((c) => creditos.includes(c.value))}
            onChange={(credito) => cambiar({ credito })}
          />
        </Control>
      )}
    </>
  );

  return (
    <Explorador
      arbol={arbol}
      nodoActivo={nodo?.key}
      onElegir={setNodo}
      cuadro={data}
      cargando={isLoading}
      error={apiError}
      onReintentar={() => execute()}
      controles={controles}
    />
  );
};

export default ExploradorSistema;
