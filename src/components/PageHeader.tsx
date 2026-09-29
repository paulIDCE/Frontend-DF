import React from "react";
import { Typography } from "antd";
import BreadcrumbNav from "./BreadcrumbNav";

const { Title } = Typography;

type Miga = { label: string; path?: string };

interface PageHeaderBase {
  /** Ruta de navegación sobre el título. */
  migas?: Miga[];
  /** Botones alineados a la derecha del título. */
  acciones?: React.ReactNode;
  className?: string;

  /** @deprecated usar `migas` */
  breadcrumbItems?: Miga[];
  /** @deprecated usar `acciones` */
  actions?: React.ReactNode;
}

type PageHeaderProps = PageHeaderBase &
  ({ titulo: string; title?: never } | { /** @deprecated usar `titulo` */ title: string; titulo?: never });

const PageHeader = (props: PageHeaderProps) => {
  const titulo = props.titulo ?? props.title;
  const migas = props.migas ?? props.breadcrumbItems;
  const acciones = props.acciones ?? props.actions;
  return (
    <div className={`mb-4 ${props.className ?? ""}`}>
      {migas && <BreadcrumbNav items={migas} className="mb-1" />}
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0 !text-identidad">{titulo}</Title>
        {acciones && <div className="flex gap-2">{acciones}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
