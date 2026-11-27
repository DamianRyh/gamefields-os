"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {quoteDisplayLabel,quoteDisplayNote,quoteRangeDisplay,finishItemId} from "@/lib/i18n/quote-display";
import type {QuoteState} from "@/hooks/use-project-quote";
import {PRICE_MODE,concreteBasePrice,constructionPrice,matPrintPrice,priceRange,surfaceFinish} from "@/lib/price-range";
import {ACRYLIC_NOTES,EPDM_NOTES,MAT_NOTES,PAINT_NOTES,RUBBER_NOTES,TILE_NOTES,TURF_NOTES} from "@/lib/surface-finish";
import {CONCRETE_BASE_EXCLUDES,CONCRETE_BASE_INCLUDES} from "@/lib/concrete-base";

function useQuoteDisplay(){
 const {display:tr,numberLocale,locale}=useStudioLanguage();
 const money=(value:number)=>new Intl.NumberFormat(numberLocale,{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(value);
 const qty=(value:number)=>new Intl.NumberFormat(numberLocale,{maximumFractionDigits:2}).format(value);
 const contact=<a href="https://www.gamefields.eu/kontakt/" target="_top">{tr("Poproś o ofertę dla tego projektu →")}</a>;
 return {tr,money,qty,contact,locale};
}

/* Shop products (plakat, piłka, koszulki) pass their exact price as `label`.
   Courts: construction price only (PRICE_MODE "construction") or the full-project range ("range"). */
export function QuoteBadge({quote,onClick,label}:{quote:QuoteState;onClick:()=>void;label?:string}){
 const {tr,money,locale}=useQuoteDisplay();
 let text=label,short:string|undefined;
 if(!text){
  if(quote.loading)text=tr("Przeliczam…");
  else if(PRICE_MODE==="construction"){const priced=!!quote.data?.constructionPrices,c=priced?constructionPrice(quote.data):null,surface=priced?(concreteBasePrice(quote.data)??0)+(surfaceFinish(quote.data)?.net??0)+(matPrintPrice(quote.data)??0):0;text=c===null?(surface>0?`${surfaceFinish(quote.data)?.label.startsWith("Mata treningowa")?tr("Mata"):tr("Nawierzchnia")} ${money(surface)} ${tr("netto")}`:tr("Indywidualna wycena")):surface>0?`${tr("Konstrukcja")} ${money(c)} · ${tr("Nawierzchnia")} ${money(surface)} ${tr("netto")}`:`${tr("Konstrukcja")}: ${money(c)} ${tr("netto")}`;if(c!==null||surface>0)short=`${money((c??0)+surface)} ${tr("netto")}`;}
  else{const r=priceRange(quote.data);text=r?quoteRangeDisplay(r,locale):tr("Indywidualna wycena");}
 }
 return <button className="studio-primary studio-quote-badge" onClick={onClick} aria-label={tr("Podsumowanie")}><span>{tr("Podsumowanie")}</span><b>{text}</b>{short?<small className="studio-quote-badge-short">{short}</small>:null}</button>;
}

function Individual({label,Heading,quote}:{label:string;Heading:"h3"|"h5";quote:QuoteState}){
 const {tr,contact}=useQuoteDisplay();
 return <section className="studio-project-quote" aria-label={tr(label)}><Heading>{tr("Wycena projektu")}</Heading><p>{tr("Przygotujemy indywidualną wycenę po poznaniu projektu i miejsca realizacji.")}</p>{quote.error?<button type="button" onClick={quote.retry}>{tr("Spróbuj przeliczyć ponownie")}</button>:null}{contact}</section>;
}

export function ProjectQuote({quote,title,label="Cena orientacyjna projektu",headingLevel=3}:{quote:QuoteState;title?:string;label?:string;headingLevel?:3|5}){
 const {tr,money,qty,contact,locale}=useQuoteDisplay();
 const Heading=headingLevel===5?'h5':'h3';
 const data=quote.data;
 if(PRICE_MODE==="construction"){
  // Amounts only with a rate card (owner rule); a standalone surface has no construction row.
  const priced=!!data?.constructionPrices,c=priced?constructionPrice(data):null,b=priced?concreteBasePrice(data):null,f=priced?surfaceFinish(data):null,pr=priced?matPrintPrice(data):null;
  if(c===null&&b===null&&f?.net==null&&!quote.loading)return <Individual label={label} Heading={Heading} quote={quote}/>;
  const split=b!==null||f!==null,total=(c??0)+(b??0)+(f?.net??0)+(pr??0);
  return <section className="studio-project-quote" aria-label={tr(label)} aria-busy={quote.loading}>
   <Heading>{tr(title||(c===null?(f?.label.startsWith("Mata treningowa")?"Cena maty":"Cena nawierzchni"):split?"Cena konstrukcji i nawierzchni":"Cena konstrukcji"))}</Heading>
   <div role="status" aria-live="polite">{quote.loading||(c===null&&!split)?<p>{tr("Przeliczam aktualną konfigurację…")}</p>:!split&&c!==null?<>
    <p className="studio-quote-total"><strong>{money(c)}</strong> {tr("netto")}</p>
    <p className="studio-quote-range-note">{data?.exclusions.some(e=>e.startsWith("Zamówienie obejmuje samą konstrukcję"))?tr("Zamawiasz samą konstrukcję z bramkami. Montaż i transport wyceniamy indywidualnie, po zdjęciach placu."):tr("Konstrukcja z bramkami w wybranym modelu. Nawierzchnię, montaż, transport i przygotowanie podłoża wyceniamy indywidualnie, po zdjęciach placu.")}</p>
   </>:<>
    <dl className="studio-quote-items studio-quote-split">
     {c!==null?<div><dt>{tr("Konstrukcja boiska")}<small>{tr("Konstrukcja z bramkami w wybranym modelu")}</small></dt><dd>{money(c)} {tr("netto")}</dd></div>:null}
     {b!==null?<div><dt>{tr("Nawierzchnia betonowa")}<small>{tr("Płyta 12 cm z podbudową, bez wykończenia")}</small></dt><dd>{money(b)} {tr("netto")}</dd></div>:null}
     <div><dt>{f?quoteDisplayLabel(f.label,tr):tr("Wykończenie nawierzchni")}<small>{quoteDisplayNote(f?.note||"Bez wykończenia. Wykończenie wybierzesz w kroku Nawierzchnia → Materiał.",tr,locale)}</small></dt><dd>{f?.net!=null?`${money(f.net)} ${tr("netto")}`:<span className="studio-quote-pending">{f?tr("Do wyceny"):"—"}</span>}</dd></div>
     {pr!==null?<div><dt>{tr("Nadruk ćwiczeń")}<small>{quoteDisplayNote(data?.items.find(i=>i.id==="mat-print")?.note??"",tr,locale)}</small></dt><dd>{money(pr)} {tr("netto")}</dd></div>:null}
    </dl>
    <p className="studio-quote-sum">{tr("Razem:")} <strong>{money(total)}</strong> {tr("netto")}{f&&f.net===null?tr(" + wykończenie do wyceny"):""}</p>
    {b!==null?<details className="studio-quote-scope"><summary>{tr("Co obejmuje nawierzchnia betonowa")}</summary><ul>{CONCRETE_BASE_INCLUDES.map(t=><li key={t}>{tr(t)}</li>)}</ul><p>{tr("Nie obejmuje:")}</p><ul>{CONCRETE_BASE_EXCLUDES.map(t=><li key={t}>{tr(t)}</li>)}</ul></details>:null}
    {f?.net!=null?<p className="studio-quote-range-note">{finishItemId(data)==="epdm"?tr(EPDM_NOTES[1]):finishItemId(data)==="tiles"?TILE_NOTES.map(tr).join(" "):finishItemId(data)==="turf"?TURF_NOTES.map(tr).join(" "):finishItemId(data)==="acrylic"?ACRYLIC_NOTES.map(tr).join(" "):finishItemId(data)==="rubber"?tr(RUBBER_NOTES[0]):finishItemId(data)==="mats"&&!f.label.startsWith("Mata treningowa")?tr(MAT_NOTES[1]):tr(PAINT_NOTES[1])}</p>:null}
    <p className="studio-quote-range-note">{c!==null?tr("Montaż konstrukcji i transport wyceniamy indywidualnie, po zdjęciach placu."):f?.label.startsWith("Mata treningowa")?tr("Mata wysyłana w całości, gotowa do rozłożenia, bez podłoża i montażu. Wysyłkę wyceniamy po podaniu adresu."):tr("Transport i ewentualne przygotowanie istniejącego placu wyceniamy indywidualnie, po zdjęciach.")}</p>
   </>}</div>
   {contact}
   <p className="studio-quote-footnote">{tr("Cena orientacyjna netto, nie jest ofertą handlową.")}</p>
  </section>;
 }
 const range=priceRange(data);
 if(!range&&!quote.loading)return <Individual label={label} Heading={Heading} quote={quote}/>;
 return <section className="studio-project-quote" aria-label={tr(label)} aria-busy={quote.loading}>
  <Heading>{tr(title||"Cena orientacyjna")}</Heading>
  <div role="status" aria-live="polite">{quote.loading||!range||!data?<p>{tr("Przeliczam aktualną konfigurację…")}</p>:<>
   <p className="studio-quote-total"><strong>{quoteRangeDisplay(range,locale)}</strong></p>
   <p className="studio-quote-range-note">{range.high===null?tr("Część pozycji wymaga indywidualnej wyceny i nie jest wliczona."):tr("Widełki dla wybranego zakresu: konstrukcja, nawierzchnia, grafika, montaż, projekt i transport.")} {tr("Bez przygotowania terenu, podbudowy i fundamentów.")}</p>
   {range.working?<p className="studio-quote-notice">{tr("Ceny orientacyjne. Ostateczną ofertę potwierdzimy po sprawdzeniu miejsca realizacji i podłoża.")}</p>:null}
  </>}</div>
  {!quote.loading&&data&&range?<>
   <details className="studio-quote-scope"><summary>{tr("Z czego składa się cena")} ({data.items.length})</summary><dl className="studio-quote-items">{data.items.map(item=><div key={item.id}><dt>{quoteDisplayLabel(item.label,tr)}<small>{qty(item.quantity)} {tr(item.unit)}</small>{item.note?<small>{quoteDisplayNote(item.note,tr,locale)}</small>:null}</dt><dd>{item.totalNet===null?<span className="studio-quote-pending">{tr("Do wyceny")}</span>:money(item.totalNet)}</dd></div>)}</dl></details>
   <details className="studio-quote-scope"><summary>{tr("Zakres i założenia")}</summary><ul>{[...data.assumptions,...data.exclusions].map((text,i)=><li key={i}>{tr(text)}</li>)}</ul></details>
  </>:null}
  {contact}
  <p className="studio-quote-footnote">{tr("Kwoty netto. Cena orientacyjna nie jest ofertą handlową.")}</p>
 </section>;
}
