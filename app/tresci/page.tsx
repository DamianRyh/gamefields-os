import type { Metadata } from "next";
import ContentStudio from "./content-studio";
import "./tresci.css";

export const metadata: Metadata = {
  title: "Studio treści",
  description: "Plan, kalendarz i wyniki treści marki osobistej Gamefields.",
  robots: { index: false, follow: false },
};

export default function TresciPage() {
  return <ContentStudio />;
}
