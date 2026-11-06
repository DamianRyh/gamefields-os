import {z} from "zod";

/* Sublimated kit designed next to the court: same Signature patterns, names, numbers and a team roster.
   Stored as Project.kit; unpriced until the owner supplies a rate card. */
export const KIT_REVISION="GF-STUDIO-KIT-1" as const;

export const kitPatterns=["blobs","halves","camo","contour","gradient","waves","stripes","solid"] as const;
export type KitPattern=typeof kitPatterns[number];

export type KitPreset={id:string;name:string;pattern:KitPattern;base:string;accent:string;detail:string;text:string;family:string;palette:string;variant:number};

/* family/palette/variant follow the Signature surface projects (surface-projects/catalogue.json) */
export const kitPresets:KitPreset[]=[
 {id:"city-fluid",name:"City Fluid",pattern:"blobs",base:"#c4362f",accent:"#eddecc",detail:"#9a2d2b",text:"#ffffff",family:"organic-flow",palette:"warsaw",variant:6},
 {id:"club-heritage",name:"Club Heritage",pattern:"halves",base:"#1e2f56",accent:"#e4d775",detail:"#45549d",text:"#ffffff",family:"bauhaus",palette:"club",variant:4},
 {id:"urban-camo",name:"Urban Camo",pattern:"camo",base:"#131818",accent:"#cde499",detail:"#4e544a",text:"#cde499",family:"court-camo",palette:"berlin",variant:7},
 {id:"metro-lines",name:"Metro Lines",pattern:"contour",base:"#4d6beb",accent:"#d4d8eb",detail:"#3457dd",text:"#ffffff",family:"contour",palette:"tokyo",variant:10},
 {id:"night-signal",name:"Night Signal",pattern:"gradient",base:"#3b1e73",accent:"#b64896",detail:"#7e3cb6",text:"#ffffff",family:"neon",palette:"night",variant:11},
 {id:"earth-motion",name:"Earth Motion",pattern:"waves",base:"#e1cba9",accent:"#855542",detail:"#b08a68",text:"#47132d",family:"ribbons",palette:"earth",variant:3},
 {id:"play-system",name:"Play System",pattern:"stripes",base:"#8fafcf",accent:"#ffffff",detail:"#c0d5cc",text:"#47132d",family:"kids",palette:"pastel",variant:8},
 {id:"riviera-court",name:"Riviera Court",pattern:"waves",base:"#16404b",accent:"#a9ceb9",detail:"#6c938b",text:"#ffffff",family:"soft-blobs",palette:"lagoon",variant:9}
];

export const kitAdultSizes=["XS","S","M","L","XL","XXL","3XL"] as const;
export const kitKidSizes=["116","128","140","152","164"] as const;
const allSizes=[...kitAdultSizes,...kitKidSizes] as const;

export type KitPlayer={name:string;number:string;size:string};
export type KitDesign={
 revision:typeof KIT_REVISION;preset:string;pattern:KitPattern;
 base:string;accent:string;detail:string;text:string;
 collar:"round"|"v";fit:"adult"|"kids";font:"block"|"modern";
 sponsor:string;logo?:string;players:KitPlayer[];
};

const hex=z.string().regex(/^#[0-9a-f]{6}$/i);
export const kitSchema=z.object({
 revision:z.literal(KIT_REVISION),
 preset:z.string().max(60),
 pattern:z.enum(kitPatterns),
 base:hex,accent:hex,detail:hex,text:hex,
 collar:z.enum(["round","v"]),fit:z.enum(["adult","kids"]),font:z.enum(["block","modern"]),
 sponsor:z.string().max(16),
 logo:z.string().max(1500000).regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/).optional(),
 players:z.array(z.object({name:z.string().max(14),number:z.string().regex(/^\d{0,2}$/),size:z.enum(allSizes)}).strict()).min(1).max(60)
}).strict();

