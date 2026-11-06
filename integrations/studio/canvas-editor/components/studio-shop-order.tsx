"use client";
import {Minus,Plus,ShoppingBag,Send} from "lucide-react";
import {canBuy,cartLink,inquiryLink,shippingNote,zl,type ShopData,type ShopLine} from "@/lib/shop";

/* Price, quantity and the order button of one Studio product.
   Payments on: "Do koszyka" (all lines in one link to the gamefields.eu cart). Payments off: "Zamów" opens the
   contact form with the design, quantity and price filled in. The Studio runs in an iframe, so links target the top window. */
export function StudioShopOrder({shop,lines,note,qty,onQty,unitLabel,extra}:{
 shop:ShopData;lines:ShopLine[];note:string;qty?:number;onQty?:(q:number)=>void;unitLabel?:string;extra?:string;
}){
 const total=lines.reduce((s,l)=>s+l.qty*l.price,0),count=lines.reduce((s,l)=>s+l.qty,0);
 const buy=canBuy(shop,lines),unit=lines.length&&lines.every(l=>l.price===lines[0].price)?lines[0].price:null;
 const text=`${note} · ilość: ${count} · `+(unit!=null?`cena: ${zl(unit)} brutto/szt., `:"")+`razem ${zl(total)} brutto · ${shippingNote(shop,total)}`;
 const href=buy?cartLink(shop,lines,note):inquiryLink(shop,"Zamówienie ze Studia: "+text);
 const set=(q:number)=>onQty?.(Math.max(1,Math.min(999,Math.round(q)||1)));
 return <section className="studio-shop-order" aria-label="Cena i zamówienie" data-shop-pay={shop.pay?"true":"false"}>
  <div className="studio-shop-row">
   {onQty?<div className="studio-shop-qty" role="group" aria-label="Ilość">
    <button type="button" aria-label="Mniej" disabled={(qty??1)<=1} onClick={()=>set((qty??1)-1)}><Minus size={16}/></button>
    <input aria-label="Ilość sztuk" inputMode="numeric" value={qty??1} onChange={e=>set(Number(e.target.value.replace(/\D/g,"")))}/>
    <button type="button" aria-label="Więcej" onClick={()=>set((qty??1)+1)}><Plus size={16}/></button>
   </div>:<span className="studio-shop-count">{count} szt.</span>}
   <div className="studio-shop-price"><b data-shop-total>{zl(total)}</b><small>{unit!=null?`${zl(unit)} brutto / ${unitLabel||"szt."}`:"brutto"}</small></div>
  </div>
  <p className="studio-shop-note">{[extra,shippingNote(shop,total)].filter(Boolean).join(" · ")}</p>
  <a className="studio-primary studio-shop-cta" href={href} target="_top" rel="noopener">{buy?<ShoppingBag size={17}/>:<Send size={17}/>}{buy?"Do koszyka":"Zamów"} · {zl(total)}</a>
  {!buy?<p className="studio-hint">Formularz otworzy się z projektem, ilością i ceną. Potwierdzimy zamówienie mailowo.</p>:null}
 </section>;
}
