/** Top-down court SVG to a PNG data URL (shared by the PNG download and the inquiry e-mail, 2026-11-18). */
export async function courtSvgToPng(svg:SVGSVGElement,{edge=2000,caption=true}:{edge?:number;caption?:boolean}={}):Promise<string>{
 const clone=svg.cloneNode(true) as SVGSVGElement;clone.setAttribute('xmlns','http://www.w3.org/2000/svg');const box=svg.viewBox.baseVal;
 const scale=edge/Math.max(box.width,box.height),width=Math.round(box.width*scale),height=Math.round(box.height*scale);clone.setAttribute('width',String(width));clone.setAttribute('height',String(height));
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}));
 try{
  const image=new Image();image.src=url;await image.decode();
  const foot=caption?72:0,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height+foot;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Ta przeglądarka nie obsługuje eksportu obrazu.');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height+foot);ctx.drawImage(image,0,0,width,height);
  if(caption){ctx.fillStyle='#47132d';ctx.font='20px Arial';ctx.fillText('GAMEFIELDS · wizualizacja koncepcyjna · widok z góry',24,height+42)}
  return canvas.toDataURL('image/png');
 }finally{URL.revokeObjectURL(url)}
}
