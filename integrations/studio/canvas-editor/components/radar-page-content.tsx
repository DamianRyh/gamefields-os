"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {GamefieldsHeader} from "@/components/gamefields-header";
import {Grid2X2} from "lucide-react";
import {RadarExperience} from "@/components/radar-experience";


export function RadarPageContent(){
 const {display:tr}=useStudioLanguage();
 return <main className="radar-page">
 <GamefieldsHeader section="radar"/>
  <section className="radar-hero"><span>{tr("GAMEFIELDS RADAR · PILOTAŻ W WARSZAWIE")}</span><h1>{tr("Jak mogłoby")}<br/>{tr("zmienić się to miasto?")}</h1><p>{tr("Poznaj pomysły Gamefields na rzeczywiste miejskie przestrzenie.")}</p><small>{tr("3 niezależne koncepcje · Warszawa")}</small></section>
  <RadarExperience/>
  <footer className="radar-footer"><b>{tr("Niezależna koncepcja Gamefields.")}</b><p>{tr("Wizualizacje przedstawiają niezależne koncepcje możliwych przemian. Nie oznaczają planowanej inwestycji, zgody właściciela terenu ani decyzji administracyjnej.")}</p></footer>
 </main>
}
