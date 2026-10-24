import {projectSchema} from "@/lib/project";
import {patternComplexity,patternFamilies} from "@/lib/pattern-library";
import {calculateProjectQuote,parseRateCard} from "@/lib/quote-engine";
import {salesRateCard} from "@/lib/sales-rate-card";
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:Request){
 try{
  if(Number(request.headers.get("content-length")||0)>256000)return json({error:"Project too large"},413);
  const raw=await request.text();if(raw.length>256000)return json({error:"Project too large"},413);
  let body:unknown;try{body=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
  const parsed=projectSchema.safeParse(body);if(!parsed.success)return json({error:"Invalid project"},400);
  const p=parsed.data;
  if(p.patternFamily&&!patternFamilies.some(f=>f.id===p.patternFamily))return json({error:"Unknown pattern"},400);
  const card=salesRateCard(parseRateCard(process.env.INTERNAL_COST_CARD),process.env.SALES_MARGIN);
  return json(calculateProjectQuote({...p,objects:p.objects.filter(o=>o.kind!=="equipment")},card,patternComplexity(p.patternFamily||"organic-flow",p.patternVariant||1)));
 }catch{return json({error:"Quote temporarily unavailable"},503)}
}
