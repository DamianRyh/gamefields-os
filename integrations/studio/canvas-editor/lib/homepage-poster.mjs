// Pure poster renderer extracted from the existing Gamefields homepage; original layouts retained.
import * as G from './court-art-pro.mjs';
const FAM=Object.fromEntries(G.PRO_FAMILIES.map(f=>[f.id,f]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const x=esc;
    var FORMATS = [
      { name: '30 × 40', size: '30 × 40 cm', ratio: 40 / 30, wall: '30%' },
      { name: '50 × 70', size: '50 × 70 cm', ratio: 1.4, wall: '44%' },
      { name: '70 × 100', size: '70 × 100 cm', ratio: 100 / 70, wall: '58%' }
    ];
    var FRAMES = [['none', 'Bez ramy', ''], ['black', 'Czarna', '#161013'], ['oak', 'Dąb', '#B98A5B'], ['white', 'Biała', '#F7F5F2'], ['alu', 'Aluminium', '#A8A8A4']];
    var PAPERS = [['#FFFFFF', 'Biały'], ['#F4F1EE', 'Kremowy'], ['#161013', 'Czarny'], ['#47132D', 'Śliwka']];
    var WALLS = [['#EFEAE4', 'Ciepła biel'], ['#C9C4BE', 'Beton'], ['#B7C1A9', 'Szałwia'], ['#2B2226', 'Grafit']];
    var LAYOUTS = [['gallery', 'Galeria'], ['bleed', 'Pełny spad'], ['type', 'Wielki tytuł'], ['match', 'Matchday'], ['side', 'Pion']];
    var LINES = [['auto', 'Auto'], ['#FFFFFF', 'Białe'], ['#111111', 'Czarne'], ['#D8F24A', 'Limonka'], ['none', 'Bez linii']];
    function T(xx, y, str, size, weight, fill, anchor, extra) {
      return '<text x="' + xx + '" y="' + y + '" font-family="GHInter,Inter,Arial,sans-serif" font-size="' + size + '" font-weight="' + weight + '" fill="' + fill + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + (extra || '') + '>' + x(str) + '</text>';
    }
    function fit(str, maxW, maxSize, k) { var n = Math.max(1, String(str).length); return Math.max(10, Math.min(maxSize, maxW / (n * (k || 0.56)))); }
    function boxFor(layout, W, H, lines, bigSize) {
      if (layout === 'bleed') return { x: 0, y: 0, w: W, h: H };
      if (layout === 'match') return { x: 0, y: 0, w: W, h: Math.round(H * 0.64) };
      if (layout === 'side') return { x: Math.round(W * 0.34), y: 0, w: W - Math.round(W * 0.34), h: H };
      if (layout === 'type') { var top = 34 + lines * bigSize * 0.86 + 14; return { x: 34, y: Math.round(top), w: W - 68, h: Math.round(H - top - 64) }; }
      return { x: 36, y: 36, w: W - 72, h: H - 36 - 118 };
    }
    function artSvg(b, s, uid) {
      var hh = 600 * b.w / b.h, sc = b.h / 600;
      var minL = Math.min.apply(null, s.colors.map(function (c) { return 1 - G.lightness(c); }));
      var lc = s.line === 'auto' ? (minL > 0.14 ? '#FFFFFF' : G.recommendLineColor(s.colors)) : s.line;
      var inner = G.renderPro(s.fam, s.v, hh, s.colors, { seed: s.seed, uid: uid + 'a' }) + (s.line === 'none' ? '' : G.courtLines(hh, lc));
      return '<defs><clipPath id="' + uid + 'c"><rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '"/></clipPath></defs>' +
        '<g clip-path="url(#' + uid + 'c)"><g transform="translate(' + (b.x + b.w / 2) + ' ' + (b.y + b.h / 2) + ') rotate(90) scale(' + sc + ') translate(-300 ' + (-hh / 2) + ')">' + inner + '</g></g>';
    }
    function words(str, maxChars) {
      var out = [], cur = '';
      String(str).split(/\s+/).forEach(function (w) { if (!w) return; if ((cur + ' ' + w).trim().length > maxChars) { if (cur) out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
      if (cur) out.push(cur);
      return out.length ? out.slice(0, 3) : [' '];
    }
    function posterSvg(s, uid, opts) {
      var F = FORMATS[s.fmt], W = 500, H = Math.round(500 * F.ratio);
      var paper = PAPERS[s.paper][0], dark = G.lightness(paper) < 0.5;
      var ink = dark ? '#F4F1EE' : '#1C0912', soft = dark ? 'rgba(244,241,238,.6)' : 'rgba(28,9,18,.55)';
      var no = 'No. ' + (opts.no || '0000'), dims = '15 × 10 M', fam = FAM[s.fam].name.toUpperCase();
      var lines = words(s.title || ' ', 9), big = Math.min(118, fit(lines.reduce(function (a, b) { return b.length > a.length ? b : a; }, ''), W - 64, 118, 0.74));
      var b = boxFor(s.layout, W, H, lines.length, big);
      var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + paper + '"/>' + artSvg(b, s, uid);
      var ls = ' letter-spacing="1.4"', tight = ' letter-spacing="-1.2"';
      if (s.layout === 'gallery') {
        var ts = fit(s.title, 300, 40);
        o += T(36, H - 66, s.title, ts, 800, ink, '', tight);
        o += T(W - 36, H - 78, (s.sub || '').toUpperCase(), 9.5, 600, ink, 'end', ls) + T(W - 36, H - 63, (s.note || '').toUpperCase(), 9.5, 600, soft, 'end', ls);
        o += '<rect x="36" y="' + (H - 46) + '" width="' + (W - 72) + '" height="1" fill="' + soft + '"/>';
        o += T(36, H - 28, 'GAMEFIELDS · ' + fam, 8.5, 600, soft, '', ls) + T(W - 36, H - 28, dims + ' · ' + no, 8.5, 600, soft, 'end', ls);
      } else if (s.layout === 'bleed') {
        var ts2 = fit(s.title, 300, 34), lw = Math.max(210, Math.min(W - 48, String(s.title).length * ts2 * 0.58 + 36));
        o += '<rect x="24" y="' + (H - 24 - 92) + '" width="' + lw + '" height="92" fill="' + paper + '"/>';
        o += T(42, H - 24 - 52, s.title, ts2, 800, ink, '', tight);
        o += T(42, H - 24 - 30, (s.sub || '').toUpperCase(), 8.5, 600, ink, '', ls) + T(42, H - 24 - 16, ((s.note ? s.note + ' · ' : '') + no).toUpperCase(), 8.5, 600, soft, '', ls);
      } else if (s.layout === 'type') {
        lines.forEach(function (ln, i) { o += T(30, 34 + big * 0.8 + i * big * 0.86, ln.toUpperCase(), big, 800, ink, '', ' letter-spacing="' + (-big * 0.05) + '"'); });
        o += T(34, H - 30, (s.sub || '').toUpperCase(), 9.5, 600, ink, '', ls) + T(W - 34, H - 30, (s.note || '').toUpperCase(), 9.5, 600, soft, 'end', ls);
        o += T(W - 34, H - 16, 'GAMEFIELDS · ' + no, 8, 600, soft, 'end', ls);
      } else if (s.layout === 'match') {
        var y0 = b.h, ts3 = fit(s.title, W - 72, 60, 0.58);
        o += T(36, y0 + 30 + ts3 * 0.78, s.title, ts3, 800, ink, '', tight);
        var gy = H - 96; o += '<rect x="36" y="' + gy + '" width="' + (W - 72) + '" height="1" fill="' + soft + '"/>';
        var cells = [['MIEJSCE', s.sub || '–'], ['WYDARZENIE', s.note || '–'], ['BOISKO', dims], ['EDYCJA', no]], cw = (W - 72) / 2;
        cells.forEach(function (c, i) { var cx = 36 + (i % 2) * cw, cy = gy + 20 + Math.floor(i / 2) * 34; var val = String(c[1]).toUpperCase(); o += T(cx, cy, c[0], 7.5, 600, soft, '', ls); o += T(cx, cy + 15, val, fit(val, cw - 14, 11, 0.7), 700, ink, '', ' letter-spacing="0.4"'); });
        o += T(W - 36, H - 16, 'GAMEFIELDS · ' + fam, 7.5, 600, soft, 'end', ls);
      } else if (s.layout === 'side') {
        var colW = b.x, vt = fit(s.title, H - 150, colW * 0.62, 0.58);
        o += '<g transform="translate(' + (colW * 0.5 + vt * 0.34) + ' ' + (H - 120) + ') rotate(-90)">' + T(0, 0, s.title, vt, 800, ink, '', tight) + '</g>';
        o += T(22, 36, no, 9, 700, ink, '', ls);
        o += T(22, H - 74, (s.sub || '').toUpperCase().slice(0, 26), 7.5, 600, ink, '', ls) + T(22, H - 60, (s.note || '').toUpperCase().slice(0, 26), 7.5, 600, soft, '', ls);
        o += '<rect x="22" y="' + (H - 48) + '" width="' + (colW - 44) + '" height="1" fill="' + soft + '"/>' + T(22, H - 30, 'GAMEFIELDS', 7.5, 700, soft, '', ls) + T(22, H - 18, dims, 7.5, 600, soft, '', ls);
      }
      return o + '</svg>';
    }


export function renderHomepagePoster(design){return posterSvg(design,"studio-print",{no:"STUDIO"})}
