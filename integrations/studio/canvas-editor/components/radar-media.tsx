"use client";
import {useStudioLanguage} from "@/components/studio-language";
import Image from "next/image";
import {ImageOff} from "lucide-react";

type RadarMediaProps={src:string;alt:string;label:string;kind?:"current"|"concept";priority?:boolean;demo?:boolean};

export function RadarMedia({src,alt,label,kind="concept",priority=false,demo=false}:RadarMediaProps){
 const {display:tr}=useStudioLanguage();
 return <div className={`radar-media ${kind}`}>
  {src?<Image src={src} alt={alt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 40vw" priority={priority}/>:<div className="radar-media-missing" role="status"><ImageOff size={28}/><b>{tr("Zdjęcie lokalizacji w przygotowaniu")}</b><span>{tr("Nie jest częścią opublikowanej koncepcji.")}</span></div>}
  <span className="radar-media-label">{tr(label)}</span>
  {src&&demo?<small>{tr("Wizualizacja demonstracyjna")}</small>:null}
 </div>
}
