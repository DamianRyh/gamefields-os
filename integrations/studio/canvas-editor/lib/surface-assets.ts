/* Surface building blocks 2026-11-10.
   Flat, paintable assets in real metres: zones to build the surface itself, football training markings,
   playground games and decorative symbols. Each asset is drawn as a static SVG (1 unit = 1 cm) in up to four
   colours, so the same object renders in the 2D plan, in the 3D previews (as an image) and on print. */
import {graphicMotifs,graphicMotifSvg,type GraphicMotif} from './graphic-motifs.ts';

export type AssetCategory='zones'|'training'|'games'|'decor';
export type SurfaceAsset={id:string;name:string;category:AssetCategory;w:number;h:number;slots:number;min:number;max:number;hint?:string;draw:(c:string[],w:number,h:number)=>string};
export type AssetState={id:string;w:number;h:number;colors:string[]};

export const assetCategories:{id:AssetCategory;label:string;note:string}[]=[
 {id:'zones',label:'Strefy i kształty',note:'Bloki koloru, z których składasz samą nawierzchnię.'},
 {id:'training',label:'Trening piłkarski',note:'Oznaczenia do ćwiczeń: celność, koordynacja, podania.'},
 {id:'games',label:'Gry podwórkowe',note:'Klasyczne gry malowane na nawierzchni.'},
 {id:'decor',label:'Symbole',note:'Pojedyncze dekoracje i znaki.'}
];

/* ---------- drawing helpers (units: cm) ---------- */
const r1=(n:number)=>Math.round(n*10)/10;
const lum=(hex:string)=>{const n=parseInt(hex.slice(1),16),c=[n>>16&255,n>>8&255,n&255].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
export const inkOn=(hex:string)=>lum(hex)>.42?'#17191D':'#FFFFFF';
const txt=(x:number,y:number,size:number,fill:string,s:string)=>`<text x="${r1(x)}" y="${r1(y)}" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${r1(size)}" fill="${fill}">${s}</text>`;
const circle=(x:number,y:number,r:number,fill:string,extra='')=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}"${extra}/>`;
const rect=(x:number,y:number,w:number,h:number,fill:string,extra='')=>`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${extra}/>`;
const stroke=(c:string,w:number)=>` fill="none" stroke="${c}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"`;

