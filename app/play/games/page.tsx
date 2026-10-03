"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Game = { id:string; courtId:string; courtName:string; sport:string; format:string; level:string; startsAt:string; maxPlayers:number; playerCount:number; status:string };
type Court = { id:string; name:string; sports:string; district:string|null; city:string };

type Bootstrap = { games:Game[]; courts:Court[] };

async function postPlay(body:Record<string,unknown>){
  const r=await fetch("/api/play",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const d=await r.json();
  if(!r.ok||!d.ok) throw new Error(d.error||"REQUEST_FAILED");
  return d;
}

export default function GamesPage(){
  const [data,setData]=useState<Bootstrap|null>(null);
  const [sport,setSport]=useState("football");
  const [showCreate,setShowCreate]=useState(false);
  const [courtId,setCourtId]=useState("");
  const [format,setFormat]=useState("3v3");
  const [level,setLevel]=useState("open");
  const [maxPlayers,setMaxPlayers]=useState(6);
  const [startTime,setStartTime]=useState(()=>{
    const d=new Date(Date.now()+60*60*1000);d.setMinutes(0,0,0);
    return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
  });
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function load(){
    setError("");
    const r=await fetch("/api/play",{cache:"no-store"});
    const d=await r.json();
    if(!r.ok||!d.ok) throw new Error(d.error||"LOAD_FAILED");
    setData({games:d.games||[],courts:d.courts||[]});
    const valid=(d.courts||[]).find((c:Court)=>c.sports.includes(sport));
    setCourtId(current=>current||valid?.id||"");
  }
  useEffect(()=>{void load().catch(e=>setError(e instanceof Error?e.message:"LOAD_FAILED"));},[]);

  const courts=useMemo(()=>data?.courts.filter(c=>c.sports.includes(sport))||[],[data,sport]);
  const filtered=useMemo(()=>data?.games.filter(g=>g.sport===sport).sort((a,b)=>new Date(a.startsAt).getTime()-new Date(b.startsAt).getTime())||[],[data,sport]);

  function changeSport(next:string){
    setSport(next);
    const first=data?.courts.find(c=>c.sports.includes(next));
    setCourtId(first?.id||"");
    if(next==="basketball"&&format==="5v5") setFormat("3v3");
  }

  async function createGame(){
    if(!courtId) return;
    setBusy(true);setError("");
    try{
      const result=await postPlay({action:"create_game",sport,courtId,format,level,maxPlayers,startsAt:new Date(startTime).toISOString()});
      window.location.href=`/play/game?gameId=${encodeURIComponent(result.gameId)}`;
    }catch(e){setError(e instanceof Error?e.message:"REQUEST_FAILED");setBusy(false);}
  }

  return <main style={s.page}>
    <header style={s.header}><Link href="/play" style={s.back}>← PLAY</Link><b>GAMES</b></header>

    <section style={s.hero}>
      <div><div style={s.kicker}>FIND / JOIN / CREATE</div><h1 style={s.h1}>Wejdź do gry.</h1><p style={s.muted}>Otwórz istniejący Game Room albo utwórz własny mecz w kilkanaście sekund.</p></div>
      <div style={s.heroActions}><div style={s.tabs}><button style={sport==="football"?s.active:s.tab} onClick={()=>changeSport("football")}>Football</button><button style={sport==="basketball"?s.active:s.tab} onClick={()=>changeSport("basketball")}>Basketball</button></div><button style={s.createToggle} onClick={()=>setShowCreate(v=>!v)}>{showCreate?"CLOSE":"+ CREATE GAME"}</button></div>
    </section>

    {error&&<div style={s.error}>{error}</div>}

    {showCreate&&<section style={s.createCard}>
      <div style={s.createHead}><div><span style={s.kicker}>NEW GAME</span><h2 style={s.createTitle}>Ustaw mecz.</h2></div><span style={s.muted}>minimum pól · szybki start</span></div>
      <div style={s.formGrid}>
        <label style={s.label}>Court<select style={s.input} value={courtId} onChange={e=>setCourtId(e.target.value)}>{courts.map(c=><option key={c.id} value={c.id}>{c.name} · {c.district||c.city}</option>)}</select></label>
        <label style={s.label}>Format<select style={s.input} value={format} onChange={e=>setFormat(e.target.value)}><option>1v1</option><option>2v2</option><option>3v3</option>{sport==="football"&&<option>5v5</option>}</select></label>
        <label style={s.label}>Level<select style={s.input} value={level} onChange={e=>setLevel(e.target.value)}><option value="open">Open</option><option value="intermediate">Intermediate+</option><option value="advanced">Advanced+</option></select></label>
        <label style={s.label}>Players<input style={s.input} type="number" min={2} max={30} value={maxPlayers} onChange={e=>setMaxPlayers(Math.max(2,Number(e.target.value)||2))}/></label>
        <label style={{...s.label,...s.wide}}>Start<input style={s.input} type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)}/></label>
      </div>
      <button disabled={busy||!courtId} style={s.primary} onClick={()=>void createGame()}>CREATE GAME ROOM</button>
    </section>}

    <section style={s.sectionHead}><div><span style={s.kicker}>OPEN GAMES</span><h2 style={s.h2}>{sport==="football"?"Football":"Basketball"} w Warszawie.</h2></div><span style={s.count}>{filtered.length} OPEN</span></section>

    <section style={s.grid}>{filtered.map(g=><Link key={g.id} href={`/play/game?gameId=${encodeURIComponent(g.id)}`} style={s.card}><div style={s.row}><span style={s.kicker}>{g.format} · {g.level.toUpperCase()}</span><span style={g.playerCount>=g.maxPlayers?s.full:s.live}>{g.playerCount}/{g.maxPlayers}</span></div><h2 style={s.gameTitle}>{g.courtName}</h2><p style={s.muted}>{new Date(g.startsAt).toLocaleString("pl-PL")}</p><div style={s.progress}><span style={{...s.progressFill,width:`${Math.min(100,(g.playerCount/g.maxPlayers)*100)}%`}}/></div><div style={s.open}>OPEN GAME ROOM →</div></Link>)}{!filtered.length&&!error&&<div style={s.empty}><b>Brak otwartych gier.</b><span>Utwórz pierwszą i zaproś graczy.</span><button style={s.createInline} onClick={()=>setShowCreate(true)}>+ CREATE GAME</button></div>}</section>
  </main>;
}

