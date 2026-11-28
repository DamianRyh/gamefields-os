/* What the share graphic says about the project: model, play field, footprint, pattern, colours. All from the project itself. */
import type {Project} from '@/lib/project';
import {sportProfiles} from '@/lib/sport-profiles';
import {projectDimensions} from '@/lib/project-dimensions';
import {getPatternPalette} from '@/lib/pattern-library';

export type ShareFacts={panel:string;name:string;field:string;footprint:string|null;pattern:string;palette:string[];frame:string;caption:string;price:string|null};
const m=new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2});
const tidy=(s:string)=>s.replace(/\d+,\d{3,}/g,v=>new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}).format(Number(v.replace(',','.'))));
const lum=(h:string)=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};

export function shareFacts(p:Project,{price,caption='Moje boisko.'}:{price?:number|null;caption?:string}={}):ShareFacts{
 const profile=p.arenaModel?sportProfiles.find(s=>s.arenaModel===p.arenaModel):undefined;
 const d=projectDimensions(p),b=d.model?.constructionBounds;
 const raw=(p.patternColors?.length?p.patternColors:p.patternPalette?getPatternPalette(p.patternPalette).colors:[p.base,p.zone,p.lineColor]).map(c=>c.toUpperCase());
 const palette=[...new Set(raw)].slice(0,5).sort((a,b)=>lum(b)-lum(a));
 return {name:profile?.label||p.name,field:tidy(d.reference),footprint:b?`${m.format(b.x)} × ${m.format(b.z)} m`:null,
  pattern:p.pattern&&p.pattern!=='Brak'?p.pattern:p.surface,palette:palette.length?palette:['#F4F1EE','#47132D'],
  frame:p.arenaDesign?.frameColor||'#47132D',panel:p.arenaDesign?.panelColor||palette[1]||'#F4F1EE',caption,price:price?`konstrukcja od ${new Intl.NumberFormat('pl-PL').format(price)} zł netto`:null};
}
