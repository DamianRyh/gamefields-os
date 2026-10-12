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

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function EngineeringPage() {
  const [input, setInput] = useState<CourtEngineeringInput>(COURT_PRESETS["GF-3V3-15X10"]);
  const estimate = useMemo(() => estimateCourtStructure(input), [input]);
  const model = useMemo(() => generateRectangularCourtModel(input), [input]);
  const postMembers = model.members.filter((member) => member.type === "post");
  const railMembers = model.members.filter((member) => member.type === "rail");

  function set<K extends keyof CourtEngineeringInput>(key: K, value: CourtEngineeringInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(id: CourtPresetId) {
    setInput({ ...COURT_PRESETS[id] });
  }

  const width = 720;
  const height = 420;
  const pad = 44;
  const scaleX = (width - pad * 2) / Math.max(input.lengthM, 1);
  const scaleY = (height - pad * 2) / Math.max(input.widthM, 1);
  const nodeById = new Map(model.nodes.map((node) => [node.id, node]));

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v0.2</span>
          <h1>Steel Court Generator</h1>
          <p>Parametric member model for Gamefields courts with node/member IDs, sections and preliminary BOM.</p>
        </div>
        <div className={styles.status}>PRELIMINARY</div>
      </header>

      <section className={styles.presets}>
        {(Object.keys(COURT_PRESETS) as CourtPresetId[]).map((id) => (
          <button key={id} className={input.presetId === id ? styles.presetActive : styles.preset} onClick={() => applyPreset(id)}>
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

          <div className={styles.modelStats}>
            <article><span>Nodes</span><strong>{model.nodes.length}</strong></article>
            <article><span>Members</span><strong>{model.members.length}</strong></article>
            <article><span>Post members</span><strong>{postMembers.length}</strong></article>
            <article><span>Rail members</span><strong>{railMembers.length}</strong></article>
          </div>
        </section>

        <section className={styles.results}>
          <div className={styles.preview}>
            <div className={styles.previewMeta}>STRUCTURAL TOP VIEW / MEMBER MODEL</div>
            <svg className={styles.structureSvg} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Structural top view">
              {model.members.filter((member) => member.type === "rail").map((member) => {
                const a = nodeById.get(member.startNodeId)!;
                const b = nodeById.get(member.endNodeId)!;
                if (a.z !== 0 || b.z !== 0) return null;
                return <line key={member.id} x1={pad + a.x * scaleX} y1={pad + a.y * scaleY} x2={pad + b.x * scaleX} y2={pad + b.y * scaleY} className={styles.memberLine} />;
              })}
              {model.nodes.filter((node) => node.z === 0).map((node) => (
                <g key={node.id}>
                  <circle cx={pad + node.x * scaleX} cy={pad + node.y * scaleY} r="4" className={styles.nodeDot} />
                  <text x={pad + node.x * scaleX + 7} y={pad + node.y * scaleY - 7} className={styles.nodeLabel}>{node.id}</text>
                </g>
              ))}
              <text x={pad} y={24} className={styles.dimensionLabel}>{input.lengthM} m</text>
              <text x={10} y={pad} className={styles.dimensionLabel}>{input.widthM} m</text>
            </svg>
          </div>

          <div className={styles.metrics}>
            <article><span>Perimeter</span><strong>{estimate.perimeterM.toFixed(1)} m</strong></article>
            <article><span>Base nodes</span><strong>{model.nodes.filter((node) => node.z === 0).length}</strong></article>
            <article><span>Steel</span><strong>{Math.round(estimate.estimatedSteelKg)} kg</strong></article>
            <article><span>Height</span><strong>{model.meta.totalHeightM.toFixed(1)} m</strong></article>
          </div>

          <div className={styles.bom}>
            <div className={styles.panelTitle}>03 / MEMBER SCHEDULE</div>
            {model.members.slice(0, 14).map((member) => (
              <div className={styles.bomLine} key={member.id}>
                <div><strong>{member.id} / {member.type.toUpperCase()}</strong><span>{member.startNodeId} → {member.endNodeId} · {member.sectionCode}</span></div>
                <div className={styles.bomNumbers}>{member.lengthM.toFixed(2)} m<br /><b>{member.steelGrade}</b></div>
              </div>
            ))}
            {model.members.length > 14 && <div className={styles.moreMembers}>+ {model.members.length - 14} additional members generated</div>}
          </div>

          <div className={styles.warning}>
            <strong>NOT A STRUCTURAL APPROVAL</strong>
            <p>The model now contains explicit nodes and members. Load cases, combinations, member checks, foundations, anchors, connections and Eurocode verification remain intentionally outside this preliminary layer.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
