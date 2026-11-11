/* Football training markings 2026-11-10. Parametric: the player sets cones, spacing and pattern in metres,
   the asset's real size follows. Set-ups follow common coaching practice: close-control slalom about 1.4 m,
   speed zig-zag about 4.5 m, T-test 4.5 + 9 m, 5-cone star and passing squares about 4.5–9 m, dot drill 0.6 × 0.9 m.
   Drawn in centimetres (1 unit = 1 cm); cone = 30 cm disc. */
export type DrillCategory='dribble'|'passing'|'agility'|'course';
export type ParamDef={key:string;label:string;min:number;max:number;step:number;def:number;unit?:string;options?:string[]};
export type Drill={id:string;name:string;category:DrillCategory;slots:number;hint:string;params:ParamDef[];size:(o:Record<string,number>)=>[number,number];draw:(c:string[],w:number,h:number,o:Record<string,number>)=>string};

const r1=(n:number)=>Math.round(n*10)/10;
const lum=(hex:string)=>{const n=parseInt(hex.slice(1),16),c=[n>>16&255,n>>8&255,n&255].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const ink=(hex:string)=>lum(hex)>.42?'#17191D':'#FFFFFF';
const circle=(x:number,y:number,r:number,fill:string,extra='')=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}"${extra}/>`;
const rect=(x:number,y:number,w:number,h:number,fill:string,extra='')=>`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${extra}/>`;
const txt=(x:number,y:number,size:number,fill:string,s:string)=>`<text x="${r1(x)}" y="${r1(y)}" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${r1(size)}" fill="${fill}">${s}</text>`;
const line=(d:string,col:string,w:number,dash=false)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${r1(w*2.6)} ${r1(w*2.2)}"`:''}/>`;
const cone=(x:number,y:number,col:string)=>circle(x,y,15,col)+circle(x,y,5,ink(col)==='#FFFFFF'?'#FFFFFF':'#17191D',' fill-opacity="0.55"');
const P=(x:number,y:number)=>`${r1(x)} ${r1(y)}`;
function smooth(p:[number,number][]){if(p.length<2)return '';let d='M'+P(...p[0]);for(let i=0;i<p.length-1;i++){const a=p[Math.max(0,i-1)],b=p[i],c=p[i+1],e=p[Math.min(p.length-1,i+2)];d+='C'+P(b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6)+' '+P(c[0]-(e[0]-b[0])/6,c[1]-(e[1]-b[1])/6)+' '+P(c[0],c[1]);}return d}
const sideNum=(c:string[],i:number)=>c[i]??c[0];
const n=(o:Record<string,number>,k:string)=>o[k];

const route:ParamDef={key:'route',label:'Trasa prowadzenia',min:0,max:1,step:1,def:1,options:['Bez trasy','Z trasą']};

