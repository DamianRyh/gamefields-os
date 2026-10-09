import { build } from 'esbuild';
import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist/court-objects');
const plugin = path.join(output, 'gamefields-court-objects');
await mkdir(path.join(plugin, 'dist'), { recursive: true });
const result = await build({
  stdin: {
    contents: 'import React from "react";import{createRoot}from"react-dom/client";import App from "./components/court-objects/configurator";createRoot(document.getElementById("root")).render(<App/>);',
    resolveDir: root, loader: 'tsx',
  },
  bundle: true, write: false, format: 'iife', minify: true, jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [{ name: 'wordpress-navigation', setup(builder) {
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'link', namespace: 'wordpress' }));
    builder.onLoad({ filter: /.*/, namespace: 'wordpress' }, () => ({
      contents: 'import React from "react";export default function Link({href,...props}){return React.createElement("a",{...props,href:href==="/objects"?location.pathname:href==="/"?"https://www.gamefields.eu/konfigurator-boisk/":href})}',
      resolveDir: root, loader: 'js',
    }));
  }}],
});
const css = await readFile(path.join(root, 'app/objects/objects.css'), 'utf8');
const javascript = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="description" content="Build a court for your wall. Design a collectible court-inspired object by GAMEFIELDS."><title>COURT OBJECTS — GAMEFIELDS</title><style>*,*::before,*::after{box-sizing:border-box}body{margin:0}button,input,textarea{font:inherit}a{color:inherit}button{border-radius:0}h1,h2,h3,p{margin:0}svg{vertical-align:middle}${css}</style></head><body><div id="root"></div><script>${javascript}</script></body></html>`;
await writeFile(path.join(plugin, 'dist/index.html'), html);
await writeFile(path.join(output, 'GAMEFIELDS-Court-Objects.html'), html);
await copyFile(path.join(root, 'integrations/wordpress/court-objects/gamefields-court-objects.php'), path.join(plugin, 'gamefields-court-objects.php'));
await copyFile(path.join(root, 'integrations/wordpress/court-objects/README.md'), path.join(plugin, 'README.md'));
const zip = spawnSync('zip', ['-q', '-r', 'gamefields-court-objects.zip', 'gamefields-court-objects'], { cwd: output, stdio: 'inherit' });
if (zip.error || zip.status !== 0) throw zip.error || new Error('ZIP packaging failed; install zip and retry.');
console.log(`WordPress package: ${path.join(output, 'gamefields-court-objects.zip')}`);
