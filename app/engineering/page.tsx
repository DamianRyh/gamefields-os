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

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function EngineeringPage() {
  const [input, setInput] = useState<CourtEngineeringInput>(COURT_PRESETS["GF-3V3-15X10"]);
  const estimate = useMemo(() => estimateCourtStructure(input), [input]);

  function set<K extends keyof CourtEngineeringInput>(key: K, value: CourtEngineeringInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(id: CourtPresetId) {
    setInput({ ...COURT_PRESETS[id] });
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v0.1</span>
          <h1>Steel Court Generator</h1>
          <p>
            Parametric construction model for Gamefields courts. This release estimates geometry, steel quantity and a first BOM.
          </p>
        </div>
        <div className={styles.status}>PRELIMINARY</div>
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
            <label>
              Length [m]
              <input value={input.lengthM} type="number" step="0.5" onChange={(e) => set("lengthM", numberValue(e.target.value, input.lengthM))} />
            </label>
            <label>
              Width [m]
              <input value={input.widthM} type="number" step="0.5" onChange={(e) => set("widthM", numberValue(e.target.value, input.widthM))} />
            </label>
            <label>
              Board height [m]
              <input value={input.boardHeightM} type="number" step="0.1" onChange={(e) => set("boardHeightM", numberValue(e.target.value, input.boardHeightM))} />
            </label>
            <label>
              Ball-stop above boards [m]
              <input value={input.netHeightM} type="number" step="0.5" onChange={(e) => set("netHeightM", numberValue(e.target.value, input.netHeightM))} />
            </label>
            <label>
              Post spacing [m]
              <input value={input.postSpacingM} type="number" step="0.25" onChange={(e) => set("postSpacingM", numberValue(e.target.value, input.postSpacingM))} />
            </label>
            <label>
              Steel grade
              <select value={input.steelGrade} onChange={(e) => set("steelGrade", e.target.value as CourtEngineeringInput["steelGrade"])}>
                <option>S235</option>
                <option>S275</option>
                <option>S355</option>
              </select>
            </label>
          </div>

          <div className={styles.panelTitle}>02 / SECTIONS</div>
          <div className={styles.formGrid}>
            <label>
              Posts
              <select value={input.postSectionCode} onChange={(e) => set("postSectionCode", e.target.value)}>
                {RHS_SECTIONS.map((section) => <option key={section.code}>{section.code}</option>)}
              </select>
            </label>
            <label>
              Rails
              <select value={input.railSectionCode} onChange={(e) => set("railSectionCode", e.target.value)}>
                {RHS_SECTIONS.map((section) => <option key={section.code}>{section.code}</option>)}
              </select>
            </label>
            <label>
              Gates
              <input value={input.gateCount} type="number" min="0" onChange={(e) => set("gateCount", numberValue(e.target.value, input.gateCount))} />
            </label>
            <label>
              Goals
              <input value={input.goalCount} type="number" min="0" onChange={(e) => set("goalCount", numberValue(e.target.value, input.goalCount))} />
            </label>
          </div>
        </section>

        <section className={styles.results}>
          <div className={styles.preview}>
            <div className={styles.previewMeta}>PARAMETRIC ENVELOPE</div>
            <div className={styles.courtWrap}>
              <div
                className={styles.court}
                style={{ aspectRatio: `${Math.max(input.lengthM, 1)} / ${Math.max(input.widthM, 1)}` }}
              >
                <span>{input.lengthM} × {input.widthM} m</span>
              </div>
            </div>
          </div>

          <div className={styles.metrics}>
            <article><span>Perimeter</span><strong>{estimate.perimeterM.toFixed(1)} m</strong></article>
            <article><span>Posts</span><strong>{estimate.postCount}</strong></article>
            <article><span>Steel</span><strong>{Math.round(estimate.estimatedSteelKg)} kg</strong></article>
            <article><span>Coating area</span><strong>{estimate.estimatedCoatingAreaM2.toFixed(1)} m²</strong></article>
          </div>

          <div className={styles.bom}>
            <div className={styles.panelTitle}>03 / PRELIMINARY BOM</div>
            {estimate.bom.map((line) => (
              <div className={styles.bomLine} key={line.id}>
                <div><strong>{line.name}</strong><span>{line.section ?? "Assembly allowance"}</span></div>
                <div className={styles.bomNumbers}>{line.quantity} {line.unit}<br /><b>{line.totalWeightKg ?? 0} kg</b></div>
              </div>
            ))}
          </div>

          <div className={styles.warning}>
            <strong>NOT A STRUCTURAL APPROVAL</strong>
            <p>{estimate.warnings[0]} Wind, impact, crowd loads, foundations, anchors and connections will be added to the verification engine.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
