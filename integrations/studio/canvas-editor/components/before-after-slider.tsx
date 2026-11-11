"use client";
import {useState} from "react";
import {RadarMedia} from "@/components/radar-media";

type BeforeAfterProps={before:string;after:string;name:string};

export function BeforeAfterSlider({before,after,name}:BeforeAfterProps){
 const [position,setPosition]=useState(50);
 return <div className="radar-compare" style={{"--compare-position":`${position}%`} as React.CSSProperties}>
  <RadarMedia src={after} alt={`${name} po transformacji`} label="AFTER" kind="concept" priority/>
  <div className="radar-compare-before"><RadarMedia src={before} alt={`${name} obecnie`} label="BEFORE" kind="current" priority/></div>
  <span className="radar-compare-line" aria-hidden="true"><i>↔</i></span>
  <input aria-label="Porównaj stan obecny i koncepcję" type="range" min="0" max="100" value={position} onChange={event=>setPosition(Number(event.target.value))}/>
 </div>
}

