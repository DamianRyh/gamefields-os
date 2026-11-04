#!/usr/bin/env node
// Compares the production Studio source (exported from Sites) with the mirror in this repository.
// Roadmap phase 1, "Jedno źródło kodu": the mirror may only be replaced once this report is reviewed.
//
// Usage: node tools/studio/source-diff.mjs <production-source-dir> [mirror-dir]
//   mirror-dir defaults to integrations/studio/canvas-editor
// Writes outputs/studio-source-diff.md and exits 0; the report lists files only in production,
// only in the mirror, and files whose content differs (SHA-256).
import {readdir, readFile, stat, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const [prodDir, mirrorArg] = process.argv.slice(2);
const mirrorDir = mirrorArg || 'integrations/studio/canvas-editor';
if (!prodDir) {
  console.error('Użycie: node tools/studio/source-diff.mjs <katalog-źródła-produkcyjnego> [katalog-kopii]');
  process.exit(2);
}
const SKIP = new Set(['node_modules', '.next', 'dist', '.git', '.wrangler', 'outputs', '.turbo']);

async function walk(root, rel = '') {
  const out = new Map();
  for (const entry of await readdir(path.join(root, rel), {withFileTypes: true})) {
    if (SKIP.has(entry.name)) continue;
    const r = path.join(rel, entry.name);
    if (entry.isDirectory()) for (const [k, v] of await walk(root, r)) out.set(k, v);
    else if (entry.isFile()) out.set(r.split(path.sep).join('/'), createHash('sha256').update(await readFile(path.join(root, r))).digest('hex'));
  }
  return out;
}

for (const dir of [prodDir, mirrorDir]) {
  if (!(await stat(dir).catch(() => null))?.isDirectory()) { console.error(`Brak katalogu: ${dir}`); process.exit(2); }
}
const prod = await walk(prodDir), mirror = await walk(mirrorDir);
const onlyProd = [...prod.keys()].filter(k => !mirror.has(k)).sort();
const onlyMirror = [...mirror.keys()].filter(k => !prod.has(k)).sort();
const differ = [...prod.keys()].filter(k => mirror.has(k) && mirror.get(k) !== prod.get(k)).sort();
const same = [...prod.keys()].filter(k => mirror.get(k) === prod.get(k)).length;

const section = (title, list) => [`## ${title} (${list.length})`, '', ...(list.length ? list.map(f => `- ${f}`) : ['- brak']), ''];
const report = [
  '# Studio: produkcja a kopia w repozytorium',
  '',
  `Produkcja: ${prodDir} (${prod.size} plików) · Kopia: ${mirrorDir} (${mirror.size} plików) · Identyczne: ${same}`,
  '',
  ...section('Tylko w produkcji: brakuje w repo', onlyProd),
  ...section('Różna treść', differ),
  ...section('Tylko w repo: nie ma ich na produkcji', onlyMirror),
  'Następny krok: skopiuj produkcję do kopii, sprawdź `git diff`, zatwierdź jako „Studio: synchronizacja z produkcją <wersja>”.',
].join('\n');
await mkdir('outputs', {recursive: true});
await writeFile('outputs/studio-source-diff.md', report + '\n');
console.log(report);
