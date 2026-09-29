import { ARBOL_SISTEMA } from "@/modulos/Explorador/arboles/sistema";
import ExploradorSistema from "./ExploradorSistema";

/** Sistema Financiero — porte de prueba-data `sistema.html` / `sistema.js`. */
const SistemaFinanciero = () => <ExploradorSistema arbol={ARBOL_SISTEMA} cuadroInicial="SFN01" />;

export default SistemaFinanciero;
