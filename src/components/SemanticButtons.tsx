import React from "react";
import {
  ConfigProvider as AntdConfigProvider,
  Button,
  theme,
  type ButtonProps,
} from "antd";
import { color } from "@/design/tokens";

/**
 * antd expone `color="primary" | "danger" | ...` pero **no** tiene un
 * `color="success"` ni `color="warning"`: esos tokens solo alimentan Alert,
 * Tag, Progress, Result y la validacion de formularios. Para un boton solido
 * con esos colores se remapea `colorPrimary` en un ConfigProvider anidado.
 *
 * Los valores NO se hardcodean aqui: se leen de `theme.useToken()`, de modo
 * que la unica fuente de verdad sigue siendo el `theme.token` de `src/App.tsx`
 * (§3). Si ahi cambia `colorSuccess`, estos botones cambian solos.
 *
 * Se importa antd como `AntdConfigProvider` para no confundirlo con el
 * `ConfigProvider` propio de la app (`src/hooks/configContext.tsx`).
 */
const { useToken } = theme;

type Tone = "success" | "warning";

/** Estados de un boton solido: reposo, hover y pulsado (misma convencion que `src/design/tokens.ts`). */
export interface ButtonColors {
  base: string;
  hover: string;
  activo: string;
}

/**
 * Boton solido de cualquier color. Es el mecanismo comun de `SuccessButton`,
 * `WarningButton` y los botones de descarga (`DownloadButtons.tsx`): no usar
 * para colores sueltos en pantallas, sino para crear un boton del kit.
 */
export const SolidColorButton = React.forwardRef<
  HTMLButtonElement,
  { colors: ButtonColors } & ButtonProps
>(({ colors, children, ...props }, ref) => (
  // El override va en `components.Button`, NO en `token`: los ConfigProvider
  // anidados fusionan `token` y `components` por separado (ver useTheme.js de
  // antd), y el override de componente gana sobre `token` para ese
  // componente. Escribirlo aca lo hace inmune a que App.tsx agregue un
  // `components.Button.colorPrimary` en el futuro.
  //
  // `forwardRef`: `Tooltip` y `Popover` necesitan el ref del boton para
  // posicionarse (sin el, React avisa "Function components cannot be given refs").
  <AntdConfigProvider
    theme={{
      components: {
        Button: {
          colorPrimary: colors.base,
          colorPrimaryHover: colors.hover,
          colorPrimaryActive: colors.activo,
        },
      },
    }}
  >
    <Button ref={ref} color="primary" variant="solid" {...props}>
      {children}
    </Button>
  </AntdConfigProvider>
));
SolidColorButton.displayName = "SolidColorButton";

const ToneButton: React.FC<{ tone: Tone } & ButtonProps> = ({ tone, ...props }) => {
  const { token } = useToken();

  const tones: Record<Tone, ButtonColors> = {
    success: {
      base: token.colorSuccess,
      hover: token.colorSuccessHover,
      activo: token.colorSuccessActive,
    },
    warning: {
      base: token.colorWarning,
      hover: token.colorWarningHover,
      activo: token.colorWarningActive,
    },
  };

  return <SolidColorButton colors={tones[tone]} {...props} />;
};

export const SuccessButton: React.FC<ButtonProps> = (props) => (
  <ToneButton tone="success" {...props} />
);

export const WarningButton: React.FC<ButtonProps> = (props) => (
  <ToneButton tone="warning" {...props} />
);

/** Fondo sobre el que va el `GhostButton`: su hover y pulsado toman los tonos de ese rol. */
export type FondoGhost = "accion" | "identidad";

// Clases literales (Tailwind solo genera las que encuentra escritas completas).
// `!`: el CSS de antd no tiene capa y le gana a las utilidades de Tailwind sin él.
const ESTADOS_GHOST: Record<FondoGhost, string> = {
  accion: "hover:!bg-accion-hover active:!bg-accion-activo",
  identidad: "hover:!bg-identidad-hover active:!bg-identidad-activo",
};

/**
 * Botón para fondos de color: `sobre="accion"` (franjas o banners azules dentro de las vistas) o
 * `sobre="identidad"` (header del shell). Nunca sobre blanco: ahí va un `Button` normal.
 *
 * Por qué no `<Button ghost>` a secas: antd pinta el hover del ghost con el hover del botón
 * default (`accion.hover`, blue-700) y sobre un fondo azul queda en 1.3:1: desaparece al pasar
 * el mouse. Aquí texto y borde son blancos en todos los estados y el hover rellena el fondo con
 * el tono de hover del mismo rol, igual que el resto del sistema. Contraste del texto blanco:
 * sobre acción 5.2 / hover 6.7 / pulsado 8.7; sobre identidad 10.2 / 7.3 / 18.
 * (Un velo blanco translúcido dejaba el hover sobre acción en 3.98:1, bajo AA.)
 */
export const GhostButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "ghost" | "type" | "color" | "variant"> & { sobre?: FondoGhost }
>(({ sobre = "accion", className = "", ...props }, ref) => (
  <AntdConfigProvider
    theme={{
      components: {
        Button: {
          defaultGhostColor: color.tinta.inversa,
          defaultGhostBorderColor: color.tinta.inversa,
          defaultHoverColor: color.tinta.inversa,
          defaultHoverBorderColor: color.tinta.inversa,
          defaultActiveColor: color.tinta.inversa,
          defaultActiveBorderColor: color.tinta.inversa,
        },
      },
    }}
  >
    <Button
      ref={ref}
      ghost
      className={`${ESTADOS_GHOST[sobre]} focus-visible:!outline-tinta-inversa ${className}`}
      {...props}
    />
  </AntdConfigProvider>
));
GhostButton.displayName = "GhostButton";
