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
  // clip: keep each fan in its own half (goals) or quarter (corners) so the mirrored copy never paints over it
  const fan = (cx, cyy, a0, a1, r1, clip) => { const da = (a1 - a0) / n; const r0 = Math.max(14 / da, 30); let out = ''; for (let i = 0; i < n; i++) { let q = sectorPts(cx, cyy, r0 - 1, r1, a0 + i * da, a0 + (i + 1) * da); if (clip) { q = clipHalf(q, 300, 0, 1, 0); if (clip === 2) q = clipHalf(q, 0, h / 2, 0, 1); } out += P(q, seq(i)); } return out + Ci(cx, cyy, r0, 1 + (k % 4)); };
  if (mode === 0) { const r1 = lim ? pickR(R, [h * 0.45, h * 0.55, 240]) : 900; const half = fan(0, cy, -Math.PI / 2, Math.PI / 2, r1, 1); g += half + mirX(half); }
  else if (mode === 1) { const r1 = lim ? pickR(R, [h * 0.4, h * 0.48]) : 900; g += fan(300, cy, 0, TAU, r1); }
  else { const r1 = lim ? pickR(R, [h * 0.5, h * 0.62]) : 420; const c = fan(0, 0, 0, Math.PI / 2, r1, 2); const left = c + mirY(h, c); g += left + mirX(left); }
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

/* ---------------- grammars, Kompozytor II (2026-11-26) ---------------- */

// Mown Stripes — the way grass pitches are mown: wide bands across or along the court, a mown checker or 45° stripes.
function stripes(R, h) {
  const cy = h / 2; const mode = intR(R, 0, 3); const k = intR(R, 2, 3); const withGround = R() < 0.5; let g = ''; // ≥ 2 paints + ground
  const seq = (b) => { const j = Math.abs(b); return withGround ? (j % 2 ? 1 + ((j >> 1) % k) : 0) : 1 + (j % k); }; // b ↔ -b keeps the symmetry
  const odd = R() < 0.5; // centre band on the axis, or a boundary on the axis
  if (mode === 0 || mode === 1) { const bw = pickR(R, mode === 0 ? [40, 50, 60, 75] : [40, 50, 66]); const len = mode === 0 ? 300 : cy; const nb = Math.ceil(len / bw) + 1;
    for (let b = -nb; b <= nb; b++) { const o = odd ? b * bw - bw / 2 : b * bw; const sl = seq(odd ? b : (b >= 0 ? b + 1 : b)); if (!sl) continue; g += mode === 0 ? Rc(300 + o, 0, bw, h, sl) : Rc(0, cy + o, W, bw, sl); } }
  else if (mode === 2) { const s = pickR(R, [60, 75, 100]); const nx = Math.ceil(300 / s) + 1, ny = Math.ceil(cy / s) + 1; const a = 1 + intR(R, 0, k - 1), b = 1 + (a % k); // checker in two paints; the centre disc below adds the third
    for (let j = -ny; j < ny; j++) for (let i = -nx; i < nx; i++) g += Rc(300 + i * s, cy + j * s, s, s, (i + j) % 2 ? a : b); }
  else { const bw = pickR(R, [40, 56, 70]) ; const dir = R() < 0.5 ? 1 : -1; const nb = Math.ceil((W + h) / bw / 1.41) + 2;
    for (let b = -nb; b <= nb; b++) { const sl = seq(b); if (!sl) continue; const d0 = (b - 0.5) * bw * 1.414, d1 = d0 + bw * 1.414; const q = (d) => [[300 + d - dir * (cy + 10) * 1, -10], [300 + d + dir * (cy + 10) * 1, h + 10]]; const [a0, b0] = q(d0), [a1, b1] = q(d1); g += P([a0, a1, b1, b0], sl); } }
  if (mode === 2 || R() < 0.35) g += Ci(300, cy, pickR(R, [45, 60]), 1 + (k % 4));
  return { g, mode: 'mow' + mode };
}

// Orbit — nested circles drifting toward each goal like a tunnel; the drift is smaller than the band so no ring pinches.
function orbit(R, h) {
  const cy = h / 2; const st = pickR(R, [22, 28, 36, 44]); const drift = Math.max(0, st - pickR(R, [10, 14, 18])); const n = intR(R, 3, 7); const k = intR(R, 2, 4); const vert = R() < 0.3; const R0 = pickR(R, [0.42, 0.5, 0.6]) * h + n * 4;
  const circ = (cx, cyy, r) => { const p = []; for (let i = 0; i < 64; i++) { const a = (i / 64) * TAU; p.push([cx + Math.cos(a) * r, cyy + Math.sin(a) * r]); } return p; };
  // circle i: radius R0 - i·st, centre moved i·drift toward the goal (or up, in the vertical variant); clipped to the left half
  const cx0 = pickR(R, [300, 260, 220]); let half = '';
  for (let i = 0; i <= n; i++) { const r = R0 - i * st; if (r < 16) break; const c = vert ? [cx0 - 60, cy - i * drift] : [cx0 - i * drift, cy]; half += P(clipHalf(circ(c[0], c[1], r), 300, 0, 1, 0), 1 + (i % k)); }
  return { g: half + (vert ? rot180(h, half) : mirX(half)), mode: 'orb' + (vert ? 'v' : 'h') };
}

// Arcs — concentric quarter or half rings from the corners, the goal lines or the middle of the sidelines.
function arcs(R, h) {
  const cy = h / 2; const mode = intR(R, 0, 2); const bw = pickR(R, [22, 28, 36, 44]); const k = intR(R, 2, 4); const withGround = R() < 0.4; const n = intR(R, 4, 9);
  const seq = (i) => (withGround ? (i % 2 ? 1 + ((i >> 1) % k) : 0) : 1 + (i % k)); let g = '';
  const rings = (cx, cyy, a0, a1, clipX, clipY) => { let out = ''; for (let i = n; i >= 1; i--) { let q = sectorPts(cx, cyy, (i - 1) * bw, i * bw, a0, a1); if (clipX) q = clipHalf(q, 300, 0, 1, 0); if (clipY) q = clipHalf(q, 0, cy, 0, 1); out += P(q, seq(i)); } return out; };
  if (mode === 0) { const c = rings(0, 0, 0, Math.PI / 2, true, true); const left = c + mirY(h, c); g = left + mirX(left); }
  else if (mode === 1) { const c = rings(0, cy, -Math.PI / 2, Math.PI / 2, true, false); g = c + mirX(c); }
  else { const c = rings(300, 0, 0, Math.PI, false, true); g = c + mirY(h, c); }
  return { g, mode: 'arc' + mode };
}

