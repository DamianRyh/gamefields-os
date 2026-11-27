'use client';
import {useStudioLanguage} from "@/components/studio-language";
import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {Project} from '@/lib/project';
import type {QuoteState} from '@/hooks/use-project-quote';
import {quoteDisplayLabel} from '@/lib/i18n/quote-display';
import {PannaStudioPreview} from '@/components/blender-arena-preview';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]!);

/** One A4 page: top view, parameters, indicative price range and contact. Printed from a hidden iframe, so the
 * customer saves it as PDF with the system print dialog (desktop and phone), without a popup or a PDF library. */
export type CardSection={title:string;rows:[string,string][]};
const cell=(v:string)=>/^#[0-9a-f]{6}$/i.test(v)?`<span class="sw" style="background:${v}"></span>${esc(v.toUpperCase())}`:esc(v);
export function projectCardHtml({project,sections,quote,image,date,locale='pl',translate=(text:string)=>text}:{project:Project;sections:CardSection[];quote:QuoteState['data'];image:string;date:string;locale?:'pl'|'en';translate?:(text:string)=>string}){
 const tr=(text:string)=>esc(translate(text));
 const money=(v:number)=>new Intl.NumberFormat(locale==='en'?'en-GB':'pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(v);
 const arena=quote?.items.find(i=>i.id==='arena');
 const base=quote?.items.find(i=>i.id==='concrete-base'),finish=quote?.items.find(i=>i.id==='paint'||i.id==='epdm'||i.id==='tiles'||i.id==='turf'||i.id==='acrylic'||i.id==='rubber'||i.id==='mats'||i.id==='finish-surface');
 const print=quote?.items.find(i=>i.id==='mat-print');
 const split=(arena?.totalNet!=null||!project.arenaModel)&&(base?.totalNet!=null||finish?.totalNet!=null);
 const total=(arena?.totalNet??0)+(base?.totalNet??0)+(finish?.totalNet??0)+(print?.totalNet??0);
 const rows=split?`<table>${arena?.totalNet!=null?`<tr><td>${tr("Konstrukcja boiska z bramkami")}</td><td>${esc(money(arena.totalNet))}</td></tr>`:''}${base?.totalNet!=null?`<tr><td>${tr("Nawierzchnia betonowa bez wykończenia (płyta 12 cm z podbudową)")}</td><td>${esc(money(base.totalNet))}</td></tr>`:''}<tr><td>${finish?esc(quoteDisplayLabel(finish.label,translate)):tr("Wykończenie nawierzchni")}</td><td>${finish?.totalNet!=null?esc(money(finish.totalNet)):finish?tr("do wyceny"):'—'}</td></tr>${print?.totalNet!=null?`<tr><td>${tr("Nadruk ćwiczeń na macie")}</td><td>${esc(money(print.totalNet))}</td></tr>`:''}<tr><td><b>${tr("Razem")}</b></td><td><b>${esc(money(total))}</b></td></tr></table>`:'';
 const price=split?`<section class="price"><h2>${arena?.totalNet!=null?tr("Cena konstrukcji i nawierzchni (netto)"):project.matProduct?tr("Cena maty (netto)"):tr("Cena nawierzchni (netto)")}</h2>${rows}<p>${finish?.id==='paint'&&finish.totalNet!=null?tr("Malowanie nie obejmuje napraw podłoża (rysy, szlifowanie). "):finish?.id==='epdm'?tr("Nawierzchnia EPDM wylewana zgodnie z PN-EN 14877; linie sportowe wyceniamy osobno. "):finish?.id==='tiles'?tr("Płytki z montażem, profilami krawędziowymi i podstawowymi liniami. "):finish?.id==='turf'?tr("Trawa z montażem na betonie, zasypem i podstawowymi liniami. "):finish?.id==='acrylic'?tr("Nawierzchnia akrylowa z podstawowymi liniami; przygotowanie podłoża osobno. "):finish?.id==='rubber'?tr("Płyty gumowe klejone na betonie, z profilami krawędziowymi i podstawowymi liniami. "):finish?.id==='mats'&&project.matProduct?tr("Mata wysyłana w całości, gotowa do rozłożenia. "):finish?.id==='mats'?tr("Maty gumowe klejone na betonie, z profilami krawędziowymi i podstawowymi liniami. "):''}${project.arenaModel?tr("Montaż konstrukcji i transport są wyceniane oddzielnie."):project.matProduct?tr("Bez podłoża i montażu. Wysyłkę wyceniamy po podaniu adresu."):tr("Transport wyceniamy oddzielnie.")}</p></section>`
  :arena?.totalNet!=null?`<section class="price"><h2>${tr("Cena konstrukcji")}</h2><p class="big">${esc(money(arena.totalNet))} ${tr("netto")}</p><p>${project.constructionOnly?tr("Zamówienie obejmuje samą konstrukcję z bramkami. Montaż i transport wyceniamy oddzielnie."):tr("Konstrukcja z bramkami. Nawierzchnia, montaż, transport i przygotowanie podłoża są wyceniane oddzielnie.")}</p></section>`
  :`<section class="price"><h2>${project.arenaModel?tr("Wycena konstrukcji"):tr("Wycena nawierzchni")}</h2><p>${tr("Przygotujemy indywidualną wycenę po poznaniu projektu i miejsca realizacji.")}</p></section>`;
 return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${tr("Gamefields — karta projektu — ")}${esc(project.name)}</title><style>
@page{size:A4;margin:14mm}
*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;color:#47132d;font-size:11pt;line-height:1.4}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #47132d;padding-bottom:6mm;margin-bottom:6mm}
.logo{font-weight:800;font-size:22pt;letter-spacing:-.04em}.meta{text-align:right;font-size:9pt;color:#6f5a66}
h1{font-size:20pt;letter-spacing:-.03em;margin:0 0 4mm}h2{font-size:12pt;margin:0 0 3mm}
.img{border:1px solid #e1d9de;border-radius:3mm;padding:2mm;text-align:center;margin-bottom:5mm}.img img{max-width:100%;max-height:88mm}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
dl{margin:0 0 4mm}dl div{display:flex;justify-content:space-between;gap:4mm;border-bottom:1px solid #eee5ea;padding:1.1mm 0;font-size:8.8pt}.sw{display:inline-block;width:3.2mm;height:3.2mm;border-radius:50%;border:1px solid #cfc5ca;vertical-align:-.5mm;margin-right:1.5mm}dt{color:#6f5a66}dd{margin:0;font-weight:700;text-align:right}
.price .big{font-size:20pt;font-weight:800;margin:0 0 2mm;color:#6336f5}.price p{font-size:9pt;margin:0 0 3mm}
table{width:100%;border-collapse:collapse;font-size:8.5pt;table-layout:fixed;margin-bottom:3mm}td{padding:1.2mm 0;border-bottom:1px solid #eee5ea;vertical-align:top}td+td{width:24mm;padding-left:3mm;text-align:right;white-space:nowrap}.grid>section{min-width:0}
footer{margin-top:6mm;padding-top:4mm;border-top:1px solid #e1d9de;font-size:8.5pt;color:#6f5a66;display:flex;justify-content:space-between;gap:6mm}
footer b{color:#47132d}
</style></head><body>
<header><div class="logo">gamefields.</div><div class="meta">${tr("Karta projektu")} · ${esc(date)}<br>Studio Gamefields · gamefields.eu/studio</div></header>
<h1>${esc(project.name)}</h1>
<div class="img"><img src="${image}" alt="${project.constructionOnly?tr("Wizualizacja konstrukcji boiska"):tr("Wizualizacja boiska z wybraną nawierzchnią")}"></div>
<div class="grid"><section>${sections.map(s=>`<h2>${tr(s.title)}</h2><dl>${s.rows.map(([k,v])=>`<div><dt>${tr(k)}</dt><dd>${cell(locale==="en"&&["Materiał","Wariant","Wykończenie konstrukcji","Nawierzchnia betonowa","Logo na panelach","Linie","Kod produktu","Rodzaj gumy"].includes(k)?translate(v):v)}</dd></div>`).join('')}</dl>`).join('')}</section>${price}</div>
<footer><div><b>Damian Gawrych</b> · Gamefields<br>info@gamefields.eu · gamefields.eu/kontakt</div><div>${tr("Wizualizacja koncepcyjna. Cena orientacyjna netto, nie jest ofertą handlową. Ofertę potwierdzimy po sprawdzeniu miejsca realizacji.")}</div></footer>
</body></html>`;
}

export function ProjectCard({project,sections,quote,renderCourt}:{project:Project;sections:CardSection[];quote:QuoteState;renderCourt?:(p:Project)=>ReactNode}){
 const {display:tr,locale,numberLocale}=useStudioLanguage();
 const languageRef=useRef({tr,locale,numberLocale});languageRef.current={tr,locale,numberLocale};
 const [snapshot,setSnapshot]=useState<Project|null>(null),[message,setMessage]=useState(''),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!snapshot)return;const {tr,locale,numberLocale}=languageRef.current;let cancelled=false;void(async()=>{try{
  const plan=!!(snapshot.matProduct&&renderCourt);
  let image='';
  if(plan){
   // Training mat: the 2D plan in real scale is the clearest picture of the drills on the mat.
   await new Promise(r=>setTimeout(r,50));const svg=ref.current?.querySelector('svg');if(!svg)throw Error('Nie udało się przygotować planu maty.');
   const clone=svg.cloneNode(true) as SVGSVGElement;clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
   const vb=svg.viewBox.baseVal;if(vb&&vb.width>190)clone.setAttribute('viewBox',`-6 -6 ${vb.width-190+12} ${vb.height-190+12}`); // the mat only, without the dimension labels
   image='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(clone));
  }else{
  const stage=await new Promise<HTMLElement>((resolve,reject)=>{const host=ref.current;if(!host){reject(Error('Nie udało się przygotować modelu.'));return}let timer=0;const observer=new MutationObserver(check);function check(){const node=host!.querySelector<HTMLElement>('.panna-studio-model');if(node?.dataset.ready==='true'&&node.dataset.renderComplete===node.dataset.renderRequest&&Number(node.dataset.renderComplete)>0){observer.disconnect();clearTimeout(timer);resolve(node)}}observer.observe(host,{subtree:true,attributes:true,childList:true});timer=window.setTimeout(()=>{observer.disconnect();reject(Error('Nie udało się przygotować modelu boiska. Spróbuj ponownie.'))},60000);check()});
  const canvas=stage.querySelector('canvas');if(!canvas)throw Error('Nie udało się przygotować modelu boiska.');
  image=canvas.toDataURL('image/png');
  }
  const date=new Intl.DateTimeFormat(numberLocale,{dateStyle:'long'}).format(new Date());
  const frame=document.createElement('iframe');frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const doc=frame.contentDocument;if(!doc||!frame.contentWindow)throw Error('Ta przeglądarka nie obsługuje drukowania karty.');
  doc.open();doc.write(projectCardHtml({project:snapshot,sections,quote:quote.data,image,date,locale,translate:tr}));doc.close();
  await new Promise(r=>{const img=doc.querySelector('img');if(!img||img.complete)r(null);else{img.onload=()=>r(null);img.onerror=()=>r(null);}});
  if(cancelled)return;
  frame.contentWindow.focus();frame.contentWindow.print();
  setMessage('Otworzyło się okno drukowania. Wybierz „Zapisz jako PDF”.');
  setTimeout(()=>frame.remove(),60000);
 }catch(e){if(!cancelled)setMessage((e as Error).message)}finally{if(!cancelled)setSnapshot(null)}})();return()=>{cancelled=true}},[snapshot,sections,quote.data,renderCourt]);
 return <section className="studio-project-card" aria-label={tr("Karta projektu PDF")}><h3>{tr("Karta projektu")}</h3><p>{tr("Jedna strona A4 z całym zamówieniem: wizualizacja boiska z wybraną nawierzchnią i wzorem, parametry konstrukcji i nawierzchni oraz wycena.")}</p><button type="button" disabled={!!snapshot||quote.loading||(!project.arenaModel&&!project.surfaceModel&&!project.matProduct)} onClick={()=>{setMessage('');setSnapshot(project)}}>{tr(snapshot?'Przygotowuję kartę…':'Pobierz kartę projektu (PDF)')}</button>{!project.arenaModel&&!project.surfaceModel&&!project.matProduct?<p>{tr("Wybierz model konstrukcji albo format nawierzchni, aby przygotować kartę.")}</p>:null}{message?<p role="status">{tr(message)}</p>:null}{snapshot?<div ref={ref} aria-hidden="true" style={{position:'fixed',left:-10000,top:0,width:1200,height:675,overflow:'hidden',pointerEvents:'none'}}>{snapshot.matProduct&&renderCourt?renderCourt(snapshot):snapshot.constructionOnly?<PannaStudioPreview project={{...snapshot,surfaceModel:undefined,objects:[]}} studio structureOnly/>:<PannaStudioPreview project={snapshot} studio view={snapshot.arenaModel?'perspective':'aerial'}/>}</div>:null}</section>;
}
