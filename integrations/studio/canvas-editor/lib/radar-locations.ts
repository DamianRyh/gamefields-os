export type RadarSport="Basketball"|"Football"|"Multisport";

export type RadarLocation={
 id:string;
 name:string;
 city:string;
 district:string;
 latitude:number;
 longitude:number;
 sport:RadarSport;
 type:string;
 shortDescription:string;
 beforeAerial:string;
 afterAerial:string;
 beforeStreet:string;
 afterStreet:string;
 slug:string;
 status:string;
 scope:string;
 gallery?:string[];
 mediaStatus:"demo"|"verified";
};

export const radarLocations:RadarLocation[]=[
 {
  id:"gf-waw-001",name:"Pole Mokotowskie",city:"Warszawa",district:"Mokotów",latitude:52.2119,longitude:21.0074,
  sport:"Basketball",type:"Court renovation",status:"Gamefields Concept",mediaStatus:"demo",slug:"pole-mokotowskie",
  shortDescription:"Niezależna koncepcja odnowienia miejskiego boiska poprzez nową nawierzchnię, grafikę i wyposażenie.",
  beforeAerial:"",afterAerial:"/studio/basketball-3x3-organic-flow-park-v2.webp",beforeStreet:"",afterStreet:"/studio/basketball-3x3-organic-flow-park-v2.webp",
  scope:"Surface / graphics / equipment"
 },
 {
  id:"gf-waw-002",name:"Plac Defilad",city:"Warszawa",district:"Śródmieście",latitude:52.2315,longitude:21.0056,
  sport:"Football",type:"Urban sports activation",status:"Gamefields Concept",mediaStatus:"demo",slug:"plac-defilad",
  shortDescription:"Testowy scenariusz tymczasowego boiska 3×3 wpisanego w centralną przestrzeń miasta.",
  beforeAerial:"",afterAerial:"/radar/warsaw-pkin-aerial-concept.webp",beforeStreet:"",afterStreet:"/radar/warsaw-pkin-ground-concept.webp",
  scope:"Surface / graphics / modular equipment"
 },
 {
  id:"gf-waw-003",name:"Park Praski",city:"Warszawa",district:"Praga-Północ",latitude:52.2536,longitude:21.0336,
  sport:"Multisport",type:"Public space renewal",status:"Gamefields Concept",mediaStatus:"demo",slug:"park-praski",
  shortDescription:"Koncepcja aktywnej, wielofunkcyjnej strefy sportowej otwartej na różne grupy użytkowników.",
  beforeAerial:"",afterAerial:"/studio/organic-flow-park.webp",beforeStreet:"",afterStreet:"/studio/organic-flow-park.webp",
  scope:"Surface / graphics / multisport equipment"
 }
];

export function getRadarLocation(slug:string){return radarLocations.find(location=>location.slug===slug)}
