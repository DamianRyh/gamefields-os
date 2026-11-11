import type { Mesh } from "@/components/renderer";
import type { PerspectiveCameraEstimate } from "@/lib/makeover-perspective-camera";

export type PerspectiveLighting = { directionDegrees?: number; shadowOpacity?: number; perforatedPanels?: boolean };
const targets=new WeakMap<HTMLCanvasElement,HTMLCanvasElement>();
/** Photo-only renderer. Both the model and its planar shadow use the calibrated camera. */
export function renderPerspectiveMesh(canvas:HTMLCanvasElement,meshes:Mesh[],camera:PerspectiveCameraEstimate,length:number,width:number,options:PerspectiveLighting={}) {
  let target=targets.get(canvas);if(!target){target=document.createElement("canvas");targets.set(canvas,target);}
  if(target.width!==canvas.width)target.width=canvas.width;if(target.height!==canvas.height)target.height=canvas.height;
  const gl=target.getContext("webgl",{alpha:true,antialias:true,stencil:true,preserveDrawingBuffer:true});
  const ctx=canvas.getContext("2d");if(!gl||!ctx)throw Error("WebGL jest niedostępny.");
  if(!meshes.some(m=>m.v.length)||![length,width].every(n=>Number.isFinite(n)&&n>0))throw Error("Niepoprawny model lub wymiary.");
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const m of meshes)for(const v of m.v)for(let i=0;i<3;i++){if(!Number.isFinite(v[i]))throw Error("Niepoprawny wierzchołek siatki.");min[i]=Math.min(min[i],v[i]);max[i]=Math.max(max[i],v[i]);}
  const dx=max[0]-min[0],dz=max[2]-min[2];if(dx<1e-6||dz<1e-6)throw Error("Brak podstawy modelu.");
  const scale=Math.min(length/dx,width/dz),actual:[number,number]=[dx*scale,dz*scale];
  const point=(v:number[])=>[(v[0]-min[0])*scale+(length-actual[0])/2,(v[1]-min[1])*scale,(v[2]-min[2])*scale+(width-actual[1])/2];
  const angle=(options.directionDegrees??45)*Math.PI/180;
  const light=[Math.cos(angle)*.65,1,Math.sin(angle)*.65];
  const shaders:WebGLShader[]=[],buffers:WebGLBuffer[]=[];let program:WebGLProgram|null=null;
  try{
    const shader=(kind:number,code:string)=>{const s=gl.createShader(kind);if(!s)throw Error("Brak pamięci GPU.");shaders.push(s);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||"Shader error");return s;};
    const vs=shader(gl.VERTEX_SHADER,`attribute vec3 pos,normal;uniform vec3 rx,ry,rz,t,light;uniform vec2 center,size;uniform float focal,shadow;varying vec3 n,point;
      void main(){point=pos;n=normal;vec3 p=pos;if(shadow>.5)p=vec3(pos.x-pos.y*light.x/light.y,.002,pos.z-pos.y*light.z/light.y);
      vec3 c=rx*p.x+ry*p.y+rz*p.z+t;float d=max(c.z,.001);gl_Position=vec4(2.*(focal*c.x+center.x*d)/size.x-d,d-2.*(focal*c.y+center.y*d)/size.y,(d-.1)*.999,d);}`);
    const fs=shader(gl.FRAGMENT_SHADER,`precision highp float;uniform vec3 color,light,view;uniform float shadow,alpha,metal,perforated;uniform vec2 perforationDirection;varying vec3 n,point;
      void main(){
      if(perforated>.5){vec2 f=fract(vec2((length(perforationDirection)>.5?dot(point.xz,perforationDirection):atan(point.x,point.z)*3.025)/.008,point.y/.013856406));vec2 a=abs(f-vec2(.25,.25)),b=abs(f-vec2(.75,.75));a=min(a,1.-a)*vec2(.008,.013856406);b=min(b,1.-b)*vec2(.008,.013856406);if(min(dot(a,a),dot(b,b))<.00000625)discard;}
      if(shadow>.5){gl_FragColor=vec4(.10,.12,.14,alpha);return;}
      vec3 normal=normalize(n);if(!gl_FrontFacing)normal=-normal;vec3 L=normalize(light),V=normalize(view-point),H=normalize(L+V);
      float diffuse=max(dot(normal,L),0.);float spec=pow(max(dot(normal,H),0.),40.)*metal*.22;
      vec3 linear=pow(color,vec3(2.2));vec3 lit=linear*(.50+.65*diffuse)+vec3(spec);
      gl_FragColor=vec4(pow(clamp(lit,0.,1.),vec3(1./2.2)),1.);}`);
    program=gl.createProgram();if(!program)throw Error("Brak pamięci GPU.");gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||"Link error");
    gl.useProgram(program);const u=(key:string)=>gl.getUniformLocation(program!,key);
    gl.viewport(0,0,target.width,target.height);gl.clearColor(0,0,0,0);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);
    gl.uniform3fv(u("rx"),camera.rX);gl.uniform3fv(u("ry"),camera.rY);gl.uniform3fv(u("rz"),camera.rZ);gl.uniform3fv(u("t"),camera.translation);gl.uniform2fv(u("center"),camera.principalPoint);gl.uniform2f(u("size"),target.width,target.height);gl.uniform1f(u("focal"),camera.focalPx);gl.uniform3fv(u("light"),light);
    gl.uniform3fv(u("view"),[camera.rX,camera.rY,camera.rZ].map(r=>-r.reduce((sum,n,i)=>sum+n*camera.translation[i],0)));
    const items=meshes.map(mesh=>{
      const data:number[]=[];
      for(const face of mesh.f){if(face.length!==3)continue;const [a,b,c]=face.map(i=>mesh.v[i]);if(!a||!b||!c)throw Error("Niepoprawna ściana modelu.");
        const ab=b.map((n,i)=>n-a[i]),ac=c.map((n,i)=>n-a[i]);let normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];const l=Math.hypot(...normal);if(l<1e-10)continue;normal=normal.map(n=>n/l);
        for(const i of face)data.push(...point(mesh.v[i]),...(mesh.normals?.[i]||normal));
      }
      const buffer=gl.createBuffer();if(!buffer)throw Error("Brak pamięci GPU.");buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
      return {mesh,buffer,count:data.length/6};
    });
    const draw=(shadow:boolean)=>{gl.uniform1f(u("shadow"),shadow?1:0);for(const item of items){if(shadow&&item.mesh.group==="floor")continue;
      gl.bindBuffer(gl.ARRAY_BUFFER,item.buffer);for(const [name,offset]of [["pos",0],["normal",12]]as const){const a=gl.getAttribLocation(program!,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,24,offset);}
      gl.uniform1f(u("perforated"),(item.mesh.perforated||(options.perforatedPanels&&item.mesh.group==="panels"))?1:0);gl.uniform2fv(u("perforationDirection"),item.mesh.perforationDirection||[0,0]);
      gl.uniform1f(u("metal"),item.mesh.group==="floor"?0:1);gl.uniform3fv(u("color"),item.mesh.group==="floor"?[.25,.44,.36]:item.mesh.group==="panels"?[.69,.055,.20]:[.19,.21,.23]);gl.drawArrays(gl.TRIANGLES,0,item.count);
    }};
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const opacity=Math.max(0,Math.min(.6,options.shadowOpacity??.28));
    if(opacity>0){gl.clearStencil(0);gl.stencilMask(255);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.disable(gl.DEPTH_TEST);gl.enable(gl.STENCIL_TEST);
      // Union silhouette: overlapping panels must not accumulate opacity.
      gl.stencilFunc(gl.EQUAL,0,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);gl.uniform1f(u("alpha"),opacity);draw(true);gl.disable(gl.STENCIL_TEST);
      ctx.save();ctx.filter=`blur(${Math.max(1,canvas.width/800)}px)`;ctx.drawImage(target,0,0);ctx.restore();
    }
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);draw(false);ctx.drawImage(target,0,0);
    if(gl.getError()!==gl.NO_ERROR)throw Error("Błąd renderowania WebGL.");
    return {actualFootprintMeters:actual,modelHeightMeters:(max[1]-min[1])*scale,aspectErrorPercent:Math.abs(dx/dz-length/width)/(length/width)*100};
  }finally{for(const b of buffers)gl.deleteBuffer(b);for(const s of shaders)gl.deleteShader(s);if(program)gl.deleteProgram(program);}
}
