"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Game = { id:string; courtName:string; sport:string; format:string; level:string; startsAt:string; maxPlayers:number; playerCount:number; status:string };

export default function GamesPage(){
  const [games,setGames]=useState<Game[]>([]);
  const [sport,setSport]=useState("football");
  const [error,setError]=useState("");
  useEffect(()=>{(async()=>{const r=await fetch("/api/play",{cache:"no-store"});const d=await r.json();if(!r.ok||!d.ok){setError(d.error||"LOAD_FAILED");return;}setGames(d.games||[]);})().catch(()=>setError("LOAD_FAILED"));},[]);
  const filtered=games.filter(g=>g.sport===sport);
  return <main style={s.page}>
    <header style={s.header}><Link href="/play" style={s.back}>← PLAY</Link><b>GAMES</b></header>
    <section style={s.hero}><div><div style={s.kicker}>FIND A GAME</div><h1 style={s.h1}>Wejdź do gry.</h1><p style={s.muted}>Otwórz Game Room, zobacz skład i dołącz do lokalnej rywalizacji.</p></div><div style={s.tabs}><button style={sport==="football"?s.active:s.tab} onClick={()=>setSport("football")}>Football</button><button style={sport==="basketball"?s.active:s.tab} onClick={()=>setSport("basketball")}>Basketball</button></div></section>
    {error&&<div style={s.error}>{error}</div>}
    <section style={s.grid}>{filtered.map(g=><Link key={g.id} href={`/play/game?gameId=${encodeURIComponent(g.id)}`} style={s.card}><div style={s.row}><span style={s.kicker}>{g.format} · {g.level}</span><span style={s.live}>{g.playerCount}/{g.maxPlayers}</span></div><h2 style={{margin:"18px 0 5px"}}>{g.courtName}</h2><p style={s.muted}>{new Date(g.startsAt).toLocaleString("pl-PL")}</p><div style={s.open}>OPEN GAME ROOM →</div></Link>)}{!filtered.length&&!error&&<div style={s.muted}>Brak otwartych gier dla tego sportu.</div>}</section>
  </main>;
}

const s:Record<string,React.CSSProperties>={page:{minHeight:"100vh",background:"#071016",color:"white",padding:24,fontFamily:"Arial,sans-serif"},header:{maxWidth:1050,margin:"0 auto 24px",display:"flex",justifyContent:"space-between"},back:{color:"#77ff55",textDecoration:"none"},hero:{maxWidth:1050,margin:"0 auto 18px",display:"flex",justifyContent:"space-between",gap:20,alignItems:"end"},kicker:{fontSize:12,color:"#77ff55",fontWeight:900,letterSpacing:1.2},h1:{fontSize:"clamp(42px,8vw,78px)",letterSpacing:-3,margin:"6px 0"},muted:{color:"#91a3ad",fontSize:14},tabs:{display:"flex",gap:8},tab:{padding:"10px 14px",border:"1px solid #28404a",borderRadius:999,background:"#0e1a21",color:"#94a8b2"},active:{padding:"10px 14px",border:"1px solid #77ff55",borderRadius:999,background:"#77ff55",color:"#071016",fontWeight:900},error:{maxWidth:1050,margin:"0 auto 18px",padding:12,background:"#39161b",color:"#ff9da8",borderRadius:12},grid:{maxWidth:1050,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12},card:{textDecoration:"none",color:"white",border:"1px solid #213640",background:"#0c171e",borderRadius:18,padding:18},row:{display:"flex",justifyContent:"space-between"},live:{fontSize:12,color:"#77ff55",fontWeight:900},open:{marginTop:18,paddingTop:14,borderTop:"1px solid #1d3039",fontSize:12,fontWeight:900,color:"#77ff55"}};
