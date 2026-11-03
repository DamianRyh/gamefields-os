import { makeCalibrationHomography, validateCalibrationQuad, type CalibrationPoint, type CalibrationQuad } from "./makeover-calibration";

type Vec3 = [number, number, number];
const norm = (a: Vec3) => Math.hypot(...a);
const dot = (a: Vec3, b: Vec3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const scale = (a: Vec3, s: number): Vec3 => [a[0]*s,a[1]*s,a[2]*s];
const sub = (a: Vec3,b: Vec3): Vec3 => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross = (a: Vec3,b: Vec3): Vec3 => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit = (v: Vec3) => { const n=norm(v); if(n<1e-9) throw Error("Niestabilna orientacja kamery."); return scale(v,1/n); };

export type PerspectiveCameraEstimate = {
  focalPx: number;
  principalPoint: [number,number];
  rX: Vec3; rY: Vec3; rZ: Vec3; translation: Vec3;
  reprojectionRmsPx: number;
  reprojectionMaxPx: number;
  focalWasEstimated: boolean;
  quality: "approximate" | "review_required";
};
export type CameraEstimateInput = {
  quad: CalibrationQuad;
  imageWidth: number; imageHeight: number;
  courtLengthMeters: number; courtWidthMeters: number;
  focalPx?: number;
};

export function projectWorldPoint(camera: PerspectiveCameraEstimate, point: { x:number; y:number; z:number }): CalibrationPoint | null {
  const c: Vec3 = [
    camera.rX[0]*point.x + camera.rY[0]*point.y + camera.rZ[0]*point.z + camera.translation[0],
    camera.rX[1]*point.x + camera.rY[1]*point.y + camera.rZ[1]*point.z + camera.translation[1],
    camera.rX[2]*point.x + camera.rY[2]*point.y + camera.rZ[2]*point.z + camera.translation[2],
  ];
  if (!Number.isFinite(c[2]) || c[2] <= 0.01) return null;
  return {
    x: camera.focalPx * c[0] / c[2] + camera.principalPoint[0],
    y: camera.focalPx * c[1] / c[2] + camera.principalPoint[1],
  };
}

/**
 * Approximate calibrated camera from a planar four-corner homography.
 * Assumptions: pinhole camera, square pixels, zero skew, centered principal point,
 * flat measured court and undistorted image. This is NOT a photogrammetric survey.
 * Source coordinate convention is X length, Y up, Z width.
 */
export function estimatePerspectiveCamera(input: CameraEstimateInput): PerspectiveCameraEstimate {
  const {quad,imageWidth:w,imageHeight:h,courtLengthMeters:length,courtWidthMeters:width} = input;
  if (![w,h,length,width].every(Number.isFinite) || w<32 || h<32 || length<=0 || width<=0 ||
      !validateCalibrationQuad(quad,w,h)) throw Error("Niepoprawna geometria kalibracji.");
  const H = makeCalibrationHomography(length,width,quad);
  const cx=w/2, cy=h/2;
  const inverseK = (col:Vec3, f:number):Vec3 => [(col[0]-cx*col[2])/f,(col[1]-cy*col[2])/f,col[2]];
  const hX:Vec3=[H[0],H[3],H[6]], hZ:Vec3=[H[1],H[4],H[7]], hT:Vec3=[H[2],H[5],H[8]];
  const cost=(f:number)=>{
    const x=inverseK(hX,f),z=inverseK(hZ,f),nx=norm(x),nz=norm(z);
    if(nx<1e-9||nz<1e-9)return Infinity;
    return Math.pow(dot(x,z)/(nx*nz),2)+Math.pow((nx-nz)/Math.max(nx,nz),2);
  };
  let focal=input.focalPx;
  if(focal!==undefined && (!Number.isFinite(focal)||focal<=0))throw Error("Niepoprawna ogniskowa.");
  if(focal===undefined){
    // Coarse-to-fine, strictly bounded search. An unknown phone focal length is estimated, never certified.
    const base=Math.max(w,h);
    let best=Infinity;
    for(let i=0;i<=80;i++){const candidate=base*(.55+i*.045),score=cost(candidate);if(score<best){best=score;focal=candidate;}}
    for(let i=-20;i<=20;i++){const candidate=focal!*(1+i*.005),score=cost(candidate);if(score<best&&candidate>0){best=score;focal=candidate;}}
  }
  const f=focal!;
  const X=inverseK(hX,f),Z=inverseK(hZ,f),T=inverseK(hT,f);
  const factor=2/(norm(X)+norm(Z));
  const sign=T[2]>=0?1:-1;
  const rX=unit(scale(X,factor*sign));
  const zCandidate=sub(scale(Z,factor*sign),scale(rX,dot(scale(Z,factor*sign),rX)));
  const rZ=unit(zCandidate);
  // World X,Y-up,Z is right-handed, so camera's vertical axis = -cross(X,Z).
  const rY=unit(scale(cross(rX,rZ),-1));
  const translation=scale(T,factor*sign);
  const corners=[{x:0,y:0,z:0},{x:length,y:0,z:0},{x:length,y:0,z:width},{x:0,y:0,z:width}];
  const camera:PerspectiveCameraEstimate={
    focalPx:f,principalPoint:[cx,cy],rX,rY,rZ,translation,
    reprojectionRmsPx:Infinity,reprojectionMaxPx:Infinity,
    focalWasEstimated:input.focalPx===undefined,quality:"review_required"
  };
  const projections=corners.map(p=>projectWorldPoint(camera,p));
  if(projections.some(p=>!p))throw Error("Boisko znajduje się poza poprawną półprzestrzenią kamery.");
  const errors=projections.map((p,i)=>Math.hypot(p!.x-quad[i].x,p!.y-quad[i].y));
  camera.reprojectionMaxPx=Math.max(...errors);
  camera.reprojectionRmsPx=Math.sqrt(errors.reduce((sum,e)=>sum+e*e,0)/4);
  const diagonal=Math.hypot(w,h);
  camera.quality=camera.reprojectionMaxPx<=diagonal*.015?"approximate":"review_required";
  return camera;
}
