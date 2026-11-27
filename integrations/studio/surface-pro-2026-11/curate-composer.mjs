// Curates the Court Composer: renders candidates per family in Chromium, measures each on a raster and
// writes the best, most varied seeds with their measurements into court-composer.mjs (POOL block).
//
//   node curate-composer.mjs [candidatesPerFamily=220] [poolSize=36] [family,family]
//
// Checks per candidate, at h = 400 (15 x 10 m, 40 px = 1 m, rastered at 2x so 8 px is measured, not 7)
// and h = 600 (square / Panna, 1x):
//  - min. width 20 cm: every colour region survives a morphological opening with a 8 px disc;
//    any lost piece larger than 40 px (≈ 2.5 dm²) rejects the candidate;
//  - specks: islands smaller than 30 x 30 cm (144 px) — more than two reject;
//  - paints: at most 5 slots used, at least 3 (ground + 2);
//  - symmetry: the raster equals its 180° turn or its mirror (≤ 1.2 % pixels differ);
//    mural families (MURAL): a tapered point (thin piece shorter than 75 cm and under 0.09 m²) is allowed, a thin strip is not;
//    and instead of symmetry the halves are balanced — ground share within 30 %, ≥ 3 paints in each half, detail within 1.6x;
//  - balance: the ground or any paint covers ≤ 82 % of the court.
// Measured and stored: area share per slot (paint m²), masking-edge length in metres, mode tag.
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { COMPOSER_GRAMMARS, composeSlots, MURAL } from './court-composer.mjs';

// Playwright from the project, or the machine-wide install (NODE_PATH=$(npm root -g))
let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }
const here = new URL('.', import.meta.url).pathname;
const N = +(process.argv[2] || 220), POOL_SIZE = +(process.argv[3] || 36);
const LABEL = ['#000000', '#3C0000', '#003C00', '#00003C', '#3C3C00'];
const hashS = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const toSvg = (g, h, sc = 1) => '<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" viewBox="0 0 600 ' + h + '" width="' + 600 * sc + '" height="' + h * sc + '">' + g.replace(/§(\d)/g, (_, i) => LABEL[+i]) + '</svg>';

