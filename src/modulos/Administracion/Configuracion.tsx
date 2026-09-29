import { useEffect, useMemo, useState } from "react";
import { Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  PageContainer,
  PageHeader,
  SearchInput,
  ExcelButton,
  useService,
  useBreadcrumb,
  useExcelExport,
  EMPTY_ARRAY,
} from "@idce/kit";
import ProvinciaTable from "@/modulos/Administracion/components/Provincia/ProvinciaTable";
import ProvinciaFormModal from "@/modulos/Administracion/components/Provincia/ProvinciaFormModal";
import { useProvinciaManager } from "@/modulos/Administracion/hooks/useProvinciaManager";

import { getAllProvincia } from "@/services/provinciaService";
import { menuPath } from "@/config/app";
import type { Provincia, ProvinciaFormValues } from "@/types/provincia";

/**
 * ══════════════════════════════════════════════════════════════════════
 *  MENU DE REFERENCIA — patron de pagina CRUD (§7)
 * ══════════════════════════════════════════════════════════════════════
 *
 * Esta es la plantilla a copiar para cualquier Menu nuevo. Reune las seis
 * piezas del estandar:
 *
 *   1. Datos con `useService(servicio, params, deps, executeOnMount, mensajeError)`
 *   2. Hook *manager* por entidad para save/update/delete
 *   3. Tabla y form popup separados, en `components/<Entidad>/`
 *   4. Filtros con `useMemo` sobre la data ya cargada (no re-consultan al API)
 *   5. Export a Excel con `useExcelExport`
 *   6. Breadcrumbs vía `useBreadcrumb` en un `useEffect` de montaje
 *
 * ⚠️ Sin Header ni Sidebar propios: el shell lo provee el SSO host (§1).
 */
const Configuracion = () => {
  const { setBreadcrumbs } = useBreadcrumb();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Provincia | undefined>();

  // 1. Datos. `data` inicia undefined; se protege en el punto de uso (§7).
  const { data, isLoading, execute } = useService<Provincia[]>(getAllProvincia);

  // 2. Manager de la entidad. Al terminar con exito recarga la tabla.
  const { save, remove, isSaving } = useProvinciaManager(() => {
    execute();
    setModalOpen(false);
  });

  // 5. Export a Excel (exceljs entra por import dinamico, no al bundle inicial).
  const { exportToExcel, isExporting } = useExcelExport<Provincia>();

  // 6. Breadcrumbs: el shell del SSO los muestra.
  useEffect(() => {
    setBreadcrumbs([
      { label: "Administracion" },
      {
        label: "Configuracion",
        path: menuPath("Administracion/Configuracion"),
      },
    ]);
  }, [setBreadcrumbs]);

  // 4. Filtro en memoria: `?? EMPTY_ARRAY` mantiene la referencia estable
  //    cuando aun no hay datos, y evita un loop de render.
  const provincias = data ?? EMPTY_ARRAY;
  const provinciasFiltradas = useMemo(() => {
    const termino = search.trim().toLowerCase();
    if (!termino) return provincias;
    return provincias.filter(
      (provincia) =>
        provincia.nombre.toLowerCase().includes(termino) ||
        provincia.codigo.toLowerCase().includes(termino) ||
        provincia.region?.toLowerCase().includes(termino)
    );
  }, [provincias, search]);

  const handleNuevo = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const handleEditar = (provincia: Provincia) => {
    setEditing(provincia);
    setModalOpen(true);
  };

  const handleSubmit = (values: ProvinciaFormValues) => {
    save(values, editing?.provinciaID);
  };

  const handleExportar = () =>
    exportToExcel({
      data: provinciasFiltradas,
      fileName: "provincias",
      sheetName: "Provincias",
      columns: [
        { header: "Codigo", key: "codigo", width: 12 },
        { header: "Nombre", key: "nombre", width: 30 },
        { header: "Pais", key: "paisIso2", width: 10 },
        { header: "Region", key: "region", width: 20 },
        { header: "Peso", key: "peso", width: 10 },
        {
          header: "Estado",
          key: (row) => (row.estado === "A" ? "Activo" : "Inactivo"),
          width: 12,
        },
      ],
    });

  return (
    <PageContainer>
      <PageHeader
        titulo="Configuracion — Provincias"
        acciones={
          <Space>
            <ExcelButton
              onClick={handleExportar}
              loading={isExporting}
              disabled={provinciasFiltradas.length === 0}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleNuevo}>
              Nueva provincia
            </Button>
          </Space>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, codigo o region..."
        />
      </div>

      <ProvinciaTable
        data={provinciasFiltradas}
        loading={isLoading}
        onEdit={handleEditar}
        onDelete={remove}
      />

      <ProvinciaFormModal
        open={modalOpen}
        provincia={editing}
        loading={isSaving}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
};

export default Configuracion;
