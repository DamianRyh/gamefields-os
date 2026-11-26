// Gamefields Court Composer — generative, self-checking surface model (2026-11-26).
// Pure ESM, no dependencies. Plugs into Court Art Pro (renderer "pro", ids "pro-k-*").
//
// How it differs from the hand-written families:
//  1. Every family is a grammar anchored on the court itself (centre circle, keys, goals, halves),
//     with parameters drawn from a seed instead of 12 fixed compositions.
//  2. Geometry is written in colour SLOTS (0 = ground, 1..4 = paints), not in colours, so one
//     validation covers every palette.
//  3. curate-composer.mjs renders hundreds of candidates per family in Chromium, measures them on a
//     raster (min. 20 cm width, max. 5 paints, symmetry, specks, masking-tape length, paint areas)
//     and keeps only the best and most varied ones. Their seeds and measurements live in POOL below,
//     so the Studio only ever shows checked designs, and the price estimate can use real numbers.
//
// Variant v (1..12) picks POOL[family][v-1]; the Studio's patternSeed (shuffle) pages through the rest
// of the checked pool. Court reference: 600 x h box, h = 400 for a 15 x 10 m court (40 px = 1 m).

const W = 600;
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const f = (n) => Math.round(n * 10) / 10;
const pts = (list) => list.map((p) => f(p[0]) + ',' + f(p[1])).join(' ');
const P = (list, s) => (list.length > 2 ? '<polygon points="' + pts(list) + '" fill="§' + s + '"/>' : '');
const Rc = (x, y, w, h, s, rx) => '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(Math.max(0, w)) + '" height="' + f(Math.max(0, h)) + '"' + (rx ? ' rx="' + f(rx) + '"' : '') + ' fill="§' + s + '"/>';
const Ci = (x, y, r, s) => '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(Math.max(0, r)) + '" fill="§' + s + '"/>';
const D = (d, s) => '<path d="' + d + '" fill="§' + s + '"/>';
const rot180 = (h, g) => '<g transform="rotate(180 300 ' + f(h / 2) + ')">' + g + '</g>';
const mirX = (g) => '<g transform="matrix(-1 0 0 1 600 0)">' + g + '</g>';
const mirY = (h, g) => '<g transform="matrix(1 0 0 -1 0 ' + f(h) + ')">' + g + '</g>';
const pickR = (R, list) => list[Math.floor(R() * list.length) % list.length];
const intR = (R, a, b) => a + Math.floor(R() * (b - a + 1));
const TAU = Math.PI * 2;

function clipHalf(polyIn, px, py, nx, ny) { // keep (x-px)*nx+(y-py)*ny <= 0
  const out = [];
  for (let i = 0; i < polyIn.length; i++) {
    const a = polyIn[i], b = polyIn[(i + 1) % polyIn.length];
    const da = (a[0] - px) * nx + (a[1] - py) * ny, db = (b[0] - px) * nx + (b[1] - py) * ny;
    if (da <= 0) out.push(a);
    if ((da <= 0) !== (db <= 0)) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}
function sectorPts(cx, cy, r0, r1, a0, a1) {
  const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 0.06)); const out = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]); }
  if (r0 <= 0.5) out.push([cx, cy]); else for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0]); }
  return out;
}
function closedCurve(p) {
  const n = p.length; let d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d + 'Z';
}
// Catmull-Rom sampled into a dense polyline
function sampleSpline(p, per = 24) {
  const out = []; const n = p.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(n - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      const q = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(p[n - 1]); return out;
}
function offsetLine(line, d) {
  return line.map((p, i) => { const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)]; const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; return [p[0] - (ty / l) * d, p[1] + (tx / l) * d]; });
}

/* ---------------- grammars ---------------- */
// Each returns { g: SVG with §slot fills, mode: short tag used to keep the curated set varied }.

