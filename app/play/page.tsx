"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Court = { id:string; name:string; city:string; district:string|null; sports:string };
type HomeCourt = { courtId:string; sport:string };
type Game = { id:string; courtId:string; courtName:string; sport:string; format:string; level:string; startsAt:string; maxPlayers:number; playerCount:number };
type PlayerSport = { sport:string; tier:string; elo:number; games:number; wins:number; losses:number; draws:number };
type Participant = { userId:string; nickname:string; role:string; status:string };
type Challenge = { id:string; courtName:string; sport:string; format:string; startsAt:string; status:string; gameId:string|null; participants:Participant[] };
type Bootstrap = {
  user:{ id:string; nickname:string; city:string; displayName:string|null };
  coins:number;
  sports:PlayerSport[];
  homeCourts:HomeCourt[];
  courts:Court[];
  games:Game[];
  challenges:Challenge[];
};
type DiscoveryCourt = Court & { playersNow:number; readyNow:number; openGames:Array<{id:string;startsAt:string;format:string;maxPlayers:number;playerCount:number}> };
type Discovery = { me:{ready:boolean;courtId:string|null;availableUntil:string|null}; courts:DiscoveryCourt[]; readyPlayers:Array<{userId:string;nickname:string;courtId:string|null;elo:number;tier:string;availableUntil:string}>; openGames:Array<{id:string;courtId:string;startsAt:string;format:string;maxPlayers:number;playerCount:number}> };
type RankData = { myRank:number|null; me:{elo:number;tier:string}|null; nextTarget:{rank:number;nickname:string;elo:number}|null };
type CourtDetail = { courtKing:{nickname:string;elo:number}|null; ranking:Array<{userId:string;rank:number}>; upcomingGames:Array<{id:string;startsAt:string;format:string;playerCount:number;maxPlayers:number}>; homePlayers:number };

async function post(url:string, body:Record<string,unknown>) {
  const response = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
  return data;
}

