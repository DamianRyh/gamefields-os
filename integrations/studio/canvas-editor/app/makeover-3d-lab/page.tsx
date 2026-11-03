"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Controlled photo compositing experiment. The structure render is authentic,
 * but camera matching, occlusion, lighting and physical scaling remain manual.
 */
export default function Makeover3DLab() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const photo = useRef<HTMLImageElement | null>(null);
  const model = useRef<HTMLImageElement | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const photoUrl = useRef<string | null>(null);
  const uploadSequence = useRef(0);
  const [draft, setDraft] = useState("");
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [x, setX] = useState(50);
  const [y, setY] = useState(58);
  const [width, setWidth] = useState(65);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(90);
  const [status, setStatus] = useState("Wczytaj zdjęcie i publiczną konfigurację 3D z Warsztatu.");

  useEffect(() => {
    const prefill = new URLSearchParams(location.search).get("id") || "";
    if (/^[0-9a-f-]{36}$/i.test(prefill)) setDraft(prefill);
  }, []);

  useEffect(() => () => {
    uploadSequence.current++;
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => {
      setLoading(false);
      setStatus("Upłynął limit czasu renderowania 3D. Spróbuj ponownie lub wybierz inny projekt.");
    }, 35000);
    return () => window.clearTimeout(timer);
  }, [loading, id]);

  useEffect(() => {
    if (!id) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      const data = event.data;
      if (data?.type === "gf-workshop-cutout-error" && data.id === id) {
        setLoading(false);
        setStatus("Nie udało się wyrenderować konstrukcji. Sprawdź projekt lub spróbuj ponownie.");
        return;
      }
      if (!data || data.type !== "gf-workshop-cutout" || data.id !== id ||
          data.mode !== "uncalibrated-3d-concept" || typeof data.image !== "string" ||
          data.image.length > 2_800_000 || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data.image)) return;
      if (!Number.isInteger(data.width) || !Number.isInteger(data.height) || data.width < 1 || data.height < 1 || data.width > 960 || data.height > 540) return;
      const img = new Image();
      img.onload = () => { model.current = img; setModelLoaded(true); setLoading(false); setStatus("Model gotowy. Ustaw rozmiar, położenie i obrót względem zdjęcia."); };
      img.onerror = () => { setLoading(false); setStatus("Nie udało się odczytać obrazu konstrukcji."); };
      img.src = data.image;
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [id]);

  const paint = useCallback((target: HTMLCanvasElement) => {
    const context = target.getContext("2d");
    if (!context || !photo.current) return false;
    context.clearRect(0, 0, target.width, target.height);
    context.drawImage(photo.current, 0, 0, target.width, target.height);
    if (model.current) {
      const image = model.current, w = target.width * width / 100;
      const h = w * image.naturalHeight / image.naturalWidth;
      context.save();
      context.globalAlpha = opacity / 100;
      context.translate(target.width * x / 100, target.height * y / 100);
      context.rotate(rotation * Math.PI / 180);
      context.drawImage(image, -w / 2, -h / 2, w, h);
      context.restore();
    }
    return true;
  }, [x, y, width, rotation, opacity, photoLoaded, modelLoaded]);

  useEffect(() => { if (canvas.current) paint(canvas.current); }, [paint]);

  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8_000_000) {
      setStatus("Zdjęcie musi mieć format JPG, PNG lub WebP i maksymalnie 8 MB.");
      event.currentTarget.value = ""; return;
    }
    const seq = ++uploadSequence.current;
    const url = URL.createObjectURL(file), image = new Image();
    image.onload = () => {
      if (seq !== uploadSequence.current) { URL.revokeObjectURL(url); return; }
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
      photoUrl.current = url; photo.current = image;
      const factor = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
      if (canvas.current) {
        canvas.current.width = Math.round(image.naturalWidth * factor);
        canvas.current.height = Math.round(image.naturalHeight * factor);
      }
      setPhotoLoaded(true); setStatus("Zdjęcie pozostało lokalnie na urządzeniu.");
    };
    image.onerror = () => { URL.revokeObjectURL(url); if (seq === uploadSequence.current) setStatus("Nie udało się odczytać zdjęcia."); };
    image.src = url;
  }

  function load(event: React.FormEvent) {
    event.preventDefault();
    const next = draft.trim();
    if (!/^[0-9a-f-]{36}$/i.test(next)) { setStatus("Niepoprawny UUID projektu."); return; }
    model.current = null; setModelLoaded(false); setLoading(true); setId(next);
    setStatus("Renderujemy istniejącą konfigurację 3D z przezroczystym tłem.");
  }

  function choosePoint(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setX(Math.max(0, Math.min(100, (event.clientX - rect.left) * 100 / rect.width)));
    setY(Math.max(0, Math.min(100, (event.clientY - rect.top) * 100 / rect.height)));
  }

  function download() {
    if (!photo.current || !model.current || !canvas.current) return;
    const output = document.createElement("canvas");
    output.width = canvas.current.width; output.height = canvas.current.height;
    if (!paint(output)) return;
    output.toBlob(blob => {
      if (!blob) { setStatus("Nie udało się wygenerować pliku PNG."); return; }
      const url = URL.createObjectURL(blob), anchor = document.createElement("a");
      anchor.href = url; anchor.download = "gamefields-3d-koncepcja.png"; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  return <main style={{ background: "#f4f4ef", minHeight: "100vh", padding: "clamp(18px,4vw,48px)", fontFamily: "Arial,sans-serif", color: "#181b1e" }}>
    <div style={{ maxWidth: 1200, margin: "auto" }}>
      <p style={{ color: "#d66a4c", fontSize: 12, fontWeight: 800, letterSpacing: ".14em" }}>GAMEFIELDS / 3D PLACEMENT LAB</p>
      <h1 style={{ fontSize: "clamp(36px,6vw,64px)", letterSpacing: "-.055em", margin: "8px 0" }}>Postaw model w kadrze.</h1>
      <p style={{ maxWidth: 780, lineHeight: 1.55, color: "#656963" }}>Eksperymentalny fotomontaż prawdziwego modelu GAMEFIELDS. To ręczne pozycjonowanie renderu, jeszcze bez dopasowania kamery, przesłonięć i pomiaru rzeczywistej skali.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 20 }}>
        <section style={panel}>
          <h2>01 / Materiały</h2>
          <label htmlFor="photo3d" style={label}>Zdjęcie miejsca (tylko na tym urządzeniu)</label>
          <input id="photo3d" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} style={input} />
          <form onSubmit={load} style={{ display: "grid", gap: 9, marginTop: 18 }}>
            <label htmlFor="saved3d" style={label}>UUID publicznego projektu Warsztatu</label>
            <input id="saved3d" required value={draft} onChange={event => setDraft(event.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={input} />
            <button style={primary} disabled={loading}>{loading ? "Renderowanie…" : "Wczytaj model 3D"}</button>
          </form>
          {loading && id && <iframe ref={frame} title="Renderowanie konstrukcji 3D" src={`/workshop-cutout?id=${encodeURIComponent(id)}&parentOrigin=${encodeURIComponent(location.origin)}`} style={{ marginTop: 14, width: "100%", height: 210, border: "1px solid #ddd", borderRadius: 12 }} />}
          <p role="status" style={{ fontSize: 13, color: "#626862", lineHeight: 1.5 }}>{status}</p>
          <h2>02 / Pozycja</h2>
          {([
            ["Szerokość modelu", width, setWidth, 15, 150, "%"],
            ["Obrót", rotation, setRotation, -180, 180, "°"],
            ["Przezroczystość", opacity, setOpacity, 10, 100, "%"],
          ] as const).map(([name, value, setter, min, max, unit]) =>
            <label key={name} style={{ display: "block", marginBottom: 14, fontSize: 13, fontWeight: 700 }}>{name}: {Math.round(value)}{unit}
              <input type="range" min={min} max={max} value={value} onChange={event => setter(Number(event.target.value))} style={{ width: "100%", accentColor: "#e66d4c", display: "block" }} />
            </label>
          )}
          <p style={{ fontSize: 12, color: "#70746e" }}>Kliknij zdjęcie, aby wskazać środek renderu. Pozycję można korygować suwakami.</p>
          <label style={label} htmlFor="horizontal">Pozycja pozioma: {Math.round(x)}%</label>
          <input id="horizontal" type="range" min="0" max="100" value={x} onChange={e => setX(Number(e.target.value))} style={{ width: "100%" }} />
          <label style={label} htmlFor="vertical">Pozycja pionowa: {Math.round(y)}%</label>
          <input id="vertical" type="range" min="0" max="100" value={y} onChange={e => setY(Number(e.target.value))} style={{ width: "100%" }} />
        </section>
        <section style={panel}>
          <h2>03 / Podgląd</h2>
          <div style={{ background: "#e6e6df", borderRadius: 14, overflow: "hidden" }}>
            <canvas ref={canvas} width={960} height={640} onClick={choosePoint} aria-label="Podgląd: kliknij, aby ustawić pozycję modelu" style={{ display: "block", width: "100%", height: "auto", cursor: "crosshair" }} />
          </div>
          <p style={{ fontSize: 12, color: "#656a64", lineHeight: 1.5 }}>Wizualizacja koncepcyjna — model nie jest jeszcze skalibrowany metrycznie z fotografią. Zachowano rzeczywistą geometrię źródłowego modelu 3D, ale jego wielkość na zdjęciu jest orientacyjna.</p>
          <button disabled={!photoLoaded || !modelLoaded} onClick={download} style={{ ...primary, width: "100%", opacity: photoLoaded && modelLoaded ? 1 : .5 }}>Pobierz PNG koncepcji</button>
        </section>
      </div>
    </div>
  </main>;
}
const panel: React.CSSProperties = { padding: 22, background: "white", border: "1px solid #dbddd8", borderRadius: 20 };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700, display: "block" };
const input: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #cad0c9", borderRadius: 10, marginTop: 7 };
const primary: React.CSSProperties = { border: 0, borderRadius: 10, padding: 13, background: "#181b1e", color: "white", cursor: "pointer", fontWeight: 700 };
