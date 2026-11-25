/* Projekt miesiąca (Workshop contest). One theme per month; the owner picks the winner from the ten most liked
   entries (likes and "Stworzono podobnych" guide, they do not decide). Change THEMES to plan the next months. */
export type Contest={id:string;title:string;brief:string;start:string;end:string;prize:string;rules:string};
export const CONTEST_RULES='https://www.gamefields.eu/regulamin-projekt-miesiaca/';
const THEMES:Contest[]=[
 {id:'2026-12',title:'Boisko pod blokiem',brief:'Zaprojektuj boisko na podwórko między blokami: kolory, które ożywią osiedle.',start:'2026-11-25',end:'2026-12-31',prize:'Plakat z Twoim boiskiem i publikacja na @gamefields.eu',rules:CONTEST_RULES},
 {id:'2027-01',title:'Barwy Twojego klubu',brief:'Boisko w kolorach drużyny, której kibicujesz albo w której grasz.',start:'2027-01-01',end:'2027-01-31',prize:'Plakat z Twoim boiskiem i publikacja na @gamefields.eu',rules:CONTEST_RULES},
];
const day=(s:string)=>Date.parse(s+'T00:00:00+01:00');
/** The contest open at `now`, or the next one when none is open (entries are accepted only while open). */
export function currentContest(now=Date.now()):{contest:Contest;open:boolean}|null{
 const open=THEMES.find(c=>now>=day(c.start)&&now<day(c.end)+864e5);if(open)return {contest:open,open:true};
 const next=THEMES.find(c=>now<day(c.start));return next?{contest:next,open:false}:null;
}
export const allContests=()=>THEMES.slice();
export const contestById=(id:string)=>THEMES.find(c=>c.id===id)||null;
const BLOCK=['kurw','chuj','pierd','jeba','jebi','pizd','cipa','huj','dziwk','szmat','spierd','nazi','hitler'];
/** Pseudonym: 2–24 letters, digits, spaces, dot, dash, underscore. No links, no obvious insults. Empty = anonymous. */
export function cleanNickname(raw:unknown):string|null|false{
 if(raw==null||raw==='')return null;if(typeof raw!=='string')return false;
 const v=raw.normalize('NFC').replace(/^@+/,'').replace(/\s+/g,' ').trim();if(!v)return null;
 if(v.length<2||v.length>24||!/^[\p{L}\p{N} ._-]+$/u.test(v)||/http|www\./i.test(v))return false;
 const low=v.toLowerCase().replace(/[^a-ząćęłńóśźż]/g,'');if(BLOCK.some(b=>low.includes(b)))return false;
 return v;
}
