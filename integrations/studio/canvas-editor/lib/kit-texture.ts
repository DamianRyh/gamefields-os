import type {KitDesign,KitPattern,KitPlayer} from "@/lib/kit";

/* Flat shirt drawing in a 400×440 box: shared by the 2D thumbnails and the 3D textures. */
export const KIT_BODY="M128 34 C150 30 166 26 172 24 C182 44 218 44 228 24 C234 26 250 30 272 34 L352 78 C358 82 360 88 358 94 L332 162 C330 168 324 170 318 168 L292 158 L294 404 C294 412 288 418 280 418 L120 418 C112 418 106 412 106 404 L108 158 L82 168 C76 170 70 168 68 162 L42 94 C40 88 42 82 48 78 Z";
export const KIT_NUMBER_FONT='"Bebas Neue","Arial Narrow",Impact,sans-serif';
export const KIT_TEXT_FONT='Inter,Arial,sans-serif';

function rng(seed:number){let s=seed;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};}

export function kitPatternSvg(type:KitPattern,b:string,a:string,d:string,id:string){
 const r=rng(7);
 let s=`<rect width="400" height="440" fill="${b}"/>`;
 if(type==="blobs"){
  ([[90,120,110,a],[300,330,130,d],[330,90,70,a],[120,360,80,d],[210,230,46,a]] as const).forEach(([x,y,rad,c],i)=>{s+=`<ellipse cx="${x}" cy="${y}" rx="${rad*1.15}" ry="${rad}" transform="rotate(${i*31} ${x} ${y})" fill="${c}" opacity="${c===a?0.95:0.9}"/>`;});
 }else if(type==="halves"){
  s+=`<path d="M0 0 H200 V440 H0Z" fill="${d}"/><circle cx="200" cy="250" r="86" fill="none" stroke="${a}" stroke-width="18"/><path d="M0 395 H400 V412 H0Z" fill="${a}"/>`;
 }else if(type==="camo"){
  for(let i=0;i<26;i++){const x=r()*400,y=r()*440,w=40+r()*80,h=30+r()*60,c=i%3===0?a:d;s+=`<path d="M${x} ${y} l${w*.5} ${-h*.4} l${w*.5} ${h*.3} l${-w*.2} ${h*.7} l${-w*.6} ${h*.2}z" fill="${c}" opacity="${c===a?0.85:1}"/>`;}
 }else if(type==="contour"){
  for(let i=0;i<16;i++){const rad=30+i*26;s+=`<ellipse cx="260" cy="300" rx="${rad*1.25}" ry="${rad}" fill="none" stroke="${i%4===0?a:d}" stroke-width="${i%4===0?5:3}" opacity=".9"/>`;}
 }else if(type==="gradient"){
  s+=`<defs><linearGradient id="kg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset=".55" stop-color="${d}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect width="400" height="440" fill="url(#kg-${id})"/>`;
  for(let i=0;i<6;i++)s+=`<path d="M-20 ${250+i*30} L420 ${170+i*30}" stroke="${a}" stroke-width="3" opacity="${0.25+i*0.1}"/>`;
 }else if(type==="waves"){
  for(let i=0;i<7;i++){const y=70+i*60,c=i%2?a:d;s+=`<path d="M-20 ${y} C 80 ${y-50}, 160 ${y+50}, 240 ${y} S 400 ${y-40}, 440 ${y}" fill="none" stroke="${c}" stroke-width="${i%2?22:14}" stroke-linecap="round" opacity=".95"/>`;}
 }else if(type==="stripes"){
  for(let x=0;x<400;x+=56)s+=`<rect x="${x}" y="0" width="28" height="440" fill="${a}" opacity=".9"/>`;
  s+=`<rect x="0" y="0" width="400" height="120" fill="${d}" opacity=".55"/>`;
 }
 return s;
}

