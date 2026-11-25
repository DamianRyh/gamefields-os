/* "Twoja ścieżka" (2026-11-25): the Studio's path from a design to sharing, a contest, a PDF card and funding.
   Steps are marked done by the features themselves (window event 'gf-journey' {step}); state stays in this browser.
   Nudges are tied to events, one at a time, at most one every 90 s, never while dragging or typing. */
export type JourneyStep='model'|'surface'|'colors'|'save'|'publish'|'share'|'card'|'financing';
export const JOURNEY:{id:JourneyStep;label:string;hint:string}[]=[
 {id:'model',label:'Wybierz konstrukcję',hint:'Model boiska i jego wymiary.'},
 {id:'surface',label:'Nawierzchnia i wzór',hint:'Materiał, wzór i paleta.'},
 {id:'colors',label:'Twoje kolory',hint:'Kolor ramy i paneli.'},
 {id:'save',label:'Zapisz dla siebie',hint:'Plik projektu albo link, żeby wrócić później.'},
 {id:'publish',label:'Pokaż innym i weź udział w konkursie',hint:'„Zapisz dla innych” i Projekt miesiąca.'},
 {id:'share',label:'Udostępnij grafikę lub film',hint:'Stories, post albo film 6 s.'},
 {id:'card',label:'Karta projektu PDF',hint:'Wymiary, nawierzchnia i cena na jednej stronie.'},
 {id:'financing',label:'Finansowanie',hint:'Budżet obywatelski i programy 2027.'},
];
export type JourneyState={done:JourneyStep[];shown:string[];dismissStreak:number;muted:boolean;open:boolean|null};
const KEY='gf-journey-v1';
export function readJourney():JourneyState{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Array.isArray(s.done))return {done:s.done,shown:s.shown||[],dismissStreak:s.dismissStreak||0,muted:!!s.muted,open:typeof s.open==='boolean'?s.open:null}}catch{/* storage optional */}return {done:[],shown:[],dismissStreak:0,muted:false,open:null}}
export function writeJourney(s:JourneyState){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{/* storage optional */}}
/** Called by features when the user completes a step. */
export function journey(step:JourneyStep){try{window.dispatchEvent(new CustomEvent('gf-journey',{detail:{step}}))}catch{/* SSR */}}
/** Analytics hook: window 'gf-journey-event' and GA dataLayer when present. No personal data. */
export function journeyEvent(name:string,id?:string){try{window.dispatchEvent(new CustomEvent('gf-journey-event',{detail:{name,id}}));const dl=(window as unknown as {dataLayer?:unknown[]}).dataLayer;if(Array.isArray(dl))dl.push({event:'gf_journey',journey_action:name,journey_id:id||''})}catch{/* optional */}}
