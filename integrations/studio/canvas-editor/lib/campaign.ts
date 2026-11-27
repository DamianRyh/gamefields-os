/* Strona kampanii do budżetu obywatelskiego (2026-11-25). A resident turns a Studio design into a public page
   "Boisko dla osiedla X": support counter, share pack, technical card for the office. Shared by the form (client)
   and the API (server): the server validates everything again. No names; e-mail only when the organiser asks
   for help with the application. */
import {cleanNickname,rude} from './workshop-contest';

export type CampaignInput={title:string;place:string;city:string;budgetName?:string|null;budgetUrl?:string|null;voteUntil?:string|null;organizer?:string|null;about?:string|null;email?:string|null};
export type Campaign={id:string;title:string;place:string;city:string;budgetName:string|null;budgetUrl:string|null;voteUntil:string|null;organizer:string|null;about:string|null;supporters:number;createdAt:string};
export const CAMPAIGN_LINK=(id:string)=>'https://www.gamefields.eu/studio/?kampania='+id;
const TEXT=/^[\p{L}\p{N} .,:;!?()'"„”«»/&+–—-]+$/u;
function text(raw:unknown,min:number,max:number,label:string,multiline=false):string|null{
 if(raw==null||raw==='')return min?(()=>{throw Error(`Uzupełnij pole: ${label}.`)})():null;
 if(typeof raw!=='string')throw Error(`Sprawdź pole: ${label}.`);
 const v=raw.normalize('NFC').replace(multiline?/[ \t]+/g:/\s+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
 if(!v&&!min)return null;
 if(v.length<min||v.length>max)throw Error(`${label}: od ${min} do ${max} znaków.`);
 if(/https?:|www\.|@[a-z0-9-]+\./i.test(v))throw Error(`${label}: bez linków i adresów e-mail.`);
 if(!(multiline?v.split('\n').every(l=>!l||TEXT.test(l)):TEXT.test(v)))throw Error(`${label}: użyj liter, cyfr i zwykłych znaków interpunkcyjnych.`);
 if(rude(v))throw Error(`${label}: zmień treść.`);
 return v;
}
/** Validates and normalises the form; throws an Error with a message for the user. */
export function cleanCampaign(raw:Partial<CampaignInput>):CampaignInput{
 const title=text(raw.title,8,70,'Tytuł')!,place=text(raw.place,3,80,'Miejsce')!,city=text(raw.city,2,50,'Miasto lub gmina')!;
 const budgetName=text(raw.budgetName,0,80,'Nazwa budżetu'),about=text(raw.about,0,400,'Opis',true);
 let budgetUrl:string|null=null;if(raw.budgetUrl){const u=String(raw.budgetUrl).trim();let url:URL;try{url=new URL(u)}catch{throw Error('Link do projektu w budżecie: wklej pełny adres https://…')}if(url.protocol!=='https:'||u.length>300)throw Error('Link do projektu w budżecie musi zaczynać się od https://');budgetUrl=url.toString()}
 let voteUntil:string|null=null;if(raw.voteUntil){const v=String(raw.voteUntil);const t=Date.parse(v+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(t)||t<Date.now()-864e5||t>Date.now()+2*365*864e5)throw Error('Termin głosowania: wybierz datę w ciągu najbliższych dwóch lat.');voteUntil=v}
 const organizer=cleanNickname(raw.organizer);if(organizer===false)throw Error('Pseudonim organizatora: 2–24 litery lub cyfry, bez linków.');
 let email:string|null=null;if(raw.email){const e=String(raw.email).trim().toLowerCase();if(e.length>120||!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/.test(e))throw Error('Sprawdź adres e-mail.');email=e}
 return {title,place,city,budgetName,budgetUrl,voteUntil,organizer,about,email};
}
export const daysLeft=(until:string|null)=>until?Math.ceil((Date.parse(until+'T23:59:59+01:00')-Date.now())/864e5):null;
