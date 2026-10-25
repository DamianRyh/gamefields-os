/** Decorative artwork, independent of regulation sport markings. Coordinates use a 600 × height surface. */
export const decorativeLineStyles = ['none','waves','petals','loops','orbits','contours'] as const;
export type DecorativeLineStyle = typeof decorativeLineStyles[number];
export const creativeLineOptions: ReadonlyArray<{id:DecorativeLineStyle;name:string}> = [
 {id:'none',name:'Bez dekoracji'}, {id:'waves',name:'Fale'}, {id:'petals',name:'Płatki'},
 {id:'loops',name:'Pętle'}, {id:'orbits',name:'Orbity'}, {id:'contours',name:'Kontury'}
];
export type CreativePoint = readonly [number,number];
export type CreativeStroke = {points:CreativePoint[];path:string;closed:boolean};
const tau=Math.PI*2;
/** Pure, deterministic geometry. All points stay within a safe inset of the surface. */
export function creativeLineGeometry(style:DecorativeLineStyle|undefined,height=400):CreativeStroke[]{
 if(!style||style==='none'||!decorativeLineStyles.includes(style))return [];
 const h=Number.isFinite(height)?Math.max(60,Math.min(2400,height)):400;
 const result:CreativeStroke[]=[];
 const stroke=(count:number,closed:boolean,at:(t:number)=>CreativePoint)=>{
  const points=Array.from({length:count+1},(_,i)=>{const [x,y]=at(i/count);return [Math.max(.035,Math.min(.965,x))*600,y] as CreativePoint;});
  // Keep normalization separate from path serialization so tests can inspect every point.
  const normalized=points.map(([x,y])=>[Number(x.toFixed(3)),Number((Math.max(.035,Math.min(.965,y))*h).toFixed(3))] as CreativePoint);
  result.push({points:normalized,closed,path:normalized.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ')+(closed?' Z':'')});
 };
 if(style==='waves')for(let j=0;j<4;j++)stroke(160,false,t=>[.055+.89*t,.20+j*.19+.065*Math.sin(t*tau*1.6+j*.7)]);
 if(style==='petals')for(const [cx,cy,r,phase] of [[.28,.39,.19,0],[.72,.64,.18,.4],[.76,.20,.085,.8]])stroke(240,true,t=>{const a=t*tau,rad=r*(.74+.26*Math.cos(6*a+phase));return [cx+rad*Math.cos(a),cy+rad*Math.sin(a)];});
 if(style==='loops')stroke(520,false,t=>[.07+.86*t,.5+.30*Math.sin(t*tau*3)+.075*Math.sin(t*tau*9)]);
 if(style==='orbits')for(let j=0;j<5;j++)stroke(220,true,t=>{const a=t*tau,rx=.14+j*.055,ry=.12+j*.058,turn=.40;return [.5+rx*Math.cos(a)*Math.cos(turn)-ry*Math.sin(a)*Math.sin(turn),.5+rx*Math.cos(a)*Math.sin(turn)+ry*Math.sin(a)*Math.cos(turn)];});
 if(style==='contours')for(let j=0;j<5;j++)stroke(240,true,t=>{const a=t*tau,r=.11+j*.065+.023*Math.sin(3*a+.4)+.012*Math.cos(7*a);return [.5+r*Math.cos(a),.5+r*Math.sin(a)];});
 return result;
}
