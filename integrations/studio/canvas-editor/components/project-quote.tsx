"use client";
import type {QuoteState} from "@/hooks/use-project-quote";
export const quoteMoney=(value:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:2}).format(value);
export function QuoteBadge({quote,onClick}:{quote:QuoteState;onClick:()=>void}){
 const amount=quote.data?.priceNet,prefix=quote.data?.workingAssumptions?"Roboczo · ":"";
 return <button className="studio-primary studio-quote-badge" onClick={onClick} aria-label="Podsumowanie" aria-describedby="studio-quote-amount"><span>Podsumowanie</span><b id="studio-quote-amount">{quote.loading?"Przeliczam…":quote.error?"Ponów kalkulację":amount!=null?`${prefix}${quoteMoney(amount)} netto`:quote.data?.knownSubtotalNet!=null?`${prefix}${quoteMoney(quote.data.knownSubtotalNet)} · część wyceny`:"Do ustalenia"}</b></button>;
}
export function ProjectQuote({quote,title="Koszt Twojego projektu",label="Kalkulacja projektu",headingLevel=3}:{quote:QuoteState;title?:string;label?:string;headingLevel?:3|5}){
 const data=quote.data;
 const Heading=headingLevel===5?'h5':'h3';
 return <section className="studio-project-quote" aria-label={label} aria-busy={quote.loading}>
  <Heading>{title}</Heading>
  {data?.workingAssumptions?<p className="studio-working-price"><b>Stawki robocze — do potwierdzenia</b></p>:null}
  {!quote.loading&&data?.notice?<p className="studio-quote-notice">{data.notice}</p>:null}
  <div role="status" aria-live="polite">{quote.loading?<p>Przeliczam aktualną konfigurację…</p>:quote.error?<div><p>Nie udało się przeliczyć ceny. Ustawienia projektu są zachowane.</p><button onClick={quote.retry}>Spróbuj ponownie</button></div>:data?<><p className="studio-quote-total">{data.priceNet!==null?<><strong>{quoteMoney(data.priceNet)}</strong> netto</>:data.knownSubtotalNet!==null?<><strong>{quoteMoney(data.knownSubtotalNet)}</strong> netto za wycenione pozycje</>:<strong>Przygotujemy indywidualną wycenę</strong>}</p>{data.priceGross!==null?<p>{quoteMoney(data.priceGross)} brutto · VAT {Math.round((data.vatRate||0)*10000)/100}%</p>:data.priceNet!==null?<p>Kwota netto. Podatek zostanie potwierdzony w ofercie.</p>:null}{data.status!=="estimated"?<p>Pozycje „Do ustalenia” nie są wliczone. Pełną cenę otrzymasz po ich wycenie.</p>:null}</>:null}</div>
  {!quote.loading&&!quote.error&&data?<><p className="studio-quote-area">{data.areaLabel}: <b>{new Intl.NumberFormat("pl-PL",{maximumFractionDigits:2}).format(data.area)} m²</b></p>
   <details className="studio-quote-scope"><summary>Składniki kalkulacji ({data.items.length})</summary><dl className="studio-quote-items">{data.items.map(item=><div key={item.id}><dt>{item.label}<small>{new Intl.NumberFormat("pl-PL",{maximumFractionDigits:2}).format(item.quantity)} {item.unit}{item.unitNet!==null?` × ${quoteMoney(item.unitNet)} netto`:""}</small>{item.note?<small>{item.note}</small>:null}</dt><dd>{item.totalNet===null?<span className="studio-quote-pending">Do ustalenia</span>:quoteMoney(item.totalNet)}</dd></div>)}</dl></details>
   <details className="studio-quote-scope"><summary>Zakres i założenia kalkulacji</summary><ul>{[...data.assumptions,...data.exclusions].map((text,i)=><li key={i}>{text}</li>)}</ul>{data.rateVersion?<p>Cennik: {data.rateVersion}</p>:<p>Wycenę przygotujemy na podstawie wybranego zakresu.</p>}</details>
  </>:null}
  <p className="studio-quote-footnote">Kalkulacja orientacyjna. Ostateczną cenę i zakres potwierdzimy w ofercie po sprawdzeniu miejsca.</p>
 </section>;
}
