"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Mode = "login" | "register";

const errors: Record<string, string> = {
  INVALID_EMAIL: "Podaj poprawny adres e-mail.",
  PASSWORD_LENGTH: "Hasło musi mieć od 10 do 128 znaków.",
  ACCOUNT_EXISTS: "Konto z tym adresem już istnieje. Zaloguj się.",
  INVALID_CREDENTIALS: "Nieprawidłowy e-mail lub hasło.",
  AUTH_TEMP_LOCKED: "Za dużo nieudanych prób. Spróbuj ponownie za około 15 minut.",
};

export default function PlayAuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const response = await fetch("/api/play/auth", { cache: "no-store" });
        const data = await response.json();
        if (response.ok && data.authenticated) window.location.replace("/play");
      } finally {
        setChecking(false);
      }
    }
    void check();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/play/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, email, password, displayName }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
      window.location.href = "/play";
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "REQUEST_FAILED";
      setError(errors[code] || "Nie udało się zalogować. Spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={s.page}>
      <section style={s.panel}>
        <Link href="/play" style={s.back}>← GAMEFIELDS PLAY</Link>
        <div style={s.kicker}>YOUR CITY. YOUR GAME.</div>
        <h1 style={s.h1}>{mode === "login" ? "Wracaj do gry." : "Dołącz do PLAY."}</h1>
        <p style={s.lead}>Jedno konto do gier, rankingów, challenge, turniejów, boisk i społeczności Gamefields.</p>

        <div style={s.tabs}>
          <button style={mode === "login" ? s.activeTab : s.tab} onClick={() => { setMode("login"); setError(""); }}>LOGOWANIE</button>
          <button style={mode === "register" ? s.activeTab : s.tab} onClick={() => { setMode("register"); setError(""); }}>NOWE KONTO</button>
        </div>

        <form onSubmit={submit} style={s.form}>
          {mode === "register" ? (
            <label style={s.label}>
              Nazwa wyświetlana
              <input style={s.input} autoComplete="name" maxLength={80} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="np. Damian" />
            </label>
          ) : null}

          <label style={s.label}>
            E-mail
            <input style={s.input} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="twoj@email.pl" />
          </label>

          <label style={s.label}>
            Hasło
            <input style={s.input} type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={10} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="minimum 10 znaków" />
          </label>

          {error ? <div style={s.error}>{error}</div> : null}
          <button style={s.primary} disabled={busy || checking} type="submit">
            {busy ? "CHWILA…" : mode === "login" ? "ZALOGUJ I GRAJ" : "UTWÓRZ KONTO"}
          </button>
        </form>

        <div style={s.security}>Sesja: HttpOnly · SameSite · 30 dni · hasło PBKDF2</div>
      </section>

      <aside style={s.side}>
        <div style={s.sideKicker}>GAMEFIELDS PLAY</div>
        <h2 style={s.sideTitle}>Znajdź. Zagraj. Rywalizuj. Zmień swoje boisko.</h2>
        <div style={s.features}>
          <span>⚡ gry i check-in</span>
          <span>🏆 ELO i lokalne rankingi</span>
          <span>⚔ challenge między graczami</span>
          <span>🎯 turnieje i drabinki</span>
          <span>📍 Court Ranking i Home Court</span>
          <span>🎨 redesign w Gamefields Builder</span>
        </div>
      </aside>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,.75fr)", background: "#071016", color: "white", fontFamily: "Arial,sans-serif" },
  panel: { width: "min(520px, calc(100% - 32px))", margin: "auto", padding: "48px 0 110px" },
  back: { color: "#77ff55", textDecoration: "none", fontSize: 11, fontWeight: 900 },
  kicker: { marginTop: 70, color: "#77ff55", fontSize: 11, fontWeight: 900, letterSpacing: 1.4 },
  h1: { margin: "8px 0", fontSize: "clamp(44px,7vw,76px)", lineHeight: .92, letterSpacing: -4 },
  lead: { maxWidth: 480, color: "#91a3ad", lineHeight: 1.55 },
  tabs: { display: "flex", gap: 8, margin: "30px 0 16px" },
  tab: { flex: 1, padding: 12, border: "1px solid #29404a", borderRadius: 12, background: "#0d1920", color: "#91a3ad", fontWeight: 900 },
  activeTab: { flex: 1, padding: 12, border: "1px solid #77ff55", borderRadius: 12, background: "#77ff55", color: "#071016", fontWeight: 900 },
  form: { display: "grid", gap: 13 },
  label: { display: "grid", gap: 7, fontSize: 12, color: "#bfd0cc", fontWeight: 800 },
  input: { width: "100%", boxSizing: "border-box", padding: "14px 15px", borderRadius: 12, border: "1px solid #2c424c", background: "#0d1920", color: "white", fontSize: 16 },
  error: { padding: 12, borderRadius: 12, background: "#39161b", color: "#ff9da8", fontSize: 13 },
  primary: { marginTop: 5, padding: 15, border: 0, borderRadius: 12, background: "#77ff55", color: "#071016", fontWeight: 950, fontSize: 13 },
  security: { marginTop: 14, color: "#607781", fontSize: 10, textAlign: "center" },
  side: { display: "grid", alignContent: "center", padding: 50, background: "radial-gradient(circle at 30% 20%,#183729 0,#0b171b 42%,#071016 100%)", borderLeft: "1px solid #20353f" },
  sideKicker: { color: "#77ff55", fontSize: 11, fontWeight: 900, letterSpacing: 1.5 },
  sideTitle: { maxWidth: 520, margin: "12px 0 30px", fontSize: "clamp(34px,4vw,58px)", lineHeight: .95, letterSpacing: -2 },
  features: { display: "grid", gap: 12, color: "#c7d5d2", fontSize: 14 },
};
