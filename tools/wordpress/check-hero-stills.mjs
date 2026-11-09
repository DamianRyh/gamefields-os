// Guard for the homepage hero (owner, 2026-11-09): the still shown before the 3D model must be the model-viewer render
// of the same GLB (files *-mv-1200.webp / *-mv-720.webp in hero-r3/), shown full-box, so the courts never jump to another version.
import {readFileSync,existsSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../../integrations/wordpress/',import.meta.url);
const js=readFileSync(new URL('theme/gamefields/assets/js/home/gf-home.js',root),'utf8');
const body=readFileSync(new URL('homepage/studio-2026-11/body.html',root),'utf8');
const css=readFileSync(new URL('homepage/studio-2026-11/style.css',root),'utf8');
const php=readFileSync(new URL('theme/gamefields/functions.php',root),'utf8');
const stills=[...js.matchAll(/still:\s*'([^']+)'/g)].map(m=>m[1]);
const glbs=[...js.matchAll(/glb:\s*heroAsset\('([^']+)'\)/g)].map(m=>m[1]);
assert.equal(stills.length,4,'four hero models');
assert.equal(glbs.length,4,'four hero GLB files');
for(const s of stills){
  assert.match(s,/-mv$/,`hero still ${s} must be the model-viewer render (*-mv)`);
  for(const size of ['1200','720']){const f=new URL(`theme/gamefields/assets/js/home/hero-r3/${s}-${size}.webp`,root);assert.ok(existsSync(f),`${s}-${size}.webp missing`);assert.ok(statSync(f).size>5000,`${s}-${size}.webp empty`);}
}
for(const g of glbs)assert.ok(existsSync(new URL(`theme/gamefields/assets/js/home/hero-r3/${g}`,root)),`${g} missing`);
assert.match(body,/hero-r3\/panna-play-mv-720\.webp/,'first still (phone) is the model-viewer render');
assert.match(body,/hero-r3\/panna-play-mv-1200\.webp/,'first still (desktop) is the model-viewer render');
assert.match(php,/panna-play-mv-720\.webp/,'preload (phone)');assert.match(php,/panna-play-mv-1200\.webp/,'preload (desktop)');
assert.match(css,/\.hero-3d \.still\{[^}]*inset:0[^}]*object-fit:cover/,'still fills the box like model-viewer');
assert.doesNotMatch(css,/\.hero-3d \.still\{[^}]*width:84%/,'old 84% still framing is back');
assert.match(css,/\.hero-3d picture\{[^}]*pointer-events:none/,'picture must not block dragging the 3D model');
console.log('PASS hero stills: model-viewer renders, full box, same files in page, preload and script');
