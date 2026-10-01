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
export type SignaturePreset={
 id:string;
 name:string;
 eyebrow:string;
 familyId:string;
 variant:number;
 paletteId:string;
 useCase:string;
 note:string;
};

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



export const signaturePresets:SignaturePreset[]=[
 {id:"city-fluid",name:"City Fluid",eyebrow:"SIGNATURE 01",familyId:"organic-flow",variant:6,paletteId:"warsaw",useCase:"miasto / rewitalizacja",note:"Duże muralowe plamy, czytelne z daleka i dobrze pracujące z istniejącą architekturą."},
 {id:"riviera-court",name:"Riviera Court",eyebrow:"SIGNATURE 02",familyId:"soft-blobs",variant:9,paletteId:"lagoon",useCase:"lifestyle / hospitality",note:"Lekka, premium kompozycja do przestrzeni rekreacyjnych, hoteli i aktywacji letnich."},
 {id:"club-heritage",name:"Club Heritage",eyebrow:"SIGNATURE 03",familyId:"bauhaus",variant:4,paletteId:"club",useCase:"klub / sponsor",note:"Sportowa geometria z miejscem na kolor klubowy, znak i partnera głównego."},
 {id:"urban-camo",name:"Urban Camo",eyebrow:"SIGNATURE 04",familyId:"court-camo",variant:7,paletteId:"berlin",useCase:"street / youth",note:"Surowy, mocny kierunek do boisk miejskich i komunikacji streetwearowej."},
 {id:"metro-lines",name:"Metro Lines",eyebrow:"SIGNATURE 05",familyId:"contour",variant:10,paletteId:"tokyo",useCase:"miejska ikona",note:"Warstwice i rytm linii — spokojny z góry, bardzo charakterystyczny w detalach."},
 {id:"night-signal",name:"Night Signal",eyebrow:"SIGNATURE 06",familyId:"neon",variant:11,paletteId:"night",useCase:"event / night",note:"Wysoki kontrast i energia pod oświetlenie wieczorne, event i content."},
 {id:"brand-stage",name:"Brand Stage",eyebrow:"SIGNATURE 07",familyId:"brand-activation",variant:5,paletteId:"luxury",useCase:"marka / kampania",note:"Kontrolowane pole pod logo i kampanię bez utraty czytelności sportowej."},
 {id:"earth-motion",name:"Earth Motion",eyebrow:"SIGNATURE 08",familyId:"ribbons",variant:3,paletteId:"earth",useCase:"park / eco",note:"Naturalne wstęgi i kolory, które dobrze wpisują się w zieleń i przestrzeń publiczną."},
 {id:"play-system",name:"Play System",eyebrow:"SIGNATURE 09",familyId:"kids",variant:8,paletteId:"pastel",useCase:"szkoła / dzieci",note:"Czytelne formy, przyjazne kolory i modularność dla stref wielofunkcyjnych."},
 {id:"raw-architecture",name:"Raw Architecture",eyebrow:"SIGNATURE 10",familyId:"premium",variant:2,paletteId:"concrete",useCase:"premium / architektura",note:"Minimalna paleta, duże płaszczyzny i mocny dialog z betonem, stalą i drewnem."},
 {id:"local-lettering",name:"Local Lettering",eyebrow:"SIGNATURE 11",familyId:"local-id",variant:12,paletteId:"warsaw",useCase:"dzielnica / placemaking",note:"Wzór budowany pod nazwę miejsca, dzielnicy lub lokalne hasło."},
 {id:"festival-art",name:"Festival Art",eyebrow:"SIGNATURE 12",familyId:"street-art",variant:5,paletteId:"sunset",useCase:"event / kultura",note:"Najbardziej ekspresyjny kierunek do realizacji muralowych i przestrzeni eventowych."}
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

const familyVariantNames:Record<string,string[]>={
 "organic-flow":["Source","River Split","Islands","Soft Divide","Tide","Serpentine","Broken Bay","Cross Current","Lagoon","Twin Flow","Rush","Field"],
 "bauhaus":["Block Arc","Dual Circle","Target Cross","Chevron","Four Quarters","Arch","Slash Grid","Corner Orbits","Twin Rings","Diamond","Wave Block","Axis"],
 "court-camo":["Drift","Cluster","Edge Camo","Split Camo","Patchwork","Field Camo","Diagonal Camo","Corner Camo","Transit","Wide Camo","Urban Patch","Full Camo"],
 "street-art":["Flow Tag","Zigzag","Loop","Spray Lines","Wildstyle","Split Stroke","Eye","Cross","Scatter","Rail","Rush","Marker"],
 "brand-activation":["Sponsor Lane","Dual Zone","Crown","Center Stage","Split Brand","Wave Brand","Twin Panels","Chevron Brand","Orbit Brand","Banner","Impact","Activation"],
 "ribbons":["Twin Flow","Vertical Loop","Soft Cross","Interlace","Center Wave","Double Arc","Drop","Fast Cross","Metro","Orbit","Dual Rush","Track"],
 "geometric":["Cut","Split Axis","Ribbon Cut","Twin Arrow","Module","Slash","Four Point","Fold","Corner Grid","Double Chevron","Runway","Core"],
 "waves":["Calm","Current","Vertical Tide","Triple Arc","Ripple","Cross Tide","Loop Wave","Metro Wave","Swell","Axis Wave","Fast Tide","Parallel"],
 "contour":["Center Map","West Ridge","East Ridge","Wide Basin","South Peak","North Peak","Tilted Map","Reverse Ridge","Dual Basin","Twin Peaks","Tight Topo","Wide Topo"],
 "street-grid":["City Blocks","Offset","Skew Grid","Diamond Blocks","Transit","L Grid","Wide Blocks","Corner Shift","Metro","Dense Grid","Broken Grid","Full Grid"],
 "radial":["Sunburst","West Burst","East Burst","North Burst","South Burst","Corner Burst","Opposite Burst","Fine Burst","Target Burst","Micro Burst","Offset Sun","Split Sun"],
 "premium":["Cut Stone","Gallery","Diagonal Hall","Twin Arch","Studio","Band","Pavilion","Terrace","Diamond Hall","Facade","Orbit Hall","Frame"],
 "soft-blobs":["Soft Islands","Wide Drift","Pebbles","Top Bottom","Lagoon Spots","Center Cloud","Corner Drift","Balance","Horizon","Checker Soft","Long Cloud","Double Row"],
 "color-block":["Classic Split","Horizontal Bands","Vertical Trio","Four Fields","Diagonal Split","Frame Bands","Open Corners","Quarter Cut","Center Strip","Side Frame","Slash Bands","Half Grid"],
 "pixel":["Sparse Grid","Pixel Core","Diagonal Pixels","Wide Pixels","Broken Raster","Dense Field","Cross Raster","Offset Blocks","Center Pixel","City Pixel","Fragmented","Full Raster"],
 "diagonal":["Forward Slash","Reverse Slash","Triple Cut","Diamond Slash","Corner Cuts","Speed Lines","Center Cut","Twin Chevron","Runway","Hourglass","Broken Slash","Half Slash"],
 "sunset":["Soft Horizon","High Tide","Low Bands","Deep Sunset","Warm Flow","Layered Sky","Ripple Horizon","Wide Glow","Low Sun","Long Dusk","Late Light","Final Horizon"],
 "neon":["Pulse","Vertical Signal","Circuit","Lightning","Wave Glow","Split Beam","Twin Pulse","Cross Light","Loop Signal","Frame Light","Night Rush","Parallel Glow"]
};

export function patternVariantName(familyId:string,variant:number){
 const names=familyVariantNames[familyId];
 return names?.[Math.max(1,Math.min(12,variant))-1]||variants[Math.max(1,Math.min(12,variant))-1]?.name||"Variant";
}

export function getPatternFamily(id?:string){return patternFamilies.find(x=>x.id===id)||patternFamilies[0]}
export function getPatternPalette(id?:string){return patternPalettes.find(x=>x.id===id)||patternPalettes[0]}
export function complexityLabel(level:number){
 return ["","prosty","standard","mural","art"][Math.max(1,Math.min(4,level))];
}
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
