import CourtConfigurator from "@/components/court-objects/configurator";
import "./objects.css";

export const metadata = {
  title: "Court Objects",
  description:
    "Build a court for your wall. Collectible objects by GAMEFIELDS.",
};
export default function ObjectsPage() {
  return <CourtConfigurator />;
}