const s:Record<string,React.CSSProperties>={page:{minHeight:"100vh",background:"#071016",color:"white",padding:24,fontFamily:"Arial,sans-serif"},header:{maxWidth:1080,margin:"0 auto 24px",display:"flex",justifyContent:"space-between",fontSize:12,color:"#91a3ad"},back:{color:"#77ff55",textDecoration:"none",fontWeight:900},hero:{maxWidth:1080,margin:"0 auto 18px",display:"flex",justifyContent:"space-between",gap:20,alignItems:"end",flexWrap:"wrap"},kicker:{fontSize:11,color:"#77ff55",fontWeight:900,letterSpacing:1.2},h1:{fontSize:"clamp(42px,8vw,78px)",letterSpacing:-3,margin:"6px 0",lineHeight:.94},muted:{color:"#91a3ad",fontSize:13},heroActions:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"},tabs:{display:"flex",gap:8},tab:{padding:"10px 14px",border:"1px solid #28404a",borderRadius:999,background:"#0e1a21",color:"#94a8b2"},active:{padding:"10px 14px",border:"1px solid #77ff55",borderRadius:999,background:"#77ff55",color:"#071016",fontWeight:900},createToggle:{padding:"11px 15px",border:"1px solid #77ff55",borderRadius:12,background:"#10231a",color:"#77ff55",fontWeight:900},error:{maxWidth:1080,margin:"0 auto 18px",padding:12,background:"#39161b",color:"#ff9da8",borderRadius:12},createCard:{maxWidth:1080,margin:"0 auto 18px",padding:20,border:"1px solid #355c40",borderRadius:20,background:"linear-gradient(135deg,#0e2118,#0c171e)"},createHead:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:12,marginBottom:14},createTitle:{fontSize:32,margin:"5px 0",letterSpacing:-1.3},formGrid:{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginBottom:8},wide:{gridColumn:"1 / -1"},label:{display:"grid",gap:6,color:"#8fa2ab",fontSize:10,fontWeight:900,textTransform:"uppercase"},input:{width:"100%",minWidth:0,boxSizing:"border-box",padding:"12px 13px",border:"1px solid #29404a",borderRadius:12,background:"#081319",color:"white"},primary:{width:"100%",padding:14,border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:1000},sectionHead:{maxWidth:1080,margin:"0 auto 10px",display:"flex",justifyContent:"space-between",alignItems:"end",gap:12},h2:{fontSize:"clamp(26px,5vw,44px)",margin:"5px 0",letterSpacing:-1.5},count:{padding:"8px 10px",borderRadius:999,background:"#10231a",color:"#77ff55",fontSize:10,fontWeight:900},grid:{maxWidth:1080,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12},card:{textDecoration:"none",color:"white",border:"1px solid #213640",background:"#0c171e",borderRadius:18,padding:18},row:{display:"flex",justifyContent:"space-between",gap:8},live:{fontSize:11,color:"#77ff55",fontWeight:900},full:{fontSize:11,color:"#ffc46a",fontWeight:900},gameTitle:{margin:"18px 0 5px",letterSpacing:-.8},progress:{height:4,borderRadius:99,background:"#14252d",overflow:"hidden",marginTop:15},progressFill:{display:"block",height:"100%",background:"#77ff55"},open:{marginTop:16,paddingTop:13,borderTop:"1px solid #1d3039",fontSize:11,fontWeight:900,color:"#77ff55"},empty:{padding:22,border:"1px dashed #2a414b",borderRadius:18,color:"#91a3ad",display:"grid",gap:8},createInline:{justifySelf:"start",padding:"10px 12px",border:"1px solid #77ff55",borderRadius:10,background:"transparent",color:"#77ff55",fontWeight:900}}
