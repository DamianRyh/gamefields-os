"use client";
/* Surface designer (2026-11-10). One place to build a painted surface: pick a ready project, change its variant,
   pick a palette or set each colour yourself. Merges the Signature Pro directions with the earlier Gamefields library:
   28 ready projects (signaturePresets) and all 41 pattern directions. Replaces the three carousels and the colour popover. */
import {useMemo,useState} from 'react';
import {ChevronLeft,ChevronRight,Shuffle,Check} from 'lucide-react';
import type {Project} from '@/lib/project';
import {PatternArt} from './pattern-art';
import {getPatternFamily,getPatternPalette,patternFamilies,patternPalettes,signaturePresets,patternVariantName,projectPatternColors} from '@/lib/pattern-library';
import '@/app/studio-surface-designer.css';

type Patch=Partial<Project>;
const CATEGORIES=[
 {id:'all',label:'Wszystkie',test:/./},
 {id:'city',label:'Miasto i park',test:/miast|park|plac|dzielnic|miejsk|eco|rynek|rewitaliz|sztuka publiczna/},
 {id:'school',label:'Szkoła i dzieci',test:/szkoł|dzieci|młodzież|zabaw/},
 {id:'club',label:'Klub i turniej',test:/klub|turniej|kibic|sponsor/},
 {id:'street',label:'Street',test:/street|youth|nocne/},
 {id:'brand',label:'Marka i event',test:/marka|event|brand|kampani|moda|aktywacj|festiwal|kultura/},
 {id:'premium',label:'Premium',test:/premium|hotel|lifestyle|hospitality|architektur|muzeum/}
] as const;
type Cat=typeof CATEGORIES[number]['id'];
const SWATCHES:[string,string][]=[['#F8F7F3','Biały'],['#DAD9D5','Jasnoszary'],['#A0A4A5','Szary'],['#30363C','Grafit'],['#17191D','Czarny'],['#D4112A','Czerwony'],['#B90F35','Bordowy'],['#F39236','Pomarańczowy'],['#E9C845','Żółty'],['#D8F24A','Limonka'],['#647453','Oliwkowy'],['#438B5E','Zielony'],['#2B817E','Turkusowy'],['#78B4DC','Błękitny'],['#286EA9','Niebieski'],['#1F2A6B','Granat'],['#6336F5','Fioletowy'],['#E58EB2','Różowy']];

function Swatch({p,h=400}:{p:Project;h?:number}){return <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width={600} height={400} fill={p.base}/><PatternArt p={p} h={h}/></svg>}
function presetPatch(id:string):Patch|null{const preset=signaturePresets.find(x=>x.id===id);if(!preset)return null;const pal=getPatternPalette(preset.paletteId);return {patternFamily:preset.familyId,pattern:getPatternFamily(preset.familyId).name,patternVariant:preset.variant,patternPalette:preset.paletteId,patternColors:undefined,base:pal.colors[4],zone:pal.colors[1],graphicOpacity:100}}

