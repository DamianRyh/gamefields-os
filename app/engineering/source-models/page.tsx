"use client";
import { useState } from "react";
import library from "../../../public/models/gamefields/library.json";
import { GlbViewer } from "../../../components/gamefields/glb-viewer";
import "./source-models.css";

export default function SourceModelsPage({
  assetBase = "/models/gamefields",
}: {
  assetBase?: string;
}) {
  const [mode, setMode] = useState<"source" | "component" | "study">("source"),
    [sourceIndex, setSourceIndex] = useState(0),
    [componentIndex, setComponentIndex] = useState(0),
    [count, setCount] = useState(3);
  const source = library.sources[sourceIndex],
    component = library.components[componentIndex],
    k1 = library.components.find((c) => c.id === "K1")!;
  const selected =
    mode === "source" ? source : mode === "study" ? k1 : component;
  const bounds = selected.measuredBoundsM,
    pitch = k1.repeatStudy?.pitchM ?? 0;
  const url = assetBase + "/" + selected.file;
  return (
    <main className="gf-source-page">
      <header>
        <div>
          <span>GAMEFIELDS / SOURCE COMPONENTS</span>
          <h1>
            Wasze panele.
            <br />
            Rzeczywista geometria.
          </h1>
        </div>
        <p>
          Modele z Blendera, oryginalne materiały i osobne części. Geometria
          zachowana bez rozciągania. Pomiary modelu wymagają potwierdzenia
          produkcyjnego.
        </p>
      </header>
      <nav className="gf-source-nav">
        <a href="/engineering/modular-3d">← KONFIGURATOR MODUŁOWY</a>
        <span>GLB LIBRARY / MODEL MEASURED</span>
      </nav>
      <section className="gf-source-layout">
        <aside>
          <div className="gf-source-tabs">
            {(["source", "component", "study"] as const).map((m) => (
              <button
                key={m}
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {m === "source"
                  ? "MODELE"
                  : m === "component"
                    ? "CZĘŚCI"
                    : "SKŁADANIE K1"}
              </button>
            ))}
          </div>
          {mode === "source" ? (
            <>
              <h2>MODELE ŹRÓDŁOWE</h2>
              {library.sources.map((s, i) => (
                <button
                  className="gf-source-choice"
                  key={s.id}
                  aria-pressed={sourceIndex === i}
                  onClick={() => setSourceIndex(i)}
                >
                  <strong>{s.id}</strong>
                  <span>{s.meshCount} osobnych meshów</span>
                </button>
              ))}
            </>
          ) : mode === "component" ? (
            <>
              <h2>WYDZIELONE ZESPOŁY</h2>
              <div className="gf-source-components">
                {library.components.map((c, i) => (
                  <button
                    key={c.id}
                    aria-pressed={componentIndex === i}
                    onClick={() => setComponentIndex(i)}
                  >
                    {c.id}
                  </button>
                ))}
              </div>
              <p>{component.meshCount} części źródłowych w zespole.</p>
              <code>{component.assetKey}</code>
            </>
          ) : (
            <>
              <h2>STUDIUM MODUŁU K1</h2>
              <label>
                Liczba zespołów K1 <strong>{count}</strong>
                <input
                  aria-label="Liczba zespołów K1"
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </label>
              <p>
                Rozstaw odczytany z położenia zespołów w modelu:{" "}
                {pitch.toFixed(3)} m. Nie jest zatwierdzonym detalem połączenia.
              </p>
              <div className="gf-source-counter">
                <span>LIVE / ZESPOŁY K1</span>
                <strong>{count}</strong>
                <span>MESHY W SCENIE</span>
                <strong>{count * k1.meshCount}</strong>
              </div>
              <p>
                Każda kopia ma skalę 1:1. To studium szeregu paneli; nie jest
                kompletnym boiskiem ani jego produkcyjnym BOM.
              </p>
            </>
          )}
          <dl>
            <dt>OBWIEDNIA MODELU / m</dt>
            <dd>
              {bounds.x.toFixed(3)} × {bounds.y.toFixed(3)} ×{" "}
              {bounds.z.toFixed(3)}
            </dd>
            <dt>STATUS</dt>
            <dd>
              MODEL_MEASURED
              <br />
              PRODUCTION_UNCONFIRMED
            </dd>
            <dt>KOSZT</dt>
            <dd>UNPRICED — brak cennika dla tych części</dd>
            <dt>ENGINEER GATE</dt>
            <dd>Wymagana weryfikacja. Bez auto-approve.</dd>
          </dl>
          <a className="gf-source-download" href={url} download>
            Pobierz {selected.id}.glb ↗
          </a>
        </aside>
        <section>
          <GlbViewer
            url={url}
            count={mode === "study" ? count : 1}
            pitch={mode === "study" ? pitch : 0}
          />
          <div className="gf-source-caption">
            <span>{selected.id.toUpperCase()} / GLB</span>
            <span>ORBIT · ZOOM · PAN</span>
          </div>
          <p className="gf-source-note">
            Wymiary powyżej oznaczają obwiednię geometrii, nie rozstaw montażowy
            ani wymiary z dokumentacji warsztatowej. Nazwy rodzin zachowano ze
            źródła; klasyfikacja części, materiały fizyczne, masa, połączenia i
            nośności wymagają potwierdzenia.
          </p>
        </section>
      </section>
    </main>
  );
}
