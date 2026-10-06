// Genera el workflow n8n "Informes (determinista, multi-tipo)" como JSON importable.
// Uso: node build_informes_multitipo.cjs > informes_multitipo.json
//      docker cp informes_multitipo.json n8n:/tmp/ && docker exec n8n n8n import:workflow --input=/tmp/informes_multitipo.json
// Datos: base idce_bco_coop (B11, IndicadorData, Ifi, Cuenta). Contrato del POST: ../CONTRATO_INVOCACION_AGENTE.md
const crypto = require('crypto');
const uid = () => crypto.randomUUID();

const SQL_CRED = { microsoftSql: { id: 'uVKseWbiANZAXXZw', name: 'Microsoft SQL account' } };
const OPENAI_CRED = { openAiApi: { id: '25LdxiVxKdbsmTOd', name: 'OpenAI account' } };
const BASE = "{{ $('Normalizar solicitud').first().json.base }}";
const TIPOS = ['solvencia', 'calidad_cartera', 'rentabilidad', 'liquidez', 'posicion_mercado', 'estructura_financiera', 'fuentes_usos', 'resumen_ejecutivo'];

// ---------- Helpers comunes de las fichas (se anteponen a cada "Armar …") ----------
const H = String.raw`const norm = $('Normalizar solicitud').first().json;
const num = o => { const x = {}; for (const [k, v] of Object.entries(o)) x[k] = (v === null || v === undefined || v === '' || isNaN(+v)) ? v : +v; return x; };
const ps = $('Pares (común)').all().map(i => num(i.json)).filter(p => p.nombre);
const yo = ps.find(p => p.es_entidad === 1) || {};
const r = (x, d = 1) => (x == null || isNaN(x)) ? null : Math.round(x * 10 ** d) / 10 ** d;
const med = a => { const s = a.filter(v => v != null && !isNaN(v)).sort((x, y) => x - y); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const fmt = (x, d = 1) => { if (x == null || isNaN(x)) return '–'; const s = Math.abs(x).toFixed(d); let [e, m] = s.split('.'); e = e.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (x < 0 ? '−' : '') + e + (m ? ',' + m : ''); };
const sg = (x, d = 1) => x == null ? '–' : (x > 0 ? '+' : '') + fmt(x, d);
const pc = (x, d = 1) => x == null ? '–' : fmt(x, d) + ' %';
const TIPO_ENT = { COOP: 'Cooperativa', BP: 'Banco privado', MU: 'Mutualista', PU: 'Banca pública' };
const SEM = { r: 'ROJO', a: 'ÁMBAR', v: 'VERDE' };
const corte = yo.mes || norm.mes;
const mm = +corte.slice(5);
const anterior = (+corte.slice(0, 4) - 1) + corte.slice(4);
function pares(met, mejorAlto, cols) {
  const s = ps.filter(p => p[met] != null).sort((a, b) => mejorAlto ? b[met] - a[met] : a[met] - b[met]);
  const pos = s.findIndex(p => p.es_entidad === 1) + 1;
  const f = (v, d, u) => u === '%' ? pc(v, d) : fmt(v, d);
  const rows = s.map((p, i) => [p.nombre, fmt(p.act_mm, 1), ...cols.map(([k, , d, u]) => f(p[k], d, u)), String(i + 1)]);
  rows.push(['Mediana', '', ...cols.map(([k, , d, u]) => f(med(s.map(p => p[k])), d, u)), '']);
  const m = med(s.map(p => p[met]));
  return {
    tabla: { cols: ['Entidad', 'Activo M', ...cols.map(c => c[1]), 'Posición'], rows, yo: pos ? [pos - 1] : [], med: [rows.length - 1] },
    resumen: { criterio: 'las 10 entidades del mismo tipo con activo más cercano', indicador: met, mejor_si: mejorAlto ? 'alto' : 'bajo', posicion: pos || null, de: s.length,
      entidad: yo[met] ?? null, mediana: r(m, 2), brecha_vs_mediana: (yo[met] != null && m != null) ? r(yo[met] - m, 2) : null,
      mejor: s[0] ? { nombre: s[0].nombre, valor: s[0][met] } : null, peor: s.length ? { nombre: s[s.length - 1].nombre, valor: s[s.length - 1][met] } : null,
      otros: Object.fromEntries(cols.map(([k]) => [k, { entidad: yo[k] ?? null, mediana: r(med(s.map(p => p[k])), 2) }])) }
  };
}
// KPI con valor numérico (para KpiCard + Delta del frontend) y su versión en texto (para el HTML).
const K = (t, valor, unidad, dec, delta, dUnidad, subirEsMalo, texto, dTexto) => ({ t, v: texto != null ? texto : (unidad === '%' ? pc(valor, dec) : fmt(valor, dec)), d: dTexto != null ? dTexto : (delta == null ? '–' : sg(delta, dUnidad === '%' ? 1 : dec) + ' ' + dUnidad), valor: valor ?? null, unidad, dec, delta: delta ?? null, dUnidad: dUnidad || '', subirEsMalo: !!subirEsMalo, texto: texto ?? null, dTexto: dTexto ?? null });
const corto = n => String(n || '').replace(/^(COAC|BP|MUT|PU)\.\s+/, '').replace(/\s+(LIMITADA|LTDA\.?)$/, '').trim();
// Gráfico como datos: el frontend lo pinta con TarjetaGrafica y el HTML con SVG. Nunca lo hace el LLM.
const G = (tipo, titulo, unidad, categorias, series, extra) => Object.assign({ tipo, titulo, unidad, categorias, series, decimales: 1 }, extra || {});
function graficoPares(met, titulo, unidad, mejorAlto, dec) {
  const s = ps.filter(p => p[met] != null).sort((a, b) => mejorAlto ? b[met] - a[met] : a[met] - b[met]);
  return G('barras_h', titulo + ' frente a pares', unidad, s.map(p => corto(p.nombre)), [{ nombre: titulo, datos: s.map(p => p[met]) }], { resaltar: corto(yo.nombre), referencias: [{ valor: r(med(s.map(p => p[met])), dec), etiqueta: 'Mediana' }], decimales: dec });
}
const salida = o => [{ json: { maxPalabras: 380, notas: [], ...o, secciones: (o.secciones || []).map(s => Object.assign({}, s, { graficos: (o.graficos || {})[s.clave] || [] })), entidad: yo.nombre || norm.nombre, tipoEntidad: TIPO_ENT[yo.tipo_ent] || yo.tipo_ent || '', corte, comparado_con: anterior, pedido: norm.texto, audiencia: norm.audiencia, ifiId: norm.ifiId } }];
`;

// ---------- Nodo: Normalizar ----------
const NORMALIZAR = String.raw`// Valida el POST y prepara el CTE base (entidad, corte, corte-1m, corte-12m). Sin LLM.
const TIPOS = ` + JSON.stringify(TIPOS) + String.raw`;
const b = $input.first().json.body || {};
const s = b.solicitud || {}, e = b.entidad || {}, c = b.contexto || {}, prm = s.parametros || {};
const tipo = String(s.tipoInforme || '').toLowerCase().trim();
const mesPedido = s.corte || c.ultimoCorte || '2099-12';
const mes = /^\d{4}-(0[1-9]|1[0-2])$/.test(mesPedido) ? mesPedido : '2099-12';
const n = Number(e.ifiId);
const ifiId = Number.isInteger(n) && n > 0 ? n : null;
const nombre = typeof e.nombre === 'string' ? e.nombre.slice(0, 256) : '';
const audiencia = ['gerencia', 'consejo', 'riesgos', 'auditoria'].includes(prm.audiencia) ? prm.audiencia : 'gerencia';
let error = '';
if (!TIPOS.includes(tipo)) error = 'Indica el tipo de informe. Disponibles hoy: ' + TIPOS.join(', ') + '.';
else if (!ifiId && !nombre) error = 'Falta identificar la entidad (entidad.ifiId o entidad.nombre).';
// ifiId es entero validado; el nombre se escapa: se puede interpolar en el SQL sin riesgo.
const ifiSql = ifiId ? String(ifiId) : "(SELECT TOP 1 IFIID FROM Ifi WHERE Nombre = N'" + nombre.replace(/'/g, "''") + "')";
const base = "WITH x AS (SELECT " + ifiSql + " AS ifi), p AS (SELECT x.ifi, c.corte, DATEDIFF(day,'1950-01-01',EOMONTH(DATEADD(month,-1,DATEADD(day,c.corte,'1950-01-01')))) c1, DATEDIFF(day,'1950-01-01',EOMONTH(DATEADD(month,-12,DATEADD(day,c.corte,'1950-01-01')))) c12, (SELECT TipoEntidad FROM Ifi WHERE IFIID=x.ifi) tipo, (SELECT Nombre FROM Ifi WHERE IFIID=x.ifi) nombre FROM x CROSS APPLY (SELECT MAX(FechaID) corte FROM B11 WHERE IFIID=x.ifi AND CuentaID=1 AND FechaID <= DATEDIFF(day,'1950-01-01',EOMONTH(CAST('" + mes + "-01' AS date)))) c)";
return [{ json: { error, tipo, mes, ifiId, nombre, audiencia, texto: String(s.texto || '').slice(0, 500), base } }];`;

const PREPARAR = String.raw`const ps = $input.all().map(i => i.json).filter(p => p.nombre);
const norm = $('Normalizar solicitud').first().json;
const yo = ps.find(p => +p.es_entidad === 1);
return [{ json: { ok: !!yo, tipo: norm.tipo, mes: yo ? yo.mes : norm.mes } }];`;

// ---------- SQL ----------
const AGG = `SUM(CASE WHEN b.CuentaID=1 THEN b.Saldo END) act, SUM(CASE WHEN b.CuentaID=3 THEN b.Saldo END) pat, SUM(CASE WHEN b.CuentaID=21 THEN b.Saldo END) dep, SUM(CASE WHEN b.CuentaID=11 THEN b.Saldo END) fd, SUM(CASE WHEN b.CuentaID IN (2101,210305,210310) THEN b.Saldo END) dep_cp, SUM(CASE WHEN b.CuentaID BETWEEN 1401 AND 1496 THEN b.Saldo END) cbruta, SUM(CASE WHEN b.CuentaID BETWEEN 1425 AND 1472 OR b.CuentaID IN (1479,1481,1483,1485,1487,1489) THEN b.Saldo END) improd, SUM(CASE WHEN b.CuentaID=1499 THEN -b.Saldo END) prov, SUM(CASE WHEN b.CuentaID=5 THEN b.Saldo WHEN b.CuentaID=4 THEN -b.Saldo END) res, SUM(CASE WHEN b.CuentaID=45 THEN b.Saldo END) gop`;
const AGG_WHERE = `(b.CuentaID IN (1,3,4,5,11,21,45,1499,2101,210305,210310) OR b.CuentaID BETWEEN 1401 AND 1496)`;

