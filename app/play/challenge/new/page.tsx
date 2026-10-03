"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Court = { id: string; name: string; sports: string; district: string | null };
type Player = { userId: string; nickname: string; displayName: string | null; elo: number; tier: string };

export default function NewChallengePage() {
  const params = useSearchParams();
  const router = useRouter();
  const targetUserId = params.get("playerId") || "";
  const sport = params.get("sport") === "basketball" ? "basketball" : "football";
  const [courts, setCourts] = useState<Court[]>([]);
  const [target, setTarget] = useState<Player | null>(null);
  const [courtId, setCourtId] = useState("");
  const [format, setFormat] = useState("1v1");
  const [message, setMessage] = useState("Gramy?");
  const [startsAt, setStartsAt] = useState(() => {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    date.setHours(18, 0, 0, 0);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [bootstrapResponse, playersResponse] = await Promise.all([
        fetch("/api/play", { cache: "no-store" }),
        fetch(`/api/play/discover?sport=${sport}`, { cache: "no-store" }),
      ]);
      const bootstrap = await bootstrapResponse.json();
      const players = await playersResponse.json();
      if (!bootstrapResponse.ok || !bootstrap.ok) { setError(bootstrap.error || "LOAD_FAILED"); return; }
      if (!playersResponse.ok || !players.ok) { setError(players.error || "LOAD_FAILED"); return; }
      const compatible = (bootstrap.courts || []).filter((court: Court) => court.sports.includes(sport));
      setCourts(compatible);
      if (compatible[0]?.id) setCourtId(compatible[0].id);
      setTarget((players.players || []).find((player: Player) => player.userId === targetUserId) || null);
    }
    void load();
  }, [sport, targetUserId]);

  async function createChallenge() {
    if (!targetUserId || !courtId) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_challenge",
          sport,
          courtId,
          format,
          startsAt: new Date(startsAt).toISOString(),
          invitedUserIds: [targetUserId],
          message,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
      router.push(`/play/challenge?id=${encodeURIComponent(data.challengeId)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={s.page}>
      <header style={s.header}><Link href="/play/players" style={s.back}>← PLAYERS</Link><b>NEW CHALLENGE</b></header>
      <section style={s.hero}>
        <div><div style={s.kicker}>PLAYER VS PLAYER</div><h1 style={s.h1}>Rzuć wyzwanie.</h1><p style={s.muted}>{target ? `@${target.nickname} · ${target.elo} ELO · ${target.tier}` : "Wybierz warunki i wyślij zaproszenie."}</p></div>
      </section>
      {error && <div style={s.error}>{error}</div>}
      <section style={s.card}>
        <label style={s.label}>SPORT</label><div style={s.value}>{sport === "football" ? "Football" : "Basketball"}</div>
        <label style={s.label}>FORMAT</label><select style={s.input} value={format} onChange={(e) => setFormat(e.target.value)}><option>1v1</option><option>2v2</option><option>3v3</option></select>
        <label style={s.label}>COURT</label><select style={s.input} value={courtId} onChange={(e) => setCourtId(e.target.value)}>{courts.map((court) => <option key={court.id} value={court.id}>{court.name}{court.district ? ` · ${court.district}` : ""}</option>)}</select>
        <label style={s.label}>KIEDY</label><input style={s.input} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <label style={s.label}>WIADOMOŚĆ</label><textarea style={{ ...s.input, minHeight: 92, resize: "vertical" }} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} />
        <button disabled={busy || !targetUserId || !courtId} style={s.primary} onClick={() => void createChallenge()}>{busy ? "WYSYŁANIE…" : "SEND CHALLENGE"}</button>
      </section>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#071016", color: "white", padding: 24, fontFamily: "Arial,sans-serif" },
  header: { maxWidth: 760, margin: "0 auto 24px", display: "flex", justifyContent: "space-between" },
  back: { color: "#77ff55", textDecoration: "none" },
  hero: { maxWidth: 760, margin: "0 auto 18px" },
  kicker: { fontSize: 11, color: "#77ff55", fontWeight: 900, letterSpacing: 1.2 },
  h1: { fontSize: "clamp(44px,9vw,80px)", lineHeight: .95, letterSpacing: -4, margin: "6px 0" },
  muted: { color: "#91a3ad", fontSize: 14 },
  error: { maxWidth: 760, margin: "0 auto 14px", padding: 12, borderRadius: 12, background: "#39161b", color: "#ff9da8" },
  card: { maxWidth: 760, boxSizing: "border-box", margin: "0 auto", padding: 20, border: "1px solid #213640", borderRadius: 18, background: "#0c171e" },
  label: { display: "block", margin: "14px 0 6px", color: "#91a3ad", fontSize: 11, fontWeight: 900, letterSpacing: .8 },
  value: { padding: "12px 13px", border: "1px solid #29404a", borderRadius: 12, background: "#101d25" },
  input: { width: "100%", boxSizing: "border-box", padding: "12px 13px", border: "1px solid #29404a", borderRadius: 12, background: "#101d25", color: "white" },
  primary: { width: "100%", marginTop: 18, padding: 14, border: 0, borderRadius: 12, background: "#77ff55", color: "#071016", fontWeight: 900 },
};
