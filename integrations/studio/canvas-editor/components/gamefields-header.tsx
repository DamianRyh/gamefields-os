"use client";

import {useStudioLanguage} from "@/components/studio-language";
import {BrandWordmark} from "@/components/brand-wordmark";

type StudioView = "sport" | "builder" | "patterns";
type Props = {section:"studio"|"radar"|"makeover";studioView?:string;onStudioNavigate?:(view:StudioView)=>void};

/** One navigation shell for the configurator, map and location pages. */
export function GamefieldsHeader({section,studioView,onStudioNavigate}:Props){
 const {locale,setLocale,t,href}=useStudioLanguage();
 return <header className="gf-header">
  <div className="gf-header-main">
   <a className="gf-header-brand" href="https://www.gamefields.eu/" target="_top" aria-label={t("home")}><BrandWordmark/></a>
   <nav className="gf-header-nav" aria-label={t("mainNav")}>
    {onStudioNavigate?<button type="button" className={section==="studio"?"active":""} aria-current={section==="studio"?"page":undefined} onClick={()=>onStudioNavigate("sport")}>{t("courts")}</button>:<a href={href("/")} aria-current={section==="studio"?"page":undefined}>{t("courts")}</a>}
    <a href={href("/radar")} className={section==="radar"?"active":""} aria-current={section==="radar"?"page":undefined}>{t("radar")}</a>
    <a href={href("/makeover-perspective-lab")} className={section==="makeover"?"active":""} aria-current={section==="makeover"?"page":undefined}>{t("makeover")}</a>
   </nav>
   <select aria-label={t("language")} value={locale} onChange={e=>setLocale(e.target.value==="en"?"en":"pl")} className="gf-header-language"><option value="pl">PL</option><option value="en">EN</option></select>
   {onStudioNavigate?<button type="button" className="gf-header-cta" onClick={()=>onStudioNavigate("builder")}>{t("design")}</button>:<a className="gf-header-cta" href={href("/")}>{t("design")}</a>}
  </div>
  {onStudioNavigate&&studioView!=="sport"&&<nav className="gf-studio-nav" aria-label={t("studioNav")}>
   {([ ["sport","types"],["builder","project"],["patterns","patterns"] ] as const).map(([view,key])=><button key={view} type="button" className={studioView===view?"active":""} aria-current={studioView===view?"page":undefined} onClick={()=>onStudioNavigate(view)}>{t(key)}</button>)}
  </nav>}
 </header>;
}
