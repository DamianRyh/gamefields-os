import assert from 'node:assert/strict';
import catalog from '../public/catalog/product-names.json' with {type:'json'};
import {canonicalProjectName} from '../lib/product-names.mjs';
import {projectSchema} from '../lib/project.ts';
assert.equal(catalog.products.length,8);assert.equal(new Set(catalog.products.map(p=>p.code)).size,8);
for(const p of catalog.products){
 assert.equal(canonicalProjectName(p.legacy_name+' — projekt',p.id),p.name+' — projekt');
 assert.equal(canonicalProjectName('Boisko szkoły: '+p.legacy_name,p.id),'Boisko szkoły: '+p.legacy_name);
 assert.equal(canonicalProjectName(p.name+' — projekt',p.id),p.name+' — projekt');
}
const p={id:'GF-test',name:'Octagon — projekt',arenaModel:'octagon',type:'Nowe boisko',sport:'Piłka nożna 1×1',length:4.962,width:4.962,surface:'EPDM',base:'#236f70',zone:'#ef744e',outside:'#dde0d7',lineColor:'#ffffff',lines:false,pattern:'Organic Flow',graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[],status:'Szkic',date:'20.10.2026'};
const result=projectSchema.parse(p);assert.equal(result.name,'Panna Octa — projekt');assert.equal(result.arenaModel,'octagon');assert.equal(result.width,p.width);assert.equal(result.length,p.length);assert.equal(result.base,p.base);
console.log('PASS: eight approved names, stable codes/model IDs, legacy automatic-title migration, preserved custom titles and project geometry/colors.');
