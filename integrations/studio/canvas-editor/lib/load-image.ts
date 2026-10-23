/** A failed or stalled image must not leave a render generation pending forever. */
export function loadImage(source:string,timeoutMs=20000):Promise<HTMLImageElement>{
 return new Promise((resolve,reject)=>{
  const image=new Image();let settled=false;
  const finish=(error?:Error)=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=null;image.onerror=null;if(error){image.removeAttribute?.('src');reject(error)}else resolve(image)};
  const timer=setTimeout(()=>finish(Error('Przekroczono czas wczytywania grafiki.')),timeoutMs);
  try{image.onload=()=>finish();image.onerror=()=>finish(Error('Nie można wczytać grafiki'));image.src=source}catch(error){finish(error instanceof Error?error:Error('Nie można wczytać grafiki'))}
 });
}
