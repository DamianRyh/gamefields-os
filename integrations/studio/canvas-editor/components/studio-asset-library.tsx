"use client";
/* Surface building blocks 2026-11-10: a library of real-size assets, ready layouts and an editor for the selected
   asset (size in metres, colours from the project, mirror copy for the other half, layer order). */
import {useMemo,useState} from "react";
import {AlignCenter,ArrowDown,ArrowUp,Copy,FlipHorizontal2,Trash2,X} from "lucide-react";
import type {EditorObject,Project} from "@/lib/project";
import {projectPatternColors} from "@/lib/pattern-library";
import {assetCategories,assetDataUrl,assetLayouts,defaultAssetColors,fmtM,getAsset,placeLayout,surfaceAssets,type AssetCategory,type AssetLayout,type AssetState,type SurfaceAsset} from "@/lib/surface-assets";
import "@/app/studio-asset-library.css";

export const projectColorsFor=(p:Project)=>[...projectPatternColors(p),p.lineColor].map(c=>c.toUpperCase());
export const assetColorsFor=(p:Project,asset:SurfaceAsset)=>defaultAssetColors(projectColorsFor(p),p.base,asset.slots);
const SWATCHES:[string,string][]=[['#FFFFFF','Biały'],['#DAD9D5','Jasnoszary'],['#30363C','Grafit'],['#17191D','Czarny'],['#D4112A','Czerwony'],['#F39236','Pomarańczowy'],['#E9C845','Żółty'],['#D8F24A','Limonka'],['#438B5E','Zielony'],['#2B817E','Turkusowy'],['#78B4DC','Błękitny'],['#286EA9','Niebieski'],['#1F2A6B','Granat'],['#6336F5','Fioletowy'],['#E58EB2','Różowy']];
const size=(w:number,h:number)=>`${fmtM(w)} × ${fmtM(h)} m`;

function LayoutPreview({p,layout}:{p:Project;layout:AssetLayout}){
 const H=600*p.width/p.length;const placed=useMemo(()=>placeLayout(layout,p,a=>assetColorsFor(p,a)),[layout,p]);
 return <svg viewBox={`0 0 600 ${H}`} aria-hidden="true" preserveAspectRatio="xMidYMid meet"><rect width="600" height={H} fill={p.base}/>{placed.map((x,i)=><g key={i} transform={`translate(${x.x} ${x.y}) rotate(${x.rotation}) scale(${x.scale/100})`}><image href={assetDataUrl(x.asset,x.state)} x="-55" y="-55" width="110" height="110"/></g>)}</svg>;
}

export function StudioAssetLibrary({project:p,onAdd,onLayout}:{project:Project;onAdd:(asset:SurfaceAsset)=>void;onLayout:(layout:AssetLayout)=>void}){
 const [cat,setCat]=useState<AssetCategory>('zones');const c=assetCategories.find(x=>x.id===cat)!;
 const list=surfaceAssets.filter(a=>a.category===cat);
 const thumbs=useMemo(()=>new Map(list.map(a=>[a.id,assetDataUrl(a,{w:a.w,h:a.h,colors:assetColorsFor(p,a)})])),[list,p.base,p.zone,p.patternPalette,p.patternColors,p.lineColor]);// eslint-disable-line react-hooks/exhaustive-deps
 const layouts=assetLayouts.filter(l=>Math.max(p.length,p.width)>=l.minLength);
 return <section className="gfal" aria-label="Elementy nawierzchni">
  <p className="gfal-intro">Złóż nawierzchnię z elementów w prawdziwej skali. Kliknij element, a pojawi się na środku planu. Potem przeciągnij go na miejsce.</p>
  {layouts.length?<div className="gfal-block"><h3 className="gfal-h">Gotowe układy</h3><ul className="gfal-layouts" role="list">{layouts.map(l=><li key={l.id}><button type="button" className="gfal-layout" onClick={()=>onLayout(l)} aria-label={`Dodaj układ: ${l.name}`}><span className="gfal-layout-art"><LayoutPreview p={p} layout={l}/></span><b>{l.name}</b><small>{l.note}</small></button></li>)}</ul></div>:null}
  <div className="gfal-block"><h3 className="gfal-h">Elementy</h3>
   <div className="gfal-chips" role="group" aria-label="Rodzaj elementów">{assetCategories.map(x=><button type="button" key={x.id} aria-pressed={cat===x.id} onClick={()=>setCat(x.id)}>{x.label}</button>)}</div>
   <p className="gfal-note">{c.note}</p>
   <ul className="gfal-grid" role="list">{list.map(a=><li key={a.id}><button type="button" className="gfal-card" onClick={()=>onAdd(a)} aria-label={`Dodaj: ${a.name}, ${size(a.w,a.h)}`} title={a.hint}>
    <span className="gfal-thumb" style={{background:p.base}}><img src={thumbs.get(a.id)} alt="" width={96} height={96}/></span><span className="gfal-name">{a.name}</span><span className="gfal-size">{size(a.w,a.h)}</span></button></li>)}</ul>
  </div>
 </section>;
}

