"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Redesign = {
  id: string;
  ownerUserId: string;
  ownerNickname: string;
  projectKey: string;
  courtId: string | null;
  name: string;
  sport: string;
  source: string;
  visibility: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  supportCount: number;
  supportedByMe: boolean;
};

export default function CommunityRedesigns({ courtId }: { courtId: string }) {
  const [projects, setProjects] = useState<Redesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/projects?courtId=${encodeURIComponent(courtId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "LOAD_FAILED");
      setProjects(data.projects || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [courtId]);

  async function support(id: string) {
    setBusy(id);
    setError("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "support", id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "SUPPORT_FAILED");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "SUPPORT_FAILED");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section style={styles.wrap}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>COMMUNITY REDESIGNS</div>
          <h2 style={styles.title}>Jak może wyglądać to miejsce?</h2>
          <p style={styles.muted}>Projekty stworzone dla tego obiektu i opublikowane przez społeczność Gamefields.</p>
        </div>
        <Link href={`/play/court?id=${encodeURIComponent(courtId)}`} style={styles.subtle}>COURT</Link>
      </header>

      {error ? <div style={styles.error}>{error}</div> : null}
      {loading ? <div style={styles.empty}>Ładowanie propozycji…</div> : null}

      {!loading && projects.length > 0 ? (
        <div style={styles.grid}>
          {projects.map((project, index) => (
            <article key={project.id} style={styles.card}>
              <div style={styles.top}>
                <span style={styles.number}>#{String(index + 1).padStart(2, "0")}</span>
                <span style={styles.sport}>{project.sport}</span>
              </div>
              <h3 style={styles.name}>{project.name}</h3>
              <p style={styles.author}>by @{project.ownerNickname}</p>
              <div style={styles.metric}>
                <strong>{project.supportCount}</strong>
                <span>SUPPORTERS</span>
              </div>
              <div style={styles.actions}>
                <Link href={`/?projectId=${encodeURIComponent(project.id)}`} style={styles.view}>VIEW DESIGN</Link>
                <button
                  disabled={busy === project.id || project.supportedByMe}
                  onClick={() => void support(project.id)}
                  style={project.supportedByMe ? styles.supported : styles.support}
                >
                  {project.supportedByMe ? "SUPPORTED ✓" : busy === project.id ? "SUPPORTING…" : "SUPPORT"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && projects.length === 0 ? (
        <div style={styles.empty}>
          <strong>Nie ma jeszcze publicznego redesignu tego miejsca.</strong>
          <span>Otwórz Builder z karty boiska, zapisz projekt na koncie i opublikuj go w Gamefields OS.</span>
        </div>
      ) : null}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 1080, margin: "14px auto 0", padding: 20, border: "1px solid #29413a", borderRadius: 22, background: "#0b1714", color: "white" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", flexWrap: "wrap", marginBottom: 14 },
  kicker: { color: "#77ff55", fontSize: 10, fontWeight: 900, letterSpacing: 1.2 },
  title: { fontSize: "clamp(28px,5vw,48px)", letterSpacing: -2, margin: "5px 0" },
  muted: { color: "#8fa2aa", fontSize: 13, margin: 0 },
  subtle: { color: "#77ff55", textDecoration: "none", fontSize: 10, fontWeight: 900 },
  error: { padding: 11, borderRadius: 11, background: "#38161a", color: "#ff9da8", marginBottom: 10 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 10 },
  card: { border: "1px solid #243a34", borderRadius: 17, background: "#0a1412", padding: 16, minWidth: 0 },
  top: { display: "flex", justifyContent: "space-between", gap: 8, color: "#728b82", fontSize: 9, fontWeight: 900, textTransform: "uppercase" },
  number: { color: "#77ff55" },
  sport: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  name: { fontSize: 22, letterSpacing: -.8, margin: "18px 0 3px" },
  author: { color: "#93a49e", fontSize: 11, margin: 0 },
  metric: { display: "flex", alignItems: "baseline", gap: 7, margin: "20px 0 12px" },
  actions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 },
  view: { padding: 11, borderRadius: 10, border: "1px solid #344b44", color: "#e5eeeb", textDecoration: "none", fontSize: 10, fontWeight: 900, textAlign: "center" },
  support: { padding: 11, border: 0, borderRadius: 10, background: "#77ff55", color: "#071016", fontSize: 10, fontWeight: 900 },
  supported: { padding: 11, border: "1px solid #365c40", borderRadius: 10, background: "#11251a", color: "#77ff55", fontSize: 10, fontWeight: 900 },
  empty: { display: "grid", gap: 5, padding: 18, border: "1px dashed #31483f", borderRadius: 14, color: "#8fa29c", fontSize: 12 },
};
