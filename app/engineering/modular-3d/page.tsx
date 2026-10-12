"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./modular-3d.module.css";

type ComponentType = "PANEL_STANDARD" | "PANEL_BRANDING" | "GOAL_MODULE" | "GATE_MODULE" | "POST_STANDARD" | "CORNER_STANDARD" | "BALLSTOP_PANEL";
type SceneInstance = {
  id: string;
  component: ComponentType;
  assetKey: string;
  position: { x: number; y: number; z: number };
  rotationDeg: { x: number; y: number; z: number };
  dimensionsM?: { x: number; y: number; z: number };
};
type BomLine = { id: string; name: string; assetKey: string; quantity: number; unit: "pcs" | "m2"; totalBudgetPln: number };
type ModularResponse = {
  layout: {
    shape: "RECTANGLE" | "CIRCLE";
    resolved: { lengthM?: number; widthM?: number; diameterM?: number };
    moduleWidthM: number;
    productOptions: { goalCount: number; gateCount: number; brandingPanelCount: number; ballStopHeightM: number };
  };
  structuralModel: { nodes: unknown[]; members: unknown[] };
  scene3d: { schema: string; instances: SceneInstance[] };
  productSummary: { totalBudgetNetPln: number; sourceStatus: string; bom: BomLine[]; warnings: string[] };
};

const PX_PER_M = 34;
const money = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });

