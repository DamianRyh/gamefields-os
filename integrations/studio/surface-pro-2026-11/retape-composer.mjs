// Re-measures masking tape for every curated seed in POOL with the paint-plan measure (per-tile sqrt(h²+v²)),
// replacing the older step count x 0.82. Geometry, seeds and paint shares are unchanged.
//   NODE_PATH=$(npm root -g) node retape-composer.mjs
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { POOL, composeSlots } from './court-composer.mjs';
import { measureLabels } from './paint-plan.mjs';
let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }
const here = new URL('.', import.meta.url).pathname;
const LABEL = ['#000000', '#3C0000', '#003C00', '#00003C', '#3C3C00'];
const browser = await chromium.launch(); const page = await browser.newPage(); await page.setContent('<html></html>');
await page.addScriptTag({ content: `window.lab = async (svg) => { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode(); const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 800; const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0); const px = cx.getImageData(0, 0, 1200, 800).data; const ref = [[0,0,0],[60,0,0],[0,60,0],[0,0,60],[60,60,0]]; const out = new Array(960000); for (let i = 0; i < 960000; i++) { let b = 0, bd = 1e9; for (let k = 0; k < 5; k++) { const d = (px[i*4]-ref[k][0])**2 + (px[i*4+1]-ref[k][1])**2 + (px[i*4+2]-ref[k][2])**2; if (d < bd) { bd = d; b = k; } } out[i] = b; } return out; };` });
const next = {}; let n = 0, before = 0, after = 0;
for (const [fid, list] of Object.entries(POOL)) {
  next[fid] = [];
  for (const e of list) {
    const a = composeSlots(fid, e.s, 400); const svg = '<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" viewBox="0 0 600 400" width="1200" height="800">' + a.g.replace(/§(\d)/g, (_, i) => LABEL[+i]) + '</svg>';
    const lab = await page.evaluate((s) => window.lab(s), svg); const m = measureLabels(lab, 1200, 800, 5);
    let px = 0; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) px += m.edge[i][j];
    const t = Math.round(px / 80); // 1200 px = 15 m -> 80 px per metre
    before += e.m.t; after += t; n++; next[fid].push({ s: e.s, m: { ...e.m, t } });
  }
  console.log(fid, list.length);
}
await browser.close();
const file = here + 'court-composer.mjs'; const src = readFileSync(file, 'utf8');
const head = src.match(/\/\*POOL\*\/\n(\/\/[^\n]*\n)/)[1];
writeFileSync(file, src.replace(/\/\*POOL\*\/[\s\S]*?\/\*END-POOL\*\//, () => '/*POOL*/\n' + head + '// tape re-measured ' + new Date().toISOString().slice(0, 10) + ' with paint-plan measureLabels (retape-composer.mjs)\nexport const POOL = ' + JSON.stringify(next) + ';\n/*END-POOL*/'));
console.log('seeds', n, 'tape total before', before, 'after', after, 'ratio', (after / before).toFixed(3));
