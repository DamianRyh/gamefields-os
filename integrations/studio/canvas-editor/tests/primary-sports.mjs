import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {primarySports,primarySport,requiredSportEquipment} from '../lib/primary-sports.ts';
import {selectSurface,sportSurfaces} from '../lib/sport-surfaces.ts';
import {calculateProjectQuote} from '../lib/quote-engine.ts';
import {projectSchema} from '../lib/project.ts';
import {projectSpecification} from '../lib/project-specification.ts';
import {loadSportEquipment} from '../components/sport-equipment-meshes.ts';
import {crewDiscipline} from '../lib/crew-discipline.ts';
const base={id:'SPORT-QA',name:'Moje boisko',type:'Szkic',sport:'Piłka nożna 3×3',length:15,width:10,surface:'EPDM',base:'#6336f5',zone:'#f3e68a',outside:'#4a122b',lineColor:'#ffffff',lines:true,pattern:'Organic Flow',graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[],status:'Szkic',date:''};
assert.equal(primarySports.length,5);
for(const [sport,id]of [['teqball','teqball'],['street-football-3x3','street-football'],['basketball-3x3','basketball-3x3'],['basketball-full','basketball']])assert.equal(primarySport({...base,...selectSurface(base,sport)}),id);
assert.equal(primarySport({...base,sport:'Piłka nożna 1×1',arenaModel:'o1'}),'panna');
assert.deepEqual(requiredSportEquipment({arenaModel:'o1'}),[]);assert.deepEqual(requiredSportEquipment({surfaceModel:'street-football-3x3',arenaModel:'street15'}),[]);
const originalFetch=globalThis.fetch;
try{
 const manifest=JSON.parse(await readFile('lib/sport-equipment-manifest.json','utf8'));
 globalThis.fetch=async url=>Response.json(JSON.parse(await readFile('public'+url,'utf8')));
 for(const [surfaceModel,quantity,asset]of [['teqball',1,'teq-table'],['basketball-3x3',1,'basketball-hoop'],['basketball-full',2,'basketball-hoop']]){
  const p=projectSchema.parse({...base,...selectSurface(base,surfaceModel)}),before=JSON.stringify(p);
  assert.equal(requiredSportEquipment(p)[0].quantity,quantity);
  const bytes=await readFile(`public/sport-equipment/${asset}.json`);assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.assets[asset].sha256);
  const meshes=await loadSportEquipment(p,new AbortController().signal);assert.equal(meshes.length,quantity*manifest.assets[asset].meshes);assert.equal(new Set(meshes.map(m=>m.id)).size,meshes.length);
  const q=calculateProjectQuote(p,null,1),item=q.items.find(i=>i.id.startsWith('equipment:'));assert.equal(item.quantity,quantity);assert.equal(item.totalNet,null);assert.notEqual(q.status,'estimated');
  const card={version:'TEST-NOT-FOR-SALE',currency:'PLN',surfaces:{},patternNetPerM2:{},arenaNet:{},equipmentNet:{Kosz:100,'Stół Teqball':200},exclusions:[]};const priced=calculateProjectQuote(p,card,1).items.find(i=>i.id.startsWith('equipment:'));assert.equal(priced.totalNet,quantity*(asset==='teq-table'?200:100));
  const spec=await projectSpecification(p);assert.equal(spec.sportEquipment.manufacturingReady,false);assert.equal(spec.sportEquipment.items[0].quantity,quantity);assert.equal(JSON.stringify(p),before);
  const v=meshes.flatMap(m=>m.v);assert(Math.max(...v.map(v=>v[1]))<=4);assert(Math.min(...v.map(v=>v[1]))>=0);
  if(surfaceModel==='basketball-3x3'){const hoop=meshes.find(m=>m.id.endsWith('basketball-rim'));assert(Math.abs((Math.max(...hoop.v.map(v=>v[2]))+Math.min(...hoop.v.map(v=>v[2])))/2+3.425)<1e-9);assert(Math.abs(Math.max(...hoop.v.map(v=>v[1]))-3.05)<1e-9)}
  if(surfaceModel==='teqball'){const top=meshes.find(m=>m.id.endsWith('teq-table-top'));assert.equal(Math.max(...top.v.map(v=>v[1])),.76);assert(Math.abs(Math.min(...top.v.map(v=>v[1]))-.53)<1e-9)}
 }
}finally{globalThis.fetch=originalFetch}
assert.equal(sportSurfaces.find(s=>s.id==='basketball-3x3').fieldOffsetY,2);
for(const [text,sport,expected]of [['','Koszykówka 3×3','basketball 3x3'],['','Piłka nożna 1×1','panna football'],['','Teqball','teqball'],['','Piłka nożna 3×3','street football'],['','Koszykówka','basketball'],['Panna','Koszykówka','panna football'],['Co z 3x3?','Koszykówka 3×3','basketball 3x3']])assert.equal(crewDiscipline(text,sport),expected);
console.log('PASS: five sports, validated Teqball, one/two hoops, source hashes, concept dimensions/placement, immutable JSON/spec, required quantities and unknown rates, correct CREW discipline.');
