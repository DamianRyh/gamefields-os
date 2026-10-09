import {courtArea} from "@/lib/court-geometry";
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
  const area=courtArea(p);
  const shadowIntensity=Math.max(0,Math.min(100,p.shadowIntensity??25));
  const complexity=patternComplexity(p.patternFamily||"organic-flow",p.patternVariant||1);
  const execution=patternExecutionMeta(p.patternFamily||"organic-flow",p.patternVariant||1,area);

  const surfaceCost:Record<string,number>={
   "Akryl sportowy":n("QUOTE_COST_SURFACE_ACRYLIC"),
   "EPDM":n("QUOTE_COST_SURFACE_EPDM"),
   "Sztuczna trawa 60 mm":n("QUOTE_COST_SURFACE_TURF"),
   "Moduły sportowe":n("QUOTE_COST_SURFACE_MODULES"),
   "Piasek sportowy":n("QUOTE_COST_SURFACE_EPDM")*.52,
   "Beton sportowy":n("QUOTE_COST_SURFACE_ACRYLIC")*1.38
  };
  const surfaceMarket:Record<string,number>={
   "Akryl sportowy":n("QUOTE_MARKET_SURFACE_ACRYLIC"),
   "EPDM":n("QUOTE_MARKET_SURFACE_EPDM"),
   "Sztuczna trawa 60 mm":n("QUOTE_MARKET_SURFACE_TURF"),
   "Moduły sportowe":n("QUOTE_MARKET_SURFACE_MODULES"),
   "Piasek sportowy":n("QUOTE_MARKET_SURFACE_SAND"),
   "Beton sportowy":n("QUOTE_MARKET_SURFACE_CONCRETE")
  };
  const equipmentCost:Record<string,number>={
   "Bramka":4200,"Bramka futsal":5200,"Kosz":6100,"Siatka":1800,"Siatka badminton":1300,"Słupki badmintonowe":1100,"Siatka beach":1900,"Słupki beach":1700,"Stół Teqball":10500,"Szkło padel":18500,"Słupki tenisowe":1400,"Krzesło sędziowskie":2600,"Quarter pipe":14500,"Funbox":12500,"Rail skate":4200,"Ledge":6500,"Bank":9800,"Drążki":7200,"Poręcze":5900,"Monkey bars":9800,"Box treningowy":2800,"Kółka treningowe":2200,"Ławka":1500,"Lampa":9300,"Piłkochwyt":11800,"Banda":14500,"Namiot":2800,"DJ booth":5200,"Totem":900,"Trybuna":10500
  };
  const equipmentMarket:Record<string,number>={
   "Bramka":6500,"Bramka futsal":7900,"Kosz":9000,"Siatka":3200,"Siatka badminton":2400,"Słupki badmintonowe":2100,"Siatka beach":3500,"Słupki beach":3100,"Stół Teqball":16500,"Szkło padel":29000,"Słupki tenisowe":2600,"Krzesło sędziowskie":4400,"Quarter pipe":22500,"Funbox":19500,"Rail skate":7200,"Ledge":9800,"Bank":14800,"Drążki":11200,"Poręcze":9200,"Monkey bars":15200,"Box treningowy":4900,"Kółka treningowe":3900,"Ławka":2500,"Lampa":14000,"Piłkochwyt":18000,"Banda":22000,"Namiot":4500,"DJ booth":8500,"Totem":1800,"Trybuna":16000
  };

  const paintRate=n("QUOTE_COST_PAINT_L");
  const laborRate=n("QUOTE_COST_LABOR_H");
  const designRate=n("QUOTE_COST_DESIGN_H");
  const logisticsBase=n("QUOTE_COST_LOGISTICS_BASE");
  const overheadRate=n("QUOTE_OVERHEAD_RATE");
  const riskBase=n("QUOTE_RISK_BASE");
  const marginBase=n("QUOTE_MARGIN_BASE");
  const minProject=n("QUOTE_MIN_PROJECT");

  const shadowLabor=1+shadowIntensity*.0018;
  const shadowPaint=1+shadowIntensity*.0008;
  const maskingFactor=1+(complexity-1)*.08+shadowIntensity*.0006;
  const laborHours=((execution.laborHoursMin+execution.laborHoursMax)/2)*shadowLabor*maskingFactor;
  const designHours=4+complexity*1.8+shadowIntensity*.025;
  const paintLiters=execution.paintLiters*shadowPaint;
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
   900+complexity*420+shadowIntensity*5;

  const riskRate=riskBase+(complexity-1)*.012+shadowIntensity*.00015;
  const costBasis=direct*(1+overheadRate)*(1+riskRate);
  const targetMargin=Math.min(.44,marginBase+(complexity-1)*.01+shadowIntensity*.00015);
  const marginPrice=costBasis/(1-targetMargin);

  const visualMarketFactor=1+shadowIntensity*.0012+(complexity-1)*.035;
  const marketFloor=
   area*(surfaceMarket[p.surface]||surfaceMarket["Akryl sportowy"])+
   equipmentSell+
   brandingCount*1200+
   (p.scene==="event"?18000:0)+
   execution.costMin*visualMarketFactor+
   logisticsBase;

  const priceNet=roundUp(Math.max(minProject,marginPrice,marketFloor),500);
  const priceGross=roundUp(priceNet*1.23,100);

  return json({priceNet,priceGross,currency:"PLN"});
 }catch{
  return json({error:"Quote temporarily unavailable"},503);
 }
}
