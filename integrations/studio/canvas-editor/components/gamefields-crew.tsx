"use client";

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {ChevronDown, ChevronUp, MessageCircle, Sparkles, X} from "lucide-react";
import "@/app/crew.css";

type GuideId = "marek" | "kuba" | "ola" | "alex";
type StudioContext = {sport?: string; length?: number; width?: number; surface?: string; view?: string; pattern?: string;area?:number|null;dimensionLabel?:string};

const guides: {id:GuideId;name:string;role:string;emoji:string;accent:string;intro:string}[] = [
  {id:"marek",name:"Marek",role:"Formalności",emoji:"👨🏻‍💼",accent:"#92bed8",intro:"Zacznijmy od miejsca i celu inwestycji. Przeprowadzę Cię przez kolejne decyzje."},
  {id:"kuba",name:"Kuba",role:"Zgłoś boisko",emoji:"🧢",accent:"#a995ff",intro:"Hej! Chcesz takie boisko u siebie? Pomogę Ci przekuć pomysł w zgłoszenie do miasta."},
  {id:"ola",name:"Ola",role:"Technologia",emoji:"👷🏻‍♀️",accent:"#ffc16b",intro:"Sprawdźmy parametry konstrukcji, nawierzchnię i warunki wykonania."},
  {id:"alex",name:"Alex",role:"Sport i gra",emoji:"⚽",accent:"#f7a3b6",intro:"Chodź! Pokażę Ci, co można rozegrać na takim boisku."},
];
const key = "gamefields-crew-guide-v1";

function tip(id:GuideId, context:StudioContext, pathname:string, topic:string):string {
  const {sport="boisko",surface="wybraną nawierzchnię",pattern,dimensionLabel}=context;
  const area=typeof context.area==="number"&&Number.isFinite(context.area) ? Math.round(context.area*100)/100 : null;
  if(pathname.startsWith("/radar"))return ({marek:"Sprawdź lokalizację, dostęp do terenu i jego przeznaczenie przed rozpoczęciem inwestycji.",kuba:"To może być miejsce na Twoje boisko! Zapisz lokalizację i zbierz zdjęcia do zgłoszenia.",ola:"Na mapie warto sprawdzić dostęp montażowy, istniejące podłoże i otoczenie obiektu.",alex:"Wyobraź sobie, jak to miejsce może ożyć po pierwszym turnieju!"})[id];
  if(pathname.includes("makeover"))return ({marek:"Przed rewitalizacją ustal zakres prac i status istniejącego obiektu.",kuba:"Metamorfoza starego boiska to świetny temat do pokazania lokalnej społeczności.",ola:"Przy renowacji najpierw oceniamy stan podłoża i istniejącej nawierzchni.",alex:"Nowy wygląd może pomóc znów przyciągnąć graczy na zapomniane boisko."})[id];
  if(topic==="material")return ({marek:`W projekcie inwestycji opisz wymagania dla nawierzchni: ${surface}. Parametry potwierdź w dokumentacji.`,kuba:`Wybrano: ${surface}. To dobry moment, by zapytać przyszłych użytkowników o ich potrzeby.`,ola:`Wybrano ${surface}. O trwałości decydują także podbudowa, warunki montażu i konserwacja.`,alex:`Nawierzchnia wpływa na komfort i charakter gry. Sprawdź, czy ${surface} odpowiada planowanej dyscyplinie.`})[id];
  if(topic==="design")return ({marek:`Projekt graficzny ${pattern||"boiska"} warto uwzględnić już w opisie zamówienia.`,kuba:"Charakterystyczna grafika może sprawić, że mieszkańcy szybciej utożsamią się z tym miejscem.",ola:"Przy grafice sprawdźmy technologię aplikacji i wymagania dotyczące pielęgnacji.",alex:"Kolory i linie mają znaczenie! Dobrze zaprojektowane boisko jest czytelne w ruchu."})[id];
  return ({marek:`Projektujesz ${sport}${area?` na ${area} m²`:""}. Zacznij od ustalenia właściciela terenu, potrzeb użytkowników i budżetu.`,kuba:`${area?`${area} m²`:'Ta przestrzeń'} może stać się miejscem gry! Zrób zdjęcia lokalizacji, zbierz poparcie i sprawdź zasady zgłoszeń w swojej gminie.`,ola:`${dimensionLabel?`Obrys projektu: ${dimensionLabel}.${area!==null?` Nawierzchnia: ${area} m².`:""}`:"Sprawdźmy wymiary projektu."} Do realizacji trzeba osobno zweryfikować przestrzeń montażową i strefy bezpieczeństwa.`,alex:`${sport} — świetny kierunek! ${area?`Na ${area} m²`:"Na tym boisku"} można zaplanować aktywność dopasowaną do liczby graczy i formatu gry.`})[id];
}

