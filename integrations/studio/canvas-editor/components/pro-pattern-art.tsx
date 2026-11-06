// Renders a Court Art Pro family inside the Studio's PatternArt <svg>. Pure SVG markup from the engine.
import {useMemo} from "react";
import {renderPro} from "@/lib/court-art-pro.mjs";

export function ProPatternArt({familyId,variant,h,colors,uid,seed=0}:{familyId:string;variant:number;h:number;colors:string[];uid:string;seed?:number}){
 const markup=useMemo(()=>renderPro(familyId,variant,h,colors,{uid:"gfp"+uid,seed}) as string,[familyId,variant,h,colors,uid,seed]);
 return <g dangerouslySetInnerHTML={{__html:markup}}/>;
}
