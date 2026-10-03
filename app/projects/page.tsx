"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectRow={id:string;projectKey:string;courtId:string|null;name:string;sport:string;source:string;visibility:string;status:string;publishedAt:string|null;createdAt:string;updatedAt:string;supportCount:number};

async function mutate(body:Record<string,unknown>){
 const r=await fetch("/api/projects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||"REQUEST_FAILED");return d;
}

export default function ProjectsPage(){
 const [projects,setProjects]=useState<ProjectRow[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 async function load(){setLoading(true);setError("");try{const r=await fetch("/api/projects",{cache:"no-store"});const d=await r.json();if(r.status===401){window.location.replace(`/play/auth?returnTo=${encodeURIComponent("/projects")}`);return;}if(!r.ok||!d.ok)throw new Error(d.error||"LOAD_FAILED");setProjects(d.projects||[]);}catch(e){setError(e instanceof Error?e.message:"LOAD_FAILED");}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 async function run(action:string,id:string){try{await mutate({action,id});await load();}catch(e){setError(e instanceof Error?e.message:"REQUEST_FAILED");}}
 return <main style={s.page}>
  <header style={s.header}><div><div style={s.brand}>GAMEFIELDS <span>OS</span></div><small style={s.muted}>PROJECTS / BUILDER</small></div><div style={s.headerActions}><Link href="/" style={s.secondary}>OPEN STUDIO</Link><Link href="/play" style={s.primary}>GAMEFIELDS PLAY</Link></div></header>
  <section style={s.hero}><div><span style={s.kicker}>YOUR PROJECTS</span><h1 style={s.h1}>Projekt nie znika po zamknięciu karty.</h1><p style={s.lead}>Projekty zapisane w Studio są przypisane do Twojego konta. Redesign konkretnego obiektu możesz opublikować społeczności do poparcia.</p></div><div style={s.stat}><strong>{projects.length}</strong><span>PROJECTS</span></div></section>
  {error&&<div style={s.error}>{error}</div>}
  {loading?<div style={s.empty}>Ładowanie projektów…</div>:projects.length?<section style={s.grid}>{projects.map(p=><article key={p.id} style={s.card}>
   <div style={s.cardTop}><div><span style={s.kicker}>{p.sport}</span><h2 style={s.title}>{p.name}</h2></div><span style={p.visibility==="public"?s.publicBadge:s.draftBadge}>{p.visibility==="public"?"PUBLIC":"DRAFT"}</span></div>
   <div style={s.meta}><span>{p.projectKey}</span><span>{new Date(p.updatedAt).toLocaleString("pl-PL")}</span>{p.courtId&&<span>COURT REDESIGN</span>}</div>
   <div style={s.support}><strong>{p.supportCount}</strong><span>SUPPORTERS</span></div>
   <div style={s.actions}><Link href={`/?projectId=${encodeURIComponent(p.id)}`} style={s.open}>OPEN / EDIT</Link>{p.courtId&&(p.visibility==="public"?<button style={s.ghost} onClick={()=>void run("unpublish",p.id)}>UNPUBLISH</button>:<button style={s.ghost} onClick={()=>void run("publish",p.id)}>PUBLISH TO COMMUNITY</button>)}<button style={s.danger} onClick={()=>{if(window.confirm("Usunąć projekt?"))void run("delete",p.id)}}>DELETE</button></div>
  </article>)}</section>:<div style={s.empty}><h2>Nie masz jeszcze zapisanych projektów.</h2><p>Otwórz Studio, przygotuj projekt i zapisz go na swoim koncie.</p><Link href="/" style={s.primary}>CREATE PROJECT</Link></div>}
 </main>;
}

const s:Record<string,React.CSSProperties>={page:{minHeight:"100vh",background:"#071016",color:"#f5f8f7",padding:24,fontFamily:"Arial,sans-serif"},header:{maxWidth:1120,margin:"0 auto 28px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"},brand:{fontSize:17,fontWeight:1000},muted:{color:"#8599a3"},headerActions:{display:"flex",gap:8,flexWrap:"wrap"},primary:{padding:"11px 14px",borderRadius:11,background:"#77ff55",color:"#071016",fontWeight:900,textDecoration:"none"},secondary:{padding:"11px 14px",borderRadius:11,border:"1px solid #304751",color:"white",fontWeight:900,textDecoration:"none"},hero:{maxWidth:1120,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"1fr auto",gap:20,alignItems:"end"},kicker:{fontSize:10,color:"#77ff55",fontWeight:900,letterSpacing:1.2},h1:{fontSize:"clamp(40px,7vw,72px)",lineHeight:.95,letterSpacing:-3,margin:"8px 0"},lead:{color:"#91a3ad",maxWidth:720,lineHeight:1.5},stat:{minWidth:150,padding:20,border:"1px solid #28404a",borderRadius:18,background:"#0c171e",display:"grid"},error:{maxWidth:1120,margin:"0 auto 14px",padding:12,borderRadius:12,background:"#3a151a",color:"#ff9ca7"},grid:{maxWidth:1120,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12},card:{border:"1px solid #213640",borderRadius:18,background:"#0c171e",padding:18},cardTop:{display:"flex",justifyContent:"space-between",gap:12},title:{fontSize:24,margin:"7px 0",letterSpacing:-.8},publicBadge:{height:"fit-content",padding:"7px 9px",borderRadius:999,background:"#10271a",color:"#77ff55",fontSize:9,fontWeight:900},draftBadge:{height:"fit-content",padding:"7px 9px",borderRadius:999,background:"#15232a",color:"#91a3ad",fontSize:9,fontWeight:900},meta:{display:"flex",gap:8,flexWrap:"wrap",color:"#7f939d",fontSize:10},support:{margin:"20px 0 12px",display:"flex",alignItems:"baseline",gap:8},actions:{display:"flex",gap:7,flexWrap:"wrap"},open:{padding:"10px 12px",borderRadius:10,background:"#77ff55",color:"#071016",fontSize:10,fontWeight:900,textDecoration:"none"},ghost:{padding:"10px 12px",borderRadius:10,border:"1px solid #405861",background:"transparent",color:"#dce8e5",fontSize:10,fontWeight:900},danger:{padding:"10px 12px",borderRadius:10,border:"1px solid #66343b",background:"transparent",color:"#ff9da8",fontSize:10,fontWeight:900},empty:{maxWidth:1120,margin:"0 auto",padding:30,border:"1px dashed #2b424c",borderRadius:18,color:"#91a3ad",display:"grid",gap:10}}
