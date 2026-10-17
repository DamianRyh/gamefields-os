import { build } from "esbuild";
import { mkdir, writeFile, rm, cp } from "node:fs/promises";
const result = await build({
  stdin: {
    contents: `
import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import Viewer from './app/engineering/modular-3d/page';
import Library from './app/engineering/components/page';
import SourceModels from './app/engineering/source-models/page';
import PannaKids from './app/products/panna-kids/page';
function readView(){const v=new URLSearchParams(location.search).get('view');return ['source','panna-kids','library'].includes(v)?v:'viewer'}
function Review(){
 const[view,setView]=useState(readView);
 useEffect(()=>{
  function navigate(event){
   const anchor=event.target.closest?.('a');if(!anchor)return;
   const href=anchor.getAttribute('href');
   const routes={'/engineering/components':'library','/engineering/modular-3d':'viewer','/engineering/source-models':'source','/products/panna-kids':'panna-kids'};
   if(routes[href]){event.preventDefault();const next=routes[href];setView(next);const url=new URL(location.href);url.search='';url.searchParams.set('view',next);history.pushState(null,'',url);window.scrollTo(0,0);}
  }
  const back=()=>setView(readView());document.addEventListener('click',navigate);window.addEventListener('popstate',back);
  return()=>{document.removeEventListener('click',navigate);window.removeEventListener('popstate',back)}
 },[]);
 return view==='panna-kids'?<PannaKids assetBase="products/panna-kids" inquiryEndpoint={null} studioHref="/engineering/modular-3d"/>:view==='library'?<Library/>:view==='source'?<SourceModels assetBase="models/gamefields"/>:<Viewer assetBase="models/gamefields"/>
}
createRoot(document.getElementById('root')).render(<Review/>);
`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  outfile: ".sites-runtime/modular-review/app.js",
  format: "iife",
  minify: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
const javascript = result.outputFiles
  .find((file) => file.path.endsWith(".js"))
  .text.replace(/<\/script/gi, "<\\/script");
const css =
  result.outputFiles.find((file) => file.path.endsWith(".css"))?.text || "";
await mkdir("dist/modular-review", { recursive: true });
await writeFile(
  "dist/modular-review/index.html",
  `<!doctype html><html lang="pl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="GAMEFIELDS Modular Product v1.2 — interactive conceptual assembly preview. Budgetary defaults, mandatory engineer review."><title>GAMEFIELDS — Modular Product v1.2</title><style>body{margin:0;font-family:Arial,Helvetica,sans-serif}*{box-sizing:border-box}button,input{font:inherit}svg{vertical-align:middle}${css}</style></head><body><div id="root"></div><script>${javascript}</script></body></html>`,
);
console.log("Standalone modular review: dist/modular-review/index.html");

// Remove stale native assets when rebuilding an existing preview directory.
await rm("dist/modular-review/models", { recursive: true, force: true });

// Explicit public product export. Other source/component GLBs stay withheld.
await rm("dist/modular-review/products/panna-kids", {
  recursive: true,
  force: true,
});
await mkdir("dist/modular-review/products/panna-kids", { recursive: true });
for (const name of [
  "perspective.webp",
  "overhead.webp",
  "detail.webp",
  "panna-kids.glb",
]) {
  await cp(
    "public/products/panna-kids/" + name,
    "dist/modular-review/products/panna-kids/" + name,
  );
}
