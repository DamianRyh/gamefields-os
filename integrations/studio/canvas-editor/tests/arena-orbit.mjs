import assert from 'node:assert/strict';
import {orbitBounds,orbitPlacement} from '../lib/arena-orbit.ts';
const bounds=orbitBounds([{v:[[-10,-1,-7],[8,3,9],[1,0,2]]}]);assert.deepEqual(bounds,[[-10,-1,-7],[8,3,9]]);
let cases=0;for(const aspect of [.5,1,1672/941,3])for(const yaw of [-3,-1,0,1,3])for(const pitch of [.12,.5,1,1.45]){
 const p=orbitPlacement(bounds,yaw,pitch,aspect);assert(p.scale>0&&Number.isFinite(p.scale));
 for(const x of [-10,8])for(const y of [-1,3])for(const z of [-7,9]){const px=x*Math.cos(yaw)-z*Math.sin(yaw),pz=x*Math.sin(yaw)+z*Math.cos(yaw),py=y*Math.cos(pitch)-pz*Math.sin(pitch);const nx=px*p.scale*2/1672+p.cx/1672*2-1,ny=py*p.scale*2/(1672/aspect)+1-p.cy/941*2;assert(Math.abs(nx)<=.780001);assert(Math.abs(ny)<=.650001);}
 cases++;
}
console.log('PASS orbit fit: '+cases+' camera/aspect combinations and all eight projected corners.');
