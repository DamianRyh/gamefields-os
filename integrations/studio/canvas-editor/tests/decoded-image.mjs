import assert from 'node:assert/strict';
import {createDecodedImage} from '../lib/decoded-image.ts';
const original=globalThis.Image,images=[];
globalThis.Image=class{set src(source){this.value=source;images.push(this)}};
try{
 const decode=createDecodedImage(),a=decode('exact-A'),b=decode('exact-A');assert.equal(a,b);assert.equal(images.length,1);let settled=false;void a.then(()=>{settled=true});await Promise.resolve();assert.equal(settled,false);const first=images.shift();first.onload();assert.equal(await a,first);assert.equal(await b,first);assert.equal(decode('exact-A'),a,'Successful image reused in this generation');
 const distinct=decode('exact-a');assert.notEqual(distinct,a);assert.equal(images.length,1);const second=images.shift();second.onload();assert.equal(await distinct,second,'Source comparison is exact');
 const next=createDecodedImage(),fresh=next('exact-A');assert.notEqual(fresh,a);assert.equal(images.length,1);images.shift().onload();await fresh;
 const fail=decode('broken'),failAlso=decode('broken');assert.equal(fail,failAlso);const failures=Promise.allSettled([fail,failAlso]);images.shift().onerror();assert((await failures).every(x=>x.status==='rejected'));const retry=decode('broken');assert.notEqual(retry,fail);const recovered=images.shift();recovered.onload();assert.equal(await retry,recovered);
 console.log('PASS decoded images: exact-source concurrent sharing, completed reuse, distinct sources and generation isolation, shared failure propagation and retry.');
}finally{globalThis.Image=original;}
