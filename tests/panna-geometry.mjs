import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const r=createRequire(import.meta.url),vr=createRequire(r.resolve('vite/package.json'));
const {build}=vr('esbuild');
const {outputFiles}=await build({stdin:{contents:`export {projectSchema} from './lib/project';export {courtArea,courtPerimeter,isRoundCourt,roundBandPosition} from './lib/court-geometry';export {sportProfiles} from './lib/sport-profiles';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'esm'});
const {projectSchema,courtArea,courtPerimeter,isRoundCourt,roundBandPosition,sportProfiles}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));
const profile=sportProfiles.find(p=>p.sport==='Piłka nożna 1×1');
const p={...profile,id:'test',name:'Panna',lines:true,pattern:'Organic Flow',graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[]};
assert.ok(projectSchema.safeParse(p).success);assert.ok(isRoundCourt(p));assert.ok(Math.abs(courtArea(p)-38.4845100065)<1e-8);assert.ok(Math.abs(courtPerimeter(p)-21.991148575)<1e-8);
assert.equal(projectSchema.safeParse({...p,width:8}).success,false);assert.equal(projectSchema.safeParse({...p,sport:'Piłka nożna 3×3'}).success,false);
const legacy={...p,length:10,width:6};delete legacy.courtShape;delete legacy.diameter;
assert.ok(projectSchema.safeParse(legacy).success);assert.equal(courtArea(legacy),60);assert.equal(isRoundCourt(legacy),false);
assert.deepEqual(projectSchema.parse(JSON.parse(JSON.stringify(p))).courtShape,'circle');
console.log('PASS: round Ø7 geometry, exact area/perimeter, incompatible input rejected, legacy rectangular JSON preserved.');

const left=roundBandPosition({target:"band-top",x:100,y:300}),right=roundBandPosition({target:"band-top",x:500,y:300});assert.ok(right.x>left.x);assert.ok(left.y<300&&right.y<300);for(const point of [left,right])assert.ok(Math.abs(Math.hypot(point.x-300,point.y-300)-322)<1e-9);
