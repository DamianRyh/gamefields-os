"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Court={id:string;slug:string;name:string;city:string;district:string|null;sports:string;surface:string|null;lighting:boolean;isFree:boolean};
type Checkin={courtId:string;playersNow:number};

export default function CourtsPage(){
 const [courts,setCourts]=useState<Court[]>([]),[checkins,setCheckins]=useState<Checkin[]>([]),[sport,setSport]=useState("football"),[error,setError]=useState("");
 useEffect(()=>{(async()=>{const r=await fetch("/api/play",{cache:"no-store"});const d=await r.json();if(!r.ok||!d.ok){setError(d.error||"LOAD_FAILED");return;}setCourts(d.courts||[]);setCheckins(d.activeCheckins||[]);})().catch(()=>setError("LOAD_FAILED"));},[]);
 const live=useMemo(()=>new Map(checkins.map(x=>[x.courtId,Number(x.playersNow)])),[checkins]);
 const filtered=courts.filter(c=>c.sports.includes(sport));
 return <main style={s.page}>
  <header style={s.header}><Link href="/play" style={s.back}>← PLAY</Link><b>COURTS</b></header>
  <section style={s.hero}><div><div style={s.kicker}>YOUR CITY / YOUR FIELDS</div><h1 style={s.h1}>Boiska Warszawy.</h1><p style={s.muted}>Sprawdź kto gra, ranking lokalny, kolejne mecze i możliwości zmiany przestrzeni.</p></div><div style={s.tabs}><button style={sport==="football"?s.active:s.tab} onClick={()=>setSport("football")}>Football</button><button style={sport==="basketball"?s.active:s.tab} onClick={()=>setSport("basketball")}>Basketball</button></div></section>
  {error&&<div style={s.error}>{error}</div>}
  <section style={s.grid}>{filtered.map(c=><Link key={c.id} href={`/play/court?id=${encodeURIComponent(c.id)}&sport=${sport}`} style={s.card}>
   <div style={s.row}><div><span style={s.kicker}>{c.district||c.city}</span><h2 style={s.name}>{c.name}</h2></div><span style={live.get(c.id)?s.live:s.quiet}>● {live.get(c.id)||0} teraz</span></div>
   <div style={s.meta}><span>{c.surface||"surface n/a"}</span><span>{c.lighting?"lighting":"no lighting"}</span><span>{c.isFree?"free":"paid"}</span></div>
   <div style={s.open}>OPEN COURT →</div>
  </Link>)}</section>
 </main>;
}

const s:Record<string,React.CSSProperties>={page:{minHeight:"100vh",background:"#071016",color:"white",padding:24,fontFamily:"Arial,sans-serif"},header:{maxWidth:1080,margin:"0 auto 24px",display:"flex",justifyContent:"space-between"},back:{color:"#77ff55",textDecoration:"none"},hero:{maxWidth:1080,margin:"0 auto 18px",display:"flex",justifyContent:"space-between",alignItems:"end",gap:20},kicker:{fontSize:11,fontWeight:900,color:"#77ff55",letterSpacing:1.2},h1:{fontSize:"clamp(42px,8vw,78px)",letterSpacing:-3,margin:"6px 0"},muted:{color:"#91a3ad",fontSize:14},tabs:{display:"flex",gap:8},tab:{padding:"10px 14px",border:"1px solid #28404a",borderRadius:999,background:"#0e1a21",color:"#94a8b2"},active:{padding:"10px 14px",border:"1px solid #77ff55",borderRadius:999,background:"#77ff55",color:"#071016",fontWeight:900},error:{maxWidth:1080,margin:"0 auto 18px",padding:12,background:"#39161b",color:"#ff9da8",borderRadius:12},grid:{maxWidth:1080,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12},card:{textDecoration:"none",color:"white",border:"1px solid #213640",borderRadius:18,padding:18,background:"#0c171e"},row:{display:"flex",justifyContent:"space-between",gap:10},name:{fontSize:25,margin:"7px 0"},live:{fontSize:11,color:"#77ff55",fontWeight:900},quiet:{fontSize:11,color:"#6f828c"},meta:{display:"flex",gap:8,flexWrap:"wrap",fontSize:11,color:"#9badb5"},open:{marginTop:18,paddingTop:14,borderTop:"1px solid #1d3039",color:"#77ff55",fontSize:12,fontWeight:900}};