/* ---------- catalogue ---------- */
const zones:SurfaceAsset[]=[
 {id:'zone-circle',name:'Koło',category:'zones',w:3,h:3,slots:1,min:.5,max:20,draw:([a],w)=>circle(w/2,w/2,w/2,a)},
 {id:'zone-half',name:'Półkole',category:'zones',w:4,h:2,slots:1,min:.6,max:20,draw:([a],w,h)=>`<path d="M0 ${h}A${w/2} ${w/2} 0 0 1 ${w} ${h}Z" fill="${a}"/>`},
 {id:'zone-quarter',name:'Narożnik',category:'zones',w:3,h:3,slots:1,min:.5,max:20,hint:'Ćwiartka koła do narożników boiska.',draw:([a],w,h)=>`<path d="M0 0H${w}A${w} ${h} 0 0 1 0 ${h}Z" fill="${a}"/>`},
 {id:'zone-band',name:'Pas',category:'zones',w:6,h:1,slots:1,min:.5,max:40,draw:([a],w,h)=>rect(0,0,w,h,a)},
 {id:'zone-capsule',name:'Kapsuła',category:'zones',w:5,h:2,slots:1,min:.6,max:30,draw:([a],w,h)=>rect(0,0,w,h,a,` rx="${h/2}"`)},
 {id:'zone-drop',name:'Plama',category:'zones',w:4,h:3,slots:1,min:.6,max:20,draw:([a],w,h)=>`<path d="M${w*.12} ${h*.55}C${w*.02} ${h*.18} ${w*.38} ${h*.02} ${w*.6} ${h*.1}C${w*.86} ${h*.18} ${w} ${h*.42} ${w*.92} ${h*.7}C${w*.84} ${h*.96} ${w*.5} ${h} ${w*.3} ${h*.9}C${w*.16} ${h*.84} ${w*.18} ${h*.72} ${w*.12} ${h*.55}Z" fill="${a}"/>`},
 {id:'zone-wave',name:'Fala',category:'zones',w:8,h:2,slots:1,min:1,max:40,draw:([a],w,h)=>{const t=h*.42,amp=(h-t)/2;let top=`M0 ${amp}`,bot='';for(let i=1;i<=4;i++){const x0=(i-1)*w/4,x1=i*w/4,up=i%2?-1:1;top+=`C${x0+w/12} ${amp+up*amp} ${x1-w/12} ${amp+up*amp} ${x1} ${amp}`;}for(let i=4;i>=1;i--){const x0=i*w/4,x1=(i-1)*w/4,up=i%2?-1:1;bot+=`C${x0-w/12} ${amp+t+up*amp} ${x1+w/12} ${amp+t+up*amp} ${x1} ${amp+t}`;}return `<path d="${top}L${w} ${amp+t}${bot}Z" fill="${a}"/>`}},
 {id:'zone-ring',name:'Pierścień',category:'zones',w:4,h:4,slots:1,min:.6,max:20,draw:([a],w)=>`<path fill-rule="evenodd" d="M0 ${w/2}A${w/2} ${w/2} 0 1 0 ${w} ${w/2}A${w/2} ${w/2} 0 1 0 0 ${w/2}ZM${w*.22} ${w/2}A${w*.28} ${w*.28} 0 1 0 ${w*.78} ${w/2}A${w*.28} ${w*.28} 0 1 0 ${w*.22} ${w/2}Z" fill="${a}"/>`},
 {id:'zone-arc',name:'Łuk',category:'zones',w:6,h:3,slots:1,min:1,max:30,draw:([a],w,h)=>`<path d="M0 ${h}A${w/2} ${h} 0 0 1 ${w} ${h}H${w*.78}A${w*.28} ${h*.56} 0 0 0 ${w*.22} ${h}Z" fill="${a}"/>`},
 {id:'zone-triangle',name:'Trójkąt',category:'zones',w:3,h:2.6,slots:1,min:.5,max:20,draw:([a],w,h)=>`<path d="M${w/2} 0L${w} ${h}H0Z" fill="${a}"/>`},
 {id:'zone-diamond',name:'Romb',category:'zones',w:3,h:3,slots:1,min:.5,max:20,draw:([a],w,h)=>`<path d="M${w/2} 0L${w} ${h/2}L${w/2} ${h}L0 ${h/2}Z" fill="${a}"/>`},
 {id:'zone-stripes',name:'Pasy',category:'zones',w:4,h:2,slots:2,min:.8,max:30,draw:([a,b],w,h)=>Array.from({length:6},(_,i)=>rect(0,i*h/6,w,h/6+.5,i%2?b:a)).join('')}
];

