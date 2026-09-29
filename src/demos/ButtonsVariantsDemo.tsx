import { Button, Space, Tooltip } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  SettingFilled,
} from "@ant-design/icons";
import { GhostButton, SuccessButton, WarningButton, ExcelButton, PdfButton } from "@idce/kit";

const ButtonsVariantsDemo = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-2">Tipos</h4>
        <Space wrap>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-2">
          Colores semánticos
        </h4>
        <Space wrap>
          {/* colorPrimary */}
          <Button color="primary" variant="solid">
            Primary
          </Button>

          {/* colorError */}
          <Button color="danger" variant="solid">
            Danger
          </Button>

          {/* colorSuccess / colorWarning — sin equivalente nativo en antd */}
          <SuccessButton>Success</SuccessButton>
          <WarningButton>Warning</WarningButton>

          {/* mismo color, variante contorneada */}
          <Button color="primary" variant="outlined">
            Outline
          </Button>
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-2">
          Descargas: Excel verde, PDF rojo
        </h4>
        <div className="flex flex-col gap-3">
          <Space wrap align="center">
            {/* Barra de página (PageHeader, toolbar de CRUD) */}
            <ExcelButton />
            <PdfButton />
            {/* Texto propio */}
            <ExcelButton>Descargar Excel</ExcelButton>
            <PdfButton>Descargar reporte</PdfButton>
          </Space>
          <Space wrap align="center">
            {/* Barras compactas: vistas analíticas, franjas, modales */}
            <ExcelButton size="small" />
            <PdfButton size="small" />
            {/* Solo icono, con tooltip: cabeceras muy estrechas */}
            <ExcelButton size="small" soloIcono />
            <PdfButton size="small" soloIcono />
            <ExcelButton loading>Generando</ExcelButton>
            <PdfButton disabled />
          </Space>
          <p className="text-detalle text-tinta-tenue m-0">
            <code>ExcelButton</code> / <code>PdfButton</code> de <code>@idce/kit</code>. El color
            identifica el formato del archivo y no se cambia. Deshabilitarlos cuando no hay filas que descargar. No usar{" "}
            <code>SuccessButton</code> ni <code>color="danger"</code> para una descarga: el rojo de peligro se lee como
            "eliminar".
            Dentro de la barra de iconos de <code>TarjetaGrafica</code> y <code>StatsOverlayChart</code> el Excel
            sale atenuado (sin fondo, icono verde): lo pinta la tarjeta, la vista no pasa nada.
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-2">Tamaños</h4>
        <Space wrap align="center">
          <Button type="primary" size="small">
            Small
          </Button>
          <Button type="primary">Middle</Button>
          <Button type="primary" size="large">
            Large
          </Button>
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-2">Con íconos</h4>
        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />}>
            Nuevo
          </Button>
          {/* el icono hereda el color del boton, sin hex hardcodeado */}
          <Button
            color="primary"
            variant="text"
            shape="circle"
            icon={<EditOutlined />}
          />
          <Button
            color="danger"
            variant="text"
            shape="circle"
            icon={<DeleteOutlined />}
          />
          <Tooltip title="Configurar">
            <Button type="text" shape="circle" icon={<SettingFilled />} />
          </Tooltip>
          <Button type="primary" shape="circle" icon={<SearchOutlined />} />
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-2">Estados</h4>
        <Space wrap>
          <Button type="primary">Normal</Button>
          <Button type="primary" loading>
            Loading
          </Button>
          <Button type="primary" disabled>
            Disabled
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading>
            Guardando
          </Button>
        </Space>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-2">
          Botón ghost — solo sobre fondos de color
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-accion p-4 rounded-tarjeta flex flex-col gap-2">
            <span className="text-detalle text-tinta-inversa">Dentro de una vista · bg-accion · sobre="accion"</span>
            <Space>
              <GhostButton>Ghost</GhostButton>
              <GhostButton icon={<PlusOutlined />}>Ghost con ícono</GhostButton>
            </Space>
          </div>
          <div className="bg-identidad p-4 rounded-tarjeta flex flex-col gap-2">
            <span className="text-detalle text-tinta-inversa">Shell (header) · bg-identidad · sobre="identidad"</span>
            <Space>
              <GhostButton sobre="identidad">Ghost</GhostButton>
              <GhostButton sobre="identidad" icon={<PlusOutlined />}>
                Ghost con ícono
              </GhostButton>
            </Space>
          </div>
        </div>
        <p className="text-detalle text-tinta-tenue mt-2 mb-0">
          <code>GhostButton</code> de <code>@idce/kit</code>: texto blanco en todos los estados; al
          pasar el mouse el fondo toma el hover del rol indicado en <code>sobre</code>. No usar <code>{"<Button ghost>"}</code>: su hover toma el azul de acción y
          desaparece sobre fondos azules.
        </p>
      </div>

      <div>
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria mb-2">
          Grupo de botones
        </h4>
        <Space.Compact>
          <Button type="primary">Acción 1</Button>
          <Button type="primary">Acción 2</Button>
          <Button type="primary">Acción 3</Button>
        </Space.Compact>
      </div>
    </div>
  );
};

export default ButtonsVariantsDemo;
