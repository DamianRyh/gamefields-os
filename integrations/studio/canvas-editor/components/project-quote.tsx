"use client";
import type {QuoteState} from "@/hooks/use-project-quote";
import {PRICE_MODE,concreteBasePrice,constructionPrice,formatPriceRange,priceRange} from "@/lib/price-range";
import {CONCRETE_BASE_EXCLUDES,CONCRETE_BASE_INCLUDES} from "@/lib/concrete-base";

const money=(value:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(value);
const qty=(value:number)=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:2}).format(value);
const contact=<a href="https://www.gamefields.eu/kontakt/" target="_top">Poproś o ofertę dla tego projektu →</a>;

/* Shop products (plakat, piłka, koszulki) pass their exact price as `label`.
   Courts: construction price only (PRICE_MODE "construction") or the full-project range ("range"). */
export function QuoteBadge({quote,onClick,label}:{quote:QuoteState;onClick:()=>void;label?:string}){
 let text=label;
 if(!text){
  if(quote.loading)text="Przeliczam…";
  else if(PRICE_MODE==="construction"){const c=constructionPrice(quote.data),b=concreteBasePrice(quote.data);text=c===null?"Indywidualna wycena":b!==null?`Konstrukcja ${money(c)} · Nawierzchnia ${money(b)} netto`:`Konstrukcja: ${money(c)} netto`;}
  else{const r=priceRange(quote.data);text=r?formatPriceRange(r):"Indywidualna wycena";}
 }
 return <button className="studio-primary studio-quote-badge" onClick={onClick} aria-label="Podsumowanie"><span>Podsumowanie</span><b>{text}</b></button>;
}

function Individual({label,Heading,quote}:{label:string;Heading:"h3"|"h5";quote:QuoteState}){
 return <section className="studio-project-quote" aria-label={label}><Heading>Wycena projektu</Heading><p>Przygotujemy indywidualną wycenę po poznaniu projektu i miejsca realizacji.</p>{quote.error?<button type="button" onClick={quote.retry}>Spróbuj przeliczyć ponownie</button>:null}{contact}</section>;
}

export function ProjectQuote({quote,title,label="Cena orientacyjna projektu",headingLevel=3}:{quote:QuoteState;title?:string;label?:string;headingLevel?:3|5}){
 const Heading=headingLevel===5?'h5':'h3';
 const data=quote.data;
 if(PRICE_MODE==="construction"){
  const c=constructionPrice(data),b=concreteBasePrice(data);
  if(c===null&&!quote.loading)return <Individual label={label} Heading={Heading} quote={quote}/>;
  return <section className="studio-project-quote" aria-label={label} aria-busy={quote.loading}>
   <Heading>{title||(b!==null?"Cena konstrukcji i nawierzchni":"Cena konstrukcji")}</Heading>
   <div role="status" aria-live="polite">{quote.loading||c===null?<p>Przeliczam aktualną konfigurację…</p>:b===null?<>
    <p className="studio-quote-total"><strong>{money(c)}</strong> netto</p>
    <p className="studio-quote-range-note">Konstrukcja z bramkami w wybranym modelu. Nawierzchnię, montaż, transport i przygotowanie podłoża wyceniamy indywidualnie, po zdjęciach placu.</p>
   </>:<>
    <dl className="studio-quote-items studio-quote-split"><div><dt>Konstrukcja boiska<small>Konstrukcja z bramkami w wybranym modelu</small></dt><dd>{money(c)} netto</dd></div><div><dt>Nawierzchnia betonowa<small>Płyta 12 cm z podbudową, bez wykończenia</small></dt><dd>{money(b)} netto</dd></div><div><dt>Wykończenie nawierzchni<small>Malowanie, płytki sportowe lub sztuczna trawa — wybór wkrótce</small></dt><dd><span className="studio-quote-pending">Do wyceny</span></dd></div></dl>
    <p className="studio-quote-sum">Razem konstrukcja i nawierzchnia: <strong>{money(c+b)}</strong> netto</p>
    <details className="studio-quote-scope"><summary>Co obejmuje nawierzchnia betonowa</summary><ul>{CONCRETE_BASE_INCLUDES.map(t=><li key={t}>{t}</li>)}</ul><p>Nie obejmuje:</p><ul>{CONCRETE_BASE_EXCLUDES.map(t=><li key={t}>{t}</li>)}</ul></details>
    <p className="studio-quote-range-note">Wykończenie nawierzchni, montaż konstrukcji i transport wyceniamy indywidualnie, po zdjęciach placu.</p>
   </>}</div>
   {contact}
   <p className="studio-quote-footnote">Cena orientacyjna netto, nie jest ofertą handlową.</p>
  </section>;
 }
 const range=priceRange(data);
 if(!range&&!quote.loading)return <Individual label={label} Heading={Heading} quote={quote}/>;
 return <section className="studio-project-quote" aria-label={label} aria-busy={quote.loading}>
  <Heading>{title||"Cena orientacyjna"}</Heading>
  <div role="status" aria-live="polite">{quote.loading||!range||!data?<p>Przeliczam aktualną konfigurację…</p>:<>
   <p className="studio-quote-total"><strong>{formatPriceRange(range)}</strong></p>
   <p className="studio-quote-range-note">{range.high===null?"Część pozycji wymaga indywidualnej wyceny i nie jest wliczona.":"Widełki dla wybranego zakresu: konstrukcja, nawierzchnia, grafika, montaż, projekt i transport."} Bez przygotowania terenu, podbudowy i fundamentów.</p>
   {range.working?<p className="studio-quote-notice">Ceny orientacyjne. Ostateczną ofertę potwierdzimy po sprawdzeniu miejsca realizacji i podłoża.</p>:null}
  </>}</div>
  {!quote.loading&&data&&range?<>
   <details className="studio-quote-scope"><summary>Z czego składa się cena ({data.items.length})</summary><dl className="studio-quote-items">{data.items.map(item=><div key={item.id}><dt>{item.label}<small>{qty(item.quantity)} {item.unit}</small>{item.note?<small>{item.note}</small>:null}</dt><dd>{item.totalNet===null?<span className="studio-quote-pending">Do wyceny</span>:money(item.totalNet)}</dd></div>)}</dl></details>
   <details className="studio-quote-scope"><summary>Zakres i założenia</summary><ul>{[...data.assumptions,...data.exclusions].map((text,i)=><li key={i}>{text}</li>)}</ul></details>
  </>:null}
  {contact}
  <p className="studio-quote-footnote">Kwoty netto. Cena orientacyjna nie jest ofertą handlową.</p>
 </section>;
}
