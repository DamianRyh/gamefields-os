"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OpenGame = { id: string; courtId: string; format: string; startsAt: string; maxPlayers: number; playerCount: number };
type Court = {
  id: string;
  slug: string;
  name: string;
  city: string;
  district: string | null;
  latitude: number;
  longitude: number;
  sports: string;
  surface: string | null;
  lighting: boolean;
  isFree: boolean;
  playersNow: number;
  readyNow: number;
  openGames: OpenGame[];
};
type ReadyPlayer = { userId: string; nickname: string; displayName: string | null; courtId: string | null; availableUntil: string; elo: number; games: number; tier: string };
type Discovery = { ok: boolean; sport: string; me: { ready: boolean; courtId: string | null; availableUntil: string | null }; courts: Court[]; readyPlayers: ReadyPlayer[]; openGames: OpenGame[] };
type UserPos = { latitude: number; longitude: number };

const WARSAW = { minLat: 52.08, maxLat: 52.39, minLng: 20.78, maxLng: 21.30 };

function project(lat: number, lng: number) {
  const x = ((lng - WARSAW.minLng) / (WARSAW.maxLng - WARSAW.minLng)) * 100;
  const y = (1 - (lat - WARSAW.minLat) / (WARSAW.maxLat - WARSAW.minLat)) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

function distanceKm(a: UserPos, b: { latitude: number; longitude: number }) {
  const r = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * r * Math.asin(Math.sqrt(h));
}

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
  return data;
}