// runs inside the page
const ANALYSE = `
window.analyse = async (svg, W, H, sig, sc, taper) => {
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.imageSmoothingEnabled = false; cx.drawImage(img, 0, 0);
  const px = cx.getImageData(0, 0, W, H).data; const N = W * H; const lab = new Uint8Array(N);
  const ref = [[0,0,0],[60,0,0],[0,60,0],[0,0,60],[60,60,0]];
  for (let i = 0; i < N; i++) { const r = px[i*4], g = px[i*4+1], b = px[i*4+2]; let best = 0, bd = 1e9; for (let k = 0; k < 5; k++) { const d = (r-ref[k][0])**2 + (g-ref[k][1])**2 + (b-ref[k][2])**2; if (d < bd) { bd = d; best = k; } } lab[i] = best; }
  const area = [0,0,0,0,0]; for (let i = 0; i < N; i++) area[lab[i]]++;
  // chamfer distance (3-4) to the nearest pixel NOT in mask; outside the image counts as inside the mask
  const dt = (inside) => { const d = new Float32Array(N); const INF = 1e6; for (let i = 0; i < N; i++) d[i] = inside[i] ? INF : 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y*W + x; if (!d[i]) continue; let v = d[i];
      if (x > 0) v = Math.min(v, d[i-1] + 3); if (y > 0) { v = Math.min(v, d[i-W] + 3); if (x > 0) v = Math.min(v, d[i-W-1] + 4); if (x < W-1) v = Math.min(v, d[i-W+1] + 4); } d[i] = v; }
    for (let y = H-1; y >= 0; y--) for (let x = W-1; x >= 0; x--) { const i = y*W + x; if (!d[i]) continue; let v = d[i];
      if (x < W-1) v = Math.min(v, d[i+1] + 3); if (y < H-1) { v = Math.min(v, d[i+W] + 3); if (x < W-1) v = Math.min(v, d[i+W+1] + 4); if (x > 0) v = Math.min(v, d[i+W-1] + 4); } d[i] = v; }
    return d; };
  const comps = (mask, minArea) => { const seen = new Uint8Array(N); const out = []; const st = new Int32Array(N);
    for (let i = 0; i < N; i++) { if (!mask[i] || seen[i]) continue; let n = 0, sp = 0; st[sp++] = i; seen[i] = 1; let edge = false; let x0 = W, x1 = 0, y0 = H, y1 = 0;
      while (sp) { const j = st[--sp]; n++; const x = j % W, y = (j / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (x === 0 || y === 0 || x === W-1 || y === H-1) edge = true;
        if (x > 0 && mask[j-1] && !seen[j-1]) { seen[j-1] = 1; st[sp++] = j-1; } if (x < W-1 && mask[j+1] && !seen[j+1]) { seen[j+1] = 1; st[sp++] = j+1; }
        if (y > 0 && mask[j-W] && !seen[j-W]) { seen[j-W] = 1; st[sp++] = j-W; } if (y < H-1 && mask[j+W] && !seen[j+W]) { seen[j+W] = 1; st[sp++] = j+W; } }
      if (n >= minArea) out.push({ n, edge, len: Math.hypot(x1 - x0, y1 - y0) }); }
    return out; };
  let thinBad = 0, thinPx = 0, specks = 0;
  for (let k = 0; k < 5; k++) { if (!area[k]) continue; const m = new Uint8Array(N); for (let i = 0; i < N; i++) m[i] = lab[i] === k ? 1 : 0;
    const d = dt(m); const er = new Uint8Array(N); for (let i = 0; i < N; i++) er[i] = d[i] >= 12 * sc ? 1 : 0; // core: ≥ 4 px (court scale) from the edge
    const notEr = new Uint8Array(N); for (let i = 0; i < N; i++) notEr[i] = er[i] ? 0 : 1; const d2 = dt(notEr); // distance to the core
    const thin = new Uint8Array(N); for (let i = 0; i < N; i++) if (m[i] && d2[i] > 13.5 * sc) { thin[i] = 1; thinPx++; }
    thinBad += comps(thin, 40 * sc * sc).filter((c) => !taper || c.len >= 30 * sc || c.n >= 150 * sc * sc).length; // taper: a point shorter than 75 cm is allowed, a strip is not
    specks += comps(m, 1).filter((c) => c.n >= 4 * sc * sc && c.n < 144 * sc * sc).length; } // < 4 px: raster seams, not paint
  // symmetry with a 1 px (court scale) tolerance: rasterising a turned edge can move it by a pixel
  const tol = sc; const hasNear = (x, y, v) => { for (let dy = -tol; dy <= tol; dy++) for (let dx = -tol; dx <= tol; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && lab[yy*W+xx] === v) return true; } return false; };
  let rot = 0, mir = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = lab[y*W+x]; if (v !== lab[(H-1-y)*W + (W-1-x)] && !hasNear(W-1-x, H-1-y, v)) rot++; if (v !== lab[y*W + (W-1-x)] && !hasNear(W-1-x, y, v)) mir++; }
  let edges = 0; const halfE = [0, 0]; const halfA = [[0,0,0,0,0],[0,0,0,0,0]];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y*W + x; const side = x < W / 2 ? 0 : 1; halfA[side][lab[i]]++; if (x < W-1 && lab[i] !== lab[i+1]) { edges++; halfE[side]++; } if (y < H-1 && lab[i] !== lab[i+W]) { edges++; halfE[side]++; } }
  // half balance for murals: L1 distance between the two halves' paint shares, and their detail (edge) ratio
  const hn = N / 2; let bal = 0; for (let k = 0; k < 5; k++) bal += Math.abs(halfA[0][k] - halfA[1][k]) / hn; const eRatio = Math.max(halfE[0], halfE[1]) / Math.max(1, Math.min(halfE[0], halfE[1]));
  // slot adjacency (how much each pair of slots touches) for the colour plan, normalised to the strongest pair
  const adjM = Array.from({ length: 5 }, () => [0,0,0,0,0]);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y*W + x, a = lab[i]; if (x < W-1 && lab[i+1] !== a) { adjM[a][lab[i+1]]++; adjM[lab[i+1]][a]++; } if (y < H-1 && lab[i+W] !== a) { adjM[a][lab[i+W]]++; adjM[lab[i+W]][a]++; } }
  const adj = []; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) adj.push(adjM[i][j]); const amax = Math.max(1, ...adj);
  // line clash: a colour edge running alongside a court line, 4–12 cm from it, makes the line hard to read
  let clash = 0, samples = 0, keyEdges = 0, keyPx = 0;
  if (sig) {
    const k = W / 600, cy = H / 2, at = (x, y) => lab[Math.max(0, Math.min(H-1, Math.round(y)))*W + Math.max(0, Math.min(W-1, Math.round(x)))];
    const probe = (x, y, nx, ny) => { samples++; let prev = at(x - nx*10, y - ny*10); for (let d = -9; d <= 10; d++) { const v = at(x + nx*d, y + ny*d); if (v !== prev && Math.abs(d - 0.5) >= 3) { clash++; return; } prev = v; } };
    const seg = (x0, y0, x1, y1) => { const L = Math.hypot(x1-x0, y1-y0), nx = -(y1-y0)/L, ny = (x1-x0)/L; for (let t = 0; t <= L; t += 4) probe(x0 + (x1-x0)*t/L, y0 + (y1-y0)*t/L, nx, ny); };
    const o = 15*k; seg(o, o, W-o, o); seg(o, H-o, W-o, H-o); seg(o, o, o, H-o); seg(W-o, o, W-o, H-o); seg(W/2, o, W/2, H-o);
    for (const sx of [1, -1]) { const bx = sx > 0 ? o : W - o, kx = bx + sx*70*k; seg(bx, cy-75*k, kx, cy-75*k); seg(bx, cy+75*k, kx, cy+75*k); seg(kx, cy-75*k, kx, cy+75*k); }
    const r = 45*k; for (let a = 0; a < Math.PI*2; a += 4/r) probe(W/2 + Math.cos(a)*r, cy + Math.sin(a)*r, Math.cos(a), Math.sin(a));
    // key busyness: edge density inside the two keys against the whole court
    for (const [x0, x1] of [[o, o + 70*k], [W - o - 70*k, W - o]]) for (let y = Math.round(cy-75*k); y < cy+75*k; y++) for (let x = Math.round(x0); x < x1; x++) { keyPx++; const i = y*W + x; if (lab[i] !== lab[i+1] || lab[i] !== lab[i+W]) keyEdges++; }
  }
  // boundary length as in paint-plan.mjs: per tile (16 px at court scale) sqrt(h² + v²), exact on straight edges
  let tileLen = 0; { const t = 16 * sc, tw = Math.ceil(W / t), th = Math.ceil(H / t), hh = new Float64Array(tw*th), vv = new Float64Array(tw*th);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y*W + x, ti = ((y / t) | 0) * tw + ((x / t) | 0); if (x < W-1 && lab[i] !== lab[i+1]) hh[ti]++; if (y < H-1 && lab[i] !== lab[i+W]) vv[ti]++; }
    for (let i = 0; i < tw*th; i++) tileLen += Math.hypot(hh[i], vv[i]); }
  let s = null; if (sig) { s = []; const cs = 10 * sc; for (let y = 0; y < H; y += cs) for (let x = 0; x < W; x += cs) { let e = 0; for (let yy = y; yy < Math.min(H, y+cs) && !e; yy++) for (let xx = x; xx < Math.min(W, x+cs) - 1; xx++) if (lab[yy*W+xx] !== lab[yy*W+xx+1] || (yy < H-1 && lab[yy*W+xx] !== lab[(yy+1)*W+xx])) { e = 1; break; } s.push(e); } }
  return { area: area.map((a) => a / N), thinBad, thinPx: thinPx / (sc * sc), specks, sym: Math.min(rot, mir) / N, bal, eRatio, half: halfA.map((h) => h.map((v) => v / hn)), edges: edges / sc, tileLen: tileLen / sc, sig: s, adj: adj.map((v) => Math.round(v / amax * 1000) / 1000), lineClash: samples ? clash / samples : 0, keyBusy: keyPx ? (keyEdges / keyPx) / Math.max(1e-6, edges / N) : 0 };
};`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
await page.addScriptTag({ content: ANALYSE });