// Echo — the court's own lines, echoed outward as paintable bands (centre circle rings, key offsets).
function echo(R, h) {
  const cy = h / 2; const bw = pickR(R, [20, 24, 28, 32, 40]); const n = intR(R, 2, 5); const k = intR(R, 2, 3); const withGround = R() < 0.45; const mode = intR(R, 0, 2);
  const seq = (i) => (withGround ? (i % 2 ? 1 + ((i >> 1) % k) : 0) : 1 + (i % k));
  let g = '';
  if (mode >= 1) {
    let key = ''; const nk = mode === 2 ? Math.max(1, n - 1) : n;
    for (let i = nk; i >= 0; i--) { const o = i * bw; key += Rc(-60, cy - 75 - o, 145 + o, 150 + 2 * o, i === 0 ? 1 + (k % 3) : seq(i), Math.min(o, 60)); }
    g += key + mirX(key);
  }
  if (mode !== 1) { for (let i = n; i >= 1; i--) g += Ci(300, cy, 45 + i * bw - (withGround ? 0 : 0), seq(i)); g += Ci(300, cy, 45, 1 + ((k + 1) % 3)); }
  if (mode === 1 && R() < 0.6) g += Rc(300 - bw, 0, bw * 2, h, seq(1));
  return { g, mode: 'echo' + mode };
}

// Zones — the playing zones themselves coloured: keys, centre circle, centre strip, side bands, corners.
function zones(R, h) {
  const cy = h / 2; let g = ''; let s = intR(R, 0, 3); const nx = () => 1 + (s++ % 4); const feats = [];
  if (R() < 0.45) { const t = R() < 0.5; const sl = nx(); feats.push('tri'); const tri = t ? [[0, 0], [pickR(R, [180, 220, 260]), 0], [0, h]] : [[0, 0], [pickR(R, [120, 160]), 0], [pickR(R, [120, 160]), h], [0, h]]; g += P(tri, sl) + rot180(h, P(tri, sl)); }
  if (R() < 0.5) { const cw = pickR(R, [40, 80, 120, 160]); g += Rc(300 - cw / 2, 0, cw, h, nx()); feats.push('strip'); }
  if (R() < 0.45) { const sb = pickR(R, [24, 32, 40]); const sl = nx(); g += Rc(0, 0, W, sb, sl) + Rc(0, h - sb, W, sb, sl); feats.push('side'); }
  if (R() < 0.4) { const r = pickR(R, [60, 80, 100]); const sl = nx(); const q = Ci(0, 0, r, sl) + Ci(0, h, r, sl); g += q + mirX(q); feats.push('corner'); }
  if (R() < 0.75 || feats.length < 2) { const m = R() < 0.4 ? pickR(R, [20, 30, 40]) : 0; const a = nx(); const b = m ? nx() : a; let key = ''; if (m) key += Rc(-30, cy - 75 - m, 115 + m, 150 + 2 * m, b, m); key += Rc(-30, cy - 75, 115, 150, a); g += key + mirX(key); feats.push('key'); }
  if (R() < 0.85 || feats.length < 3) { const ring = R() < 0.5; const a = nx(); if (ring) { const bw = pickR(R, [20, 30, 40]); g += Ci(300, cy, 45 + bw, a) + Ci(300, cy, 45, R() < 0.5 ? 0 : nx()); } else g += Ci(300, cy, pickR(R, [45, 60, 75]), a); feats.push('centre'); }
  return { g, mode: 'zones' + feats.length };
}

