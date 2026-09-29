import { useState } from "react";
import { FloatButton, Drawer, Tabs, Typography } from "antd";
import { SettingFilled } from "@ant-design/icons";
import { PageContainer, SectionHeader } from "@idce/kit";

import ButtonsVariantsDemo from "./demos/ButtonsVariantsDemo";
import ButtonsDemo from "./demos/ButtonsDemo";
import FormInputsDemo from "./demos/FormInputsDemo";
import TypographyScaleDemo from "./demos/TypographyScaleDemo";
import CardsDemo from "./demos/CardsDemo";
import KpiCardsDemo from "./demos/KpiCardsDemo";
import NavigationComponentsDemo from "./demos/NavigationComponentsDemo";
import FeedbackDemo from "./demos/FeedbackDemo";
import LayoutComponentsDemo from "./demos/LayoutComponentsDemo";
import AlertsDemo from "./demos/AlertsDemo";
import GuiaGraficos from "./guia/graficos/GuiaGraficos";
import BloqueDetalleDemo from "./demos/BloqueDetalleDemo";
import VistaAnaliticaDemo from "./demos/VistaAnaliticaDemo";
import ProvinciaTableDemo from "./demos/ProvinciaTableDemo";
import CrudColumnasDemo from "./demos/CrudColumnasDemo";
import ArbolJerarquicoDemo from "./demos/ArbolJerarquicoDemo";
import ColorOverlayDemo from "./demos/ColorOverlayDemo";
import TablaAnaliticaDemo from "./demos/TablaAnaliticaDemo";
import AlternarVistaDemo from "./demos/AlternarVistaDemo";
import SeccionesDemo from "./demos/SeccionesDemo";
import ComponentCatalogDemo from "./demos/ComponentCatalogDemo";
import DocumentationLinks from "./demos/DocumentationLinks";

const { Title } = Typography;

