"use client";
import {useEffect,useRef,type ReactNode,type KeyboardEvent} from "react";
import "@/app/studio-visual-carousel.css";

export type StudioVisualCarouselItem={id:string;label:string;caption?:string;media:ReactNode};
type Props={items:StudioVisualCarouselItem[];value:string;onChange:(id:string)=>void;label:string;className?:string;compact?:boolean};

/** Native scrolling stays local to the rail; only a deliberate horizontal gesture commits a preview. */
export function StudioVisualCarousel({items,value,onChange,label,className="",compact=false}:Props){
 const rail=useRef<HTMLDivElement>(null);
 const buttons=useRef(new Map<string,HTMLButtonElement>());
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const unlock=useRef<ReturnType<typeof setTimeout>|null>(null);
 const programmatic=useRef(false);
 const horizontalIntent=useRef(false);
 const dragged=useRef(false);
 const pointer=useRef<{x:number;y:number}|null>(null);
 const latest=useRef({items,value,onChange});latest.current={items,value,onChange};
 const index=items.findIndex(item=>item.id===value);
 const selected=items[index];
 const clearSettle=()=>{if(timer.current)clearTimeout(timer.current);};
 const reveal=(id:string)=>{
  const node=buttons.current.get(id),root=rail.current;if(!node||!root)return;
  const left=node.offsetLeft-root.offsetLeft;
  if(left>=root.scrollLeft+8&&left+node.offsetWidth<=root.scrollLeft+root.clientWidth-8)return;
  horizontalIntent.current=false;programmatic.current=true;clearSettle();
  if(unlock.current)clearTimeout(unlock.current);
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.scrollTo({left:Math.max(0,left-(root.clientWidth-node.offsetWidth)/2),behavior:reduced?"auto":"smooth"});
  unlock.current=setTimeout(()=>{programmatic.current=false;},700);
 };
 useEffect(()=>{reveal(value);},[value]); // External changes position the selected card without selecting another one.
 useEffect(()=>()=>{clearSettle();if(unlock.current)clearTimeout(unlock.current);},[]);
 const choose=(id:string,focus=false)=>{
  horizontalIntent.current=false;clearSettle();
  if(id!==latest.current.value)latest.current.onChange(id);
  if(focus)buttons.current.get(id)?.focus({preventScroll:true});
  reveal(id);
 };
 const keyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)||!items.length)return;
  event.preventDefault();
  const focused=items.findIndex(item=>buttons.current.get(item.id)===document.activeElement);
  const current=focused<0?Math.max(0,index):focused;
  const next=event.key==="Home"?0:event.key==="End"?items.length-1:Math.max(0,Math.min(items.length-1,current+(event.key==="ArrowRight"?1:-1)));
  choose(items[next].id,true);
 };
 const settle=()=>{
  clearSettle();
  if(programmatic.current||!horizontalIntent.current)return;
  timer.current=setTimeout(()=>{
   if(programmatic.current||!horizontalIntent.current||!rail.current)return;
   horizontalIntent.current=false;
   const bounds=rail.current.getBoundingClientRect(),center=bounds.left+bounds.width/2;
   let nearest:string|undefined,distance=Infinity;
   for(const item of latest.current.items){const node=buttons.current.get(item.id);if(!node)continue;const rect=node.getBoundingClientRect();const next=Math.abs(rect.left+rect.width/2-center);if(next<distance){distance=next;nearest=item.id;}}
   if(nearest&&nearest!==latest.current.value)latest.current.onChange(nearest);
  },180);
 };
 return <section className={`studio-visual-carousel ${compact?"is-compact":""} ${className}`} aria-label={label} aria-roledescription="karuzela" data-visual-carousel={label}>
  <div className="studio-visual-carousel-heading"><span>{label}</span><div className="studio-visual-carousel-controls"><button type="button" aria-label={`Poprzednia opcja: ${label}`} disabled={index<=0} onClick={()=>choose(items[Math.max(0,index-1)].id)}>←</button><button type="button" aria-label={`Następna opcja: ${label}`} disabled={index>=items.length-1||!items.length} onClick={()=>choose(items[Math.min(items.length-1,index+1)].id)}>→</button></div></div>
  <div className="studio-visual-carousel-rail" ref={rail} data-carousel-rail onKeyDown={keyDown} onScroll={settle}
   onPointerDown={event=>{pointer.current={x:event.clientX,y:event.clientY};horizontalIntent.current=false;dragged.current=false;}}
   onTouchStart={event=>{const t=event.touches[0];pointer.current={x:t.clientX,y:t.clientY};dragged.current=false;}}
   onTouchMove={event=>{const t=event.touches[0];if(!pointer.current)return;const dx=Math.abs(t.clientX-pointer.current.x),dy=Math.abs(t.clientY-pointer.current.y);if(dx>10&&dx>dy*1.3){programmatic.current=false;horizontalIntent.current=true;dragged.current=true;}}}
   onTouchEnd={()=>{pointer.current=null;settle();}}
   onPointerMove={event=>{if(!pointer.current)return;const dx=Math.abs(event.clientX-pointer.current.x),dy=Math.abs(event.clientY-pointer.current.y);if(dx>10&&dx>dy*1.3){programmatic.current=false;horizontalIntent.current=true;dragged.current=true;}else if(dy>10&&dy>dx*1.3){horizontalIntent.current=false;pointer.current=null;}}}
   onPointerUp={()=>{pointer.current=null;settle();}}
   onPointerCancel={()=>{/* Native touch scrolling cancels pointer events; touchmove still records direction. */}}
   onWheel={event=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY)&&Math.abs(event.deltaX)>1){programmatic.current=false;horizontalIntent.current=true;}}}>
   {items.map(item=><button type="button" key={item.id} ref={node=>{if(node)buttons.current.set(item.id,node);else buttons.current.delete(item.id);}} className="studio-visual-carousel-card" data-carousel-option={item.id} aria-label={item.label} aria-pressed={item.id===value} tabIndex={item.id===value||(index<0&&items[0]?.id===item.id)?0:-1} onClick={()=>{if(!dragged.current)choose(item.id);}}>
    <span className="studio-visual-carousel-media" aria-hidden="true">{item.media}<span className="studio-visual-carousel-check">✓</span></span>
    <span className="studio-visual-carousel-name">{item.label}</span>{item.caption&&<span className="studio-visual-carousel-caption">{item.caption}</span>}
   </button>)}
  </div>
  <span className="studio-visual-carousel-status" aria-live="polite" aria-atomic="true">{selected?`Wybrano: ${selected.label}`:""}</span>
 </section>;
}