// Rays — sectors fanning out of the goals, the corners or the centre; inner hub keeps the tips paintable.
function rays(R, h) {
  const cy = h / 2; const mode = intR(R, 0, 2); const n = mode === 1 ? pickR(R, [12, 16, 20, 24]) : pickR(R, [6, 8, 10, 12, 14]); const k = intR(R, 1, 3); const withGround = k === 1 || R() < 0.4;
  // colour cycle that repeats exactly every half turn, so the centre star is point-symmetric
  const cyc = withGround ? 2 * k : k; const seqRaw = (i) => (withGround ? (i % 2 ? 1 + ((i >> 1) % k) : 0) : 1 + (i % k));
  const seq = (i) => seqRaw(mode === 1 ? (i % (n / 2)) % cyc : i);
  const lim = R() < 0.5; let g = '';
  const fan = (cx, cyy, a0, a1, r1) => { const da = (a1 - a0) / n; const r0 = Math.max(14 / da, 30); let out = ''; for (let i = 0; i < n; i++) out += P(sectorPts(cx, cyy, r0 - 1, r1, a0 + i * da, a0 + (i + 1) * da), seq(i)); return out + Ci(cx, cyy, r0, 1 + (k % 4)); };
  if (mode === 0) { const r1 = lim ? pickR(R, [h * 0.45, h * 0.55, 240]) : 900; const half = fan(0, cy, -Math.PI / 2, Math.PI / 2, r1); g += half + mirX(half); }
  else if (mode === 1) { const r1 = lim ? pickR(R, [h * 0.4, h * 0.48]) : 900; g += fan(300, cy, 0, TAU, r1); }
  else { const r1 = lim ? pickR(R, [h * 0.5, h * 0.62]) : 420; const c = fan(0, 0, 0, Math.PI / 2, r1); const left = c + mirY(h, c); g += left + mirX(left); }
  return { g, mode: 'rays' + mode + (lim ? 'l' : '') };
}

// Chevrons — V bands pointing at the goals (or at the centre), mirrored about the centre line.
function chevron(R, h) {
  const cy = h / 2; const k = pickR(R, [0.5, 0.8, 1.1]); const s = cy * k; const perp = 1 / Math.sqrt(1 + k * k);
  const bw = Math.max(pickR(R, [18, 24, 30, 40]), Math.ceil(14 / perp)); const gap = pickR(R, [0, 0.5, 1]) * bw; const kk = intR(R, 2, 4); const towardGoal = R() < 0.6; const x0 = pickR(R, [-s, 0, 60, 100]);
  let half = ''; let i = 0;
  for (let a = x0; a < 300 + s && i < 40; a += bw + gap, i++) {
    const band = towardGoal ? [[a + s, -2], [a, cy], [a + s, h + 2], [a + s + bw, h + 2], [a + bw, cy], [a + s + bw, -2]] : [[a, -2], [a + s, cy], [a, h + 2], [a + bw, h + 2], [a + s + bw, cy], [a + bw, -2]];
    const sl = gap ? 1 + (i % kk) : (i % (kk + 1));
    half += P(clipHalf(band, 300, 0, 1, 0), sl);
  }
  return { g: half + mirX(half), mode: 'chev' + (towardGoal ? 'g' : 'c') + (gap ? 'gap' : '') };
}

// Flow — a ribbon of bands running goal to goal through the centre spot, point-symmetric.
function flow(R, h) {
  const cy = h / 2; const a1 = pickR(R, [0.15, 0.25, 0.35]) * h * (R() < 0.5 ? 1 : -1); const a2 = pickR(R, [0.1, 0.2, 0.28]) * h * (R() < 0.5 ? 1 : -1);
  const line = sampleSpline([[-60, cy + a1], [110, cy - a2], [300, cy], [490, cy + a2], [660, cy - a1]], 30);
  const n = pickR(R, [3, 4, 5, 6, 7]); const bw = pickR(R, [22, 28, 34, 44]); const k = intR(R, 2, 4); const gapG = R() < 0.35;
  let g = ''; const T = n * bw;
  for (let i = 0; i < n; i++) {
    const d0 = -T / 2 + i * bw, d1 = d0 + bw; const j = Math.min(i, n - 1 - i); const sl = gapG ? (j % 2 ? 0 : 1 + ((j >> 1) % k)) : 1 + (j % k);
    if (sl) g += P([...offsetLine(line, d0), ...offsetLine(line, d1).reverse()], sl);
  }
  const twin = R() < 0.3; if (twin) { const off = T / 2 + pickR(R, [40, 60]); const b = pickR(R, [20, 28]); const one = P([...offsetLine(line, off), ...offsetLine(line, off + b).reverse()], 1 + (n % k)); const two = P([...offsetLine(line, -off - b), ...offsetLine(line, -off).reverse()], 1 + (n % k)); g += one + two; }
  return { g, mode: 'flow' + (twin ? 't' : '') + (gapG ? 'g' : '') };
}

