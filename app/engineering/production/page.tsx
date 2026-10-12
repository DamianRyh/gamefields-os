"use client";

import { useMemo, useState } from "react";
import styles from "./production.module.css";
import { COURT_PRESETS, estimateCourtStructure, type CourtPresetId } from "../domain";
import { generateRectangularCourtModel } from "../model";
import { DEFAULT_ANALYSIS_INPUT, analyzePreliminaryStructure } from "../analysis";
import { solvePreliminaryPostFEM } from "../solver";
import { solveGlobalFrame3D } from "../frame3d";
import { DEFAULT_EUROCODE_PROFILE, runEurocodeEngine } from "../eurocode";
import { DEFAULT_STABILITY_PROFILE, runStabilityEngine } from "../stability";
import { optimizePostSection } from "../optimizer";
import { sizeBaseConnectionConcept } from "../foundation";
import { buildFabricationPackage } from "../fabrication";
import { runEngineerReviewGate } from "../engineer";

const EXPORTS = [
  ["cut_csv", "CUT LIST CSV"],
  ["member_csv", "MEMBERS CSV"],
  ["utilization_csv", "UTILIZATION CSV"],
  ["stability_csv", "STABILITY CSV"],
  ["model_dxf", "MODEL DXF"],
  ["base_plate_dxf", "BASE PLATE DXF"],
  ["step_reference", "STEP REFERENCE"],
  ["solver_csv", "SOLVER CSV"],
  ["frame3d_json", "FRAME 3D JSON"],
  ["eurocode_json", "EUROCODE JSON"],
  ["stability_json", "STABILITY JSON"],
  ["package", "FULL JSON"],
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
  const fabrication = useMemo(() => buildFabricationPackage({ input, estimate, model, analysis, solver, baseConnection }), [input, estimate, model, analysis, solver, baseConnection]);
  const gate = useMemo(() => runEngineerReviewGate({ analysis, solver, frame3d, eurocode, stability, baseConnection, fabrication }), [analysis, solver, frame3d, eurocode, stability, baseConnection, fabrication]);
  const governingRows = useMemo(() => [...eurocode.members].sort((a, b) => b.utilization - a.utilization).slice(0, 12), [eurocode]);
  const stabilityRows = useMemo(() => [...stability.members].sort((a, b) => b.combinedUtilization - a.combinedUtilization).slice(0, 12), [stability]);

  async function downloadExport(kind: typeof EXPORTS[number][0]) {
    const response = await fetch("/api/engineering/production", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ presetId, export: kind, project: { projectCode: presetId, revision: "P01" } }),
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") ?? "";
    const match = disposition.match(/filename="([^"]+)"/);
    const jsonExport = kind === "package" || kind === "frame3d_json" || kind === "eurocode_json" || kind === "stability_json";
    const name = match?.[1] ?? `${presetId}-${kind}.${jsonExport ? "json" : "txt"}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const plate = fabrication.plates[0];

  return (
    <main className={styles.shell}>
      <header className={styles.top}>
        <div>
          <span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v0.7</span>
          <h1>Engineering → Production</h1>
          <p>Global 3D frame solver, Eurocode pre-design combinations, stability screening, second-order sensitivity, member utilization, fabrication data and engineer review gate.</p>
        </div>
        <div className={styles.badge}>PRE-DESIGN / ENGINEER REVIEW</div>
      </header>

      <div className={styles.presetRow}>
        {(Object.keys(COURT_PRESETS) as CourtPresetId[]).map((id) => (
          <button key={id} className={id === presetId ? styles.active : styles.button} onClick={() => setPresetId(id)}>{id}</button>
        ))}
      </div>

      <section className={styles.hero}>
        <div className={styles.metric}><span>STABILITY GOVERNING</span><b>{stability.summary.governingMemberId}</b></div>
        <div className={styles.metric}><span>STABILITY UTIL.</span><b>{(stability.summary.maxCombinedUtilization * 100).toFixed(0)}%</b></div>
        <div className={styles.metric}><span>MAX NED/NCR</span><b>{(stability.summary.maxSecondOrderRatio * 100).toFixed(1)}%</b></div>
        <div className={styles.metric}><span>FAILED / CLASS 4</span><b>{stability.summary.failedMembers} / {stability.summary.class4Members}</b></div>
      </section>

      <div className={styles.exports}>
        {EXPORTS.map(([kind, label]) => <button key={kind} className={styles.export} onClick={() => downloadExport(kind)}>{label}</button>)}
      </div>

      <div className={styles.grid}>
        <section>
          <div className={styles.card}>
            <h2>01 / Stability Engine</h2>
            <div className={styles.heatLegend}><span className={styles.heatLow}>LOW</span><span className={styles.heatMedium}>MEDIUM</span><span className={styles.heatHigh}>HIGH</span><span className={styles.heatFail}>FAIL</span></div>
            <div className={styles.rows}>
              {stabilityRows.map((m) => <div key={m.memberId} className={styles[`row${m.heat}`]}><code>{m.memberId}</code><span>Class {m.sectionClass} / λ̄ {m.nonDimensionalSlenderness.toFixed(2)} / χ {m.bucklingReductionChi.toFixed(2)}</span><span>N/Ncr {(m.secondOrderRatio * 100).toFixed(1)}% / amp {m.secondOrderAmplification.toFixed(2)}×</span><b>{(m.combinedUtilization * 100).toFixed(0)}%</b></div>)}
            </div>
            <p className={styles.small}>Screening includes section class, Euler Ncr, non-dimensional slenderness, buckling reduction χ, axial buckling resistance, shear and member-level second-order amplification.</p>
          </div>

          <div className={styles.card}>
            <h2>02 / Stability assumptions</h2>
            <div className={styles.rows}>
              <div><code>γM1</code><span>{stability.profile.gammaM1}</span><span>Buckling alpha</span><b>{stability.profile.defaultBucklingAlpha}</b></div>
              <div><code>Leff post</code><span>{stability.profile.effectiveLengthFactorPost.toFixed(2)} × L</span><span>Leff rail</span><b>{stability.profile.effectiveLengthFactorRail.toFixed(2)} × L</b></div>
              <div><code>2nd order</code><span>warn {(stability.profile.secondOrderWarningRatio * 100).toFixed(0)}%</span><span>block {(stability.profile.secondOrderFailureRatio * 100).toFixed(0)}%</span><b>NEd/Ncr</b></div>
            </div>
            <p className={styles.small}>Manufacturing route, actual buckling curve, restraints, effective lengths and joint stiffness remain project parameters requiring structural-engineer confirmation.</p>
          </div>

          <div className={styles.card}>
            <h2>03 / Eurocode Engine</h2>
            <div className={styles.rows}>
              {eurocode.combinations.map((combo) => <div key={combo.id}><code>{combo.id}</code><span>{combo.limitState}</span><span>{combo.description}</span><b>{combo.terms.map((t) => `${t.factor}×${t.loadCase}`).join(" + ")}</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>04 / Cross-section utilization</h2>
            <div className={styles.rows}>
              {governingRows.map((m) => <div key={m.memberId} className={styles[`row${m.heat}`]}><code>{m.memberId}</code><span>{m.sectionCode}</span><span>{m.governingCombination}</span><b>{(m.utilization * 100).toFixed(0)}%</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>05 / Auto-size by member role</h2>
            <div className={styles.rows}>
              {eurocode.sizing.map((s) => <div key={s.memberType}><code>{s.memberType}</code><span>{s.currentSectionCode}</span><span>→ {s.recommendedSectionCode ?? "none"}</span><b>{s.status}</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>06 / GF Frame 3D</h2>
            <div className={styles.rows}>
              {frame3d.cases.map((c) => <div key={c.loadCase}><code>{c.loadCase}</code><span>{frame3d.solver}</span><span>{c.maxDisplacementMm.toFixed(2)} mm</span><b>{c.maxMomentKnM.toFixed(2)} kNm</b></div>)}
            </div>
          </div>
        </section>

        <section>
          <div className={styles.card}>
            <h2>07 / Engineer Gate</h2>
            <div className={`${styles.gate} ${gate.releaseStatus === "BLOCKED" ? styles.block : styles.warn}`}>{gate.releaseStatus}</div>
            <div className={styles.checks}>
              {gate.checks.map((check) => <div key={check.id}><strong>{check.status}</strong><p><b>{check.label}</b><br />{check.note}</p></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>08 / SLS</h2>
            <div className={styles.slsMeter}><span style={{ width: `${Math.min(100, eurocode.serviceability.utilization * 100)}%` }} /></div>
            <p className={styles.small}>{eurocode.serviceability.governingCombination}: {eurocode.serviceability.maxDisplacementMm.toFixed(1)} mm / limit {eurocode.serviceability.limitMm.toFixed(1)} mm — {eurocode.serviceability.status}.</p>
          </div>

          <div className={styles.card}>
            <h2>09 / Cut list</h2>
            <div className={styles.rows}>
              {fabrication.cutList.slice(0, 10).map((item) => <div key={item.mark}><code>{item.mark}</code><span>{item.sectionCode}</span><span>{item.lengthMm} mm × {item.quantity}</span><b>{item.estimatedWeightKg ?? "–"} kg</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>10 / Base plate P001</h2>
            {plate && <>
              <div className={styles.plate}>
                {plate.holes.map((hole, i) => <span key={i} className={styles.hole} style={{ left: `${50 + (hole.xMm / plate.widthMm) * 100}%`, top: `${50 + (hole.yMm / plate.lengthMm) * 100}%` }} />)}
              </div>
              <p className={styles.small}>{plate.widthMm} × {plate.lengthMm} × {plate.thicknessMm} mm / {plate.quantity} pcs / holes Ø{plate.holes[0]?.diameterMm ?? 0} mm</p>
            </>}
          </div>

          <div className={styles.card}>
            <h2>11 / Global reactions</h2>
            <div className={styles.rows}>
              {frame3d.cases[0]?.reactions.slice(0, 8).map((r) => <div key={r.nodeId}><code>{r.nodeId}</code><span>Fx {r.fxKn.toFixed(2)} kN</span><span>Fy {r.fyKn.toFixed(2)} kN</span><b>My {r.myKnM.toFixed(2)}</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>12 / Legacy optimizer cross-check</h2>
            <p className={styles.small}>Current: {optimization.current.sectionCode}. Recommendation: {optimization.recommended?.sectionCode ?? "none"}. Estimated post steel saving: {optimization.estimatedPostSteelSavingKg.toFixed(0)} kg.</p>
          </div>

          <div className={styles.warning}>GF Stability Engine v0.7 remains a pre-design screening layer. Section classification uses idealized hollow-section geometry; buckling curves/effective lengths must be confirmed; second-order response is an Euler amplification screen rather than nonlinear global P-Delta; LTB, imperfections, Class 4 effective sections, detailed connection/anchor/foundation checks and independent structural-engineer approval remain mandatory before fabrication or construction release.</div>
        </section>
      </div>
    </main>
  );
}
