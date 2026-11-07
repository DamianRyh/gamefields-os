import type {Project} from './project';
import {z} from 'zod';
import type {ProjectQuote} from './quote-engine';

const amount=z.number().finite().nonnegative();
const quoteSchema=z.object({
 schemaVersion:z.literal(2),status:z.enum(['estimated','partial','unpriced']),currency:z.literal('PLN'),
 rateVersion:z.string().nullable(),priceNet:amount.nullable(),priceGross:amount.nullable(),
 vatRate:amount.max(1).nullable(),knownSubtotalNet:amount.nullable(),area:amount.positive(),areaLabel:z.string(),
 items:z.array(z.object({id:z.string(),label:z.string(),quantity:amount,unit:z.string(),unitNet:amount.nullable(),totalNet:amount.nullable(),note:z.string().optional()})),
 exclusions:z.array(z.string()),assumptions:z.array(z.string()),notice:z.string().optional(),
 workingAssumptions:z.boolean().optional(),constructionPrices:z.record(amount).optional(),
}).superRefine((q,ctx)=>{
 const known=q.items.filter(item=>item.totalNet!==null),missing=q.items.length-known.length;
 const status=missing?(known.length?'partial':'unpriced'):'estimated';
 if(q.status!==status||(missing>0&&(q.priceNet!==null||q.priceGross!==null)))ctx.addIssue({code:'custom',message:'Inconsistent quote scope'});
});

/** Bound the entire request, including response decoding. Cancellation never publishes a late result. */
export async function requestProjectQuote(body:string,signal:AbortSignal,timeoutMs=15000):Promise<ProjectQuote>{
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>|undefined;
 let cancel=()=>{};
 const stopped=new Promise<never>((_,reject)=>{
  cancel=()=>{controller.abort();reject(new Error('Quote cancelled'))};
  signal.addEventListener('abort',cancel,{once:true});
  timer=setTimeout(()=>{controller.abort();reject(new Error('Quote timed out'))},timeoutMs);
 });
 try{
  if(signal.aborted)throw new Error('Quote cancelled');
  const request=async()=>{
   const response=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body,cache:'no-store',signal:controller.signal});
   if(!response.ok)throw new Error('Quote unavailable');
   return quoteSchema.parse(await response.json());
  };
  return await Promise.race([request(),stopped]);
 }finally{clearTimeout(timer);signal.removeEventListener('abort',cancel)}
}

export function quoteRequestBody(p:Project):string{return JSON.stringify({...p,kit:undefined,printDesign:undefined,id:"quote",name:"Kalkulacja",date:"",status:"Szkic",lineColor:"#000000",scene:"day",patternDensity:undefined,shadowIntensity:undefined,graphicScale:100,graphicRotation:0,arenaDesign:p.arenaDesign?{...p.arenaDesign,src:p.arenaDesign.src?"data:image/png;base64,AA==":undefined,panelColor:"#000000",frameColor:"#000000",goalColor:"#000000",text:p.arenaDesign.text?"Napis":""}:undefined,objects:p.objects.filter(o=>o.kind!=="equipment").map(o=>({...o,id:"item",x:0,y:0,rotation:0,scale:100,opacity:100,color:"#000000",src:undefined,text:o.text?"Napis":undefined}))})}
