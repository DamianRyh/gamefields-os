"use client";

import { useEffect, useMemo, useState } from "react";

type Sport = "football" | "basketball";
type SkillLevel = "beginner" | "intermediate" | "advanced" | "competitive";
type Court = { id: string; name: string; city: string; district: string | null; sports: string };
type PlayerSport = { sport: string; skillLevel: string; games: number; elo: number };
type Bootstrap = {
  ok: boolean;
  user: { nickname: string; city: string };
  courts: Court[];
  sports: PlayerSport[];
  homeCourts: Array<{ sport: string; courtId: string }>;
};

const levels: Array<{ id: SkillLevel; title: string; description: string }> = [
  { id: "beginner", title: "Start", description: "Gram rekreacyjnie albo dopiero zaczynam." },
  { id: "intermediate", title: "Street", description: "Gram regularnie i szukam równych rywali." },
  { id: "advanced", title: "Advanced", description: "Gram na wysokim poziomie i chcę mocnej rywalizacji." },
  { id: "competitive", title: "Competitive", description: "Turnieje, ligi i wynik są dla mnie ważne." },
];

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

export default function PlayOnboardingPage() {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [sport, setSport] = useState<Sport>("football");
  const [level, setLevel] = useState<SkillLevel>("beginner");
  const [courtId, setCourtId] = useState("");
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/play", { cache: "no-store" });
        const next = await response.json();
        if (!response.ok || !next.ok) throw new Error(next.error || "LOAD_FAILED");
        setData(next);
        const existingHome = next.homeCourts?.[0];
        if (existingHome?.sport === "football" || existingHome?.sport === "basketball") {
          setSport(existingHome.sport);
          setCourtId(existingHome.courtId);
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "LOAD_FAILED");
      }
    }
    void load();
  }, []);

  const availableCourts = useMemo(
    () => (data?.courts || []).filter((court) => court.sports.includes(sport)),
    [data, sport],
  );

  useEffect(() => {
    if (!availableCourts.length) return;
    if (!availableCourts.some((court) => court.id === courtId)) setCourtId(availableCourts[0].id);
  }, [availableCourts, courtId]);

  useEffect(() => {
    const current = data?.sports.find((item) => item.sport === sport);
    if (current?.skillLevel && ["beginner", "intermediate", "advanced", "competitive"].includes(current.skillLevel)) {
      setLevel(current.skillLevel as SkillLevel);
    }
  }, [data, sport]);

  async function finish() {
    if (!courtId) return;
    setBusy(true);
    setError("");
    try {
      const current = data?.sports.find((item) => item.sport === sport);
      if (!current || current.games === 0) {
        await playAction("set_skill_level", { sport, skillLevel: level });
      }
      await playAction("set_home_court", { sport, courtId });
      window.location.replace("/play");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "REQUEST_FAILED");
      setBusy(false);
    }
  }

  if (!data) {
    return <main style={s.center}>{error || "Przygotowujemy Twój profil…"}</main>;
  }

  return (
    <main style={s.page}>
      <section style={s.shell}>
        <div style={s.topline}>
          <span>GAMEFIELDS <b style={s.green}>PLAY</b></span>
          <span style={s.progress}>0{step} / 03</span>
        </div>

        <div style={s.progressBar}><span style={{ ...s.progressFill, width: `${(step / 3) * 100}%` }} /></div>

        {step === 1 ? (
          <section style={s.content}>
            <div style={s.kicker}>WELCOME @{data.user.nickname}</div>
            <h1 style={s.h1}>W co grasz?</h1>
            <p style={s.lead}>Wybierz główną dyscyplinę. Ranking, gry i Home Court będą budowane osobno dla każdego sportu.</p>
            <div style={s.choiceGrid}>
              <button style={sport === "football" ? s.choiceActive : s.choice} onClick={() => setSport("football")}>
                <span style={s.choiceIcon}>⚽</span><b>FOOTBALL</b><small>street football · 1v1 · 3v3 · 5v5</small>
              </button>
              <button style={sport === "basketball" ? s.choiceActive : s.choice} onClick={() => setSport("basketball")}>
                <span style={s.choiceIcon}>🏀</span><b>BASKETBALL</b><small>1v1 · 2v2 · 3v3 · 5v5</small>
              </button>
            </div>
            <button style={s.primary} onClick={() => setStep(2)}>DALEJ →</button>
          </section>
        ) : null}

        {step === 2 ? (
          <section style={s.content}>
            <div style={s.kicker}>PLAYER CALIBRATION</div>
            <h1 style={s.h1}>Jaki masz poziom?</h1>
            <p style={s.lead}>To ustawia punkt startowy rankingu. Po pierwszych meczach ELO będzie już wynikać z wyników przeciwko innym graczom.</p>
            <div style={s.levels}>
              {levels.map((item) => (
                <button key={item.id} style={level === item.id ? s.levelActive : s.level} onClick={() => setLevel(item.id)}>
                  <div><b>{item.title}</b><small>{item.description}</small></div>
                  <span>{level === item.id ? "✓" : ""}</span>
                </button>
              ))}
            </div>
            <div style={s.row}><button style={s.back} onClick={() => setStep(1)}>← WSTECZ</button><button style={s.primaryInline} onClick={() => setStep(3)}>DALEJ →</button></div>
          </section>
        ) : null}

        {step === 3 ? (
          <section style={s.content}>
            <div style={s.kicker}>YOUR HOME</div>
            <h1 style={s.h1}>Wybierz Home Court.</h1>
            <p style={s.lead}>To Twoje lokalne boisko. Tutaj budujesz Court Ranking, walczysz o Court King i łatwiej znajdujesz graczy z okolicy.</p>
            <div style={s.courts}>
              {availableCourts.map((court) => (
                <button key={court.id} style={courtId === court.id ? s.courtActive : s.court} onClick={() => setCourtId(court.id)}>
                  <div><b>{court.name}</b><small>{court.district || court.city}</small></div>
                  <span>{courtId === court.id ? "HOME ✓" : "SELECT"}</span>
                </button>
              ))}
            </div>
            {error ? <div style={s.error}>{error}</div> : null}
            <div style={s.row}><button style={s.back} onClick={() => setStep(2)}>← WSTECZ</button><button disabled={busy || !courtId} style={s.primaryInline} onClick={() => void finish()}>{busy ? "ZAPISUJĘ…" : "WEJDŹ DO PLAY →"}</button></div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "radial-gradient(circle at 70% 10%,#153328 0,#071016 38%,#050b0f 100%)", color: "white", padding: 24, fontFamily: "Arial,sans-serif" },
  center: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#071016", color: "white", fontFamily: "Arial,sans-serif" },
  shell: { width: "min(880px,100%)", margin: "0 auto", paddingBottom: 100 },
  topline: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 900, letterSpacing: .8 },
  green: { color: "#77ff55" },
  progress: { color: "#91a3ad" },
  progressBar: { height: 3, background: "#17272e", borderRadius: 99, marginTop: 14, overflow: "hidden" },
  progressFill: { display: "block", height: "100%", background: "#77ff55", transition: "width .25s ease" },
  content: { marginTop: "clamp(48px,10vh,110px)" },
  kicker: { color: "#77ff55", fontSize: 11, fontWeight: 900, letterSpacing: 1.4 },
  h1: { margin: "8px 0 14px", fontSize: "clamp(48px,9vw,92px)", letterSpacing: -5, lineHeight: .9 },
  lead: { maxWidth: 650, color: "#91a3ad", fontSize: 16, lineHeight: 1.55 },
  choiceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12, margin: "32px 0 18px" },
  choice: { minHeight: 210, display: "grid", alignContent: "end", gap: 7, textAlign: "left", padding: 22, border: "1px solid #28404a", borderRadius: 20, background: "#0b171d", color: "white" },
  choiceActive: { minHeight: 210, display: "grid", alignContent: "end", gap: 7, textAlign: "left", padding: 22, border: "1px solid #77ff55", borderRadius: 20, background: "#10251c", color: "white", boxShadow: "0 0 0 1px rgba(119,255,85,.18) inset" },
  choiceIcon: { fontSize: 48 },
  primary: { width: "100%", padding: 15, border: 0, borderRadius: 13, background: "#77ff55", color: "#071016", fontWeight: 950 },
  levels: { display: "grid", gap: 9, margin: "30px 0" },
  level: { display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", padding: 18, border: "1px solid #263c46", borderRadius: 15, background: "#0b171d", color: "white", textAlign: "left" },
  levelActive: { display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", padding: 18, border: "1px solid #77ff55", borderRadius: 15, background: "#10251c", color: "white", textAlign: "left" },
  row: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20 },
  back: { padding: "13px 16px", border: "1px solid #29404a", borderRadius: 12, background: "transparent", color: "#b7c9c5", fontWeight: 900 },
  primaryInline: { padding: "13px 18px", border: 0, borderRadius: 12, background: "#77ff55", color: "#071016", fontWeight: 950 },
  courts: { display: "grid", gap: 9, marginTop: 28 },
  court: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: 17, border: "1px solid #263c46", borderRadius: 14, background: "#0b171d", color: "white", textAlign: "left" },
  courtActive: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: 17, border: "1px solid #77ff55", borderRadius: 14, background: "#10251c", color: "white", textAlign: "left" },
  error: { marginTop: 12, padding: 12, borderRadius: 12, background: "#39161b", color: "#ff9da8" },
};
