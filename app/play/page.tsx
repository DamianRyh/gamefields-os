"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Court = { id: string; name: string; city: string; district: string | null; sports: string; latitude: number; longitude: number };
type Game = { id: string; courtId: string; courtName: string; sport: string; format: string; level: string; startsAt: string; maxPlayers: number; playerCount: number };
type Ranking = { userId: string; nickname: string; displayName: string | null; sport: string; elo: number; games: number; wins: number };
type Bootstrap = {
  ok: boolean;
  user: { id: string; nickname: string; city: string; displayName: string | null };
  courts: Court[];
  games: Game[];
  rankings: Ranking[];
  activeCheckins: { courtId: string; playersNow: number }[];
};

async function callPlay(action: string, payload: Record<string, unknown> = {}) {
  const response = await fetch("/api/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
  return data;
}

export default function PlayPage() {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sport, setSport] = useState("football");
  const [courtId, setCourtId] = useState("");
  const [format, setFormat] = useState("3v3");
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  async function reload() {
    try {
      setError(null);
      const response = await fetch("/api/play", { cache: "no-store" });
      if (response.status === 401) {
        setError("UNAUTHENTICATED");
        return;
      }
      const next = await response.json();
      if (!response.ok || !next.ok) throw new Error(next.error || "LOAD_FAILED");
      setData(next);
      if (!courtId && next.courts?.[0]?.id) setCourtId(next.courts[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    }
  }

  useEffect(() => { void reload(); }, []);

  const checkins = useMemo(() => new Map((data?.activeCheckins || []).map((item) => [item.courtId, Number(item.playersNow)])), [data]);
  const rankings = useMemo(() => (data?.rankings || []).filter((item) => item.sport === sport).slice(0, 10), [data, sport]);

  async function run(action: string, payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await callPlay(action, payload);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  if (error === "UNAUTHENTICATED") {
    return (
      <main style={styles.center}>
        <div style={styles.card}>
          <div style={styles.brand}>GAMEFIELDS <span style={styles.green}>PLAY</span></div>
          <h1>Wejdź do gry</h1>
          <p style={styles.muted}>Zaloguj się, aby tworzyć mecze, zdobywać ELO i budować ranking Warszawy.</p>
          <Link href="/signin-with-chatgpt?return_to=/play" style={styles.primary}>ZALOGUJ SIĘ</Link>
        </div>
      </main>
    );
  }

  if (!data) return <main style={styles.center}>Ładowanie Gamefields PLAY…</main>;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>GAMEFIELDS <span style={styles.green}>PLAY</span></div>
          <div style={styles.muted}>Warszawa · v0.1</div>
        </div>
        <div style={styles.profile}>@{data.user.nickname}</div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <section style={styles.hero}>
        <div>
          <div style={styles.kicker}>FIND IT. PLAY IT. RANK IT. CHANGE IT.</div>
          <h1 style={styles.heroTitle}>Gdzie grasz dzisiaj?</h1>
          <p style={styles.muted}>Znajdź boisko, dołącz do gry albo utwórz własny mecz.</p>
        </div>
        <div style={styles.heroStat}><b>{data.games.length}</b><span>otwartych gier</span></div>
      </section>

      <div style={styles.grid}>
        <section style={styles.card}>
          <div style={styles.sectionTitle}>MAPA / BOISKA</div>
          <div style={styles.segmented}>
            <button style={sport === "football" ? styles.activeSegment : styles.segment} onClick={() => setSport("football")}>Football</button>
            <button style={sport === "basketball" ? styles.activeSegment : styles.segment} onClick={() => setSport("basketball")}>Basketball</button>
          </div>
          <div style={styles.list}>
            {data.courts.filter((court) => court.sports.includes(sport)).map((court) => (
              <button key={court.id} onClick={() => setCourtId(court.id)} style={{ ...styles.court, ...(courtId === court.id ? styles.selectedCourt : {}) }}>
                <div>
                  <b>{court.name}</b>
                  <div style={styles.muted}>{court.district || court.city}</div>
                </div>
                <div style={styles.live}>🔥 {checkins.get(court.id) || 0} teraz</div>
              </button>
            ))}
          </div>
          {courtId && <button disabled={busy} style={styles.secondary} onClick={() => run("checkin", { courtId })}>I'M HERE / CHECK-IN</button>}
        </section>

        <section style={styles.card}>
          <div style={styles.sectionTitle}>UTWÓRZ GRĘ</div>
          <label style={styles.label}>Sport</label>
          <select style={styles.input} value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
          </select>
          <label style={styles.label}>Format</label>
          <select style={styles.input} value={format} onChange={(e) => setFormat(e.target.value)}>
            <option>1v1</option><option>2v2</option><option>3v3</option><option>5v5</option>
          </select>
          <label style={styles.label}>Boisko</label>
          <select style={styles.input} value={courtId} onChange={(e) => setCourtId(e.target.value)}>
            {data.courts.filter((court) => court.sports.includes(sport)).map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
          </select>
          <label style={styles.label}>Start</label>
          <input style={styles.input} type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <label style={styles.label}>Liczba graczy</label>
          <input style={styles.input} type="number" min={2} max={30} value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} />
          <button disabled={busy || !courtId} style={styles.primaryButton} onClick={() => run("create_game", { sport, courtId, format, level: "open", maxPlayers, startsAt: new Date(startTime).toISOString() })}>UTWÓRZ GRĘ</button>
        </section>
      </div>

      <section style={styles.card}>
        <div style={styles.sectionTitle}>GRY DLA CIEBIE</div>
        <div style={styles.gameGrid}>
          {data.games.filter((game) => game.sport === sport).map((game) => (
            <article key={game.id} style={styles.gameCard}>
              <div style={styles.kicker}>{game.sport.toUpperCase()} · {game.format}</div>
              <h3 style={{ margin: "8px 0" }}>{game.courtName}</h3>
              <div style={styles.muted}>{new Date(game.startsAt).toLocaleString("pl-PL")}</div>
              <div style={styles.gameMeta}>{game.playerCount} / {game.maxPlayers} graczy · {game.level}</div>
              <button disabled={busy} style={styles.primaryButton} onClick={() => run("join_game", { gameId: game.id })}>DOŁĄCZ</button>
            </article>
          ))}
          {data.games.filter((game) => game.sport === sport).length === 0 && <div style={styles.muted}>Brak otwartych gier — utwórz pierwszą.</div>}
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionTitle}>RANKING WARSZAWA · {sport.toUpperCase()}</div>
        <div style={styles.list}>
          {rankings.map((player, index) => (
            <div key={`${player.userId}-${player.sport}`} style={styles.rankRow}>
              <span style={styles.rankNo}>{index + 1}</span>
              <div style={{ flex: 1 }}><b>@{player.nickname}</b><div style={styles.muted}>{player.games} gier · {player.wins} zwycięstw</div></div>
              <b style={styles.green}>{player.elo} ELO</b>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#071016", color: "#f4f8f5", padding: "24px", fontFamily: "Arial, sans-serif" },
  center: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#071016", color: "white", padding: 24 },
  header: { maxWidth: 1180, margin: "0 auto 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 24, fontWeight: 900, letterSpacing: -1 },
  green: { color: "#77ff55" },
  profile: { border: "1px solid #24343d", borderRadius: 999, padding: "10px 14px", background: "#0d1820" },
  hero: { maxWidth: 1180, margin: "0 auto 20px", border: "1px solid #20323b", borderRadius: 24, padding: 28, background: "linear-gradient(135deg,#0d1820,#0a1319)", display: "flex", justifyContent: "space-between", gap: 24, alignItems: "end" },
  heroTitle: { margin: "6px 0", fontSize: "clamp(36px,7vw,72px)", lineHeight: .95, letterSpacing: -3 },
  heroStat: { minWidth: 140, borderLeft: "1px solid #2b3c45", paddingLeft: 24, display: "grid", gap: 4 },
  kicker: { fontSize: 12, letterSpacing: 1.5, color: "#77ff55", fontWeight: 800 },
  grid: { maxWidth: 1180, margin: "0 auto 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 },
  card: { maxWidth: 1180, margin: "0 auto 20px", border: "1px solid #20323b", borderRadius: 20, padding: 20, background: "#0c171e" },
  sectionTitle: { fontWeight: 900, marginBottom: 16, fontSize: 15, letterSpacing: .7 },
  segmented: { display: "flex", gap: 8, marginBottom: 14 },
  segment: { background: "#101f27", color: "#9fb0b9", border: "1px solid #24343d", borderRadius: 999, padding: "9px 14px", cursor: "pointer" },
  activeSegment: { background: "#77ff55", color: "#061006", border: "1px solid #77ff55", borderRadius: 999, padding: "9px 14px", fontWeight: 800, cursor: "pointer" },
  list: { display: "grid", gap: 10 },
  court: { width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 14, border: "1px solid #22343e", borderRadius: 14, background: "#101d25", color: "white", cursor: "pointer" },
  selectedCourt: { borderColor: "#77ff55", boxShadow: "0 0 0 1px #77ff55 inset" },
  live: { color: "#ff9f43", fontSize: 13, whiteSpace: "nowrap" },
  muted: { color: "#91a3ad", fontSize: 14 },
  label: { display: "block", fontSize: 12, color: "#91a3ad", margin: "12px 0 6px" },
  input: { width: "100%", boxSizing: "border-box", padding: "12px 13px", borderRadius: 12, border: "1px solid #253840", background: "#101d25", color: "white" },
  primaryButton: { width: "100%", marginTop: 14, padding: "13px 16px", borderRadius: 12, border: 0, background: "#77ff55", color: "#071007", fontWeight: 900, cursor: "pointer" },
  primary: { display: "inline-block", marginTop: 14, padding: "13px 16px", borderRadius: 12, background: "#77ff55", color: "#071007", fontWeight: 900, textDecoration: "none" },
  secondary: { width: "100%", marginTop: 14, padding: "12px 16px", borderRadius: 12, border: "1px solid #77ff55", background: "transparent", color: "#77ff55", fontWeight: 800, cursor: "pointer" },
  gameGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 },
  gameCard: { border: "1px solid #243740", borderRadius: 16, padding: 16, background: "#101d25" },
  gameMeta: { marginTop: 14, fontSize: 14 },
  rankRow: { display: "flex", alignItems: "center", gap: 14, padding: "12px 4px", borderBottom: "1px solid #172930" },
  rankNo: { width: 28, color: "#91a3ad", fontWeight: 800 },
  error: { maxWidth: 1180, margin: "0 auto 18px", padding: 12, borderRadius: 12, background: "#351519", border: "1px solid #722831", color: "#ff9da8" },
};
