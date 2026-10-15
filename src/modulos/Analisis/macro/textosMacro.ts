import { dec } from "../datos";

/**
 * Lectura del periodo de las hojas macro: plantillas deterministas con las cifras del ultimo dato,
 * al estilo de los boletines del BCE. Cada funcion devuelve parrafos de texto plano.
 *
 * Punto de extension: si se decide redactar con un agente (reunion del asistente), la hoja puede
 * reemplazar estos parrafos por los del agente con las mismas cifras de entrada.
 */

/** "2,1%" con signo solo si es negativo. */
const p = (v: number, d = 1) => `${dec(v, d)}%`;
const m = (v: number) => `USD ${dec(v, 1)} millones`;
const pp = (v: number) => `${dec(Math.abs(v), 1)} puntos porcentuales`;

/** Primera letra en minuscula para ir dentro de una frase; las siglas ("FBKF") quedan igual. */
const minus = (t: string) => (/^\p{Lu}\p{Ll}/u.test(t) ? t[0].toLowerCase() + t.slice(1) : t);

const verbo = (v: number, sube = "creció", baja = "se contrajo", igual = "se mantuvo") => (v > 0 ? sube : v < 0 ? baja : igual);

export const textoPib = (d: {
  trimestre: string;
  interanual: number;
  trimestral: number | null;
  anio?: string;
  anual?: number | null;
}): string[] => {
  const t = [
    `La economía ecuatoriana ${verbo(d.interanual, "registró un crecimiento", "registró una contracción", "no varió")} interanual de ${p(Math.abs(d.interanual))} en el ${d.trimestre}.` +
      (d.trimestral !== null ? ` En comparación con el trimestre anterior (serie ajustada de estacionalidad), el PIB varió ${p(d.trimestral)}.` : ""),
  ];
  if (d.anio && d.anual !== null && d.anual !== undefined)
    t.push(`En el año ${d.anio} el PIB en volumen ${verbo(d.anual)} ${p(Math.abs(d.anual))} según la última cifra anual del BCE.`);
  return t;
};

export const textoVab = (d: {
  trimestre: string;
  positivas: number;
  total: number;
  mayores: { nombre: string; contribucion: number }[];
  menores: { nombre: string; contribucion: number }[];
}): string[] => [
  `En el ${d.trimestre}, ${d.positivas} de las ${d.total} industrias registraron variaciones interanuales positivas.`,
  d.mayores.length
    ? `Las que más aportaron al crecimiento del PIB fueron ${d.mayores.map((x) => `${minus(x.nombre)} (${dec(x.contribucion, 2)} pp)`).join(", ")}.`
    : "",
  d.menores.length
    ? `En sentido contrario restaron ${d.menores.map((x) => `${minus(x.nombre)} (${dec(x.contribucion, 2)} pp)`).join(", ")}.`
    : "",
].filter(Boolean);

export const textoGasto = (d: {
  trimestre: string;
  pib: number;
  componentes: { nombre: string; tasa: number | null; contribucion: number | null }[];
}): string[] => {
  const conContrib = d.componentes.filter((c) => c.contribucion !== null) as { nombre: string; tasa: number | null; contribucion: number }[];
  const impulsan = conContrib.filter((c) => c.contribucion > 0).sort((a, b) => b.contribucion - a.contribucion).slice(0, 2);
  const frenan = conContrib.filter((c) => c.contribucion < 0).sort((a, b) => a.contribucion - b.contribucion).slice(0, 2);
  const lista = (xs: typeof conContrib) => xs.map((c) => `${minus(c.nombre)} (${dec(c.contribucion, 2)} pp)`).join(" y ");
  return [
    `Por el enfoque del gasto, el PIB ${verbo(d.pib)} ${p(Math.abs(d.pib))} interanual en el ${d.trimestre}` +
      (impulsan.length ? `, impulsado por ${lista(impulsan)}.` : "."),
    frenan.length ? `Restaron al crecimiento ${lista(frenan)}.` : "",
  ].filter(Boolean);
};