const SQL_PARES = BASE + `,
s AS (SELECT b.IFIID, ${AGG} FROM B11 b JOIN p ON b.FechaID=p.corte WHERE ${AGG_WHERE} GROUP BY b.IFIID),
ind AS (SELECT d.IFIID, MAX(CASE WHEN d.IndicadorFinID=5 THEN d.Valor END) solv, MAX(CASE WHEN d.IndicadorFinID=2 THEN d.Valor END) ptp, MAX(CASE WHEN d.IndicadorFinID=4 THEN d.Valor END) ptc FROM IndicadorData d JOIN p ON d.FechaID=p.corte GROUP BY d.IFIID),
ref AS (SELECT s.act FROM s JOIN p ON s.IFIID=p.ifi),
c AS (SELECT i.IFIID, i.Nombre, s.act, s.pat, s.dep, s.fd, s.dep_cp, s.cbruta, s.improd, s.prov, s.res, s.gop, n.solv, n.ptp, n.ptc, ROW_NUMBER() OVER (ORDER BY ABS(LOG(s.act/ref.act))) cerc FROM Ifi i JOIN p ON i.TipoEntidad=p.tipo JOIN s ON s.IFIID=i.IFIID LEFT JOIN ind n ON n.IFIID=i.IFIID CROSS JOIN ref WHERE s.act>0),
m AS (SELECT MONTH(DATEADD(day,corte,'1950-01-01')) mm, CONVERT(char(7),DATEADD(day,corte,'1950-01-01'),126) mes, ifi, tipo FROM p)
SELECT c.Nombre nombre, CASE WHEN c.IFIID=m.ifi THEN 1 ELSE 0 END es_entidad, m.mes, m.tipo tipo_ent, CAST(c.act/1e6 AS decimal(12,1)) act_mm, CAST(c.dep/1e6 AS decimal(12,1)) dep_mm, CAST(c.cbruta/1e6 AS decimal(12,1)) cartera_mm, CAST(c.improd/NULLIF(c.cbruta,0)*100 AS decimal(6,2)) moro_pct, CAST(c.prov/NULLIF(c.improd,0)*100 AS decimal(7,1)) cobert_pct, CAST(c.solv*100 AS decimal(6,2)) solv_pct, CAST(c.ptp/NULLIF(c.ptc,0)*100 AS decimal(6,1)) ptp_ptc_pct, CAST(c.ptc/c.act*100 AS decimal(6,2)) ptc_act_pct, CAST(c.fd/NULLIF(c.dep_cp,0)*100 AS decimal(7,1)) liq_pct, CAST(c.cbruta/NULLIF(c.dep,0)*100 AS decimal(7,1)) cart_dep_pct, CAST(c.res/c.act*1200/m.mm AS decimal(6,2)) roa_pct, CAST(c.res/NULLIF(c.pat,0)*1200/m.mm AS decimal(7,2)) roe_pct, CAST(c.gop/c.act*1200/m.mm AS decimal(6,2)) gop_act_pct FROM c CROSS JOIN m WHERE c.cerc<=11 ORDER BY c.act DESC`;

const SQL_SOLV = BASE + `,
f AS (SELECT d.FechaID FROM IndicadorData d JOIN p ON d.IFIID=p.ifi WHERE d.IndicadorFinID=5 AND d.FechaID BETWEEN p.c12 AND p.corte),
ind AS (SELECT d.FechaID, MAX(CASE WHEN d.IndicadorFinID=1 THEN d.Valor END) apr, MAX(CASE WHEN d.IndicadorFinID=2 THEN d.Valor END) ptp, MAX(CASE WHEN d.IndicadorFinID=4 THEN d.Valor END) ptc, MAX(CASE WHEN d.IndicadorFinID=5 THEN d.Valor END) solv FROM IndicadorData d JOIN p ON d.IFIID=p.ifi WHERE d.FechaID IN (SELECT FechaID FROM f) GROUP BY d.FechaID),
bal AS (SELECT b.FechaID, SUM(CASE WHEN b.CuentaID=1 THEN b.Saldo END) act, SUM(CASE WHEN b.CuentaID=3 THEN b.Saldo END) pat, SUM(CASE WHEN b.CuentaID=5 THEN b.Saldo WHEN b.CuentaID=4 THEN -b.Saldo END) res, SUM(CASE WHEN b.CuentaID BETWEEN 1401 AND 1496 THEN b.Saldo END) cbruta, SUM(CASE WHEN b.CuentaID=1499 THEN -b.Saldo END) prov, SUM(CASE WHEN b.CuentaID BETWEEN 1425 AND 1472 OR b.CuentaID IN (1479,1481,1483,1485,1487,1489) THEN b.Saldo END) improd FROM B11 b JOIN p ON b.IFIID=p.ifi WHERE b.FechaID IN (SELECT FechaID FROM f) AND (b.CuentaID IN (1,3,4,5,1499) OR b.CuentaID BETWEEN 1401 AND 1496) GROUP BY b.FechaID)
SELECT CONVERT(char(7), DATEADD(day, i.FechaID, '1950-01-01'), 126) mes, CAST(i.solv*100 AS decimal(6,2)) solv_pct, CAST(i.ptc/1e6 AS decimal(12,2)) ptc_mm, CAST(i.ptp/NULLIF(i.ptc,0)*100 AS decimal(6,1)) ptp_ptc_pct, CAST(i.apr/1e6 AS decimal(12,2)) apr_mm, CAST(i.apr/NULLIF(b.act,0)*100 AS decimal(6,1)) densidad_pct, CAST(b.act/1e6 AS decimal(12,2)) act_mm, CAST(b.pat/1e6 AS decimal(12,2)) pat_mm, CAST(b.res/1e6 AS decimal(12,2)) res_ytd_mm, CAST(b.improd/NULLIF(b.cbruta,0)*100 AS decimal(6,2)) moro_pct, CAST(b.prov/NULLIF(b.improd,0)*100 AS decimal(7,1)) cobert_pct, CAST((b.improd-b.prov)/NULLIF(i.ptc,0)*100 AS decimal(7,1)) descub_ptc_pct FROM ind i JOIN bal b ON b.FechaID=i.FechaID ORDER BY i.FechaID`;

const SEGV = [['productivo', [1401, 1409, 1417, 1425, 1433, 1441, 1449, 1457, 1465, 149905]], ['consumo', [1402, 1410, 1418, 1426, 1434, 1442, 1450, 1458, 1466, 149910]], ['inmobiliario', [1403, 1411, 1419, 1427, 1435, 1443, 1451, 1459, 1467, 149915]], ['microcredito', [1404, 1412, 1420, 1428, 1436, 1444, 1452, 1460, 1468, 149920]], ['vivienda', [1408, 1416, 1424, 1432, 1440, 1448, 1456, 1464, 1472, 149940]], ['educativo', [1473, 1475, 1477, 1479, 1481, 1483, 1485, 1487, 1489, 149955]]];
const EST = ['v', 'v', 'v', 'n', 'n', 'n', 'x', 'x', 'x', 'p'], MOD = ['o', 'f', 'e', 'o', 'f', 'e', 'o', 'f', 'e', 'o'];
const VALORES = SEGV.flatMap(([s, ctas]) => ctas.map((c, i) => `(${c},'${s}','${EST[i]}','${MOD[i]}')`)).concat(["(1499,'total','p','o')"]).join(',');
const SQL_CARTERA = BASE + `,
m AS (SELECT * FROM (VALUES ${VALORES}) v(cta,seg,est,mod))
SELECT CONVERT(char(7),DATEADD(day,b.FechaID,'1950-01-01'),126) mes, m.seg, CAST(SUM(CASE WHEN m.est='v' THEN b.Saldo END)/1e6 AS decimal(12,2)) vencer_mm, CAST(SUM(CASE WHEN m.est='n' THEN b.Saldo END)/1e6 AS decimal(12,2)) nodev_mm, CAST(SUM(CASE WHEN m.est='x' THEN b.Saldo END)/1e6 AS decimal(12,2)) vencida_mm, CAST(SUM(CASE WHEN m.est='p' THEN -b.Saldo END)/1e6 AS decimal(12,2)) prov_mm, CAST(SUM(CASE WHEN m.mod='f' AND m.est<>'p' THEN b.Saldo END)/1e6 AS decimal(12,2)) refin_mm, CAST(SUM(CASE WHEN m.mod='e' AND m.est<>'p' THEN b.Saldo END)/1e6 AS decimal(12,2)) reestr_mm
FROM B11 b JOIN p ON b.IFIID=p.ifi AND b.FechaID BETWEEN p.c12 AND p.corte JOIN m ON m.cta=b.CuentaID GROUP BY b.FechaID, m.seg ORDER BY b.FechaID, m.seg`;

const SQL_RENT = BASE + `
SELECT CASE b.FechaID WHEN p.corte THEN 'actual' ELSE 'anterior' END per, CAST(b.CuentaID AS int) cuenta, CAST(b.Saldo/1e6 AS decimal(14,3)) saldo_mm FROM B11 b JOIN p ON b.IFIID=p.ifi AND b.FechaID IN (p.corte,p.c12) WHERE b.CuentaID IN (1,3,4,5,41,42,43,44,45,46,47,48,51,52,53,54,55,56,4501,4101,5104)`;

const LIQ_CTAS = [['act_mm', 1], ['fd_mm', 11], ['inv_mm', 13], ['cart_neta_mm', 14], ['dep_mm', 21], ['vista_mm', 2101], ['plazo_mm', 2103], ['p30_mm', 210305], ['p90_mm', 210310], ['p180_mm', 210315], ['p360_mm', 210320], ['pmas_mm', 210325], ['oblig_fin_mm', 26]];
const SQL_LIQ = BASE + `
SELECT CONVERT(char(7),DATEADD(day,b.FechaID,'1950-01-01'),126) mes, ${LIQ_CTAS.map(([a, c]) => `CAST(SUM(CASE WHEN b.CuentaID=${c} THEN b.Saldo END)/1e6 AS decimal(12,2)) ${a}`).join(', ')}
FROM B11 b JOIN p ON b.IFIID=p.ifi AND b.FechaID BETWEEN p.c12 AND p.corte WHERE b.CuentaID IN (${LIQ_CTAS.map(x => x[1]).join(',')}) GROUP BY b.FechaID ORDER BY b.FechaID`;

