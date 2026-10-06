import { forwardRef, type ReactNode } from "react";
import { Button, Tooltip, type ButtonProps } from "antd";
import { FileExcelOutlined, FilePdfOutlined, FileWordOutlined } from "@ant-design/icons";
import { color } from "@/design/tokens";
import { SolidColorButton } from "./SemanticButtons";

/**
 * Botones de descarga del kit: **Excel verde, PDF rojo, Word azul**. Son la unica forma de
 * ofrecer una descarga de archivo; no armar `<Button icon={<FileExcelOutlined />}>`
 * a mano. Colores en `color.excel` / `color.pdf` / `color.word` de `src/design/tokens.ts` (por que no
 * salen de `exito` / `error`: ver ahi).
 *
 * - Texto por defecto "Excel" / "PDF" / "Word"; `children` lo reemplaza ("Descargar Excel").
 * - `soloIcono` para barras compactas: sin texto y con tooltip.
 * - `color`, `variant` y `type` no se exponen: el color identifica el formato.
 */
export interface DownloadButtonProps extends Omit<ButtonProps, "color" | "variant" | "type"> {
  /** Sin texto, solo el icono, con `tooltip` (o uno por defecto). */
  soloIcono?: boolean;
  tooltip?: ReactNode;
}

const crear = (formato: "excel" | "pdf" | "word", icono: ReactNode, texto: string, ayuda: string) => {
  // `forwardRef` para poder envolverlo en `Tooltip`, `Popover` o `Dropdown` desde fuera.
  const Boton = forwardRef<HTMLButtonElement, DownloadButtonProps>(({ soloIcono = false, tooltip, children, ...props }, ref) => {
    const boton = (
      <SolidColorButton ref={ref} colors={color[formato]} icon={icono} aria-label={ayuda} {...props}>
        {soloIcono ? null : (children ?? texto)}
      </SolidColorButton>
    );
    const titulo = tooltip ?? (soloIcono ? ayuda : undefined);
    return titulo ? <Tooltip title={titulo}>{boton}</Tooltip> : boton;
  });
  Boton.displayName = `${texto}Button`;
  return Boton;
};

export const ExcelButton = crear("excel", <FileExcelOutlined />, "Excel", "Descargar Excel");
export const PdfButton = crear("pdf", <FilePdfOutlined />, "PDF", "Descargar PDF");
export const WordButton = crear("word", <FileWordOutlined />, "Word", "Descargar Word");

/**
 * Excel de las barras de iconos (`TarjetaGrafica`, `StatsOverlayChart`): `type="text"` como el
 * resto de la barra, con el icono en verde Excel para que el formato siga leyendose. Un
 * `ExcelButton` solido era el unico control con fondo entre iconos de texto.
 *
 * Interno: NO se exporta en `src/lib.ts`. Las vistas usan `ExcelButton`; si otra pieza del kit
 * necesita esta variante, se usa desde aqui.
 */
export const ExcelBotonBarra = forwardRef<HTMLButtonElement, Omit<ButtonProps, "type" | "icon" | "children"> & { tooltip?: ReactNode }>(
  ({ tooltip, ...props }, ref) => (
    <Tooltip title={tooltip ?? "Descargar Excel"}>
      <Button
        ref={ref}
        type="text"
        icon={<FileExcelOutlined style={{ color: color.excel.base }} />}
        aria-label="Descargar Excel"
        {...props}
      />
    </Tooltip>
  ),
);
ExcelBotonBarra.displayName = "ExcelBotonBarra";
