import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {assemble} from '../lib/studio-modular-engine.mjs';
import {modularDefaults,modularGeometry} from '../lib/studio-modular.ts';
import {projectSchema} from '../lib/project.ts';
import {calculateProjectQuote} from '../lib/quote-engine.ts';
import {createSnapshot,restoreSnapshot} from '../lib/project-vault.ts';
const rotate=(i,p)=>{const c=Math.cos(i.rotationY),s=Math.sin(i.rotationY);return [c*p[0]+s*p[2]+i.position[0],p[1]+i.position[1],-s*p[0]+c*p[2]+i.position[2]]};
let cases=0;
for(const family of ['street-field','octagon','circle-cage'])for(const long of [2,4,10])for(const short of [2,3,8])for(const goals of [0,1,2])for(const entries of [0,1,2]){
 const plan=assemble({family,long,short,goals,entries});assert(plan.instances.every(i=>i.family===family&&i.scale.every(n=>n===1)));assert.equal(new Set(plan.instances.map(i=>i.id)).size,plan.instances.length);
 for(const i of plan.instances.filter(i=>['sf-goal','oct-goal'].includes(i.asset))){const mouth=rotate(i,[0,0,0]),back=rotate(i,[0,0,-.3]);assert((back[0]-mouth[0])*mouth[0]+(back[2]-mouth[2])*mouth[2]>0,'Goal depth points away from centre');}
 if(family==='octagon'){
  const posts=plan.instances.filter(i=>i.asset==='oct-post');
  for(const panel of plan.instances.filter(i=>i.asset!=='oct-post'))for(const x of [-1.0582,1.0582]){const end=rotate(panel,[x,0,-.073]);assert(Math.min(...posts.map(p=>Math.hypot(end[0]-p.position[0],end[2]-p.position[2])))<.03,'Panel mounting ends align with neighbour posts');}
 }
 cases++;
}
const project={id:'module-test',name:'Test',arenaModel:'street-field',sport:'Piłka nożna 1×1',length:6.214,width:4.648,surface:'EPDM',base:'#123456',zone:'#234567',outside:'#345678',lineColor:'#ffffff',lines:false,pattern:'Organic Flow',graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[],modular:{...modularDefaults,long:6}};
const p=projectSchema.parse(project),area=modularGeometry(p).area,q=calculateProjectQuote(p,{currency:'PLN',version:'FAKE',surfaces:{EPDM:{materialNetPerM2:10,installationNetPerM2:5}},patternNetPerM2:{1:1},arenaNet:{'street-field':100},arenaInstallationNet:{'street-field':50},equipmentNet:{},linesNet:1,brandingNetPerItem:1,designNet:1,transportNet:1,exclusions:[]},1);
assert.equal(q.area,area);assert.equal(q.priceNet,null);assert.equal(q.status,'partial');assert.equal(q.items.find(i=>i.id==='arena').totalNet,null);assert.equal(q.items.find(i=>i.id==='arena-installation').totalNet,null);
const snapshot=createSnapshot(p,'Moduły','module','2026-10-24T06:00:00Z');assert.deepEqual(restoreSnapshot(snapshot),p);assert.deepEqual(projectSchema.parse(JSON.stringify(p)&&JSON.parse(JSON.stringify(p))),p);assert.throws(()=>projectSchema.parse({...p,arenaModel:'p1'}));assert.throws(()=>projectSchema.parse({...p,modular:{...p.modular,url:'untrusted'}}));assert.throws(()=>projectSchema.parse({...p,modular:{...p.modular,long:11}}));assert.throws(()=>modularGeometry({...p,arenaModel:'p1'}));assert.throws(()=>restoreSnapshot({...snapshot,modelRevision:'0'.repeat(64)}));
const evidence=JSON.parse(await readFile('lib/studio-modular-sources.json','utf8'));for(const [name,item]of Object.entries(evidence.parts))assert.equal(createHash('sha256').update(await readFile('public/modular/assets/'+name+'.glb')).digest('hex'),item.sha256);const hash=createHash('sha256');for(const path of ['lib/studio-modular-engine.mjs','lib/vendor/owned-modular/engine.mjs','lib/studio-modular.ts','components/studio-modular-meshes.ts','components/glb-arena.ts'])hash.update(await readFile(path));hash.update(JSON.stringify(evidence.parts));assert.equal(hash.digest('hex'),evidence.revision);
console.log('PASS',cases,'layouts: outward goals, Octagon mounting alignment, single family/scale, module snapshot/JSON/revision guards, source hashes and partial quote with actual surface area.');
