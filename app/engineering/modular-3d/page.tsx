// Use document navigation until the vinext production Link/prefetch runtime is fixed.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./modular-3d.module.css";

import { generateModularProduct } from "../modular-pipeline";
import type { Modular3DComponentType as ComponentType } from "../modular-3d";

import { NATIVE_MODELS_PUBLIC, PUBLIC_SOURCE_MODEL_IDS } from "../native-model-access";
import SourceModelsPage from "../source-models/page";

const nativeProducts = [
  { id: "boisko-p1", name: "Panna Court" },
  { id: "panna-kids-o1", name: "Panna Play" },
  { id: "boisko-w1", name: "Panna Ring" },
];

const PX_PER_M = 34;
const money = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });

export default function Modular3DPage({ assetBase = "/models/gamefields" }: { assetBase?: string }) {
  const [product, setProduct] = useState("concept");
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("product");
    const frame = requestAnimationFrame(() => {
      if ((NATIVE_MODELS_PUBLIC || PUBLIC_SOURCE_MODEL_IDS.includes(id || "")) && nativeProducts.some((p) => p.id === id)) setProduct(id!);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  function selectProduct(id: string) {
    setProduct(id);
    const link = new URL(window.location.href);
    link.searchParams.set("view", "viewer");
    if (id === "concept") {
      link.searchParams.delete("product");
      link.searchParams.delete("model");
    } else {
      link.searchParams.set("product", id);
      link.searchParams.set("model", id);
    }
    window.history.replaceState(null, "", link);
  }
  const [shape, setShape] = useState<"RECTANGLE" | "CIRCLE">("RECTANGLE");
  const [lengthM, setLengthM] = useState(15);
  const [widthM, setWidthM] = useState(10.5);
  const [diameterM, setDiameterM] = useState(7);
  const [goalCount, setGoalCount] = useState(2);
  const [gateCount, setGateCount] = useState(1);
  const [brandingPanelCount, setBrandingPanelCount] = useState(4);
  const [ballStopHeightM, setBallStopHeightM] = useState(3);
  const [yaw, setYaw] = useState(-28);
  const [pitch, setPitch] = useState(58);
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{
    x: number;
    y: number;
    yaw: number;
    pitch: number;
  } | null>(null);

  // One synchronous transaction: every slider produces geometry, product, scene, structure, BOM and budget together.
  const data = useMemo(
    () =>
      generateModularProduct({
        shape,
        lengthM,
        widthM,
        diameterM,
        goalCount,
        gateCount,
        brandingPanelCount,
        ballStopHeightM,
      }),
    [
      shape,
      lengthM,
      widthM,
      diameterM,
      goalCount,
      gateCount,
      brandingPanelCount,
      ballStopHeightM,
    ],
  );

  const bounds = useMemo(() => {
    if (!data || data.scene3d.instances.length === 0)
      return { cx: 0, cy: 0, size: 18 };
    const xs = data.scene3d.instances.map((i) => i.position.x);
    const ys = data.scene3d.instances.map((i) => i.position.y);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs),
      minY = Math.min(...ys),
      maxY = Math.max(...ys);
    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      size: Math.max(maxX - minX, maxY - minY, 8),
    };
  }, [data]);

  const count = (component: ComponentType) =>
    data?.scene3d.instances.filter((i) => i.component === component).length ??
    0;
  const productModules =
    count("PANEL_STANDARD") +
    count("PANEL_BRANDING") +
    count("GOAL_MODULE") +
    count("GATE_MODULE");
  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX, y: event.clientY, yaw, pitch };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setYaw(drag.current.yaw + (event.clientX - drag.current.x) * 0.35);
    setPitch(
      Math.max(
        25,
        Math.min(
          78,
          drag.current.pitch - (event.clientY - drag.current.y) * 0.25,
        ),
      ),
    );
  }
  function pointerUp() {
    drag.current = null;
  }
  function wheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setZoom((z) => Math.max(0.55, Math.min(1.7, z - event.deltaY * 0.001)));
  }

  if(product === "concept") return <iframe data-testid="owned-modular" title="Gamefields — system z własnych komponentów" src={`${assetBase}/owned-modular/index.html`} style={{width:"100%",height:"100vh",minHeight:760,border:0}}/>;
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span>{product === "concept" ? "GAMEFIELDS / SYSTEM MODUŁOWY" : "GAMEFIELDS / BOISKA 3D"}</span>
          <h1>{product === "concept" ? "Boisko jako produkt modułowy." : nativeProducts.find(p=>p.id===product)?.name}</h1>
        </div>
        <p>
          {product === "concept" ? <>Wymiar, bramki, wejście, branding i piłkochwyt składają się z osobnych
          komponentów. Każda zmiana przebudowuje 3D, BOM, model konstrukcyjny i
          budżet.</> : <>Obejrzyj boisko z każdej strony. Obracaj model, przybliżaj detale i porównuj warianty.</>}
        </p>
      </header>

      <p><a href="/products/panna-kids">PANNA PLAY / ZAPROJEKTUJ SWOJE BOISKO ↗</a></p>
      <p><a href={assetBase.startsWith('/') ? '/products/street-football-15x10' : '?view=street-football-15x10'}>STREET ARENA 15 / KOLORY PANELI ↗</a></p>
      <nav className={styles.productPicker} aria-label="Wybierz produkt GAMEFIELDS">
        {[{ id: "concept", name: "Twoje komponenty" }, ...nativeProducts.filter(p=>NATIVE_MODELS_PUBLIC || PUBLIC_SOURCE_MODEL_IDS.includes(p.id))].map((p) => (
          <button key={p.id} aria-pressed={product === p.id} onClick={() => selectProduct(p.id)}>
            {p.name}
          </button>
        ))}
      </nav>
      {product !== "concept" ? (
        <section data-testid="native-configurator">
          <p className={styles.tipDark}>
            Geometria boiska zachowuje oryginalne wymiary. Nawierzchnia, linie i materiały to propozycja wizualna; wykonanie oraz wycena wymagają indywidualnego potwierdzenia.
          </p>
          <SourceModelsPage key={product} initialModelId={product} assetBase={assetBase} onModelChange={selectProduct} embedded />
        </section>
      ) : <section className={styles.layout}>
        <aside className={styles.controls}>
          <div className={styles.segmented}>
            <button
              className={shape === "RECTANGLE" ? styles.active : ""}
              onClick={() => {
                setShape("RECTANGLE");
                setBallStopHeightM(3);
              }}
            >
              3v3
            </button>
            <button
              className={shape === "CIRCLE" ? styles.active : ""}
              onClick={() => {
                setShape("CIRCLE");
                setBallStopHeightM(0);
              }}
            >
              Panna
            </button>
          </div>
          {shape === "RECTANGLE" ? (
            <>
              <label>
                <span>Długość</span>
                <b>{lengthM.toFixed(2)} m</b>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="1.5"
                  value={lengthM}
                  onChange={(e) => setLengthM(Number(e.target.value))}
                />
              </label>
              <label>
                <span>Szerokość</span>
                <b>{widthM.toFixed(2)} m</b>
                <input
                  type="range"
                  min="6"
                  max="16.5"
                  step="1.5"
                  value={widthM}
                  onChange={(e) => setWidthM(Number(e.target.value))}
                />
              </label>
            </>
          ) : (
            <label>
              <span>Średnica</span>
              <b>Ø {diameterM.toFixed(1)} m</b>
              <input
                type="range"
                min="4"
                max="12"
                step="0.1"
                value={diameterM}
                onChange={(e) => setDiameterM(Number(e.target.value))}
              />
            </label>
          )}

          <div className={styles.productControls}>
            <span>MODUŁY PRODUKTU</span>
            <label>
              <span>Bramki</span>
              <b>{goalCount}</b>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={goalCount}
                onChange={(e) => setGoalCount(Number(e.target.value))}
              />
            </label>
            <label>
              <span>Wejścia</span>
              <b>{gateCount}</b>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={gateCount}
                onChange={(e) => setGateCount(Number(e.target.value))}
              />
            </label>
            <label>
              <span>Branding</span>
              <b>{brandingPanelCount}</b>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={brandingPanelCount}
                onChange={(e) => setBrandingPanelCount(Number(e.target.value))}
              />
            </label>
            {
              <label>
                <span>Piłkochwyt</span>
                <b>{ballStopHeightM.toFixed(1)} m</b>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step=".5"
                  value={ballStopHeightM}
                  onChange={(e) => setBallStopHeightM(Number(e.target.value))}
                />
              </label>
            }
          </div>

          <div className={styles.cameraControls}>
            <span>KAMERA</span>
            <button
              onClick={() => {
                setYaw(-28);
                setPitch(58);
                setZoom(1);
              }}
            >
              RESET
            </button>
          </div>
          <div className={styles.metrics}>
            <div>
              <span>MODUŁY</span>
              <b>{productModules}</b>
            </div>
            <div>
              <span>SŁUPY</span>
              <b>{count("POST_STANDARD")}</b>
            </div>
            <div>
              <span>BRAMKI</span>
              <b>{count("GOAL_MODULE")}</b>
            </div>
            <div>
              <span>WEJŚCIA</span>
              <b>{count("GATE_MODULE")}</b>
            </div>
          </div>
          {data && (
            <div className={styles.resolved}>
              <span>WYMIAR MODUŁOWY</span>
              <b>
                {data.layout.shape === "RECTANGLE"
                  ? `${data.layout.resolved.lengthM} × ${data.layout.resolved.widthM} m`
                  : `Ø ${data.layout.resolved.diameterM} m`}
              </b>
              <small>
                moduł bazowy {data.layout.moduleWidthM.toFixed(2)} m
              </small>
            </div>
          )}
          {data && (
            <div className={styles.liveCost} data-testid="live-budget">
              <span>LIVE BUDGET / NETTO</span>
              <b>{money.format(data.productSummary.totalBudgetNetPln)} zł</b>
              <small>
                {data.productSummary.sourceStatus === "BUDGETARY_DEFAULT"
                  ? "stawki budżetowe — do podmiany na cennik Gamefields"
                  : "stawki potwierdzone"}
              </small>
            </div>
          )}
          <p className={styles.tip}>
            Przeciągnij model, aby obracać. Kółko myszy zmienia zoom.
          </p>
          <p className={styles.tip}>
            Engineer Gate: wymagana weryfikacja. Model i podparcia są
            koncepcyjne; bez automatycznego zatwierdzenia.
          </p>
          <p className={styles.tip}>
            Piłkochwyt: {count("BALLSTOP_POST")} osobnych słupów górnych.
          </p>
          <a href="/engineering/components" className={styles.libraryLink}>
            COMPONENT LIBRARY v1.0 ↗
          </a>
        </aside>

        <section className={styles.viewerWrap}>
        {NATIVE_MODELS_PUBLIC && <p><a href="/engineering/source-models">WASZE PANELE / MODELE Z BLENDERA ↗</a></p>}
          <div className={styles.viewerHead}>
            <span>LIVE MODULAR ASSEMBLY</span>
            <b>{data?.scene3d.schema ?? "GF-MODULAR-3D-1.2"}</b>
          </div>
          <div
            className={styles.viewer}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerCancel={pointerUp}
            onWheel={wheel}
          >
            <div className={styles.horizon} />
            <div
              className={styles.scene}
              data-testid="modular-scene"
              style={{
                transform: `translate(-50%, -50%) scale(${zoom}) rotateX(${pitch}deg) rotateZ(${yaw}deg)`,
              }}
            >
              <div
                className={styles.floor}
                style={{
                  width: `${Math.max(bounds.size + 5, 16) * PX_PER_M}px`,
                  height: `${Math.max(bounds.size + 5, 16) * PX_PER_M}px`,
                  transform: `translate3d(${(-Math.max(bounds.size + 5, 16) / 2) * PX_PER_M}px, ${(-Math.max(bounds.size + 5, 16) / 2) * PX_PER_M}px, 0)`,
                }}
              />
              {data?.scene3d.instances.map((instance) => {
                const d = instance.dimensionsM ?? { x: 0.1, y: 0.1, z: 1 };
                const x =
                    (instance.position.x - bounds.cx - d.x / 2) * PX_PER_M,
                  y = (instance.position.y - bounds.cy - d.y / 2) * PX_PER_M,
                  z = (instance.position.z - d.z / 2) * PX_PER_M;
                if (
                  instance.component === "POST_STANDARD" ||
                  instance.component === "BALLSTOP_POST" ||
                  instance.component === "CORNER_STANDARD"
                )
                  return (
                    <div
                      key={instance.id}
                      data-instance-id={instance.id}
                      data-component={instance.component}
                      data-asset-key={instance.assetKey}
                      className={`${styles.post} ${instance.component === "CORNER_STANDARD" ? styles.corner : ""}`}
                      style={{
                        width: `${Math.max(3, d.x * PX_PER_M)}px`,
                        height: `${Math.max(3, d.y * PX_PER_M)}px`,
                        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                        ["--postH" as string]: `${d.z * PX_PER_M}px`,
                      }}
                    />
                  );
                if (instance.component === "BALLSTOP_PANEL")
                  return (
                    <div
                      key={instance.id}
                      data-instance-id={instance.id}
                      data-component={instance.component}
                      data-asset-key={instance.assetKey}
                      className={styles.ballstop}
                      style={{
                        width: `${d.x * PX_PER_M}px`,
                        height: `${d.y * PX_PER_M}px`,
                        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${instance.rotationDeg.z}deg)`,
                        ["--panelH" as string]: `${d.z * PX_PER_M}px`,
                      }}
                    />
                  );
                const specialClass =
                  instance.component === "GOAL_MODULE"
                    ? styles.goal
                    : instance.component === "GATE_MODULE"
                      ? styles.gate
                      : instance.component === "PANEL_BRANDING"
                        ? styles.branding
                        : "";
                return (
                  <div
                    key={instance.id}
                    data-instance-id={instance.id}
                    data-component={instance.component}
                    data-asset-key={instance.assetKey}
                    className={`${styles.panel} ${specialClass}`}
                    style={{
                      width: `${d.x * PX_PER_M}px`,
                      height: `${d.y * PX_PER_M}px`,
                      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${instance.rotationDeg.z}deg)`,
                      ["--panelH" as string]: `${d.z * PX_PER_M}px`,
                    }}
                  >
                    <span />
                  </div>
                );
              })}
            </div>
            <div className={styles.viewerCaption}>
              <span>
                {shape === "RECTANGLE"
                  ? "GF 3v3 MODULAR PRODUCT"
                  : "GENERIC CIRCLE / NIE JEST PRODUKTEM PANNA 1:1"}
              </span>
              <b>
                {productModules} modułów / {count("POST_STANDARD")} słupów
              </b>
            </div>
          </div>

          <div className={styles.legend}>
            {(
              [
                "PANEL_STANDARD",
                "PANEL_BRANDING",
                "GOAL_MODULE",
                "GATE_MODULE",
                "POST_STANDARD",
                "CORNER_STANDARD",
                "BALLSTOP_PANEL",
                "BALLSTOP_POST",
              ] as ComponentType[]
            ).map((type) => (
              <span key={type}>
                {type.replaceAll("_", " ")} · {count(type)}
              </span>
            ))}
          </div>
          <p className={styles.tipDark}>
            Model konstrukcyjny: {data.structuralModel.nodes.length} węzłów /{" "}
            {data.structuralModel.members.length} prętów.{" "}
            {data.layout.shape === "CIRCLE"
              ? "Generyczny system kołowy — nie odwzorowanie produktu Damiana 1:1."
              : "Bryły są placeholderami; wymiary produkcyjne wymagają potwierdzenia."}
          </p>
          {data && (
            <section className={styles.bom} data-testid="live-bom">
              <div className={styles.bomHead}>
                <span>LIVE BOM</span>
                <b>
                  {money.format(data.productSummary.totalBudgetNetPln)} zł netto
                </b>
              </div>
              {data.productSummary.bom.map((line) => (
                <div className={styles.bomRow} key={line.id}>
                  <div>
                    <b>{line.name}</b>
                    <small>{line.assetKey}</small>
                  </div>
                  <span>
                    {line.quantity} {line.unit}
                  </span>
                  <strong>{money.format(line.totalBudgetPln)} zł</strong>
                </div>
              ))}
            </section>
          )}
          <div className={styles.warnings}>
            {data.productSummary.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        </section>
      </section>}
    </main>
  );
}