const training:SurfaceAsset[]=[
 {id:'tr-target',name:'Tarcza celności',category:'training',w:3,h:3,slots:3,min:1,max:8,hint:'Strzały i podania do celu.',draw:([a,b,c],w)=>[0,1,2,3].map(i=>circle(w/2,w/2,w/2*(1-i*.24),i===3?c:i%2?b:a)).join('')+txt(w/2,w/2,w*.12,inkOn(c),'10')},
 {id:'tr-grid9',name:'Strefy strzału 1–9',category:'training',w:3,h:3,slots:2,min:1.5,max:6,hint:'Trener woła numer, zawodnik trafia w strefę.',draw:([a,b],w)=>{const s=w/3;let o='';for(let i=0;i<9;i++){const x=i%3,y=Math.floor(i/3),f=(x+y)%2?b:a;o+=rect(x*s+2,y*s+2,s-4,s-4,f,' rx="4"')+txt(x*s+s/2,y*s+s/2,s*.45,inkOn(f),String(i+1));}return o}},
 {id:'tr-ladder',name:'Drabinka koordynacyjna',category:'training',w:4,h:.6,slots:1,min:2,max:8,hint:'Praca nóg i szybkość.',draw:([a],w,h)=>{const t=Math.max(5,h*.1);let o=rect(0,0,w,t,a)+rect(0,h-t,w,t,a);for(let i=0;i<=8;i++)o+=rect(i*(w-t)/8,0,t,h,a);return o}},
 {id:'tr-slalom',name:'Slalom',category:'training',w:5,h:.5,slots:1,min:2,max:12,hint:'Prowadzenie piłki między punktami.',draw:([a],w,h)=>Array.from({length:6},(_,i)=>circle(h/2+i*(w-h)/5,h/2,h/2,a)).join('')},
 {id:'tr-rondo',name:'Kwadrat rondo',category:'training',w:4,h:4,slots:2,min:2,max:10,hint:'Gra w dziadka: podania w kwadracie.',draw:([a,b],w)=>`<rect x="${w*.06}" y="${w*.06}" width="${w*.88}" height="${w*.88}"${stroke(a,w*.025)} stroke-dasharray="${w*.06} ${w*.04}"/>`+[[.06,.06],[.94,.06],[.94,.94],[.06,.94]].map(([x,y])=>circle(x*w,y*w,w*.06,b)).join('')},
 {id:'tr-triangle',name:'Trójkąt podań',category:'training',w:3,h:2.6,slots:2,min:1.5,max:8,draw:([a,b],w,h)=>{const P=[[w/2,h*.12],[w*.9,h*.88],[w*.1,h*.88]];return `<path d="M${P.map(p=>p.map(r1).join(' ')).join('L')}Z"${stroke(a,w*.025)} stroke-dasharray="${w*.05} ${w*.04}"/>`+P.map(([x,y])=>circle(x,y,w*.09,b)).join('')}},
 {id:'tr-duel',name:'Pole pojedynku',category:'training',w:3,h:3,slots:2,min:2,max:8,hint:'Koło do gry 1 na 1 z punktami startu.',draw:([a,b],w)=>`<circle cx="${w/2}" cy="${w/2}" r="${w*.46}"${stroke(a,w*.035)}/><path d="M${w/2} ${w*.04}V${w*.96}"${stroke(a,w*.02)}/>`+circle(w*.22,w/2,w*.06,b)+circle(w*.78,w/2,w*.06,b)},
 {id:'tr-start',name:'Linia startu',category:'training',w:4,h:.6,slots:2,min:1.5,max:15,draw:([a,b],w,h)=>{const n=Math.max(3,Math.round(w/h/1.6));return rect(0,0,w,h,a)+Array.from({length:n},(_,i)=>{const x=(i+.5)*w/n;return `<path d="M${r1(x-h*.25)} ${r1(h*.2)}L${r1(x+h*.15)} ${r1(h/2)}L${r1(x-h*.25)} ${r1(h*.8)}"${stroke(b,h*.12)}/>`}).join('')}}
];

