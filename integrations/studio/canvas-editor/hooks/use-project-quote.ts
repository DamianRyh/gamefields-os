"use client";
import {useEffect,useState,useMemo} from "react";
import type {Project} from "@/lib/project";
import type {ProjectQuote} from "@/lib/quote-engine";
import {requestProjectQuote,quoteRequestBody} from "@/lib/quote-request";
export type QuoteState={data:ProjectQuote|null;loading:boolean;error:boolean;retry:()=>void};
export function useProjectQuote(p:Project):QuoteState{
 // Preserve palette inputs for optional colour pricing; exclude artwork bytes and spatial-only edits.
 const body=quoteRequestBody(p);
 const [attempt,setAttempt]=useState(0);
 const [state,setState]=useState<{key:string;data:ProjectQuote|null;loading:boolean;error:boolean}>({key:"",data:null,loading:true,error:false});
 const key=useMemo(()=>`${attempt}:${body}`,[attempt,body]);
 useEffect(()=>{
  const controller=new AbortController();let active=true;
  setState({key,data:null,loading:true,error:false});
  const timer=window.setTimeout(async()=>{
   try{
    const data=await requestProjectQuote(body,controller.signal);
    if(active)setState({key,data,loading:false,error:false});
   }catch{if(active&&!controller.signal.aborted)setState({key,data:null,loading:false,error:true})}
  },320);
  return()=>{active=false;window.clearTimeout(timer);controller.abort()};
 },[body,key]);
 return {...(state.key===key?state:{data:null,loading:true,error:false}),retry:()=>setAttempt(a=>a+1)};
}
