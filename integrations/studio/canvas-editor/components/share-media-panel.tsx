'use client';
/* Share Your Field panel: a Stories/Post graphic or a 6 s film of the user's real 3D project, ready to share.
   The preview recomposes on every change (no "refresh" button). Share = system share sheet with the file
   (Web Share Level 2) or a download where that is not available. Instagram never publishes automatically:
   the user adds the link with Instagram's own Link sticker. Events go to window 'gf-share' for analytics. */
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {Project} from '@/lib/project';
import {shareFacts} from '@/lib/share-media/facts';
import {compose,BACKGROUNDS,SAFE,FORMAT_SIZE,type ShareFormat,type ShareStyle,type ShareImages} from '@/lib/share-media/compose';
import {stills,film,filmSupported,stillBlob} from '@/lib/share-media/media';
import {shareRenderer,onShareRenderer} from '@/lib/share-media/registry';
import '@/app/share-media.css';

type Output='image'|'film';
const emit=(name:string,detail:Record<string,unknown>={})=>{try{window.dispatchEvent(new CustomEvent('gf-share',{detail:{name,...detail}}))}catch{/* analytics is optional */}};

export function ShareMediaPanel({project,price,link,onClose}:{project:Project;price?:number|null;link?:string|null;onClose?:()=>void}){
 const [format,setFormat]=useState<ShareFormat>('story'),[style,setStyle]=useState<ShareStyle>('clean'),[bgPick,setBg]=useState('auto');
 const [caption,setCaption]=useState(()=>{try{const c=JSON.parse(sessionStorage.getItem('gf-share-credit')||'null');if(c?.id===project.id&&typeof c.credit==='string')return ('@'+c.credit).slice(0,28)}catch{/* optional */}return 'Moje boisko.'}),[showPrice,setShowPrice]=useState(false),[safe,setSafe]=useState(true),[outputPick,setOutput]=useState<Output>('image');
 const [shots,setImages]=useState<ShareImages|null>(null),[status,setStatus]=useState(''),[progress,setProgress]=useState<number|null>(null),[video,setVideo]=useState<{url:string;blob:Blob;key:string}|null>(null);
 const [rendererReady,setRendererReady]=useState(()=>!!shareRenderer());
 const canvas=useRef<HTMLCanvasElement>(null),abort=useRef<AbortController|null>(null);
 const facts=useMemo(()=>shareFacts(project,{price,caption:caption.trim()}),[project,price,caption]);
 const projectKey=useMemo(()=>JSON.stringify([project.arenaModel,project.arenaDesign,project.patternFamily,project.patternVariant,project.patternColors,project.base,project.zone,project.lineColor,project.surface,project.length,project.width]),[project]);
 const canFilm=style!=='plan'&&filmSupported(),output:Output=canFilm?outputPick:'image';
 const bg=BACKGROUNDS[style].some(b=>b.id===bgPick)?bgPick:BACKGROUNDS[style][0].id,images=rendererReady?shots:null;
 const filmKey=JSON.stringify([projectKey,format,style,bg,caption,showPrice]);

 useEffect(()=>onShareRenderer(()=>setRendererReady(!!shareRenderer())),[]);
 useEffect(()=>{emit('share_panel_open')},[]);
 // Shots of the 3D scene: once per project change, not per style change.
 useEffect(()=>{const r=shareRenderer();if(!r)return;let cancelled=false;
  const run=async()=>{await Promise.all(['500','700','800','900'].map(w=>document.fonts?.load(`${w} 40px Inter`))).catch(()=>{});if(cancelled)return;
   try{const shot=stills(r);if(!cancelled){setImages(shot);emit('share_image_generated')}}catch(e){if(!cancelled)setStatus((e as Error).message)}};
  const t=setTimeout(run,250);return()=>{cancelled=true;clearTimeout(t)}},[projectKey,rendererReady]);
 useEffect(()=>{if(images&&canvas.current)compose(canvas.current,{format,style,background:bg,facts,images,showPrice})},[images,format,style,bg,facts,showPrice]);
 useEffect(()=>()=>{abort.current?.abort();if(video)URL.revokeObjectURL(video.url)},[video]);

 const name=(ext:string)=>`gamefields-${(facts.name||'boisko').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${format}.${ext}`;
 const makeFilm=useCallback(async()=>{const r=shareRenderer();if(!r||!images||style==='plan')return null;if(video?.key===filmKey)return video.blob;
  abort.current?.abort();const ac=new AbortController();abort.current=ac;setProgress(0);setStatus('Nagrywam film…');emit('share_film_start',{format,style});
  try{const blob=await film(r,{format,style,background:bg,facts,showPrice,surface:images.surface??null},{signal:ac.signal,onProgress:setProgress});
   setVideo(old=>{if(old)URL.revokeObjectURL(old.url);return {url:URL.createObjectURL(blob),blob,key:filmKey}});setStatus('Film gotowy: 6 s, MP4.');emit('share_film_generated',{format,style,bytes:blob.size});return blob}
  catch(e){setStatus((e as Error).name==='AbortError'?'Nagrywanie przerwane.':(e as Error).message);return null}finally{setProgress(null);abort.current=null}},[images,style,video,filmKey,format,bg,facts,showPrice]);
 const file=async()=>{if(output==='film'){const b=await makeFilm();return b?new File([b],name('mp4'),{type:'video/mp4'}):null}
  if(!canvas.current)return null;return new File([await stillBlob(canvas.current)],name('png'),{type:'image/png'})};
 const download=(f:File)=>{const a=document.createElement('a'),u=URL.createObjectURL(f);a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)};
 async function onDownload(){const f=await file();if(!f)return;download(f);emit(output==='film'?'share_film_download':'share_png_download',{format,style});setStatus(`Pobrano ${f.name}.`)}
 async function onCopy(){if(!link){setStatus('Najpierw utwórz link do projektu poniżej.');return}try{await navigator.clipboard.writeText(link);setStatus('Skopiowano link do projektu.');emit('share_link_copy')}catch{setStatus('Link: '+link)}}
 async function onShare(){const f=await file();if(!f)return;let copied=false;if(link){try{await navigator.clipboard.writeText(link);copied=true}catch{/* the link stays visible below */}}
  const data:ShareData={files:[f],title:facts.name,text:'Designed in Gamefields Studio'};
  if(navigator.canShare?.(data)){emit('share_native_open',{output,format,style});try{await navigator.share(data);emit('share_native_done',{output});setStatus(copied?'Gotowe. Link jest w schowku: w Instagramie dodaj naklejkę „Link” i wklej.':'Gotowe.')}catch(e){if((e as Error).name!=='AbortError')download(f);setStatus((e as Error).name==='AbortError'?'Udostępnianie anulowane.':'Zapisano plik.')}}
  else{download(f);emit(output==='film'?'share_film_download':'share_png_download',{format,style,fallback:true});setStatus(`Zapisano ${f.name}.`+(copied?' Link jest w schowku: w Instagramie dodaj naklejkę „Link” i wklej.':''))}}

 const [W,H]=FORMAT_SIZE[format],pct=(v:number)=>`${v/H*100}%`,showFilm=output==='film'&&video?.key===filmKey;
 return <section className="gfsm" aria-label="Udostępnij projekt">
  <header className="gfsm-head"><div><h2>Udostępnij projekt</h2><p>{facts.name} · {facts.pattern}</p></div>{onClose?<button type="button" className="gfsm-x" aria-label="Zamknij" onClick={onClose}>×</button>:null}</header>
  <div className="gfsm-body">
   <div className="gfsm-stage"><div className="gfsm-frame" style={{aspectRatio:`${W}/${H}`}}>
    <canvas ref={canvas} width={W} height={H} aria-label="Podgląd grafiki" hidden={showFilm}/>
    {showFilm?<video src={video!.url} autoPlay loop muted playsInline aria-label="Podgląd filmu"/>:null}
    {!images?<p className="gfsm-wait" role="status">{rendererReady?'Przygotowuję ujęcia z modelu 3D…':'Otwórz widok 3D projektu, żeby przygotować grafikę.'}</p>:null}
    {safe&&format==='story'&&images?<div className="gfsm-ig" aria-hidden="true"><div className="t" style={{height:pct(SAFE.story.top)}}>twój_profil · teraz</div><div className="s" style={{top:pct(H-SAFE.story.bottom-(style==='street'?120:110))}}>miejsce na naklejkę Link</div><div className="b" style={{height:pct(SAFE.story.bottom)}}><span>Wyślij wiadomość</span></div></div>:null}
    {progress!=null?<div className="gfsm-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress*100)}><span style={{width:`${progress*100}%`}}/><button type="button" onClick={()=>abort.current?.abort()}>Anuluj</button></div>:null}
   </div></div>
   <form className="gfsm-controls" onSubmit={e=>e.preventDefault()}>
    <fieldset><legend>Format</legend><div className="gfsm-seg" style={{['--n' as string]:2}}>
     {([['story','Stories','1080 × 1920'],['post','Post','1080 × 1350']] as const).map(([v,l,s])=><label key={v}><input type="radio" name="gfsm-format" checked={format===v} onChange={()=>setFormat(v)}/>{l}<small>{s}</small></label>)}</div></fieldset>
    <fieldset><legend>Styl</legend><div className="gfsm-seg" style={{['--n' as string]:3}}>
     {([['clean','Clean'],['street','Street'],['plan','Karta']] as const).map(([v,l])=><label key={v}><input type="radio" name="gfsm-style" checked={style===v} onChange={()=>setStyle(v)}/>{l}</label>)}</div></fieldset>
    <fieldset><legend>Rodzaj</legend><div className="gfsm-seg" style={{['--n' as string]:2}}>
     <label><input type="radio" name="gfsm-output" checked={output==='image'} onChange={()=>setOutput('image')}/>Grafika<small>PNG</small></label>
     <label className={canFilm?'':'is-off'}><input type="radio" name="gfsm-output" disabled={!canFilm} checked={output==='film'} onChange={()=>setOutput('film')}/>Film 6 s<small>{style==='plan'?'nie dla Karty':filmSupported()?'MP4, obrót kamery':'niedostępny tutaj'}</small></label></div></fieldset>
    <fieldset><legend>Tło</legend><div className="gfsm-sw">{BACKGROUNDS[style].map(b=><label key={b.id} title={b.label}><input type="radio" name="gfsm-bg" aria-label={b.label} checked={bg===b.id} onChange={()=>setBg(b.id)}/><span style={b.color?{background:b.color}:{background:`conic-gradient(${facts.palette.map((c,i,a)=>`${c} ${i/a.length*100}% ${(i+1)/a.length*100}%`).join(',')})`}}/></label>)}</div></fieldset>
    <label className="gfsm-lbl" htmlFor="gfsm-caption">Podpis (opcjonalnie)</label>
    <input id="gfsm-caption" type="text" maxLength={28} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="np. Moje boisko."/>
    <div className="gfsm-tog">{price?<label><input type="checkbox" checked={showPrice} onChange={e=>setShowPrice(e.target.checked)}/>Pokaż cenę konstrukcji</label>:null}
     <label><input type="checkbox" checked={safe} onChange={e=>setSafe(e.target.checked)}/>Pokaż strefy Instagrama (tylko podgląd)</label></div>
    <div className="gfsm-acts">
     <button type="button" className="gfsm-btn is-primary" disabled={!images||progress!=null} onClick={onShare}>{output==='film'&&!showFilm?'Nagraj i udostępnij':'Udostępnij'}</button>
     <div><button type="button" className="gfsm-btn" disabled={!images||progress!=null} onClick={onDownload}>{output==='film'?'Pobierz MP4':'Pobierz PNG'}</button><button type="button" className="gfsm-btn" onClick={onCopy}>Kopiuj link</button></div>
     <p className="gfsm-status" role="status" aria-live="polite">{status}</p>
    </div>
   </form>
  </div>
 </section>
}