const hopRows=[[1],[2],[3],[4,5],[6],[7,8],[9],[10]];
const games:SurfaceAsset[]=[
 {id:'g-hopscotch',name:'Klasy',category:'games',w:1.2,h:4.4,slots:2,min:2.5,max:7,draw:([a,b],w,h)=>{const s=h/8.6;let o='';hopRows.forEach((row,i)=>{const y=h-(i+1)*s;row.forEach((n,j)=>{const cw=w/row.length,x=j*cw,f=(n%2)?a:b;if(n===10)o+=`<path d="M${r1(w*.02)} ${r1(y+s)}A${r1(w*.48)} ${r1(s)} 0 0 1 ${r1(w*.98)} ${r1(y+s)}Z" fill="${f}"/>`+txt(w/2,y+s*.6,s*.42,inkOn(f),'10');else o+=rect(x+2,y+2,cw-4,s-4,f,' rx="3"')+txt(x+cw/2,y+s/2,s*.5,inkOn(f),String(n));});});return o}},
 {id:'g-ttt',name:'Kółko i krzyżyk',category:'games',w:1.8,h:1.8,slots:1,min:1,max:4,draw:([a],w)=>`<path d="M${w/3} ${w*.04}V${w*.96}M${w*2/3} ${w*.04}V${w*.96}M${w*.04} ${w/3}H${w*.96}M${w*.04} ${w*2/3}H${w*.96}"${stroke(a,w*.045)}/>`},
 {id:'g-chess',name:'Szachownica',category:'games',w:3,h:3,slots:2,min:1.6,max:8,draw:([a,b],w)=>{const s=w/8;let o=rect(0,0,w,w,b);for(let i=0;i<64;i++)if((i%8+Math.floor(i/8))%2===0)o+=rect(i%8*s,Math.floor(i/8)*s,s+.4,s+.4,a);return o}},
 {id:'g-snail',name:'Ślimak liczb',category:'games',w:3.4,h:3.4,slots:2,min:2,max:7,hint:'Skoki po kolejnych liczbach od 1 do 15.',draw:([a,b],w)=>{const c=w/2,T=Math.PI*3.4,pts:[number,number][]=[];for(let k=0;k<=600;k++){const t=k/600*T,r=w*(.43-.33*t/T);pts.push([c+Math.cos(t-Math.PI/2)*r,c+Math.sin(t-Math.PI/2)*r]);}const len=[0];for(let k=1;k<pts.length;k++)len.push(len[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));let o='';for(let n=0;n<15;n++){const target=len[len.length-1]*n/14;let k=0;while(k<len.length-1&&len[k]<target)k++;const [x,y]=pts[k],f=n%2?b:a,r=w*.058;o+=circle(x,y,r,f)+txt(x,y,r*1.05,inkOn(f),String(n+1));}return o}},
 {id:'g-twister',name:'Twister',category:'games',w:2.4,h:1.8,slots:4,min:1.5,max:5,draw:(c,w,h)=>{let o='';for(let row=0;row<4;row++)for(let col=0;col<6;col++)o+=circle((col+.5)*w/6,(row+.5)*h/4,Math.min(w/6,h/4)*.4,c[row]);return o}},
 {id:'g-compass',name:'Róża wiatrów',category:'games',w:3,h:3,slots:2,min:1.5,max:8,draw:([a,b],w)=>{const c=w/2,big=w*.46,small=w*.2;let o=`<circle cx="${c}" cy="${c}" r="${r1(w*.4)}"${stroke(a,w*.015)}/>`;for(let k=0;k<8;k++){const ang=k*Math.PI/4-Math.PI/2,R=k%2?big*.62:big,f=k%2?b:a,s1=ang-.28,s2=ang+.28;o+=`<path d="M${r1(c)} ${r1(c)}L${r1(c+Math.cos(s1)*small*(k%2?.6:1))} ${r1(c+Math.sin(s1)*small*(k%2?.6:1))}L${r1(c+Math.cos(ang)*R)} ${r1(c+Math.sin(ang)*R)}L${r1(c+Math.cos(s2)*small*(k%2?.6:1))} ${r1(c+Math.sin(s2)*small*(k%2?.6:1))}Z" fill="${f}"/>`;}return o+txt(c,w*.035,w*.07,a,'N')}},
 {id:'g-clock',name:'Zegar',category:'games',w:3,h:3,slots:2,min:1.5,max:8,draw:([a,b],w)=>{const c=w/2;let o=`<circle cx="${c}" cy="${c}" r="${r1(w*.46)}"${stroke(a,w*.03)}/>`;for(let k=0;k<12;k++){const ang=k*Math.PI/6-Math.PI/2;o+=k%3===0?txt(c+Math.cos(ang)*w*.34,c+Math.sin(ang)*w*.34,w*.1,b,String(k===0?12:k)):circle(c+Math.cos(ang)*w*.36,c+Math.sin(ang)*w*.36,w*.025,b);}return o+`<path d="M${c} ${c}V${r1(w*.22)}M${c} ${c}L${r1(w*.7)} ${r1(w*.6)}"${stroke(a,w*.03)}/>`}},
 {id:'g-path',name:'Ścieżka liczb',category:'games',w:5,h:.6,slots:2,min:2,max:12,draw:([a,b],w,h)=>Array.from({length:10},(_,i)=>{const f=i%2?b:a,s=w/10;return rect(i*s+2,0,s-4,h,f,' rx="4"')+txt(i*s+s/2,h/2,Math.min(s,h)*.5,inkOn(f),String(i+1))}).join('')},
 {id:'g-footprints',name:'Ślady stóp',category:'games',w:2.4,h:.7,slots:1,min:1,max:6,draw:([a],w,h)=>Array.from({length:4},(_,i)=>{const x=w*(.1+i*.25),y=i%2?h*.7:h*.3,rx=w*.065,ry=h*.15,side=i%2?1:-1;return `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${a}"/>`+[0,1,2,3].map(t=>circle(x+rx*1.18+t*rx*.05,y+side*ry*(.8-t*.5),ry*(.28-t*.03),a)).join('')}).join('')},
 {id:'g-maze',name:'Labirynt',category:'games',w:3,h:3,slots:1,min:2,max:8,draw:([a],w)=>{const u=w/6;const d='M0 0H6V6H0V1M1 1H5V5H1V2M2 2H4V4H2V3M3 0V1M5 2V3M1 4V5M4 5V6';return `<path d="${d.replace(/([MHVL])(\d)( \d)?/g,(_,cmd:string,x:string,y?:string)=>cmd+(Number(x)*u).toFixed(1)+(y?' '+(Number(y)*u).toFixed(1):''))}"${stroke(a,u*.22)} transform="translate(${r1(u*.11)} ${r1(u*.11)}) scale(.963)"/>`}}
];