const SQL_MERC = BASE + `,
s AS (SELECT b.FechaID, b.IFIID, b.CuentaID, b.Saldo FROM B11 b JOIN p ON b.FechaID IN (p.corte,p.c12) JOIN Ifi i ON i.IFIID=b.IFIID AND i.TipoEntidad=p.tipo WHERE b.CuentaID IN (1,14,21,3) AND b.Saldo>0),
r AS (SELECT s.FechaID, s.IFIID, s.CuentaID, s.Saldo, RANK() OVER (PARTITION BY s.FechaID, s.CuentaID ORDER BY s.Saldo DESC) pos, COUNT(*) OVER (PARTITION BY s.FechaID, s.CuentaID) n, SUM(s.Saldo) OVER (PARTITION BY s.FechaID, s.CuentaID) total FROM s),
e AS (SELECT r.CuentaID, r.FechaID, r.pos FROM r JOIN p ON r.IFIID=p.ifi)
SELECT CASE r.FechaID WHEN p.corte THEN 'actual' ELSE 'anterior' END per, CAST(r.CuentaID AS int) cuenta, i.Nombre nombre, CASE WHEN r.IFIID=p.ifi THEN 1 ELSE 0 END es_entidad, r.pos, r.n, CAST(r.Saldo/1e6 AS decimal(12,1)) saldo_mm, CAST(r.Saldo/r.total*100 AS decimal(6,2)) part_pct, CAST(r.total/1e6 AS decimal(14,1)) total_mm
FROM r CROSS JOIN p JOIN Ifi i ON i.IFIID=r.IFIID JOIN e ON e.CuentaID=r.CuentaID AND e.FechaID=r.FechaID WHERE r.pos<=5 OR ABS(r.pos-e.pos)<=2 ORDER BY per, cuenta, r.pos`;

const SQL_ESTR = BASE + `
SELECT CASE b.FechaID WHEN p.corte THEN 'actual' ELSE 'anterior' END per, CAST(b.CuentaID AS int) cuenta, c.Nombre nombre, CAST(b.Saldo/1e6 AS decimal(14,2)) saldo_mm FROM B11 b JOIN p ON b.IFIID=p.ifi AND b.FechaID IN (p.corte,p.c12) JOIN Cuenta c ON c.CuentaID=b.CuentaID WHERE b.CuentaID IN (1,2,3,4,5) OR b.CuentaID BETWEEN 11 AND 39`;

const SQL_RES = BASE + `,
s AS (SELECT b.FechaID, ${AGG} FROM B11 b JOIN p ON b.IFIID=p.ifi AND b.FechaID BETWEEN p.c12 AND p.corte WHERE ${AGG_WHERE} GROUP BY b.FechaID),
ind AS (SELECT d.FechaID, MAX(CASE WHEN d.IndicadorFinID=5 THEN d.Valor END) solv FROM IndicadorData d JOIN p ON d.IFIID=p.ifi AND d.FechaID BETWEEN p.c12 AND p.corte GROUP BY d.FechaID)
SELECT CASE s.FechaID WHEN p.corte THEN 'actual' WHEN p.c1 THEN 'mes_anterior' WHEN p.c12 THEN 'anio_anterior' ELSE 'serie' END per, CONVERT(char(7),DATEADD(day,s.FechaID,'1950-01-01'),126) mes, MONTH(DATEADD(day,s.FechaID,'1950-01-01')) mm, CAST(s.act/1e6 AS decimal(12,2)) act_mm, CAST(s.cbruta/1e6 AS decimal(12,2)) cartera_mm, CAST(s.dep/1e6 AS decimal(12,2)) dep_mm, CAST(s.pat/1e6 AS decimal(12,2)) pat_mm, CAST(s.res/1e6 AS decimal(12,3)) res_mm, CAST(s.gop/1e6 AS decimal(12,3)) gop_mm, CAST(s.improd/NULLIF(s.cbruta,0)*100 AS decimal(6,2)) moro_pct, CAST(s.prov/NULLIF(s.improd,0)*100 AS decimal(7,1)) cobert_pct, CAST(s.fd/NULLIF(s.dep_cp,0)*100 AS decimal(7,1)) liq_pct, CAST(ind.solv*100 AS decimal(6,2)) solv_pct FROM s CROSS JOIN p LEFT JOIN ind ON ind.FechaID=s.FechaID ORDER BY s.FechaID`;

// ---------- Fichas por tipo ----------
const A_SOLV = String.raw`
const f = $('SQL Solvencia').all().map(i => num(i.json));
const u = f[f.length - 1], a = f.length >= 13 ? f[0] : null;
const comp = (k, d = 2) => ({ actual: u[k], hace12m: a ? a[k] : null, delta: (a && u[k] != null && a[k] != null) ? r(u[k] - a[k], d) : null, var_pct: (a && a[k] && u[k] != null) ? r((u[k] / a[k] - 1) * 100, 1) : null });
const saltos = [];
for (let i = 1; i < f.length; i++) { const d = f[i].solv_pct - f[i - 1].solv_pct; if (Math.abs(d) > 2) saltos.push({ mes: f[i].mes, desde: f[i - 1].mes, delta_pp: r(d, 2), delta_ptc_mm: r(f[i].ptc_mm - f[i - 1].ptc_mm, 1), delta_apr_mm: r(f[i].apr_mm - f[i - 1].apr_mm, 1), ptp_ptc_antes: f[i - 1].ptp_ptc_pct, ptp_ptc_despues: f[i].ptp_ptc_pct }); }
const bajo = f.filter(x => x.solv_pct != null && x.solv_pct < 9).map(x => ({ mes: x.mes, solvencia_pct: x.solv_pct }));
const caida = a ? u.solv_pct - a.solv_pct : 0;
const sem = u.solv_pct < 9 ? 'r' : (u.solv_pct < 12 || caida < -2) ? 'a' : 'v';
let motivo = u.solv_pct < 9 ? 'bajo el mínimo normativo de 9 %' : u.solv_pct < 12 ? 'entre 9 % y 12 %: colchón estrecho' : caida < -2 ? 'caída de más de 2 p.p. en 12 meses' : 'sobre 12 % y estable o al alza';
if (bajo.length && u.solv_pct >= 9) motivo += '; estuvo bajo el 9 % en ' + bajo.map(x => x.mes).join(', ');
const pt = comp('ptc_mm'), ap = comp('apr_mm'), so = comp('solv_pct'), pp = comp('ptp_ptc_pct', 1), de = comp('descub_ptc_pct', 1);
let causa = null;
if (pt.var_pct != null && ap.var_pct != null) causa = (pt.var_pct < 0 && ap.var_pct > 0) ? 'cae el PTC y crecen los APR' : (pt.var_pct >= 0 && ap.var_pct <= 0) ? 'crece el PTC y bajan los APR' : pt.var_pct >= 0 ? (ap.var_pct > pt.var_pct ? 'ambos crecen, los APR más que el PTC' : 'ambos crecen, el PTC más que los APR') : (ap.var_pct < pt.var_pct ? 'ambos bajan, los APR más que el PTC' : 'ambos bajan, el PTC más que los APR');
const notas = [];
const resDudoso = u.res_ytd_mm == null || (Math.abs(u.res_ytd_mm) < 0.01 && u.pat_mm > 1);
if (resDudoso) notas.push('A VERIFICAR: resultado del ejercicio ≈ 0 o sin datos en la base (ingresos ≈ gastos); posible registro del excedente dentro de gastos.');
const P = pares('solv_pct', true, [['solv_pct', 'Solvencia', 2, '%'], ['ptp_ptc_pct', 'PTP/PTC', 1, '%'], ['ptc_act_pct', 'PTC/Activo', 2, '%']]);
return salida({
  tipo: 'solvencia', titulo: 'Informe de Solvencia y Suficiencia Patrimonial', sem, semaforo: { color: SEM[sem], motivo }, notas,
  kpis: [K('Solvencia', u.solv_pct, '%', 2, so.delta, 'p.p.'), K('PTC (USD M)', u.ptc_mm, 'USD M', 1, pt.delta, 'M'), K('PTP / PTC', u.ptp_ptc_pct, '%', 1, pp.delta, 'p.p.'), K('Descubierta / PTC', u.descub_ptc_pct, '%', 1, de.delta, 'p.p.', true)],
  graficos: {
    evolucion: [G('linea', 'Solvencia', '%', f.map(x => x.mes), [{ nombre: 'Solvencia', datos: f.map(x => x.solv_pct) }], { referencias: [{ valor: 9, etiqueta: 'Mínimo 9 %' }, { valor: 12, etiqueta: 'Holgura 12 %' }], decimales: 2 }),
      G('barras', 'Patrimonio técnico constituido', 'USD M', f.map(x => x.mes), [{ nombre: 'PTC', datos: f.map(x => x.ptc_mm) }], { decimales: 1 })],
    pares: [graficoPares('solv_pct', 'Solvencia', '%', true, 2)] },
  secciones: [
    { clave: 'evolucion', titulo: 'Evolución de 13 meses', guia: '2-3 frases: causa_principal (PTC frente a APR), saltos mensuales y meses bajo el 9 %', tablas: [{ cols: ['Mes', 'Solvencia', 'PTC M', 'APR M', 'Densidad', 'PTP/PTC', 'Morosidad', 'Cobertura'], rows: f.map(x => [x.mes, pc(x.solv_pct, 2), fmt(x.ptc_mm, 1), fmt(x.apr_mm, 1), pc(x.densidad_pct, 1), pc(x.ptp_ptc_pct, 1), pc(x.moro_pct, 2), pc(x.cobert_pct, 1)]), yo: [f.length - 1] }] },
    { clave: 'calidad', titulo: 'Calidad y generación de capital', guia: '2-3 frases: PTP/PTC (si sube mientras cae el PTC es porque bajó el secundario), generación interna y cartera descubierta', tablas: [] },
    { clave: 'pares', titulo: 'Posición frente a pares', guia: '2 frases: posición, brecha frente a la mediana, PTP/PTC y PTC/activo frente a la mediana', tablas: [P.tabla] }],
  glosario: 'Solvencia = PTC / APR. PTC = patrimonio técnico constituido = primario (PTP) + secundario. APR = activos ponderados por riesgo (no es el activo total). PTP/PTC = proporción de capital primario en el PTC (no tiene relación con provisiones); > 100 % = el patrimonio secundario es negativo (deducciones que restan); nunca digas que el primario es negativo. Densidad = APR / activo. Descubierta/PTC negativa = provisiones superan la cartera improductiva. Mínimo normativo 9 %.',
  ficha: { solvencia_pct: so, ptc_musd: pt, apr_musd: ap, activo_musd: comp('act_mm'), causa_principal: causa, densidad_pct: comp('densidad_pct', 1), ptp_sobre_ptc_pct: pp, secundario_negativo: u.ptp_ptc_pct > 100, descubierta_sobre_ptc_pct: de, cobertura_pct: comp('cobert_pct', 1), morosidad_pct: comp('moro_pct'), resultado_acumulado_anio_musd: resDudoso ? { nota: 'A VERIFICAR' } : { actual: u.res_ytd_mm, mismo_mes_anio_anterior: a ? a.res_ytd_mm : null }, rentabilidad_patrimonial_anualizada_pct: (!resDudoso && u.pat_mm) ? r(u.res_ytd_mm / u.pat_mm * 12 / mm * 100, 1) : null, saltos_mensuales_mayores_2pp: saltos, meses_bajo_minimo_9pct: bajo, pares: P.resumen }
});`;

