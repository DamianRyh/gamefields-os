/* "Jeden plac. Każda gra." (28.11.2026, v2): sport surfaces painted in Gamefields patterns.
   Data in #gsp-data: sizes and colours from the Studio's sport-surfaces/catalog.json, prices from the offer files,
   curated patterns from the Studio's pattern library. The pattern engine is window.GFW (the Studio's
   court-art-pro.mjs, shared with the "wzory" block); without it the section shows plain colours.
   Lines follow the Studio's SportSurfaceLines (components/sport-surface-art.tsx), in metres.
   Gamefields builds the surface only: base, finish or painted pattern, lines; no equipment. */
(function () {
  'use strict';
  var root = document.getElementById('sporty');
  if (!root) return;
  var G = window.GFW || null;
  var D = JSON.parse(document.getElementById('gsp-data').textContent);
  var S = {};
  D.sports.forEach(function (s) { S[s.id] = s; });
  var PAL = {};
  if (G) G.PRO_PALETTES.forEach(function (p) { PAL[p.id] = p; });
  var $ = function (q) { return root.querySelector(q); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = { id: D.sports[0].id, pat: G ? 0 : -1, pal: G ? D.patterns[0].paletteId : '', v: D.patterns[0].variant, plot: null };
  var uid = 0;

  function zl(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł'; }
  function m(n) { return (Math.round(n * 100) / 100).toString().replace('.', ','); }
  function up100(x) { return Math.ceil(Math.round(x * 100) / 10000) * 100; }
  function prices(s) {
    var a = Math.round(s.length * s.width * 1.1 * 10) / 10;
    var base = up100(a * D.baseRate);
    return { area: a, plain: base + up100(a * s.finishFrom), pattern: s.paintable ? base + up100(a * D.patternRate) : null };
  }

  /* court lines in metres from the field's corner (same geometry as the Studio) */
  function lines(s) {
    var L = s.fieldLength, W = s.fieldWidth, o = [];
    function ln(a, b, c, d) { o.push('M' + a + ' ' + b + 'L' + c + ' ' + d); }
    function circ(cx, cy, r) { o.push('M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0'); }
    function rect(x, y, w, h) { o.push('M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + -w + 'Z'); }
    function mirror(fn) { fn(function (x) { return x; }, function (y) { return y; }); fn(function (x) { return L - x; }, function (y) { return W - y; }); }
    rect(0.04, 0.04, L - 0.08, W - 0.08);
    if (s.id === 'teqball') { ln(L / 2, 0, L / 2, W); ln(L / 2 - 3.5, 0, L / 2 - 3.5, W); ln(L / 2 + 3.5, 0, L / 2 + 3.5, W); }
    if (s.id === 'tennis') { ln(L / 2, 0, L / 2, W); ln(0, 1.37, L, 1.37); ln(0, W - 1.37, L, W - 1.37); ln(L / 2 - 6.4, 1.37, L / 2 - 6.4, W - 1.37); ln(L / 2 + 6.4, 1.37, L / 2 + 6.4, W - 1.37); ln(L / 2 - 6.4, W / 2, L / 2 + 6.4, W / 2); }
    if (s.id === 'padel') { ln(10, 0, 10, W); ln(3.05, 0, 3.05, W); ln(16.95, 0, 16.95, W); ln(3.05, 5, 16.95, 5); }
    if (s.id === 'volleyball') { ln(9, 0, 9, W); ln(6, 0, 6, W); ln(12, 0, 12, W); }
    if (s.id === 'pickleball') { var k = 2.1336; ln(L / 2, 0, L / 2, W); ln(L / 2 - k, 0, L / 2 - k, W); ln(L / 2 + k, 0, L / 2 + k, W); ln(0, W / 2, L / 2 - k, W / 2); ln(L / 2 + k, W / 2, L, W / 2); }
    if (s.id === 'basketball-full') {
      ln(L / 2, 0, L / 2, W); circ(L / 2, W / 2, 1.8);
      mirror(function (X, Y) {
        o.push('M' + X(0) + ' ' + Y(W / 2 - 2.45) + 'L' + X(5.8) + ' ' + Y(W / 2 - 2.45) + 'L' + X(5.8) + ' ' + Y(W / 2 + 2.45) + 'L' + X(0) + ' ' + Y(W / 2 + 2.45));
        o.push('M' + X(5.8) + ' ' + Y(W / 2 - 1.8) + 'A1.8 1.8 0 0 1 ' + X(5.8) + ' ' + Y(W / 2 + 1.8));
        o.push('M' + X(0) + ' ' + Y(0.9) + 'L' + X(2.99) + ' ' + Y(0.9) + 'A6.75 6.75 0 0 1 ' + X(2.99) + ' ' + Y(W - 0.9) + 'L' + X(0) + ' ' + Y(W - 0.9));
        circ(X(1.575), W / 2, 0.225);
      });
    }
    if (s.id === 'basketball-3x3') {
      rect(L / 2 - 2.45, 0, 4.9, 5.8);
      o.push('M' + (L / 2 - 1.8) + ' 5.8A1.8 1.8 0 0 0 ' + (L / 2 + 1.8) + ' 5.8');
      o.push('M0.9 0V2.99A6.75 6.75 0 0 0 ' + (L - 0.9) + ' 2.99V0');
      circ(L / 2, 1.575, 0.225);
    }
    if (s.id === 'street-football-3x3' || s.id === 'futsal') {
      ln(L / 2, 0, L / 2, W); circ(L / 2, W / 2, s.id === 'futsal' ? 3 : 1.5);
      mirror(function (X, Y) {
        if (s.id === 'futsal') o.push('M' + X(0) + ' ' + Y(W / 2 - 7.5) + 'A6 6 0 0 1 ' + X(6) + ' ' + Y(W / 2 - 1.5) + 'L' + X(6) + ' ' + Y(W / 2 + 1.5) + 'A6 6 0 0 1 ' + X(0) + ' ' + Y(W / 2 + 7.5));
        else o.push('M' + X(0) + ' ' + Y(W / 2 - 2) + 'L' + X(2.5) + ' ' + Y(W / 2 - 2) + 'L' + X(2.5) + ' ' + Y(W / 2 + 2) + 'L' + X(0) + ' ' + Y(W / 2 + 2));
      });
    }
    return o.join('');
  }
  function fieldPos(s) { return { x: (s.length - s.fieldLength) / 2, y: typeof s.fieldOffsetY === 'number' ? s.fieldOffsetY : (s.width - s.fieldWidth) / 2 }; }
  function sorted(cs) { return cs.slice().sort(function (a, b) { return G.lightness(a) - G.lightness(b); }); }

  /* the slab: run-off zone, painted field, lines; everything in metres */
  function slabSvg(s, painted, anim) {
    var f = fieldPos(s), cs = painted ? PAL[st.pal].colors : null;
    var zone = painted ? sorted(cs)[0] : s.zone;
    var lc = painted ? G.recommendLineColor(cs) : '#FFFFFF';
    var field;
    if (painted) {
      uid += 1;
      var h = Math.round(600 * s.fieldWidth / s.fieldLength);
      field = '<svg x="' + f.x + '" y="' + f.y + '" width="' + s.fieldLength + '" height="' + s.fieldWidth + '" viewBox="0 0 600 ' + h + '" preserveAspectRatio="none">' +
        G.renderPro(D.patterns[st.pat].familyId, st.v, h, cs, { uid: 'gsp' + uid }) + '</svg>';
    } else field = '<rect x="' + f.x + '" y="' + f.y + '" width="' + s.fieldLength + '" height="' + s.fieldWidth + '" fill="' + s.base + '"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s.length + ' ' + s.width + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect width="' + s.length + '" height="' + s.width + '" fill="' + zone + '"/>' + field +
      '<path d="' + lines(s) + '" transform="translate(' + f.x + ' ' + f.y + ')" fill="none" stroke="' + lc + '" stroke-width="' + Math.max(0.08, s.length / 260) + '" stroke-linejoin="round" pathLength="1"' + (anim ? ' class="gsp-draw"' : '') + '/></svg>';
  }

  /* sport tabs with a small line drawing */
  var tabs = $('[data-gsp-tabs]');
  D.sports.forEach(function (s) {
    var b = document.createElement('button');
    b.type = 'button'; b.dataset.id = s.id; b.setAttribute('role', 'tab');
    var f = fieldPos(s);
    b.innerHTML = '<svg viewBox="-0.5 -0.5 ' + (s.length + 1) + ' ' + (s.width + 1) + '" aria-hidden="true"><rect width="' + s.length + '" height="' + s.width + '" rx="' + s.length / 40 + '" class="z"/><path d="' + lines(s) + '" transform="translate(' + f.x + ' ' + f.y + ')" fill="none" stroke-width="' + s.length / 34 + '"/></svg><span>' + s.name + '</span>';
    b.addEventListener('click', function () { st.id = s.id; paint(true); });
    tabs.appendChild(b);
  });

  /* patterns and palettes */
  var patBox = $('[data-gsp-pats]'), palBox = $('[data-gsp-pals]');
  if (G) {
    var none = document.createElement('button');
    none.type = 'button'; none.className = 'plain'; none.title = 'Jednolity kolor'; none.innerHTML = '<span>Kolor</span>';
    none.addEventListener('click', function () { st.pat = -1; paint(false); });
    patBox.appendChild(none);
    D.patterns.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.title = p.name;
      uid += 1;
      b.innerHTML = '<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + G.renderPro(p.familyId, p.variant, 400, PAL[p.paletteId].colors, { uid: 'gspt' + uid }) + '</svg>';
      b.setAttribute('aria-label', 'Wzór ' + p.name);
      b.addEventListener('click', function () { st.pat = i; st.v = p.variant; st.pal = p.paletteId; paint(false); });
      patBox.appendChild(b);
    });
    D.palettes.forEach(function (id) {
      var p = PAL[id]; if (!p) return;
      var b = document.createElement('button');
      b.type = 'button'; b.title = p.name; b.dataset.id = id; b.setAttribute('aria-label', 'Kolory ' + p.name);
      b.innerHTML = '<i>' + p.colors.map(function (c) { return '<b style="background:' + c + '"></b>'; }).join('') + '</i>';
      b.addEventListener('click', function () { if (st.pat < 0) st.pat = 0; st.pal = id; paint(false); });
      palBox.appendChild(b);
    });
    $('[data-gsp-shuffle]').addEventListener('click', function () {
      st.pat = Math.floor(Math.random() * D.patterns.length);
      st.v = 1 + Math.floor(Math.random() * 12);
      st.pal = D.palettes[Math.floor(Math.random() * D.palettes.length)];
      paint(false);
    });
  } else root.classList.add('gsp-noeng');

  function fits(s) { if (!st.plot) return null; var a = st.plot.L, b = st.plot.W; return (s.length <= a + 1e-6 ? s.width <= b + 1e-6 : false) || (s.length <= b + 1e-6 ? s.width <= a + 1e-6 : false); }

  /* the slab keeps the sport's proportions and fills the stage */
  var stage = $('[data-gsp-stage]'), slab = $('[data-gsp-slab]');
  function fitSlab() {
    var s = S[st.id], r = $('[data-gsp-floor]').getBoundingClientRect();
    var maxW = r.width * 0.86, maxH = (r.height > 120 ? r.height : r.width * 0.7) * 0.8;
    var w = Math.min(maxW, maxH * s.length / s.width);
    slab.style.width = Math.round(w) + 'px';
    slab.style.height = Math.round(w * s.width / s.length) + 'px';
  }
  window.addEventListener('resize', fitSlab);

  function paint(anim) {
    var s = S[st.id];
    var painted = G ? (st.pat > -1 ? s.paintable : false) : false;
    slab.innerHTML = slabSvg(s, painted, anim ? !reduced : false);
    fitSlab();
    root.style.setProperty('--gsp-tone', painted ? sorted(PAL[st.pal].colors)[0] : s.base);
    [].forEach.call(tabs.children, function (b) {
      b.setAttribute('aria-selected', String(b.dataset.id === st.id));
      var f = fits(S[b.dataset.id]);
      b.classList.toggle('no', f === false); b.classList.toggle('ok', f === true);
    });
    [].forEach.call(patBox.children, function (b, i) { b.setAttribute('aria-pressed', String(i - 1 === st.pat)); });
    [].forEach.call(palBox.children, function (b) { b.setAttribute('aria-pressed', String(st.pat > -1 ? b.dataset.id === st.pal : false)); });
    root.classList.toggle('gsp-turf', !s.paintable);
    var p = prices(s);
    $('[data-gsp-name]').textContent = s.name;
    $('[data-gsp-dims]').textContent = 'pole ' + m(s.fieldLength) + ' × ' + m(s.fieldWidth) + ' m · nawierzchnia ' + m(s.length) + ' × ' + m(s.width) + ' m · ' + m(p.area) + ' m² do wyceny';
    $('[data-gsp-plain]').textContent = zl(p.plain);
    $('[data-gsp-plainlabel]').textContent = s.paintable ? 'Jednolity kolor (' + s.materialShort + ')' : 'Nawierzchnia (' + s.materialShort + ')';
    $('[data-gsp-pattern]').textContent = p.pattern ? zl(p.pattern) : 'bez malowanego wzoru';
    $('[data-gsp-rowpat]').classList.toggle('on', painted);
    $('[data-gsp-rowplain]').classList.toggle('on', !painted);
    $('[data-gsp-tag]').textContent = painted ? D.patterns[st.pat].name + ' · ' + PAL[st.pal].name + ' · kompozycja ' + st.v : (s.paintable ? 'Jednolity kolor' : 'Sztuczna trawa: kolor trawy, bez malowanego wzoru');
    var q = 'surface=' + s.id + (painted ? '&pattern=' + D.patterns[st.pat].familyId + '&variant=' + st.v + '&palette=' + st.pal : '');
    $('[data-gsp-studio]').href = '/studio/?' + q;
    var fit = fits(s), fe = $('[data-gsp-fit]');
    fe.hidden = fit === null;
    if (fit !== null) { fe.className = 'gsp-fit ' + (fit ? 'ok' : 'no'); fe.textContent = fit ? 'Mieści się na placu ' + m(st.plot.L) + ' × ' + m(st.plot.W) + ' m' : 'Potrzeba ' + m(s.length) + ' × ' + m(s.width) + ' m'; }
  }

  function readPlot() {
    var a = parseFloat(String($('[data-gsp-l]').value).replace(',', '.')), b = parseFloat(String($('[data-gsp-w]').value).replace(',', '.'));
    st.plot = a > 0 ? (b > 0 ? { L: Math.max(a, b), W: Math.min(a, b) } : null) : null;
    $('[data-gsp-count]').textContent = st.plot ? D.sports.filter(fits).length + ' z ' + D.sports.length + ' gier się zmieści' : '';
    paint(false);
  }
  $('[data-gsp-l]').addEventListener('input', readPlot);
  $('[data-gsp-w]').addEventListener('input', readPlot);

  root.classList.add('gsp-ready');
  paint(true);
})();
