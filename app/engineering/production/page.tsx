"use client";

import { useMemo, useState } from "react";
import styles from "./production.module.css";
import { COURT_PRESETS, estimateCourtStructure, type CourtPresetId } from "../domain";
import { generateRectangularCourtModel } from "../model";
import { DEFAULT_ANALYSIS_INPUT, analyzePreliminaryStructure } from "../analysis";
import { solvePreliminaryPostFEM } from "../solver";
import { solveGlobalFrame3D } from "../frame3d";
import { optimizePostSection } from "../optimizer";
import { sizeBaseConnectionConcept } from "../foundation";
import { buildFabricationPackage } from "../fabrication";
import { runEngineerReviewGate } from "../engineer";

const EXPORTS = [
  ["cut_csv", "CUT LIST CSV"],
  ["member_csv", "MEMBERS CSV"],
  ["model_dxf", "MODEL DXF"],
  ["base_plate_dxf", "BASE PLATE DXF"],
  ["step_reference", "STEP REFERENCE"],
  ["solver_csv", "SOLVER CSV"],
  ["frame3d_json", "FRAME 3D JSON"],
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
  const frame3d = useMemo(() => solveGlobalFrame3D(input, model), [input, model]);
  const optimization = useMemo(() => optimizePostSection(input, assumptions), [input, assumptions]);
  const baseConnection = useMemo(() => sizeBaseConnectionConcept(input, analysis), [input, analysis]);
  const fabrication = useMemo(() => buildFabricationPackage({ input, estimate, model, analysis, solver, baseConnection }), [input, estimate, model, analysis, solver, baseConnection]);
  const gate = useMemo(() => runEngineerReviewGate({ analysis, solver, baseConnection, fabrication }), [analysis, solver, baseConnection, fabrication]);

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
    const name = match?.[1] ?? `${presetId}-${kind}.${kind === "package" || kind === "frame3d_json" ? "json" : "txt"}`;
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
          <span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v0.5</span>
          <h1>Engineering → Production</h1>
          <p>Global frame topology, FEM screening, fabrication register, CAD exports, support reactions and engineer review gate for Gamefields court structures.</p>
        </div>
        <div className={styles.badge}>PRE-DESIGN / ENGINEER REVIEW</div>
      </header>

      <div className={styles.presetRow}>
        {(Object.keys(COURT_PRESETS) as CourtPresetId[]).map((id) => (
          <button key={id} className={id === presetId ? styles.active : styles.button} onClick={() => setPresetId(id)}>{id}</button>
        ))}
      </div>

      <section className={styles.hero}>
        <div className={styles.metric}><span>FRAME 3D GOV.</span><b>{frame3d.envelope.governingMomentCase}</b></div>
        <div className={styles.metric}><span>FRAME 3D M</span><b>{frame3d.envelope.maxMomentKnM.toFixed(2)} kNm</b></div>
        <div className={styles.metric}><span>FRAME 3D DISP.</span><b>{frame3d.envelope.maxDisplacementMm.toFixed(1)} mm</b></div>
        <div className={styles.metric}><span>STEEL</span><b>{Math.round(estimate.estimatedSteelKg)} kg</b></div>
      </section>

      <div className={styles.exports}>
        {EXPORTS.map(([kind, label]) => <button key={kind} className={styles.export} onClick={() => downloadExport(kind)}>{label}</button>)}
      </div>

      <div className={styles.grid}>
        <section>
          <div className={styles.card}>
            <h2>01 / GF Frame 3D</h2>
            <div className={styles.rows}>
              {frame3d.cases.map((c) => <div key={c.loadCase}><code>{c.loadCase}</code><span>{frame3d.solver}</span><span>{c.maxDisplacementMm.toFixed(2)} mm</span><b>{c.maxMomentKnM.toFixed(2)} kNm</b></div>)}
            </div>
            <p className={styles.small}>Full court node/member topology with six DOF per node and global case envelopes. Numerical kernel remains an alpha equivalent-stiffness implementation and is intentionally blocked from construction release.</p>
          </div>

          <div className={styles.card}>
            <h2>02 / GF Post FEM cross-check</h2>
            <div className={styles.rows}>
              {solver.cases.map((c) => <div key={c.id}><code>{c.id}</code><span>{solver.method}</span><span>{c.maxDisplacementMm.toFixed(2)} mm</span><b>{c.supportReaction.momentKnM.toFixed(2)} kNm</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>03 / Cut list</h2>
            <div className={styles.rows}>
              {fabrication.cutList.map((item) => <div key={item.mark}><code>{item.mark}</code><span>{item.sectionCode}</span><span>{item.lengthMm} mm × {item.quantity}</span><b>{item.estimatedWeightKg ?? "–"} kg</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>04 / Production hardware</h2>
            <div className={styles.rows}>
              {fabrication.bolts.map((b) => <div key={b.mark}><code>{b.mark}</code><span>{b.specification}</span><span>{b.assemblyCount} assemblies</span><b>{b.totalQuantity} pcs</b></div>)}
              {fabrication.welds.map((w) => <div key={w.mark}><code>{w.mark}</code><span>{w.joint}</span><span>a={w.nominalSizeMm} mm</span><b>{w.quantity}×</b></div>)}
            </div>
          </div>
        </section>

        <section>
          <div className={styles.card}>
            <h2>05 / Engineer Gate</h2>
            <div className={`${styles.gate} ${gate.releaseStatus === "BLOCKED" ? styles.block : styles.warn}`}>{gate.releaseStatus}</div>
            <div className={styles.checks}>
              {gate.checks.map((check) => <div key={check.id}><strong>{check.status}</strong><p><b>{check.label}</b><br />{check.note}</p></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>06 / Base plate P001</h2>
            {plate && <>
              <div className={styles.plate}>
                {plate.holes.map((hole, i) => <span key={i} className={styles.hole} style={{ left: `${50 + (hole.xMm / plate.widthMm) * 100}%`, top: `${50 + (hole.yMm / plate.lengthMm) * 100}%` }} />)}
              </div>
              <p className={styles.small}>{plate.widthMm} × {plate.lengthMm} × {plate.thicknessMm} mm / {plate.quantity} pcs / holes Ø{plate.holes[0]?.diameterMm ?? 0} mm</p>
            </>}
          </div>

          <div className={styles.card}>
            <h2>07 / Global reactions</h2>
            <div className={styles.rows}>
              {frame3d.cases[0]?.reactions.slice(0, 8).map((r) => <div key={r.nodeId}><code>{r.nodeId}</code><span>Fx {r.fxKn.toFixed(2)} kN</span><span>Fy {r.fyKn.toFixed(2)} kN</span><b>My {r.myKnM.toFixed(2)}</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>08 / Optimizer</h2>
            <p className={styles.small}>Current: {optimization.current.sectionCode}. Recommendation: {optimization.recommended?.sectionCode ?? "none"}. Estimated post steel saving: {optimization.estimatedPostSteelSavingKg.toFixed(0)} kg.</p>
          </div>

          <div className={styles.warning}>GF Frame 3D v0.5 is a pre-design alpha. The model now covers the full court topology, but it is not yet a validated general-purpose 12×12 beam-element matrix solver. Independent solver verification, project-specific actions, National Annex, joint design, anchors, foundation and qualified engineer sign-off remain mandatory before fabrication or construction release.</div>
        </section>
      </div>
    </main>
  );
}
