'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
/** Observe the actual clipped card area, including horizontally scrolling rails and modal sheets. */
export function LazyMedia({children}:{children:ReactNode}){
 const ref=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{const node=ref.current;if(!node)return;if(!('IntersectionObserver' in window)){setVisible(true);return}const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.target===node)setVisible(entry.isIntersecting)},{threshold:0.01});observer.observe(node);return()=>observer.disconnect()},[]);
 return <span ref={ref} className="studio-lazy-media" data-lazy-loaded={visible?'true':'false'}>{visible?children:<span className="studio-lazy-placeholder" aria-hidden="true"/>}</span>;
}
