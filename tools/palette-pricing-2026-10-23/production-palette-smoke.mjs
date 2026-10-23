import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {projectSchema} from '../../integrations/studio/canvas-editor/lib/project.ts';
import {calculateProjectQuote,parseRateCard} from '../../integrations/studio/canvas-editor/lib/quote-engine.ts';
import {patternComplexity} from '../../integrations/studio/canvas-editor/lib/pattern-library.ts';
const output=new URL('./production-palette-smoke.json',import.meta.url);
const project=projectSchema.parse({id:'PRODUCTION-COMPUTATION-SMOKE',name:'Kontrola kalkulacji roboczej',arenaModel:'octagon',length:4.962,width:4.962,sport:'Piłka nożna 1×1',surface:'Akryl sportowy',base:'#123456',zone:'#234567',outside:'#345678',lineColor:'#ffffff',lines:false,pattern:'Organic Flow',patternFamily:'organic-flow',patternVariant:1,graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[]});
const raw=await readFile(new URL('../../integrations/studio/canvas-editor/pricing/rate-card-working-colors-2026-10-23.json',import.meta.url),'utf8'),card=parseRateCard(raw);
const expected=JSON.parse(JSON.stringify(calculateProjectQuote(project,card,patternComplexity(project.patternFamily||'organic-flow',project.patternVariant||1))));
const proof={status:'failed',checkedAt:new Date().toISOString(),scope:'One stateless quote calculation only; no form, email or database save',url:'https://gamefields-studio.ryhfs90.chatgpt.site/api/quote',rateCardSha256:createHash('sha256').update(raw).digest('hex'),request:project,expected};
try{
 const response=await fetch(proof.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(project),signal:AbortSignal.timeout(30000)});
 proof.httpStatus=response.status;proof.cacheControl=response.headers.get('cache-control');proof.actual=await response.json();assert.equal(response.status,200);assert.deepEqual(proof.actual,expected,'Production response must match the full local quote exactly');assert.equal(proof.actual.workingAssumptions,true);assert.equal(proof.actual.rateVersion,'GF-WORKING-2026-10-23-v2');assert.equal(proof.actual.priceGross,null);assert.equal(proof.actual.vatRate,null);proof.status='passed';console.log(JSON.stringify({status:proof.status,httpStatus:proof.httpStatus,rateVersion:proof.actual.rateVersion,workingAssumptions:proof.actual.workingAssumptions,priceNet:proof.actual.priceNet,priceGross:proof.actual.priceGross,proof:output.pathname}));
}catch(error){proof.error=String(error);process.exitCode=1;console.error(String(error));}
finally{await mkdir(new URL('./',output),{recursive:true});await writeFile(output,JSON.stringify(proof,null,2)+'\n');}
