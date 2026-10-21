import type {Metadata} from "next";
import {GamefieldsHeader} from "@/components/gamefields-header";
import {notFound} from "next/navigation";
import {ArrowLeft,Grid2X2} from "lucide-react";
import {BeforeAfterSlider} from "@/components/before-after-slider";
import {RadarMedia} from "@/components/radar-media";
import {getRadarLocation,radarLocations} from "@/lib/radar-locations";

const sportLabel=(sport:string)=>({Basketball:"Koszykówka",Football:"Piłka nożna",Multisport:"Wielofunkcyjne"} as Record<string,string>)[sport]||sport;

export function generateStaticParams(){return radarLocations.map(location=>({slug:location.slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params,location=getRadarLocation(slug);
 if(!location)return {};
 return {title:`${location.name} – Koncepcja Gamefields | Gamefields Radar`,description:location.shortDescription,openGraph:{images:location.afterStreet?[location.afterStreet]:undefined}};
}

export default async function RadarLocationPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,location=getRadarLocation(slug);if(!location)notFound();
 return <main className="radar-page radar-detail">
 <GamefieldsHeader section="radar"/>
  <section className="radar-detail-hero"><a href="/radar"><ArrowLeft size={17}/> WRÓĆ DO MAPY</a><span>{location.city} / {location.district}</span><h1>{location.name}</h1><div><b>{location.status}</b><i>{sportLabel(location.sport)}</i></div><p>{location.shortDescription}</p></section>
  <section className="radar-detail-section radar-transformation"><header><span>01 / PRZEMIANA</span><h2>{location.beforeStreet?"Przed → po":"Podgląd koncepcji"}</h2><p>{location.beforeStreet?"Przesuń uchwyt, aby odkryć możliwą transformację przestrzeni.":"Pełne porównanie opublikujemy po pozyskaniu i weryfikacji zdjęć tej lokalizacji."}</p></header>{location.beforeStreet?<BeforeAfterSlider before={location.beforeStreet} after={location.afterStreet} name={location.name}/>:<div className="radar-preview-only"><RadarMedia src={location.afterStreet} alt={`${location.name} — demonstracyjna koncepcja`} label="PODGLĄD KONCEPCJI" kind="concept" priority demo/><div><b>Materiał demonstracyjny</b><p>To kierunek wizualny, nie dokumentacja istniejącego miejsca ani zatwierdzony projekt inwestycyjny.</p></div></div>}</section>
  <section className="radar-detail-section"><header><span>02 / WIDOK Z GÓRY</span><h2>Nowa wizja przestrzeni</h2></header><div className="radar-image-pair"><RadarMedia src={location.beforeAerial} alt={`${location.name} — stan obecny z góry`} label="STAN OBECNY" kind="current"/><RadarMedia src={location.afterAerial} alt={`${location.name} — koncepcja z góry`} label="PODGLĄD KONCEPCJI" kind="concept" demo={location.mediaStatus==="demo"}/></div></section>
  <section className="radar-detail-section"><header><span>03 / PERSPEKTYWA UŻYTKOWNIKA</span><h2>Z poziomu boiska</h2></header><div className="radar-image-pair"><RadarMedia src={location.beforeStreet} alt={`${location.name} — stan obecny`} label="STAN OBECNY" kind="current"/><RadarMedia src={location.afterStreet} alt={`${location.name} — perspektywa koncepcji`} label="PODGLĄD KONCEPCJI" kind="concept" demo={location.mediaStatus==="demo"}/></div></section>
  <section className="radar-detail-section radar-about"><header><span>04 / O KONCEPCJI</span><h2>Niezależna wizja miejskiego sportu</h2></header><dl><div><dt>Sport</dt><dd>{sportLabel(location.sport)}</dd></div><div><dt>Typ</dt><dd>{location.type}</dd></div><div><dt>Zakres</dt><dd>{location.scope}</dd></div><div><dt>Status</dt><dd>Niezależna koncepcja</dd></div></dl><p>{location.shortDescription} Materiały wizualne mają charakter demonstracyjny i mogą zostać łatwo zastąpione docelowymi renderami.</p></section>
  <footer className="radar-footer"><b>Niezależna koncepcja Gamefields.</b><p>Wizualizacja przedstawia niezależną koncepcję możliwej przemiany przestrzeni. Nie oznacza planowanej inwestycji, zgody właściciela terenu ani decyzji administracyjnej.</p></footer>
 </main>
}
