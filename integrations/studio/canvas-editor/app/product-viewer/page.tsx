'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {previewSelection,constructionMeshes,previewAppearance,previewPoints,fitPreview,goalAssembly,constructionPart,type PreviewPart,previewCoats,previewPaint,type PreviewArena,type PreviewCoat} from '@/lib/construction-preview';
import {loadArenaGlb} from '@/components/glb-arena';
import {loadO1Glb} from '@/components/o1-arena-glb';
import type {Mesh} from '@/components/renderer';
import type {ArenaRenderer} from '@/components/product-renderer';
import {productNames} from '@/lib/product-names.mjs';
import './viewer.css';
export default function ProductViewer(){
 const [selection,setSelection]=useState<{arena:PreviewArena;coat:PreviewCoat;goal:boolean;part:PreviewPart|null;compact:boolean;parentOrigin:string;viewerId:string}|null>(null);
 useEffect(()=>{const q=new URLSearchParams(location.search),origin=q.get('parentOrigin')||'';setSelection({...previewSelection(q),goal:q.get('view')==='goal',part:['side','end','net'].includes(q.get('part')||'')?q.get('part') as PreviewPart:null,compact:q.get('compact')==='1',parentOrigin:['https://www.gamefields.eu','https://gamefields.eu',location.origin].includes(origin)?origin:'',viewerId:/^[a-f0-9-]{36}$/.test(q.get('viewerId')||'')?q.get('viewerId')!:''})},[]);
 useEffect(()=>{if(selection?.parentOrigin&&window.parent!==window)window.parent.postMessage({type:'gf-product-viewer-coat',arena:selection.arena,coat:selection.coat,part:selection.part,view:selection.goal?'goal':'court',viewerId:selection.viewerId},selection.parentOrigin)},[selection]);
 const [partCoats,setPartCoats]=useState<Partial<Record<PreviewPart,PreviewCoat>>>({});
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(!selection||event.source!==window.parent||event.origin!==selection.parentOrigin)return;const m=event.data;if(!m||m.viewerId!==selection.viewerId||m.arena!==selection.arena||!previewCoats.includes(m.coat))return;if(m.type==='gf-set-part-coat'&&['side','end','net'].includes(m.part))setPartCoats(v=>({...v,[m.part]:m.coat}));if(m.type==='gf-set-preview-coat'){setSelection(v=>v?{...v,coat:m.coat}:v);setPartCoats({})}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive)},[selection]);
 const names={gray:'Szary',red:'Czerwony',blue:'Niebieski',green:'Zielony'};
 const choose=(coat:PreviewCoat)=>{setPartCoats({});setSelection(v=>v?{...v,coat}:v)};
 return <main className={"product-viewer-page"+(selection?.compact?" compact-part":"")} aria-label="Wizualizacja konstrukcji 3D">{selection?<>
  <ConstructionScene key={selection.arena+'-'+selection.goal+'-'+selection.part} arena={selection.arena} coat={selection.coat} goalView={selection.goal} part={selection.part} partCoats={partCoats}/>
  <div className="product-coat-controls" role="radiogroup" aria-label="Kolor konstrukcji 3D">{previewCoats.map((coat,index)=><button key={coat} type="button" role="radio" aria-label={names[coat]} aria-checked={selection.coat===coat} tabIndex={selection.coat===coat?0:-1} title={names[coat]} className="product-coat" style={{'--coat':previewPaint(coat,selection.arena)} as CSSProperties} onClick={()=>choose(coat)} onKeyDown={e=>{let next=index;if(['ArrowRight','ArrowDown'].includes(e.key))next=(index+1)%4;else if(['ArrowLeft','ArrowUp'].includes(e.key))next=(index+3)%4;else if(e.key==='Home')next=0;else if(e.key==='End')next=3;else return;e.preventDefault();(e.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();choose(previewCoats[next])}}/>)}</div>
 </>:<p role="status">Wczytujemy model 3D…</p>}</main>;
}
function ConstructionScene({arena,coat,goalView=false,part=null,partCoats={}}:{arena:PreviewArena;coat:PreviewCoat;goalView?:boolean;part?:PreviewPart|null;partCoats?:Partial<Record<PreviewPart,PreviewCoat>>}){
 const partCoatsRef=useRef(partCoats);
 const canvas=useRef<HTMLCanvasElement>(null),controls=useRef<{reset:()=>void;zoom:(factor:number)=>void}|null>(null),readyRef=useRef(false),coatRef=useRef(coat),paintRef=useRef<((coat:PreviewCoat)=>void)|null>(null);
 const [attempt,setAttempt]=useState(0),[legacy,setLegacy]=useState(!['o1','p1','circle-cage-1','circle-cage-2'].includes(arena)),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{coatRef.current=coat;partCoatsRef.current=partCoats;paintRef.current?.(coat)},[coat,partCoats]);
 useEffect(()=>{
  const element=canvas.current!;let cancelled=false,renderer:ArenaRenderer|undefined,raf=0,resize:ResizeObserver|undefined;const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),60000);
  let initialYaw=-.7,initialPitch=.5,yaw=-.7,pitch=.5,zoom=1,points:number[][]=[];const pointers=new Map<number,{x:number;y:number}>();let span=0;
  setReady(false);setError('');
  const draw=()=>{if(cancelled||!renderer||renderer.dead||!points.length)return;renderer.yaw=yaw;renderer.pitch=pitch;const fit=fitPreview(points,yaw,pitch,element.clientWidth/Math.max(1,element.clientHeight));renderer.placement={cx:836+(fit.cx-836)*zoom,cy:470.5+(fit.cy-470.5)*zoom,scale:fit.scale*zoom};renderer.draw();element.dataset.yaw=String(yaw);element.dataset.pitch=String(pitch);element.dataset.zoom=String(zoom)};
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)};
  const reset=()=>{yaw=initialYaw;pitch=initialPitch;zoom=1;schedule()};
  const changeZoom=(factor:number)=>{zoom=Math.max(.65,Math.min(2.4,zoom*factor));schedule()};controls.current={reset,zoom:changeZoom};
  const down=(e:PointerEvent)=>{if(e.button!==0||!renderer||renderer.dead)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});element.setPointerCapture(e.pointerId);element.focus({preventScroll:true});if(pointers.size===2){const [a,b]=[...pointers.values()];span=Math.hypot(a.x-b.x,a.y-b.y)}};
  const move=(e:PointerEvent)=>{const previous=pointers.get(e.pointerId);if(!previous)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){yaw+=(e.clientX-previous.x)*.008;pitch=Math.max(goalView||part?0:.12,Math.min(1.35,pitch+(e.clientY-previous.y)*.006));schedule()}else if(pointers.size===2){const [a,b]=[...pointers.values()],next=Math.hypot(a.x-b.x,a.y-b.y);if(span>0)changeZoom(next/span);span=next}};
  const up=(e:PointerEvent)=>{pointers.delete(e.pointerId);span=0;if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId)};
  const wheel=(e:WheelEvent)=>{if(!readyRef.current)return;e.preventDefault();changeZoom(Math.exp(-e.deltaY*.001))};
  const key=(e:KeyboardEvent)=>{const step:Record<string,[number,number]>={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,.08],ArrowDown:[0,-.08]};if(step[e.key]){e.preventDefault();yaw+=step[e.key][0];pitch=Math.max(goalView||part?0:.12,Math.min(1.35,pitch+step[e.key][1]));schedule()}else if(['+','=','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')reset();else changeZoom(e.key==='-'?1/1.15:1.15)}};
  const lost=(e:Event)=>{e.preventDefault();setReady(false);readyRef.current=false;renderer?.dispose();setError('Podgląd został przerwany. Uruchom go ponownie.')};
  element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);element.addEventListener('pointerup',up);element.addEventListener('pointercancel',up);element.addEventListener('lostpointercapture',up);element.addEventListener('wheel',wheel,{passive:false});element.addEventListener('keydown',key);element.addEventListener('webglcontextlost',lost);
  void(async()=>{try{
   const loaded:Mesh[]=arena==='o1'?await loadO1Glb('/arenas/panna-play-o1-v2.glb',abort.signal):['circle-cage-1','circle-cage-2'].includes(arena)?await loadArenaGlb(arena==='circle-cage-1'?'/arenas/panna-cage-90-v2.glb':'/arenas/panna-cage-180-v2.glb',abort.signal):await fetch('/arenas/'+arena+'.json',{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('Nie udało się pobrać konstrukcji.');return r.json()});if(cancelled)return;
   let meshes:Mesh[]=constructionMeshes(loaded,arena);if(goalView||part){const end=part?constructionPart(meshes,part):goalAssembly(meshes);meshes=end.meshes;initialYaw=yaw=end.yaw;initialPitch=pitch=0;}if(!meshes.length)throw Error('Model jest chwilowo niedostępny.');points=previewPoints(meshes);
   if(legacy){const {Renderer}=await import('@/components/renderer');if(cancelled)return;renderer=new Renderer(element,meshes);}else{try{const {ProductRenderer}=await import('@/components/product-renderer');if(cancelled)return;renderer=new ProductRenderer(element,meshes);}catch{if(!cancelled)setLegacy(true);return}}
   if(cancelled){renderer.dispose();return}const endReference=goalAssembly(constructionMeshes(loaded,arena));const goalVertices=endReference.meshes.filter(m=>m.group==='goals').flatMap(m=>m.v),limit=Math.min(...goalVertices.map(v=>v[endReference.axis]*endReference.sign))*.82;
   const category=(m:Mesh):PreviewPart=>m.group==='goals'?'net':Math.abs(m.v.reduce((sum,v)=>sum+v[endReference.axis],0)/m.v.length)>=limit?'end':'side';
   paintRef.current=current=>{if(!renderer||renderer.dead)return;renderer.appearances=Object.fromEntries(meshes.map(m=>{const role=category(m),chosen=partCoatsRef.current[role]||current,base=previewAppearance(m,chosen,arena);return [m.id,part==='net'||(role==='net'&&partCoatsRef.current.net)?{...base,color:previewPaint(chosen,arena),finish:'matte' as const}:base]}));element.dataset.coat=current;element.dataset.partCoats=JSON.stringify(partCoatsRef.current);draw()};paintRef.current(coatRef.current);element.dataset.model=arena;element.dataset.view=part|| (goalView?'goal':'court');element.dataset.goalCount=String(meshes.filter(m=>m.group==='goals').length);element.dataset.meshCount=String(meshes.length);element.dataset.floorCount=String(meshes.filter(m=>m.group==='floor').length);draw();resize=new ResizeObserver(schedule);resize.observe(element);readyRef.current=true;setReady(true);
  }catch{if(!cancelled){readyRef.current=false;setError('Nie udało się wczytać modelu. Sprawdź połączenie i spróbuj ponownie.')}}finally{clearTimeout(timeout)}})();
  return()=>{cancelled=true;readyRef.current=false;abort.abort();clearTimeout(timeout);cancelAnimationFrame(raf);resize?.disconnect();controls.current=null;paintRef.current=null;element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',up);element.removeEventListener('lostpointercapture',up);element.removeEventListener('wheel',wheel);element.removeEventListener('keydown',key);element.removeEventListener('webglcontextlost',lost);renderer?.dispose()};
 },[arena,goalView,part,attempt,legacy]);
 return <section className="construction-viewer" data-model={arena} data-coat={coat} data-ready={ready} data-view={part||(goalView?'goal':'court')} aria-label={productNames[arena]+' — interaktywny model 3D'}>
  <canvas ref={canvas} key={String(legacy)+'-'+attempt} tabIndex={0} role="img" aria-label={'Model 3D '+productNames[arena]+'. Przeciągnij lub użyj strzałek, aby obrócić. Plus i minus przybliżają, Home przywraca widok.'}/>
  {!ready&&!error&&<p className="viewer-message" role="status">Wczytujemy konstrukcję 3D…</p>}
  {error&&<div className="viewer-message" role="alert"><p>{error}</p><button type="button" onClick={()=>setAttempt(v=>v+1)}>Spróbuj ponownie</button></div>}
  {ready&&<div className="viewer-tools"><span>{goalView?'Panel od zewnątrz · obróć, aby obejrzeć':'Przeciągnij, aby obrócić'}</span><div><button type="button" aria-label="Oddal model" onClick={()=>controls.current?.zoom(1/1.15)}>−</button><button type="button" aria-label="Przybliż model" onClick={()=>controls.current?.zoom(1.15)}>+</button><button type="button" onClick={()=>controls.current?.reset()}>Przywróć widok</button></div></div>}
 </section>;
}
