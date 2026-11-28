#!/usr/bin/env node
/* Product shots for the "Jeden plac. Każda gra." gallery (28.11.2026).
   Usage: node render.mjs <esbuild> <three.min.js r128>
   Renders every sport surface in three looks as a real 3D slab (three.js r128, the same as on the homepage):
   the field painted in a curated Gamefields pattern (Studio engine, court-art-pro.mjs), run-off in the palette's
   darkest colour, the sport's lines (sport-lines.js), a 20 cm concrete edge, soft daylight and a contact shadow.
   Padel is artificial turf: three turf colours, no painted pattern. Output: renders/<sport>-<n>.webp, 1800 × 1100,
   transparent background (the card colour shows through), plus renders/looks.json for build.py. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const [esbuild, threePath] = process.argv.slice(2);
const OUT = path.join(HERE, 'renders');
fs.mkdirSync(OUT, { recursive: true });

const ENGINE = path.resolve(HERE, '../../../studio/surface-pro-2026-11/court-art-pro.mjs');
const entry = path.join(HERE, '.render-entry.mjs');
fs.writeFileSync(entry, `export { PRO_PALETTES, renderPro, recommendLineColor, lightness } from '${ENGINE}';\n`);
const engine = execFileSync(esbuild, [entry, '--bundle', '--minify', '--format=iife', '--global-name=GFW']).toString();
fs.unlinkSync(entry);
const catalog = JSON.parse(fs.readFileSync(path.resolve(HERE, '../../../studio/canvas-editor/public/sport-surfaces/catalog.json'))).items;
const lib = fs.readFileSync(path.resolve(HERE, '../../../studio/canvas-editor/lib/pattern-library-pro.ts'), 'utf8');
const grab = (n) => { const a = lib.indexOf('export const ' + n); const s = lib.indexOf('=[', a) + 1; return JSON.parse(lib.slice(s, lib.indexOf('\n];', s) + 2)); };
const PRESET = Object.fromEntries(['polishSignaturePresets', 'muralSignaturePresets', 'composerSignaturePresets', 'mastersSignaturePresets'].flatMap(grab).map((p) => [p.familyId, p]));

/* three looks per sport; padel: turf colours */
const LOOKS = {
  'basketball-3x3': ['pro-p-pasiak', 'pro-k-echo', 'pro-munich'],
  'pickleball': ['pro-neoplastic', 'pro-k-rays', 'pro-m-flora'],
  'teqball': ['pro-promenade', 'pro-p-wycinanka', 'pro-k-orbit'],
  'volleyball': ['pro-m-landscape', 'pro-k-chevron', 'pro-p-kilim'],
  'tennis': ['pro-m-flora', 'pro-k-echo', 'pro-homage'],
  'basketball-full': ['pro-munich', 'pro-p-pasiak', 'pro-supergraphic'],
  'futsal': ['pro-k-zones', 'pro-garden', 'pro-p-mozaika'],
  'street-football-3x3': ['pro-ndebele', 'pro-m-cutouts', 'pro-p-neon'],
  'padel': [['#2F6DB5', '#1F4E8A', 'niebieska'], ['#2E8B57', '#1F6B42', 'zielona'], ['#C4643B', '#9C4A28', 'terakota']],
};
const sports = catalog.map((s) => ({ ...s, looks: LOOKS[s.id].map((l) => Array.isArray(l) ? { turf: l[0], zone: l[1], name: 'Trawa ' + l[2] } : { familyId: l, variant: PRESET[l].variant, paletteId: PRESET[l].paletteId, name: PRESET[l].name }) }));

const page = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}canvas{display:block}</style></head><body>
<script>${fs.readFileSync(threePath, 'utf8')}</script><script>${engine}</script>
<script>${fs.readFileSync(path.join(HERE, 'sport-lines.js'), 'utf8')}</script>
<script>
var W = 1800, H = 1100;
var T = THREE, ren = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
ren.setPixelRatio(1); ren.setSize(W, H); ren.outputEncoding = T.sRGBEncoding; ren.toneMapping = T.ACESFilmicToneMapping; ren.toneMappingExposure = 1.08;
ren.shadowMap.enabled = true; ren.shadowMap.type = T.PCFSoftShadowMap; document.body.appendChild(ren.domElement);
function grainCanvas(n, lo, hi) { var c = document.createElement('canvas'); c.width = c.height = n; var g = c.getContext('2d'), im = g.createImageData(n, n), d = im.data;
  for (var i = 0; i < d.length; i += 4) { var v = lo + Math.random() * (hi - lo); d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } g.putImageData(im, 0, 0); return c; }
