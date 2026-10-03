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
  readyNow: boolean;
  availableUntil: string | null;
};

export default function PlayersPage() {
  const [sport, setSport] = useState("football");
  const [q, setQ] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [sort, setSort] = useState("elo");
  const [eloBand, setEloBand] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSport = params.get("sport");
    if (initialSport === "football" || initialSport === "basketball") setSport(initialSport);
    if (params.get("ready") === "1") setReady(true);
    if (params.get("live") === "1") setLive(true);
  }, []);

  async function load() {
    setError("");
    const params = new URLSearchParams({ sport, sort });
    if (q.trim()) params.set("q", q.trim());
    if (ready) params.set("ready", "1");
    if (live) params.set("live", "1");
    if (eloBand === "starter") { params.set("minElo", "0"); params.set("maxElo", "1049"); }
    if (eloBand === "street") { params.set("minElo", "1050"); params.set("maxElo", "1199"); }
    if (eloBand === "challenger") { params.set("minElo", "1200"); params.set("maxElo", "1349"); }
    if (eloBand === "elite") { params.set("minElo", "1350"); params.set("maxElo", "4000"); }
    const response = await fetch(`/api/play/discover?${params}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) { setError(data.error || "LOAD_FAILED"); return; }
    setPlayers(data.players || []);
  }

  useEffect(() => { void load(); }, [sport, ready, live, sort, eloBand]);

  return (
    <main style={s.page}>
      <header style={s.header}><div><div style={s.kicker}>PLAYER DISCOVERY</div><h1 style={s.h1}>Znajdź ludzi do gry.</h1></div><Link href="/play/map" style={s.back}>MAPA →</Link></header>
      <section style={s.hero}>
        <p style={s.muted}>Nie tylko ranking. Zobacz kto szuka gry teraz, kto już jest na boisku i kto jest na Twoim poziomie.</p>
        <div style={s.tabs}><button style={sport === "football" ? s.active : s.tab} onClick={() => setSport("football")}>Football</button><button style={sport === "basketball" ? s.active : s.tab} onClick={() => setSport("basketball")}>Basketball</button></div>
      </section>

      <section style={s.filters}>
        <div style={s.search}><input style={s.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nick lub imię..." onKeyDown={(e) => e.key === "Enter" && void load()} /><button style={s.primary} onClick={() => void load()}>SZUKAJ</button></div>
        <div style={s.filterRow}>
          <button style={ready ? s.liveFilter : s.filter} onClick={() => setReady((v) => !v)}>⚡ READY NOW</button>
          <button style={live ? s.liveFilter : s.filter} onClick={() => setLive((v) => !v)}>● GRA TERAZ</button>
          <select style={s.select} value={eloBand} onChange={(e) => setEloBand(e.target.value)}><option value="all">Każde ELO</option><option value="starter">do 1049</option><option value="street">1050–1199</option><option value="challenger">1200–1349</option><option value="elite">1350+</option></select>
          <select style={s.select} value={sort} onChange={(e) => setSort(e.target.value)}><option value="elo">Sortuj: ELO</option><option value="ready">READY first</option><option value="games">Najwięcej gier</option><option value="win">Win rate</option></select>
        </div>
      </section>

      {error && <div style={s.error}>{error}</div>}
      <section style={s.summary}><b>{players.length}</b><span>graczy pasuje do filtrów</span>{ready ? <em>READY TO PLAY</em> : null}{live ? <em>LIVE</em> : null}</section>
      <section style={s.grid}>
        {players.map((p) => <Link key={p.userId} href={`/play/player?nickname=${encodeURIComponent(p.nickname)}&sport=${sport}`} style={{ ...s.card, ...(p.readyNow ? s.readyCard : {}) }}>
          <div style={s.row}><div><b style={s.nick}>@{p.nickname}</b><div style={s.muted}>{p.displayName || p.city}</div></div><div style={s.states}>{p.readyNow && <span style={s.ready}>⚡ READY</span>}{p.playingNow && <span style={s.live}>● LIVE</span>}</div></div>
          <div style={s.rating}><strong>{p.elo}</strong><span>ELO</span><em>{p.tier}</em></div>
          <div style={s.meta}><span>{p.games} gier</span><span>{p.winRate}% win</span><span>{p.skillLevel}</span></div>
          {p.homeCourtName && <div style={s.home}>⌖ {p.homeCourtName}</div>}
          {p.readyNow && p.availableUntil ? <div style={s.until}>szuka gry do {new Date(p.availableUntil).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</div> : null}
        </Link>)}
        {!players.length && !error && <div style={s.empty}><b>Nikt nie pasuje do tego filtra.</b><span>Zmień zakres albo sprawdź mapę — aktywność może pojawić się na konkretnym boisku.</span><Link href="/play/map" style={s.primaryLink}>OTWÓRZ MAPĘ</Link></div>}
      </section>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#071016",color:"#f4f8f5",padding:"24px 24px 120px",fontFamily:"Arial,sans-serif"},header:{maxWidth:1100,margin:"0 auto 8px",display:"flex",justifyContent:"space-between",alignItems:"start",gap:20},back:{color:"#77ff55",textDecoration:"none",fontSize:11,fontWeight:900},hero:{maxWidth:1100,margin:"0 auto 18px",display:"flex",justifyContent:"space-between",gap:24,alignItems:"end"},kicker:{color:"#77ff55",fontSize:12,fontWeight:900,letterSpacing:1.4},h1:{fontSize:"clamp(38px,7vw,72px)",lineHeight:.95,letterSpacing:-3,margin:"8px 0"},muted:{color:"#91a3ad",fontSize:13,lineHeight:1.5},tabs:{display:"flex",gap:8},tab:{padding:"10px 14px",borderRadius:999,border:"1px solid #28404a",background:"#0e1a21",color:"#94a8b2"},active:{padding:"10px 14px",borderRadius:999,border:"1px solid #77ff55",background:"#77ff55",color:"#071016",fontWeight:900},filters:{maxWidth:1100,margin:"0 auto 14px",padding:12,border:"1px solid #1d333d",borderRadius:16,background:"#0b171d"},search:{display:"grid",gridTemplateColumns:"1fr auto",gap:8},input:{padding:"13px 15px",borderRadius:12,border:"1px solid #263c46",background:"#0d1920",color:"white"},primary:{padding:"0 22px",border:0,borderRadius:12,background:"#77ff55",fontWeight:900},filterRow:{display:"flex",gap:7,flexWrap:"wrap",marginTop:8},filter:{padding:"9px 11px",border:"1px solid #29404a",borderRadius:10,background:"#0e1a21",color:"#91a3ad",fontSize:10,fontWeight:900},liveFilter:{padding:"9px 11px",border:"1px solid #77ff55",borderRadius:10,background:"#14281d",color:"#77ff55",fontSize:10,fontWeight:900},select:{padding:"9px 11px",border:"1px solid #29404a",borderRadius:10,background:"#0e1a21",color:"#c4d2d6",fontSize:11},error:{maxWidth:1100,margin:"0 auto 18px",padding:12,borderRadius:12,background:"#351519",color:"#ff9da8"},summary:{maxWidth:1100,margin:"0 auto 10px",display:"flex",alignItems:"baseline",gap:8,color:"#81969f",fontSize:11},grid:{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12},card:{textDecoration:"none",color:"white",border:"1px solid #213640",background:"#0c171e",borderRadius:18,padding:18},readyCard:{border:"1px solid #4a7c50",boxShadow:"inset 0 0 0 1px rgba(119,255,85,.05)"},row:{display:"flex",justifyContent:"space-between",gap:10},nick:{fontSize:18},states:{display:"grid",gap:4,justifyItems:"end"},live:{fontSize:10,color:"#66b8ff",fontWeight:900},ready:{fontSize:10,color:"#77ff55",fontWeight:900},rating:{display:"flex",alignItems:"baseline",gap:7,margin:"22px 0 12px"},meta:{display:"flex",gap:10,flexWrap:"wrap",fontSize:12,color:"#9bb0ba"},home:{marginTop:14,paddingTop:12,borderTop:"1px solid #1d3039",fontSize:13,color:"#d5e3df"},until:{marginTop:8,color:"#77ff55",fontSize:10,fontWeight:800},empty:{minHeight:220,display:"grid",alignContent:"center",gap:8,padding:24,border:"1px dashed #2a414b",borderRadius:18,color:"#91a3ad"},primaryLink:{marginTop:6,display:"inline-block",width:"fit-content",padding:"10px 12px",borderRadius:10,background:"#77ff55",color:"#071016",textDecoration:"none",fontSize:10,fontWeight:900}
};
