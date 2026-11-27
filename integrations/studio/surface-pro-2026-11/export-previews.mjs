// Writes court previews (SVG with court lines) for the site pages: one per Murale preset, one per Composer preset,
// and a paint-plan drawing (pattern + 1 m grid) for /malowanie-boisk/.  node export-previews.mjs > previews.json
import { readFileSync } from 'fs';
import { PRO_PALETTES, renderPro, courtLines, recommendLineColor, composerMetrics } from './court-art-pro.mjs';
import { gridSvg } from './paint-plan.mjs';
const here = new URL('.', import.meta.url).pathname;
const pal = Object.fromEntries(PRO_PALETTES.map((p) => [p.id, p.colors]));
// one decimal is enough at card size and keeps the inline SVG small
const slim = (s) => s.replace(/(\d+\.\d)\d+/g, '$1');
const svg = (inner, h = 400) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + h + '" role="img">' + slim(inner) + '</svg>';
const card = (s) => { const c = pal[s.paletteId]; const m = composerMetrics(s.familyId, s.variant, c, { area: 150 }); return { ...s, svg: svg(renderPro(s.familyId, s.variant, 400, c, { uid: 'm' + s.id.replace(/\W/g, '') }) + courtLines(400, recommendLineColor(c))), paints: m?.colors ?? null, tape: m?.tape ?? null }; };
const murals = JSON.parse(readFileSync(here + 'signature-murals.json', 'utf8')).map(card);
const composer = [...JSON.parse(readFileSync(here + 'signature-composer-2.json', 'utf8')), ...JSON.parse(readFileSync(here + 'signature-composer.json', 'utf8'))].map(card);
const pc = pal.simultane; const ph = 400;
const plan = svg(renderPro('pro-m-landscape', 1, ph, pc, { uid: 'pl' }) + gridSvg(ph, 15, 10), ph);
process.stdout.write(JSON.stringify({ murals, composer, plan }));
