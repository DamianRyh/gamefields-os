"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = { id: string; email: string; nickname: string; displayName: string | null; city: string };

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/play/auth", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.authenticated) setUser(data.user);
      else setError("Brak aktywnej sesji.");
    }
    void load();
  }, []);

  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/play/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "LOGOUT_FAILED");
      window.location.replace("/play/auth");
    } catch {
      setError("Nie udało się wylogować.");
      setBusy(false);
    }
  }

  return (
    <main style={s.page}>
      <header style={s.header}><Link href="/play" style={s.back}>← PLAY</Link><b>ACCOUNT</b></header>
      <section style={s.hero}>
        <div style={s.kicker}>GAMEFIELDS ACCOUNT</div>
        <h1 style={s.h1}>{user ? `@${user.nickname}` : "Twoje konto"}</h1>
        <p style={s.muted}>Konto łączy profil gracza, rankingi, mecze, turnieje i aktywność na boiskach.</p>
      </section>

      {error ? <div style={s.error}>{error}</div> : null}

      <section style={s.grid}>
        <article style={s.card}>
          <div style={s.title}>PROFIL</div>
          <div style={s.row}><span>Nickname</span><b>{user ? `@${user.nickname}` : "—"}</b></div>
          <div style={s.row}><span>Nazwa</span><b>{user?.displayName || "—"}</b></div>
          <div style={s.row}><span>E-mail</span><b>{user?.email || "—"}</b></div>
          <div style={s.row}><span>Miasto</span><b>{user?.city || "—"}</b></div>
          {user ? <Link href={`/play/player?nickname=${encodeURIComponent(user.nickname)}&sport=football`} style={s.primaryLink}>OTWÓRZ PROFIL GRACZA →</Link> : null}
        </article>

        <article style={s.card}>
          <div style={s.title}>SESJA</div>
          <p style={s.muted}>Publiczna sesja Gamefields jest zapisywana w bezpiecznym cookie HttpOnly i może działać niezależnie od środowiska ChatGPT.</p>
          <button style={s.logout} disabled={busy} onClick={() => void logout()}>{busy ? "WYLOGOWYWANIE…" : "WYLOGUJ SIĘ"}</button>
        </article>
      </section>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#071016", color: "white", padding: 24, fontFamily: "Arial,sans-serif" },
  header: { maxWidth: 920, margin: "0 auto 40px", display: "flex", justifyContent: "space-between" },
  back: { color: "#77ff55", textDecoration: "none", fontWeight: 900 },
  hero: { maxWidth: 920, margin: "0 auto 24px" },
  kicker: { color: "#77ff55", fontSize: 11, fontWeight: 900, letterSpacing: 1.3 },
  h1: { fontSize: "clamp(42px,8vw,78px)", margin: "7px 0", letterSpacing: -4, lineHeight: .95 },
  muted: { color: "#91a3ad", fontSize: 14, lineHeight: 1.55 },
  error: { maxWidth: 920, margin: "0 auto 14px", padding: 12, borderRadius: 12, background: "#39161b", color: "#ff9da8" },
  grid: { maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 },
  card: { padding: 20, border: "1px solid #213640", borderRadius: 18, background: "#0c171e" },
  title: { marginBottom: 14, color: "#77ff55", fontSize: 11, fontWeight: 900, letterSpacing: 1.2 },
  row: { display: "flex", justifyContent: "space-between", gap: 14, padding: "11px 0", borderBottom: "1px solid #1d3039", fontSize: 13 },
  primaryLink: { display: "block", marginTop: 18, padding: 12, borderRadius: 10, background: "#77ff55", color: "#071016", textDecoration: "none", textAlign: "center", fontSize: 11, fontWeight: 900 },
  logout: { width: "100%", marginTop: 18, padding: 12, borderRadius: 10, border: "1px solid #ff7b88", background: "transparent", color: "#ff9da8", fontWeight: 900 },
};
