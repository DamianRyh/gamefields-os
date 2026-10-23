import {loadImage} from './load-image.ts';
/** Texture scale and reference colour from the optimized Blender materials. */
export type SurfaceFinish={slug:string;tileSize:number;reference:[number,number,number];turf:boolean;detail:boolean};
export function p1SurfaceFinish(surface:string,detail=true):SurfaceFinish{
 const materials:Record<string,Omit<SurfaceFinish,'detail'>>={
  'Akryl sportowy':{slug:'malowana',tileSize:.2,reference:[32/255,102/255,103/255],turf:false},
  EPDM:{slug:'granulat-epdm',tileSize:.2,reference:[30/255,99/255,100/255],turf:false},
  'Moduły sportowe':{slug:'plytki-modulowe',tileSize:.3,reference:[31/255,105/255,108/255],turf:false},
  'Sztuczna trawa 60 mm':{slug:'sztuczna-murawa',tileSize:.2,reference:[35/255,83/255,38/255],turf:true},
 };
 return {...(materials[surface]||materials['Akryl sportowy']),detail};
}
// Reuse decoded images across the entry preview, builder and material switches.
const images=new Map<string,Promise<HTMLImageElement>>();
export function surfaceImage(url:string){
 let promise=images.get(url);
 if(!promise){promise=loadImage(url);images.set(url,promise);const current=promise;void promise.catch(()=>{if(images.get(url)===current)images.delete(url)})}
 return promise;
}
