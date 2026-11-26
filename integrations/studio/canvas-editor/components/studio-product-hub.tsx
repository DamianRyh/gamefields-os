'use client';
import {useStudioLanguage} from "@/components/studio-language";
import {MAT_PRODUCT_ENABLED,matNet,matPrintNet} from '@/lib/mat-product';
import {FolderOpen} from 'lucide-react';
import {useEffect,useState} from 'react';
import '@/app/studio-products.css';
import '@/app/studio-shop.css';
import '@/app/studio-hub-2026-11.css';
import {useShop,zl,type ShopData} from '@/lib/shop';
/* Price shown on each card, so the cost is clear before anyone starts designing. */
function cardPrice(id:string,shop:ShopData){
 if(id==='mat')return 'od '+zl(matNet({length:2,width:1})+matPrintNet({length:2,width:1}))+' netto';
 if(id==='poster'){const v=shop.poster?.variants?.map(x=>x.price)??[shop.poster?.price??99];return 'od '+zl(Math.min(...v))+' brutto';}
 if(id==='ball')return zl(shop.ball?.price??999)+' brutto';
 if(id==='kit')return zl(shop.shirt?.price??599)+' brutto / szt.';
 return 'Wycena indywidualna';
}
export type StudioEntry='court'|'surface'|'mat'|'poster'|'ball'|'kit';
const products=[
 {id:'court',name:'Boiska',image:'/product-studio/hub-court.webp',description:'Osiem modeli konstrukcji. Kolory, nawierzchnię i grafikę wybierasz sam.',cta:'Projektuj boisko'},
 {id:'surface',name:'Nawierzchnie',image:'/product-studio/hub-surface.webp',description:'Wzory z biblioteki Studio na nowe boisko albo istniejący plac.',cta:'Wybierz wzór'},
 {id:'mat',name:'Maty treningowe',image:'/surfaces/catalogue/maty-gumowe-macro.webp',description:'Gumowa mata z ćwiczeniami ze Studio: slalom, drabinka, strefy podań. Dowolna wielkość, wysyłka gotowej maty.',cta:'Zaprojektuj matę'},
 {id:'poster',name:'Plakaty',image:'/product-studio/poster-existing.svg',description:'Twoje boisko na ścianie. Formaty 30×40, 50×70 i 70×100 cm.',cta:'Zaprojektuj plakat'},
 {id:'ball',name:'Piłki',image:'/product-studio/hub-ball.webp',description:'32 panele. Wzory i kolory Gamefields.',cta:'Projektuj piłkę'},
 {id:'kit',name:'Koszulki',image:'/product-studio/hub-kit.webp',description:'Krój, wzór, kolory i personalizacja drużyny.',cta:'Projektuj koszulkę'}] as const;
/* Launch scope (owner, 2026-11-08): courts, surfaces and posters are on sale; balls and t-shirts come back after the launch.
   Their editors stay in the code; ?all=1 (kept for the browser tab) shows them for previews and tests. */
/* Training mats as a product are withdrawn (owner, 2026-11-16): rubber mats stay a surface finish. The editor stays dormant (?all=1). */
const LAUNCH_HIDDEN=new Set<StudioEntry>(['ball','kit',...(MAT_PRODUCT_ENABLED?[]:['mat' as const])]);
function showAll(){try{if(new URLSearchParams(window.location.search).has('all'))sessionStorage.setItem('gf-studio-all','1');return sessionStorage.getItem('gf-studio-all')==='1'}catch{return false}}
/* Product chooser, redesign 2026-11-09: the same colour fields and court lines as the collection wall on gamefields.eu.
   Courts are the main product and get the large field; surfaces and posters sit beside it. */
function CourtLines(){return <span className="hub26-lines" aria-hidden="true"><i/><i/><i/><i/></span>}
export function StudioProductHub({onSelect,onProjects,onContinue}:{onSelect:(kind:StudioEntry)=>void;onProjects:()=>void;onContinue:()=>void}){
 const {display:tr,locale,setLocale}=useStudioLanguage();
 const shop=useShop();const [all,setAll]=useState(false);useEffect(()=>{if(showAll())setAll(true)},[]);
 const list=products.filter(p=>all||!LAUNCH_HIDDEN.has(p.id));
 return <div className="product-hub hub26" data-product-hub data-count={list.length}>
  <header className="product-hub-header"><a href="https://www.gamefields.eu/" target="_top" aria-label={tr("Gamefields — strona główna")}><span className="hub-brand-wordmark">gamefields.</span></a><nav aria-label={tr("Nawigacja Studia")}><button className="hub-active" aria-current="page">Studio</button><button onClick={onProjects}>{tr("Moje projekty")}</button></nav><select aria-label={locale==="en"?"Language":"Język"} value={locale} onChange={e=>setLocale(e.target.value==="en"?"en":"pl")}><option value="pl">PL</option><option value="en">EN</option></select><button className="hub-set" onClick={onContinue}><FolderOpen size={20}/>{tr("Kontynuuj projekt")}</button></header>
  <main className="hub26-main">
   <div className="hub26-intro"><h1>{tr("Co projektujemy?")}</h1><p>{tr("Wybierz, od czego zaczynasz. Projekt zapiszesz i wyślesz do wyceny w każdej chwili.")}</p></div>
   <section className="hub26-wall product-hub-grid" aria-label={tr("Wybierz produkt")}>
    {list.map(p=><button key={p.id} type="button" aria-label={tr(p.name)} aria-describedby={'hub-desc-'+p.id+' hub-price-'+p.id} className={'product-hub-card hub26-tile hub26-'+p.id} onClick={()=>onSelect(p.id)}>
     {p.id==='surface'||p.id==='mat'?<img className="hub26-fill" src={p.image} alt="" width={1200} height={800} decoding="async"/>:null}
     {p.id!=='surface'&&p.id!=='poster'&&p.id!=='mat'?<CourtLines/>:null}
     {p.id!=='surface'&&p.id!=='mat'?<img className="hub26-art" src={p.image} alt="" width={960} height={540} decoding="async" loading={p.id==='ball'||p.id==='kit'?'lazy':undefined} fetchPriority={p.id==='court'?'high':undefined}/>:null}
     <span className="hub26-text"><span className="hub26-name">{tr(p.name)}</span><span className="hub26-desc" id={'hub-desc-'+p.id}>{tr(p.description)}</span></span>
     <span className="hub26-foot"><span className="hub26-price" id={'hub-price-'+p.id} data-card-price>{locale==="en"?cardPrice(p.id,shop).replace(/^od /,"from ").replace(/ brutto \/ szt\.$/," incl. VAT / item").replace(/ brutto$/," incl. VAT").replace(/ netto$/," excl. VAT").replace("Wycena indywidualna","Individual quotation"):cardPrice(p.id,shop)}</span><span className="hub26-go" aria-hidden="true">{tr(p.cta)}</span></span>
    </button>)}
   </section>
  </main>
 </div>}
