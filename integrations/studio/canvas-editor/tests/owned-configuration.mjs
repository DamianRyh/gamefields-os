import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import evidence from '../lib/vendor/owned-modular/evidence.json' with {type:'json'};
import {componentRegistry} from '../lib/component-registry.mjs';
import assert from 'node:assert/strict';
import {inspectOwnedConfiguration} from '../lib/owned-configuration.mjs';

const defaults={schema:'GF-OWNED-ASSEMBLY-1',family:'street-field',mode:'assembly',part:'sf-long',color:'#30363c',long:4,short:3,goals:2,entries:1,levels:1};
const envelope=config=>({schema:'GF-OWNED-ASSEMBLY-1',config:{...defaults,...config}});
const inspect=config=>inspectOwnedConfiguration(envelope(config));
let assemblies=0,parts=0;
function verify(result,count,family){
 assert.equal(result.schema,'GF-OWNED-INSPECTION-1');
 assert.match(result.engineRevision,/^[a-f0-9]{64}$/);
 assert.match(result.registryRevision,/^[a-f0-9]{64}$/);
 assert.equal(result.family,family);assert.equal(typeof result.label,'string');assert.ok(result.label.length);
 assert.equal(result.instances.length,count);assert.equal(new Set(result.instances.map(i=>i.id)).size,count);
 assert.equal(result.bill.manufacturingReady,false);
 assert.equal(result.bill.rows.reduce((sum,row)=>sum+row.quantity,0),count);
 for(const instance of result.instances){
  assert.deepEqual(Object.keys(instance).sort(),['articleId','id','revision','sourceRevision']);
  assert.match(instance.articleId,new RegExp('^GF-'+family+'-'));
  assert.match(instance.sourceRevision,/^[a-f0-9]{64}$/);
 }
}
for(let long=2;long<=10;long++)for(let short=2;short<=8;short++)for(let goals=0;goals<=2;goals++)for(let entries=0;entries<=2;entries++){
 const result=inspect({long,short,goals,entries});verify(result,4*(long+short),'F06');
 assert.equal(result.geometry.floor.depth,.2);assert.ok(result.geometry.referenceDimensions[0]>0);
 assemblies++;
}
for(let goals=0;goals<=2;goals++)for(let entries=0;entries<=2;entries++){
 verify(inspect({family:'octagon',part:'oct-standard',goals,entries}),16,'F07');assemblies++;
 for(let levels=1;levels<=2;levels++){
  verify(inspect({family:'circle-cage',part:'cc-standard',goals,entries,levels}),8*levels,'F05');assemblies++;
 }
}
const families={
 'street-field':['F06',['sf-long','sf-short','sf-goal','sf-entry','sf-post']],
 octagon:['F07',['oct-standard','oct-goal','oct-entry','oct-post']],
 'circle-cage':['F05',['cc-standard','cc-goal','cc-entry','cc-upper-entry']],
 p1:['F01',['k1','k2','k3','k4','s1']],o1:['F02',['po1','po2','po3']],w1:['F03',['rw1','rw2','st1','e1']]
};
for(const [family,[registryFamily,aliases]] of Object.entries(families))for(const part of aliases){
 const result=inspect({family,part,mode:'part'});verify(result,1,registryFamily);assert.equal(result.geometry.floor,null);parts++;
}
assert.equal(assemblies,594);assert.equal(parts,25);
const valid=envelope({}),before=JSON.stringify(valid);
assert.deepEqual(inspectOwnedConfiguration(JSON.stringify(valid)),inspectOwnedConfiguration(valid));
assert.equal(JSON.stringify(valid),before,'Inspection never changes the input project');
const tampered={...valid,bom:[{component:'alien',quantity:999999,source:'https://invalid.example/model.glb',family:'other'}]};
const tamperedBefore=JSON.stringify(tampered),safe=inspectOwnedConfiguration(tampered);
assert.equal(safe.ignoredInputBom,true);assert.equal(safe.instances.length,28);assert.equal(safe.bill.rows.reduce((sum,row)=>sum+row.quantity,0),28);
assert.equal(JSON.stringify(tampered),tamperedBefore);
const missing={...defaults};delete missing.long;
const badConfigs=[missing,{...defaults,schema:'other'},{...defaults,family:'toString'},{...defaults,family:'alien'},{...defaults,part:'cc-goal'},{...defaults,color:'red'},{...defaults,color:123},{...defaults,long:2.5},{...defaults,long:11},{...defaults,long:'4'},{...defaults,short:1},{...defaults,goals:3},{...defaults,entries:-1},{...defaults,levels:2},{...defaults,mode:'source'},{...defaults,url:''},{...defaults,instances:null},{...defaults,scale:0}];
for(const config of badConfigs)assert.throws(()=>inspectOwnedConfiguration({schema:'GF-OWNED-ASSEMBLY-1',config}));
for(const bad of [null,[],{},'{bad',defaults,{...valid,schema:'GF-DIGITAL-ASSEMBLY-1'},{...valid,instances:[]},{...valid,url:''},{...valid,config:null},{...valid,config:[]}])assert.throws(()=>inspectOwnedConfiguration(bad));
for(const family of ['p1','o1','w1','street15'])assert.throws(()=>inspect({family,part:({p1:'k1',o1:'po1',w1:'rw1',street15:''})[family]}),'Whole source meshes must never invent component quantities');
console.log(`PASS: ${assemblies} owned assemblies, ${parts} source-family parts, strict import boundaries, four source-only rejections, untrusted BOM ignored, immutable inputs and pinned revisions.`);

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(await readFile('lib/vendor/owned-modular/engine.mjs')),evidence.engineRevision);
assert.equal(sha(await readFile('public/catalog/product-names.json')),evidence.catalogRevision);
assert.equal(componentRegistry.revision,evidence.registryRevision);
assert.equal(evidence.checkedRuntimeAssets.length,25);
console.log('PASS: inspector evidence pins exact vendored engine, catalogue and registry.');
