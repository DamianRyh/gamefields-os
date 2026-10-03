"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Player = {
  userId: string;
  nickname: string;
  displayName: string | null;
  city: string;
  elo: number;
  tier: string;
  skillLevel: string;
  games: number;
  winRate: number;
  homeCourtName: string | null;
  playingNow: boolean;
};

export default function PlayersPage() {
  const [sport, setSport] = useState("football");
  const [q, setQ] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const params = new URLSearchParams({ sport });
    if (q.trim()) params.set("q", q.trim());
    const response = await fetch(`/api/play/discover?${params}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) { setError(data.error || "LOAD_FAILED"); return; }
    setPlayers(data.players || []);
  }

  useEffect(() => { void load(); }, [sport]);

  return (
    <main style={s.page}>
      <header style={s.header}><Link href="/play" style={s.back}>← PLAY</Link><b>PLAYERS</b></header>
      <section style={s.hero}>
        <div><div style={s.kicker}>PLAYER DISCOVERY</div><h1 style={s.h1}>Znajdź ludzi do gry.</h1><p style={s.muted}>Przeglądaj graczy z Warszawy według sportu, poziomu, ELO i Home Court.</p></div>
        <div style={s.tabs}><button style={sport === "football" ? s.active : s.tab} onClick={() => setSport("football")}>Football</button><button style={sport === "basketball" ? s.active : s.tab} onClick={() => setSport("basketball")}>Basketball</button></div>
      </section>
      <section style={s.search}><input style={s.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nick lub imię..." onKeyDown={(e) => e.key === "Enter" && void load()} /><button style={s.primary} onClick={() => void load()}>SZUKAJ</button></section>
      {error && <div style={s.error}>{error}</div>}
      <section style={s.grid}>
        {players.map((p) => <Link key={p.userId} href={`/play/player?nickname=${encodeURIComponent(p.nickname)}&sport=${sport}`} style={s.card}>
          <div style={s.row}><div><b style={s.nick}>@{p.nickname}</b><div style={s.muted}>{p.displayName || p.city}</div></div>{p.playingNow && <span style={s.live}>● GRA TERAZ</span>}</div>
          <div style={s.rating}><strong>{p.elo}</strong><span>ELO</span><em>{p.tier}</em></div>
          <div style={s.meta}><span>{p.games} gier</span><span>{p.winRate}% win</span><span>{p.skillLevel}</span></div>
          {p.homeCourtName && <div style={s.home}>⌖ {p.homeCourtName}</div>}
        </Link>)}
        {!players.length && !error && <div style={s.muted}>Brak graczy dla wybranego filtra.</div>}
      </section>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#071016",color:"#f4f8f5",padding:24,fontFamily:"Arial,sans-serif"},header:{maxWidth:1100,margin:"0 auto 24px",display:"flex",justifyContent:"space-between"},back:{color:"#77ff55",textDecoration:"none"},hero:{maxWidth:1100,margin:"0 auto 18px",display:"flex",justifyContent:"space-between",gap:24,alignItems:"end"},kicker:{color:"#77ff55",fontSize:12,fontWeight:900,letterSpacing:1.4},h1:{fontSize:"clamp(38px,7vw,72px)",lineHeight:.95,letterSpacing:-3,margin:"8px 0"},muted:{color:"#91a3ad",fontSize:14},tabs:{display:"flex",gap:8},tab:{padding:"10px 14px",borderRadius:999,border:"1px solid #28404a",background:"#0e1a21",color:"#94a8b2"},active:{padding:"10px 14px",borderRadius:999,border:"1px solid #77ff55",background:"#77ff55",color:"#071016",fontWeight:900},search:{maxWidth:1100,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"1fr auto",gap:8},input:{padding:"14px 16px",borderRadius:14,border:"1px solid #263c46",background:"#0d1920",color:"white"},primary:{padding:"0 22px",border:0,borderRadius:14,background:"#77ff55",fontWeight:900},error:{maxWidth:1100,margin:"0 auto 18px",padding:12,borderRadius:12,background:"#351519",color:"#ff9da8"},grid:{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12},card:{textDecoration:"none",color:"white",border:"1px solid #213640",background:"#0c171e",borderRadius:18,padding:18},row:{display:"flex",justifyContent:"space-between",gap:10},nick:{fontSize:18},live:{fontSize:11,color:"#77ff55",fontWeight:900},rating:{display:"flex",alignItems:"baseline",gap:7,margin:"22px 0 12px"},meta:{display:"flex",gap:10,flexWrap:"wrap",fontSize:12,color:"#9bb0ba"},home:{marginTop:14,paddingTop:12,borderTop:"1px solid #1d3039",fontSize:13,color:"#d5e3df"}
};
