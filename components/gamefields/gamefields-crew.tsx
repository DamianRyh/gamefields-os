"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./gamefields-crew.module.css";

type ExpertId = "marek" | "kuba" | "ola" | "alex";
type Expert = { id: ExpertId; name: string; role: string; face: string; accent: string; intro: string; path: string; destination: string };
const experts: Expert[] = [
  { id: "marek", name: "Marek", role: "Formalności", face: "👨🏻‍💼", accent: "#88afd1", intro: "Najpierw ustalmy status działki, wymagania formalne i cel inwestycji. Mogę przeprowadzić Cię przez kolejne kroki.", path: "/projects", destination: "Zobacz projekty" },
  { id: "kuba", name: "Kuba", role: "Zgłoś boisko", face: "🧢", accent: "#c5a2fc", intro: "Chcesz boisko w swojej okolicy? Zacznij od lokalizacji, zdjęć terenu i potrzeb społeczności.", path: "/studio", destination: "Zaprojektuj pomysł" },
  { id: "ola", name: "Ola", role: "Konstrukcje", face: "👷🏻‍♀️", accent: "#ffc074", intro: "Sprawdźmy konstrukcję, nawierzchnię i warunki montażu. Parametry potwierdzimy w dokumentacji konkretnego modelu.", path: "/products", destination: "Poznaj produkty" },
  { id: "alex", name: "Alex", role: "Street football", face: "⚽", accent: "#fd9eb0", intro: "Każde boisko może żyć! Pokażę Ci formaty gry, pomysły na turnieje i treningi.", path: "/play", destination: "Przejdź do PLAY" }
];
const key = "gamefields-crew-guide-v1";
const hints: Record<ExpertId, Record<string, string>> = {
  marek: { studio: "Projekt w Studio to dobry początek. Przed realizacją sprawdź status działki oraz wymagane uzgodnienia.", products: "Parametry produktu warto ująć w opisie przedmiotu zamówienia.", projects: "Każda inwestycja zaczyna się od potrzeb użytkowników i ram budżetu.", play: "Planując inwestycję publiczną, warto przewidzieć także sposób zarządzania obiektem.", default: "Wybierzmy cel inwestycji i sprawdźmy dostępne rozwiązania." },
  kuba: { studio: "Stwórz wizualizację — pomoże pokazać mieszkańcom, o jakie boisko chodzi.", products: "Wybierz format, który pasuje do Twojego podwórka lub dzielnicy.", projects: "Zbierz zdjęcia terenu i opinie sąsiadów. To przydatny początek zgłoszenia.", play: "Zorganizuj pierwszą grę i pokaż, że społeczność naprawdę potrzebuje miejsca.", default: "Masz pomysł na nowe boisko? Zacznijmy od znalezienia miejsca." },
  ola: { studio: "Zmieniając wymiary, pamiętaj także o strefach bezpieczeństwa i miejscu montażu.", products: "Przy wyborze konstrukcji sprawdź dokumentację materiałową i montażową.", projects: "Warunki podłoża i dostęp do terenu mają wpływ na zakres prac.", play: "Dobór nawierzchni powinien uwzględniać sposób użytkowania i konserwację.", default: "Chcesz wejść w szczegóły techniczne? Sprawdźmy parametry." },
  alex: { studio: "Zmiana wymiarów wpływa na dynamikę gry i liczbę osób na boisku.", products: "Panna i 3 na 3 oferują różne doświadczenia. Dopasuj format do graczy.", projects: "Warto już na etapie projektu zaplanować wydarzenie otwarcia.", play: "Czas na grę! Zobacz, jak przestrzeń może stać się miejscem spotkań.", default: "Dobre boisko to takie, na którym ludzie chcą grać." }
};
function section(path: string) {
  if (path.startsWith("/studio") || path === "/") return "studio";
  if (path.startsWith("/products")) return "products";
  if (path.startsWith("/projects")) return "projects";
  if (path.startsWith("/play")) return "play";
  return "default";
}
export default function GamefieldsCrew() {
  const pathname = usePathname() || "/";
  const [chosen, setChosen] = useState<ExpertId | null>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [eventHint, setEventHint] = useState<string | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved && experts.some((x) => x.id === saved)) setChosen(saved as ExpertId);
      setMuted(localStorage.getItem(key + "-mute") === "1");
    } catch { /* private browsing */ }
    setReady(true);
  }, []);
  useEffect(() => { setEventHint(null); }, [pathname, chosen]);
  useEffect(() => {
    const onSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string; label?: string; value?: string }>).detail;
      if (!detail) return;
      const label = detail.label?.slice(0, 80);
      const value = detail.value?.slice(0, 80);
      if (detail.type === "dimension") setEventHint(`Wybrane wymiary: ${value || "nowy wariant"}. Sprawdź, czy na działce zmieszczą się także wymagane strefy wokół boiska.`);
      else if (detail.type === "surface") setEventHint(`Nawierzchnia ${label || value || ""}: dobór zależy od sportu, podłoża i intensywności użytkowania.`);
      else if (detail.type === "construction") setEventHint(`Konstrukcja ${label || value || ""}: sprawdź parametry w zatwierdzonej dokumentacji technicznej.`);
    };
    window.addEventListener("gamefields:configuration-change", onSelect);
    return () => window.removeEventListener("gamefields:configuration-change", onSelect);
  }, []);
  const active = experts.find(x => x.id === chosen);
  const choose = (id: ExpertId) => {
    setChosen(id);
    setCollapsed(false);
    try { localStorage.setItem(key, id); } catch { /* ignore */ }
  };
  const toggleMute = () => {
    setMuted(prev => { try { localStorage.setItem(key + "-mute", prev ? "0" : "1"); } catch { /* ignore */ } return !prev; });
  };
  return (
    <aside className={styles.shell} aria-label="GAMEFIELDS CREW — wybierz przewodnika">
      <div className={styles.top}>
        <span className={styles.logo}>GF<span> CREW</span></span>
        <div className={styles.people}>
          {experts.map(x => (
            <button key={x.id} type="button" onClick={() => choose(x.id)}
              className={styles.person + (chosen === x.id ? " " + styles.selected : "")}
              style={{ "--expert": x.accent } as React.CSSProperties}
              aria-label={`Wybierz przewodnika: ${x.name}, ${x.role}`}
              aria-pressed={chosen === x.id} title={x.name + " — " + x.role}>
              <span aria-hidden="true" className={styles.face}>{x.face}</span>
              <span className={styles.name}>{x.name}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.privacy} onClick={toggleMute} aria-label={muted ? "Włącz wskazówki" : "Wycisz wskazówki"}>{muted ? "Włącz" : "Wycisz"}</button>
      </div>
      {ready && active && !muted && (
        <div className={styles.bubble} role="status" aria-live="polite">
          <button className={styles.close} type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Rozwiń wskazówkę" : "Zwiń wskazówkę"}>{collapsed ? "+" : "×"}</button>
          {!collapsed && <>
            <strong>{active.name} · {active.role}</strong>
            <p>{eventHint || (section(pathname) === "default" ? active.intro : hints[active.id][section(pathname)])}</p>
            <Link href={active.path} className={styles.link}>{active.destination} ↗</Link>
          </>}
        </div>
      )}
    </aside>
  );
}
