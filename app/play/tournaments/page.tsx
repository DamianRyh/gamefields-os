"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Tournament = { id:string; name:string; sport:string; format:string; maxEntries:number; startsAt:string; status:string; organizerNickname:string; courtName:string; entryCount:number };
type Detail = { tournament:Tournament & { organizerUserId:string }; entries:Array<{userId:string;nickname:string;seed:number|null;elo:number;tier:string}>; matches:Array<{id:string;round:number;position:number;playerANickname:string|null;playerBNickname:string|null;scoreA:number|null;scoreB:number|null;status:string;winnerNickname:string|null}>; isOrganizer:boolean; isEntered:boolean };

async function post(payload:Record<string,unknown>) {
  const response = await fetch("/api/play/tournaments", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
  return data;
}

export default function TournamentsPage() {
  const [list,setList] = useState<Tournament[]>([]);
  const [detail,setDetail] = useState<Detail|null>(null);
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [courts,setCourts] = useState<Array<{id:string;name:string;sports:string}>>([]);
  const [name,setName] = useState("Warsaw Open");
  const [sport,setSport] = useState("football");
  const [courtId,setCourtId] = useState("");
  const [maxEntries,setMaxEntries] = useState(8);
  const [startsAt,setStartsAt] = useState(() => { const d=new Date(Date.now()+86400000); d.setHours(18,0,0,0); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); });

  async function loadList(){ const r=await fetch("/api/play/tournaments",{cache:"no-store"}); const d=await r.json(); if(!r.ok||!d.ok){setError(d.error||"LOAD_FAILED");return;} setList(d.tournaments||[]); }
  async function loadBootstrap(){ const r=await fetch("/api/play",{cache:"no-store"}); const d=await r.json(); if(r.ok&&d.ok){setCourts(d.courts||[]); if(!courtId&&d.courts?.[0]?.id)setCourtId(d.courts[0].id);} }
  async function open(id:string){ const r=await fetch(`/api/play/tournaments?id=${encodeURIComponent(id)}`,{cache:"no-store"}); const d=await r.json(); if(!r.ok||!d.ok){setError(d.error||"LOAD_FAILED");return;} setDetail(d); }
  useEffect(()=>{void loadList();void loadBootstrap();},[]);

  async function run(payload:Record<string,unknown>, refreshId?:string){ setBusy(true);setError("");try{const d=await post(payload); if(d.tournament)setDetail(d); else if(refreshId)await open(refreshId); await loadList();}catch(e){setError(e instanceof Error?e.message:"REQUEST_FAILED");}finally{setBusy(false);} }

  return <main style={s.page}>
    <header style={s.header}><Link href="/play" style={s.back}>← PLAY</Link><b>TOURNAMENTS</b></header>
    <section style={s.hero}><div><div style={s.kicker}>COMPETE LOCALLY</div><h1 style={s.h1}>Turnieje miasta.</h1><p style={s.muted}>Zapisz się, zdobądź seed, przejdź drabinkę i walcz o Gamefields Coins.</p></div></section>
    {error&&<div style={s.error}>{error}</div>}
    <section style={s.grid}>
      <article style={s.card}><div style={s.title}>UTWÓRZ TURNIEJ</div><input style={s.input} value={name} onChange={e=>setName(e.target.value)} placeholder="Nazwa"/><select style={s.input} value={sport} onChange={e=>setSport(e.target.value)}><option value="football">Football</option><option value="basketball">Basketball</option></select><select style={s.input} value={courtId} onChange={e=>setCourtId(e.target.value)}>{courts.filter(c=>c.sports.includes(sport)).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select style={s.input} value={maxEntries} onChange={e=>setMaxEntries(Number(e.target.value))}><option value={4}>4 graczy</option><option value={8}>8 graczy</option><option value={16}>16 graczy</option><option value={32}>32 graczy</option></select><input style={s.input} type="datetime-local" value={startsAt} onChange={e=>setStartsAt(e.target.value)}/><button style={s.primary} disabled={busy||!courtId} onClick={()=>void run({action:"create",name,sport,format:"1v1",courtId,maxEntries,startsAt:new Date(startsAt).toISOString()})}>CREATE TOURNAMENT</button></article>
      <article style={s.card}><div style={s.title}>OTWARTE / AKTYWNE</div>{list.map(t=><button key={t.id} style={s.tournament} onClick={()=>void open(t.id)}><div><b>{t.name}</b><span>{t.courtName} · {t.sport} {t.format}</span></div><div><strong>{t.entryCount}/{t.maxEntries}</strong><span>{t.status}</span></div></button>)}</article>
    </section>
    {detail&&<section style={s.detail}><div style={s.detailHead}><div><div style={s.kicker}>{detail.tournament.sport.toUpperCase()} · {detail.tournament.format}</div><h2 style={s.h2}>{detail.tournament.name}</h2><p style={s.muted}>{detail.tournament.courtName} · {new Date(detail.tournament.startsAt).toLocaleString("pl-PL")}</p></div><span style={s.badge}>{detail.tournament.status}</span></div>
      <div style={s.actions}>{!detail.isEntered&&detail.tournament.status==="open"&&<button style={s.primarySmall} disabled={busy} onClick={()=>void run({action:"join",tournamentId:detail.tournament.id},detail.tournament.id)}>JOIN</button>}{detail.isOrganizer&&detail.tournament.status==="open"&&<button style={s.primarySmall} disabled={busy} onClick={()=>void run({action:"start",tournamentId:detail.tournament.id},detail.tournament.id)}>START BRACKET</button>}</div>
      <div style={s.two}><div><div style={s.title}>ENTRIES</div>{detail.entries.map(e=><div key={e.userId} style={s.entry}><span>{e.seed?`#${e.seed}`:"—"}</span><Link href={`/play/player?nickname=${encodeURIComponent(e.nickname)}&sport=${detail.tournament.sport}`} style={s.link}>@{e.nickname}</Link><b>{e.elo}</b><em>{e.tier}</em></div>)}</div><div><div style={s.title}>BRACKET</div><div style={s.bracket}>{detail.matches.map(m=><div key={m.id} style={s.match}><div style={s.matchTop}>R{m.round} · M{m.position}<span>{m.status}</span></div><p>{m.playerANickname?`@${m.playerANickname}`:"TBD"} <b>{m.scoreA??""}</b></p><p>{m.playerBNickname?`@${m.playerBNickname}`:"TBD"} <b>{m.scoreB??""}</b></p>{m.winnerNickname&&<div style={s.winner}>WINNER @{m.winnerNickname}</div>}</div>)}</div></div></div>
    </section>}
  </main>;
}

const s:Record<string,React.CSSProperties>={
page:{minHeight:"100vh",background:"#071016",color:"white",padding:24,fontFamily:"Arial,sans-serif"},header:{maxWidth:1100,margin:"0 auto 24px",display:"flex",justifyContent:"space-between"},back:{color:"#77ff55",textDecoration:"none"},hero:{maxWidth:1100,margin:"0 auto 18px"},kicker:{fontSize:12,color:"#77ff55",fontWeight:900,letterSpacing:1.2},h1:{fontSize:"clamp(42px,8vw,78px)",margin:"7px 0",letterSpacing:-3},h2:{fontSize:38,margin:"5px 0"},muted:{color:"#91a3ad",fontSize:14},error:{maxWidth:1100,margin:"0 auto 16px",padding:12,background:"#39161b",color:"#ff9da8",borderRadius:12},grid:{maxWidth:1100,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(310px,1fr))",gap:12},card:{border:"1px solid #213640",background:"#0c171e",borderRadius:18,padding:18},title:{fontSize:12,color:"#77ff55",fontWeight:900,letterSpacing:1,marginBottom:12},input:{width:"100%",boxSizing:"border-box",padding:"12px 13px",border:"1px solid #263d47",borderRadius:12,background:"#101d25",color:"white",marginBottom:8},primary:{width:"100%",padding:13,border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:900},tournament:{width:"100%",display:"flex",justifyContent:"space-between",textAlign:"left",padding:"13px 0",border:0,borderBottom:"1px solid #1d3039",background:"transparent",color:"white"},detail:{maxWidth:1100,margin:"0 auto",border:"1px solid #213640",background:"#0c171e",borderRadius:20,padding:20},detailHead:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:20},badge:{padding:"8px 12px",border:"1px solid #77ff55",borderRadius:999,color:"#77ff55",textTransform:"uppercase",fontSize:11},actions:{display:"flex",gap:8,margin:"16px 0"},primarySmall:{padding:"11px 16px",border:0,borderRadius:12,background:"#77ff55",fontWeight:900},two:{display:"grid",gridTemplateColumns:"minmax(240px,.8fr) minmax(320px,1.2fr)",gap:18},entry:{display:"grid",gridTemplateColumns:"35px 1fr auto auto",gap:8,padding:"10px 0",borderBottom:"1px solid #1c2f37",alignItems:"center",fontSize:13},link:{color:"white",textDecoration:"none",fontWeight:800},bracket:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8},match:{border:"1px solid #233842",borderRadius:12,padding:12,background:"#101d25"},matchTop:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#91a3ad"},winner:{fontSize:11,color:"#77ff55",fontWeight:900}
};
