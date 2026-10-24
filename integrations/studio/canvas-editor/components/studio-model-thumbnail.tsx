"use client";
import {useEffect,useState} from 'react';
import {Box} from 'lucide-react';
/** Reuses the live canvas; no second WebGL context or change to the project. */
export function StudioModelThumbnail({model}:{model?:string}){
 const [snapshot,setSnapshot]=useState<{model:string|undefined;src:string}|null>(null);
 useEffect(()=>{let frame=0;const stage=document.querySelector('.studio-render');if(!stage)return;
 const capture=()=>{const root=stage.querySelector<HTMLElement>('.panna-studio-model');if(root?.dataset.ready!=='true'||root.dataset.model!==model)return;const canvas=root.querySelector('canvas');if(!canvas)return;
  const sample=document.createElement('canvas');sample.width=240;sample.height=Math.max(1,Math.round(240*canvas.height/canvas.width));const ctx=sample.getContext('2d');if(!ctx)return;
  try{ctx.drawImage(canvas,0,0,sample.width,sample.height);const pixels=ctx.getImageData(0,0,sample.width,sample.height).data;let x0=sample.width,y0=sample.height,x1=0,y1=0;for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++)if(pixels[(y*sample.width+x)*4+3]>20){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}if(x1<=x0||y1<=y0)return;const out=document.createElement('canvas');out.width=240;out.height=156;const c=out.getContext('2d')!,w=x1-x0+1,h=y1-y0+1,scale=Math.min(224/w,140/h);c.drawImage(sample,x0,y0,w,h,(240-w*scale)/2,(156-h*scale)/2,w*scale,h*scale);setSnapshot({model,src:out.toDataURL('image/png')})}catch{/* The model name remains available when canvas capture is unavailable. */}
 };
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(capture)};const observer=new MutationObserver(schedule);observer.observe(stage,{subtree:true,attributes:true,attributeFilter:['data-ready','data-render-complete','data-model']});schedule();return()=>{observer.disconnect();cancelAnimationFrame(frame)};
 },[model]);
 return snapshot&&snapshot.model===model?<img src={snapshot.src} alt=""/>:<Box size={34} aria-hidden="true"/>;
}
