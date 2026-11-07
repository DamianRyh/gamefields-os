#!/usr/bin/env node
// Weekly health check of the public site: status, console errors, phone overflow, page weight,
// oversized inline blocks (e.g. base64 fonts), contact form presence, Studio and PLAY reachability.
// Usage: node scripts/check-live-site.mjs [--base https://www.gamefields.eu] [--pages /,/konfigurator-boisk/]
// Writes outputs/site-monitor/report.md and report.json. Exit code 1 only for critical failures.
import {chromium} from 'playwright';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : process.env[`GF_${name.toUpperCase()}`] || fallback;
};
const base = arg('base', 'https://www.gamefields.eu').replace(/\/$/, '');
const pages = arg('pages', '/,/konfigurator-boisk/,/polityka-prywatnosci/').split(',').map(p => p.trim()).filter(Boolean);
const outDir = arg('out', 'outputs/site-monitor');
const INLINE_LIMIT = 100 * 1024;
const GTM_ID = arg('gtm', 'GTM-W3BD5D9P');

const results = [];
const critical = [];

async function checkPage(browser, route, width) {
  const page = await browser.newPage({viewport: {width, height: 900}});
  const errors = [];
  let bytes = 0, gtmLoads = 0;
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (/googletagmanager\.com\/gtm\.js/.test(r.url())) gtmLoads++; });
  page.on('response', async r => {
    const len = Number(r.headers()['content-length']);
    if (Number.isFinite(len)) bytes += len;
  });
  const started = Date.now();
  let status = 0, loadMs = 0;
  try {
    const res = await page.goto(base + route, {waitUntil: 'load', timeout: 60000});
    loadMs = Date.now() - started;
    status = res ? res.status() : 0;
    await page.waitForTimeout(2500);
  } catch (e) {
    errors.push(`navigation: ${e.message}`);
  }
  const facts = status ? await page.evaluate(limit => {
    const lcp = new Promise(resolve => {
      let last = 0;
      try {
        new PerformanceObserver(list => { for (const e of list.getEntries()) last = e.startTime; }).observe({type: 'largest-contentful-paint', buffered: true});
      } catch { /* unsupported */ }
      setTimeout(() => resolve(Math.round(last)), 300);
    });
    const inline = [...document.querySelectorAll('style,script:not([src])')]
      .map(el => ({tag: el.tagName.toLowerCase(), kb: Math.round(el.textContent.length / 1024)}))
      .filter(x => x.kb * 1024 > limit);
    return lcp.then(lcpMs => ({
      lcpMs,
      overflowPx: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      description: Boolean(document.querySelector('meta[name="description"]')?.content),
      contactForm: Boolean(document.querySelector('form.wpcf7-form, .wpcf7 form')),
      gtmIds: [...new Set((document.documentElement.outerHTML.match(/GTM-[A-Z0-9]{4,10}/g) || []))],
      studioLink: [...document.querySelectorAll('a[href*="konfigurator-boisk"], iframe[src*="studio"]')].length,
      htmlKb: Math.round(document.documentElement.outerHTML.length / 1024),
      inline,
    }));
  }, INLINE_LIMIT) : null;
  await page.close();
  return {route, width, status, loadMs, transferKb: Math.round(bytes / 1024), gtmLoads, errors, ...facts};
}

async function probe(url) {
  try {
    const res = await fetch(url, {redirect: 'follow'});
    return {url, status: res.status};
  } catch (e) {
    return {url, status: 0, error: e.message};
  }
}

const browser = await chromium.launch();
for (const route of pages) {
  for (const width of [390, 1440]) {
    const r = await checkPage(browser, route, width);
    results.push(r);
    if (route === '/' && r.status !== 200) critical.push(`Strona główna zwraca ${r.status} (${width} px)`);
  }
}
await browser.close();

const probes = await Promise.all([
  probe(`${base}/wp-json/`),
  probe(`${base}/play`),
  probe(`${base}/api/play/health`),
  probe(`${base}/studio`),
]);

const home = results.find(r => r.route === '/' && r.width === 390);
const lines = [
  `# Kontrola strony ${base}`,
  '',
  `Data: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
  '',
  '| Strona | Szer. | Status | Ładowanie | LCP | Transfer | HTML | Przewijanie w bok | H1 | Opis meta | Formularz | GTM | Błędy konsoli |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...results.map(r => `| ${r.route} | ${r.width} | ${r.status} | ${r.loadMs} ms | ${r.lcpMs ?? '-'} ms | ${r.transferKb} KB | ${r.htmlKb ?? '-'} KB | ${r.overflowPx ?? '-'} px | ${r.h1 ?? '-'} | ${r.description ? 'tak' : 'nie'} | ${r.contactForm ? 'tak' : 'nie'} | ${r.gtmLoads}× | ${r.errors.length} |`),
  '',
  '## Usługi',
  '',
  ...probes.map(p => `- ${p.url}: ${p.status || 'brak połączenia'}`),
  '',
  '## Uwagi',
  '',
];
for (const r of results) {
  for (const x of r.inline || []) lines.push(`- ${r.route} (${r.width} px): blok <${x.tag}> w treści ma ${x.kb} KB. Duże bloki w HTML (np. czcionka base64) spowalniają stronę.`);
  if ((r.overflowPx ?? 0) > 0) lines.push(`- ${r.route} (${r.width} px): strona przewija się w bok o ${r.overflowPx} px.`);
  if (r.status === 200) {
    if (!(r.gtmIds || []).includes(GTM_ID)) lines.push(`- ${r.route} (${r.width} px): brak kontenera ${GTM_ID} w kodzie strony.`);
    if (r.gtmLoads > 1) lines.push(`- ${r.route} (${r.width} px): GTM ładuje się ${r.gtmLoads} razy. Dwa kody GTM podwajają pomiar.`);
    const other = (r.gtmIds || []).filter(id => id !== GTM_ID);
    if (other.length) lines.push(`- ${r.route} (${r.width} px): na stronie jest też inny kontener: ${other.join(', ')}.`);
  }
  if ((r.h1 ?? 1) !== 1) lines.push(`- ${r.route} (${r.width} px): liczba nagłówków H1 = ${r.h1}.`);
  for (const e of r.errors.slice(0, 5)) lines.push(`- ${r.route} (${r.width} px): błąd: ${e.slice(0, 200)}`);
}
if (home && !home.contactForm) lines.push('- Strona główna: nie znaleziono formularza kontaktowego.');
if (critical.length) lines.push('', '## Krytyczne', '', ...critical.map(c => `- ${c}`));

await mkdir(outDir, {recursive: true});
await writeFile(path.join(outDir, 'report.md'), lines.join('\n') + '\n');
await writeFile(path.join(outDir, 'report.json'), JSON.stringify({base, results, probes, critical}, null, 2));
console.log(lines.join('\n'));
process.exit(critical.length ? 1 : 0);