export const kitSizes=(kit:Pick<KitDesign,"fit">)=>kit.fit==="kids"?[...kitKidSizes]:[...kitAdultSizes];
const middleSize=(kit:Pick<KitDesign,"fit">)=>{const s=kitSizes(kit);return s[Math.floor(s.length/2)];};

export function kitPreset(id:string){return kitPresets.find(p=>p.id===id)??kitPresets[0];}

/* the preset whose Signature surface matches the court being designed, if any */
export function kitPresetForProject(p:{patternFamily?:string;patternPalette?:string}){
 return kitPresets.find(k=>k.family===p.patternFamily&&k.palette===p.patternPalette);
}

export function defaultKit(preset:KitPreset=kitPresets[0]):KitDesign{
 return {revision:KIT_REVISION,preset:preset.id,pattern:preset.pattern,base:preset.base,accent:preset.accent,detail:preset.detail,text:preset.text,
  collar:"round",fit:"adult",font:"block",sponsor:"",players:[{name:"KOWALSKI",number:"10",size:"M"}]};
}

export function applyKitPreset(kit:KitDesign,preset:KitPreset):KitDesign{
 return {...kit,preset:preset.id,pattern:preset.pattern,base:preset.base,accent:preset.accent,detail:preset.detail,text:preset.text};
}

/* switching adult/kids keeps every player but moves sizes into the new range */
export function setKitFit(kit:KitDesign,fit:KitDesign["fit"]):KitDesign{
 const next={...kit,fit};const sizes=kitSizes(next) as string[];
 return {...next,players:kit.players.map(pl=>sizes.includes(pl.size)?pl:{...pl,size:middleSize(next)})};
}

export function addKitPlayer(kit:KitDesign):KitDesign{
 const used=new Set(kit.players.map(p=>p.number));let n=1;
 while(used.has(String(n))&&n<99)n++;
 return {...kit,players:[...kit.players,{name:"",number:String(n),size:middleSize(kit)}]};
}

export const cleanKitNumber=(v:string)=>v.replace(/\D/g,"").slice(0,2);

export function duplicateKitNumbers(players:KitPlayer[]){
 const seen=new Map<string,number>();
 players.forEach(p=>{if(p.number!=="")seen.set(p.number,(seen.get(p.number)??0)+1);});
 return [...seen].filter(([,n])=>n>1).map(([k])=>k);
}

export function kitSizeCounts(kit:KitDesign){
 const counts=new Map<string,number>();
 kit.players.forEach(p=>counts.set(p.size,(counts.get(p.size)??0)+1));
 return kitSizes(kit).filter(s=>counts.has(s)).map(s=>[s,counts.get(s)!] as const);
}

/* readable lines for the inquiry e-mail; the logo travels as a flag, not as data */
export function kitSummaryLines(kit:KitDesign){
 const L=[
  `Wzór: ${kitPreset(kit.preset).name}`,
  `Kolory: tło ${kit.base}, akcent ${kit.accent}, detal ${kit.detail}, napisy ${kit.text}`,
  `Krój: ${kit.collar==="v"?"dekolt w serek":"okrągły dekolt"}, ${kit.fit==="kids"?"dzieci":"dorośli"}; cyfry ${kit.font==="block"?"blokowe":"nowoczesne"}`,
  kit.sponsor?`Napis z przodu: ${kit.sponsor}`:"Napis z przodu: brak",
  `Herb: ${kit.logo?"tak":"brak"}`,
  `Koszulki: ${kit.players.length} szt. (${kitSizeCounts(kit).map(([s,n])=>`${s} × ${n}`).join(", ")})`
 ];
 kit.players.forEach((p,i)=>L.push(`${i+1}. ${p.name||"(bez nazwiska)"} | nr ${p.number||"-"} | ${p.size}`));
 return L;
}

export function kitForInquiry(kit:KitDesign){
 const {logo,...rest}=kit;
 return {...rest,logoIncluded:Boolean(logo),summary:kitSummaryLines(kit)};
}
