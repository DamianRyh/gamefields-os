import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gamefields Studio — konfigurator boisk",
  description: "Zaprojektuj boisko: wymiary, nawierzchnia, kolory, linie i wyposażenie. Gamefields OS — prototyp v0.1.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
