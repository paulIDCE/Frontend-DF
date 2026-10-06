// Componer: arma (1) `informe`, la estructura que el frontend pinta con sus componentes, y (2) `output`,
// el HTML autónomo con los mismos KPI y gráficos (SVG generado aquí, sin LLM) para descargar o enviar.
const NODOS = ['Armar solvencia', 'Armar calidad de cartera', 'Armar rentabilidad', 'Armar liquidez', 'Armar posición de mercado', 'Armar estructura / fuentes y usos', 'Armar resumen ejecutivo'];
let F = null;
for (const n of NODOS) { try { if ($(n).isExecuted) { F = $(n).first().json; break; } } catch (e) {} }
const raw = String($input.first().json.text || '');
let t = {};
try { t = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)); } catch (e) { t = { conclusion: raw.slice(0, 1500) }; }
const S = t.secciones || {};
const alertas = Array.isArray(t.alertas) ? t.alertas.map(String) : [];

// ---------- 1. Informe estructurado ----------
const informe = {
  version: 1, tipo: F.tipo, titulo: F.titulo, entidad: F.entidad, tipoEntidad: F.tipoEntidad, corte: F.corte, comparado_con: F.comparado_con,
  semaforo: F.sem ? { nivel: F.sem, color: F.semaforo.color, motivo: F.semaforo.motivo } : null,
  conclusion: String(t.conclusion || ''),
  kpis: (F.kpis || []).map(k => ({ titulo: k.t, valor: k.valor, unidad: k.unidad, decimales: k.dec, delta: k.delta, deltaUnidad: k.dUnidad, subirEsMalo: k.subirEsMalo, texto: k.texto, deltaTexto: k.dTexto })),
  secciones: (F.secciones || []).map(s => ({ clave: s.clave, titulo: s.titulo, texto: S[s.clave] ? String(S[s.clave]) : '', graficos: s.graficos || [], tablas: s.tablas || [] })),
  alertas, notas: F.notas || []
};