const A_CART = String.raw`
const rows = $('SQL Cartera').all().map(i => num(i.json));
const SEGS = ['productivo', 'consumo', 'inmobiliario', 'microcredito', 'vivienda', 'educativo'];
const LBL = { productivo: 'Productivo', consumo: 'Consumo', inmobiliario: 'Inmobiliario', microcredito: 'Microcrédito', vivienda: 'Vivienda interés social', educativo: 'Educativo' };
const meses = [...new Set(rows.map(x => x.mes))].sort();
const agg = mes => { const t = { mes, bruta: 0, improd: 0, refin: 0, reestr: 0, prov_total: null }, seg = {};
  for (const x of rows.filter(y => y.mes === mes)) {
    if (x.seg === 'total') { t.prov_total = x.prov_mm; continue; }
    const b = (x.vencer_mm || 0) + (x.nodev_mm || 0) + (x.vencida_mm || 0), im = (x.nodev_mm || 0) + (x.vencida_mm || 0);
    seg[x.seg] = { bruta: b, improd: im, prov: x.prov_mm || 0 };
    t.bruta += b; t.improd += im; t.refin += x.refin_mm || 0; t.reestr += x.reestr_mm || 0; }
  t.moro = t.bruta ? t.improd / t.bruta * 100 : null; t.cob = (t.improd && t.prov_total != null) ? t.prov_total / t.improd * 100 : null; t.reprog = t.bruta ? (t.refin + t.reestr) / t.bruta * 100 : null;
  return { t, seg }; };
const serie = meses.map(agg);
const U = serie[serie.length - 1], A = serie.length >= 13 ? serie[0] : null;
const segs = SEGS.filter(s => U.seg[s] && U.seg[s].bruta > 0).map(s => { const u = U.seg[s], a = A && A.seg[s];
  const mo = u.bruta ? u.improd / u.bruta * 100 : null, moA = (a && a.bruta) ? a.improd / a.bruta * 100 : null;
  return { segmento: LBL[s], cartera_musd: r(u.bruta, 1), peso_pct: r(u.bruta / U.t.bruta * 100, 1), morosidad_pct: r(mo, 2), morosidad_hace12m_pct: r(moA, 2), delta_pp: (mo != null && moA != null) ? r(mo - moA, 2) : null, cobertura_pct: u.improd ? r(u.prov / u.improd * 100, 1) : null }; });
const peor = [...segs].filter(s => s.delta_pp != null && s.delta_pp > 0 && s.peso_pct >= 1).sort((x, y) => y.delta_pp - x.delta_pp)[0] || null;
const P = pares('moro_pct', false, [['moro_pct', 'Morosidad', 2, '%'], ['cobert_pct', 'Cobertura', 1, '%'], ['cartera_mm', 'Cartera M', 1, '']]);
const dMoro = A ? U.t.moro - A.t.moro : 0;
const sem = ((P.resumen.mediana != null && U.t.moro > P.resumen.mediana + 2) || (U.t.cob != null && U.t.cob < 100)) ? 'r' : dMoro > 1 ? 'a' : 'v';
const motivo = sem === 'r' ? ((U.t.cob != null && U.t.cob < 100) ? 'la cobertura está bajo el 100 %' : 'la morosidad supera en más de 2 p.p. a la mediana de pares') : sem === 'a' ? 'la morosidad subió más de 1 p.p. en 12 meses' : 'morosidad estable o a la baja y cobertura sobre 100 %';
return salida({
  tipo: 'calidad_cartera', titulo: 'Informe de Calidad de Cartera, Morosidad y Cobertura', sem, semaforo: { color: SEM[sem], motivo },
  notas: ['Los castigos de cartera no están en la base: no se calcula la morosidad ajustada por castigos.', 'Cobertura total = provisiones totales (cuenta 1499, incluye genéricas) / cartera improductiva; por segmento, solo las provisiones específicas del segmento.'],
  kpis: [K('Morosidad', U.t.moro, '%', 2, A ? dMoro : null, 'p.p.', true), K('Cobertura', U.t.cob, '%', 1, A ? U.t.cob - A.t.cob : null, 'p.p.'), K('Cartera improductiva (USD M)', U.t.improd, 'USD M', 1, A ? U.t.improd - A.t.improd : null, 'M', true), K('Refinanciada + reestructurada', U.t.reprog, '%', 2, A ? U.t.reprog - A.t.reprog : null, 'p.p.', true)],
  graficos: {
    evolucion: [G('linea', 'Morosidad de la cartera', '%', serie.map(x => x.t.mes), [{ nombre: 'Morosidad', datos: serie.map(x => r(x.t.moro, 2)) }], { decimales: 2 }),
      G('linea', 'Cobertura de la cartera improductiva', '%', serie.map(x => x.t.mes), [{ nombre: 'Cobertura', datos: serie.map(x => r(x.t.cob, 1)) }], { referencias: [{ valor: 100, etiqueta: '100 %' }], decimales: 1 })],
    segmentos: [G('barras', 'Morosidad por segmento', '%', segs.map(x => x.segmento), [{ nombre: anterior, datos: segs.map(x => x.morosidad_hace12m_pct) }, { nombre: corte, datos: segs.map(x => x.morosidad_pct) }], { decimales: 2 })],
    pares: [graficoPares('moro_pct', 'Morosidad', '%', false, 2)] },
  secciones: [
    { clave: 'evolucion', titulo: 'Evolución de 13 meses', guia: '2-3 frases: tendencia de la morosidad y la cobertura, y de la cartera reprogramada', tablas: [{ cols: ['Mes', 'Cartera bruta M', 'Improductiva M', 'Morosidad', 'Cobertura', 'Refin.+reestr.'], rows: serie.map(x => [x.t.mes, fmt(x.t.bruta, 1), fmt(x.t.improd, 1), pc(x.t.moro, 2), pc(x.t.cob, 1), pc(x.t.reprog, 2)]), yo: [serie.length - 1] }] },
    { clave: 'segmentos', titulo: 'Morosidad y cobertura por segmento', guia: '2-3 frases: segmento con mayor deterioro (segmento_mayor_deterioro; si ningun_segmento_empeoro es true, dilo: todos mejoraron o se mantuvieron), dónde se concentra la cartera y qué segmentos tienen cobertura baja', tablas: [{ cols: ['Segmento', 'Cartera M', 'Peso', 'Morosidad', 'Hace 12 m', 'Δ p.p.', 'Cobertura seg.'], rows: segs.map(s => [s.segmento, fmt(s.cartera_musd, 1), pc(s.peso_pct, 1), pc(s.morosidad_pct, 2), pc(s.morosidad_hace12m_pct, 2), sg(s.delta_pp, 2), pc(s.cobertura_pct, 1)]) }] },
    { clave: 'pares', titulo: 'Posición frente a pares', guia: '2 frases: posición en morosidad (menor es mejor), brecha frente a la mediana y cobertura frente a la mediana', tablas: [P.tabla] }],
  glosario: 'Morosidad = cartera improductiva (no devenga + vencida) / cartera bruta; menor es mejor. Cobertura = provisiones / cartera improductiva; mayor es mejor. Cartera reprogramada = refinanciada + reestructurada: si crece mientras baja la morosidad, la mejora puede ser aparente. Si baja la morosidad y suben los castigos, no es mejora (los castigos no están disponibles: dilo si es relevante).',
  ficha: { total: { morosidad_pct: r(U.t.moro, 2), morosidad_hace12m_pct: A ? r(A.t.moro, 2) : null, cobertura_pct: r(U.t.cob, 1), cobertura_hace12m_pct: A ? r(A.t.cob, 1) : null, cartera_bruta_musd: r(U.t.bruta, 1), improductiva_musd: r(U.t.improd, 1), reprogramada_pct: r(U.t.reprog, 2), reprogramada_hace12m_pct: A ? r(A.t.reprog, 2) : null }, segmentos: segs, segmento_mayor_deterioro: peor, ningun_segmento_empeoro: !peor, pares: P.resumen }
});`;

