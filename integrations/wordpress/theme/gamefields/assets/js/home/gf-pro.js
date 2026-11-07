(function(){// Gamefields Court Art Pro — parametric surface engine (2026-11).
// Pure ESM, no dependencies. Same contract as the Studio's PatternArt renderers:
//   renderPro(familyId, variant 1..12, h, colors[5], {uid}) -> SVG inner markup for a 600 x h court.
// Everything is flat, paintable geometry (paths, rects, circles, polygons): no filters, no SVG gradients,
// so it works as a 3D texture and as a stencil plan. Stepped colour bands replace true gradients.
// The Studio draws the court lines on top; designs are composed around the court axes (x=300, y=h/2).

/* ---------------- utilities ---------------- */
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
function mix(a, b, t) { const A = rgb2lab(hex2rgb(a)), B = rgb2lab(hex2rgb(b)); return lab2hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
function lightness(hex) { return rgb2lab(hex2rgb(hex))[0]; }
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

/* ---------------- catalogue ---------------- */
const PRO_FAMILIES = [
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
];

const PRO_PALETTES = [
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
];

const FAM = Object.fromEntries(PRO_FAMILIES.map((x) => [x.id, x]));
function renderPro(familyId, variant, h = 400, colors, opts = {}) {
  const fam = FAM[familyId]; if (!fam) return '';
  const v = clamp(Math.round(variant) || 1, 1, 12); const R = rng(hash(familyId + ':' + v + ':' + (opts.seed || 0)));
  return fam.renderer(R, v, h, colors, opts.uid || ('gfp' + (hash(familyId + v) % 1e6)));
}
// distinct paint colours and masking level for the execution estimate
function proExecution(familyId, variant, h, colors) {
  const svg = renderPro(familyId, variant, h, colors); const used = new Set((svg.match(/(fill|stroke)="(#[0-9A-Fa-f]{6})"/g) || []).map((m) => m.slice(-8, -1).toUpperCase()));
  return { colors: used.size, masking: FAM[familyId]?.masking || 'średnia' };
}
// line colour with the best worst-case contrast against the colours actually used
function recommendLineColor(colors) { const cands = ['#FFFFFF', '#111111', '#D8F24A']; let best = cands[0], bs = -1; for (const cand of cands) { const lc = lightness(cand); const worst = Math.min(...colors.map((x) => Math.abs(lightness(x) - lc))); if (worst > bs) { bs = worst; best = cand; } } return best; }
// Studio court lines for previews (15 x 10 court in a 600 x 400 box)
function courtLines(h = 400, color = '#FFFFFF') { const cy = h / 2; return '<g fill="none" stroke="' + color + '" stroke-width="3"><rect x="15" y="15" width="570" height="' + (h - 30) + '"/><path d="M300 15V' + (h - 15) + 'M15 ' + (cy - 75) + 'h70v150H15M585 ' + (cy - 75) + 'h-70v150h70"/><circle cx="300" cy="' + cy + '" r="45"/></g>'; }
function fullSvg(familyId, variant, colors, { h = 400, lines = true, lineColor } = {}) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + h + '" width="600" height="' + h + '">' + renderPro(familyId, variant, h, colors) + (lines ? courtLines(h, lineColor || recommendLineColor(colors)) : '') + '</svg>'; }

window.GFPRO={renderPro:renderPro,courtLines:courtLines,recommendLineColor:recommendLineColor,lightness:lightness,mix:mix,PRO_FAMILIES:PRO_FAMILIES.map(function(f){return {id:f.id,name:f.name,short:f.short,group:f.group,description:f.description,inspiration:f.inspiration,masking:f.masking}}),PRO_PALETTES:PRO_PALETTES,SIG:[
 {"id":"duperre-fade","name":"Duperré Fade","familyId":"pro-fade","variant":2,"paletteId":"duperre","useCase":"miasto / ikona dzielnicy","note":"Gradient od bramek do środka. Boisko, które ludzie fotografują z góry."},
 {"id":"colour-field","name":"Colour Field","familyId":"pro-fields","variant":3,"paletteId":"kinloch","useCase":"park / sztuka publiczna","note":"Malarskie pola koloru — boisko jak obraz, każde pole inne."},
 {"id":"suprematist","name":"Suprematist","familyId":"pro-suprem","variant":1,"paletteId":"malevich","useCase":"kultura / muzeum / festiwal","note":"Awangarda w ruchu: belki, płaszczyzny i koło na osiach gry."},
 {"id":"op-rings","name":"Op Rings","familyId":"pro-rings","variant":1,"paletteId":"riley","useCase":"street / content","note":"Optyczne pierścienie od bramek spotykają się na linii środkowej."},
 {"id":"la-doce","name":"La Doce","familyId":"pro-checker","variant":1,"paletteId":"reindorf","useCase":"klub / kibice","note":"Rozciągnięta szachownica — klasyk stadionowy w dynamicznej perspektywie."},
 {"id":"hypercube","name":"Hypercube","familyId":"pro-iso","variant":2,"paletteId":"aalst","useCase":"szkoła / młodzież","note":"Izometryczne bloki dające złudzenie 3D z drona."},
 {"id":"weave","name":"Weave","familyId":"pro-textile","variant":1,"paletteId":"lagos","useCase":"społeczność / wielokulturowość","note":"Pasy tkane jak kente — wzór z historią i rytmem."},
 {"id":"memphis-play","name":"Memphis Play","familyId":"pro-memphis","variant":3,"paletteId":"aalst","useCase":"dzieci / place zabaw","note":"Formy i zygzaki między liniami — miejsce na własne gry."},
 {"id":"kintsugi","name":"Kintsugi","familyId":"pro-kintsugi","variant":8,"paletteId":"kintsugi","useCase":"premium / hotel / rewitalizacja","note":"Szlachetny beton łączony złotem — naprawa jako ozdoba."},
 {"id":"freehand","name":"Freehand","familyId":"pro-freehand","variant":5,"paletteId":"casa","useCase":"marka / event / moda","note":"Ręcznie rysowane echa linii na głębokiej czerwieni."},
 {"id":"sunrise","name":"Sunrise","familyId":"pro-sunburst","variant":5,"paletteId":"malevich","useCase":"turniej / aktywacja","note":"Promienie wschodzące od bramki — energia startu."},
 {"id":"halftone-wave","name":"Halftone Wave","familyId":"pro-halftone","variant":2,"paletteId":"riley","useCase":"street / brand","note":"Raster punktów tworzący falę ruchu."},
 {"id":"topo-glow","name":"Topo Glow","familyId":"pro-topo","variant":1,"paletteId":"nightshift","useCase":"nocne boisko / oświetlenie","note":"Warstwice świecące jak mapa ciepła gry."},
 {"id":"bondy-camo","name":"Bondy Camo","familyId":"pro-camo","variant":3,"paletteId":"bondy","useCase":"street / youth","note":"Czterowarstwowy kamuflaż w kolorze miasta."},
 {"id":"mosaic","name":"Mosaic","familyId":"pro-mosaic","variant":1,"paletteId":"lagos","useCase":"plac / rynek","note":"Mozaika płytek z fugą, kolor płynie od środka."},
 {"id":"big-number","name":"Big Number","familyId":"pro-numbers","variant":4,"paletteId":"gamefields","useCase":"klub / sponsor","note":"Numer jako supergrafika — klub, rok założenia, kod dzielnicy."}
]};})();