function sorted(cs) { return cs.slice().sort(function (a, b) { return GFW.lightness(a) - GFW.lightness(b); }); }
window.shot = function (s, look) {
  return new Promise(function (done) {
    var f = fieldPos(s), PAL = {}; GFW.PRO_PALETTES.forEach(function (p) { PAL[p.id] = p.colors; });
    var svg, zone, lc;
    if (look.turf) { zone = look.zone; lc = '#FFFFFF';
      svg = '<rect x="' + f.x + '" y="' + f.y + '" width="' + s.fieldLength + '" height="' + s.fieldWidth + '" fill="' + look.turf + '"/>';
    } else { var cs = PAL[look.paletteId]; zone = sorted(cs)[0]; lc = GFW.recommendLineColor(cs); var h = Math.round(600 * s.fieldWidth / s.fieldLength);
      svg = '<svg x="' + f.x + '" y="' + f.y + '" width="' + s.fieldLength + '" height="' + s.fieldWidth + '" viewBox="0 0 600 ' + h + '" preserveAspectRatio="none">' + GFW.renderPro(look.familyId, look.variant, h, cs, { uid: 'r' }) + '</svg>'; }
    var full = '<svg xmlns="http://www.w3.org/2000/svg" width="' + 4096 + '" height="' + Math.round(4096 * s.width / s.length) + '" viewBox="0 0 ' + s.length + ' ' + s.width + '" preserveAspectRatio="none"><rect width="' + s.length + '" height="' + s.width + '" fill="' + zone + '"/>' + svg +
      '<path d="' + lines(s) + '" transform="translate(' + f.x + ' ' + f.y + ')" fill="none" stroke="' + lc + '" stroke-width="' + Math.max(0.09, s.length / 190) + '" stroke-linejoin="round"/></svg>';
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'); c.width = 4096; c.height = Math.round(4096 * s.width / s.length); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(24, W / H, 0.5, 600);
      scene.add(new T.HemisphereLight(0xFFFFFF, 0xC2B4A6, 0.6));
      var sun = new T.DirectionalLight(0xFFF0DC, 1.45); sun.position.set(s.length * 0.9, s.length * 0.75, s.width * 0.25); sun.castShadow = true;
      sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4; var sc = sun.shadow.camera, R = Math.max(s.length, s.width) * 1.2; sc.left = sc.bottom = -R; sc.right = sc.top = R; sc.far = s.length * 4; scene.add(sun);
      var fill = new T.DirectionalLight(0xDDE6FF, 0.35); fill.position.set(-s.length, s.length * 0.5, -s.width); scene.add(fill);
      var shadow = new T.Mesh(new T.PlaneGeometry(R * 8, R * 8), new T.ShadowMaterial({ opacity: 0.26 })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.2; shadow.receiveShadow = true; scene.add(shadow);
      var tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.anisotropy = 16;
      var grain = new T.CanvasTexture(grainCanvas(512, 100, 160)); grain.wrapS = grain.wrapT = T.RepeatWrapping; grain.repeat.set(s.length / 0.9, s.width / 0.9);
      var top = new T.MeshStandardMaterial({ map: tex, roughness: look.turf ? 0.98 : 0.8, bumpMap: grain, bumpScale: look.turf ? 0.05 : 0.018 });
      var ct = new T.CanvasTexture(grainCanvas(256, 150, 200)); ct.wrapS = ct.wrapT = T.RepeatWrapping; ct.repeat.set(8, 1);
      var side = new T.MeshStandardMaterial({ color: 0xCFC8C0, map: ct, roughness: 0.95 });
      var slab = new T.Mesh(new T.BoxGeometry(s.length, 0.2, s.width), [side, side, top, side, side, side]); slab.position.y = -0.1; slab.castShadow = slab.receiveShadow = true; scene.add(slab);
      var diag = Math.hypot(s.length, s.width), th = -0.52, ph = 1.08, r = diag * 1.36;
      cam.position.set(r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph), r * Math.sin(ph) * Math.cos(th)); cam.lookAt(0, -0.3, 0);
      ren.render(scene, cam); done(ren.domElement.toDataURL('image/png'));
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(full);
  });
};
</script></body></html>`;
fs.writeFileSync(path.join(HERE, '.render.html'), page);

const { chromium } = require('playwright');
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
await p.goto('file://' + path.join(HERE, '.render.html'));
const looks = {};
for (const s of sports) {
  looks[s.id] = [];
  for (let i = 0; i < s.looks.length; i++) {
    const data = await p.evaluate(([s, l]) => window.shot(s, l), [s, s.looks[i]]);
    const png = path.join(OUT, `${s.id}-${i + 1}.png`);
    fs.writeFileSync(png, Buffer.from(data.split(',')[1], 'base64'));
    looks[s.id].push({ ...s.looks[i], file: `gf-sport-${s.id}-${i + 1}.webp` });
    console.log(png);
  }
}
await b.close();
fs.unlinkSync(path.join(HERE, '.render.html'));
fs.writeFileSync(path.join(OUT, 'looks.json'), JSON.stringify(looks, null, 1));
