"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {GamefieldsHeader} from "@/components/gamefields-header";
import {ArrowLeft,Grid2X2} from "lucide-react";
import {BeforeAfterSlider} from "@/components/before-after-slider";
import {RadarMedia} from "@/components/radar-media";
import type {RadarLocation} from "@/lib/radar-locations";

const sportLabel=(sport:string)=>({Basketball:"Koszykówka",Football:"Piłka nożna",Multisport:"Wielofunkcyjne"} as Record<string,string>)[sport]||sport;

export function RadarLocationContent({location}:{location:RadarLocation}){
 const {display:tr,href}=useStudioLanguage();
 return <main className="radar-page radar-detail">
 <GamefieldsHeader section="radar"/>
  <section className="radar-detail-hero"><a href={href("/radar")}><ArrowLeft size={17}/> {tr("WRÓĆ DO MAPY")}</a><span>{tr(location.city)} / {location.district}</span><h1>{location.name}</h1><div><b>{tr(location.status)}</b><i>{tr(sportLabel(location.sport))}</i></div><p>{tr(location.shortDescription)}</p></section>
  <section className="radar-detail-section radar-transformation"><header><span>{tr("01 / PRZEMIANA")}</span><h2>{tr(location.beforeStreet?"Przed → po":"Podgląd koncepcji")}</h2><p>{tr(location.beforeStreet?"Przesuń uchwyt, aby odkryć możliwą transformację przestrzeni.":"Pełne porównanie opublikujemy po pozyskaniu i weryfikacji zdjęć tej lokalizacji.")}</p></header>{location.beforeStreet?<BeforeAfterSlider before={location.beforeStreet} after={location.afterStreet} name={location.name}/>:<div className="radar-preview-only"><RadarMedia src={location.afterStreet} alt={`${location.name} — ${tr("demonstracyjna koncepcja")}`} label={tr("PODGLĄD KONCEPCJI")} kind="concept" priority demo/><div><b>{tr("Materiał demonstracyjny")}</b><p>{tr("To kierunek wizualny, nie dokumentacja istniejącego miejsca ani zatwierdzony projekt inwestycyjny.")}</p></div></div>}</section>
  <section className="radar-detail-section"><header><span>{tr("02 / WIDOK Z GÓRY")}</span><h2>{tr("Nowa wizja przestrzeni")}</h2></header><div className="radar-image-pair"><RadarMedia src={location.beforeAerial} alt={`${location.name} — ${tr("stan obecny z góry")}`} label={tr("STAN OBECNY")} kind="current"/><RadarMedia src={location.afterAerial} alt={`${location.name} — ${tr("koncepcja z góry")}`} label={tr("PODGLĄD KONCEPCJI")} kind="concept" demo={location.mediaStatus==="demo"}/></div></section>
  <section className="radar-detail-section"><header><span>{tr("03 / PERSPEKTYWA UŻYTKOWNIKA")}</span><h2>{tr("Z poziomu boiska")}</h2></header><div className="radar-image-pair"><RadarMedia src={location.beforeStreet} alt={`${location.name} — ${tr("stan obecny")}`} label={tr("STAN OBECNY")} kind="current"/><RadarMedia src={location.afterStreet} alt={`${location.name} — ${tr("perspektywa koncepcji")}`} label={tr("PODGLĄD KONCEPCJI")} kind="concept" demo={location.mediaStatus==="demo"}/></div></section>
  <section className="radar-detail-section radar-about"><header><span>{tr("04 / O KONCEPCJI")}</span><h2>{tr("Niezależna wizja miejskiego sportu")}</h2></header><dl><div><dt>Sport</dt><dd>{tr(sportLabel(location.sport))}</dd></div><div><dt>{tr("Typ")}</dt><dd>{tr(location.type)}</dd></div><div><dt>{tr("Zakres")}</dt><dd>{tr(location.scope)}</dd></div><div><dt>Status</dt><dd>{tr("Niezależna koncepcja")}</dd></div></dl><p>{tr(location.shortDescription)} {tr("Materiały wizualne mają charakter demonstracyjny i mogą zostać łatwo zastąpione docelowymi renderami.")}</p></section>
  <footer className="radar-footer"><b>{tr("Niezależna koncepcja Gamefields.")}</b><p>{tr("Wizualizacja przedstawia niezależną koncepcję możliwej przemiany przestrzeni. Nie oznacza planowanej inwestycji, zgody właściciela terenu ani decyzji administracyjnej.")}</p></footer>
 </main>
}
