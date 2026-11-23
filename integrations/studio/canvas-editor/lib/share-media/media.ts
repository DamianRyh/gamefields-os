/* Share Your Field: PNG and MP4 from the live 3D scene of the Studio.
   Stills: three shots (hero = the user's current view, low = street, top = field card), trimmed to the model.
   Film: 6 s at 30 fps, camera cranes down and moves in while orbiting 200° with ease-in-out and settles on the
   hero view; 4 (desktop) or 2 (phone) sub-frames per frame for motion blur; H.264 via WebCodecs, own MP4 writer. */
import {compose,trim,FORMAT_SIZE,MODEL_SLOT,type ShareFormat,type ShareStyle,type ShareImages} from './compose';
import type {ShareFacts} from './facts';
import {Mp4Writer} from './mp4';
import type {ShareRenderer} from './registry';

const deg=(r:number)=>r*180/Math.PI;
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
const copy=(c:HTMLCanvasElement)=>{const o=document.createElement('canvas');o.width=c.width;o.height=c.height;o.getContext('2d')!.drawImage(c,0,0);return o};
const phone=()=>typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;

/** Camera presets. az/el in degrees; el0/k0 = start of the film (higher, further), the film ends on el1/1. */
const LOOK={clean:{fov:24,azOffset:0,el:30,el0:54,margin:1.04,k0:1.18,spin:200},street:{fov:28,azOffset:-12,el:13,el0:40,margin:.98,k0:1.04,spin:220}} as const;
const heroAzimuth=(r:ShareRenderer)=>deg(r.yaw);

export function stills(r:ShareRenderer):ShareImages{
 const az=heroAzimuth(r),q=phone()?1.3:1.6,images:Partial<ShareImages>={};
 try{
  const [cw,ch]=MODEL_SLOT.clean.story;r.beginCapture(cw*q,ch*q);images.hero=trim(r.shot({azimuth:az,elevation:clamp(deg(r.pitch),22,40),fov:LOOK.clean.fov,margin:LOOK.clean.margin}));
  const [sw,sh]=MODEL_SLOT.street.story;r.beginCapture(sw*q,sh*q);images.low=trim(r.shot({azimuth:az+LOOK.street.azOffset,elevation:LOOK.street.el,fov:LOOK.street.fov,margin:LOOK.street.margin}));
  r.beginCapture(1100,1100);images.top=trim(r.shot({azimuth:0,elevation:89.5,fov:14,margin:1.02}));
 }finally{r.endCapture()}
 images.surface=r.surfaceArtwork();
 return images as ShareImages;
}

export type FilmOptions={format:ShareFormat;style:Exclude<ShareStyle,'plan'>;background:string;facts:ShareFacts;showPrice:boolean;surface:CanvasImageSource|null};
export function filmSupported(){return typeof VideoEncoder==='function'&&typeof VideoFrame==='function'}

async function encoderConfig(width:number,height:number):Promise<VideoEncoderConfig>{
 for(const codec of ['avc1.640028','avc1.4d0028','avc1.42e028']){const c:VideoEncoderConfig={codec,width,height,bitrate:8_000_000,framerate:30,avc:{format:'avc'}};
  try{if((await VideoEncoder.isConfigSupported(c)).supported)return c}catch{/* try the next profile */}}
 throw Error('Ta przeglądarka nie nagra filmu MP4. Pobierz grafikę PNG albo otwórz Studio w Chrome lub Safari.');
}

export async function film(r:ShareRenderer,o:FilmOptions,{onProgress,signal,seconds=6,fps=30}:{onProgress?:(p:number)=>void;signal?:AbortSignal;seconds?:number;fps?:number}={}):Promise<Blob>{
 if(!filmSupported())throw Error('Ta przeglądarka nie nagra filmu MP4. Pobierz grafikę PNG albo otwórz Studio w Chrome lub Safari.');
 const [W,H]=FORMAT_SIZE[o.format],cfg=await encoderConfig(W,H),N=Math.round(seconds*fps),sub=phone()?2:4,q=phone()?1.2:1.6,L=LOOK[o.style];
 const [sw,sh]=MODEL_SLOT[o.style][o.format],azEnd=heroAzimuth(r)+L.azOffset,el1=o.style==='clean'?clamp(deg(r.pitch),22,40):L.el;
 const writer=new Mp4Writer(W,H,fps);let failure:Error|null=null;
 const encoder=new VideoEncoder({output:(chunk,meta)=>writer.add(chunk,meta),error:e=>{failure=e instanceof Error?e:Error(String(e))}});encoder.configure(cfg);
 const work=document.createElement('canvas'),acc=document.createElement('canvas');acc.width=W;acc.height=H;const g=acc.getContext('2d')!;
 const eio=(x:number)=>{x=clamp(x,0,1);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},eo=(x:number)=>1-Math.pow(1-clamp(x,0,1),3),END=.86;
 const images:ShareImages={hero:acc,low:acc,surface:o.surface};
 try{
  r.beginCapture(sw*q,sh*q);
  for(let i=0;i<N;i++){
   if(signal?.aborted)throw new DOMException('Anulowano.','AbortError');if(failure)throw failure;
   for(let j=0;j<sub;j++){const u=(i+j/sub*.5)/N,m=eio(u/END),k=eo(u/END);
    const shot=r.shot({azimuth:azEnd+L.spin*(1-m)-4*(1-u),elevation:L.el0+(el1-L.el0)*m,fov:L.fov,margin:L.margin,dolly:L.k0+(1-L.k0)*k});
    images.hero=shot;images.low=shot;compose(work,{format:o.format,style:o.style,background:o.background,facts:o.facts,images,showPrice:o.showPrice,anim:u*seconds});
    g.globalAlpha=1/(j+1);g.drawImage(work,0,0)}
   g.globalAlpha=1;const frame=new VideoFrame(acc,{timestamp:Math.round(i*1e6/fps),duration:Math.round(1e6/fps)});encoder.encode(frame,{keyFrame:i%(fps*2)===0});frame.close();
   onProgress?.((i+1)/N);
   while(encoder.encodeQueueSize>4)await new Promise(res=>setTimeout(res,4));
   await new Promise(res=>setTimeout(res,0));
  }
  await encoder.flush();if(failure)throw failure;return writer.finish();
 }finally{r.endCapture();if(encoder.state!=='closed')encoder.close()}
}

export function stillBlob(canvas:HTMLCanvasElement){return new Promise<Blob>((ok,no)=>canvas.toBlob(b=>b?ok(b):no(Error('Nie udało się zapisać PNG.')),'image/png'))}
export {copy};
