/* "Jeden plac. Każda gra." (28.11.2026): sport surfaces on the homepage. Data in #gsp-data comes from the Studio's
   sport-surfaces/catalog.json (field and surface sizes, colours) and the offer files (prices). Lines follow the
   Studio's SportSurfaceLines (components/sport-surface-art.tsx), in metres. Gamefields builds the surface only:
   base, finish and lines; equipment is not part of the offer. */
(function () {
  'use strict';
  var root = document.getElementById('sporty');
  if (!root) return;
  var D = JSON.parse(document.getElementById('gsp-data').textContent);
  var S = {};
  D.sports.forEach(function (s) { S[s.id] = s; });
  var $ = function (q) { return root.querySelector(q); };
  var NS = 'http://www.w3.org/2000/svg';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = { id: D.sports[0].id, multi: false, picked: [D.sports[0].id], plot: null };
  var INK = ['#FFFFFF', '#D8F24A', '#FF8A5B'];

  function zl(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł'; }
  function m(n) { return (Math.round(n * 100) / 100).toString().replace('.', ','); }
  function up100(x) { return Math.ceil(Math.round(x * 100) / 10000) * 100; }
  function price(s) {
    var a = Math.round(s.length * s.width * 1.1 * 10) / 10;
    return { area: a, base: up100(a * D.baseRate), finish: up100(a * s.finishFrom), total: up100(a * D.baseRate) + up100(a * s.finishFrom) };
  }

  /* court lines in metres, origin at the field's corner (same geometry as the Studio) */
  function lines(s) {
    var L = s.fieldLength, W = s.fieldWidth, o = [];
    function ln(a, b, c, d) { o.push('M' + a + ' ' + b + 'L' + c + ' ' + d); }
    function circ(cx, cy, r) { o.push('M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0'); }
    function rect(x, y, w, h) { o.push('M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + -w + 'Z'); }
    function mirror(fn) { fn(function (x) { return x; }, function (y) { return y; }); fn(function (x) { return L - x; }, function (y) { return W - y; }); }
    rect(0.025, 0.025, L - 0.05, W - 0.05);
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
  function fieldOffset(s) { return { x: (s.length - s.fieldLength) / 2, y: typeof s.fieldOffsetY === 'number' ? s.fieldOffsetY : (s.width - s.fieldWidth) / 2 }; }

  /* stage: one SVG in metres, fixed scale = the largest surface, so sizes compare honestly */
  var svg = $('[data-gsp-svg]');
  var MAXL = 0, MAXW = 0;
  D.sports.forEach(function (s) { MAXL = Math.max(MAXL, s.length); MAXW = Math.max(MAXW, s.width); });
  var PAD = 2.5;
  svg.setAttribute('viewBox', [-PAD, -PAD, MAXL + 2 * PAD, MAXW + 2 * PAD].join(' '));
  function el(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  var gPlot = el('g', {}), gSlab = el('g', {}), gLines = el('g', {}), gMan = el('g', {});
  svg.appendChild(gPlot); svg.appendChild(gSlab); svg.appendChild(gLines); svg.appendChild(gMan);

  function slabFor(ids) {
    var L = 0, W = 0;
    ids.forEach(function (id) { L = Math.max(L, S[id].length); W = Math.max(W, S[id].width); });
    return { L: L, W: W };
  }
  function draw() {
    var ids = st.multi ? st.picked : [st.id];
    var slab = slabFor(ids), main = S[ids[0]];
    var ox = (MAXL - slab.L) / 2, oy = (MAXW - slab.W) / 2;
    gSlab.innerHTML = ''; gLines.innerHTML = ''; gMan.innerHTML = ''; gPlot.innerHTML = '';
    gSlab.appendChild(el('rect', { x: ox, y: oy + 0.35, width: slab.L, height: slab.W, fill: 'rgba(0,0,0,.35)', rx: 0.2 }));
    gSlab.appendChild(el('rect', { x: ox, y: oy, width: slab.L, height: slab.W, fill: main.zone, rx: 0.15, class: 'gsp-slab' }));
    ids.forEach(function (id, i) {
      var s = S[id], f = fieldOffset(s);
      var fx = ox + (slab.L - s.length) / 2 + f.x, fy = oy + (slab.W - s.width) / 2 + f.y;
      if (i === 0) gSlab.appendChild(el('rect', { x: fx, y: fy, width: s.fieldLength, height: s.fieldWidth, fill: s.base }));
      var p = el('path', { d: lines(s), transform: 'translate(' + fx + ' ' + fy + ')', fill: 'none', stroke: st.multi ? INK[i] : '#FFFFFF', 'stroke-width': 0.09, 'stroke-linejoin': 'round', 'vector-effect': 'none', pathLength: 1, class: reduced ? '' : 'gsp-draw' });
      gLines.appendChild(p);
    });
    /* a 1.8 m person for scale, next to the slab */
    var mx = ox + slab.L + 0.8, my = oy + slab.W - 1.8;
    if (mx + 0.6 > MAXL + PAD) mx = ox - 1.4;
    gMan.appendChild(el('circle', { cx: mx + 0.3, cy: my + 0.22, r: 0.22, fill: '#F4F1EE' }));
    gMan.appendChild(el('rect', { x: mx + 0.08, y: my + 0.5, width: 0.44, height: 1.3, rx: 0.18, fill: '#F4F1EE' }));
    /* the visitor's plot, dashed, centred on the slab */
    if (st.plot) {
      var pl = st.plot;
      gPlot.appendChild(el('rect', { x: (MAXL - pl.L) / 2, y: (MAXW - pl.W) / 2, width: pl.L, height: pl.W, fill: 'rgba(216,242,74,.08)', stroke: '#D8F24A', 'stroke-width': 0.12, 'stroke-dasharray': '0.5 0.35' }));
    }
    info(ids, slab);
  }

  function fits(s) { if (!st.plot) return null; var a = st.plot.L, b = st.plot.W; return (s.length <= a + 1e-6 ? s.width <= b + 1e-6 : false) || (s.length <= b + 1e-6 ? s.width <= a + 1e-6 : false); }

  var chips = $('[data-gsp-chips]');
  D.sports.forEach(function (s) {
    var b = document.createElement('button');
    b.type = 'button'; b.dataset.id = s.id;
    b.innerHTML = '<b>' + s.name + '</b><small>' + m(s.length) + ' × ' + m(s.width) + ' m</small>';
    b.addEventListener('click', function () {
      if (st.multi) {
        var i = st.picked.indexOf(s.id);
        if (i > -1) { if (st.picked.length > 1) st.picked.splice(i, 1); }
        else { st.picked.push(s.id); if (st.picked.length > 3) st.picked.shift(); }
        st.id = st.picked[0];
      } else { st.id = s.id; st.picked = [s.id]; }
      paintChips(); draw();
    });
    chips.appendChild(b);
  });
  function paintChips() {
    [].forEach.call(chips.children, function (b) {
      var on = st.picked.indexOf(b.dataset.id) > -1, f = fits(S[b.dataset.id]);
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('no', f === false);
      b.classList.toggle('ok', f === true);
      var i = st.picked.indexOf(b.dataset.id);
      b.style.setProperty('--ink', st.multi ? (i > -1 ? INK[i] : 'transparent') : 'transparent');
    });
  }

  function info(ids, slab) {
    var s = S[ids[0]];
    var size = st.multi ? { length: slab.L, width: slab.W, finishFrom: Math.max.apply(null, ids.map(function (id) { return S[id].finishFrom; })) } : s;
    var p = price(size);
    $('[data-gsp-name]').textContent = st.multi ? ids.map(function (id) { return S[id].name; }).join(' + ') : s.name;
    $('[data-gsp-field]').textContent = st.multi ? 'jedna płyta, linie ' + ids.length + ' gier w różnych kolorach' : 'pole ' + m(s.fieldLength) + ' × ' + m(s.fieldWidth) + ' m';
    $('[data-gsp-surface]').textContent = m(size.length) + ' × ' + m(size.width) + ' m';
    $('[data-gsp-area]').textContent = m(p.area) + ' m²';
    $('[data-gsp-mat]').textContent = st.multi ? 'akryl sportowy' : s.materialLabel;
    $('[data-gsp-price]').textContent = 'od ' + zl(p.total) + ' netto';
    $('[data-gsp-split]').textContent = 'płyta ' + zl(p.base) + ' + ' + (st.multi ? 'nawierzchnia' : s.materialShort) + ' ' + zl(p.finish);
    $('[data-gsp-note]').textContent = st.multi ? 'Wspólna płyta o wymiarach największej gry. Kolory linii ustalimy tak, żeby każda gra była czytelna.' : s.note;
    $('[data-gsp-studio]').href = '/studio/?surface=' + s.id;
    $('[data-gsp-studio]').textContent = 'Zaprojektuj: ' + s.name + ' ↗';
    var f = fits(size);
    var fitEl = $('[data-gsp-fit]');
    fitEl.hidden = f === null;
    if (f !== null) {
      fitEl.className = 'gsp-fit ' + (f ? 'ok' : 'no');
      fitEl.textContent = f ? 'Mieści się na Twoim placu ' + m(st.plot.L) + ' × ' + m(st.plot.W) + ' m' : 'Potrzeba ' + m(size.length) + ' × ' + m(size.width) + ' m z wybiegami, plac ma ' + m(st.plot.L) + ' × ' + m(st.plot.W) + ' m';
    }
  }

  $('[data-gsp-multi]').addEventListener('change', function (e) {
    st.multi = e.target.checked;
    if (!st.multi) st.picked = [st.id];
    root.classList.toggle('gsp-is-multi', st.multi);
    paintChips(); draw();
  });
  function readPlot() {
    var a = parseFloat(String($('[data-gsp-l]').value).replace(',', '.')), b = parseFloat(String($('[data-gsp-w]').value).replace(',', '.'));
    st.plot = a > 0 ? (b > 0 ? { L: Math.max(a, b), W: Math.min(a, b) } : null) : null;
    $('[data-gsp-count]').textContent = st.plot ? D.sports.filter(fits).length + ' z ' + D.sports.length + ' gier mieści się' : '';
    paintChips(); draw();
  }
  $('[data-gsp-l]').addEventListener('input', readPlot);
  $('[data-gsp-w]').addEventListener('input', readPlot);

  root.classList.add('gsp-ready');
  paintChips(); draw();
})();
