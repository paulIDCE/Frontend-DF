import type { ThemeConfig } from "antd";
import { color, control, espacio, radio, scalePx, tipografia } from "./tokens";

const { escala, familia } = tipografia;

/**
 * Tema global de antd, derivado de `tokens.ts` (lo monta `App.tsx`).
 *
 * - `token` global usa **acción**: todo lo que el usuario opera (botones, Switch, Checkbox,
 *   foco, Pagination, Progress) lo hereda solo.
 * - La **identidad** (prussian) queda acotada a `components.Menu`: el menú es shell. Las pestañas
 *   van en acción (azul de las vistas internas), como en todas las apps del iframe.
 * - Neutros, estados, tipografía y radios salen de los mismos tokens que Tailwind: un
 *   `text-tinta-secundaria` y el `colorTextSecondary` de antd son el mismo valor.
 */
export const temaAntd: ThemeConfig = {
  token: {
    // Acción
    colorPrimary: color.accion.base,
    colorPrimaryHover: color.accion.hover,
    colorPrimaryActive: color.accion.activo,
    colorPrimaryBg: color.accion.sutil,
    colorPrimaryBgHover: color.accion.sutilHover,
    colorPrimaryBorder: color.accion.borde,
    colorPrimaryBorderHover: color.accion.bordeHover,
    colorInfo: color.accion.base,
    // Sin esto antd calcula su propio celeste para Alert/Tag info y no coincide con los otros estados.
    colorInfoBg: color.accion.sutil,
    colorInfoBorder: color.accion.borde,

    // Enlaces: el azul de las vistas (como texto pasa AA, 5.2:1)
    colorLink: color.enlace.base,
    colorLinkHover: color.enlace.hover,
    colorLinkActive: color.enlace.activo,

    // Estados
    colorSuccess: color.exito.base,
    colorSuccessHover: color.exito.hover,
    colorSuccessActive: color.exito.activo,
    colorSuccessBg: color.exito.sutil,
    colorSuccessBorder: color.exito.borde,
    colorWarning: color.advertencia.base,
    colorWarningHover: color.advertencia.hover,
    colorWarningActive: color.advertencia.activo,
    colorWarningBg: color.advertencia.sutil,
    colorWarningBorder: color.advertencia.borde,
    colorError: color.error.base,
    colorErrorHover: color.error.hover,
    colorErrorActive: color.error.activo,
    colorErrorBg: color.error.sutil,
    colorErrorBorder: color.error.borde,

    // Neutros
    colorText: color.tinta.base,
    colorTextSecondary: color.tinta.secundaria,
    colorTextTertiary: color.tinta.tenue,
    colorTextQuaternary: color.tinta.deshabilitada,
    colorTextLightSolid: color.tinta.inversa,
    colorBgContainer: color.superficie.base,
    colorBgElevated: color.superficie.base,
    // Iframe = superficie. `lienzo` es el gutter gris del SSO, fuera del iframe.
    colorBgLayout: color.superficie.base,
    colorFillAlter: color.superficie.sutil,
    colorBorder: color.linea.fuerte,
    colorBorderSecondary: color.linea.base,
    colorBgMask: color.velo,

    // Tipografía
    fontFamily: familia.sans,
    fontFamilyCode: familia.mono,
    fontSize: scalePx(escala.cuerpo.tamano),
    fontSizeSM: scalePx(escala.detalle.tamano),
    fontSizeLG: scalePx(escala.subtitulo.tamano),
    fontSizeXL: scalePx(20),
    lineHeight: escala.cuerpo.interlineado / escala.cuerpo.tamano,
    // antd deriva por su cuenta los títulos (38/30/24/20/16) y agregaría tamaños fuera de la
    // escala. En las apps se usan `Title level={4}` (página) y `level={5}` (sección).
    // `scalePx` = densidad 90 % (mismo criterio que `html { font-size }` en iframe.css).
    fontSizeHeading1: scalePx(escala.display.tamano),
    fontSizeHeading2: scalePx(escala.display.tamano),
    fontSizeHeading3: scalePx(escala.cifra.tamano),
    fontSizeHeading4: scalePx(escala.titulo.tamano),
    fontSizeHeading5: scalePx(escala.subtitulo.tamano),

    // Controles y espaciado: los de antd, a la misma densidad.
    controlHeight: scalePx(control.alto.base),
    controlHeightSM: scalePx(control.alto.sm),
    controlHeightLG: scalePx(control.alto.lg),
    sizeUnit: espacio.unidad,

    // Forma
    borderRadius: radio.control,
    borderRadiusSM: radio.control,
    borderRadiusLG: radio.tarjeta,
  },
  components: {
    // El botón Default/Outline acompaña al primario, en acción.
    Button: {
      defaultColor: color.accion.base,
      defaultBorderColor: color.accion.base,
      defaultHoverColor: color.accion.hover,
      defaultHoverBorderColor: color.accion.hover,
      defaultActiveColor: color.accion.activo,
      defaultActiveBorderColor: color.accion.activo,
    },
    // Menú del shell: identidad.
    Menu: {
      itemSelectedColor: color.identidad.base,
      itemSelectedBg: color.identidad.sutil,
      itemHoverColor: color.identidad.hover,
      subMenuItemSelectedColor: color.identidad.base,
    },
    // Pestañas dentro de las vistas: acción.
    Tabs: {
      inkBarColor: color.accion.base,
      itemSelectedColor: color.accion.base,
      itemHoverColor: color.accion.hover,
      itemActiveColor: color.accion.activo,
    },
  },
};
