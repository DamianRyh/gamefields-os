"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {Minus,Plus,ShoppingBag,Send} from "lucide-react";
import {canBuy,cartLink,inquiryLink,shippingNote,zl,type ShopData,type ShopLine} from "@/lib/shop";

/* Price, quantity and the order button of one Studio product.
   Payments on: "Do koszyka" (all lines in one link to the gamefields.eu cart). Payments off: "Zamów" opens the
   contact form with the design, quantity and price filled in. The Studio runs in an iframe, so links target the top window. */
export function StudioShopOrder({shop,lines,note,qty,onQty,unitLabel,extra,shipping}:{
 shop:ShopData;lines:ShopLine[];note:string;qty?:number;onQty?:(q:number)=>void;unitLabel?:string;extra?:string;shipping?:string;
}){
 const {display:tr,locale}=useStudioLanguage();
 const money=(n:number)=>locale==='en'?'PLN '+Math.round(n).toLocaleString('en-GB'):zl(n);
 const total=lines.reduce((s,l)=>s+l.qty*l.price,0),count=lines.reduce((s,l)=>s+l.qty,0);
 const buy=canBuy(shop,lines),unit=lines.length&&lines.every(l=>l.price===lines[0].price)?lines[0].price:null;
 const ship=shipping??shippingNote(shop,total);
 const displayShip=locale==='pl'?ship:shipping?tr(shipping):shop.shipping.free_from!=null&&total>=shop.shipping.free_from?tr('wysyłka gratis'):shop.shipping.cost==null?tr('wysyłkę potwierdzimy'):`Shipping ${money(shop.shipping.cost)}${shop.shipping.free_from!=null?`, free from ${money(shop.shipping.free_from)}`:''}`;
 const text=locale==="en"?`${note} · quantity: ${count} · `+(unit!=null?`price: ${money(unit)} including VAT/item, `:"")+`total ${money(total)} including VAT · ${displayShip}`:`${note} · ilość: ${count} · `+(unit!=null?`cena: ${zl(unit)} brutto/szt., `:"")+`razem ${zl(total)} brutto · ${ship}`;
 const href=buy?cartLink(shop,lines,note):inquiryLink(shop,(locale==="en"?"Studio order: ":"Zamówienie ze Studia: ")+text);
 const set=(q:number)=>onQty?.(Math.max(1,Math.min(999,Math.round(q)||1)));
 return <section className="studio-shop-order" aria-label={tr("Cena i zamówienie")} data-shop-pay={shop.pay?"true":"false"}>
  <div className="studio-shop-row">
   {onQty?<div className="studio-shop-qty" role="group" aria-label={tr("Ilość")}>
    <button type="button" aria-label={tr("Mniej")} disabled={(qty??1)<=1} onClick={()=>set((qty??1)-1)}><Minus size={16}/></button>
    <input aria-label={tr("Ilość sztuk")} inputMode="numeric" value={qty??1} onChange={e=>set(Number(e.target.value.replace(/\D/g,"")))}/>
    <button type="button" aria-label={tr("Więcej")} onClick={()=>set((qty??1)+1)}><Plus size={16}/></button>
   </div>:<span className="studio-shop-count">{count} {tr('szt.')}</span>}
   <div className="studio-shop-price"><b data-shop-total>{money(total)}</b><small>{unit!=null?`${money(unit)} ${tr("brutto")} / ${unitLabel?tr(unitLabel):locale==="en"?"item":"szt."}`:tr("brutto")}</small></div>
  </div>
  <p className="studio-shop-note">{[extra?tr(extra):undefined,displayShip].filter(Boolean).join(" · ")}</p>
  <a className="studio-primary studio-shop-cta" href={href} target="_top" rel="noopener">{buy?<ShoppingBag size={17}/>:<Send size={17}/>}{tr(buy?"Do koszyka":"Zamów")} · {money(total)}</a>
  {!buy?<p className="studio-hint">{tr('Formularz otworzy się z projektem, ilością i ceną. Potwierdzimy zamówienie mailowo.')}</p>:null}
 </section>;
}
