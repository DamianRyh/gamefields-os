"use client";

import { useMemo, useState } from "react";
import styles from "./production.module.css";
import { COURT_PRESETS, estimateCourtStructure, type CourtPresetId } from "../domain";
import { generateRectangularCourtModel } from "../model";
import { DEFAULT_ANALYSIS_INPUT, analyzePreliminaryStructure } from "../analysis";
import { solvePreliminaryPostFEM } from "../solver";
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
    const name = match?.[1] ?? `${presetId}-${kind}.${kind === "package" ? "json" : "txt"}`;
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
          <span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v0.4</span>
          <h1>Engineering → Production</h1>
          <p>Internal FEM solver, fabrication register, CAD exports, support reactions and engineer review gate for Gamefields court structures.</p>
        </div>
        <div className={styles.badge}>PRE-DESIGN / ENGINEER REVIEW</div>
      </header>

      <div className={styles.presetRow}>
        {(Object.keys(COURT_PRESETS) as CourtPresetId[]).map((id) => (
          <button key={id} className={id === presetId ? styles.active : styles.button} onClick={() => setPresetId(id)}>{id}</button>
        ))}
      </div>

      <section className={styles.hero}>
        <div className={styles.metric}><span>FEM GOVERNING</span><b>{solver.envelope.governingCase}</b></div>
        <div className={styles.metric}><span>SUPPORT M</span><b>{solver.envelope.maxCharacteristicSupportMomentKnM.toFixed(2)} kNm</b></div>
        <div className={styles.metric}><span>TIP / MAX DISP.</span><b>{solver.envelope.maxCharacteristicDisplacementMm.toFixed(1)} mm</b></div>
        <div className={styles.metric}><span>STEEL</span><b>{Math.round(estimate.estimatedSteelKg)} kg</b></div>
      </section>

      <div className={styles.exports}>
        {EXPORTS.map(([kind, label]) => <button key={kind} className={styles.export} onClick={() => downloadExport(kind)}>{label}</button>)}
      </div>

      <div className={styles.grid}>
        <section>
          <div className={styles.card}>
            <h2>01 / GF Solver</h2>
            <div className={styles.rows}>
              {solver.cases.map((c) => <div key={c.id}><code>{c.id}</code><span>{solver.method}</span><span>{c.maxDisplacementMm.toFixed(2)} mm</span><b>{c.supportReaction.momentKnM.toFixed(2)} kNm</b></div>)}
            </div>
            <p className={styles.small}>Representative post FEM with Euler–Bernoulli beam elements. The global 3D frame remains a mandatory external/engineer verification before release.</p>
          </div>

          <div className={styles.card}>
            <h2>02 / Cut list</h2>
            <div className={styles.rows}>
              {fabrication.cutList.map((item) => <div key={item.mark}><code>{item.mark}</code><span>{item.sectionCode}</span><span>{item.lengthMm} mm × {item.quantity}</span><b>{item.estimatedWeightKg ?? "–"} kg</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>03 / Production hardware</h2>
            <div className={styles.rows}>
              {fabrication.bolts.map((b) => <div key={b.mark}><code>{b.mark}</code><span>{b.specification}</span><span>{b.assemblyCount} assemblies</span><b>{b.totalQuantity} pcs</b></div>)}
              {fabrication.welds.map((w) => <div key={w.mark}><code>{w.mark}</code><span>{w.joint}</span><span>a={w.nominalSizeMm} mm</span><b>{w.quantity}×</b></div>)}
            </div>
          </div>
        </section>

        <section>
          <div className={styles.card}>
            <h2>04 / Engineer Gate</h2>
            <div className={`${styles.gate} ${gate.releaseStatus === "BLOCKED" ? styles.block : styles.warn}`}>{gate.releaseStatus}</div>
            <div className={styles.checks}>
              {gate.checks.map((check) => <div key={check.id}><strong>{check.status}</strong><p><b>{check.label}</b><br />{check.note}</p></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>05 / Base plate P001</h2>
            {plate && <>
              <div className={styles.plate}>
                {plate.holes.map((hole, i) => <span key={i} className={styles.hole} style={{ left: `${50 + (hole.xMm / plate.widthMm) * 100}%`, top: `${50 + (hole.yMm / plate.lengthMm) * 100}%` }} />)}
              </div>
              <p className={styles.small}>{plate.widthMm} × {plate.lengthMm} × {plate.thicknessMm} mm / {plate.quantity} pcs / holes Ø{plate.holes[0]?.diameterMm ?? 0} mm</p>
            </>}
          </div>

          <div className={styles.card}>
            <h2>06 / Reactions</h2>
            <div className={styles.rows}>
              {fabrication.supportReactions.slice(0, 8).map((r) => <div key={r.supportNodeId}><code>{r.supportNodeId}</code><span>Fx/Fy {r.fxKn.toFixed(2)} kN</span><span>Fz {r.fzKn.toFixed(2)} kN</span><b>M {r.mxKnM.toFixed(2)}</b></div>)}
            </div>
          </div>

          <div className={styles.card}>
            <h2>07 / Optimizer</h2>
            <p className={styles.small}>Current: {optimization.current.sectionCode}. Recommendation: {optimization.recommended?.sectionCode ?? "none"}. Estimated post steel saving: {optimization.estimatedPostSteelSavingKg.toFixed(0)} kg.</p>
          </div>

          <div className={styles.warning}>No export from this screen is a fabrication or construction approval. DXF/STEP are coordination/reference outputs until connection design, anchors, foundation, project actions, National Annex and global frame analysis are verified and signed off by a qualified structural engineer.</div>
        </section>
      </div>
    </main>
  );
}
