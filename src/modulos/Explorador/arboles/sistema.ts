import type { NodoCuadro } from "../tipos";

/**
 * Arbol de cuadros extraido de prueba-data `sistema.html` (script de migracion).
 */
export const ARBOL_SISTEMA: NodoCuadro[] = [
  {
    "key": "n-0",
    "titulo": "Sistema Financiero Nacional",
    "hijos": [
      {
        "key": "n-0-0",
        "titulo": "Estados Financieros",
        "hijos": [
          {
            "key": "n-0-0-0",
            "titulo": "1.1 Estado de Situación Consolidado y Condensado",
            "cuadro": "SFN01",
            "tipo": "tabla"
          },
          {
            "key": "n-0-0-1",
            "titulo": "1.2 Estado de Pérdidas y Ganancias PYG",
            "cuadro": "SFN02",
            "tipo": "tabla"
          },
          {
            "key": "n-0-0-2",
            "titulo": "1.3 Estado de Pérdidas y Ganancias PYG Anualizado",
            "cuadro": "SFN03",
            "tipo": "tabla"
          },
          {
            "key": "n-0-0-3",
            "titulo": "1.4 Estado de Fuentes y Usos",
            "cuadro": "SFN04",
            "tipo": "tabla"
          },
          {
            "key": "n-0-0-4",
            "titulo": "1.5 Patrimonio Técnico",
            "cuadro": "SFN05",
            "tipo": "tabla"
          },
          {
            "key": "n-0-0-5",
            "titulo": "1.6 Estados Financieros Detallados",
            "cuadro": "SFN06",
            "tipo": "balances"
          }
        ]
      },
      {
        "key": "n-0-1",
        "titulo": "Intermediación Financiera",
        "hijos": [
          {
            "key": "n-0-1-0",
            "titulo": "2.1 Estructura de Cartera de Créditos",
            "cuadro": "CAR01",
            "tipo": "cartera"
          },
          {
            "key": "n-0-1-1",
            "titulo": "2.2 Monto de Operaciones Activas",
            "cuadro": "CAR02",
            "tipo": "cartera"
          },
          {
            "key": "n-0-1-2",
            "titulo": "2.3 Cartera de Crédito por Rango",
            "cuadro": "CAR03",
            "tipo": "cartera"
          },
          {
            "key": "n-0-1-3",
            "titulo": "2.4 Estructura de Depósitos",
            "cuadro": "CAR04",
            "tipo": "tabla"
          }
        ]
      },
      {
        "key": "n-0-2",
        "titulo": "Indicadores Financieros",
        "hijos": [
          {
            "key": "n-0-2-0",
            "titulo": "3.1 Indicadores Financieros",
            "cuadro": "CAR05",
            "tipo": "tabla"
          }
        ]
      }
    ]
  },
  {
    "key": "n-1",
    "titulo": "Estadísticas por entidad financiera",
    "hijos": [
      {
        "key": "n-1-0",
        "titulo": "Estados Financieros",
        "hijos": [
          {
            "key": "n-1-0-0",
            "titulo": "1.1 Estado de Situación Consolidado y Condensado",
            "cuadro": "EFI01",
            "tipo": "tablaEfi"
          },
          {
            "key": "n-1-0-1",
            "titulo": "1.2 Estado de Pérdidas y Ganancias PYG",
            "cuadro": "EFI02",
            "tipo": "tablaEfi"
          },
          {
            "key": "n-1-0-2",
            "titulo": "1.3 Estado de Pérdidas y Ganancias PYG Anualizado",
            "cuadro": "EFI03",
            "tipo": "tablaEfi"
          },
          {
            "key": "n-1-0-3",
            "titulo": "1.4 Estado de Fuentes y Usos",
            "cuadro": "EFI04",
            "tipo": "tablaEfi"
          },
          {
            "key": "n-1-0-4",
            "titulo": "1.5 Patrimonio Técnico",
            "cuadro": "EFI05",
            "tipo": "tablaEfi"
          },
          {
            "key": "n-1-0-5",
            "titulo": "1.6 Estados Financieros Detallados",
            "cuadro": "EFI06",
            "tipo": "balancesEfi"
          }
        ]
      },
      {
        "key": "n-1-1",
        "titulo": "Intermediación Financiera",
        "hijos": [
          {
            "key": "n-1-1-0",
            "titulo": "2.1 Estructura de Cartera de Créditos",
            "cuadro": "EFI07",
            "tipo": "carteraEfi"
          },
          {
            "key": "n-1-1-1",
            "titulo": "2.2 Monto de Operaciones Activas",
            "cuadro": "EFI08",
            "tipo": "carteraEfi"
          },
          {
            "key": "n-1-1-2",
            "titulo": "2.3 Cartera de Crédito por Rango",
            "cuadro": "EFI09",
            "tipo": "carteraEfi"
          },
          {
            "key": "n-1-1-3",
            "titulo": "2.4 Estructura de Depósitos",
            "cuadro": "EFI10",
            "tipo": "tablaEfi"
          }
        ]
      },
      {
        "key": "n-1-2",
        "titulo": "Indicadores Financieros",
        "hijos": [
          {
            "key": "n-1-2-0",
            "titulo": "3.1 Indicadores Financieros",
            "cuadro": "EFI11",
            "tipo": "tablaEfi"
          },
          {
            "key": "n-1-2-1",
            "titulo": "3.2 Indicadores Financieros CAMELS",
            "cuadro": "EFI12",
            "tipo": "tablaEfi"
          },
          {
            "key": "n-1-2-2",
            "titulo": "3.3 Indicadores Financieros PERLAS",
            "cuadro": "EFI13",
            "tipo": "tablaEfi"
          }
        ]
      }
    ]
  }
];
