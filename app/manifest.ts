import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gamefields PLAY",
    short_name: "GF PLAY",
    description: "Znajdź boisko, dołącz do gry, rywalizuj lokalnie i rozwijaj sportową mapę miasta.",
    start_url: "/play",
    display: "standalone",
    background_color: "#071016",
    theme_color: "#071016",
    orientation: "portrait-primary",
    categories: ["sports", "social", "lifestyle"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
