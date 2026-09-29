import { ReactNode } from "react";

/**
 * Texto de la guía con `código` entre acentos graves, como en Markdown. Lo demás (ReactNode) pasa
 * tal cual.
 */
const Texto = ({ children }: { children: ReactNode }) => {
  if (typeof children !== "string") return <>{children}</>;
  return (
    <>
      {children.split(/(`[^`]+`)/g).map((trozo, i) =>
        trozo.startsWith("`") && trozo.endsWith("`") ? (
          <code
            key={i}
            className="rounded-marca bg-superficie-sutil px-1 py-0.5 text-tinta"
          >
            {trozo.slice(1, -1)}
          </code>
        ) : (
          trozo
        ),
      )}
    </>
  );
};

export default Texto;
