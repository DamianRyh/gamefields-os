/* Share Your Field on the homepage (theme 1.0.37).
   The hero's model and colours (window.GFHero, gf-home.js) become a Stories/Post graphic or a 6 s film.
   Shots come from the hero's own <model-viewer> (same GLB, same colours), templates and the MP4 writer from
   gf-share-core.js (generated from the Studio's lib/share-media, so both look the same).
   Loaded on the first click of "Udostępnij"; nothing here runs before that. */
(function () {
  'use strict';
  var C = window.GFShareCore, H = window.GFHero;
  if (!C || !H) return;
  var FPS = 30, SECONDS = 6;
  var LOOK = { clean: { theta: 35, phi: 58, phi0: 40, k0: 1.18, spin: 200 }, street: { theta: 20, phi: 74, phi0: 46, k0: 1.05, spin: 220 } };
  var st = { format: 'story', style: 'clean', bg: 'auto', output: 'image', caption: 'Moje boisko.' };
  var shots = null, shotsKey = '', film = null, busy = false, abort = null, dlg, cv, video, statusEl, progressEl, opener;

  function emit(name, detail) { try { window.dispatchEvent(new CustomEvent('gf-share', { detail: Object.assign({ name: name, source: 'home' }, detail || {}) })); } catch (e) { /* optional */ } }
  function raf() { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function filmSupported() { return typeof window.VideoEncoder === 'function' && typeof window.VideoFrame === 'function'; }
  function key() { var s = H.state(); return [s.model.k, s.panel.k, s.frame.k].join('-'); }
  function facts() {
    var s = H.state(), pal = [s.panel.c, s.frame.c, H.ground].filter(function (c, i, a) { return a.indexOf(c) === i; })
      .sort(function (a, b) { return C.lum(b) - C.lum(a); });
    return { name: s.model.full, field: s.model.dim.split(' · ')[0], footprint: null, pattern: s.panel.n + ' i ' + s.frame.n.toLowerCase(),
      palette: pal, frame: s.frame.c, panel: s.panel.c, caption: st.caption.trim(), price: null };
  }

  /* ---------- shots from the hero model-viewer ---------- */
  function viewerReady() {
    var t0 = Date.now();
    return new Promise(function (ok, no) {
      (function check() {
        var mv = H.viewer(), s = H.state();
        if (mv ? (mv.loaded ? mv.getAttribute('src') === s.model.glb : false) : false) return ok(mv);
        if (Date.now() - t0 > 30000) return no(new Error('Model 3D się nie wczytał. Sprawdź połączenie i spróbuj ponownie.'));
        setTimeout(check, 150);
      })();
    });
  }
  function begin(mv) {
    var saved = { orbit: mv.getAttribute('camera-orbit'), rotate: mv.hasAttribute('auto-rotate'), controls: mv.hasAttribute('camera-controls'), shadow: mv.getAttribute('shadow-intensity') };
    /* model-viewer lowers its render scale on slow devices, and toBlob() then returns only part of the view: full scale while capturing */
    var MV = customElements.get('model-viewer'), scale = MV ? MV.minimumRenderScale : null; if (MV) MV.minimumRenderScale = 1;
    mv.removeAttribute('auto-rotate'); mv.removeAttribute('camera-controls'); mv.setAttribute('shadow-intensity', '0.22');
    return function end() {
      if (saved.controls) mv.setAttribute('camera-controls', '');
      if (saved.shadow) mv.setAttribute('shadow-intensity', saved.shadow);
      if (MV) MV.minimumRenderScale = scale;
      mv.cameraOrbit = saved.orbit || '35deg 61deg 106%'; mv.jumpCameraToGoal();
      if (saved.rotate) mv.setAttribute('auto-rotate', '');
    };
  }
  function grab(mv, theta, phi, radius) {
    mv.cameraOrbit = theta.toFixed(2) + 'deg ' + phi.toFixed(2) + 'deg ' + radius.toFixed(1) + '%';
    mv.jumpCameraToGoal();
    return raf().then(raf).then(raf).then(function () { return mv.toBlob({ mimeType: 'image/png', idealAspect: false }); })
      .then(function (b) { return createImageBitmap(b); });
  }
  /* Where the model is in a shot (alpha > 8), as fractions of the frame. */
  function bounds(bmp) {
    var s = document.createElement('canvas'), w = 320, h = Math.max(1, Math.round(320 * bmp.height / bmp.width)); s.width = w; s.height = h;
    var g = s.getContext('2d', { willReadFrequently: true }); g.drawImage(bmp, 0, 0, w, h);
    var d = g.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return x1 < 0 ? null : [x0 / w, y0 / h, (x1 + 1) / w, (y1 + 1) / h];
  }
  /* One crop for the whole film (union of the model over the move), so the model never jumps or rescales. */
  function cropTo(bmp, box, out) {
    var x = box[0] * bmp.width, y = box[1] * bmp.height, w = (box[2] - box[0]) * bmp.width, h = (box[3] - box[1]) * bmp.height;
    out.width = Math.round(w); out.height = Math.round(h);
    var g = out.getContext('2d'); g.clearRect(0, 0, out.width, out.height); g.drawImage(bmp, x, y, w, h, 0, 0, out.width, out.height);
    return out;
  }
  function takeShots() {
    if (shots ? shotsKey === key() : false) return Promise.resolve(shots);
    H.start(); setStatus('Wczytuję model 3D…');
    return viewerReady().then(function (mv) {
      var end = begin(mv), out = {};
      return grab(mv, LOOK.clean.theta, LOOK.clean.phi, 100).then(function (b) { out.hero = C.trim(b); b.close(); return grab(mv, LOOK.street.theta, LOOK.street.phi, 96); })
        .then(function (b) { out.low = C.trim(b); b.close(); out.surface = null; shots = out; shotsKey = key(); film = null; end(); setStatus(''); emit('share_image_generated'); return out; },
          function (e) { end(); throw e; });
    });
  }

  /* ---------- film: crane down, dolly in, eased orbit that settles on the still's view, 2 sub-frames for motion blur ---------- */
  function encoderConfig(w, h) {
    var list = ['avc1.640028', 'avc1.4d0028', 'avc1.42e028'], i = 0;
    return (function next() {
      if (i >= list.length) return Promise.reject(new Error('Ta przeglądarka nie nagra filmu MP4. Pobierz grafikę PNG.'));
      var c = { codec: list[i++], width: w, height: h, bitrate: 8000000, framerate: FPS, avc: { format: 'avc' } };
      return VideoEncoder.isConfigSupported(c).then(function (r) { return r.supported ? c : next(); }, next);
    })();
  }
  function makeFilm(onProgress, signal) {
    var size = C.FORMAT_SIZE[st.format], W = size[0], Hh = size[1], L = LOOK[st.style], N = SECONDS * FPS, SUB = 2, box = null;
    var eio = function (x) { x = Math.min(1, Math.max(0, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    var eo = function (x) { x = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - x, 3); };
    var f = facts(), work = document.createElement('canvas'), acc = document.createElement('canvas'), frameCv = document.createElement('canvas');
    acc.width = W; acc.height = Hh; var g = acc.getContext('2d');
    return Promise.all([encoderConfig(W, Hh), viewerReady()]).then(function (r) {
      var cfg = r[0], mv = r[1], writer = new C.Mp4Writer(W, Hh, FPS), failure = null, end = begin(mv);
      var enc = new VideoEncoder({ output: function (chunk, meta) { writer.add(chunk, meta); }, error: function (e) { failure = e; } });
      enc.configure(cfg);
      var i = 0;
      function pose(u) { var m = eio(u / 0.86), k = eo(u / 0.86); return [L.theta + L.spin * (1 - m) - 4 * (1 - u), L.phi0 + (L.phi - L.phi0) * m, 100 * (L.k0 + (1 - L.k0) * k)]; }
      function scan(s) {
        if (s > 16) { if (!box) return Promise.reject(new Error('Nie widać modelu w kadrze. Spróbuj ponownie.')); box = [Math.max(0, box[0] - 0.02), Math.max(0, box[1] - 0.02), Math.min(1, box[2] + 0.02), Math.min(1, box[3] + 0.02)]; return Promise.resolve(); }
        var p = pose(s / 16);
        return grab(mv, p[0], p[1], p[2]).then(function (b) { var q = bounds(b); b.close(); if (q) box = box ? [Math.min(box[0], q[0]), Math.min(box[1], q[1]), Math.max(box[2], q[2]), Math.max(box[3], q[3])] : q; return scan(s + 1); });
      }
      function step() {
        if (signal.aborted) return Promise.reject(new DOMException('Anulowano.', 'AbortError'));
        if (failure) return Promise.reject(failure);
        if (i >= N) return enc.flush().then(function () { if (failure) throw failure; return writer.finish(); });
        var j = 0;
        function sub() {
          if (j >= SUB) {
            g.globalAlpha = 1;
            var vf = new VideoFrame(acc, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
            enc.encode(vf, { keyFrame: i % (FPS * 2) === 0 }); vf.close(); i++; onProgress(i / N);
            return (enc.encodeQueueSize > 4 ? wait(8) : Promise.resolve()).then(step);
          }
          var u = (i + j / SUB * 0.5) / N, p = pose(u);
          return grab(mv, p[0], p[1], p[2]).then(function (b) {
            cropTo(b, box, frameCv); b.close();
            C.compose(work, { format: st.format, style: st.style, background: st.bg, facts: f, images: { hero: frameCv, low: frameCv, surface: null }, showPrice: false, anim: u * SECONDS });
            g.globalAlpha = 1 / (j + 1); g.drawImage(work, 0, 0); j++; return sub();
          });
        }
        return sub();
      }
      return scan(0).then(step).then(function (blob) { end(); enc.close(); return blob; }, function (e) { end(); if (enc.state !== 'closed') enc.close(); throw e; });
    });
  }

  /* ---------- UI ---------- */
  var CSS = '.gfhs{border:0;padding:0;max-width:min(940px,calc(100vw - 24px));width:100%;max-height:calc(100dvh - 24px);border-radius:18px;background:#F4F1EE;color:#47132D;font-family:GHInter,Inter,Arial,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.35)}' +
    '.gfhs::backdrop{background:rgba(20,10,30,.62)}' +
    '.gfhs-in{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:22px;padding:22px;max-height:calc(100dvh - 24px);overflow:auto;box-sizing:border-box}' +
    '.gfhs-stage{background:#1F2A6B;border-radius:14px;padding:16px;display:grid;place-items:center;align-self:start}' +
    '.gfhs-frame{position:relative;width:100%;max-width:300px;border-radius:10px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.35);background:#fff;line-height:0}' +
    '.gfhs-frame canvas,.gfhs-frame video{display:block;width:100%;height:auto}.gfhs-frame [hidden]{display:none}' +
    '.gfhs-wait{position:absolute;inset:0;display:grid;place-items:center;margin:0;padding:16px;text-align:center;font-size:14px;line-height:1.4;color:#6F5A66;background:#F4F1EE}' +
    '.gfhs-bar{position:absolute;left:10px;right:10px;bottom:10px;display:flex;gap:8px;align-items:center;padding:8px;border-radius:999px;background:rgba(28,9,18,.82);line-height:1}' +
    '.gfhs-bar i{display:block;height:6px;border-radius:6px;background:#D8F24A;flex:none;max-width:calc(100% - 80px)}' +
    '.gfhs-bar button{margin-left:auto;min-height:30px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;font-weight:700;font-size:12px;cursor:pointer}' +
    '.gfhs-c{display:grid;gap:14px;align-content:start;min-width:0}.gfhs-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}' +
    '.gfhs-h h2{margin:0;font-size:24px;font-weight:800;letter-spacing:-.03em;line-height:1.1}.gfhs-h p{margin:4px 0 0;color:#6F5A66;font-size:14px}' +
    '.gfhs-x{width:40px;height:40px;flex:none;border-radius:50%;border:1px solid #D9CFD4;background:#fff;color:#47132D;font-size:20px;cursor:pointer}' +
    '.gfhs fieldset{border:0;margin:0;padding:0;min-width:0}.gfhs legend,.gfhs-l{display:block;margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#6F5A66}' +
    '.gfhs-seg{display:grid;grid-template-columns:repeat(var(--n,2),minmax(0,1fr));gap:4px;padding:4px;background:#E9E3DE;border-radius:12px}' +
    '.gfhs-seg label{position:relative;display:grid;place-items:center;min-height:44px;border-radius:9px;cursor:pointer;font-weight:700;font-size:14px;text-align:center;line-height:1.15;padding:4px}' +
    '.gfhs-seg small{display:block;font-weight:500;font-size:11px;color:#6F5A66}.gfhs-seg input{position:absolute;opacity:0;pointer-events:none}' +
    '.gfhs-seg label:has(input:checked){background:#fff;box-shadow:0 1px 3px rgba(28,9,18,.18)}.gfhs-seg label:has(input:focus-visible){outline:2px solid #6336F5}' +
    '.gfhs-seg label.off{opacity:.5;cursor:not-allowed}' +
    '.gfhs-sw{display:flex;flex-wrap:wrap;gap:8px}.gfhs-sw label{position:relative;cursor:pointer}.gfhs-sw input{position:absolute;opacity:0}' +
    '.gfhs-sw span{display:block;width:38px;height:38px;border-radius:50%;border:1px solid rgba(0,0,0,.15);box-shadow:inset 0 0 0 3px #fff}' +
    '.gfhs-sw label:has(input:checked) span{outline:2.5px solid #6336F5;outline-offset:2px}.gfhs-sw label:has(input:focus-visible) span{outline:2.5px dashed #6336F5;outline-offset:2px}' +
    '.gfhs input[type=text]{width:100%;box-sizing:border-box;min-height:44px;padding:0 12px;border:1.5px solid #D9CFD4;border-radius:10px;background:#fff;color:#47132D;font:inherit;font-size:16px}' +
    '.gfhs-a{display:grid;gap:8px}.gfhs-a>div{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '.gfhs-b{min-height:48px;border-radius:999px;border:1.5px solid #D9CFD4;background:#fff;color:#47132D;font:700 15px GHInter,Inter,Arial,sans-serif;cursor:pointer;padding:0 16px}' +
    '.gfhs-b:hover{border-color:#6336F5}.gfhs-b:disabled{opacity:.5;cursor:not-allowed}.gfhs-b.p{background:#47132D;border-color:#47132D;color:#fff}' +
    '.gfhs-s{margin:0;min-height:18px;font-size:13px;line-height:1.45;color:#6F5A66}.gfhs-st{font-size:14px;font-weight:700;color:#6336F5}' +
    '@media (max-width:720px){.gfhs{max-width:100vw;max-height:100dvh;height:100dvh;border-radius:0;margin:0}.gfhs-in{grid-template-columns:minmax(0,1fr);gap:14px;padding:14px;max-height:100dvh}.gfhs-frame{max-width:190px}.gfhs-stage{padding:12px}}';

  function setStatus(t) { if (statusEl) statusEl.textContent = t; }
  function seg(name, items, cur) {
    return '<div class="gfhs-seg" style="--n:' + items.length + '">' + items.map(function (it) {
      return '<label class="' + (it[3] ? 'off' : '') + '"><input type="radio" name="gfhs-' + name + '" value="' + it[0] + '"' + (it[0] === cur ? ' checked' : '') + (it[3] ? ' disabled' : '') + '>' + it[1] + (it[2] ? '<small>' + it[2] + '</small>' : '') + '</label>';
    }).join('') + '</div>';
  }
  function swatches() {
    var f = facts(), list = C.BACKGROUNDS[st.style];
    if (!list.some(function (b) { return b.id === st.bg; })) st.bg = list[0].id;
    return list.map(function (b) {
      var style = b.color ? 'background:' + b.color : 'background:conic-gradient(' + f.palette.map(function (c, i, a) { return c + ' ' + (i / a.length * 100) + '% ' + ((i + 1) / a.length * 100) + '%'; }).join(',') + ')';
      var label = b.color ? b.label : 'Z kolorów boiska';
      return '<label title="' + label + '"><input type="radio" name="gfhs-bg" value="' + b.id + '" aria-label="' + label + '"' + (b.id === st.bg ? ' checked' : '') + '><span style="' + style + '"></span></label>';
    }).join('');
  }
  function controls() {
    var canFilm = filmSupported();
    if (!canFilm) st.output = 'image';
    dlg.querySelector('[data-c]').innerHTML =
      '<fieldset><legend>Format</legend>' + seg('format', [['story', 'Stories', '1080 × 1920'], ['post', 'Post', '1080 × 1350']], st.format) + '</fieldset>' +
      '<fieldset><legend>Styl</legend>' + seg('style', [['clean', 'Clean'], ['street', 'Street']], st.style) + '</fieldset>' +
      '<fieldset><legend>Rodzaj</legend>' + seg('output', [['image', 'Grafika', 'PNG'], ['film', 'Film 6 s', canFilm ? 'MP4, obrót kamery' : 'niedostępny tutaj', !canFilm]], st.output) + '</fieldset>' +
      '<fieldset><legend>Tło</legend><div class="gfhs-sw">' + swatches() + '</div></fieldset>' +
      '<div><label class="gfhs-l" for="gfhs-cap">Podpis (opcjonalnie)</label><input id="gfhs-cap" type="text" maxlength="28" value="' + st.caption.replace(/"/g, '&quot;') + '" placeholder="np. Moje boisko."></div>';
    var sb = dlg.querySelector('[data-share]'); sb.textContent = st.output === 'film' ? (film ? 'Udostępnij film' : 'Nagraj i udostępnij') : 'Udostępnij';
    dlg.querySelector('[data-dl]').textContent = st.output === 'film' ? 'Pobierz MP4' : 'Pobierz PNG';
  }
  function render() {
    if (!shots) return;
    C.compose(cv, { format: st.format, style: st.style, background: st.bg, facts: facts(), images: shots, showPrice: false });
    var showFilm = st.output === 'film' ? !!film : false;
    cv.hidden = showFilm; video.hidden = !showFilm;
    if (showFilm) { if (video.src !== film.url) video.src = film.url; video.play().catch(function () {}); } else video.pause();
  }
  function filmKey() { return [key(), st.format, st.style, st.bg, st.caption].join('|'); }
  function name(ext) { return 'gamefields-' + H.state().model.full.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + st.format + '.' + ext; }
  function getFile() {
    if (st.output !== 'film') return new Promise(function (ok) { cv.toBlob(function (b) { ok(new File([b], name('png'), { type: 'image/png' })); }, 'image/png'); });
    if (film ? film.key === filmKey() : false) return Promise.resolve(new File([film.blob], name('mp4'), { type: 'video/mp4' }));
    busy = true; abort = new AbortController(); progressEl.hidden = false; setBar(0); setStatus('Nagrywam film… boisko obraca się w banerze.'); lock(true); emit('share_film_start', { format: st.format, style: st.style });
    var fk = filmKey();
    return makeFilm(setBar, abort.signal).then(function (blob) {
      if (film) URL.revokeObjectURL(film.url);
      film = { blob: blob, url: URL.createObjectURL(blob), key: fk }; emit('share_film_generated', { format: st.format, style: st.style, bytes: blob.size });
      setStatus('Film gotowy: 6 s, MP4.'); render(); controls(); return new File([blob], name('mp4'), { type: 'video/mp4' });
    }, function (e) { setStatus(e.name === 'AbortError' ? 'Nagrywanie przerwane.' : e.message); return null; })
      .then(function (f) { busy = false; progressEl.hidden = true; lock(false); return f; });
  }
  function setBar(p) { progressEl.querySelector('i').style.width = (p * 100) + '%'; }
  function lock(on) { [].forEach.call(dlg.querySelectorAll('[data-share],[data-dl],[data-c] input'), function (x) { x.disabled = on; }); }
  function download(f) { var a = document.createElement('a'), u = URL.createObjectURL(f); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }
  function copyLink() { return navigator.clipboard.writeText(H.link()).then(function () { return true; }, function () { return false; }); }

  function build() {
    var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
    dlg = document.createElement('dialog'); dlg.className = 'gfhs'; dlg.setAttribute('aria-labelledby', 'gfhs-t');
    dlg.innerHTML = '<div class="gfhs-in"><div class="gfhs-stage"><div class="gfhs-frame"><canvas width="1080" height="1920" aria-label="Podgląd grafiki"></canvas><video muted loop playsinline aria-label="Podgląd filmu" hidden></video><p class="gfhs-wait" data-wait>Przygotowuję ujęcia z modelu 3D…</p><div class="gfhs-bar" data-bar hidden role="progressbar" aria-label="Nagrywanie filmu"><i></i><button type="button" data-abort>Anuluj</button></div></div></div>' +
      '<div class="gfhs-c"><div class="gfhs-h"><div><h2 id="gfhs-t">Udostępnij swoje boisko</h2><p data-sub></p></div><button type="button" class="gfhs-x" data-close aria-label="Zamknij">×</button></div>' +
      '<form data-c onsubmit="return false"></form>' +
      '<div class="gfhs-a"><button type="button" class="gfhs-b p" data-share>Udostępnij</button><div><button type="button" class="gfhs-b" data-dl>Pobierz PNG</button><button type="button" class="gfhs-b" data-copy>Kopiuj link</button></div>' +
      '<p class="gfhs-s" role="status" aria-live="polite" data-status></p><a class="gfhs-st" data-studio hidden>Otwórz ten projekt w Studio 3D ↗</a></div></div></div>';
    document.body.appendChild(dlg);
    cv = dlg.querySelector('canvas'); video = dlg.querySelector('video'); statusEl = dlg.querySelector('[data-status]'); progressEl = dlg.querySelector('[data-bar]');
    dlg.querySelector('[data-close]').addEventListener('click', close);
    dlg.addEventListener('cancel', function (e) { if (busy) { e.preventDefault(); return; } });
    dlg.addEventListener('close', function () { if (abort) abort.abort(); if (opener) opener.focus(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { if (!busy) close(); } });
    dlg.querySelector('[data-abort]').addEventListener('click', function () { if (abort) abort.abort(); });
    dlg.querySelector('[data-c]').addEventListener('input', function (e) {
      var t = e.target;
      if (t.name === 'gfhs-format') st.format = t.value; else if (t.name === 'gfhs-style') st.style = t.value; else if (t.name === 'gfhs-output') st.output = t.value; else if (t.name === 'gfhs-bg') st.bg = t.value; else if (t.id === 'gfhs-cap') { st.caption = t.value; render(); return; }
      controls(); render();
    });
    dlg.querySelector('[data-dl]').addEventListener('click', function () {
      getFile().then(function (f) { if (!f) return; download(f); emit(st.output === 'film' ? 'share_film_download' : 'share_png_download', { format: st.format, style: st.style }); setStatus('Pobrano ' + f.name + '.'); });
    });
    dlg.querySelector('[data-copy]').addEventListener('click', function () {
      copyLink().then(function (ok) { setStatus(ok ? 'Skopiowano link: otwiera stronę z tym modelem i kolorami.' : 'Link: ' + H.link()); if (ok) emit('share_link_copy'); });
    });
    dlg.querySelector('[data-share]').addEventListener('click', function () {
      getFile().then(function (f) {
        if (!f) return;
        return copyLink().then(function (copied) {
          var data = { files: [f], title: H.state().model.full, text: 'Designed in Gamefields Studio · ' + H.link() };
          var tail = copied ? ' Link jest w schowku: w Instagramie dodaj naklejkę „Link” i wklej.' : '';
          if (navigator.canShare ? navigator.canShare(data) : false) {
            emit('share_native_open', { output: st.output, format: st.format, style: st.style });
            return navigator.share(data).then(function () { emit('share_native_done', { output: st.output }); setStatus('Gotowe.' + tail); },
              function (e) { if (e.name === 'AbortError') setStatus('Udostępnianie anulowane.'); else { download(f); setStatus('Zapisano plik.' + tail); } });
          }
          download(f); emit(st.output === 'film' ? 'share_film_download' : 'share_png_download', { format: st.format, style: st.style, fallback: true }); setStatus('Zapisano ' + f.name + '.' + tail);
        });
      });
    });
  }
  function close() { if (busy) return; dlg.close(); }
  function open(from) {
    opener = from; if (!dlg) build();
    var s = H.state(), studio = H.studio(), a = dlg.querySelector('[data-studio]');
    dlg.querySelector('[data-sub]').textContent = s.model.full + ' · panele: ' + s.panel.n.toLowerCase() + ' · rama: ' + s.frame.n.toLowerCase();
    if (studio) { a.href = studio; a.hidden = false; } else a.hidden = true;
    if (film ? film.key !== filmKey() : false) { URL.revokeObjectURL(film.url); film = null; }
    setStatus(''); controls(); dlg.showModal(); emit('share_panel_open');
    var wait = dlg.querySelector('[data-wait]'); wait.hidden = !!(shots ? shotsKey === key() : false);
    var fontsReady = document.fonts ? Promise.all(['500', '700', '800', '900'].map(function (w) { return document.fonts.load(w + ' 40px GHInter'); })).catch(function () {}) : Promise.resolve();
    fontsReady.then(takeShots).then(function () { wait.hidden = true; render(); }, function (e) { wait.textContent = e.message; setStatus(e.message); });
  }
  window.GFShare = { open: open };
})();
