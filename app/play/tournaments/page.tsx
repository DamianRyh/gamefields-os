"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

type Tournament = {
  id: string;
  name: string;
  sport: string;
  format: string;
  maxEntries: number;
  startsAt: string;
  status: string;
  organizerNickname: string;
  courtName: string;
  entryCount: number;
};

type Match = {
  id: string;
  round: number;
  position: number;
  playerAUserId: string | null;
  playerBUserId: string | null;
  playerANickname: string | null;
  playerBNickname: string | null;
  scoreA: number | null;
  scoreB: number | null;
  submittedByUserId: string | null;
  status: string;
  winnerNickname: string | null;
};

type Detail = {
  tournament: Tournament & { organizerUserId: string };
  entries: Array<{ userId: string; nickname: string; seed: number | null; elo: number; tier: string }>;
  matches: Match[];
  isOrganizer: boolean;
  isEntered: boolean;
};

type Score = { a: number; b: number };

async function post(payload: Record<string, unknown>) {
  const response = await fetch("/api/play/tournaments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
  return data;
}

function TournamentMatch({
  match,
  score,
  currentUserId,
  isOrganizer,
  busy,
  onScore,
  onSubmit,
  onConfirm,
}: {
  match: Match;
  score: Score;
  currentUserId: string;
  isOrganizer: boolean;
  busy: boolean;
  onScore: (key: "a" | "b", value: number) => void;
  onSubmit: () => void;
  onConfirm: () => void;
}) {
  const participant = currentUserId === match.playerAUserId || currentUserId === match.playerBUserId;
  const canAct = isOrganizer || participant;
  const canSubmit = match.status === "ready" && canAct && Boolean(match.playerAUserId && match.playerBUserId);
  const canConfirm =
    match.status === "awaiting_confirmation" &&
    canAct &&
    (isOrganizer || match.submittedByUserId !== currentUserId);

  return (
    <article style={s.match}>
      <div style={s.matchTop}>
        <span>R{match.round} · M{match.position}</span>
        <span>{match.status}</span>
      </div>

      <div style={s.matchPlayer}>
        <span>{match.playerANickname ? `@${match.playerANickname}` : "TBD"}</span>
        <b>{match.scoreA ?? ""}</b>
      </div>
      <div style={s.matchPlayer}>
        <span>{match.playerBNickname ? `@${match.playerBNickname}` : "TBD"}</span>
        <b>{match.scoreB ?? ""}</b>
      </div>

      {canSubmit ? (
        <div style={s.scoreForm}>
          <input
            aria-label="Wynik A"
            style={s.scoreInput}
            type="number"
            min={0}
            max={99}
            value={score.a}
            onChange={(event) => onScore("a", Number(event.target.value))}
          />
          <span>:</span>
          <input
            aria-label="Wynik B"
            style={s.scoreInput}
            type="number"
            min={0}
            max={99}
            value={score.b}
            onChange={(event) => onScore("b", Number(event.target.value))}
          />
          <button style={s.smallButton} disabled={busy || score.a === score.b} onClick={onSubmit}>
            SUBMIT
          </button>
        </div>
      ) : null}

      {match.status === "awaiting_confirmation" ? (
        <div style={s.wait}>
          {canConfirm ? (
            <button style={s.confirmButton} disabled={busy} onClick={onConfirm}>
              CONFIRM RESULT
            </button>
          ) : (
            <span>Waiting for confirmation…</span>
          )}
        </div>
      ) : null}

      {match.winnerNickname ? <div style={s.winner}>WINNER @{match.winnerNickname}</div> : null}
    </article>
  );
}

export default function TournamentsPage() {
  const [list, setList] = useState<Tournament[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [courts, setCourts] = useState<Array<{ id: string; name: string; sports: string }>>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [name, setName] = useState("Warsaw Open");
  const [sport, setSport] = useState("football");
  const [courtId, setCourtId] = useState("");
  const [maxEntries, setMaxEntries] = useState(8);
  const [startsAt, setStartsAt] = useState(() => {
    const date = new Date(Date.now() + 86_400_000);
    date.setHours(18, 0, 0, 0);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  });

  function hydrateDetail(next: Detail) {
    setDetail(next);
    const nextScores: Record<string, Score> = {};
    for (const match of next.matches || []) {
      nextScores[match.id] = { a: Number(match.scoreA || 0), b: Number(match.scoreB || 0) };
    }
    setScores(nextScores);
  }

  async function loadList() {
    const response = await fetch("/api/play/tournaments", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setError(data.error || "LOAD_FAILED");
      return;
    }
    setList(data.tournaments || []);
  }

  async function loadBootstrap() {
    const response = await fetch("/api/play", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) return;
    setCurrentUserId(data.user?.id || "");
    setCourts(data.courts || []);
    if (!courtId && data.courts?.[0]?.id) setCourtId(data.courts[0].id);
  }

  async function open(id: string) {
    const response = await fetch(`/api/play/tournaments?id=${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setError(data.error || "LOAD_FAILED");
      return;
    }
    hydrateDetail(data as Detail);
  }

  useEffect(() => {
    void loadList();
    void loadBootstrap();
  }, []);

  async function run(payload: Record<string, unknown>, refreshId?: string) {
    setBusy(true);
    setError("");
    try {
      const data = await post(payload);
      if (data.tournament) hydrateDetail(data as Detail);
      else if (refreshId) await open(refreshId);
      else if (data.tournamentId) await open(String(data.tournamentId));
      await loadList();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  function setScore(matchId: string, key: "a" | "b", value: number) {
    const safe = Math.max(0, Math.min(99, Number.isFinite(value) ? value : 0));
    setScores((previous) => ({
      ...previous,
      [matchId]: {
        a: previous[matchId]?.a || 0,
        b: previous[matchId]?.b || 0,
        [key]: safe,
      },
    }));
  }

  const sportCourts = courts.filter((court) => court.sports.includes(sport));

  return (
    <main style={s.page}>
      <header style={s.header}>
        <Link href="/play" style={s.back}>← PLAY</Link>
        <b>TOURNAMENTS</b>
      </header>

      <section style={s.hero}>
        <div style={s.kicker}>COMPETE LOCALLY</div>
        <h1 style={s.h1}>Turnieje miasta.</h1>
        <p style={s.muted}>Zapisz się, zdobądź seed, przejdź drabinkę i walcz o Gamefields Coins.</p>
      </section>

      {error ? <div style={s.error}>{error}</div> : null}

      <section style={s.grid}>
        <article style={s.card}>
          <div style={s.title}>UTWÓRZ TURNIEJ</div>
          <input style={s.input} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nazwa" />
          <select style={s.input} value={sport} onChange={(event) => setSport(event.target.value)}>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
          </select>
          <select style={s.input} value={courtId} onChange={(event) => setCourtId(event.target.value)}>
            {sportCourts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
          </select>
          <select style={s.input} value={maxEntries} onChange={(event) => setMaxEntries(Number(event.target.value))}>
            <option value={2}>2 graczy</option>
            <option value={4}>4 graczy</option>
            <option value={8}>8 graczy</option>
            <option value={16}>16 graczy</option>
            <option value={32}>32 graczy</option>
          </select>
          <input style={s.input} type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          <button
            style={s.primary}
            disabled={busy || !courtId}
            onClick={() => void run({
              action: "create",
              name,
              sport,
              format: "1v1",
              courtId,
              maxEntries,
              startsAt: new Date(startsAt).toISOString(),
            })}
          >
            CREATE TOURNAMENT
          </button>
        </article>

        <article style={s.card}>
          <div style={s.title}>OTWARTE / AKTYWNE</div>
          {list.map((tournament) => (
            <button key={tournament.id} style={s.tournament} onClick={() => void open(tournament.id)}>
              <div style={s.tournamentCopy}>
                <b>{tournament.name}</b>
                <span>{tournament.courtName} · {tournament.sport} {tournament.format}</span>
              </div>
              <div style={s.tournamentCopyRight}>
                <strong>{tournament.entryCount}/{tournament.maxEntries}</strong>
                <span>{tournament.status}</span>
              </div>
            </button>
          ))}
          {!list.length ? <p style={s.muted}>Brak turniejów. Utwórz pierwszy.</p> : null}
        </article>
      </section>

      {detail ? (
        <section style={s.detail}>
          <div style={s.detailHead}>
            <div>
              <div style={s.kicker}>{detail.tournament.sport.toUpperCase()} · {detail.tournament.format}</div>
              <h2 style={s.h2}>{detail.tournament.name}</h2>
              <p style={s.muted}>{detail.tournament.courtName} · {new Date(detail.tournament.startsAt).toLocaleString("pl-PL")}</p>
            </div>
            <span style={s.badge}>{detail.tournament.status}</span>
          </div>

          <div style={s.actions}>
            {!detail.isEntered && detail.tournament.status === "open" ? (
              <button style={s.primarySmall} disabled={busy} onClick={() => void run({ action: "join", tournamentId: detail.tournament.id }, detail.tournament.id)}>
                JOIN
              </button>
            ) : null}
            {detail.isEntered && !detail.isOrganizer && detail.tournament.status === "open" ? (
              <button style={s.secondarySmall} disabled={busy} onClick={() => void run({ action: "leave", tournamentId: detail.tournament.id }, detail.tournament.id)}>
                LEAVE
              </button>
            ) : null}
            {detail.isOrganizer && detail.tournament.status === "open" ? (
              <button style={s.primarySmall} disabled={busy} onClick={() => void run({ action: "start", tournamentId: detail.tournament.id }, detail.tournament.id)}>
                START BRACKET
              </button>
            ) : null}
          </div>

          <div style={s.two}>
            <div>
              <div style={s.title}>ENTRIES</div>
              {detail.entries.map((entry) => (
                <div key={entry.userId} style={s.entry}>
                  <span>{entry.seed ? `#${entry.seed}` : "—"}</span>
                  <Link href={`/play/player?nickname=${encodeURIComponent(entry.nickname)}&sport=${detail.tournament.sport}`} style={s.link}>
                    @{entry.nickname}
                  </Link>
                  <b>{entry.elo}</b>
                  <em>{entry.tier}</em>
                </div>
              ))}
            </div>

            <div>
              <div style={s.title}>BRACKET</div>
              <div style={s.bracket}>
                {detail.matches.map((match) => (
                  <TournamentMatch
                    key={match.id}
                    match={match}
                    score={scores[match.id] || { a: match.scoreA || 0, b: match.scoreB || 0 }}
                    currentUserId={currentUserId}
                    isOrganizer={detail.isOrganizer}
                    busy={busy}
                    onScore={(key, value) => setScore(match.id, key, value)}
                    onSubmit={() => {
                      const current = scores[match.id] || { a: match.scoreA || 0, b: match.scoreB || 0 };
                      void run({
                        action: "submit_match",
                        tournamentId: detail.tournament.id,
                        matchId: match.id,
                        scoreA: current.a,
                        scoreB: current.b,
                      }, detail.tournament.id);
                    }}
                    onConfirm={() => void run({ action: "confirm_match", tournamentId: detail.tournament.id, matchId: match.id }, detail.tournament.id)}
                  />
                ))}
              </div>
              {!detail.matches.length ? <p style={s.muted}>Drabinka pojawi się po starcie turnieju.</p> : null}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#071016", color: "white", padding: 24, fontFamily: "Arial,sans-serif" },
  header: { maxWidth: 1100, margin: "0 auto 24px", display: "flex", justifyContent: "space-between" },
  back: { color: "#77ff55", textDecoration: "none" },
  hero: { maxWidth: 1100, margin: "0 auto 18px" },
  kicker: { fontSize: 12, color: "#77ff55", fontWeight: 900, letterSpacing: 1.2 },
  h1: { fontSize: "clamp(42px,8vw,78px)", margin: "7px 0", letterSpacing: -3 },
  h2: { fontSize: 38, margin: "5px 0" },
  muted: { color: "#91a3ad", fontSize: 14 },
  error: { maxWidth: 1100, margin: "0 auto 16px", padding: 12, background: "#39161b", color: "#ff9da8", borderRadius: 12 },
  grid: { maxWidth: 1100, margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 12 },
  card: { border: "1px solid #213640", background: "#0c171e", borderRadius: 18, padding: 18 },
  title: { fontSize: 12, color: "#77ff55", fontWeight: 900, letterSpacing: 1, marginBottom: 12 },
  input: { width: "100%", boxSizing: "border-box", padding: "12px 13px", border: "1px solid #263d47", borderRadius: 12, background: "#101d25", color: "white", marginBottom: 8 },
  primary: { width: "100%", padding: 13, border: 0, borderRadius: 12, background: "#77ff55", color: "#071016", fontWeight: 900 },
  tournament: { width: "100%", display: "flex", justifyContent: "space-between", gap: 16, textAlign: "left", padding: "13px 0", border: 0, borderBottom: "1px solid #1d3039", background: "transparent", color: "white" },
  tournamentCopy: { display: "grid", gap: 4 },
  tournamentCopyRight: { display: "grid", gap: 4, textAlign: "right" },
  detail: { maxWidth: 1100, margin: "0 auto", border: "1px solid #213640", background: "#0c171e", borderRadius: 20, padding: 20 },
  detailHead: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap" },
  badge: { padding: "8px 12px", border: "1px solid #77ff55", borderRadius: 999, color: "#77ff55", textTransform: "uppercase", fontSize: 11 },
  actions: { display: "flex", gap: 8, margin: "16px 0", flexWrap: "wrap" },
  primarySmall: { padding: "11px 16px", border: 0, borderRadius: 12, background: "#77ff55", color: "#071016", fontWeight: 900 },
  secondarySmall: { padding: "11px 16px", border: "1px solid #314954", borderRadius: 12, background: "transparent", color: "#dce8e5", fontWeight: 900 },
  two: { display: "grid", gridTemplateColumns: "minmax(240px,.8fr) minmax(320px,1.2fr)", gap: 18 },
  entry: { display: "grid", gridTemplateColumns: "35px 1fr auto auto", gap: 8, padding: "10px 0", borderBottom: "1px solid #1c2f37", alignItems: "center", fontSize: 13 },
  link: { color: "white", textDecoration: "none", fontWeight: 800 },
  bracket: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 8 },
  match: { border: "1px solid #233842", borderRadius: 12, padding: 12, background: "#101d25" },
  matchTop: { display: "flex", justifyContent: "space-between", gap: 8, fontSize: 10, color: "#91a3ad", marginBottom: 9, textTransform: "uppercase" },
  matchPlayer: { display: "flex", justifyContent: "space-between", padding: "5px 0" },
  scoreForm: { display: "grid", gridTemplateColumns: "44px 16px 44px 1fr", gap: 5, alignItems: "center", marginTop: 10 },
  scoreInput: { width: 44, boxSizing: "border-box", padding: 7, borderRadius: 8, border: "1px solid #314954", background: "#071016", color: "white", textAlign: "center" },
  smallButton: { minHeight: 34, border: 0, borderRadius: 8, background: "#77ff55", color: "#071016", fontWeight: 900 },
  wait: { marginTop: 10, paddingTop: 9, borderTop: "1px solid #263842", fontSize: 11, color: "#91a3ad" },
  confirmButton: { width: "100%", padding: 9, border: "1px solid #77ff55", borderRadius: 8, background: "transparent", color: "#77ff55", fontWeight: 900 },
  winner: { fontSize: 11, color: "#77ff55", fontWeight: 900, marginTop: 9 },
};