const A_RENT = String.raw`
const rows = $('SQL Rentabilidad').all().map(i => num(i.json));
const A = {}, B = {};
for (const x of rows) (x.per === 'actual' ? A : B)[x.cuenta] = x.saldo_mm;
const v = (m, k) => m[k] || 0;
const cas = m => { const mni = v(m, 51) - v(m, 41); const mbf = mni + v(m, 52) + v(m, 53) + v(m, 54) - v(m, 42) - v(m, 43); const mnf = mbf - v(m, 44); const mi = mnf - v(m, 45); const mo = mi + v(m, 55) - v(m, 46); const rai = mo + v(m, 56) - v(m, 47); const rn = rai - v(m, 48);
  return { ingresos_intereses: v(m, 51), gastos_intereses: v(m, 41), margen_neto_intereses: mni, margen_bruto_financiero: mbf, provisiones: v(m, 44), margen_neto_financiero: mnf, gastos_operacion: v(m, 45), gastos_personal: v(m, 4501), margen_intermediacion: mi, margen_operacional: mo, resultado_antes_impuestos: rai, impuestos_participaciones: v(m, 48), resultado_neto: rn, resultado_libro: v(m, 5) - v(m, 4) }; };
const ca = cas(A), cb = cas(B);
const an = x => x * 12 / mm;
const roa = (c, m) => m[1] ? an(c.resultado_neto) / m[1] * 100 : null, roe = (c, m) => m[3] ? an(c.resultado_neto) / m[3] * 100 : null;
const absor = c => c.margen_neto_financiero ? c.gastos_operacion / c.margen_neto_financiero * 100 : null;
const resDudoso = Math.abs(ca.resultado_libro) < 0.01 && v(A, 5) > 1;
const notas = ['ROA y ROE anualizados sobre saldos al corte (no promedios); el patrimonio contable no incluye el resultado del año en curso.'];
if (resDudoso) notas.push('A VERIFICAR: ingresos ≈ gastos en la base (resultado ≈ 0); posible registro del excedente dentro de gastos. No concluir que la rentabilidad es nula.');
const comps = [['Margen neto de intereses', c => c.margen_neto_intereses], ['Otros ingresos financieros netos', c => c.margen_bruto_financiero - c.margen_neto_intereses], ['Provisiones', c => -c.provisiones], ['Gastos de operación', c => -c.gastos_operacion], ['Otros e impuestos', c => c.resultado_neto - c.margen_intermediacion]];
const fact = comps.map(([n, fn]) => { const pa = A[1] ? an(fn(ca)) / A[1] * 100 : null, pb = B[1] ? an(fn(cb)) / B[1] * 100 : null; return { componente: n, pct_activo: r(pa, 2), pct_activo_hace12m: r(pb, 2), delta_pp: (pa != null && pb != null) ? r(pa - pb, 2) : null }; });
const top = [...fact].filter(x => x.delta_pp != null).sort((x, y) => Math.abs(y.delta_pp) - Math.abs(x.delta_pp)).slice(0, 3);
const P = pares('roe_pct', true, [['roa_pct', 'ROA', 2, '%'], ['roe_pct', 'ROE', 2, '%'], ['gop_act_pct', 'Gasto op./Activo', 2, '%']]);
const ROE = roe(ca, A), ROA = roa(ca, A), AB = absor(ca);
const sem = resDudoso ? 'a' : ((AB != null && AB > 100) || ROE < 0) ? 'r' : (P.resumen.mediana != null && ROE < P.resumen.mediana) ? 'a' : 'v';
const motivo = resDudoso ? 'resultado a verificar en la base' : (AB != null && AB > 100) ? 'los gastos de operación superan el margen neto financiero' : ROE < 0 ? 'pérdida en el ejercicio' : sem === 'a' ? 'ROE por debajo de la mediana de pares' : 'ROE sobre la mediana y absorción menor a 100 %';
const L = [['Ingresos por intereses', 'ingresos_intereses'], ['(−) Gastos por intereses', 'gastos_intereses'], ['= Margen neto de intereses', 'margen_neto_intereses'], ['= Margen bruto financiero', 'margen_bruto_financiero'], ['(−) Provisiones', 'provisiones'], ['= Margen neto financiero', 'margen_neto_financiero'], ['(−) Gastos de operación', 'gastos_operacion'], ['    de ellos, personal', 'gastos_personal'], ['= Margen de intermediación', 'margen_intermediacion'], ['= Margen operacional', 'margen_operacional'], ['(−) Impuestos y participaciones', 'impuestos_participaciones'], ['= Resultado neto', 'resultado_neto']];
const red = o => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, r(x, 2)]));
return salida({
  tipo: 'rentabilidad', titulo: 'Informe de Rentabilidad y Eficiencia', sem, semaforo: { color: SEM[sem], motivo }, notas,
  kpis: [K('ROE anualizado', ROE, '%', 2, ROE - roe(cb, B), 'p.p.'), K('ROA anualizado', ROA, '%', 2, ROA - roa(cb, B), 'p.p.'), K('Absorción del margen', AB, '%', 1, AB - absor(cb), 'p.p.', true), K('Resultado del año (USD M)', ca.resultado_neto, 'USD M', 2, ca.resultado_neto - cb.resultado_neto, 'M')],
  graficos: {
    cascada: [G('barras', 'Márgenes y resultado acumulado', 'USD M', ['Margen neto de intereses', 'Margen bruto financiero', 'Margen neto financiero', 'Margen de intermediación', 'Resultado neto'], [{ nombre: anterior, datos: [cb.margen_neto_intereses, cb.margen_bruto_financiero, cb.margen_neto_financiero, cb.margen_intermediacion, cb.resultado_neto].map(x => r(x, 2)) }, { nombre: corte, datos: [ca.margen_neto_intereses, ca.margen_bruto_financiero, ca.margen_neto_financiero, ca.margen_intermediacion, ca.resultado_neto].map(x => r(x, 2)) }], { decimales: 2 })],
    factores: [G('barras', 'Componentes del ROA (% del activo, anualizado)', '%', fact.map(x => x.componente), [{ nombre: anterior, datos: fact.map(x => x.pct_activo_hace12m) }, { nombre: corte, datos: fact.map(x => x.pct_activo) }], { decimales: 2 })],
    pares: [graficoPares('roe_pct', 'ROE', '%', true, 2)] },
  secciones: [
    { clave: 'cascada', titulo: 'Estado de resultados acumulado (USD M)', guia: '2-3 frases: de dónde sale el resultado y qué partida pesa más', tablas: [{ cols: ['Concepto', corte, anterior, 'Δ', 'Δ %'], rows: L.map(([n, k]) => [n, fmt(ca[k], 2), fmt(cb[k], 2), sg(ca[k] - cb[k], 2), cb[k] ? sg((ca[k] / cb[k] - 1) * 100, 1) + ' %' : '–']) }] },
    { clave: 'factores', titulo: 'Qué movió la rentabilidad (% del activo, anualizado)', guia: '2 frases: los factores_principales que más explican el cambio del ROA frente al año anterior', tablas: [{ cols: ['Componente', corte, anterior, 'Δ p.p.'], rows: fact.map(x => [x.componente, pc(x.pct_activo, 2), pc(x.pct_activo_hace12m, 2), sg(x.delta_pp, 2)]) }] },
    { clave: 'pares', titulo: 'Posición frente a pares', guia: '2 frases: posición en ROE, brecha frente a la mediana y ROA/gasto operativo frente a la mediana', tablas: [P.tabla] }],
  glosario: 'Resultado acumulado del año (se reinicia en enero; se compara con el mismo mes del año anterior). ROA = resultado anualizado / activo. ROE = resultado anualizado / patrimonio. Absorción = gastos de operación / margen neto financiero: > 100 % significa que la operación no se paga con el margen. Margen neto financiero = margen bruto financiero − provisiones.',
  ficha: { actual: red(ca), hace12m: red(cb), roe_pct: r(ROE, 2), roe_hace12m_pct: r(roe(cb, B), 2), roa_pct: r(ROA, 2), roa_hace12m_pct: r(roa(cb, B), 2), absorcion_pct: r(AB, 1), absorcion_hace12m_pct: r(absor(cb), 1), factores_principales: top, resultado_a_verificar: resDudoso, pares: P.resumen }
});`;

const A_LIQ = String.raw`
const f = $('SQL Liquidez').all().map(i => num(i.json));
for (const x of f) { x.dep_cp = (x.vista_mm || 0) + (x.p30_mm || 0) + (x.p90_mm || 0); x.liq1 = x.dep_cp ? x.fd_mm / x.dep_cp * 100 : null; x.liq2 = x.dep_cp ? (x.fd_mm + (x.inv_mm || 0)) / x.dep_cp * 100 : null; x.conc = x.dep_mm ? x.dep_cp / x.dep_mm * 100 : null; x.cdep = x.dep_mm ? x.cart_neta_mm / x.dep_mm * 100 : null; }
const u = f[f.length - 1], a = f.length >= 13 ? f[0] : null;
const vars = []; for (let i = 1; i < f.length; i++) vars.push({ mes: f[i].mes, var_pct: r((f[i].dep_mm / f[i - 1].dep_mm - 1) * 100, 2) });
const peor = [...vars].filter(x => x.var_pct < 0).sort((x, y) => x.var_pct - y.var_pct)[0] || null;
const cubre = (peor && peor.var_pct < 0) ? r(u.fd_mm / (Math.abs(peor.var_pct) / 100 * u.dep_mm), 1) : null;
const P = pares('liq_pct', true, [['liq_pct', 'FD/Dep. CP', 1, '%'], ['cart_dep_pct', 'Cartera bruta/Dep.', 1, '%'], ['dep_mm', 'Depósitos M', 1, '']]);
const dl = a ? u.liq1 - a.liq1 : 0;
const sem = u.liq1 < 15 ? 'r' : ((P.resumen.mediana != null && u.liq1 < P.resumen.mediana) || dl < -5) ? 'a' : 'v';
const motivo = sem === 'r' ? 'liquidez de primera línea bajo 15 % (referencial)' : sem === 'a' ? ((P.resumen.mediana != null && u.liq1 < P.resumen.mediana) ? 'liquidez bajo la mediana de pares' : 'caída de más de 5 p.p. en 12 meses') : 'liquidez sobre la mediana de pares y estable';
const T = [['Vista (incluye ahorro)', 'vista_mm'], ['Plazo 1–30 días', 'p30_mm'], ['Plazo 31–90 días', 'p90_mm'], ['Plazo 91–180 días', 'p180_mm'], ['Plazo 181–360 días', 'p360_mm'], ['Plazo más de 360 días', 'pmas_mm']];
return salida({
  tipo: 'liquidez', titulo: 'Informe de Liquidez y Estructura de Fondeo', sem, semaforo: { color: SEM[sem], motivo },
  notas: ['Liquidez de primera línea = fondos disponibles / depósitos de corto plazo (vista + plazo hasta 90 días). La ampliada suma todas las inversiones, sin distinguir su liquidez real. No es el indicador regulatorio de liquidez estructural.'],
  kpis: [K('Liquidez 1.ª línea', u.liq1, '%', 1, a ? dl : null, 'p.p.'), K('Liquidez ampliada', u.liq2, '%', 1, a ? u.liq2 - a.liq2 : null, 'p.p.'), K('Depósitos ≤ 90 días', u.conc, '%', 1, a ? u.conc - a.conc : null, 'p.p.', true), K('Cartera neta / depósitos', u.cdep, '%', 1, a ? u.cdep - a.cdep : null, 'p.p.')],
  graficos: {
    evolucion: [G('linea', 'Liquidez', '%', f.map(x => x.mes), [{ nombre: 'Primera línea', datos: f.map(x => r(x.liq1, 1)) }, { nombre: 'Ampliada', datos: f.map(x => r(x.liq2, 1)) }], { decimales: 1 })],
    fondeo: [G('barras', 'Depósitos por plazo', 'USD M', T.map(t => t[0]), [{ nombre: anterior, datos: T.map(([, k]) => a ? a[k] : null) }, { nombre: corte, datos: T.map(([, k]) => u[k]) }], { decimales: 1 })],
    pares: [graficoPares('liq_pct', 'Liquidez 1.ª línea', '%', true, 1)] },
  secciones: [
    { clave: 'evolucion', titulo: 'Evolución de 13 meses (USD M)', guia: '2-3 frases: tendencia de la liquidez de primera línea y la ampliada, y qué la explica (fondos disponibles frente a inversiones y depósitos)', tablas: [{ cols: ['Mes', 'Fondos disp.', 'Inversiones', 'Depósitos', 'Dep. ≤ 90 d', 'Liq. 1.ª', 'Liq. ampliada'], rows: f.map(x => [x.mes, fmt(x.fd_mm, 1), fmt(x.inv_mm, 1), fmt(x.dep_mm, 1), fmt(x.dep_cp, 1), pc(x.liq1, 1), pc(x.liq2, 1)]), yo: [f.length - 1] }] },
    { clave: 'fondeo', titulo: 'Estructura de los depósitos por plazo', guia: '2 frases: concentración de corto plazo y peor caída mensual de depósitos con las veces que la cubren los fondos disponibles (si sin_caidas_mensuales_12m es true, di que los depósitos no cayeron ningún mes)', tablas: [{ cols: ['Tramo', 'Saldo M', '% depósitos', 'Hace 12 m', 'Δ %'], rows: T.map(([n, k]) => [n, fmt(u[k], 1), pc(u.dep_mm ? u[k] / u.dep_mm * 100 : null, 1), fmt(a ? a[k] : null, 1), (a && a[k]) ? sg((u[k] / a[k] - 1) * 100, 1) + ' %' : '–']) }] },
    { clave: 'pares', titulo: 'Posición frente a pares', guia: '2 frases: posición en liquidez, brecha frente a la mediana y cartera/depósitos frente a la mediana', tablas: [P.tabla] }],
  glosario: 'Liquidez de primera línea = fondos disponibles / depósitos de corto plazo (vista + plazo ≤ 90 días): mayor es mejor. Concentración de corto plazo alta = más riesgo de retiro. Cartera/depósitos > 100 % = la cartera se financia con algo más que depósitos. Veces que cubre = fondos disponibles / peor caída mensual de depósitos.',
  ficha: { liquidez_1a_pct: r(u.liq1, 1), liquidez_1a_hace12m_pct: a ? r(a.liq1, 1) : null, liquidez_ampliada_pct: r(u.liq2, 1), liquidez_ampliada_hace12m_pct: a ? r(a.liq2, 1) : null, depositos_musd: u.dep_mm, depositos_hace12m_musd: a ? a.dep_mm : null, concentracion_90d_pct: r(u.conc, 1), concentracion_90d_hace12m_pct: a ? r(a.conc, 1) : null, cartera_neta_sobre_depositos_pct: r(u.cdep, 1), ...(peor ? { peor_caida_mensual_depositos: peor, fondos_cubren_peor_caida_veces: cubre } : { sin_caidas_mensuales_12m: true }), obligaciones_financieras_musd: u.oblig_fin_mm, pares: P.resumen }
});`;