export function GamefieldsCrew(){
  const [selected,setSelected]=useState<GuideId|null>(null);
  const [host,setHost]=useState<HTMLElement|null>(null);
  useEffect(()=>{const sync=()=>{const next=document.querySelector<HTMLElement>('.studio-top-actions');setHost(prev=>prev===next?prev:next)};sync();const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect()},[]);
  const [ready,setReady]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [topic,setTopic]=useState("dimensions");
  const [context,setContext]=useState<StudioContext>({});
  const [pathname,setPathname]=useState("/");
  const [messages,setMessages]=useState<{role:"user"|"assistant";content:string}[]>([]);
  const [question,setQuestion]=useState("");
  const [waiting,setWaiting]=useState(false);
  const [error,setError]=useState("");
  const [aiAvailable,setAiAvailable]=useState(false);
  const chatRequest=useRef<{id:number;controller:AbortController|null}>({id:0,controller:null});
  useEffect(()=>()=>{chatRequest.current.id++;chatRequest.current.controller?.abort()},[]);
  useEffect(()=>{
    setPathname(location.pathname);
    try{const saved=localStorage.getItem(key);if(guides.some(g=>g.id===saved)){setSelected(saved as GuideId);setExpanded(false)}}catch{}
    setReady(true);
    fetch("/api/crew",{cache:"no-store"}).then(r=>r.json()).then((x:{enabled?:boolean})=>setAiAvailable(Boolean(x.enabled))).catch(()=>{});
    const update=(event:Event)=>setContext((event as CustomEvent<StudioContext>).detail||{});
    window.addEventListener("gamefields:studio-context",update);
    return ()=>window.removeEventListener("gamefields:studio-context",update);
  },[]);
  const choose=(id:GuideId)=>{chatRequest.current.id++;chatRequest.current.controller?.abort();setWaiting(false);setSelected(id);setExpanded(true);setTopic("dimensions");setMessages([]);setQuestion("");setError("");try{localStorage.setItem(key,id)}catch{}};
  async function askExpert(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(!selected||waiting||!question.trim())return;
    const next=[...messages,{role:"user" as const,content:question.trim().slice(0,1200)}].slice(-8);
    setMessages(next);setQuestion("");setError("");setWaiting(true);
    const id=++chatRequest.current.id,controller=new AbortController();chatRequest.current.controller?.abort();chatRequest.current.controller=controller;const timeout=setTimeout(()=>controller.abort(),20000);
    try{const response=await fetch("/api/crew",{method:"POST",signal:controller.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({guide:selected,messages:next,context})});const data=await response.json() as {answer?:string;error?:string};if(!response.ok||!data.answer)throw Error(data.error||"Nie udało się uzyskać odpowiedzi.");if(chatRequest.current.id===id)setMessages([...next,{role:"assistant",content:data.answer}]);}catch(e){if(chatRequest.current.id===id)setError(controller.signal.aborted?"Odpowiedź trwa zbyt długo. Wpisz pytanie ponownie.":(e as Error).message)}finally{clearTimeout(timeout);if(chatRequest.current.id===id)setWaiting(false)}
  }
  const current=guides.find(g=>g.id===selected);
  if(!ready)return null;
  const content=<aside className={"gf-crew"+(host?" is-studio-docked":"")} onKeyDown={e=>{if(e.key==="Escape")setExpanded(false)}} aria-label="GAMEFIELDS CREW — wirtualni przewodnicy">
    <div className="gf-crew-popover">
    <div className="gf-crew-heads">
      <span className="gf-crew-label"><Sparkles size={13}/> CREW</span>
      {guides.map(g=><button type="button" key={g.id} aria-label={`Wybierz przewodnika ${g.name}: ${g.role}`} aria-pressed={selected===g.id} title={`${g.name} — ${g.role}`} onClick={()=>choose(g.id)} className={`gf-crew-head ${selected===g.id?"is-active":""}`} style={{"--crew-accent":g.accent} as React.CSSProperties}>
        <span className={`gf-crew-avatar gf-crew-avatar-${g.id}`} aria-hidden="true"><span>{g.emoji}</span></span><span className="gf-crew-name">{g.name}</span>
      </button>)}
      {selected&&<button className="gf-crew-toggle" type="button" aria-label={expanded?"Zwiń poradę":"Rozwiń poradę"} onClick={()=>setExpanded(v=>!v)}>{expanded?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>}
    </div>
    {current&&expanded&&<div className="gf-crew-panel" role="region" aria-label={`Podpowiedzi: ${current.name}`}>
      <div className="gf-crew-panel-top"><div><strong>{current.name}</strong><span>{current.role}</span></div><button type="button" aria-label="Zamknij dymek" onClick={()=>setExpanded(false)}><X size={17}/></button></div>
      <p><MessageCircle size={17} aria-hidden="true"/>{tip(current.id,context,pathname,topic)}</p>
      <div className="gf-crew-topics"><button type="button" className={topic==="dimensions"?"active":""} onClick={()=>setTopic("dimensions")}>Projekt</button><button type="button" className={topic==="material"?"active":""} onClick={()=>setTopic("material")}>Nawierzchnia</button><button type="button" className={topic==="design"?"active":""} onClick={()=>setTopic("design")}>Grafika</button></div>
      <div className="gf-crew-chat" aria-live="polite">
        {messages.map((m,i)=><p key={i} className={m.role==="user"?"gf-crew-chat-user":"gf-crew-chat-assistant"}><strong>{m.role==="user"?"Ty":current.name}:</strong> {m.content}</p>)}
        {waiting&&<span className="gf-crew-chat-wait">{current.name} przygotowuje odpowiedź…</span>}
        {error&&<span className="gf-crew-chat-error" role="alert">{error}</span>}
      </div>
      {aiAvailable?<><form className="gf-crew-question" onSubmit={askExpert}><label htmlFor="gf-crew-question">Zapytaj {current.name} o swój projekt</label><div><input id="gf-crew-question" type="text" autoComplete="off" value={question} maxLength={1200} onChange={e=>setQuestion(e.target.value)} placeholder="Napisz pytanie…"/><button type="submit" disabled={!question.trim()||waiting}>Wyślij</button></div></form><small>Treść pytania i parametry projektu są przesyłane do dostawcy AI. Nie podawaj danych poufnych.</small></>:<small>Rozmowy AI czekają na aktywację. Możesz już korzystać z porad i podróży przewodnika.</small>}
      <div className="gf-crew-next"><a href={current.id==="marek"?"/radar":current.id==="kuba"?"/radar":current.id==="ola"?"/":"/"}>{current.id==="marek"?"Sprawdź lokalizacje":current.id==="kuba"?"Zobacz miejsca":current.id==="ola"?"Odkryj Studio":"Zaprojektuj boisko"} →</a><span>Przewodnik pozostanie z Tobą na kolejnych stronach.</span></div>
      <small>Porady informacyjne · nie zastępują dokumentacji technicznej ani urzędowej</small>
    </div>}
  </div></aside>;
  return host?createPortal(content,host):content;
}
