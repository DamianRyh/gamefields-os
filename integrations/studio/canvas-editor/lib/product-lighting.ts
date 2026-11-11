import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
/** Neutral product colours and a reusable indoor reflection rig. No remote HDR download. */
export function productLighting(renderer:THREE.WebGLRenderer,scene:THREE.Scene){
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
 const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.06);scene.environment=environment.texture;scene.environmentIntensity=.6;pmrem.dispose();room.dispose();
 return ()=>{scene.environment=null;environment.dispose()};
}
/** Small repeatable relief, independent of printed artwork. */
export function productRelief(kind:'fabric'|'ball'){
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const wave=kind==='fabric'?Math.sin(x*Math.PI/2)*Math.cos(y*Math.PI/2):Math.sin(x*.49)*Math.sin(y*.61)+Math.cos(x*.87+y*.73)*.35;const v=Math.round(128+wave*42),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
 const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.repeat.set(kind==='fabric'?10:7,kind==='fabric'?10:7);t.needsUpdate=true;return t;
}
