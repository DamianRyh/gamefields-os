import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const parts={};
for(const name of (await readdir('public/modular/assets')).filter(n=>n.endsWith('.glb')).sort()){
 const buffer=await readFile('public/modular/assets/'+name),doc=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)));
 if(doc.nodes.some(n=>n.translation||n.rotation||n.scale||n.matrix))throw Error('Update bounds reader for transformed GLB nodes.');
 const boxes=doc.meshes.flatMap(m=>m.primitives.map(p=>doc.accessors[p.attributes.POSITION]));
 parts[name.slice(0,-4)]={min:[0,1,2].map(i=>Math.min(...boxes.map(a=>a.min[i]))),max:[0,1,2].map(i=>Math.max(...boxes.map(a=>a.max[i]))),sha256:createHash('sha256').update(buffer).digest('hex')};
}
const hash=createHash('sha256');for(const path of ['lib/studio-modular-engine.mjs','lib/vendor/owned-modular/engine.mjs','lib/studio-modular.ts','components/studio-modular-meshes.ts','components/glb-arena.ts'])hash.update(await readFile(path));hash.update(JSON.stringify(parts));
await writeFile('lib/studio-modular-sources.json',JSON.stringify({revision:hash.digest('hex'),parts},null,2)+'\n');
