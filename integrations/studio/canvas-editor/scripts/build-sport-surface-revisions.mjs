import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {arenaGeometry} from '../lib/arena-geometry-data.mjs';
const equipment=JSON.parse(fs.readFileSync('lib/sport-equipment-manifest.json'));
const c=JSON.parse(fs.readFileSync('public/sport-surfaces/catalog.json')),m=JSON.parse(fs.readFileSync('public/sport-surfaces/manifest.json'));
fs.writeFileSync('lib/sport-surface-revisions.json',JSON.stringify(Object.fromEntries(c.items.map(s=>{const asset=s.id==='teqball'?'teq-table':['basketball-3x3','basketball-full'].includes(s.id)?'basketball-hoop':null;const base=JSON.stringify(s)+m.models.find(v=>v.id===s.id).files.json+(asset?equipment.assets[asset].sha256+equipment.schema:'');return [s.id,{standalone:createHash('sha256').update(base).digest('hex'),street15:createHash('sha256').update(base+arenaGeometry.street15.sourceRevision).digest('hex')}]})),null,2)+'\n');

m.catalogHash=createHash('sha256').update(fs.readFileSync('public/sport-surfaces/catalog.json')).digest('hex');fs.writeFileSync('public/sport-surfaces/manifest.json',JSON.stringify(m,null,2)+'\n');