// Argyle — a diamond lattice centred on the spot; colour by distance rings and parity, optional grout.
function argyle(R, h) {
  const cy = h / 2; const dx = pickR(R, [50, 60, 75, 100]); const dy = dx * pickR(R, [0.8, 1, 1.25]); const k = intR(R, 2, 4); const grout = pickR(R, [0, 0, 10, 14]); const rule = intR(R, 0, 2); let g = '';
  const ni = Math.ceil(300 / dx) + 2, nj = Math.ceil(cy / dy) + 2;
  for (let j = -nj; j <= nj; j++) for (let i = -ni; i <= ni; i++) { if ((i + j) % 2) continue; const x = 300 + i * dx, y = cy + j * dy; const d = Math.abs(i) + Math.abs(j);
    const sl = rule === 0 ? 1 + (Math.floor(d / 2) % k) : rule === 1 ? 1 + (Math.abs(i) % k) : (d % 4 === 0 ? 1 : 1 + ((Math.floor(d / 4) + 1) % k));
    const ex = dx - grout * 0.7, ey = dy - grout * 0.7 * dy / dx; g += P([[x, y - ey], [x + ex, y], [x, y + ey], [x - ex, y]], sl); }
  return { g, mode: 'arg' + rule + (grout ? 'g' : '') };
}

// Plaid — horizontal and vertical band sets mirrored about both axes; the crossings are a third paint.
function plaid(R, h) {
  const cy = h / 2; const k = intR(R, 2, 3); const pat = []; const nb = intR(R, 2, 4); for (let i = 0; i < nb; i++) pat.push([pickR(R, [20, 28, 40, 56]), pickR(R, [24, 40, 64, 90])]);
  const bands = (len) => { const out = []; let o = pickR(R, [0, 30, 60]); for (let i = 0; o < len; i++) { const [w, gap] = pat[i % pat.length]; out.push([o, Math.min(len, o + w)]); o += w + gap; } return out; };
  const hb = bands(cy), vb = bands(300); let g = ''; const H = 1, V = 2, X = k === 3 ? 3 : 1 + (R() < 0.5 ? 2 : 0);
  const both = (list, c) => list.flatMap(([a, b]) => [[c + a, c + b], [c - b, c - a]]);
  const HB = both(hb, cy), VB = both(vb, 300);
  for (const [a, b] of HB) g += Rc(0, a, W, b - a, H); for (const [a, b] of VB) g += Rc(a, 0, b - a, h, V);
  for (const [a, b] of HB) for (const [c, d] of VB) g += Rc(c, a, d - c, b - a, X);
  return { g, mode: 'plaid' + nb };
}

// Equaliser — columns from the goals to the centre, each a centred bar whose height steps with distance.
function steps(R, h) {
  const cy = h / 2; const cw = pickR(R, [24, 30, 40, 50]); const gap = pickR(R, [0, 10, 14]); const k = intR(R, 2, 4); const shape = intR(R, 0, 2); const minH = pickR(R, [0.15, 0.3]); let half = '';
  const n = Math.floor(300 / cw);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; const v = shape === 0 ? t : shape === 1 ? 1 - t : Math.abs(Math.sin(t * Math.PI * pickR(R, [1, 1.5]))) ; const hh = Math.round(h * (minH + (1 - minH) * v) / 20) * 20; const x = i * cw + gap / 2; const lvl = Math.min(k - 1, Math.floor(v * k));
    half += Rc(x, cy - hh / 2, cw - gap, hh, 1 + lvl); if (hh < h - 40 && R() < 0.5) half += Rc(x, cy - hh / 2 - 0, cw - gap, Math.min(20, hh), 1 + ((lvl + 1) % k)) + Rc(x, cy + hh / 2 - Math.min(20, hh), cw - gap, Math.min(20, hh), 1 + ((lvl + 1) % k)); }
  return { g: half + mirX(half), mode: 'eq' + shape + (gap ? 'g' : '') };
}

// Rosette — rings around the centre circle with regular petals (even count, so the turn is symmetric).
function rosette(R, h) {
  const cy = h / 2; const m = pickR(R, [4, 6, 8, 10]); const st = pickR(R, [22, 28, 36]); const amp = pickR(R, [0.08, 0.14, 0.2]); const n = intR(R, 3, 7); const k = intR(R, 2, 4); const sx = pickR(R, [1, 1.3, 1.6]); const ph = R() * TAU / m; const twist = pickR(R, [0, 0, 0.12]);
  let g = '';
  for (let i = n; i >= 0; i--) { const r = 45 + i * st; const pp = []; for (let j = 0; j < 72; j++) { const a = (j / 72) * TAU; const mm = 1 + amp * Math.cos(m * a + ph + i * twist * m); pp.push([300 + Math.cos(a) * r * mm * sx, cy + Math.sin(a) * r * mm]); } g += D(closedCurve(pp), i === 0 ? 1 + (n % k) : 1 + (i % k)); }
  return { g, mode: 'ros' + m + (twist ? 't' : '') };
}

