"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Profile = {
  isMe: boolean;
  player: { id:string; nickname: string; displayName: string | null; city: string; coins?: number };
  sport: string;
  rating: null | { elo: number; tier: string; skillLevel: string; games: number; wins: number; losses: number; draws: number; winRate: number; cityRank: number | null; courtRank: number | null };
  homeCourt: null | { courtId: string; courtName: string; district: string | null };
  history: Array<{ gameId: string; before: number; after: number; change: number; createdAt: string; scoreA: number; scoreB: number; courtName: string }>;
};

export default function PlayerProfilePage() {
  const params = useSearchParams();
  const nickname = params.get("nickname") || "";
  const playerId = params.get("id") || "";
  const [sport, setSport] = useState(params.get("sport") || "football");
  const [data, setData] = useState<Profile | null>(null);
  const [isFollowing,setIsFollowing]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!nickname && !playerId) return;
    setError("");
    const response = await fetch(`/api/play/player-profile?${playerId?`id=${encodeURIComponent(playerId)}`:`nickname=${encodeURIComponent(nickname)}`}&sport=${sport}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.ok) { setError(result.error || "LOAD_FAILED"); return; }
    setData(result);
    if(!result.isMe){
      const socialResponse=await fetch("/api/play/social",{cache:"no-store"});
      const social=await socialResponse.json();
      if(socialResponse.ok&&social.ok)setIsFollowing((social.followingUserIds||[]).includes(result.player.id));
    }
  }
  useEffect(() => { void load(); }, [nickname, playerId, sport]);

  async function toggleFollow(){
    if(!data||data.isMe)return;setBusy(true);setError("");
    try{const r=await fetch("/api/play/social",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:isFollowing?"unfollow":"follow",userId:data.player.id})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||"REQUEST_FAILED");setIsFollowing(!isFollowing);}
    catch(e){setError(e instanceof Error?e.message:"REQUEST_FAILED");}finally{setBusy(false);}
  }

  if (!data) return <main style={s.center}>{error || "Ładowanie profilu…"}</main>;
  const r = data.rating;
  return (
    <main style={s.page}>
      <header style={s.header}><Link href="/play/players" style={s.back}>← PLAYERS</Link><Link href="/play" style={s.back}>PLAY</Link></header>
      <section style={s.hero}>
        <div><div style={s.kicker}>PLAYER PROFILE</div><h1 style={s.h1}>@{data.player.nickname}</h1><p style={s.muted}>{data.player.displayName || data.player.city}</p>{!data.isMe&&<div style={s.playerActions}><button disabled={busy} style={isFollowing?s.following:s.follow} onClick={()=>void toggleFollow()}>{isFollowing?"FOLLOWING ✓":"FOLLOW PLAYER"}</button><Link href={`/play/challenge/new?playerId=${encodeURIComponent(data.player.id)}&sport=${sport}`} style={s.challenge}>CHALLENGE</Link></div>}</div>
        <div style={s.tabs}><button style={sport === "football" ? s.active : s.tab} onClick={() => setSport("football")}>Football</button><button style={sport === "basketball" ? s.active : s.tab} onClick={() => setSport("basketball")}>Basketball</button></div>
      </section>
      {error&&<div style={s.error}>{error}</div>}
      {r ? <>
        <section style={s.stats}>
          <div style={s.big}><strong>{r.elo}</strong><span>ELO</span><em>{r.tier}</em></div>
          <div><b>#{r.cityRank ?? "—"}</b><span>Warszawa</span></div>
          <div><b>#{r.courtRank ?? "—"}</b><span>Home Court</span></div>
          <div><b>{r.winRate}%</b><span>Win rate</span></div>
        </section>
        <section style={s.grid}>
          <article style={s.card}><div style={s.title}>STATYSTYKI</div><div style={s.list}><p>{r.games} gier</p><p>{r.wins} zwycięstw</p><p>{r.losses} porażek</p><p>{r.draws} remisów</p><p>Poziom: {r.skillLevel}</p></div></article>
          <article style={s.card}><div style={s.title}>HOME COURT</div>{data.homeCourt ? <><h3>{data.homeCourt.courtName}</h3><p style={s.muted}>{data.homeCourt.district || data.player.city}</p><Link href={`/play/court?id=${encodeURIComponent(data.homeCourt.courtId)}&sport=${sport}`} style={s.inlineLink}>OPEN COURT →</Link></> : <p style={s.muted}>Nie wybrano Home Court.</p>}</article>
          {data.isMe && <article style={s.card}><div style={s.title}>GAMEFIELDS COINS</div><h2 style={{fontSize:42,margin:"8px 0",color:"#77ff55"}}>{data.player.coins ?? 0}</h2><p style={s.muted}>Zdobywane za realną aktywność w PLAY.</p><Link href="/play/community" style={s.inlineLink}>OPEN COMMUNITY →</Link></article>}
        </section>
        <section style={s.cardWide}><div style={s.title}>HISTORIA ELO</div><div style={s.history}>{data.history.map((h) => <Link key={h.gameId} href={`/play/game?gameId=${h.gameId}`} style={s.historyRow}><div><b>{h.courtName}</b><div style={s.muted}>{new Date(h.createdAt).toLocaleDateString("pl-PL")} · {h.scoreA}:{h.scoreB}</div></div><strong style={{color:h.change >= 0 ? "#77ff55" : "#ff7b88"}}>{h.change >= 0 ? "+" : ""}{h.change} → {h.after}</strong></Link>)}</div></section>
      </> : <section style={s.cardWide}><p style={s.muted}>Ten gracz nie ma jeszcze rankingu w wybranym sporcie.</p></section>}
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#071016",color:"#f4f8f5",padding:24,fontFamily:"Arial,sans-serif"},center:{minHeight:"100vh",display:"grid",placeItems:"center",background:"#071016",color:"white"},header:{maxWidth:1060,margin:"0 auto 24px",display:"flex",justifyContent:"space-between"},back:{color:"#77ff55",textDecoration:"none"},hero:{maxWidth:1060,margin:"0 auto 20px",display:"flex",justifyContent:"space-between",gap:20,alignItems:"end"},kicker:{color:"#77ff55",fontSize:12,fontWeight:900},h1:{fontSize:"clamp(42px,8vw,80px)",margin:"6px 0",letterSpacing:-4},muted:{color:"#91a3ad",fontSize:14},tabs:{display:"flex",gap:8},tab:{padding:"10px 14px",borderRadius:999,border:"1px solid #28404a",background:"#0e1a21",color:"#94a8b2"},active:{padding:"10px 14px",borderRadius:999,border:"1px solid #77ff55",background:"#77ff55",color:"#071016",fontWeight:900},stats:{maxWidth:1060,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10},big:{border:"1px solid #77ff55!important"},grid:{maxWidth:1060,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12},card:{border:"1px solid #20353f",background:"#0c171e",borderRadius:18,padding:18},cardWide:{maxWidth:1060,margin:"0 auto 18px",border:"1px solid #20353f",background:"#0c171e",borderRadius:18,padding:18},title:{fontSize:12,fontWeight:900,letterSpacing:1,color:"#77ff55"},list:{color:"#d5e2df"},history:{display:"grid"},historyRow:{display:"flex",justifyContent:"space-between",gap:12,padding:"14px 0",borderBottom:"1px solid #1c2f37",textDecoration:"none",color:"white"},playerActions:{display:"flex",gap:8,flexWrap:"wrap",marginTop:12},follow:{padding:"10px 14px",border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:900},following:{padding:"10px 14px",border:"1px solid #77ff55",borderRadius:12,background:"transparent",color:"#77ff55",fontWeight:900},challenge:{padding:"10px 14px",border:"1px solid #ffb84d",borderRadius:12,color:"#ffcf80",textDecoration:"none",fontWeight:900},error:{maxWidth:1060,margin:"0 auto 14px",padding:12,borderRadius:12,background:"#39161b",color:"#ff9da8"},inlineLink:{display:"inline-block",marginTop:10,color:"#77ff55",textDecoration:"none",fontSize:11,fontWeight:900}
};
