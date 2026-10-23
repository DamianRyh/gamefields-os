import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {arenaGeometry} from '../lib/arena-geometry-data.mjs';
import {measureArenaGeometry} from './build-arena-geometry.mjs';
import {FAMILIES,normalize,assemble} from '../lib/vendor/owned-modular/engine.mjs';
import {componentRegistry} from '../lib/component-registry.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const args=process.argv.slice(2),at=args.indexOf('--os-root');
if(args.length&&!(args.length===2&&args[0]==='--os-root'&&args[1]))throw Error('Usage: node scripts/audit-studio-owned-geometry.mjs [--os-root PATH]');
const osRoot=at>=0?resolve(args[at+1]):null;
const sha=b=>createHash('sha256').update(b).digest('hex'),round=n=>Math.round(n*1e6)/1e6;
const evidence=JSON.parse(await readFile(resolve(root,'lib/vendor/owned-modular/evidence.json'),'utf8'));
const current=await measureArenaGeometry();
assert.deepEqual(current,arenaGeometry,'Current Studio assets differ from pinned arena geometry; regenerate only after review');
const engineSha=sha(await readFile(resolve(root,'lib/vendor/owned-modular/engine.mjs')));
assert.equal(engineSha,evidence.engineRevision,'Pinned engine SHA mismatch');
assert.equal(sha(await readFile(resolve(root,'public/catalog/product-names.json'))),evidence.catalogRevision,'Pinned catalog SHA mismatch');
assert.equal(componentRegistry.revision,evidence.registryRevision,'Registry revision mismatch');
const checkedAssets=[];
for(const item of evidence.checkedRuntimeAssets){
 let actualSha256=null,status='NOT_AVAILABLE_LOCALLY';
 if(osRoot){try{actualSha256=sha(await readFile(resolve(osRoot,item.runtimePath)));status=actualSha256===item.sourceRevision?'MATCH':'MISMATCH'}catch(e){if(e.code!=='ENOENT')throw e}}
 checkedAssets.push({family:item.family,alias:item.alias,path:item.runtimePath,pinnedSha256:item.sourceRevision,actualSha256,status});
 if(status==='MISMATCH')throw Error('OS runtime asset SHA mismatch: '+item.runtimePath);
}
let sourceEngineStatus='NOT_AVAILABLE_LOCALLY';
if(osRoot){try{const actual=sha(await readFile(resolve(osRoot,evidence.sourcePath)));assert.equal(actual,engineSha,'OS source engine differs from pinned copy');sourceEngineStatus='MATCH'}catch(e){if(e.code!=='ENOENT')throw e}}
const map={w1:'w1',o1:'o1',p1:'p1',street15:'street15','circle-cage-1':'circle-cage','circle-cage-2':'circle-cage','street-field':'street-field',octagon:'octagon'};
const inventory=[];
for(const [id,g]of Object.entries(arenaGeometry)){
 const family=map[id],f=FAMILIES[family],config=normalize({family,levels:id==='circle-cage-2'?2:1}),supported=f.kind!=='source';
 const plan=supported?assemble(config):null,floor=plan?.floor??null;
 // Reference dimensions are authored engine metadata, NOT transformed mesh bounds.
 const floorBounds=floor?.kind==='rectangle'?{x:floor.x,z:floor.z,y:floor.depth}:floor?.kind==='circle'?{x:2*floor.radius,z:2*floor.radius,y:floor.depth}:null;
 const floorArea=floor?.kind==='rectangle'?floor.x*floor.z:floor?.kind==='circle'?Math.PI*floor.radius**2:null;
 const delta=floorBounds?Object.fromEntries(['x','z','y'].map(k=>[k,round(floorBounds[k]-g.surfaceBounds[k])])):null;
 inventory.push({id,studio:{sourceRevision:g.sourceRevision,sourceFiles:g.sourceFiles.map(file=>({...file,actualSha256:file.sha256,status:'MATCH'})),constructionBoundsMetres:g.constructionBounds,surfaceBoundsMetres:g.surfaceBounds,topTriangleAreaSquareMetres:g.area},os:{family,kind:f.kind,defaultNormalizedConfig:config,assemblyAvailability:supported?'SUPPORTED_DIGITAL_ASSEMBLY':'SOURCE_ONLY_NO_CONFIRMED_ASSEMBLY',referenceDimensionsMetres:plan?.dimensions??null,floorDescriptor:floor,floorBoundsMetres:floorBounds?Object.fromEntries(Object.entries(floorBounds).map(([k,v])=>[k,round(v)])):null,floorAnalyticAreaSquareMetres:floorArea===null?null:round(floorArea),floorBoundsMinusStudioSurfaceBoundsMetres:delta,floorAreaMinusStudioTopTriangleAreaSquareMetres:floorArea===null?null:round(floorArea-g.area),instanceCount:plan?.instances.length??null,transformedAssemblyMeshBoundsMetres:null},geometryCorrespondence:'UNCONFIRMED',manufacturingApproved:false,notes:supported?(floor?.kind==='octagon'?['Octagon floor descriptor supplies radius, not a pinned floor mesh or its orientation. Floor bounds and area remain null.']:['OS reference dimensions, floor dimensions and Studio mesh bounds have different meanings. Numerical equality does not prove correspondence.']):['OS exposes a whole source model; default assembly in the inspector is unavailable. No inferred component quantities.']});
}
const report={schema:'GF-STUDIO-OWNED-GEOMETRY-GAPS-1',auditDate:'2026-10-23',scope:'EVIDENCE_ONLY_NO_GEOMETRY_EQUIVALENCE',geometryCorrespondence:'UNCONFIRMED',manufacturingApproved:false,units:{length:'metres',area:'square metres'},engine:{path:'lib/vendor/owned-modular/engine.mjs',sha256:engineSha,pinnedStatus:'MATCH',sourceEngineStatus,catalogRevision:evidence.catalogRevision,registryRevision:evidence.registryRevision,originalEvidenceDate:evidence.verifiedAt},osRuntimeAssets:checkedAssets,inventory,blockingData:['Approved transform and instance-to-Studio-mesh mapping for each of the eight exact model revisions.','Verified assembly component placements, orientations, joining interfaces and permitted module pitches; bounding boxes are insufficient.','Source-only family instance decomposition and source assets, including Street Arena 15 with no registered parts.','Explicit surface, playing-field, construction and clearance outlines; octagon OS floor mesh/orientation is not pinned here.','Approved article/connection/fastener/anchor quantities, installation and foundation scope, tolerances and manufacturing revision sign-off.']};
const path=resolve(root,'docs/studio-owned-geometry-gaps-2026-10-23.json');
await writeFile(path,JSON.stringify(report,null,2)+'\n');
console.log(`PASS evidence inventory: ${inventory.length} Studio revisions; ${checkedAssets.filter(x=>x.status==='MATCH').length}/${checkedAssets.length} OS runtime assets verified locally. Geometry correspondence UNCONFIRMED; manufacturingApproved false.`);