// ---------- 2. HTML autónomo ----------
const esc = x => String(x == null ? '' : x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (x, d = 1) => { if (x == null || isNaN(x)) return '–'; const s = Math.abs(x).toFixed(d); let [e, m] = s.split('.'); e = e.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (x < 0 ? '−' : '') + e + (m ? ',' + m : ''); };
const PAL = ['#94a3b8', '#2a78d6', '#eb6834', '#1baf7a', '#eda100'];
const DEST = '#2a78d6', OTRO = '#cbd5e1', TINTA = '#334155', TENUE = '#64748b', REJ = '#e2e8f0', REF = '#b91c1c';
const colorSerie = (g, i) => g.series.length === 1 ? DEST : PAL[i % PAL.length];
const txt = (x, y, s, o = {}) => '<text x="' + x + '" y="' + y + '" font-size="' + (o.fs || 10) + '" fill="' + (o.c || TENUE) + '" text-anchor="' + (o.a || 'start') + '"' + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + esc(s) + '</text>';
const rango = g => { const v = g.series.flatMap(s => s.datos).concat((g.referencias || []).map(r => r.valor)).filter(x => x != null && !isNaN(x)); let mn = Math.min(0, ...v), mx = Math.max(0, ...v); if (mx === mn) mx = mn + 1; const pad = (mx - mn) * 0.08; return [mn < 0 ? mn - pad : 0, mx + pad]; };
const leyenda = (g, x, y) => g.series.length < 2 ? '' : g.series.map((s, i) => '<rect x="' + (x + i * 110) + '" y="' + (y - 8) + '" width="10" height="10" rx="2" fill="' + colorSerie(g, i) + '"/>' + txt(x + i * 110 + 14, y, s.nombre, { c: TINTA })).join('');
const corta = (s, n) => { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
function svgVertical(g, angosto) {
  const W = angosto ? 430 : 680, H = angosto ? 250 : 230, L = 52, R = 12, T = 26, B = 46, iw = W - L - R, ih = H - T - B;
  const [mn, mx] = rango(g), y = v => T + ih - (v - mn) / (mx - mn) * ih;
  const n = g.categorias.length, paso = iw / n;
  let o = '';
  for (let k = 0; k <= 4; k++) { const v = mn + (mx - mn) * k / 4, yy = y(v); o += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '" stroke="' + REJ + '"/>' + txt(L - 6, yy + 3, fmt(v, g.decimales > 1 ? 1 : 0), { a: 'end' }); }
  const cada = Math.ceil(n / (angosto ? 7 : 13));
  g.categorias.forEach((c, i) => { if (i % cada === 0) o += txt(L + paso * (i + 0.5), T + ih + 14, corta(c, 14), { a: 'middle' }); });
  if (g.tipo === 'linea') {
    g.series.forEach((s, si) => {
      const pts = s.datos.map((v, i) => v == null ? null : [L + paso * (i + 0.5), y(v)]).filter(Boolean);
      o += '<polyline fill="none" stroke="' + colorSerie(g, si) + '" stroke-width="2.2" points="' + pts.map(p => p.join(',')).join(' ') + '"/>';
      pts.forEach((p, i) => { o += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.6" fill="' + colorSerie(g, si) + '"/>'; });
      const u = pts[pts.length - 1]; if (u) o += txt(u[0], u[1] - 7, fmt(s.datos[s.datos.length - 1], g.decimales), { a: 'end', c: TINTA, w: 700 });
    });
  } else {
    const k = g.series.length, bw = Math.min(28, paso * 0.7 / k);
    g.series.forEach((s, si) => s.datos.forEach((v, i) => {
      if (v == null) return; const x = L + paso * (i + 0.5) - bw * k / 2 + si * bw, y0 = y(Math.max(0, v)), h = Math.abs(y(v) - y(0));
      o += '<rect x="' + x + '" y="' + y0 + '" width="' + (bw - 2) + '" height="' + Math.max(h, 1) + '" rx="2" fill="' + colorSerie(g, si) + '"/>';
      if (n * k <= 12) o += txt(x + (bw - 2) / 2, y0 - 3, fmt(v, g.decimales), { a: 'middle', c: TINTA, fs: 9 });
    }));
  }
  (g.referencias || []).forEach(r => { const yy = y(r.valor); o += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '" stroke="' + REF + '" stroke-dasharray="5 4"/>' + txt(W - R, yy - 4, r.etiqueta, { a: 'end', c: REF }); });
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(g.titulo) + '">' + o + leyenda(g, L, H - 8) + '</svg>';
}
function svgHorizontal(g) {
  const k = g.series.length, fila = 16 * k + 8, W = 680, L = 210, R = 56, T = 8, n = g.categorias.length, H = T + n * fila + (k > 1 ? 30 : 12), iw = W - L - R;
  const [mn, mx] = rango(g), x = v => L + (v - mn) / (mx - mn) * iw;
  let o = '';
  g.categorias.forEach((c, i) => {
    const y0 = T + i * fila, dest = g.resaltar && c === g.resaltar;
    o += txt(L - 8, y0 + fila / 2 + 3, corta(c, 34), { a: 'end', c: dest ? DEST : TINTA, w: dest ? 700 : 400 });
    g.series.forEach((s, si) => {
      const v = s.datos[i]; if (v == null) return; const xa = x(Math.min(0, v)), w = Math.abs(x(v) - x(0));
      const col = k === 1 ? (g.resaltar ? (dest ? DEST : OTRO) : DEST) : colorSerie(g, si);
      o += '<rect x="' + xa + '" y="' + (y0 + 4 + si * 16) + '" width="' + Math.max(w, 1) + '" height="13" rx="2" fill="' + col + '"/>' + txt(xa + Math.max(w, 1) + 4, y0 + 14 + si * 16, fmt(v, g.decimales), { c: TINTA, fs: 9 });
    });
  });
  (g.referencias || []).forEach(r => { const xx = x(r.valor); o += '<line x1="' + xx + '" x2="' + xx + '" y1="' + T + '" y2="' + (T + n * fila) + '" stroke="' + REF + '" stroke-dasharray="5 4"/>' + txt(xx + 3, T + n * fila + 10, r.etiqueta + ' ' + fmt(r.valor, g.decimales), { c: REF }); });
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(g.titulo) + '">' + o + leyenda(g, L, H - 6) + '</svg>';
}
const grafico = (g, angosto) => '<figure class="graf"><figcaption>' + esc(g.titulo) + (g.unidad ? ' <span>(' + esc(g.unidad) + ')</span>' : '') + '</figcaption>' + (g.tipo === 'barras_h' ? svgHorizontal(g) : svgVertical(g, angosto)) + '</figure>';
const tabla = tb => '<table><tr>' + tb.cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr>' + tb.rows.map((row, i) => '<tr' + ((tb.yo || []).includes(i) ? ' class="yo"' : (tb.med || []).includes(i) ? ' class="med"' : '') + '>' + row.map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</table>';
const kpiHtml = k => {
  let d = '';
  if (k.deltaTexto) d = '<span class="neu">' + esc(k.deltaTexto) + '</span>';
  else if (k.delta != null) { const malo = k.subirEsMalo ? k.delta > 0 : k.delta < 0; d = '<span class="' + (k.delta === 0 ? 'neu' : malo ? 'mal' : 'bien') + '">' + (k.delta > 0 ? '▲ ' : k.delta < 0 ? '▼ ' : '') + fmt(Math.abs(k.delta), k.deltaUnidad === '%' ? 1 : k.decimales) + ' ' + esc(k.deltaUnidad) + '</span> <span class="neu">vs. ' + esc(F.comparado_con) + '</span>'; }
  const v = k.texto != null ? esc(k.texto) : fmt(k.valor, k.decimales) + (k.unidad === '%' ? ' %' : '');
  return '<div class="kpi"><span class="kt">' + esc(k.titulo) + '</span><b>' + v + '</b><span class="kd">' + d + '</span></div>';
};
const css = '@page{size:A4;margin:14mm}body{font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;color:#1f2937;line-height:1.45;max-width:900px;margin:0 auto;padding:12px}h1{font-size:18pt;margin:0;color:#0b3a5d}h2{font-size:12.5pt;color:#0b3a5d;border-bottom:2px solid #0b3a5d;padding-bottom:3px;margin:20px 0 8px;break-after:avoid}.sub{color:#6b7280;font-size:9.5pt}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.kpi{border:1px solid #e2e8f0;border-top:4px solid #0b3a5d;border-radius:8px;padding:8px 10px;break-inside:avoid}.kpi .kt{display:block;font-size:8pt;text-transform:uppercase;letter-spacing:.03em;color:#64748b}.kpi b{display:block;font-size:17pt;color:#0b3a5d;margin:2px 0}.kpi .kd{font-size:8.5pt}.bien{color:#047857}.mal{color:#b91c1c}.neu{color:#64748b}.graf{margin:10px 0;padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;break-inside:avoid}.graf figcaption{font-weight:700;font-size:10pt;color:#334155;margin-bottom:4px}.graf figcaption span{font-weight:400;color:#64748b}.graficos{display:grid;grid-template-columns:1fr 1fr;gap:10px}.graficos.uno{grid-template-columns:1fr}table{width:100%;border-collapse:collapse;font-size:9pt;margin:8px 0;break-inside:auto}tr{break-inside:avoid}th{background:#0b3a5d;color:#fff;padding:4px;text-align:right}th:first-child,td:first-child{text-align:left}td{padding:3px 4px;border-bottom:1px solid #e5e7eb;text-align:right}tr.yo td{background:#e0f2fe;font-weight:bold}tr.med td{font-style:italic;color:#374151;background:#f9fafb}.sem{display:inline-block;padding:2px 9px;border-radius:10px;color:#fff;font-weight:bold;margin-right:6px}.sem.v{background:#047857}.sem.a{background:#b45309}.sem.r{background:#b91c1c}.box{background:#f3f4f6;border-left:4px solid #0b3a5d;padding:9px 12px}.motivo{font-size:8.5pt;color:#6b7280;margin-top:4px}.notas{font-size:8pt;color:#6b7280;margin-bottom:4px}footer{margin-top:16px;font-size:8pt;color:#6b7280;border-top:1px solid #d1d5db;padding-top:4px}';
let n = 1;
const I = informe;
let html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>' + esc(I.titulo) + ' — ' + esc(I.entidad) + '</title><style>' + css + '</style></head><body>'
  + '<h1>' + esc(I.titulo) + '</h1><div class="sub">' + esc(I.entidad) + ' · ' + esc(I.tipoEntidad) + ' · Corte: ' + esc(I.corte) + ' · Comparado con: ' + esc(I.comparado_con) + '</div>'
  + '<h2>' + (n++) + '. Conclusión</h2><div class="box">' + (I.semaforo ? '<span class="sem ' + I.semaforo.nivel + '">' + esc(I.semaforo.color) + '</span>' : '') + esc(I.conclusion) + (I.semaforo ? '<div class="motivo">Semáforo: ' + esc(I.semaforo.motivo) + '</div>' : '') + '</div>'
  + '<div class="kpis">' + I.kpis.map(kpiHtml).join('') + '</div>';
for (const s of I.secciones) {
  html += '<h2>' + (n++) + '. ' + esc(s.titulo) + '</h2>';
  if (s.graficos.length) { const dos = s.graficos.length > 1 && !s.graficos.some(g => g.tipo === 'barras_h'); html += '<div class="graficos' + (dos ? '' : ' uno') + '">' + s.graficos.map(g => grafico(g, dos)).join('') + '</div>'; }
  if (s.texto) html += '<p>' + esc(s.texto) + '</p>';
  html += s.tablas.map(tabla).join('');
}
if (alertas.length) html += '<h2>' + (n++) + '. Alertas y recomendaciones</h2><ul>' + alertas.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
html += '<footer>' + (I.notas.length ? '<div class="notas">Notas: ' + I.notas.map(esc).join(' · ') + '</div>' : '') + 'Fuente: estados financieros e indicadores de patrimonio técnico (SB/SEPS), base bco_coop. Corte ' + esc(I.corte) + '. Umbrales de semáforo referenciales. Documento generado automáticamente por Kipu · IDCE Consulting: no constituye calificación de riesgo.</footer></body></html>';
return [{ json: { output: html, informe, meta: { tipoInforme: F.tipo, titulo: F.titulo, entidad: F.entidad, ifiId: F.ifiId, corte: F.corte, semaforo: F.semaforo.color || null, generado: new Date().toISOString() } } }];
