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
//  - balance: the ground or any paint covers ≤ 82 % of the court.
// Measured and stored: area share per slot (paint m²), masking-edge length in metres, mode tag.
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { COMPOSER_GRAMMARS, composeSlots } from './court-composer.mjs';

// Playwright from the project, or the machine-wide install (NODE_PATH=$(npm root -g))
let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }
const here = new URL('.', import.meta.url).pathname;
const N = +(process.argv[2] || 220), POOL_SIZE = +(process.argv[3] || 36);
const LABEL = ['#000000', '#3C0000', '#003C00', '#00003C', '#3C3C00'];
const hashS = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const toSvg = (g, h, sc = 1) => '<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" viewBox="0 0 600 ' + h + '" width="' + 600 * sc + '" height="' + h * sc + '">' + g.replace(/§(\d)/g, (_, i) => LABEL[+i]) + '</svg>';

// runs inside the page
const ANALYSE = `
window.analyse = async (svg, W, H, sig, sc) => {
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
    for (let i = 0; i < N; i++) { if (!mask[i] || seen[i]) continue; let n = 0, sp = 0; st[sp++] = i; seen[i] = 1; let edge = false;
      while (sp) { const j = st[--sp]; n++; const x = j % W, y = (j / W) | 0; if (x === 0 || y === 0 || x === W-1 || y === H-1) edge = true;
        if (x > 0 && mask[j-1] && !seen[j-1]) { seen[j-1] = 1; st[sp++] = j-1; } if (x < W-1 && mask[j+1] && !seen[j+1]) { seen[j+1] = 1; st[sp++] = j+1; }
        if (y > 0 && mask[j-W] && !seen[j-W]) { seen[j-W] = 1; st[sp++] = j-W; } if (y < H-1 && mask[j+W] && !seen[j+W]) { seen[j+W] = 1; st[sp++] = j+W; } }
      if (n >= minArea) out.push({ n, edge }); }
    return out; };
  let thinBad = 0, thinPx = 0, specks = 0;
  for (let k = 0; k < 5; k++) { if (!area[k]) continue; const m = new Uint8Array(N); for (let i = 0; i < N; i++) m[i] = lab[i] === k ? 1 : 0;
    const d = dt(m); const er = new Uint8Array(N); for (let i = 0; i < N; i++) er[i] = d[i] >= 12 * sc ? 1 : 0; // core: ≥ 4 px (court scale) from the edge
    const notEr = new Uint8Array(N); for (let i = 0; i < N; i++) notEr[i] = er[i] ? 0 : 1; const d2 = dt(notEr); // distance to the core
    const thin = new Uint8Array(N); for (let i = 0; i < N; i++) if (m[i] && d2[i] > 13.5 * sc) { thin[i] = 1; thinPx++; }
    thinBad += comps(thin, 40 * sc * sc).length;
    specks += comps(m, 1).filter((c) => c.n < 144 * sc * sc).length; }
  // symmetry with a 1 px (court scale) tolerance: rasterising a turned edge can move it by a pixel
  const tol = sc; const hasNear = (x, y, v) => { for (let dy = -tol; dy <= tol; dy++) for (let dx = -tol; dx <= tol; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && lab[yy*W+xx] === v) return true; } return false; };
  let rot = 0, mir = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = lab[y*W+x]; if (v !== lab[(H-1-y)*W + (W-1-x)] && !hasNear(W-1-x, H-1-y, v)) rot++; if (v !== lab[y*W + (W-1-x)] && !hasNear(W-1-x, y, v)) mir++; }
  let edges = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y*W + x; if (x < W-1 && lab[i] !== lab[i+1]) edges++; if (y < H-1 && lab[i] !== lab[i+W]) edges++; }
  let s = null; if (sig) { s = []; const cs = 10 * sc; for (let y = 0; y < H; y += cs) for (let x = 0; x < W; x += cs) { let e = 0; for (let yy = y; yy < Math.min(H, y+cs) && !e; yy++) for (let xx = x; xx < Math.min(W, x+cs) - 1; xx++) if (lab[yy*W+xx] !== lab[yy*W+xx+1] || (yy < H-1 && lab[yy*W+xx] !== lab[(yy+1)*W+xx])) { e = 1; break; } s.push(e); } }
  return { area: area.map((a) => a / N), thinBad, thinPx: thinPx / (sc * sc), specks, sym: Math.min(rot, mir) / N, edges: edges / sc, sig: s };
};`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
await page.addScriptTag({ content: ANALYSE });

