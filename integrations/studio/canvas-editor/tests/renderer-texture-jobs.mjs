import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {createDecodedImage} from '../lib/decoded-image.ts';
const source=(await readFile(new URL('../components/renderer.ts',import.meta.url),'utf8')).replace('@/lib/p1-surface',new URL('../lib/p1-surface.ts',import.meta.url).href);
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {Renderer}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const images=[];const originalImage=globalThis.Image;
globalThis.Image=class{set src(value){this.value=value;images.push(this)}};
function renderer(){const r=Object.create(Renderer.prototype);r.items=[{mesh:{id:'floor'},key:'',texture:{}}];r.textureJobs=new Map();r.pending=0;r.dead=false;r.uploads=[];r.draws=0;r.gl={activeTexture(){},bindTexture(){},pixelStorei(){},texImage2D(...args){r.uploads.push(args.at(-1).value)}};r.draw=()=>{r.draws++};return r}
try{
 const r=renderer();let secondDone=false;const a=r.texture('floor','A','same'),b=r.texture('floor','A','same').then(()=>{secondDone=true});await Promise.resolve();assert.equal(images.length,1);assert.equal(r.pending,1);assert.equal(secondDone,false);images.shift().onload();await Promise.all([a,b]);assert.equal(secondDone,true);assert.equal(r.pending,0);assert.deepEqual(r.uploads,['A']);
 const old=r.texture('floor','old','old-key'),newer=r.texture('floor','new','new-key');const oldImage=images.shift(),newImage=images.shift();newImage.onload();await newer;oldImage.onload();await old;assert.deepEqual(r.uploads,['A','new'],'Stale texture cannot overwrite newer state');assert.equal(r.pending,0);
 let produced=0;const lazy=()=>{produced++;return Promise.resolve('lazy')};const l1=r.texture('floor',lazy,'lazy-key'),l2=r.texture('floor',lazy,'lazy-key');await Promise.resolve();assert.equal(produced,1);images.shift().onload();await Promise.all([l1,l2]);assert.equal(r.pending,0);
 const f1=r.texture('floor','bad','fail-key'),f2=r.texture('floor','bad','fail-key');const both=Promise.allSettled([f1,f2]);images.shift().onerror();const rejected=await both;assert(rejected.every(p=>p.status==='rejected'));assert.equal(r.items[0].key,'');assert.equal(r.pending,0);const retry=r.texture('floor','retry','fail-key');images.shift().onload();await retry;assert.equal(r.uploads.at(-1),'retry');
 const clearedOld=r.texture('floor','clear-a','clear-key');r.clearTexture('floor');const clearedNew=r.texture('floor','clear-a','clear-key');assert.equal(images.length,2,'A cleared texture must not reuse a job that would skip upload');images.shift().onload();images.shift().onload();await Promise.all([clearedOld,clearedNew]);assert.equal(r.uploads.at(-1),'clear-a');
 const dead=r.texture('floor','dead','dead-key');r.dead=true;images.shift().onload();await dead;assert(!r.uploads.includes('dead'));assert.equal(r.pending,0);
 const shared=renderer();shared.items.push({mesh:{id:'second-panel'},key:'',texture:{}});const decode=createDecodedImage();
 const p1=shared.texture('floor','shared-png','one',decode),p2=shared.texture('second-panel','shared-png','two',decode);assert.equal(images.length,1,'Different mesh jobs share one decode');assert.equal(shared.pending,2);images.shift().onload();await Promise.all([p1,p2]);assert.deepEqual(shared.uploads,['shared-png','shared-png'],'Separate GPU uploads retained');assert.equal(shared.draws,2,'Each upload still draws');assert.equal(shared.pending,0);
 const obsolete=shared.texture('floor','obsolete','obsolete-key',decode),latest=shared.texture('floor','latest','latest-key',decode);const obsoleteImage=images.shift(),latestImage=images.shift();latestImage.onload();await latest;obsoleteImage.onload();await obsolete;assert.equal(shared.uploads.at(-1),'latest');assert(!shared.uploads.includes('obsolete'),'Shared decoder does not bypass stale-key guard');
 const bad1=shared.texture('floor','shared-bad','bad1',decode),bad2=shared.texture('second-panel','shared-bad','bad2',decode),badResults=Promise.allSettled([bad1,bad2]);assert.equal(images.length,1);images.shift().onerror();assert((await badResults).every(x=>x.status==='rejected'));assert.equal(shared.pending,0);assert(shared.items.every(x=>x.key===''));
 const recovered=shared.texture('floor','shared-bad','bad1',decode);images.shift().onload();await recovered;assert.equal(shared.uploads.at(-1),'shared-bad');
 const dead1=shared.texture('floor','shared-dead','dead1',decode),dead2=shared.texture('second-panel','shared-dead','dead2',decode);assert.equal(images.length,1);shared.dead=true;images.shift().onload();await Promise.all([dead1,dead2]);assert.equal(shared.pending,0);assert(!shared.uploads.includes('shared-dead'));
 console.log('PASS: per-item texture jobs retain default decode compatibility; generation decoder shares images across meshes without sharing GPU uploads/draws; stale/dead guards, rejection and retry retained.');
}finally{globalThis.Image=originalImage}
// Both suites stub Image; run serially before the shared global is changed again.
await import('./decoded-image.mjs');
