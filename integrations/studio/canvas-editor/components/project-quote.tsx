"use client";
import type {QuoteState} from "@/hooks/use-project-quote";
/* Courts are quoted individually; shop products (plakat, piłka, koszulki) pass their price as `label`. */
export function QuoteBadge({onClick,label}:{quote:QuoteState;onClick:()=>void;label?:string}){
 return <button className="studio-primary studio-quote-badge" onClick={onClick} aria-label="Podsumowanie"><span>Podsumowanie</span><b>{label||"Indywidualna wycena"}</b></button>;
}
export function ProjectQuote({title="Wycena projektu",label="Wycena projektu",headingLevel=3}:{quote:QuoteState;title?:string;label?:string;headingLevel?:3|5}){
 const Heading=headingLevel===5?'h5':'h3';
 return <section className="studio-project-quote" aria-label={label}><Heading>{title}</Heading><p>Przygotujemy indywidualną wycenę po poznaniu projektu i miejsca realizacji.</p><a href="https://www.gamefields.eu/kontakt/" target="_top">Skontaktuj się w sprawie wyceny →</a></section>;
}
