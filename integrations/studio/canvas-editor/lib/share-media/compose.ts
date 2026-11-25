/* Share Your Field: social graphics composed on a 2D canvas from shots of the real 3D scene.
   Three styles (clean, street, plan), two formats (Stories 1080×1920, Post 1080×1350).
   Instagram covers the top 250 px and the bottom 340 px of a Story, so nothing important goes there.
   anim = seconds into a film (text appears in order) or null for a still image. Identity: gamefields.eu colours and Inter. */
import type {ShareFacts} from './facts';

export type ShareFormat='story'|'post';
export type ShareStyle='clean'|'street'|'plan';
export type ShareImages={hero:CanvasImageSource;low:CanvasImageSource;top?:CanvasImageSource;surface?:CanvasImageSource|null};
export type ComposeOptions={format:ShareFormat;style:ShareStyle;background:string|'auto';facts:ShareFacts;images:ShareImages;showPrice:boolean;anim?:number|null};

export const BRAND={ink:'#47132D',paper:'#F4F1EE',violet:'#6336F5',lime:'#D8F24A',navy:'#1F2A6B',muted:'#6F5A66'};
export const FORMAT_SIZE:Record<ShareFormat,[number,number]>={story:[1080,1920],post:[1080,1350]};
/** Where the model goes in each template (px of the 1080 canvas). Films render the 3D view at exactly this aspect. */
export const MODEL_SLOT:Record<'clean'|'street',Record<ShareFormat,[number,number]>>={clean:{story:[952,760],post:[952,680]},street:{story:[1140,560],post:[1140,430]}};
export const BACKGROUNDS:Record<ShareStyle,{id:string;label:string;color:string|null}[]>={
 clean:[{id:'auto',label:'Z projektu',color:null},{id:'paper',label:'Jasne',color:BRAND.paper},{id:'ink',label:'Śliwka',color:BRAND.ink},{id:'navy',label:'Granat',color:BRAND.navy},{id:'violet',label:'Fiolet',color:BRAND.violet}],
 street:[{id:'auto',label:'Wzór z projektu',color:null},{id:'ink',label:'Śliwka',color:BRAND.ink},{id:'navy',label:'Granat',color:BRAND.navy}],
 plan:[{id:'ink',label:'Śliwka',color:BRAND.ink},{id:'navy',label:'Granat',color:BRAND.navy},{id:'paper',label:'Jasne',color:BRAND.paper}]};
export const SAFE:Record<ShareFormat,{top:number;bottom:number}>={story:{top:250,bottom:340},post:{top:72,bottom:72}};
const F='Inter,GHInter,Arial,sans-serif';

