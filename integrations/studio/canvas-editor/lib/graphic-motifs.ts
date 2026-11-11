/** Small, extensible catalogue of original vector decals. Unlike surface patterns,
 * each motif is an independent, editable object in the existing editor. */
export const motifCategories=[
 {id:'nature',name:'Kwiaty i natura'},
 {id:'lines',name:'Linie i wstęgi'},
 {id:'geometry',name:'Geometria'},
 {id:'symbols',name:'Symbole'},
 {id:'letters',name:'Typografia'},
 {id:'street',name:'Street Art'},
] as const;
export type MotifCategory=typeof motifCategories[number]['id'];
export type GraphicMotif={id:string;name:string;category:MotifCategory;variant:number;color:string};
const names:Record<MotifCategory,string[]>={
 nature:['Kwiat sześciopłatkowy','Liść','Rozeta','Słońce'],
 lines:['Płynna fala','Wstęga','Podwójny łuk','Zygzak'],
 geometry:['Koncentryczne koła','Diamenty','Trójkąty','Moduły'],
 symbols:['Gwiazda','Błyskawica','Serce','Strzałki'],
 letters:['Litera G','Litera F','Numer 01','Numer 10'],
 street:['Spray','Pociągnięcie pędzla','Energia','Kropki'],
};
const colors=['#EC659B','#6240E8','#F4AF45','#278F88','#ED596C','#256EAF'];
export const graphicMotifs:GraphicMotif[]=motifCategories.flatMap((cat,i)=>names[cat.id].map((name,variant)=>({id:`gf-${cat.id}-${variant+1}`,name,category:cat.id,variant,color:colors[i]})));

export function graphicMotifSvg(motif:GraphicMotif,color=motif.color):string{
 const n=motif.variant;
 const petal=Array.from({length:6+n%3},(_,i)=>`<ellipse cx="0" cy="-23" rx="12" ry="22" transform="rotate(${i*(360/(6+n%3))})"/>`).join('');
 const petals=`<g transform="translate(60 60)">${petal}<circle r="10" fill="#F9C758"/></g>`;
 const art:Record<MotifCategory,string[]>={
  nature:[petals,`<path d="M25 98 Q24 35 94 18 Q100 94 25 98Z"/><path d="M25 98Q62 64 94 18" fill="none" stroke="white" stroke-width="3"/>`, `<g transform="translate(60 60)">${Array.from({length:10},(_,i)=>`<ellipse cy="-25" rx="8" ry="29" transform="rotate(${i*36})"/>`).join('')}<circle r="9" fill="#F9C758"/></g>`,`<circle cx="60" cy="60" r="23"/>${Array.from({length:12},(_,i)=>`<path d="M60 4V23" stroke="${color}" stroke-width="6" stroke-linecap="round" transform="rotate(${i*30} 60 60)"/>`).join('')}`],
  lines:[`<path d="M7 76Q30 8 58 54T113 39" fill="none" stroke="${color}" stroke-width="15" stroke-linecap="round"/>`,`<path d="M7 90Q36 6 64 50T113 28L105 50Q65 97 42 60T7 104Z"/>`,`<path d="M9 64Q35 13 60 62T110 45M9 92Q35 41 60 90T110 73" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"/>`,`<path d="M7 80L34 23L56 79L80 23L109 79" fill="none" stroke="${color}" stroke-width="12" stroke-linejoin="round"/>`],
  geometry:[`<circle cx="60" cy="60" r="45" fill="none" stroke="${color}" stroke-width="11"/><circle cx="60" cy="60" r="23" fill="none" stroke="${color}" stroke-width="9"/>`,`<rect x="24" y="24" width="55" height="55" transform="rotate(45 60 60)"/><rect x="44" y="44" width="32" height="32" fill="white" transform="rotate(45 60 60)"/>`,`<path d="M60 8L112 105H8Z"/><path d="M60 41L90 99H30Z" fill="white"/>`,`<rect x="12" y="12" width="43" height="43"/><rect x="65" y="12" width="43" height="43"/><rect x="12" y="65" width="43" height="43"/><rect x="65" y="65" width="43" height="43"/>`],
  symbols:[`<path d="M60 8L73 44L112 45L81 69L91 108L60 86L29 108L39 69L8 45L47 44Z"/>`,`<path d="M69 7L18 65H55L43 113L104 48H68Z"/>`,`<path d="M60 107L16 65C-4 35 26 8 60 38C94 8 124 35 104 65Z"/>`,`<path d="M10 45H85L69 28M85 45L69 62M110 77H35L51 60M35 77L51 94" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`],
  letters:[`<text x="60" y="94" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="101">G</text>`,`<text x="60" y="94" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="101">F</text>`,`<text x="60" y="88" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="79">01</text>`,`<text x="60" y="88" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="79">10</text>`],
  street:[`<path d="M10 74Q30 9 50 42L90 8L104 65L70 93L29 108Z"/><circle cx="103" cy="99" r="8"/><circle cx="11" cy="21" r="6"/>`,`<path d="M8 78Q40 10 108 34L95 55Q51 32 16 103Z"/><path d="M20 111L41 67" stroke="${color}" stroke-width="9"/>`,`<path d="M58 5L68 44L109 23L83 60L114 91L70 79L44 113L43 72L7 58L43 44Z"/>`,`<circle cx="25" cy="29" r="15"/><circle cx="67" cy="24" r="8"/><circle cx="95" cy="53" r="18"/><circle cx="31" cy="86" r="11"/><circle cx="75" cy="96" r="13"/>`],
 };
 return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><g fill="${color}">${art[motif.category][n]}</g></svg>`;
}

export function motifDataUrl(motif:GraphicMotif,color=motif.color):string{
 const svg=graphicMotifSvg(motif,color);
 const bytes=new TextEncoder().encode(svg);
 let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
 return `data:image/svg+xml;base64,${btoa(binary)}`;
}
