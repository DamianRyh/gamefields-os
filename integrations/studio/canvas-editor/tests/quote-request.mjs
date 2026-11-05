import assert from 'node:assert/strict';
import {requestProjectQuote} from '../lib/quote-request.ts';
const original=globalThis.fetch;
const quote={schemaVersion:2,status:'partial',currency:'PLN',rateVersion:'TEST',priceNet:null,priceGross:null,vatRate:null,knownSubtotalNet:10,area:150,areaLabel:'Powierzchnia',items:[{id:'known',label:'Znane',quantity:1,unit:'kpl.',unitNet:10,totalNet:10},{id:'unknown',label:'Do ustalenia',quantity:1,unit:'kpl.',unitNet:null,totalNet:null}],exclusions:[],assumptions:[]};
try{
 const signal=new AbortController().signal;
 globalThis.fetch=async()=>Response.json(quote);
 assert.deepEqual(await requestProjectQuote('{}',signal),quote);
 globalThis.fetch=async()=>Response.json({...quote,assumptions:undefined});
 await assert.rejects(requestProjectQuote('{}',signal));
 globalThis.fetch=async()=>Response.json({...quote,priceNet:10});
 await assert.rejects(requestProjectQuote('{}',signal),/Inconsistent/);
 globalThis.fetch=async()=>Response.json({...quote,knownSubtotalNet:-1});
 await assert.rejects(requestProjectQuote('{}',signal));
 globalThis.fetch=async()=>new Response('',{status:503});
 await assert.rejects(requestProjectQuote('{}',signal),/unavailable/);
 // Deliberately ignore abort to verify that a stalled server/decode is still bounded.
 let late;globalThis.fetch=()=>new Promise(resolve=>late=resolve);
 await assert.rejects(requestProjectQuote('{}',signal,20),/timed out/);
 late(Response.json(quote));
 globalThis.fetch=async()=>({ok:true,json:()=>new Promise(()=>{})});
 await assert.rejects(requestProjectQuote('{}',signal,20),/timed out/);
 globalThis.fetch=()=>new Promise(()=>{});
 const cancelled=new AbortController(),pending=requestProjectQuote('{}',cancelled.signal);
 cancelled.abort();await assert.rejects(pending,/cancelled/);
 await assert.rejects(requestProjectQuote('{}',cancelled.signal),/cancelled/);
 globalThis.fetch=async()=>Response.json(quote);
 assert.deepEqual(await requestProjectQuote('{}',signal),quote,'A new attempt recovers after timeout');
 console.log('PASS: quote scope/schema, HTTP errors, stalled fetch/body deadlines, cancellation, late response and independent retry.');
}finally{globalThis.fetch=original}
