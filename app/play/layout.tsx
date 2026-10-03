import Link from "next/link";
import "./play.css";

const items = [
  ["PLAY", "/play"],
  ["COURTS", "/play/courts"],
  ["GAMES", "/play/games"],
  ["PLAYERS", "/play/players"],
  ["TOURNAMENTS", "/play/tournaments"],
  ["COMMUNITY", "/play/community"],
] as const;

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="play-shell">
      {children}
      <nav className="play-nav" aria-label="Gamefields PLAY">
        {items.map(([label, href]) => (
          <Link className="play-nav-link" href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