// Cuts — straight cuts in point-symmetric pairs; the regions alternate like a folded paper (two-colour map) with a hub.
function cuts(R, h) {
  const cy = h / 2; const np = intR(R, 2, 3); const lines = [];
  for (let i = 0; i < np; i++) { const a = R() * Math.PI; const off = (R() - 0.5) * h * 0.7; const nx = Math.cos(a), ny = Math.sin(a); lines.push([300 + nx * off, cy + ny * off, nx, ny]); lines.push([300 - nx * off, cy - ny * off, nx, ny]); }
  let cells = [[[-2, -2], [602, -2], [602, h + 2], [-2, h + 2]]]; const par = [0];
  for (const [px, py, nx, ny] of lines) { const nc = [], np2 = []; cells.forEach((c, i) => { const a = clipHalf(c, px, py, nx, ny), b = clipHalf(c, px, py, -nx, -ny); if (a.length > 2) { nc.push(a); np2.push(par[i]); } if (b.length > 2) { nc.push(b); np2.push(par[i] ^ 1); } }); cells = nc; par.length = 0; par.push(...np2); }
  const a = 1 + intR(R, 0, 2), b = R() < 0.5 ? 0 : 1 + ((a) % 3); let g = ''; cells.forEach((c, i) => { g += P(c, par[i] ? a : b); });
  if (R() < 0.7) { const r = pickR(R, [45, 60, 80]); g += Ci(300, cy, r + 24, b === 0 ? 4 : 0) + Ci(300, cy, r, 4); }
  return { g, mode: 'cut' + np };
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

export const COMPOSER_GRAMMARS = { 'pro-k-echo': echo, 'pro-k-zones': zones, 'pro-k-rays': rays, 'pro-k-chevron': chevron, 'pro-k-flow': flow, 'pro-k-shards': shards, 'pro-k-terrain': terrain, 'pro-k-pixel': pixel,
  // Kompozytor II
  'pro-k-mown': stripes, 'pro-k-orbit': orbit, 'pro-k-arcs': arcs, 'pro-k-argyle': argyle, 'pro-k-plaid': plaid, 'pro-k-steps': steps, 'pro-k-rosette': rosette, 'pro-k-cuts': cuts };

// raw geometry for a seed (slot fills) — used by the curator
export function composeSlots(familyId, seed, h = 400) { const gr = COMPOSER_GRAMMARS[familyId]; if (!gr) return null; const out = gr(rng(seed), h); return { g: '<rect x="0" y="0" width="600" height="' + f(h) + '" fill="§0"/>' + out.g, mode: out.mode }; }
export function composeSeed(familyId, seed, h, colors) { const s = composeSlots(familyId, seed, h); if (!s) return ''; const plan = composerPlan(seed, colors); return s.g.replace(/§(\d)/g, (_, i) => plan[+i] || plan[0]); }

/* ---------------- curated pool (written by curate-composer.mjs) ---------------- */
/*POOL*/
// 2026-11-26: echo 36/172/220, zones 36/173/220, rays 36/199/220, chevron 36/180/220, flow 36/158/220, shards 36/90/355, terrain 36/193/220, pixel 34/108/220 (kept/passed/candidates)
export const POOL = {"pro-k-echo":[{"s":640252,"m":{"a":[0.318,0.289,0.287,0.106,0],"t":187,"w":20,"md":"echo2"}},{"s":703604,"m":{"a":[0.255,0.245,0.251,0.25,0],"t":130,"w":20,"md":"echo1"}},{"s":711523,"m":{"a":[0.453,0.105,0.209,0.234,0],"t":111,"w":20,"md":"echo0"}},{"s":608576,"m":{"a":[0.098,0.276,0.358,0.267,0],"t":177,"w":20,"md":"echo2"}},{"s":869903,"m":{"a":[0.407,0.186,0.225,0.182,0],"t":144,"w":20,"md":"echo1"}},{"s":297546,"m":{"a":[0.453,0.152,0.286,0.11,0],"t":91,"w":20,"md":"echo0"}},{"s":162923,"m":{"a":[0.183,0.325,0.308,0.184,0],"t":149,"w":20,"md":"echo2"}},{"s":899390,"m":{"a":[0.342,0.312,0.24,0.106,0],"t":109,"w":20,"md":"echo1"}},{"s":363087,"m":{"a":[0.552,0.195,0.253,0,0],"t":113,"w":20,"md":"echo0"}},{"s":466034,"m":{"a":[0.263,0.284,0.347,0.106,0],"t":120,"w":20,"md":"echo2"}},{"s":434358,"m":{"a":[0.401,0.312,0.171,0.116,0],"t":124,"w":20,"md":"echo1"}},{"s":455926,"m":{"a":[0.644,0.066,0.143,0.147,0],"t":96,"w":20,"md":"echo0"}},{"s":669739,"m":{"a":[0.378,0.31,0.238,0.074,0],"t":145,"w":20,"md":"echo2"}},{"s":648171,"m":{"a":[0.417,0.218,0.259,0.106,0],"t":121,"w":20,"md":"echo1"}},{"s":537305,"m":{"a":[0.725,0.126,0.149,0,0],"t":93,"w":20,"md":"echo0"}},{"s":709334,"m":{"a":[0.408,0.232,0.254,0.106,0],"t":116,"w":20,"md":"echo2"}},{"s":432169,"m":{"a":[0.472,0.105,0.317,0.106,0],"t":96,"w":20,"md":"echo1"}},{"s":331411,"m":{"a":[0.644,0.137,0.22,0,0],"t":69,"w":20,"md":"echo0"}},{"s":925336,"m":{"a":[0.486,0.191,0.155,0.169,0],"t":103,"w":20,"md":"echo2"}},{"s":561062,"m":{"a":[0.453,0.106,0.261,0.179,0],"t":75,"w":20,"md":"echo1"}},{"s":178761,"m":{"a":[0.74,0.104,0.156,0,0],"t":61,"w":20,"md":"echo0"}},{"s":386844,"m":{"a":[0.587,0.134,0.173,0.106,0],"t":122,"w":20,"md":"echo2"}},{"s":576900,"m":{"a":[0.62,0.186,0.125,0.069,0],"t":89,"w":20,"md":"echo1"}},{"s":893660,"m":{"a":[0.782,0.084,0.07,0.064,0],"t":50,"w":20,"md":"echo0"}},{"s":418520,"m":{"a":[0.622,0.135,0.137,0.106,0],"t":98,"w":20,"md":"echo2"}},{"s":408412,"m":{"a":[0.624,0.099,0.171,0.106,0],"t":84,"w":20,"md":"echo1"}},{"s":622225,"m":{"a":[0.796,0,0.094,0.11,0],"t":34,"w":20,"md":"echo0"}},{"s":323492,"m":{"a":[0.562,0.137,0.196,0.106,0],"t":75,"w":20,"md":"echo2"}},{"s":867714,"m":{"a":[0.628,0.214,0.072,0.087,0],"t":76,"w":20,"md":"echo1"}},{"s":10273,"m":{"a":[0.64,0.106,0.176,0.078,0],"t":62,"w":20,"md":"echo2"}},{"s":497710,"m":{"a":[0.656,0.087,0.152,0.106,0],"t":68,"w":20,"md":"echo1"}},{"s":584819,"m":{"a":[0.675,0.09,0.128,0.106,0],"t":67,"w":20,"md":"echo2"}},{"s":877822,"m":{"a":[0.715,0.178,0,0.106,0],"t":47,"w":20,"md":"echo1"}},{"s":511359,"m":{"a":[0.709,0.077,0.107,0.106,0],"t":64,"w":20,"md":"echo2"}},{"s":632333,"m":{"a":[0.795,0.099,0,0.106,0],"t":31,"w":20,"md":"echo1"}},{"s":170842,"m":{"a":[0.694,0.214,0.092,0,0],"t":70,"w":20,"md":"echo2"}}],"pro-k-zones":[{"s":411112,"m":{"a":[0.224,0.195,0.304,0.155,0.122],"t":99,"w":20,"md":"zones6"}},{"s":775386,"m":{"a":[0.322,0.106,0.286,0.164,0.122],"t":92,"w":20,"md":"zones5"}},{"s":583141,"m":{"a":[0.267,0.106,0.059,0.328,0.24],"t":71,"w":20,"md":"zones4"}},{"s":725683,"m":{"a":[0.439,0.106,0.092,0.068,0.295],"t":71,"w":20,"md":"zones3"}},{"s":593249,"m":{"a":[0.672,0.128,0.068,0.026,0.106],"t":54,"w":20,"md":"zones2"}},{"s":321814,"m":{"a":[0.31,0.162,0.21,0.047,0.271],"t":96,"w":20,"md":"zones6"}},{"s":424761,"m":{"a":[0.359,0.302,0.149,0.084,0.106],"t":81,"w":20,"md":"zones5"}},{"s":838738,"m":{"a":[0.354,0.312,0.16,0.106,0.068],"t":74,"w":20,"md":"zones4"}},{"s":617006,"m":{"a":[0.451,0.059,0.224,0.16,0.106],"t":68,"w":20,"md":"zones3"}},{"s":511870,"m":{"a":[0.693,0,0.106,0.128,0.074],"t":45,"w":20,"md":"zones2"}},{"s":814981,"m":{"a":[0.346,0.16,0.106,0.213,0.176],"t":73,"w":20,"md":"zones5"}},{"s":108001,"m":{"a":[0.32,0.2,0.106,0.267,0.107],"t":65,"w":20,"md":"zones4"}},{"s":963253,"m":{"a":[0.336,0.392,0.112,0.16,0],"t":54,"w":20,"md":"zones3"}},{"s":820711,"m":{"a":[0.728,0.106,0.092,0.047,0.026],"t":51,"w":20,"md":"zones2"}},{"s":751629,"m":{"a":[0.37,0.191,0.129,0.106,0.204],"t":75,"w":20,"md":"zones5"}},{"s":36730,"m":{"a":[0.363,0.16,0.106,0.029,0.342],"t":70,"w":20,"md":"zones4"}},{"s":100082,"m":{"a":[0.433,0,0.32,0.2,0.047],"t":57,"w":20,"md":"zones3"}},{"s":545735,"m":{"a":[0.788,0.106,0.059,0.047,0],"t":49,"w":20,"md":"zones2"}},{"s":807062,"m":{"a":[0.352,0.181,0.084,0.106,0.277],"t":69,"w":20,"md":"zones5"}},{"s":147596,"m":{"a":[0.28,0.177,0.16,0.047,0.336],"t":62,"w":20,"md":"zones4"}},{"s":812792,"m":{"a":[0.343,0.2,0.084,0,0.374],"t":50,"w":20,"md":"zones3"}},{"s":385166,"m":{"a":[0.755,0.092,0.047,0,0.106],"t":41,"w":20,"md":"zones2"}},{"s":688277,"m":{"a":[0.405,0.243,0.136,0.11,0.106],"t":85,"w":20,"md":"zones5"}},{"s":210948,"m":{"a":[0.399,0.128,0.168,0.2,0.106],"t":72,"w":20,"md":"zones4"}},{"s":115920,"m":{"a":[0.2,0.131,0,0.402,0.267],"t":49,"w":20,"md":"zones3"}},{"s":648682,"m":{"a":[0.799,0,0.106,0.068,0.026],"t":34,"w":20,"md":"zones2"}},{"s":305976,"m":{"a":[0.371,0.286,0.19,0.047,0.106],"t":76,"w":20,"md":"zones5"}},{"s":933766,"m":{"a":[0.433,0.072,0.106,0.128,0.262],"t":80,"w":20,"md":"zones4"}},{"s":18703,"m":{"a":[0.4,0.106,0,0.36,0.133],"t":48,"w":20,"md":"zones3"}},{"s":434869,"m":{"a":[0.411,0.18,0.076,0.226,0.106],"t":82,"w":20,"md":"zones5"}},{"s":876144,"m":{"a":[0.354,0.075,0.16,0.047,0.364],"t":67,"w":20,"md":"zones4"}},{"s":981280,"m":{"a":[0.548,0.186,0.106,0.092,0.068],"t":77,"w":20,"md":"zones3"}},{"s":781116,"m":{"a":[0.383,0.12,0.106,0.304,0.086],"t":71,"w":20,"md":"zones5"}},{"s":10784,"m":{"a":[0.455,0.146,0.106,0.128,0.165],"t":88,"w":20,"md":"zones4"}},{"s":529897,"m":{"a":[0.541,0.226,0.106,0.059,0.068],"t":75,"w":20,"md":"zones3"}},{"s":313895,"m":{"a":[0.432,0.304,0.037,0.12,0.106],"t":88,"w":20,"md":"zones5"}}],"pro-k-rays":[{"s":47665,"m":{"a":[0,0.283,0.273,0.241,0.204],"t":226,"w":20,"md":"rays2"}},{"s":158531,"m":{"a":[0.275,0.2,0.193,0.183,0.15],"t":193,"w":20,"md":"rays2l"}},{"s":269397,"m":{"a":[0,0.334,0.334,0.281,0.051],"t":157,"w":20,"md":"rays0"}},{"s":966269,"m":{"a":[0,0.32,0.323,0.32,0.037],"t":145,"w":20,"md":"rays1"}},{"s":786321,"m":{"a":[0.306,0.328,0.329,0.037,0],"t":138,"w":20,"md":"rays0l"}},{"s":849673,"m":{"a":[0.518,0.148,0.148,0.148,0.037],"t":126,"w":20,"md":"rays1l"}},{"s":338479,"m":{"a":[0,0.361,0.281,0.254,0.104],"t":193,"w":20,"md":"rays2"}},{"s":362236,"m":{"a":[0.275,0.252,0.225,0.211,0.037],"t":132,"w":20,"md":"rays2l"}},{"s":594076,"m":{"a":[0,0.396,0.289,0.289,0.026],"t":120,"w":20,"md":"rays0"}},{"s":190207,"m":{"a":[0,0.367,0.303,0.303,0.026],"t":116,"w":20,"md":"rays1"}},{"s":847484,"m":{"a":[0.306,0.218,0.246,0.218,0.012],"t":85,"w":20,"md":"rays0l"}},{"s":243451,"m":{"a":[0.518,0.228,0.228,0.026,0],"t":115,"w":20,"md":"rays1l"}},{"s":293154,"m":{"a":[0,0.362,0.313,0.259,0.066],"t":166,"w":20,"md":"rays2"}},{"s":221883,"m":{"a":[0,0.316,0.316,0.352,0.017],"t":96,"w":20,"md":"rays0"}},{"s":253559,"m":{"a":[0,0.396,0.396,0.191,0.017],"t":102,"w":20,"md":"rays1"}},{"s":79341,"m":{"a":[0.387,0.293,0.293,0.026,0],"t":117,"w":20,"md":"rays0l"}},{"s":290965,"m":{"a":[0.518,0.235,0.235,0.012,0],"t":86,"w":20,"md":"rays1l"}},{"s":778402,"m":{"a":[0,0.309,0.371,0.309,0.012],"t":74,"w":20,"md":"rays0"}},{"s":920944,"m":{"a":[0,0.309,0.371,0.309,0.012],"t":81,"w":20,"md":"rays1"}},{"s":491129,"m":{"a":[0.387,0.221,0.221,0.154,0.017],"t":101,"w":20,"md":"rays0l"}},{"s":768294,"m":{"a":[0.665,0.154,0.155,0.026,0],"t":93,"w":20,"md":"rays1l"}},{"s":164261,"m":{"a":[0.576,0.129,0.129,0.129,0.037],"t":112,"w":20,"md":"rays0l"}},{"s":301073,"m":{"a":[0.665,0.159,0.159,0.017,0],"t":83,"w":20,"md":"rays1l"}},{"s":277316,"m":{"a":[0.576,0.199,0.199,0.026,0],"t":101,"w":20,"md":"rays0l"}},{"s":530724,"m":{"a":[0.751,0.116,0.058,0.058,0.017],"t":86,"w":20,"md":"rays1l"}},{"s":61314,"m":{"a":[0.576,0.153,0.153,0.102,0.017],"t":89,"w":20,"md":"rays0l"}},{"s":968458,"m":{"a":[0.814,0.05,0.05,0.05,0.037],"t":88,"w":20,"md":"rays1l"}},{"s":322641,"m":{"a":[0.576,0.137,0.137,0.137,0.012],"t":74,"w":20,"md":"rays0l"}},{"s":910836,"m":{"a":[0.763,0.08,0.053,0.053,0.051],"t":106,"w":20,"md":"rays0l"}},{"s":235532,"m":{"a":[0,0.329,0.323,0.311,0.037],"t":129,"w":20,"md":"rays2"}},{"s":784132,"m":{"a":[0.481,0.213,0.268,0.037,0],"t":139,"w":20,"md":"rays0"}},{"s":449345,"m":{"a":[0.306,0.321,0.321,0.051,0],"t":152,"w":20,"md":"rays0l"}},{"s":865511,"m":{"a":[0.387,0.287,0.288,0.037,0],"t":131,"w":20,"md":"rays0l"}},{"s":825916,"m":{"a":[0.688,0.3,0.012,0,0],"t":69,"w":20,"md":"rays0l"}},{"s":958350,"m":{"a":[0,0.297,0.294,0.259,0.15],"t":213,"w":20,"md":"rays2"}},{"s":435696,"m":{"a":[0.275,0.266,0.255,0.204,0],"t":198,"w":20,"md":"rays2l"}}],"pro-k-chevron":[{"s":451253,"m":{"a":[0.182,0.187,0.213,0.217,0.199],"t":220,"w":20,"md":"chevc"}},{"s":239629,"m":{"a":[0.25,0.25,0.25,0.25,0],"t":220,"w":20,"md":"chevg"}},{"s":506686,"m":{"a":[0.333,0.149,0.184,0.184,0.15],"t":293,"w":20,"md":"chevggap"}},{"s":888987,"m":{"a":[0.489,0.216,0.166,0.129,0],"t":223,"w":20,"md":"chevcgap"}},{"s":287143,"m":{"a":[0.2,0.2,0.2,0.2,0.2],"t":245,"w":20,"md":"chevc"}},{"s":952339,"m":{"a":[0.242,0.251,0.254,0.252,0],"t":255,"w":20,"md":"chevg"}},{"s":184196,"m":{"a":[0.486,0.218,0.167,0.13,0],"t":225,"w":20,"md":"chevggap"}},{"s":807608,"m":{"a":[0.5,0.106,0.127,0.133,0.133],"t":181,"w":20,"md":"chevcgap"}},{"s":825635,"m":{"a":[0.247,0.261,0.253,0.239,0],"t":293,"w":20,"md":"chevc"}},{"s":801878,"m":{"a":[0.239,0.246,0.261,0.254,0],"t":245,"w":20,"md":"chevg"}},{"s":207953,"m":{"a":[0.333,0.157,0.17,0.17,0.17],"t":342,"w":20,"md":"chevggap"}},{"s":754364,"m":{"a":[0.608,0.127,0.1,0.099,0.065],"t":228,"w":20,"md":"chevcgap"}},{"s":279224,"m":{"a":[0.406,0.217,0.198,0.179,0],"t":242,"w":20,"md":"chevc"}},{"s":356225,"m":{"a":[0.159,0.213,0.254,0.214,0.16],"t":181,"w":20,"md":"chevg"}},{"s":865230,"m":{"a":[0.552,0.195,0.155,0.098,0],"t":228,"w":20,"md":"chevggap"}},{"s":39465,"m":{"a":[0.631,0.156,0.127,0.086,0],"t":218,"w":20,"md":"chevcgap"}},{"s":477199,"m":{"a":[0.327,0.337,0.336,0,0],"t":255,"w":20,"md":"chevc"}},{"s":730607,"m":{"a":[0.2,0.2,0.2,0.2,0.2],"t":342,"w":20,"md":"chevg"}},{"s":245359,"m":{"a":[0.606,0.166,0.128,0.099,0],"t":230,"w":20,"md":"chevggap"}},{"s":572227,"m":{"a":[0.433,0.217,0.188,0.162,0],"t":348,"w":20,"md":"chevcgap"}},{"s":633390,"m":{"a":[0.413,0.214,0.198,0.175,0],"t":191,"w":20,"md":"chevc"}},{"s":485118,"m":{"a":[0.404,0.218,0.199,0.179,0],"t":243,"w":20,"md":"chevg"}},{"s":168358,"m":{"a":[0.426,0.314,0.261,0,0],"t":280,"w":20,"md":"chevggap"}},{"s":912744,"m":{"a":[0.566,0.169,0.147,0.118,0],"t":266,"w":20,"md":"chevcgap"}},{"s":736337,"m":{"a":[0.528,0.14,0.124,0.113,0.095],"t":252,"w":20,"md":"chevc"}},{"s":118655,"m":{"a":[0.358,0.179,0.165,0.155,0.144],"t":329,"w":20,"md":"chevg"}},{"s":255467,"m":{"a":[0.627,0.157,0.128,0.088,0],"t":220,"w":20,"md":"chevggap"}},{"s":271305,"m":{"a":[0.564,0.147,0.127,0.094,0.068],"t":298,"w":20,"md":"chevcgap"}},{"s":508875,"m":{"a":[0.395,0.214,0.203,0.188,0],"t":328,"w":20,"md":"chevc"}},{"s":627660,"m":{"a":[0.406,0.187,0.14,0.133,0.133],"t":142,"w":20,"md":"chevg"}},{"s":221602,"m":{"a":[0.56,0.245,0.194,0,0],"t":216,"w":20,"md":"chevggap"}},{"s":395820,"m":{"a":[0.554,0.186,0.133,0.127,0],"t":161,"w":20,"md":"chevcgap"}},{"s":467091,"m":{"a":[0.528,0.147,0.128,0.108,0.089],"t":181,"w":20,"md":"chevc"}},{"s":421766,"m":{"a":[0.55,0.168,0.15,0.131,0],"t":255,"w":20,"md":"chevg"}},{"s":461361,"m":{"a":[0.552,0.133,0.133,0.127,0.054],"t":162,"w":20,"md":"chevggap"}},{"s":459172,"m":{"a":[0.499,0.093,0.128,0.157,0.121],"t":306,"w":20,"md":"chevcgap"}}],"pro-k-flow":[{"s":940738,"m":{"a":[0.31,0.191,0.2,0.199,0.099],"t":147,"w":20,"md":"flow"}},{"s":744952,"m":{"a":[0.311,0.229,0.235,0.225,0],"t":140,"w":20,"md":"flowt"}},{"s":307218,"m":{"a":[0.69,0.151,0.075,0.084,0],"t":157,"w":20,"md":"flowtg"}},{"s":459868,"m":{"a":[0.725,0.138,0.137,0,0],"t":168,"w":20,"md":"flowg"}},{"s":531139,"m":{"a":[0.337,0.283,0.19,0.19,0],"t":141,"w":20,"md":"flow"}},{"s":45891,"m":{"a":[0.278,0.248,0.23,0.245,0],"t":123,"w":20,"md":"flowt"}},{"s":626167,"m":{"a":[0.624,0.187,0.094,0.094,0],"t":145,"w":20,"md":"flowtg"}},{"s":568545,"m":{"a":[0.648,0.17,0.182,0,0],"t":127,"w":20,"md":"flowg"}},{"s":228028,"m":{"a":[0.267,0.241,0.246,0.245,0],"t":106,"w":20,"md":"flow"}},{"s":528950,"m":{"a":[0.285,0.243,0.235,0.237,0],"t":121,"w":20,"md":"flowt"}},{"s":719006,"m":{"a":[0.562,0.258,0.18,0,0],"t":132,"w":20,"md":"flowtg"}},{"s":457679,"m":{"a":[0.649,0.171,0.18,0,0],"t":124,"w":20,"md":"flowg"}},{"s":220109,"m":{"a":[0.406,0.254,0.17,0.17,0],"t":160,"w":20,"md":"flow"}},{"s":491544,"m":{"a":[0.406,0.29,0.304,0,0],"t":175,"w":20,"md":"flowt"}},{"s":402246,"m":{"a":[0.588,0.233,0.179,0,0],"t":136,"w":20,"md":"flowtg"}},{"s":774439,"m":{"a":[0.603,0.198,0.199,0,0],"t":111,"w":20,"md":"flowg"}},{"s":816223,"m":{"a":[0.336,0.264,0.267,0.133,0],"t":120,"w":20,"md":"flow"}},{"s":895413,"m":{"a":[0.509,0.244,0.247,0,0],"t":181,"w":20,"md":"flowt"}},{"s":251785,"m":{"a":[0.672,0.116,0.211,0,0],"t":173,"w":20,"md":"flowtg"}},{"s":283461,"m":{"a":[0.549,0.218,0.233,0,0],"t":88,"w":20,"md":"flowg"}},{"s":451949,"m":{"a":[0.433,0.162,0.162,0.162,0.081],"t":151,"w":20,"md":"flow"}},{"s":140919,"m":{"a":[0.527,0.238,0.118,0.118,0],"t":150,"w":20,"md":"flowt"}},{"s":560626,"m":{"a":[0.7,0.183,0.117,0,0],"t":122,"w":20,"md":"flowtg"}},{"s":932819,"m":{"a":[0.705,0.144,0.151,0,0],"t":134,"w":20,"md":"flowg"}},{"s":919170,"m":{"a":[0.426,0.164,0.165,0.164,0.082],"t":149,"w":20,"md":"flow"}},{"s":847899,"m":{"a":[0.556,0.148,0.221,0.074,0],"t":144,"w":20,"md":"flowt"}},{"s":101324,"m":{"a":[0.724,0.176,0,0,0.1],"t":121,"w":20,"md":"flowtg"}},{"s":309407,"m":{"a":[0.703,0.148,0.148,0,0],"t":130,"w":20,"md":"flowg"}},{"s":489355,"m":{"a":[0.397,0.236,0.178,0.189,0],"t":126,"w":20,"md":"flow"}},{"s":845710,"m":{"a":[0.566,0.114,0.114,0.207,0],"t":148,"w":20,"md":"flowt"}},{"s":261893,"m":{"a":[0.737,0.188,0.074,0,0],"t":118,"w":20,"md":"flowtg"}},{"s":824142,"m":{"a":[0.66,0.171,0.169,0,0],"t":120,"w":20,"md":"flowg"}},{"s":109243,"m":{"a":[0.395,0.173,0.173,0.173,0.086],"t":116,"w":20,"md":"flow"}},{"s":885305,"m":{"a":[0.527,0.355,0.118,0,0],"t":157,"w":20,"md":"flowt"}},{"s":444030,"m":{"a":[0.756,0.142,0.102,0,0],"t":116,"w":20,"md":"flowtg"}},{"s":30053,"m":{"a":[0.753,0.123,0.123,0,0],"t":144,"w":20,"md":"flowg"}}],"pro-k-shards":[{"s":949596,"m":{"a":[0,0.275,0.202,0.245,0.278],"t":140,"w":20,"md":"shard95"}},{"s":571673,"m":{"a":[0,0.243,0.27,0.261,0.226],"t":116,"w":20,"md":"shard115"}},{"s":23073,"m":{"a":[0,0.271,0.24,0.248,0.242],"t":96,"w":20,"md":"shard140"}},{"s":347752,"m":{"a":[0,0.232,0.278,0.261,0.229],"t":132,"w":20,"md":"shard95"}},{"s":629295,"m":{"a":[0,0.282,0.232,0.188,0.298],"t":111,"w":20,"md":"shard115"}},{"s":825081,"m":{"a":[0,0.297,0.252,0.213,0.239],"t":99,"w":20,"md":"shard140"}},{"s":542186,"m":{"a":[0,0.171,0.266,0.263,0.3],"t":131,"w":20,"md":"shard95"}},{"s":922298,"m":{"a":[0,0.243,0.254,0.209,0.293],"t":113,"w":20,"md":"shard115"}},{"s":714215,"m":{"a":[0,0.278,0.272,0.181,0.27],"t":84,"w":20,"md":"shard140"}},{"s":866865,"m":{"a":[0,0.209,0.305,0.279,0.207],"t":141,"w":20,"md":"shard95"}},{"s":12965,"m":{"a":[0,0.305,0.263,0.268,0.165],"t":114,"w":20,"md":"shard115"}},{"s":613457,"m":{"a":[0,0.218,0.309,0.229,0.244],"t":81,"w":20,"md":"shard140"}},{"s":239075,"m":{"a":[0,0.28,0.29,0.252,0.178],"t":125,"w":20,"md":"shard95"}},{"s":476645,"m":{"a":[0,0.342,0.284,0.132,0.243],"t":114,"w":20,"md":"shard115"}},{"s":822892,"m":{"a":[0,0.204,0.212,0.32,0.264],"t":86,"w":20,"md":"shard140"}},{"s":910001,"m":{"a":[0,0.29,0.235,0.23,0.245],"t":117,"w":20,"md":"shard95"}},{"s":260643,"m":{"a":[0,0.239,0.201,0.269,0.292],"t":107,"w":20,"md":"shard115"}},{"s":482375,"m":{"a":[0,0.258,0.343,0.238,0.161],"t":88,"w":20,"md":"shard140"}},{"s":761729,"m":{"a":[0,0.232,0.322,0.22,0.225],"t":132,"w":20,"md":"shard95"}},{"s":603349,"m":{"a":[0,0.346,0.194,0.272,0.187],"t":111,"w":20,"md":"shard115"}},{"s":167804,"m":{"a":[0,0.331,0.258,0.306,0.105],"t":86,"w":20,"md":"shard140"}},{"s":339833,"m":{"a":[0,0.317,0.211,0.224,0.247],"t":139,"w":20,"md":"shard95"}},{"s":36722,"m":{"a":[0,0.251,0.175,0.324,0.25],"t":111,"w":20,"md":"shard115"}},{"s":49019,"m":{"a":[0,0.208,0.256,0.17,0.365],"t":91,"w":20,"md":"shard140"}},{"s":534267,"m":{"a":[0,0.23,0.168,0.281,0.321],"t":123,"w":20,"md":"shard95"}},{"s":468726,"m":{"a":[0,0.342,0.203,0.165,0.29],"t":109,"w":20,"md":"shard115"}},{"s":268562,"m":{"a":[0,0.21,0.297,0.344,0.149],"t":89,"w":20,"md":"shard140"}},{"s":989191,"m":{"a":[0,0.208,0.204,0.302,0.286],"t":138,"w":20,"md":"shard95"}},{"s":157696,"m":{"a":[0,0.199,0.273,0.331,0.197],"t":102,"w":20,"md":"shard115"}},{"s":266373,"m":{"a":[0,0.336,0.198,0.354,0.111],"t":85,"w":20,"md":"shard140"}},{"s":218859,"m":{"a":[0,0.22,0.304,0.19,0.287],"t":132,"w":20,"md":"shard95"}},{"s":15154,"m":{"a":[0,0.238,0.209,0.175,0.378],"t":109,"w":20,"md":"shard115"}},{"s":526348,"m":{"a":[0,0.237,0.058,0.367,0.338],"t":86,"w":20,"md":"shard140"}},{"s":246994,"m":{"a":[0,0.329,0.213,0.252,0.207],"t":130,"w":20,"md":"shard95"}},{"s":60479,"m":{"a":[0,0.135,0.262,0.225,0.378],"t":113,"w":20,"md":"shard115"}},{"s":943866,"m":{"a":[0,0.194,0.203,0.225,0.378],"t":89,"w":20,"md":"shard140"}}],"pro-k-terrain":[{"s":342318,"m":{"a":[0.221,0.215,0.225,0.225,0.113],"t":172,"w":20,"md":"terr0"}},{"s":659078,"m":{"a":[0.529,0.145,0.211,0.115,0],"t":169,"w":20,"md":"terr1"}},{"s":875080,"m":{"a":[0.202,0.174,0.232,0.261,0.131],"t":185,"w":20,"md":"terr0"}},{"s":136424,"m":{"a":[0.523,0.15,0.137,0.126,0.063],"t":124,"w":20,"md":"terr1"}},{"s":967919,"m":{"a":[0.289,0.171,0.23,0.207,0.103],"t":157,"w":20,"md":"terr0"}},{"s":518725,"m":{"a":[0.597,0.155,0.17,0.078,0],"t":147,"w":20,"md":"terr1"}},{"s":825377,"m":{"a":[0.297,0.173,0.226,0.203,0.101],"t":158,"w":20,"md":"terr0"}},{"s":748376,"m":{"a":[0.517,0.168,0.208,0.108,0],"t":122,"w":20,"md":"terr1"}},{"s":96829,"m":{"a":[0.349,0.209,0.265,0.177,0],"t":177,"w":20,"md":"terr0"}},{"s":803809,"m":{"a":[0.521,0.143,0.146,0.127,0.063],"t":119,"w":20,"md":"terr1"}},{"s":833296,"m":{"a":[0.25,0.209,0.218,0.216,0.108],"t":141,"w":20,"md":"terr0"}},{"s":207695,"m":{"a":[0.511,0.149,0.151,0.126,0.063],"t":119,"w":20,"md":"terr1"}},{"s":993865,"m":{"a":[0.072,0.167,0.276,0.324,0.162],"t":167,"w":20,"md":"terr0"}},{"s":677105,"m":{"a":[0.572,0.155,0.121,0.101,0.05],"t":123,"w":20,"md":"terr1"}},{"s":157992,"m":{"a":[0.329,0.217,0.307,0.148,0],"t":134,"w":20,"md":"terr0"}},{"s":859242,"m":{"a":[0.574,0.168,0.172,0.086,0],"t":122,"w":20,"md":"terr1"}},{"s":928324,"m":{"a":[0.282,0.25,0.323,0.145,0],"t":131,"w":20,"md":"terr0"}},{"s":843404,"m":{"a":[0.579,0.163,0.172,0.086,0],"t":120,"w":20,"md":"terr1"}},{"s":47126,"m":{"a":[0.358,0.381,0.262,0,0],"t":174,"w":20,"md":"terr0"}},{"s":975838,"m":{"a":[0.588,0.135,0.123,0.102,0.051],"t":118,"w":20,"md":"terr1"}},{"s":49315,"m":{"a":[0.458,0.174,0.147,0.147,0.074],"t":167,"w":20,"md":"terr0"}},{"s":80991,"m":{"a":[0.565,0.26,0.174,0,0],"t":128,"w":20,"md":"terr1"}},{"s":582077,"m":{"a":[0.067,0.233,0.441,0.259,0],"t":167,"w":20,"md":"terr0"}},{"s":469022,"m":{"a":[0.645,0.142,0.142,0.071,0],"t":118,"w":20,"md":"terr1"}},{"s":661267,"m":{"a":[0.093,0.232,0.416,0.259,0],"t":157,"w":20,"md":"terr0"}},{"s":651159,"m":{"a":[0.64,0.144,0.144,0.072,0],"t":122,"w":20,"md":"terr1"}},{"s":983757,"m":{"a":[0.46,0.163,0.151,0.151,0.075],"t":158,"w":20,"md":"terr0"}},{"s":605834,"m":{"a":[0.581,0.194,0.151,0.074,0],"t":99,"w":20,"md":"terr1"}},{"s":484860,"m":{"a":[0.258,0.422,0.32,0,0],"t":176,"w":20,"md":"terr0"}},{"s":811728,"m":{"a":[0.66,0.106,0.097,0.091,0.045],"t":114,"w":20,"md":"terr1"}},{"s":102559,"m":{"a":[0.053,0.273,0.422,0.252,0],"t":153,"w":20,"md":"terr0"}},{"s":930513,"m":{"a":[0.525,0.289,0.186,0,0],"t":94,"w":20,"md":"terr1"}},{"s":7531,"m":{"a":[0.453,0.16,0.234,0.153,0],"t":154,"w":20,"md":"terr0"}},{"s":882999,"m":{"a":[0.58,0.248,0.172,0,0],"t":115,"w":20,"md":"terr1"}},{"s":413589,"m":{"a":[0.432,0.207,0.243,0.118,0],"t":141,"w":20,"md":"terr0"}},{"s":946351,"m":{"a":[0.662,0.125,0.142,0.071,0],"t":112,"w":20,"md":"terr1"}}],"pro-k-pixel":[{"s":529735,"m":{"a":[0.298,0.298,0.23,0.174,0],"t":94,"w":20,"md":"pix12"}},{"s":981118,"m":{"a":[0.368,0.067,0.218,0.346,0],"t":95,"w":20,"md":"pix10"}},{"s":371355,"m":{"a":[0.53,0.067,0.149,0.254,0],"t":90,"w":20,"md":"pix11"}},{"s":761575,"m":{"a":[0.275,0.278,0.233,0.215,0],"t":82,"w":20,"md":"pix12"}},{"s":30838,"m":{"a":[0.353,0.068,0.225,0.355,0],"t":72,"w":20,"md":"pix10"}},{"s":943712,"m":{"a":[0.52,0.053,0.16,0.267,0],"t":66,"w":20,"md":"pix11"}},{"s":798981,"m":{"a":[0.293,0.294,0.244,0.17,0],"t":86,"w":20,"md":"pix12"}},{"s":801170,"m":{"a":[0.365,0.072,0.226,0.338,0],"t":66,"w":20,"md":"pix10"}},{"s":777413,"m":{"a":[0.543,0.06,0.158,0.24,0],"t":71,"w":20,"md":"pix11"}},{"s":872441,"m":{"a":[0.283,0.275,0.233,0.21,0],"t":82,"w":20,"md":"pix12"}},{"s":933604,"m":{"a":[0.347,0.08,0.213,0.36,0],"t":59,"w":20,"md":"pix10"}},{"s":472113,"m":{"a":[0.533,0.027,0.187,0.253,0],"t":66,"w":20,"md":"pix11"}},{"s":896198,"m":{"a":[0.287,0.247,0.28,0.187,0],"t":80,"w":20,"md":"pix12"}},{"s":347598,"m":{"a":[0.375,0.06,0.24,0.325,0],"t":58,"w":20,"md":"pix10"}},{"s":418869,"m":{"a":[0.53,0.048,0.154,0.269,0],"t":61,"w":20,"md":"pix11"}},{"s":266219,"m":{"a":[0.287,0.307,0.207,0.2,0],"t":80,"w":20,"md":"pix12"}},{"s":888279,"m":{"a":[0.427,0.047,0.227,0.3,0],"t":62,"w":20,"md":"pix10"}},{"s":173380,"m":{"a":[0.535,0.045,0.18,0.24,0],"t":61,"w":20,"md":"pix11"}},{"s":894009,"m":{"a":[0.343,0.384,0.273,0,0],"t":70,"w":20,"md":"pix12"}},{"s":935793,"m":{"a":[0.484,0.139,0.377,0,0],"t":72,"w":20,"md":"pix10"}},{"s":70433,"m":{"a":[0.618,0.113,0.27,0,0],"t":52,"w":20,"md":"pix11"}},{"s":46676,"m":{"a":[0.338,0.358,0.305,0,0],"t":62,"w":20,"md":"pix12"}},{"s":864522,"m":{"a":[0.472,0.134,0.394,0,0],"t":49,"w":20,"md":"pix10"}},{"s":753656,"m":{"a":[0.621,0.096,0.283,0,0],"t":49,"w":20,"md":"pix11"}},{"s":951631,"m":{"a":[0.338,0.36,0.302,0,0],"t":57,"w":20,"md":"pix12"}},{"s":769494,"m":{"a":[0.515,0.128,0.358,0,0],"t":57,"w":20,"md":"pix10"}},{"s":608925,"m":{"a":[0.6,0.08,0.32,0,0],"t":43,"w":20,"md":"pix11"}},{"s":975388,"m":{"a":[0.333,0.358,0.31,0,0],"t":56,"w":20,"md":"pix12"}},{"s":197137,"m":{"a":[0.48,0.12,0.4,0,0],"t":46,"w":20,"md":"pix10"}},{"s":880360,"m":{"a":[0.61,0.09,0.3,0,0],"t":42,"w":20,"md":"pix11"}},{"s":648520,"m":{"a":[0.36,0.36,0.28,0,0],"t":56,"w":20,"md":"pix12"}},{"s":220894,"m":{"a":[0.513,0.147,0.34,0,0],"t":47,"w":20,"md":"pix10"}},{"s":228813,"m":{"a":[0.626,0.096,0.278,0,0],"t":41,"w":20,"md":"pix11"}},{"s":640601,"m":{"a":[0.353,0.387,0.26,0,0],"t":52,"w":20,"md":"pix12"}}]};
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
  // Kompozytor II (2026-11-26)
  meta('pro-k-mown', 'Koszone pasy', 'MOWN', 'premium', 'Pasy jak na koszonej murawie: w poprzek, wzdłuż, w szachownicę albo pod 45°. Spokojne, tanie w malowaniu.', 'Kompozytor II: geometria gry'),
  meta('pro-k-orbit', 'Orbita', 'ORBIT', 'geometric', 'Zagnieżdżone koła przesuwające się w stronę bramek jak tunel. Przesunięcie zawsze mniejsze niż pas, więc nic się nie zwęża.', 'Kompozytor II: geometria gry'),
  meta('pro-k-arcs', 'Łuki', 'ARCS', 'street', 'Koncentryczne łuki z narożników, z linii bramkowych albo ze środka linii bocznych.', 'Kompozytor II: geometria gry'),
  meta('pro-k-argyle', 'Romby', 'ARGY', 'brand', 'Siatka rombów od punktu środkowego, kolor według pierścieni odległości, opcjonalna fuga.', 'Kompozytor II: geometria gry'),
  meta('pro-k-plaid', 'Krata', 'PLAID', 'brand', 'Pasy poziome i pionowe lustrzane względem obu osi; skrzyżowania w trzeciej farbie, jak w tkaninie.', 'Kompozytor II: geometria gry'),
  meta('pro-k-steps', 'Equalizer', 'EQ', 'play', 'Słupki od bramek do środka, wysokość rośnie albo maleje schodkami, jak wskaźnik dźwięku.', 'Kompozytor II: geometria gry'),
  meta('pro-k-rosette', 'Rozeta', 'ROSE', 'organic', 'Pierścienie wokół koła środkowego z regularnymi płatkami (parzysta liczba, więc obie połowy są równe).', 'Kompozytor II: geometria gry'),
  meta('pro-k-cuts', 'Cięcia', 'CUTS', 'geometric', 'Proste cięcia parami symetrycznymi; pola na przemian w dwóch kolorach jak złożony papier, z piastą w środku.', 'Kompozytor II: geometria gry'),
];
export function composerMasking(familyId) { const pool = POOL[familyId]; if (!pool || !pool.length) return 'średnia'; const t = pool.slice(0, 12).map((e) => e.m.t).sort((a, b) => a - b)[Math.min(5, pool.length - 1)] / 150; return t < 1 ? 'niska' : t < 2 ? 'średnia' : t < 3.2 ? 'wysoka' : 'bardzo wysoka'; }
