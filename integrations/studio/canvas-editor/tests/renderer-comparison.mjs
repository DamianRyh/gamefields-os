import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';

const [baselinePath,candidatePath,outputPath='outputs/renderer-baseline/comparison.json']=process.argv.slice(2);
assert.ok(baselinePath&&candidatePath,'Usage: node tests/renderer-comparison.mjs baseline.json candidate.json [output.json]');
const output=resolve(outputPath);
assert.ok(![resolve(baselinePath),resolve(candidatePath)].includes(output),'Output must not replace an input report');
const models=['w1','o1','p1','street15','circle-cage-1','circle-cage-2','street-field','octagon'];
const widths=[375,1440],cameras=['Boczny','Z góry','Z boiska'];
const scenarios=['startup-fresh-context','startup-same-context-navigation','panel-colour','panel-text','complex-project-import','complex-scene-cached-redraw'];
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const equal=(a,b,message)=>assert.deepEqual(canonical(a),canonical(b),message);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const cellKey=s=>JSON.stringify([s.model,s.width,s.scenario]);
const frameKey=s=>JSON.stringify([s.model,s.width,s.camera]);
const report={schemaVersion:1,createdAt:new Date().toISOString(),status:'failed',scope:'Like-for-like local SwiftShader draw-completion comparison; no latency SLA, p95, GPU presentation or physical-device claim',inputs:{},cells:[],frames:[],errors:[]};
function validate(r,label){
 assert.equal(r.status,'passed',`${label}: run did not pass`);assert.deepEqual(r.errors,[],`${label}: errors present`);
 equal([...r.method.models].sort(),[...models].sort(),`${label}: incomplete model set`);equal([...r.method.viewports].sort(),[...widths].sort(),`${label}: incomplete viewport set`);assert.equal(r.method.repeats,5);
 assert.equal(r.samples.length,480);assert.equal(r.summaries.length,96);assert.equal(r.frames.length,48,`${label}: missing three-camera captures`);
 equal(Object.keys(r.sources).sort(),[...models].sort(),`${label}: incomplete geometry source set`);for(const source of Object.values(r.sources)){assert.ok(source.sourceRevision&&source.files.length);for(const file of source.files){assert.ok(file.path);assert.match(file.sha256,/^[a-f0-9]{64}$/);}}
 const cells=new Map(),sampleIds=new Set();
 for(const s of r.samples){assert.ok(models.includes(s.model)&&widths.includes(s.width)&&scenarios.includes(s.scenario),`${label}: unknown sample cell`);assert.ok(Number.isInteger(s.repeat)&&s.repeat>=1&&s.repeat<=5);assert.ok(Number.isFinite(s.ms)&&s.ms>=0);const id=JSON.stringify([s.model,s.width,s.scenario,s.repeat]);assert.ok(!sampleIds.has(id),`${label}: duplicate sample`);sampleIds.add(id);const key=cellKey(s);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(s.ms);}
 assert.equal(cells.size,96);const seenSummaries=new Set();
 for(const s of r.summaries){const key=cellKey(s);assert.ok(!seenSummaries.has(key),`${label}: duplicate summary`);seenSummaries.add(key);const values=cells.get(key);assert.ok(values,`${label}: unknown summary`);values.sort((a,b)=>a-b);assert.equal(values.length,5);assert.equal(s.count,5);assert.equal(s.medianMs,values[2]);assert.equal(s.maxMs,values[4]);}
 const frames=new Map();for(const f of r.frames){assert.ok(models.includes(f.model)&&widths.includes(f.width)&&cameras.includes(f.camera));assert.ok(Number.isInteger(f.pixelWidth)&&f.pixelWidth>0&&Number.isInteger(f.pixelHeight)&&f.pixelHeight>0);assert.match(f.sha256,/^[a-f0-9]{64}$/);const key=frameKey(f);assert.ok(!frames.has(key),`${label}: duplicate frame`);frames.set(key,f);}
 assert.equal(frames.size,48);assert.ok(r.codeInputs?.baseCommit&&r.codeInputs?.sha256);for(const hash of Object.values(r.codeInputs.sha256))assert.match(hash,/^[a-f0-9]{64}$/);
 return {cells,frames};
}
try{
 const [baselineBytes,candidateBytes]=await Promise.all([readFile(baselinePath),readFile(candidatePath)]);
 const baseline=JSON.parse(baselineBytes),candidate=JSON.parse(candidateBytes);
 report.inputs={baseline:{path:baselinePath,sha256:sha(baselineBytes),codeInputs:baseline.codeInputs},candidate:{path:candidatePath,sha256:sha(candidateBytes),codeInputs:candidate.codeInputs}};
 const a=validate(baseline,'baseline'),b=validate(candidate,'candidate');
 equal(baseline.runtime,candidate.runtime,'Runtime profiles differ');equal(baseline.method,candidate.method,'Measurement methods differ');equal(baseline.sources,candidate.sources,'Geometry sources differ');
 report.runtime=baseline.runtime;report.method=baseline.method;report.sources=baseline.sources;
 for(const [key,values]of a.cells){const next=b.cells.get(key);assert.ok(next);const [model,width,scenario]=JSON.parse(key),baselineMedian=values[2],candidateMedian=next[2],baselineMax=values[4],candidateMax=next[4];report.cells.push({model,width,scenario,count:5,baselineMedianMs:baselineMedian,candidateMedianMs:candidateMedian,medianDeltaMs:candidateMedian-baselineMedian,medianDeltaPercent:baselineMedian===0?null:(candidateMedian-baselineMedian)/baselineMedian*100,baselineMaxMs:baselineMax,candidateMaxMs:candidateMax,maxDeltaMs:candidateMax-baselineMax,maxDeltaPercent:baselineMax===0?null:(candidateMax-baselineMax)/baselineMax*100});}
 for(const [key,f]of a.frames){const next=b.frames.get(key);assert.ok(next);const identical=f.pixelWidth===next.pixelWidth&&f.pixelHeight===next.pixelHeight&&f.sha256===next.sha256;report.frames.push({model:f.model,width:f.width,camera:f.camera,baseline:{pixelWidth:f.pixelWidth,pixelHeight:f.pixelHeight,sha256:f.sha256},candidate:{pixelWidth:next.pixelWidth,pixelHeight:next.pixelHeight,sha256:next.sha256},identical});}
 const mismatches=report.frames.filter(f=>!f.identical);assert.equal(mismatches.length,0,`${mismatches.length} canvas captures differ`);
 report.status='passed';console.log(`PASS renderer comparison: ${report.cells.length} cells, ${report.frames.length} identical canvas captures; latency differences are observations, not SLA failures`);
}catch(error){report.errors.push(String(error));process.exitCode=1;console.error(String(error));}
finally{await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');}
