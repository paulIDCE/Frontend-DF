import React from "react";
import { Button, Space, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editTooltip?: string;
  deleteTooltip?: string;
}

const ActionButtons = ({
  onEdit,
  onDelete,
  editTooltip = "Editar",
  deleteTooltip = "Eliminar",
}: ActionButtonsProps) => {
  return (
    <Space>
      {/* El icono hereda el color del boton (CTA / colorError), sin hex sueltos */}
      <Tooltip title={editTooltip}>
        <Button
          color="primary"
          variant="text"
          shape="circle"
          icon={<EditOutlined />}
          onClick={onEdit}
        />
      </Tooltip>
      <Tooltip title={deleteTooltip}>
        <Button
          color="danger"
          variant="text"
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={onDelete}
        />
      </Tooltip>
    </Space>
  );
};

export default ActionButtons;