// Shards — large Voronoi plates with point-symmetric seeds and colours, optional grout of ground.
function shards(R, h) {
  const sp = pickR(R, [95, 115, 140]); const k = intR(R, 3, 4); const grout = pickR(R, [0, 0, 12, 16]); const pts0 = [];
  for (let y = -sp / 2; y < h + sp / 2; y += sp * 0.86) { const row = Math.round(y / (sp * 0.86)); for (let x = -sp / 2 + (row % 2) * sp / 2; x < 300; x += sp) pts0.push([x + (R() - 0.5) * sp * 0.7, y + (R() - 0.5) * sp * 0.7]); }
  const seeds = []; for (const p of pts0) { if (p[0] >= 300 - 8) continue; seeds.push(p); } const m = seeds.length; for (let i = 0; i < m; i++) seeds.push([600 - seeds[i][0], h - seeds[i][1]]);
  const cells = seeds.map((p, i) => { let c = [[-2, -2], [602, -2], [602, h + 2], [-2, h + 2]]; for (let j = 0; j < seeds.length; j++) { if (j === i) continue; const q = seeds[j]; c = clipHalf(c, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, q[0] - p[0], q[1] - p[1]); if (!c.length) break; } return c; });
  const near = (i, j) => { const p = seeds[i], q = seeds[j]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) > sp * 2.6) return false; let c = 0; for (const v of cells[i]) if (Math.abs(Math.hypot(v[0] - p[0], v[1] - p[1]) - Math.hypot(v[0] - q[0], v[1] - q[1])) < 0.6) c++; return c >= 2; };
  const col = new Array(seeds.length).fill(0); const partner = (i) => (i < m ? i + m : i - m);
  for (let i = 0; i < m; i++) { const used = new Set(); for (const a of [i, partner(i)]) for (let j = 0; j < seeds.length; j++) if (col[j] && near(a, j)) used.add(col[j]); const free = []; for (let s = 1; s <= k; s++) if (!used.has(s)) free.push(s); const c = free.length ? pickR(R, free) : 1 + intR(R, 0, k - 1); col[i] = c; col[partner(i)] = c; }
  const shrink = (cell, d) => { if (!d) return cell; const cx = cell.reduce((s, p) => s + p[0], 0) / cell.length, cyy = cell.reduce((s, p) => s + p[1], 0) / cell.length; return cell.map((p) => { const dx = p[0] - cx, dy = p[1] - cyy, l = Math.hypot(dx, dy) || 1; const q = Math.max(0, l - d) / l; return [cx + dx * q, cyy + dy * q]; }); };
  let g = ''; cells.forEach((c, i) => { if (c.length > 2) g += P(shrink(c, grout / 2), col[i]); });
  return { g, mode: 'shard' + (grout ? 'g' : '') + sp };
}

