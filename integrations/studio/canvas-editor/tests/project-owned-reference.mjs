import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createProjectOwnedReference,verifyProjectOwnedReference} from '../lib/project-owned-reference.ts';
import {canonicalConfiguration} from '../lib/project-specification.ts';
const hash=v=>createHash('sha256').update(canonicalConfiguration(v)).digest('hex');
const copy=v=>JSON.parse(JSON.stringify(v));
const logo='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><path fill="#123456" d="M0 0h4v4z"/></svg>').toString('base64');
const project={id:'reference-test',name:'Pełny projekt Łódź',arenaModel:'street-field',length:6.214,width:4.648,sport:'Piłka nożna 1×1',surface:'EPDM',base:'#123456',zone:'#234567',outside:'#345678',lineColor:'#ffffff',lines:false,pattern:'Organic Flow',graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[{id:'logo-1',kind:'image',name:'Logo',src:logo,x:10,y:20,scale:100,rotation:0,opacity:100,color:'#ffffff',target:'court'}],arenaDesign:{panelColor:'#17654f',frameColor:'#30363c',goalColor:'#30363c',finish:'matte',text:'Pełny tekst',src:'data:image/png;base64,aGVsbG8=',side:'inner'}};
const config={schema:'GF-OWNED-ASSEMBLY-1',family:'street-field',mode:'assembly',part:'sf-long',color:'#30363c',long:4,short:3,goals:2,entries:1,levels:1};
const native={schema:'GF-OWNED-ASSEMBLY-1',config,bom:[{article:'invented',quantity:999999}]};
const beforeProject=JSON.stringify(project),beforeOS=JSON.stringify(native);
const manifest=await createProjectOwnedReference(project,native);
assert.equal(JSON.stringify(project),beforeProject);assert.equal(JSON.stringify(native),beforeOS);
assert.equal(manifest.schema,'GF-PROJECT-OWNED-REFERENCE-1');assert.equal(manifest.relationship,'USER_ASSOCIATED_SNAPSHOTS');assert.equal(manifest.geometryCorrespondence,'UNCONFIRMED');assert.equal(manifest.manufacturingReady,false);assert.equal(manifest.technicalBill.rows,null);assert.equal(manifest.pricing.status,'NOT_INCLUDED');
assert.equal(manifest.studio.project.objects[0].src,logo);assert.equal(manifest.studio.project.arenaDesign.src,project.arenaDesign.src);assert.equal(manifest.studio.project.name,project.name);
assert.equal(manifest.studio.configurationRevision,hash(manifest.studio.project));assert.equal(manifest.owned.configurationRevision,hash(manifest.owned.nativeConfiguration.config));assert.equal(manifest.owned.evidenceRevision,hash(manifest.owned.inspection));
assert.equal(manifest.owned.inspection.instances.length,28);assert.equal(manifest.owned.inspection.bill.rows.reduce((n,r)=>n+r.quantity,0),28);assert.equal(manifest.owned.inspection.ignoredInputBom,false);assert(!('bom' in manifest.owned.nativeConfiguration));
assert(Object.isFrozen(manifest)&&Object.isFrozen(manifest.studio.project.objects[0]));assert.notEqual(manifest.studio.project,project);
assert.equal((await verifyProjectOwnedReference(JSON.stringify(manifest),project)).currentProjectMatches,true);
assert.equal((await verifyProjectOwnedReference(manifest)).currentProjectMatches,null);
assert.equal((await verifyProjectOwnedReference(manifest,{...project,name:'Inny tytuł'})).currentProjectMatches,false);
assert.equal((await verifyProjectOwnedReference(manifest,{...project,base:'#654321'})).currentProjectMatches,false);
const ordered=v=>Array.isArray(v)?v.map(ordered):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,ordered(x)])):v;
assert.equal((await verifyProjectOwnedReference(ordered(manifest),ordered(project))).currentProjectMatches,true);
const repeated=await createProjectOwnedReference(ordered(project),{schema:native.schema,config:ordered(config)});assert.equal(repeated.manifestRevision,manifest.manifestRevision,'BOM and key ordering are not part of the reference');
const {createdAt,manifestRevision,...payload}=manifest;assert.equal(manifestRevision,hash(payload));
function resign(m){const {createdAt,manifestRevision,...content}=m;m.manifestRevision=hash(content);return m;}
for(const mutate of [m=>{m.alien=true},m=>{m.studio.alien=true},m=>{m.studio.project.alien=true},m=>{m.owned.inspection.alien=true},m=>{m.manufacturingReady=true},m=>{m.technicalBill.rows=[]},m=>{m.pricing.status='BINDING'},m=>{m.geometryCorrespondence='CONFIRMED'},m=>{m.studio.project.objects[0].src=logo+'x'},m=>{m.studio.modelSourceRevision='a'.repeat(64)},m=>{m.owned.engineRevision='b'.repeat(64)},m=>{m.owned.catalogRevision='b'.repeat(64)},m=>{m.owned.registryRevision='b'.repeat(64)},m=>{m.owned.inspection.instances[0].sourceRevision='c'.repeat(64)},m=>{m.owned.nativeConfiguration.config.long=5},m=>{m.createdAt='2026-invalid'},m=>{delete m.studio},m=>{m.studio.configurationRevision='0'.repeat(64)}]){const m=copy(manifest);mutate(m);await assert.rejects(()=>verifyProjectOwnedReference(resign(m)));}
const undefinedUnknown=copy(manifest);undefinedUnknown.owned.unknown=undefined;await assert.rejects(()=>verifyProjectOwnedReference(undefinedUnknown));
await assert.rejects(()=>createProjectOwnedReference({...project,arenaModel:undefined},native),/przypiętym modelem/);
await assert.rejects(()=>createProjectOwnedReference({...project,arenaModel:'octagon'},native),/różnych rodzin/);
await assert.rejects(()=>createProjectOwnedReference(project,{schema:native.schema,config:{...config,mode:'part'}}),/pojedynczego komponentu/);
for(const [model,levels]of [['circle-cage-1',1],['circle-cage-2',2]]){const p={...project,arenaModel:model},os={schema:native.schema,config:{...config,family:'circle-cage',part:'cc-standard',levels}};const m=await createProjectOwnedReference(p,os);assert.equal((await verifyProjectOwnedReference(m,p)).currentProjectMatches,true);await assert.rejects(()=>createProjectOwnedReference(p,{schema:native.schema,config:{...os.config,levels:levels===1?2:1}}),/poziomów/);}
await assert.rejects(()=>verifyProjectOwnedReference('{broken'));
await assert.rejects(()=>verifyProjectOwnedReference(' '.repeat(13_000_001)),/13 MB/);
const tooDeep='['.repeat(66)+'0'+']'.repeat(66);await assert.rejects(()=>verifyProjectOwnedReference(tooDeep),/złożony/);
const duplicate=copy(project);duplicate.objects.push(copy(duplicate.objects[0]));await assert.rejects(()=>createProjectOwnedReference(duplicate,native));
assert.equal(JSON.stringify(project),beforeProject);assert.equal(JSON.stringify(native),beforeOS);
console.log('PASS project-owned reference: immutable full snapshots, canonical project/config/evidence hashes, regenerated quantities, family/Circle-level guards, current matching, tamper/stale/unknown-field rejection and bounded JSON; no technical BOM or price mutation.');
