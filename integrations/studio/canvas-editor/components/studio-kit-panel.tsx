"use client";
import {useRef,useState} from "react";
import {Check,Plus,Trash2,Upload,X} from "lucide-react";
import {addKitPlayer,applyKitPreset,cleanKitNumber,duplicateKitNumbers,kitPreset,kitPresets,kitSizeCounts,kitSizes,setKitFit,KIT_MATERIAL,type KitDesign,type KitPreset} from "@/lib/kit";
import {inquiryLink,useShop,variantPrice,zl} from "@/lib/shop";
import {StudioShopOrder} from "@/components/studio-shop-order";

type Tab="design"|"lettering"|"team";
const MAX_LOGO=1_000_000;

/* Settings for Project.kit. Every change goes through onChange, so undo/redo, the draft and JSON export cover it. */
export function StudioKitPanel({kit,onChange,selected,onSelect,courtPreset}:{
 kit:KitDesign;onChange:(kit:KitDesign)=>void;selected:number;onSelect:(index:number)=>void;courtPreset?:KitPreset;
}){
 const [tab,setTab]=useState<Tab>("design"),[logoError,setLogoError]=useState("");
 const shop=useShop(),counts=kitSizeCounts(kit),sizeText=counts.map(([s,n])=>`${s} × ${n}`).join(", ");
 const note=`Koszulki „${kitPreset(kit.preset).name}” · ${KIT_MATERIAL.toLowerCase()} · ${kit.collar==="v"?"dekolt w serek":"okrągły dekolt"}${kit.sponsor?" · napis "+kit.sponsor:""}${kit.logo?" · herb (plik prześlę mailem)":""} · rozmiary: ${sizeText} · skład: ${kit.players.map(p=>`${p.name||"-"} ${p.number||"-"} ${p.size}`).join("; ")}`;
 const order=kit.fit==="kids"||!shop.shirt?<div className="studio-shop-order"><p className="studio-shop-note">Rozmiary dziecięce: cena na zapytanie.</p><a className="studio-primary studio-shop-cta" href={inquiryLink(shop,"Zapytanie ze Studia: "+note)} target="_top" rel="noopener">Zapytaj o wycenę</a></div>
  :<StudioShopOrder shop={shop} note={note} extra={KIT_MATERIAL} lines={counts.map(([s,n])=>({product:shop.shirt!,value:s,qty:n,price:variantPrice(shop.shirt,s,599)}))}/>;
 const logoRef=useRef<HTMLInputElement>(null);
 const dups=duplicateKitNumbers(kit.players),sizes=kitSizes(kit);
 const setPlayer=(i:number,patch:Partial<KitDesign["players"][number]>)=>onChange({...kit,players:kit.players.map((p,k)=>k===i?{...p,...patch}:p)});

 const readLogo=(file?:File)=>{
  setLogoError("");
  if(!file)return;
  if(!/^image\/(png|jpeg)$/.test(file.type)){setLogoError("Wybierz plik PNG lub JPG.");return;}
  if(file.size>MAX_LOGO){setLogoError("Plik jest za duży. Maksymalnie 1 MB.");return;}
  const r=new FileReader();r.onload=()=>{if(typeof r.result==="string")onChange({...kit,logo:r.result});};r.readAsDataURL(file);
 };

 return <section className="studio-kit-panel" aria-label="Koszulki">
  <nav className="studio-visual-tabs" aria-label="Ustawienia koszulki">{([["design","Wzór"],["lettering","Napisy"],["team","Drużyna"]] as const).map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>

  {tab==="design"?<>
   {courtPreset&&courtPreset.id!==kit.preset?<button className="studio-kit-match" onClick={()=>onChange(applyKitPreset(kit,courtPreset))}>Ten sam wzór co nawierzchnia: <b>{courtPreset.name}</b></button>:null}
   <div className="studio-kit-presets" role="group" aria-label="Wzór z kolekcji Signature">{kitPresets.map(p=><button key={p.id} aria-pressed={kit.preset===p.id} aria-label={p.name} onClick={()=>onChange(applyKitPreset(kit,p))}>
    <span className="studio-kit-swatch"><i style={{background:p.base}}/><i style={{background:p.accent}}/><i style={{background:p.detail}}/></span><b>{p.name}</b>{kit.preset===p.id?<Check size={15}/>:null}
   </button>)}</div>
   <div className="studio-kit-colors">{([["base","Tło"],["accent","Akcent"],["detail","Detal"],["text","Napisy"]] as const).map(([k,label])=><label key={k}>{label}<input type="color" value={kit[k]} onChange={e=>onChange({...kit,[k]:e.target.value})}/></label>)}</div>
   <button className="studio-kit-link" onClick={()=>onChange(applyKitPreset(kit,kitPreset(kit.preset)))}>Przywróć kolory wzoru</button>
   <div className="studio-kit-row">
    <div className="studio-kit-seg" role="group" aria-label="Dekolt">{([["round","Okrągły"],["v","W serek"]] as const).map(([v,l])=><button key={v} aria-pressed={kit.collar===v} onClick={()=>onChange({...kit,collar:v})}>{l}</button>)}</div>
    <div className="studio-kit-seg" role="group" aria-label="Rozmiary">{([["adult","Dorośli"],["kids","Dzieci"]] as const).map(([v,l])=><button key={v} aria-pressed={kit.fit===v} onClick={()=>onChange(setKitFit(kit,v))}>{l}</button>)}</div>
   </div>
   <p className="studio-hint">{KIT_MATERIAL}. Rozmiary dorosłe XS–XXXL.</p>
  </>:null}

  {tab==="lettering"?<>
   <label className="studio-kit-field">Krój cyfr<select value={kit.font} onChange={e=>onChange({...kit,font:e.target.value as KitDesign["font"]})}><option value="block">Blokowy</option><option value="modern">Nowoczesny</option></select></label>
   <label className="studio-kit-field">Napis z przodu<input maxLength={16} value={kit.sponsor} placeholder="np. nazwa klubu" onChange={e=>onChange({...kit,sponsor:e.target.value})}/></label>
   <div className="studio-kit-logo">
    {kit.logo?<img src={kit.logo} alt="Herb na koszulce" width={56} height={56}/>:<span className="studio-kit-logo-empty" aria-hidden="true"/>}
    <button onClick={()=>logoRef.current?.click()}><Upload size={16}/> {kit.logo?"Zmień herb":"Wgraj herb lub logo"}</button>
    {kit.logo?<button aria-label="Usuń herb" onClick={()=>{const {logo:_logo,...rest}=kit;void _logo;onChange(rest);}}><X size={16}/></button>:null}
    <input hidden ref={logoRef} type="file" accept="image/png,image/jpeg" aria-label="Wgraj herb lub logo" onChange={e=>{readLogo(e.target.files?.[0]);e.target.value="";}}/>
   </div>
   {logoError?<p role="alert" className="studio-kit-warn">{logoError}</p>:<p className="studio-hint">PNG z przezroczystym tłem, do 1 MB. Plik do druku dołączysz przy zapytaniu.</p>}
   <p className="studio-hint">Nazwisko i numer ustawiasz dla każdego zawodnika w zakładce Drużyna.</p>
  </>:null}

  {tab==="team"?<>
   <div className="studio-kit-roster">
    <table><thead><tr><th>Nazwisko</th><th>Nr</th><th>Rozmiar</th><th><span className="sr-only">Usuń</span></th></tr></thead>
    <tbody>{kit.players.map((p,i)=><tr key={i} className={(i===selected?"is-selected ":"")+(dups.includes(p.number)?"is-duplicate":"")} onFocusCapture={()=>onSelect(i)} onClick={()=>onSelect(i)}>
     <td><input aria-label={`Nazwisko zawodnika ${i+1}`} maxLength={14} value={p.name} onChange={e=>setPlayer(i,{name:e.target.value})}/></td>
     <td className="is-number"><input aria-label={`Numer zawodnika ${i+1}`} inputMode="numeric" maxLength={2} value={p.number} onChange={e=>setPlayer(i,{number:cleanKitNumber(e.target.value)})}/></td>
     <td className="is-size"><select aria-label={`Rozmiar zawodnika ${i+1}`} value={p.size} onChange={e=>setPlayer(i,{size:e.target.value})}>{sizes.map(s=><option key={s}>{s}</option>)}</select></td>
     <td className="is-remove"><button aria-label={`Usuń zawodnika ${i+1}`} disabled={kit.players.length<2} onClick={e=>{e.stopPropagation();onChange({...kit,players:kit.players.filter((_,k)=>k!==i)});onSelect(Math.max(0,Math.min(selected,kit.players.length-2)));}}><Trash2 size={15}/></button></td>
    </tr>)}</tbody></table>
   </div>
   {dups.length?<p role="alert" className="studio-kit-warn">Numer {dups.join(", ")} powtarza się w drużynie.</p>:null}
   <button className="studio-kit-add" disabled={kit.players.length>=60} onClick={()=>{onChange(addKitPlayer(kit));onSelect(kit.players.length);}}><Plus size={16}/> Dodaj zawodnika</button>
   <dl className="studio-kit-summary">
    <div><dt>Koszulki</dt><dd>{kit.players.length}</dd></div>
    <div><dt>Rozmiary</dt><dd>{kitSizeCounts(kit).map(([s,n])=>`${s} × ${n}`).join(", ")}</dd></div>
    <div><dt>Cena</dt><dd>{kit.fit==="kids"?"na zapytanie":`${zl(variantPrice(shop.shirt,"M",599))} brutto / szt.`}</dd></div>
   </dl>
  </>:null}
  {order}
 </section>;
}
