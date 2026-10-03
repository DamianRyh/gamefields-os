"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RankRow = {
  userId: string;
  nickname: string;
  displayName: string | null;
  avatarUrl: string | null;
  city: string;
  elo: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  localGames?: number;
  rank: number;
  tier: string;
  winRate: number;
};

type RankingResponse = {
  ok: boolean;
  sport: string;
  scope: string;
  context: Record<string, unknown>;
  rows: RankRow[];
  myRank: number | null;
  me: RankRow | null;
  nextTarget: RankRow | null;
  error?: string;
};

const scopes = [
  ["city", "CITY"],
  ["district", "DISTRICT"],
  ["court", "COURT"],
  ["friends", "FRIENDS"],
] as const;

export default function RankingsPage() {
  const [sport, setSport] = useState("football");
  const [scope, setScope] = useState("city");
  const [data, setData] = useState<RankingResponse | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const params = new URLSearchParams({ sport, scope });
    const response = await fetch(`/api/play/rankings?${params}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setError(result.error || "LOAD_FAILED");
      setData(null);
      return;
    }
    setData(result);
  }

  useEffect(() => { void load(); }, [sport, scope]);

  const contextLabel = useMemo(() => {
    if (!data) return "";
    if (data.scope === "city") return String(data.context.city || "Warszawa");
    if (data.scope === "district") return String(data.context.district || "Ustaw Home Court");
    if (data.scope === "court") return String(data.context.courtName || "Ustaw Home Court");
    return "Obserwowani gracze";
  }, [data]);

  return (
    <main style={s.page}>
      <header style={s.header}>
        <Link href="/play" style={s.back}>← PLAY</Link>
        <b>RANKINGS</b>
      </header>

      <section style={s.hero}>
        <div>
          <div style={s.kicker}>YOUR POSITION / YOUR NEXT TARGET</div>
          <h1 style={s.h1}>Graj o coś lokalnie.</h1>
          <p style={s.muted}>Ranking miasta, dzielnicy, Twojego boiska i znajomych — osobno dla każdej dyscypliny.</p>
        </div>
        <div style={s.sports}>
          <button style={sport === "football" ? s.activePill : s.pill} onClick={() => setSport("football")}>FOOTBALL</button>
          <button style={sport === "basketball" ? s.activePill : s.pill} onClick={() => setSport("basketball")}>BASKETBALL</button>
        </div>
      </section>

      <section style={s.scopeBar}>
        {scopes.map(([value, label]) => (
          <button key={value} style={scope === value ? s.activeTab : s.tab} onClick={() => setScope(value)}>{label}</button>
        ))}
      </section>

      {error && <div style={s.error}>{error}</div>}

      {data && (
        <>
          <section style={s.summaryGrid}>
            <article style={s.summaryCard}>
              <span style={s.kicker}>{scope.toUpperCase()}</span>
              <strong style={s.summaryBig}>{contextLabel}</strong>
              <span style={s.muted}>aktywny zakres rankingu</span>
            </article>
            <article style={s.summaryCard}>
              <span style={s.kicker}>YOUR RANK</span>
              <strong style={s.summaryBig}>{data.myRank ? `#${data.myRank}` : "—"}</strong>
              <span style={s.muted}>{data.me ? `${data.me.elo} ELO · ${data.me.tier}` : "Zagraj pierwszy mecz w tym rankingu"}</span>
            </article>
            <article style={s.summaryCard}>
              <span style={s.kicker}>NEXT TARGET</span>
              <strong style={s.summaryBig}>{data.nextTarget ? `#${data.nextTarget.rank}` : "TOP"}</strong>
              <span style={s.muted}>{data.nextTarget ? `@${data.nextTarget.nickname} · ${data.nextTarget.elo} ELO` : "Jesteś na szczycie tego zakresu"}</span>
            </article>
          </section>

          <section style={s.tableCard}>
            <div style={s.tableHead}>
              <span>#</span><span>PLAYER</span><span>FORM</span><span>ELO</span>
            </div>
            <div>
              {data.rows.map((row) => (
                <Link key={row.userId} href={`/play/player?nickname=${encodeURIComponent(row.nickname)}&sport=${sport}`} style={{ ...s.row, ...(data.me?.userId === row.userId ? s.meRow : {}) }}>
                  <span style={s.rank}>{row.rank}</span>
                  <span>
                    <b>@{row.nickname}</b>
                    <small style={s.small}>{row.tier}{row.localGames != null ? ` · ${row.localGames} local` : ""}</small>
                  </span>
                  <span style={s.form}>{row.games} G · {row.winRate}% W</span>
                  <strong style={s.elo}>{row.elo}</strong>
                </Link>
              ))}
              {!data.rows.length && <div style={s.empty}>Brak sklasyfikowanych graczy w tym zakresie.</div>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#071016", color: "#f5f8f7", padding: 24, fontFamily: "Arial,sans-serif" },
  header: { maxWidth: 1100, margin: "0 auto 24px", display: "flex", justifyContent: "space-between", color: "#8fa2ac" },
  back: { color: "#77ff55", textDecoration: "none", fontWeight: 900 },
  hero: { maxWidth: 1100, margin: "0 auto 18px", display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap" },
  kicker: { color: "#77ff55", fontSize: 11, fontWeight: 900, letterSpacing: 1.2 },
  h1: { margin: "7px 0", fontSize: "clamp(40px,8vw,76px)", lineHeight: .94, letterSpacing: -3 },
  muted: { color: "#91a3ad", fontSize: 13 },
  sports: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: { padding: "10px 14px", borderRadius: 999, border: "1px solid #29404a", background: "#0d1920", color: "#92a6b0", fontWeight: 800 },
  activePill: { padding: "10px 14px", borderRadius: 999, border: "1px solid #77ff55", background: "#77ff55", color: "#071016", fontWeight: 900 },
  scopeBar: { maxWidth: 1100, margin: "0 auto 16px", display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 7 },
  tab: { minHeight: 46, borderRadius: 13, border: "1px solid #243a44", background: "#0c171e", color: "#9aabb3", fontWeight: 900 },
  activeTab: { minHeight: 46, borderRadius: 13, border: "1px solid #77ff55", background: "#112319", color: "#77ff55", fontWeight: 900 },
  error: { maxWidth: 1100, margin: "0 auto 16px", borderRadius: 12, padding: 12, background: "#351519", color: "#ff9da8" },
  summaryGrid: { maxWidth: 1100, margin: "0 auto 16px", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 },
  summaryCard: { border: "1px solid #213640", background: "#0c171e", borderRadius: 18, padding: 18, display: "grid", gap: 7 },
  summaryBig: { fontSize: "clamp(24px,4vw,40px)", letterSpacing: -1.5 },
  tableCard: { maxWidth: 1100, margin: "0 auto", border: "1px solid #213640", background: "#0b151c", borderRadius: 20, overflow: "hidden" },
  tableHead: { display: "grid", gridTemplateColumns: "50px minmax(0,1fr) 130px 90px", gap: 10, padding: "12px 16px", color: "#617780", fontSize: 10, fontWeight: 900, letterSpacing: 1 },
  row: { display: "grid", gridTemplateColumns: "50px minmax(0,1fr) 130px 90px", gap: 10, padding: "15px 16px", color: "white", textDecoration: "none", borderTop: "1px solid #162830", alignItems: "center" },
  meRow: { background: "#112319" },
  rank: { color: "#77ff55", fontWeight: 900, fontSize: 18 },
  small: { display: "block", color: "#7e929c", marginTop: 4 },
  form: { color: "#91a3ad", fontSize: 12 },
  elo: { color: "#77ff55", textAlign: "right", fontSize: 18 },
  empty: { padding: 24, color: "#91a3ad" },
};