// optional 3rd argument: comma-separated families to (re)curate; the others keep their pool and report
const only = process.argv[4] ? process.argv[4].split(',') : null;
const prev = only ? await import('./court-composer.mjs?' + Date.now()) : null;
// murals: colours may differ between halves (a red plane left, a blue one right); what must match is how much is painted,
// how many paints each half carries and how much detail it has
// Kompozytor IV and later (QUALITY): colour plan from measured adjacency, readable court lines, calm keys
const QUALITY = (fid) => fid.startsWith('pro-p-');
const muralBalanced = (m) => Math.abs(m.half[0][0] - m.half[1][0]) <= 0.3 && m.half.every((h) => h.filter((v) => v > 0.02).length >= 3) && m.eRatio <= 1.6;
const POOL = only ? { ...prev.POOL } : {}; let report = {}; try { if (only) report = JSON.parse(readFileSync(here + 'composer-report.json', 'utf8')); } catch {}
for (const fid of Object.keys(COMPOSER_GRAMMARS)) {
  if (only && !only.includes(fid)) continue;
  const base = hashS(fid); const cands = [];
  const reasons = { thin: 0, specks: 0, paints: 0, sym: 0, balance: 0, lines: 0 };
  // N candidates, more (up to 3 N) for strict families until 2.5 x the pool has passed
  let tried = 0;
  for (let i = 0; i < 3 * N && (i < N || cands.length < POOL_SIZE * 2.5); i++, tried++) {
    const seed = (base + i * 7919) % 999983 + 1;
    const a = composeSlots(fid, seed, 400), b = composeSlots(fid, seed, 600);
    const [m4, m6] = await page.evaluate(async ([s4, s6, tp]) => [await window.analyse(s4, 1200, 800, true, 2, tp), await window.analyse(s6, 600, 600, false, 1, tp)], [toSvg(a.g, 400, 2), toSvg(b.g, 600), MURAL.has(fid)]);
    const used = m4.area.filter((x) => x > 0.003).length;
    let why = null;
    if (m4.thinBad || m6.thinBad) why = 'thin'; else if (m4.specks > 2 || m6.specks > 2) why = 'specks'; else if (used < 3 || used > 5) why = 'paints'; else if (MURAL.has(fid) ? !muralBalanced(m4) : (m4.sym > 0.012 || m6.sym > 0.012)) why = 'sym'; else if (Math.max(...m4.area) > 0.82) why = 'balance';
    else if (QUALITY(fid) && m4.lineClash > 0.22) why = 'lines';
    if (why) { reasons[why]++; continue; }
    const tape = Math.round(m4.tileLen / 40); // metres on the 15 x 10 m reference court (40 px = 1 m), same measure as the paint plan
    cands.push({ seed, mode: a.mode, area: m4.area, tape, used, sig: m4.sig, thinPx: m4.thinPx + m6.thinPx, adj: m4.adj, lineClash: m4.lineClash, keyBusy: m4.keyBusy });
  }
  // score: clean edges, balanced paint, moderate masking (≈ 1–3 m of tape per m²)
  for (const c of cands) { const t = c.tape / 150; const bal = 1 - Math.max(...c.area); c.score = bal * 1.2 - Math.abs(Math.log((t + 0.3) / 1.8)) * 0.6 - c.thinPx / 4000 + (c.used >= 4 ? 0.1 : 0); if (QUALITY(fid)) c.score -= c.lineClash * 2 + Math.max(0, c.keyBusy - 1.5) * 0.4; }
  cands.sort((x, y) => y.score - x.score);
  // varied pick: round-robin over modes, reject near-duplicates (structure Jaccard distance < 0.35)
  const jd = (p, q) => { let i = 0, u = 0; for (let k = 0; k < p.length; k++) { if (p[k] && q[k]) i++; if (p[k] || q[k]) u++; } return u ? 1 - i / u : 0; };
  const byMode = {}; for (const c of cands) (byMode[c.mode] = byMode[c.mode] || []).push(c);
  const modes = Object.keys(byMode).sort((x, y) => byMode[y][0].score - byMode[x][0].score); const chosen = [];
  for (let minD = 0.35; minD >= 0.1 && chosen.length < POOL_SIZE; minD -= 0.08) {
    let progress = true; while (chosen.length < POOL_SIZE && progress) { progress = false; for (const md of modes) { if (chosen.length >= POOL_SIZE) break; const list = byMode[md]; const k = list.findIndex((c) => !chosen.includes(c) && chosen.every((o) => jd(o.sig, c.sig) >= minD)); if (k >= 0) { chosen.push(list[k]); progress = true; } } }
  }
  POOL[fid] = chosen.map((c) => ({ s: c.seed, m: { a: c.area.map((x) => Math.round(x * 1000) / 1000), t: c.tape, w: 20, md: c.mode, ...(QUALITY(fid) ? { e: c.adj, lc: Math.round(c.lineClash * 1000) / 1000, kb: Math.round(c.keyBusy * 100) / 100 } : {}) } }));
  report[fid] = { candidates: tried, passed: cands.length, kept: chosen.length, rejected: reasons, modes: [...new Set(chosen.map((c) => c.mode))].length, tapeMedian: chosen.length ? chosen.map((c) => c.tape).sort((a, b) => a - b)[chosen.length >> 1] : 0 };
  console.log(fid, JSON.stringify(report[fid]));
  save(); // after every family, so a crash later never loses finished work
}
await browser.close();
console.log('pool written');

function save() {
const file = here + 'court-composer.mjs'; const src = readFileSync(file, 'utf8');
const block = '/*POOL*/\n// ' + new Date().toISOString().slice(0, 10) + ': ' + Object.entries(report).map(([k, r]) => k.replace(/^pro-[km]-/, '') + ' ' + r.kept + '/' + r.passed + '/' + r.candidates).join(', ') + ' (kept/passed/candidates)\nexport const POOL = ' + JSON.stringify(POOL) + ';\n/*END-POOL*/';
writeFileSync(file, src.replace(/\/\*POOL\*\/[\s\S]*?\/\*END-POOL\*\//, () => block));
writeFileSync(here + 'composer-report.json', JSON.stringify(report, null, 1) + '\n');
}
