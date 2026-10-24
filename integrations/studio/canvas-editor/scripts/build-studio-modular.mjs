import {build} from 'esbuild';
// Build the retained OS source with Three.js 0.180.0 available in NODE_PATH.
await build({entryPoints:['components/gamefields/owned-modular/app.mjs'],bundle:true,minify:true,format:'iife',outfile:'public/modular/app.js',nodePaths:(process.env.NODE_PATH||'').split(':').filter(Boolean)});
