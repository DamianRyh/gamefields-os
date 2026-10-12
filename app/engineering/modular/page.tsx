"use client";

import { useMemo, useState } from "react";
import styles from "./modular.module.css";

type Panel = {
  id: string;
  role: "panel" | "goal" | "gate";
  side?: "N" | "E" | "S" | "W";
  index: number;
  lengthM: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  angleDeg: number;
};

type Layout = {
  shape: "RECTANGLE" | "CIRCLE";
  requested: { lengthM?: number; widthM?: number; diameterM?: number };
  resolved: { lengthM?: number; widthM?: number; diameterM?: number };
  moduleWidthM: number;
  moduleCount: number;
  postsCount: number;
  perimeterM: number;
  panels: Panel[];
  notes: string[];
};

export default function ModularCourtPage() {
  const [shape, setShape] = useState<"RECTANGLE" | "CIRCLE">("RECTANGLE");
  const [lengthM, setLengthM] = useState(15);
  const [widthM, setWidthM] = useState(10);
  const [diameterM, setDiameterM] = useState(7);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/engineering/modular", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(shape === "CIRCLE" ? { shape, diameterM } : { shape, lengthM, widthM }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Generation failed");
      setLayout(data.layout);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  const view = useMemo(() => {
    if (!layout) return null;
    const pts = layout.panels.flatMap((p) => [p.start, p.end]);
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 1;
    return { minX: minX - pad, minY: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };
  }, [layout]);

  return <main className={styles.shell}>
    <header className={styles.header}>
      <span>GAMEFIELDS / MODULAR SYSTEM v1.0</span>
      <h1>Boisko, które rośnie modułami.</h1>
      <p>Zmiana wymiaru nie rozciąga konstrukcji. System dodaje albo usuwa prawdziwe segmenty produkcyjne i przelicza liczbę paneli, słupów oraz obwód.</p>
    </header>

    <section className={styles.controls}>
      <div className={styles.switcher}>
        <button className={shape === "RECTANGLE" ? styles.active : ""} onClick={() => setShape("RECTANGLE")}>3v3 / prostokąt</button>
        <button className={shape === "CIRCLE" ? styles.active : ""} onClick={() => setShape("CIRCLE")}>Panna / koło</button>
      </div>

      {shape === "RECTANGLE" ? <div className={styles.fields}>
        <label><span>Długość docelowa</span><input type="range" min="6" max="24" step="0.25" value={lengthM} onChange={(e) => setLengthM(Number(e.target.value))} /><b>{lengthM.toFixed(2)} m</b></label>
        <label><span>Szerokość docelowa</span><input type="range" min="4" max="16" step="0.25" value={widthM} onChange={(e) => setWidthM(Number(e.target.value))} /><b>{widthM.toFixed(2)} m</b></label>
      </div> : <div className={styles.fields}>
        <label><span>Średnica docelowa</span><input type="range" min="4" max="12" step="0.1" value={diameterM} onChange={(e) => setDiameterM(Number(e.target.value))} /><b>Ø {diameterM.toFixed(1)} m</b></label>
      </div>}

      <button className={styles.generate} onClick={generate} disabled={loading}>{loading ? "PRZELICZAM…" : "PRZEBUDUJ KONSTRUKCJĘ"}</button>
      {error && <p className={styles.error}>{error}</p>}
    </section>

    {layout && view && <>
      <section className={styles.metrics}>
        <div><span>MODUŁ</span><b>{layout.moduleWidthM.toFixed(2)} m</b></div>
        <div><span>SEGMENTY</span><b>{layout.moduleCount}</b></div>
        <div><span>SŁUPY</span><b>{layout.postsCount}</b></div>
        <div><span>OBWÓD</span><b>{layout.perimeterM.toFixed(1)} m</b></div>
      </section>

      <section className={styles.viewer}>
        <div className={styles.viewerTop}>
          <div><span>REQUESTED</span><b>{layout.shape === "RECTANGLE" ? `${layout.requested.lengthM} × ${layout.requested.widthM} m` : `Ø ${layout.requested.diameterM} m`}</b></div>
          <div><span>RESOLVED MODULAR SIZE</span><b>{layout.shape === "RECTANGLE" ? `${layout.resolved.lengthM} × ${layout.resolved.widthM} m` : `Ø ${layout.resolved.diameterM} m`}</b></div>
        </div>
        <svg viewBox={`${view.minX} ${view.minY} ${view.width} ${view.height}`} className={styles.svg} aria-label="Modular court layout">
          {layout.panels.map((panel) => <g key={panel.id}>
            <line x1={panel.start.x} y1={panel.start.y} x2={panel.end.x} y2={panel.end.y} vectorEffect="non-scaling-stroke" />
            <circle cx={panel.start.x} cy={panel.start.y} r="0.08" vectorEffect="non-scaling-stroke" />
          </g>)}
        </svg>
        <div className={styles.moduleStrip}>{layout.panels.map((panel) => <span key={panel.id}>{panel.id}</span>)}</div>
      </section>

      <section className={styles.notes}>
        <h2>Co dzieje się naprawdę</h2>
        {layout.notes.map((note) => <p key={note}>{note}</p>)}
      </section>
    </>}
  </main>;
}
