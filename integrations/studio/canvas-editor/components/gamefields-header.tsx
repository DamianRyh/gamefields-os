"use client";

import {BrandWordmark} from "@/components/brand-wordmark";

type StudioView = "sport" | "builder" | "patterns";
type Props = {section:"studio"|"radar"|"makeover";studioView?:string;onStudioNavigate?:(view:StudioView)=>void};

/** One navigation shell for the configurator, map and location pages. */
export function GamefieldsHeader({section,studioView,onStudioNavigate}:Props){
 return <header className="gf-header">
  <div className="gf-header-main">
   <a className="gf-header-brand" href="https://www.gamefields.eu/" target="_top" aria-label="Gamefields — strona główna"><BrandWordmark/></a>
   <nav className="gf-header-nav" aria-label="Główna nawigacja Gamefields">
    {onStudioNavigate?<button type="button" className={section==="studio"?"active":""} aria-current={section==="studio"?"page":undefined} onClick={()=>onStudioNavigate("sport")}>Boiska</button>:<a href="/" aria-current={section==="studio"?"page":undefined}>Boiska</a>}
    <a href="/radar" className={section==="radar"?"active":""} aria-current={section==="radar"?"page":undefined}>Radar · mapa</a>
    <a href="/makeover-perspective-lab" className={section==="makeover"?"active":""} aria-current={section==="makeover"?"page":undefined}>Makeover · zdjęcie 3D</a>
   </nav>
   {onStudioNavigate?<button type="button" className="gf-header-cta" onClick={()=>onStudioNavigate("builder")}>Projektuj boisko</button>:<a className="gf-header-cta" href="/">Projektuj boisko</a>}
  </div>
  {onStudioNavigate&&studioView!=="sport"&&<nav className="gf-studio-nav" aria-label="Nawigacja konfiguratora">
   {([ ["sport","Rodzaje boisk"],["builder","Mój projekt"],["patterns","Wzory"] ] as const).map(([view,label])=><button key={view} type="button" className={studioView===view?"active":""} aria-current={studioView===view?"page":undefined} onClick={()=>onStudioNavigate(view)}>{label}</button>)}
  </nav>}
 </header>;
}
