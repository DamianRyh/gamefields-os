(function () {
  'use strict';
  /* NOTE: WordPress turns a double ampersand into an HTML entity in rendered scripts.
     This file must not contain that character at all; use nested ifs or ternaries. */
  var root = document.querySelector('.gfs');
  if (!root) return;
  var A = root.getAttribute('data-asset-base') || '';
  var UP = 'https://www.gamefields.eu/wp-content/uploads/2026/10/';
  var SP = 'https://gamefields-studio.ryhfs90.chatgpt.site/surface-projects/';
  var STUDIO = '/konfigurator-boisk/';
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var el = function (tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === 'style') n.style.cssText = attrs[k]; else n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  };
  var escBox = document.createElement('div');
  var esc = function (s) { escBox.textContent = String(s); return escBox.innerHTML.replace(/"/g, '”'); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function pressGroup(container, active) { $$('[aria-pressed]', container).forEach(function (b) { b.setAttribute('aria-pressed', String(b === active)); }); }

  /* ---------- NAV (mobile) ---------- */
  var nav = $('#gfs-nav'), menuBtn = $('.menu-btn', nav);
  menuBtn.addEventListener('click', function () { var o = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(o)); });
  $$('.links a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- HERO: 3D model + court colour ---------- */
  var COATS = [
    { k: 'gray', n: 'Szary stalowy', c: '#8F9493', gl: [0.62, 0.65, 0.64], ground: '#6336F5', ink: '#FFFFFF', line: 'rgba(255,255,255,.45)', cta: ['#FFFFFF', '#47132D'] },
    { k: 'red', n: 'Czerwień sygnałowa', c: '#D9142B', gl: [0.76, 0.06, 0.10], ground: '#1F2A6B', ink: '#FFFFFF', line: 'rgba(255,255,255,.4)', cta: ['#D8F24A', '#1F2A6B'] },
    { k: 'blue', n: 'Niebieski kort', c: '#2C6FB0', gl: [0.10, 0.39, 0.73], ground: '#D8F24A', ink: '#1F2A6B', line: 'rgba(31,42,107,.35)', cta: ['#1F2A6B', '#FFFFFF'] },
    { k: 'green', n: 'Szałwia', c: '#6B7C4F', gl: [0.39, 0.51, 0.31], ground: '#FFB3C8', ink: '#47132D', line: 'rgba(71,19,45,.3)', cta: ['#47132D', '#FFFFFF'] }
  ];
  var MODELS3D = [
    { k: 'o1', n: 'Play', full: 'Panna Play', code: 'GF-CT-002', dim: 'Ø ~6 m · do 1,52 m · 1 na 1', glb: 'public/models/gamefields/source/panna-kids-o1.glb', still: UP + 'Gamefields-Panna-Play-wide-v3-default.webp', orbit: '30deg 62deg 105%' },
    { k: 'p1', n: 'Court', full: 'Panna Court', code: 'GF-CT-003', dim: '7,14 × 5,57 m · do 1,22 m · 1 na 1', glb: 'public/models/gamefields/source/boisko-p1.glb', still: UP + 'Gamefields-Panna-Court-wide-v3-default.webp', orbit: '30deg 62deg 105%' },
    { k: 'w1', n: 'Ring', full: 'Panna Ring', code: 'GF-CT-001', dim: 'Ø ~5 m · 1 m · 1 na 1', glb: 'public/models/gamefields/source/boisko-w1.glb', still: UP + 'W-1-—-GF-CT-001.webp', orbit: '30deg 62deg 105%' },
    { k: 'octagon', n: 'Octa', full: 'Panna Octa', code: 'GF-CT-008', dim: '4,96 m między bokami · 1,22 m · 1 na 1', glb: 'integrations/wordpress/homepage/studio-2026-11/assets/panna-octa.glb', still: UP + 'GF-CT-008-octagon.webp', orbit: '30deg 64deg 105%' }
  ];
  var hero = $('#gfs-hero'), hero3d = $('[data-hero-3d]'), court = $('[data-hero-court]');
  var cur = { coat: COATS[0], model: MODELS3D[0] }, mv = null, mvReady = false;
  var REPO = root.getAttribute('data-repo-base') || '';

  function paintHero() {
    var c = cur.coat;
    hero.style.background = c.ground; hero.style.color = c.ink;
    court.style.setProperty('--ln', c.line);
    var cta = $('[data-hero-cta]'); cta.style.background = c.cta[0]; cta.style.color = c.cta[1];
    cta.href = STUDIO + '?' + new URLSearchParams({ arena: cur.model.k }).toString();
    $('[data-hero-colorname]').textContent = 'Kolor ramy · ' + c.n;
    $('[data-hero-code]').textContent = cur.model.code + ' · ' + cur.model.full + ' · model 3D';
    $('[data-hero-dim]').textContent = cur.model.dim;
    $('.still', hero3d).src = cur.model.still;
    applyCoat();
  }
  function applyCoat() {
    if (!mv) return; if (!mv.model) return;
    mv.model.materials.forEach(function (m) {
      var n = m.name || '';
      if (/^(Rama|Panele|Wypelnienie|Bramki)/.test(n)) m.pbrMetallicRoughness.setBaseColorFactor(cur.coat.gl.concat([1]));
    });
  }
  function loadModel() {
    if (!window.customElements) return;
    customElements.whenDefined('model-viewer').then(function () {
      if (!mv) {
        mv = document.createElement('model-viewer');
        ['camera-controls', 'disable-zoom', 'auto-rotate', 'ar'].forEach(function (a) { mv.setAttribute(a, ''); });
        mv.setAttribute('touch-action', 'pan-y');
        mv.setAttribute('interaction-prompt', 'none');
        mv.setAttribute('auto-rotate-delay', '800');
        mv.setAttribute('rotation-per-second', reduced ? '0deg' : '14deg');
        mv.setAttribute('shadow-intensity', '1.1');
        mv.setAttribute('shadow-softness', '0.8');
        mv.setAttribute('exposure', '1.05');
        mv.setAttribute('field-of-view', '28deg');
        mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
        mv.addEventListener('load', function () { mvReady = true; hero3d.classList.add('ready'); applyCoat(); });
        hero3d.insertBefore(mv, hero3d.firstChild);
      }
      hero3d.classList.remove('ready');
      mv.setAttribute('alt', cur.model.full + ', model 3D. Przeciągnij, aby obrócić.');
      mv.setAttribute('camera-orbit', cur.model.orbit);
      mv.setAttribute('src', REPO + cur.model.glb);
    });
  }
  var heroModels = $('[data-hero-models]'), heroDots = $('[data-hero-dots]');
  MODELS3D.forEach(function (m, i) {
    var b = el('button', { type: 'button', 'aria-pressed': String(i === 0) }, esc(m.n));
    b.addEventListener('click', function () { cur.model = m; pressGroup(heroModels, b); paintHero(); loadModel(); });
    heroModels.appendChild(b);
  });
  COATS.forEach(function (c, i) {
    var b = el('button', { type: 'button', class: 'dot', 'aria-label': c.n, 'aria-pressed': String(i === 0), style: 'background:' + c.c });
    b.addEventListener('click', function () { cur.coat = c; pressGroup(heroDots, b); paintHero(); });
    heroDots.appendChild(b);
  });
  paintHero();
  var mvStarted = false;
  function startMV() {
    if (mvStarted) return; mvStarted = true;
    var s = document.createElement('script'); s.type = 'module';
    s.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
    document.head.appendChild(s); loadModel();
  }
  if ('requestIdleCallback' in window) requestIdleCallback(startMV, { timeout: 1500 }); else setTimeout(startMV, 600);

  // the cursor is the ball
  var ball = $('[data-ball]');
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = hero.getBoundingClientRect();
    ball.style.left = (e.clientX - r.left) + 'px'; ball.style.top = (e.clientY - r.top) + 'px'; ball.style.opacity = '1';
  });
  hero.addEventListener('pointerleave', function () { ball.style.opacity = '0'; });

  /* ---------- COLLECTION WALL ---------- */
  var W = 'rgba(255,255,255,.5)', P = 'rgba(71,19,45,.28)';
  var ALL = [
    { n: '01', k: 'circle-cage-1', shape: 'okrag', name: 'Panna Cage 90', dim: 'Ø ~6 m · 0,90 m', img: UP + 'Cage-90-Hero-4-gray.webp', bg: '#E0402B', ink: '#FFFFFF', line: W },
    { n: '02', k: 'circle-cage-2', shape: 'okrag', name: 'Panna Cage 180', dim: 'Ø ~6 m · 1,80 m', img: UP + 'Cage-180-Hero-4-gray.webp', bg: '#D8F24A', ink: '#1F2A6B', line: 'rgba(31,42,107,.3)' },
    { n: '03', k: 'o1', shape: 'okrag', name: 'Panna Play', dim: 'Ø ~6 m · do 1,52 m', img: UP + 'Gamefields-Panna-Play-wide-v3-default.webp', bg: '#2457D6', ink: '#FFFFFF', line: W },
    { n: '04', k: 'p1', shape: 'prostokat', name: 'Panna Court', dim: '7,14 × 5,57 m', img: UP + 'Gamefields-Panna-Court-wide-v3-default.webp', bg: '#FFB3C8', ink: '#47132D', line: P },
    { n: '05', k: 'octagon', shape: 'oktagon', name: 'Panna Octa', dim: '4,96 m · 1,22 m', img: UP + 'GF-CT-008-octagon.webp', bg: '#47132D', ink: '#F4F1EE', line: 'rgba(244,241,238,.35)' },
    { n: '06', k: 'street-field', shape: 'prostokat', name: 'Panna Grid', dim: '6,21 × 4,65 m', img: UP + 'GF-CT-007-street-field.webp', bg: '#E8E1D8', ink: '#47132D', line: P },
    { n: '07', k: 'w1', shape: 'okrag', name: 'Panna Ring', dim: 'Ø ~5 m · 1 m', img: UP + 'W-1-—-GF-CT-001.webp', bg: '#6336F5', ink: '#FFFFFF', line: W },
    { n: '08', k: 'street15', shape: 'prostokat', name: 'Street Arena 15', dim: '15 × 10 m · 3 na 3', img: UP + 'GF-CT-004-street15.webp', bg: '#1F2A6B', ink: '#FFFFFF', line: W }
  ];
  var LAYOUT = { 8: ['s7 tall', 's5 tall', 's4', 's4', 's4', 's5', 's3', 's4'], 5: ['s7 tall', 's5 tall', 's4', 's4', 's4'], 3: ['s4 tall', 's4 tall', 's4 tall'], 1: ['s12 tall'] };
  var wall = $('[data-wall]'), filters = $('[data-filters]');
  function renderWall(shape) {
    var list = ALL.filter(function (m) { return shape === 'all' ? true : m.shape === shape; });
    var lay = LAYOUT[list.length] || LAYOUT[8];
    wall.replaceChildren.apply(wall, list.map(function (m, i) {
      var a = el('a', { class: 'tile ' + lay[i], href: STUDIO + '?' + new URLSearchParams({ arena: m.k }).toString(), style: 'background:' + m.bg + ';color:' + m.ink, 'aria-label': m.name + ', ' + m.dim + '. Otwórz w Studio.' });
      a.innerHTML = '<div class="court" style="--ln:' + m.line + ';--cr:30%"><i></i><i></i></div><span class="go">Konfiguruj →</span><span class="num d">' + m.n + '</span><img src="' + m.img + '" alt="" loading="lazy" decoding="async"><div class="bar"><b>' + esc(m.name) + '</b><span class="m">' + esc(m.dim) + '</span></div>';
      return a;
    }));
  }
  [['all', 'Wszystkie'], ['okrag', 'Okrąg'], ['prostokat', 'Prostokąt'], ['oktagon', 'Oktagon']].forEach(function (f, i) {
    var count = f[0] === 'all' ? ALL.length : ALL.filter(function (m) { return m.shape === f[0]; }).length;
    var b = el('button', { type: 'button', class: 'chip', 'aria-pressed': String(i === 0) }, esc(f[1]) + '<small>' + count + '</small>');
    b.addEventListener('click', function () { pressGroup(filters, b); renderWall(f[0]); });
    filters.appendChild(b);
  });
  renderWall('all');

  /* ---------- SCALE 1:1 ---------- */
  var elev = $('[data-elev]'), fig = $('[data-fig]'), hIn = $('#gfs-height'), tall = true;
  function paintScale() {
    var cm = Number(hIn.value);
    fig.style.height = 'calc(var(--m) * ' + (cm / 100) + ')';
    $('[data-fig-label]').textContent = cm + ' cm';
    var note = cm < 140 ? 'dziecko, wejście i bramki w zasięgu' : (tall ? (cm < 180 ? 'rama wyższa niż Ty' : 'rama sięga mniej więcej do głowy') : 'rama do pasa, widok zostaje otwarty');
    $('[data-height-note]').textContent = 'Twój wzrost · ' + cm + ' cm · ' + note;
    elev.classList.toggle('tall2', tall);
  }
  hIn.addEventListener('input', paintScale);
  $$('[data-scale]').forEach(function (b) { b.addEventListener('click', function () { tall = b.getAttribute('data-scale') === '180'; pressGroup(b.parentNode, b); paintScale(); }); });
  paintScale();

  /* ---------- POSTER LAB (engine: window.GFPRO, Court Art Pro) ---------- */
  var G = window.GFPRO;
  var PL = { ready: false };
  if (G) (function () {
    var FAM = {}; G.PRO_FAMILIES.forEach(function (f) { FAM[f.id] = f; });
    var PAL = {}; G.PRO_PALETTES.forEach(function (p) { PAL[p.id] = p; });
    var SIGP = G.SIG;
    var FORMATS = [
      { name: 'A3', size: '29,7 × 42 cm', ratio: 42 / 29.7, wall: '32%' },
      { name: '50 × 70', size: '50 × 70 cm', ratio: 1.4, wall: '44%' },
      { name: '70 × 100', size: '70 × 100 cm', ratio: 100 / 70, wall: '58%' }
    ];
    var FRAMES = [['none', 'Bez ramy', ''], ['black', 'Czarna', '#161013'], ['oak', 'Dąb', '#B98A5B'], ['white', 'Biała', '#F7F5F2'], ['alu', 'Aluminium', '#A8A8A4']];
    var PAPERS = [['#FFFFFF', 'Biały'], ['#F4F1EE', 'Kremowy'], ['#161013', 'Czarny'], ['#47132D', 'Śliwka']];
    var WALLS = [['#EFEAE4', 'Ciepła biel'], ['#C9C4BE', 'Beton'], ['#B7C1A9', 'Szałwia'], ['#2B2226', 'Grafit']];
    var LAYOUTS = [['gallery', 'Galeria'], ['bleed', 'Pełny spad'], ['type', 'Wielki tytuł'], ['match', 'Matchday'], ['side', 'Pion']];
    var LINES = [['auto', 'Auto'], ['#FFFFFF', 'Białe'], ['#111111', 'Czarne'], ['#D8F24A', 'Limonka'], ['none', 'Bez linii']];
    var HEX = /^#[0-9A-Fa-f]{6}$/;
    var st = { fam: 'pro-fade', v: 2, pal: 'duperre', colors: PAL.duperre.colors.slice(), seed: 0, line: 'auto', layout: 'gallery', paper: 0, title: 'Mój plac', sub: 'Warszawa · Praga-Północ', note: 'Gramy od 2026', fmt: 1, frame: 1, wall: 0 };
    var flat = false;

    var sheet = $('[data-pl-sheet]'), frame = $('[data-pl-frame]'), wall = $('[data-pl-wall]');
    var inTitle = $('#pl-title'), inSub = $('#pl-sub'), inNote = $('#pl-note');

    function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function cfg() { return { f: st.fam, v: st.v, p: st.pal, c: st.colors, s: st.seed, l: st.line, y: st.layout, pa: st.paper, t: st.title, u: st.sub, n: st.note, fm: st.fmt, fr: st.frame }; }
    function edition() { var c = cfg(); delete c.fm; delete c.fr; return String(hashStr(JSON.stringify(c)) % 10000).padStart(4, '0'); }
    function x(s) { return esc(s); }
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

    /* ---------- controls ---------- */
    function press(container, test) { $$('[aria-pressed]', container).forEach(function (b, i) { b.setAttribute('aria-pressed', String(test(b, i))); }); }
    function chipList(sel, list, onPick, swatch) {
      var g = $(sel);
      list.forEach(function (it, i) {
        var b = el('button', { type: 'button', class: swatch ? 'sw2' : 'chip', 'aria-pressed': 'false', 'aria-label': it[1] || it[0] }, swatch ? '' : esc(it[1] || it[0]));
        if (swatch) b.style.background = it[0];
        b.addEventListener('click', function () { onPick(i); });
        g.appendChild(b);
      });
      return g;
    }
    var sigBox = $('[data-pl-sig]');
    SIGP.forEach(function (s, i) {
      var b = el('button', { type: 'button', 'aria-pressed': 'false', 'aria-label': s.name }, '');
      b.addEventListener('click', function () { st.fam = s.familyId; st.v = s.variant; st.pal = s.paletteId; st.colors = PAL[s.paletteId].colors.slice(); st.seed = 0; draw(); });
      sigBox.appendChild(b);
    });
    function paintThumbs() { // light thumbnails, drawn when idle
      $$('button', sigBox).forEach(function (b, i) {
        var s = SIGP[i]; if (b.firstChild) return;
        b.innerHTML = '<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">' + G.renderPro(s.familyId, s.variant, 400, PAL[s.paletteId].colors, { uid: 'plt' + i }) + '</svg><span>' + esc(s.name) + '</span>';
      });
    }
    var famsBox = chipList('[data-pl-fams]', G.PRO_FAMILIES.map(function (f) { return [f.id, f.name]; }), function (i) { st.fam = G.PRO_FAMILIES[i].id; st.seed = 0; draw(); });
    var varsBox = $('[data-pl-vars]');
    for (var vi = 1; vi <= 12; vi++) (function (n) { var b = el('button', { type: 'button', 'aria-pressed': 'false', 'aria-label': 'Kompozycja ' + n }, String(n)); b.addEventListener('click', function () { st.v = n; st.seed = 0; draw(); }); varsBox.appendChild(b); })(vi);
    $('[data-pl-seed]').addEventListener('click', function () { st.seed = 1 + Math.floor(Math.random() * 999999); draw(); });
    var palsBox = $('[data-pl-pals]');
    G.PRO_PALETTES.forEach(function (p) {
      var b = el('button', { type: 'button', 'aria-pressed': 'false', 'aria-label': 'Paleta ' + p.name }, '<i>' + p.colors.map(function (c) { return '<b style="background:' + c + '"></b>'; }).join('') + '</i><small>' + esc(p.name) + '</small>');
      b.addEventListener('click', function () { st.pal = p.id; st.colors = p.colors.slice(); draw(); });
      palsBox.appendChild(b);
    });
    var colBox = $('[data-pl-colors]'), colInputs = [];
    for (var ci = 0; ci < 5; ci++) (function (k) {
      var lab = el('label', null, 'Kolor ' + (k + 1)); var inp = el('input', { type: 'color', 'aria-label': 'Kolor ' + (k + 1) });
      inp.addEventListener('input', function () { st.colors[k] = inp.value.toUpperCase(); st.pal = 'custom'; schedule(); });
      lab.appendChild(inp); colBox.appendChild(lab); colInputs.push(inp);
    })(ci);
    var linesBox = chipList('[data-pl-lines]', LINES, function (i) { st.line = LINES[i][0]; draw(); });
    var papersBox = chipList('[data-pl-papers]', PAPERS, function (i) { st.paper = i; draw(); });
    var laysBox = $('[data-pl-lays]');
    LAYOUTS.forEach(function (l, i) {
      var b = el('button', { type: 'button', 'aria-pressed': 'false' }, '');
      b.addEventListener('click', function () { st.layout = l[0]; draw(); });
      laysBox.appendChild(b);
    });
    var fmtBox = chipList('[data-pl-formats]', FORMATS.map(function (f) { return [f.name, f.size]; }), function (i) { st.fmt = i; draw(); });
    var frBox = chipList('[data-pl-frames]', FRAMES, function (i) { st.frame = i; draw(); });
    var wallBox = chipList('[data-pl-walls]', WALLS, function (i) { st.wall = i; draw(); }, true);
    [inTitle, inSub, inNote].forEach(function (inp) { inp.addEventListener('input', function () { st.title = inTitle.value; st.sub = inSub.value; st.note = inNote.value; schedule(); }); });
    $('[data-pl-random]').addEventListener('click', function () {
      var f = G.PRO_FAMILIES[Math.floor(Math.random() * G.PRO_FAMILIES.length)], p = G.PRO_PALETTES[Math.floor(Math.random() * G.PRO_PALETTES.length)];
      st.fam = f.id; st.v = 1 + Math.floor(Math.random() * 12); st.pal = p.id; st.colors = p.colors.slice(); st.seed = Math.floor(Math.random() * 999999); st.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)][0]; draw();
    });
    $('[data-pl-shift]').addEventListener('click', function () { st.colors.push(st.colors.shift()); st.pal = 'custom'; draw(); });
    var viewBtn = $('[data-pl-view]');
    viewBtn.addEventListener('click', function () { flat = !flat; draw(); });

    /* tabs */
    var tabs = $$('.pl-tabs [role="tab"]');
    function selectTab(t) { tabs.forEach(function (b) { var on = b === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; $('#' + b.getAttribute('aria-controls')).hidden = !on; }); }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectTab(t); });
      t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0); if (!d) return; e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; selectTab(n); n.focus(); });
    });

    /* ---------- render ---------- */
    var pending = false;
    function schedule() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; draw(); }); }
    function summary() {
      var palName = st.pal === 'custom' ? 'własne kolory (' + st.colors.join(' ') + ')' : PAL[st.pal].name;
      return FAM[st.fam].name + ' ' + st.v + (st.seed ? '.' + st.seed : '') + ' · paleta ' + palName + ' · układ ' + LAYOUTS.filter(function (l) { return l[0] === st.layout; })[0][1] + ' · ' + FORMATS[st.fmt].size + ' · rama: ' + FRAMES[st.frame][1].toLowerCase();
    }
    function draw() {
      var no = edition();
      sheet.innerHTML = posterSvg(st, 'pl', { no: no });
      frame.dataset.frame = FRAMES[st.frame][0];
      frame.style.borderColor = FRAMES[st.frame][2] || 'transparent';
      frame.style.width = (parseFloat(FORMATS[st.fmt].wall) * (window.innerWidth < 700 ? 1.4 : 1)) + '%';
      wall.style.backgroundColor = flat ? '' : WALLS[st.wall][0];
      wall.dataset.view = flat ? 'flat' : 'wall';
      viewBtn.setAttribute('aria-pressed', String(flat)); viewBtn.textContent = flat ? 'Na ścianie' : 'Sam plakat';
      $('[data-pl-tag]').textContent = flat ? FORMATS[st.fmt].size + ' · No. ' + no : FORMATS[st.fmt].size + ' · ściana ok. 1,6 m';
      var f = FAM[st.fam];
      $('[data-pl-famname]').textContent = f.name;
      $('[data-pl-insp]').textContent = f.inspiration;
      $('[data-pl-palname]').textContent = st.pal === 'custom' ? 'Własne kolory' : PAL[st.pal].name;
      $('[data-pl-layname]').textContent = LAYOUTS.filter(function (l) { return l[0] === st.layout; })[0][1];
      $('[data-pl-framename]').textContent = FRAMES[st.frame][1];
      press(sigBox, function (b, i) { var s = SIGP[i]; return s.familyId === st.fam ? (s.variant === st.v ? (s.paletteId === st.pal ? !st.seed : false) : false) : false; });
      press(famsBox, function (b, i) { return G.PRO_FAMILIES[i].id === st.fam; });
      press(varsBox, function (b, i) { return i + 1 === st.v; });
      press(palsBox, function (b, i) { return G.PRO_PALETTES[i].id === st.pal; });
      press(linesBox, function (b, i) { return LINES[i][0] === st.line; });
      press(papersBox, function (b, i) { return i === st.paper; });
      press(fmtBox, function (b, i) { return i === st.fmt; });
      press(frBox, function (b, i) { return i === st.frame; });
      press(wallBox, function (b, i) { return i === st.wall; });
      press(laysBox, function (b, i) { return LAYOUTS[i][0] === st.layout; });
      colInputs.forEach(function (inp, k) { if (document.activeElement !== inp) inp.value = st.colors[k]; });
      if (document.activeElement !== inTitle) inTitle.value = st.title;
      if (document.activeElement !== inSub) inSub.value = st.sub;
      if (document.activeElement !== inNote) inNote.value = st.note;
      $('[data-pl-sum]').textContent = summary();
      drawLayoutThumbs();
    }
    var layKey = '';
    function drawLayoutThumbs() {
      var key = [st.fam, st.v, st.colors.join(''), st.seed, st.line, st.paper, st.title, st.sub, st.note, st.fmt].join('|');
      if (key === layKey) return; layKey = key;
      $$('button', laysBox).forEach(function (b, i) {
        var s = {}; Object.keys(st).forEach(function (k) { s[k] = st[k]; }); s.layout = LAYOUTS[i][0];
        b.innerHTML = posterSvg(s, 'plL' + i, { no: '0000' }) + '<span>' + esc(LAYOUTS[i][1]) + '</span>';
      });
    }

    /* ---------- share link ---------- */
    function shareUrl() {
      var json = JSON.stringify(cfg()); var bin = unescape(encodeURIComponent(json));
      var code = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return location.origin + location.pathname + '?plakat=' + code + '#plakaty';
    }
    function loadShared() {
      var m = /[?]plakat=([A-Za-z0-9_-]+)/.exec(location.search); if (!m) return false;
      try {
        var b64 = m[1].replace(/-/g, '+').replace(/_/g, '/'); while (b64.length % 4) b64 += '=';
        var c = JSON.parse(decodeURIComponent(escape(atob(b64))));
        if (FAM[c.f]) st.fam = c.f;
        if (c.v >= 1) { if (c.v <= 12) st.v = Math.round(c.v); }
        if (Array.isArray(c.c)) { if (c.c.length === 5) { if (c.c.every(function (h) { return HEX.test(h); })) st.colors = c.c.map(function (h) { return h.toUpperCase(); }); } }
        st.pal = PAL[c.p] ? c.p : 'custom';
        if (typeof c.s === 'number') st.seed = Math.max(0, Math.min(999999, Math.round(c.s)));
        if (LINES.some(function (l) { return l[0] === c.l; })) st.line = c.l;
        if (LAYOUTS.some(function (l) { return l[0] === c.y; })) st.layout = c.y;
        if (PAPERS[c.pa]) st.paper = c.pa;
        if (typeof c.t === 'string') st.title = c.t.slice(0, 28);
        if (typeof c.u === 'string') st.sub = c.u.slice(0, 34);
        if (typeof c.n === 'string') st.note = c.n.slice(0, 34);
        if (FORMATS[c.fm]) st.fmt = c.fm;
        if (FRAMES[c.fr]) st.frame = c.fr;
        return true;
      } catch (e) { return false; }
    }
    var status = $('[data-pl-status]');
    $('[data-pl-share]').addEventListener('click', function () {
      var url = shareUrl();
      var done = function () { status.textContent = 'Link skopiowany. Każdy, kto go otworzy, zobaczy ten plakat.'; };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { status.textContent = url; });
      else status.textContent = url;
    });

    PL.ready = true;
    PL.order = function () { return { name: st.title || 'bez tytułu', text: summary() + ' · No. ' + edition() + ' · link: ' + shareUrl() }; };
    var shared = loadShared();
    draw();
    (window.requestIdleCallback || function (fn) { return setTimeout(fn, 400); })(paintThumbs);
    if (shared) setTimeout(function () { $('#plakaty').scrollIntoView({ behavior: 'auto' }); }, 300);
  })();

  /* ---------- PROJECT-DETAILS helper (CF7 field) ---------- */
  function setLine(prefix, text) {
    var field = root.querySelector('[name="project-details"]');
    if (!field) return false;
    var lines = field.value.split('\n').filter(function (l) { return l.indexOf(prefix) !== 0; });
    if (text) lines.unshift(prefix + text);
    field.value = lines.join('\n').trim();
    field.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  function goContact() {
    $('#kontakt').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    var mail = root.querySelector('[name="your-email"]');
    if (mail) setTimeout(function () { mail.focus({ preventScroll: true }); }, reduced ? 0 : 500);
  }
  $('[data-print-order]').addEventListener('click', function () {
    if (!PL.ready) { goContact(); return; }
    var o = PL.order();
    setLine('Zamówienie plakatu: ', '„' + o.name + '” · ' + o.text);
    var att = $('#gc-attached'); if (att) { att.textContent = 'Plakat dołączony do zapytania razem z linkiem do projektu. Wpisz e-mail, a potwierdzę cenę i wysyłkę.'; att.hidden = false; }
    goContact();
  });

  /* ---------- KITS ---------- */
  var KITS = [
    { seg: 'Miasto', pitch: 'Mała arena jako punkt spotkań w parku. Komplet materiałów do budżetu obywatelskiego.', arena: 'circle-cage-1', model: 'Panna Cage 90', img: UP + 'Cage-90-Hero-4-gray.webp', surf: 'city-fluid', surfName: 'City Fluid', space: 'park, skwer, plac', bg: '#E0402B', ink: '#FFFFFF' },
    { seg: 'Szkoła', pitch: 'Czytelna, bezpieczna arena na przerwę i WF. Przyjazne kolory dla dzieci.', arena: 'o1', model: 'Panna Play', img: UP + 'Gamefields-Panna-Play-wide-v3-default.webp', surf: 'play-system', surfName: 'Play System', space: 'boisko szkolne, dziedziniec', bg: '#D8F24A', ink: '#1F2A6B' },
    { seg: 'Osiedle', pitch: 'Wyróżnik inwestycji wpisany w zieleń. Mieści się na placu o boku 5–7 m.', arena: 'p1', model: 'Panna Court', img: UP + 'Gamefields-Panna-Court-wide-v3-default.webp', surf: 'earth-motion', surfName: 'Earth Motion', space: 'dziedziniec, zieleń osiedlowa', bg: '#FFB3C8', ink: '#47132D' },
    { seg: 'Klub', pitch: 'Trening 1 na 1 przez cały rok. Barwy klubu i partnera na nawierzchni.', arena: 'circle-cage-2', model: 'Panna Cage 180', img: UP + 'Cage-180-Hero-4-gray.webp', surf: 'club-heritage', surfName: 'Club Heritage', space: 'akademia, ośrodek treningowy', bg: '#2457D6', ink: '#FFFFFF' },
    { seg: 'Marka', pitch: 'Boisko jako nośnik kampanii. Turniej, logo i treści z wydarzenia.', arena: 'street15', model: 'Street Arena 15', img: UP + 'GF-CT-004-street15.webp', surf: 'brand-stage', surfName: 'Brand Stage', space: 'event, galeria, festiwal', bg: '#47132D', ink: '#F4F1EE' }
  ];
  var kitsBox = $('[data-kits]'), openKit = -1;
  function renderKits() {
    kitsBox.replaceChildren.apply(kitsBox, KITS.map(function (k, i) {
      var wrap = el('div', { style: 'background:' + k.bg + ';color:' + k.ink });
      var btn = el('button', { type: 'button', class: 'stripe', 'aria-expanded': String(openKit === i), 'aria-controls': 'gfs-kit-' + i },
        '<span class="d w">' + esc(k.seg) + '</span><span class="p">' + esc(k.pitch) + '</span><span class="combo"><img src="' + k.img + '" alt=""><img class="s" src="' + SP + k.surf + '.svg" alt=""></span><span class="m meta">' + (openKit === i ? 'Zwiń −' : 'Zobacz zestaw +') + '</span>');
      btn.addEventListener('click', function () { openKit = openKit === i ? -1 : i; renderKits(); });
      wrap.appendChild(btn);
      if (openKit === i) {
        var href = STUDIO + '?' + new URLSearchParams({ arena: k.arena, pattern: k.surf }).toString();
        wrap.appendChild(el('div', { class: 'kit-open', id: 'gfs-kit-' + i },
          '<div class="big"><img class="surf" src="' + SP + k.surf + '.svg" alt=""><img class="model" src="' + k.img + '" alt="' + esc(k.model) + ' na nawierzchni ' + esc(k.surfName) + '"></div>' +
          '<div style="display:grid;gap:22px;align-content:center"><ul><li><span class="m">Boisko</span><b>' + esc(k.model) + '</b></li><li><span class="m">Nawierzchnia</span><b>' + esc(k.surfName) + '</b></li><li><span class="m">Miejsce</span><b>' + esc(k.space) + '</b></li></ul>' +
          '<a class="pill" href="' + href + '" style="background:' + k.ink + ';color:' + k.bg + ';justify-self:start">Otwórz zestaw w Studio <span aria-hidden="true">→</span></a></div>'));
      }
      return wrap;
    }));
  }
  renderKits();

  /* ---------- ON YOUR SITE ---------- */
  var site = $('[data-site]'), sm = $('[data-site-model]'), sPhoto = $('[data-site-photo]'), sScale = $('#gfs-site-scale');
  var sp = { x: 26, y: 38, w: 48 }, drag = null, objUrl = null, samplePhoto = sPhoto.getAttribute('src');
  function placeSite() { sm.style.left = sp.x + '%'; sm.style.top = sp.y + '%'; sm.style.width = sp.w + '%'; }
  sm.addEventListener('pointerdown', function (e) { e.preventDefault(); sm.setPointerCapture(e.pointerId); var r = site.getBoundingClientRect(); drag = { sx: e.clientX, sy: e.clientY, x: sp.x, y: sp.y, w: r.width, h: r.height }; });
  sm.addEventListener('pointermove', function (e) { if (!drag) return; sp.x = Math.max(-20, Math.min(90, drag.x + (e.clientX - drag.sx) / drag.w * 100)); sp.y = Math.max(-20, Math.min(90, drag.y + (e.clientY - drag.sy) / drag.h * 100)); placeSite(); });
  ['pointerup', 'pointercancel'].forEach(function (t) { sm.addEventListener(t, function () { drag = null; }); });
  sScale.addEventListener('input', function () { var cx = sp.x + sp.w / 2; sp.w = Number(sScale.value); sp.x = cx - sp.w / 2; placeSite(); });
  $('#gfs-photo').addEventListener('change', function (e) {
    var f = e.target.files ? e.target.files[0] : null; if (!f) return;
    if (objUrl) URL.revokeObjectURL(objUrl);
    objUrl = URL.createObjectURL(f); sPhoto.src = objUrl; $('[data-site-label]').textContent = 'Twój plac';
  });
  $('[data-site-reset]').addEventListener('click', function () { if (objUrl) URL.revokeObjectURL(objUrl); objUrl = null; sPhoto.src = samplePhoto; sp = { x: 26, y: 38, w: 48 }; sScale.value = 48; placeSite(); $('[data-site-label]').textContent = 'Przykładowy plac'; });
  placeSite();

  /* ---------- COLLAB boards ---------- */
  var boards = $('[data-boards]'), big = $('[data-board-big]');
  $$('button', boards).forEach(function (b) { b.addEventListener('click', function () { big.src = b.getAttribute('data-src'); big.alt = 'Koncepcja pod mostem Łazienkowskim: ' + b.getAttribute('aria-label'); pressGroup(boards, b); }); });

  /* ---------- STEPS ---------- */
  var STEPS = [
    { t: 'Wybierz', p: 'Forma boiska albo gotowy zestaw dla szkoły, osiedla czy klubu.', d: 'Zacznij od kształtu. Okrąg daje najwięcej gry na małym placu, prostokąt lepiej wpisuje się w istniejące boisko.', cta: 'Przeglądaj boiska', href: '#boiska' },
    { t: 'Zaprojektuj', p: 'Kolor ramy, nawierzchnia i wzór w Studio 3D.', d: 'W Studio zmieniasz kolor ramy, nawierzchnię i wzór Signature. Gotowy projekt możesz dołączyć do zapytania.', cta: 'Otwórz Studio', href: STUDIO },
    { t: 'Sprawdź', p: 'Wymiary i zdjęcia placu. Przygotuję koncepcję dla Twojego miejsca.', d: 'Prześlij wymiary albo zdjęcia placu. Na tej podstawie przygotuję koncepcję i umówimy wizję lokalną.', cta: 'Opisz miejsce', href: '#kontakt' },
    { t: 'Graj', p: 'Montaż i odbiór. Potem boisko żyje swoim życiem.', d: 'Montaż, odbiór i pierwszy mecz. Potem chętnie wrócę zobaczyć, jak miejsce działa.', cta: 'Napisz do mnie', href: '#kontakt' }
  ];
  var stepsBox = $('[data-steps]');
  function pickStep(i) { $('[data-step-text]').textContent = STEPS[i].d; var c = $('[data-step-cta]'); c.textContent = STEPS[i].cta + ' →'; c.href = STEPS[i].href; }
  STEPS.forEach(function (s, i) {
    var b = el('button', { type: 'button', 'aria-pressed': String(i === 0) }, '<span class="m">0' + (i + 1) + '</span><h3 class="d">' + esc(s.t) + '</h3><p>' + esc(s.p) + '</p>');
    b.addEventListener('click', function () { pressGroup(stepsBox, b); pickStep(i); });
    stepsBox.appendChild(b);
  });
  pickStep(0);

  /* ---------- CONTACT chips -> project-details ---------- */
  var WHO = ['Gmina lub szkoła', 'Osiedle lub deweloper', 'Klub lub akademia', 'Marka lub agencja', 'Osoba prywatna'];
  var NEEDS = ['Bezpłatne planowanie', 'Próbki materiałów', 'Pakiet dla projektanta', 'Plakat'];
  var who = -1, needs = [];
  function syncProfile() {
    var parts = []; if (who > -1) parts.push(WHO[who]); if (needs.length) parts.push('potrzebuję: ' + needs.slice().sort().map(function (i) { return NEEDS[i]; }).join(', '));
    setLine('Profil zapytania: ', parts.join(' · '));
  }
  var whoBox = $('[data-who]'), needsBox = $('[data-needs]');
  WHO.forEach(function (w, i) { var b = el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, esc(w)); b.addEventListener('click', function () { who = who === i ? -1 : i; $$('button', whoBox).forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === who)); }); syncProfile(); }); whoBox.appendChild(b); });
  NEEDS.forEach(function (w, i) { var b = el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, esc(w)); b.addEventListener('click', function () { var k = needs.indexOf(i); if (k > -1) needs.splice(k, 1); else needs.push(i); b.setAttribute('aria-pressed', String(k < 0)); syncProfile(); }); needsBox.appendChild(b); });

  /* ---------- Studio -> inquiry (Studio opened from this page) ---------- */
  var studioOrigin = 'https://gamefields-studio.ryhfs90.chatgpt.site';
  window.addEventListener('message', function (event) {
    if (event.origin !== studioOrigin) return;
    if (event.source !== window.opener) return;
    var d = event.data; if (!d) return; if (d.type !== 'gf-inquiry') return;
    if (typeof d.summary !== 'string') return; if (d.summary.length > 500000) return;
    var field = root.querySelector('[name="project-details"]'); if (!field) return;
    var id = typeof d.requestId === 'string' ? (d.requestId.length <= 100 ? d.requestId : null) : null;
    try { JSON.parse(d.summary); } catch (e) { if (id) event.source.postMessage({ type: 'gf-inquiry-rejected', requestId: id }, studioOrigin); return; }
    field.value = d.summary; field.dispatchEvent(new Event('input', { bubbles: true }));
    if (id) event.source.postMessage({ type: 'gf-inquiry-attached', requestId: id, summaryLength: field.value.length }, studioOrigin);
    var att = $('#gc-attached'); if (att) att.hidden = false;
    goContact();
  });
})();
