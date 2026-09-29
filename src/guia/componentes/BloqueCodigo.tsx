import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Button, Tooltip } from "antd";
import { CheckOutlined, CopyOutlined } from "@ant-design/icons";

/** Copia al portapapeles y marca el botón un momento. */
const useCopiar = () => {
  const [copiado, setCopiado] = useState(false);
  const copiar = async (texto: string) => {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };
  return { copiado, copiar };
};

export const BotonCopiar = ({
  texto,
  className = "",
}: {
  texto: string;
  className?: string;
}) => {
  const { copiado, copiar } = useCopiar();
  return (
    <Tooltip title={copiado ? "Copiado" : "Copiar código"}>
      <Button
        size="small"
        type="text"
        className={className}
        icon={
          copiado ? <CheckOutlined className="text-exito" /> : <CopyOutlined />
        }
        onClick={() => copiar(texto)}
      />
    </Tooltip>
  );
};

interface BloqueCodigoProps {
  codigo: string;
  lenguaje?: "tsx" | "ts" | "bash";
  /** Botón de copiar en la esquina (por defecto sí). */
  conCopiar?: boolean;
  /** Alto máximo antes de hacer scroll. */
  altoMaximo?: number;
  className?: string;
}

/**
 * Código resaltado de la guía (prism-react-renderer, sin CSS externo). Solo para la app de la guía:
 * no forma parte de `@idce/kit`.
 */
const BloqueCodigo = ({
  codigo,
  lenguaje = "tsx",
  conCopiar = true,
  altoMaximo = 480,
  className = "",
}: BloqueCodigoProps) => (
  <div className={`relative group ${className}`}>
    <Highlight
      code={codigo.trimEnd()}
      language={lenguaje}
      theme={themes.github}
    >
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className="m-0 overflow-auto rounded-control border border-linea-sutil px-4 py-3 text-detalle leading-relaxed"
          style={{
            ...style,
            maxHeight: altoMaximo,
            fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
          }}
        >
          {tokens.map((linea, i) => (
            <div key={i} {...getLineProps({ line: linea })}>
              {linea.map((token, j) => (
                <span key={j} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
    {conCopiar && (
      <BotonCopiar
        texto={codigo}
        className="!absolute top-1.5 right-1.5 opacity-60 group-hover:opacity-100 bg-superficie"
      />
    )}
  </div>
);

export default BloqueCodigo;