// Terrain — nested contour bands around the centre or two point-symmetric hills.
function terrain(R, h) {
  const cy = h / 2; const mode = intR(R, 0, 1); const st = pickR(R, [20, 26, 34]); const n = intR(R, 3, 6); const amp = pickR(R, [0.12, 0.2, 0.3]); const k = intR(R, 2, 4);
  const ph = [R() * TAU, R() * TAU, R() * TAU]; const sx = pickR(R, [1, 1.25, 1.5]);
  const noise = (a, even) => (even ? Math.sin(2 * a + ph[0]) * 0.6 + Math.sin(4 * a + ph[1]) * 0.4 : Math.sin(2 * a + ph[0]) * 0.5 + Math.sin(3 * a + ph[1]) * 0.3 + Math.sin(a + ph[2]) * 0.2);
  const seq = (i) => { const p = 2 * k - 2 || 1; const t = i % p; return 1 + (t < k ? t : p - t); };
  const hill = (cx, cyy, r0, levels, even) => { let out = ''; for (let i = levels; i >= 0; i--) { const r = r0 + i * st; const pp = []; for (let j = 0; j < 36; j++) { const a = (j / 36) * TAU; const m = 1 + amp * noise(a, even); pp.push([cx + Math.cos(a) * r * m * sx, cyy + Math.sin(a) * r * m]); } out += D(closedCurve(pp), seq(levels - i)); } return out; };
  let g;
  if (mode === 0) g = hill(300, cy, pickR(R, [30, 45, 60]), n, true);
  else {
    // two hills, one the 180° turn of the other; they must not overlap or the symmetry breaks
    const cx = pickR(R, [110, 140, 170]), cyy = cy + pickR(R, [-0.2, 0, 0.2]) * h; const r0 = 24;
    const room = Math.hypot(300 - cx, cy - cyy) - 6; const nn = Math.max(2, Math.min(n, Math.floor((room / ((1 + amp) * sx) - r0) / st)));
    const one = hill(cx, cyy, r0, nn, false); g = one + rot180(h, one);
  }
  return { g, mode: 'terr' + mode };
}

// Pixel field — a grid centred on the court; cell size or colour follows a symmetric field.
function pixel(R, h) {
  const cy = h / 2; const s = pickR(R, [24, 30, 40]); const mode = intR(R, 0, 1); const fieldKind = intR(R, 0, 2); const k = intR(R, 2, 3); const dither = R() < 0.5;
  const nxh = Math.ceil(300 / s), nyh = Math.ceil(cy / s); let g = '';
  const field = (x, y) => { if (fieldKind === 0) return Math.min(Math.hypot(x, y - cy), Math.hypot(600 - x, y - cy)) / 300; if (fieldKind === 1) return Math.hypot(x - 300, (y - cy) * 1.4) / 300; return Math.abs((x - 300) * 0.8 + (y - cy) * 1.2) / 300; };
  const nv = (i, j) => { const a = i + ',' + j, b = (-1 - i) + ',' + (-1 - j); const key = a < b ? a : b; return (hash(key + ':' + s) % 1000) / 1000; };
  for (let j = -nyh; j < nyh; j++) for (let i = -nxh; i < nxh; i++) {
    const x = 300 + i * s, y = cy + j * s; let v = Math.min(1, field(x + s / 2, y + s / 2)); if (dither) v += (nv(i, j) - 0.5) * 0.18; v = Math.max(0, Math.min(0.999, v));
    if (mode === 0) { const side = Math.round(10 + (s - 20) * (1 - v)); if (side < 10) continue; const o = (s - side) / 2; g += Rc(x + o, y + o, side, side, 1 + (Math.floor(v * k) % k)); }
    else { const lvl = Math.floor(v * (k + 1)); if (lvl === k) continue; g += Rc(x, y, s, s, 1 + lvl); }
  }
  return { g, mode: 'pix' + mode + fieldKind };
}

/* ---------------- colour plan ---------------- */
function hex2rgb(hx) { hx = hx.replace('#', ''); if (hx.length === 3) hx = hx.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(hx.slice(i, i + 2), 16) / 255); }
function L_(hx) { const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)); const [r, g, b] = hex2rgb(hx).map(lin); const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s; }
// slot -> colour; ground is the lightest or darkest paint, the other four in a seeded order
export function composerPlan(seed, colors) {
  const R = rng((seed ^ 0x9E3779B9) >>> 0); const L = [...colors].sort((a, b) => L_(a) - L_(b)); const dark = R() < 0.28; const ground = dark ? L[0] : L[4]; const rest = dark ? L.slice(1) : L.slice(0, 4);
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
  return [ground, ...rest];
}