const size=(s:CanvasImageSource)=>{const o=s as {width:number|SVGAnimatedLength;height:number|SVGAnimatedLength};return {w:Number(o.width),h:Number(o.height)}};
export function lum(h:string){const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
export function mix(a:string,b:string,t:number){const p=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')}
const eo=(x:number)=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3);

/** Trim a transparent shot to the model outline (alpha > 8). */
export function trim(source:CanvasImageSource){const {w,h}=size(source),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true})!;g.drawImage(source,0,0);
 const d=g.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2)if(d[(y*w+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 if(x1<0)return c;x0=Math.max(0,x0-2);y0=Math.max(0,y0-2);x1=Math.min(w-1,x1+2);y1=Math.min(h-1,y1+2);const o=document.createElement('canvas');o.width=x1-x0+1;o.height=y1-y0+1;o.getContext('2d')!.drawImage(c,x0,y0,o.width,o.height,0,0,o.width,o.height);return o}

export function compose(canvas:HTMLCanvasElement,o:ComposeOptions){
 const [W,H]=FORMAT_SIZE[o.format];if(canvas.width!==W)canvas.width=W;if(canvas.height!==H)canvas.height=H;
 const ctx=canvas.getContext('2d')!,S=SAFE[o.format],story=o.format==='story',f=o.facts,anim=o.anim??null;let order=0;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.clearRect(0,0,W,H);
 const font=(w:number,s:number)=>`${w} ${s}px ${F}`;
 const reveal=(fn:()=>void,dy=40)=>{if(anim==null)return fn();const e=eo((anim-(.2+order++*.12))/.55);ctx.save();ctx.globalAlpha*=e;ctx.translate(0,(1-e)*dy);fn();ctx.restore()};
 type T={w?:number;s?:number;c?:string;ls?:number;al?:CanvasTextAlign};
 const text0=(t:string,x:number,y:number,{w=700,s=40,c=BRAND.ink,ls=0,al='left'}:T={})=>{ctx.font=font(w,s);ctx.fillStyle=c;ctx.textAlign=al;ctx.textBaseline='alphabetic';ctx.letterSpacing=ls+'px';ctx.fillText(t,x,y);ctx.letterSpacing='0px'};
 const text=(t:string,x:number,y:number,opt:T={})=>reveal(()=>text0(t,x,y,opt));
 const fit=(t:string,maxW:number,w:number,s:number)=>{ctx.font=font(w,s);while(ctx.measureText(t).width>maxW&&s>20){s-=2;ctx.font=font(w,s)}return s};
 const draw=(im:CanvasImageSource,cx:number,cy:number,maxW:number,maxH:number)=>{const {w:iw,h:ih}=size(im),k=Math.min(maxW/iw,maxH/ih),w=iw*k,h=ih*k;ctx.drawImage(im,cx-w/2,cy-h/2,w,h);return {w,h,x:cx-w/2,y:cy-h/2}};
 const rrect=(x:number,y:number,w:number,h:number,r:number)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)};
 const dots=(x:number,y:number,r:number,cols:string[],stroke:string)=>cols.forEach((c,i)=>{ctx.beginPath();ctx.arc(x+i*(r*2+12)+r,y,r,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke()});
 const dotsW=(n:number,r:number)=>n*(r*2+12)-12;
 const bgChoice=BACKGROUNDS[o.style].find(b=>b.id===o.background)||BACKGROUNDS[o.style][0];
 const pal=f.palette,light=pal[0],mid=pal[1]||mix(pal[0],BRAND.ink,.2),accent=pal[pal.length-1];
 const priceLine=o.showPrice&&f.price?f.price:null,facts=[f.field,f.pattern].filter(Boolean).join(' · ');

 if(o.style==='clean'){
  const bg=bgChoice.color||mix(lum(light)>.5?mix(light,BRAND.paper,.5):BRAND.paper,f.panel,.14),dk=lum(bg)<.3,fg=dk?BRAND.paper:BRAND.ink,mu=dk?'rgba(244,241,238,.72)':BRAND.muted,acc=dk?BRAND.lime:BRAND.violet,M=64,top=S.top+30,bot=H-S.bottom-24;
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  text('gamefields.',M,top+44,{w:800,s:52,c:fg,ls:-2});
  text('DESIGNED IN GAMEFIELDS STUDIO',W-M,top+40,{w:800,s:20,c:acc,ls:2.4,al:'right'});
  const [sw,sh]=MODEL_SLOT.clean[o.format],cy=story?top+520:top+410;
  const g=ctx.createRadialGradient(W/2,cy+60,40,W/2,cy+60,W*.55);g.addColorStop(0,dk?'rgba(255,255,255,.10)':mix(mid,bg,.35)+'aa');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,cy-500,W,1000);
  draw(o.images.hero,W/2,cy,sw,sh);
  let y=story?bot-290:bot-260;
  if(f.caption)text(f.caption.toUpperCase(),M,y-70,{w:800,s:22,c:acc,ls:2.4});
  text(f.name,M,y+(story?40:20),{w:800,s:fit(f.name,W-2*M,800,story?112:92),c:fg,ls:-4});
  y+=story?100:74;text(facts,M,y,{w:500,s:30,c:mu});
  reveal(()=>dots(W-M-dotsW(pal.length,18),y-10,18,pal,dk?'rgba(255,255,255,.4)':'rgba(71,19,45,.25)'),0);
  if(priceLine){y+=48;text(priceLine,M,y,{w:700,s:28,c:fg})}
  text('Zaprojektuj swoje boisko',M,bot-44,{w:700,s:32,c:fg});
  text('gamefields.eu/studio',M,bot,{w:600,s:28,c:acc});
  return;
 }

 if(o.style==='street'){
  const color=bgChoice.color,dark=!!color,fg=dark?BRAND.paper:BRAND.ink,M=56,top=S.top+20;
  ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-.24);
  if(!color&&o.images.surface){const {w:iw,h:ih}=size(o.images.surface),k=Math.hypot(W,H)/Math.min(iw,ih)*1.05;ctx.drawImage(o.images.surface,-iw*k/2,-ih*k/2,iw*k,ih*k)}
  else{const cols=color?[color,mix(color,'#ffffff',.07),mix(color,accent,.55)]:[light,mid,accent],sq=170,n=Math.ceil(Math.hypot(W,H)/sq/2)+1;
   for(let y=-n;y<n;y++)for(let x=-n;x<n;x++){const odd=(x+y)&1;ctx.fillStyle=odd?((x*7+y*3)%5===0?cols[2]:cols[1]):cols[0];ctx.fillRect(x*sq,y*sq,sq+1,sq+1)}}
  ctx.restore();
  reveal(()=>{ctx.font=font(800,40);const cw=ctx.measureText('gamefields.').width+68;ctx.fillStyle=BRAND.ink;rrect(M,top,cw,74,37);ctx.fill();text0('gamefields.',M+34,top+50,{w:800,s:40,c:BRAND.paper,ls:-1.5})});
  const words=f.name.toUpperCase().split(' ');let hs=story?210:170;hs=Math.min(hs,...words.map(w=>fit(w,W-2*M,900,hs)));let hy=top+90+hs*.92;
  for(const w of words){const yy=hy;reveal(()=>{ctx.font=font(900,hs);ctx.letterSpacing='-8px';ctx.lineWidth=14;ctx.lineJoin='round';ctx.strokeStyle=dark?BRAND.ink:BRAND.paper;ctx.strokeText(w,M,yy);ctx.fillStyle=fg;ctx.fillText(w,M,yy);ctx.letterSpacing='0px'},70);hy+=hs*.86}
  const bandTop=H-S.bottom-(story?190:170),[mw,mh]=MODEL_SLOT.street[o.format],{w:lw,h:lh}=size(o.images.low),k=Math.min(mw/lw,mh/lh),cy=bandTop-40-lh*k/2;
  ctx.save();ctx.shadowColor='rgba(28,9,18,.45)';ctx.shadowBlur=60;ctx.shadowOffsetY=30;const r=draw(o.images.low,W/2,cy,mw,mh);ctx.restore();
  if(f.caption){const cap=f.caption.toUpperCase(),pop=anim==null?1:(x=>x<=0?0:1+2.7*Math.pow(x-1,3)+1.7*Math.pow(x-1,2))(Math.min(1,(anim-1.1)/.45));
   if(pop>0){ctx.save();ctx.translate(W-M-20,Math.max(hy-hs*.86+60,cy-r.h/2-10));ctx.rotate(-.07+(1-pop)*.3);ctx.scale(pop,pop);ctx.font=font(900,44);const tw=ctx.measureText(cap).width+56;ctx.fillStyle=BRAND.lime;rrect(-tw,-40,tw,80,10);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=BRAND.ink;ctx.stroke();text0(cap,-tw/2,14,{w:900,s:44,c:BRAND.ink,al:'center',ls:-1});ctx.restore()}}
  ctx.fillStyle=BRAND.ink;ctx.fillRect(0,bandTop,W,H-bandTop);
  text('DESIGNED IN GAMEFIELDS STUDIO',M,bandTop+62,{w:900,s:30,c:BRAND.lime,ls:2});
  text(facts+(priceLine?' · '+priceLine:''),M,bandTop+108,{w:500,s:26,c:'rgba(244,241,238,.8)'});
  text('gamefields.eu/studio',M,bandTop+150,{w:700,s:28,c:BRAND.paper});
  return;
 }

 // plan: field card in the manner of a technical drawing
 const bg=bgChoice.color||BRAND.ink,dk=lum(bg)<.3,fg=dk?BRAND.paper:BRAND.ink,mu=dk?'rgba(244,241,238,.66)':BRAND.muted,ln=dk?'rgba(244,241,238,.22)':'rgba(71,19,45,.2)',acc=dk?BRAND.lime:BRAND.violet,M=64,top=S.top+30;
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.strokeStyle=dk?'rgba(244,241,238,.06)':'rgba(71,19,45,.06)';ctx.lineWidth=1;
 for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5);ctx.stroke()}
 text('gamefields.',M,top+44,{w:800,s:52,c:fg,ls:-2});text('KARTA BOISKA',W-M,top+40,{w:800,s:20,c:acc,ls:2.4,al:'right'});
 const area=story?680:440,r=draw(o.images.top||o.images.hero,W/2,top+(story?110:90)+area/2,area,area);
 const dim=(x1:number,y1:number,x2:number,y2:number,label:string,vert:boolean)=>{ctx.strokeStyle=acc;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  for(const [x,y] of [[x1,y1],[x2,y2]]){ctx.beginPath();if(vert){ctx.moveTo(x-14,y);ctx.lineTo(x+14,y)}else{ctx.moveTo(x,y-14);ctx.lineTo(x,y+14)}ctx.stroke()}
  ctx.save();ctx.translate((x1+x2)/2,(y1+y2)/2);if(vert)ctx.rotate(-Math.PI/2);ctx.font=font(800,26);const tw=ctx.measureText(label).width+24;ctx.fillStyle=bg;ctx.fillRect(-tw/2,-20,tw,40);text0(label,0,9,{w:800,s:26,c:acc,al:'center'});ctx.restore()};
 const fp=f.footprint?.split(' × ');
 if(fp&&fp.length===2){dim(r.x,r.y+r.h+34,r.x+r.w,r.y+r.h+34,fp[0]+(fp[0].endsWith('m')?'':' m'),false);dim(r.x-34,r.y,r.x-34,r.y+r.h,fp[1],true)}
 const iw=story?300:240;ctx.save();ctx.shadowColor='rgba(0,0,0,.3)';ctx.shadowBlur=30;draw(o.images.hero,W-M-iw/2+20,r.y+r.h-iw*.32,iw,iw);ctx.restore();
 let y=r.y+r.h+(story?120:100);const rh=story?62:52;const rows:[string,string][]=[['Model',f.name],['Pole gry',f.field],['Wzór nawierzchni',f.pattern]];
 if(f.footprint)rows.splice(2,0,['Wymiary z bramkami',f.footprint]);if(priceLine)rows.push(['Cena',priceLine]);
 for(const [k,v] of rows){ctx.fillStyle=ln;ctx.fillRect(M,y-rh+16,W-2*M,1.5);text(k.toUpperCase(),M,y,{w:700,s:20,c:mu,ls:1.6});text(v,W-M,y,{w:700,s:fit(v,W-2*M-300,700,story?30:26),c:fg,al:'right'});y+=rh}
 ctx.fillStyle=ln;ctx.fillRect(M,y-rh+16,W-2*M,1.5);text('KOLORY',M,y,{w:700,s:20,c:mu,ls:1.6});
 const cols=[f.frame,...pal].filter((c,i,a)=>a.indexOf(c)===i).slice(0,5);reveal(()=>dots(W-M-dotsW(cols.length,16),y-8,16,cols,dk?'rgba(255,255,255,.4)':'rgba(71,19,45,.25)'),0);
 const bot=H-S.bottom-24;if(f.caption)text(f.caption,M,bot-50,{w:800,s:34,c:fg});
 text('Designed in Gamefields Studio · gamefields.eu/studio',M,bot,{w:600,s:24,c:acc});
}