export const textoInflacion = (d: {
  mes: string;
  anual: number;
  anualAnterior: number | null;
  sube: { nombre: string; valor: number }[];
  baja: { nombre: string; valor: number }[];
  eeuu?: number | null;
}): string[] => [
  `La variación interanual del IPC en ${d.mes} fue de ${p(d.anual, 2)}` +
    (d.anualAnterior !== null ? `, frente a ${p(d.anualAnterior, 2)} en el mismo mes del año anterior.` : "."),
  d.sube.length
    ? `Entre las divisiones con mayores incrementos se encuentran ${d.sube.map((x) => `${minus(x.nombre)} (${p(x.valor, 2)})`).join(", ")}.`
    : "",
  d.baja.length ? `Presentaron variaciones negativas ${d.baja.map((x) => `${minus(x.nombre)} (${p(x.valor, 2)})`).join(", ")}.` : "",
  d.eeuu !== null && d.eeuu !== undefined ? `Como referencia, la inflación anual de Estados Unidos fue de ${p(d.eeuu, 2)}.` : "",
].filter(Boolean);

export const textoEmpleo = (d: {
  trimestre: string;
  ambito: string;
  adecuado: number;
  subempleo: number;
  desempleo: number;
  difAdecuado: number | null;
  difDesempleo: number | null;
}): string[] => [
  `En el ${d.trimestre}, a nivel ${minus(d.ambito)}, la tasa de empleo adecuado fue de ${p(d.adecuado)}, la de subempleo de ${p(d.subempleo)} y la de desempleo de ${p(d.desempleo)}.`,
  d.difAdecuado !== null && d.difDesempleo !== null
    ? `Frente al mismo trimestre del año anterior, el empleo adecuado ${d.difAdecuado >= 0 ? "subió" : "bajó"} ${pp(d.difAdecuado)} y el desempleo ${d.difDesempleo >= 0 ? "subió" : "bajó"} ${pp(d.difDesempleo)}. Las diferencias pequeñas pueden no ser estadísticamente significativas.`
    : "",
].filter(Boolean);

export const textoPetroleo = (d: { mes: string; wti: number; varWti: number | null; cesta: number; varCesta: number | null; riesgo?: number | null }): string[] => [
  `En ${d.mes}, el precio promedio del WTI se ubicó en USD ${dec(d.wti, 1)} por barril` +
    (d.varWti !== null ? `, una variación interanual de ${p(d.varWti)}` : "") +
    `. La cesta de crudo ecuatoriano (Oriente y Napo) promedió USD ${dec(d.cesta, 1)} por barril` +
    (d.varCesta !== null ? ` (${p(d.varCesta)} interanual).` : "."),
  d.riesgo !== null && d.riesgo !== undefined ? `El riesgo país (EMBI) cerró el último mes disponible en ${dec(d.riesgo, 0)} puntos básicos.` : "",
].filter(Boolean);

export const textoReservas = (d: { mes: string; ri: number; varMes: number | null; varAnio: number | null; mayor: { nombre: string; valor: number } | null }): string[] => [
  `Al cierre de ${d.mes}, las reservas internacionales se ubicaron en ${m(d.ri)}` +
    (d.varMes !== null ? `, ${d.varMes >= 0 ? "un aumento" : "una disminución"} de ${m(Math.abs(d.varMes))} frente al mes anterior` : "") +
    (d.varAnio !== null ? ` y ${d.varAnio >= 0 ? "un aumento" : "una disminución"} de ${m(Math.abs(d.varAnio))} frente al cierre del año anterior.` : "."),
  d.mayor ? `Su principal componente es ${minus(d.mayor.nombre)}, con ${m(d.mayor.valor)}.` : "",
].filter(Boolean);

export const textoSistemaBalances = (d: { mes: string; ri: number; p1: number; p2: number; p3: number }): string[] => {
  const cubre12 = d.ri >= d.p1 + d.p2;
  const excedente = d.ri - d.p1 - d.p2;
  return [
    cubre12
      ? `Al cierre de ${d.mes}, las reservas internacionales (${m(d.ri)}) cubrieron el 100% de los pasivos del primer y segundo sistema de balance del BCE, y el excedente de ${m(excedente)} cubre el ${p((excedente / d.p3) * 100)} de los pasivos del tercer sistema.`
      : `Al cierre de ${d.mes}, las reservas internacionales (${m(d.ri)}) no alcanzaron a cubrir los pasivos del primer y segundo sistema (${m(d.p1 + d.p2)}).`,
  ];
};

export const textoAgregados = (d: { mes: string; m2: number; m1: number; emc: number; tM2: number | null; tM1: number | null; tEmc: number | null }): string[] => [
  `A ${d.mes}, la liquidez total (M2) fue de ${m(d.m2)}, la oferta monetaria (M1) de ${m(d.m1)} y las especies monetarias en circulación de ${m(d.emc)}.`,
  d.tM2 !== null && d.tM1 !== null
    ? `Sus tasas de variación anual fueron ${p(d.tM2)} (M2), ${p(d.tM1)} (M1)` + (d.tEmc !== null ? ` y ${p(d.tEmc)} (especies monetarias).` : ".")
    : "",
].filter(Boolean);

