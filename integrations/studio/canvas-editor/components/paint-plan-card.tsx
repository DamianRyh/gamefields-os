'use client';
import {useEffect,useRef,useState} from 'react';
import type {Project} from '@/lib/project';
import {PatternArt} from '@/components/pattern-art';
import {getPatternFamily} from '@/lib/pattern-library';
import {measureSvg,buildPlan,layerSvg,gridSvg,type PaintPlan} from '@/lib/paint-plan.mjs';

/** Paint plan for the contractor, made from the customer's own design: the pattern is rendered hidden at full
 * opacity (paint is solid), measured on a raster, and printed as three A4 landscape sheets from a hidden iframe,
 * like the project card: drawing with a 1 m setting-out grid and materials, the court after each layer, work order. */
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]!);
const num=(n:number,d=0)=>n.toLocaleString('pl-PL',{minimumFractionDigits:d,maximumFractionDigits:d});

export function paintPlanHtml({project,plan,art,h,date}:{project:Project;plan:PaintPlan;art:string;h:number;date:string}){
 const family=getPatternFamily(project.patternFamily);
 const code=`${family.name} · wariant ${project.patternVariant||1}${project.patternSeed?` · ziarno ${project.patternSeed}`:''}`;
 const svg=(inner:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ${h}">${inner}</svg>`;
 const head=(title:string)=>`<header><div><div class="m">gamefields. · plan malowania</div><h1>${esc(title)}</h1></div><div class="meta"><b>${esc(project.name)}</b><br>${esc(code)}<br>${num(plan.court.length,1)} × ${num(plan.court.width,1)} m = ${num(plan.court.m2,1)} m² · ${esc(date)}</div></header>`;
 const extra=plan.layers.some(l=>l.extraCoat);
 const rows=plan.layers.map(l=>`<tr><td>${l.step}</td><td><span class="sw" style="background:${l.colour}"></span>${l.colour}${l.step===1?' · tło':''}</td><td class="n">${num(l.m2,1)}${l.step===1?`<br><small>widoczne ${num(l.visibleM2,1)}</small>`:''}</td><td class="n">${l.coats}${l.extraCoat?'*':''}</td><td class="n">${num(l.litres,1)}</td><td class="n">${l.tape?num(l.tape):'–'}</td></tr>`).join('');
 const steps=plan.layers.map((l,k)=>`<div class="step">${svg(layerSvg(art,plan,k+1))}<h3><span class="sw" style="background:${l.colour}"></span>Krok ${l.step}${k===0?': tło':''}</h3><p>${num(l.m2,1)} m² · ${l.coats} warstwy · ${num(l.litres,1)} l${l.tape?` · taśma ${num(l.tape)} m`:''}</p></div>`).join('');
 return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Gamefields — plan malowania — ${esc(project.name)}</title><style>
@page{size:A4 landscape;margin:10mm}
*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;color:#1b1418;font-size:10pt;line-height:1.4}
.sheet{break-after:page}.sheet:last-child{break-after:auto}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:8mm;border-bottom:2px solid #47132d;padding-bottom:3mm;margin-bottom:4mm}
h1{font-size:18pt;margin:0;letter-spacing:-.03em;color:#47132d}.m{font-size:7.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6f5a66}.meta{text-align:right;font-size:8.5pt;color:#4a3a42}
.two{display:grid;grid-template-columns:1.6fr 1fr;gap:6mm;align-items:start}.two>*{min-width:0}
svg{display:block;width:100%;height:auto;border:1px solid #cfc7cb}
.facts{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm;margin-bottom:3mm}.facts div{border:1px solid #e3dde0;border-radius:2mm;padding:2mm}.facts b{display:block;font-size:15pt}
table{width:100%;border-collapse:collapse;font-size:8.5pt}th,td{text-align:left;padding:1.3mm 1mm;border-bottom:1px solid #e3dde0;vertical-align:middle}th{font-size:7pt;letter-spacing:.06em;text-transform:uppercase;color:#6f5a66}.n{text-align:right}small{color:#6f5a66}
tfoot td{font-weight:800;border-bottom:0}.sw{display:inline-block;width:3.2mm;height:3.2mm;border-radius:1mm;border:1px solid rgba(0,0,0,.25);vertical-align:-.5mm;margin-right:1.5mm}
.note{font-size:7.8pt;color:#5b4a52;margin-top:2.5mm}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.step h3{font-size:10pt;margin:1.5mm 0 .5mm}.step p{margin:0;font-size:8pt;color:#4a3a42}
ol{margin:0;padding-left:5mm;columns:2;column-gap:8mm}li{margin-bottom:2mm;break-inside:avoid}
</style></head><body>
<section class="sheet">${head('Rysunek i materiały')}<div class="two"><div>${svg(art+gridSvg(h,plan.court.length,plan.court.width))}<p class="note">Siatka co 1 m (pełna linia co 5 m), liczona od lewego górnego narożnika rysunku. Wytycz ją sznurkiem kredowym i przenieś kontury pól.</p></div><div>
<div class="facts"><div><span class="m">Farby</span><b>${plan.totals.paints}</b></div><div><span class="m">Farba razem</span><b>${num(plan.totals.litres,1)} l</b></div><div><span class="m">Taśma</span><b>${num(plan.totals.tape)} m</b></div><div><span class="m">Rolki po ${plan.assumptions.tapeRoll} m</span><b>${plan.totals.tapeRolls}</b></div></div>
<table><thead><tr><th>Krok</th><th>Kolor</th><th class="n">m²</th><th class="n">Warstwy</th><th class="n">Litry</th><th class="n">Taśma, m</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td></td><td>Razem</td><td></td><td></td><td class="n">${num(plan.totals.litres,1)}</td><td class="n">${num(plan.totals.tape)}</td></tr></tfoot></table>
<p class="note">Założenia: ${num(plan.assumptions.litresPerM2,2)} l/m² na warstwę, ${plan.assumptions.coats} warstwy, zapas ${Math.round(plan.assumptions.reserve*100)} %. ${extra?'* Jasny kolor na ciemnym tle: jedna warstwa więcej. ':''}Taśma tylko na granicach z farbą już położoną (każda krawędź oklejana raz). Bez gruntu i linii gry. Zużycie potwierdź kartą techniczną wybranej farby.</p></div></div></section>
<section class="sheet">${head('Warstwy po kolei')}<p style="margin:0 0 3mm">Tło idzie na całe boisko, potem farby od najjaśniejszej do najciemniejszej (ciemna kryje jasną). Pola w odcieniu tła to miejsca na kolejne farby.</p><div class="steps">${steps}</div></section>
<section class="sheet">${head('Kolejność prac')}<ol>
<li>Sprawdź podłoże: beton min. 28 dni, suchy, bez mleczka cementowego. Napraw ubytki i rysy.</li>
<li>Oczyść i zagruntuj według karty technicznej farby (grunt nie jest wliczony w litry).</li>
<li>Krok 1: tło na całym boisku (${num(plan.court.m2,1)} m²), ${plan.layers[0]?.coats??2} warstwy.</li>
<li>Wytycz siatkę co 1 m z rysunku; narożnik 0,0 to lewy górny róg rysunku.</li>
<li>Przenieś kontury pól; łuki ze sznurka od punktu środka, krzywe przez punkty na siatce.</li>
<li>Kroki od 2 do ${plan.layers.length}: oklej granice z farbą już położoną, maluj, zdejmij taśmę, gdy farba jest jeszcze lekko wilgotna.</li>
<li>Zachowaj przerwy między warstwami według karty technicznej (min. ok. 10 °C, bez deszczu).</li>
<li>Na końcu linie gry w kolorze ${esc(project.lines?project.lineColor:'wg projektu')}.</li>
<li>Zrób zdjęcia z góry do dokumentacji i porównania z projektem.</li></ol>
<p class="note">Plan wygenerowany w Studio Gamefields z projektu „${esc(project.name)}”. Kolory farb i zużycie potwierdzamy przy zamówieniu konkretnego produktu. Kontakt: info@gamefields.eu.</p></section>
</body></html>`;
}

export function PaintPlanCard({project}:{project:Project}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),ref=useRef<HTMLDivElement>(null);
 const length=project.length,width=project.width,h=Math.round(600*width/length*10)/10;
 // paint is solid: no transparency, no shadow; the design keeps the customer's rotation, scale and colours
 const solid:Project={...project,graphicOpacity:100,shadowIntensity:0,objects:[]};
 useEffect(()=>{if(!busy)return;let cancelled=false;void(async()=>{try{
  await new Promise(r=>setTimeout(r,60));
  const node=ref.current?.querySelector('svg');if(!node)throw Error('Nie udało się przygotować rysunku wzoru.');
  const clone=node.cloneNode(true) as SVGSVGElement;clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const markup=new XMLSerializer().serializeToString(clone);
  const art=markup.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
  const plan=buildPlan(await measureSvg(markup,h,2),{length,width});
  if(cancelled)return;
  const date=new Intl.DateTimeFormat('pl-PL',{dateStyle:'long'}).format(new Date());
  const frame=document.createElement('iframe');frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);const doc=frame.contentDocument;if(!doc||!frame.contentWindow)throw Error('Ta przeglądarka nie obsługuje drukowania planu.');
  doc.open();doc.write(paintPlanHtml({project,plan,art,h,date}));doc.close();
  frame.contentWindow.focus();frame.contentWindow.print();
  setMessage(`Otworzyło się okno drukowania. Wybierz „Zapisz jako PDF”. ${plan.totals.paints} farb, ok. ${num(plan.totals.litres,1)} l, taśma ${num(plan.totals.tape)} m.`);
  setTimeout(()=>frame.remove(),60000);
 }catch(e){if(!cancelled)setMessage((e as Error).message)}finally{if(!cancelled)setBusy(false)}})();return()=>{cancelled=true}},[busy,h,length,width,project]);
 return <section className="studio-project-card" aria-label="Plan malowania dla wykonawcy"><h3>Plan malowania</h3><p>Trzy strony A4 dla wykonawcy z Twojego wzoru: rysunek z siatką co 1 m do wytyczenia, kolejność farb z litrami i taśmą oraz kolejność prac.</p><button type="button" disabled={busy} onClick={()=>{setMessage('');setBusy(true)}}>{busy?'Przygotowuję plan…':'Pobierz plan malowania (PDF)'}</button>{message?<p role="status">{message}</p>:null}{busy?<div ref={ref} aria-hidden="true" style={{position:'fixed',left:-10000,top:0,width:600,pointerEvents:'none'}}><svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 600 ${h}`} width={600} height={h}><rect width={600} height={h} fill={project.base}/><PatternArt p={solid} h={h}/></svg></div>:null}</section>;
}
