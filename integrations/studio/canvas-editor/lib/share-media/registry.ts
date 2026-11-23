/* Share Your Field: the 3D view registers its renderer here, the share panel reads it. One active view at a time. */
export type ShotOptions={azimuth:number;elevation:number;fov?:number;dolly?:number;margin?:number};
export type ShareRenderer={yaw:number;pitch:number;dead:boolean;beginCapture(width:number,height:number):void;shot(o:ShotOptions):HTMLCanvasElement;endCapture():void;surfaceArtwork():CanvasImageSource|null};
let active:ShareRenderer|null=null;
const listeners=new Set<()=>void>();
export function registerShareRenderer(renderer:ShareRenderer|null){active=renderer;listeners.forEach(f=>f())}
export function unregisterShareRenderer(renderer:unknown){if(active===renderer){active=null;listeners.forEach(f=>f())}}
export function shareRenderer(){return active&&!active.dead?active:null}
export function onShareRenderer(f:()=>void){listeners.add(f);return()=>{listeners.delete(f)}}
