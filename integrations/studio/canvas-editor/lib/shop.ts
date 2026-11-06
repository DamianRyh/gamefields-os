"use client";
import {useEffect,useState} from "react";

/* Prices and order paths of the Gamefields shop (WooCommerce on gamefields.eu).
   The shop is the single source: GET /wp-json/gfs/v1/shop. The constants below are only the fallback
   used when the shop cannot be reached, and match the prices set by the owner on 2026-11-06 (gross PLN per piece). */

export const SHOP_ORIGIN="https://www.gamefields.eu";
export type ShopVariant={id:number;value:string;price:number;buy?:boolean};
export type ShopProduct={id:number;name:string;price:number;url:string;published:boolean;attribute?:string;variants?:ShopVariant[]};
export type ShopData={pay:boolean;cart:string;contact:string;shipping:{cost:number|null;free_from:number|null};poster:ShopProduct|null;ball:ShopProduct|null;shirt:ShopProduct|null};

export const posterFormats=[
 {value:"30 × 40 cm",ratio:40/30,price:99},
 {value:"50 × 70 cm",ratio:70/50,price:149},
 {value:"70 × 100 cm",ratio:100/70,price:199},
] as const;
export const shirtSizes=["XS","S","M","L","XL","XXL","XXXL"] as const;

export const fallbackShop:ShopData={
 pay:false,cart:SHOP_ORIGIN+"/cart/",contact:SHOP_ORIGIN+"/kontakt/",shipping:{cost:19,free_from:299},
 poster:{id:4393,name:"Plakat z Twoim boiskiem",price:99,url:SHOP_ORIGIN+"/product/plakat-z-twoim-boiskiem/",published:true,attribute:"format",
  variants:posterFormats.map((f,i)=>({id:4401+i,value:f.value,price:f.price,buy:true}))},
 ball:{id:4394,name:"Piłka z Twoim wzorem",price:999,url:SHOP_ORIGIN+"/product/pilka-z-twoim-wzorem/",published:true},
 shirt:{id:4395,name:"Koszulka Gamefields",price:599,url:SHOP_ORIGIN+"/product/koszulka-gamefields/",published:false,attribute:"rozmiar",
  variants:shirtSizes.map((s,i)=>({id:4404+i,value:s,price:599,buy:false}))},
};

let cache:Promise<ShopData>|null=null;
export function loadShop():Promise<ShopData>{
 if(!cache)cache=fetch(SHOP_ORIGIN+"/wp-json/gfs/v1/shop",{credentials:"omit"})
  .then(r=>{if(!r.ok)throw Error("shop "+r.status);return r.json()})
  .then((d:ShopData)=>({...fallbackShop,...d,shipping:{...fallbackShop.shipping,...(d.shipping||{})}}))
  .catch(()=>fallbackShop);
 return cache;
}
export function useShop(){const [shop,setShop]=useState<ShopData>(fallbackShop);useEffect(()=>{let live=true;void loadShop().then(d=>{if(live)setShop(d)});return()=>{live=false}},[]);return shop;}

/* "1 234 zł" with non-breaking spaces, as on gamefields.eu */
export function zl(v:number){return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g," ")+" zł";}

export function shippingNote(shop:ShopData,total:number){
 const {cost,free_from}=shop.shipping;
 if(free_from!=null&&total>=free_from)return "wysyłka gratis";
 if(cost==null)return "wysyłkę potwierdzimy";
 return `wysyłka ${zl(cost)}`+(free_from!=null?`, od ${zl(free_from)} gratis`:"");
}

export function variantPrice(product:ShopProduct|null,value:string,fallback:number){return product?.variants?.find(v=>v.value===value)?.price??product?.price??fallback;}

export type ShopLine={product:ShopProduct;value?:string;qty:number;price:number};

/* A line can go straight to the cart only when payments are on and the product (and its variant) is on sale. */
export function canBuy(shop:ShopData,lines:ShopLine[]){
 return shop.pay&&lines.length>0&&lines.every(l=>l.product.published&&(!l.product.variants||l.product.variants.some(v=>v.value===l.value&&v.buy!==false)));
}

function b64url(s:string){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}

export function cartLink(shop:ShopData,lines:ShopLine[],note:string){
 const items=lines.map(l=>{const v=l.product.variants?.find(x=>x.value===l.value);return v?{id:l.product.id,v:v.id,q:l.qty}:{id:l.product.id,q:l.qty}});
 const q=new URLSearchParams({gf_items:b64url(JSON.stringify(items)),gf_note:note.slice(0,700)});
 return shop.cart+(shop.cart.includes("?")?"&":"?")+q.toString();
}

export function inquiryLink(shop:ShopData,text:string){return shop.contact+"?"+new URLSearchParams({produkt:text.slice(0,3500)}).toString();}
