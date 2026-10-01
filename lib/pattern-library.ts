export type PatternGroup="organic"|"geometric"|"street"|"premium"|"brand"|"play";
export type PatternFamily={
 id:string;
 name:string;
 short:string;
 group:PatternGroup;
 description:string;
 tags:string[];
 baseComplexity:1|2|3|4;
 renderer:string;
};
export type PatternPalette={id:string;name:string;colors:[string,string,string,string,string];tone:string};

export const patternFamilies:PatternFamily[]=[
 {id:"organic-flow",name:"Organic Flow",short:"FLOW",group:"organic",description:"Duże płynne plamy i miękkie przejścia inspirowane muralem.",tags:["organiczne","energetyczne","mural"],baseComplexity:3,renderer:"organic"},
 {id:"soft-blobs",name:"Soft Blobs",short:"BLOBS",group:"organic",description:"Miękkie wyspy koloru o spokojniejszych proporcjach.",tags:["organiczne","soft","lifestyle"],baseComplexity:2,renderer:"blobs"},
 {id:"geometric",name:"Geometric",short:"GEO",group:"geometric",description:"Mocne figury, cięcia i modułowa geometria.",tags:["geometryczne","dynamiczne"],baseComplexity:2,renderer:"geometry"},
 {id:"bauhaus",name:"Bauhaus",short:"BAU",group:"geometric",description:"Koła, łuki, moduły i kontrastowe pola.",tags:["geometryczne","design","premium"],baseComplexity:3,renderer:"bauhaus"},
 {id:"color-block",name:"Color Block",short:"BLOCK",group:"geometric",description:"Duże, czytelne pola kolorystyczne.",tags:["minimal","geometryczne","proste"],baseComplexity:1,renderer:"blocks"},
 {id:"waves",name:"Waves",short:"WAVE",group:"organic",description:"Rytmiczne fale prowadzące przez całe boisko.",tags:["organiczne","ruch","dynamiczne"],baseComplexity:2,renderer:"waves"},
 {id:"contour",name:"Contour",short:"TOPO",group:"premium",description:"Warstwice i linie topograficzne.",tags:["premium","linie","subtelne"],baseComplexity:3,renderer:"contour"},
 {id:"court-camo",name:"Court Camo",short:"CAMO",group:"street",description:"Abstrakcyjny kamuflaż z dużych nieregularnych form.",tags:["street","organiczne","mocne"],baseComplexity:3,renderer:"camo"},
 {id:"street-grid",name:"Street Grid",short:"GRID",group:"street",description:"Miejska siatka, moduły i przesunięcia.",tags:["street","geometryczne","urban"],baseComplexity:2,renderer:"grid"},
 {id:"pixel",name:"Pixel",short:"PIXEL",group:"play",description:"Raster i pikselowe moduły do odważnych przestrzeni.",tags:["play","geometryczne","digital"],baseComplexity:2,renderer:"pixel"},
 {id:"diagonal",name:"Diagonal",short:"SLASH",group:"geometric",description:"Ukośne pasy i szybkie, sportowe cięcia.",tags:["sport","dynamiczne","geometryczne"],baseComplexity:1,renderer:"diagonal"},
 {id:"radial",name:"Radial",short:"RADIAL",group:"geometric",description:"Kompozycje budowane od środka boiska.",tags:["centrum","geometryczne","event"],baseComplexity:2,renderer:"radial"},
 {id:"sunset",name:"Sunset Bands",short:"SUN",group:"organic",description:"Szerokie pasma i zachodzące na siebie łuki.",tags:["lifestyle","organiczne","kolor"],baseComplexity:2,renderer:"sunset"},
 {id:"neon",name:"Neon Court",short:"NEON",group:"street",description:"Wysoki kontrast, nocna energia i świetlne rytmy.",tags:["street","night","energetyczne"],baseComplexity:3,renderer:"neon"},
 {id:"mono",name:"Mono Layers",short:"MONO",group:"premium",description:"Tonalne warstwy jednego koloru.",tags:["minimal","premium","subtelne"],baseComplexity:1,renderer:"mono"},
 {id:"raw-concrete",name:"Raw Concrete",short:"RAW",group:"premium",description:"Minimalna ingerencja i architektoniczne pola.",tags:["minimal","architektura","premium"],baseComplexity:1,renderer:"concrete"},
 {id:"street-art",name:"Street Art",short:"ART",group:"street",description:"Muralowe gesty, spray i duża ekspresja.",tags:["street","mural","ekspresyjne"],baseComplexity:4,renderer:"graffiti"},
 {id:"typography",name:"Typography",short:"TYPE",group:"brand",description:"Wielkie hasła i litery jako część nawierzchni.",tags:["brand","street","tekst"],baseComplexity:2,renderer:"type"},
 {id:"local-id",name:"Local ID",short:"CITY",group:"brand",description:"System pól gotowy pod nazwę miasta, dzielnicy lub miejsca.",tags:["brand","city","lokalne"],baseComplexity:2,renderer:"local"},
 {id:"nature",name:"Nature",short:"NATURE",group:"organic",description:"Formy inspirowane krajobrazem, liśćmi i wodą.",tags:["organiczne","eco","spokojne"],baseComplexity:3,renderer:"nature"},
 {id:"kids",name:"Playground",short:"PLAY",group:"play",description:"Radosne kształty, punkty i moduły zabawowe.",tags:["play","kids","kolor"],baseComplexity:2,renderer:"kids"},
 {id:"premium",name:"Architectural",short:"ARCH",group:"premium",description:"Spokojne, eleganckie podziały dla przestrzeni premium.",tags:["premium","architektura","minimal"],baseComplexity:2,renderer:"premium"},
 {id:"brand-activation",name:"Brand Activation",short:"BRAND",group:"brand",description:"Kompozycje z kontrolowanymi strefami pod logo i kampanie.",tags:["brand","event","sponsor"],baseComplexity:2,renderer:"brand"},
 {id:"ribbons",name:"Ribbons",short:"RIBBON",group:"organic",description:"Wstęgi prowadzące przez pole gry i otoczenie.",tags:["organiczne","ruch","premium"],baseComplexity:3,renderer:"ribbons"},
 {id:"terrazzo",name:"Terrazzo",short:"TERR",group:"play",description:"Rozsypane drobne formy tworzące współczesną teksturę.",tags:["play","lifestyle","tekstura"],baseComplexity:3,renderer:"terrazzo"}
];

