// Gamefields Paint Plan (2026-11-27): a painter's plan from any flat surface design.
// Pure ESM, no dependencies. Works on a label raster (one colour index per pixel), so it runs in the browser
// (canvas) and in Node (any rasteriser). The plan page and the Studio use measureSvg() in the browser.
//
// What it gives the contractor:
//  - layers in painting order: the ground first, then the other paints from light to dark (dark covers light);
//  - for each layer: area m², coats, litres (with reserve), masking tape — only the edges against paint already
//    on the court, because each boundary is taped once, when the later of its two colours goes down;
//  - totals: litres per paint, tape metres and rolls.
// Assumptions are parameters (litres per m² per coat, reserve, tape roll); defaults are typical for acrylic
// sports-court paint on a primed base and must be confirmed against the chosen product's data sheet.

function hex2rgb(hx) { hx = hx.replace('#', ''); if (hx.length === 3) hx = hx.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(hx.slice(i, i + 2), 16)); }
export function lightnessOf(hx) { const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; const [r, g, b] = hex2rgb(hx).map(lin); const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s; }

// colours actually used in an SVG (fill / stroke hex values)
export function svgColours(svg) { return [...new Set((svg.match(/(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g) || []).map((m) => m.slice(-8, -1).toUpperCase()))]; }

// labels: Uint8Array/Array of colour indices, W x H. Returns pixel area per colour and the boundary length (px)
// between every pair of colours; the court outline is the court's edge, not a paint edge, so it is not counted.
// Length: inside each 16 x 16 tile a boundary is nearly straight, and a straight edge at any angle crosses
// h horizontal and v vertical pixel steps with length = sqrt(h² + v²); summing per tile is exact for straight
// edges and within a few per cent on curves (a plain step count over-measures diagonals by up to 41 %).
export function measureLabels(labels, W, H, n, tile = 16) {
  const area = new Array(n).fill(0); const edge = Array.from({ length: n }, () => new Array(n).fill(0));
  const tw = Math.ceil(W / tile); const acc = new Map(); // key: (tileIndex * n + a) * n + b, a < b -> [h, v]
  const add = (x, y, a, b, horiz) => { if (a > b) { const t = a; a = b; b = t; } const k = ((((y / tile) | 0) * tw + ((x / tile) | 0)) * n + a) * n + b; let e = acc.get(k); if (!e) { e = [0, 0]; acc.set(k, e); } e[horiz ? 0 : 1]++; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, a = labels[i]; area[a]++;
    if (x < W - 1) { const b = labels[i + 1]; if (a !== b) add(x, y, a, b, true); }
    if (y < H - 1) { const b = labels[i + W]; if (a !== b) add(x, y, a, b, false); } }
  for (const [k, [h, v]] of acc) { const b = k % n, a = ((k - b) / n) % n; const len = Math.hypot(h, v); edge[a][b] += len; edge[b][a] += len; }
  return { area, edge, W, H };
}

// Browser: rasterise an SVG (600 x h viewBox) at `scale` and measure it against its own colours.
export async function measureSvg(svg, h, scale = 2) {
  const colours = svgColours(svg); const W = 600 * scale, H = Math.round(h * scale);
  const doc = svg.startsWith('<svg') ? svg : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + h + '">' + svg + '</svg>';
  const sized = doc.replace('<svg ', '<svg shape-rendering="crispEdges" width="' + W + '" height="' + H + '" ');
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized); await img.decode();
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
  const px = cx.getImageData(0, 0, W, H).data; const ref = colours.map(hex2rgb); const lab = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) { let best = 0, bd = 1e9; for (let k = 0; k < ref.length; k++) { const d = (px[i * 4] - ref[k][0]) ** 2 + (px[i * 4 + 1] - ref[k][1]) ** 2 + (px[i * 4 + 2] - ref[k][2]) ** 2; if (d < bd) { bd = d; best = k; } } lab[i] = best; }
  return { colours, ...measureLabels(lab, W, H, colours.length) };
}

