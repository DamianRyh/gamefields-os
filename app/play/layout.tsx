"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./play.css";
import {House,MapPin,Users,Gamepad2,Menu} from "lucide-react";

const items = [
  ["PLAY", "/play", House],
  ["MAP", "/play/map", MapPin],
  ["GAMES", "/play/games", Gamepad2],
  ["PLAYERS", "/play/players", Users],
  ["WIĘCEJ", "/play/more", Menu],
] as const;

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/play/auth";
  const isOnboardingPage = pathname === "/play/onboarding";
  const isBarePage = isAuthPage || isOnboardingPage || pathname === "/play/builder";
  const [ready, setReady] = useState(isAuthPage);

  useEffect(() => {
    if (isAuthPage) {
      setReady(true);
      return;
    }

    let cancelled = false;
    async function guard() {
      try {
        const authResponse = await fetch("/api/play/auth", { cache: "no-store" });
        const auth = await authResponse.json();
        if (cancelled) return;
        if (!authResponse.ok || !auth.authenticated) {
          const returnTo = `${window.location.pathname}${window.location.search}`;
          window.location.replace(`/play/auth?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }

        if (pathname === "/play") {
          const bootstrapResponse = await fetch("/api/play", { cache: "no-store" });
          const bootstrap = await bootstrapResponse.json();
          if (cancelled) return;
          if (bootstrapResponse.ok && bootstrap.ok && Array.isArray(bootstrap.homeCourts) && bootstrap.homeCourts.length === 0) {
            window.location.replace("/play/onboarding");
            return;
          }
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
    <div className={pathname === "/play/builder" ? "play-shell play-builder-shell" : "play-shell"}>
      {children}
      {!isBarePage ? (
        <nav className="play-nav" aria-label="Gamefields PLAY">
          {items.map(([label, href, Icon]) => (
            <Link className={pathname===href?"play-nav-link active":"play-nav-link"} aria-current={pathname===href?"page":undefined} href={href} key={href}>
              <Icon aria-hidden="true"/>{label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
