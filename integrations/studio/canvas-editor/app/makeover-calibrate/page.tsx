"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { drawCalibratedSurface, validateCalibrationQuad, type CalibrationPoint } from "@/lib/makeover-calibration";

const MAX_UPLOAD_BYTES = 8_000_000;
const MAX_EDGE = 1800;
const labels = ["Lewy górny", "Prawy górny", "Prawy dolny", "Lewy dolny"];

export default function MakeoverCalibrationLab() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const photo = useRef<HTMLImageElement | null>(null);
  const artwork = useRef<HTMLImageElement | null>(null);
  const photoUrl = useRef<string | null>(null);
  const uploadSequence = useRef(0);
  const [draftId, setDraftId] = useState("");
  const [id, setId] = useState("");
  const [points, setPoints] = useState<CalibrationPoint[]>([]);
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  const [showPoints, setShowPoints] = useState(true);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Dodaj zdjęcie miejsca, a następnie zaznacz cztery narożniki.");
  const [photoReady, setPhotoReady] = useState(false);
  const [artReady, setArtReady] = useState(false);

  useEffect(() => {
    const candidate = new URLSearchParams(location.search).get("id") || "";
    if (/^[0-9a-f-]{36}$/i.test(candidate)) setDraftId(candidate);
  }, []);

  useEffect(() => () => {
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
  }, []);

  const draw = useCallback(() => {
    const c = canvas.current, img = photo.current;
    if (!c || !img) return false;
    const ctx = c.getContext("2d");
    if (!ctx) { setStatus("Nie można uruchomić Canvas 2D."); return false; }
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    let composited = false;
    if (points.length === 4 && artwork.current && validateCalibrationQuad(points, c.width, c.height)) {
      try {
        const layer = document.createElement("canvas");
        layer.width = c.width; layer.height = c.height;
        const layerContext = layer.getContext("2d");
        if (!layerContext) throw Error("Canvas 2D unavailable");
        drawCalibratedSurface(layerContext, artwork.current, artwork.current.naturalWidth, artwork.current.naturalHeight, points);
        ctx.save();
        ctx.globalAlpha = overlayOpacity / 100;
        ctx.drawImage(layer, 0, 0);
        ctx.restore();
        composited = true;
      } catch {
        setStatus("Nie udało się wyrenderować perspektywy. Popraw punkty.");
      }
    }
    if (showPoints) {
      ctx.save();
      ctx.lineWidth = Math.max(2, c.width / 500);
      ctx.strokeStyle = "#fb7751";
      ctx.fillStyle = "#fff";
      if (points.length > 1) {
        ctx.beginPath();
        points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        if (points.length === 4) ctx.closePath();
        ctx.stroke();
      }
      points.forEach((p, i) => {
        const radius = Math.max(9, c.width / 90);
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#191b1f";
        ctx.font = `bold ${Math.max(11, c.width / 75)}px Arial`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), p.x, p.y);
        ctx.fillStyle = "#fff";
      });
      ctx.restore();
    }
    return composited;
  }, [points, overlayOpacity, showPoints, photoReady, artReady]);

  useEffect(() => { setReady(draw()); }, [draw]);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_UPLOAD_BYTES) {
      setStatus("Obsługiwane są JPG/PNG/WebP do 8 MB.");
      event.currentTarget.value = "";
      return;
    }
    const seq = ++uploadSequence.current;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (seq !== uploadSequence.current) { URL.revokeObjectURL(url); return; }
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
      photoUrl.current = url;
      photo.current = img;
      const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
      const c = canvas.current;
      if (c) { c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale); }
      setPoints([]); setPhotoReady(true);
      setStatus("Wybierz narożniki po kolei: lewy górny → prawy górny → prawy dolny → lewy dolny.");
    };
    img.onerror = () => { URL.revokeObjectURL(url); if (seq === uploadSequence.current) setStatus("Nie można odczytać zdjęcia."); };
    img.src = url;
  }

  function loadArtwork(event: React.FormEvent) {
    event.preventDefault();
    const next = draftId.trim();
    if (!/^[0-9a-f-]{36}$/i.test(next)) {
      setStatus("Nieprawidłowy identyfikator UUID publicznego projektu.");
      return;
    }
    artwork.current = null;
    setArtReady(false);
    setId(next);
    const img = new Image();
    img.onload = () => {
      artwork.current = img;
      setArtReady(true);
      setStatus("Wczytano wzór nawierzchni. Zaznacz cztery narożniki na zdjęciu.");
    };
    img.onerror = () => {
      setStatus("Wzór nie jest dostępny. Sprawdź, czy projekt nadal jest publiczny w Warsztacie.");
    };
    img.src = "/api/workshop?id=" + encodeURIComponent(next) + "&format=svg";
  }

  function mark(event: React.MouseEvent<HTMLCanvasElement>) {
    const c = canvas.current;
    if (!c || !photo.current || points.length >= 4) return;
    const rect = c.getBoundingClientRect();
    const x = (event.clientX - rect.left) * c.width / rect.width;
    const y = (event.clientY - rect.top) * c.height / rect.height;
    const next = [...points, { x, y }];
    setPoints(next);
    if (next.length === 4) setStatus(validateCalibrationQuad(next, c.width, c.height)
      ? "Kalibracja gotowa. Sprawdź, czy wzór leży na właściwej nawierzchni."
      : "Narożniki nie tworzą poprawnego wypukłego czworokąta. Cofnij i popraw punkty.");
  }

  function download() {
    const c = canvas.current;
    if (!c || !ready) return;
    // Export only the composite, without interactive calibration handles.
    const ctx = c.getContext("2d");
    if (!ctx || !photo.current || !artwork.current) return;
    const output = document.createElement("canvas");
    output.width = c.width; output.height = c.height;
    const out = output.getContext("2d");
    if (!out) return;
    out.drawImage(photo.current, 0, 0, c.width, c.height);
    if (!validateCalibrationQuad(points, c.width, c.height)) return;
    const layer = document.createElement("canvas");
    layer.width = c.width; layer.height = c.height;
    const layerContext = layer.getContext("2d");
    if (!layerContext) return;
    try { drawCalibratedSurface(layerContext, artwork.current, artwork.current.naturalWidth, artwork.current.naturalHeight, points); }
    catch { setStatus("Eksport nie powiódł się. Sprawdź kalibrację."); return; }
    out.globalAlpha = overlayOpacity / 100;
    out.drawImage(layer, 0, 0);
    output.toBlob(blob => {
      if (!blob) { setStatus("Nie udało się wygenerować PNG."); return; }
      const url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = "gamefields-makeover-koncepcja.png"; a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  return <main style={{ minHeight: "100vh", background: "#f5f5f0", color: "#191b1f", padding: "clamp(18px,4vw,48px)", fontFamily: "Arial,sans-serif" }}>
    <div style={{ maxWidth: 1180, margin: "auto" }}>
      <div style={{ color: "#d86649", fontSize: 12, fontWeight: 800, letterSpacing: ".15em" }}>GAMEFIELDS / CALIBRATION LAB</div>
      <h1 style={{ fontSize: "clamp(34px,6vw,62px)", letterSpacing: "-.06em", margin: "10px 0" }}>Twoje zdjęcie. Nasz projekt.</h1>
      <p style={{ maxWidth: 820, lineHeight: 1.6, color: "#5f635f" }}>Zaznacz narożniki istniejącej nawierzchni, aby dopasować wzór ze Studio w perspektywie. Narzędzie działa lokalnie w przeglądarce, bez przesyłania fotografii. Wynik jest koncepcją, a nie pomiarem ani projektem wykonawczym.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 20 }}>
        <section style={panel}>
          <h2>01 / Kalibracja</h2>
          <label style={label} htmlFor="photo">Zdjęcie istniejącego boiska</label>
          <input id="photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} style={field} />
          <form onSubmit={loadArtwork} style={{ display: "grid", gap: 8, marginTop: 18 }}>
            <label style={label} htmlFor="workshop">UUID zapisanej publicznej konfiguracji</label>
            <input id="workshop" value={draftId} onChange={e => setDraftId(e.target.value)} style={field} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
            <button type="submit" style={dark}>Wczytaj wzór z Warsztatu</button>
          </form>
          <p role="status" style={{ fontSize: 13, color: "#535b55", lineHeight: 1.6 }}>{status}</p>
          <p style={{ color: "#70766e", fontSize: 12 }}>Kolejny punkt: <strong>{points.length < 4 ? labels[points.length] : "Wszystkie zaznaczone"}</strong></p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setPoints(p => p.slice(0,-1))} disabled={!points.length} style={minor}>Cofnij punkt</button>
            <button type="button" onClick={() => setPoints([])} disabled={!points.length} style={minor}>Zacznij od nowa</button>
          </div>
          <label style={{ ...label, display: "block", marginTop: 22 }} htmlFor="opacity">Przezroczystość nakładki: {overlayOpacity}%</label>
          <input id="opacity" type="range" min="10" max="100" value={overlayOpacity} onChange={e => setOverlayOpacity(Number(e.target.value))} style={{ width: "100%", accentColor: "#e97251" }} />
          <label style={{ display: "flex", gap: 9, fontSize: 13, alignItems: "center" }}><input type="checkbox" checked={showPoints} onChange={e => setShowPoints(e.target.checked)} /> Pokaż punkty kalibracji</label>
        </section>
        <section style={panel}>
          <h2>02 / Wynik</h2>
          <div style={{ background: "#e2e5df", borderRadius: 12, minHeight: 240, display: "grid", placeItems: "center", overflow: "hidden" }}>
            <canvas ref={canvas} width={960} height={640} onClick={mark} aria-label="Zdjęcie boiska — kliknij kolejno cztery narożniki nawierzchni" style={{ maxWidth: "100%", height: "auto", cursor: points.length < 4 ? "crosshair" : "default" }} />
            {!photoReady && <p style={{ color: "#626863", textAlign: "center" }}>Najpierw wybierz zdjęcie boiska.</p>}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.55, color: "#636760" }}>Projekt: {id || "nie wybrano"} · {artReady ? "wzór załadowany" : "brak wzoru"}. Dokładne wymiary wynikają z konfiguracji Studio, lecz cztery punkty na fotografii nie potwierdzają rzeczywistych wymiarów terenu.</p>
          <button type="button" style={{ ...dark, width: "100%", opacity: ready ? 1 : .5 }} disabled={!ready} onClick={download}>Pobierz PNG koncepcji</button>
        </section>
      </div>
    </div>
  </main>;
}

const panel: React.CSSProperties = { background: "white", border: "1px solid #ddded7", borderRadius: 20, padding: 22 };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700 };
const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #c9cec7", borderRadius: 10, marginTop: 7 };
const dark: React.CSSProperties = { padding: 13, border: 0, borderRadius: 10, background: "#17191b", color: "white", fontWeight: 700, cursor: "pointer" };
const minor: React.CSSProperties = { padding: 10, borderRadius: 9, background: "white", border: "1px solid #cbd0ca", cursor: "pointer" };