export default function PlayHome() {
  const [bootstrap,setBootstrap]=useState<Bootstrap|null>(null);
  const [sport,setSport]=useState("football");
  const [discovery,setDiscovery]=useState<Discovery|null>(null);
  const [ranking,setRanking]=useState<RankData|null>(null);
  const [homeDetail,setHomeDetail]=useState<CourtDetail|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  async function loadBootstrap(){
    const response=await fetch("/api/play",{cache:"no-store"});
    const data=await response.json();
    if(!response.ok||!data.ok) throw new Error(data.error||"LOAD_FAILED");
    setBootstrap(data);
    const preferred=data.homeCourts?.[0]?.sport || data.sports?.[0]?.sport || "football";
    setSport((current)=>current || preferred);
  }

  async function loadContext(nextSport:string, base=bootstrap){
    if(!base) return;
    const home=base.homeCourts.find((item)=>item.sport===nextSport);
    const discoveryPromise=fetch(`/api/play/discovery?sport=${encodeURIComponent(nextSport)}`,{cache:"no-store"}).then(r=>r.json());
    const rankingPromise=fetch(`/api/play/rankings?sport=${encodeURIComponent(nextSport)}&scope=city`,{cache:"no-store"}).then(r=>r.json());
    const courtPromise=home ? fetch(`/api/play/court?id=${encodeURIComponent(home.courtId)}&sport=${encodeURIComponent(nextSport)}`,{cache:"no-store"}).then(r=>r.json()) : Promise.resolve(null);
    const [d,r,c]=await Promise.all([discoveryPromise,rankingPromise,courtPromise]);
    if(d?.ok) setDiscovery(d); else setDiscovery(null);
    if(r?.ok) setRanking(r); else setRanking(null);
    if(c?.ok) setHomeDetail(c); else setHomeDetail(null);
  }

  useEffect(()=>{void loadBootstrap().catch(e=>setError(e instanceof Error?e.message:"LOAD_FAILED"));},[]);
  useEffect(()=>{if(bootstrap) void loadContext(sport,bootstrap).catch(e=>setError(e instanceof Error?e.message:"LOAD_FAILED"));},[sport,bootstrap]);

  const currentSport=bootstrap?.sports.find(item=>item.sport===sport) || null;
  const home=bootstrap?.homeCourts.find(item=>item.sport===sport) || null;
  const homeCourt=bootstrap?.courts.find(item=>item.id===home?.courtId) || null;
  const pendingChallenges=useMemo(()=>bootstrap?.challenges.filter(item=>item.status==="pending"||item.status==="accepted").slice(0,3)||[],[bootstrap]);
  const liveNear=useMemo(()=>[...(discovery?.courts||[])].sort((a,b)=>(b.playersNow*4+b.readyNow*3+b.openGames.length*2)-(a.playersNow*4+a.readyNow*3+a.openGames.length*2)).slice(0,3),[discovery]);
  const nextGames=useMemo(()=>bootstrap?.games.filter(game=>game.sport===sport).sort((a,b)=>new Date(a.startsAt).getTime()-new Date(b.startsAt).getTime()).slice(0,3)||[],[bootstrap,sport]);
  const myHomeRank=homeDetail?.ranking.find(row=>row.userId===bootstrap?.user.id)?.rank || null;

  async function run(fn:()=>Promise<unknown>){
    setBusy(true);setError("");
    try{await fn();await loadBootstrap();if(bootstrap) await loadContext(sport,bootstrap);}catch(e){setError(e instanceof Error?e.message:"REQUEST_FAILED");}finally{setBusy(false);}
  }

  async function toggleReady(){
    if(!discovery) return;
    if(discovery.me.ready) await run(()=>post("/api/play/discovery",{action:"clear_ready",sport}));
    else await run(()=>post("/api/play/discovery",{action:"set_ready",sport,courtId:home?.courtId||null,minutes:60}));
  }

  async function checkIn(){
    if(!home?.courtId) return;
    await run(()=>post("/api/play",{action:"checkin",courtId:home.courtId}));
  }

  async function joinAndOpen(gameId:string){
    setBusy(true);setError("");
    try{await post("/api/play",{action:"join_game",gameId});window.location.href=`/play/game?gameId=${encodeURIComponent(gameId)}`;}catch(e){setError(e instanceof Error?e.message:"REQUEST_FAILED");setBusy(false);}
  }

  if(!bootstrap) return <main style={s.center}>{error||"Ładowanie GAMEFIELDS PLAY…"}</main>;

  return <main style={s.page}>
    <header style={s.header}>
      <div><div style={s.brand}>GAMEFIELDS <span style={s.green}>PLAY</span></div><span style={s.muted}>FIND IT. PLAY IT. RANK IT. CHANGE IT.</span></div>
      <div style={s.headerRight}><span style={s.coins}>◉ {bootstrap.coins}</span><Link href="/play/account" style={s.profile}>@{bootstrap.user.nickname}</Link></div>
    </header>

    {error&&<div style={s.error}>{error}</div>}

    <section style={s.hero}>
      <div style={s.heroMain}>
        <div style={s.kicker}>PLAY NOW · {bootstrap.user.city.toUpperCase()}</div>
        <h1 style={s.h1}>Gdzie grasz dzisiaj?</h1>
        <p style={s.lead}>Zobacz gdzie już grają, kto szuka meczu i gdzie możesz wejść do gry bez zbędnego planowania.</p>
        <div style={s.heroActions}>
          <Link href={`/play/map?sport=${sport}`} style={s.primaryLink}>ZNAJDŹ GRĘ</Link>
          <button disabled={busy} style={discovery?.me.ready?s.readyOn:s.secondaryButton} onClick={()=>void toggleReady()}>{discovery?.me.ready?"READY: ON":"I'M READY · 60 MIN"}</button>
        </div>
      </div>
      <div style={s.heroSide}>
        <div style={s.sportTabs}><button style={sport==="football"?s.activePill:s.pill} onClick={()=>setSport("football")}>FOOTBALL</button><button style={sport==="basketball"?s.activePill:s.pill} onClick={()=>setSport("basketball")}>BASKETBALL</button></div>
        <div style={s.rankHero}><span style={s.kicker}>YOUR ELO</span><strong>{currentSport?.elo||900}</strong><small>{currentSport?.tier||"Rookie"} · CITY {ranking?.myRank?`#${ranking.myRank}`:"—"}</small></div>
      </div>
    </section>

    <section style={s.section}>
      <div style={s.sectionHead}><div><span style={s.kicker}>LIVE NEAR YOU</span><h2 style={s.h2}>Miasto gra teraz.</h2></div><Link href="/play/map" style={s.textLink}>OPEN MAP →</Link></div>
      <div style={s.liveGrid}>{liveNear.map(court=><Link key={court.id} href={`/play/court?id=${encodeURIComponent(court.id)}&sport=${sport}`} style={s.liveCard}>
        <div style={s.liveTop}><span style={s.liveDot}>● LIVE</span><span style={s.muted}>{court.district||court.city}</span></div>
        <h3 style={s.cardTitle}>{court.name}</h3>
        <div style={s.metrics}><span><b>{court.playersNow}</b> GRA</span><span><b>{court.readyNow}</b> READY</span><span><b>{court.openGames.length}</b> GAMES</span></div>
      </Link>)}{!liveNear.length&&<div style={s.empty}>Brak aktywności — możesz być pierwszą osobą READY w swojej okolicy.</div>}</div>
    </section>

    <section style={s.split}>
      <article style={s.card}>
        <div style={s.cardHead}><span style={s.kicker}>YOUR HOME COURT</span>{homeCourt&&<Link href={`/play/court?id=${homeCourt.id}&sport=${sport}`} style={s.textLink}>OPEN →</Link>}</div>
        {homeCourt?<><h2 style={s.bigCardTitle}>{homeCourt.name}</h2><p style={s.muted}>{homeCourt.district||homeCourt.city}</p><div style={s.homeStats}><div><strong>{discovery?.courts.find(c=>c.id===homeCourt.id)?.playersNow||0}</strong><span>GRA TERAZ</span></div><div><strong>{myHomeRank?`#${myHomeRank}`:"—"}</strong><span>YOUR RANK</span></div><div><strong>{homeDetail?.courtKing?`@${homeDetail.courtKing.nickname}`:"—"}</strong><span>COURT KING</span></div></div><button disabled={busy} style={s.primaryButton} onClick={()=>void checkIn()}>I'M HERE · CHECK-IN</button></>:<><h2 style={s.bigCardTitle}>Wybierz swoje boisko.</h2><p style={s.muted}>Home Court daje Ci lokalny ranking i punkt odniesienia w mieście.</p><Link href="/play/onboarding" style={s.secondaryLink}>SET HOME COURT</Link></>}
      </article>

      <article style={s.card}>
        <div style={s.cardHead}><span style={s.kicker}>YOUR RANK</span><Link href="/play/rankings" style={s.textLink}>FULL RANKING →</Link></div>
        <div style={s.rankBlock}><strong>{ranking?.myRank?`#${ranking.myRank}`:"—"}</strong><span>{bootstrap.user.city.toUpperCase()}</span></div>
        <div style={s.rankMeta}><span>{currentSport?.elo||900} ELO</span><span>{currentSport?.games||0} GAMES</span><span>{currentSport?.games?Math.round(((currentSport.wins||0)/currentSport.games)*100):0}% WIN</span></div>
        <div style={s.target}>{ranking?.nextTarget?<><span style={s.kicker}>NEXT TARGET</span><b>#{ranking.nextTarget.rank} @{ranking.nextTarget.nickname}</b><small>{ranking.nextTarget.elo} ELO</small></>:<><span style={s.kicker}>NEXT TARGET</span><b>TOP OF THIS RANKING</b></>}</div>
      </article>
    </section>

    <section style={s.section}>
      <div style={s.sectionHead}><div><span style={s.kicker}>NEXT GAMES</span><h2 style={s.h2}>Wejdź do gry.</h2></div><Link href="/play/games" style={s.textLink}>ALL GAMES →</Link></div>
      <div style={s.gameGrid}>{nextGames.map(game=><article key={game.id} style={s.gameCard}><span style={s.kicker}>{game.format} · {game.level.toUpperCase()}</span><h3 style={s.cardTitle}>{game.courtName}</h3><p style={s.muted}>{new Date(game.startsAt).toLocaleString("pl-PL")}</p><div style={s.gameBottom}><b>{game.playerCount}/{game.maxPlayers}</b><button disabled={busy} style={s.smallButton} onClick={()=>void joinAndOpen(game.id)}>JOIN</button></div></article>)}{!nextGames.length&&<div style={s.empty}>Brak otwartych gier. Otwórz GAMES i utwórz pierwszą.</div>}</div>
    </section>

    <section style={s.split}>
      <article style={s.card}>
        <div style={s.cardHead}><span style={s.kicker}>CHALLENGES</span><Link href="/play/community" style={s.textLink}>NOTIFICATIONS →</Link></div>
        <div style={s.challengeList}>{pendingChallenges.map(ch=>{const rivals=ch.participants.filter(p=>p.userId!==bootstrap.user.id);return <Link key={ch.id} href={`/play/challenge?id=${encodeURIComponent(ch.id)}`} style={s.challengeRow}><div><b>{rivals.length?rivals.map(p=>`@${p.nickname}`).join(" · "):ch.format}</b><span>{ch.courtName} · {new Date(ch.startsAt).toLocaleDateString("pl-PL")}</span></div><em>{ch.status.toUpperCase()}</em></Link>})}{!pendingChallenges.length&&<p style={s.muted}>Brak aktywnych wyzwań. Znajdź gracza i rzuć challenge.</p>}</div>
      </article>

      <article style={s.card}>
        <span style={s.kicker}>EXPLORE PLAY</span>
        <div style={s.quickGrid}><Link href="/play/players" style={s.quick}>PLAYERS<span>Znajdź rywala →</span></Link><Link href="/play/tournaments" style={s.quick}>TOURNAMENTS<span>Drabinki i eventy →</span></Link><Link href="/play/community" style={s.quick}>COMMUNITY<span>Aktywność i powiadomienia →</span></Link><Link href="/play/courts/add" style={s.quick}>+ SPOT<span>Dodaj nowe miejsce →</span></Link></div>
      </article>
    </section>
  </main>;
}

const s:Record<string,React.CSSProperties>={
  page:{minHeight:"100vh",background:"#071016",color:"#f5f8f7",padding:24,fontFamily:"Arial,sans-serif"},center:{minHeight:"100vh",display:"grid",placeItems:"center",background:"#071016",color:"white"},
  header:{maxWidth:1120,margin:"0 auto 24px",display:"flex",justifyContent:"space-between",gap:16,alignItems:"center"},brand:{fontSize:16,fontWeight:1000,letterSpacing:.5},green:{color:"#77ff55"},muted:{color:"#91a3ad",fontSize:13},headerRight:{display:"flex",gap:8,alignItems:"center"},coins:{padding:"8px 10px",border:"1px solid #2a414b",borderRadius:999,fontSize:11,fontWeight:900},profile:{color:"white",textDecoration:"none",fontWeight:900,fontSize:12},error:{maxWidth:1120,margin:"0 auto 16px",padding:12,borderRadius:12,background:"#38151a",color:"#ff9da8"},
  hero:{maxWidth:1120,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(260px,.6fr)",gap:12},heroMain:{padding:"clamp(22px,5vw,48px)",border:"1px solid #29413a",borderRadius:24,background:"radial-gradient(circle at 90% 10%,#153a22 0,transparent 35%),linear-gradient(135deg,#0d1d18,#0b151b)"},heroSide:{display:"grid",gap:10},kicker:{color:"#77ff55",fontSize:11,fontWeight:900,letterSpacing:1.2},h1:{fontSize:"clamp(48px,9vw,94px)",lineHeight:.88,letterSpacing:-4,margin:"9px 0 14px"},lead:{maxWidth:670,color:"#a7b5bc",fontSize:15,lineHeight:1.5},heroActions:{display:"flex",gap:8,flexWrap:"wrap",marginTop:22},primaryLink:{padding:"14px 18px",borderRadius:13,background:"#77ff55",color:"#071016",textDecoration:"none",fontWeight:1000},secondaryButton:{padding:"14px 18px",borderRadius:13,border:"1px solid #46616b",background:"#0a151b",color:"#dce8e5",fontWeight:900},readyOn:{padding:"14px 18px",borderRadius:13,border:"1px solid #77ff55",background:"#10251a",color:"#77ff55",fontWeight:900},sportTabs:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7},pill:{minHeight:44,border:"1px solid #29404a",borderRadius:13,background:"#0c171e",color:"#91a4ad",fontWeight:900},activePill:{minHeight:44,border:"1px solid #77ff55",borderRadius:13,background:"#77ff55",color:"#071016",fontWeight:900},rankHero:{border:"1px solid #213640",borderRadius:20,background:"#0c171e",padding:20,display:"grid",alignContent:"center",gap:3},
  section:{maxWidth:1120,margin:"0 auto 18px"},sectionHead:{display:"flex",justifyContent:"space-between",gap:16,alignItems:"end",marginBottom:10},h2:{margin:"4px 0",fontSize:"clamp(27px,5vw,44px)",letterSpacing:-1.7},textLink:{color:"#77ff55",textDecoration:"none",fontSize:11,fontWeight:900,whiteSpace:"nowrap"},liveGrid:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10},liveCard:{padding:18,border:"1px solid #213640",borderRadius:18,background:"#0c171e",color:"white",textDecoration:"none"},liveTop:{display:"flex",justifyContent:"space-between",gap:8},liveDot:{color:"#77ff55",fontSize:10,fontWeight:900},cardTitle:{fontSize:22,margin:"18px 0 8px",letterSpacing:-.8},metrics:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:16},
  split:{maxWidth:1120,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12},card:{border:"1px solid #213640",borderRadius:20,background:"#0c171e",padding:20,minWidth:0},cardHead:{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"},bigCardTitle:{fontSize:"clamp(27px,5vw,46px)",margin:"16px 0 2px",letterSpacing:-1.8},homeStats:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,margin:"20px 0"},primaryButton:{width:"100%",padding:13,border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:1000},secondaryLink:{display:"inline-block",marginTop:16,padding:"12px 14px",border:"1px solid #77ff55",borderRadius:12,color:"#77ff55",textDecoration:"none",fontWeight:900},rankBlock:{display:"flex",alignItems:"baseline",gap:12,margin:"15px 0"},rankMeta:{display:"flex",gap:8,flexWrap:"wrap",color:"#92a5ae",fontSize:11},target:{marginTop:18,padding:14,borderRadius:14,background:"#091319",display:"grid",gap:4},
  gameGrid:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10},gameCard:{padding:18,border:"1px solid #213640",borderRadius:18,background:"#0c171e"},gameBottom:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16},smallButton:{padding:"10px 14px",border:0,borderRadius:10,background:"#77ff55",color:"#071016",fontWeight:900},empty:{padding:20,border:"1px dashed #28404a",borderRadius:16,color:"#81949e"},challengeList:{display:"grid",gap:7,marginTop:14},challengeRow:{display:"flex",justifyContent:"space-between",gap:10,padding:12,borderRadius:12,background:"#091319",color:"white",textDecoration:"none"},quickGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14},quick:{minHeight:88,padding:14,border:"1px solid #223842",borderRadius:14,background:"#091319",color:"white",textDecoration:"none",fontWeight:900,display:"grid",alignContent:"space-between"}
};
