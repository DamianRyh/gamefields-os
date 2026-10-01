import {projectSchema} from "@/lib/project";
import {patternComplexity,patternExecutionMeta} from "@/lib/pattern-library";

function n(name:string){
 const value=Number(process.env[name]);
 if(!Number.isFinite(value)||value<=0)throw new Error("Pricing config unavailable");
 return value;
}
function roundUp(value:number,step=500){return Math.ceil(value/step)*step}
function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store"}})}

export async function POST(request:Request){
 try{
  const body=await request.json();
  const parsed=projectSchema.safeParse(body);
  if(!parsed.success)return json({error:"Invalid project"},400);
  const p=parsed.data;
  const area=p.length*p.width;
  const creativity=Math.max(0,Math.min(100,p.creativity??45));
  const complexity=patternComplexity(p.patternFamily||"organic-flow",p.patternVariant||1);
  const execution=patternExecutionMeta(p.patternFamily||"organic-flow",p.patternVariant||1,area);

  const surfaceCost:Record<string,number>={
   "Akryl sportowy":n("QUOTE_COST_SURFACE_ACRYLIC"),
   "EPDM":n("QUOTE_COST_SURFACE_EPDM"),
   "Sztuczna trawa 60 mm":n("QUOTE_COST_SURFACE_TURF"),
   "Moduły sportowe":n("QUOTE_COST_SURFACE_MODULES")
  };
  const surfaceMarket:Record<string,number>={
   "Akryl sportowy":n("QUOTE_MARKET_SURFACE_ACRYLIC"),
   "EPDM":n("QUOTE_MARKET_SURFACE_EPDM"),
   "Sztuczna trawa 60 mm":n("QUOTE_MARKET_SURFACE_TURF"),
   "Moduły sportowe":n("QUOTE_MARKET_SURFACE_MODULES")
  };
  const equipmentCost:Record<string,number>={
   "Bramka":4200,"Kosz":6100,"Ławka":1500,"Lampa":9300,"Piłkochwyt":11800,"Banda":14500,"Namiot":2800,"DJ booth":5200,"Totem":900,"Trybuna":10500
  };
  const equipmentMarket:Record<string,number>={
   "Bramka":6500,"Kosz":9000,"Ławka":2500,"Lampa":14000,"Piłkochwyt":18000,"Banda":22000,"Namiot":4500,"DJ booth":8500,"Totem":1800,"Trybuna":16000
  };

  const paintRate=n("QUOTE_COST_PAINT_L");
  const laborRate=n("QUOTE_COST_LABOR_H");
  const designRate=n("QUOTE_COST_DESIGN_H");
  const logisticsBase=n("QUOTE_COST_LOGISTICS_BASE");
  const overheadRate=n("QUOTE_OVERHEAD_RATE");
  const riskBase=n("QUOTE_RISK_BASE");
  const marginBase=n("QUOTE_MARGIN_BASE");
  const minProject=n("QUOTE_MIN_PROJECT");

  const creativityLabor=1+creativity*.0045;
  const creativityPaint=1+creativity*.0018;
  const maskingFactor=1+(complexity-1)*.08+creativity*.0015;
  const laborHours=((execution.laborHoursMin+execution.laborHoursMax)/2)*creativityLabor*maskingFactor;
  const designHours=4+complexity*1.8+creativity*.085;
  const paintLiters=execution.paintLiters*creativityPaint;
  const equipmentInternal=p.objects.filter(o=>o.kind==="equipment").reduce((sum,o)=>sum+(equipmentCost[o.name]||1800),0);
  const equipmentSell=p.objects.filter(o=>o.kind==="equipment").reduce((sum,o)=>sum+(equipmentMarket[o.name]||2500),0);
  const brandingCount=p.objects.filter(o=>o.kind!=="equipment").length;

  const direct=
   area*(surfaceCost[p.surface]||surfaceCost["Akryl sportowy"])+
   paintLiters*paintRate+
   laborHours*laborRate+
   designHours*designRate+
   equipmentInternal+
   brandingCount*520+
   (p.scene==="event"?8500:0)+
   logisticsBase+area*3.5+
   900+complexity*420+creativity*14;

  const riskRate=riskBase+(complexity-1)*.012+creativity*.00055;
  const costBasis=direct*(1+overheadRate)*(1+riskRate);
  const targetMargin=Math.min(.46,marginBase+(complexity-1)*.01+creativity*.00075);
  const marginPrice=costBasis/(1-targetMargin);

  const creativeMarketFactor=1+creativity*.0038+(complexity-1)*.035;
  const marketFloor=
   area*(surfaceMarket[p.surface]||surfaceMarket["Akryl sportowy"])+
   equipmentSell+
   brandingCount*1200+
   (p.scene==="event"?18000:0)+
   execution.costMin*creativeMarketFactor+
   logisticsBase;

  const priceNet=roundUp(Math.max(minProject,marginPrice,marketFloor),500);
  const priceGross=roundUp(priceNet*1.23,100);

  return json({priceNet,priceGross,currency:"PLN",creativity});
 }catch{
  return json({error:"Quote temporarily unavailable"},503);
 }
}
