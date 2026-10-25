import {CreativeCourtLines} from '@/components/creative-court-lines';
import type {Project} from '@/lib/project';
import {sportSurface} from '@/lib/sport-surfaces';
import {PatternArt} from './pattern-art';
import {SurfaceAppearance} from './surface-material';
import {PannaSurfaceObjects} from './panna-realistic-preview';
/** Coordinates in metres, including the free area outside the playing field. */
export function SportSurfaceLines({project:p}:{project:Project}){
 const s=sportSurface(p.surfaceModel);if(!s||!p.lines)return null;
 const L=s.fieldLength,W=s.fieldWidth,x=(s.length-L)/2,y=(s.width-W)/2;
 const line=(x1:number,y1:number,x2:number,y2:number)=><line x1={x1} y1={y1} x2={x2} y2={y2}/>;
 const circle=(cx:number,cy:number,r:number)=><circle cx={cx} cy={cy} r={r}/>;
 return <g transform={`scale(${600/s.length}) translate(${x} ${y})`} stroke={p.lineColor} strokeWidth={.05} fill="none" strokeLinejoin="round">
 <rect x={.025} y={.025} width={L-.05} height={W-.05}/>
 {s.id==='tennis'?<>{line(L/2,0,L/2,W)}{line(0,1.37,L,1.37)}{line(0,W-1.37,L,W-1.37)}{line(L/2-6.4,1.37,L/2-6.4,W-1.37)}{line(L/2+6.4,1.37,L/2+6.4,W-1.37)}{line(L/2-6.4,W/2,L/2+6.4,W/2)}</>:null}
 {s.id==='padel'?<>{line(10,0,10,W)}{line(3.05,0,3.05,W)}{line(16.95,0,16.95,W)}{line(3.05,5,16.95,5)}</>:null}
 {s.id==='volleyball'?<>{line(9,0,9,W)}{line(6,0,6,W)}{line(12,0,12,W)}</>:null}
 {s.id==='pickleball'?<>{line(L/2,0,L/2,W)}{line(L/2-2.1336,0,L/2-2.1336,W)}{line(L/2+2.1336,0,L/2+2.1336,W)}{line(0,W/2,L/2-2.1336,W/2)}{line(L/2+2.1336,W/2,L,W/2)}</>:null}
 {s.id==='basketball-full'?<>{line(L/2,0,L/2,W)}{circle(L/2,W/2,1.8)}{[false,true].map(reverse=><g key={String(reverse)} transform={reverse?`translate(${L} ${W}) rotate(180)`:undefined}><rect x={0} y={W/2-2.45} width={5.8} height={4.9}/><path d={`M5.8 ${W/2-1.8} A1.8 1.8 0 0 1 5.8 ${W/2+1.8}`}/><path d={`M0 .9H2.99 A6.75 6.75 0 0 1 2.99 ${W-.9}H0`}/>{circle(1.575,W/2,.225)}</g>)}</>:null}
 {s.id==='basketball-3x3'?<><rect x={L/2-2.45} y={0} width={4.9} height={5.8}/><path d={`M${L/2-1.8} 5.8 A1.8 1.8 0 0 0 ${L/2+1.8} 5.8`}/><path d={`M.9 0V2.99 A6.75 6.75 0 0 0 ${L-.9} 2.99V0`}/>{circle(L/2,1.575,.225)}</>:null}
 {['street-football-3x3','futsal'].includes(s.id)?<>{line(L/2,0,L/2,W)}{circle(L/2,W/2,s.id==='futsal'?3:1.5)}{[false,true].map(reverse=><g key={String(reverse)} transform={reverse?`translate(${L} ${W}) rotate(180)`:undefined}>{s.id==='futsal'?<path d={`M0 ${W/2-7.5} A6 6 0 0 1 6 ${W/2-1.5}V${W/2+1.5} A6 6 0 0 1 0 ${W/2+7.5}`}/>:<rect x={0} y={W/2-2} width={2.5} height={4}/>}</g>)}</>:null}
 </g>;
}
export function SportSurfaceArt({project:p,plan=false}:{project:Project;plan?:boolean}){const s=sportSurface(p.surfaceModel);if(!s)return null;const h=600*s.width/s.length;return <svg xmlns="http://www.w3.org/2000/svg" width={plan?600:1024} height={plan?h:1024} preserveAspectRatio="none" viewBox={`0 0 600 ${h}`}><rect width={600} height={h} fill={p.base}/><PatternArt p={p} h={h}/><SurfaceAppearance surface={p.surface} id="sport-floor" height={h} length={s.length}/><CreativeCourtLines project={p} height={h}/><SportSurfaceLines project={p}/><PannaSurfaceObjects project={p}/></svg>}