export type AssetActions={change:(state:AssetState)=>void;patch:(patch:Partial<EditorObject>)=>void;mirror:()=>void;duplicate:()=>void;center:()=>void;forward:()=>void;backward:()=>void;remove:()=>void;close:()=>void};
export function StudioAssetEditor({project:p,object:o,actions:a}:{project:Project;object:EditorObject;actions:AssetActions}){
 const [slot,setSlot]=useState(0);
 const asset=getAsset(o.asset!.id);const st=o.asset!;if(!asset)return null;
 const long=Math.max(st.w,st.h),maxSide=Math.min(asset.max,Math.max(asset.min,.95*Math.max(p.length,p.width)));
 const resize=(side:number)=>{const k=Math.min(maxSide,Math.max(asset.min,side))/long;a.change({...st,w:Math.round(st.w*k*100)/100,h:Math.round(st.h*k*100)/100})};
 const own=[...new Set(projectColorsFor(p))];const upm=600/p.length,H=600*p.width/p.length;
 const active=Math.min(slot,asset.slots-1);
 const setColor=(hex:string)=>{const colors=[...st.colors];colors[active]=hex.toUpperCase();a.change({...st,colors})};
 const slotName=(i:number)=>asset.slots===1?'Kolor':`Kolor ${i+1}`;
 return <section className="gfae" aria-label={`Edycja elementu: ${o.name}`}>
  <header><div><h2>{o.name}</h2><small>{size(st.w,st.h)}</small></div><button type="button" aria-label="Zamknij edycję elementu" onClick={a.close}><X size={18}/></button></header>
  <label className="gfae-range"><span>Rozmiar <b>{fmtM(long)} m</b></span><input type="range" aria-label="Rozmiar w metrach" min={asset.min} max={maxSide} step={.1} value={long} onChange={e=>resize(Number(e.target.value))}/></label>
  <div className="gfae-row"><span>Obrót <b>{o.rotation}°</b></span><div className="gfae-seg" role="group" aria-label="Obrót">{[0,45,90,135,180].map(r=><button type="button" key={r} aria-pressed={((o.rotation%360)+360)%360===r} onClick={()=>a.patch({rotation:r>180?r-360:r})}>{r}°</button>)}</div></div>
  <div className="gfae-colors">
   {asset.slots>1?<div className="gfae-slots" role="group" aria-label="Kolorowana część">{st.colors.map((c,i)=><button type="button" key={i} aria-pressed={active===i} onClick={()=>setSlot(i)}><i style={{background:c}}/>{slotName(i)}</button>)}</div>:<span className="gfae-label">Kolor</span>}
   <span className="gfae-sub">Kolory projektu</span>
   <div className="gfae-swatches">{own.map(c=><button type="button" key={'p'+c} aria-label={`${slotName(active)}: kolor projektu ${c}`} aria-pressed={st.colors[active]?.toUpperCase()===c} onClick={()=>setColor(c)}><i style={{background:c}}/></button>)}</div>
   <span className="gfae-sub">Więcej kolorów</span>
   <div className="gfae-swatches">{SWATCHES.map(([c,n])=><button type="button" key={c} aria-label={`${slotName(active)}: ${n}`} aria-pressed={st.colors[active]?.toUpperCase()===c} onClick={()=>setColor(c)}><i style={{background:c}}/></button>)}<label className="gfae-custom" title="Własny kolor"><input type="color" aria-label={`${slotName(active)}: własny kolor`} value={st.colors[active]} onChange={e=>setColor(e.target.value)}/></label></div>
  </div>
  <div className="gfae-actions">
   <button type="button" onClick={a.mirror}><FlipHorizontal2 size={16}/>Lustrzana kopia</button>
   <button type="button" onClick={a.duplicate}><Copy size={16}/>Duplikuj</button>
   <button type="button" onClick={a.center}><AlignCenter size={16}/>Wyśrodkuj</button>
   <button type="button" onClick={a.forward}><ArrowUp size={16}/>Na wierzch</button>
   <button type="button" onClick={a.backward}><ArrowDown size={16}/>Pod spód</button>
   <button type="button" className="gfae-remove" onClick={a.remove}><Trash2 size={16}/>Usuń</button>
  </div>
  <details className="gfae-pos"><summary>Dokładna pozycja</summary><div>
   <label>Od lewej (m)<input type="number" step={.1} min={0} max={p.length} value={Math.round(o.x/upm*10)/10} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v))a.patch({x:Math.min(600,Math.max(0,v*upm))})}}/></label>
   <label>Od góry (m)<input type="number" step={.1} min={0} max={p.width} value={Math.round(o.y/upm*10)/10} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v))a.patch({y:Math.min(H,Math.max(0,v*upm))})}}/></label>
  </div></details>
  <p className="gfae-hint">Na planie przeciągnij element. Przyciąga się do siatki co 25 cm i do osi boiska.</p>
 </section>;
}
