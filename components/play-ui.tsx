"use client";
import Link from "next/link";
export const sportName = (sport:string) => sport === "basketball" ? "Basketball" : "Football";
export const when = (date:string) => new Date(date).toLocaleString("pl-PL", {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
export async function playRequest(url:string, body?:Record<string,unknown>) {
  const response=await fetch(url,body?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}:{cache:"no-store"});
  const data=await response.json();
  if(!response.ok || data.ok===false) throw new Error(data.error || "SERVICE_UNAVAILABLE");
  return data;
}
const errors:Record<string,string>={LOCATION_UNAVAILABLE:"Nie uzyskano lokalizacji. Mapa działa również bez niej.",GAME_FULL:"Skład jest już pełny. Wybierz inną grę.",GAME_NOT_OPEN:"Ta gra już się rozpoczęła.",ALL_PLAYERS_MUST_BE_READY:"Każdy gracz musi potwierdzić gotowość.",TEAMS_NOT_SET:"Organizator musi najpierw ustawić drużyny.",DUPLICATE_COURT:"W pobliżu istnieje podobny obiekt. Sprawdź duplikaty.",INVALID_START_TIME:"Wybierz dzisiejszy lub przyszły termin.",SECOND_PARTY_REQUIRED:"Wynik musi potwierdzić przeciwnik.",OPPOSING_TEAM_REQUIRED:"Wynik potwierdza gracz z przeciwnej drużyny.",SERVICE_UNAVAILABLE:"Nie udało się połączyć. Spróbuj ponownie.",INVALID_SCORE:"Wpisz wynik od 0 do 99.",UNAUTHENTICATED:"Sesja wygasła. Zaloguj się ponownie.",STATE_CHANGED:"Stan gry się zmienił. Odśwież i spróbuj ponownie."};
export function ErrorNotice({error}:{error:string}){return error?<div className="p-error" role="alert">{errors[error] || "Nie udało się wykonać akcji. Spróbuj ponownie."}</div>:null;}
export function PlayHeader({title,back="/play"}:{title:string;back?:string}){return <header className="p-header"><Link href={back} className="p-back">← PLAY</Link><b>{title}</b><Link href="/play/account" className="p-back" aria-label="Konto gracza">Konto ↗</Link></header>;}
export function Sports({sport,setSport}:{sport:string;setSport:(s:string)=>void}){return <div className="p-tabs" aria-label="Sport">{["football","basketball"].map(s=><button key={s} type="button" aria-pressed={s===sport} className={s===sport?"p-tab active":"p-tab"} onClick={()=>setSport(s)}>{sportName(s)}</button>)}</div>;}
export function Avatar({nickname,url}:{nickname:string;url?:string|null}){return <span className="p-avatar">{url?<img src={url} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/>:nickname.slice(0,2).toUpperCase()}</span>;}