const A_MERC = String.raw`
const rows = $('SQL Mercado').all().map(i => num(i.json));
const RUB = { 1: 'Activos', 14: 'Cartera neta', 21: 'Depósitos', 3: 'Patrimonio' };
const res = [];
for (const c of [1, 14, 21, 3]) {
  const ea = rows.find(x => x.cuenta === c && x.per === 'actual' && x.es_entidad === 1), eb = rows.find(x => x.cuenta === c && x.per === 'anterior' && x.es_entidad === 1);
  if (!ea) continue;
  res.push({ rubro: RUB[c], posicion: ea.pos, posicion_hace12m: eb ? eb.pos : null, de: ea.n, saldo_musd: ea.saldo_mm, cuota_pct: ea.part_pct, cuota_hace12m_pct: eb ? eb.part_pct : null, delta_cuota_pp: eb ? r(ea.part_pct - eb.part_pct, 2) : null, crecimiento_entidad_pct: eb ? r((ea.saldo_mm / eb.saldo_mm - 1) * 100, 1) : null, crecimiento_grupo_pct: eb ? r((ea.total_mm / eb.total_mm - 1) * 100, 1) : null });
}
const pierde = res.filter(x => x.delta_cuota_pp != null && x.delta_cuota_pp < 0).length;
const act = res.find(x => x.rubro === 'Activos') || {};
const bajaPos = act.posicion_hace12m != null && act.posicion > act.posicion_hace12m;
const sem = (pierde >= 3 || bajaPos) ? 'a' : 'v';
const motivo = sem === 'a' ? (bajaPos ? 'perdió posiciones en activos' : 'perdió cuota en ' + pierde + ' de ' + res.length + ' rubros') : 'mantiene o gana cuota en la mayoría de rubros';
const grupo = { COOP: 'cooperativas', BP: 'bancos privados', MU: 'mutualistas', PU: 'entidades públicas' }[yo.tipo_ent] || 'entidades';
const top = rows.filter(x => x.cuenta === 1 && x.per === 'actual').sort((x, y) => x.pos - y.pos);
return salida({
  tipo: 'posicion_mercado', titulo: 'Informe de Posición de Mercado', sem, semaforo: { color: SEM[sem], motivo },
  notas: ['Grupo de comparación: todas las ' + grupo + ' del sistema con saldo al corte (' + (act.de || '–') + ' entidades). Las colocaciones (MOA/MOP) aún no están en la base.'],
  kpis: [K('Posición en activos', act.posicion, '', 0, act.posicion_hace12m != null ? act.posicion_hace12m - act.posicion : null, 'puestos', false, act.posicion != null ? act.posicion + ' de ' + act.de : '–'), K('Cuota en activos', act.cuota_pct, '%', 2, act.delta_cuota_pp, 'p.p.'), K('Crecimiento de activos', act.crecimiento_entidad_pct, '%', 1, null, '', false, null, 'grupo ' + pc(act.crecimiento_grupo_pct, 1)), K('Rubros con cuota ganada', res.length - pierde, '', 0, null, '', false, (res.length - pierde) + ' de ' + res.length, '12 meses')],
  graficos: {
    rubros: [G('barras', 'Cuota de mercado por rubro', '%', res.map(x => x.rubro), [{ nombre: anterior, datos: res.map(x => x.cuota_hace12m_pct) }, { nombre: corte, datos: res.map(x => x.cuota_pct) }], { decimales: 2 })],
    ranking: [G('barras_h', 'Activos (top 5 y entorno)', 'USD M', top.map(x => corto(x.nombre)), [{ nombre: 'Activos', datos: top.map(x => x.saldo_mm) }], { resaltar: corto(yo.nombre), decimales: 1 })] },
  secciones: [
    { clave: 'rubros', titulo: 'Posición y cuota por rubro', guia: '2-3 frases: dónde gana y dónde pierde cuota; distingue crecer de ganar cuota (crecimiento de la entidad frente al del grupo)', tablas: [{ cols: ['Rubro', 'Posición', 'Hace 12 m', 'Cuota', 'Δ cuota p.p.', 'Crec. entidad', 'Crec. grupo'], rows: res.map(x => [x.rubro, x.posicion + ' de ' + x.de, x.posicion_hace12m != null ? String(x.posicion_hace12m) : '–', pc(x.cuota_pct, 2), sg(x.delta_cuota_pp, 2), pc(x.crecimiento_entidad_pct, 1), pc(x.crecimiento_grupo_pct, 1)]) }] },
    { clave: 'ranking', titulo: 'Ranking de activos (top 5 y entorno de la entidad)', guia: '1-2 frases: quién lidera y a qué distancia está la entidad de la posición superior', tablas: [{ cols: ['Posición', 'Entidad', 'Activo M', 'Cuota'], rows: top.map(x => [String(x.pos), x.nombre, fmt(x.saldo_mm, 1), pc(x.part_pct, 2)]), yo: top.map((x, i) => x.es_entidad === 1 ? i : -1).filter(i => i >= 0) }] }],
  glosario: 'Cuota = saldo de la entidad / total del grupo. Ganar cuota exige crecer más que el grupo: una entidad puede crecer y aun así perder cuota. Posición 1 = la mayor.',
  ficha: { grupo: 'todas las ' + grupo + ' del sistema', rubros: res, lider_activos: top[0] ? { nombre: top[0].nombre, cuota_pct: top[0].part_pct } : null }
});`;

