import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./brand.css";
import "./studio-workspace.css";
import "./court-culture.css";
import "./studio-canvas.css";
import "./studio-usability.css";
import "./studio-readability.css";
import "./studio-pricing.css";
import "./studio-mobile.css";
import "./studio-skin-2026-11.css";

export const metadata: Metadata = {
  title: {
    default: "Gamefields",
    template: "%s — Gamefields",
  },
  description: "Projektuj boiska, dobieraj nawierzchnie i odkrywaj koncepcje renowacji na mapie Gamefields.",
  applicationName: "Gamefields",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gamefields",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6336F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        {children}
        {/* Gamefields Crew (Marek, Kuba, Ola, Alex) is off for the launch (owner, 2026-11-08); the component stays in components/gamefields-crew.tsx. */}
      </body>
    </html>
  );
}