export default function PlayMapPage() {
  const [sport, setSport] = useState("football");
  const [filter, setFilter] = useState<"all" | "live" | "ready" | "games">("all");
  const [data, setData] = useState<Discovery | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [userPos, setUserPos] = useState<UserPos | null>(null);

  async function load(nextSport = sport) {
    setError("");
    const next = await api(`/api/play/discovery?sport=${encodeURIComponent(nextSport)}`, { cache: "no-store" });
    setData(next);
    if (!selectedId && next.courts?.[0]?.id) setSelectedId(next.courts[0].id);
  }

  useEffect(() => { void load(sport).catch((e) => setError(e instanceof Error ? e.message : "LOAD_FAILED")); }, [sport]);

  const courts = useMemo(() => {
    let rows = data?.courts || [];
    if (filter === "live") rows = rows.filter((court) => court.playersNow > 0);
    if (filter === "ready") rows = rows.filter((court) => court.readyNow > 0);
    if (filter === "games") rows = rows.filter((court) => court.openGames.length > 0);
    if (userPos) rows = [...rows].sort((a, b) => distanceKm(userPos, a) - distanceKm(userPos, b));
    return rows;
  }, [data, filter, userPos]);

  const selected = (data?.courts || []).find((court) => court.id === selectedId) || courts[0] || null;
  const readyPlayers = (data?.readyPlayers || []).filter((player) => !selected || !player.courtId || player.courtId === selected.id).slice(0, 12);

  async function postDiscovery(action: string, payload: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    try {
      await api("/api/play/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sport, ...payload }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function checkin() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin", courtId: selected.id }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  function locate() {
    if (!navigator.geolocation) { setError("GEOLOCATION_UNAVAILABLE"); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => setUserPos({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => setError("Nie udało się pobrać lokalizacji. Możesz nadal korzystać z mapy bez niej."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
    );
  }

  return (
    <main style={s.page}>
      <header style={s.header}>
        <div><div style={s.kicker}>GAMEFIELDS PLAY / WARSAW</div><h1 style={s.h1}>Gdzie grasz teraz?</h1></div>
        <Link href="/play" style={s.back}>← PLAY</Link>
      </header>

      <section style={s.controls}>
        <div style={s.tabs}>
          <button style={sport === "football" ? s.active : s.tab} onClick={() => setSport("football")}>FOOTBALL</button>
          <button style={sport === "basketball" ? s.active : s.tab} onClick={() => setSport("basketball")}>BASKETBALL</button>
        </div>
        <div style={s.tabs}>
          {(["all", "live", "ready", "games"] as const).map((value) => <button key={value} style={filter === value ? s.activeDark : s.tab} onClick={() => setFilter(value)}>{value === "all" ? "WSZYSTKIE" : value === "live" ? "GRAJĄ TERAZ" : value === "ready" ? "SZUKAJĄ GRY" : "OTWARTE GRY"}</button>)}
        </div>
        <button style={s.geo} onClick={locate}>⌖ {userPos ? "NAJBLIŻEJ MNIE" : "UŻYJ MOJEJ LOKALIZACJI"}</button>
      </section>

      {error ? <div style={s.error}>{error}</div> : null}

      <section style={s.layout}>
        <div style={s.mapWrap}>
          <div style={s.mapLabel}>WARSAW LIVE MAP</div>
          <div style={s.map}>
            <svg viewBox="0 0 1000 700" preserveAspectRatio="none" style={s.svg} aria-hidden="true">
              <path d="M530 15 C500 130 560 220 520 350 C485 470 545 590 505 690" fill="none" stroke="#17394a" strokeWidth="22" opacity=".85" />
              <path d="M0 370 C220 330 365 405 520 350 C690 288 820 350 1000 300" fill="none" stroke="#18303a" strokeWidth="2" />
              <path d="M120 90 L890 620 M90 590 L850 120 M300 0 L350 700 M720 0 L670 700" stroke="#12242c" strokeWidth="1" />
            </svg>
            {userPos ? (() => { const p = project(userPos.latitude, userPos.longitude); return <div style={{ ...s.userDot, left: `${p.x}%`, top: `${p.y}%` }} title="Twoja przybliżona pozycja">YOU</div>; })() : null}
            {courts.map((court) => {
              const p = project(court.latitude, court.longitude);
              const hot = court.playersNow > 0 || court.readyNow > 0 || court.openGames.length > 0;
              return <button key={court.id} onClick={() => setSelectedId(court.id)} title={court.name} style={{ ...s.marker, ...(selectedId === court.id ? s.markerSelected : hot ? s.markerHot : {}), left: `${p.x}%`, top: `${p.y}%` }}>
                <span style={s.markerCount}>{court.playersNow || court.readyNow || court.openGames.length || "•"}</span>
              </button>;
            })}
            {!courts.length ? <div style={s.emptyMap}>Brak obiektów dla tego filtra.</div> : null}
          </div>
          <div style={s.legend}><span>● court</span><span style={{ color: "#77ff55" }}>● active</span><span style={{ color: "#66b8ff" }}>YOU</span></div>
        </div>

        <aside style={s.panel}>
          {selected ? <>
            <div style={s.kicker}>{selected.district || selected.city}</div>
            <h2 style={s.courtName}>{selected.name}</h2>
            {userPos ? <div style={s.distance}>{distanceKm(userPos, selected).toFixed(1)} km od Ciebie</div> : null}
            <div style={s.metrics}>
              <div><b>{selected.playersNow}</b><span>GRA TERAZ</span></div>
              <div><b>{selected.readyNow}</b><span>SZUKA GRY</span></div>
              <div><b>{selected.openGames.length}</b><span>OTWARTE GRY</span></div>
            </div>
            <div style={s.tags}><span>{selected.surface || "surface n/a"}</span><span>{selected.lighting ? "lighting" : "no lighting"}</span><span>{selected.isFree ? "free" : "paid"}</span></div>

            {data?.me.ready ? <button disabled={busy} style={s.readyActive} onClick={() => void postDiscovery("clear_ready")}>✓ READY TO PLAY — WYŁĄCZ</button> : <button disabled={busy} style={s.readyButton} onClick={() => void postDiscovery("set_ready", { courtId: selected.id, minutes: 60 })}>⚡ READY TO PLAY · 60 MIN</button>}
            <button disabled={busy} style={s.secondary} onClick={() => void checkin()}>I'M HERE / CHECK-IN</button>
            <Link href={`/play/court?id=${encodeURIComponent(selected.id)}&sport=${sport}`} style={s.linkButton}>OTWÓRZ COURT →</Link>

            <div style={s.sectionTitle}>NAJBLIŻSZE GRY</div>
            <div style={s.gameList}>{selected.openGames.slice(0, 4).map((game) => <Link key={game.id} href={`/play/game?id=${encodeURIComponent(game.id)}`} style={s.game}>
              <b>{game.format}</b><span>{new Date(game.startsAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</span><span>{game.playerCount}/{game.maxPlayers}</span>
            </Link>)}{selected.openGames.length === 0 ? <span style={s.muted}>Brak otwartych gier.</span> : null}</div>
          </> : <div style={s.muted}>Wybierz obiekt na mapie.</div>}
        </aside>
      </section>

      <section style={s.readySection}>
        <div style={s.sectionHeader}><div><div style={s.kicker}>PLAY NOW</div><h2 style={s.h2}>Gracze gotowi teraz.</h2></div><Link href={`/play/players?sport=${sport}&ready=1`} style={s.back}>WSZYSCY GRACZE →</Link></div>
        <div style={s.playerGrid}>{readyPlayers.map((player) => <Link key={player.userId} href={`/play/player?nickname=${encodeURIComponent(player.nickname)}&sport=${sport}`} style={s.playerCard}>
          <div><b>@{player.nickname}</b><div style={s.muted}>{player.displayName || player.tier}</div></div><div style={s.elo}>{player.elo}<small>ELO</small></div>
        </Link>)}{readyPlayers.length === 0 ? <div style={s.muted}>Nikt jeszcze nie oznaczył się jako READY TO PLAY. Możesz być pierwszy.</div> : null}</div>
      </section>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#071016",color:"white",padding:"24px 24px 120px",fontFamily:"Arial,sans-serif"},
  header:{maxWidth:1220,margin:"0 auto 18px",display:"flex",justifyContent:"space-between",alignItems:"start",gap:20},kicker:{color:"#77ff55",fontSize:11,fontWeight:900,letterSpacing:1.3},h1:{fontSize:"clamp(42px,7vw,76px)",lineHeight:.9,letterSpacing:-4,margin:"7px 0"},back:{color:"#77ff55",textDecoration:"none",fontSize:11,fontWeight:900},
  controls:{maxWidth:1220,margin:"0 auto 14px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"},tabs:{display:"flex",gap:6,flexWrap:"wrap"},tab:{padding:"9px 11px",border:"1px solid #29404a",borderRadius:999,background:"#0d1920",color:"#91a3ad",fontSize:10,fontWeight:900},active:{padding:"9px 11px",border:"1px solid #77ff55",borderRadius:999,background:"#77ff55",color:"#071016",fontSize:10,fontWeight:900},activeDark:{padding:"9px 11px",border:"1px solid #77ff55",borderRadius:999,background:"#13251d",color:"#77ff55",fontSize:10,fontWeight:900},geo:{marginLeft:"auto",padding:"9px 12px",border:"1px solid #31505d",borderRadius:999,background:"transparent",color:"#b9cbd1",fontSize:10,fontWeight:900},error:{maxWidth:1220,margin:"0 auto 14px",padding:12,background:"#351519",color:"#ff9da8",borderRadius:12},
  layout:{maxWidth:1220,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,1.6fr) minmax(300px,.7fr)",gap:12},mapWrap:{border:"1px solid #213640",borderRadius:22,background:"#0a151c",padding:12,overflow:"hidden"},mapLabel:{position:"absolute",fontSize:10,fontWeight:900,color:"#627a85",padding:12},map:{position:"relative",height:"min(68vh,680px)",minHeight:480,borderRadius:16,overflow:"hidden",background:"radial-gradient(circle at 55% 45%,#10242b 0,#09151b 55%,#071016 100%)"},svg:{position:"absolute",inset:0,width:"100%",height:"100%"},marker:{position:"absolute",transform:"translate(-50%,-50%)",width:34,height:34,borderRadius:"50%",border:"2px solid #425d68",background:"#0c1a20",color:"white",boxShadow:"0 8px 20px rgba(0,0,0,.35)",cursor:"pointer"},markerHot:{border:"2px solid #77ff55",background:"#17351f",boxShadow:"0 0 0 7px rgba(119,255,85,.08)"},markerSelected:{border:"3px solid white",background:"#77ff55",color:"#071016",width:42,height:42,boxShadow:"0 0 0 9px rgba(119,255,85,.12)"},markerCount:{fontSize:10,fontWeight:950},userDot:{position:"absolute",transform:"translate(-50%,-50%)",zIndex:5,padding:"5px 7px",borderRadius:999,background:"#66b8ff",color:"#06121a",fontSize:8,fontWeight:950,boxShadow:"0 0 0 7px rgba(102,184,255,.12)"},emptyMap:{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#6f858f"},legend:{display:"flex",gap:14,padding:"10px 4px 0",fontSize:10,color:"#78909a"},
  panel:{border:"1px solid #213640",borderRadius:22,background:"#0c171e",padding:20},courtName:{fontSize:"clamp(28px,4vw,42px)",letterSpacing:-2,margin:"8px 0"},distance:{color:"#66b8ff",fontSize:12,fontWeight:800},metrics:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,margin:"20px 0"},tags:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18},readyButton:{width:"100%",padding:14,border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:950},readyActive:{width:"100%",padding:14,border:"1px solid #77ff55",borderRadius:12,background:"#15281d",color:"#77ff55",fontWeight:950},secondary:{width:"100%",marginTop:8,padding:12,border:"1px solid #314a55",borderRadius:12,background:"transparent",color:"white",fontWeight:900},linkButton:{display:"block",marginTop:8,padding:12,borderRadius:12,background:"#15222a",color:"#bcd0d7",textDecoration:"none",textAlign:"center",fontSize:11,fontWeight:900},sectionTitle:{margin:"24px 0 10px",fontSize:10,fontWeight:900,color:"#77ff55",letterSpacing:1.2},gameList:{display:"grid",gap:6},game:{display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,padding:11,borderRadius:10,background:"#0a141a",textDecoration:"none",color:"white",fontSize:11},muted:{color:"#8fa3ac",fontSize:12},
  readySection:{maxWidth:1220,margin:"18px auto 0",padding:20,border:"1px solid #213640",borderRadius:22,background:"#0b171d"},sectionHeader:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:16},h2:{fontSize:"clamp(28px,4vw,44px)",letterSpacing:-2,margin:"4px 0 0"},playerGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:8,marginTop:16},playerCard:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:14,borderRadius:14,background:"#101e25",border:"1px solid #213640",color:"white",textDecoration:"none"},elo:{color:"#77ff55",fontSize:20,fontWeight:950,display:"grid",textAlign:"right"},
};
