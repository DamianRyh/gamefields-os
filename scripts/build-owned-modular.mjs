import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['tests/owned-modular.mjs'],{stdio:'inherit'});
import {build} from 'esbuild';
await build({entryPoints:['components/gamefields/owned-modular/app.mjs'],bundle:true,minify:true,format:'iife',outfile:'public/models/gamefields/owned-modular/app.js'});
console.log('Built source-only Gamefields modular assembly.');
