"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, ErrorNotice, PlayHeader, Sports, playRequest } from "@/components/play-ui";

type Row = {
  userId:string;
  nickname:string;
  avatarUrl:string|null;
  matches:number;
  wins:number;
  draws:number;
  losses:number;
  goalsFor:number;
  goalsAgainst:number;
  goalDifference:number;
  points:number;
  eloDelta:number;
  rank:number;
  isMe:boolean;
};

type LeagueResponse = {
  ok:boolean;
  sport:string;
  scope:"court"|"district"|"city";
  period:"season"|"previous"|"30d"|"all";
  context:{label:string};
  season:{key:string;label:string}|null;
  currentSeason:{key:string;label:string};
  previousSeason:{key:string;label:string};
  myPosition:number|null;
  champion:Row|null;
  standings:Row[];
};

const scopeLabels = {court:"COURT",district:"DISTRICT",city:"CITY"} as const;

export default function LeaguesPage(){
  const [sport,setSport]=useState("football");
  const [scope,setScope]=useState<"court"|"district"|"city">("court");
  const [period,setPeriod]=useState<"season"|"previous"|"30d"|"all">("season");
  const [data,setData]=useState<LeagueResponse|null>(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let cancelled=false;
    setLoading(true);
    setError("");
    playRequest(`/api/play/leagues?sport=${sport}&scope=${scope}&period=${period}`)
      .then(next=>{if(!cancelled)setData(next);})
      .catch(err=>{if(!cancelled)setError(err.message || "SERVICE_UNAVAILABLE");})
      .finally(()=>{if(!cancelled)setLoading(false);});
    return()=>{cancelled=true;};
  },[sport,scope,period]);

  const subtitle=useMemo(()=>data?`${scopeLabels[data.scope]} LEAGUE · ${data.context.label}`:"AUTO LEAGUES",[data]);
  const championTitle=scope==="court"?"COURT CHAMPION":scope==="district"?"DISTRICT CHAMPION":"CITY CHAMPION";

  return <main className="p-page">
    <PlayHeader title="LEAGUES" back="/play/more"/>
    <div className="p-stack">
      <div>
        <p className="p-kicker">GAMEFIELDS PLAY</p>
        <h1>Grasz. Liga liczy się sama.</h1>
        <p className="p-muted">Każdy potwierdzony mecz zasila tabelę automatycznie. Sezony zamykają się co miesiąc bez zapisów, administratora i ręcznego liczenia punktów.</p>
      </div>
      <Sports sport={sport} setSport={setSport}/>
      <div className="p-tabs" aria-label="Zakres ligi">
        {(Object.keys(scopeLabels) as Array<keyof typeof scopeLabels>).map(item=><button key={item} className={scope===item?"p-tab active":"p-tab"} onClick={()=>setScope(item)}>{scopeLabels[item]}</button>)}
      </div>
      <div className="p-tabs" aria-label="Okres ligi">
        <button className={period==="season"?"p-tab active":"p-tab"} onClick={()=>setPeriod("season")}>TEN SEZON</button>
        <button className={period==="previous"?"p-tab active":"p-tab"} onClick={()=>setPeriod("previous")}>POPRZEDNI</button>
        <button className={period==="30d"?"p-tab active":"p-tab"} onClick={()=>setPeriod("30d")}>30 DNI</button>
        <button className={period==="all"?"p-tab active":"p-tab"} onClick={()=>setPeriod("all")}>ALL TIME</button>
      </div>
      <ErrorNotice error={error}/>
      {loading?<div className="p-card"><p className="p-muted">Liczymy tabelę…</p></div>:null}
      {!loading&&data?<>
        <section className="p-card">
          <p className="p-kicker">{subtitle}</p>
          <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div><h2 style={{marginBottom:4}}>{data.context.label}</h2><p className="p-muted">{data.season?data.season.label:"3 pkt wygrana · 1 pkt remis · 0 pkt porażka"}</p></div>
            <div style={{textAlign:"right"}}><span className="p-muted">Twoja pozycja</span><div style={{fontSize:32,fontWeight:900}}>{data.myPosition?`#${data.myPosition}`:"—"}</div></div>
          </div>
        </section>
        {data.season?<section className="p-card"><p className="p-kicker">{championTitle}</p>{data.champion?<div className="p-row"><div style={{display:"flex",alignItems:"center",gap:12}}><Avatar nickname={data.champion.nickname} url={data.champion.avatarUrl}/><div><h2 style={{margin:0}}>@{data.champion.nickname}</h2><p className="p-muted">{data.champion.points} pkt · {data.champion.wins} wygranych · {data.champion.matches} meczów</p></div></div><span className="p-badge">#{data.champion.rank}</span></div>:<p className="p-muted">Pierwszy potwierdzony mecz uruchomi walkę o tytuł.</p>}</section>:null}
        <section className="p-card" style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}>
            <thead><tr style={{textAlign:"left"}}><th>#</th><th>GRACZ</th><th>M</th><th>W</th><th>R</th><th>P</th><th>+/−</th><th>PTS</th><th>ELO</th></tr></thead>
            <tbody>{data.standings.map(row=><tr key={row.userId} style={{borderTop:"1px solid rgba(255,255,255,.08)",fontWeight:row.isMe?800:500}}>
              <td>{row.rank}</td>
              <td><div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0"}}><Avatar nickname={row.nickname} url={row.avatarUrl}/><span>{row.nickname}{row.isMe?" · TY":""}</span></div></td>
              <td>{row.matches}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td>{row.goalDifference>0?`+${row.goalDifference}`:row.goalDifference}</td><td><b>{row.points}</b></td><td>{row.eloDelta>0?`+${row.eloDelta}`:row.eloDelta}</td>
            </tr>)}</tbody>
          </table>
          {data.standings.length===0?<p className="p-muted" style={{paddingTop:16}}>Brak potwierdzonych meczów w tym zakresie. Pierwszy rozegrany mecz automatycznie uruchomi tabelę.</p>:null}
        </section>
      </>:null}
    </div>
  </main>;
}
