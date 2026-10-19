import * as THREE from "three";

/** Presentation only: no edits to the downloadable construction geometry. */
export function finishProduct(model: THREE.Object3D) {
  model.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const panel = material.name.startsWith("Panele");
      material.color.set(panel ? "#495f5a" : "#242c2c");
      material.metalness = panel ? 0.12 : 0.35;
      material.roughness = panel ? 0.78 : 0.52;
      // Preserve the source perforation/alpha map and all source UVs.
      material.envMapIntensity = 0.55;
      material.alphaToCoverage = material.alphaTest > 0;
    }
    node.castShadow = true;
    node.receiveShadow = true;
  });
}

type Point = {x:number; y:number};
function hull(points: Point[]) {
  const unique = [...new Map(points.map(p => [p.x.toFixed(4)+","+p.y.toFixed(4), p])).values()]
    .sort((a,b)=>a.x-b.x || a.y-b.y);
  const cross=(o:Point,a:Point,b:Point)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const half=(items:Point[])=>{const out:Point[]=[];for(const p of items){while(out.length>1 && cross(out[out.length-2],out[out.length-1],p)<=0)out.pop();out.push(p)}return out.slice(0,-1)};
  return [...half(unique),...half([...unique].reverse())];
}

export function createPlayingSurface(model: THREE.Object3D) {
  const points:Point[]=[], vertex=new THREE.Vector3();
  model.updateMatrixWorld(true);
  model.traverse(node=>{
    if(!(node instanceof THREE.Mesh))return;
    const materials=Array.isArray(node.material)?node.material:[node.material];
    if(!materials.some(m=>m.name.startsWith("Panele")))return;
    const position=node.geometry.getAttribute("position");
    for(let i=0;i<position.count;i++){
      vertex.fromBufferAttribute(position,i).applyMatrix4(node.matrixWorld);
      points.push({x:vertex.x,y:-vertex.z});
    }
  });
  const boundary=hull(points);
  if(boundary.length<3)return;
  const minX=Math.min(...boundary.map(p=>p.x)),maxX=Math.max(...boundary.map(p=>p.x));
  const minY=Math.min(...boundary.map(p=>p.y)),maxY=Math.max(...boundary.map(p=>p.y));
  const width=maxX-minX,height=maxY-minY,cx=(minX+maxX)/2,cy=(minY+maxY)/2;
  // Shrink by 2 cm inside the measured panel footprint, never use the goal cage bounds.
  const outline=boundary.map(p=>new THREE.Vector2(cx+(p.x-cx)*(1-0.04/width),cy+(p.y-cy)*(1-0.04/height)));
  const geometry=new THREE.ShapeGeometry(new THREE.Shape(outline));
  const positions=geometry.getAttribute("position"),uv=geometry.getAttribute("uv");
  for(let i=0;i<uv.count;i++)uv.setXY(i,(positions.getX(i)-minX)/width,(positions.getY(i)-minY)/height);
  const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=Math.max(512,Math.round(1024*height/width));
  const ctx=canvas.getContext("2d")!;
  ctx.fillStyle="#33684f";ctx.fillRect(0,0,canvas.width,canvas.height);
  // Deterministic fine grain and subtle mowing bands, with metric white markings.
  let seed=19;
  for(let y=0;y<canvas.height;y+=2)for(let x=0;x<canvas.width;x+=2){seed=(seed*1664525+1013904223)>>>0;ctx.fillStyle=`rgba(${seed%2?"184,207,137":"8,38,27"},${0.025+(seed%100)/1800})`;ctx.fillRect(x,y,2,2)}
  for(let i=0;i<8;i++){ctx.fillStyle=i%2?"rgba(255,255,255,.025)":"rgba(0,0,0,.025)";if(height>width)ctx.fillRect(0,i*canvas.height/8,canvas.width,canvas.height/8);else ctx.fillRect(i*canvas.width/8,0,canvas.width/8,canvas.height)}
  ctx.save();ctx.scale(canvas.width/width,canvas.height/height);ctx.translate(-minX,-minY);
  ctx.strokeStyle="#e7ebd8";ctx.lineWidth=0.055;ctx.lineJoin="round";
  ctx.beginPath();outline.forEach((p,i)=>{const x=cx+(p.x-cx)*(1-0.40/width),y=cy+(p.y-cy)*(1-0.40/height);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)});ctx.closePath();ctx.stroke();
  ctx.beginPath();if(height>width){ctx.moveTo(minX+0.25,cy);ctx.lineTo(maxX-0.25,cy)}else{ctx.moveTo(cx,minY+0.25);ctx.lineTo(cx,maxY-0.25)}ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,Math.min(width,height)*0.15,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle="#e7ebd8";ctx.beginPath();ctx.arc(cx,cy,0.07,0,Math.PI*2);ctx.fill();ctx.restore();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  const material=new THREE.MeshStandardMaterial({map:texture,roughness:0.98,metalness:0});
  const surface=new THREE.Mesh(geometry,material);surface.name="presentation-playing-surface";
  surface.rotation.x=-Math.PI/2;surface.position.y=0.008;surface.receiveShadow=true;
  return surface;
}
