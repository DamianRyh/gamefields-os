#!/usr/bin/env node
// Moves base64 fonts out of a WordPress page's HTML into separate .woff2 files.
// A font inlined as base64 is downloaded again with every page view and blocks rendering;
// as a file it is cached once and shared by every page.
//
// Usage:
//   node tools/wordpress/font-diet.mjs <page.html> <out-dir> [--url /wp-content/uploads/gamefields-fonts/]
// Input: the page's current content (WordPress: edit page → code editor, or REST content.raw).
// Output in <out-dir>: page.html (same content, fonts replaced by URLs), the .woff2 files, report.txt.
// Only @font-face sources written as data:font/woff2;base64,… are changed; every other byte stays.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const [input, outDir] = process.argv.slice(2);
const urlFlag = process.argv.indexOf('--url');
const baseUrl = (urlFlag > -1 ? process.argv[urlFlag + 1] : '/wp-content/uploads/gamefields-fonts/').replace(/\/?$/, '/');
if (!input || !outDir) {
  console.error('Użycie: node tools/wordpress/font-diet.mjs <page.html> <out-dir> [--url /wp-content/uploads/gamefields-fonts/]');
  process.exit(2);
}

const html = await readFile(input, 'utf8');
const pattern = /@font-face\s*\{([^{}]*?)url\(\s*(['"]?)data:font\/woff2;base64,([A-Za-z0-9+/=]+)\2\s*\)([^{}]*)\}/g;
const files = new Map();
let saved = 0;

const out = html.replace(pattern, (whole, before, quote, b64, after) => {
  const family = (before.match(/font-family\s*:\s*['"]?([^;'"]+)/i)?.[1] || 'font').trim().replace(/[^A-Za-z0-9-]+/g, '-');
  const weight = (before + after).match(/font-weight\s*:\s*([^;}]+)/i)?.[1]?.trim().replace(/\s+/g, '-') || 'normal';
  const hash = createHash('sha256').update(b64).digest('hex').slice(0, 10);
  const name = `${family}-${weight}-${hash}.woff2`.toLowerCase();
  files.set(name, b64);
  const replacement = `@font-face{${before}url(${baseUrl}${name}) format('woff2')${after.replace(/^\s*format\(\s*['"]woff2['"]\s*\)/, '')}}`;
  saved += whole.length - replacement.length;
  return replacement;
});

await mkdir(outDir, {recursive: true});
for (const [name, b64] of files) await writeFile(path.join(outDir, name), Buffer.from(b64, 'base64'));
await writeFile(path.join(outDir, path.basename(input)), out);

const report = [
  `Plik wejściowy: ${input} (${Math.round(html.length / 1024)} KB)`,
  `Plik wyjściowy: ${path.join(outDir, path.basename(input))} (${Math.round(out.length / 1024)} KB)`,
  `Zaoszczędzone w każdym wyświetleniu strony: ${Math.round(saved / 1024)} KB`,
  `Czcionki do wgrania do ${baseUrl}:`,
  ...[...files.keys()].map(n => `  - ${n}`),
  files.size ? '' : 'Nie znaleziono czcionek base64. Nic nie zmieniono.',
].join('\n');
await writeFile(path.join(outDir, 'report.txt'), report + '\n');
console.log(report);
