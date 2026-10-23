import type {ArenaDesign} from './project';
import type {Mesh} from '../components/renderer';

const widths=new WeakMap<Mesh['v'],number>();
/** One instance belongs to one render generation; GPU textures remain per mesh. */
export function createPanelArtwork(){
 const cache=new Map<string,Promise<string>>();
 return (design:ArenaDesign,m:Mesh):Promise<string>=>{
  let width=widths.get(m.v);if(width===undefined){const angles=m.v.map(p=>Math.atan2(p[0],p[2])),center=Math.atan2(angles.reduce((s,a)=>s+Math.sin(a),0),angles.reduce((s,a)=>s+Math.cos(a),0)),unwrapped=angles.map(a=>center+(a-center+Math.PI)%(Math.PI*2)-Math.PI),height=Math.max(...m.v.map(p=>p[1]))-Math.min(...m.v.map(p=>p[1])),aspect=(Math.max(...m.v.map(p=>Math.hypot(p[0],p[2]))))*(Math.max(...unwrapped)-Math.min(...unwrapped))/height;
  width=Math.max(64,Math.min(2048,Math.round(768*aspect)));widths.set(m.v,width)}const key=JSON.stringify(['panel-artwork-v1',width,768,design.panelColor,design.text,design.src]);
  const existing=cache.get(key);if(existing)return existing;
  const promise=(async()=>{const c=document.createElement('canvas');c.width=width;c.height=768;const ctx=c.getContext('2d')!;ctx.fillStyle=design.panelColor;ctx.fillRect(0,0,c.width,c.height);if(design.src){const img=new Image();await new Promise<void>((ok,no)=>{img.onload=()=>ok();img.onerror=no;img.src=design.src!});const scale=Math.min(c.width*.8/img.width,c.height*.5/img.height);ctx.drawImage(img,(c.width-img.width*scale)/2,(c.height-img.height*scale)/2,img.width*scale,img.height*scale)}if(design.text){ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${Math.min(100,c.width*.15)}px Arial`;ctx.fillText(design.text,c.width/2,c.height*(design.src?.78:.5),c.width*.88)}return c.toDataURL('image/png')})();
  cache.set(key,promise);void promise.catch(()=>{if(cache.get(key)===promise)cache.delete(key)});return promise;
 };
}
