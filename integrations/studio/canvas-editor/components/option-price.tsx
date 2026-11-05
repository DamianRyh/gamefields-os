'use client';
import {createContext,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import type {Project} from '@/lib/project';
import type {QuoteState} from '@/hooks/use-project-quote';
import type {ProjectQuote} from '@/lib/quote-engine';
import {requestProjectQuote,quoteRequestBody} from '@/lib/quote-request';
import {optionPriceDelta,type PriceScope} from '@/lib/option-price';
const Context=createContext<{project:Project;quote:QuoteState}|null>(null);
export function OptionPrices({project,quote,children}:{project:Project;quote:QuoteState;children:ReactNode}){return <Context.Provider value={{project,quote}}>{children}</Context.Provider>}
let active=0;const pending:(()=>void)[]=[];
async function limitedQuote(body:string,signal:AbortSignal){await new Promise<void>(resolve=>{const start=()=>{active++;resolve()};if(active<2)start();else pending.push(start)});try{if(signal.aborted)throw Error('Cancelled');return await requestProjectQuote(body,signal)}finally{active--;pending.shift()?.()}}
export function OptionPrice({candidate,scope}:{candidate:Project;scope:PriceScope}){
 const context=useContext(Context),ref=useRef<HTMLElement>(null),[visible,setVisible]=useState(false);
 const body=useMemo(()=>quoteRequestBody(candidate),[candidate]);
 const [result,setResult]=useState<{body:string;data:ProjectQuote|null;loading:boolean}>({body:'',data:null,loading:false});
 const currentBody=context?quoteRequestBody(context.project):'',same=body===currentBody;
 useEffect(()=>{const node=ref.current;if(!node)return;if(!('IntersectionObserver' in window)){setVisible(true);return}const observer=new IntersectionObserver(entries=>{setVisible(entries.some(e=>e.isIntersecting))},{rootMargin:'40px'});observer.observe(node);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!visible||same)return;const controller=new AbortController();setResult({body,data:null,loading:true});const timer=setTimeout(()=>{void limitedQuote(body,controller.signal).then(data=>{if(!controller.signal.aborted)setResult({body,data,loading:false})}).catch(()=>{if(!controller.signal.aborted)setResult({body,data:null,loading:false})})},180);return()=>{clearTimeout(timer);controller.abort()}},[body,visible,same]);
 const current=context?.quote,other=same?current?.data:result.body===body?result.data:null;
 const loading=!!current?.loading||(!same&&visible&&(result.body!==body||result.loading));
 const delta=current?.data&&!current.error&&other?optionPriceDelta(current.data,other,scope):null;
 const money=delta===null?'do ustalenia':`${delta>0?'+':delta<0?'−':''}${new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}).format(Math.abs(delta))} zł netto`;
 return <small ref={ref} className="studio-option-price" data-price-state={loading?'loading':delta===null?'unknown':'known'}>{loading?'Sprawdzam cenę…':money}{delta!==null&&current?.data?.priceNet===null?<span> · różnica wycenionego zakresu</span>:null}</small>;
}
