"use client";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "@/components/renderer";
import w1 from "@/components/assets-blender/w1.json";
import o1 from "@/components/assets-blender/o1.json";
import p1 from "@/components/assets-blender/p1.json";
import { estimatePerspectiveCamera, projectWorldPoint, type PerspectiveCameraEstimate } from "@/lib/makeover-perspective-camera";
import { renderPerspectiveMesh } from "@/lib/makeover-perspective-renderer";
import type { CalibrationPoint, CalibrationQuad } from "@/lib/makeover-calibration";

const models = {
  w1: { name:"W-1 — Ø 5,09 m (model warsztatowy)", mesh:w1 as Mesh[], length:5.09, width:5.09 },
  o1: { name:"O-1 — Ø 6,00 m (model warsztatowy)", mesh:o1 as Mesh[], length:6, width:6 },
  p1: { name:"P-1 — 7,14 × 5,57 m (model warsztatowy)", mesh:p1 as Mesh[], length:7.14, width:5.57 }
};
type ModelKey=keyof typeof models;
const names=["lewy górny","prawy górny","prawy dolny","lewy dolny"];
export default function MakeoverPerspectiveLab(){
  const canvas=useRef<HTMLCanvasElement>(null);
  const renderCanvas=useRef<HTMLCanvasElement|null>(null);
  const image=useRef<HTMLImageElement|null>(null);
  const upload=useRef(0);
  const [ready,setReady]=useState(false);
  const [selected,setSelected]=useState<ModelKey>("p1");
  const [points,setPoints]=useState<CalibrationPoint[]>([]);
  const [opacity,setOpacity]=useState(100);
  const [focal,setFocal]=useState("");
  const [status,setStatus]=useState("Wczytaj zdjęcie, następnie zaznacz narożniki po obwodzie.");
  const [metrics,setMetrics]=useState("");
  const [camera,setCamera]=useState<PerspectiveCameraEstimate|null>(null);
  const [revision,setRevision]=useState(0);
  const [quality,setQuality]=useState(false);
  const current=models[selected];
  useEffect(()=>()=>{upload.current++;},[]);
  useEffect(()=>{
    const output=canvas.current,source=image.current;
    if(!output||!source)return;
    const ctx=output.getContext("2d");if(!ctx)return;
    ctx.clearRect(0,0,output.width,output.height);ctx.drawImage(source,0,0,output.width,output.height);
    for(let i=0;i<points.length;i++){
      const p=points[i];ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.fillStyle="#ff6b46";ctx.fill();
      ctx.fillStyle="#101010";ctx.font="bold 15px Arial";ctx.fillText(String(i+1),p.x+10,p.y-9);
    }
    setQuality(false);setCamera(null);setMetrics("");
    if(points.length!==4)return;
    try{
      const parameters={quad:points as CalibrationQuad,imageWidth:output.width,imageHeight:output.height,
        courtLengthMeters:current.length,courtWidthMeters:current.width,...(focal.trim()?{focalPx:Number(focal)}:{})};
      const estimate=estimatePerspectiveCamera(parameters);
      let overlay=renderCanvas.current;
      if(!overlay){overlay=document.createElement("canvas");renderCanvas.current=overlay;}
      overlay.width=output.width;overlay.height=output.height;
      const footprint=renderPerspectiveMesh(overlay,current.mesh,estimate,current.length,current.width);
      ctx.save();ctx.globalAlpha=opacity/100;ctx.drawImage(overlay,0,0);ctx.restore();
      const contacts=[[0,0],[current.length,0],[current.length,current.width],[0,current.width]].map(([x,z])=>projectWorldPoint(estimate,{x,y:0,z}));
      const visible=contacts.every(Boolean);
      const aspectOk=footprint.aspectErrorPercent<=3;
      const reprojectionOk=estimate.quality==="approximate";
      const valid=visible&&aspectOk&&reprojectionOk;
      setCamera(estimate);setQuality(valid);
      setMetrics(`Błąd narożników: ${estimate.reprojectionRmsPx.toFixed(1)} px RMS / ${estimate.reprojectionMaxPx.toFixed(1)} px max. Podstawa modelu: ${footprint.actualFootprintMeters.map(n=>n.toFixed(2)).join(" × ")} m. Wysokość: ${footprint.modelHeightMeters.toFixed(2)} m. Błąd proporcji: ${footprint.aspectErrorPercent.toFixed(1)}%. Kontakt 4 narożników z podłożem: ${visible?"tak":"nie"}.`);
      setStatus(valid?"Podgląd perspektywiczny gotowy do przeglądu wizualnego.":"Dopasowanie wymaga korekty: sprawdź kolejność punktów, proporcje i ogniskową.");
    }catch(e){setStatus((e as Error).message);}
  },[points,ready,selected,opacity,focal,revision]);
  function fileChange(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>8_000_000){setStatus("Dozwolone JPG/PNG/WebP, maks. 8 MB.");return;}
    const seq=++upload.current,url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{URL.revokeObjectURL(url);if(seq!==upload.current)return;
      const scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
      const buffer=document.createElement("canvas");buffer.width=Math.round(img.naturalWidth*scale);buffer.height=Math.round(img.naturalHeight*scale);
      buffer.getContext("2d")?.drawImage(img,0,0,buffer.width,buffer.height);
      const normalized=new Image();normalized.onload=()=>{if(seq!==upload.current)return;
        image.current=normalized;if(canvas.current){canvas.current.width=buffer.width;canvas.current.height=buffer.height;}
        setPoints([]);setReady(true);setRevision(n=>n+1);setStatus("Zdjęcie gotowe. Zaznacz kolejno: lewy górny → prawy górny → prawy dolny → lewy dolny.");
      };normalized.src=buffer.toDataURL("image/png");
    };
    img.onerror=()=>{URL.revokeObjectURL(url);if(seq===upload.current)setStatus("Nie udało się wczytać zdjęcia.");};
    img.src=url;
  }
  function mark(event:React.MouseEvent<HTMLCanvasElement>){
    if(!image.current||points.length===4)return;
    const rect=event.currentTarget.getBoundingClientRect();
    setPoints(previous=>[...previous,{x:(event.clientX-rect.left)*event.currentTarget.width/rect.width,y:(event.clientY-rect.top)*event.currentTarget.height/rect.height}]);
  }
  function exportPng(){
    const target=canvas.current;if(!target||!quality||!camera)return;
    target.toBlob(blob=>{if(!blob){setStatus("Nie udało się zapisać PNG.");return;}
      const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="gamefields-perspective-DRAFT.png";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    },"image/png");
  }
  const fieldStyle:React.CSSProperties={display:"block",width:"100%",padding:10,border:"1px solid #cbd0ce",borderRadius:8,boxSizing:"border-box",marginTop:6};
  return <main style={{fontFamily:"Arial,sans-serif",background:"#f3f2ed",minHeight:"100vh",padding:"clamp(16px,3vw,36px)",color:"#1e2322"}}>
    <div style={{maxWidth:1200,margin:"0 auto"}}>
      <small style={{letterSpacing:".18em",color:"#dd6745",fontWeight:800}}>GAMEFIELDS / PERSPECTIVE LAB / DRAFT</small>
      <h1 style={{fontSize:"clamp(28px,4vw,52px)",margin:"12px 0"}}>Konstrukcja 3D w perspektywie zdjęcia</h1>
      <p>Osobny tryb eksperymentalny. Siatki pochodzą z biblioteki GAMEFIELDS. Render ma uproszczone materiały; brak przesłonięć i kalibracji geodezyjnej. Nie jest to dokumentacja techniczna.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))",gap:20}}>
        <section style={{background:"#fff",borderRadius:14,padding:20}}>
          <label>1. Zdjęcie miejsca<input type="file" accept="image/jpeg,image/png,image/webp" onChange={fileChange} style={fieldStyle}/></label>
          <label style={{display:"block",marginTop:18}}>2. Oryginalny model
            <select value={selected} onChange={e=>{setSelected(e.target.value as ModelKey);setPoints([]);}} style={fieldStyle}>
              {Object.entries(models).map(([key,m])=><option key={key} value={key}>{m.name}</option>)}
            </select>
          </label>
          <label style={{display:"block",marginTop:18}}>3. Ogniskowa w pikselach (opcjonalnie)
            <input type="number" min={1} placeholder="Automatyczne przybliżenie" value={focal} onChange={e=>setFocal(e.target.value)} style={fieldStyle}/>
          </label>
          <label style={{display:"block",marginTop:18}}>4. Krycie modelu: {opacity}%
            <input type="range" min={10} max={100} value={opacity} onChange={e=>setOpacity(+e.target.value)} style={{width:"100%"}}/>
          </label>
          <p><b>5. Narożniki:</b> {points.length}/4. {points.length<4?"Wskaż "+names[points.length]+".":"Komplet."}</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setPoints(p=>p.slice(0,-1))} disabled={!points.length}>Cofnij punkt</button>
            <button onClick={()=>setPoints([])} disabled={!points.length}>Zacznij od nowa</button>
          </div>
          <p role="status" style={{lineHeight:1.6}}>{status}</p>
          <p style={{fontSize:13,color:"#555"}}>{metrics}</p>
          {camera&&<p style={{fontSize:13}}>Ogniskowa: {camera.focalPx.toFixed(0)} px ({camera.focalWasEstimated?"oszacowana":"podana"}). Ocena: {camera.quality}.</p>}
          <button onClick={exportPng} disabled={!quality} style={{...fieldStyle,background:quality?"#202524":"#abb0aa",color:"#fff",cursor:quality?"pointer":"not-allowed"}}>
            Pobierz PNG — wizualizacja koncepcyjna
          </button>
          {!quality&&<small>Eksport aktywuje się po podstawowej kontroli matematycznej. Nadal wymagana jest ocena wizualna modelu.</small>}
        </section>
        <section style={{background:"#fff",borderRadius:14,padding:20}}>
          <h2>Podgląd</h2>
          <canvas ref={canvas} width={960} height={640} onClick={mark} aria-label="Zdjęcie miejsca — klikaj cztery narożniki w ustalonej kolejności" style={{width:"100%",height:"auto",cursor:ready&&points.length<4?"crosshair":"default",borderRadius:8,background:"#dde0dc"}}/>
          <p style={{fontSize:12,color:"#666"}}>Kontrola punktów styku dotyczy rzutu płaskiej podstawy, nie dopasowania do nierówności terenu. Wszystkie wymiary modelu należy porównać z zatwierdzonymi rysunkami produkcyjnymi.</p>
        </section>
      </div>
    </div>
  </main>;
}
