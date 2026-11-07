/* Gamefields ball core v2: 32-panel football (truncated icosahedron) for three.js r128+.
   GFBall.create(THREE, opts) -> { group, mesh, setState(state), pick(raycaster), panels, frontPanel(dir) }
   state = {
     mode: 'full'|'mix'|'panels',      // pattern everywhere, pattern on hexagons only, or flat panel colours
     mapping: 'sphere'|'panel',        // one continuous print, or a separate print on every panel (no stretching)
     pent, hex: '#hex',                // default panel colours
     base: { index: '#hex' },          // colour scheme per panel (from schemes())
     paint: { index: '#hex' },         // user brush, wins over everything
     seam: '#hex', finish: 'matte'|'satin'|'gloss',
     textureCanvas: canvas             // sphere: 2048x1024 equirect; panel: 8x4 atlas of 256 px tiles
   }
   Helpers: GFBall.paintTexture (sphere print), GFBall.paintAtlas (per-panel print), GFBall.schemes (panel colour schemes).
   No double ampersands on purpose: the file is also inlined into a WordPress page. */
(function (root) {
  var TILE = 256, COLS = 8, ROWS = 4, PANEL_R = 0.42;
  function create(THREE, opts) {
    opts = opts || {};
    var N = opts.detail || 10, GAP = opts.gap || 0.035;
    var t = (1 + Math.sqrt(5)) / 2;
    var IV = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(function (v) { return new THREE.Vector3(v[0], v[1], v[2]).normalize(); });
    var IF = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    function P(a, b) { return IV[a].clone().multiplyScalar(2 / 3).add(IV[b].clone().multiplyScalar(1 / 3)).normalize(); }
    var UP = new THREE.Vector3(0, 1, 0);
    function frame(c) { // east / north tangent axes at panel centre
      var east = new THREE.Vector3().crossVectors(UP, c); if (east.lengthSq() < 1e-6) east.set(1, 0, 0); east.normalize();
      return { e: east, n: new THREE.Vector3().crossVectors(c, east).normalize() };
    }
    var panels = [];
    IV.forEach(function (v, i) {
      var nb = [];
      IF.forEach(function (f) { var k = f.indexOf(i); if (k > -1) { nb.push(f[(k + 1) % 3]); nb.push(f[(k + 2) % 3]); } });
      nb = nb.filter(function (x, j) { return nb.indexOf(x) === j; });
      var pts = nb.map(function (j) { return P(i, j); });
      var c = v.clone(), fr = frame(c);
      pts.sort(function (p, q) { return Math.atan2(p.dot(fr.n), p.dot(fr.e)) - Math.atan2(q.dot(fr.n), q.dot(fr.e)); });
      panels.push({ type: 'pent', c: c, pts: pts });
    });
    IF.forEach(function (f) { var a = f[0], b = f[1], cc = f[2]; var pts = [P(a, b), P(b, a), P(b, cc), P(cc, b), P(cc, a), P(a, cc)]; var c = pts.reduce(function (s, p) { return s.add(p); }, new THREE.Vector3()).normalize(); panels.push({ type: 'hex', c: c, pts: pts }); });
    panels.forEach(function (pn, i) {
      pn.index = i; pn.fr = frame(pn.c);
      pn.lon = Math.atan2(pn.c.z, pn.c.x); pn.lat = Math.asin(Math.max(-1, Math.min(1, pn.c.y)));
      pn.tile = { x: (i % COLS) * TILE, y: Math.floor(i / COLS) * TILE };
    });
    // neighbours: panels whose centres are close (edge-sharing)
    panels.forEach(function (p) { p.nb = panels.filter(function (q) { return q !== p ? p.c.distanceTo(q.c) < 0.75 : false; }).map(function (q) { return q.index; }); });

    var pos = [], nor = [], uvS = [], uvP = [], col = [], groups = [];
    function sph(dir) { var u = 0.5 - Math.atan2(dir.z, dir.x) / (2 * Math.PI), v = 0.5 + Math.asin(Math.max(-1, Math.min(1, dir.y))) / Math.PI; return [u, v]; }
    function tri(a, b, c, pn) {
      var us = [sph(a.clone().normalize()), sph(b.clone().normalize()), sph(c.clone().normalize())];
      var mx = Math.max(us[0][0], us[1][0], us[2][0]), mn = Math.min(us[0][0], us[1][0], us[2][0]);
      if (mx - mn > 0.5) us.forEach(function (x) { if (x[0] < 0.5) x[0] += 1; });
      [a, b, c].forEach(function (p, i) {
        pos.push(p.x, p.y, p.z); uvS.push(us[i][0], us[i][1]); col.push(1, 1, 1);
        var d = p.clone().normalize(), lx = d.dot(pn.fr.e) / PANEL_R, ly = d.dot(pn.fr.n) / PANEL_R; // -1..1 inside the tile
        var tu = (pn.tile.x + (0.5 + lx * 0.5) * TILE) / (COLS * TILE), tv = 1 - (pn.tile.y + (0.5 - ly * 0.5) * TILE) / (ROWS * TILE);
        uvP.push(tu, tv);
      });
      var n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
      [a, b, c].forEach(function (p) { var nn = p.clone().normalize().lerp(n, 0.25).normalize(); nor.push(nn.x, nn.y, nn.z); });
    }
    panels.forEach(function (pn, pi) {
      var start = pos.length / 3;
      for (var k = 0; k < pn.pts.length; k++) {
        var A = pn.c, B = pn.pts[k], C = pn.pts[(k + 1) % pn.pts.length], rowsV = [];
        for (var i = 0; i <= N; i++) {
          var row = [];
          for (var j = 0; j <= i; j++) {
            var s = i / N, w = i ? j / i : 0;
            var q = A.clone().multiplyScalar(1 - s).add(B.clone().multiplyScalar(s * (1 - w))).add(C.clone().multiplyScalar(s * w));
            q = A.clone().lerp(q, 1 - GAP * s).normalize();
            row.push(q.multiplyScalar(1 + 0.009 * Math.cos(s * Math.PI / 2) - 0.007 * Math.pow(s, 6)));
          }
          rowsV.push(row);
        }
        for (var i2 = 0; i2 < N; i2++) for (var j2 = 0; j2 <= i2; j2++) { tri(rowsV[i2][j2], rowsV[i2 + 1][j2], rowsV[i2 + 1][j2 + 1], pn); if (j2 < i2) tri(rowsV[i2][j2], rowsV[i2 + 1][j2 + 1], rowsV[i2][j2 + 1], pn); }
      }
      groups.push({ start: start, count: pos.length / 3 - start, pi: pi });
    });
    var geo = new THREE.BufferGeometry();
    var uvAttr = new THREE.Float32BufferAttribute(uvS.slice(), 2);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', uvAttr);
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    groups.forEach(function (g) { geo.addGroup(g.start, g.count, 0); });
    var triPanel = new Int16Array(pos.length / 9);
    groups.forEach(function (g) { for (var i = g.start / 3; i < (g.start + g.count) / 3; i++) triPanel[i] = g.pi; });

    var tex = null, texCanvas = null, mapping = 'sphere';
    var matPat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 22, specular: 0x1e1e1e });
    var matCol = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 22, specular: 0x1e1e1e });
    var seamMat = new THREE.MeshPhongMaterial({ color: 0x15090f, shininess: 5 });
    var mesh = new THREE.Mesh(geo, [matPat, matCol]);
    var group = new THREE.Group();
    group.add(mesh);
    group.add(new THREE.Mesh(new THREE.SphereGeometry(0.988, 48, 32), seamMat));
    var FIN = { matte: [6, 0x0a0a0a], satin: [22, 0x1e1e1e], gloss: [40, 0x2a2a2a] };

    // THREE.Color converts sRGB hex to the renderer's working space (linear in r152+, unchanged in r128)
    function rgb(h) { var c = new THREE.Color(String(h || '#ffffff')); return [c.r, c.g, c.b]; }
    function setState(st) {
      var want = st.mapping === 'panel' ? 'panel' : 'sphere';
      if (want !== mapping) { mapping = want; uvAttr.array.set(want === 'panel' ? uvP : uvS); uvAttr.needsUpdate = true; if (tex) tex.wrapS = want === 'panel' ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping; if (tex) tex.needsUpdate = true; }
      if (st.textureCanvas) {
        if (texCanvas !== st.textureCanvas) { if (tex) tex.dispose(); tex = new THREE.CanvasTexture(st.textureCanvas); texCanvas = st.textureCanvas; tex.anisotropy = 4; if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace; matPat.map = tex; matPat.needsUpdate = true; }
        tex.wrapS = mapping === 'panel' ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
        tex.needsUpdate = true;
      }
      var f = FIN[st.finish] || FIN.satin;
      [matPat, matCol].forEach(function (m) { m.shininess = f[0]; m.specular.setHex(f[1]); });
      if (st.seam) seamMat.color.set(st.seam);
      var colA = geo.getAttribute('color'), paint = st.paint || {}, base = st.base || {};
      groups.forEach(function (g, gi) {
        var pn = panels[g.pi], painted = paint[g.pi];
        var usePattern = painted ? false : (st.mode === 'full' ? true : (st.mode === 'mix' ? pn.type === 'hex' : false));
        if (!tex) usePattern = false;
        geo.groups[gi].materialIndex = usePattern ? 0 : 1;
        var c = usePattern ? [1, 1, 1] : rgb(painted || base[g.pi] || (pn.type === 'pent' ? st.pent : st.hex));
        for (var i = g.start; i < g.start + g.count; i++) colA.setXYZ(i, c[0], c[1], c[2]);
      });
      colA.needsUpdate = true;
    }
    function pick(raycaster) { var hit = raycaster.intersectObject(mesh)[0]; return hit ? triPanel[hit.faceIndex] : -1; }
    function frontPanel(dir, type) { var best = -1, bd = -2; panels.forEach(function (p) { if (type) { if (p.type !== type) return; } var d = p.c.dot(dir); if (d > bd) { bd = d; best = p.index; } }); return best; }
    return { group: group, mesh: mesh, setState: setState, pick: pick, panels: panels, frontPanel: frontPanel };
  }

  function svgImage(engine, fam, variant, colors, seed, done) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="2048" height="1024" preserveAspectRatio="none">' + engine.renderPro(fam, variant, 300, colors, { uid: 'ball', seed: seed || 0 }) + '</svg>';
    var img = new Image(); img.onload = function () { done(img); }; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function inkFor(engine, colors) { var ink = engine.recommendLineColor(colors); return { fill: ink, stroke: ink === '#111111' ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.35)' }; }
  // decorations drawn in equirect space: band, poles, spiral
  function overlay(cx, W, H, deco, color) {
    if (!deco) return; if (deco === 'none') return;
    cx.save(); cx.fillStyle = color;
    if (deco === 'band') { cx.fillRect(0, H * 0.43, W, H * 0.14); }
    else if (deco === 'poles') { cx.fillRect(0, 0, W, H * 0.16); cx.fillRect(0, H * 0.84, W, H * 0.16); }
    else if (deco === 'spiral') { for (var k = 0; k < 3; k++) { cx.beginPath(); for (var x = 0; x <= W; x += 16) { var y = H / 2 + Math.sin((x / W) * Math.PI * 2 * 2 + k * 2.1) * H * 0.3; if (x === 0) cx.moveTo(x, y - 40); else cx.lineTo(x, y - 40); } for (var x2 = W; x2 >= 0; x2 -= 16) { var y2 = H / 2 + Math.sin((x2 / W) * Math.PI * 2 * 2 + k * 2.1) * H * 0.3; cx.lineTo(x2, y2 + 40); } cx.closePath(); cx.globalAlpha = k === 0 ? 1 : 0.55; cx.fill(); } }
    cx.restore();
  }
  function drawText(cx, text, x, y, size, ink, maxW) {
    if (!text) return; cx.font = '800 ' + size + 'px GHInter, Inter, Arial, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    var w = cx.measureText(text).width; if (maxW) if (w > maxW) { size = Math.floor(size * maxW / w); cx.font = '800 ' + size + 'px GHInter, Inter, Arial, sans-serif'; }
    cx.lineWidth = Math.max(4, size * 0.11); cx.strokeStyle = ink.stroke; cx.fillStyle = ink.fill; cx.strokeText(text, x, y); cx.fillText(text, x, y);
  }
  function drawLogo(cx, logo, x, y, size) { if (!logo) return; var r = Math.min(size / logo.width, size / logo.height); var w = logo.width * r, h = logo.height * r; cx.drawImage(logo, x - w / 2, y - h / 2, w, h); }
  // o = { fam, variant, colors, seed, label, number, logo(Image), deco, decoColor, textSize }
  function paintTexture(canvas, engine, o, done) {
    if (typeof o === 'string') { o = { fam: arguments[2], variant: arguments[3], colors: arguments[4], label: arguments[5] }; done = arguments[6]; } // v1 signature
    svgImage(engine, o.fam, o.variant, o.colors, o.seed, function (img) {
      var cx = canvas.getContext('2d'), W = canvas.width, H = canvas.height; cx.clearRect(0, 0, W, H); cx.drawImage(img, 0, 0, W, H);
      overlay(cx, W, H, o.deco, o.decoColor);
      var ink = inkFor(engine, o.colors), size = Math.round(120 * (o.textSize || 1));
      drawText(cx, o.label, W / 4, H / 2, size, ink, W * 0.36);
      if (o.logo) { drawLogo(cx, o.logo, W * 3 / 4, H / 2 - (o.number ? size * 0.7 : 0), size * 1.6); drawText(cx, o.number, W * 3 / 4, H / 2 + size * 0.9, size, ink); }
      else drawText(cx, o.number || o.label, W * 3 / 4, H / 2, o.number ? size * 1.4 : size, ink, W * 0.36);
      if (done) done();
    });
  }
  // per-panel atlas: each 256 px tile shows the pattern around that panel's position, without pole stretching
  function paintAtlas(canvas, engine, ball, o, done) {
    svgImage(engine, o.fam, o.variant, o.colors, o.seed, function (img) {
      var cx = canvas.getContext('2d'), W = img.width || 2048, H = img.height || 1024; cx.clearRect(0, 0, canvas.width, canvas.height);
      var span = PANEL_R * 2 * (2048 / (2 * Math.PI)) * (o.zoom || 1);
      ball.panels.forEach(function (p) {
        var sx = (0.5 - p.lon / (2 * Math.PI)) * 2048, sy = (0.5 - p.lat / Math.PI) * 1024;
        cx.save(); cx.beginPath(); cx.rect(p.tile.x, p.tile.y, TILE, TILE); cx.clip();
        for (var dx = -2048; dx <= 2048; dx += 2048) cx.drawImage(img, 0, 0, W, H, p.tile.x + TILE / 2 - (sx + dx) * TILE / span, p.tile.y + TILE / 2 - sy * TILE / span, 2048 * TILE / span, 1024 * TILE / span);
        cx.restore();
      });
      var ink = inkFor(engine, o.colors);
      function onTile(idx, fn) { if (idx < 0) return; var p = ball.panels[idx]; cx.save(); cx.beginPath(); cx.rect(p.tile.x, p.tile.y, TILE, TILE); cx.clip(); fn(p.tile.x + TILE / 2, p.tile.y + TILE / 2); cx.restore(); }
      var front = o.labelPanel != null ? o.labelPanel : -1, back = o.numberPanel != null ? o.numberPanel : -1;
      onTile(front, function (x, y) { drawText(cx, o.label, x, y, Math.round(54 * (o.textSize || 1)), ink, TILE * 0.86); });
      onTile(back, function (x, y) { if (o.logo) { drawLogo(cx, o.logo, x, y - (o.number ? 34 : 0), 130); drawText(cx, o.number, x, y + 70, 56, ink); } else drawText(cx, o.number, x, y, 110, ink, TILE * 0.8); });
      if (done) done();
    });
  }
  // colour schemes for flat panels: returns { index: '#hex' }
  function schemes(ball, name, colors, pent, hex, mix) {
    var out = {}, P = ball.panels;
    var sorted = colors.slice().sort(function (a, b) { return lum(a) - lum(b); });
    function lum(h) { var n = parseInt(h.slice(1), 16); return ((n >> 16) * 0.299 + ((n >> 8) % 256) * 0.587 + (n % 256) * 0.114) / 255; }
    if (name === 'mosaic') { // greedy colouring: neighbours never share a colour
      var order = P.slice().sort(function (a, b) { return b.c.y - a.c.y; });
      order.forEach(function (p, k) { var used = p.nb.map(function (i) { return out[i]; }); var pick = null; for (var j = 0; j < colors.length; j++) { var cnd = colors[(j + k) % colors.length]; if (used.indexOf(cnd) < 0) { pick = cnd; break; } } out[p.index] = pick || colors[k % colors.length]; });
    } else if (name === 'gradient') { P.forEach(function (p) { var tt = (p.c.y + 1) / 2, k = Math.min(colors.length - 1, Math.floor(tt * colors.length)); out[p.index] = p.type === 'pent' ? pent : mix(sorted[k], sorted[Math.min(colors.length - 1, k + 1)], (tt * colors.length) % 1 * 0.5); });
    } else if (name === 'half') { P.forEach(function (p) { out[p.index] = p.type === 'pent' ? pent : (p.c.x > 0 ? sorted[sorted.length - 1] : sorted[Math.floor(sorted.length / 2)]); });
    } else if (name === 'band') { P.forEach(function (p) { out[p.index] = p.type === 'pent' ? pent : (Math.abs(p.c.y) < 0.42 ? sorted[Math.floor(sorted.length / 2)] : hex); });
    } else if (name === 'star') { P.forEach(function (p) { out[p.index] = p.type === 'pent' ? sorted[0] : (p.nb.length ? (p.index % 2 ? hex : sorted[sorted.length - 2]) : hex); });
    } else { P.forEach(function (p) { out[p.index] = p.type === 'pent' ? pent : hex; }); }
    return out;
  }
  root.GFBall = { create: create, paintTexture: paintTexture, paintAtlas: paintAtlas, schemes: schemes, TILE: TILE };
})(typeof window !== 'undefined' ? window : globalThis);
