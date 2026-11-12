"use client";
import type {QuoteState} from "@/hooks/use-project-quote";
import {formatPriceRange,priceRange} from "@/lib/price-range";

const money=(value:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(value);
const qty=(value:number)=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:2}).format(value);

/* Shop products (plakat, piłka, koszulki) pass their exact price as `label`. Courts show an indicative range. */
export function QuoteBadge({quote,onClick,label}:{quote:QuoteState;onClick:()=>void;label?:string}){
 const range=priceRange(quote.data);
 const text=label||(quote.loading?"Przeliczam…":range?formatPriceRange(range):"Indywidualna wycena");
 return <button className="studio-primary studio-quote-badge" onClick={onClick} aria-label="Podsumowanie"><span>Podsumowanie</span><b>{text}</b></button>;
}

export function ProjectQuote({quote,title="Cena orientacyjna",label="Cena orientacyjna projektu",headingLevel=3}:{quote:QuoteState;title?:string;label?:string;headingLevel?:3|5}){
 const Heading=headingLevel===5?'h5':'h3';
 const data=quote.data,range=priceRange(data);
 const contact=<a href="https://www.gamefields.eu/kontakt/" target="_top">Poproś o ofertę dla tego projektu →</a>;
 if(!range&&!quote.loading)return <section className="studio-project-quote" aria-label={label}><Heading>Wycena projektu</Heading><p>Przygotujemy indywidualną wycenę po poznaniu projektu i miejsca realizacji.</p>{quote.error?<button type="button" onClick={quote.retry}>Spróbuj przeliczyć ponownie</button>:null}{contact}</section>;
 return <section className="studio-project-quote" aria-label={label} aria-busy={quote.loading}>
  <Heading>{title}</Heading>
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
