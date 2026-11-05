import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gamefields",
    short_name: "Gamefields",
    description: "Projektowanie boisk i mapa lokalizacji oraz koncepcji renowacji.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F7F3",
    theme_color: "#F8F7F3",
    orientation: "portrait-primary",
    categories: ["sports", "design"],
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