export function StudioSurfaceDesigner({project:p,update}:{project:Project;update:(patch:Patch)=>void}){
 const [cat,setCat]=useState<Cat>('all');
 const [allDirections,setAllDirections]=useState(false);
 const [showAll,setShowAll]=useState(false);
 const [part,setPart]=useState<string>('base');
 const colors=projectPatternColors(p);
 const activePreset=signaturePresets.find(x=>x.familyId===p.patternFamily&&x.variant===p.patternVariant&&x.paletteId===p.patternPalette);
 const family=getPatternFamily(p.patternFamily);
 const variant=Math.max(1,Math.min(12,p.patternVariant||1));
 const list=useMemo(()=>{const c=CATEGORIES.find(x=>x.id===cat)!;return signaturePresets.filter(x=>c.test.test(x.useCase.toLowerCase()))},[cat]);
 const ownColors=!!(p.patternColors&&p.patternColors.length===5);
 /* Colour parts in the order a customer reads the court: the ground first, then the pattern, then lines and surroundings. */
 const parts=[
  {key:'base',label:'Tło pola',value:p.base},
  {key:'zone',label:'Strefa',value:p.zone},
  {key:'c0',label:'Wzór 1',value:colors[0]},
  {key:'c2',label:'Wzór 2',value:colors[2]},
  {key:'c3',label:'Wzór 3',value:colors[3]},
  {key:'lineColor',label:'Linie',value:p.lineColor},
  ...(!p.arenaModel?[{key:'outside',label:'Otoczenie',value:p.outside}]:[])
 ];
 const current=parts.find(x=>x.key===part)||parts[0];
 function setColor(key:string,hex:string){
  if(key==='base'||key==='zone'||key==='lineColor'||key==='outside'){update({[key]:hex} as Patch);return}
  const next=[...colors];next[key==='c0'?0:key==='c2'?2:3]=hex;update({patternColors:next})
 }
 function stepVariant(d:number){update({patternVariant:((variant-1+d+12)%12)+1})}
 return <section className="gfsd" aria-label="Wzór i kolory nawierzchni">
  <div className="gfsd-block">
   <h3 className="gfsd-h">Projekt</h3>
   <div className="gfsd-chips" role="group" aria-label="Zastosowanie">{CATEGORIES.map(c=><button type="button" key={c.id} aria-pressed={cat===c.id} onClick={()=>{setCat(c.id);setShowAll(false)}}>{c.label}</button>)}</div>
   <ul className="gfsd-grid" role="list">{(showAll||list.length<=8?list:list.slice(0,8)).map(x=>{const pal=getPatternPalette(x.paletteId);const on=activePreset?.id===x.id;return <li key={x.id}><button type="button" className="gfsd-card" aria-pressed={on} aria-label={`${x.name}, ${x.useCase}`} onClick={()=>{const patch=presetPatch(x.id);if(patch)update(patch)}}>
    <span className="gfsd-thumb"><Swatch p={{...p,patternFamily:x.familyId,patternVariant:x.variant,patternPalette:x.paletteId,patternColors:undefined,base:pal.colors[4],zone:pal.colors[1],graphicOpacity:100}}/>{on?<i className="gfsd-check"><Check size={14}/></i>:null}</span>
    <span className="gfsd-name">{x.name}</span><span className="gfsd-use">{x.useCase}</span></button></li>})}</ul>
   {!showAll&&list.length>8?<button type="button" className="gfsd-showall" onClick={()=>setShowAll(true)}>Pokaż wszystkie projekty ({list.length})</button>:null}
  </div>

  <div className="gfsd-block">
   <h3 className="gfsd-h">Wariant</h3>
   <div className="gfsd-variant">
    <button type="button" aria-label="Poprzedni wariant" onClick={()=>stepVariant(-1)}><ChevronLeft size={18}/></button>
    <span aria-live="polite"><b>{family.name}</b>{patternVariantName(family.id,variant)} · {variant} z 12</span>
    <button type="button" aria-label="Następny wariant" onClick={()=>stepVariant(1)}><ChevronRight size={18}/></button>
    <button type="button" className="gfsd-shuffle" aria-label="Losowy wariant" onClick={()=>update({patternVariant:1+Math.floor(Math.random()*12),patternSeed:Math.floor(Math.random()*999999)})}><Shuffle size={16}/></button>
   </div>
  </div>

  <div className="gfsd-block">
   <h3 className="gfsd-h">Kolory</h3>
   <p className="gfsd-sub">Gotowa paleta</p>
   <div className="gfsd-palettes" role="group" aria-label="Gotowe palety">{patternPalettes.map(pal=><button type="button" key={pal.id} aria-pressed={p.patternPalette===pal.id&&!ownColors} title={pal.name} aria-label={`Paleta ${pal.name}`} onClick={()=>update({patternPalette:pal.id,patternColors:undefined,base:pal.colors[4],zone:pal.colors[1]})}>{pal.colors.map((c,i)=><i key={i} style={{background:c}}/>)}</button>)}</div>
   <p className="gfsd-sub">Albo własne kolory: wybierz element, potem kolor</p>
   <div className="gfsd-parts" role="group" aria-label="Twoje kolory: wybierz element">{parts.map(x=><button type="button" key={x.key} aria-pressed={current.key===x.key} onClick={()=>setPart(x.key)}><span style={{background:x.value}}/>{x.label}</button>)}</div>
   <div className="gfsd-colors" role="group" aria-label={`Kolor: ${current.label}`}>
    {SWATCHES.map(([hex,name])=><button type="button" key={hex} aria-label={`${current.label}: ${name}`} title={name} aria-pressed={current.value.toLowerCase()===hex.toLowerCase()} onClick={()=>setColor(current.key,hex)}><span style={{background:hex}}/></button>)}
    <label className="gfsd-custom" title="Własny kolor"><input type="color" aria-label={`${current.label}: własny kolor`} value={current.value} onChange={e=>setColor(current.key,e.target.value)}/><span>Własny</span></label>
   </div>
   <p className="gfsd-note">{current.label}: {current.value.toUpperCase()}{ownColors?<> · <button type="button" className="gfsd-link" onClick={()=>update({patternColors:undefined})}>przywróć kolory palety</button></>:null}</p>
  </div>

  <details className="gfsd-block gfsd-more" open={allDirections} onToggle={e=>setAllDirections(e.currentTarget.open)}>
   <summary>Wszystkie kierunki wzoru ({patternFamilies.length})</summary>
   {allDirections?<ul className="gfsd-grid gfsd-grid-small" role="list">{patternFamilies.map(f=><li key={f.id}><button type="button" className="gfsd-card" aria-pressed={p.patternFamily===f.id} onClick={()=>update({patternFamily:f.id,pattern:f.name})}><span className="gfsd-thumb"><Swatch p={{...p,patternFamily:f.id,patternVariant:variant}}/></span><span className="gfsd-name">{f.name}</span></button></li>)}</ul>:null}
  </details>
 </section>;
}
