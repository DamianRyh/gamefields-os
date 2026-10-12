"use client";

import { useMemo, useState } from "react";
import styles from "./engineering.module.css";
import {
  COURT_PRESETS,
  RHS_SECTIONS,
  type CourtEngineeringInput,
  type CourtPresetId,
  estimateCourtStructure,
} from "./domain";
import { generateRectangularCourtModel } from "./model";
import {
  DEFAULT_ANALYSIS_INPUT,
  analyzePreliminaryStructure,
  type StructuralAnalysisInput,
} from "./analysis";

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function EngineeringPage() {
  const [input, setInput] = useState<CourtEngineeringInput>(COURT_PRESETS["GF-3V3-15X10"]);
  const [analysisInput, setAnalysisInput] = useState<StructuralAnalysisInput>(DEFAULT_ANALYSIS_INPUT);
  const estimate = useMemo(() => estimateCourtStructure(input), [input]);
  const model = useMemo(() => generateRectangularCourtModel(input), [input]);
  const analysis = useMemo(
    () => analyzePreliminaryStructure(input, model, analysisInput),
    [input, model, analysisInput],
  );

  function set<K extends keyof CourtEngineeringInput>(key: K, value: CourtEngineeringInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function setAnalysis<K extends keyof StructuralAnalysisInput>(key: K, value: StructuralAnalysisInput[K]) {
    setAnalysisInput((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(id: CourtPresetId) {
    setInput({ ...COURT_PRESETS[id] });
  }

  const maxX = Math.max(1, model.meta.lengthM);
  const maxY = Math.max(1, model.meta.widthM);
  const planMembers = model.members.filter((member) => member.type === "rail").slice(0, model.members.length);
  const nodeById = new Map(model.nodes.map((node) => [node.id, node]));

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v0.2</span>
          <h1>Structural Court Engine</h1>
          <p>
            Parametric steel-court model with preliminary load cases, member screening and fabrication-oriented geometry.
          </p>
        </div>
        <div className={styles.status}>PRE-DESIGN</div>
      </header>

      <section className={styles.presets}>
        {(Object.keys(COURT_PRESETS) as CourtPresetId[]).map((id) => (
          <button
            key={id}
            className={input.presetId === id ? styles.presetActive : styles.preset}
            onClick={() => applyPreset(id)}
          >
            {id}
          </button>
        ))}
      </section>

      <div className={styles.grid}>
        <section className={styles.panel}>
          <div className={styles.panelTitle}>01 / GEOMETRY</div>
          <div className={styles.formGrid}>
            <label>Length [m]<input value={input.lengthM} type="number" step="0.5" onChange={(e) => set("lengthM", numberValue(e.target.value, input.lengthM))} /></label>
            <label>Width [m]<input value={input.widthM} type="number" step="0.5" onChange={(e) => set("widthM", numberValue(e.target.value, input.widthM))} /></label>
            <label>Board height [m]<input value={input.boardHeightM} type="number" step="0.1" onChange={(e) => set("boardHeightM", numberValue(e.target.value, input.boardHeightM))} /></label>
            <label>Ball-stop above boards [m]<input value={input.netHeightM} type="number" step="0.5" onChange={(e) => set("netHeightM", numberValue(e.target.value, input.netHeightM))} /></label>
            <label>Post spacing [m]<input value={input.postSpacingM} type="number" step="0.25" onChange={(e) => set("postSpacingM", numberValue(e.target.value, input.postSpacingM))} /></label>
            <label>Steel grade<select value={input.steelGrade} onChange={(e) => set("steelGrade", e.target.value as CourtEngineeringInput["steelGrade"])}><option>S235</option><option>S275</option><option>S355</option></select></label>
          </div>

          <div className={styles.panelTitle}>02 / SECTIONS</div>
          <div className={styles.formGrid}>
            <label>Posts<select value={input.postSectionCode} onChange={(e) => set("postSectionCode", e.target.value)}>{RHS_SECTIONS.map((section) => <option key={section.code}>{section.code}</option>)}</select></label>
            <label>Rails<select value={input.railSectionCode} onChange={(e) => set("railSectionCode", e.target.value)}>{RHS_SECTIONS.map((section) => <option key={section.code}>{section.code}</option>)}</select></label>
            <label>Gates<input value={input.gateCount} type="number" min="0" onChange={(e) => set("gateCount", numberValue(e.target.value, input.gateCount))} /></label>
            <label>Goals<input value={input.goalCount} type="number" min="0" onChange={(e) => set("goalCount", numberValue(e.target.value, input.goalCount))} /></label>
          </div>

          <div className={styles.panelTitle}>03 / LOAD ASSUMPTIONS</div>
          <div className={styles.formGrid}>
            <label>Wind pressure [kPa]<input value={analysisInput.windPressureKpa} type="number" min="0" step="0.05" onChange={(e) => setAnalysis("windPressureKpa", numberValue(e.target.value, analysisInput.windPressureKpa))} /></label>
            <label>Net solidity [0–1]<input value={analysisInput.netSolidity} type="number" min="0" max="1" step="0.05" onChange={(e) => setAnalysis("netSolidity", numberValue(e.target.value, analysisInput.netSolidity))} /></label>
            <label>Impact load [kN]<input value={analysisInput.impactLoadKn} type="number" min="0" step="0.1" onChange={(e) => setAnalysis("impactLoadKn", numberValue(e.target.value, analysisInput.impactLoadKn))} /></label>
            <label>SLS limit H /<input value={analysisInput.serviceabilityLimitRatio} type="number" min="1" step="10" onChange={(e) => setAnalysis("serviceabilityLimitRatio", numberValue(e.target.value, analysisInput.serviceabilityLimitRatio))} /></label>
          </div>
        </section>

        <section className={styles.results}>
          <div className={styles.preview}>
            <div className={styles.previewMeta}>GENERATED STRUCTURAL PLAN</div>
            <div className={styles.modelCanvas} style={{ aspectRatio: `${maxX} / ${maxY}` }}>
              <svg viewBox={`0 0 ${maxX} ${maxY}`} preserveAspectRatio="none" aria-label="Structural plan">
                {planMembers.map((member) => {
                  const a = nodeById.get(member.startNodeId);
                  const b = nodeById.get(member.endNodeId);
                  if (!a || !b || Math.abs(a.z - input.boardHeightM) > 0.001) return null;
                  return <line key={member.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} vectorEffect="non-scaling-stroke" />;
                })}
                {model.nodes.filter((node) => node.z === 0).map((node) => <circle key={node.id} cx={node.x} cy={node.y} r="0.09" vectorEffect="non-scaling-stroke" />)}
              </svg>
              <div className={styles.modelLabel}>{input.lengthM} × {input.widthM} m / H {model.meta.totalHeightM} m</div>
            </div>
          </div>

          <div className={styles.metrics}>
            <article><span>Nodes</span><strong>{model.nodes.length}</strong></article>
            <article><span>Members</span><strong>{model.members.length}</strong></article>
            <article><span>Steel</span><strong>{Math.round(estimate.estimatedSteelKg)} kg</strong></article>
            <article><span>Posts</span><strong>{estimate.postCount}</strong></article>
          </div>

          <div className={styles.analysisCard}>
            <div className={styles.analysisHead}>
              <div><span className={styles.panelTitle}>04 / STRUCTURAL SCREEN</span><h2>{analysis.postCheck.governingStatus}</h2></div>
              <div className={analysis.postCheck.governingStatus === "OK" ? styles.okBadge : styles.failBadge}>{Math.round(analysis.postCheck.utilization * 100)}% ULS</div>
            </div>
            <div className={styles.checkGrid}>
              <div><span>Post</span><b>{analysis.postCheck.sectionCode}</b></div>
              <div><span>Resistance</span><b>{analysis.postCheck.resistanceKnM.toFixed(2)} kNm</b></div>
              <div><span>Governing MEd</span><b>{analysis.postCheck.governingMomentKnM.toFixed(2)} kNm</b></div>
              <div><span>Deflection</span><b>{analysis.postCheck.characteristicDeflectionMm.toFixed(1)} / {analysis.postCheck.deflectionLimitMm.toFixed(1)} mm</b></div>
            </div>
            <div className={styles.loadRows}>
              {analysis.loadCases.map((loadCase) => (
                <div key={loadCase.id}><span>{loadCase.id} — {loadCase.label}</span><b>{loadCase.designMomentKnM.toFixed(2)} kNm</b></div>
              ))}
            </div>
          </div>

          <div className={styles.bom}>
            <div className={styles.panelTitle}>05 / PRELIMINARY BOM</div>
            {estimate.bom.map((line) => (
              <div className={styles.bomLine} key={line.id}>
                <div><strong>{line.name}</strong><span>{line.section ?? "Assembly allowance"}</span></div>
                <div className={styles.bomNumbers}>{line.quantity} {line.unit}<br /><b>{line.totalWeightKg ?? 0} kg</b></div>
              </div>
            ))}
          </div>

          <div className={styles.memberTable}>
            <div className={styles.panelTitle}>06 / MEMBER REGISTER</div>
            {model.members.slice(0, 12).map((member) => <div key={member.id}><code>{member.id}</code><span>{member.type}</span><span>{member.startNodeId} → {member.endNodeId}</span><span>{member.sectionCode}</span><b>{member.lengthM.toFixed(2)} m</b></div>)}
            {model.members.length > 12 && <p>+ {model.members.length - 12} additional generated members</p>}
          </div>

          <div className={styles.warning}>
            <strong>PRE-DESIGN ONLY — NOT A STRUCTURAL APPROVAL</strong>
            <p>{analysis.limitations.join(" ")}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