export const textoCaptacionesCartera = (d: { mes: string; captaciones: number; tCap: number | null; cartera: number; tCar: number | null }): string[] => [
  `Los depósitos de empresas y hogares en el sistema financiero alcanzaron ${m(d.captaciones)} a ${d.mes}` +
    (d.tCap !== null ? `, con una tasa de crecimiento anual de ${p(d.tCap)}.` : "."),
  `La cartera por vencer al sector privado (empresas y hogares) fue de ${m(d.cartera)}` + (d.tCar !== null ? `, con una variación anual de ${p(d.tCar)}.` : "."),
];

export const textoPanoramas = (d: { mes: string; aen: number; ain: number; pasivos: number; vista: number | null; cuasi: number | null }): string[] => [
  `A ${d.mes}, el saldo de los activos externos netos del BCE fue de ${m(d.aen)} y el de los activos internos netos de ${m(d.ain)}; los pasivos monetarios y otras obligaciones sumaron ${m(d.pasivos)}.`,
  d.vista !== null && d.cuasi !== null
    ? `En las otras sociedades de depósito, los depósitos a la vista variaron ${m(d.vista)} y el cuasidinero ${m(d.cuasi)} frente al mes anterior.`
    : "",
].filter(Boolean);

export const textoCuentaCorriente = (d: { anio: string; cc: number; ccAnt: number | null; trimestre: string; ccT: number; bienesT: number | null }): string[] => [
  `En ${d.anio}, la cuenta corriente de la balanza de pagos presentó un ${d.cc >= 0 ? "superávit" : "déficit"} de ${m(Math.abs(d.cc))}` +
    (d.ccAnt !== null ? `, frente a ${m(d.ccAnt)} del año anterior.` : "."),
  `En el ${d.trimestre}, el saldo fue de ${m(d.ccT)}` + (d.bienesT !== null ? `, con una cuenta de bienes de ${m(d.bienesT)}.` : "."),
];

export const textoRemesas = (d: { trimestre: string; remesas: number; varT4: number | null; anio: string; anual: number | null; id: number | null }): string[] => [
  `Las remesas de trabajadores recibidas en el ${d.trimestre} alcanzaron ${m(d.remesas)}` +
    (d.varT4 !== null ? `, ${p(d.varT4)} frente al mismo trimestre del año anterior.` : "."),
  d.anual !== null ? `En ${d.anio}, el flujo anual de remesas recibidas fue de ${m(d.anual)}.` : "",
  d.id !== null ? `La inversión directa (pasivos netos incurridos) del ${d.trimestre} fue de ${m(d.id)}.` : "",
].filter(Boolean);

export const textoBalanza = (d: { periodo: string; total: number; totalAnt: number | null; pet: number; noPet: number; mes: string; mensual: number }): string[] => [
  `Entre ${d.periodo}, la balanza comercial total registró un ${d.total >= 0 ? "superávit" : "déficit"} de ${m(Math.abs(d.total))}` +
    (d.totalAnt !== null ? `, ${m(Math.abs(d.total - d.totalAnt))} ${d.total >= d.totalAnt ? "más" : "menos"} que en igual período del año anterior.` : "."),
  `La balanza petrolera sumó ${m(d.pet)} y la no petrolera ${m(d.noPet)}.`,
  `En ${d.mes}, la balanza comercial mensual fue de ${m(d.mensual)}.`,
];

export const textoFiscal = (d: { periodo: string; global: number; primario: number; ingresos: number; petroleros: number }): string[] => [
  `Entre ${d.periodo}, el resultado global acumulado de la administración del Estado (base caja) fue de ${m(d.global)} y el resultado primario de ${m(d.primario)}.`,
  `Los ingresos acumulados sumaron ${m(d.ingresos)}, de los cuales el ${p((d.petroleros / d.ingresos) * 100)} fueron petroleros.`,
];

export const textoDeuda = (d: { mes: string; interna: number; externa: number; pctPib: number | null }): string[] => [
  `A ${d.mes}, el saldo de la deuda pública interna fue de ${m(d.interna)} y el de la deuda externa pública de ${m(d.externa)}` +
    (d.pctPib !== null ? `, equivalente al ${p(d.pctPib)} del PIB.` : "."),
];
