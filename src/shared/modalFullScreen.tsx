import { CloseOutlined } from "@ant-design/icons";
import { Button, ConfigProvider } from "antd";
import { useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { nextOverlayZIndex, OVERLAY_ATRIBUTO } from "@/utils/overlayZIndex";

interface ModalFullscreenProps {
  children: ReactNode;
  onClose: () => void;
}

/**
 * Portal a `document.body`. Sin framer-motion: al consumir `@idce/kit` como
 * paquete, AnimatePresence resolvía otro React y `useContext` era null (pantalla
 * en blanco al abrir la gráfica). `TarjetaGrafica` desmonta este modal al
 * cerrar, así que la animación de salida no se veía de todos modos.
 *
 * z-index: toma uno por encima de lo visible (`nextOverlayZIndex`, piso 1100), más alto que los
 * popups de antd (Tooltip 1070, Dropdown/Select 1050). Por eso:
 * - `zIndexPopupBase` = el z-index del overlay para lo que se abre dentro (tooltips de la barra,
 *   selects del `extra`, popovers): salen encima y no detras.
 * - `OVERLAY_ATRIBUTO`: los Modal apilados (`useStackedOverlayProps`, "Ver datos") lo ven y se
 *   montan encima.
 */
const ModalFullscreen = ({ children, onClose }: ModalFullscreenProps) => {
  const zIndex = useMemo(() => nextOverlayZIndex(), []);

  return createPortal(
    <div
      className="fixed inset-0 bg-velo flex justify-center items-center p-4"
      style={{ zIndex }}
      {...{ [OVERLAY_ATRIBUTO]: "" }}
    >
      <div className="p-4 bg-superficie rounded-contenedor shadow-elevada w-full h-full max-w-screen-2xl max-h-screen overflow-auto relative">
        {/* `!absolute`: `.ant-btn` declara `position: relative` sin capa y le gana
            a la utilidad de Tailwind v4. Sin el `!` el botón empujaba el contenido. */}
        <Button
          className="!absolute top-4 right-4 z-10"
          onClick={onClose}
          variant="solid"
          color="danger"
          size="small"
          icon={<CloseOutlined />}
        />
        <div className="p-4 w-full h-full modal-content flex items-center overflow-auto">
          <div className="p-4 w-full h-full min-w-[500px] flex justify-center items-center">
            <ConfigProvider theme={{ token: { zIndexPopupBase: zIndex } }}>{children}</ConfigProvider>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalFullscreen;
