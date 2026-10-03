import Link from "next/link";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#071016", paddingBottom: 78 }}>
      {children}
      <nav style={{ position: "fixed", left: "50%", bottom: 12, transform: "translateX(-50%)", zIndex: 50, display: "flex", gap: 4, padding: 6, borderRadius: 18, border: "1px solid #263b45", background: "rgba(8,18,24,.94)", backdropFilter: "blur(18px)", boxShadow: "0 14px 44px rgba(0,0,0,.35)", maxWidth: "calc(100vw - 20px)", overflowX: "auto" }}>
        <Link href="/play" style={link}>PLAY</Link>
        <Link href="/play/courts" style={link}>COURTS</Link>
        <Link href="/play/games" style={link}>GAMES</Link>
        <Link href="/play/players" style={link}>PLAYERS</Link>
        <Link href="/play/tournaments" style={link}>TOURNAMENTS</Link>
        <Link href="/play/community" style={link}>COMMUNITY</Link>
      </nav>
    </div>
  );
}

const link: React.CSSProperties = { color: "#dce8e5", textDecoration: "none", fontFamily: "Arial,sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: .35, padding: "10px 10px", borderRadius: 12, whiteSpace: "nowrap" };
