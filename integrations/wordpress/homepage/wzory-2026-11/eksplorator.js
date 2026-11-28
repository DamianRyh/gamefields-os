/* Wzory explorer on the homepage (28.11.2026). Runs after the pattern engine (window.GFW, the same court-art-pro.mjs
   as the Studio) and reads the curated presets from #gwz-data. Everything the visitor sees is what the Studio renders
   for the same pattern, composition and palette; "Otwórz w Studio" passes exactly those three. */
(function () {
  'use strict';
  var root = document.getElementById('wzory');
  var G = window.GFW;
  if (!root || !G) return;
  var DATA = JSON.parse(document.getElementById('gwz-data').textContent);
  var PAL = {};
  G.PRO_PALETTES.forEach(function (p) { PAL[p.id] = p; });
  var FAM = {};
  G.PRO_FAMILIES.forEach(function (f) { FAM[f.id] = f; });
  var $ = function (s) { return root.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = { col: 0, i: 0, v: 1, pal: '' };
  var uid = 0;

  function svg(fam, v, colors, h, lines) {
    uid += 1;
    var lc = G.recommendLineColor(colors);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + h + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      G.renderPro(fam, v, h, colors, { uid: 'gwz' + uid }) + (lines ? G.courtLines(h, lc) : '') + '</svg>';
  }
  function darkest(colors) { return colors.slice().sort(function (a, b) { return G.lightness(a) - G.lightness(b); })[0]; }
  function preset() { return DATA.collections[st.col].presets[st.i]; }
  function colors() { return PAL[st.pal].colors; }

  /* collections */
  var tabs = $('[data-gwz-cols]');
  DATA.collections.forEach(function (c, ci) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab');
    b.innerHTML = esc(c.name) + ' <small>' + c.presets.length + '</small>';
    b.addEventListener('click', function () { pickCollection(ci, true); });
    tabs.appendChild(b);
  });

  /* palettes: the preset's own palette first, then a fixed set of strong ones */
  var palBox = $('[data-gwz-pals]');
  function drawPalettes() {
    var ids = [preset().paletteId].concat(DATA.palettes.filter(function (id) { return id !== preset().paletteId; })).slice(0, 9);
    palBox.innerHTML = '';
    ids.forEach(function (id) {
      var p = PAL[id];
      if (!p) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(id === st.pal));
      b.setAttribute('aria-label', 'Paleta ' + p.name);
      b.title = p.name;
      b.innerHTML = '<i>' + p.colors.map(function (c) { return '<b style="background:' + c + '"></b>'; }).join('') + '</i>';
      b.addEventListener('click', function () { st.pal = id; draw(true); });
      palBox.appendChild(b);
    });
  }

  /* pattern thumbnails: whole courts, never cropped */
  var grid = $('[data-gwz-grid]');
  function drawGrid() {
    var c = DATA.collections[st.col];
    grid.innerHTML = '';
    c.presets.forEach(function (p, pi) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(pi === st.i));
      b.innerHTML = '<span class="th">' + svg(p.familyId, p.variant, PAL[p.paletteId].colors, 400, true) + '</span><span class="nm">' + esc(p.name) + '</span>';
      b.addEventListener('click', function () { pickPreset(pi, true); });
      grid.appendChild(b);
    });
  }

  function pickCollection(ci, user) {
    st.col = ci;
    [].forEach.call(tabs.children, function (b, k) { b.setAttribute('aria-selected', String(k === ci)); });
    $('[data-gwz-colnote]').textContent = DATA.collections[ci].note;
    drawGrid();
    pickPreset(0, user);
  }
  function pickPreset(pi, user) {
    st.i = pi; st.v = preset().variant; st.pal = preset().paletteId;
    [].forEach.call(grid.children, function (b, k) { b.setAttribute('aria-pressed', String(k === pi)); });
    drawPalettes();
    draw(user);
  }

  var after = $('[data-gwz-after]');
  var stage = $('[data-gwz-stage]');
  function draw(user) {
    var p = preset(), cs = colors();
    after.innerHTML = svg(p.familyId, st.v, cs, 400, true);
    root.style.setProperty('--gwz-bg', darkest(cs));
    [].forEach.call(palBox.children, function (b) { b.setAttribute('aria-pressed', String(b.title === PAL[st.pal].name)); });
    $('[data-gwz-v]').textContent = st.v + ' / 12';
    $('[data-gwz-name]').textContent = p.name;
    $('[data-gwz-eyebrow]').textContent = p.eyebrow + ' · ' + PAL[st.pal].name;
    $('[data-gwz-note]').textContent = p.note;
    $('[data-gwz-use]').textContent = p.useCase;
    var q = new URLSearchParams({ arena: 'o1', pattern: p.familyId, variant: String(st.v), palette: st.pal });
    $('[data-gwz-studio]').href = '/studio/?' + q.toString();
    if (user) reveal();
  }

  /* before / after: grey concrete on the left of the handle, the pattern on the right */
  var range = $('[data-gwz-range]');
  function setCut(x) {
    root.style.setProperty('--gwz-c', String(x));
    range.value = String(x);
  }
  range.addEventListener('input', function () { stopAnim(); setCut(Number(range.value)); });
  var anim = 0;
  function stopAnim() { if (anim) cancelAnimationFrame(anim); anim = 0; }
  function reveal() {
    stopAnim();
    if (reduced) { setCut(0); return; }
    var t0 = 0, from = 100;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1100);
      var e = 1 - Math.pow(1 - k, 3);
      setCut(Math.round(from * (1 - e)));
      if (k < 1) anim = requestAnimationFrame(step); else anim = 0;
    }
    anim = requestAnimationFrame(step);
  }

  /* composition stepper and shuffle */
  $('[data-gwz-prev]').addEventListener('click', function () { st.v = st.v === 1 ? 12 : st.v - 1; draw(false); });
  $('[data-gwz-next]').addEventListener('click', function () { st.v = st.v === 12 ? 1 : st.v + 1; draw(false); });
  $('[data-gwz-shuffle]').addEventListener('click', function () {
    var ci = Math.floor(Math.random() * DATA.collections.length);
    if (ci !== st.col) pickCollection(ci, false);
    var n = DATA.collections[ci].presets.length;
    pickPreset(Math.floor(Math.random() * n), false);
    st.v = 1 + Math.floor(Math.random() * 12);
    var pals = DATA.palettes;
    st.pal = pals[Math.floor(Math.random() * pals.length)];
    drawPalettes();
    draw(true);
  });

  /* a little depth on pointer move (desktop only) */
  if (!reduced) {
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = stage.getBoundingClientRect();
      root.style.setProperty('--gwz-rx', (((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2) + 'deg');
      root.style.setProperty('--gwz-rz', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg');
    });
    stage.addEventListener('pointerleave', function () { root.style.setProperty('--gwz-rx', '0deg'); root.style.setProperty('--gwz-rz', '0deg'); });
  }

  root.classList.add('gwz-ready');
  pickCollection(0, false);
  setCut(100);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); reveal(); }
    }, { threshold: 0.35 });
    io.observe(stage);
  } else reveal();
})();
