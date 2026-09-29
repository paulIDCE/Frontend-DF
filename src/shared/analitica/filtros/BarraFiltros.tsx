import { ReactNode, useState } from "react";
import { Badge, Button, Popover, Tag, Tooltip } from "antd";
import { ExclamationCircleOutlined, FilterOutlined, InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";

export interface ChipFiltro {
  clave: string;
  texto: string;
}

interface BarraFiltrosProps {
  /** Titulo corto; se oculta por debajo de `lg` (el breadcrumb del SSO ya nombra la vista). */
  titulo?: string;
  /**
   * Controles obligatorios y propios de la vista (fechas, dias, popovers de configuracion). Como
   * funcion recibe `filtrar`, para que `Enter` en un input haga lo mismo que el boton.
   */
  controles: ReactNode | ((filtrar: () => void) => ReactNode);
  /** Filtros opcionales en un popover con contador y "Limpiar". */
  opcionales?: {
    contenido: ReactNode;
    /** Cuantos hay elegidos en el borrador (badge del boton). */
    cantidad: number;
    onLimpiar: () => void;
  };
  /** Selector global de aplicacion inmediata, alineado a la derecha (p. ej. Normal/Ajustada). */
  derecha?: ReactNode;

  /** Errores (bloquean) ya ordenados; se muestra el primero. */
  error?: string;
  /** Avisos (informan, no bloquean). */
  avisos?: string[];
  valido: boolean;
  consultando: boolean;
  hayCambiosSinAplicar: boolean;
  onFiltrar: () => void;
  onDescartar: () => void;

  /** Filtros opcionales ya aplicados como chips cerrables. */
  chips?: ChipFiltro[];
  onQuitarChip?: (clave: string) => void;
  /** A que partes de la vista aplican los filtros opcionales, junto a los chips. */
  notaChips?: string;
}

/**
 * Carcasa del estandar de filtros (ver skill `refactor-vista-analitica`, estandar-filtros.md):
 * una fila con controles, opcionales, Filtrar y selector global; debajo, los mensajes de
 * validacion, el aviso de cambios sin aplicar y los chips de filtros aplicados.
 */
const BarraFiltros = ({
  titulo,
  controles,
  opcionales,
  derecha,
  error,
  avisos = [],
  valido,
  consultando,
  hayCambiosSinAplicar,
  onFiltrar,
  onDescartar,
  chips = [],
  onQuitarChip,
  notaChips,
}: BarraFiltrosProps) => {
  const [abiertoOpcionales, setAbiertoOpcionales] = useState(false);

  // Unica puerta para consultar: boton, "Aplicar" y Enter pasan por aqui.
  const filtrar = () => {
    if (!valido || consultando) return;
    setAbiertoOpcionales(false);
    onFiltrar();
  };

  const mostrarCambios = hayCambiosSinAplicar && !consultando;

  return (
    <div className="bg-superficie">
      <div className="flex items-center gap-2 flex-wrap">
        {titulo && (
          <h1 className="text-titulo font-bold text-tinta m-0 mr-2 whitespace-nowrap hidden lg:block">{titulo}</h1>
        )}

        {typeof controles === "function" ? controles(filtrar) : controles}

        {opcionales && (
          <Popover
            trigger="click"
            placement="bottomLeft"
            open={abiertoOpcionales}
            onOpenChange={setAbiertoOpcionales}
            title={
              <div className="flex items-center justify-between">
                <span>Filtros opcionales</span>
                <Button size="small" type="link" onClick={opcionales.onLimpiar} disabled={opcionales.cantidad === 0}>
                  Limpiar
                </Button>
              </div>
            }
            content={opcionales.contenido}
          >
            <Badge count={opcionales.cantidad} size="small" offset={[-4, 4]}>
              <Button icon={<FilterOutlined />}>Filtros</Button>
            </Badge>
          </Popover>
        )}

        <Tooltip title={error ?? (consultando ? "Consultando…" : undefined)}>
          <Badge dot={mostrarCambios} offset={[-4, 4]}>
            <Button type="primary" icon={<SearchOutlined />} disabled={!valido} loading={consultando} onClick={filtrar}>
              Filtrar
            </Button>
          </Badge>
        </Tooltip>

        {derecha && <div className="ml-auto flex items-center gap-2">{derecha}</div>}
      </div>

      {(error || avisos.length > 0 || mostrarCambios) && (
        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1.5 text-detalle">
          {error && (
            <span className="text-error flex items-center gap-1">
              <ExclamationCircleOutlined /> {error}
            </span>
          )}
          {!error &&
            avisos.map((aviso) => (
              <span key={aviso} className="text-advertencia flex items-center gap-1">
                <InfoCircleOutlined /> {aviso}
              </span>
            ))}
          {mostrarCambios && (
            <span className="text-tinta-secundaria flex items-center gap-1">
              Los datos mostrados no reflejan los cambios en los filtros.
              <Button size="small" type="link" className="!px-1" disabled={!valido} onClick={filtrar}>
                Aplicar
              </Button>
              <Button size="small" type="link" className="!px-1 !text-tinta-tenue" onClick={onDescartar}>
                Descartar
              </Button>
            </span>
          )}
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mt-1.5">
          <span className="text-rotulo text-tinta-tenue mr-1">Filtros aplicados:</span>
          {chips.map((chip) => (
            <Tag
              key={chip.clave}
              closable={!consultando && !!onQuitarChip}
              color="blue"
              className="text-rotulo m-0"
              onClose={() => onQuitarChip?.(chip.clave)}
            >
              {chip.texto}
            </Tag>
          ))}
          {notaChips && <span className="text-rotulo text-tinta-tenue ml-1">({notaChips})</span>}
        </div>
      )}
    </div>
  );
};

export default BarraFiltros;
