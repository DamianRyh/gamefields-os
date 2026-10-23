import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const commits={85:'caa36c932f55228d06174b9c4883953e0cb0c48f',87:'46dec70f4af0e0dc0ed3c2a95193a602ae5f3ff8'};
const models=['w1','o1','p1','street15','circle-cage-1','circle-cage-2','street-field','octagon'];
const scenarios=['startup-fresh-context','startup-same-context-navigation','panel-colour','panel-text','complex-project-import','complex-scene-cached-redraw'];
const cameras=['Boczny','Z góry','Z boiska'];
const labels=['A85-1','B87-1','B87-2','A85-2'],versions=[85,87,87,85];
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const equal=(a,b,message)=>assert.deepEqual(canonical(a),canonical(b),message);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const hash=h=>assert.match(h,/^[a-f0-9]{64}$/);
const key=s=>JSON.stringify([s.model,s.width,s.scenario]);
const frameKey=f=>JSON.stringify([f.model,f.width,f.camera]);
function provenance(p,version){
 assert.ok(p&&typeof p==='object','Missing bundle provenance');assert.equal(p.version,version);assert.equal(p.sourceCommit,commits[version],'Unexpected source commit');assert.match(p.nativeArchiveContentHash,/^sha256:[a-f0-9]{64}$/);hash(p.localArchiveSha256);hash(p.sharedGeometryMetadataSha256);
 assert.ok(Array.isArray(p.builtBundles)&&p.builtBundles.length,'Missing built bundle hashes');assert.equal(p.builtBundleCount,p.builtBundles.length);const paths=new Set();
 for(const value of p.builtBundles){assert.ok(typeof value.path==='string'&&value.path.startsWith('dist/'));assert.ok(!paths.has(value.path),'Duplicate bundle path');paths.add(value.path);hash(value.sha256);}
}
function validate(r,label){
 assert.equal(r.status,'passed',`${label}: incomplete or failed run`);assert.deepEqual(r.errors,[]);assert.equal(r.samples.length,480);assert.equal(r.summaries.length,96);assert.equal(r.frames.length,48);
 equal([...r.method.models].sort(),[...models].sort(),'Incomplete models');equal([...r.method.viewports].sort((a,b)=>a-b),[375,1440],'Incomplete viewports');assert.equal(r.method.repeats,5);
 equal(Object.keys(r.sources).sort(),[...models].sort(),'Incomplete geometry sources');for(const g of Object.values(r.sources)){hash(g.sourceRevision);assert.ok(g.files.length);for(const f of g.files){assert.ok(f.path);hash(f.sha256);}}
 const cells=new Map(),sampleIds=new Set();for(const s of r.samples){assert.ok(models.includes(s.model)&&[375,1440].includes(s.width)&&scenarios.includes(s.scenario));assert.ok(Number.isInteger(s.repeat)&&s.repeat>=1&&s.repeat<=5);assert.ok(Number.isFinite(s.ms)&&s.ms>=0);const id=JSON.stringify([key(s),s.repeat]);assert.ok(!sampleIds.has(id),'Duplicate raw sample');sampleIds.add(id);if(!cells.has(key(s)))cells.set(key(s),[]);cells.get(key(s)).push(s.ms);}
 assert.equal(cells.size,96);const summaries=new Set();for(const s of r.summaries){const k=key(s);assert.ok(!summaries.has(k),'Duplicate summary');summaries.add(k);const values=cells.get(k);assert.ok(values);values.sort((a,b)=>a-b);assert.equal(values.length,5);assert.equal(s.count,5);assert.equal(s.medianMs,values[2],'Summary median differs from raw samples');assert.equal(s.maxMs,values[4],'Summary max differs from raw samples');}
 const frames=new Map();for(const f of r.frames){assert.ok(models.includes(f.model)&&[375,1440].includes(f.width)&&cameras.includes(f.camera));assert.ok(Number.isInteger(f.pixelWidth)&&f.pixelWidth>0&&Number.isInteger(f.pixelHeight)&&f.pixelHeight>0);hash(f.sha256);assert.ok(!frames.has(frameKey(f)),'Duplicate frame');frames.set(frameKey(f),{pixelWidth:f.pixelWidth,pixelHeight:f.pixelHeight,sha256:f.sha256});}assert.equal(frames.size,48);
 const start=Date.parse(r.startedAt),end=Date.parse(r.finishedAt);assert.ok(Number.isFinite(start)&&Number.isFinite(end)&&end>=start,'Invalid run timestamps');
 return {cells,frames,start,end};
}
/** Strictly validates complete ABBA evidence; it does not infer significance or enforce a time SLA. */
export function analyzeReports(reports,receipts){
 assert.equal(reports.length,4,'Exactly four ABBA reports required');
 for(const version of [85,87])provenance(receipts[String(version)],version);
 const bundles=xs=>[...xs].sort((a,b)=>a.path.localeCompare(b.path));
 const checked=reports.map((r,i)=>{const parsed=validate(r,labels[i]);assert.equal(r.label,labels[i],'Incorrect ABBA label');assert.equal(r.version,versions[i],'Incorrect ABBA version');provenance(r.provenance,versions[i]);for(const field of ['sourceCommit','nativeArchiveContentHash','localArchiveSha256','sharedGeometryMetadataSha256'])equal(r.provenance[field],receipts[String(versions[i])][field],`Bundle receipt mismatch: ${labels[i]}/${field}`);equal(bundles(r.provenance.builtBundles),bundles(receipts[String(versions[i])].builtBundles),'Provenance bundle list differs');equal(bundles(r.builtBundles),bundles(r.provenance.builtBundles),'Actual bundles differ from receipt');hash(r.harnessSha256);hash(r.sharedGeometryMetadataSha256);assert.equal(r.sharedGeometryMetadataSha256,r.provenance.sharedGeometryMetadataSha256,'Actual geometry metadata differs from receipt');return parsed;});
 for(let i=1;i<4;i++){assert.ok(checked[i].start>=checked[i-1].end,'ABBA runs overlap or are out of order');equal(reports[0].runtime,reports[i].runtime,'Runtime differs');equal(reports[0].method,reports[i].method,'Method differs');equal(reports[0].sources,reports[i].sources,'Geometry sources differ');assert.equal(reports[0].harnessSha256,reports[i].harnessSha256,'Harness changed between runs');assert.equal(reports[0].sharedGeometryMetadataSha256,reports[i].sharedGeometryMetadataSha256,'Shared geometry metadata changed');}
 equal(reports[0].builtBundles,reports[3].builtBundles,'Version85 bundles changed');equal(reports[1].builtBundles,reports[2].builtBundles,'Version87 bundles changed');
 const frames=[];for(const [k,first]of checked[0].frames){for(let i=1;i<4;i++)equal(first,checked[i].frames.get(k),`Canvas mismatch: ${labels[i]}/${k}`);const [model,width,camera]=JSON.parse(k);frames.push({model,width,camera,...first,identicalAcrossFourRuns:true});}
 const cells=[];for(const [k]of checked[0].cells){const [model,width,scenario]=JSON.parse(k);const series=checked.map((r,i)=>{const values=r.cells.get(k);return {label:labels[i],version:versions[i],count:5,minMs:values[0],medianMs:values[2],maxMs:values[4],rawMs:values};});
  const a=[series[0],series[3]],b=[series[1],series[2]],range=xs=>({medianMinMs:Math.min(...xs.map(x=>x.medianMs)),medianMaxMs:Math.max(...xs.map(x=>x.medianMs)),rawMinMs:Math.min(...xs.map(x=>x.minMs)),rawMaxMs:Math.max(...xs.map(x=>x.maxMs)),medianDriftMs:xs[1].medianMs-xs[0].medianMs});
  const version85=range(a),version87=range(b);const observation=version87.medianMaxMs<version85.medianMinMs?'BOTH_87_MEDIANS_LOWER':version87.medianMinMs>version85.medianMaxMs?'BOTH_87_MEDIANS_HIGHER':'MEDIAN_RANGES_OVERLAP';
  cells.push({model,width,scenario,series,version85,version87,observation,pairs:a.flatMap(x=>b.map(y=>({baseline:x.label,candidate:y.label,medianDeltaMs:y.medianMs-x.medianMs,medianDeltaPercent:x.medianMs===0?null:(y.medianMs-x.medianMs)/x.medianMs*100,maxDeltaMs:y.maxMs-x.maxMs}))),interpretation:'Descriptive observations only; two runs of five samples per version do not establish statistical significance, p95 or a product SLA.'});
 }
 return {schemaVersion:1,status:'passed',scope:'Local sequential ABBA, fixed published85/87 bundles; draw completion only, no GPU/FPS/physical-device or production-network claim',labels,runtime:reports[0].runtime,method:reports[0].method,sources:reports[0].sources,provenance:receipts,totals:{runs:4,rawSamples:1920,cells:96,frames:48},cells,frames,observations:Object.fromEntries(['BOTH_87_MEDIANS_LOWER','BOTH_87_MEDIANS_HIGHER','MEDIAN_RANGES_OVERLAP'].map(s=>[s,cells.filter(c=>c.observation===s).length])),limitations:['All four runs must be complete and ordered A85-1,B87-1,B87-2,A85-2.','Per-version drift and sample ranges are observed variation, not a distribution estimate.','No samples or slower results are excluded.','A deterministic workload reduction does not prove a latency improvement.']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [receiptPath,...args]=process.argv.slice(2),paths=args.slice(0,4),output=resolve(args[4]??'abba-analysis.json');
 assert.ok(receiptPath&&paths.length===4,'Usage: node analyze.mjs receipts.json A85-1.json B87-1.json B87-2.json A85-2.json [output.json]');assert.ok(![receiptPath,...paths].map(p=>resolve(p)).includes(output),'Output must not overwrite an input');
 let result;try{const receiptBytes=await readFile(receiptPath),bytes=await Promise.all(paths.map(p=>readFile(p)));result=analyzeReports(bytes.map(b=>JSON.parse(b)),JSON.parse(receiptBytes));result.inputFiles={receipt:{path:receiptPath,sha256:sha(receiptBytes)},runs:paths.map((path,i)=>({label:labels[i],path,sha256:sha(bytes[i])}))};console.log('PASS ABBA: 1920 samples,96 cells,48 identical captures across4 runs');}catch(e){result={schemaVersion:1,status:'failed',errors:[String(e)]};process.exitCode=1;console.error(String(e));}await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(result,null,2)+'\n');
}
