'use client';
import {useEffect,useRef,useState} from 'react';
import type {Project} from '@/lib/project';
import type {QuoteState} from '@/hooks/use-project-quote';
import {PannaStudioPreview} from '@/components/blender-arena-preview';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]!);
const money=(v:number)=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(v);

/** One A4 page: top view, parameters, indicative price range and contact. Printed from a hidden iframe, so the
 * customer saves it as PDF with the system print dialog (desktop and phone), without a popup or a PDF library. */
export function projectCardHtml({project,facts,quote,image,date}:{project:Project;facts:[string,string][];quote:QuoteState['data'];image:string;date:string}){
 const arena=quote?.items.find(i=>i.id==='arena');
 const price=arena?.totalNet!=null?`<section class="price"><h2>Cena konstrukcji</h2><p class="big">${esc(money(arena.totalNet))} netto</p><p>Konstrukcja z bramkami. Nawierzchnia, montaż, transport i przygotowanie podłoża są wyceniane oddzielnie.</p></section>`
  :`<section class="price"><h2>Wycena konstrukcji</h2><p>Przygotujemy indywidualną wycenę po poznaniu projektu i miejsca realizacji.</p></section>`;
 return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Gamefields — karta projektu — ${esc(project.name)}</title><style>
@page{size:A4;margin:14mm}
*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;color:#47132d;font-size:11pt;line-height:1.4}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #47132d;padding-bottom:6mm;margin-bottom:6mm}
.logo{font-weight:800;font-size:22pt;letter-spacing:-.04em}.meta{text-align:right;font-size:9pt;color:#6f5a66}
h1{font-size:20pt;letter-spacing:-.03em;margin:0 0 4mm}h2{font-size:12pt;margin:0 0 3mm}
.img{border:1px solid #e1d9de;border-radius:3mm;padding:3mm;text-align:center;margin-bottom:6mm}.img img{max-width:100%;max-height:95mm}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
dl{margin:0}dl div{display:flex;justify-content:space-between;gap:4mm;border-bottom:1px solid #eee5ea;padding:1.6mm 0;font-size:9.5pt}dt{color:#6f5a66}dd{margin:0;font-weight:700;text-align:right}
.price .big{font-size:20pt;font-weight:800;margin:0 0 2mm;color:#6336f5}.price p{font-size:9pt;margin:0 0 3mm}
table{width:100%;border-collapse:collapse;font-size:8.5pt}td{padding:1.2mm 0;border-bottom:1px solid #eee5ea}td+td{text-align:right;white-space:nowrap}
footer{margin-top:6mm;padding-top:4mm;border-top:1px solid #e1d9de;font-size:8.5pt;color:#6f5a66;display:flex;justify-content:space-between;gap:6mm}
footer b{color:#47132d}
</style></head><body>
<header><div class="logo">gamefields.</div><div class="meta">Karta konstrukcji · ${esc(date)}<br>Studio Gamefields · gamefields.eu/studio</div></header>
<h1>${esc(project.name)}</h1>
<div class="img"><img src="${image}" alt="Wizualizacja konstrukcji boiska"></div>
<div class="grid"><section><h2>Parametry</h2><dl>${facts.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>${price}</div>
<footer><div><b>Damian Gawrych</b> · Gamefields<br>info@gamefields.eu · gamefields.eu/kontakt</div><div>Wizualizacja koncepcyjna. Cena orientacyjna netto, nie jest ofertą handlową. Ofertę potwierdzimy po sprawdzeniu miejsca realizacji.</div></footer>
</body></html>`;
}

export function ProjectCard({project,facts,quote}:{project:Project;facts:[string,string][];quote:QuoteState}){
 const [snapshot,setSnapshot]=useState<Project|null>(null),[message,setMessage]=useState(''),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!snapshot)return;let cancelled=false;void(async()=>{try{
  const stage=await new Promise<HTMLElement>((resolve,reject)=>{const host=ref.current;if(!host){reject(Error('Nie udało się przygotować modelu.'));return}let timer=0;const observer=new MutationObserver(check);function check(){const node=host!.querySelector<HTMLElement>('.panna-studio-model');if(node?.dataset.ready==='true'&&node.dataset.renderComplete===node.dataset.renderRequest&&Number(node.dataset.renderComplete)>0){observer.disconnect();clearTimeout(timer);resolve(node)}}observer.observe(host,{subtree:true,attributes:true,childList:true});timer=window.setTimeout(()=>{observer.disconnect();reject(Error('Nie udało się przygotować modelu konstrukcji. Spróbuj ponownie.'))},60000);check()});
  const canvas=stage.querySelector('canvas');if(!canvas)throw Error('Nie udało się przygotować modelu konstrukcji.');
  const image=canvas.toDataURL('image/png');
  const date=new Intl.DateTimeFormat('pl-PL',{dateStyle:'long'}).format(new Date());
  const frame=document.createElement('iframe');frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const doc=frame.contentDocument;if(!doc||!frame.contentWindow)throw Error('Ta przeglądarka nie obsługuje drukowania karty.');
  doc.open();doc.write(projectCardHtml({project:snapshot,facts,quote:quote.data,image,date}));doc.close();
  await new Promise(r=>{const img=doc.querySelector('img');if(!img||img.complete)r(null);else{img.onload=()=>r(null);img.onerror=()=>r(null);}});
  if(cancelled)return;
  frame.contentWindow.focus();frame.contentWindow.print();
  setMessage('Otworzyło się okno drukowania. Wybierz „Zapisz jako PDF”.');
  setTimeout(()=>frame.remove(),60000);
 }catch(e){if(!cancelled)setMessage((e as Error).message)}finally{if(!cancelled)setSnapshot(null)}})();return()=>{cancelled=true}},[snapshot,facts,quote.data]);
 return <section className="studio-project-card" aria-label="Karta konstrukcji PDF"><h3>Karta konstrukcji</h3><p>Jedna strona A4: wizualizacja konstrukcji z bramkami, parametry i cena orientacyjna. Nawierzchnia jest wyceniana oddzielnie.</p><button type="button" disabled={!!snapshot||quote.loading||!project.arenaModel} onClick={()=>{setMessage('');setSnapshot(project)}}>{snapshot?'Przygotowuję kartę…':'Pobierz kartę konstrukcji (PDF)'}</button>{!project.arenaModel?<p>Wybierz model konstrukcji, aby przygotować kartę.</p>:null}{message?<p role="status">{message}</p>:null}{snapshot?<div ref={ref} aria-hidden="true" style={{position:'fixed',left:-10000,top:0,width:1200,height:675,overflow:'hidden',pointerEvents:'none'}}><PannaStudioPreview project={{...snapshot,surfaceModel:undefined,objects:[]}} studio structureOnly/></div>:null}</section>;
}