// m: { colours, area[], edge[][], W, H } ; court: { length, width } in metres
export function buildPlan(m, { length = 15, width = 10, litresPerM2 = 0.25, coats = 2, reserve = 0.1, tapeRoll = 50, minShare = 0.002 } = {}) {
  const N = m.W * m.H; const pxPerM = m.W / length; const courtM2 = length * width;
  const metres = (px) => px / pxPerM;
  const used = m.colours.map((c, i) => ({ i, colour: c, share: m.area[i] / N })).filter((x) => x.share >= minShare);
  const ground = used.reduce((a, b) => (b.share > a.share ? b : a), used[0]);
  const rest = used.filter((x) => x !== ground).sort((a, b) => lightnessOf(b.colour) - lightnessOf(a.colour));
  const order = [ground, ...rest]; const done = [];
  const layers = order.map((x, k) => {
    // the ground goes on the whole court first; every other paint goes on top of it
    const m2 = k === 0 ? courtM2 : x.share * courtM2;
    const under = k === 0 ? null : ground.colour;
    // light over dark needs one more coat to cover (ΔL > 0.3 in OKLab)
    const extra = under && lightnessOf(x.colour) - lightnessOf(under) > 0.3 ? 1 : 0;
    const c = coats + extra; const litres = Math.ceil(m2 * c * litresPerM2 * (1 + reserve) * 2) / 2;
    const tape = k === 0 ? 0 : Math.round(done.reduce((s, d) => s + metres(m.edge[x.i][d.i]), 0));
    done.push(x);
    return { step: k + 1, colour: x.colour, role: k === 0 ? 'tło' : 'warstwa', share: Math.round(x.share * 1000) / 10, visibleM2: Math.round(x.share * courtM2 * 10) / 10, m2: Math.round(m2 * 10) / 10, coats: c, extraCoat: !!extra, litres, tape };
  });
  const tape = layers.reduce((s, l) => s + l.tape, 0);
  return { court: { length, width, m2: courtM2 }, assumptions: { litresPerM2, coats, reserve, tapeRoll }, layers, totals: { paints: layers.length, litres: layers.reduce((s, l) => s + l.litres, 0), tape, tapeRolls: Math.ceil(tape / tapeRoll), maskingPerM2: Math.round((tape / courtM2) * 100) / 100 } };
}

// tint of the ground that marks fields still to be painted on the step drawings
export function pendingTint(ground) { const [r, g, b] = hex2rgb(ground); const t = lightnessOf(ground) > 0.7 ? [0, 0, 0] : [255, 255, 255]; const k = 0.32; return '#' + [r, g, b].map((v, i) => Math.round(v + (t[i] - v) * k).toString(16).padStart(2, '0')).join('').toUpperCase(); }
// SVG of the design after `upTo` steps: the ground covers the court, fields of later paints show as a tint of the ground
export function layerSvg(svg, plan, upTo, base = pendingTint(plan.layers[0].colour)) {
  let out = svg; const later = plan.layers.slice(upTo).map((l) => l.colour);
  for (const c of later) out = out.split('"' + c + '"').join('"' + base + '"').split('"' + c.toLowerCase() + '"').join('"' + base + '"');
  return out;
}

// metre grid for setting out: thin lines every metre, stronger every 5 m, labels on two sides
export function gridSvg(h, length, width, { color = '#111111', halo = '#FFFFFF' } = {}) {
  const sx = 600 / length, sy = h / width; let g = '';
  const line = (x1, y1, x2, y2, strong) => '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + halo + '" stroke-width="' + (strong ? 2.4 : 1.6) + '" opacity=".7"/><line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + color + '" stroke-width="' + (strong ? 1.1 : 0.6) + '"' + (strong ? '' : ' stroke-dasharray="3 3"') + '/>';
  for (let i = 0; i <= length; i++) g += line(i * sx, 0, i * sx, h, i % 5 === 0);
  for (let j = 0; j <= width; j++) g += line(0, j * sy, 600, j * sy, j % 5 === 0);
  const lab = (x, y, t, anchor) => '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="9" font-family="Inter,Arial,sans-serif" font-weight="700" text-anchor="' + anchor + '" fill="' + color + '" stroke="' + halo + '" stroke-width="2.5" paint-order="stroke">' + t + '</text>';
  for (let i = 0; i <= length; i++) g += lab(Math.min(594, Math.max(6, i * sx)), 10, i, 'middle');
  for (let j = 1; j <= width; j++) g += lab(4, Math.min(h - 3, j * sy + 3), j, 'start');
  return '<g>' + g + '</g>';
}