export const COMPOSER_GRAMMARS = { 'pro-k-echo': echo, 'pro-k-zones': zones, 'pro-k-rays': rays, 'pro-k-chevron': chevron, 'pro-k-flow': flow, 'pro-k-shards': shards, 'pro-k-terrain': terrain, 'pro-k-pixel': pixel };

// raw geometry for a seed (slot fills) — used by the curator
export function composeSlots(familyId, seed, h = 400) { const gr = COMPOSER_GRAMMARS[familyId]; if (!gr) return null; const out = gr(rng(seed), h); return { g: '<rect x="0" y="0" width="600" height="' + f(h) + '" fill="§0"/>' + out.g, mode: out.mode }; }
export function composeSeed(familyId, seed, h, colors) { const s = composeSlots(familyId, seed, h); if (!s) return ''; const plan = composerPlan(seed, colors); return s.g.replace(/§(\d)/g, (_, i) => plan[+i] || plan[0]); }

/* ---------------- curated pool (written by curate-composer.mjs) ---------------- */
/*POOL*/
// 2026-11-26: echo 6/11/12, zones 6/10/12, rays 6/7/12, chevron 6/8/12, flow 6/8/12, shards 3/3/12, terrain 6/11/12, pixel 5/6/12 (kept/passed/candidates)
export const POOL = {"pro-k-echo":[{"s":371006,"m":{"a":[0.033,0.383,0.378,0.206,0],"t":136,"w":20,"md":"echo2"}},{"s":363087,"m":{"a":[0.552,0.195,0.253,0,0],"t":113,"w":20,"md":"echo0"}},{"s":378925,"m":{"a":[0.58,0.194,0.156,0.071,0],"t":153,"w":20,"md":"echo2"}},{"s":331411,"m":{"a":[0.644,0.137,0.22,0,0],"t":69,"w":20,"md":"echo0"}},{"s":386844,"m":{"a":[0.587,0.134,0.173,0.106,0],"t":122,"w":20,"md":"echo2"}},{"s":323492,"m":{"a":[0.562,0.137,0.196,0.106,0],"t":75,"w":20,"md":"echo2"}}],"pro-k-zones":[{"s":411112,"m":{"a":[0.224,0.195,0.304,0.155,0.122],"t":99,"w":20,"md":"zones6"}},{"s":434869,"m":{"a":[0.411,0.18,0.076,0.226,0.106],"t":82,"w":20,"md":"zones5"}},{"s":403193,"m":{"a":[0.352,0.36,0.134,0.106,0.047],"t":64,"w":20,"md":"zones4"}},{"s":387355,"m":{"a":[0.48,0.2,0.106,0,0.214],"t":51,"w":20,"md":"zones3"}},{"s":395274,"m":{"a":[0.467,0.086,0.047,0,0.4],"t":47,"w":20,"md":"zones3"}},{"s":363598,"m":{"a":[0.663,0.084,0.106,0.059,0.089],"t":61,"w":20,"md":"zones3"}}],"pro-k-rays":[{"s":786321,"m":{"a":[0.306,0.328,0.329,0.037,0],"t":138,"w":20,"md":"rays0l"}},{"s":770483,"m":{"a":[0.487,0.487,0.026,0,0],"t":126,"w":20,"md":"rays1"}},{"s":810078,"m":{"a":[0.814,0.149,0.037,0,0],"t":88,"w":20,"md":"rays1l"}},{"s":825916,"m":{"a":[0.688,0.3,0.012,0,0],"t":69,"w":20,"md":"rays0l"}},{"s":754645,"m":{"a":[0.492,0.492,0.017,0,0],"t":102,"w":20,"md":"rays1"}},{"s":802159,"m":{"a":[0.494,0.494,0.012,0,0],"t":81,"w":20,"md":"rays1"}}],"pro-k-chevron":[{"s":239629,"m":{"a":[0.25,0.25,0.25,0.25,0],"t":220,"w":20,"md":"chevg"}},{"s":184196,"m":{"a":[0.486,0.218,0.167,0.13,0],"t":225,"w":20,"md":"chevggap"}},{"s":192115,"m":{"a":[0.616,0.153,0.128,0.103,0],"t":283,"w":20,"md":"chevcgap"}},{"s":207953,"m":{"a":[0.333,0.157,0.17,0.17,0.17],"t":342,"w":20,"md":"chevggap"}},{"s":168358,"m":{"a":[0.426,0.314,0.261,0,0],"t":280,"w":20,"md":"chevggap"}},{"s":255467,"m":{"a":[0.627,0.157,0.128,0.088,0],"t":220,"w":20,"md":"chevggap"}}],"pro-k-flow":[{"s":301488,"m":{"a":[0.442,0.177,0.191,0.191,0],"t":100,"w":20,"md":"flow"}},{"s":261893,"m":{"a":[0.737,0.188,0.074,0,0],"t":118,"w":20,"md":"flowtg"}},{"s":293569,"m":{"a":[0.46,0.36,0.18,0,0],"t":96,"w":20,"md":"flow"}},{"s":222298,"m":{"a":[0.65,0.141,0.14,0.07,0],"t":127,"w":20,"md":"flow"}},{"s":246055,"m":{"a":[0.612,0.233,0.156,0,0],"t":105,"w":20,"md":"flow"}},{"s":269812,"m":{"a":[0.704,0.178,0.118,0,0],"t":103,"w":20,"md":"flow"}}],"pro-k-shards":[{"s":542186,"m":{"a":[0,0.171,0.266,0.263,0.3],"t":131,"w":20,"md":"shard95"}},{"s":526348,"m":{"a":[0,0.237,0.058,0.367,0.338],"t":86,"w":20,"md":"shard140"}},{"s":534267,"m":{"a":[0,0.23,0.168,0.281,0.321],"t":123,"w":20,"md":"shard95"}}],"pro-k-terrain":[{"s":582077,"m":{"a":[0.067,0.233,0.441,0.259,0],"t":167,"w":20,"md":"terr0"}},{"s":518725,"m":{"a":[0.597,0.155,0.17,0.078,0],"t":147,"w":20,"md":"terr1"}},{"s":589996,"m":{"a":[0.59,0.117,0.175,0.118,0],"t":142,"w":20,"md":"terr0"}},{"s":510806,"m":{"a":[0.722,0.17,0.108,0,0],"t":88,"w":20,"md":"terr1"}},{"s":566239,"m":{"a":[0.492,0.262,0.246,0,0],"t":133,"w":20,"md":"terr0"}},{"s":534563,"m":{"a":[0.727,0.172,0.101,0,0],"t":84,"w":20,"md":"terr1"}}],"pro-k-pixel":[{"s":761575,"m":{"a":[0.275,0.278,0.233,0.215,0],"t":82,"w":20,"md":"pix12"}},{"s":801170,"m":{"a":[0.365,0.072,0.226,0.338,0],"t":66,"w":20,"md":"pix10"}},{"s":777413,"m":{"a":[0.543,0.06,0.158,0.24,0],"t":71,"w":20,"md":"pix11"}},{"s":769494,"m":{"a":[0.515,0.128,0.358,0,0],"t":57,"w":20,"md":"pix10"}},{"s":753656,"m":{"a":[0.621,0.096,0.283,0,0],"t":49,"w":20,"md":"pix11"}}]};
/*END-POOL*/

