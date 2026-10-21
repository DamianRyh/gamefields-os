import type {Metadata} from "next";
import {GamefieldsHeader} from "@/components/gamefields-header";
import {Grid2X2} from "lucide-react";
import {RadarExperience} from "@/components/radar-experience";

export const metadata:Metadata={title:"Gamefields Radar | Nowe możliwości miejskich przestrzeni",description:"Odkryj miejskie przestrzenie sportowe i możliwości ich przemiany z Gamefields."};

export default function RadarPage(){
 return <main className="radar-page">
 <GamefieldsHeader section="radar"/>
  <section className="radar-hero"><span>GAMEFIELDS RADAR · PILOTAŻ W WARSZAWIE</span><h1>Jak mogłoby<br/>zmienić się to miasto?</h1><p>Poznaj pomysły Gamefields na rzeczywiste miejskie przestrzenie.</p><small>3 niezależne koncepcje · Warszawa</small></section>
  <RadarExperience/>
  <footer className="radar-footer"><b>Niezależna koncepcja Gamefields.</b><p>Wizualizacje przedstawiają niezależne koncepcje możliwych przemian. Nie oznaczają planowanej inwestycji, zgody właściciela terenu ani decyzji administracyjnej.</p></footer>
 </main>
}
