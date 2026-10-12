"use client";

import { useMemo, useState } from "react";
import styles from "./production.module.css";
import AutomaticOptimizerPanel from "./AutomaticOptimizerPanel";
import { COURT_PRESETS, estimateCourtStructure, type CourtPresetId } from "../domain";
import { generateRectangularCourtModel } from "../model";
import { DEFAULT_ANALYSIS_INPUT, analyzePreliminaryStructure } from "../analysis";
import { solvePreliminaryPostFEM } from "../solver";
import { solveGlobalFrame3D } from "../frame3d";
import { DEFAULT_EUROCODE_PROFILE, runEurocodeEngine } from "../eurocode";
import { DEFAULT_STABILITY_PROFILE, runStabilityEngine } from "../stability";
import { DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS, runConnectionFoundationEngine } from "../connection-foundation";
import { optimizePostSection } from "../optimizer";
import { sizeBaseConnectionConcept } from "../foundation";
import { buildFabricationPackage } from "../fabrication";
import { runEngineerReviewGate } from "../engineer";

const EXPORTS = [
  ["cut_csv", "CUT LIST CSV"], ["member_csv", "MEMBERS CSV"], ["utilization_csv", "UTILIZATION CSV"], ["stability_csv", "STABILITY CSV"], ["connection_foundation_csv", "CONNECTION CSV"],
  ["model_dxf", "MODEL DXF"], ["base_plate_dxf", "BASE PLATE DXF"], ["step_reference", "STEP REFERENCE"], ["solver_csv", "SOLVER CSV"], ["frame3d_json", "FRAME 3D JSON"], ["eurocode_json", "EUROCODE JSON"], ["stability_json", "STABILITY JSON"], ["connection_foundation_json", "CONNECTION JSON"], ["package", "FULL JSON"],
] as const;

