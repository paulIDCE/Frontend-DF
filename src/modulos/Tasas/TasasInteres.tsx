import { ARBOL_TASAS } from "@/modulos/Explorador/arboles/tasas";
import ExploradorSistema from "@/modulos/Sistema/ExploradorSistema";

/**
 * Tasas de Interés — porte de prueba-data `tasas.html` / `tasas.js`.
 * Mismo explorador que Sistema; sin "Cartera Total" en tipo de crédito.
 */
const CREDITOS_TASAS = ["productivo", "consumo", "inmobiliario", "vip", "educativo", "microcredito"];

const TasasInteres = () => (
  <ExploradorSistema arbol={ARBOL_TASAS} cuadroInicial="TEA01" creditos={CREDITOS_TASAS} />
);

export default TasasInteres;
