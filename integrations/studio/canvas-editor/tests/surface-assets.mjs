import assert from 'node:assert/strict';
import {surfaceAssets,assetCategories,assetLayouts,assetDataUrl,placeLayout,fittedState,scaleFor,defaultAssetColors,getAsset} from '../lib/surface-assets.ts';
import {graphicSourceError} from '../lib/graphic-source-policy.ts';
import {projectSchema} from '../lib/project.ts';

assert.equal(new Set(surfaceAssets.map(a=>a.id)).size,surfaceAssets.length,'unique asset ids');
for(const c of assetCategories)assert.ok(surfaceAssets.some(a=>a.category===c.id),c.id+' has assets');
assert.ok(surfaceAssets.filter(a=>a.category!=='decor').length>=30,'at least 30 new building blocks');
for(const a of surfaceAssets){
 assert.ok(a.w>0&&a.h>0&&a.min<=Math.max(a.w,a.h)&&Math.max(a.w,a.h)<=a.max,a.id+' default size inside its range');
 const url=assetDataUrl(a,{w:a.w,h:a.h,colors:defaultAssetColors(['#EF744E','#236F70','#F2C230','#6336F5'],'#47132D',a.slots)});
 assert.equal(graphicSourceError(url),null,a.id+' passes the SVG policy');
 assert.ok(!/NaN|undefined|Infinity/.test(Buffer.from(url.split(',')[1],'base64').toString()),a.id+' finite SVG');
}
// colours contrast with the court base and do not repeat
const cols=defaultAssetColors(['#47132D','#EF744E','#F4F1EE','#FFFFFF'],'#47132D',3);assert.equal(new Set(cols).size,3);assert.ok(!cols.includes('#47132D'));
// real scale: 3 m on a 15 m court = 120 plan units = 109 % of the 110-unit image box
assert.equal(scaleFor({w:3,h:3},15),109.1);
// fitted into a small Panna court
const small=fittedState(getAsset('zone-band'),6,{length:6,width:6},['#FFFFFF']);assert.ok(Math.max(small.w,small.h)<=5.4+1e-9,'band shrunk to 90 % of a 6 m court');
// every layout stays on the court, on a 15 x 10 and on the smallest court it is offered for
for(const l of assetLayouts)for(const court of [{length:15,width:10},{length:Math.max(l.minLength,6),width:Math.max(l.minLength,6)*.66}]){
 const placed=placeLayout(l,court,a=>defaultAssetColors(['#FFFFFF','#E9C845','#286EA9','#D8F24A'],'#47132D',a.slots));assert.equal(placed.length,l.items.length,l.id);
 const upm=600/court.length,H=600*court.width/court.length;
 for(const x of placed){const turned=x.rotation%180!==0,bw=(turned?x.state.h:x.state.w)*upm/2,bh=(turned?x.state.w:x.state.h)*upm/2;assert.ok(x.x-bw>=-.5&&x.x+bw<=600.5&&x.y-bh>=-.5&&x.y+bh<=H+.5,`${l.id}/${x.asset.id} inside the court`);assert.ok(x.scale>=2&&x.scale<=1500)}
}
// project JSON keeps the asset state and validates
const a=getAsset('tr-target'),state={id:a.id,w:3,h:3,colors:['#FFFFFF','#EF744E','#D8F24A']};
const object={id:'a1',kind:'image',name:a.name,x:300,y:200,scale:scaleFor(state,15),rotation:0,opacity:100,color:'#FFFFFF',src:assetDataUrl(a,state),target:'court',asset:state};
const base={id:'p',name:'Test',type:'court',sport:'Piłka nożna 3×3',length:15,width:10,surface:'Akryl sportowy',base:'#47132D',zone:'#EF744E',outside:'#DDE0D7',lineColor:'#FFFFFF',lines:true,pattern:'x',objects:[object]};
const parsed=projectSchema.safeParse(base);
if(parsed.success)assert.deepEqual(parsed.data.objects[0].asset,state,'asset survives JSON validation');
else assert.ok(!parsed.error.issues.some(i=>String(i.path).startsWith('objects')),'object with asset is valid: '+JSON.stringify(parsed.error.issues.filter(i=>String(i.path).startsWith('objects'))));
console.log(`PASS: ${surfaceAssets.length} surface assets (${surfaceAssets.filter(a=>a.category!=='decor').length} new building blocks), SVG policy, real scale, ${assetLayouts.length} layouts inside the court, JSON schema.`);