export const drills:Drill[]=[
 /* ---------- dribbling ---------- */
 {id:'tr-slalom',name:'Slalom',category:'dribble',slots:2,hint:'Prowadzenie piłki między pachołkami: ciasno (ok. 1,4 m) na technikę, zygzakiem (ok. 4,5 m) na szybkość.',
  params:[{key:'n',label:'Pachołki',min:4,max:12,step:1,def:6},{key:'gap',label:'Odstęp',min:.8,max:5,step:.1,def:1.4,unit:'m'},{key:'mode',label:'Układ',min:0,max:2,step:1,def:0,options:['Prosto','Zygzak','Wąż']},{key:'off',label:'Wychylenie',min:.4,max:4,step:.1,def:1.2,unit:'m'},route],
  size:o=>{const amp=Math.min(.45,n(o,'gap')*.35);return [r1((n(o,'n')-1)*n(o,'gap')+.3),r1(n(o,'mode')===0?(n(o,'route')?2*amp+.3:.3):n(o,'off')+.3)]},
  draw:(c,W,H,o)=>{const k=n(o,'n'),g=n(o,'gap')*100,mode=n(o,'mode'),mid=H/2;
   const pts:[number,number][]=Array.from({length:k},(_,i)=>[15+i*g,mode===0?mid:mode===1?(i%2?H-15:15):mid+(mid-15)*Math.sin(i*Math.PI/2)]);
   let s='';if(n(o,'route')){const amp=Math.min(45,g*.35);const path:[number,number][]=mode===0?[[pts[0][0]-g*.4,mid],...pts.map(([x],i)=>[x,mid+(i%2?amp:-amp)] as [number,number]),[pts[k-1][0]+g*.4,mid]]:pts;s+=line(smooth(path),sideNum(c,1),5,true);}
   return s+pts.map(([x,y])=>cone(x,y,c[0])).join('')}},
 {id:'tr-gates',name:'Bramki z pachołków',category:'dribble',slots:2,hint:'Przeprowadź piłkę albo podaj przez każdą bramkę. Węższe bramki = trudniej.',
  params:[{key:'n',label:'Bramki',min:2,max:8,step:1,def:4},{key:'gw',label:'Szerokość bramki',min:.6,max:2.5,step:.1,def:1.2,unit:'m'},{key:'gap',label:'Odstęp',min:1,max:6,step:.1,def:3,unit:'m'},{key:'mode',label:'Układ',min:0,max:2,step:1,def:1,options:['W linii','Naprzemiennie','Rozrzucone']}],
  size:o=>{const m=n(o,'mode');return [r1((n(o,'n')-1)*n(o,'gap')+.3),r1(n(o,'gw')*(m===0?1:m===1?1.8:2.6)+.3)]},
  draw:(c,W,H,o)=>{const k=n(o,'n'),g=n(o,'gap')*100,gw=n(o,'gw')*100,m=n(o,'mode'),jit=[0,.8,-.6,.3,-.9,.5,-.2,.7];let s='';
   for(let i=0;i<k;i++){const x=15+i*g,y=H/2+(m===0?0:m===1?(i%2?1:-1)*gw*.4:jit[i]*gw*.8);s+=line(`M${P(x,y-gw/2)}V${r1(y+gw/2)}`,sideNum(c,1),4,true)+cone(x,y-gw/2,c[0])+cone(x,y+gw/2,c[0]);}return s}},
 {id:'tr-figure8',name:'Ósemka',category:'dribble',slots:2,hint:'Prowadzenie wokół dwóch pachołków na zmianę lewą i prawą nogą.',
  params:[{key:'gap',label:'Odstęp pachołków',min:1.5,max:6,step:.1,def:3,unit:'m'}],
  size:o=>[r1(n(o,'gap')+1.4),1.4],
  draw:(c,W,H,o)=>{const g=n(o,'gap')*100,x1=70,x2=70+g,cy=H/2,r=55;const d=`M${P(x1,cy-r)}C${P(x1+g*.5,cy-r)} ${P(x2-g*.5,cy+r)} ${P(x2,cy+r)}A${r} ${r} 0 0 0 ${P(x2,cy-r)}C${P(x2-g*.5,cy-r)} ${P(x1+g*.5,cy+r)} ${P(x1,cy+r)}A${r} ${r} 0 0 1 ${P(x1,cy-r)}Z`;return line(d,sideNum(c,1),5,true)+cone(x1,cy,c[0])+cone(x2,cy,c[0])}},
 {id:'tr-duel',name:'Pole pojedynku 1 na 1',category:'dribble',slots:2,hint:'Koło do gry jeden na jednego z punktami startu.',
  params:[{key:'d',label:'Średnica',min:2,max:8,step:.1,def:4,unit:'m'}],
  size:o=>[n(o,'d'),n(o,'d')],
  draw:(c,w,_h,o)=>`<circle cx="${w/2}" cy="${w/2}" r="${r1(w/2-6)}" fill="none" stroke="${c[0]}" stroke-width="10"/>`+line(`M${P(w/2,12)}V${r1(w-12)}`,c[0],5,true)+circle(w*.22,w/2,18,sideNum(c,1))+circle(w*.78,w/2,18,sideNum(c,1))},
 /* ---------- passing and shooting ---------- */
 {id:'tr-square',name:'Kwadrat treningowy',category:'passing',slots:2,hint:'Rondo (gra w dziadka), pojedynek 1 na 1 z bramkami albo kwadrat podań ze środkiem.',
  params:[{key:'s',label:'Bok',min:2,max:12,step:.1,def:5,unit:'m'},{key:'mode',label:'Układ',min:0,max:2,step:1,def:0,options:['Rondo','1 na 1 z bramkami','Podania ze środkiem']}],
  size:o=>[r1(n(o,'s')+.3),r1(n(o,'s')+.3)],
  draw:(c,W,_h,o)=>{const m=n(o,'mode'),a=15,b=W-15,corners=[[a,a],[b,a],[b,b],[a,b]] as [number,number][];
   if(m===1){const gap=(b-a)*.3,mid=W/2;return `<rect x="${a}" y="${a}" width="${r1(b-a)}" height="${r1(b-a)}" fill="none" stroke="${c[0]}" stroke-width="8"/>`+rect(a-6,mid-gap/2,12,gap,sideNum(c,1))+rect(b-6,mid-gap/2,12,gap,sideNum(c,1))+circle(mid,mid,10,c[0])}
   let s=line(`M${P(a,a)}H${r1(b)}V${r1(b)}H${r1(a)}Z`,c[0],5,true);if(m===2)s+=line(`M${P(a,a)}L${P(b,b)}M${P(b,a)}L${P(a,b)}`,sideNum(c,1),3,true)+cone(W/2,W/2,sideNum(c,1));return s+corners.map(([x,y])=>cone(x,y,c[0])).join('')}},
 {id:'tr-triangle',name:'Trójkąt podań',category:'passing',slots:2,hint:'Podania w trójkącie, bok zwykle 7–9 m.',
  params:[{key:'s',label:'Bok',min:3,max:12,step:.1,def:7,unit:'m'}],
  size:o=>[r1(n(o,'s')+.3),r1(n(o,'s')*.866+.3)],
  draw:(c,W,H)=>{const p:[number,number][]=[[W/2,15],[W-15,H-15],[15,H-15]];return line(`M${p.map(q=>P(...q)).join('L')}Z`,c[0],5,true)+p.map(([x,y])=>circle(x,y,20,sideNum(c,1))).join('')}},
 {id:'tr-corridor',name:'Korytarz podań',category:'passing',slots:2,hint:'Podania po ziemi wzdłuż korytarza; węższy = dokładniej.',
  params:[{key:'len',label:'Długość',min:4,max:16,step:.5,def:8,unit:'m'},{key:'wd',label:'Szerokość',min:.6,max:4,step:.1,def:1.5,unit:'m'}],
  size:o=>[n(o,'len'),r1(n(o,'wd')+.4)],
  draw:(c,W,H)=>line(`M${P(50,20)}H${r1(W-50)}M${P(50,H-20)}H${r1(W-50)}`,c[0],5,true)+circle(25,H/2,22,sideNum(c,1))+circle(W-25,H/2,22,sideNum(c,1))},
 {id:'tr-arc',name:'Łuk strzałów',category:'passing',slots:2,hint:'Punkty strzałów ustawione łukiem przed celem; strzelasz kolejno z każdego.',
  params:[{key:'n',label:'Punkty',min:3,max:9,step:1,def:5},{key:'r',label:'Odległość od celu',min:3,max:12,step:.5,def:7,unit:'m'},{key:'ang',label:'Rozpiętość łuku',min:60,max:180,step:10,def:120,unit:'°'}],
  size:o=>{const r=n(o,'r'),a=n(o,'ang')*Math.PI/360;return [r1(2*r*Math.sin(a)+.6),r1(r+.6)]},
  draw:(c,W,_h,o)=>{const k=n(o,'n'),r=n(o,'r')*100,a=n(o,'ang')*Math.PI/360,cx=W/2,cy=30;let s=`<circle cx="${r1(cx)}" cy="${cy}" r="24" fill="none" stroke="${sideNum(c,1)}" stroke-width="8"/>`+circle(cx,cy,8,sideNum(c,1));
   for(let i=0;i<k;i++){const t=k===1?0:-a+2*a*i/(k-1),x=cx+Math.sin(t)*r,y=cy+Math.cos(t)*r;s+=circle(x,y,22,c[0])+txt(x,y,24,ink(c[0]),String(i+1));}return s}},
 /* ---------- agility and coordination ---------- */
 {id:'tr-ladder',name:'Drabinka koordynacyjna',category:'agility',slots:1,hint:'Praca nóg: jedno i dwa kroki w polu, wejścia boczne.',
  params:[{key:'n',label:'Pola',min:4,max:14,step:1,def:8},{key:'rung',label:'Długość pola',min:.35,max:.6,step:.01,def:.45,unit:'m'},{key:'lw',label:'Szerokość',min:.4,max:.8,step:.05,def:.6,unit:'m'}],
  size:o=>[r1(n(o,'n')*n(o,'rung')+.06),n(o,'lw')],
  draw:(c,W,H,o)=>{const k=n(o,'n'),t=6;let s=rect(0,0,W,t,c[0])+rect(0,H-t,W,t,c[0]);for(let i=0;i<=k;i++)s+=rect(i*(W-t)/k,0,t,H,c[0]);return s}},
 {id:'tr-tdrill',name:'T-test',category:'agility',slots:2,hint:'Sprint do przodu, odstawne w bok w obie strony, powrót tyłem.',
  params:[{key:'stem',label:'Długość',min:3,max:10,step:.5,def:4.5,unit:'m'},{key:'bar',label:'Szerokość',min:4,max:12,step:.5,def:9,unit:'m'}],
  size:o=>[r1(n(o,'bar')+.3),r1(n(o,'stem')+.3)],
  draw:(c,W,H)=>line(`M${P(W/2,H-15)}V15M15 15H${r1(W-15)}`,sideNum(c,1),5,true)+[[W/2,H-15],[W/2,15],[15,15],[W-15,15]].map(([x,y])=>cone(x,y,c[0])).join('')},
 {id:'tr-star',name:'Gwiazda 5 pachołków',category:'agility',slots:2,hint:'Ze środka do każdego pachołka i z powrotem, z piłką lub bez.',
  params:[{key:'r',label:'Promień',min:2,max:6,step:.5,def:4.5,unit:'m'}],
  size:o=>[r1(2*n(o,'r')+.3),r1(2*n(o,'r')+.3)],
  draw:(c,W)=>{const cx=W/2,R=W/2-15;const p=Array.from({length:5},(_,i)=>[cx+Math.sin(i*Math.PI*2/5)*R,cx-Math.cos(i*Math.PI*2/5)*R]);return p.map(([x,y])=>line(`M${P(cx,cx)}L${P(x,y)}`,sideNum(c,1),4,true)).join('')+p.map(([x,y])=>cone(x,y,c[0])).join('')+cone(cx,cx,sideNum(c,1))}},
 {id:'tr-hex',name:'Sześciokąt zwinności',category:'agility',slots:2,hint:'Przeskoki na zewnątrz i do środka przez każdy bok, w kolejności 1–6.',
  params:[{key:'side',label:'Bok',min:.4,max:1,step:.05,def:.6,unit:'m'}],
  size:o=>[r1(2*n(o,'side')),r1(Math.sqrt(3)*n(o,'side'))],
  draw:(c,W,H)=>{const cx=W/2,cy=H/2,R=W/2-3;const p=Array.from({length:6},(_,i)=>[cx+Math.cos(i*Math.PI/3)*R,cy+Math.sin(i*Math.PI/3)*R]);let s=`<path d="M${p.map(q=>P(q[0],q[1])).join('L')}Z" fill="none" stroke="${c[0]}" stroke-width="5"/>`;for(let i=0;i<6;i++){const a=(i+.5)*Math.PI/3;s+=txt(cx+Math.cos(a)*R*.62,cy+Math.sin(a)*R*.62,R*.26,sideNum(c,1),String(i+1));}return s}},
 {id:'tr-dots',name:'Kropki do pracy nóg',category:'agility',slots:2,hint:'Dot drill: skoki obunóż i jednonóż po kropkach 1–5.',
  params:[{key:'k',label:'Wielkość',min:1,max:1.6,step:.1,def:1,unit:'×'}],
  size:o=>[r1(.6*n(o,'k')),r1(.9*n(o,'k'))],
  draw:(c,W,H)=>{const r=W*.12;return [[r*1.1,r*1.1,1],[W-r*1.1,r*1.1,2],[W/2,H/2,3],[r*1.1,H-r*1.1,4],[W-r*1.1,H-r*1.1,5]].map(([x,y,k])=>circle(x,y,r,k===3?sideNum(c,1):c[0])+txt(x,y,r*1.1,ink(k===3?sideNum(c,1):c[0]),String(k))).join('')}},
 {id:'tr-grid',name:'Pole techniki',category:'agility',slots:2,hint:'Osobne kwadraty do ćwiczeń z piłką w miejscu (ball mastery): każdy zawodnik w swoim polu.',
  params:[{key:'cols',label:'Kolumny',min:1,max:6,step:1,def:3},{key:'rows',label:'Rzędy',min:1,max:4,step:1,def:2},{key:'s',label:'Bok pola',min:1,max:3,step:.1,def:1.5,unit:'m'}],
  size:o=>[r1(n(o,'cols')*n(o,'s')),r1(n(o,'rows')*n(o,'s'))],
  draw:(c,W,H,o)=>{const k=n(o,'s')*100;let s='';for(let y=0;y<n(o,'rows');y++)for(let x=0;x<n(o,'cols');x++){s+=`<rect x="${r1(x*k+5)}" y="${r1(y*k+5)}" width="${r1(k-10)}" height="${r1(k-10)}" rx="6" fill="none" stroke="${c[0]}" stroke-width="5"/>`+circle(x*k+k/2,y*k+k/2,9,sideNum(c,1));}return s}},
 /* ---------- course building ---------- */
 {id:'tr-station',name:'Numer stacji',category:'course',slots:1,hint:'Oznacz kolejność stacji w torze przeszkód.',
  params:[{key:'num',label:'Numer',min:1,max:12,step:1,def:1},{key:'d',label:'Średnica',min:.5,max:1.5,step:.1,def:.8,unit:'m'}],
  size:o=>[n(o,'d'),n(o,'d')],
  draw:(c,W,_h,o)=>circle(W/2,W/2,W/2,c[0])+txt(W/2,W/2+2,W*.5,ink(c[0]),String(n(o,'num')))},
 {id:'tr-arrow',name:'Strzałka kierunku',category:'course',slots:1,hint:'Pokazuje kierunek przejścia między stacjami.',
  params:[{key:'len',label:'Długość',min:.6,max:3,step:.1,def:1.2,unit:'m'}],
  size:o=>[n(o,'len'),.5],
  draw:(c,W,H)=>`<path d="M0 ${r1(H*.32)}H${r1(W-H)}V0L${r1(W)} ${r1(H/2)}L${r1(W-H)} ${r1(H)}V${r1(H*.68)}H0Z" fill="${c[0]}"/>`},
 {id:'tr-start',name:'Linia startu',category:'course',slots:2,hint:'Start toru albo linia, z której zaczyna się ćwiczenie.',
  params:[{key:'len',label:'Długość',min:1,max:10,step:.5,def:3,unit:'m'}],
  size:o=>[n(o,'len'),.6],
  draw:(c,W,H)=>{const k=Math.max(2,Math.round(W/H/1.6));return rect(0,0,W,H,c[0])+Array.from({length:k},(_,i)=>{const x=(i+.5)*W/k;return line(`M${P(x-H*.25,H*.2)}L${P(x+H*.15,H/2)}L${P(x-H*.25,H*.8)}`,sideNum(c,1),H*.12)}).join('')}},
 {id:'tr-finish',name:'Linia mety',category:'course',slots:2,hint:'Koniec toru; szachownica jak na mecie.',
  params:[{key:'len',label:'Długość',min:1,max:10,step:.5,def:3,unit:'m'}],
  size:o=>[n(o,'len'),.5],
  draw:(c,W,H)=>{const s=H/2,k=Math.ceil(W/s);let o='';for(let i=0;i<k;i++)for(let j=0;j<2;j++)o+=rect(i*s,j*s,s+.4,s+.4,(i+j)%2?c[0]:sideNum(c,1));return o}},
];
export const drillDefaults=(d:Drill)=>Object.fromEntries(d.params.map(p=>[p.key,p.def]));
