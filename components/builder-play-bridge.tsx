"use client";

import { useEffect, useState } from "react";

type CourtContext = {
  id: string;
  name: string;
  district: string | null;
  address: string | null;
  sport: string;
  builderSport: string;
};

const STORAGE_KEY = "gamefields:builder:play-context";

function clickButtonContaining(label: string) {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
  const button = buttons.find((candidate) => candidate.textContent?.includes(label));
  if (!button) return false;
  button.click();
  return true;
}

function setReactInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function BuilderPlayBridge() {
  const [context, setContext] = useState<CourtContext | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") !== "play") return;

    const courtId = params.get("court") || "";
    const sport = params.get("sport") === "Koszykówka 3×3" ? "basketball" : "football";
    const builderSport = sport === "basketball" ? "Koszykówka 3×3" : "Piłka nożna 3×3";
    if (!courtId) return;

    let cancelled = false;
    let retries = 0;

    async function bootstrap() {
      let next: CourtContext = {
        id: courtId,
        name: "Boisko Gamefields PLAY",
        district: null,
        address: null,
        sport,
        builderSport,
      };

      try {
        const response = await fetch(`/api/play/court?id=${encodeURIComponent(courtId)}&sport=${sport}`, { cache: "no-store" });
        const data = await response.json();
        if (response.ok && data.ok && data.court) {
          next = {
            id: courtId,
            name: data.court.name || next.name,
            district: data.court.district || null,
            address: data.court.address || null,
            sport,
            builderSport,
          };
        }
      } catch {
        // The bridge can still initialize a sport preset without court metadata.
      }

      if (cancelled) return;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setContext(next);

      const applyPreset = () => {
        if (cancelled) return;
        retries += 1;

        const projectName = document.querySelector<HTMLInputElement>("input.projectname");
        if (projectName) {
          const changeSport = Array.from(document.querySelectorAll<HTMLButtonElement>("button"))
            .find((button) => button.textContent?.includes("Zmień dyscyplinę"));
          if (changeSport) {
            changeSport.click();
            window.setTimeout(applyPreset, 80);
            return;
          }
        }

        if (clickButtonContaining(builderSport)) {
          window.setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>("input.projectname");
            if (input) setReactInputValue(input, `Redesign — ${next.name}`.slice(0, 190));
          }, 120);
          return;
        }

        if (retries < 18) window.setTimeout(applyPreset, 100);
      };

      applyPreset();
    }

    void bootstrap();
    return () => { cancelled = true; };
  }, []);

  if (!context) return null;

  return (
    <aside style={styles.bridge} aria-label="Gamefields PLAY Builder context">
      <div>
        <span style={styles.eyebrow}>PLAY → BUILDER</span>
        <strong style={styles.name}>{context.name}</strong>
        <small style={styles.meta}>{context.district || context.address || context.builderSport}</small>
      </div>
      <a style={styles.back} href={`/play/court?id=${encodeURIComponent(context.id)}&sport=${context.sport}`}>
        WRÓĆ DO BOISKA
      </a>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bridge: {
    position: "fixed",
    right: 14,
    bottom: 14,
    zIndex: 120,
    width: "min(340px, calc(100vw - 28px))",
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 15,
    border: "1px solid #54786a",
    background: "rgba(20,36,31,.96)",
    color: "#f3f6f3",
    boxShadow: "0 16px 45px rgba(0,0,0,.28)",
    fontFamily: "Arial,sans-serif",
  },
  eyebrow: { display: "block", color: "#d8ff77", fontSize: 9, fontWeight: 900, letterSpacing: 1.2 },
  name: { display: "block", maxWidth: 190, marginTop: 3, fontSize: 13, lineHeight: 1.2 },
  meta: { display: "block", maxWidth: 190, marginTop: 3, color: "#aebcb6", fontSize: 10 },
  back: { color: "#d8ff77", textDecoration: "none", fontSize: 9, lineHeight: 1.2, fontWeight: 900, textAlign: "right" },
};
