import type {ProjectQuote} from "../quote-engine";
import type {PriceRange} from "../price-range";
import {formatPriceRange} from "../price-range";
type Display=(text:string)=>string;
export function quoteDisplayLabel(text:string,tr:Display):string{
 return text.split(" · ").map(part=>tr(part.replace(/^wykonanie (\d+\/4)$/,"wykonanie $1"))).map(part=>part.replace(/^wykonanie (\d+\/4)$/,(_,n)=>tr("wykonanie")+" "+n)).join(" · ");
}
export function quoteDisplayNote(text:string,tr:Display,locale:string):string{
 if(locale!=="en")return text;
 const exact=tr(text);if(exact!==text)return exact;
 const match=text.match(/^Około ([\d, .]+) m² × ([\d.]+) zł\/m² netto\. (.*)$/);
 if(match){const tail=match[3],auto=tail.endsWith(" Wariant dobrany do projektu.");const description=auto?tail.slice(0,-" Wariant dobrany do projektu.".length):tail;return "Approx. "+match[1].replace(",",".")+" m² × PLN "+match[2]+"/m² excl. VAT. "+tr(description)+(auto?" "+tr("Wariant dobrany do projektu."):"");}
 return text;
}
export function quoteRangeDisplay(range:PriceRange,locale:string):string{
 if(locale!=="en")return formatPriceRange(range);
 const f=(n:number)=>new Intl.NumberFormat("en-GB",{maximumFractionDigits:0}).format(n);
 return range.high===null?"from PLN "+f(range.low)+" excl. VAT":"PLN "+f(range.low)+"–"+f(range.high)+" excl. VAT";
}
export function finishItemId(q:ProjectQuote|null|undefined){
 return q?.items.find(i=>["paint","epdm","tiles","turf","acrylic","rubber","mats","finish-surface"].includes(i.id))?.id;
}
