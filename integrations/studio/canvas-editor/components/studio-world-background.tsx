"use client";
import {useEffect,useRef} from "react";

/** Decorative, pointer-transparent backdrop. It never changes the court renderer or layout. */
export function StudioWorldBackground({world}:{world:"construct"|"creative"}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=canvas.current,stage=el?.parentElement;if(!el||!stage)return;
  const context=el.getContext("2d");if(!context)return;
  let width=0,height=0,pixelRatio=1,frame=0,last=0,phase=0;
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer={x:.6,y:.42,tx:.6,ty:.42};
  const resize=()=>{const rect=stage.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);pixelRatio=Math.min(window.devicePixelRatio||1,2);el.width=Math.round(width*pixelRatio);el.height=Math.round(height*pixelRatio);context.setTransform(pixelRatio,0,0,pixelRatio,0,0)};
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  const move=(event:PointerEvent)=>{const rect=stage.getBoundingClientRect();pointer.tx=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));pointer.ty=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))};
  stage.addEventListener("pointermove",move,{passive:true});
  const stroke=(points:[number,number][],color:string,lineWidth=1)=>{context.beginPath();points.forEach(([x,y],i)=>i?context.lineTo(x,y):context.moveTo(x,y));context.strokeStyle=color;context.lineWidth=lineWidth;context.stroke()};
  const draw=(time:number)=>{
   frame=requestAnimationFrame(draw);if(time-last<33)return;const elapsed=last?Math.min(time-last,70):33;last=time;if(!reduce)phase+=elapsed*.00035;
   pointer.x+=(pointer.tx-pointer.x)*(reduce?1:.08);pointer.y+=(pointer.ty-pointer.y)*(reduce?1:.08);
   context.clearRect(0,0,width,height);
   if(world==="construct"){
    const vanishingX=width*(.68+(pointer.x-.5)*.07),vanishingY=height*(.28+(pointer.y-.5)*.09);
    for(let i=-15;i<=15;i++)stroke([[vanishingX,vanishingY],[width*.5+i*width*.072,height*1.2]],"rgba(89,100,123,.15)",.8);
    for(let i=1;i<=13;i++){const t=i/13,y=vanishingY+(height*1.18-vanishingY)*t*t;stroke([[0,y],[width,y]],`rgba(94,103,125,${(.03+t*.13).toFixed(3)})`,.7)}
    for(let i=0;i<28;i++){const x=(i*113.7)%width,y=(i*71.5)%height,d=Math.hypot(x-pointer.x*width,y-pointer.y*height),alpha=.08+Math.max(0,1-d/180)*.32;context.fillStyle=`rgba(98,66,190,${alpha})`;context.fillRect(x-1.5,y-1.5,3,3)}
    const gradient=context.createRadialGradient(pointer.x*width,pointer.y*height,0,pointer.x*width,pointer.y*height,Math.max(width,height)*.45);gradient.addColorStop(0,"rgba(105,70,235,.11)");gradient.addColorStop(1,"rgba(105,70,235,0)");context.fillStyle=gradient;context.fillRect(0,0,width,height);
   }else{
    const shapes=[{x:.88,y:.15,r:.27,c:"#d9524b"},{x:.93,y:.78,r:.32,c:"#6e48e4"},{x:.36,y:.92,r:.24,c:"#e5a34b"},{x:.08,y:.29,r:.18,c:"#3a90b8"}];
    const scale=Math.min(width,height);
    for(let j=0;j<shapes.length;j++){const shape=shapes[j],cx=shape.x*width+(pointer.x-.5)*42*(j%2?-1:1),cy=shape.y*height+(pointer.y-.5)*36*(j%2?1:-1);context.beginPath();for(let i=0;i<=80;i++){const angle=i/80*Math.PI*2,mod=1+Math.sin(angle*3+phase+j)*.085+Math.cos(angle*5-phase*.6)*.04,x=cx+Math.cos(angle)*shape.r*scale*mod,y=cy+Math.sin(angle)*shape.r*scale*.83*mod;i?context.lineTo(x,y):context.moveTo(x,y)}context.closePath();context.globalAlpha=.28;context.fillStyle=shape.c;context.fill();context.globalAlpha=1}
    const gradient=context.createRadialGradient(pointer.x*width,pointer.y*height,10,pointer.x*width,pointer.y*height,width*.36);gradient.addColorStop(0,"rgba(255,246,218,.38)");gradient.addColorStop(1,"rgba(255,246,218,0)");context.fillStyle=gradient;context.fillRect(0,0,width,height);
   }
   // Keep the court itself unobstructed; the background lives at its edges.
   const clear=context.createRadialGradient(width*.51,height*.54,Math.min(width,height)*.1,width*.51,height*.54,Math.min(width,height)*.6);clear.addColorStop(0,"rgba(0,0,0,1)");clear.addColorStop(.42,"rgba(0,0,0,.93)");clear.addColorStop(1,"rgba(0,0,0,0)");context.save();context.globalCompositeOperation="destination-out";context.fillStyle=clear;context.fillRect(0,0,width,height);context.restore();
  };
  frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();stage.removeEventListener("pointermove",move)};
 },[world]);
 return <canvas className="studio-two-worlds-background" ref={canvas} aria-hidden="true"/>;
}