const decor:SurfaceAsset[]=graphicMotifs.map((m:GraphicMotif)=>({id:'decor-'+m.id,name:m.name,category:'decor' as const,w:1.5,h:1.5,slots:1,min:.4,max:10,draw:([a],w)=>{const inner=graphicMotifSvg(m,a).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');return `<g transform="scale(${r1(w/120*100)/100})">${inner}</g>`}}));

export const surfaceAssets:SurfaceAsset[]=[...zones,...training,...games,...decor];
export const getAsset=(id:string)=>surfaceAssets.find(a=>a.id===id);

export function assetSvg(asset:SurfaceAsset,state:{w:number;h:number;colors:string[]}):string{
 const w=Math.round(state.w*100),h=Math.round(state.h*100);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${asset.draw(state.colors,w,h)}</svg>`;
}
export function assetDataUrl(asset:SurfaceAsset,state:{w:number;h:number;colors:string[]}):string{
 const bytes=new TextEncoder().encode(assetSvg(asset,state));let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 return 'data:image/svg+xml;base64,'+btoa(binary);
}
/* Editor objects draw images in a 110-unit box (scale 100 %). The plan is 600 units per court length. */
export const unitsPerMetre=(length:number)=>600/Math.max(1,length);
export const scaleFor=(state:{w:number;h:number},length:number)=>Math.round(Math.max(state.w,state.h)*unitsPerMetre(length)/110*1000)/10;
/* Default colours: the project colours that contrast most with the court base, then white and graphite. */
export function defaultAssetColors(projectColors:string[],base:string,n:number):string[]{
 const L=lum(base);const uniq=[...new Set(projectColors.map(c=>c.toUpperCase()))].filter(c=>c!==base.toUpperCase());
 const far=(c:string)=>Math.abs(lum(c)-L)>.12;const ranked=uniq.filter(far).sort((x,y)=>Math.abs(lum(y)-L)-Math.abs(lum(x)-L));const extra=['#FFFFFF','#E9C845','#17191D','#286EA9','#D8F24A'].filter(c=>far(c)&&!ranked.includes(c));const rgb=(h:string)=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255]};const pool:string[]=[];for(const c of [...ranked,...extra]){const a=rgb(c);if(pool.every(q=>{const b=rgb(q);return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])>48}))pool.push(c);}if(!pool.length)pool.push('#FFFFFF');
 return Array.from({length:n},(_,i)=>pool[i%pool.length]);
}
export const fmtM=(n:number)=>new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}).format(n);

/* Ready layouts: positions as a fraction of the court from its centre, sizes in metres (shrunk to fit). */
export type AssetLayout={id:string;name:string;note:string;minLength:number;items:{asset:string;fx:number;fy:number;rot?:number;size?:number}[]};
export const assetLayouts:AssetLayout[]=[
 {id:'colour-corners',name:'Kolorowe narożniki',note:'Cztery narożniki i koło na środku.',minLength:4,items:[{asset:'zone-quarter',fx:-.5,fy:-.5,rot:0,size:.3},{asset:'zone-quarter',fx:.5,fy:-.5,rot:90,size:.3},{asset:'zone-quarter',fx:.5,fy:.5,rot:180,size:.3},{asset:'zone-quarter',fx:-.5,fy:.5,rot:270,size:.3},{asset:'zone-circle',fx:0,fy:0,size:.36}]},
 {id:'accuracy',name:'Strefy celności',note:'Tarcze przy obu bramkach i linia startu na środku.',minLength:5,items:[{asset:'tr-target',fx:-.3,fy:0,size:.2},{asset:'tr-target',fx:.3,fy:0,size:.2},{asset:'tr-start',fx:0,fy:0,rot:90,size:.5}]},
 {id:'coordination',name:'Trening koordynacji',note:'Drabinka, slalom i kwadrat rondo.',minLength:10,items:[{asset:'tr-ladder',fx:-.22,fy:-.3,size:4},{asset:'tr-slalom',fx:.22,fy:.3,size:5},{asset:'tr-rondo',fx:0,fy:0,size:3}]},
 {id:'schoolyard',name:'Podwórko szkolne',note:'Klasy, twister, ślimak liczb i róża wiatrów.',minLength:10,items:[{asset:'g-hopscotch',fx:-.36,fy:0,size:4.4},{asset:'g-twister',fx:-.08,fy:-.24,size:2.4},{asset:'g-snail',fx:.2,fy:.12,size:3.4},{asset:'g-compass',fx:.4,fy:-.26,size:2.2}]}
];

/* Fit an asset into the court: the longer side is clamped to the asset's range and to 90 % of the court's short side. */
export function fittedState(asset:SurfaceAsset,longSide:number,court:{length:number;width:number},colors:string[]):AssetState{
 const cap=Math.max(asset.min,.9*Math.min(court.length,court.width));const side=Math.min(Math.max(longSide,asset.min),asset.max,cap);const k=side/Math.max(asset.w,asset.h);
 return {id:asset.id,w:Math.round(asset.w*k*100)/100,h:Math.round(asset.h*k*100)/100,colors};
}
export type PlacedAsset={asset:SurfaceAsset;state:AssetState;x:number;y:number;rotation:number;scale:number};
/* Positions in plan units (600 per court length), clamped so the asset's footprint stays on the court. */
export function placeLayout(layout:AssetLayout,court:{length:number;width:number},colorsFor:(asset:SurfaceAsset)=>string[]):PlacedAsset[]{
 const upm=unitsPerMetre(court.length),H=600*court.width/court.length,short=Math.min(court.length,court.width);
 return layout.items.flatMap(item=>{const asset=getAsset(item.asset);if(!asset)return [];
  const want=item.size===undefined?Math.max(asset.w,asset.h):item.size<=1?item.size*short:item.size;
  const state=fittedState(asset,want,court,colorsFor(asset));const rot=item.rot??0,turned=rot%180!==0;
  const bw=(turned?state.h:state.w)*upm/2,bh=(turned?state.w:state.h)*upm/2;
  const x=Math.min(600-bw,Math.max(bw,300+item.fx*600)),y=Math.min(H-bh,Math.max(bh,H/2+item.fy*H));
  return [{asset,state,x:Math.round(x*10)/10,y:Math.round(y*10)/10,rotation:rot>180?rot-360:rot,scale:scaleFor(state,court.length)}];
 });
}
