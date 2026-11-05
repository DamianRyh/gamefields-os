import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {loadImage} from '@/lib/load-image';
import {surfaceImage,type SurfaceFinish} from '@/lib/p1-surface';
import type {Mesh,Appearance,Renderer} from './renderer';
export type ArenaRenderer=Pick<Renderer,'draw'|'texture'|'surface'|'clearTexture'|'dispose'|'gl'|'dead'|'depthRange'|'placement'|'yaw'|'pitch'|'appearances'>;
type Part={source:Mesh;mesh:THREE.Mesh<THREE.BufferGeometry,THREE.MeshPhysicalMaterial>;key:string;token?:object;surfaceToken?:object;grain?:THREE.Texture;reference?:THREE.Vector3;turf?:number;detail?:number;tile?:number;finishKey?:string;uniforms?:Record<string,THREE.IUniform>};

/** Product-only PBR view. Existing validated project geometry and artwork remain authoritative. */
export class ProductRenderer implements ArenaRenderer{
 gl:WebGLRenderingContext;dead=false;depthRange=10;yaw=-.55;pitch=.365;placement:Renderer['placement']=null;appearances:Record<string,Appearance>={};
 private renderer:THREE.WebGLRenderer;private scene=new THREE.Scene();private camera=new THREE.OrthographicCamera(-5,5,5,-5,.05,200);
 private parts:Part[]=[];private textures=new Set<THREE.Texture>();private environment:THREE.WebGLRenderTarget;private plane:THREE.Mesh<THREE.PlaneGeometry,THREE.ShadowMaterial>;
 private jobs=new Map<string,{key:string;promise:Promise<void>}>();
 private contact:THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>;
 private idle=0;private lastDraw=0;private frames=0;private width=0;private height=0;private ray=new THREE.Raycaster();
 constructor(public canvas:HTMLCanvasElement,meshes:Mesh[]){
  this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'default'});
  this.gl=this.renderer.getContext();this.renderer.setClearColor(0xffffff,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.96;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;
  const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(room,.05);this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.55;pmrem.dispose();room.dispose();
  const hemi=new THREE.HemisphereLight(0xf6f8ff,0xc5c3bf,.8);this.scene.add(hemi);
  const bounds=new THREE.Box3();
  for(const source of meshes){
   const geometry=new THREE.BufferGeometry(),positions:number[]=[],normals:number[]=[],uv:number[]=[];
   for(const f of source.f){if(f.length!==3)continue;const [a,b,c]=f.map(i=>new THREE.Vector3(...source.v[i] as [number,number,number]));const n=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).normalize();
    for(const i of f){positions.push(...source.v[i]);normals.push(...(source.normals?.[i]||n.toArray()));uv.push(...(source.uv?.[i]||[0,0]));}}
   geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeBoundingBox();bounds.union(geometry.boundingBox!);
   const material=new THREE.MeshPhysicalMaterial({color:0x30363c,roughness:.56,metalness:.16,clearcoat:.16,clearcoatRoughness:.45,side:THREE.DoubleSide});
   const mesh=new THREE.Mesh(geometry,material);mesh.name=source.id;mesh.castShadow=source.group!=='floor';mesh.receiveShadow=true;this.scene.add(mesh);
   const part:Part={source,mesh,key:''};this.parts.push(part);
   // World-space perforation: derivative filtering retains coverage as holes become sub-pixel.
   if(source.perforated){material.alphaToCoverage=true;material.premultipliedAlpha=true;material.onBeforeCompile=shader=>{
    shader.uniforms.panelDirection={value:new THREE.Vector2(...(source.perforationDirection||[0,0]) as [number,number])};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 panelPoint;').replace('#include <begin_vertex>','#include <begin_vertex>\npanelPoint=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 panelPoint;uniform vec2 panelDirection;').replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
      vec2 q=vec2((length(panelDirection)>.5?dot(panelPoint.xz,panelDirection):atan(panelPoint.x,panelPoint.z)*3.025)/.008,panelPoint.y/.013856406);
      vec2 f=fract(q),a=abs(f-vec2(.25)),b=abs(f-vec2(.75));a=min(a,1.-a)*vec2(.008,.013856406);b=min(b,1.-b)*vec2(.008,.013856406);
      float d=sqrt(min(dot(a,a),dot(b,b))),edge=max(length(fwidth(panelPoint)),.0001);
      float cover=mix(smoothstep(.0025-edge,.0025+edge,d),.646,smoothstep(.35,1.2,max(fwidth(q).x,fwidth(q).y)));
      if(cover<.015)discard;diffuseColor.a*=sqrt(cover);
    `);
   };material.customProgramCacheKey=()=>`product-perforation-v1`;}
  }
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const radius=Math.max(size.x,size.z)*.8;
  const key=new THREE.DirectionalLight(0xfff8ed,2.2);key.position.set(center.x-5,center.y+9,center.z+5);key.target.position.copy(center);key.castShadow=true;
  key.shadow.mapSize.set(canvas.clientWidth<700?1024:2048,canvas.clientWidth<700?1024:2048);Object.assign(key.shadow.camera,{left:-radius,right:radius,top:radius,bottom:-radius,near:.1,far:40});key.shadow.normalBias=.012;key.shadow.bias=-.00015;key.shadow.radius=10;this.scene.add(key,key.target);
  const fill=new THREE.DirectionalLight(0xe8efff,.75);fill.position.set(5,4,-6);this.scene.add(fill);
  const floor=this.parts.find(p=>p.source.group==='floor');const ground=floor?.mesh.geometry.boundingBox?.min.y??bounds.min.y;
  this.plane=new THREE.Mesh(new THREE.PlaneGeometry(Math.max(30,size.x*4),Math.max(30,size.z*4)),new THREE.ShadowMaterial({opacity:.20,color:0x24252a}));
  this.plane.rotation.x=-Math.PI/2;this.plane.position.set(center.x,ground-.015,center.z);this.plane.receiveShadow=true;this.scene.add(this.plane);
  // Bounded contact AO from the lowest construction vertices, independent of orbit.
  const mask=document.createElement('canvas');mask.width=mask.height=512;const ink=mask.getContext('2d')!;
  const foot=document.createElement('canvas');foot.width=foot.height=512;const dots=foot.getContext('2d')!;dots.fillStyle='#000';
  const sx=size.x+1.6,sz=size.z+1.6;let bottom=Infinity;
  for(const part of this.parts)if(part.source.group!=='floor')bottom=Math.min(bottom,part.mesh.geometry.boundingBox!.min.y);
  for(const part of this.parts){if(part.source.group==='floor')continue;const vertices=part.source.v,step=Math.max(1,Math.ceil(vertices.length/1200));for(let i=0;i<vertices.length;i+=step){const v=vertices[i];if(v[1]>bottom+.13)continue;const x=(v[0]-center.x)/sx*512+256,z=(v[2]-center.z)/sz*512+256;dots.fillRect(x-2,z-2,4,4);}}
  ink.filter='blur(7px)';ink.drawImage(foot,0,0);ink.filter='blur(2px)';ink.globalAlpha=.45;ink.drawImage(foot,0,0);
  const ao=new THREE.CanvasTexture(mask);this.textures.add(ao);this.contact=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),new THREE.MeshBasicMaterial({map:ao,transparent:true,opacity:.24,depthWrite:false,toneMapped:false}));
  this.contact.rotation.x=-Math.PI/2;this.contact.position.set(center.x,ground-.01,center.z);this.contact.renderOrder=2;this.scene.add(this.contact);
  canvas.dataset.productRenderer='three-pbr';canvas.dataset.studioRealism='physical-steel';
 }
 draw(){if(this.dead)return;clearTimeout(this.idle);const now=performance.now(),moving=now-this.lastDraw<90;this.lastDraw=now;
  this.render(moving?1:Math.min(devicePixelRatio,1.75));
  this.idle=window.setTimeout(()=>{if(!this.dead){this.render(Math.min(devicePixelRatio,2));this.canvas.dataset.renderQuality='settled';}},220);
 }
 private render(dpr:number){const W=this.canvas.clientWidth,H=this.canvas.clientHeight;if(!W||!H||this.dead)return;
  this.canvas.dataset.renderQuality='interactive';if(this.renderer.getPixelRatio()!==dpr)this.renderer.setPixelRatio(dpr);if(W!==this.width||H!==this.height){this.renderer.setSize(W,H,false);this.width=W;this.height=H;}
  const place=this.placement,ppu=place?place.scale*W/1672:Math.min(W/8.5,H/5.8),halfW=W/(2*ppu),halfH=H/(2*ppu);
  Object.assign(this.camera,{left:-halfW,right:halfW,top:halfH,bottom:-halfH});this.camera.updateProjectionMatrix();
  const right=new THREE.Vector3(Math.cos(this.yaw),0,-Math.sin(this.yaw)),up=new THREE.Vector3(-Math.sin(this.yaw)*Math.sin(this.pitch),Math.cos(this.pitch),-Math.cos(this.yaw)*Math.sin(this.pitch));
  const target=right.multiplyScalar(place?(W/2-place.cx*W/1672)/ppu:0).add(up.multiplyScalar(place?(place.cy*H/941-H/2)/ppu:0));
  this.camera.position.copy(target).add(new THREE.Vector3(Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),Math.cos(this.yaw)*Math.cos(this.pitch)).multiplyScalar(50));this.camera.up.set(0,1,0);this.camera.lookAt(target);
  for(const part of this.parts){const a=this.appearances[part.source.id];part.mesh.visible=!!a?.visible;if(!a)continue;
   const mat=part.mesh.material;mat.color.set(part.source.group==='floor'||part.key?'#ffffff':a.color);mat.roughness=part.source.group==='floor'?.94:a.finish==='metal'?.34:a.finish==='gloss'?.28:.56;mat.envMapIntensity=part.source.group==='floor'?.22:.85;mat.metalness=part.source.group==='floor'?0:a.finish==='metal'?.35:.12;mat.clearcoat=part.source.group==='floor'?0:a.finish==='matte'?.12:.35;
  }
  this.renderer.render(this.scene,this.camera);this.canvas.dataset.renderFrames=String(++this.frames);
 }
 texture(id:string,source:string|(()=>Promise<string>),key:string,decode?:(source:string)=>Promise<HTMLImageElement>,options:{drawAfterUpload?:boolean}={}):Promise<void>{
  const active=this.jobs.get(id);if(active?.key===key&&this.parts.find(p=>p.source.id===id)?.key===key)return active.promise;
  const promise=this.applyTexture(id,source,key,decode,options),job={key,promise};this.jobs.set(id,job);const clear=()=>{if(this.jobs.get(id)===job)this.jobs.delete(id)};void promise.then(clear,clear);return promise;
 }
 private async applyTexture(id:string,source:string|(()=>Promise<string>),key:string,decode?:(source:string)=>Promise<HTMLImageElement>,options:{drawAfterUpload?:boolean}={}){
  const part=this.parts.find(p=>p.source.id===id);if(!part||part.key===key)return;const token={};part.token=token;part.key=key;
  try{const url=typeof source==='function'?await source():source;const img=await(decode?decode(url):loadImage(url));if(this.dead||part.token!==token)return;
   const texture=new THREE.Texture(img);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;this.textures.add(texture);
   const old=part.mesh.material.map;if(old){old.dispose();this.textures.delete(old);}part.mesh.material.map=texture;part.mesh.material.needsUpdate=true;if(options.drawAfterUpload!==false)this.draw();
  }catch(e){if(part.token===token)part.key='';throw e;}
 }
 clearTexture(id:string){const part=this.parts.find(p=>p.source.id===id);if(!part||this.dead)return;part.token={};part.key='';const map=part.mesh.material.map;if(map){map.dispose();this.textures.delete(map);part.mesh.material.map=null;part.mesh.material.needsUpdate=true;}}
 async surface(id:string,finish:SurfaceFinish){const part=this.parts.find(p=>p.source.id===id);if(!part)return;const token={};part.surfaceToken=token;const finishKey=JSON.stringify(finish);if(part.finishKey===finishKey)return;
  const images=await Promise.all(['kolor.jpg','normal.png','orm.png'].map(name=>surfaceImage(`/surfaces/p1/${finish.slug}-${name}`)));if(this.dead||part.surfaceToken!==token)return;
  const bounds=part.mesh.geometry.boundingBox!,span=bounds.getSize(new THREE.Vector3()),mat=part.mesh.material;
  for(const key of ['normalMap','roughnessMap']as const){if(mat[key]){this.textures.delete(mat[key]!);mat[key]!.dispose();}}
  for(const [i,key]of [[1,'normalMap'],[2,'roughnessMap']]as const){const texture=new THREE.Texture(images[i]);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(span.x/finish.tileSize,span.z/finish.tileSize);texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;mat[key]=texture;this.textures.add(texture);}
  mat.normalScale.setScalar(finish.detail?.20:0);mat.roughness=.84;
  if(part.grain){part.grain.dispose();this.textures.delete(part.grain);}part.grain=new THREE.Texture(images[0]);part.grain.colorSpace=THREE.SRGBColorSpace;part.grain.wrapS=part.grain.wrapT=THREE.RepeatWrapping;part.grain.needsUpdate=true;this.textures.add(part.grain);
  part.reference=new THREE.Vector3(...finish.reference);part.turf=finish.turf?1:0;part.detail=finish.detail?1:0;part.tile=finish.tileSize;
  const values:Record<string,unknown>={productGrain:part.grain,productReference:part.reference,productTurf:part.turf,productDetail:part.detail,productTile:part.tile};part.uniforms??={};for(const [name,value]of Object.entries(values)){if(part.uniforms[name])part.uniforms[name].value=value;else part.uniforms[name]={value};}
  mat.onBeforeCompile=shader=>{Object.assign(shader.uniforms,part.uniforms);
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 physicalUv;').replace('#include <begin_vertex>','#include <begin_vertex>\nphysicalUv=vec2(position.x,-position.z);');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 physicalUv;uniform sampler2D productGrain;uniform vec3 productReference;uniform float productTurf,productDetail,productTile;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
    vec4 art=texture2D(map,vMapUv);vec3 grain=texture2D(productGrain,physicalUv/productTile).rgb;
    diffuseColor.rgb*=productTurf>.5?mix(grain,art.rgb,art.a):art.rgb*mix(vec3(1.),clamp(grain/productReference,vec3(.5),vec3(1.6)),productDetail);
   #endif`);
  };mat.customProgramCacheKey=()=>`product-floor-v1`;part.finishKey=finishKey;mat.needsUpdate=true;this.draw();
 }
 pick(x:number,y:number){const rect=this.canvas.getBoundingClientRect();this.ray.setFromCamera(new THREE.Vector2((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1),this.camera);return this.ray.intersectObjects(this.parts.map(p=>p.mesh),false)[0]?.object.name;}
 dispose(){if(this.dead)return;this.dead=true;clearTimeout(this.idle);for(const p of this.parts){p.mesh.geometry.dispose();p.mesh.material.dispose();}for(const t of this.textures)t.dispose();this.textures.clear();this.contact.geometry.dispose();this.contact.material.dispose();this.plane.geometry.dispose();this.plane.material.dispose();this.environment.dispose();this.scene.traverse(obj=>{if(obj instanceof THREE.DirectionalLight)obj.shadow.dispose();});this.renderer.dispose();this.scene.clear();}
}
