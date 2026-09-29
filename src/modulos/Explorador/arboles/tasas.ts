import type { NodoCuadro } from "../tipos";

/**
 * Arbol de cuadros extraido de prueba-data `tasas.html` (script de migracion).
 */
export const ARBOL_TASAS: NodoCuadro[] = [
  {
    "key": "n-0",
    "titulo": "Tasas de Interés Activas y Pasivas",
    "hijos": [
      {
        "key": "n-0-0",
        "titulo": "Composición de la Tasa de Interés Activas",
        "hijos": [
          {
            "key": "n-0-0-0",
            "titulo": "1.1 Sistema Financiero Nacional",
            "cuadro": "TEA01",
            "tipo": "cartera"
          },
          {
            "key": "n-0-0-1",
            "titulo": "1.2 Por Entidad Financiera",
            "cuadro": "TEA02",
            "tipo": "carteraEfi"
          }
        ]
      },
      {
        "key": "n-0-1",
        "titulo": "Tasa de Interés Pasivas",
        "hijos": [
          {
            "key": "n-0-1-0",
            "titulo": "1.1 Sistema Financiero Nacional",
            "cuadro": "TPE01",
            "tipo": "tabla"
          },
          {
            "key": "n-0-1-1",
            "titulo": "1.2 Por Entidad Financiera",
            "cuadro": "TPE02",
            "tipo": "tablaEfi"
          }
        ]
      }
    ]
  }
];
