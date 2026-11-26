// Contact sheet of the curated Court Composer: 8 families x 12 variants with court lines -> composer-preview.png
//   NODE_PATH=$(npm root -g) node preview-composer.mjs [out.png] [I|II|III]  (default: both collections)
import { createRequire } from 'module';
import { PRO_PALETTES, renderPro, courtLines, recommendLineColor, composerMetrics } from './court-art-pro.mjs';
import { COMPOSER_FAMILIES } from './court-composer.mjs';
let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }
const here = new URL('.', import.meta.url).pathname; const out = process.argv[2] || here + 'composer-preview.png';
const PAL = { 'pro-k-echo': 'swiss', 'pro-k-zones': 'stijl', 'pro-k-rays': 'stella', 'pro-k-chevron': 'aicher', 'pro-k-flow': 'nightshift', 'pro-k-shards': 'gees-bend', 'pro-k-terrain': 'burle-marx', 'pro-k-pixel': 'cruz-diez',
  'pro-k-mown': 'bondy', 'pro-k-orbit': 'vasarely', 'pro-k-arcs': 'nihon', 'pro-k-argyle': 'martens', 'pro-k-plaid': 'albers', 'pro-k-steps': 'gamefields', 'pro-k-rosette': 'simultane', 'pro-k-cuts': 'hard-edge',
  'pro-m-cutouts': 'ndebele', 'pro-m-field': 'kinloch', 'pro-m-textile': 'gees-bend', 'pro-m-landscape': 'simultane', 'pro-m-flora': 'burle-marx', 'pro-m-words': 'swiss', 'pro-m-frame': 'nihon', 'pro-m-strokes': 'stella' };
const II = ['pro-k-mown', 'pro-k-orbit', 'pro-k-arcs', 'pro-k-argyle', 'pro-k-plaid', 'pro-k-steps', 'pro-k-rosette', 'pro-k-cuts']; const which = process.argv[3]; const III = (id) => id.startsWith('pro-m-');
const pal = Object.fromEntries(PRO_PALETTES.map((p) => [p.id, p.colors]));
let html = '<html><body style="margin:0;background:#15171a;font:12px system-ui;color:#ddd;padding:16px">';
for (const fam of COMPOSER_FAMILIES.filter((x) => !which || (which === 'III' ? III(x.id) : !III(x.id) && (which === 'II') === II.includes(x.id)))) {
  const c = pal[PAL[fam.id]]; html += '<div style="margin:0 0 6px;font-weight:600">' + fam.name + ' <span style="opacity:.6;font-weight:400">· paleta ' + PAL[fam.id] + '</span></div><div style="display:grid;grid-template-columns:repeat(12,150px);gap:6px;margin-bottom:14px">';
  for (let v = 1; v <= 12; v++) { const m = composerMetrics(fam.id, v, c); html += '<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="150" height="100">' + renderPro(fam.id, v, 400, c) + courtLines(400, recommendLineColor(c)) + '</svg><div style="opacity:.7">' + v + (m ? ' · ' + m.colors + ' farb · ' + m.tape + ' m' : '') + '</div></div>'; }
  html += '</div>';
}
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1890, height: 1200 }, deviceScaleFactor: 1 });
await page.setContent(html + '</body></html>'); await page.screenshot({ path: out, fullPage: true }); await browser.close(); console.log(out);
