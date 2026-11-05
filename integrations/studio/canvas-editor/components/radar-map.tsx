"use client";
import {useEffect,useRef,useState} from "react";
import type {RadarLocation} from "@/lib/radar-locations";

type RadarMapProps={locations:RadarLocation[];selectedId:string;onSelect:(id:string)=>void};

export function RadarMap({locations,selectedId,onSelect}:RadarMapProps){
 const containerRef=useRef<HTMLDivElement|null>(null);
 const mapRef=useRef<import("leaflet").Map|null>(null);
 const layerRef=useRef<import("leaflet").LayerGroup|null>(null);
 const leafletRef=useRef<typeof import("leaflet")|null>(null);
 const [mapReady,setMapReady]=useState(false);

 useEffect(()=>{
  let disposed=false;
  void import("leaflet").then(L=>{
   if(disposed||!containerRef.current||mapRef.current)return;
   leafletRef.current=L;
   const map=L.map(containerRef.current,{zoomControl:false,scrollWheelZoom:false,attributionControl:true}).setView([52.2297,21.0122],12);
   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
   L.control.zoom({position:"bottomleft"}).addTo(map);
   layerRef.current=L.layerGroup().addTo(map);
   mapRef.current=map;
   setMapReady(true);
   window.setTimeout(()=>map.invalidateSize(),0);
  });
  return()=>{disposed=true;setMapReady(false);mapRef.current?.remove();mapRef.current=null;layerRef.current=null};
 },[]);

 useEffect(()=>{
  const L=leafletRef.current,layer=layerRef.current,map=mapRef.current;
  if(!L||!layer||!map)return;
  layer.clearLayers();
  const bounds:Array<[number,number]>=[];
  locations.forEach(location=>{
   const selected=location.id===selectedId;
   const icon=L.divIcon({className:"radar-pin-shell",html:`<span class="radar-pin${selected?" selected":""}"><i></i></span>`,iconSize:[42,48],iconAnchor:[21,44]});
   const marker=L.marker([location.latitude,location.longitude],{icon,keyboard:true,title:location.name,alt:`${location.name}, ${location.district}`}).on("click",()=>onSelect(location.id));
   marker.addTo(layer);bounds.push([location.latitude,location.longitude]);
  });
  if(bounds.length>1)map.fitBounds(L.latLngBounds(bounds),{padding:[55,55],maxZoom:13});
  else if(bounds.length===1)map.setView(bounds[0],14);
 },[locations,selectedId,onSelect,mapReady]);

 return <div className="radar-map" ref={containerRef} role="region" aria-label="Mapa koncepcji Gamefields w Warszawie"/>;
}
