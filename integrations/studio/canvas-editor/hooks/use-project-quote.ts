"use client";
import {useEffect,useState,useMemo} from "react";
import type {Project} from "@/lib/project";
import type {ProjectQuote} from "@/lib/quote-engine";
export type QuoteState={data:ProjectQuote|null;loading:boolean;error:boolean;retry:()=>void};
export function useProjectQuote(p:Project):QuoteState{
 // Preserve palette inputs for optional colour pricing; exclude artwork bytes and spatial-only edits.
 const body=JSON.stringify({...p,id:"quote",name:"Kalkulacja",date:"",status:"Szkic",lineColor:"#000000",scene:"day",patternDensity:undefined,shadowIntensity:undefined,graphicScale:100,graphicRotation:0,arenaDesign:p.arenaDesign?{...p.arenaDesign,src:p.arenaDesign.src?"data:image/png;base64,AA==":undefined,panelColor:"#000000",frameColor:"#000000",goalColor:"#000000",text:p.arenaDesign.text?"Napis":""}:undefined,objects:p.objects.map(o=>({...o,id:"item",x:0,y:0,rotation:0,scale:100,opacity:100,color:"#000000",src:undefined,text:o.text?"Napis":undefined}))});
 const [attempt,setAttempt]=useState(0);
 const [state,setState]=useState<{key:string;data:ProjectQuote|null;loading:boolean;error:boolean}>({key:"",data:null,loading:true,error:false});
 const key=useMemo(()=>`${attempt}:${body}`,[attempt,body]);
 useEffect(()=>{
  const controller=new AbortController();let active=true;
  setState({key,data:null,loading:true,error:false});
  const timer=window.setTimeout(async()=>{
   try{
    const response=await fetch("/api/quote",{method:"POST",headers:{"Content-Type":"application/json"},body,cache:"no-store",signal:controller.signal});
    if(!response.ok)throw Error("quote");
    const data=await response.json() as ProjectQuote;
    if(data.schemaVersion!==2||!Array.isArray(data.items)||!["estimated","partial","unpriced"].includes(data.status))throw Error("quote schema");
    if(active)setState({key,data,loading:false,error:false});
   }catch{if(active&&!controller.signal.aborted)setState({key,data:null,loading:false,error:true})}
  },320);
  return()=>{active=false;window.clearTimeout(timer);controller.abort()};
 },[body,key]);
 return {...(state.key===key?state:{data:null,loading:true,error:false}),retry:()=>setAttempt(a=>a+1)};
}
