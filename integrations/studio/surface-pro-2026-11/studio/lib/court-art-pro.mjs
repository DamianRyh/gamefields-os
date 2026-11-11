// Gamefields Court Art Pro — parametric surface engine (2026-11).
// Pure ESM, no dependencies. Same contract as the Studio's PatternArt renderers:
//   renderPro(familyId, variant 1..12, h, colors[5], {uid}) -> SVG inner markup for a 600 x h court.
// Everything is flat, paintable geometry (paths, rects, circles, polygons): no filters, no SVG gradients,
// so it works as a 3D texture and as a stencil plan. Stepped colour bands replace true gradients.
// The Studio draws the court lines on top; designs are composed around the court axes (x=300, y=h/2).

/* ---------------- utilities ---------------- */
const W = 600;
export function rng(seed) {
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
const poly = (list, fill) => '<polygon points="' + pts(list) + '" fill="' + fill + '"/>';
const rect = (x, y, w, h, fill, extra) => '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + fill + '"' + (extra || '') + '/>';
const circ = (x, y, r, fill) => '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(Math.max(0, r)) + '" fill="' + fill + '"/>';
const pathF = (d, fill) => '<path d="' + d + '" fill="' + fill + '"/>';
const pathS = (d, stroke, w, extra) => '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + f(w) + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// smooth closed curve through points (Catmull-Rom -> cubic Bézier)
function closedCurve(p) {
  const n = p.length; let d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d + 'Z';
}
function openCurve(p) {
  const n = p.length; let d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
  for (let i = 0; i < n - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(n - 1, i + 2)];
    d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d;
}
// organic blob: circle with low-frequency radial noise
function blob(cx, cy, r, R, k = 9, amp = 0.28, sx = 1, sy = 1) {
  const ph = [R() * 6.28, R() * 6.28, R() * 6.28], p = [];
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2;
    const m = 1 + amp * (Math.sin(a * 2 + ph[0]) * 0.55 + Math.sin(a * 3 + ph[1]) * 0.3 + (R() - 0.5) * 0.5);
    p.push([cx + Math.cos(a) * r * m * sx, cy + Math.sin(a) * r * m * sy]);
  }
  return closedCurve(p);
}

