import type { NodoCuadro } from "../tipos";

/**
 * Arbol de cuadros extraido de prueba-data `macroeconomico.html` (script de migracion).
 * Correcciones: IEA413/IEA414 -> IEA413A/IEA414A; 2.2.5 trimestral IEM224T -> IEM225T.
 */
export const ARBOL_MACRO: NodoCuadro[] = [
  {
    "key": "n-0",
    "titulo": "Estadísticas Anuales",
    "hijos": [
      {
        "key": "n-0-0",
        "titulo": "1. ESTADÍSTICAS MONETARIAS Y FINANCIERAS",
        "hijos": [
          {
            "key": "n-0-0-0",
            "titulo": "1.1 Principales Indicadores Monetarios y Financieros",
            "hijos": [
              {
                "key": "n-0-0-0-0",
                "titulo": "1.1.1 Oferta Monetaria (M1) y Liquidez Total (M2)",
                "cuadro": "IEA111A"
              },
              {
                "key": "n-0-0-0-1",
                "titulo": "1.1.2 Captaciones y Crédito del Panorama Financiero por Sectores",
                "cuadro": "IEA112A"
              }
            ]
          },
          {
            "key": "n-0-0-1",
            "titulo": "1.2 Banco Central del Ecuador",
            "hijos": [
              {
                "key": "n-0-0-1-0",
                "titulo": "1.2.1 Reservas Internacionales",
                "cuadro": "IEA121A"
              },
              {
                "key": "n-0-0-1-1",
                "titulo": "1.2.2 Panorama: Banco Central del Ecuador",
                "cuadro": "IEA122A"
              },
              {
                "key": "n-0-0-1-2",
                "titulo": "1.2.3 Balance Sectorial: Banco Central del Ecuador",
                "cuadro": "IEA123A"
              },
              {
                "key": "n-0-0-1-3",
                "titulo": "1.2.4 Sistema de Balances",
                "cuadro": "IEA124A"
              }
            ]
          },
          {
            "key": "n-0-0-2",
            "titulo": "1.3 Otras Sociedades de Depósito (OSD)",
            "hijos": [
              {
                "key": "n-0-0-2-0",
                "titulo": "1.3.1 Panorama: Otras Sociedades de Depósito (OSD)",
                "cuadro": "IEA131A"
              },
              {
                "key": "n-0-0-2-1",
                "titulo": "1.3.2 Balance Sectorial: Otras Sociedades de Depósito (OSD)",
                "cuadro": "IEA132A"
              }
            ]
          },
          {
            "key": "n-0-0-3",
            "titulo": "Panoramas y Balance Sectorial",
            "hijos": [
              {
                "key": "n-0-0-3-0",
                "titulo": "1.4 Panorama monetario (PM)",
                "cuadro": "IEA14A"
              },
              {
                "key": "n-0-0-3-1",
                "titulo": "1.5 Panorama: Otros Sociedades Financieras (OSF)",
                "cuadro": "IEA15A"
              },
              {
                "key": "n-0-0-3-2",
                "titulo": "1.6 Panorama Financiero (PF)",
                "cuadro": "IEA16A"
              }
            ]
          },
          {
            "key": "n-0-0-4",
            "titulo": "1.7 Bancos Privados",
            "hijos": [
              {
                "key": "n-0-0-4-0",
                "titulo": "1.7.1 Panorama: Bancos Privado",
                "cuadro": "IEA171A"
              },
              {
                "key": "n-0-0-4-1",
                "titulo": "1.7.2 Balance Sectorial: Bancos Privados",
                "cuadro": "IEA172A"
              }
            ]
          },
          {
            "key": "n-0-0-5",
            "titulo": "1.8 Captaciones del Sistema Financiero",
            "hijos": [
              {
                "key": "n-0-0-5-0",
                "titulo": "1.8 Captaciones del Sistema Financiero",
                "cuadro": "IEA18A"
              }
            ]
          },
          {
            "key": "n-0-0-6",
            "titulo": "1.9 Crédito al Sector Privado para Particulares",
            "hijos": [
              {
                "key": "n-0-0-6-0",
                "titulo": "1.9 Crédito al Sector Privado para Particulares",
                "cuadro": "IEA19A"
              }
            ]
          },
          {
            "key": "n-0-0-7",
            "titulo": "1.10 Tasas de Interés",
            "hijos": [
              {
                "key": "n-0-0-7-0",
                "titulo": "1.10.1 Tasas de Interés Referenciales Vigentes",
                "cuadro": "IEA1101A"
              },
              {
                "key": "n-0-0-7-1",
                "titulo": "1.10.2 Tasas de Interés Activas Efectivas y Máximas Referenciales vigentes por Segmentación de la Cartera (Agosto 2015 - Abril 2021)",
                "cuadro": "IEA1102"
              },
              {
                "key": "n-0-0-7-2",
                "titulo": "1.10.2a Tasas de Interés Activas Efectivas y Máximas Referenciales vigentes por Segmentación de la Cartera (Desde mayo 2021)",
                "cuadro": "IEA1102A"
              },
              {
                "key": "n-0-0-7-3",
                "titulo": "1.10.3 Monto de Operaciones Activas por la Segmentación de la Cartera (Septiembre 2015 - Abril 2021)",
                "cuadro": "IEA1103"
              },
              {
                "key": "n-0-0-7-4",
                "titulo": "1.10.3a Monto de Operaciones Activas por la Segmentación de la Cartera (Desde mayo 2021)",
                "cuadro": "IEA1103A"
              },
              {
                "key": "n-0-0-7-5",
                "titulo": "1.10.4 Tasas Pasivas Referenciales Vigentes por Plazo",
                "cuadro": "IEAPASA"
              }
            ]
          }
        ]
      },
      {
        "key": "n-0-1",
        "titulo": "2. ESTADÍSTICAS DE FINANZAS PÚBLICAS",
        "hijos": [
          {
            "key": "n-0-1-0",
            "titulo": "2.1 Operaciones del Sector Público No Financiero (Base devengado - Porcentajes del PIB)",
            "hijos": [
              {
                "key": "n-0-1-0-0",
                "titulo": "2.1 Operaciones del Sector Público No Financiero (Base devengado - Porcentajes del PIB)",
                "cuadro": "IEA21A"
              }
            ]
          },
          {
            "key": "n-0-1-1",
            "titulo": "2.2 Operaciones del Sector Público No Financiero (Base devengado - Millones de Dólares)",
            "hijos": [
              {
                "key": "n-0-1-1-0",
                "titulo": "2.2 Operaciones del Sector Público No Financiero (Base devengado - Millones de Dólares)",
                "cuadro": "IEA22A"
              },
              {
                "key": "n-0-1-1-1",
                "titulo": "2.2.1 Operaciones de Consolidación del Sector Público No Financiero (Base Devengado)",
                "cuadro": "IEA221A"
              },
              {
                "key": "n-0-1-1-2",
                "titulo": "2.2.2 Operaciones del Gobierno Central (Base Devengado)",
                "cuadro": "IEA222A"
              },
              {
                "key": "n-0-1-1-3",
                "titulo": "2.2.3 Operaciones de los Fondos de la Seguridad Social (Base Devengado)",
                "cuadro": "IEA223A"
              },
              {
                "key": "n-0-1-1-4",
                "titulo": "2.2.4 Operaciones de los Gobiernos Autónomos Descentralizados (Base Devengado)",
                "cuadro": "IEA224A"
              },
              {
                "key": "n-0-1-1-5",
                "titulo": "2.2.5 Operaciones de Empresas Públicas No Financieras (Base Devengado)",
                "cuadro": "IEA225A"
              }
            ]
          },
          {
            "key": "n-0-1-2",
            "titulo": "2.3 Flujos de Financiamiento del Sector Público No Financiero",
            "hijos": [
              {
                "key": "n-0-1-2-0",
                "titulo": "2.3 Flujos de Financiamiento del Sector Público No Financiero",
                "cuadro": "IEA23A"
              }
            ]
          },
          {
            "key": "n-0-1-3",
            "titulo": "2.4 Situación Financiera de la Administración del Estado (Base Caja)",
            "hijos": [
              {
                "key": "n-0-1-3-0",
                "titulo": "2.4 Situación Financiera de la Administración del Estado (Base Caja)",
                "cuadro": "IEA24A"
              },
              {
                "key": "n-0-1-3-1",
                "titulo": "2.4.1 Resultado Global, Presupuestario y Primario de la Administración del Estado (Base Caja)",
                "cuadro": "IEA241A"
              },
              {
                "key": "n-0-1-3-2",
                "titulo": "2.4.2 Ingresos Petroleros y No Petroleros de la Administración del Estado (Base Caja)",
                "cuadro": "IEA242A"
              },
              {
                "key": "n-0-1-3-3",
                "titulo": "2.4.3 Erogaciones de la Administración del Estado (Base Caja)",
                "cuadro": "IEA243A"
              }
            ]
          },
          {
            "key": "n-0-1-4",
            "titulo": "2.5 Estado y Movimiento de la Deuda Pública Interna Agregada del Sector Público Total",
            "hijos": [
              {
                "key": "n-0-1-4-0",
                "titulo": "2.5 Estado y Movimiento de la Deuda Pública Interna Agregada del Sector Público Total",
                "cuadro": "IEA25A"
              }
            ]
          }
        ]
      },
      {
        "key": "n-0-2",
        "titulo": "3. ESTADÍSTICAS DEL SECTOR EXTERNO",
        "hijos": [
          {
            "key": "n-0-2-0",
            "titulo": "3.1 Comercio Exterior de Bienes",
            "hijos": [
              {
                "key": "n-0-2-0-0",
                "titulo": "3.1.1 Exportaciones FOB por Producto Principal",
                "cuadro": "IEA311A"
              },
              {
                "key": "n-0-2-0-1",
                "titulo": "3.1.2 Exportaciones FOB por Grupos de Productos",
                "cuadro": "IEA312A"
              },
              {
                "key": "n-0-2-0-2",
                "titulo": "3.1.3 Exportaciones FOB según Intensidad Tecnológica Incorporada",
                "cuadro": "IEA313A"
              },
              {
                "key": "n-0-2-0-3",
                "titulo": "3.1.4 Exportaciones FOB Mensuales por Continente y País Destino",
                "cuadro": "IEA314A"
              },
              {
                "key": "n-0-2-0-4",
                "titulo": "3.1.5 Exportaciones e Importaciones por Regímenes Aduaneros",
                "cuadro": "IEA315A"
              },
              {
                "key": "n-0-2-0-5",
                "titulo": "3.1.6 Importaciones FOB por Uso o Destino Económico",
                "cuadro": "IEA316A"
              },
              {
                "key": "n-0-2-0-6",
                "titulo": "3.1.7 Importaciones CIF por Uso o Destino Económico",
                "cuadro": "IEA317A"
              },
              {
                "key": "n-0-2-0-7",
                "titulo": "3.1.8 Importaciones FOB Mensuales por Continente y País de Origen",
                "cuadro": "IEA318A"
              },
              {
                "key": "n-0-2-0-8",
                "titulo": "3.1.9 Importaciones CIF Mensuales por Continente y País de Origen",
                "cuadro": "IEA319A"
              },
              {
                "key": "n-0-2-0-9",
                "titulo": "3.1.10 Importaciones FOB según Intensidad Tecnológica Incorporada",
                "cuadro": "IEA3110A"
              }
            ]
          },
          {
            "key": "n-0-2-1",
            "titulo": "3.2 Balanza de Pagos, Posición de Inversión Internacional (Metodología Sexto Manual) y Balanza Comercial",
            "hijos": [
              {
                "key": "n-0-2-1-0",
                "titulo": "3.2 Balanza de Pagos, Posición de Inversión Internacional (Metodología Sexto Manual) y Balanza Comercial",
                "cuadro": "IEA32A"
              },
              {
                "key": "n-0-2-1-1",
                "titulo": "3.2.1 Balanza de Pagos Normalizada (Millones de Dólares)",
                "cuadro": "IEA321A"
              },
              {
                "key": "n-0-2-1-2",
                "titulo": "3.2.2 Posición de Inversión Internacional (Millones de Dólares)",
                "cuadro": "IEA322A"
              }
            ]
          },
          {
            "key": "n-0-2-2",
            "titulo": "3.3 Deuda Externa",
            "hijos": [
              {
                "key": "n-0-2-2-0",
                "titulo": "3.3.1 Movimiento de la Deuda Externa Pública",
                "cuadro": "IEA331A"
              },
              {
                "key": "n-0-2-2-1",
                "titulo": "3.3.2 Movimiento de la Deuda Externa Privada",
                "cuadro": "IEA332A"
              }
            ]
          },
          {
            "key": "n-0-2-3",
            "titulo": "3.4 Cotizaciones de las Principales Monedas. Tasas de Inflación de los Estados Unidos de América y tipos de Interés en el Mercado Internacional",
            "hijos": [
              {
                "key": "n-0-2-3-0",
                "titulo": "3.4.1 Ecuador: Índices de Tipo de Cambio Real",
                "cuadro": "IEA341A"
              },
              {
                "key": "n-0-2-3-1",
                "titulo": "3.4.2 Cotizaciones del Dólar de Estados Unidos de América en el Mercado Internacional",
                "cuadro": "IEA342A"
              },
              {
                "key": "n-0-2-3-2",
                "titulo": "3.4.3 Tasa de Inflación en Estados Unidos de América, Tasas de Interés Internacionales y Riesgo País",
                "cuadro": "IEA343A"
              }
            ]
          }
        ]
      },
      {
        "key": "n-0-3",
        "titulo": "4. ESTADÍSTICAS DEL SECTOR REAL",
        "hijos": [
          {
            "key": "n-0-3-0",
            "titulo": "4.1 Estadísticas Petroleras",
            "hijos": [
              {
                "key": "n-0-3-0-0",
                "titulo": "4.1.1 Producción Nacional de Petróleo Crudo y sus Derivados",
                "cuadro": "IEA411A"
              },
              {
                "key": "n-0-3-0-1",
                "titulo": "4.1.2 Exportaciones de Petróleo Crudo, por Cuenta",
                "cuadro": "IEA412A"
              },
              {
                "key": "n-0-3-0-2",
                "titulo": "4.1.2a Exportaciones de Petróleo de EP Petroecuador (Por tipo de Crudo)",
                "cuadro": "IEA412AA"
              },
              {
                "key": "n-0-3-0-3",
                "titulo": "4.1.2b Precios Promedio del Crudo Ecuatoriano y del Mercado Internacional",
                "cuadro": "IEA412BA"
              },
              {
                "key": "n-0-3-0-4",
                "titulo": "4.1.3 Exportaciones de Derivados de Petróleo, por Producto",
                "cuadro": "IEA413A"
              },
              {
                "key": "n-0-3-0-5",
                "titulo": "4.1.4 Ingresos y Egresos por Comercialización Interna de Derivados Importados",
                "cuadro": "IEA414A"
              }
            ]
          },
          {
            "key": "n-0-3-1",
            "titulo": "4.2 Precios, Salarios y Mercado Laboral",
            "hijos": [
              {
                "key": "n-0-3-1-0",
                "titulo": "4.2.1 Índice de Precios al Consumidor (Año base : Enero - Diciembre de 2014 = 100)",
                "cuadro": "IEA421A"
              },
              {
                "key": "n-0-3-1-1",
                "titulo": "4.2.4a Índice Nacional De Precios Productor con Petróleo y sin Petróleo",
                "cuadro": "IEA424AA"
              },
              {
                "key": "n-0-3-1-2",
                "titulo": "4.2.4b Índice Nacional de Precios Productor - Sistema De Índices",
                "cuadro": "IEA424BA"
              },
              {
                "key": "n-0-3-1-3",
                "titulo": "4.2.5 Indicadores del Mercado Laboral Nacional, Urbano y Rural",
                "cuadro": "IEA425A"
              }
            ]
          },
          {
            "key": "n-0-3-2",
            "titulo": "4.3 Producto Interno Bruto (PIB)",
            "hijos": [
              {
                "key": "n-0-3-2-0",
                "titulo": "4.3.1 Producto Interno Bruto (PIB): Enfoque del Gasto",
                "cuadro": "IEM431"
              },
              {
                "key": "n-0-3-2-1",
                "titulo": "4.3.2 Producto Interno Bruto (PIB): Enfoque de la Producción",
                "cuadro": "IEM432"
              },
              {
                "key": "n-0-3-2-2",
                "titulo": "4.3.3 Producto Interno Bruto (PIB): Enfoque del Ingreso",
                "cuadro": "IEM433"
              },
              {
                "key": "n-0-3-2-3",
                "titulo": "4.3.4 Principales Agregados Macroeconómicos",
                "cuadro": "IEM434"
              },
              {
                "key": "n-0-3-2-4",
                "titulo": "4.3.5 Indicadores Per Cápita",
                "cuadro": "IEM435"
              }
            ]
          },
          {
            "key": "n-0-3-3",
            "titulo": "4.5 Cifras de Coyuntura",
            "hijos": [
              {
                "key": "n-0-3-3-0",
                "titulo": "4.5.1 Índice de Confianza del Consumidor Nacional, Urbano y Rural",
                "cuadro": "IEA451A"
              },
              {
                "key": "n-0-3-3-1",
                "titulo": "4.5.3 Producción, inventarios y despacho de cemento por segmento de mercado",
                "cuadro": "IEA453A"
              },
              {
                "key": "n-0-3-3-2",
                "titulo": "4.5.4 Índice de Expectativas de la Economía",
                "cuadro": "IEA454A"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "key": "n-1",
    "titulo": "Estadísticas Mensuales",
    "hijos": [
      {
        "key": "n-1-0",
        "titulo": "1. ESTADÍSTICAS MONETARIAS Y FINANCIERAS",
        "hijos": [
          {
            "key": "n-1-0-0",
            "titulo": "1.1 Principales Indicadores Monetarios y Financieros",
            "hijos": [
              {
                "key": "n-1-0-0-0",
                "titulo": "1.1.1 Oferta Monetaria (M1) y Liquidez Total (M2)",
                "cuadro": "IEM111"
              },
              {
                "key": "n-1-0-0-1",
                "titulo": "1.1.2 Captaciones y Crédito del Panorama Financiero por Sectores",
                "cuadro": "IEM112"
              }
            ]
          },
          {
            "key": "n-1-0-1",
            "titulo": "1.2 Banco Central del Ecuador",
            "hijos": [
              {
                "key": "n-1-0-1-0",
                "titulo": "1.2.1 Reservas Internacionales",
                "cuadro": "IEM121"
              },
              {
                "key": "n-1-0-1-1",
                "titulo": "1.2.2 Panorama: Banco Central del Ecuador",
                "cuadro": "IEM122"
              },
              {
                "key": "n-1-0-1-2",
                "titulo": "1.2.3 Balance Sectorial: Banco Central del Ecuador",
                "cuadro": "IEM123"
              },
              {
                "key": "n-1-0-1-3",
                "titulo": "1.2.4 Sistema de Balances",
                "cuadro": "IEM124"
              }
            ]
          },
          {
            "key": "n-1-0-2",
            "titulo": "1.3 Otras Sociedades de Depósito (OSD)",
            "hijos": [
              {
                "key": "n-1-0-2-0",
                "titulo": "1.3.1 Panorama: Otras Sociedades de Depósito (OSD)",
                "cuadro": "IEM131"
              },
              {
                "key": "n-1-0-2-1",
                "titulo": "1.3.2 Balance Sectorial: Otras Sociedades de Depósito (OSD)",
                "cuadro": "IEM132"
              }
            ]
          },
          {
            "key": "n-1-0-3",
            "titulo": "Panoramas y Balance Sectorial",
            "hijos": [
              {
                "key": "n-1-0-3-0",
                "titulo": "1.4 Panorama monetario (PM)",
                "cuadro": "IEM14"
              },
              {
                "key": "n-1-0-3-1",
                "titulo": "1.5 Panorama: Otros Sociedades Financieras (OSF)",
                "cuadro": "IEM15"
              },
              {
                "key": "n-1-0-3-2",
                "titulo": "1.6 Panorama Financiero (PF)",
                "cuadro": "IEM16"
              }
            ]
          },
          {
            "key": "n-1-0-4",
            "titulo": "1.7 Bancos Privados",
            "hijos": [
              {
                "key": "n-1-0-4-0",
                "titulo": "1.7.1 Panorama: Bancos Privado",
                "cuadro": "IEM171"
              },
              {
                "key": "n-1-0-4-1",
                "titulo": "1.7.2 Balance Sectorial: Bancos Privados",
                "cuadro": "IEM172"
              }
            ]
          },
          {
            "key": "n-1-0-5",
            "titulo": "1.8 Captaciones del Sistema Financiero",
            "hijos": [
              {
                "key": "n-1-0-5-0",
                "titulo": "1.8 Captaciones del Sistema Financiero",
                "cuadro": "IEM18"
              }
            ]
          },
          {
            "key": "n-1-0-6",
            "titulo": "1.9 Crédito al Sector Privado para Particulares",
            "hijos": [
              {
                "key": "n-1-0-6-0",
                "titulo": "1.9 Crédito al Sector Privado para Particulares",
                "cuadro": "IEM19"
              }
            ]
          },
          {
            "key": "n-1-0-7",
            "titulo": "1.10 Tasas de Interés",
            "hijos": [
              {
                "key": "n-1-0-7-0",
                "titulo": "1.10.1 Tasas de Interés Referenciales Vigentes",
                "cuadro": "IEM1101"
              },
              {
                "key": "n-1-0-7-1",
                "titulo": "1.10.2 Tasas de Interés Activas Efectivas y Máximas Referenciales vigentes por Segmentación de la Cartera (Agosto 2015 - Abril 2021)",
                "cuadro": "IEM1102"
              },
              {
                "key": "n-1-0-7-2",
                "titulo": "1.10.2a Tasas de Interés Activas Efectivas y Máximas Referenciales vigentes por Segmentación de la Cartera (Desde mayo 2021)",
                "cuadro": "IEM1102A"
              },
              {
                "key": "n-1-0-7-3",
                "titulo": "1.10.3 Monto de Operaciones Activas por la Segmentación de la Cartera (Septiembre 2015 - Abril 2021)",
                "cuadro": "IEM1103"
              },
              {
                "key": "n-1-0-7-4",
                "titulo": "1.10.3a Monto de Operaciones Activas por la Segmentación de la Cartera (Desde mayo 2021)",
                "cuadro": "IEM1103A"
              },
              {
                "key": "n-1-0-7-5",
                "titulo": "1.10.4 Tasas Pasivas Referenciales Vigentes por Plazo",
                "cuadro": "IEMPAS"
              }
            ]
          }
        ]
      },
      {
        "key": "n-1-1",
        "titulo": "2. ESTADÍSTICAS DE FINANZAS PÚBLICAS",
        "hijos": [
          {
            "key": "n-1-1-0",
            "titulo": "2.1 Operaciones del Sector Público No Financiero (Base devengado - Porcentajes del PIB)",
            "hijos": [
              {
                "key": "n-1-1-0-0",
                "titulo": "2.1 Operaciones del Sector Público No Financiero (Base devengado - Porcentajes del PIB)",
                "cuadro": "IEM21"
              }
            ]
          },
          {
            "key": "n-1-1-1",
            "titulo": "2.2 Operaciones del Sector Público No Financiero (Base devengado - Millones de Dólares)",
            "hijos": [
              {
                "key": "n-1-1-1-0",
                "titulo": "2.2 Operaciones del Sector Público No Financiero (Base devengado - Millones de Dólares)",
                "cuadro": "IEM22"
              },
              {
                "key": "n-1-1-1-1",
                "titulo": "2.2.1 Operaciones de Consolidación del Sector Público No Financiero (Base Devengado)",
                "cuadro": "IEM221"
              },
              {
                "key": "n-1-1-1-2",
                "titulo": "2.2.2 Operaciones del Gobierno Central (Base Devengado)",
                "cuadro": "IEM222"
              },
              {
                "key": "n-1-1-1-3",
                "titulo": "2.2.3 Operaciones de los Fondos de la Seguridad Social (Base Devengado)",
                "cuadro": "IEM223"
              },
              {
                "key": "n-1-1-1-4",
                "titulo": "2.2.4 Operaciones de los Gobiernos Autónomos Descentralizados (Base Devengado)",
                "cuadro": "IEM224"
              },
              {
                "key": "n-1-1-1-5",
                "titulo": "2.2.5 Operaciones de Empresas Públicas No Financieras (Base Devengado)",
                "cuadro": "IEM225"
              }
            ]
          },
          {
            "key": "n-1-1-2",
            "titulo": "2.3 Flujos de Financiamiento del Sector Público No Financiero",
            "hijos": [
              {
                "key": "n-1-1-2-0",
                "titulo": "2.3 Flujos de Financiamiento del Sector Público No Financiero",
                "cuadro": "IEM23"
              }
            ]
          },
          {
            "key": "n-1-1-3",
            "titulo": "2.4 Situación Financiera de la Administración del Estado (Base Caja)",
            "hijos": [
              {
                "key": "n-1-1-3-0",
                "titulo": "2.4 Situación Financiera de la Administración del Estado (Base Caja)",
                "cuadro": "IEM24"
              },
              {
                "key": "n-1-1-3-1",
                "titulo": "2.4.1 Resultado Global, Presupuestario y Primario de la Administración del Estado (Base Caja)",
                "cuadro": "IEM241"
              },
              {
                "key": "n-1-1-3-2",
                "titulo": "2.4.2 Ingresos Petroleros y No Petroleros de la Administración del Estado (Base Caja)",
                "cuadro": "IEM242"
              },
              {
                "key": "n-1-1-3-3",
                "titulo": "2.4.3 Erogaciones de la Administración del Estado (Base Caja)",
                "cuadro": "IEM243"
              }
            ]
          },
          {
            "key": "n-1-1-4",
            "titulo": "2.5 Estado y Movimiento de la Deuda Pública Interna Agregada del Sector Público Total",
            "hijos": [
              {
                "key": "n-1-1-4-0",
                "titulo": "2.5 Estado y Movimiento de la Deuda Pública Interna Agregada del Sector Público Total",
                "cuadro": "IEM25"
              }
            ]
          }
        ]
      },
      {
        "key": "n-1-2",
        "titulo": "3. ESTADÍSTICAS DEL SECTOR EXTERNO",
        "hijos": [
          {
            "key": "n-1-2-0",
            "titulo": "3.1 Comercio Exterior de Bienes",
            "hijos": [
              {
                "key": "n-1-2-0-0",
                "titulo": "3.1.1 Exportaciones FOB por Producto Principal",
                "cuadro": "IEM311"
              },
              {
                "key": "n-1-2-0-1",
                "titulo": "3.1.2 Exportaciones FOB por Grupos de Productos",
                "cuadro": "IEM312"
              },
              {
                "key": "n-1-2-0-2",
                "titulo": "3.1.3 Exportaciones FOB según Intensidad Tecnológica Incorporada",
                "cuadro": "IEM313"
              },
              {
                "key": "n-1-2-0-3",
                "titulo": "3.1.4 Exportaciones FOB Mensuales por Continente y País Destino",
                "cuadro": "IEM314"
              },
              {
                "key": "n-1-2-0-4",
                "titulo": "3.1.5 Exportaciones e Importaciones por Regímenes Aduaneros",
                "cuadro": "IEM315"
              },
              {
                "key": "n-1-2-0-5",
                "titulo": "3.1.6 Importaciones FOB por Uso o Destino Económico",
                "cuadro": "IEM316"
              },
              {
                "key": "n-1-2-0-6",
                "titulo": "3.1.7 Importaciones CIF por Uso o Destino Económico",
                "cuadro": "IEM317"
              },
              {
                "key": "n-1-2-0-7",
                "titulo": "3.1.8 Importaciones FOB Mensuales por Continente y País de Origen",
                "cuadro": "IEM318"
              },
              {
                "key": "n-1-2-0-8",
                "titulo": "3.1.9 Importaciones CIF Mensuales por Continente y País de Origen",
                "cuadro": "IEM319"
              },
              {
                "key": "n-1-2-0-9",
                "titulo": "3.1.10 Importaciones FOB según Intensidad Tecnológica Incorporada",
                "cuadro": "IEM3110"
              }
            ]
          },
          {
            "key": "n-1-2-1",
            "titulo": "3.2 Balanza de Pagos, Posición de Inversión Internacional (Metodología Sexto Manual) y Balanza Comercial",
            "hijos": [
              {
                "key": "n-1-2-1-0",
                "titulo": "3.2.3 Balanza Comercial - Cifras Mensuales",
                "cuadro": "IEM323"
              }
            ]
          },
          {
            "key": "n-1-2-2",
            "titulo": "3.4 Cotizaciones de las Principales Monedas. Tasas de Inflación de los Estados Unidos de América y tipos de Interés en el Mercado Internacional",
            "hijos": [
              {
                "key": "n-1-2-2-0",
                "titulo": "3.4.1 Ecuador: Índices de Tipo de Cambio Real",
                "cuadro": "IEM341"
              },
              {
                "key": "n-1-2-2-1",
                "titulo": "3.4.2 Cotizaciones del Dólar de Estados Unidos de América en el Mercado Internacional",
                "cuadro": "IEM342"
              },
              {
                "key": "n-1-2-2-2",
                "titulo": "3.4.3 Tasa de Inflación en Estados Unidos de América, Tasas de Interés Internacionales y Riesgo País",
                "cuadro": "IEM343"
              }
            ]
          }
        ]
      },
      {
        "key": "n-1-3",
        "titulo": "4. ESTADÍSTICAS DEL SECTOR REAL",
        "hijos": [
          {
            "key": "n-1-3-0",
            "titulo": "4.1 Estadísticas Petroleras",
            "hijos": [
              {
                "key": "n-1-3-0-0",
                "titulo": "4.1.1 Producción Nacional de Petróleo Crudo y sus Derivados",
                "cuadro": "IEM411"
              },
              {
                "key": "n-1-3-0-1",
                "titulo": "4.1.2 Exportaciones de Petróleo Crudo, por Cuenta",
                "cuadro": "IEM412"
              },
              {
                "key": "n-1-3-0-2",
                "titulo": "4.1.2a Exportaciones de Petróleo de EP Petroecuador (Por tipo de Crudo)",
                "cuadro": "IEM412A"
              },
              {
                "key": "n-1-3-0-3",
                "titulo": "4.1.2b Precios Promedio del Crudo Ecuatoriano y del Mercado Internacional",
                "cuadro": "IEM412B"
              },
              {
                "key": "n-1-3-0-4",
                "titulo": "4.1.3 Exportaciones de Derivados de Petróleo, por Producto",
                "cuadro": "IEM413"
              },
              {
                "key": "n-1-3-0-5",
                "titulo": "4.1.4 Ingresos y Egresos por Comercialización Interna de Derivados Importados",
                "cuadro": "IEM414"
              }
            ]
          },
          {
            "key": "n-1-3-1",
            "titulo": "4.2 Precios, Salarios y Mercado Laboral",
            "hijos": [
              {
                "key": "n-1-3-1-0",
                "titulo": "4.2.1 Índice de Precios al Consumidor (Año base : Enero - Diciembre de 2014 = 100)",
                "cuadro": "IEM421"
              },
              {
                "key": "n-1-3-1-1",
                "titulo": "4.2.4a Índice Nacional De Precios Productor con Petróleo y sin Petróleo",
                "cuadro": "IEM424A"
              },
              {
                "key": "n-1-3-1-2",
                "titulo": "4.2.4b Índice Nacional de Precios Productor - Sistema De Índices",
                "cuadro": "IEM424B"
              },
              {
                "key": "n-1-3-1-3",
                "titulo": "4.2.5 Indicadores del Mercado Laboral Nacional, Urbano y Rural",
                "cuadro": "IEM425A"
              }
            ]
          },
          {
            "key": "n-1-3-2",
            "titulo": "4.5 Cifras de Coyuntura",
            "hijos": [
              {
                "key": "n-1-3-2-0",
                "titulo": "4.5.1 Índice de Confianza del Consumidor Nacional, Urbano y Rural",
                "cuadro": "IEM451"
              },
              {
                "key": "n-1-3-2-1",
                "titulo": "4.5.3 Producción, inventarios y despacho de cemento por segmento de mercado",
                "cuadro": "IEM453"
              },
              {
                "key": "n-1-3-2-2",
                "titulo": "4.5.4 Índice de Expectativas de la Economía",
                "cuadro": "IEM454"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "key": "n-2",
    "titulo": "Estadísticas Trimestrales",
    "hijos": [
      {
        "key": "n-2-0",
        "titulo": "Balanza de Pagos y Precios",
        "hijos": [
          {
            "key": "n-2-0-0",
            "titulo": "2. ESTADÍSTICAS DE FINANZAS PÚBLICAS",
            "hijos": [
              {
                "key": "n-2-0-0-0",
                "titulo": "2.1 Operaciones del Sector Público No Financiero (Base devengado - Porcentajes del PIB)",
                "cuadro": "IEM21T"
              },
              {
                "key": "n-2-0-0-1",
                "titulo": "2.2 Operaciones del Sector Público No Financiero (Base devengado - Millones de Dólares)",
                "cuadro": "IEM22T"
              },
              {
                "key": "n-2-0-0-2",
                "titulo": "2.2.1 Operaciones de Consolidación del Sector Público No Financiero (Base Devengado)",
                "cuadro": "IEM221T"
              },
              {
                "key": "n-2-0-0-3",
                "titulo": "2.2.2 Operaciones del Gobierno Central (Base Devengado)",
                "cuadro": "IEM222T"
              },
              {
                "key": "n-2-0-0-4",
                "titulo": "2.2.3 Operaciones de los Fondos de la Seguridad Social (Base Devengado)",
                "cuadro": "IEM223T"
              },
              {
                "key": "n-2-0-0-5",
                "titulo": "2.2.4 Operaciones de los Gobiernos Autónomos Descentralizados (Base Devengado)",
                "cuadro": "IEM224T"
              },
              {
                "key": "n-2-0-0-6",
                "titulo": "2.2.5 Operaciones de Empresas Públicas No Financieras (Base Devengado)",
                "cuadro": "IEM225T"
              },
              {
                "key": "n-2-0-0-7",
                "titulo": "2.3 Flujos de Financiamiento del Sector Público No Financiero",
                "cuadro": "IEM23T"
              }
            ]
          },
          {
            "key": "n-2-0-1",
            "titulo": "3. ESTADÍSTICAS DEL SECTOR EXTERNO",
            "hijos": [
              {
                "key": "n-2-0-1-0",
                "titulo": "3.2.1 Balanza de Pagos Normalizada (Millones de Dólares)",
                "cuadro": "IEM321"
              },
              {
                "key": "n-2-0-1-1",
                "titulo": "3.2.2 Posición de Inversión Internacional (Millones de Dólares)",
                "cuadro": "IEM322"
              }
            ]
          },
          {
            "key": "n-2-0-2",
            "titulo": "4. ESTADÍSTICAS DEL SECTOR REAL",
            "hijos": [
              {
                "key": "n-2-0-2-0",
                "titulo": "4.2.5 Indicadores del Mercado Laboral Nacional, Urbano y Rural",
                "cuadro": "IEM425A"
              },
              {
                "key": "n-2-0-2-1",
                "titulo": "4.2.6 Indicadores del Mercado Laboral Ecuatoriano: Cuenca, Guayaquil Quito, Machala y Ambato (Trimestral)",
                "cuadro": "IEM426"
              },
              {
                "key": "n-2-0-2-2",
                "titulo": "4.5.1a Índice de Confianza del Consumidor Nacional, Urbano y Rural (Acumulado Trimestral)",
                "cuadro": "IEM451A"
              },
              {
                "key": "n-2-0-2-3",
                "titulo": "4.5.2 Índice de Confianza del Consumidor 5 ciudades (Acumulado Trimestral)",
                "cuadro": "IEM452"
              }
            ]
          }
        ]
      },
      {
        "key": "n-2-1",
        "titulo": "Cuentas Nacionales Trimestrales",
        "hijos": [
          {
            "key": "n-2-1-0",
            "titulo": "TABLA OFERTA Y UTILIZACION DE BIENES Y SERVICIOS",
            "hijos": [
              {
                "key": "n-2-1-0-0",
                "titulo": "TOU01. Miles de USD, Datos Brutos",
                "cuadro": "TOU01"
              },
              {
                "key": "n-2-1-0-1",
                "titulo": "TOU02. Miles de USD, Datos Ajustados de Estacionalidad",
                "cuadro": "TOU02"
              },
              {
                "key": "n-2-1-0-2",
                "titulo": "TOU03. Miles de USD, Niveles Encadenados, 2018 = 100, Datos Brutos",
                "cuadro": "TOU03"
              },
              {
                "key": "n-2-1-0-3",
                "titulo": "Miles de USD, Niveles Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "TOU04"
              },
              {
                "key": "n-2-1-0-4",
                "titulo": "TOU05. Índices de Volumen Encadenados, 2018 = 100 Datos Brutos",
                "cuadro": "TOU05"
              },
              {
                "key": "n-2-1-0-5",
                "titulo": "TOU06. Índices de Volumen Encadenados, 2018 = 100 Datos Ajustados de Estacionalidad",
                "cuadro": "TOU06"
              },
              {
                "key": "n-2-1-0-6",
                "titulo": "TOU07. Índices de Volumen Encadenados, 2018 = 100 Datos Ajustados de Estacionalidad Variación Interanual",
                "cuadro": "TOU07"
              },
              {
                "key": "n-2-1-0-7",
                "titulo": "TOU08. Índices de Volumen Encadenados, 2018 = 100 Datos Ajustados de Estacionalidad Variación Intertrimestral",
                "cuadro": "TOU08"
              },
              {
                "key": "n-2-1-0-8",
                "titulo": "TOU09. Índices de Precios, 2018 = 100 Datos Ajustados de Estacionalidad",
                "cuadro": "TOU09"
              },
              {
                "key": "n-2-1-0-9",
                "titulo": "TOU10. Índices de Precios, 2018 = 100 Datos Ajustados de Estacionalidad Variación Interanual",
                "cuadro": "TOU10"
              },
              {
                "key": "n-2-1-0-10",
                "titulo": "TOU11. Índices de Volumen Encadenados, 2018 = 100 Datos Ajustados de Estacionalidad Contribuciones al Crecimiento Interanual",
                "cuadro": "TOU11"
              },
              {
                "key": "n-2-1-0-11",
                "titulo": "TOU12. Índices de Volumen Encadenados, 2018 = 100 Datos Ajustados de Estacionalidad Contribuciones al Crecimiento Intertrimestral",
                "cuadro": "TOU12"
              }
            ]
          },
          {
            "key": "n-2-1-1",
            "titulo": "VALOR AGREGADO BRUTO POR INDUSTRIAS",
            "hijos": [
              {
                "key": "n-2-1-1-0",
                "titulo": "VAB01. Miles de USD, Datos Brutos",
                "cuadro": "VAB01"
              },
              {
                "key": "n-2-1-1-1",
                "titulo": "VAB02. Miles de USD, Datos Ajustados de Estacionalidad",
                "cuadro": "VAB02"
              },
              {
                "key": "n-2-1-1-2",
                "titulo": "VAB03. Miles de USD, Niveles Encadenados, 2018 = 100, Datos Brutos",
                "cuadro": "VAB03"
              },
              {
                "key": "n-2-1-1-3",
                "titulo": "VAB04. Miles de USD, Niveles Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAB04"
              },
              {
                "key": "n-2-1-1-4",
                "titulo": "VAB05. Índices de Volumen Encadenados, 2018 = 100, Datos Brutos",
                "cuadro": "VAB05"
              },
              {
                "key": "n-2-1-1-5",
                "titulo": "VAB06. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAB06"
              },
              {
                "key": "n-2-1-1-6",
                "titulo": "VAB07. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Variación Interanual",
                "cuadro": "VAB07"
              },
              {
                "key": "n-2-1-1-7",
                "titulo": "VAB08. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Variación Intertrimestral",
                "cuadro": "VAB08"
              },
              {
                "key": "n-2-1-1-8",
                "titulo": "VAB09. Índices de Precios, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAB09"
              },
              {
                "key": "n-2-1-1-9",
                "titulo": "VAB10. Índices de Precios, 2018 = 100, Datos Ajustados de Estacionalidad Variación Interanual",
                "cuadro": "VAB10"
              },
              {
                "key": "n-2-1-1-10",
                "titulo": "VAB11. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Contribuciones al Crecimiento Interanual",
                "cuadro": "VAB11"
              },
              {
                "key": "n-2-1-1-11",
                "titulo": "VAB12. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Contribuciones al Crecimiento Intertrimestral",
                "cuadro": "VAB12"
              }
            ]
          },
          {
            "key": "n-2-1-2",
            "titulo": "VALOR AGREGADO BRUTO AGRUPADO POR SECTOR",
            "hijos": [
              {
                "key": "n-2-1-2-0",
                "titulo": "VAA01. Miles de USD, Datos Brutos",
                "cuadro": "VAA01"
              },
              {
                "key": "n-2-1-2-1",
                "titulo": "VAA02. Miles de USD, Datos Ajustados de Estacionalidad",
                "cuadro": "VAA02"
              },
              {
                "key": "n-2-1-2-2",
                "titulo": "VAA03. Miles de USD, Niveles Encadenados, 2018 = 100, Datos Brutos",
                "cuadro": "VAA03"
              },
              {
                "key": "n-2-1-2-3",
                "titulo": "VAA04. Miles de USD, Niveles Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAA04"
              },
              {
                "key": "n-2-1-2-4",
                "titulo": "VAA05. Índices de Volumen Encadenados, 2018 = 100, Datos Brutos",
                "cuadro": "VAA05"
              },
              {
                "key": "n-2-1-2-5",
                "titulo": "VAA06. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAA06"
              },
              {
                "key": "n-2-1-2-6",
                "titulo": "VAA07. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Variación Interanual",
                "cuadro": "VAA07"
              },
              {
                "key": "n-2-1-2-7",
                "titulo": "VAA08. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Variación Intertrimestral",
                "cuadro": "VAA08"
              },
              {
                "key": "n-2-1-2-8",
                "titulo": "VAA09. Índices de Precios, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAA09"
              },
              {
                "key": "n-2-1-2-9",
                "titulo": "VAA10. Índices de Precios, 2018 = 100, Datos Ajustados de Estacionalidad Variación Interanual",
                "cuadro": "VAA10"
              },
              {
                "key": "n-2-1-2-10",
                "titulo": "VAA11. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Contribuciones al Crecimiento Interanual",
                "cuadro": "VAA11"
              },
              {
                "key": "n-2-1-2-11",
                "titulo": "VAA12. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Contribuciones al Crecimiento Intertrimestral",
                "cuadro": "VAA12"
              }
            ]
          },
          {
            "key": "n-2-1-3",
            "titulo": "VALOR AGREGADO BRUTO PETROLERO Y NO PETROLERO",
            "hijos": [
              {
                "key": "n-2-1-3-0",
                "titulo": "VAP01. Miles de USD, Datos Brutos",
                "cuadro": "VAP01"
              },
              {
                "key": "n-2-1-3-1",
                "titulo": "VAP02. Miles de USD, Datos Ajustados de Estacionalidad",
                "cuadro": "VAP02"
              },
              {
                "key": "n-2-1-3-2",
                "titulo": "VAP03. Miles de USD, Niveles Encadenados, 2018 = 100, Datos Brutos",
                "cuadro": "VAP03"
              },
              {
                "key": "n-2-1-3-3",
                "titulo": "VAP04. Miles de USD, Niveles Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAP04"
              },
              {
                "key": "n-2-1-3-4",
                "titulo": "VAP05. Índices de Volumen Encadenados, 2018 = 100, Datos Brutos",
                "cuadro": "VAP05"
              },
              {
                "key": "n-2-1-3-5",
                "titulo": "VAP06. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAP06"
              },
              {
                "key": "n-2-1-3-6",
                "titulo": "VAP07. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Variación Interanual",
                "cuadro": "VAP07"
              },
              {
                "key": "n-2-1-3-7",
                "titulo": "VAP08. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Variación Intertrimestral",
                "cuadro": "VAP08"
              },
              {
                "key": "n-2-1-3-8",
                "titulo": "VAP09. Índices de Precios, 2018 = 100, Datos Ajustados de Estacionalidad",
                "cuadro": "VAP09"
              },
              {
                "key": "n-2-1-3-9",
                "titulo": "VAP10. Índices de Precios, 2018 = 100, Datos Ajustados de Estacionalidad Variación Interanual",
                "cuadro": "VAP10"
              },
              {
                "key": "n-2-1-3-10",
                "titulo": "VAP11. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Contribuciones al Crecimiento Interanual",
                "cuadro": "VAP11"
              },
              {
                "key": "n-2-1-3-11",
                "titulo": "VAP12. Índices de Volumen Encadenados, 2018 = 100, Datos Ajustados de Estacionalidad Contribuciones al Crecimiento Intertrimestral",
                "cuadro": "VAP12"
              }
            ]
          }
        ]
      }
    ]
  }
];
