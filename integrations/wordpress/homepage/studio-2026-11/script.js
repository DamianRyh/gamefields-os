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

  /* ---------- PRINT STUDIO ---------- */
  var SIG = [['city-fluid', 'City Fluid'], ['riviera-court', 'Riviera Court'], ['club-heritage', 'Club Heritage'], ['urban-camo', 'Urban Camo'], ['metro-lines', 'Metro Lines'], ['night-signal', 'Night Signal'], ['brand-stage', 'Brand Stage'], ['earth-motion', 'Earth Motion'], ['play-system', 'Play System'], ['raw-architecture', 'Raw Architecture'], ['local-lettering', 'Local Lettering'], ['festival-art', 'Festival Art']];
  var FMT = [['A3 · 29,7 × 42 cm', '30%'], ['50 × 70 cm', '40%'], ['70 × 100 cm', '54%']];
  var FRM = [['Bez ramy', '5% 5% 4%', 'none', '#FFFFFF'], ['Czarna', '5% 5% 4%', '10px solid #161013', '#FFFFFF'], ['Dąb', '5% 5% 4%', '10px solid #B98A5B', '#FFFFFF'], ['Biała', '5% 5% 4%', '10px solid #F7F5F2', '#FFFFFF']];
  var WALLS = [['Ciepła biel', '#EFEAE4'], ['Beton', '#C9C4BE'], ['Szałwia', '#B7C1A9'], ['Śliwka', '#47132D']];
  var PAL = ['#6336F5', '#E0402B', '#D8F24A', '#FFB3C8', '#2457D6', '#47132D', '#F4F1EE', '#1F2A6B'];
  var DARK = ['#6336F5', '#E0402B', '#2457D6', '#47132D', '#1F2A6B'];
  var pbEl = document.querySelector('[data-poster-base]'), PB = pbEl ? pbEl.getAttribute('data-poster-base') : '';
  var PLINES = '<svg class="plines" viewBox="0 0 425 600" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"><rect x="15" y="15" width="395" height="570"/><path d="M15 300H410M137.5 15v70h150v-70M137.5 585v-70h150v70"/><circle cx="212.5" cy="300" r="45"/></g></svg>';
  var pr = { src: 'sig', sig: 0, seed: 2026, fmt: 1, frame: 1, wall: 0 };
  var poster = $('[data-poster]'), pin = $('[data-poster-in]'), cap = $('#gfs-caption');
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function paintPoster() {
    pin.replaceChildren();
    if (pr.src === 'sig') {
      pin.style.background = '#E6E0DA';
      pin.appendChild(el('img', { class: 'pimg', src: (PB || SP) + SIG[pr.sig][0] + '.svg', alt: 'Rysunek techniczny nawierzchni ' + SIG[pr.sig][1] }));
      $('[data-print-name]').textContent = SIG[pr.sig][1];
      $('[data-poster-no]').textContent = 'S' + String(pr.sig + 1).padStart(2, '0') + ' · Signature';
    } else {
      var r = rng(pr.seed), pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
      var bg = pick(PAL), pal2 = PAL.filter(function (c) { return c !== bg; });
      pin.style.background = bg;
      var n = 5 + Math.floor(r() * 4);
      for (var i = 0; i < n; i++) {
        var kind = Math.floor(r() * 3), size = 25 + Math.floor(r() * 60);
        pin.appendChild(el('div', { class: 'shape', style: 'left:' + Math.round(r() * 100 - size / 2) + '%;top:' + Math.round(r() * 100 - size / 2) + '%;width:' + size + '%;height:' + (kind === 2 ? Math.round(size * 0.28) : Math.round(size * 0.714)) + '%;background:' + pick(pal2) + ';border-radius:' + (kind === 0 ? '50%' : (kind === 1 ? '50% 50% 0 0' : '0')) + ';transform:rotate(' + (Math.round(r() * 4) * 45) + 'deg)' }));
      }
      pin.insertAdjacentHTML('beforeend', PLINES); pin.lastChild.style.color = DARK.indexOf(bg) > -1 ? 'rgba(255,255,255,.6)' : 'rgba(71,19,45,.4)';
      $('[data-print-name]').textContent = 'Wzór generowany';
      $('[data-poster-no]').textContent = 'No. ' + String(pr.seed % 10000).padStart(4, '0');
    }
    var f = FRM[pr.frame];
    poster.style.width = FMT[pr.fmt][1]; poster.style.padding = f[1]; poster.style.border = f[2]; poster.style.background = f[3];
    $('[data-frame-name]').textContent = f[0];
    $('[data-walltag]').textContent = FMT[pr.fmt][0] + ' · ściana ok. 1,6 m';
    $('[data-wall2]').style.background = WALLS[pr.wall][1];
    $('[data-poster-cap]').textContent = cap.value.slice(0, 24) || ' ';
    $$('[data-pthumbs] button').forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === 0 ? pr.src === 'gen' : (pr.src === 'sig' ? pr.sig === i - 1 : false))); });
  }
  var thumbs = $('[data-pthumbs]');
  var gen = el('button', { type: 'button', class: 'gen', 'aria-label': 'Wygeneruj nowy wzór', 'aria-pressed': 'false' }, '⟳');
  gen.addEventListener('click', function () { pr.src = 'gen'; pr.seed = Math.floor(Math.random() * 1e6); paintPoster(); });
  thumbs.appendChild(gen);
  SIG.forEach(function (s, i) {
    var b = el('button', { type: 'button', 'aria-label': s[1], 'aria-pressed': 'false' }, '<img src="' + SP + s[0] + '.svg" alt="" loading="lazy">');
    b.addEventListener('click', function () { pr.src = 'sig'; pr.sig = i; paintPoster(); });
    thumbs.appendChild(b);
  });
  function chipGroup(sel, list, key, label) {
    var g = $(sel);
    list.forEach(function (it, i) {
      var b = el('button', { type: 'button', class: label === 'swatch' ? 'sw2' : 'chip', 'aria-pressed': String(i === pr[key]), 'aria-label': it[0] }, label === 'swatch' ? '' : esc(it[0]));
      if (label === 'swatch') b.style.background = it[1];
      b.addEventListener('click', function () { pr[key] = i; pressGroup(g, b); paintPoster(); });
      g.appendChild(b);
    });
  }
  chipGroup('[data-formats]', FMT, 'fmt'); chipGroup('[data-frames]', FRM, 'frame'); chipGroup('[data-walls]', WALLS, 'wall', 'swatch');
  cap.addEventListener('input', paintPoster);
  paintPoster();

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
    var name = pr.src === 'sig' ? SIG[pr.sig][1] + ' (S' + String(pr.sig + 1).padStart(2, '0') + ')' : 'wzór generowany No. ' + String(pr.seed % 10000).padStart(4, '0');
    setLine('Zamówienie plakatu: ', name + ' · podpis „' + (cap.value.slice(0, 24) || '-') + '” · ' + FMT[pr.fmt][0] + ' · rama: ' + FRM[pr.frame][0]);
    var att = $('#gc-attached'); if (att) { att.textContent = 'Plakat dołączony do zapytania. Wpisz e-mail, a potwierdzę cenę i wysyłkę.'; att.hidden = false; }
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