/* ---------------- colour (OKLab) ---------------- */
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function rgb2lab([r, g, b]) {
  r = toLin(r); g = toLin(g); b = toLin(b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function lab2hex([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return '#' + rgb.map((c) => Math.round(clamp(toSrgb(clamp(c, 0, 1)), 0, 1) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
export function mix(a, b, t) { const A = rgb2lab(hex2rgb(a)), B = rgb2lab(hex2rgb(b)); return lab2hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
export function lightness(hex) { return rgb2lab(hex2rgb(hex))[0]; }
// ramp through a list of colours, n stepped values (paintable bands)
function ramp(list, n) { const out = []; for (let i = 0; i < n; i++) { const t = n === 1 ? 0 : (i / (n - 1)) * (list.length - 1); const k = Math.min(list.length - 2, Math.floor(t)); out.push(mix(list[k], list[k + 1], t - k)); } return out; }
const byLight = (c) => [...c].sort((x, y) => lightness(x) - lightness(y));

/* ---------------- Voronoi (half-plane clipping) ---------------- */
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
function voronoi(points, x0, y0, x1, y1) {
  return points.map((p, i) => {
    let cell = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const near = points.map((q, j) => [j, (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2]).filter((e) => e[0] !== i).sort((a, b) => a[1] - b[1]).slice(0, 18);
    for (const [j] of near) { const q = points[j]; cell = clipHalf(cell, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, q[0] - p[0], q[1] - p[1]); if (cell.length < 3) break; }
    return cell;
  });
}
function shrink(cell, d) { const cx = cell.reduce((s, p) => s + p[0], 0) / cell.length, cy = cell.reduce((s, p) => s + p[1], 0) / cell.length; return cell.map((p) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; const k = Math.max(0, l - d) / l; return [cx + dx * k, cy + dy * k]; }); }
function jitterGrid(R, h, step, j = 0.42, pad = 40) { const p = []; for (let y = -pad; y < h + pad; y += step * 0.866) { const row = Math.round((y + pad) / (step * 0.866)); for (let x = -pad + (row % 2) * step / 2; x < W + pad; x += step) p.push([x + (R() - 0.5) * step * j * 2, y + (R() - 0.5) * step * j * 2]); } return p; }

/* ---------------- families ---------------- */
// Each renderer: (R, v, h, c, uid) -> markup. c = palette [a,b,c,d,e]; render a full-coverage background first.

// 01 Duperré Fade — stepped gradient bands (Pigalle Duperré 2017: blue ends, pink centre)
function fade(R, v, h, c) {
  const mode = v % 4; const n = 7 + (v % 3) * 2; const cx = W / 2 + (v > 4 ? (v > 8 ? -60 : 60) : 0), cy = h / 2; // bands per half; later variants shift the focus
  const ends = [c[0], c[1]], mids = [c[2], c[3]];
  const cols = ramp([ends[0], ends[1], mids[0], mids[1]], n);
  let s = rect(0, 0, W, h, cols[n - 1]);
  if (mode === 0) { // symmetric vertical bands toward halfway line
    const bl = cx / n, br = (W - cx) / n; for (let i = 0; i < n; i++) { const g = v > 4 ? Math.pow(i / n, 0.8) * n : i; s += rect(g * bl - 1, 0, bl + 2 + (v > 4 ? bl * 0.3 : 0), h, cols[i]); s += rect(W - (i + 1) * br - 1, 0, br + 2, h, cols[i]); }
  } else if (mode === 1) { // concentric rounded rectangles from the outline to the centre circle
    for (let i = 0; i < n; i++) { const t = i / n; const ix = t * (W / 2 - 40), iy = t * (cy - 40); s += rect(ix, iy, W - 2 * ix, h - 2 * iy, cols[i], ' rx="' + f(10 + t * 80) + '"'); }
  } else if (mode === 2) { // arcs fanning from both goals
    const R0 = Math.hypot(cx, h); for (let i = 0; i < n; i++) { const r = R0 * (1 - i / n); s += circ(0, cy, r, cols[i]); s += circ(W, cy, r, cols[i]); }
    s += circ(cx, cy, 45 + 6, cols[n - 1]);
  } else { // diagonal bands, mirrored
    const k = n * 2; const all = cols.concat([...cols].reverse()); const L = W + h; const bw = L / k;
    for (let i = 0; i < k; i++) { const x = -h + i * bw; s += poly([[x, h], [x + h, 0], [x + h + bw + 1, 0], [x + bw + 1, h]], all[i]); }
  }
  return s;
}

// 02 Colour Field — recursive colour fields (William LaChance, Kinloch Park)
function fields(R, v, h, c) {
  const leaves = [], target = 7 + (v % 5) * 2; const mirror = v % 3 === 0;
  const split = (x, y, w, hh, depth) => {
    if (depth <= 0 || w < 60 || hh < 50) { leaves.push([x, y, w, hh]); return; }
    const vert = w / hh > 1.15 ? true : w / hh < 0.85 ? false : R() > 0.5; const t = 0.3 + R() * 0.4;
    if (vert) { split(x, y, w * t, hh, depth - 1 - (R() > 0.8 ? 1 : 0)); split(x + w * t, y, w * (1 - t), hh, depth - 1); }
    else { split(x, y, w, hh * t, depth - 1); split(x, y + hh * t, w, hh * (1 - t), depth - 1 - (R() > 0.8 ? 1 : 0)); }
  };
  const depth = Math.round(Math.log2(target)) + 1;
  split(0, 0, mirror ? W / 2 : W, h, depth);
  const extra = [mix(c[0], c[2], 0.5), mix(c[1], c[3], 0.45), mix(c[4], c[0], 0.35)];
  const pal = c.concat(extra.slice(0, v % 4));
  let s = rect(0, 0, W, h, c[4]); let last = -1; const gap = 5 + (v % 2) * 3;
  const draw = (x, y, w, hh, col, i) => {
    s += rect(x + gap / 2, y + gap / 2, w - gap, hh - gap, col, ' rx="3"');
    if (i % 5 === 2 && w > 90 && hh > 70) { // painterly accent inside some fields
      const kind = i % 3; const acc = pal[(i + 2) % pal.length];
      if (kind === 0) s += pathF('M' + f(x + gap) + ' ' + f(y + hh - gap) + 'A' + f(Math.min(w, hh) * 0.5) + ' ' + f(Math.min(w, hh) * 0.5) + ' 0 0 1 ' + f(x + gap + Math.min(w, hh)) + ' ' + f(y + hh - gap) + 'Z', acc);
      else if (kind === 1) { for (let k = 0; k < 4; k++) s += rect(x + gap + 8, y + gap + 10 + k * 16, w - gap * 2 - 16, 6, acc); }
      else s += circ(x + w / 2, y + hh / 2, Math.min(w, hh) * 0.26, acc);
    }
  };
  leaves.forEach((L, i) => { let k = Math.floor(R() * pal.length); if (k === last) k = (k + 1) % pal.length; last = k; draw(L[0], L[1], L[2], L[3], pal[k], i); if (mirror) draw(W - L[0] - L[2], L[1], L[2], L[3], pal[k], i); });
  return s;
}

// 03 Suprematist — tilted bars and planes (Malevich "Sportsmen", Pigalle Duperré 2015)
function suprem(R, v, h, c) {
  const L = byLight(c); const bg = v % 2 ? L[4] : L[3]; const ink = L[0];
  let s = rect(0, 0, W, h, bg);
  const ang = [-18, -24, 14, 21, -30, 9][v % 6]; const cx = W / 2, cy = h / 2;
  const bar = (x, y, w, hh, a, col) => { const r = (a * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r); const P = [[-w / 2, -hh / 2], [w / 2, -hh / 2], [w / 2, hh / 2], [-w / 2, hh / 2]].map(([px, py]) => [x + px * co - py * si, y + px * si + py * co]); s += poly(P, col); };
  s += circ(cx + (R() - 0.5) * 160, cy + (R() - 0.5) * 90, 90 + R() * 60, c[(v + 1) % 5] === bg ? c[(v + 2) % 5] : c[(v + 1) % 5]);
  bar(cx, cy, 760, 70 + R() * 40, ang, c[v % 5] === bg ? c[(v + 3) % 5] : c[v % 5]);
  const n = 6 + (v % 4);
  for (let i = 0; i < n; i++) {
    const big = i < 3; const w = big ? 160 + R() * 200 : 40 + R() * 120, hh = big ? 40 + R() * 70 : 14 + R() * 30;
    const a = ang + (R() > 0.7 ? 90 : 0) + (R() - 0.5) * 8; let col = c[Math.floor(R() * 5)]; if (col === bg) col = ink;
    bar(60 + R() * (W - 120), 40 + R() * (h - 80), w, hh, a, col);
  }
  bar(cx + 120, cy - 60, 520, 8, ang + 90, ink); bar(cx - 160, cy + 80, 300, 8, ang, ink);
  s += rect(30 + R() * 60, h - 90 - R() * 40, 44, 44, ink);
  return s;
}

// 04 Op Rings — concentric rings (Bridget Riley / Vasarely); half-court centres meet on the halfway line
function rings(R, v, h, c, uid) {
  const mode = v % 4; const A = c[v % 5], B = c[(v + 2) % 5], C = c[(v + 4) % 5]; const cy = h / 2;
  let s = rect(0, 0, W, h, A);
  const ringSet = (cx, cyy, step, maxR, cols, mod) => { let out = ''; for (let r = maxR, i = 0; r > 0; r -= step * (mod ? (0.65 + 0.7 * Math.abs(Math.sin(i * 0.5))) : 1), i++) out += circ(cx, cyy, r, cols[i % cols.length]); return out; };
  const step = 16 + (v % 3) * 6;
  if (mode === 0) s += ringSet(W / 2, cy, step, 420, [A, B], false);
  else if (mode === 1) {
    s += '<defs><clipPath id="' + uid + 'L"><rect x="0" y="0" width="300" height="' + h + '"/></clipPath><clipPath id="' + uid + 'Rt"><rect x="300" y="0" width="300" height="' + h + '"/></clipPath></defs>';
    s += '<g clip-path="url(#' + uid + 'L)">' + ringSet(0, cy, step, 420, [A, B], true) + '</g><g clip-path="url(#' + uid + 'Rt)">' + ringSet(W, cy, step, 420, [B, A], true) + '</g>';
  } else if (mode === 2) { // eccentric rings drifting to one goal (Vasarely depth)
    for (let i = 0, r = 460; r > 6; i++, r -= step) { const t = 1 - r / 460; s += circ(W / 2 + t * 170, cy - t * 20, r, i % 2 ? B : A); }
  } else { // warped stripes: vertical bands, amplitude grows to the centre
    const n = Math.round(W / step); for (let i = 0; i < n; i += 2) { const p = []; for (let y = -10; y <= h + 10; y += 20) { const amp = 26 * Math.exp(-((i * step - 300) ** 2) / 22000); p.push([i * step + amp * Math.sin(y / 38), y]); } const q = p.map(([x, y]) => [x + step, y]).reverse(); s += pathF(openCurve(p).replace(/^M/, 'M') + 'L' + q.map((pp) => f(pp[0]) + ' ' + f(pp[1])).join('L') + 'Z', B); }
  }
  if (mode !== 3) s += circ(W / 2, cy, 45 + (v % 2 ? 12 : 0), C);
  return s;
}

// 05 Stretched Checker — warped chequerboard (La Doce, Mexico City)
function checker(R, v, h, c) {
  const mode = v % 4; const A = c[v % 5], B = c[(v + 1) % 5], acc = c[(v + 3) % 5];
  const nx = 12 + (v % 3) * 4, ny = Math.round(nx * h / W);
  const warp = (u, w) => { // u,w in 0..1 -> x,y
    let x = u, y = w;
    if (mode === 0) { x = u + 0.18 * (w - 0.5); } // slant
    else if (mode === 1) { const s = Math.sign(u - 0.5); x = 0.5 + s * Math.pow(Math.abs(u - 0.5) * 2, 1.35) / 2; } // pinch to halfway line
    else if (mode === 2) { x = u + 0.035 * Math.sin(w * Math.PI * 3); y = w + 0.05 * Math.sin(u * Math.PI * 4); } // wave
    else { const dx = u - 0.5, dy = w - 0.5, d = Math.hypot(dx * 1.5, dy); const k = 1 + 0.45 * Math.exp(-d * d * 9); x = 0.5 + dx / k * 1.0; y = 0.5 + dy / k; } // bulge from centre
    return [x * W, y * h];
  };
  let s = rect(0, 0, W, h, A);
  for (let i = -2; i < nx + 2; i++) for (let j = -1; j < ny + 1; j++) {
    if ((i + j) % 2 === 0) continue;
    const u0 = i / nx, u1 = (i + 1) / nx, w0 = j / ny, w1 = (j + 1) / ny;
    const isAcc = (i * 7 + j * 13 + v) % 23 === 0;
    s += poly([warp(u0, w0), warp(u1, w0), warp(u1, w1), warp(u0, w1)], isAcc ? acc : B);
  }
  return s;
}

// 06 Iso Blocks — isometric cubes seen from above (Hypercourt, Memphis blocks)
function iso(R, v, h, c) {
  const L = byLight(c); const top = L[4], left = L[2], right = L[0], alt = [c[(v + 1) % 5], c[(v + 3) % 5]];
  const sz = 30 + (v % 3) * 10; const dx = sz * Math.sqrt(3), dy = sz * 1.5; let s = rect(0, 0, W, h, right);
  const holes = v % 2 === 0; const tint = v % 3 === 1;
  for (let row = -1, y = -sz; y < h + sz * 2; row++, y += dy) for (let x = -dx + (row % 2 ? dx / 2 : 0); x < W + dx; x += dx) {
    const cxp = x, cyp = y; if (holes && R() < 0.12) continue;
    const half = cxp < W / 2; const t2 = tint ? (half ? alt[0] : alt[1]) : top;
    const T = [[cxp, cyp - sz], [cxp + dx / 2, cyp - sz / 2], [cxp, cyp], [cxp - dx / 2, cyp - sz / 2]];
    const Lf = [[cxp - dx / 2, cyp - sz / 2], [cxp, cyp], [cxp, cyp + sz], [cxp - dx / 2, cyp + sz / 2]];
    const Rt = [[cxp, cyp], [cxp + dx / 2, cyp - sz / 2], [cxp + dx / 2, cyp + sz / 2], [cxp, cyp + sz]];
    s += poly(T, t2) + poly(Lf, left) + poly(Rt, right);
  }
  return s;
}

// 07 Textile — woven strip bands (kente, Yinka Ilori, Daily Paper beadwork diamonds)
function textile(R, v, h, c) {
  const L = byLight(c); let s = rect(0, 0, W, h, L[0]);
  const sw = [50, 60, 75][v % 3]; const n = Math.ceil(W / 2 / sw); const ink = L[0], light = L[4];
  const motif = (x, y, w, hh, k, cA, cB) => {
    let o = rect(x, y, w, hh, cA);
    if (k === 0) { for (let i = 0; i < 4; i++) o += rect(x, y + (i + 0.5) * hh / 4 - 3, w, 6, cB); }
    else if (k === 1) { const p = [[x, y + hh]]; const m = 4; for (let i = 0; i <= m; i++) p.push([x + (i / m) * w, y + (i % 2 ? hh * 0.25 : hh * 0.75)]); p.push([x + w, y + hh]); o += poly(p, cB); }
    else if (k === 2) { o += poly([[x + w / 2, y + 6], [x + w - 6, y + hh / 2], [x + w / 2, y + hh - 6], [x + 6, y + hh / 2]], cB); o += poly([[x + w / 2, y + hh * 0.3], [x + w * 0.7, y + hh / 2], [x + w / 2, y + hh * 0.7], [x + w * 0.3, y + hh / 2]], cA); }
    else if (k === 3) { const q = w / 4; for (let i = 0; i < 4; i++) for (let j = 0; j < Math.floor(hh / q); j++) if ((i + j) % 2) o += rect(x + i * q, y + j * q, q, q, cB); }
    else { o += circ(x + w / 2, y + hh / 2, Math.min(w, hh) * 0.32, cB); }
    return o;
  };
  for (let i = 0; i < n; i++) {
    let y = 0; const cols = [c[(i + v) % 5], c[(i + v + 2) % 5]];
    while (y < h) {
      const hh = Math.min(h - y, [40, 60, 80, 100][Math.floor(R() * 4)]); const k = Math.floor(R() * 5);
      const a = R() > 0.5 ? cols[0] : cols[1]; let b = R() > 0.5 ? light : ink; if (b === a) b = cols[1];
      const m = motif(i * sw, y, sw, hh, k, a, b); s += m;
      s += '<g transform="translate(600 0) scale(-1 1)">' + motif(i * sw, y, sw, hh, k, a, b) + '</g>';
      y += hh;
    }
  }
  for (let i = 1; i < n * 2; i++) s += rect(i * sw - 1.5, 0, 3, h, ink);
  return s;
}

// 08 Memphis Play — scattered shapes and squiggles between the lines (Memphis, Ezelsplein)
function memphis(R, v, h, c) {
  const L = byLight(c); const bg = v % 2 ? L[4] : L[1]; let s = rect(0, 0, W, h, bg);
  const cols = c.filter((x) => x !== bg); const placed = []; const ok = (x, y, r) => Math.hypot(x - 300, y - h / 2) > 70 + r && placed.every((p) => Math.hypot(p[0] - x, p[1] - y) > p[2] + r + 10);
  const items = 26 + (v % 4) * 6;
  for (let i = 0, tries = 0; i < items && tries < 900; tries++) {
    const r = 14 + R() * 34, x = 20 + R() * (W - 40), y = 20 + R() * (h - 40); if (!ok(x, y, r)) continue; placed.push([x, y, r]); i++;
    const col = cols[Math.floor(R() * cols.length)], k = Math.floor(R() * 7), a = R() * 6.28;
    if (k === 0) s += circ(x, y, r * 0.8, col);
    else if (k === 1) s += poly([0, 1, 2].map((j) => [x + Math.cos(a + j * 2.094) * r, y + Math.sin(a + j * 2.094) * r]), col);
    else if (k === 2) { const p = []; for (let t = 0; t <= 6; t++) p.push([x - r + (t / 6) * 2 * r, y + (t % 2 ? -r * 0.35 : r * 0.35)]); s += '<g transform="rotate(' + f(a * 57.3) + ' ' + f(x) + ' ' + f(y) + ')">' + pathS('M' + p.map((q) => f(q[0]) + ' ' + f(q[1])).join('L'), col, 9) + '</g>'; }
    else if (k === 3) { const p = []; for (let t = 0; t <= 8; t++) p.push([x - r + (t / 8) * 2 * r, y + Math.sin(t * 1.4) * r * 0.4]); s += '<g transform="rotate(' + f(a * 57.3) + ' ' + f(x) + ' ' + f(y) + ')">' + pathS(openCurve(p), col, 10) + '</g>'; }
    else if (k === 4) { for (let gx = 0; gx < 3; gx++) for (let gy = 0; gy < 3; gy++) s += circ(x - r * 0.6 + gx * r * 0.6, y - r * 0.6 + gy * r * 0.6, 4.5, col); }
    else if (k === 5) s += pathF('M' + f(x - r) + ' ' + f(y) + 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + r) + ' ' + f(y) + 'Z', col);
    else s += '<g transform="rotate(' + f(a * 57.3) + ' ' + f(x) + ' ' + f(y) + ')">' + rect(x - r, y - r * 0.25, r * 2, r * 0.5, col) + '</g>';
  }
  return s;
}

// 09 Kintsugi — tonal concrete cells joined by gold veins (Victor Solomon, Kintsugi Court)
function kintsugi(R, v, h, c) {
  const chroma = (x) => { const [, A, B] = rgb2lab(hex2rgb(x)); return Math.hypot(A, B); };
  const vein = [...c].sort((x, y) => chroma(y) - chroma(x))[0]; const L = byLight(c.filter((x) => x !== vein));
  const mid = L[Math.floor(L.length / 2)]; const greys = [mix(L[0], '#8A8884', 0.55), mix(mid, '#A3A19B', 0.62), mix(L[L.length - 1], '#C4C1B9', 0.5), mix(mid, '#B6B3AC', 0.45)];
  const pts0 = jitterGrid(R, h, 70 + (v % 3) * 25, 0.45); const cells = voronoi(pts0, -20, -20, W + 20, h + 20);
  let s = rect(0, 0, W, h, greys[1]);
  cells.forEach((cell, i) => { if (cell.length > 2) s += poly(cell, greys[Math.floor(R() * greys.length)]); });
  cells.forEach((cell) => { if (cell.length < 3) return; for (let k = 0; k < cell.length; k++) { if (R() > 0.38) continue; const a = cell[k], b = cell[(k + 1) % cell.length]; const m = [(a[0] + b[0]) / 2 + (R() - 0.5) * 10, (a[1] + b[1]) / 2 + (R() - 0.5) * 10]; s += pathS('M' + f(a[0]) + ' ' + f(a[1]) + 'Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(b[0]) + ' ' + f(b[1]), vein, 2.5 + R() * 6); } });
  return s;
}

// 10 Freehand — loose hand-drawn lines on deep colour (MRKA, Casa Axis 2026)
function freehand(R, v, h, c) {
  const L = byLight(c); const bg = L[v % 2]; const ink = L[4]; const acc = c[(v + 2) % 5] === bg ? L[3] : c[(v + 2) % 5];
  let s = rect(0, 0, W, h, bg);
  const wob = (p, amp) => p.map(([x, y]) => [x + (R() - 0.5) * amp, y + (R() - 0.5) * amp]);
  const echoes = 2 + (v % 3);
  for (let e = 0; e < echoes; e++) { // echo court outline + centre circle by hand
    const o = 26 + e * 22 + R() * 8; const p = []; const seg = 10;
    for (let i = 0; i <= seg; i++) p.push([o + (W - 2 * o) * i / seg, o]); for (let i = 1; i <= seg * 0.66; i++) p.push([W - o, o + (h - 2 * o) * i / (seg * 0.66)]);
    for (let i = 1; i <= seg; i++) p.push([W - o - (W - 2 * o) * i / seg, h - o]); for (let i = 1; i < seg * 0.66; i++) p.push([o, h - o - (h - 2 * o) * i / (seg * 0.66)]);
    s += pathS(closedCurve(wob(p, 10)), e === 0 ? ink : acc, 4 + R() * 2);
    const cp = []; const rr = 70 + e * 30; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; cp.push([300 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr]); } s += pathS(closedCurve(wob(cp, 14)), e % 2 ? acc : ink, 4);
  }
  const loops = 3 + (v % 4); for (let k = 0; k < loops; k++) { const x = 60 + R() * 480, y = 50 + R() * (h - 100); const p = []; for (let t = 0; t < 22; t++) p.push([x + Math.cos(t * 0.9) * (18 + t * 1.4) + t * 4, y + Math.sin(t * 0.9) * (12 + t)]); s += pathS(openCurve(p), k % 2 ? ink : acc, 4); }
  return s;
}

// 11 Sunburst — rays from the centre circle or from both goals
function sunburst(R, v, h, c, uid) {
  const mode = v % 3; const A = c[v % 5], B = c[(v + 2) % 5], C = c[(v + 4) % 5]; const cy = h / 2; let s = rect(0, 0, W, h, A);
  const n = 18 + (v % 4) * 6; const twist = (v % 2) * 0.5;
  const burst = (cx, cyy, from, to, cols) => { let o = ''; const span = to - from, R0 = 900, tw = twist * 0.9; for (let i = 0; i < n; i++) { if (cols.length === 2 && i % 2 === 0) continue; const a0 = from + span * i / n, a1 = from + span * (i + 1) / n; const P = (a, r) => f(cx + Math.cos(a) * r) + ' ' + f(cyy + Math.sin(a) * r); o += pathF('M' + P(a0, 0) + 'Q' + P(a0 - tw, 320) + ' ' + P(a0 - tw * 1.6, R0) + 'L' + P(a1 - tw * 1.6, R0) + 'Q' + P(a1 - tw, 320) + ' ' + P(a1, 0) + 'Z', cols[i % cols.length]); } return o; };
  if (mode === 0) { s += burst(300, cy, 0, 6.283, [A, B]); s += circ(300, cy, 95, C) + circ(300, cy, 60, B); }
  else if (mode === 1) { s += '<defs><clipPath id="' + uid + 'sl"><rect width="300" height="' + h + '"/></clipPath><clipPath id="' + uid + 'sr"><rect x="300" width="300" height="' + h + '"/></clipPath></defs>'; s += '<g clip-path="url(#' + uid + 'sl)">' + burst(0, cy, -1.571, 1.571, [A, B]) + '</g><g clip-path="url(#' + uid + 'sr)">' + burst(W, cy, 1.571, 4.712, [A, B]) + '</g>'; s += circ(0, cy, 100, C) + circ(W, cy, 100, C); }
  else { s += burst(300, h + 40, 3.14, 6.283, [A, B, C]); s += circ(300, h + 40, 120, c[(v + 1) % 5]); }
  return s;
}

// 12 Halftone — dot screen whose size follows a field (print halftone, stencil-friendly)
function halftone(R, v, h, c) {
  const mode = v % 4; const L = byLight(c); const bg = v % 2 ? L[4] : L[0]; const dotA = c[(v + 1) % 5] === bg ? L[2] : c[(v + 1) % 5], dotB = c[(v + 3) % 5] === bg ? L[3] : c[(v + 3) % 5];
  const step = 18 + (v % 3) * 4; let s = rect(0, 0, W, h, bg);
  const fld = (x, y) => { const u = x / W, w = y / h; if (mode === 0) return Math.abs(u - 0.5) * 2; if (mode === 1) return 1 - Math.min(1, Math.hypot((u - 0.5) * 1.5, w - 0.5) * 1.6); if (mode === 2) return 0.5 + 0.5 * Math.sin(u * 9 + Math.sin(w * 5) * 1.5); return clamp(u * 0.7 + w * 0.6 - 0.1, 0, 1); };
  for (let y = step / 2, row = 0; y < h + step; y += step * 0.866, row++) for (let x = (row % 2) * step / 2; x < W + step; x += step) { const t = fld(x, y); const r = step * 0.5 * Math.pow(t, 0.8); if (r > 1.2) s += circ(x, y, r, t > 0.62 ? dotB : dotA); }
  return s;
}

// 13 Topo Fill — filled elevation bands (contour map, colour ramp)
function topo(R, v, h, c) {
  const ord = v % 2 ? byLight(c) : byLight(c).reverse(); const levels = 6 + (v % 3) * 2; const cols = ramp(ord, levels);
  let s = rect(0, 0, W, h, cols[0]); const peaks = 3 + (v % 3); const rings = [];
  for (let p = 0; p < peaks; p++) { const x = 60 + R() * 480, y = 50 + R() * (h - 100), r0 = 120 + R() * 170, sx = 1 + R() * 0.5, sy = 0.7 + R() * 0.4; const sub = rng(Math.floor(R() * 1e9)); for (let k = 1; k < levels; k++) rings.push([r0 * (1 - k / levels) + 8, k, x, y, sx, sy, sub]); }
  rings.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  rings.forEach(([r, k, x, y, sx, sy, sub]) => { s += pathF(blob(x, y, r, sub, 12, 0.22, sx, sy), cols[k]); });
  return s;
}

// 14 Camo Pro — four-layer organic camouflage, optional digital (Nike Bondy pitch)
function camo(R, v, h, c) {
  const L = byLight(c); const digital = v % 3 === 2; const cols = v % 2 ? [L[3], L[2], L[1], L[0]] : [L[1], L[2], L[3], L[4]]; let s = rect(0, 0, W, h, v % 2 ? L[4] : L[0]);
  const layers = cols.map((col, li) => { const n = 9 + li * 3, size = 95 - li * 18, list = []; for (let i = 0; i < n; i++) list.push([R() * W, R() * h, size * (0.6 + R() * 0.8), R() * 1e9]); return [col, list]; });
  if (!digital) { layers.forEach(([col, list]) => list.forEach(([x, y, r, sd]) => { s += pathF(blob(x, y, r, rng(sd), 10, 0.45, 1.5, 0.8), col); })); return s; }
  const cell = 15; const shapes = layers.map(([col, list]) => [col, list.map(([x, y, r]) => [x, y, r])]);
  for (let gy = 0; gy < h; gy += cell) { for (const [col, list] of shapes) { let run = -1; for (let gx = 0; gx <= W; gx += cell) { const inside = gx < W && list.some(([x, y, r]) => ((gx + cell / 2 - x) / 1.5) ** 2 + ((gy + cell / 2 - y) / 0.8) ** 2 < r * r * 0.55); if (inside && run < 0) run = gx; if (!inside && run >= 0) { s += rect(run, gy, gx - run, cell, col); run = -1; } } } }
  return s;
}

// 15 Mosaic — Voronoi tiles coloured along a gradient field (terrazzo / mosaic, grout = base)
function mosaic(R, v, h, c) {
  const L = byLight(c); const grout = v % 2 ? L[4] : L[0]; const step = 34 + (v % 4) * 10; const cells = voronoi(jitterGrid(R, h, step, 0.4), -10, -10, W + 10, h + 10);
  const cols = c.filter((x) => x !== grout); const mode = v % 3; let s = rect(0, 0, W, h, grout);
  cells.forEach((cell) => { if (cell.length < 3) return; const cx = cell.reduce((a, p) => a + p[0], 0) / cell.length, cy = cell.reduce((a, p) => a + p[1], 0) / cell.length; let t = mode === 0 ? Math.abs(cx - 300) / 300 : mode === 1 ? Math.hypot(cx - 300, (cy - h / 2) * 1.5) / 340 : (Math.sin(cx / 70) + Math.cos(cy / 55)) / 4 + 0.5; t = clamp(t + (R() - 0.5) * 0.28, 0, 0.999); s += poly(shrink(cell, 2.5 + (v % 2) * 1.5), cols[Math.floor(t * cols.length)]); });
  return s;
}

// 16 Big Numbers — cropped block digits as supergraphics (club numbers, local codes)
const DIG = { 0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '011', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'], 6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'] };
function numbers(R, v, h, c) {
  const L = byLight(c); const bg = c[v % 5], ink = lightness(bg) > 0.6 ? L[0] : L[4]; const acc = c.filter((x) => x !== bg).sort((x, y) => Math.abs(lightness(y) - lightness(ink)) - Math.abs(lightness(x) - lightness(ink)))[0];
  let s = rect(0, 0, W, h, bg); const num = String([10, 15, 23, 26, 33, 7, 9, 11, 21, 45, 88, 3][v - 1] ?? 26).padStart(2, '0');
  const u = h / 5.6; const totalW = num.length * 3 * u + (num.length - 1) * u * 0.6; let x0 = (W - totalW) / 2; const y0 = (h - 5 * u) / 2;
  if (v % 3 === 0) { for (let i = 0; i < 10; i++) s += rect(0, i * h / 10, W, h / 20, acc); }
  [...num].forEach((d, k) => { DIG[d].forEach((row, j) => [...row].forEach((b, i) => { if (b === '1') s += rect(x0 + i * u, y0 + j * u, u + 0.5, u + 0.5, ink); })); x0 += 3 * u + u * 0.6; });
  if (v % 3 === 1) s += rect(0, h * 0.46, W, h * 0.08, acc);
  return s;
}

/* ---------------- Masters collection (2026-11-10) ---------------- */
// Twelve directions after the great schools of graphic design and painting. Each one borrows a method
// (grid, proportion, colour interaction, pattern logic), never a specific work. Same contract and flat geometry.
const sector = (cx, cy, r0, r1, a0, a1, fill) => {
  const p = (r, a) => f(cx + Math.cos(a) * r) + ' ' + f(cy + Math.sin(a) * r);
  const large = a1 - a0 > Math.PI + 1e-6 ? 1 : 0;
  if (r0 <= 0.5) return pathF('M' + f(cx) + ' ' + f(cy) + 'L' + p(r1, a0) + 'A' + f(r1) + ' ' + f(r1) + ' 0 ' + large + ' 1 ' + p(r1, a1) + 'Z', fill);
  return pathF('M' + p(r1, a0) + 'A' + f(r1) + ' ' + f(r1) + ' 0 ' + large + ' 1 ' + p(r1, a1) + 'L' + p(r0, a1) + 'A' + f(r0) + ' ' + f(r0) + ' 0 ' + large + ' 0 ' + p(r0, a0) + 'Z', fill);
};
const others = (c, bg) => { const o = c.filter((x) => x.toUpperCase() !== bg.toUpperCase()); return o.length ? o : [byLight(c)[0]]; };
const pick = (list, i) => list[((Math.floor(i) % list.length) + list.length) % list.length];
const rot180 = (h, inner) => '<g transform="rotate(180 300 ' + f(h / 2) + ')">' + inner + '</g>';

// 17 Swiss Grid — International Typographic Style: a 12-column module decides every size and position
function swiss(R, v, h, c) {
  const L = byLight(c); const bg = v % 4 === 3 ? L[0] : L[4]; const o = others(c, bg); const mode = v % 3; const u = W / 12; const rows = Math.max(4, Math.round(h / u));
  let s = rect(0, 0, W, h, bg);
  if (mode === 0) { // dot matrix: module circles grow toward a focus on the grid
    const fx = u * (2 + (v % 5) * 2), fy = h * (v % 2 ? 0.3 : 0.7); const maxD = Math.hypot(W, h) * 0.62;
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < 12; gx++) { const x = gx * u + u / 2, y = (gy + 0.5) * h / rows; const t = 1 - Math.min(1, Math.hypot(x - fx, y - fy) / maxD); s += circ(x, y, u * 0.47 * Math.pow(t, 1.3), pick(o, t > 0.55 ? v : v + 1)); }
  } else if (mode === 1) { // quarter rings from two opposite corners, widths on the module
    const k = 6 + (v % 3); [[0, h, -Math.PI / 2, 0], [W, 0, Math.PI / 2, Math.PI]].forEach(([cx, cy, a0, a1], side) => { for (let i = 0; i < k; i++) { const r0 = u * (1 + i * 0.75); s += sector(cx, cy, r0, r0 + u * 0.5, a0, a1, pick(o, i + side + v)); } });
    s += rect(u * 6, h / 2 - u / 2, u, u, pick(o, v + 2));
  } else { // ragged-right bars like set lines, flush to one axis, plus one large circle on a grid crossing
    const axis = u * (v % 2 ? 3 : 2); const lh = h / rows; let y = lh * 0.5;
    for (let i = 0; i < rows - 1; i++) { const len = u * (2 + Math.floor(R() * 8)); s += rect(axis, y, Math.min(len, W - axis - u), lh * (i % 3 === 0 ? 0.62 : 0.34), pick(o, i % 3 === 0 ? v : v + 1)); y += lh; }
    s += circ(u * 9, h * 0.62, u * 2.5, pick(o, v + 2));
  }
  return s;
}

// 18 Homage Squares — Josef Albers: nested squares sunk toward the bottom edge (1.5 : 1 : 0.5 margins)
function homage(R, v, h, c) {
  const L = byLight(c); const order = v % 2 ? L : [...L].reverse(); const cols = [0, 1, 2, 3, 4].map((i) => order[(i + Math.floor(v / 4)) % 5]);
  const n = 3 + (v % 2); const mode = v % 3; let s = rect(0, 0, W, h, cols[0]);
  const nest = (x, y, w, hh, flip, shift) => { const ux = w / (2 * n + 2), uy = hh / (3 * n + 3); for (let i = 0; i < n; i++) { const top = i * 1.5 * uy, bot = i * 0.5 * uy; s += rect(x + i * ux, y + (flip ? bot : top), w - 2 * i * ux, hh - top - bot, cols[(i + 1 + shift) % 5]); } };
  if (mode === 0) { const S = Math.min(280, h * 0.9); nest(150 - S / 2, h / 2 - S / 2, S, S, false, 0); nest(450 - S / 2, h / 2 - S / 2, S, S, true, 0); }
  else if (mode === 1) nest(W * 0.04, h * 0.06, W * 0.92, h * 0.88, false, 0);
  else { const S = Math.min(140, h * 0.44); [[150, h * 0.27], [450, h * 0.27], [150, h * 0.73], [450, h * 0.73]].forEach(([x, y], q) => nest(x - S / 2, y - S / 2, S, S, q > 1, q)); }
  return s;
}

// 19 Hard Edge — Ellsworth Kelly: one or two flat colours meeting on a single decisive curve
function hardEdge(R, v, h, c) {
  const mode = v % 4; const A = c[v % 5]; const o = others(c, A); const B = pick(o, v), C = pick(o, v + 2); const cy = h / 2; let s = rect(0, 0, W, h, A);
  if (mode === 0) { const r = W * 0.78; s += circ(W * 1.02, h * 1.1, r, B); if (v > 6) s += circ(-W * 0.02, -h * 0.1, r * 0.62, C); }
  else if (mode === 1) { const k = 120 + (v % 3) * 50; s += pathF('M0 0H300C' + f(300 + k) + ' ' + f(h * 0.3) + ' ' + f(300 - k) + ' ' + f(h * 0.7) + ' 300 ' + f(h) + 'H0Z', B); }
  else if (mode === 2) { s += pathF('M0 ' + f(h) + 'Q' + f(W * 0.12) + ' ' + f(h * 0.08) + ' ' + f(W) + ' 0V' + f(h) + 'Z', B); s += pathF('M' + f(W) + ' ' + f(h) + 'Q' + f(W * 0.82) + ' ' + f(h * 0.62) + ' ' + f(W * 0.45) + ' ' + f(h) + 'Z', C); }
  else { const m = 5 + (v % 3); const pw = W / 2 / m; for (let i = 0; i < m; i++) { const col = pick(c, i + v); s += rect(i * pw, 0, pw + 0.5, h, col); s += rect(W - (i + 1) * pw, 0, pw + 0.5, h, col); } }
  return s;
}

// 20 Dazzle — First World War dazzle camouflage: big facets, each striped in its own direction
function dazzle(R, v, h, c) {
  const L = byLight(c); const dark = L[0], light = L[4], acc = [L[1], L[2], L[3]]; const n = 6 + (v % 4) * 2; const mirror = v % 2 === 0;
  let ptsList = []; for (let i = 0; i < n; i++) ptsList.push([R() * (mirror ? W / 2 : W), R() * h]); if (mirror) ptsList = ptsList.concat(ptsList.map((p) => [W - p[0], h - p[1]]));
  const cells = voronoi(ptsList, -5, -5, W + 5, h + 5); let s = rect(0, 0, W, h, light);
  const looks = cells.map((cell, i) => { const r = R(); return { a: R() * Math.PI, sw: 9 + R() * 15 + (v % 3) * 3, pair: r < 0.6 ? [dark, light] : r < 0.8 ? [acc[i % 3], dark] : [light, acc[(i + 1) % 3]] }; });
  cells.forEach((cell, i) => {
    if (cell.length < 3) return; const look = mirror && i >= n ? looks[i - n] : looks[i]; const nx = Math.cos(look.a), ny = Math.sin(look.a);
    s += poly(cell, look.pair[0]); const pr = cell.map((p) => p[0] * nx + p[1] * ny); const lo = Math.min(...pr), hi = Math.max(...pr);
    for (let d = lo + look.sw * 0.5; d < hi; d += look.sw * 2) { let band = clipHalf(cell, nx * (d + look.sw), ny * (d + look.sw), nx, ny); if (band.length >= 3) band = clipHalf(band, nx * d, ny * d, -nx, -ny); if (band.length >= 3) s += poly(band, look.pair[1]); }
  });
  return s;
}

// 21 Simultané — Sonia Delaunay: discs of rings split into quadrants, colours set against each other
function simultane(R, v, h, c) {
  const L = byLight(c); const bg = v % 2 ? L[4] : L[0]; const o = others(c, bg); const mode = v % 3; let s = rect(0, 0, W, h, bg);
  const disc = (cx, cy, r, rings, quad, off) => { const w = r / rings; for (let i = 0; i < rings; i++) for (let q = 0; q < quad; q++) { const a0 = -Math.PI / 2 + (q * 2 * Math.PI) / quad; s += sector(cx, cy, r - (i + 1) * w, r - i * w, a0, a0 + (2 * Math.PI) / quad, pick(o, i + q * 2 + off + (i % 2 && q % 2 ? 1 : 0))); } };
  if (mode === 0) { disc(300, h / 2, h * 0.46, 5, 4, v); [[0, 0], [W, 0], [0, h], [W, h]].forEach(([x, y], k) => disc(x, y, h * 0.3, 3, 4, v + k + 1)); }
  else if (mode === 1) { const r = Math.min(140, h * 0.42); disc(150, h / 2, r, 4, 4, v); disc(450, h / 2, r, 4, 4, v + 1); disc(300, 0, h * 0.18, 2, 2, v + 2); disc(300, h, h * 0.18, 2, 2, v + 3); }
  else { const cw = W / 4, rows = Math.max(2, Math.round(h / 150)), ch = h / rows; for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < 4; gx++) { s += rect(gx * cw, gy * ch, cw + 0.5, ch + 0.5, pick(o, gx + gy * 2 + v)); disc(gx * cw + cw / 2, gy * ch + ch / 2, Math.min(cw, ch) * 0.42, 3, (gx + gy) % 2 ? 2 : 4, gx + gy + v + 1); } }
  return s;
}

// 22 Cut-Outs — Matisse gouache cut-outs: lobed stars, leaves and algae on one to three colour grounds
function cutouts(R, v, h, c) {
  const mode = v % 3; const panels = mode === 0 ? [[0, W, c[4]]] : mode === 1 ? [[0, W / 2, c[4]], [W / 2, W, c[1]]] : [[0, W / 3, c[1]], [W / 3, (2 * W) / 3, c[4]], [(2 * W) / 3, W, c[0]]];
  let s = ''; panels.forEach(([x0, x1, col]) => { s += rect(x0, 0, x1 - x0 + 0.5, h, col); }); const groundAt = (x) => (panels.find((p) => x >= p[0] && x < p[1]) || panels[0])[2];
  const placed = []; const n = 9 + (v % 4) * 2;
  for (let i = 0, tries = 0; i < n && tries < 700; tries++) {
    const r = 32 + R() * 42, x = 30 + R() * (W - 60), y = 30 + R() * (h - 60);
    if (Math.hypot(x - 300, y - h / 2) < 55 + r * 0.6 || placed.some((p) => Math.hypot(p[0] - x, p[1] - y) < (p[2] + r) * 0.82)) continue; placed.push([x, y, r]); i++;
    const cols = others(c, groundAt(x)); const col = pick(cols, R() * cols.length); const a = R() * Math.PI * 2; const k = (i + v) % 3;
    if (k === 0) { const lobes = 5 + Math.floor(R() * 3), p = []; for (let j = 0; j < lobes * 2; j++) { const aa = a + (j * Math.PI) / lobes, rr = j % 2 ? r * (0.3 + R() * 0.12) : r * (0.85 + R() * 0.25); p.push([x + Math.cos(aa) * rr, y + Math.sin(aa) * rr]); } s += pathF(closedCurve(p), col); }
    else if (k === 1) { const len = r * 1.2, top = [], bot = [], steps = 10; for (let j = 0; j <= steps; j++) { const t = j / steps, wd = r * 0.44 * Math.sin(Math.PI * t) * (0.7 + 0.5 * Math.abs(Math.sin(t * Math.PI * 3 + i))), ax = (t - 0.5) * 2 * len; top.push([ax, -wd]); bot.push([ax, wd]); } const pts = top.concat(bot.reverse().slice(1, -1)).map(([px, py]) => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)]); s += pathF(closedCurve(pts), col); }
    else s += pathF(blob(x, y, r * 0.72, R, 8, 0.42), col);
  }
  return s;
}

// 23 Supergraphic — 1960s environmental supergraphics: bundles of fat stripes that sweep and turn
function supergraphic(R, v, h, c) {
  const L = byLight(c); const bg = v % 2 ? L[4] : L[0]; const o = others(c, bg); const mode = v % 3; const sw = 18 + (v % 4) * 4, k = 4 + (v % 2); let s = rect(0, 0, W, h, bg);
  if (mode === 0) { const r0 = h * 0.22; [[0, h, -Math.PI / 2, 0], [W, 0, Math.PI / 2, Math.PI]].forEach(([cx, cy, a0, a1], side) => { for (let i = 0; i < k; i++) s += sector(cx, cy, r0 + i * sw * 1.6, r0 + i * sw * 1.6 + sw, a0, a1, pick(o, i + side + v)); }); }
  else if (mode === 1) { // a stripe bundle enters from a goal line, turns 90° and runs off the side line; mirrored
    const tx = W * 0.22, ty = h * 0.64, rIn = h * 0.1; let g = '';
    for (let i = 0; i < k; i++) { const r0 = rIn + i * sw * 1.5, col = pick(o, i + v); g += rect(-2, ty - r0 - sw, tx + 2, sw, col) + sector(tx, ty, r0, r0 + sw, -Math.PI / 2, 0, col) + rect(tx + r0, ty, sw, h - ty + 2, col); }
    s += g + rot180(h, g);
  } else { const ang = Math.atan2(h, W); const nx = -Math.sin(ang), ny = Math.cos(ang); const span = (k - 1) * sw * 1.5; for (let i = 0; i < k; i++) { const off = -span / 2 + i * sw * 1.5; const ox = 300 + nx * off, oy = h / 2 + ny * off, dx = Math.cos(ang) * 900, dy = Math.sin(ang) * 900; s += poly([[ox - dx, oy - dy], [ox + dx, oy + dy], [ox + dx + nx * sw, oy + dy + ny * sw], [ox - dx + nx * sw, oy - dy + ny * sw]], pick(o, i + v)); } [[0, -Math.PI / 2, Math.PI / 2], [W, Math.PI / 2, Math.PI * 1.5]].forEach(([x, a0, a1], side) => { for (let i = 0; i < 3; i++) s += sector(x, h / 2, h * 0.08 + i * sw * 1.5, h * 0.08 + i * sw * 1.5 + sw, a0, a1, pick(o, i + side + v + 1)); }); }
  return s;
}

// 24 Truchet — Truchet tiles (1704): quarter-circle tiles that join into endless meanders
function truchet(R, v, h, c) {
  const L = byLight(c); const bg = v % 2 ? L[4] : L[0]; const o = others(c, bg); const t = [40, 50, 60][v % 3]; const cols = Math.ceil(W / t), rows = Math.ceil(h / t); const sym = v % 4 < 2; const lw = t * (0.24 + (v % 2) * 0.08); const fillQ = v % 3 === 0;
  const ori = []; for (let y = 0; y < rows; y++) { ori.push([]); for (let x = 0; x < cols; x++) ori[y].push(R() > 0.5 ? 1 : 0); }
  if (sym) for (let y = 0; y < rows; y++) for (let x = Math.ceil(cols / 2); x < cols; x++) ori[y][x] = ori[rows - 1 - y][cols - 1 - x];
  let s = rect(0, 0, W, h, bg); const strokes = {}; const q = (cx, cy, r, a0) => 'M' + f(cx + Math.cos(a0) * r) + ' ' + f(cy + Math.sin(a0) * r) + 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(cx + Math.cos(a0 + Math.PI / 2) * r) + ' ' + f(cy + Math.sin(a0 + Math.PI / 2) * r);
  for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
    const x0 = gx * t, y0 = gy * t; const ring = Math.floor(Math.hypot(gx + 0.5 - cols / 2, (gy + 0.5 - rows / 2) * 1.4) / 2.2); const col = pick(o, ring + v);
    const corners = ori[gy][gx] ? [[x0 + t, y0, Math.PI / 2], [x0, y0 + t, -Math.PI / 2]] : [[x0, y0, 0], [x0 + t, y0 + t, Math.PI]];
    corners.forEach(([cx, cy, a0]) => { if (fillQ) s += sector(cx, cy, 0, t / 2 - lw / 2, a0, a0 + Math.PI / 2, pick(o, ring + v + 1)); strokes[col] = (strokes[col] || '') + q(cx, cy, t / 2, a0); });
  }
  for (const col in strokes) s += '<path d="' + strokes[col] + '" fill="none" stroke="' + col + '" stroke-width="' + f(lw) + '" stroke-linecap="butt"/>';
  return s;
}

// 25 Nihon Disc — post-war Japanese poster school: one great disc, cut into bands, on a quiet ground
function nihon(R, v, h, c) {
  const L = byLight(c); const bg = v % 3 === 2 ? L[0] : L[4]; const o = others(c, bg); const sun = pick(o, v); const mode = v % 3; let s = rect(0, 0, W, h, bg);
  const band = (cx, cy, r, ya, yb, col) => { const pts = []; const dx = (y) => Math.sqrt(Math.max(0, r * r - (y - cy) ** 2)); for (let j = 0; j <= 10; j++) { const y = ya + ((yb - ya) * j) / 10; pts.push([cx + dx(y), y]); } for (let j = 10; j >= 0; j--) { const y = ya + ((yb - ya) * j) / 10; pts.push([cx - dx(y), y]); } return poly(pts, col); };
  const striped = (cx, cy, r, n, col, flip) => { const hs = [], gs = []; for (let i = 0; i < n; i++) { hs.push(1 - i / (n + 1)); gs.push(i ? (i / (n + 1)) * 0.9 : 0); } const tot = hs.reduce((a, b) => a + b, 0) + gs.reduce((a, b) => a + b, 0); const k = (2 * r) / tot; let y = 0, out = ''; for (let i = 0; i < n; i++) { y += gs[i] * k; const ya = y, yb = y + hs[i] * k; y = yb; out += flip ? band(cx, cy, r, cy + r - yb, cy + r - ya, col) : band(cx, cy, r, cy - r + ya, cy - r + yb, col); } return out; };
  if (mode === 0) { s += striped(300, h * 0.47, h * 0.39, 8 + (v % 3), sun, false); s += rect(0, h * 0.92, W, h * 0.025, pick(o, v + 1)); }
  else if (mode === 1) { const r = Math.min(135, h * 0.4); s += striped(150, h / 2, r, 7, sun, false) + striped(450, h / 2, r, 7, pick(o, v + 1), true); }
  else { const u = W / 12, rows = Math.round(h / u); for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < 12; gx++) s += circ(gx * u + u / 2, (gy + 0.5) * h / rows, u * 0.16, pick(o, v + 1)); s += circ(W * 0.62, h * 0.46, h * 0.3, sun); s += rect(W * 0.08, h * 0.78, W * 0.36, h * 0.05, pick(o, v + 2)); }
  return s;
}

// 26 Loop Bands — late Sol LeWitt wall drawings: fat undulating bands with a contrasting outline
function loops(R, v, h, c) {
  const L = byLight(c); const bg = v % 2 ? L[4] : L[1]; const ink = v % 2 ? L[0] : L[4]; const o = others(c, bg).filter((x) => x !== ink); const cols = o.length ? o : [L[2]]; const mode = v % 3; const bw = 34 + (v % 3) * 8; let s = rect(0, 0, W, h, bg);
  if (mode !== 2) { const n = Math.ceil(h / (bw * 1.25)) + 2, amp = 20 + (v % 4) * 9, fr = ((mode === 0 ? 2 : 3) * Math.PI * 2) / W, ph = R() * 6.28; for (let i = -1; i < n; i++) { const y0 = i * bw * 1.25, p = []; for (let x = -40; x <= W + 40; x += 20) p.push([x, y0 + Math.sin(x * fr + ph + (mode === 1 ? i * 0.6 : 0)) * amp]); const d = openCurve(p); s += pathS(d, ink, bw) + pathS(d, pick(cols, i + v), bw - 10); } }
  else { const ph = R() * 6.28, ph2 = R() * 6.28; for (let i = 9; i >= 1; i--) { const r = i * bw * 0.95; const ring = (rr) => { const p = []; for (let j = 0; j < 14; j++) { const a = (j / 14) * Math.PI * 2, m = 1 + 0.16 * Math.sin(2 * a + ph) + 0.09 * Math.sin(3 * a + ph2); p.push([300 + Math.cos(a) * rr * m * 1.45, h / 2 + Math.sin(a) * rr * m * 0.9]); } return closedCurve(p); }; s += pathF(ring(r + 5), ink) + pathF(ring(r), pick(cols, i + v)); } }
  return s;
}

// 27 Kinetic Stripes — Carlos Cruz-Diez Physichromies: fine stripes whose colour pairs change by zone
function kinetic(R, v, h, c) {
  const mode = v % 3; const sw = [5, 7, 9][v % 3], pitch = sw * 2.2; const zones = 3 + (v % 3); const zw = W / 2 / zones; let s = '';
  const zoneOf = (x, y) => { if (mode === 2) return Math.min(zones + 1, Math.floor(Math.hypot(x - 300, (y - h / 2) * 1.6) / (zw * 1.1))); const z = Math.floor(Math.min(x, W - x) / zw); return mode === 1 && y > h * 0.36 && y < h * 0.64 ? z + 1 : z; };
  if (mode === 2) { s += rect(0, 0, W, h, pick(c, zones + 1 + v)); for (let z = zones + 1; z >= 0; z--) s += '<ellipse cx="300" cy="' + f(h / 2) + '" rx="' + f((z + 1) * zw * 1.1) + '" ry="' + f(((z + 1) * zw * 1.1) / 1.6) + '" fill="' + pick(c, z + v) + '"/>'; }
  else { for (let z = 0; z < zones; z++) { s += rect(z * zw, 0, zw + 0.5, h, pick(c, z + v)); s += rect(W - (z + 1) * zw, 0, zw + 0.5, h, pick(c, z + v)); } if (mode === 1) for (let z = 0; z < zones; z++) { s += rect(z * zw, h * 0.36, zw + 0.5, h * 0.28, pick(c, z + 1 + v)); s += rect(W - (z + 1) * zw, h * 0.36, zw + 0.5, h * 0.28, pick(c, z + 1 + v)); } }
  for (let i = 0, x = pitch / 2; x < W; x += pitch, i++) {
    const breaks = [0, h]; if (mode === 1) breaks.push(h * 0.36, h * 0.64); if (mode === 2) for (let z = 1; z <= zones + 2; z++) { const r = z * zw * 1.1, dx = x + sw / 2 - 300; if (Math.abs(dx) < r) { const dy = Math.sqrt(r * r - dx * dx) / 1.6; breaks.push(h / 2 - dy, h / 2 + dy); } }
    const ys = [...new Set(breaks.map((y) => clamp(y, 0, h)))].sort((a, b) => a - b);
    for (let j = 0; j < ys.length - 1; j++) { const y0 = ys[j], y1 = ys[j + 1]; if (y1 - y0 < 0.5) continue; const z = zoneOf(x + sw / 2, (y0 + y1) / 2); s += rect(x, y0, sw, y1 - y0, pick(c, z + v + 2 + (i % 2))); }
  }
  return s;
}

// 28 Housetop Quilt — Gee's Bend quilts: improvised housetop and bar blocks, nothing quite square
function quilt(R, v, h, c) {
  const cols = v % 3 === 0 ? 3 : 4, rows = v % 3 === 2 ? 3 : 2, bw = W / cols, bh = h / rows; const mirror = cols === 4 && v % 2 === 0;
  const block = (x, y, w, hh, kind, Rb) => { let out = '', last = -1; const next = () => { let ci = Math.floor(Rb() * 5); if (ci === last) ci = (ci + 1) % 5; last = ci; return c[ci]; };
    if (kind === 0) { let cx = x, cy = y, cw = w, ch = hh; for (let i = 0; i < 6 && cw > 14 && ch > 14; i++) { out += rect(cx, cy, cw + 0.5, ch + 0.5, next()); const ins = Math.min(cw, ch) * (0.07 + Rb() * 0.09), ix = ins * (0.7 + Rb() * 0.6), iy = ins * (0.7 + Rb() * 0.6); cx += ix; cy += iy; cw -= ix * (1.6 + Rb() * 0.8); ch -= iy * (1.6 + Rb() * 0.8); } }
    else if (kind === 1) { let cx = x; while (cx < x + w - 1) { const b = Math.min(x + w - cx, 10 + Rb() * 32); out += rect(cx, y, b + 0.5, hh + 0.5, next()); cx += b; } }
    else { let cy = y; while (cy < y + hh - 1) { const b = Math.min(y + hh - cy, 9 + Rb() * 26); out += rect(x, cy, w + 0.5, b + 0.5, next()); cy += b; } }
    return out; };
  let s = rect(0, 0, W, h, c[4]); const seed = Math.floor(R() * 1e9); let half = '';
  for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < (mirror ? cols / 2 : cols); gx++) { const kind = (gx + gy + v) % 3; half += block(gx * bw, gy * bh, bw, bh, kind, rng(seed + gy * 31 + gx)); }
  return s + half + (mirror ? rot180(h, half) : '');
}

/* ---------------- catalogue ---------------- */
export const PRO_FAMILIES = [
  { id: 'pro-fade', name: 'Duperré Fade', short: 'FADE', group: 'premium', renderer: fade, masking: 'wysoka', description: 'Schodkowy gradient od bramek do środka, symetryczny względem linii środkowej.', inspiration: 'Pigalle Duperré, Paryż (Ill-Studio, Pigalle, Nike, 2017)' },
  { id: 'pro-fields', name: 'Colour Field', short: 'FIELD', group: 'premium', renderer: fields, masking: 'średnia', description: 'Malarskie pola koloru dzielone rekurencyjnie, z akcentami w wybranych polach.', inspiration: 'William LaChance, Kinloch Park, St Louis (Project Backboard)' },
  { id: 'pro-suprem', name: 'Suprematist', short: 'SUPR', group: 'geometric', renderer: suprem, masking: 'wysoka', description: 'Pochylone belki, płaszczyzny i koło na dwóch osiach — sport w ruchu.', inspiration: 'Malewicz „Sportowcy” · Pigalle Duperré 2015' },
  { id: 'pro-rings', name: 'Op Rings', short: 'OP', group: 'geometric', renderer: rings, masking: 'wysoka', description: 'Pierścienie i fale optyczne budowane od środka i od bramek.', inspiration: 'Op-art (Riley, Vasarely)' },
  { id: 'pro-checker', name: 'Stretched Checker', short: 'CHECK', group: 'street', renderer: checker, masking: 'wysoka', description: 'Szachownica rozciągnięta, zwężona do linii środkowej, falująca lub wypukła.', inspiration: 'La Doce, Meksyk (All Arquitectura, 2018)' },
  { id: 'pro-iso', name: 'Iso Blocks', short: 'ISO', group: 'play', renderer: iso, masking: 'bardzo wysoka', description: 'Izometryczne bloki — złudzenie 3D czytelne z drona.', inspiration: 'Hypercourt, Aalst (Katrien Vanderlinden)' },
  { id: 'pro-textile', name: 'Textile', short: 'WEAVE', group: 'brand', renderer: textile, masking: 'bardzo wysoka', description: 'Pasy tkane jak kente: romby, zygzaki, szachownice, lustrzana symetria.', inspiration: 'Yinka Ilori · Daily Paper × adidas, Amsterdam' },
  { id: 'pro-memphis', name: 'Memphis Play', short: 'MEMPH', group: 'play', renderer: memphis, masking: 'wysoka', description: 'Rozsypane formy, zygzaki i kropki omijające koło środkowe.', inspiration: 'Memphis · Ezelsplein, Aalst' },
  { id: 'pro-kintsugi', name: 'Kintsugi', short: 'GOLD', group: 'premium', renderer: kintsugi, masking: 'średnia', description: 'Tonalne płyty „betonu” łączone złotymi żyłami.', inspiration: 'Kintsugi Court, Los Angeles (Victor Solomon, 2020)' },
  { id: 'pro-freehand', name: 'Freehand', short: 'HAND', group: 'street', renderer: freehand, masking: 'niska', description: 'Luźne, rysowane ręką echa linii boiska na głębokim kolorze.', inspiration: 'MRKA, Casa Axis International Open, Walencja (2026)' },
  { id: 'pro-sunburst', name: 'Sunburst', short: 'RAYS', group: 'geometric', renderer: sunburst, masking: 'średnia', description: 'Promienie od koła środkowego lub od obu bramek.', inspiration: 'Plakat sportowy, flagi kibicowskie' },
  { id: 'pro-halftone', name: 'Halftone', short: 'DOTS', group: 'street', renderer: halftone, masking: 'wysoka', description: 'Raster punktów, których wielkość tworzy falę, gradient lub poświatę.', inspiration: 'Druk rastrowy, pop-art' },
  { id: 'pro-topo', name: 'Topo Fill', short: 'TOPO', group: 'organic', renderer: topo, masking: 'średnia', description: 'Wypełnione warstwice jak mapa wysokości, płynne przejście barw.', inspiration: 'Mapy topograficzne' },
  { id: 'pro-camo', name: 'Camo Pro', short: 'CAMO', group: 'street', renderer: camo, masking: 'wysoka', description: 'Czterowarstwowy kamuflaż, także w wersji cyfrowej.', inspiration: 'Nike Bondy pitch, Paryż (laisné roussel, Midori Hasuike)' },
  { id: 'pro-mosaic', name: 'Mosaic', short: 'MOSAIC', group: 'play', renderer: mosaic, masking: 'bardzo wysoka', description: 'Mozaika płytek z fugą, kolor płynie po polu gry.', inspiration: 'Terrazzo, mozaika, Yinka Ilori (płytki 3D)' },
  { id: 'pro-numbers', name: 'Big Numbers', short: 'NUM', group: 'brand', renderer: numbers, masking: 'średnia', description: 'Ogromne cyfry blokowe jako supergrafika — numer klubu, kod dzielnicy, rok.', inspiration: 'Supergrafika, numery koszulek' },
  { id: 'pro-swiss', name: 'Swiss Grid', short: 'GRID', group: 'geometric', renderer: swiss, masking: 'średnia', description: 'Moduł 12 kolumn decyduje o każdym kole, pasie i odstępie — porządek czytelny z drona.', inspiration: 'Szkoła szwajcarska (Josef Müller-Brockmann, Armin Hofmann)' },
  { id: 'pro-homage', name: 'Homage Squares', short: 'ALBERS', group: 'premium', renderer: homage, masking: 'niska', description: 'Zagnieżdżone kwadraty osadzone ku dołowi; kolory zmieniają się nawzajem.', inspiration: 'Josef Albers, „Homage to the Square”, „Interaction of Color”' },
  { id: 'pro-hardedge', name: 'Hard Edge', short: 'EDGE', group: 'premium', renderer: hardEdge, masking: 'niska', description: 'Dwa, trzy płaskie kolory i jedna zdecydowana krzywa albo panele widma.', inspiration: 'Ellsworth Kelly, malarstwo hard-edge' },
  { id: 'pro-dazzle', name: 'Dazzle', short: 'DAZZ', group: 'street', renderer: dazzle, masking: 'bardzo wysoka', description: 'Wielkie fasety, każda pasiasta w innym kierunku — rozbija bryłę boiska.', inspiration: 'Kamuflaż dazzle 1917–18 (Norman Wilkinson, Edward Wadsworth)' },
  { id: 'pro-simultane', name: 'Simultané', short: 'DISC', group: 'geometric', renderer: simultane, masking: 'wysoka', description: 'Tarcze z pierścieni dzielonych na ćwiartki; kolory grają kontrastem symultanicznym.', inspiration: 'Sonia i Robert Delaunay, orfizm' },
  { id: 'pro-cutouts', name: 'Cut-Outs', short: 'CUT', group: 'organic', renderer: cutouts, masking: 'średnia', description: 'Wycinane gwiazdy, liście i algi na jednym do trzech polach koloru.', inspiration: 'Henri Matisse, wycinanki gwaszowe (1943–54)' },
  { id: 'pro-supergraphic', name: 'Supergraphic', short: 'SUPER', group: 'brand', renderer: supergraphic, masking: 'średnia', description: 'Wiązki grubych pasów, które wchodzą od bramki, skręcają i wychodzą bokiem.', inspiration: 'Supergrafika architektoniczna lat 60. (Barbara Stauffacher Solomon)' },
  { id: 'pro-truchet', name: 'Truchet Loop', short: 'LOOP', group: 'play', renderer: truchet, masking: 'wysoka', description: 'Kafle z ćwiartkami okręgu łączą się w niekończące się meandry.', inspiration: 'Kafle Truchet (1704), sztuka generatywna' },
  { id: 'pro-nihon', name: 'Nihon Disc', short: 'NIHON', group: 'brand', renderer: nihon, masking: 'średnia', description: 'Jedna wielka tarcza cięta w pasy na spokojnym tle, z rytmem kropek.', inspiration: 'Japońska szkoła plakatu (Yusaku Kamekura, Ikko Tanaka)' },
  { id: 'pro-loops', name: 'Loop Bands', short: 'WAVE', group: 'organic', renderer: loops, masking: 'wysoka', description: 'Grube, falujące pasy z konturem w kontrze — poziomo albo pętlami wokół środka.', inspiration: 'Sol LeWitt, późne „wall drawings”' },
  { id: 'pro-kinetic', name: 'Kinetic Stripes', short: 'KINET', group: 'geometric', renderer: kinetic, masking: 'bardzo wysoka', description: 'Drobne pasy, których pary kolorów zmieniają się strefami — kolor „drga” w ruchu.', inspiration: 'Carlos Cruz-Diez, „Physichromie”, kolor kinetyczny' },
  { id: 'pro-quilt', name: 'Housetop Quilt', short: 'QUILT', group: 'play', renderer: quilt, masking: 'wysoka', description: 'Improwizowane bloki „housetop” i pasy, nic idealnie równe — ciepło tkaniny.', inspiration: 'Kołdry z Gee’s Bend, Alabama' },
];

export const PRO_PALETTES = [
  { id: 'duperre', name: 'Duperré', colors: ['#1F3BD1', '#4E5BF0', '#B45CE6', '#FF6FAE', '#FF9B5E'], tone: 'gradient' },
  { id: 'malevich', name: 'Malevich', colors: ['#E0352B', '#F2C230', '#1F3A93', '#F3EEE4', '#151515'], tone: 'awangarda' },
  { id: 'lagos', name: 'Lagos', colors: ['#FF5A36', '#FFC93C', '#22B8A7', '#6D2BC2', '#FF8FB8'], tone: 'radosna' },
  { id: 'kinloch', name: 'Kinloch', colors: ['#2F6FD6', '#5FAE57', '#D9483B', '#F0C23B', '#6E5A4B'], tone: 'malarska' },
  { id: 'kintsugi', name: 'Kintsugi', colors: ['#5F5E5A', '#8C8B86', '#B2B0A9', '#D3D0C7', '#D6A532'], tone: 'szlachetna' },
  { id: 'bondy', name: 'Bondy', colors: ['#0E3B2E', '#1F6B49', '#4FA66A', '#B8E07A', '#EAF5D0'], tone: 'terenowa' },
  { id: 'riley', name: 'Riley', colors: ['#111111', '#F4F1EA', '#E8412F', '#2C49E0', '#F4F1EA'], tone: 'optyczna' },
  { id: 'casa', name: 'Casa Axis', colors: ['#7E1620', '#A51E2A', '#F4E9D8', '#F2B33D', '#1B1B1B'], tone: 'głęboka' },
  { id: 'gamefields', name: 'Gamefields', colors: ['#47132D', '#6336F5', '#D8F24A', '#F4F1EE', '#E0402B'], tone: 'marka' },
  { id: 'reindorf', name: 'Harlem Sun', colors: ['#1A2A6C', '#F7B32B', '#E4572E', '#76B041', '#FDF0D5'], tone: 'słoneczna' },
  { id: 'aalst', name: 'Aalst Memphis', colors: ['#2F5DFF', '#FFD23F', '#FF7BAC', '#1BC5A3', '#FFF7EC'], tone: 'zabawowa' },
  { id: 'nightshift', name: 'Night Shift', colors: ['#0D0B1F', '#2A1F6B', '#7B3FF2', '#00E0C6', '#F5FF6B'], tone: 'nocna' },
  { id: 'swiss', name: 'Swiss', colors: ['#E1251B', '#111111', '#F2C230', '#2F6BD8', '#F2EFE8'], tone: 'szwajcarska' },
  { id: 'albers', name: 'Albers', colors: ['#F2B134', '#E86A1F', '#C2321F', '#7A1E1E', '#F6E6B8'], tone: 'ciepła' },
  { id: 'hard-edge', name: 'Hard Edge', colors: ['#D7261E', '#1B4FA0', '#1F7A4A', '#F2C230', '#F4F1EA'], tone: 'czysta' },
  { id: 'dazzle', name: 'Dazzle', colors: ['#101114', '#2D5C9E', '#9FB3C8', '#D9D6CE', '#F4F3EF'], tone: 'kontrastowa' },
  { id: 'simultane', name: 'Simultané', colors: ['#D9822B', '#C4314B', '#2F5C8A', '#2E8C6E', '#F1E6D2'], tone: 'rytmiczna' },
  { id: 'nihon', name: 'Nihon', colors: ['#D6342C', '#1D2A44', '#E9B44C', '#2F6F8F', '#F3EBDD'], tone: 'graficzna' },
  { id: 'cruz-diez', name: 'Cruz-Diez', colors: ['#E63A2E', '#1D9E5A', '#2B5FD9', '#111111', '#F7F3EA'], tone: 'kinetyczna' },
  { id: 'gees-bend', name: 'Gee’s Bend', colors: ['#2E4A7A', '#B5462F', '#E2C08D', '#6F7D3A', '#F1E9DA'], tone: 'tekstylna' },
];

const FAM = Object.fromEntries(PRO_FAMILIES.map((x) => [x.id, x]));
export function renderPro(familyId, variant, h = 400, colors, opts = {}) {
  const fam = FAM[familyId]; if (!fam) return '';
  const v = clamp(Math.round(variant) || 1, 1, 12); const R = rng(hash(familyId + ':' + v + ':' + (opts.seed || 0)));
  return fam.renderer(R, v, h, colors, opts.uid || ('gfp' + (hash(familyId + v) % 1e6)));
}
// distinct paint colours and masking level for the execution estimate
export function proExecution(familyId, variant, h, colors) {
  const svg = renderPro(familyId, variant, h, colors); const used = new Set((svg.match(/(fill|stroke)="(#[0-9A-Fa-f]{6})"/g) || []).map((m) => m.slice(-8, -1).toUpperCase()));
  return { colors: used.size, masking: FAM[familyId]?.masking || 'średnia' };
}
// line colour with the best worst-case contrast against the colours actually used
export function recommendLineColor(colors) { const cands = ['#FFFFFF', '#111111', '#D8F24A']; let best = cands[0], bs = -1; for (const cand of cands) { const lc = lightness(cand); const worst = Math.min(...colors.map((x) => Math.abs(lightness(x) - lc))); if (worst > bs) { bs = worst; best = cand; } } return best; }
// Studio court lines for previews (15 x 10 court in a 600 x 400 box)
export function courtLines(h = 400, color = '#FFFFFF') { const cy = h / 2; return '<g fill="none" stroke="' + color + '" stroke-width="3"><rect x="15" y="15" width="570" height="' + (h - 30) + '"/><path d="M300 15V' + (h - 15) + 'M15 ' + (cy - 75) + 'h70v150H15M585 ' + (cy - 75) + 'h-70v150h70"/><circle cx="300" cy="' + cy + '" r="45"/></g>'; }
export function fullSvg(familyId, variant, colors, { h = 400, lines = true, lineColor } = {}) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + h + '" width="600" height="' + h + '">' + renderPro(familyId, variant, h, colors) + (lines ? courtLines(h, lineColor || recommendLineColor(colors)) : '') + '</svg>'; }
