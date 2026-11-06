"use client";

import {useId} from "react";
import {surfaceMaterials,isTurf,surfaceLabel} from "@/lib/surface-materials";

// SVG court units map to metres before projection, not to screen pixels.
// Deterministic irregular details avoid a regular dotted overlay.
export function SurfaceAppearance({surface,id,width=600,height=400,length=15}:{surface:string;id:string;width?:number;height?:number;length?:number}){
 const pixelsPerMeter=width/length;
 const tile=pixelsPerMeter*.3;
 const grain=pixelsPerMeter*.045;
 const fiber=pixelsPerMeter*.08;
 return <g aria-hidden="true">
  <defs>
   <pattern id={`${id}-granule`} width={grain*8} height={grain*8} patternUnits="userSpaceOnUse"><g fill="#101c16" opacity=".18"><path d={`M0 0h${grain}l${grain*.6} ${grain}L0 ${grain*1.4}Z M${grain*4} ${grain*2}l${grain*1.4} ${grain*.3}-.4 ${grain*1.2}Z M${grain*2} ${grain*6}l${grain*1.5} -.5 .3 ${grain}Z`}/></g><g stroke="#fff" opacity=".16" strokeWidth={grain*.35}><path d={`M${grain*2} ${grain*3}l${grain} ${grain*.8} M${grain*6} ${grain*5}l${grain} -${grain*.5} M${grain*5} ${grain*7}h${grain}`}/></g></pattern>
   <pattern id={`${id}-modules`} width={tile} height={tile} patternUnits="userSpaceOnUse"><path d={`M${tile} 0H0V${tile}`} fill="none" stroke="#12241a" strokeOpacity=".48" strokeWidth={pixelsPerMeter*.016}/><path d={`M1 1H${tile-1} M1 1V${tile-1}`} stroke="#fff" strokeOpacity=".2" strokeWidth={pixelsPerMeter*.01}/><path d={`M${tile*.25} ${tile*.18}V${tile*.82} M${tile*.5} ${tile*.18}V${tile*.82} M${tile*.75} ${tile*.18}V${tile*.82}`} stroke="#102619" strokeOpacity=".22" strokeWidth={pixelsPerMeter*.015}/></pattern>
   <pattern id={`${id}-fibers`} width={fiber*4} height={fiber*4} patternUnits="userSpaceOnUse"><g fill="none" strokeWidth={pixelsPerMeter*.012}><path d={`M0 ${fiber*3}l${fiber*.4} -${fiber*2} M${fiber*2} ${fiber*4}l-${fiber*.3} -${fiber*2.6}`} stroke="#102e14" opacity=".45"/><path d={`M${fiber} ${fiber*2}l${fiber*.2} -${fiber*1.6} M${fiber*3} ${fiber*3}l${fiber*.4} -${fiber*2}`} stroke="#9bbd64" opacity=".4"/></g></pattern>
   <pattern id={`${id}-mow`} width={pixelsPerMeter*3} height={height} patternUnits="userSpaceOnUse"><rect width={pixelsPerMeter*1.5} height={height} fill="#fff" opacity=".05"/></pattern>
  </defs>
  {isTurf(surface)?<><rect width={width} height={height} fill="#397441"/><rect width={width} height={height} fill={`url(#${id}-mow)`}/><rect width={width} height={height} fill={`url(#${id}-fibers)`}/></>:surface==="EPDM"?<rect width={width} height={height} fill={`url(#${id}-granule)`}/>:surface==="Moduły sportowe"?<rect width={width} height={height} fill={`url(#${id}-modules)`}/>:null}
 </g>;
}

function MaterialSample({surface,large=false}:{surface:string;large?:boolean}){
 const id=useId().replace(/:/g,"");
 return <svg className={large?"material-sample enlarged":"material-sample"} viewBox="0 0 240 135" role="img" aria-label={`Próbka struktury: ${surfaceLabel(surface)}`}><rect width="240" height="135" fill="#246f70"/><SurfaceAppearance surface={surface} id={id} width={240} height={135} length={large?1.5:3}/><path d="M0 105H240" stroke="#fff" strokeWidth="6" opacity=".95"/></svg>;
}

export function SurfaceMaterialPicker({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const selected=surfaceMaterials.find(item=>item.value===value);
 return <section className="material-picker" aria-label="Materiał nawierzchni">
  <div className="material-heading"><span className="eyebrow">MATERIAŁ / PODSTAWA PROJEKTU</span><h2>Wybierz nawierzchnię</h2><p>Ten sam projekt. Cztery różne wykończenia.</p></div>
  <div className="material-grid">{surfaceMaterials.map(item=><button type="button" key={item.value} className={value===item.value?"material-card selected":"material-card"} aria-pressed={value===item.value} aria-label={`${item.label} — ${item.description}`} onClick={()=>onChange(item.value)}><span className="material-image"><MaterialSample surface={item.value}/><span className="material-check" aria-hidden="true">{value===item.value?"✓":""}</span></span><span className="material-copy"><b>{item.label}</b><small>{item.finish}</small></span></button>)}</div>
  {selected?<><p className="material-selection" aria-live="polite"><b>{selected.label}</b> · {selected.detail}</p><details className="material-detail" key={value}><summary>Zobacz strukturę z bliska <span aria-hidden="true">＋</span></summary><MaterialSample surface={value} large/><p>Próbka poglądowa · fragment 1,5 m szerokości. Ostateczna faktura i kolor zależą od wybranego produktu.</p></details></>:<p className="material-selection">Projekt używa wcześniejszej nawierzchni: {value}. Wybierz kartę, aby ją zmienić.</p>}
  <p className="material-note">Wizualizacja koncepcyjna, nie próbka produktu. Dobór systemu i możliwość wykonania wzoru wymagają potwierdzenia.</p>
 </section>;
}
