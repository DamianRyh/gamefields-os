// Builds lib/share-media (templates + MP4 writer) for the WordPress theme homepage: one IIFE, global GFShareCore.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('wrangler/package.json'))('esbuild'); // same esbuild as build-workshop-thumbnail.mjs
import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL('../../../wordpress/theme/gamefields/assets/js/home/gf-share-core.js',import.meta.url));
await build({entryPoints:[fileURLToPath(new URL('../lib/share-media/core-entry.ts',import.meta.url))],bundle:true,format:'iife',globalName:'GFShareCore',
 minify:true,target:'es2020',outfile:out,legalComments:'none',banner:{js:'/* gf-share-core: generated from integrations/studio/canvas-editor/lib/share-media (scripts/build-share-core.mjs). Do not edit. */'}});
console.log('built',out);