const tabItems = [
  {
    key: "botones",
    label: "Botones",
    children: (
      <div className="flex flex-col gap-8">
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="Variantes completas" />
          <ButtonsVariantsDemo />
        </PageContainer>
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="Demo original" />
          <ButtonsDemo />
        </PageContainer>
      </div>
    ),
  },
  {
    key: "forms",
    label: "Formularios",
    children: (
      <PageContainer>
        <SectionHeader icono={<SettingFilled />} titulo="Inputs, Selects, DatePicker, Validación" />
        <FormInputsDemo />
        <div className="mt-8">
          <SectionHeader icono={<SettingFilled />} titulo="Color hex y modales apilados" />
          <ColorOverlayDemo />
        </div>
      </PageContainer>
    ),
  },
  {
    key: "tipografia",
    label: "Tipografía",
    children: (
      <PageContainer>
        <SectionHeader icono={<SettingFilled />} titulo="Escala tipográfica completa" />
        <TypographyScaleDemo />
      </PageContainer>
    ),
  },
  {
    key: "tablas",
    label: "Tablas y Datos",
    children: (
      <div className="flex flex-col gap-8">
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="CRUD completo con fallback y componentes reutilizables" />
          <ProvinciaTableDemo />
        </PageContainer>
        <PageContainer>
          <SectionHeader
            icono={<SettingFilled />}
            titulo="Columnas CRUD: propias, metaInfo y chips"
          />
          <CrudColumnasDemo />
        </PageContainer>
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="Tabla analítica (solo lectura) — shared/analitica" />
          <TablaAnaliticaDemo />
        </PageContainer>
      </div>
    ),
  },
  {
    key: "cards",
    label: "Cards",
    children: (
      <div className="flex flex-col gap-8">
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="Variantes de Card" />
          <CardsDemo />
        </PageContainer>
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="KPIs de vistas analíticas — KpiCard + FilaKpis" />
          <KpiCardsDemo />
        </PageContainer>
      </div>
    ),
  },
  {
    key: "navegacion",
    label: "Navegación",
    children: (
      <div className="flex flex-col gap-8">
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="Tabs, Steps, Dropdown, Pagination, Badge" />
          <NavigationComponentsDemo />
        </PageContainer>
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="Tabla / Gráfica en vistas analíticas — AlternarTablaGrafica" />
          <AlternarVistaDemo />
        </PageContainer>
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="Secciones colapsables — SeccionesColapsables" />
          <SeccionesDemo />
        </PageContainer>
        <PageContainer>
          <SectionHeader icono={<SettingFilled />} titulo="Árbol jerárquico — ChipNivel y CrudTable tree" />
          <ArbolJerarquicoDemo />
        </PageContainer>
      </div>
    ),
  },
  {
    key: "feedback",
    label: "Feedback",
    children: (
      <PageContainer>
        <SectionHeader icono={<SettingFilled />} titulo="Progress, Skeleton, Spin, Alert, Result, Modal, Drawer" />
        <FeedbackDemo />
      </PageContainer>
    ),
  },
  {
    key: "layout",
    label: "Layout",
    children: (
      <PageContainer>
        <SectionHeader icono={<SettingFilled />} titulo="Grid, Space, Divider, Descriptions" />
        <LayoutComponentsDemo />
      </PageContainer>
    ),
  },
  {
    key: "detalle",
    label: "Detalle",
    children: (
      <PageContainer>
        <SectionHeader icono={<SettingFilled />} titulo="Paneles de detalle — BloqueDetalle, Dato y FichaDatos" />
        <BloqueDetalleDemo />
      </PageContainer>
    ),
  },
  {
    key: "alertas",
    label: "Alertas",
    children: (
      <PageContainer>
        <SectionHeader icono={<SettingFilled />} titulo="SweetAlert2, ConfirmDialog, Toastify" />
        <AlertsDemo />
      </PageContainer>
    ),
  },
  {
    key: "graficos",
    label: "Gráficos",
    // Piloto de documentación al estilo antd (ejemplos con código, playground y API): src/guia.
    children: <GuiaGraficos />,
  },
  {
    key: "vista-analitica",
    label: "Vista analítica",
    // Sin PageContainer: `VistaAnalitica` ya trae su propia tarjeta blanca, igual que dentro del SSO.
    children: <VistaAnaliticaDemo />,
  },
  {
    key: "catalogo",
    label: "Catálogo UI",
    children: (
      <PageContainer>
        <SectionHeader icono={<SettingFilled />} titulo="16 componentes reutilizables del Starter Kit" />
        <p className="text-tinta-secundaria mb-4">
          Todos usan Ant Design 6 + Tailwind CSS 4 + la identidad visual SSO.
        </p>
        <ComponentCatalogDemo />
      </PageContainer>
    ),
  },
  {
    key: "docs",
    label: "Documentación",
    children: (
      <PageContainer>
        <SectionHeader icono={<SettingFilled />} titulo="Links de referencia" />
        <DocumentationLinks />
      </PageContainer>
    ),
  },
];

const Home = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="min-h-screen bg-lienzo">
      {/* Guía: `lienzo` = gutter del SSO. Las apps en iframe pintan `superficie` (base.css). */}
      <div className="sticky top-0 z-10 bg-prussian-blue-700 shadow-contenedor">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Title level={4} className="!mb-0 !text-tinta-inversa">React Starter Kit IDCE</Title>
          <div className="flex items-center gap-2 text-tinta-inversa text-cuerpo">
            <span>Guía de estilos SSO</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs
          tabPlacement="start"
          size="small"
          items={tabItems}
          className="bg-transparent"
        />
      </div>

      <FloatButton onClick={() => setOpenDrawer(!openDrawer)} icon={<SettingFilled />} />

      <Drawer title="Drawer" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <p className="text-tinta-secundaria">Panel lateral de ejemplo.</p>
      </Drawer>
    </div>
  );
};

export default Home;