const A_ESTR = String.raw`
const rows = $('SQL Estructura').all().map(i => num(i.json));
const A = {}, B = {}, N = {};
for (const x of rows) { (x.per === 'actual' ? A : B)[x.cuenta] = x.saldo_mm; N[x.cuenta] = x.nombre; }
const v = (m, k) => m[k] || 0;
const nom = k => { const s = String(N[k] || ('Cuenta ' + k)).toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };
const ACT = [11, 12, 13, 14, 15, 16, 17, 18, 19], PAS = [21, 22, 23, 24, 25, 26, 27, 28, 29], PAT = [31, 32, 33, 34, 35, 36];
if (norm.tipo === 'fuentes_usos') {
  const fu = [], us = [];
  const add = (k, d, esActivo) => { if (Math.abs(d) < 0.005) return; const item = { concepto: (d > 0 ? 'Aumento de ' : 'Reducción de ') + nom(k).toLowerCase(), monto_musd: r(Math.abs(d), 2) }; if (esActivo ? d < 0 : d > 0) fu.push(item); else us.push(item); };
  ACT.forEach(k => add(k, v(A, k) - v(B, k), true));
  PAS.concat(PAT).forEach(k => add(k, v(A, k) - v(B, k), false));
  const dRes = (v(A, 5) - v(A, 4)) - (v(B, 5) - v(B, 4));
  if (Math.abs(dRes) >= 0.005) (dRes > 0 ? fu : us).push({ concepto: dRes > 0 ? 'Mayor resultado del ejercicio' : 'Menor resultado del ejercicio', monto_musd: r(Math.abs(dRes), 2) });
  fu.sort((x, y) => y.monto_musd - x.monto_musd); us.sort((x, y) => y.monto_musd - x.monto_musd);
  const tf = fu.reduce((s, x) => s + x.monto_musd, 0), tu = us.reduce((s, x) => s + x.monto_musd, 0);
  const tb = (l, t) => ({ cols: ['Concepto', 'USD M', '% del total'], rows: l.map(x => [x.concepto, fmt(x.monto_musd, 2), pc(t ? x.monto_musd / t * 100 : null, 1)]).concat([['Total', fmt(t, 2), '100 %']]), med: [l.length] });
  return salida({
    tipo: 'fuentes_usos', titulo: 'Informe de Fuentes y Usos de Fondos', sem: null, semaforo: { color: '', motivo: 'informe descriptivo, sin semáforo' }, maxPalabras: 300,
    notas: ['Variación de saldos entre ' + anterior + ' y ' + corte + '. Fuentes = aumentos de pasivo y patrimonio + disminuciones de activo + mejora del resultado; usos = lo contrario. Diferencia por redondeo: ' + fmt(tf - tu, 2) + ' M.'],
    kpis: [K('Total movilizado (USD M)', tf, 'USD M', 1, null, '', false, null, '12 meses'), K('Principal fuente', fu[0] ? fu[0].monto_musd : null, 'USD M', 1, null, '', false, fu[0] ? fu[0].concepto : '–', fu[0] ? fmt(fu[0].monto_musd, 1) + ' M' : ''), K('Principal uso', us[0] ? us[0].monto_musd : null, 'USD M', 1, null, '', false, us[0] ? us[0].concepto : '–', us[0] ? fmt(us[0].monto_musd, 1) + ' M' : ''), K('Crecimiento del activo', B[1] ? (A[1] / B[1] - 1) * 100 : null, '%', 1, v(A, 1) - v(B, 1), 'M')],
    graficos: {
      fuentes: [G('barras_h', 'Fuentes de fondos', 'USD M', fu.map(x => x.concepto), [{ nombre: 'Fuentes', datos: fu.map(x => x.monto_musd) }], { decimales: 1 })],
      usos: [G('barras_h', 'Usos de fondos', 'USD M', us.map(x => x.concepto), [{ nombre: 'Usos', datos: us.map(x => x.monto_musd) }], { decimales: 1 })] },
    secciones: [
      { clave: 'fuentes', titulo: 'Fuentes de fondos', guia: '2 frases: de dónde vinieron los recursos y qué tan dependiente es de depósitos frente a deuda o patrimonio', tablas: [tb(fu, tf)] },
      { clave: 'usos', titulo: 'Usos de fondos', guia: '2 frases: en qué se invirtieron los recursos (cartera, inversiones, liquidez) y lectura de gestión', tablas: [tb(us, tu)] }],
    glosario: 'Fuentes = de dónde salieron los recursos; usos = en qué se aplicaron. Cada concepto ya indica si es un aumento o una reducción: respeta esa dirección (p. ej. "Reducción de obligaciones financieras" es un pago de deuda, no un incremento). Reducción de fondos disponibles = se usó liquidez como fuente.',
    ficha: { fuentes: fu.slice(0, 6), usos: us.slice(0, 6), total_musd: r(tf, 2), activo_musd: v(A, 1), activo_hace12m_musd: v(B, 1) }
  });
}
const tot = (m, l) => l.reduce((s, k) => s + v(m, k), 0);
const prodA = tot(A, [12, 13, 14]), prodB = tot(B, [12, 13, 14]);
const pctProd = A[1] ? prodA / A[1] * 100 : null, pctProdB = B[1] ? prodB / B[1] * 100 : null;
const costoA = tot(A, [21, 22, 26, 27]), costoB = tot(B, [21, 22, 26, 27]);
const pctCosto = A[2] ? costoA / A[2] * 100 : null, pctCostoB = B[2] ? costoB / B[2] * 100 : null;
const patAct = A[1] ? v(A, 3) / A[1] * 100 : null, patActB = B[1] ? v(B, 3) / B[1] * 100 : null;
const tabla = (l, totK) => ({ cols: ['Cuenta', corte + ' M', '% vertical', anterior + ' M', 'Δ %'], rows: l.filter(k => v(A, k) || v(B, k)).map(k => [nom(k), fmt(v(A, k), 1), pc(A[totK] ? v(A, k) / A[totK] * 100 : null, 1), fmt(v(B, k), 1), v(B, k) ? sg((v(A, k) / v(B, k) - 1) * 100, 1) + ' %' : '–']) });
const dProd = pctProdB != null ? pctProd - pctProdB : 0;
const sem = pctProd < 70 ? 'r' : (pctProd < 80 || dProd < -3) ? 'a' : 'v';
const motivo = sem === 'r' ? 'activo productivo bajo 70 % (referencial)' : sem === 'a' ? (pctProd < 80 ? 'activo productivo entre 70 % y 80 % (referencial)' : 'el activo productivo cayó más de 3 p.p.') : 'activo productivo sobre 80 % y estable';
const comp = l => l.filter(k => v(A, k)).map(k => ({ cuenta: nom(k), pct: r(A[1] ? v(A, k) / A[1] * 100 : null, 1), var_pct: v(B, k) ? r((v(A, k) / v(B, k) - 1) * 100, 1) : null }));
return salida({
  tipo: 'estructura_financiera', titulo: 'Informe de Estructura Financiera', sem, semaforo: { color: SEM[sem], motivo },
  notas: ['Activo productivo aproximado = operaciones interfinancieras + inversiones + cartera neta. Pasivo con costo = obligaciones con el público + interfinancieras + obligaciones financieras + valores en circulación. Umbrales referenciales.'],
  kpis: [K('Activo productivo', pctProd, '%', 1, pctProdB != null ? dProd : null, 'p.p.'), K('Pasivo con costo', pctCosto, '%', 1, pctCostoB != null ? pctCosto - pctCostoB : null, 'p.p.', true), K('Patrimonio / activo', patAct, '%', 1, patActB != null ? patAct - patActB : null, 'p.p.'), K('Crecimiento del activo', B[1] ? (A[1] / B[1] - 1) * 100 : null, '%', 1, v(A, 1) - v(B, 1), 'M')],
  graficos: {
    activo: [G('barras_h', 'Composición del activo (% del total)', '%', ACT.filter(k => v(A, k) || v(B, k)).map(nom), [{ nombre: anterior, datos: ACT.filter(k => v(A, k) || v(B, k)).map(k => B[1] ? r(v(B, k) / B[1] * 100, 1) : null) }, { nombre: corte, datos: ACT.filter(k => v(A, k) || v(B, k)).map(k => A[1] ? r(v(A, k) / A[1] * 100, 1) : null) }], { decimales: 1 })],
    pasivo: [G('barras_h', 'Composición del pasivo (% del total)', '%', PAS.filter(k => v(A, k) || v(B, k)).map(nom), [{ nombre: anterior, datos: PAS.filter(k => v(A, k) || v(B, k)).map(k => B[2] ? r(v(B, k) / B[2] * 100, 1) : null) }, { nombre: corte, datos: PAS.filter(k => v(A, k) || v(B, k)).map(k => A[2] ? r(v(A, k) / A[2] * 100, 1) : null) }], { decimales: 1 })] },
  secciones: [
    { clave: 'activo', titulo: 'Estructura del activo', guia: '2 frases: composición (cartera, inversiones, liquidez) y cambios relevantes; peso del activo productivo', tablas: [tabla(ACT, 1)] },
    { clave: 'pasivo', titulo: 'Estructura del pasivo y patrimonio', guia: '2 frases: dependencia de depósitos frente a deuda, pasivo con costo y fortaleza patrimonial', tablas: [tabla(PAS, 2), tabla(PAT, 3)] }],
  glosario: 'Análisis vertical = peso de cada cuenta sobre su total (activo, pasivo o patrimonio). Análisis horizontal = variación a 12 meses. Activo productivo alto = más activos que generan ingresos. Pasivo con costo = fondeo por el que se pagan intereses.',
  ficha: { activo_productivo_pct: r(pctProd, 1), activo_productivo_hace12m_pct: r(pctProdB, 1), pasivo_con_costo_pct: r(pctCosto, 1), pasivo_con_costo_hace12m_pct: r(pctCostoB, 1), patrimonio_sobre_activo_pct: r(patAct, 1), patrimonio_sobre_activo_hace12m_pct: r(patActB, 1), activo_musd: v(A, 1), activo_hace12m_musd: v(B, 1), composicion_activo: comp(ACT), composicion_pasivo: comp(PAS) }
});`;

const A_RES = String.raw`
const rows = $('SQL Resumen').all().map(i => num(i.json));
const g = p => rows.find(x => x.per === p) || null;
const der = x => !x ? null : Object.assign({}, x, { roa_pct: x.act_mm ? x.res_mm * 12 / x.mm / x.act_mm * 100 : null, roe_pct: x.pat_mm ? x.res_mm * 12 / x.mm / x.pat_mm * 100 : null, gop_act_pct: x.act_mm ? x.gop_mm * 12 / x.mm / x.act_mm * 100 : null });
const u = der(g('actual')), m = der(g('mes_anterior')), y = der(g('anio_anterior'));
const KDEF = [['act_mm', 'Activo (USD M)', 'M', 1, true, null], ['cartera_mm', 'Cartera bruta (USD M)', 'M', 1, true, null], ['dep_mm', 'Depósitos (USD M)', 'M', 1, true, null], ['pat_mm', 'Patrimonio (USD M)', 'M', 1, true, null], ['res_mm', 'Resultado del año (USD M)', 'M', 2, true, null], ['moro_pct', 'Morosidad', '%', 2, false, 'moro_pct'], ['cobert_pct', 'Cobertura', '%', 1, true, 'cobert_pct'], ['liq_pct', 'Liquidez 1.ª línea', '%', 1, true, 'liq_pct'], ['solv_pct', 'Solvencia', '%', 2, true, 'solv_pct'], ['roa_pct', 'ROA anualizado', '%', 2, true, 'roa_pct'], ['roe_pct', 'ROE anualizado', '%', 2, true, 'roe_pct'], ['gop_act_pct', 'Gasto operativo / activo', '%', 2, false, 'gop_act_pct']];
const kp = KDEF.map(([k, t, un, d, alto, pk]) => { const a = u[k], b = m ? m[k] : null, c = y ? y[k] : null; const mp = pk ? med(ps.map(p => p[pk])) : null;
  const d12 = (a != null && c != null) ? (un === 'M' ? (c ? (a / c - 1) * 100 : null) : a - c) : null;
  return { k, indicador: t, unidad: un, dec: d, actual: r(a, d), mes_anterior: r(b, d), hace12m: r(c, d), variacion_12m: r(d12, 2), variacion_12m_unidad: un === 'M' ? '%' : 'p.p.', favorable: d12 == null ? null : (alto ? d12 > 0 : d12 < 0), mediana_pares: r(mp, 2), score: d12 == null ? 0 : (un === 'M' ? Math.abs(d12) : Math.abs(d12) * 4) }; });
const hall = kp.filter(x => x.k !== 'res_mm').sort((p, q) => q.score - p.score).slice(0, 3).map(x => ({ indicador: x.indicador, actual: x.actual, hace12m: x.hace12m, variacion_12m: x.variacion_12m, unidad_variacion: x.variacion_12m_unidad, favorable: x.favorable, mediana_pares: x.mediana_pares }));
const kv = k => kp.find(x => x.k === k);
const al = [];
if (u.solv_pct != null && u.solv_pct < 12) al.push('Solvencia ' + fmt(u.solv_pct, 2) + ' % (bajo el 12 % de holgura)');
if (kv('moro_pct').mediana_pares != null && u.moro_pct > kv('moro_pct').mediana_pares + 1) al.push('Morosidad ' + fmt(u.moro_pct, 2) + ' % sobre la mediana de pares (' + fmt(kv('moro_pct').mediana_pares, 2) + ' %)');
if (u.cobert_pct != null && u.cobert_pct < 100) al.push('Cobertura ' + fmt(u.cobert_pct, 1) + ' % (bajo 100 %)');
if (kv('liq_pct').mediana_pares != null && u.liq_pct < kv('liq_pct').mediana_pares) al.push('Liquidez ' + fmt(u.liq_pct, 1) + ' % bajo la mediana de pares (' + fmt(kv('liq_pct').mediana_pares, 1) + ' %)');
if (u.roe_pct != null && u.roe_pct < 0) al.push('ROE negativo (' + fmt(u.roe_pct, 2) + ' %)');
const notas = [];
if (Math.abs(u.res_mm || 0) < 0.01) notas.push('A VERIFICAR: resultado ≈ 0 en la base (ingresos ≈ gastos); ROA y ROE no son concluyentes.');
const sem = al.length >= 3 ? 'r' : al.length ? 'a' : 'v';
const fx = (x, un, d) => un === 'M' ? fmt(x, d) : pc(x, d);
return salida({
  tipo: 'resumen_ejecutivo', titulo: 'Resumen Ejecutivo Mensual', sem, semaforo: { color: SEM[sem], motivo: al.length ? al.length + ' alerta(s) activas' : 'sin alertas activas' }, notas, maxPalabras: 250,
  kpis: [kp[0], kp[5], kp[8], kp[10]].map(x => K(x.indicador, x.actual, x.unidad === 'M' ? 'USD M' : '%', x.dec, x.variacion_12m, x.unidad === 'M' ? '%' : 'p.p.', x.k === 'moro_pct')),
  graficos: {
    hallazgos: [
      G('linea', 'Indicadores clave en 13 meses', '%', rows.map(x => x.mes), [{ nombre: 'Morosidad', datos: rows.map(x => x.moro_pct) }, { nombre: 'Solvencia', datos: rows.map(x => x.solv_pct) }, { nombre: 'Liquidez 1.ª línea', datos: rows.map(x => x.liq_pct) }], { decimales: 1 }),
      G('barras_h', 'Frente a la mediana de pares', '%', ['moro_pct', 'solv_pct', 'liq_pct', 'roe_pct', 'gop_act_pct'].map(k => kv(k).indicador), [{ nombre: 'Mediana de pares', datos: ['moro_pct', 'solv_pct', 'liq_pct', 'roe_pct', 'gop_act_pct'].map(k => kv(k).mediana_pares) }, { nombre: 'Entidad', datos: ['moro_pct', 'solv_pct', 'liq_pct', 'roe_pct', 'gop_act_pct'].map(k => kv(k).actual) }], { decimales: 2 })] },
  secciones: [{ clave: 'hallazgos', titulo: 'Indicadores clave', guia: '3 frases, una por cada hallazgo (las variaciones más relevantes a 12 meses, con su lectura favorable o desfavorable); máximo 120 palabras', tablas: [{ cols: ['Indicador', corte, 'Mes anterior', anterior, 'Δ 12 m', 'Mediana pares'], rows: kp.map(x => [x.indicador, fx(x.actual, x.unidad, x.dec), fx(x.mes_anterior, x.unidad, x.dec), fx(x.hace12m, x.unidad, x.dec), x.variacion_12m == null ? '–' : sg(x.variacion_12m, 2) + (x.unidad === 'M' ? ' %' : ' p.p.'), x.mediana_pares == null ? '–' : fx(x.mediana_pares, x.unidad, 2)]) }] }],
  glosario: 'Resumen de una página para el consejo. Menciona solo lo esencial. Las alertas_activas ya están calculadas: conviértelas en recomendaciones breves. Morosidad y gasto operativo: mejor si bajan; el resto, mejor si suben.',
  ficha: { hallazgos: hall, alertas_activas: al, pares_criterio: 'las 10 entidades del mismo tipo con activo más cercano' }
});`;

