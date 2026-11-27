import type {Metadata} from "next";
import {RadarLocationContent} from "@/components/radar-location-content";
import {notFound} from "next/navigation";
import {getRadarLocation,radarLocations} from "@/lib/radar-locations";


export function generateStaticParams(){return radarLocations.map(location=>({slug:location.slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params,location=getRadarLocation(slug);
 if(!location)return {};
 return {title:`${location.name} – Koncepcja Gamefields | Gamefields Radar`,description:location.shortDescription,openGraph:{images:location.afterStreet?[location.afterStreet]:undefined}};
}

export default async function RadarLocationPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,location=getRadarLocation(slug);if(!location)notFound();
 return <RadarLocationContent location={location}/>;
}
