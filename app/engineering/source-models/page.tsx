"use client";
import { useEffect, useState } from "react";
import library from "../../../public/models/gamefields/library.json";
import { GlbViewer } from "../../../components/gamefields/glb-viewer";
import "./source-models.css";

const offerNames: Record<string, string> = {
  "boisko-p1": "GAMEFIELDS P1",
  "panna-kids-o1": "GAMEFIELDS Panna Kids O1",
  "boisko-w1": "GAMEFIELDS W1",
};

export default function SourceModelsPage({
  assetBase = "/models/gamefields",
  initialModelId,
  embedded = false,
  onModelChange,
}: {
  assetBase?: string;
  initialModelId?: string;
  embedded?: boolean;
  onModelChange?: (id: string) => void;
}) {
  const [mode, setMode] = useState<"source" | "component" | "study">("source"),
    [sourceIndex, setSourceIndex] = useState(() =>
      Math.max(0, library.sources.findIndex((s) => s.id === initialModelId)),
    ),
    [componentIndex, setComponentIndex] = useState(0),
    [count, setCount] = useState(3);
  useEffect(() => {
    if (embedded) return;
    const model = new URLSearchParams(window.location.search).get("model");
    const index = library.sources.findIndex((s) => s.id === model);
    const frame = window.requestAnimationFrame(() => {
      if (index >= 0) setSourceIndex(index);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [embedded]);
  function selectSource(index: number) {
    setSourceIndex(index);
    onModelChange?.(library.sources[index].id);
    const link = new URL(window.location.href);
    link.searchParams.set("model", library.sources[index].id);
    link.searchParams.set("view", embedded ? "viewer" : "source");
    if (embedded) link.searchParams.set("product", library.sources[index].id);
    window.history.replaceState(null, "", link);
  }
  const source = library.sources[sourceIndex],
    component = library.components[componentIndex],
    k1 = library.components.find((c) => c.id === "K1")!;
  const selected =
    mode === "source" ? source : mode === "study" ? k1 : component;
  const bounds = selected.measuredBoundsM,
    pitch = k1.repeatStudy?.pitchM ?? 0;
  const url = assetBase + "/" + selected.file;
  return (
    <div className={`gf-source-page${embedded ? " gf-source-embedded" : ""}`}>
      {!embedded && <>
      <header>
        <div>
          <span>GAMEFIELDS / KOLEKCJA BOISK</span>
          <h1>
            Trzy boiska.
            <br />
            Wasze modele.
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
      </>}
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
              <h2>WYBIERZ BOISKO / 03 MODELE</h2>
              {library.sources.map((s, i) => (
                <button
                  className="gf-source-choice"
                  key={s.id}
                  aria-pressed={sourceIndex === i}
                  onClick={() => selectSource(i)}
                >
                  <span>0{i + 1} / BOISKO</span>
                  <strong>{offerNames[s.id]}</strong>
                  <span>{s.id}.glb</span>
                  <span>Obejrzyj model 3D ↗</span>
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
              <h2>STUDIUM MODUŁU K1 / ŹRÓDŁO P1</h2>
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
          {mode === "source" && (
            <p>Wybrany wariant: <strong>{offerNames[source.id]}</strong>.
              Cena i specyfikacja produkcyjna do indywidualnego potwierdzenia.
              Model pokazujemy w oryginalnej geometrii, bez zmiany wymiarów.
            </p>
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
    </div>
  );
}