export default function EngineeringProductionPage() {
  const [presetId, setPresetId] = useState<CourtPresetId>("GF-3V3-15X10");
  const input = COURT_PRESETS[presetId];
  const assumptions = DEFAULT_ANALYSIS_INPUT;
  const estimate = useMemo(() => estimateCourtStructure(input), [input]);
  const model = useMemo(() => generateRectangularCourtModel(input), [input]);
  const analysis = useMemo(() => analyzePreliminaryStructure(input, model, assumptions), [input, model, assumptions]);
  const solver = useMemo(() => solvePreliminaryPostFEM(input, assumptions), [input, assumptions]);
  const frame3d = useMemo(() => solveGlobalFrame3D(input, model, assumptions), [input, model, assumptions]);
  const eurocode = useMemo(() => runEurocodeEngine({ input, model, frame3d, profile: DEFAULT_EUROCODE_PROFILE }), [input, model, frame3d]);
  const stability = useMemo(() => runStabilityEngine({ input, model, frame3d, eurocode, profile: DEFAULT_STABILITY_PROFILE }), [input, model, frame3d, eurocode]);
  const optimization = useMemo(() => optimizePostSection(input, assumptions), [input, assumptions]);
  const baseConnection = useMemo(() => sizeBaseConnectionConcept(input, analysis), [input, analysis]);
  const connectionFoundation = useMemo(() => runConnectionFoundationEngine({ input, model, frame3d, plate: baseConnection, assumptions: DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS }), [input, model, frame3d, baseConnection]);
  const fabrication = useMemo(() => buildFabricationPackage({ input, estimate, model, analysis, solver, baseConnection }), [input, estimate, model, analysis, solver, baseConnection]);
  const gate = useMemo(() => runEngineerReviewGate({ analysis, solver, frame3d, eurocode, stability, connectionFoundation, baseConnection, fabrication }), [analysis, solver, frame3d, eurocode, stability, connectionFoundation, baseConnection, fabrication]);
  const governingRows = useMemo(() => [...eurocode.members].sort((a, b) => b.utilization - a.utilization).slice(0, 10), [eurocode]);
  const stabilityRows = useMemo(() => [...stability.members].sort((a, b) => b.combinedUtilization - a.combinedUtilization).slice(0, 10), [stability]);

  async function downloadExport(kind: typeof EXPORTS[number][0]) {
    const response = await fetch("/api/engineering/production", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ presetId, export: kind, project: { projectCode: presetId, revision: "P01" } }) });
    if (!response.ok) return;
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") ?? "";
    const match = disposition.match(/filename="([^"]+)"/);
    const jsonExport = kind === "package" || kind.endsWith("_json");
    const name = match?.[1] ?? `${presetId}-${kind}.${jsonExport ? "json" : "txt"}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }

  const plate = fabrication.plates[0];
  const cf = connectionFoundation;

  return (
    <main className={styles.shell}>
      <header className={styles.top}>
        <div>
          <span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v0.9</span>
          <h1>Engineering → Production</h1>
          <p>Automatic structural optimization over the global 3D frame, Eurocode/stability screening, base connection, anchors, weld and footing pre-design, fabrication data and engineer review gate.</p>
        </div>
        <div className={styles.badge}>PRE-DESIGN / ENGINEER REVIEW</div>
      </header>

      <div className={styles.presetRow}>{(Object.keys(COURT_PRESETS) as CourtPresetId[]).map((id) => <button key={id} className={id === presetId ? styles.active : styles.button} onClick={() => setPresetId(id)}>{id}</button>)}</div>

      <AutomaticOptimizerPanel presetId={presetId} />

      <section className={styles.hero}>
        <div className={styles.metric}><span>CONNECTION GOV.</span><b>{cf.summary.governingCheck}</b></div>
        <div className={styles.metric}><span>CONNECTION UTIL.</span><b>{(cf.summary.maxUtilization * 100).toFixed(0)}%</b></div>
        <div className={styles.metric}><span>FAILED CHECKS</span><b>{cf.summary.failedChecks}</b></div>
        <div className={styles.metric}><span>ENGINEER GATE</span><b>{gate.releaseStatus}</b></div>
      </section>

      <div className={styles.exports}>{EXPORTS.map(([kind, label]) => <button key={kind} className={styles.export} onClick={() => downloadExport(kind)}>{label}</button>)}</div>

      <div className={styles.grid}>
        <section>
          <div className={styles.card}>
            <h2>01 / Connection + Foundation Engine</h2>
            <div className={styles.rows}>
              <div><code>ANCHOR</code><span>T {cf.anchorGroup.maxAnchorTensionKn.toFixed(1)} kN / V {cf.anchorGroup.shearPerAnchorKn.toFixed(1)} kN</span><span>{cf.anchorGroup.anchorCount} × M{cf.anchorGroup.anchorDiameterMm}</span><b>{(cf.anchorGroup.interactionUtilization * 100).toFixed(0)}% {cf.anchorGroup.status}</b></div>
              <div><code>PLATE</code><span>{cf.basePlate.widthMm}×{cf.basePlate.lengthMm}×{cf.basePlate.thicknessMm} mm</span><span>bearing {(cf.basePlate.bearingUtilization * 100).toFixed(0)}%</span><b>bending {(cf.basePlate.plateBendingUtilization * 100).toFixed(0)}% {cf.basePlate.status}</b></div>
              <div><code>WELD</code><span>a={cf.weld.nominalSizeMm} mm / L={cf.weld.effectiveLengthMm} mm</span><span>{cf.weld.designDemandKn.toFixed(1)} / {cf.weld.designResistanceKn.toFixed(1)} kN</span><b>{(cf.weld.utilization * 100).toFixed(0)}% {cf.weld.status}</b></div>
              <div><code>FOOTING</code><span>{cf.footing.widthMm}×{cf.footing.lengthMm}×{cf.footing.depthMm} mm</span><span>qmax {cf.footing.maxSoilPressureKpa.toFixed(0)} kPa</span><b>{(Math.max(cf.footing.bearingUtilization, cf.footing.slidingUtilization) * 100).toFixed(0)}% {cf.footing.status}</b></div>
            </div>
            <p className={styles.small}>Default project inputs: anchor T,Rd {cf.assumptions.anchorDesignTensionResistanceKn} kN, V,Rd {cf.assumptions.anchorDesignShearResistanceKn} kN, soil {cf.assumptions.soilDesignBearingKpa} kPa, μ {cf.assumptions.soilBaseFrictionCoefficient}.</p>
          </div>

          <div className={styles.card}>
            <h2>02 / Governing support reaction</h2>
            <div className={styles.rows}>
              <div><code>{cf.governingReaction.nodeId}</code><span>Fx {cf.governingReaction.fxKn.toFixed(2)} / Fy {cf.governingReaction.fyKn.toFixed(2)} kN</span><span>Fz {cf.governingReaction.fzKn.toFixed(2)} kN</span><b>M {Math.hypot(cf.governingReaction.mxKnM, cf.governingReaction.myKnM).toFixed(2)} kNm</b></div>
            </div>
            <p className={styles.small}>Component envelope is intentionally conservative; final connection design must use governing design-combination reactions.</p>
          </div>

          <div className={styles.card}><h2>03 / Stability Engine</h2><div className={styles.rows}>{stabilityRows.map((m) => <div key={m.memberId} className={styles[`row${m.heat}`]}><code>{m.memberId}</code><span>Class {m.sectionClass} / λ̄ {m.nonDimensionalSlenderness.toFixed(2)} / χ {m.bucklingReductionChi.toFixed(2)}</span><span>N/Ncr {(m.secondOrderRatio * 100).toFixed(1)}%</span><b>{(m.combinedUtilization * 100).toFixed(0)}%</b></div>)}</div></div>
          <div className={styles.card}><h2>04 / Cross-section utilization</h2><div className={styles.rows}>{governingRows.map((m) => <div key={m.memberId} className={styles[`row${m.heat}`]}><code>{m.memberId}</code><span>{m.sectionCode}</span><span>{m.governingCombination}</span><b>{(m.utilization * 100).toFixed(0)}%</b></div>)}</div></div>
          <div className={styles.card}><h2>05 / GF Frame 3D</h2><div className={styles.rows}>{frame3d.cases.map((c) => <div key={c.loadCase}><code>{c.loadCase}</code><span>{c.maxDisplacementMm.toFixed(2)} mm</span><span>{c.maxMomentKnM.toFixed(2)} kNm</span><b>{frame3d.solver}</b></div>)}</div></div>
        </section>

        <section>
          <div className={styles.card}><h2>06 / Engineer Gate</h2><div className={`${styles.gate} ${gate.releaseStatus === "BLOCKED" ? styles.block : styles.warn}`}>{gate.releaseStatus}</div><div className={styles.checks}>{gate.checks.map((check) => <div key={check.id}><strong>{check.status}</strong><p><b>{check.label}</b><br />{check.note}</p></div>)}</div></div>

          <div className={styles.card}><h2>07 / Foundation contact</h2><div className={styles.rows}>
            <div><code>q max</code><span>{cf.footing.maxSoilPressureKpa.toFixed(1)} kPa</span><span>q min {cf.footing.minSoilPressureKpa.toFixed(1)} kPa</span><b>{cf.footing.contactStatus}</b></div>
            <div><code>slide</code><span>H {cf.footing.horizontalKn.toFixed(1)} kN</span><span>μ={cf.assumptions.soilBaseFrictionCoefficient}</span><b>{(cf.footing.slidingUtilization * 100).toFixed(0)}%</b></div>
            <div><code>ecc.</code><span>ex/B6 {cf.footing.eccentricityRatioX.toFixed(2)}</span><span>ey/L6 {cf.footing.eccentricityRatioY.toFixed(2)}</span><b>{cf.footing.status}</b></div>
          </div></div>

          <div className={styles.card}><h2>08 / Base plate P001</h2>{plate && <><div className={styles.plate}>{plate.holes.map((hole, i) => <span key={i} className={styles.hole} style={{ left: `${50 + (hole.xMm / plate.widthMm) * 100}%`, top: `${50 + (hole.yMm / plate.lengthMm) * 100}%` }} />)}</div><p className={styles.small}>{plate.widthMm} × {plate.lengthMm} × {plate.thicknessMm} mm / {plate.quantity} pcs / holes Ø{plate.holes[0]?.diameterMm ?? 0} mm</p></>}</div>

          <div className={styles.card}><h2>09 / SLS</h2><div className={styles.slsMeter}><span style={{ width: `${Math.min(100, eurocode.serviceability.utilization * 100)}%` }} /></div><p className={styles.small}>{eurocode.serviceability.maxDisplacementMm.toFixed(1)} / {eurocode.serviceability.limitMm.toFixed(1)} mm — {eurocode.serviceability.status}.</p></div>
          <div className={styles.card}><h2>10 / Auto-size</h2><div className={styles.rows}>{eurocode.sizing.map((s) => <div key={s.memberType}><code>{s.memberType}</code><span>{s.currentSectionCode}</span><span>→ {s.recommendedSectionCode ?? "none"}</span><b>{s.status}</b></div>)}</div></div>
          <div className={styles.card}><h2>11 / Cut list</h2><div className={styles.rows}>{fabrication.cutList.slice(0, 8).map((item) => <div key={item.mark}><code>{item.mark}</code><span>{item.sectionCode}</span><span>{item.lengthMm} mm × {item.quantity}</span><b>{item.estimatedWeightKg ?? "–"} kg</b></div>)}</div></div>

          <div className={styles.warning}>GF Automatic Structural Optimizer v0.9 and all downstream engines remain PRE-DESIGN. Optimization uses discrete search and a transparent relative-cost objective; anchor capacities, soil inputs, project actions, fabrication details, nonlinear/global verification and independent engineer approval remain mandatory before fabrication or construction release.</div>
        </section>
      </div>
    </main>
  );
}
