import {useId} from 'react';
import {creativeLineGeometry,type DecorativeLineStyle} from '@/lib/creative-lines';

type CreativeLineProject={decorativeLineStyle?:DecorativeLineStyle;lineColor:string;courtShape?:'rectangle'|'circle'};
/** Add inside the same SVG as the surface artwork; sport lines remain a separate layer. */
export function CreativeCourtLines({project,height=400}:{project:CreativeLineProject;height?:number}){
 const id=`creative-lines-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
 const strokes=creativeLineGeometry(project.decorativeLineStyle,height);
 if(!strokes.length)return null;
 const h=Number.isFinite(height)?Math.max(60,Math.min(2400,height)):400;
 return <g data-creative-line-style={project.decorativeLineStyle} aria-hidden="true">
  <defs><clipPath id={id}>{project.courtShape==='circle'?<ellipse cx={300} cy={h/2} rx={297} ry={h/2-3}/>:<rect x={3} y={3} width={594} height={h-6} rx={2}/>}</clipPath></defs>
  <g clipPath={`url(#${id})`} fill="none" stroke={project.lineColor} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">{strokes.map((s,i)=><path key={i} d={s.path}/>)}</g>
 </g>;
}
