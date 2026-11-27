"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import pl from "@/lib/i18n/pl.json";
import en from "@/lib/i18n/en.json";
import displayEn from "@/lib/i18n/display-en.json";
import {studioLocaleFromSearch,studioLocalHref,studioNumberLocale,studioDisplay} from "@/lib/i18n/locale.mjs";
export type StudioLocale="pl"|"en";
type Key=keyof typeof pl;
const messages:Record<StudioLocale,Record<Key,string>>={pl,en};
type LanguageContext={locale:StudioLocale;setLocale:(locale:StudioLocale)=>void;t:(key:Key)=>string;href:(path:string)=>string;numberLocale:string;display:(text:string)=>string};
const Language=createContext<LanguageContext>({locale:"pl",setLocale:()=>{},t:key=>pl[key],href:path=>path,numberLocale:"pl-PL",display:text=>text});
export function StudioLanguageProvider({children}:{children:ReactNode}){
 const [locale,setLanguage]=useState<StudioLocale>("pl");
 useEffect(()=>{
  const read=()=>setLanguage(studioLocaleFromSearch(window.location.search));
  read();window.addEventListener("popstate",read);
  return ()=>window.removeEventListener("popstate",read);
 },[]);
 useEffect(()=>{document.documentElement.lang=locale},[locale]);
 function setLocale(next:StudioLocale){
  const path=window.location.pathname+window.location.search+window.location.hash;
  window.history.replaceState(window.history.state,"",studioLocalHref(path,next));
  setLanguage(next);
 }
 return <Language.Provider value={{locale,setLocale,t:key=>messages[locale][key],href:path=>studioLocalHref(path,locale),numberLocale:studioNumberLocale(locale),display:text=>studioDisplay(text,locale,displayEn)}}>{children}</Language.Provider>;
}
export const useStudioLanguage=()=>useContext(Language);
