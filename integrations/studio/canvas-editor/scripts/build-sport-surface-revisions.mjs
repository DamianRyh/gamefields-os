import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {arenaGeometry} from '../lib/arena-geometry-data.mjs';
const c=JSON.parse(fs.readFileSync('public/sport-surfaces/catalog.json')),m=JSON.parse(fs.readFileSync('public/sport-surfaces/manifest.json'));
fs.writeFileSync('lib/sport-surface-revisions.json',JSON.stringify(Object.fromEntries(c.items.map(s=>{const base=JSON.stringify(s)+m.models.find(v=>v.id===s.id).files.json;return [s.id,{standalone:createHash('sha256').update(base).digest('hex'),street15:createHash('sha256').update(base+arenaGeometry.street15.sourceRevision).digest('hex')}]})),null,2)+'\n');