// Nodo Componer: fuente legible en componer.js (se incrusta tal cual).
const COMPONER = require('fs').readFileSync(require('path').join(__dirname, 'componer.js'), 'utf8');

const SYSTEM = 'Eres "Analista IDCE", analista financiero senior (más de 10 años) en solvencia, riesgo y gestión de cooperativas y bancos del Ecuador. Recibes una FICHA con todas las cifras ya calculadas: tu único trabajo es redactar. Reglas: usa SOLO cifras de la FICHA, con su fecha; no inventes ni recalcules; formato español (coma decimal, punto de miles, "p.p." para puntos porcentuales, "USD X M"); aplica el GLOSARIO DEL TIPO con exactitud. Si las NOTAS DE DATOS dicen "A VERIFICAR" o "no está en la base", menciónalo y nunca lo interpretes como cero. Las causas que la ficha no muestre se plantean como algo a revisar. No califiques la entidad como segura o insegura para terceros. Nunca escribas en el texto los nombres técnicos de los campos de la ficha (palabras con guion bajo como margen_neto_intereses o ningun_segmento_empeoro): tradúcelos a lenguaje financiero. Si un dato no viene en la ficha porque no aplica, no lo menciones como faltante. Tono según AUDIENCIA (consejo: ejecutivo y sin jerga; riesgos y auditoría: técnico). Responde SOLO un JSON válido, sin ``` ni texto extra: {"conclusion": "3 frases: nivel y semáforo (si hay; usa su motivo), tendencia de 12 meses, principal riesgo u holgura", "secciones": {"<clave de cada sección>": "texto según su guía"}, "alertas": ["de 2 a 4 recomendaciones de gestión, cada una con una cifra de la ficha y una acción concreta"]}. Respeta el LÍMITE de palabras.';
const PROMPT = "={{ 'TIPO: ' + $json.titulo + '\\nAUDIENCIA: ' + $json.audiencia + '\\nLÍMITE: ' + $json.maxPalabras + ' palabras en total\\nCORTE: ' + $json.corte + ' (comparado con ' + $json.comparado_con + ')\\nGLOSARIO DEL TIPO: ' + $json.glosario + '\\nSEMÁFORO: ' + JSON.stringify($json.semaforo) + '\\nNOTAS DE DATOS: ' + JSON.stringify($json.notas) + '\\nFICHA (cifras ya calculadas): ' + JSON.stringify($json.ficha) + '\\nSECCIONES A REDACTAR (clave: qué decir): ' + JSON.stringify(Object.fromEntries($json.secciones.map(s => [s.clave, s.guia]))) + '\\nPEDIDO DEL USUARIO (solo matices de énfasis): ' + $json.pedido }}";

// ---------- Construcción del workflow ----------
const nodes = [];
const add = (name, type, typeVersion, position, parameters, extra = {}) => { nodes.push({ id: uid(), name, type, typeVersion, position, parameters, ...extra }); return name; };
const cond = (left, op, right, type = 'string', singleValue) => ({ options: { caseSensitive: true, leftValue: '', typeValidation: type === 'boolean' ? 'loose' : 'strict', version: 2 }, conditions: [{ id: uid(), leftValue: left, rightValue: right ?? '', operator: Object.assign({ type, operation: op }, singleValue ? { singleValue: true } : {}) }], combinator: 'and' });
const sql = (name, pos, query, extra = {}) => add(name, 'n8n-nodes-base.microsoftSql', 1.2, pos, { operation: 'executeQuery', query, options: {} }, { credentials: SQL_CRED, ...extra });
const code = (name, pos, js) => add(name, 'n8n-nodes-base.code', 2, pos, { jsCode: js });

add('POST informes', 'n8n-nodes-base.webhook', 2.1, [0, 600], { httpMethod: 'POST', path: 'informes', responseMode: 'responseNode', options: {} }, { webhookId: uid() });
code('Normalizar solicitud', [220, 600], NORMALIZAR);
add('¿Solicitud válida?', 'n8n-nodes-base.if', 2.2, [440, 600], { conditions: cond('={{ $json.error }}', 'empty', '', 'string', true), options: {} });
add('Responder solicitud inválida', 'n8n-nodes-base.respondToWebhook', 1.5, [660, 820], { respondWith: 'json', responseBody: '={{ JSON.stringify({ output: "PREGUNTA: " + $json.error }) }}', options: {} });
sql('Pares (común)', [660, 600], SQL_PARES, { alwaysOutputData: true });
code('Preparar', [880, 600], PREPARAR);
add('¿Hay datos?', 'n8n-nodes-base.if', 2.2, [1100, 600], { conditions: cond('={{ $json.ok }}', 'true', '', 'boolean', true), options: {} });
add('Responder sin datos', 'n8n-nodes-base.respondToWebhook', 1.5, [1320, 900], { respondWith: 'json', responseBody: '={{ JSON.stringify({ output: "PREGUNTA: No encontré datos para la entidad indicada al corte " + $json.mes + ". ¿Puedes verificar la entidad o el corte?" }) }}', options: {} });
add('Switch tipoInforme', 'n8n-nodes-base.switch', 3.2, [1320, 560], { rules: { values: TIPOS.map(t => ({ conditions: cond('={{ $json.tipo }}', 'equals', t), renameOutput: true, outputKey: t })) }, options: {} });

const RAMAS = [
  ['SQL Solvencia', SQL_SOLV, 'Armar solvencia', A_SOLV],
  ['SQL Cartera', SQL_CARTERA, 'Armar calidad de cartera', A_CART],
  ['SQL Rentabilidad', SQL_RENT, 'Armar rentabilidad', A_RENT],
  ['SQL Liquidez', SQL_LIQ, 'Armar liquidez', A_LIQ],
  ['SQL Mercado', SQL_MERC, 'Armar posición de mercado', A_MERC],
  ['SQL Estructura', SQL_ESTR, 'Armar estructura / fuentes y usos', A_ESTR],
  ['SQL Resumen', SQL_RES, 'Armar resumen ejecutivo', A_RES],
];
RAMAS.forEach(([s, q, a, js], i) => { sql(s, [1580, 160 + i * 140], q); code(a, [1800, 160 + i * 140], H + js); });

add('Redactar informe (LLM)', '@n8n/n8n-nodes-langchain.chainLlm', 1.9, [2060, 600], { promptType: 'define', text: PROMPT, messages: { messageValues: [{ type: 'SystemMessagePromptTemplate', message: SYSTEM }] } });
add('OpenAI gpt-5-mini', '@n8n/n8n-nodes-langchain.lmChatOpenAi', 1.3, [2060, 800], { model: { __rl: true, mode: 'list', value: 'gpt-5-mini' }, options: {} }, { credentials: OPENAI_CRED });
code('Componer HTML', [2320, 600], COMPONER);
add('Responder informe', 'n8n-nodes-base.respondToWebhook', 1.5, [2540, 600], { respondWith: 'firstIncomingItem', options: {} });

const C = {};
const link = (from, to, out = 0, type = 'main') => { C[from] = C[from] || {}; C[from][type] = C[from][type] || []; while (C[from][type].length <= out) C[from][type].push([]); C[from][type][out].push({ node: to, type, index: 0 }); };
link('POST informes', 'Normalizar solicitud');
link('Normalizar solicitud', '¿Solicitud válida?');
link('¿Solicitud válida?', 'Pares (común)', 0);
link('¿Solicitud válida?', 'Responder solicitud inválida', 1);
link('Pares (común)', 'Preparar');
link('Preparar', '¿Hay datos?');
link('¿Hay datos?', 'Switch tipoInforme', 0);
link('¿Hay datos?', 'Responder sin datos', 1);
const SALIDA_SQL = ['SQL Solvencia', 'SQL Cartera', 'SQL Rentabilidad', 'SQL Liquidez', 'SQL Mercado', 'SQL Estructura', 'SQL Estructura', 'SQL Resumen'];
SALIDA_SQL.forEach((s, i) => link('Switch tipoInforme', s, i));
RAMAS.forEach(([s, , a]) => { link(s, a); link(a, 'Redactar informe (LLM)'); });
link('OpenAI gpt-5-mini', 'Redactar informe (LLM)', 0, 'ai_languageModel');
link('Redactar informe (LLM)', 'Componer HTML');
link('Componer HTML', 'Responder informe');

const wf = { name: 'Informes (determinista, multi-tipo)', nodes, connections: C, active: false, settings: { executionOrder: 'v1', availableInMCP: true }, pinData: {} };
if (process.argv[2]) wf.id = process.argv[2];
process.stdout.write(JSON.stringify(wf, null, 1));
