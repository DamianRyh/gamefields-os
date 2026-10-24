import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sportSurfaces,selectSurface} from '../lib/sport-surfaces.ts';
import {projectSchema} from '../lib/project.ts';
import {projectDimensions} from '../lib/project-dimensions.ts';
import {calculateProjectQuote} from '../lib/quote-engine.ts';
const base={id:'SURFACE-QA',name:'Moje boisko',type:'Szkic',sport:'Piłka nożna 3×3',length:15,width:10,surface:'EPDM',base:'#6336f5',zone:'#f3e68a',outside:'#4a122b',lineColor:'#ffffff',lines:true,pattern:'Organic Flow',graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[],status:'Szkic',date:''};
assert.equal(sportSurfaces.length,8);
for(const s of sportSurfaces){
 const p={...base,...selectSurface(base,s.id)},meshes=JSON.parse(await readFile(`public/sport-surfaces/${s.id}.json`));
 assert(projectSchema.safeParse(p).success,s.id);assert.equal(projectDimensions(p).area,s.length*s.width);
 const v=meshes.flatMap(m=>m.v);for(const [axis,size]of [[0,s.length],[1,.2],[2,s.width]])assert(Math.abs(Math.max(...v.map(v=>v[axis]))-Math.min(...v.map(v=>v[axis]))-size)<1e-9);
 assert.equal(meshes.length,2);assert.equal(meshes[0].id,'floor');assert.equal(meshes[1].group,'surface-edge');
 const glb=await readFile(`public/sport-surfaces/${s.id}.glb`),doc=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());assert.equal(doc.meshes.length,1);assert.equal(doc.nodes.filter(n=>n.mesh!==undefined).length,1);assert.equal(doc.meshes[0].primitives.length,2);const bounds=doc.meshes[0].primitives.map(v=>doc.accessors[v.attributes.POSITION]);for(const [axis,size]of [[0,s.length],[1,.2],[2,s.width]])assert(Math.abs(Math.max(...bounds.map(b=>b.max[axis]))-Math.min(...bounds.map(b=>b.min[axis]))-size)<.00001,'GLB dimensions '+s.id);
 const quote=calculateProjectQuote(p,null,1);assert.equal(quote.area,s.length*s.width);assert(!quote.items.some(i=>i.id==='arena'||i.id==='arena-installation'));
 for(const invalid of [{length:p.length+1},{arenaModel:'p1'},{modular:{revision:'GF-STUDIO-MODULAR-2',long:4,short:4,goals:2,entries:1,levels:1}}])assert(!projectSchema.safeParse({...p,...invalid}).success);
 assert.deepEqual(projectSchema.parse(JSON.parse(JSON.stringify(p))),JSON.parse(JSON.stringify(p)));
 if(s.id==='street-football-3x3'){const attached={...p,arenaModel:'street15'};assert(projectSchema.safeParse(attached).success);assert.equal(calculateProjectQuote(attached,null,1).area,150);assert.notEqual(projectDimensions(attached).model.sourceRevision,projectDimensions(p).model.sourceRevision);}
}
console.log('PASS: 8 independent slabs / dimensions / GLB isolation / schema / pricing / revisions');
