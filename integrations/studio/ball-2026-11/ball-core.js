/* Gamefields ball core: 32-panel football (truncated icosahedron) for three.js r128+.
   GFBall.create(THREE, opts) -> { group, mesh, setState(state), pick(raycaster) -> panelIndex|-1, panels }
   state = { mode: 'full'|'mix'|'panels', pent:'#hex', hex:'#hex', paint:{index:'#hex'}, textureCanvas: HTMLCanvasElement|null }
   No double ampersands on purpose: the file is also inlined into a WordPress page. */
(function (root) {
  function create(THREE, opts) {
    opts = opts || {};
    var N = opts.detail || 10, GAP = opts.gap || 0.035;
    var t = (1 + Math.sqrt(5)) / 2;
    var IV = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(function (v) { return new THREE.Vector3(v[0], v[1], v[2]).normalize(); });
    var IF = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    function P(a, b) { return IV[a].clone().multiplyScalar(2 / 3).add(IV[b].clone().multiplyScalar(1 / 3)).normalize(); }
    var panels = [];
    IV.forEach(function (v, i) {
      var nb = [];
      IF.forEach(function (f) { var k = f.indexOf(i); if (k > -1) { nb.push(f[(k + 1) % 3]); nb.push(f[(k + 2) % 3]); } });
      nb = nb.filter(function (x, j) { return nb.indexOf(x) === j; });
      var pts = nb.map(function (j) { return P(i, j); });
      var c = v.clone(), ax = new THREE.Vector3().crossVectors(c, Math.abs(c.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize(), ay = new THREE.Vector3().crossVectors(c, ax);
      pts.sort(function (p, q) { return Math.atan2(p.dot(ay), p.dot(ax)) - Math.atan2(q.dot(ay), q.dot(ax)); });
      panels.push({ type: 'pent', c: c, pts: pts });
    });
    IF.forEach(function (f) { var a = f[0], b = f[1], cc = f[2]; var pts = [P(a, b), P(b, a), P(b, cc), P(cc, b), P(cc, a), P(a, cc)]; var c = pts.reduce(function (s, p) { return s.add(p); }, new THREE.Vector3()).normalize(); panels.push({ type: 'hex', c: c, pts: pts }); });

    var pos = [], nor = [], uv = [], col = [], groups = [];
    function sph(dir) { var u = 0.5 - Math.atan2(dir.z, dir.x) / (2 * Math.PI), v = 0.5 + Math.asin(Math.max(-1, Math.min(1, dir.y))) / Math.PI; return [u, v]; }
    function tri(a, b, c) {
      var us = [sph(a.clone().normalize()), sph(b.clone().normalize()), sph(c.clone().normalize())];
      var mx = Math.max(us[0][0], us[1][0], us[2][0]), mn = Math.min(us[0][0], us[1][0], us[2][0]);
      if (mx - mn > 0.5) us.forEach(function (x) { if (x[0] < 0.5) x[0] += 1; });
      [a, b, c].forEach(function (p, i) { pos.push(p.x, p.y, p.z); uv.push(us[i][0], us[i][1]); col.push(1, 1, 1); });
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
        for (var i2 = 0; i2 < N; i2++) for (var j2 = 0; j2 <= i2; j2++) { tri(rowsV[i2][j2], rowsV[i2 + 1][j2], rowsV[i2 + 1][j2 + 1]); if (j2 < i2) tri(rowsV[i2][j2], rowsV[i2 + 1][j2 + 1], rowsV[i2][j2 + 1]); }
      }
      groups.push({ start: start, count: pos.length / 3 - start, pi: pi });
    });
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    groups.forEach(function (g) { geo.addGroup(g.start, g.count, 0); });
    var triPanel = new Int16Array(pos.length / 9);
    groups.forEach(function (g) { for (var i = g.start / 3; i < (g.start + g.count) / 3; i++) triPanel[i] = g.pi; });

    var tex = null;
    var matPat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 22, specular: 0x1e1e1e });
    var matCol = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 22, specular: 0x1e1e1e });
    var mesh = new THREE.Mesh(geo, [matPat, matCol]);
    var group = new THREE.Group();
    group.add(mesh);
    group.add(new THREE.Mesh(new THREE.SphereGeometry(0.988, 48, 32), new THREE.MeshPhongMaterial({ color: 0x15090f, shininess: 5 })));

    // THREE.Color converts sRGB hex to the renderer's working space (linear in r152+, unchanged in r128)
    function rgb(h) { var c = new THREE.Color(String(h || '#ffffff')); return [c.r, c.g, c.b]; }
    function setState(st) {
      if (st.textureCanvas) {
        if (!tex) { tex = new THREE.CanvasTexture(st.textureCanvas); tex.wrapS = THREE.RepeatWrapping; tex.anisotropy = 4; if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace; matPat.map = tex; matPat.needsUpdate = true; }
        tex.needsUpdate = true;
      }
      var colA = geo.getAttribute('color'), paint = st.paint || {};
      groups.forEach(function (g, gi) {
        var pn = panels[g.pi], painted = paint[g.pi];
        var usePattern = painted ? false : (st.mode === 'full' ? true : (st.mode === 'mix' ? pn.type === 'hex' : false));
        if (!tex) usePattern = false;
        geo.groups[gi].materialIndex = usePattern ? 0 : 1;
        var c = usePattern ? [1, 1, 1] : rgb(painted || (pn.type === 'pent' ? st.pent : st.hex));
        for (var i = g.start; i < g.start + g.count; i++) colA.setXYZ(i, c[0], c[1], c[2]);
      });
      colA.needsUpdate = true;
    }
    function pick(raycaster) { var hit = raycaster.intersectObject(mesh)[0]; return hit ? triPanel[hit.faceIndex] : -1; }
    return { group: group, mesh: mesh, setState: setState, pick: pick, panels: panels };
  }
  // Pattern texture (equirectangular 2048 x 1024) from the Court Art Pro engine + optional label on both sides.
  function paintTexture(canvas, engine, fam, variant, colors, label, done) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="2048" height="1024" preserveAspectRatio="none">' + engine.renderPro(fam, variant, 300, colors, { uid: 'ball' }) + '</svg>';
    var img = new Image();
    img.onload = function () {
      var cx = canvas.getContext('2d'); cx.clearRect(0, 0, canvas.width, canvas.height); cx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (label) {
        var ink = engine.recommendLineColor(colors);
        cx.font = '800 120px GHInter, Inter, Arial, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.lineWidth = 14; cx.strokeStyle = ink === '#111111' ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.35)'; cx.fillStyle = ink;
        [canvas.width / 4, canvas.width * 3 / 4].forEach(function (x) { cx.strokeText(label, x, canvas.height / 2); cx.fillText(label, x, canvas.height / 2); });
      }
      if (done) done();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  root.GFBall = { create: create, paintTexture: paintTexture };
})(typeof window !== 'undefined' ? window : globalThis);
