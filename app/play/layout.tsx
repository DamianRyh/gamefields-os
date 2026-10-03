import Link from "next/link";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#071016", paddingBottom: 72 }}>
      {children}
      <nav style={{ position: "fixed", left: "50%", bottom: 14, transform: "translateX(-50%)", zIndex: 50, display: "flex", gap: 6, padding: 6, borderRadius: 18, border: "1px solid #263b45", background: "rgba(8,18,24,.94)", backdropFilter: "blur(18px)", boxShadow: "0 14px 44px rgba(0,0,0,.35)" }}>
        <Link href="/play" style={link}>PLAY</Link>
        <Link href="/play/players" style={link}>PLAYERS</Link>
        <Link href="/play/tournaments" style={link}>TOURNAMENTS</Link>
      </nav>
    </div>
  );
}

const link: React.CSSProperties = { color: "#dce8e5", textDecoration: "none", fontFamily: "Arial,sans-serif", fontSize: 11, fontWeight: 900, letterSpacing: .5, padding: "10px 12px", borderRadius: 12 };