/* Shirt without lettering, as a standalone SVG (used as the base layer of a texture). */
export function kitShirtSvg(kit:KitDesign,view:"front"|"back",id:string,size=1024){
 const neck=view==="front"
  ?(kit.collar==="v"
   ?`<path d="M170 24 L200 74 L230 24 Z" fill="#1b1416" opacity=".55"/><path d="M168 24 L200 76 L232 24" fill="none" stroke="${kit.detail}" stroke-width="8" stroke-linejoin="round"/>`
   :`<path d="M172 24 C182 50 218 50 228 24 Z" fill="#1b1416" opacity=".55"/><path d="M170 23 C182 52 218 52 230 23" fill="none" stroke="${kit.detail}" stroke-width="8" stroke-linecap="round"/>`)
  :`<path d="M170 24 C184 36 216 36 230 24" fill="none" stroke="${kit.detail}" stroke-width="8" stroke-linecap="round"/>`;
 const cuffs=`<path d="M44 96 L70 162" stroke="${kit.detail}" stroke-width="9"/><path d="M356 96 L330 162" stroke="${kit.detail}" stroke-width="9"/>`;
 const seams=`<path d="M128 36 C118 84 110 124 108 158" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/><path d="M272 36 C282 84 290 124 292 158" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/>`;
 const h=Math.round(size*1.1);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="0 0 400 440"><defs><clipPath id="kc-${id}"><path d="${KIT_BODY}"/></clipPath><linearGradient id="ks-${id}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs><g clip-path="url(#kc-${id})">${kitPatternSvg(kit.pattern,kit.base,kit.accent,kit.detail,id)}${cuffs}${seams}<rect width="400" height="440" fill="url(#ks-${id})"/></g>${neck}<path d="${KIT_BODY}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.5"/></svg>`;
}

/* Base SVG plus lettering drawn with canvas text, so the page's own web fonts are used. */
export function drawKitTexture(kit:KitDesign,view:"front"|"back",player:KitPlayer,logo:HTMLImageElement|null,size=1024,surface=false):Promise<HTMLCanvasElement|null>{
 return new Promise(resolve=>{
  const img=new Image();
  img.onload=()=>{
   const c=document.createElement("canvas");c.width=size;c.height=Math.round(size*1.1);
   const x=c.getContext("2d");if(!x){resolve(null);return;}
   x.drawImage(img,0,0,c.width,c.height);
   x.save();x.scale(c.width/400,c.height/440);if(!surface)x.clip(new Path2D(KIT_BODY));
   const block=kit.font==="block";
   const numberFont=(px:number)=>block?`400 ${px}px ${KIT_NUMBER_FONT}`:`800 ${px}px ${KIT_TEXT_FONT}`;
   const text=(s:string,X:number,Y:number,font:string,spacing="0px")=>{
    x.font=font;x.textAlign="center";x.lineJoin="round";
    if("letterSpacing" in x)(x as CanvasRenderingContext2D&{letterSpacing:string}).letterSpacing=spacing;
    x.strokeStyle=kit.base;x.lineWidth=3;x.strokeText(s,X,Y);
    x.fillStyle=kit.text;x.fillText(s,X,Y);
   };
   if(view==="front"){
    if(logo&&logo.width){const k=Math.min(48/logo.width,48/logo.height);x.drawImage(logo,156-logo.width*k/2,116-logo.height*k/2,logo.width*k,logo.height*k);}
    else{x.setLineDash([4,4]);x.strokeStyle=kit.text;x.globalAlpha=.6;x.lineWidth=2;x.beginPath();x.arc(156,116,20,0,Math.PI*2);x.stroke();x.globalAlpha=1;x.setLineDash([]);}
    text(player.number,244,134,numberFont(44));
    if(kit.sponsor)text(kit.sponsor.toUpperCase(),200,230,`800 ${Math.max(18,34-kit.sponsor.length)}px ${KIT_TEXT_FONT}`,"1px");
   }else{
    const name=(player.name||"").toUpperCase();
    text(name,200,118,`800 ${name.length>10?24:30}px ${KIT_TEXT_FONT}`,"3px");
    text(player.number,200,300,numberFont(block?190:150));
   }
   x.restore();
   resolve(c);
  };
  img.onerror=()=>resolve(null);
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(surface?`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size*1.1)}" viewBox="0 0 400 440">${kitPatternSvg(kit.pattern,kit.base,kit.accent,kit.detail,view)}</svg>`:kitShirtSvg(kit,view,view,size));
 });
}
