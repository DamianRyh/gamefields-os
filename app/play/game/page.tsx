"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Player = { userId:string; nickname:string; team:string|null; elo:number; tier:string };
type EloChange = { userId:string; nickname:string; before:number; after:number; change:number };
type Room = {
  game: { id:string; creatorUserId:string; courtId:string; courtName:string; courtDistrict:string|null; sport:string; format:string; level:string; startsAt:string; maxPlayers:number; status:string; scoreA:number|null; scoreB:number|null };
  players: Player[];
  me: Player | null;
  isCreator:boolean;
  phase:string;
  nextAction:string;
  instruction:string;
  permissions:{ canJoin:boolean; canLeave:boolean; canGenerateTeams:boolean; canStart:boolean; canSubmitResult:boolean; canConfirmResult:boolean };
  teams:{ A:Player[]; B:Player[]; averageA:number; averageB:number };
  eloChanges:EloChange[];
  myEloChange:EloChange|null;
};

const phases = ["open", "full", "ready", "playing", "awaiting_confirmation", "completed"] as const;
const labels: Record<string,string> = {
  open:"OPEN",
  full:"FULL",
  ready:"READY",
  playing:"PLAYING",
  awaiting_confirmation:"CONFIRM",
  completed:"DONE",
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
    try {
      const result = await action({ action:name, gameId, ...extra });
      setData(result);
      if (result.game?.scoreA != null) setScoreA(result.game.scoreA);
      if (result.game?.scoreB != null) setScoreB(result.game.scoreB);
    } catch (e) {
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  const activePhase = useMemo(() => data ? Math.max(0, phases.indexOf(data.phase as typeof phases[number])) : 0, [data]);

  if (!data) return <main style={s.center}>{error || "Ładowanie Game Room…"}</main>;
  const g = data.game;

  return (
    <main style={s.page}>
      <header style={s.header}>
        <Link href="/play/games" style={s.back}>← GAMES</Link>
        <span>GAME #{g.id.slice(-6).toUpperCase()}</span>
      </header>

      <section style={s.hero}>
        <div>
          <div style={s.kicker}>{g.sport.toUpperCase()} · {g.format} · {g.level.toUpperCase()}</div>
          <h1 style={s.h1}>{g.courtName}</h1>
          <p style={s.muted}>{g.courtDistrict || "Warszawa"} · {new Date(g.startsAt).toLocaleString("pl-PL")}</p>
        </div>
        <Link href={`/play/court?id=${encodeURIComponent(g.courtId)}&sport=${g.sport}`} style={s.courtLink}>COURT →</Link>
      </section>

      <section style={s.stepper} aria-label="Game progress">
        {phases.map((phase, index) => (
          <div key={phase} style={{ ...s.step, ...(index <= activePhase ? s.stepDone : {}) }}>
            <span style={s.stepDot}>{index < activePhase ? "✓" : index + 1}</span>
            <span>{labels[phase]}</span>
          </div>
        ))}
      </section>

      {error && <div style={s.error}>{error}</div>}

      <section style={s.actionCard}>
        <div>
          <div style={s.kicker}>NEXT ACTION</div>
          <h2 style={s.actionTitle}>{data.nextAction}</h2>
          <p style={s.actionText}>{data.instruction}</p>
        </div>
        <div style={s.actionButtons}>
          {data.permissions.canJoin && <button disabled={busy} style={s.primaryCompact} onClick={() => void run("join_game")}>JOIN GAME</button>}
          {data.permissions.canLeave && <button disabled={busy} style={s.ghostCompact} onClick={() => void run("leave_game")}>LEAVE</button>}
          {data.permissions.canGenerateTeams && data.phase !== "ready" && <button disabled={busy} style={s.ghostCompact} onClick={() => void run("generate_teams")}>BALANCE TEAMS</button>}
          {data.permissions.canStart && <button disabled={busy} style={s.primaryCompact} onClick={() => void run("start_game")}>START GAME</button>}
        </div>
      </section>

      <section style={s.statsRow}>
        <div><strong>{data.players.length}/{g.maxPlayers}</strong><span>PLAYERS</span></div>
        <div><strong>{data.teams.averageA || "—"}</strong><span>TEAM A AVG</span></div>
        <div><strong>{data.teams.averageB || "—"}</strong><span>TEAM B AVG</span></div>
        <div><strong>{data.me?.team || "—"}</strong><span>YOUR TEAM</span></div>
      </section>

      <section style={s.grid}>
        <article style={s.card}>
          <div style={s.title}>PLAYERS</div>
          {data.players.map((p, index) => (
            <div key={p.userId} style={s.player}>
              <span style={s.playerNo}>{index + 1}</span>
              <Link href={`/play/player?nickname=${encodeURIComponent(p.nickname)}&sport=${g.sport}`} style={s.playerLink}>@{p.nickname}</Link>
              <span style={s.playerMeta}>{p.elo} · {p.tier}</span>
              <b style={p.team ? s.teamBadge : s.noTeam}>{p.team || "WAIT"}</b>
            </div>
          ))}
        </article>

        <article style={s.card}>
          <div style={s.title}>TEAMS</div>
          <div style={s.teamGrid}>
            <div style={s.teamBox}>
              <h3>BLACK / A</h3>
              {data.teams.A.map(p => <p key={p.userId}>@{p.nickname} <span style={s.muted}>{p.elo}</span></p>)}
              {!data.teams.A.length && <p style={s.muted}>Waiting for teams…</p>}
              <b>AVG {data.teams.averageA || "—"}</b>
            </div>
            <div style={s.teamBox}>
              <h3>WHITE / B</h3>
              {data.teams.B.map(p => <p key={p.userId}>@{p.nickname} <span style={s.muted}>{p.elo}</span></p>)}
              {!data.teams.B.length && <p style={s.muted}>Waiting for teams…</p>}
              <b>AVG {data.teams.averageB || "—"}</b>
            </div>
          </div>
        </article>
      </section>

      {(data.phase === "playing" || data.phase === "awaiting_confirmation") && (
        <section style={s.scoreCard}>
          <div style={s.kicker}>FINAL SCORE</div>
          <div style={s.score}>
            <label style={s.scoreLabel}>BLACK / A<input disabled={!data.permissions.canSubmitResult} style={s.scoreInput} type="number" min={0} max={99} value={scoreA} onChange={e=>setScoreA(Number(e.target.value))}/></label>
            <strong style={s.colon}>:</strong>
            <label style={s.scoreLabel}>WHITE / B<input disabled={!data.permissions.canSubmitResult} style={s.scoreInput} type="number" min={0} max={99} value={scoreB} onChange={e=>setScoreB(Number(e.target.value))}/></label>
          </div>
          {data.permissions.canSubmitResult && <button disabled={busy} style={s.primary} onClick={() => void run("submit_result", {scoreA,scoreB})}>SUBMIT RESULT</button>}
          {data.phase === "awaiting_confirmation" && !data.permissions.canConfirmResult && <p style={s.muted}>Wynik czeka na potwierdzenie właściwego gracza z przeciwnej drużyny.</p>}
          {data.permissions.canConfirmResult && <button disabled={busy} style={s.primary} onClick={() => void run("confirm_result")}>CONFIRM RESULT & UPDATE ELO</button>}
        </section>
      )}

      {data.phase === "completed" && (
        <section style={s.done}>
          <div style={s.kicker}>RESULT CONFIRMED</div>
          <h2 style={s.finalScore}>{g.scoreA} : {g.scoreB}</h2>
          {data.myEloChange && (
            <div style={s.myChange}>
              <span>YOUR ELO</span>
              <strong>{data.myEloChange.before} → {data.myEloChange.after}</strong>
              <b style={data.myEloChange.change >= 0 ? s.positive : s.negative}>{data.myEloChange.change >= 0 ? "+" : ""}{data.myEloChange.change}</b>
            </div>
          )}
          <div style={s.changeGrid}>
            {data.eloChanges.map(change => (
              <div key={change.userId} style={s.changeRow}>
                <span>@{change.nickname}</span>
                <span>{change.before} → {change.after}</span>
                <b style={change.change >= 0 ? s.positive : s.negative}>{change.change >= 0 ? "+" : ""}{change.change}</b>
              </div>
            ))}
          </div>
          <div style={s.doneActions}>
            <Link href="/play/rankings" style={s.primaryLink}>SEE RANKING</Link>
            <Link href="/play" style={s.secondaryLink}>NEXT GAME</Link>
          </div>
        </section>
      )}
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#071016",color:"white",padding:24,fontFamily:"Arial,sans-serif"},
  center:{minHeight:"100vh",display:"grid",placeItems:"center",background:"#071016",color:"white"},
  header:{maxWidth:1000,margin:"0 auto 24px",display:"flex",justifyContent:"space-between",gap:12,color:"#9eb0ba",fontSize:12},
  back:{color:"#77ff55",textDecoration:"none",fontWeight:900},
  hero:{maxWidth:1000,margin:"0 auto 18px",display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,flexWrap:"wrap"},
  kicker:{fontSize:11,fontWeight:900,color:"#77ff55",letterSpacing:1.2},
  h1:{fontSize:"clamp(38px,8vw,72px)",margin:"5px 0",letterSpacing:-3,lineHeight:.95},
  muted:{color:"#91a3ad",fontSize:13},
  courtLink:{padding:"10px 13px",border:"1px solid #29414b",borderRadius:999,color:"#dce8e5",textDecoration:"none",fontSize:11,fontWeight:900},
  stepper:{maxWidth:1000,margin:"0 auto 14px",display:"grid",gridTemplateColumns:"repeat(6,minmax(0,1fr))",gap:5},
  step:{minHeight:48,border:"1px solid #1b3039",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"#60747e",fontSize:9,fontWeight:900,letterSpacing:.4,background:"#0a141a"},
  stepDone:{border:"1px solid #385d42",background:"#10231a",color:"#a9ff93"},
  stepDot:{display:"grid",placeItems:"center",width:18,height:18,borderRadius:99,border:"1px solid currentColor",fontSize:9},
  error:{maxWidth:1000,margin:"0 auto 16px",padding:12,background:"#39161b",color:"#ff9da8",borderRadius:12},
  actionCard:{maxWidth:1000,margin:"0 auto 14px",display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",padding:18,border:"1px solid #365741",borderRadius:18,background:"linear-gradient(135deg,#10231a,#0b171c)"},
  actionTitle:{fontSize:"clamp(24px,4vw,38px)",margin:"5px 0",letterSpacing:-1.3},
  actionText:{margin:0,color:"#a7b6bc",maxWidth:680,fontSize:14,lineHeight:1.45},
  actionButtons:{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"},
  primaryCompact:{padding:"12px 16px",border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:900,whiteSpace:"nowrap"},
  ghostCompact:{padding:"12px 16px",border:"1px solid #77ff55",borderRadius:12,background:"transparent",color:"#77ff55",fontWeight:900,whiteSpace:"nowrap"},
  statsRow:{maxWidth:1000,margin:"0 auto 14px",display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8},
  grid:{maxWidth:1000,margin:"0 auto 14px",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12},
  card:{background:"#0c171e",border:"1px solid #213640",borderRadius:18,padding:18,minWidth:0},
  title:{fontSize:11,fontWeight:900,color:"#77ff55",letterSpacing:1,marginBottom:12},
  player:{display:"grid",gridTemplateColumns:"28px minmax(0,1fr) auto 42px",gap:9,padding:"11px 0",borderBottom:"1px solid #1a2d35",alignItems:"center",fontSize:13},
  playerNo:{color:"#607781",fontWeight:900},
  playerLink:{color:"white",textDecoration:"none",fontWeight:800,minWidth:0,overflow:"hidden",textOverflow:"ellipsis"},
  playerMeta:{color:"#8498a2",fontSize:11,whiteSpace:"nowrap"},
  teamBadge:{display:"grid",placeItems:"center",height:28,borderRadius:8,background:"#77ff55",color:"#071016",fontSize:11},
  noTeam:{display:"grid",placeItems:"center",height:28,borderRadius:8,border:"1px solid #2b424c",color:"#71858e",fontSize:9},
  teamGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  teamBox:{border:"1px solid #1d313a",borderRadius:14,padding:14,minWidth:0},
  scoreCard:{maxWidth:1000,margin:"0 auto 16px",background:"#0c171e",border:"1px solid #213640",borderRadius:18,padding:20,textAlign:"center"},
  score:{display:"flex",justifyContent:"center",alignItems:"center",gap:16,margin:"22px 0"},
  scoreLabel:{display:"grid",gap:8,color:"#91a3ad",fontSize:10,fontWeight:900},
  scoreInput:{width:110,maxWidth:"32vw",padding:12,borderRadius:14,border:"1px solid #29414a",background:"#081116",color:"white",fontSize:34,textAlign:"center",fontWeight:900},
  colon:{fontSize:32},
  primary:{width:"100%",padding:14,border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:900},
  done:{maxWidth:1000,margin:"0 auto",textAlign:"center",padding:28,border:"1px solid #77ff55",borderRadius:20,background:"#0c171e"},
  finalScore:{fontSize:"clamp(52px,10vw,92px)",margin:"10px 0",letterSpacing:-4},
  myChange:{maxWidth:420,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",padding:14,border:"1px solid #355d3d",borderRadius:14,background:"#10231a",textAlign:"left"},
  changeGrid:{maxWidth:600,margin:"0 auto 18px",display:"grid",gap:6},
  changeRow:{display:"grid",gridTemplateColumns:"1fr auto 54px",gap:10,padding:"9px 11px",borderRadius:10,background:"#091319",fontSize:12,textAlign:"left"},
  positive:{color:"#77ff55"},
  negative:{color:"#ff8f9b"},
  doneActions:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:520,margin:"0 auto"},
  primaryLink:{padding:13,borderRadius:12,background:"#77ff55",color:"#071016",textDecoration:"none",fontWeight:900},
  secondaryLink:{padding:13,borderRadius:12,border:"1px solid #38505a",color:"#dce8e5",textDecoration:"none",fontWeight:900},
};
