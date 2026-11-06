'use client';
import {useState,lazy,Suspense,type ReactNode} from 'react';
import type {Project} from '@/lib/project';
const ProjectShare=lazy(()=>import('./project-share').then(m=>({default:m.ProjectShare})));
const WorkshopBrowser=lazy(()=>import('./workshop-browser').then(m=>({default:m.WorkshopBrowser})));
export function ProjectLibrary({project,onOpen,variants}:{project:Project;onOpen:(project:Project)=>Promise<void>;variants:ReactNode}){const [tab,setTab]=useState<'versions'|'share'|'workshop'|'catalog'>('versions');
 return <section className="studio-project-library" aria-label="Biblioteka projektów"><nav aria-label="Biblioteka projektów">{([['versions','Warianty'],['share','Udostępnij'],['workshop','Warsztat'],['catalog','Katalog']] as const).map(([id,label])=><button key={id} type="button" aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav><Suspense fallback={<p role="status">Wczytujemy bibliotekę…</p>}>{tab==='versions'?variants:tab==='share'?<ProjectShare project={project}/>:tab==='workshop'?<WorkshopBrowser onOpen={onOpen}/>:<div className="studio-p2-section"><h2>Gotowe projekty</h2><p>Otwórz kolekcję GAMEFIELDS i dopasuj wybrany projekt. Twój szkic pozostanie zachowany w tej przeglądarce.</p><a className="studio-primary" href="/?view=templates">Otwórz katalog gotowych projektów →</a><p>12 kierunków Signature i pełna biblioteka 300 wzorów pozostają dostępne w narzędziu Nawierzchnia.</p></div>}</Suspense></section>
}
