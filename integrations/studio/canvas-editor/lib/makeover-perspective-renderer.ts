import type { Mesh } from "@/components/renderer";
import type { PerspectiveCameraEstimate } from "@/lib/makeover-perspective-camera";

/** Independent perspective renderer for the photo-calibration lab; no Studio Renderer changes. */
export function renderPerspectiveMesh(canvas: HTMLCanvasElement, meshes: Mesh[], camera: PerspectiveCameraEstimate, length: number, width: number) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, preserveDrawingBuffer: true });
  if (!gl) throw Error("WebGL jest niedostępny.");
  const points = meshes.flatMap(m => m.v);
  if (!points.length || !Number.isFinite(length) || !Number.isFinite(width) || length <= 0 || width <= 0) throw Error("Niepoprawny model lub wymiary.");
  const axis = (i: number) => points.map(v => v[i]);
  const min = [0,1,2].map(i => Math.min(...axis(i)));
  const max = [0,1,2].map(i => Math.max(...axis(i)));
  const dx = max[0] - min[0], dz = max[2] - min[2];
  if (dx < 1e-6 || dz < 1e-6) throw Error("Brak podstawy modelu.");
  const scale = Math.min(length / dx, width / dz);
  const actual: [number,number] = [dx * scale, dz * scale];
  const point = (v: number[]) => [
    (v[0]-min[0])*scale+(length-actual[0])/2,
    (v[1]-min[1])*scale,
    (v[2]-min[2])*scale+(width-actual[1])/2
  ];
  const shader = (kind: number, code: string) => {
    const s = gl.createShader(kind)!; gl.shaderSource(s,code); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||"Shader error");
    return s;
  };
  const vs = shader(gl.VERTEX_SHADER,`attribute vec3 pos; uniform vec3 rx,ry,rz,t;uniform vec2 center,size;uniform float focal;
    void main(){vec3 c=rx*pos.x+ry*pos.y+rz*pos.z+t;float d=max(c.z,0.001);
    gl_Position=vec4(2.0*(focal*c.x+center.x*d)/size.x-d,d-2.0*(focal*c.y+center.y*d)/size.y,(d-0.1)*0.999,d);}`);
  const fs = shader(gl.FRAGMENT_SHADER,`precision mediump float;uniform vec3 color;void main(){gl_FragColor=vec4(color,1.0);}`);
  const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||"Link error");
  gl.deleteShader(vs);gl.deleteShader(fs);
  const u=(key:string)=>gl.getUniformLocation(program,key);
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.useProgram(program);
  gl.uniform3fv(u("rx"),camera.rX);gl.uniform3fv(u("ry"),camera.rY);gl.uniform3fv(u("rz"),camera.rZ);
  gl.uniform3fv(u("t"),camera.translation);gl.uniform2fv(u("center"),camera.principalPoint);
  gl.uniform2f(u("size"),canvas.width,canvas.height);gl.uniform1f(u("focal"),camera.focalPx);
  const attr=gl.getAttribLocation(program,"pos");
  for(const mesh of meshes){
    const vertices:number[]=[];
    for(const face of mesh.f)if(face.length===3)for(const i of face)vertices.push(...point(mesh.v[i]));
    const buffer=gl.createBuffer();if(!buffer)throw Error("GPU memory error");
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,0,0);
    const color=mesh.group==="floor"?[0.25,0.44,0.36]:mesh.group==="panels"?[0.82,0.35,0.20]:[0.22,0.25,0.28];
    gl.uniform3fv(u("color"),color);gl.drawArrays(gl.TRIANGLES,0,vertices.length/3);gl.deleteBuffer(buffer);
  }
  gl.deleteProgram(program);
  return { actualFootprintMeters: actual, modelHeightMeters:(max[1]-min[1])*scale,
    aspectErrorPercent:Math.abs(dx/dz-length/width)/(length/width)*100 };
}