export default function Modular3DPage() {
  const [shape, setShape] = useState<"RECTANGLE" | "CIRCLE">("RECTANGLE");
  const [lengthM, setLengthM] = useState(15);
  const [widthM, setWidthM] = useState(10);
  const [diameterM, setDiameterM] = useState(7);
  const [goalCount, setGoalCount] = useState(2);
  const [gateCount, setGateCount] = useState(1);
  const [brandingPanelCount, setBrandingPanelCount] = useState(4);
  const [ballStopHeightM, setBallStopHeightM] = useState(3);
  const [data, setData] = useState<ModularResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [yaw, setYaw] = useState(-28);
  const [pitch, setPitch] = useState(58);
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  const generate = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/engineering/modular", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shape, lengthM, widthM, diameterM, goalCount, gateCount, brandingPanelCount, ballStopHeightM: shape === "CIRCLE" ? 0 : ballStopHeightM }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error ?? "Nie udało się wygenerować modelu");
      setData(json);
    } catch (e) { setError(e instanceof Error ? e.message : "Nie udało się wygenerować modelu"); }
    finally { setLoading(false); }
  }, [shape, lengthM, widthM, diameterM, goalCount, gateCount, brandingPanelCount, ballStopHeightM]);

  useEffect(() => { void generate(); }, [generate]);

  const bounds = useMemo(() => {
    if (!data || data.scene3d.instances.length === 0) return { cx: 0, cy: 0, size: 18 };
    const xs = data.scene3d.instances.map((i) => i.position.x);
    const ys = data.scene3d.instances.map((i) => i.position.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, size: Math.max(maxX - minX, maxY - minY, 8) };
  }, [data]);

  const count = (component: ComponentType) => data?.scene3d.instances.filter((i) => i.component === component).length ?? 0;
  const productModules = count("PANEL_STANDARD") + count("PANEL_BRANDING") + count("GOAL_MODULE") + count("GATE_MODULE");
  function pointerDown(event: React.PointerEvent<HTMLDivElement>) { drag.current = { x: event.clientX, y: event.clientY, yaw, pitch }; event.currentTarget.setPointerCapture(event.pointerId); }
  function pointerMove(event: React.PointerEvent<HTMLDivElement>) { if (!drag.current) return; setYaw(drag.current.yaw + (event.clientX - drag.current.x) * .35); setPitch(Math.max(25, Math.min(78, drag.current.pitch - (event.clientY - drag.current.y) * .25))); }
  function pointerUp() { drag.current = null; }
  function wheel(event: React.WheelEvent<HTMLDivElement>) { event.preventDefault(); setZoom((z) => Math.max(.55, Math.min(1.7, z - event.deltaY * .001))); }

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><span>GAMEFIELDS / MODULAR PRODUCT v1.2</span><h1>Boisko jako produkt modułowy.</h1></div>
      <p>Wymiar, bramki, wejście, branding i piłkochwyt składają się z osobnych komponentów. Każda zmiana przebudowuje 3D, BOM, model konstrukcyjny i budżet.</p>
    </header>

    <section className={styles.layout}>
      <aside className={styles.controls}>
        <div className={styles.segmented}><button className={shape === "RECTANGLE" ? styles.active : ""} onClick={() => { setShape("RECTANGLE"); setBallStopHeightM(3); }}>3v3</button><button className={shape === "CIRCLE" ? styles.active : ""} onClick={() => { setShape("CIRCLE"); setBallStopHeightM(0); }}>Panna</button></div>
        {shape === "RECTANGLE" ? <>
          <label><span>Długość</span><b>{lengthM.toFixed(2)} m</b><input type="range" min="6" max="24" step="0.25" value={lengthM} onChange={(e) => setLengthM(Number(e.target.value))} /></label>
          <label><span>Szerokość</span><b>{widthM.toFixed(2)} m</b><input type="range" min="4" max="16" step="0.25" value={widthM} onChange={(e) => setWidthM(Number(e.target.value))} /></label>
        </> : <label><span>Średnica</span><b>Ø {diameterM.toFixed(1)} m</b><input type="range" min="4" max="12" step="0.1" value={diameterM} onChange={(e) => setDiameterM(Number(e.target.value))} /></label>}

        <div className={styles.productControls}>
          <span>MODUŁY PRODUKTU</span>
          <label><span>Bramki</span><b>{goalCount}</b><input type="range" min="0" max="2" step="1" value={goalCount} onChange={(e) => setGoalCount(Number(e.target.value))} /></label>
          <label><span>Wejścia</span><b>{gateCount}</b><input type="range" min="0" max="2" step="1" value={gateCount} onChange={(e) => setGateCount(Number(e.target.value))} /></label>
          <label><span>Branding</span><b>{brandingPanelCount}</b><input type="range" min="0" max="12" step="1" value={brandingPanelCount} onChange={(e) => setBrandingPanelCount(Number(e.target.value))} /></label>
          {shape === "RECTANGLE" && <label><span>Piłkochwyt</span><b>{ballStopHeightM.toFixed(1)} m</b><input type="range" min="0" max="5" step=".5" value={ballStopHeightM} onChange={(e) => setBallStopHeightM(Number(e.target.value))} /></label>}
        </div>

        <div className={styles.cameraControls}><span>KAMERA</span><button onClick={() => { setYaw(-28); setPitch(58); setZoom(1); }}>RESET</button></div>
        <div className={styles.metrics}>
          <div><span>MODUŁY</span><b>{productModules}</b></div><div><span>SŁUPY</span><b>{count("POST_STANDARD")}</b></div>
          <div><span>BRAMKI</span><b>{count("GOAL_MODULE")}</b></div><div><span>WEJŚCIA</span><b>{count("GATE_MODULE")}</b></div>
        </div>
        {data && <div className={styles.resolved}><span>WYMIAR MODUŁOWY</span><b>{data.layout.shape === "RECTANGLE" ? `${data.layout.resolved.lengthM} × ${data.layout.resolved.widthM} m` : `Ø ${data.layout.resolved.diameterM} m`}</b><small>moduł bazowy {data.layout.moduleWidthM.toFixed(2)} m</small></div>}
        {data && <div className={styles.liveCost}><span>LIVE BUDGET / NETTO</span><b>{money.format(data.productSummary.totalBudgetNetPln)} zł</b><small>{data.productSummary.sourceStatus === "BUDGETARY_DEFAULT" ? "stawki budżetowe — do podmiany na cennik Gamefields" : "stawki potwierdzone"}</small></div>}
        <p className={styles.tip}>Przeciągnij model, aby obracać. Kółko myszy zmienia zoom.</p>{loading && <p className={styles.status}>Przebudowuję produkt…</p>}{error && <p className={styles.error}>{error}</p>}
      </aside>

      <section className={styles.viewerWrap}>
        <div className={styles.viewerHead}><span>LIVE MODULAR ASSEMBLY</span><b>{data?.scene3d.schema ?? "GF-MODULAR-3D-1.2"}</b></div>
        <div className={styles.viewer} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={wheel}>
          <div className={styles.horizon} />
          <div className={styles.scene} style={{ transform: `translate(-50%, -50%) scale(${zoom}) rotateX(${pitch}deg) rotateZ(${yaw}deg)` }}>
            <div className={styles.floor} style={{ width: `${Math.max(bounds.size + 5, 16) * PX_PER_M}px`, height: `${Math.max(bounds.size + 5, 16) * PX_PER_M}px`, transform: `translate3d(${(-bounds.cx - Math.max(bounds.size + 5, 16) / 2) * PX_PER_M}px, ${(-bounds.cy - Math.max(bounds.size + 5, 16) / 2) * PX_PER_M}px, 0)` }} />
            {data?.scene3d.instances.map((instance) => {
              const d = instance.dimensionsM ?? { x: .1, y: .1, z: 1 };
              const x = (instance.position.x - bounds.cx) * PX_PER_M, y = (instance.position.y - bounds.cy) * PX_PER_M, z = instance.position.z * PX_PER_M;
              if (instance.component === "POST_STANDARD" || instance.component === "CORNER_STANDARD") return <div key={instance.id} className={`${styles.post} ${instance.component === "CORNER_STANDARD" ? styles.corner : ""}`} style={{ width: `${Math.max(3, d.x * PX_PER_M)}px`, height: `${Math.max(3, d.y * PX_PER_M)}px`, transform: `translate3d(${x}px, ${y}px, ${z}px)`, ['--postH' as string]: `${d.z * PX_PER_M}px` }} />;
              if (instance.component === "BALLSTOP_PANEL") return <div key={instance.id} className={styles.ballstop} style={{ width: `${d.x * PX_PER_M}px`, height: `${d.y * PX_PER_M}px`, transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${instance.rotationDeg.z}deg)`, ['--panelH' as string]: `${d.z * PX_PER_M}px` }} />;
              const specialClass = instance.component === "GOAL_MODULE" ? styles.goal : instance.component === "GATE_MODULE" ? styles.gate : instance.component === "PANEL_BRANDING" ? styles.branding : "";
              return <div key={instance.id} className={`${styles.panel} ${specialClass}`} style={{ width: `${d.x * PX_PER_M}px`, height: `${d.y * PX_PER_M}px`, transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${instance.rotationDeg.z}deg)`, ['--panelH' as string]: `${d.z * PX_PER_M}px` }}><span /></div>;
            })}
          </div>
          <div className={styles.viewerCaption}><span>{shape === "RECTANGLE" ? "GF 3v3 MODULAR PRODUCT" : "GF PANNA MODULAR PRODUCT"}</span><b>{productModules} modułów / {count("POST_STANDARD")} słupów</b></div>
        </div>

        {data && <section className={styles.bom}><div className={styles.bomHead}><span>LIVE BOM</span><b>{money.format(data.productSummary.totalBudgetNetPln)} zł netto</b></div>{data.productSummary.bom.map((line) => <div className={styles.bomRow} key={line.id}><div><b>{line.name}</b><small>{line.assetKey}</small></div><span>{line.quantity} {line.unit}</span><strong>{money.format(line.totalBudgetPln)} zł</strong></div>)}</section>}
      </section>
    </section>
  </main>;
}