// optional 3rd argument: comma-separated families to (re)curate; the others keep their pool and report
const only = process.argv[4] ? process.argv[4].split(',') : null;
const prev = only ? await import('./court-composer.mjs?' + Date.now()) : null;
const POOL = only ? { ...prev.POOL } : {}; let report = {}; try { if (only) report = JSON.parse(readFileSync(here + 'composer-report.json', 'utf8')); } catch {}
for (const fid of Object.keys(COMPOSER_GRAMMARS)) {
  if (only && !only.includes(fid)) continue;
  const base = hashS(fid); const cands = [];
  const reasons = { thin: 0, specks: 0, paints: 0, sym: 0, balance: 0 };
  // N candidates, more (up to 3 N) for strict families until 2.5 x the pool has passed
  let tried = 0;
  for (let i = 0; i < 3 * N && (i < N || cands.length < POOL_SIZE * 2.5); i++, tried++) {
    const seed = (base + i * 7919) % 999983 + 1;
    const a = composeSlots(fid, seed, 400), b = composeSlots(fid, seed, 600);
    const [m4, m6] = await page.evaluate(async ([s4, s6]) => [await window.analyse(s4, 1200, 800, true, 2), await window.analyse(s6, 600, 600, false, 1)], [toSvg(a.g, 400, 2), toSvg(b.g, 600)]);
    const used = m4.area.filter((x) => x > 0.003).length;
    let why = null;
    if (m4.thinBad || m6.thinBad) why = 'thin'; else if (m4.specks > 2 || m6.specks > 2) why = 'specks'; else if (used < 3 || used > 5) why = 'paints'; else if (m4.sym > 0.012 || m6.sym > 0.012) why = 'sym'; else if (Math.max(...m4.area) > 0.82) why = 'balance';
    if (why) { reasons[why]++; continue; }
    const tape = Math.round((m4.edges / 40) * 0.82); // px edges -> metres; 0.82 corrects staircase over-count on curves and diagonals
    cands.push({ seed, mode: a.mode, area: m4.area, tape, used, sig: m4.sig, thinPx: m4.thinPx + m6.thinPx });
  }
  // score: clean edges, balanced paint, moderate masking (≈ 1–3 m of tape per m²)
  for (const c of cands) { const t = c.tape / 150; const bal = 1 - Math.max(...c.area); c.score = bal * 1.2 - Math.abs(Math.log((t + 0.3) / 1.8)) * 0.6 - c.thinPx / 4000 + (c.used >= 4 ? 0.1 : 0); }
  cands.sort((x, y) => y.score - x.score);
  // varied pick: round-robin over modes, reject near-duplicates (structure Jaccard distance < 0.35)
  const jd = (p, q) => { let i = 0, u = 0; for (let k = 0; k < p.length; k++) { if (p[k] && q[k]) i++; if (p[k] || q[k]) u++; } return u ? 1 - i / u : 0; };
  const byMode = {}; for (const c of cands) (byMode[c.mode] = byMode[c.mode] || []).push(c);
  const modes = Object.keys(byMode).sort((x, y) => byMode[y][0].score - byMode[x][0].score); const chosen = [];
  for (let minD = 0.35; minD >= 0.1 && chosen.length < POOL_SIZE; minD -= 0.08) {
    let progress = true; while (chosen.length < POOL_SIZE && progress) { progress = false; for (const md of modes) { if (chosen.length >= POOL_SIZE) break; const list = byMode[md]; const k = list.findIndex((c) => !chosen.includes(c) && chosen.every((o) => jd(o.sig, c.sig) >= minD)); if (k >= 0) { chosen.push(list[k]); progress = true; } } }
  }
  POOL[fid] = chosen.map((c) => ({ s: c.seed, m: { a: c.area.map((x) => Math.round(x * 1000) / 1000), t: c.tape, w: 20, md: c.mode } }));
  report[fid] = { candidates: tried, passed: cands.length, kept: chosen.length, rejected: reasons, modes: [...new Set(chosen.map((c) => c.mode))].length, tapeMedian: chosen.length ? chosen.map((c) => c.tape).sort((a, b) => a - b)[chosen.length >> 1] : 0 };
  console.log(fid, JSON.stringify(report[fid]));
}
await browser.close();

const file = here + 'court-composer.mjs'; const src = readFileSync(file, 'utf8');
const block = '/*POOL*/\n// ' + new Date().toISOString().slice(0, 10) + ': ' + Object.entries(report).map(([k, r]) => k.replace('pro-k-', '') + ' ' + r.kept + '/' + r.passed + '/' + r.candidates).join(', ') + ' (kept/passed/candidates)\nexport const POOL = ' + JSON.stringify(POOL) + ';\n/*END-POOL*/';
writeFileSync(file, src.replace(/\/\*POOL\*\/[\s\S]*?\/\*END-POOL\*\//, () => block));
writeFileSync(here + 'composer-report.json', JSON.stringify(report, null, 1) + '\n');
console.log('pool written');
