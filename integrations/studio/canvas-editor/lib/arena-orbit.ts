/** Fit the projected eight source-bound corners; no per-frame mesh traversal. */
export function orbitBounds(meshes:{v:number[][]}[]){
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(const m of meshes)for(const v of m.v)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],v[i]);hi[i]=Math.max(hi[i],v[i])}
 return [lo,hi];
}
export function orbitPlacement(bounds:number[][],yaw:number,pitch:number,aspect=1672/941,fill=.78){
 const [lo,hi]=bounds;let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(const x of [lo[0],hi[0]])for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]]){
  const px=x*Math.cos(yaw)-z*Math.sin(yaw),pz=x*Math.sin(yaw)+z*Math.cos(yaw),py=y*Math.cos(pitch)-pz*Math.sin(pitch);
  minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);
 }
 const scale=Math.min(1672*fill/Math.max(maxX-minX,.1),(1672/aspect)*(fill*5/6)/Math.max(maxY-minY,.1));
 return {cx:836-(minX+maxX)/2*scale,cy:470.5+(minY+maxY)/2*scale*941*aspect/1672,scale};
}
