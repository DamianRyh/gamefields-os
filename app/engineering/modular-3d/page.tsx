"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./modular-3d.module.css";

type SceneInstance = {
  id: string;
  component: "PANEL_STANDARD" | "POST_STANDARD";
  position: { x: number; y: number; z: number };
  rotationDeg: { x: number; y: number; z: number };
  dimensionsM?: { x: number; y: number; z: number };
};

type ModularResponse = {
  layout: {
    shape: "RECTANGLE" | "CIRCLE";
    requested: { lengthM?: number; widthM?: number; diameterM?: number };
    resolved: { lengthM?: number; widthM?: number; diameterM?: number };
    moduleWidthM: number;
    moduleCount: number;
    postsCount: number;
    perimeterM: number;
  };
  structuralModel: {
    nodes: unknown[];
    members: unknown[];
  };
  scene3d: {
    schema: string;
    instances: SceneInstance[];
  };
};

const PX_PER_M = 34;

export default function Modular3DPage() {
  const [shape, setShape] = useState<"RECTANGLE" | "CIRCLE">("RECTANGLE");
  const [lengthM, setLengthM] = useState(15);
  const [widthM, setWidthM] = useState(10);
  const [diameterM, setDiameterM] = useState(7);
  const [data, setData] = useState<ModularResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [yaw, setYaw] = useState(-28);
  const [pitch, setPitch] = useState(58);
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/engineering/modular", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(shape === "CIRCLE" ? { shape, diameterM } : { shape, lengthM, widthM }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error ?? "Nie udało się wygenerować modelu");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się wygenerować modelu");
    } finally {
      setLoading(false);
    }
  }, [shape, diameterM, lengthM, widthM]);

  useEffect(() => { void generate(); }, [generate]);

  const bounds = useMemo(() => {
    if (!data) return { cx: 0, cy: 0, size: 18 };
    const xs = data.scene3d.instances.map((i) => i.position.x);
    const ys = data.scene3d.instances.map((i) => i.position.y);
    const minX = Math.min(...xs); const maxX = Math.max(...xs);
    const minY = Math.min(...ys); const maxY = Math.max(...ys);
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, size: Math.max(maxX - minX, maxY - minY, 8) };
  }, [data]);

  const panelCount = data?.scene3d.instances.filter((i) => i.component === "PANEL_STANDARD").length ?? 0;
  const postCount = data?.scene3d.instances.filter((i) => i.component === "POST_STANDARD").length ?? 0;

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX, y: event.clientY, yaw, pitch };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setYaw(drag.current.yaw + (event.clientX - drag.current.x) * 0.35);
    setPitch(Math.max(25, Math.min(78, drag.current.pitch - (event.clientY - drag.current.y) * 0.25)));
  }

  function pointerUp() { drag.current = null; }

  function wheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setZoom((z) => Math.max(0.55, Math.min(1.7, z - event.deltaY * 0.001)));
  }

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><span>GAMEFIELDS / MODULAR 3D v1.1</span><h1>Boisko rośnie elementami.</h1></div>
      <p>Każda banda i każdy słup jest osobną instancją 3D. Zmieniasz wymiar — system dodaje albo usuwa fizyczne moduły zamiast rozciągać cały model.</p>
    </header>

    <section className={styles.layout}>
      <aside className={styles.controls}>
        <div className={styles.segmented}>
          <button className={shape === "RECTANGLE" ? styles.active : ""} onClick={() => setShape("RECTANGLE")}>3v3</button>
          <button className={shape === "CIRCLE" ? styles.active : ""} onClick={() => setShape("CIRCLE")}>Panna</button>
        </div>

        {shape === "RECTANGLE" ? <>
          <label><span>Długość</span><b>{lengthM.toFixed(2)} m</b><input type="range" min="6" max="24" step="0.25" value={lengthM} onChange={(e) => setLengthM(Number(e.target.value))} /></label>
          <label><span>Szerokość</span><b>{widthM.toFixed(2)} m</b><input type="range" min="4" max="16" step="0.25" value={widthM} onChange={(e) => setWidthM(Number(e.target.value))} /></label>
        </> : <label><span>Średnica</span><b>Ø {diameterM.toFixed(1)} m</b><input type="range" min="4" max="12" step="0.1" value={diameterM} onChange={(e) => setDiameterM(Number(e.target.value))} /></label>}

        <div className={styles.cameraControls}>
          <span>KAMERA</span>
          <button onClick={() => { setYaw(-28); setPitch(58); setZoom(1); }}>RESET</button>
        </div>

        <div className={styles.metrics}>
          <div><span>MODUŁY</span><b>{panelCount}</b></div>
          <div><span>SŁUPY</span><b>{postCount}</b></div>
          <div><span>WĘZŁY</span><b>{data?.structuralModel.nodes.length ?? 0}</b></div>
          <div><span>PRĘTY</span><b>{data?.structuralModel.members.length ?? 0}</b></div>
        </div>

        {data && <div className={styles.resolved}>
          <span>WYMIAR MODUŁOWY</span>
          <b>{data.layout.shape === "RECTANGLE" ? `${data.layout.resolved.lengthM} × ${data.layout.resolved.widthM} m` : `Ø ${data.layout.resolved.diameterM} m`}</b>
          <small>moduł bazowy {data.layout.moduleWidthM.toFixed(2)} m</small>
        </div>}

        <p className={styles.tip}>Przeciągnij model, aby obracać. Kółko myszy zmienia zoom.</p>
        {loading && <p className={styles.status}>Przebudowuję konstrukcję…</p>}
        {error && <p className={styles.error}>{error}</p>}
      </aside>

      <section className={styles.viewerWrap}>
        <div className={styles.viewerHead}><span>LIVE MODULAR ASSEMBLY</span><b>{data?.scene3d.schema ?? "GF-MODULAR-3D-1.0"}</b></div>
        <div className={styles.viewer} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={wheel}>
          <div className={styles.horizon} />
          <div className={styles.scene} style={{ transform: `translate(-50%, -50%) scale(${zoom}) rotateX(${pitch}deg) rotateZ(${yaw}deg)` }}>
            <div className={styles.floor} style={{ width: `${Math.max(bounds.size + 5, 16) * PX_PER_M}px`, height: `${Math.max(bounds.size + 5, 16) * PX_PER_M}px`, transform: `translate3d(${(-bounds.cx - (Math.max(bounds.size + 5, 16) / 2)) * PX_PER_M}px, ${(-bounds.cy - (Math.max(bounds.size + 5, 16) / 2)) * PX_PER_M}px, 0)` }} />
            {data?.scene3d.instances.map((instance) => {
              const d = instance.dimensionsM ?? { x: .1, y: .1, z: 1 };
              const x = (instance.position.x - bounds.cx) * PX_PER_M;
              const y = (instance.position.y - bounds.cy) * PX_PER_M;
              const z = instance.position.z * PX_PER_M;
              if (instance.component === "POST_STANDARD") {
                return <div key={instance.id} className={styles.post} style={{ width: `${Math.max(3, d.x * PX_PER_M)}px`, height: `${Math.max(3, d.y * PX_PER_M)}px`, transform: `translate3d(${x}px, ${y}px, ${z}px)`, ['--postH' as string]: `${d.z * PX_PER_M}px` }} />;
              }
              return <div key={instance.id} className={styles.panel} style={{ width: `${d.x * PX_PER_M}px`, height: `${d.y * PX_PER_M}px`, transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${instance.rotationDeg.z}deg)`, ['--panelH' as string]: `${d.z * PX_PER_M}px` }}><span /></div>;
            })}
          </div>
          <div className={styles.viewerCaption}><span>{shape === "RECTANGLE" ? "GF 3v3 MODULAR SYSTEM" : "GF PANNA MODULAR SYSTEM"}</span><b>{panelCount} modułów / {postCount} słupów</b></div>
        </div>
      </section>
    </section>
  </main>;
}
