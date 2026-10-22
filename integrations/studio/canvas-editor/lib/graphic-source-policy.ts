/** Deliberately bounded static SVG subset. Validation never rewrites accepted artwork. */
const MAX_BYTES=2_000_000,MAX_NODES=10_000,MAX_DEPTH=64;
const elements=new Set('svg g defs path rect circle ellipse line polyline polygon text tspan title desc linearGradient radialGradient stop clipPath mask pattern symbol'.split(' '));
const attributes=new Set('id class version x y x1 y1 x2 y2 cx cy r rx ry dx dy width height viewBox preserveAspectRatio d points transform fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity color vector-effect clip-path clip-rule mask maskUnits maskContentUnits gradientUnits gradientTransform spreadMethod offset stop-color stop-opacity fx fy fr patternUnits patternContentUnits patternTransform text-anchor dominant-baseline alignment-baseline font-family font-size font-weight font-style letter-spacing word-spacing textLength lengthAdjust rotate xml:space style href xlink:href xmlns xmlns:xlink'.split(' '));
const styleProperties=new Set('fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity color vector-effect clip-path clip-rule mask stop-color stop-opacity text-anchor dominant-baseline alignment-baseline font-family font-size font-weight font-style letter-spacing word-spacing'.split(' '));
const localReference=/^#[A-Za-z_][\w:.-]*$/;
function entities(value:string):string{
 return value.replace(/&([^;]*);/g,(_,name:string)=>{
  const named:Record<string,string>={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
  if(name in named)return named[name];
  const number=/^#\d+$/.test(name)?Number(name.slice(1)):/^#x[\da-f]+$/i.test(name)?parseInt(name.slice(2),16):NaN;
  if(!Number.isInteger(number)||number<=0||number>0x10ffff||(number<32&&![9,10,13].includes(number))||(number>=0xd800&&number<=0xdfff)||number===0xfffe||number===0xffff)throw Error('Nieobsługiwana encja XML.');
  return String.fromCodePoint(number);
 });
}
function decoded(value:string):string{
 // Check lexical entities before replacement, so decoded ampersands remain ordinary text.
 if(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/i.test(value))throw Error('Nieprawidłowa encja XML.');
 return entities(value);
}
function safeValue(value:string):void{
 if(/[\\<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)||/@|\/\*|\*\//.test(value))throw Error('SVG zawiera niedozwolone ustawienia.');
 const remainder=value.replace(/url\(\s*(['"]?)(#[A-Za-z_][\w:.-]*)\1\s*\)/gi,'');
 if(/url\s*\(/i.test(remainder))throw Error('SVG może odwoływać się tylko do lokalnych elementów.');
}
function validateSvg(xml:string):void{
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(xml))throw Error('Nieprawidłowe znaki XML.');
 let position=0,nodes=0,rootSeen=false,rootClosed=false;const stack:string[]=[];
 if(xml.charCodeAt(0)===0xfeff)position=1;
 if(xml.startsWith('<?xml',position)){
  const end=xml.indexOf('?>',position);if(end<0)throw Error('Nieprawidłowa deklaracja XML.');
  const declaration=xml.slice(position,end+2);
  if(!/^<\?xml\s+version\s*=\s*(['"])1\.[01]\1(?:\s+encoding\s*=\s*(['"])UTF-8\2)?(?:\s+standalone\s*=\s*(['"])(?:yes|no)\3)?\s*\?>$/i.test(declaration))throw Error('Nieobsługiwana deklaracja XML.');
  position=end+2;
 }
 while(position<xml.length){
  if(++nodes>MAX_NODES)throw Error('SVG zawiera zbyt wiele elementów.');
  if(xml[position]!=='<'){
   const end=xml.indexOf('<',position),text=xml.slice(position,end<0?xml.length:end);decoded(text);if(text.includes(']]>'))throw Error('Nieprawidłowy tekst XML.');
   if(text.trim()&&!['text','tspan','title','desc'].includes(stack.at(-1)||''))throw Error('Tekst poza elementem tekstowym SVG.');
   position=end<0?xml.length:end;continue;
  }
  if(xml.startsWith('<!--',position)){
   const end=xml.indexOf('-->',position+4);if(end<0||xml.slice(position+4,end).includes('--'))throw Error('Nieprawidłowy komentarz XML.');position=end+3;continue;
  }
  if(xml.startsWith('<!',position)||xml.startsWith('<?',position))throw Error('SVG zawiera niedozwoloną deklarację.');
  let end=position+1,quote='';
  for(;end<xml.length;end++){const c=xml[end];if(quote){if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='>')break;else if(c==='<')throw Error('Nieprawidłowy znacznik XML.');}
  if(end===xml.length||quote)throw Error('Niepełny znacznik XML.');
  const token=xml.slice(position+1,end);position=end+1;
  const closing=/^\/([A-Za-z][\w.-]*)\s*$/.exec(token);
  if(closing){if(stack.pop()!==closing[1])throw Error('Niezgodne znaczniki SVG.');if(!stack.length)rootClosed=true;continue;}
  const opening=/^([A-Za-z][\w.-]*)([\s\S]*)$/.exec(token);if(!opening)throw Error('Nieprawidłowy znacznik SVG.');
  const [,name,raw]=opening;if(!elements.has(name))throw Error(`Niedozwolony element SVG: ${name}.`);
  if(!stack.length){if(rootSeen||rootClosed||name!=='svg')throw Error('Dokument musi zawierać jeden główny element SVG.');rootSeen=true;}
  const selfClosing=/\/$/.test(raw),body=selfClosing?raw.slice(0,-1):raw;let at=0;const seen=new Set<string>();
  while(at<body.length){
   const rest=body.slice(at);if(/^\s*$/.test(rest))break;
   const match=/^\s+([A-Za-z_][\w:.-]*)\s*=\s*(["'])([\s\S]*?)\2/.exec(rest);
   if(!match)throw Error('Nieprawidłowy atrybut SVG.');at+=match[0].length;
   const attr=match[1],value=decoded(match[3]);if(!attributes.has(attr)||/^on/i.test(attr)||seen.has(attr))throw Error(`Niedozwolony atrybut SVG: ${attr}.`);seen.add(attr);safeValue(value);
   if((attr==='href'||attr==='xlink:href')&&!localReference.test(value))throw Error('SVG może używać wyłącznie lokalnych odwołań.');
   if(attr==='xmlns'&&value!=='http://www.w3.org/2000/svg')throw Error('Nieprawidłowa przestrzeń nazw SVG.');
   if(attr==='xmlns:xlink'&&value!=='http://www.w3.org/1999/xlink')throw Error('Nieprawidłowa przestrzeń nazw SVG.');
   if(attr==='style')for(const declaration of value.split(';')){if(!declaration.trim())continue;const colon=declaration.indexOf(':');if(colon<0||!styleProperties.has(declaration.slice(0,colon).trim()))throw Error('Nieobsługiwany styl SVG.');}
  }
  if(!selfClosing){stack.push(name);if(stack.length>MAX_DEPTH)throw Error('SVG jest zbyt głęboko zagnieżdżony.');}else if(!stack.length)rootClosed=true;
 }
 if(!rootSeen||stack.length||!rootClosed)throw Error('Niepełny dokument SVG.');
}
export function graphicSourceError(value:string):string|null{
 if(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value))return null;
 const prefix='data:image/svg+xml;base64,';
 if(!value.startsWith(prefix))return 'Obsługiwane są grafiki PNG oraz statyczne SVG.';
 try{
  const base64=value.slice(prefix.length);if(base64.length>Math.ceil(MAX_BYTES/3)*4||!base64.length||base64.length%4!==0||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64))throw Error('Nieprawidłowy lub zbyt duży plik SVG.');
  const binary=atob(base64);if(binary.length>MAX_BYTES||btoa(binary)!==base64)throw Error('Nieprawidłowe kodowanie SVG.');
  const xml=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0)));validateSvg(xml);return null;
 }catch(error){return error instanceof Error?error.message:'Nieprawidłowy plik SVG.';}
}
export function validateGraphicSource(value:string):boolean{return graphicSourceError(value)===null;}
