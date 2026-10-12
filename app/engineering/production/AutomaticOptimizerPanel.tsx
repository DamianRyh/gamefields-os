"use client";

import { useState } from "react";
import type { CourtPresetId } from "../domain";
import type { AutomaticOptimizerResult } from "../automatic-optimizer";
import styles from "./production.module.css";

export default function AutomaticOptimizerPanel({ presetId }: { presetId: CourtPresetId }) {
  const [result, setResult] = useState<AutomaticOptimizerResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runOptimizer() {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/engineering/optimize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ presetId, export: "json" }),
      });
      if (!response.ok) throw new Error(`Optimizer failed (${response.status})`);
      setResult(await response.json() as AutomaticOptimizerResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Optimizer failed");
    } finally {
      setRunning(false);
    }
  }

  async function downloadRanking() {
    const response = await fetch("/api/engineering/optimize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ presetId, export: "csv" }),
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${presetId}-optimizer-v09.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const best = result?.best;
  const savingPct = best && result.baseline.estimatedSteelKg > 0
    ? (1 - best.estimatedSteelKg / result.baseline.estimatedSteelKg) * 100
    : null;

  return (
    <section className={styles.card}>
      <h2>00 / Automatic Structural Optimizer v0.9</h2>
      <p className={styles.small}>Searches profiles, post spacing, base-plate thickness, anchor diameter and footing geometry. Every structural seed is re-solved through Frame 3D → Eurocode → Stability; connection/foundation variants are then checked and ranked by a transparent relative cost index.</p>
      <div className={styles.exports}>
        <button className={styles.export} onClick={runOptimizer} disabled={running}>{running ? "OPTIMIZING…" : "RUN OPTIMIZER"}</button>
        <button className={styles.export} onClick={downloadRanking}>DOWNLOAD RANKING CSV</button>
      </div>
      {error && <div className={styles.warning}>{error}</div>}
      {result && <>
        <div className={styles.hero}>
          <div className={styles.metric}><span>STRUCTURAL SEARCH</span><b>{result.evaluated.structuralCandidates}</b></div>
          <div className={styles.metric}><span>FULL CANDIDATES</span><b>{result.evaluated.connectionCandidates}</b></div>
          <div className={styles.metric}><span>FEASIBLE</span><b>{result.evaluated.fullyFeasible}</b></div>
          <div className={styles.metric}><span>BEST SCORE</span><b>{best ? best.objectiveScore.toFixed(1) : "NONE"}</b></div>
        </div>
        {best ? <div className={styles.rows}>
          <div><code>BEST</code><span>{best.input.postSectionCode} / {best.input.railSectionCode}</span><span>spacing {best.input.postSpacingM.toFixed(2)} m</span><b>{best.feasible ? "FEASIBLE" : "CHECK"}</b></div>
          <div><code>BASE</code><span>plate {best.baseConnection.plateWidthMm}×{best.baseConnection.plateLengthMm}×{best.baseConnection.plateThicknessMm} mm</span><span>{best.baseConnection.anchorCount}×M{best.baseConnection.anchorDiameterMm}</span><b>{(best.maxConnectionUtilization * 100).toFixed(0)}%</b></div>
          <div><code>FOOTING</code><span>{best.baseConnection.footingConceptMm.width}×{best.baseConnection.footingConceptMm.length}×{best.baseConnection.footingConceptMm.depth} mm</span><span>{best.estimatedConcreteM3.toFixed(2)} m³ total</span><b>{best.connectionFoundation.footing.status}</b></div>
          <div><code>STEEL</code><span>{best.estimatedSteelKg.toFixed(0)} kg</span><span>baseline {result.baseline.estimatedSteelKg.toFixed(0)} kg</span><b>{savingPct === null ? "–" : `${savingPct.toFixed(1)}% Δ`}</b></div>
        </div> : <div className={styles.warning}>No fully feasible design was found inside the current discrete search grid. Expand sections/spacings/foundation options or revise project assumptions.</div>}
        {result.alternatives.length > 0 && <div className={styles.rows}>
          {result.alternatives.slice(0, 6).map((row) => <div key={row.id}><code>#{row.rank} {row.id}</code><span>{row.input.postSectionCode} / {row.input.postSpacingM.toFixed(2)} m</span><span>M{row.baseConnection.anchorDiameterMm} / footing {row.baseConnection.footingConceptMm.width} mm</span><b>{row.objectiveScore.toFixed(1)}</b></div>)}
        </div>}
      </>}
      <p className={styles.small}>The score is a configurable relative cost proxy, not a supplier quotation. Winning designs remain PRE-DESIGN and still require project-specific actions, anchor product data, geotechnics and qualified structural-engineer review.</p>
    </section>
  );
}
