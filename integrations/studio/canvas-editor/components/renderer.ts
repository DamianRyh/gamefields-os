import {surfaceImage,type SurfaceFinish} from '@/lib/p1-surface';
export type Mesh={normals?:number[][];perforated?:boolean;id:string;label:string;group:string;v:number[][];f:number[][];uv:number[][];artwork:boolean};
export type Appearance={color:string;finish:string;visible:boolean;text:string;image?:string;u:number;v:number;scale:number;rotation:number};
type SurfaceMaps=[WebGLTexture,WebGLTexture,WebGLTexture];
type Item={mesh:Mesh;buffer:WebGLBuffer;count:number;texture:WebGLTexture;key:string;whiteTexture:boolean;surfaceKey?:string;surface?:SurfaceFinish;maps?:SurfaceMaps};
const fragment=`precision highp float;
varying vec3 n;varying vec2 tex;varying vec3 point;
uniform float perforated;uniform sampler2D image;uniform vec3 color;uniform vec3 pickColor;
uniform float picking;uniform float selected;uniform float finish;
uniform float hasSurface;uniform float tileSize;uniform vec3 referenceColor;uniform float turf;uniform float detail;
uniform sampler2D surfaceColor;uniform sampler2D surfaceNormal;uniform sampler2D surfaceOrm;
const float PI=3.14159265;
void main(){
 if(picking>.5){gl_FragColor=vec4(pickColor,1.);return;}
 if(perforated>.5){vec2 f=fract(vec2(atan(point.x,point.z)*3.025/.008,point.y/.013856406));vec2 a=abs(f-vec2(.25,.25)),b=abs(f-vec2(.75,.75));a=min(a,1.-a)*vec2(.008,.013856406);b=min(b,1.-b)*vec2(.008,.013856406);if(min(dot(a,a),dot(b,b))<.00000625)discard;}
 vec3 normal=normalize(n);vec4 artwork=texture2D(image,tex);vec3 c=artwork.rgb*color;
 if(hasSurface>.5){
  vec2 materialUV=vec2(point.x,-point.z)/tileSize;
  vec3 grain=texture2D(surfaceColor,materialUV).rgb;
  c=turf>.5?mix(grain,c,artwork.a):c*mix(vec3(1.),clamp(grain/referenceColor,vec3(.5),vec3(1.6)),detail);
  vec3 mapN=normalize(mix(vec3(0.,0.,1.),texture2D(surfaceNormal,materialUV).rgb*2.-1.,detail));
  vec3 axis=abs(normal.x)>.9?vec3(0.,0.,1.):vec3(1.,0.,0.);vec3 tangent=normalize(axis-normal*dot(axis,normal));vec3 bitangent=cross(normal,tangent);
  normal=normalize(tangent*mapN.x+bitangent*mapN.y+normal*mapN.z);
  float rough=clamp(texture2D(surfaceOrm,materialUV).g,.25,.98);
  vec3 L=normalize(vec3(.35,.85,.4)),V=normalize(vec3(.3,.8,.5)),H=normalize(L+V);
  float nl=max(dot(normal,L),0.),nv=max(dot(normal,V),.01),nh=max(dot(normal,H),0.),vh=max(dot(V,H),0.);
  float alpha=rough*rough,a2=alpha*alpha,den=nh*nh*(a2-1.)+1.;
  float D=a2/(PI*den*den),k=(rough+1.)*(rough+1.)/8.;
  float G=(nl/(nl*(1.-k)+k))*(nv/(nv*(1.-k)+k));
  float F=.04+.96*pow(1.-vh,5.);float spec=D*G*F/max(4.*nl*nv,.001);
  vec3 linear=pow(clamp(c,0.,1.),vec3(2.2));
  c=pow(clamp(linear*(.42+.7*nl)+vec3(spec*nl*.5),0.,1.),vec3(1./2.2));
 }else{
  float light=.58+.42*abs(dot(normal,normalize(vec3(.35,.85,.4))));
  float spec=finish*pow(abs(dot(normal,normalize(vec3(.5,.75,.43)))),14.)*.26;c=c*light+spec;
 }
 gl_FragColor=vec4(mix(c,vec3(.70,.92,.35),selected*.22),1.);
}`;
export class Renderer{
 gl:WebGLRenderingContext;program:WebGLProgram;items:Item[]=[];yaw=.38;pitch=.48;zoom=1;selected='';gray=false;placement:{cx:number;cy:number;scale:number}|null=null;dead=false;pending=0;
 private textureJobs=new Map<string,{key:string;promise:Promise<void>}>();
 private materialCache=new Map<string,Promise<SurfaceMaps>>();private materialTextures=new Set<WebGLTexture>();
 constructor(public canvas:HTMLCanvasElement,meshes:Mesh[]){
 const gl=canvas.getContext('webgl',{antialias:true,preserveDrawingBuffer:true,alpha:true});if(!gl)throw Error('Przeglądarka nie obsługuje WebGL');this.gl=gl;
 const shader=(type:number,src:string)=>{const s=gl.createShader(type)!;gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'Shader error');return s};
 const vs=shader(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec3 normal;attribute vec2 uv;uniform vec3 view;uniform vec2 size;uniform vec2 offset;varying vec3 n;varying vec2 tex;varying vec3 point;void main(){float cy=cos(view.x),sy=sin(view.x),cp=cos(view.y),sp=sin(view.y);float x=position.x*cy-position.z*sy,z=position.x*sy+position.z*cy,y=position.y;gl_Position=vec4(x*view.z*2./size.x+offset.x,(y*cp-z*sp)*view.z*2./size.y+offset.y,(-z*cp-y*sp)/10.,1.);n=normal;tex=uv;point=position;}`);
 const fs=shader(gl.FRAGMENT_SHADER,fragment);this.program=gl.createProgram()!;gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program)||'Program error');gl.deleteShader(vs);gl.deleteShader(fs);
 for(const mesh of meshes){const data:number[]=[];for(const f of mesh.f){const[a,b,c]=f.map(i=>mesh.v[i]),u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);if(l<1e-10)continue;n=n.map(x=>x/l);for(const i of f)data.push(...mesh.v[i],...(mesh.normals?.[i]||n),...mesh.uv[i]);}const buffer=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);gl.activeTexture(gl.TEXTURE0);const texture=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);this.items.push({mesh,buffer,count:data.length/8,texture,key:'',whiteTexture:true});}
 gl.enable(gl.DEPTH_TEST);
 }
 appearances:Record<string,Appearance>={};
 draw(picking=false){if(this.dead)return;const gl=this.gl,W=this.canvas.clientWidth,H=this.canvas.clientHeight,dpr=Math.min(devicePixelRatio,2);if(!W||!H)return;if(this.canvas.width!==Math.round(W*dpr)||this.canvas.height!==Math.round(H*dpr)){this.canvas.width=Math.round(W*dpr);this.canvas.height=Math.round(H*dpr);}gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(...(picking?[0,0,0,1]:[0,0,0,0]) as [number,number,number,number]);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
 const loc=(n:string)=>gl.getUniformLocation(this.program,n);const place=this.placement;gl.uniform3f(loc('view'),this.yaw,this.pitch,(place?place.scale*W/1672:Math.min(W/8.5,H/5.8))*this.zoom);gl.uniform2f(loc('offset'),place?(place.cx/1672*2-1):0,place?(1-place.cy/941*2):0);gl.uniform2f(loc('size'),W,H);gl.uniform1f(loc('picking'),picking?1:0);gl.uniform1i(loc('image'),0);
 for(const [i,name] of ['surfaceColor','surfaceNormal','surfaceOrm'].entries())gl.uniform1i(loc(name),i+1);
 this.items.forEach((item,i)=>{const a=this.appearances[item.mesh.id];if(!a||!a.visible)return;gl.bindBuffer(gl.ARRAY_BUFFER,item.buffer);for(const [name,count,off] of [['position',3,0],['normal',3,12],['uv',2,24]] as const){const att=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(att);gl.vertexAttribPointer(att,count,gl.FLOAT,false,32,off);}let rgb=(item.key||item.mesh.group==='floor')?[1,1,1]:[1,3,5].map(k=>parseInt(a.color.slice(k,k+2),16)/255);if(this.gray)rgb=[.75,.77,.79];gl.uniform3fv(loc('color'),rgb);gl.uniform1f(loc('perforated'),item.mesh.perforated?1:0);gl.uniform1f(loc('selected'),item.mesh.id===this.selected?1:0);gl.uniform1f(loc('finish'),a.finish==='metal'?1:a.finish==='gloss'?.65:0);const id=i+1;gl.uniform3f(loc('pickColor'),(id&255)/255,((id>>8)&255)/255,0);
 const surface=item.maps&&item.surface;gl.uniform1f(loc('hasSurface'),surface?1:0);gl.uniform1f(loc('tileSize'),surface?.tileSize||1);gl.uniform3fv(loc('referenceColor'),surface?.reference||[1,1,1]);gl.uniform1f(loc('turf'),surface?.turf?1:0);gl.uniform1f(loc('detail'),surface?.detail?1:0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,item.texture);for(let j=0;j<3;j++){gl.activeTexture(gl.TEXTURE0+j+1);gl.bindTexture(gl.TEXTURE_2D,item.maps?.[j]||item.texture)}gl.drawArrays(gl.TRIANGLES,0,item.count);});gl.activeTexture(gl.TEXTURE0);
 }
 pick(x:number,y:number){this.draw(true);const rect=this.canvas.getBoundingClientRect(),pixel=new Uint8Array(4);this.gl.readPixels(Math.floor((x-rect.left)*this.canvas.width/rect.width),Math.floor((rect.bottom-y)*this.canvas.height/rect.height),1,1,this.gl.RGBA,this.gl.UNSIGNED_BYTE,pixel);const i=pixel[0]+pixel[1]*256-1;this.draw();return this.items[i]?.mesh.id;}
 // Pending consumers share the first job's upload/draw policy; defaults retain immediate drawing.
 async texture(id:string,source:string|(()=>Promise<string>),key:string,decode?:(source:string)=>Promise<HTMLImageElement>,options:{drawAfterUpload?:boolean}={}){
  const item=this.items.find(x=>x.mesh.id===id);const running=this.textureJobs.get(id);if(item?.key===key&&running?.key===key)return running.promise;
  if(!item||item.key===key)return;
  const drawAfterUpload=options.drawAfterUpload!==false;item.key=key;this.pending++;
  const promise=(async()=>{try{const resolved=typeof source==='function'?await source():source;let img:HTMLImageElement;if(decode)img=await decode(resolved);else{img=new Image();await new Promise<void>((ok,no)=>{img.onload=()=>ok();img.onerror=()=>no(Error('Nie można wczytać grafiki'));img.src=resolved})}if(this.dead||item.key!==key)return;const gl=this.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,item.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);item.whiteTexture=false;if(drawAfterUpload)this.draw()}catch(e){if(item.key===key)item.key='';throw e}finally{this.pending--}})();
  const job={key,promise};this.textureJobs.set(id,job);const clear=()=>{if(this.textureJobs.get(id)===job)this.textureJobs.delete(id)};void promise.then(clear,clear);return promise;
 }
 async surface(id:string,finish:SurfaceFinish){
  const item=this.items.find(x=>x.mesh.id===id);if(!item)return;const key=JSON.stringify(finish);item.surfaceKey=key;this.pending++;
  try{
   let maps=this.materialCache.get(finish.slug);
   if(!maps){maps=Promise.all(['kolor.jpg','normal.png','orm.png'].map(kind=>surfaceImage(`/surfaces/p1/${finish.slug}-${kind}`))).then(images=>{
    if(this.dead)return [] as unknown as SurfaceMaps;
    const gl=this.gl,anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');
    return images.map(img=>{const t=gl.createTexture()!;this.materialTextures.add(t);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));return t}) as SurfaceMaps;
   });this.materialCache.set(finish.slug,maps);void maps.catch(()=>this.materialCache.delete(finish.slug))}
   const textures=await maps;if(this.dead||item.surfaceKey!==key)return;item.maps=textures;item.surface=finish;this.draw();
  }finally{this.pending--}
 }
 clearTexture(id:string){const item=this.items.find(x=>x.mesh.id===id);if(!item)return;item.key='';if(item.whiteTexture===true)return;const gl=this.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,item.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));item.whiteTexture=true;}
 dispose(){this.dead=true;for(const i of this.items){this.gl.deleteBuffer(i.buffer);this.gl.deleteTexture(i.texture)}for(const t of this.materialTextures)this.gl.deleteTexture(t);this.materialTextures.clear();this.materialCache.clear();this.gl.deleteProgram(this.program);}
}
