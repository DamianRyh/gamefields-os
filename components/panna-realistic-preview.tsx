"use client";
import {useEffect,useId,useRef,useState} from 'react';
import type {Project} from '@/lib/project';
import {PatternArt} from './pattern-art';
import {SurfaceAppearance} from './surface-material';
import {isTurf,surfaceLabel} from '@/lib/surface-materials';
import {getPatternFamily,getPatternPalette} from '@/lib/pattern-library';
import {REALISTIC_LOCATIONS,type RealisticLocation} from '@/lib/realistic-locations';

const W=1672,H=941;
type View='perspective'|'aerial'|'ground';
type Plate={pixels:ImageData;mask:Uint8Array;bounds:[number,number,number,number]};
const cache=new Map<string,Promise<Plate>>();
const green=(r:number,g:number,b:number)=>g>140&&g-r>90&&g-b>90&&r<100&&b<100;
function loadPlate(src:string):Promise<Plate>{
 const existing=cache.get(src);if(existing)return existing;
 const promise=new Promise<Plate>((resolve,reject)=>{const image=new Image();image.onload=()=>{try{
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0,W,H);const pixels=ctx.getImageData(0,0,W,H),mask=new Uint8Array(W*H),queue=new Int32Array(W*H);
  // Seed inside the arena. Flood fill keeps green vegetation outside the floor untouched.
  let seed=-1;for(let y=250;y<800&&seed<0;y++)for(let x=650;x<1000;x++){const i=(y*W+x)*4;if(green(...[pixels.data[i],pixels.data[i+1],pixels.data[i+2]] as [number,number,number])){seed=y*W+x;break}}
  if(seed<0)throw new Error('Brak greenscreenu w scenie Panna');
  let head=0,tail=1,minX=W,minY=H,maxX=0,maxY=0;queue[0]=seed;mask[seed]=1;
  while(head<tail){const n=queue[head++],x=n%W,y=Math.floor(n/W);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   for(const m of [n-1,n+1,n-W,n+W]){if(m<0||m>=W*H||mask[m]||Math.abs(m%W-x)>1)continue;const i=m*4;if(green(pixels.data[i],pixels.data[i+1],pixels.data[i+2])){mask[m]=1;queue[tail++]=m;}}
  }
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const n=y*W+x,i=n*4;if(green(pixels.data[i],pixels.data[i+1],pixels.data[i+2]))mask[n]=1;}
  if(tail<50000)throw new Error('Niepełna maska sceny Panna');resolve({pixels,mask,bounds:[minX,minY,maxX,maxY]});
 }catch(e){reject(e)}};image.onerror=reject;image.src=src;});
 cache.set(src,promise);promise.catch(()=>cache.delete(src));if(cache.size>3)cache.delete(cache.keys().next().value!);return promise;
}
export function PannaSurfaceObjects({project:p}:{project:Project}){return <>{p.objects.filter(o=>o.kind!=='equipment'&&o.target==='court').map(o=><g key={o.id} transform={`translate(${o.x} ${o.y}) rotate(${o.rotation}) scale(${o.scale/100})`} opacity={o.opacity/100}>{o.kind==='image'&&o.src?<image href={o.src} x="-55" y="-55" width="110" height="110"/>:<text textAnchor="middle" dominantBaseline="middle" fill={o.color} fontSize={o.kind==='sponsor'?17:34} fontWeight="800">{o.text||o.name}</text>}</g>)}</>}
export function PannaRealisticPreview({project,view='perspective',location='park'}:{project:Project;view?:View;location?:RealisticLocation}){
 const canvas=useRef<HTMLCanvasElement>(null),texture=useRef<SVGSVGElement>(null),id=useId().replace(/:/g,''),[readySignature,setReady]=useState(''),[error,setError]=useState(false);
 const loc=location==='krakow-rynek'?'park':location,src=`/studio/panna/${loc}-${view}.webp`;
 const signature=src+JSON.stringify(project),ready=readySignature===signature;
 useEffect(()=>{let cancelled=false;let url='';setReady('');setError(false);
 async function render(){try{const plate=await loadPlate(src);if(cancelled||!texture.current)return;
  url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(texture.current)],{type:'image/svg+xml'}));const art=new Image();await new Promise<void>((resolve,reject)=>{art.onload=()=>resolve();art.onerror=reject;art.src=url});if(cancelled)return;
  const temp=document.createElement('canvas');temp.width=600;temp.height=600;const tc=temp.getContext('2d')!;tc.fillStyle=project.base;tc.fillRect(0,0,600,600);tc.drawImage(art,0,0);const sample=tc.getImageData(0,0,600,600).data;
  const out=new ImageData(new Uint8ClampedArray(plate.pixels.data),W,H),[left,top,right,bottom]=plate.bounds,cx=(left+right)/2,cy=(top+bottom)/2,rx=(right-left)/2,ry=(bottom-top)/2;
  // An affine disc projection calibrated from each plate's chroma silhouette.
  // The pixel mask preserves the foreground boards and goal frames/netting.
  for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const n=y*W+x;if(!plate.mask[n])continue;const u=Math.max(0,Math.min(599,Math.round(300+(x-cx)/rx*298))),v=Math.max(0,Math.min(599,Math.round(300+(y-cy)/ry*298))),s=(v*600+u)*4,i=n*4,light=1.015-.055*(y-top)/(bottom-top);for(let c=0;c<3;c++)out.data[i+c]=Math.round(sample[s+c]*light);}
  if(cancelled)return;canvas.current?.getContext('2d')?.putImageData(out,0,0);setReady(signature);
 }catch{if(!cancelled)setError(true)}finally{if(url)URL.revokeObjectURL(url)}}
 void render();return()=>{cancelled=true;if(url)URL.revokeObjectURL(url)};
 },[project,src,signature]);
 const locationName=REALISTIC_LOCATIONS.find(x=>x.id===loc)?.label||loc;
 return <div className="realistic-stage green-screen-stage panna-stage" data-ready={ready} data-sport="panna" data-goal-count="2" role="img" aria-busy={!ready} aria-label={`Panna Football 1×1 · arena Ø 7 m · ${locationName} · ${view}`}>
 <div className="green-screen-scene" style={{aspectRatio:'1672/941',position:'relative',filter:project.scene==='night'?'brightness(.48) saturate(.8)':project.scene==='event'?'saturate(1.12)':'none'}}><canvas ref={canvas} width={W} height={H} style={{display:'block',width:'100%',height:'auto'}} aria-hidden="true"/>{!ready?<span style={{position:'absolute',inset:0,display:'grid',placeItems:'center',background:'#eeede7'}}>{error?'Nie udało się wczytać sceny. Wybierz inną lokalizację.':'Przygotowuję Twoją arenę…'}</span>:null}</div>
 <span className="realistic-disclaimer">WIZUALIZACJA KONCEPCYJNA</span><div className="realistic-badge"><span>PANNA 1×1 · Ø 7 M · {locationName}</span><b>{getPatternFamily(project.patternFamily).name}</b><span>{getPatternPalette(project.patternPalette).name} · {surfaceLabel(project.surface)}</span></div>
 <svg ref={texture} xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" style={{position:'absolute',width:0,height:0,overflow:'hidden'}} aria-hidden="true"><defs><clipPath id={`${id}-disc`}><circle cx="300" cy="300" r="300"/></clipPath></defs><rect width="600" height="600" fill={project.base}/><g clipPath={`url(#${id}-disc)`}>{!isTurf(project.surface)?<PatternArt p={project} h={600}/>:null}<SurfaceAppearance surface={project.surface} id={id} height={600} length={7}/><PannaSurfaceObjects project={project}/>{project.lines?<circle cx="300" cy="300" r="289" fill="none" stroke={project.lineColor} strokeWidth="2.5"/>:null}</g></svg>
 </div>;
}
