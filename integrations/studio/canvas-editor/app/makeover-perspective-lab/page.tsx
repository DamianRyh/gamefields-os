"use client";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "@/components/renderer";
import { loadArenaGlb } from "@/components/glb-arena";
import { estimatePerspectiveCamera, projectWorldPoint, type PerspectiveCameraEstimate } from "@/lib/makeover-perspective-camera";
import { renderPerspectiveMesh } from "@/lib/makeover-perspective-renderer";
import type { CalibrationPoint, CalibrationQuad } from "@/lib/makeover-calibration";
import "./lab.css";
import { GamefieldsHeader } from "@/components/gamefields-header";

const models = {
  w1: { name:"Panna Ring — W-1", url:"/arenas/boisko-w1.glb", length:5.09, width:5.8314 },
  o1: { name:"Panna Play — O-1", url:"/arenas/circle-cage-1.json", length:6.722908, width:6.12 },
  p1: { name:"Panna Court — P-1", url:"/arenas/p1.json", length:5.73267, width:8.09267 }
};
type ModelKey=keyof typeof models;
const names=["lewy górny","prawy górny","prawy dolny","lewy dolny"];
export default function MakeoverPerspectiveLab(){
  const canvas=useRef<HTMLCanvasElement>(null);
  const renderKey=useRef(0);
  const renderCanvas=useRef<HTMLCanvasElement|null>(null);
  const image=useRef<HTMLCanvasElement|null>(null);
  const upload=useRef(0);
  const [ready,setReady]=useState(false);
  const [selected,setSelected]=useState<ModelKey>("p1");
  const [points,setPoints]=useState<CalibrationPoint[]>([]);
  const [opacity,setOpacity]=useState(100);
  const [lightDirection,setLightDirection]=useState(45);
  const [shadowOpacity,setShadowOpacity]=useState(28);
  const [focal,setFocal]=useState("");
  const [status,setStatus]=useState("Wczytaj zdjęcie, następnie zaznacz narożniki po obwodzie.");
  const [metrics,setMetrics]=useState("");
  const [camera,setCamera]=useState<PerspectiveCameraEstimate|null>(null);
  const [revision,setRevision]=useState(0);
  const [renderRevision,setRenderRevision]=useState(0);
  const [quality,setQuality]=useState(false);
  const [showBefore,setShowBefore]=useState(false);
  const [meshes,setMeshes]=useState<Mesh[]|null>(null);
  const current=models[selected];
  useEffect(()=>()=>{upload.current++;},[]);
  useEffect(()=>{
    const controller=new AbortController();setMeshes(null);setCamera(null);setQuality(false);
    const load=current.url.endsWith(".glb")
      ?loadArenaGlb(current.url,controller.signal)
      :fetch(current.url,{signal:controller.signal}).then(async response=>{
        if(!response.ok)throw Error("Nie można pobrać konstrukcji.");
        return await response.json() as Mesh[];
      });
    void load.then(data=>{if(!controller.signal.aborted){setMeshes(data);setStatus("Model 3D wczytany. Dodaj zdjęcie i zaznacz narożniki.");}})
      .catch(()=>{if(!controller.signal.aborted)setStatus("Nie udało się pobrać modelu 3D. Spróbuj wybrać inny.");});
    return ()=>controller.abort();
  },[selected]);
  useEffect(()=>{
    const output=canvas.current,source=image.current;
    if(!output||!source)return;
    const ctx=output.getContext("2d");if(!ctx)return;
    setQuality(false);setCamera(null);setMetrics("");
    if(points.length!==4||!meshes)return;
    try{
      const parameters={quad:points as CalibrationQuad,imageWidth:output.width,imageHeight:output.height,
        courtLengthMeters:current.length,courtWidthMeters:current.width,...(focal.trim()?{focalPx:Number(focal)}:{})};
      const estimate=estimatePerspectiveCamera(parameters);
      let overlay=renderCanvas.current;
      if(!overlay){overlay=document.createElement("canvas");renderCanvas.current=overlay;}
      if(overlay.width!==output.width)overlay.width=output.width;
      if(overlay.height!==output.height)overlay.height=output.height;
      const footprint=renderPerspectiveMesh(overlay,meshes,estimate,current.length,current.width,{directionDegrees:lightDirection,shadowOpacity:shadowOpacity/100,perforatedPanels:selected!=="w1"});
      renderKey.current++;setRenderRevision(renderKey.current);
      const contacts=[[0,0],[current.length,0],[current.length,current.width],[0,current.width]].map(([x,z])=>projectWorldPoint(estimate,{x,y:0,z}));
      const visible=contacts.every(Boolean);
      const aspectOk=footprint.aspectErrorPercent<=3;
      const reprojectionOk=estimate.quality==="approximate";
      const valid=visible&&aspectOk&&reprojectionOk;
      setCamera(estimate);setQuality(visible);
      setMetrics(`Błąd narożników: ${estimate.reprojectionRmsPx.toFixed(1)} px RMS / ${estimate.reprojectionMaxPx.toFixed(1)} px max. Podstawa modelu: ${footprint.actualFootprintMeters.map(n=>n.toFixed(2)).join(" × ")} m. Wysokość: ${footprint.modelHeightMeters.toFixed(2)} m. Błąd proporcji: ${footprint.aspectErrorPercent.toFixed(1)}%. Kontakt 4 narożników z podłożem: ${visible?"tak":"nie"}.`);
      setStatus(valid?"Podgląd perspektywiczny gotowy do przeglądu wizualnego.":"Wizualizacja jest przybliżona — sprawdź ręcznie narożniki, proporcje i ogniskową przed użyciem.");
    }catch(e){setStatus((e as Error).message);}
  },[points,ready,selected,focal,revision,meshes,lightDirection,shadowOpacity]);
  // Compositing is cheap; opacity and before/after never re-upload mesh geometry.
  useEffect(()=>{
    const output=canvas.current,source=image.current;if(!output||!source)return;
    const ctx=output.getContext("2d");if(!ctx)return;
    ctx.clearRect(0,0,output.width,output.height);ctx.drawImage(source,0,0,output.width,output.height);
    if(camera&&!showBefore&&renderCanvas.current){ctx.save();ctx.globalAlpha=opacity/100;ctx.drawImage(renderCanvas.current,0,0);ctx.restore();}
    for(let i=0;i<points.length;i++){
      const p=points[i],radius=Math.max(7,output.width/70);ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);
      ctx.fillStyle="#6333ff";ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font=`bold ${radius*1.3}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(i+1),p.x,p.y);
    }
  },[points,ready,revision,renderRevision,camera,opacity,showBefore]);
  function fileChange(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>8_000_000){setStatus("Dozwolone JPG/PNG/WebP, maks. 8 MB.");return;}
    const seq=++upload.current,url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{URL.revokeObjectURL(url);if(seq!==upload.current)return;
      const scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
      const buffer=document.createElement("canvas");buffer.width=Math.round(img.naturalWidth*scale);buffer.height=Math.round(img.naturalHeight*scale);
      buffer.getContext("2d")?.drawImage(img,0,0,buffer.width,buffer.height);
      if(seq!==upload.current)return;
        image.current=buffer;if(canvas.current){canvas.current.width=buffer.width;canvas.current.height=buffer.height;}
        setPoints([]);setShowBefore(false);setReady(true);setRevision(n=>n+1);setStatus("Zdjęcie gotowe. Zaznacz kolejno: lewy górny → prawy górny → prawy dolny → lewy dolny.");

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
    const target=canvas.current;if(!target||!quality||!camera||!image.current||!renderCanvas.current)return;
    const clean=document.createElement("canvas");clean.width=target.width;clean.height=target.height;
    const ctx=clean.getContext("2d");if(!ctx){setStatus("Nie udało się przygotować eksportu.");return;}
    ctx.drawImage(image.current,0,0,clean.width,clean.height);
    ctx.save();ctx.globalAlpha=opacity/100;ctx.drawImage(renderCanvas.current,0,0);ctx.restore();
    clean.toBlob(blob=>{if(!blob){setStatus("Nie udało się zapisać PNG.");return;}
      const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="gamefields-perspective-DRAFT.png";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    },"image/png");
  }
  const fieldStyle:React.CSSProperties={display:"block",width:"100%",padding:10,border:"1px solid #cbd0ce",borderRadius:8,boxSizing:"border-box",marginTop:6};
  return <main className="perspective-lab" style={{fontFamily:"Arial,sans-serif",background:"#fff",minHeight:"100vh",padding:"clamp(16px,3vw,36px)",color:"#1e2322"}}>
    <GamefieldsHeader section="makeover"/>
    <div style={{maxWidth:1200,margin:"0 auto"}}>
      <small style={{letterSpacing:".18em",color:"#dd6745",fontWeight:800}}>GAMEFIELDS / PERSPECTIVE LAB / DRAFT</small>
      <h1 style={{fontSize:"clamp(28px,4vw,52px)",margin:"12px 0"}}>Konstrukcja 3D w perspektywie zdjęcia</h1>
      <details className="lab-details"><summary>Jak działa wizualizacja?</summary><p>Tryb eksperymentalny w aktualnym Studio. Siatki pochodzą z biblioteki GAMEFIELDS, a podawane wymiary oznaczają granice geometrii 3D, nie wymiary handlowe ani rysunki wykonawcze. Render ma uproszczone materiały; brak przesłonięć i kalibracji geodezyjnej.</p></details>
      <div className="lab-layout" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))",gap:20}}>
        <section className="lab-controls" style={{background:"#fff",borderRadius:14,padding:20}}>
          <label>1. Zdjęcie miejsca<input type="file" accept="image/jpeg,image/png,image/webp" onChange={fileChange} style={fieldStyle}/></label>
          <label style={{display:"block",marginTop:18}}>2. Oryginalny model
            <select value={selected} onChange={e=>setSelected(e.target.value as ModelKey)} style={fieldStyle}>
              {Object.entries(models).map(([key,m])=><option key={key} value={key}>{m.name}</option>)}
            </select>
          </label>
          <p style={{fontSize:12,color:"#666"}}>{meshes?"Model gotowy do renderowania.":"Ładowanie modelu 3D…"} Konstrukcja pobierana jest dopiero po wyborze.</p>
          <p style={{fontSize:12,color:"#666"}}>Granice siatki: {current.length.toFixed(2)} × {current.width.toFixed(2)} m (osie X/Z).</p>
          <details className="lab-details"><summary>Zaawansowane dopasowanie</summary><label style={{display:"block",marginTop:18}}>Ogniskowa w pikselach (opcjonalnie)
            <input type="number" min={1} placeholder="Automatyczne przybliżenie" value={focal} onChange={e=>setFocal(e.target.value)} style={fieldStyle}/>
          </label>
          <label style={{display:"block",marginTop:18}}>Kierunek światła: {lightDirection}°
            <input aria-label="Kierunek światła" type="range" min={0} max={360} step={15} value={lightDirection} onChange={e=>setLightDirection(+e.target.value)} style={{width:"100%"}}/>
          </label>
          <label style={{display:"block",marginTop:18}}>Siła cienia: {shadowOpacity}%
            <input aria-label="Siła cienia" type="range" min={0} max={60} step={5} value={shadowOpacity} onChange={e=>setShadowOpacity(+e.target.value)} style={{width:"100%"}}/>
          </label><p style={{fontSize:13}}>Dopasuj światło do zdjęcia. Cień zakłada płaskie podłoże.</p>
          </details><label style={{display:"block",marginTop:18}}>Krycie modelu: {opacity}%
            <input aria-label="Krycie modelu" type="range" min={10} max={100} value={opacity} onChange={e=>setOpacity(+e.target.value)} style={{width:"100%"}}/>
          </label>
          <p><b>Narożniki:</b> {points.length}/4. {points.length<4?"Wskaż "+names[points.length]+".":"Komplet."}</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setPoints(p=>p.slice(0,-1))} disabled={!points.length}>Cofnij punkt</button>
            <button onClick={()=>setPoints([])} disabled={!points.length}>Zacznij od nowa</button>
          </div>
          <p role="status" style={{lineHeight:1.6}}>{status}</p>
          <button type="button" disabled={!camera} onClick={()=>setShowBefore(v=>!v)} style={{...fieldStyle,background:"#f1eee8",cursor:"pointer"}}>
            {showBefore?"Pokaż projekt 3D":"Pokaż zdjęcie przed zmianą"}
          </button>
          <details className="lab-details"><summary>Dokładność dopasowania</summary><p style={{fontSize:13,color:"#555"}}>{metrics||"Dodaj cztery narożniki, aby sprawdzić dopasowanie."}</p>
          {camera&&<p style={{fontSize:13}}>Ogniskowa: {camera.focalPx.toFixed(0)} px ({camera.focalWasEstimated?"oszacowana":"podana"}). Ocena: {camera.quality}.</p>}
          </details><button onClick={exportPng} disabled={!quality} style={{...fieldStyle,background:quality?"#202524":"#abb0aa",color:"#fff",cursor:quality?"pointer":"not-allowed"}}>
            Pobierz PNG — wizualizacja koncepcyjna
          </button>
          <small>Eksport bez znaczników kalibracyjnych. Wynik pozostaje wizualizacją koncepcyjną; zawsze sprawdź geometrię i miejsce inwestycji.</small>
        </section>
        <section className="lab-preview" style={{background:"#fff",borderRadius:14,padding:20}}>
          <h2>Twoja przestrzeń</h2><p className="lab-point-guide">{!ready?"Dodaj zdjęcie miejsca w panelu poniżej.":points.length<4?`Dotknij narożnika: ${names[points.length]} (${points.length+1}/4)`:"Porównaj projekt ze zdjęciem lub popraw punkty."}</p>
          <canvas ref={canvas} width={960} height={640} onClick={mark} aria-label="Zdjęcie miejsca — klikaj cztery narożniki w ustalonej kolejności" style={{width:"100%",height:"auto",cursor:ready&&points.length<4?"crosshair":"default",borderRadius:8,background:"#f5f5f5"}}/>
          <p style={{fontSize:12,color:"#666"}}>Kontrola punktów styku dotyczy rzutu płaskiej podstawy, nie dopasowania do nierówności terenu. Wszystkie wymiary modelu należy porównać z zatwierdzonymi rysunkami produkcyjnymi.</p>
        </section>
      </div>
    </div>
  </main>;
}
