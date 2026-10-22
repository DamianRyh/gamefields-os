import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {classifyCirclePanelFace,circlePanelSides} from '../lib/circle-panel-sides.ts';
const mesh=(id,v,f)=>({id,label:id,group:'panels',artwork:true,v,f,uv:v.map(()=>[0,0])});
const box=mesh('synthetic-box',[[0,0,3],[1,0,3],[0,1,3],[0,0,2],[0,1,2],[1,0,2],[0,1,2.5],[1,1,2.5],[0,1,3.5]],[[0,1,2],[3,4,5],[6,8,7]]);
assert.deepEqual(box.f.map(f=>classifyCirclePanelFace(box,f)),['outer','inner','edge']);
// Controlled face normal with centroid on +X: normalized radial dot equals requestedDot.
function thresholdFace(requestedDot){const u=[Math.sqrt(1-requestedDot**2),-requestedDot,0],v=[0,0,-1],a=[3-(u[0]+v[0])/3,-(u[1]+v[1])/3,-(u[2]+v[2])/3];return mesh('threshold-'+requestedDot,[a,a.map((x,i)=>x+u[i]),a.map((x,i)=>x+v[i])],[[0,1,2]]);}
for(const [dot,expected] of [[-.05-1e-6,'inner'],[-.05+1e-6,'edge'],[0,'edge'],[.05-1e-6,'edge'],[.05+1e-6,'outer']]){const m=thresholdFace(dot);assert.equal(classifyCirclePanelFace(m,m.f[0]),expected,`Normalized radial deadband at ${dot}`);}
const tangent=mesh('synthetic-tangent',[[3,0,0],[3,1,0],[2,0,0]],[[0,1,2]]);
assert.equal(classifyCirclePanelFace(tangent,tangent.f[0]),'edge');
// Vertical cylinder facets around its own offset wire axis: radial-facing and tangent faces.
const cylinder=mesh('synthetic-cylinder',[],[]);for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4,k=cylinder.v.length;cylinder.v.push([3+.1*Math.cos(a),0,.1*Math.sin(a)],[3+.1*Math.cos(b),0,.1*Math.sin(b)],[3+.1*Math.cos(a),1,.1*Math.sin(a)]);cylinder.f.push([k,k+1,k+2]);}cylinder.uv=cylinder.v.map(()=>[0,0]);
const cylinderSides=cylinder.f.map(f=>classifyCirclePanelFace(cylinder,f));assert.ok(cylinderSides.includes('inner')&&cylinderSides.includes('outer'));
function verify(meshes,model){assert.equal(circlePanelSides(meshes,model,'both'),meshes);const report={};for(const side of ['inner','outer']){const result=circlePanelSides(meshes,model,side);assert.equal(new Set(result.map(m=>m.id)).size,result.length);for(const original of meshes){if(original.group!=='panels'){assert.ok(result.includes(original));continue;}const selected=result.find(m=>m.id===original.id+'--artwork-'+side),unprinted=result.find(m=>m.id===original.id+'--unprinted');assert.ok(selected&&unprinted);assert.ok(selected.id.endsWith(side));assert.ok(!unprinted.id.endsWith('inner')&&!unprinted.id.endsWith('outer'));for(const m of[selected,unprinted]){assert.equal(m.v,original.v);assert.equal(m.uv,original.uv);assert.equal(m.normals,original.normals);assert.equal(m.label,original.label);assert.equal(m.group,'panels');assert.equal(m.artwork,original.artwork);}assert.deepEqual(selected.f,original.f.filter(f=>classifyCirclePanelFace(original,f)===side));assert.deepEqual(unprinted.f,original.f.filter(f=>classifyCirclePanelFace(original,f)!==side));assert.equal(selected.f.length+unprinted.f.length,original.f.length);const occurrences=new Map();for(const face of [...selected.f,...unprinted.f])occurrences.set(face,(occurrences.get(face)||0)+1);for(const face of original.f)assert.equal(occurrences.get(face),1);}
 report[side]={meshes:result.length,selectedFaces:result.filter(m=>m.id.endsWith('--artwork-'+side)).reduce((n,m)=>n+m.f.length,0)};}return report;}
verify([box,cylinder],'circle-cage-1');
const unchanged=[box];assert.equal(circlePanelSides(unchanged,'w1','inner'),unchanged);assert.equal(circlePanelSides(unchanged,'octagon','outer'),unchanged);
assert.throws(()=>classifyCirclePanelFace(mesh('bad',[[0,0,0],[0,0,0],[0,0,0]],[[0,1,2]]),[0,1,2]),/degenerate/);
assert.throws(()=>classifyCirclePanelFace(box,[0,1,99]),/invalid triangle vertex/);
assert.throws(()=>classifyCirclePanelFace(box,[0,1]),/expected a triangle/);
const origin=mesh('origin',[[-1,0,0],[1,0,0],[0,1,0]],[[0,1,2]]);assert.throws(()=>classifyCirclePanelFace(origin,origin.f[0]),/radial origin/);
assert.throws(()=>circlePanelSides([box,{...box,id:box.id+'--artwork-inner'}],'circle-cage-1','inner'),/duplicate runtime side ID/);
const reports={};for(const model of ['circle-cage-1','circle-cage-2']){const meshes=JSON.parse(await readFile(`public/arenas/${model}.json`,'utf8')),before=JSON.stringify(meshes),counts={inner:0,outer:0,edge:0};for(const m of meshes.filter(m=>m.group==='panels'))for(const f of m.f)counts[classifyCirclePanelFace(m,f)]++;reports[model]={panels:meshes.filter(m=>m.group==='panels').length,counts,...verify(meshes,model)};assert.equal(JSON.stringify(meshes),before,'Source mutation');}
assert.deepEqual(reports['circle-cage-1'].counts,{inner:13560,outer:13568,edge:11632});
assert.deepEqual(reports['circle-cage-2'].counts,{inner:28304,outer:28312,edge:24456});
console.log('PASS Circle Cage visual panel sides',JSON.stringify(reports));