export function composerEntry(familyId, variant, seed = 0) {
  const pool = POOL[familyId]; const v = Math.max(1, Math.min(12, Math.round(variant) || 1));
  if (!pool || !pool.length) return { s: hash(familyId + ':' + v + ':' + seed), m: null };
  const pages = Math.max(1, Math.floor(pool.length / 12)); const idx = ((v - 1) + 12 * ((seed >>> 0) % pages)) % pool.length; return pool[idx];
}
export function renderComposer(familyId, variant, h, colors, opts = {}) { return composeSeed(familyId, composerEntry(familyId, variant, opts.seed || 0).s, h, colors); }

// Measured execution numbers for a 15 x 10 m court, scaled to the real area (m²).
// paint: m² per actual colour; tape: metres of masking edge; masking label from tape per m².
export function composerMetrics(familyId, variant, colors, { seed = 0, area = 150 } = {}) {
  const e = composerEntry(familyId, variant, seed); if (!e.m) return null; const plan = composerPlan(e.s, colors); const k = area / 150; const paint = {};
  e.m.a.forEach((fr, i) => { if (fr > 0) { const c = plan[i]; paint[c] = Math.round(((paint[c] || 0) + fr * area) * 10) / 10; } });
  const tape = Math.round(e.m.t * Math.sqrt(k)); const perM2 = e.m.t / 150; const masking = perM2 < 1 ? 'niska' : perM2 < 2 ? 'średnia' : perM2 < 3.2 ? 'wysoka' : 'bardzo wysoka';
  return { colors: Object.keys(paint).length, paint, tape, masking, minWidthCm: e.m.w };
}

