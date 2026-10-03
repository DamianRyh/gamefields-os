"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Participant = {
  userId: string;
  nickname: string;
  displayName: string | null;
  side: string;
  role: string;
  status: string;
};

type Message = {
  id: string;
  userId: string;
  nickname: string;
  body: string;
  createdAt: string;
};

type ChallengeData = {
  challenge: {
    id: string;
    creatorUserId: string;
    courtId: string;
    courtName: string;
    sport: string;
    format: string;
    startsAt: string;
    status: string;
    message: string | null;
    gameId: string | null;
  };
  participants: Participant[];
  messages: Message[];
  currentUserId: string;
  me: Participant;
  canRespond: boolean;
};

async function playAction(action: string, payload: Record<string, unknown>) {
  const response = await fetch("/api/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
  return data;
}

export default function ChallengeRoomPage() {
  const params = useSearchParams();
  const challengeId = params.get("id") || "";
  const [data, setData] = useState<ChallengeData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!challengeId) return;
    const response = await fetch(`/api/play/challenge?id=${encodeURIComponent(challengeId)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setError(result.error || "LOAD_FAILED");
      return;
    }
    setData(result);
  }

  useEffect(() => { void load(); }, [challengeId]);

  async function respond(response: "accepted" | "declined") {
    setBusy(true);
    setError("");
    try {
      await playAction("respond_challenge", { challengeId, response });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage() {
    const body = message.trim();
    if (!body) return;
    setBusy(true);
    setError("");
    try {
      await playAction("send_challenge_message", { challengeId, message: body });
      setMessage("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <main style={styles.center}>{error || "Ładowanie challenge…"}</main>;

  const challenge = data.challenge;
  const sideA = data.participants.filter((p) => p.side === "A");
  const sideB = data.participants.filter((p) => p.side === "B");

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link href="/play" style={styles.back}>← PLAY</Link>
        <span>CHALLENGE</span>
      </header>

      <section style={styles.hero}>
        <div>
          <div style={styles.kicker}>{challenge.sport.toUpperCase()} · {challenge.format}</div>
          <h1 style={styles.h1}>{challenge.courtName}</h1>
          <p style={styles.muted}>{new Date(challenge.startsAt).toLocaleString("pl-PL")}</p>
        </div>
        <span style={styles.status}>{challenge.status}</span>
      </section>

      {error && <div style={styles.error}>{error}</div>}

      {challenge.message && <section style={styles.invite}><b>Wiadomość wyzwania</b><p>{challenge.message}</p></section>}

      {data.canRespond && (
        <section style={styles.responseActions}>
          <button disabled={busy} style={styles.accept} onClick={() => void respond("accepted")}>ACCEPT CHALLENGE</button>
          <button disabled={busy} style={styles.decline} onClick={() => void respond("declined")}>DECLINE</button>
        </section>
      )}

      {challenge.status === "accepted" && challenge.gameId && (
        <Link href={`/play/game?gameId=${encodeURIComponent(challenge.gameId)}`} style={styles.gameLink}>OPEN GAME ROOM →</Link>
      )}

      <section style={styles.teams}>
        <article style={styles.card}>
          <div style={styles.title}>SIDE A</div>
          {sideA.map((p) => <ParticipantRow key={p.userId} player={p} sport={challenge.sport} />)}
        </article>
        <article style={styles.card}>
          <div style={styles.title}>SIDE B</div>
          {sideB.map((p) => <ParticipantRow key={p.userId} player={p} sport={challenge.sport} />)}
        </article>
      </section>

      <section style={styles.chat}>
        <div style={styles.title}>CHALLENGE CHAT</div>
        <div style={styles.messages}>
          {data.messages.map((m) => (
            <div key={m.id} style={{ ...styles.message, ...(m.userId === data.currentUserId ? styles.mine : {}) }}>
              <div style={styles.messageMeta}>@{m.nickname} · {new Date(m.createdAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</div>
              <div>{m.body}</div>
            </div>
          ))}
          {!data.messages.length && <div style={styles.muted}>Brak wiadomości. Ustalcie szczegóły gry tutaj.</div>}
        </div>
        <div style={styles.composer}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void sendMessage(); }} placeholder="Napisz wiadomość…" style={styles.input} />
          <button disabled={busy || !message.trim()} style={styles.send} onClick={() => void sendMessage()}>SEND</button>
        </div>
      </section>
    </main>
  );
}

function ParticipantRow({ player, sport }: { player: Participant; sport: string }) {
  return (
    <Link href={`/play/player?nickname=${encodeURIComponent(player.nickname)}&sport=${sport}`} style={styles.person}>
      <div><b>@{player.nickname}</b><span>{player.displayName || player.role}</span></div>
      <em>{player.status}</em>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#071016", color: "white", padding: 24, fontFamily: "Arial,sans-serif" },
  center: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#071016", color: "white" },
  header: { maxWidth: 960, margin: "0 auto 24px", display: "flex", justifyContent: "space-between", color: "#91a3ad" },
  back: { color: "#77ff55", textDecoration: "none", fontWeight: 900 },
  hero: { maxWidth: 960, margin: "0 auto 18px", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "end" },
  kicker: { color: "#77ff55", fontSize: 11, fontWeight: 900, letterSpacing: 1.2 },
  h1: { fontSize: "clamp(42px,8vw,78px)", lineHeight: .95, letterSpacing: -3, margin: "6px 0" },
  muted: { color: "#91a3ad", fontSize: 14 },
  status: { padding: "9px 13px", border: "1px solid #77ff55", borderRadius: 999, color: "#77ff55", textTransform: "uppercase", fontSize: 11, fontWeight: 900 },
  error: { maxWidth: 960, margin: "0 auto 14px", padding: 12, borderRadius: 12, background: "#39161b", color: "#ff9da8" },
  invite: { maxWidth: 960, margin: "0 auto 12px", border: "1px solid #29404a", background: "#0c171e", borderRadius: 16, padding: 16 },
  responseActions: { maxWidth: 960, margin: "0 auto 12px", display: "grid", gridTemplateColumns: "1fr auto", gap: 8 },
  accept: { padding: 14, border: 0, borderRadius: 12, background: "#77ff55", color: "#071016", fontWeight: 900 },
  decline: { padding: "14px 20px", border: "1px solid #65313a", borderRadius: 12, background: "#24151a", color: "#ff98a4", fontWeight: 900 },
  gameLink: { display: "block", maxWidth: 960, boxSizing: "border-box", margin: "0 auto 12px", padding: 14, borderRadius: 12, background: "#77ff55", color: "#071016", textDecoration: "none", fontWeight: 900, textAlign: "center" },
  teams: { maxWidth: 960, margin: "0 auto 12px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 },
  card: { border: "1px solid #213640", background: "#0c171e", borderRadius: 18, padding: 18 },
  title: { color: "#77ff55", fontSize: 11, fontWeight: 900, letterSpacing: 1.2, marginBottom: 12 },
  person: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1c3038", color: "white", textDecoration: "none" },
  chat: { maxWidth: 960, margin: "0 auto", border: "1px solid #213640", background: "#0c171e", borderRadius: 18, padding: 18 },
  messages: { display: "grid", gap: 8, maxHeight: 430, overflowY: "auto", padding: "4px 0 14px" },
  message: { maxWidth: "78%", padding: "10px 12px", background: "#13222a", borderRadius: 13 },
  mine: { justifySelf: "end", background: "#193121", border: "1px solid #31583d" },
  messageMeta: { fontSize: 10, color: "#91a3ad", marginBottom: 4 },
  composer: { display: "grid", gridTemplateColumns: "1fr auto", gap: 8, paddingTop: 12, borderTop: "1px solid #1c3038" },
  input: { minWidth: 0, padding: "12px 13px", borderRadius: 12, border: "1px solid #29404a", background: "#101d25", color: "white" },
  send: { padding: "0 18px", border: 0, borderRadius: 12, background: "#77ff55", color: "#071016", fontWeight: 900 },
};
