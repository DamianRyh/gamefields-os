"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Submission = { id: string; name: string; city: string; district: string | null; sports: string[]; status: string; createdAt: string; publishedCourtId: string | null };

export default function AddCourtPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Warszawa");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [football, setFootball] = useState(true);
  const [basketball, setBasketball] = useState(false);
  const [surface, setSurface] = useState("hard");
  const [lighting, setLighting] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  async function load() {
    const response = await fetch("/api/play/courts/submissions", { cache: "no-store" });
    const data = await response.json();
    if (response.ok && data.ok) setSubmissions(data.submissions || []);
  }
  useEffect(() => { void load(); }, []);

  function locate() {
    setError("");
    if (!navigator.geolocation) { setError("Lokalizacja nie jest dostępna w tej przeglądarce."); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => { setLat(position.coords.latitude.toFixed(6)); setLng(position.coords.longitude.toFixed(6)); },
      () => setError("Nie udało się pobrać lokalizacji. Możesz wpisać współrzędne ręcznie."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setSuccess("");
    try {
      const sports = [football ? "football" : null, basketball ? "basketball" : null].filter(Boolean);
      const response = await fetch("/api/play/courts/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, district, address, latitude: Number(lat), longitude: Number(lng), sports, surface, lighting, isFree, notes }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "REQUEST_FAILED");
      setSuccess("Miejsce wysłane do weryfikacji. Po akceptacji pojawi się na mapie PLAY.");
      setName(""); setDistrict(""); setAddress(""); setNotes("");
      await load();
    } catch (e) {
      const code = e instanceof Error ? e.message : "REQUEST_FAILED";
      setError(code === "INVALID_LATITUDE" || code === "INVALID_LONGITUDE" ? "Sprawdź współrzędne miejsca." : code === "SPORT_REQUIRED" ? "Wybierz przynajmniej jedną dyscyplinę." : code === "INVALID_NAME" ? "Podaj nazwę miejsca." : "Nie udało się wysłać miejsca.");
    } finally { setBusy(false); }
  }

  return <main style={s.page}>
    <header style={s.header}><div><div style={s.kicker}>COURT NETWORK</div><h1 style={s.h1}>Dodaj miejsce do gry.</h1><p style={s.muted}>Znasz boisko, którego nie ma w Gamefields? Dodaj je. Po weryfikacji stanie się częścią mapy i lokalnej społeczności.</p></div><Link href="/play/map" style={s.back}>← MAPA</Link></header>
    <section style={s.layout}>
      <form style={s.form} onSubmit={submit}>
        <div style={s.sectionTitle}>01 / MIEJSCE</div>
        <label style={s.label}>Nazwa<input style={s.input} required minLength={3} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Boisko przy ..." /></label>
        <div style={s.two}><label style={s.label}>Miasto<input style={s.input} value={city} onChange={(e) => setCity(e.target.value)} /></label><label style={s.label}>Dzielnica<input style={s.input} value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="np. Mokotów" /></label></div>
        <label style={s.label}>Adres<input style={s.input} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ulica / punkt orientacyjny" /></label>

        <div style={s.sectionTitle}>02 / LOKALIZACJA</div>
        <button type="button" style={s.locate} onClick={locate}>⌖ UŻYJ MOJEJ LOKALIZACJI</button>
        <div style={s.two}><label style={s.label}>Latitude<input style={s.input} type="number" step="any" required value={lat} onChange={(e) => setLat(e.target.value)} /></label><label style={s.label}>Longitude<input style={s.input} type="number" step="any" required value={lng} onChange={(e) => setLng(e.target.value)} /></label></div>
        <p style={s.hint}>Najlepiej stań przy boisku i użyj lokalizacji telefonu. Pozycja służy do umieszczenia obiektu na mapie.</p>

        <div style={s.sectionTitle}>03 / SPORT I WARUNKI</div>
        <div style={s.toggleRow}><button type="button" style={football ? s.toggleOn : s.toggle} onClick={() => setFootball((v) => !v)}>⚽ FOOTBALL</button><button type="button" style={basketball ? s.toggleOn : s.toggle} onClick={() => setBasketball((v) => !v)}>🏀 BASKETBALL</button></div>
        <label style={s.label}>Nawierzchnia<select style={s.input} value={surface} onChange={(e) => setSurface(e.target.value)}><option value="hard">Hard</option><option value="artificial_turf">Artificial turf</option><option value="asphalt">Asphalt</option><option value="rubber">Rubber</option><option value="other">Other</option></select></label>
        <div style={s.toggleRow}><button type="button" style={lighting ? s.toggleOn : s.toggle} onClick={() => setLighting((v) => !v)}>💡 OŚWIETLENIE</button><button type="button" style={isFree ? s.toggleOn : s.toggle} onClick={() => setIsFree((v) => !v)}>FREE</button></div>
        <label style={s.label}>Co warto wiedzieć?<textarea style={{...s.input,minHeight:100,resize:"vertical"}} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="stan boiska, godziny, wejście, bramki, kosze..." /></label>
        {error ? <div style={s.error}>{error}</div> : null}{success ? <div style={s.success}>{success}</div> : null}
        <button type="submit" style={s.primary} disabled={busy}>{busy ? "WYSYŁAM…" : "WYŚLIJ DO WERYFIKACJI"}</button>
      </form>

      <aside style={s.aside}>
        <div style={s.sectionTitle}>TWOJE ZGŁOSZENIA</div>
        <div style={s.list}>{submissions.map((item) => <article key={item.id} style={s.card}><div style={s.cardTop}><b>{item.name}</b><span style={item.status === "approved" ? s.approved : item.status === "rejected" ? s.rejected : s.pending}>{item.status.toUpperCase()}</span></div><div style={s.muted}>{item.district || item.city} · {item.sports.join(" / ")}</div>{item.publishedCourtId ? <Link href={`/play/court?id=${encodeURIComponent(item.publishedCourtId)}&sport=${item.sports[0] || "football"}`} style={s.open}>OTWÓRZ COURT →</Link> : null}</article>)}{!submissions.length ? <div style={s.muted}>Nie wysłałeś jeszcze żadnego miejsca.</div> : null}</div>
        <div style={s.info}><b>Dlaczego moderacja?</b><p>Chcemy uniknąć duplikatów, błędnych lokalizacji i obiektów prywatnych oznaczonych jako publiczne. Zgłoszenie nie trafia na mapę automatycznie.</p></div>
      </aside>
    </section>
  </main>;
}

const s: Record<string, React.CSSProperties> = {page:{minHeight:"100vh",background:"#071016",color:"white",padding:"24px 24px 120px",fontFamily:"Arial,sans-serif"},header:{maxWidth:1100,margin:"0 auto 20px",display:"flex",justifyContent:"space-between",gap:20},kicker:{color:"#77ff55",fontSize:11,fontWeight:900,letterSpacing:1.3},h1:{fontSize:"clamp(42px,7vw,72px)",lineHeight:.92,letterSpacing:-4,margin:"8px 0"},muted:{color:"#91a3ad",fontSize:13,lineHeight:1.5},back:{color:"#77ff55",textDecoration:"none",fontSize:11,fontWeight:900},layout:{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,1.15fr) minmax(280px,.65fr)",gap:12},form:{padding:20,border:"1px solid #213640",borderRadius:20,background:"#0c171e",display:"grid",gap:12},sectionTitle:{marginTop:6,color:"#77ff55",fontSize:10,fontWeight:900,letterSpacing:1.2},label:{display:"grid",gap:6,color:"#b8c8cd",fontSize:11,fontWeight:800},input:{width:"100%",boxSizing:"border-box",padding:"12px 13px",border:"1px solid #2a414b",borderRadius:11,background:"#0a151b",color:"white",fontSize:14},two:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},locate:{padding:12,border:"1px solid #66b8ff",borderRadius:11,background:"#10222c",color:"#66b8ff",fontWeight:900},hint:{margin:"-4px 0 2px",color:"#6f858f",fontSize:10,lineHeight:1.5},toggleRow:{display:"flex",gap:7,flexWrap:"wrap"},toggle:{padding:"10px 12px",border:"1px solid #29404a",borderRadius:10,background:"#0a151b",color:"#8fa2aa",fontWeight:900},toggleOn:{padding:"10px 12px",border:"1px solid #77ff55",borderRadius:10,background:"#15281d",color:"#77ff55",fontWeight:900},primary:{padding:14,border:0,borderRadius:12,background:"#77ff55",color:"#071016",fontWeight:950},error:{padding:11,borderRadius:10,background:"#351519",color:"#ff9da8",fontSize:12},success:{padding:11,borderRadius:10,background:"#14281d",color:"#77ff55",fontSize:12},aside:{display:"grid",alignContent:"start",gap:10},list:{display:"grid",gap:8},card:{padding:14,border:"1px solid #213640",borderRadius:14,background:"#0c171e"},cardTop:{display:"flex",justifyContent:"space-between",gap:8,marginBottom:6},pending:{color:"#ffc866",fontSize:9,fontWeight:900},approved:{color:"#77ff55",fontSize:9,fontWeight:900},rejected:{color:"#ff8894",fontSize:9,fontWeight:900},open:{display:"block",marginTop:10,color:"#77ff55",fontSize:10,fontWeight:900,textDecoration:"none"},info:{marginTop:8,padding:16,borderRadius:14,background:"#101d24",color:"#9db0b8",fontSize:12,lineHeight:1.5}};
