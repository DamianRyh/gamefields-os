// Renders a Court Art Pro family inside the Studio's PatternArt <svg>. Pure SVG markup from the engine.
import {useMemo} from "react";
import {renderPro} from "@/lib/court-art-pro.mjs";

export function ProPatternArt({familyId,variant,h,colors,uid}:{familyId:string;variant:number;h:number;colors:string[];uid:string}){
 const markup=useMemo(()=>renderPro(familyId,variant,h,colors,{uid:"gfp"+uid}) as string,[familyId,variant,h,colors,uid]);
 return <g dangerouslySetInnerHTML={{__html:markup}}/>;
}
