"use client";

import { useEffect, useRef, useState } from "react";
import { MakeoverComparison } from "@/components/makeover-comparison";

/**
 * Isolated read-only QA surface. Intentionally not linked from the production Studio.
 * It reuses the existing /workshop-preview snapshot (same validated project renderer),
 * never writes to /api/workshop, and never auto-publishes user images.
 */
export default function MakeoverLab() {
  const [draftId, setDraftId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [beforeSrc, setBeforeSrc] = useState("");
  const [afterSrc, setAfterSrc] = useState("");
  const [status, setStatus] = useState("Wprowadź identyfikator publicznego projektu z Warsztatu.");
  const [busy, setBusy] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("id") || "";
    if (/^[0-9a-f-]{36}$/i.test(query)) setDraftId(query);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const value = event.data;
      if (!value || value.type !== "gf-workshop-preview" || value.id !== projectId) return;
      if (typeof value.image !== "string" || value.image.length > 2_800_000 || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value.image)) {
        setStatus("Odrzucono nieprawidłowy obraz podglądu.");
        setBusy(false);
        return;
      }
      setAfterSrc(value.image);
      setBusy(false);
      setStatus("Podgląd 3D zapisanej konfiguracji jest gotowy.");
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [projectId]);

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  function loadProject(event: React.FormEvent) {
    event.preventDefault();
    const id = draftId.trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      setStatus("Podaj prawidłowy identyfikator UUID publicznego projektu.");
      return;
    }
    setAfterSrc("");
    setProjectId(id);
    setBusy(true);
    setStatus("Ładujemy istniejący render 3D. To może potrwać kilkanaście sekund.");
  }

  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2_000_000) {
      setStatus("Wybierz zdjęcie JPG, PNG lub WebP do 2 MB.");
      event.currentTarget.value = "";
      return;
    }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setBeforeSrc(objectUrl.current);
    setStatus("Zdjęcie wczytano lokalnie. Nie zostało wysłane na serwer.");
  }

  return (
    <main style={{ minHeight: "100vh", padding: "clamp(20px,4vw,56px)", background: "#f3f3ef", color: "#181b1c", fontFamily: "Arial,sans-serif" }}>
      <div style={{ maxWidth: 1080, margin: "auto" }}>
        <div style={{ color: "#d56449", fontSize: 12, fontWeight: 800, letterSpacing: ".16em" }}>GAMEFIELDS / MAKEOVER LAB</div>
        <h1 style={{ fontSize: "clamp(36px,6vw,64px)", letterSpacing: "-.06em", margin: "12px 0" }}>Od miejsca do koncepcji.</h1>
        <p style={{ maxWidth: 740, lineHeight: 1.6, color: "#626662" }}>
          Eksperymentalny podgląd tylko do testów. Korzysta z zapisanej publicznej konfiguracji Warsztatu i jej istniejącego renderera 3D.
          Zdjęcie „przed” i render „po” nie są automatycznie wyrównywane geometrycznie.
        </p>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", alignItems: "start" }}>
          <section style={panel}>
            <h2 style={{ marginTop: 0 }}>01 / Źródła</h2>
            <form onSubmit={loadProject} style={{ display: "grid", gap: 12 }}>
              <label htmlFor="workshop-id" style={label}>UUID publicznego projektu Warsztatu</label>
              <input id="workshop-id" required value={draftId} onChange={e => setDraftId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={input} />
              <button style={button} type="submit" disabled={busy}>{busy ? "Generowanie podglądu…" : "Pobierz render zapisanej konfiguracji"}</button>
            </form>
            <label htmlFor="before-photo" style={{ ...label, marginTop: 24, display: "block" }}>Zdjęcie stanu istniejącego (lokalnie)</label>
            <input id="before-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} style={{ ...input, marginTop: 8 }} />
            <p role="status" style={{ fontSize: 13, color: "#656a67", lineHeight: 1.5 }}>{status}</p>
            {projectId && busy && (
              <iframe
                ref={frame}
                title="Generowanie istniejącego renderu 3D"
                src={`/workshop-preview?id=${encodeURIComponent(projectId)}&parentOrigin=${encodeURIComponent(window.location.origin)}`}
                style={{ width: "100%", height: 250, border: "1px solid #ddd", borderRadius: 12 }}
              />
            )}
          </section>
          <section style={panel}>
            <h2 style={{ marginTop: 0 }}>02 / Porównanie</h2>
            {beforeSrc && afterSrc ? (
              <MakeoverComparison
                beforeSrc={beforeSrc}
                afterSrc={afterSrc}
                beforeAlt="Zdjęcie istniejącej lokalizacji wybrane z urządzenia"
                afterAlt="Render 3D zapisanej konfiguracji GAMEFIELDS"
                conceptLabel="Zestawienie poglądowe — perspektywa i skala nie są skalibrowane. Nie używać jako dokładnego fotomontażu inwestycyjnego."
              />
            ) : (
              <div style={{ minHeight: 300, display: "grid", placeItems: "center", background: "#e9e9e4", borderRadius: 16, padding: 20, color: "#676a66", textAlign: "center" }}>
                Wczytaj projekt 3D i dodaj zdjęcie, aby uruchomić porównanie.
              </div>
            )}
            <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
              Brak zapisu, wysyłki zdjęcia, automatycznej publikacji i powiązania ze zgłoszeniami mieszkańców.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

const panel: React.CSSProperties = { background: "#fff", padding: 24, borderRadius: 22, border: "1px solid #dedfd9" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 10, border: "1px solid #cdd0cc", fontSize: 14 };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700 };
const button: React.CSSProperties = { padding: 14, background: "#191b1e", color: "#fff", border: 0, borderRadius: 10, fontWeight: 700, cursor: "pointer" };
