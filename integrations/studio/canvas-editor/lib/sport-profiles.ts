import {productNames} from "./product-names.mjs";
export type SportProfile={
 arenaModel?:"w1"|"o1"|"p1"|"circle-cage-1"|"circle-cage-2"|"street15"|"street-field"|"octagon";
 id:string;
 sport:string;
 label:string;
 eyebrow:string;
 description:string;
 length:number;
 width:number;
 courtShape?:"rectangle"|"circle";
 diameter?:number;
 surface:string;
 base:string;
 zone:string;
 outside:string;
 lineColor:string;
 equipment:string[];
 tags:string[];
};

export const sportProfiles:SportProfile[]=[
 {id:"street-football-3x3",sport:"Piłka nożna 3×3",label:"Street Football 3×3",eyebrow:"URBAN / COMMUNITY",description:"Kompaktowe boisko miejskie do szybkiej gry, aktywacji i wydarzeń.",length:15,width:10,surface:"Akryl sportowy",base:"#236F70",zone:"#EF744E",outside:"#DDE0D7",lineColor:"#FFFFFF",equipment:["Bramka","Banda","Piłkochwyt","Lampa","Ławka","DJ booth"],tags:["miejski","event","community"]},

 {id:"o1",arenaModel:"o1",sport:"Piłka nożna 1×1",label:productNames["o1"],eyebrow:"SKILL / PANNA",description:"Jeden na jednego. Mała przestrzeń do technicznej gry, pojedynków i spotkań wokół piłki.",length:5.902,width:5.902,courtShape:"circle",diameter:5.902,surface:"Akryl sportowy",base:"#1D5147",zone:"#D8FF77",outside:"#DFE2DB",lineColor:"#FFFFFF",equipment:["Bramka","Banda","Piłkochwyt","Lampa","Ławka","DJ booth"],tags:["skill","panna","event"]},
 {id:"p1",arenaModel:"p1",sport:"Piłka nożna 1×1",label:productNames["p1"],eyebrow:"SKILL / PANNA",description:"Jeden na jednego. Mała przestrzeń do technicznej gry, pojedynków i spotkań wokół piłki.",length:7.139,width:5.573,courtShape:"rectangle",surface:"Akryl sportowy",base:"#1D5147",zone:"#D8FF77",outside:"#DFE2DB",lineColor:"#FFFFFF",equipment:["Bramka","Banda","Piłkochwyt","Lampa","Ławka","DJ booth"],tags:["skill","panna","event"]},
 {id:"circle-cage-1",arenaModel:"circle-cage-1",sport:"Piłka nożna 1×1",label:productNames["circle-cage-1"],eyebrow:"CIRCLE / CAGE",description:"Arena siatkowa Ø 6 m, wysokość 0,9 m, jeden poziom paneli, dwie bramki i wejście.",length:6,width:6,courtShape:"circle",diameter:6,surface:"Akryl sportowy",base:"#1D5147",zone:"#D8FF77",outside:"#DFE2DB",lineColor:"#FFFFFF",equipment:["Bramka","Banda","Lampa","Ławka"],tags:["panna","cage","circle"]},
 {id:"circle-cage-2",arenaModel:"circle-cage-2",sport:"Piłka nożna 1×1",label:productNames["circle-cage-2"],eyebrow:"CIRCLE / CAGE",description:"Arena siatkowa Ø 6 m, wysokość 1,8 m, dwa poziomy paneli, dwie bramki i wejście.",length:6,width:6,courtShape:"circle",diameter:6,surface:"Akryl sportowy",base:"#1D5147",zone:"#D8FF77",outside:"#DFE2DB",lineColor:"#FFFFFF",equipment:["Bramka","Banda","Lampa","Ławka"],tags:["panna","cage","circle"]},
 {id:"octagon",arenaModel:"octagon",sport:"Piłka nożna 1×1",label:productNames["octagon"],eyebrow:"STREET / FOOTBALL",description:"Ośmiobok 4,962 × 4,962 m, wysokość 1,218 m, dwie bramki i dwa obniżone wejścia.",length:4.962,width:4.962,courtShape:"rectangle",surface:"Akryl sportowy",base:"#236F70",zone:"#EF744E",outside:"#DDE0D7",lineColor:"#FFFFFF",equipment:["Bramka","Banda","Lampa","Ławka"],tags:["street","football","panna"]},
 {id:"street-field",arenaModel:"street-field",sport:"Piłka nożna 1×1",label:productNames["street-field"],eyebrow:"STREET / FOOTBALL",description:"Pole 6,214 × 4,648 m, konstrukcja 1,091 m, dwie bramki i obniżone wejście.",length:6.214,width:4.648,courtShape:"rectangle",surface:"Akryl sportowy",base:"#236F70",zone:"#EF744E",outside:"#DDE0D7",lineColor:"#FFFFFF",equipment:["Bramka","Banda","Lampa","Ławka"],tags:["street","football","panna"]},
 {id:"street15",arenaModel:"street15",sport:"Piłka nożna 3×3",label:productNames["street15"],eyebrow:"STREET / FOOTBALL",description:"Pole 15 × 10 m z narożnikami ściętymi, bandy 1 m bez napisów i dwie bramki.",length:15,width:10,courtShape:"rectangle",surface:"Akryl sportowy",base:"#236F70",zone:"#EF744E",outside:"#DDE0D7",lineColor:"#FFFFFF",equipment:["Bramka","Banda","Lampa","Ławka"],tags:["street","football","15x10"]},
 {id:"basketball-3x3",sport:"Koszykówka 3×3",label:"Basketball 3×3",eyebrow:"STREET / OLYMPIC FORMAT",description:"Nowoczesny half-court pod 3×3, kulturę streetballu i markowe aktywacje.",length:15,width:11,surface:"Akryl sportowy",base:"#3157B7",zone:"#E9D44D",outside:"#E3E1D9",lineColor:"#FFFFFF",equipment:["Kosz","Piłkochwyt","Lampa","Ławka","Trybuna","DJ booth"],tags:["streetball","brand","event"]},
 {id:"basketball-full",sport:"Koszykówka",label:"Basketball Full Court",eyebrow:"FULL COURT",description:"Pełne boisko do koszykówki z przestrzenią na mocny projekt nawierzchni.",length:28,width:15,surface:"Akryl sportowy",base:"#B24A3B",zone:"#EACB65",outside:"#DCDDD6",lineColor:"#FFFFFF",equipment:["Kosz","Piłkochwyt","Lampa","Ławka","Trybuna"],tags:["club","school","urban"]},
 {id:"tennis",sport:"Tenis",label:"Tennis",eyebrow:"CLUB / LIFESTYLE",description:"Kort tenisowy do renowacji lub nowej realizacji, z czytelną strefą gry i brandingiem.",length:23.77,width:10.97,surface:"Akryl sportowy",base:"#35685C",zone:"#BFD97A",outside:"#D9D8CF",lineColor:"#FFFFFF",equipment:["Siatka","Słupki tenisowe","Ławka","Krzesło sędziowskie","Lampa","Piłkochwyt"],tags:["club","lifestyle","premium"]},
 {id:"padel",sport:"Padel",label:"Padel",eyebrow:"SOCIAL / NEXT GEN",description:"Kort 20×10 m z przestrzenią szkła, siatki i oświetlenia — pod współczesny klub i social play.",length:20,width:10,surface:"Sztuczna trawa 60 mm",base:"#315F71",zone:"#4E8F87",outside:"#CDD3CF",lineColor:"#FFFFFF",equipment:["Siatka","Szkło padel","Lampa","Ławka"],tags:["social","club","next-gen"]},
 {id:"volleyball",sport:"Siatkówka",label:"Volleyball",eyebrow:"TEAM / MULTIUSE",description:"Czytelne boisko 18×9 m do obiektów szkolnych, miejskich i klubowych.",length:18,width:9,surface:"Akryl sportowy",base:"#33658A",zone:"#F6AE2D",outside:"#DFE0D8",lineColor:"#FFFFFF",equipment:["Siatka","Słupki tenisowe","Ławka","Lampa"],tags:["team","school","club"]},
 {id:"pickleball",sport:"Pickleball",label:"Pickleball",eyebrow:"FAST GROWTH / SOCIAL",description:"Kompaktowy, nowoczesny court do gry społecznościowej i adaptacji istniejących nawierzchni.",length:13.41,width:6.1,surface:"Akryl sportowy",base:"#7B6BCB",zone:"#D8FF77",outside:"#E4E3DE",lineColor:"#FFFFFF",equipment:["Siatka","Słupki tenisowe","Ławka","Lampa"],tags:["social","compact","modern"]},
 {id:"futsal",sport:"Futsal",label:"Futsal",eyebrow:"INDOOR / URBAN",description:"Pełnowymiarowe boisko 40×20 m do szybkiej gry 5×5, hal i nowoczesnych obiektów miejskich.",length:40,width:20,surface:"Akryl sportowy",base:"#245E58",zone:"#D8FF77",outside:"#DADFD8",lineColor:"#FFFFFF",equipment:["Bramka futsal","Piłkochwyt","Lampa","Ławka","Trybuna"],tags:["5x5","club","urban"]},
 {id:"badminton",sport:"Badminton",label:"Badminton",eyebrow:"FAST / PRECISION",description:"Kort deblowy 13,40×6,10 m z czytelnym systemem linii i lekkim wyposażeniem.",length:13.4,width:6.1,surface:"Moduły sportowe",base:"#315F71",zone:"#78B7A4",outside:"#E0E3DC",lineColor:"#FFFFFF",equipment:["Siatka badminton","Słupki badmintonowe","Ławka","Lampa"],tags:["indoor","precision","club"]},
 {id:"beach-volleyball",sport:"Siatkówka plażowa",label:"Beach Volleyball",eyebrow:"OUTDOOR / SOCIAL",description:"Pole gry 16×8 m w piasku do obiektów sezonowych, rekreacyjnych i eventowych.",length:16,width:8,surface:"Piasek sportowy",base:"#D6B77A",zone:"#EACB92",outside:"#D6D4C9",lineColor:"#FFFFFF",equipment:["Siatka beach","Słupki beach","Ławka","Lampa","Trybuna"],tags:["outdoor","social","event"]},
 {id:"teqball",sport:"Teqball",label:"Teqball",eyebrow:"TECH / SKILL",description:"Kompaktowa strefa 16×12 m pod stół Teqball, trening techniczny i aktywacje marek.",length:16,width:12,surface:"Akryl sportowy",base:"#1F4C4C",zone:"#F06B4E",outside:"#DFE1DA",lineColor:"#FFFFFF",equipment:["Stół Teqball","Piłkochwyt","Lampa","Ławka","DJ booth"],tags:["skill","tech","activation"]},
 {id:"skate",sport:"Skate",label:"Skate Plaza",eyebrow:"STREET / CULTURE",description:"Elastyczna plaza sportowa z modułami skate, brandingiem nawierzchni i miejskim charakterem.",length:24,width:16,surface:"Beton sportowy",base:"#B7B7AE",zone:"#D8FF77",outside:"#D6D8D1",lineColor:"#FFFFFF",equipment:["Quarter pipe","Funbox","Rail skate","Ledge","Bank","Ławka","Lampa","Totem"],tags:["street","culture","custom"]},
 {id:"street-workout",sport:"Street Workout",label:"Street Workout",eyebrow:"TRAINING / PUBLIC SPACE",description:"Strefa treningu outdoor z EPDM, drążkami, poręczami i modułowym układem ćwiczeń.",length:18,width:12,surface:"EPDM",base:"#223A32",zone:"#D8FF77",outside:"#DADDD5",lineColor:"#FFFFFF",equipment:["Drążki","Poręcze","Monkey bars","Box treningowy","Kółka treningowe","Ławka","Lampa"],tags:["training","outdoor","public"]},
 {id:"multisport",sport:"Wielofunkcyjne",label:"Multisport",eyebrow:"FLEX / PUBLIC SPACE",description:"Jedna nawierzchnia dla kilku dyscyplin z warstwowym systemem linii.",length:28,width:15,surface:"Akryl sportowy",base:"#28483D",zone:"#D8FF77",outside:"#D9DDD6",lineColor:"#FFFFFF",equipment:["Bramka","Kosz","Siatka","Piłkochwyt","Lampa","Ławka"],tags:["school","public","flex"]},
 {id:"custom",sport:"Custom Court",label:"Custom Court",eyebrow:"OPEN FORMAT",description:"Niestandardowa przestrzeń sportowa lub aktywacyjna z własnymi proporcjami.",length:20,width:12,surface:"Akryl sportowy",base:"#2B4B40",zone:"#EF744E",outside:"#DEDFD8",lineColor:"#FFFFFF",equipment:["Bramka","Kosz","Siatka","Banda","Piłkochwyt","Lampa","Ławka","Trybuna","DJ booth","Totem"],tags:["custom","brand","activation"]}
];

export function getSportProfile(sport?:string,arenaModel?:string){
 return sportProfiles.find(p=>arenaModel?p.arenaModel===arenaModel:p.sport===sport)||sportProfiles[0];
}
