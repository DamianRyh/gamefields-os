"use client";

import { useState } from "react";
import styles from "./generator.module.css";

type GeneratorResult = {
  schema: string;
  selected: {
    found: boolean;
    designId: string | null;
    objectiveScore: number | null;
    estimatedSteelKg: number | null;
    estimatedConcreteM3: number | null;
    postSectionCode: string | null;
    railSectionCode: string | null;
    postSpacingM: number | null;
    plate: string | null;
    anchors: string | null;
    footing: string | null;
  };
  optimizer: {
    evaluated: { structuralCandidates: number; structurallyFeasible: number; connectionCandidates: number; fullyFeasible: number };
    alternatives: Array<{ id: string; rank: number; objectiveScore: number; estimatedSteelKg: number; estimatedConcreteM3: number; input: { postSectionCode: string; railSectionCode: string; postSpacingM: number } }>;
  };
  handoff: { engineerGate?: { releaseStatus?: string } } | null;
  limitations: string[];
};

export default function DesignGeneratorPage() {
  const [form, setForm] = useState({
    projectName: "Gamefields 3v3 court",
    projectCode: "GF-GEN-001",
    city: "Warsaw",
    courtType: "3V3",
    lengthM: 15,
    widthM: 10,
    boardHeightM: 1,
    netHeightM: 4,
    priority: "BALANCED",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/engineering/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok && !data?.selected) throw new Error(data?.error ?? "Generator failed");
      setResult(data as GeneratorResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generator failed");
    } finally {
      setLoading(false);
    }
  }

  async function downloadHandoff() {
    const response = await fetch("/api/engineering/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, export: "handoff_json" }),
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.projectCode}-handoff.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span>GAMEFIELDS ENGINEERING / v1.0</span>
          <h1>Design Generator</h1>
          <p>Brief in. Structural concept, optimization and production handoff out.</p>
        </div>
        <div className={styles.badge}>PRE-DESIGN / ENGINEER REVIEW</div>
      </header>

      <section className={styles.layout}>
        <div className={styles.panel}>
          <h2>01 / Project brief</h2>
          <label>Project name<input value={form.projectName} onChange={(e) => update("projectName", e.target.value)} /></label>
          <label>Project code<input value={form.projectCode} onChange={(e) => update("projectCode", e.target.value)} /></label>
          <label>City<input value={form.city} onChange={(e) => update("city", e.target.value)} /></label>
          <label>Court type<select value={form.courtType} onChange={(e) => update("courtType", e.target.value)}><option value="3V3">3V3</option><option value="1V1">1V1</option><option value="CUSTOM_RECTANGULAR">CUSTOM RECTANGULAR</option></select></label>
          <div className={styles.two}><label>Length (m)<input type="number" step="0.5" value={form.lengthM} onChange={(e) => update("lengthM", Number(e.target.value))} /></label><label>Width (m)<input type="number" step="0.5" value={form.widthM} onChange={(e) => update("widthM", Number(e.target.value))} /></label></div>
          <div className={styles.two}><label>Boards (m)<input type="number" step="0.1" value={form.boardHeightM} onChange={(e) => update("boardHeightM", Number(e.target.value))} /></label><label>Net above boards (m)<input type="number" step="0.5" value={form.netHeightM} onChange={(e) => update("netHeightM", Number(e.target.value))} /></label></div>
          <label>Optimization priority<select value={form.priority} onChange={(e) => update("priority", e.target.value)}><option value="BALANCED">BALANCED</option><option value="MINIMUM_STEEL">MINIMUM STEEL</option><option value="MINIMUM_FOUNDATION">MINIMUM FOUNDATION</option></select></label>
          <button className={styles.primary} onClick={generate} disabled={loading}>{loading ? "GENERATING…" : "GENERATE DESIGN"}</button>
          <p className={styles.note}>City is stored as project metadata. v1.0 does not infer normative wind from a city name; project wind/terrain parameters still require confirmation.</p>
        </div>

        <div className={styles.results}>
          {!result && !error && <div className={styles.empty}>Enter the brief and generate a structural concept.</div>}
          {error && <div className={styles.error}>{error}</div>}
          {result && (
            <>
              <section className={styles.hero}>
                <div><span>DESIGN</span><b>{result.selected.designId ?? "NO FEASIBLE DESIGN"}</b></div>
                <div><span>ENGINEER GATE</span><b>{result.handoff?.engineerGate?.releaseStatus ?? "BLOCKED"}</b></div>
                <div><span>STEEL</span><b>{result.selected.estimatedSteelKg ? `${result.selected.estimatedSteelKg.toFixed(0)} kg` : "–"}</b></div>
                <div><span>CONCRETE</span><b>{result.selected.estimatedConcreteM3 ? `${result.selected.estimatedConcreteM3.toFixed(2)} m³` : "–"}</b></div>
              </section>

              <section className={styles.card}>
                <h2>02 / Selected structural system</h2>
                <div className={styles.rows}>
                  <div><span>Posts</span><b>{result.selected.postSectionCode ?? "–"}</b></div>
                  <div><span>Rails</span><b>{result.selected.railSectionCode ?? "–"}</b></div>
                  <div><span>Post spacing</span><b>{result.selected.postSpacingM ? `${result.selected.postSpacingM.toFixed(2)} m` : "–"}</b></div>
                  <div><span>Base plate</span><b>{result.selected.plate ?? "–"}</b></div>
                  <div><span>Anchors</span><b>{result.selected.anchors ?? "–"}</b></div>
                  <div><span>Footing</span><b>{result.selected.footing ?? "–"}</b></div>
                  <div><span>Relative objective</span><b>{result.selected.objectiveScore?.toFixed(1) ?? "–"}</b></div>
                </div>
                {result.selected.found && <button className={styles.secondary} onClick={downloadHandoff}>DOWNLOAD FULL HANDOFF JSON</button>}
              </section>

              <section className={styles.card}>
                <h2>03 / Search summary</h2>
                <div className={styles.stats}>
                  <div><span>STRUCTURAL</span><b>{result.optimizer.evaluated.structuralCandidates}</b></div>
                  <div><span>STRUCTURAL OK</span><b>{result.optimizer.evaluated.structurallyFeasible}</b></div>
                  <div><span>CONNECTION</span><b>{result.optimizer.evaluated.connectionCandidates}</b></div>
                  <div><span>FULLY FEASIBLE</span><b>{result.optimizer.evaluated.fullyFeasible}</b></div>
                </div>
              </section>

              <section className={styles.card}>
                <h2>04 / Alternatives</h2>
                <div className={styles.table}>{result.optimizer.alternatives.slice(0, 6).map((row) => <div key={row.id}><b>#{row.rank} {row.id}</b><span>{row.input.postSectionCode}</span><span>{row.input.railSectionCode}</span><span>{row.input.postSpacingM.toFixed(2)} m</span><span>{row.estimatedSteelKg.toFixed(0)} kg</span><strong>{row.objectiveScore.toFixed(1)}</strong></div>)}</div>
              </section>

              <section className={styles.warning}>{result.limitations.join(" ")}</section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
