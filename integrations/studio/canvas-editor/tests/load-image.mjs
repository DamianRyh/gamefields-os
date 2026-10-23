import assert from 'node:assert/strict';
import {loadImage} from '../lib/load-image.ts';
const OriginalImage=globalThis.Image,images=[];
globalThis.Image=class{set src(value){this.value=value;images.push(this);if(value==='throws')throw Error('setter failed')}};
try{
 const loaded=loadImage('ok',1000),image=images.shift();image.onload();assert.equal(await loaded,image);assert.equal(image.onload,null);assert.equal(image.onerror,null);
 const stalled=loadImage('stalled',5),pending=images.shift(),late=pending.onload;await assert.rejects(stalled,/czas/);assert.equal(pending.onload,null);late();assert.equal(pending.onload,null);
 const failed=loadImage('broken',1000);images.shift().onerror();await assert.rejects(failed,/grafiki/);
 await assert.rejects(loadImage('throws',5),/setter failed/);images.shift();
 console.log('PASS bounded image: success/error/timeout, detached callbacks and ignored late completion; synchronous setter failure.');
}finally{globalThis.Image=OriginalImage}
