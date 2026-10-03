"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Room = {
  game: { id:string; creatorUserId:string; courtName:string; courtDistrict:string|null; sport:string; format:string; level:string; startsAt:string; maxPlayers:number; status:string; scoreA:number|null; scoreB:number|null };
  players: Array<{ userId:string; nickname:string; team:string|null; elo:number; tier:string }>;
  isCreator:boolean;
  teams:{ A:Array<{userId:string;nickname:string;elo:number}>; B:Array<{userId:string;nickname:string;elo:number}>; averageA:number; averageB:number };
};

async function action(payload: Record<string, unknown>) {
  const response = await fetch("/api/play/game-room", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
  return data;
}

export default function GameRoomPage() {
  const params = useSearchParams();
  const gameId = params.get("gameId") || "";
  const [data, setData] = useState<Room | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!gameId) return;
    const response = await fetch(`/api/play/game-room?gameId=${encodeURIComponent(gameId)}`, { cache:"no-store" });
    const result = await response.json();
    if (!response.ok || !result.ok) { setError(result.error || "LOAD_FAILED"); return; }
    setData(result);
    if (result.game.scoreA != null) setScoreA(result.game.scoreA);
    if (result.game.scoreB != null) setScoreB(result.game.scoreB);
  }
  useEffect(() => { void load(); }, [gameId]);

  async function run(name:string, extra:Record<string,unknown> = {}) {
    setBusy(true); setError("");
    try { const result = await action({ action:name, gameId, ...extra }); setData(result); }
    catch (e) { setError(e instanceof Error ? e.message : "REQUEST_FAILED"); }
    finally { setBusy(false); }
  }

  if (!data) return <main style={s.center}>{error || "Ładowanie Game Room…"}</main>;
  const g = data.game;
  return <main style={s.page}>
    <header style={s.header}><Link href="/play" style={s.back}>← PLAY</Link><span>GAME #{g.id.slice(-6).toUpperCase()}</span></header>
    <section style={s.hero}><div><div style={s.kicker}>{g.sport.toUpperCase()} · {g.format}</div><h1 style={s.h1}>{g.courtName}</h1><p style={s.muted}>{g.courtDistrict || "Warszawa"} · {new Date(g.startsAt).toLocaleString("pl-PL")}</p></div><span style={s.status}>{g.status.replaceAll("_"," ")}</span></section>
    {error && <div style={s.error}>{error}</div>}
    <section style={s.grid}>
      <article style={s.card}><div style={s.title}>PLAYERS {data.players.length}/{g.maxPlayers}</div>{data.players.map(p => <div key={p.userId} style={s.player}><Link href={`/play/player?nickname=${encodeURIComponent(p.nickname)}&sport=${g.sport}`} style={s.playerLink}>@{p.nickname}</Link><span>{p.elo} · {p.tier}</span><b>{p.team || "—"}</b></div>)}</article>
      <article style={s.card}><div style={s.title}>TEAMS</div><div style={s.teamGrid}><div><h3>BLACK / A</h3>{data.teams.A.map(p => <p key={p.userId}>@{p.nickname} <span style={s.muted}>{p.elo}</span></p>)}<b>AVG {data.teams.averageA}</b></div><div><h3>WHITE / B</h3>{data.teams.B.map(p => <p key={p.userId}>@{p.nickname} <span style={s.muted}>{p.elo}</span></p>)}<b>AVG {data.teams.averageB}</b></div></div>{data.isCreator && g.status === "open" && <button disabled={busy} style={s.secondary} onClick={() => void run("generate_teams")}>GENERATE BALANCED TEAMS</button>}</article>
    </section>
    {data.isCreator && g.status === "open" && <section style={s.cardWide}><button disabled={busy} style={s.primary} onClick={() => void run("start_game")}>START GAME</button></section>}
    {(g.status === "in_progress" || g.status === "awaiting_confirmation") && <section style={s.scoreCard}><div style={s.title}>FINAL SCORE</div><div style={s.score}><label>BLACK<input type="number" min={0} max={99} value={scoreA} onChange={e=>setScoreA(Number(e.target.value))}/></label><strong>:</strong><label>WHITE<input type="number" min={0} max={99} value={scoreB} onChange={e=>setScoreB(Number(e.target.value))}/></label></div>{g.status === "in_progress" ? <button disabled={busy} style={s.primary} onClick={() => void run("submit_result", {scoreA,scoreB})}>SUBMIT RESULT</button> : <><p style={s.muted}>Wynik czeka na potwierdzenie drugiej strony.</p><button disabled={busy} style={s.primary} onClick={() => void run("confirm_result")}>CONFIRM RESULT</button></>}</section>}
    {g.status === "completed" && <section style={s.done}><div style={s.kicker}>RESULT CONFIRMED</div><h2 style={{fontSize:56,margin:8}}>{g.scoreA} : {g.scoreB}</h2><Link href="/play" style={s.back}>WRÓĆ DO PLAY</Link></section>}
  </main>;
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#071016",color:"white",padding:24,fontFamily:"Arial,sans-serif"},center:{minHeight:"100vh",display:"grid",placeItems:"center",background:"#071016",color:"white"},header:{maxWidth:1000,margin:"0 auto 24px",display:"flex",justifyContent:"space-between",color:"#9eb0ba"},back:{color:"#77ff55",textDecoration:"none",fontWeight:900},hero:{maxWidth:1000,margin:"0 auto 20px",display:"flex",justifyContent:"space-between",alignItems:"end",gap:20},kicker:{fontSize:12,fontWeight:900,color:"#77ff55",letterSpacing:1.2},h1:{fontSize:"clamp(40px,8vw,76px)",margin:"5px 0",letterSpacing:-3},muted:{color:"#91a3ad",fontSize:14},status:{padding:"9px 13px",border:"1px solid #77ff55",borderRadius:999,color:"#77ff55",fontSize:12,textTransform:"uppercase"},error:{maxWidth:1000,margin:"0 auto 16px",padding:12,background:"#39161b",color:"#ff9da8",borderRadius:12},grid:{maxWidth:1000,margin:"0 auto 16px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12},card:{background:"#0c171e",border:"1px solid #213640",borderRadius:18,padding:18},cardWide:{maxWidth:1000,margin:"0 auto 16px",background:"#0c171e",border:"1px solid #213640",borderRadius:18,padding:18},title:{fontSize:12,fontWeight:900,color:"#77ff55",letterSpacing:1,marginBottom:12},player:{display:"grid",gridTemplateColumns:"1fr auto 28px",gap:10,padding:"10px 0",borderBottom:"1px solid #1a2d35",alignItems:"center",fontSize:13},playerLink:{color:"white",textDecoration:"none",fontWeight:800},teamGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18},secondary:{width:"100%",marginTop:12,padding:13,border:"1px solid #77ff55",borderRadius:12,background:"transparent",color:"#77ff55",fontWeight:900},primary:{width:"100%",padding:14,border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:900},scoreCard:{maxWidth:1000,margin:"0 auto 16px",background:"#0c171e",border:"1px solid #213640",borderRadius:18,padding:18,textAlign:"center"},score:{display:"flex",justifyContent:"center",alignItems:"center",gap:20,margin:"24px 0"},done:{maxWidth:1000,margin:"0 auto",textAlign:"center",padding:30,border:"1px solid #77ff55",borderRadius:20,background:"#0c171e"}
};