const meta = (id, name, short, group, description, inspiration) => ({ id, name, short, group, description, inspiration });
export const COMPOSER_FAMILIES = [
  meta('pro-k-echo', 'Echo', 'ECHO', 'premium', 'Linie boiska powtórzone na zewnątrz pasami: pierścienie wokół koła środkowego i obwiednie pól bramkowych.', 'Kompozytor: geometria gry'),
  meta('pro-k-zones', 'Strefy gry', 'ZONES', 'geometric', 'Kolorem malowane same strefy gry: pola bramkowe, koło, pas środkowy, narożniki. Mało taśmy, czytelna gra.', 'Kompozytor: geometria gry'),
  meta('pro-k-rays', 'Promienie', 'RAYS', 'street', 'Wachlarze promieni z bramek, narożników albo ze środka, z piastą, dzięki której ostrza są malowalne.', 'Kompozytor: geometria gry'),
  meta('pro-k-chevron', 'Szewrony', 'CHEV', 'brand', 'Pasy w kształcie V skierowane na bramki albo do środka, lustrzane względem linii środkowej.', 'Kompozytor: geometria gry'),
  meta('pro-k-flow', 'Tor', 'FLOW', 'organic', 'Wstęga pasów biegnąca od bramki do bramki przez punkt środkowy, symetryczna po obrocie.', 'Kompozytor: geometria gry'),
  meta('pro-k-shards', 'Płyty', 'PLATE', 'geometric', 'Duże płyty Voronoi, sąsiednie zawsze w innym kolorze, opcjonalnie z fugą koloru tła.', 'Kompozytor: geometria gry'),
  meta('pro-k-terrain', 'Teren', 'TERR', 'organic', 'Warstwice jak na mapie: jedno wzgórze w kole środkowym albo dwa naprzeciw siebie.', 'Kompozytor: geometria gry'),
  meta('pro-k-pixel', 'Pole pikseli', 'PIX', 'play', 'Siatka od środka boiska: wielkość albo kolor kafla płynie w stronę bramek, środka lub po przekątnej.', 'Kompozytor: geometria gry'),
];
export function composerMasking(familyId) { const pool = POOL[familyId]; if (!pool || !pool.length) return 'średnia'; const t = pool.slice(0, 12).map((e) => e.m.t).sort((a, b) => a - b)[Math.min(5, pool.length - 1)] / 150; return t < 1 ? 'niska' : t < 2 ? 'średnia' : t < 3.2 ? 'wysoka' : 'bardzo wysoka'; }
