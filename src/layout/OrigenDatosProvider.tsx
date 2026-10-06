import { useState } from "react";
import { OrigenDatosContext, type Reportado } from "./origenDatos";

/** Guarda el origen de datos que reporta la pantalla actual (ver `origenDatos.ts`). */
const OrigenDatosProvider = ({ children }: { children: React.ReactNode }) => {
  const estado = useState<Reportado | null>(null);
  return <OrigenDatosContext.Provider value={estado}>{children}</OrigenDatosContext.Provider>;
};

export default OrigenDatosProvider;
