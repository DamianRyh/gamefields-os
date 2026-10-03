"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./play.css";

const items = [
  ["PLAY", "/play"],
  ["COURTS", "/play/courts"],
  ["GAMES", "/play/games"],
  ["PLAYERS", "/play/players"],
  ["TOURNAMENTS", "/play/tournaments"],
  ["COMMUNITY", "/play/community"],
  ["ACCOUNT", "/play/account"],
] as const;

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/play/auth";
  const [ready, setReady] = useState(isAuthPage);

  useEffect(() => {
    if (isAuthPage) {
      setReady(true);
      return;
    }

    let cancelled = false;
    async function guard() {
      try {
        const response = await fetch("/api/play/auth", { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || !data.authenticated) {
          const returnTo = `${window.location.pathname}${window.location.search}`;
          window.location.replace(`/play/auth?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
        setReady(true);
      } catch {
        if (!cancelled) window.location.replace("/play/auth");
      }
    }
    void guard();
    return () => { cancelled = true; };
  }, [isAuthPage, pathname]);

  if (!ready) {
    return <div className="play-shell" style={{ display: "grid", placeItems: "center", color: "#91a3ad", fontFamily: "Arial,sans-serif" }}>Ładowanie PLAY…</div>;
  }

  return (
    <div className="play-shell">
      {children}
      {!isAuthPage ? (
        <nav className="play-nav" aria-label="Gamefields PLAY">
          {items.map(([label, href]) => (
            <Link className="play-nav-link" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
