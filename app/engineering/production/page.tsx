"use client";

import { useMemo, useState } from "react";
import styles from "./production.module.css";
import { COURT_PRESETS, estimateCourtStructure, type CourtPresetId } from "../domain";
import { generateRectangularCourtModel } from "../model";
import { DEFAULT_ANALYSIS_INPUT, analyzePreliminaryStructure } from "../analysis";
import { solvePreliminaryPostFEM } from "../solver";
import { solveGlobalFrame3D } from "../frame3d";
import { DEFAULT_EUROCODE_PROFILE, runEurocodeEngine } from "../eurocode";
import { optimizePostSection } from "../optimizer";
import { sizeBaseConnectionConcept } from "../foundation";
import { buildFabricationPackage } from "../fabrication";
import { runEngineerReviewGate } from "../engineer";

const EXPORTS = [
  ["cut_csv", "CUT LIST CSV"],
  ["member_csv", "MEMBERS CSV"],
  ["utilization_csv", "UTILIZATION CSV"],
  ["model_dxf", "MODEL DXF"],
  ["base_plate_dxf", "BASE PLATE DXF"],
  ["step_reference", "STEP REFERENCE"],
  ["solver_csv", "SOLVER CSV"],
  ["frame3d_json", "FRAME 3D JSON"],
  ["eurocode_json", "EUROCODE JSON"],
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
  const optimization = useMemo(() => optimizePostSection(input, assumptions), [input, assumptions]);
  const baseConnection = useMemo(() => sizeBaseConnectionConcept(input, analysis), [input, analysis]);
  const fabrication = useMemo(() => buildFabricationPackage({ input, estimate, model, analysis, solver, baseConnection }), [input, estimate, model, analysis, solver, baseConnection]);
  const gate = useMemo(() => runEngineerReviewGate({ analysis, solver, frame3d, eurocode, baseConnection, fabrication }), [analysis, solver, frame3d, eurocode, baseConnection, fabrication]);
  const governingRows = useMemo(() => [...eurocode.members].sort((a, b) => b.utilization - a.utilization).slice(0, 16), [eurocode]);

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
    const jsonExport = kind === "package" || kind === "frame3d_json" || kind === "eurocode_json";
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
          <span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v0.6</span>
          <h1>Engineering → Production</h1>
          <p>Global 3D frame solver, Eurocode pre-design combinations, member utilization, auto-sizing, fabrication register, CAD exports and engineer review gate.</p>
        </div>
        <div className={styles.badge}>PRE-DESIGN / ENGINEER REVIEW</div>
      </header>

      <div className={styles.presetRow}>
        {(Object.keys(COURT_PRESETS) as CourtPresetId[]).map((id) => (
          <button key={id} className={id === presetId ? styles.active : styles.button} onClick={() => setPresetId(id)}>{id}</button>
        ))}
      </div>

      <section className={styles.hero}>
        <div className={styles.metric}><span>ULS GOVERNING</span><b>{eurocode.summary.governingMemberId}</b></div>
        <div className={styles.metric}><span>MAX UTILIZATION</span><b>{(eurocode.summary.maxUtilization * 100).toFixed(0)}%</b></div>
        <div className={styles.metric}><span>SLS UTILIZATION</span><b>{(eurocode.summary.slsUtilization * 100).toFixed(0)}%</b></div>
        <div className={styles.metric}><span>FAILED MEMBERS</span><b>{eurocode.summary.failedMembers} / {eurocode.summary.checkedMembers}</b></div>
      </section>

      <div className={styles.exports}>
        {EXPORTS.map(([kind, label]) => <button key={kind} className={styles.export} onClick={() => downloadExport(kind)}>{label}</button>)}
      </div>

      <div className={styles.grid}>
        <section>
          <div className={styles.card}>
            <h2>01 / Eurocode Engine</h2>
            <div className={styles.rows}>
              {eurocode.combinations.map((combo) => <div key={combo.id}><code>{combo.id}</code><span>{combo.limitState}</span><span>{combo.description}</span><b>{combo.terms.map((t) => `${t.factor}×${t.loadCase}`).join(" + ")}</b></div>)}
            </div>
            <p className={styles.small}>{eurocode.profile.id} / γG {eurocode.profile.gammaG} / γQ {eurocode.profile.gammaQ} / γM0 {eurocode.profile.gammaM0}. Project-specific National Annex confirmation remains mandatory.</p>
          </div>

          <div className={styles.card}>
            <h2>02 / Utilization heatmap</h2>
            <div className={styles.heatLegend}><span className={styles.heatLow}>LOW</span><span className={styles.heatMedium}>MEDIUM</span><span className={styles.heatHigh}>HIGH</span><span className={styles.heatFail}>FAIL</span></div>
            <div className={styles.rows}>
              {governingRows.map((m) => <div key={m.memberId} className={styles[`row${m.heat}`]}><code>{m.memberId}</code><span>{m.sectionCode}</span><span>{m.governingCombination}</span><b>{(m.utilization * 100).toFixed(0)}%</b></div>)}
            </div>
            <p className={styles.small}>Screening uses elastic cross-section resistance and a conservative N + My + Mz interaction. Stability checks are still gated for engineer verification.</p>
          </div>

          <div className={styles.card}>
            <h2>03 / Auto-size by member role</h2>
            <div className={styles.rows}>
              {eurocode.sizing.map((s) => <div key={s.memberType}><code>{s.memberType}</code><span>{s.currentSectionCode}</span><span>→ {s.recommendedSectionCode ?? "none"}</span><b>{s.status}</b></div>)}
            </div>
            <p className={styles.small}>Recommendations target ≤90% elastic utilization. Every section change requires a fresh global 3D solve because stiffness and force distribution change.</p>
          </div>

          <div className={styles.card}>
            <h2>04 / GF Frame 3D</h2>
            <div className={styles.rows}>
              {frame3d.cases.map((c) => <div key={c.loadCase}><code>{c.loadCase}</code><span>{frame3d.solver}</span><span>{c.maxDisplacementMm.toFixed(2)} mm</span><b>{c.maxMomentKnM.toFixed(2)} kNm</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>05 / Cut list</h2>
            <div className={styles.rows}>
              {fabrication.cutList.map((item) => <div key={item.mark}><code>{item.mark}</code><span>{item.sectionCode}</span><span>{item.lengthMm} mm × {item.quantity}</span><b>{item.estimatedWeightKg ?? "–"} kg</b></div>)}
            </div>
          </div>
        </section>

        <section>
          <div className={styles.card}>
            <h2>06 / Engineer Gate</h2>
            <div className={`${styles.gate} ${gate.releaseStatus === "BLOCKED" ? styles.block : styles.warn}`}>{gate.releaseStatus}</div>
            <div className={styles.checks}>
              {gate.checks.map((check) => <div key={check.id}><strong>{check.status}</strong><p><b>{check.label}</b><br />{check.note}</p></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>07 / SLS</h2>
            <div className={styles.slsMeter}><span style={{ width: `${Math.min(100, eurocode.serviceability.utilization * 100)}%` }} /></div>
            <p className={styles.small}>{eurocode.serviceability.governingCombination}: {eurocode.serviceability.maxDisplacementMm.toFixed(1)} mm / limit {eurocode.serviceability.limitMm.toFixed(1)} mm — {eurocode.serviceability.status}.</p>
          </div>

          <div className={styles.card}>
            <h2>08 / Base plate P001</h2>
            {plate && <>
              <div className={styles.plate}>
                {plate.holes.map((hole, i) => <span key={i} className={styles.hole} style={{ left: `${50 + (hole.xMm / plate.widthMm) * 100}%`, top: `${50 + (hole.yMm / plate.lengthMm) * 100}%` }} />)}
              </div>
              <p className={styles.small}>{plate.widthMm} × {plate.lengthMm} × {plate.thicknessMm} mm / {plate.quantity} pcs / holes Ø{plate.holes[0]?.diameterMm ?? 0} mm</p>
            </>}
          </div>

          <div className={styles.card}>
            <h2>09 / Global reactions</h2>
            <div className={styles.rows}>
              {frame3d.cases[0]?.reactions.slice(0, 8).map((r) => <div key={r.nodeId}><code>{r.nodeId}</code><span>Fx {r.fxKn.toFixed(2)} kN</span><span>Fy {r.fyKn.toFixed(2)} kN</span><b>My {r.myKnM.toFixed(2)}</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>10 / Legacy optimizer cross-check</h2>
            <p className={styles.small}>Current: {optimization.current.sectionCode}. Recommendation: {optimization.recommended?.sectionCode ?? "none"}. Estimated post steel saving: {optimization.estimatedPostSteelSavingKg.toFixed(0)} kg.</p>
          </div>

          <div className={styles.warning}>GF Eurocode Engine v0.6 is a pre-design screening layer, not a signed structural design. It does not yet verify buckling, LTB, section classification, imperfections, second-order effects, detailed connections, anchors or foundations. Applicable National Annex, project actions, independent solver cross-check and qualified structural engineer approval remain mandatory before fabrication or construction release.</div>
        </section>
      </div>
    </main>
  );
}
