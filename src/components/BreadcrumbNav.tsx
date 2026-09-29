import React from "react";
import { Breadcrumb, Button } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const BreadcrumbNav = ({ items, className = "" }: BreadcrumbNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedItems = items ?? location.pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: index < arr.length - 1 ? "/" + arr.slice(0, index + 1).join("/") : undefined,
    }));

  return (
    <Breadcrumb
      className={className}
      items={resolvedItems.map((item) => ({
        title: item.path ? (
          <Button type="link" onClick={() => navigate(item.path!)} className="!p-0 !h-auto">
            {item.label}
          </Button>
        ) : (
          item.label
        ),
      }))}
    />
  );
};

export default BreadcrumbNav;