export const patternPalettes:PatternPalette[]=[
 {id:"miami",name:"Miami",colors:["#F25F43","#18B7C7","#FFD447","#9A3152","#2469A6"],tone:"energetyczna"},
 {id:"warsaw",name:"Warsaw",colors:["#C7352F","#F2E8D5","#202827","#E66344","#8E1D23"],tone:"miejska"},
 {id:"berlin",name:"Berlin",colors:["#202625","#B9FF3D","#E7E5DC","#6B746F","#101414"],tone:"surowa"},
 {id:"tokyo",name:"Tokyo",colors:["#111111","#F7F3EA","#E62E36","#F08AB2","#3B63FF"],tone:"kontrastowa"},
 {id:"ocean",name:"Ocean",colors:["#143C5A","#1B7A92","#37BFC2","#D9F0EC","#5C9BD2"],tone:"chłodna"},
 {id:"earth",name:"Earth",colors:["#B65E3C","#E3C58B","#667451","#F1E8D7","#835342"],tone:"naturalna"},
 {id:"pastel",name:"Pastel",colors:["#CDB8E8","#A8D9C8","#F3BBA7","#FFF0D5","#8DAFD2"],tone:"lekka"},
 {id:"night",name:"Night Court",colors:["#111827","#6D3BF5","#00C7E6","#F7E547","#E754B5"],tone:"nocna"},
 {id:"luxury",name:"Luxury",colors:["#F1E9D8","#641F35","#173B34","#2C2C2A","#C2A878"],tone:"premium"},
 {id:"club",name:"Club",colors:["#3157B7","#E9D44D","#F7F7F3","#D84D42","#1E2D55"],tone:"sportowa"},
 {id:"citrus",name:"Citrus",colors:["#F4C430","#F06D3E","#E9F2CF","#4F7A44","#1D4132"],tone:"świeża"},
 {id:"lagoon",name:"Lagoon",colors:["#0F8A8D","#62C3B8","#F4E4B7","#E36E50","#153E4A"],tone:"wakacyjna"},
 {id:"grape",name:"Grape",colors:["#55286F","#8F5AA8","#E5C5EB","#F0A34B","#26213D"],tone:"artystyczna"},
 {id:"concrete",name:"Concrete",colors:["#555D5A","#A7ACA9","#E0E0DA","#303634","#BBC8B8"],tone:"minimalna"},
 {id:"forest",name:"Forest",colors:["#193D2E","#426B45","#8FA66B","#DDE1BD","#B16F4A"],tone:"eco"},
 {id:"sunset",name:"Sunset",colors:["#9A3152","#F05B49","#F28C5B","#F6D36C","#514C8B"],tone:"ciepła"},
 {id:"ice",name:"Ice",colors:["#DFF6FF","#8BD3E6","#3A86B8","#245273","#FFFFFF"],tone:"czysta"},
 {id:"mono-green",name:"Mono Green",colors:["#244B3B","#3E6654","#6E8A75","#A9B7A8","#E5E9DF"],tone:"tonalna"}
];

export const patternFilters=[
 {id:"all",label:"Wszystkie"},
 {id:"organic",label:"Organiczne"},
 {id:"geometric",label:"Geometryczne"},
 {id:"street",label:"Street"},
 {id:"premium",label:"Premium"},
 {id:"brand",label:"Brand"},
 {id:"play",label:"Play"}
] as const;

export const variants=Array.from({length:12},(_,i)=>({
 variant:i+1,
 name:["Origin","Split","Drift","Pulse","Offset","Loop","Fragment","Cross","Edge","Center","Rush","Field"][i]
}));

export function getPatternFamily(id?:string){return patternFamilies.find(x=>x.id===id)||patternFamilies[0]}
export function getPatternPalette(id?:string){return patternPalettes.find(x=>x.id===id)||patternPalettes[0]}
export function patternComplexity(familyId:string,variant:number){
 const base=getPatternFamily(familyId).baseComplexity;
 const bump=variant%5===0?1:variant%7===0?1:0;
 return Math.max(1,Math.min(4,base+bump));
}
export function patternCode(familyId:string,variant:number){
 const family=getPatternFamily(familyId);
 return "GF-"+family.short+"-"+String(Math.max(1,Math.min(12,variant))).padStart(2,"0");
}
export function filteredPatternFamilies(filter:string){
 return filter==="all"?patternFamilies:patternFamilies.filter(x=>x.group===filter);
}
export const PATTERN_COUNT=patternFamilies.length*variants.length;
