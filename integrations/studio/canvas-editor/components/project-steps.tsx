'use client';
import type {ProjectStep} from '@/lib/project-steps';
export const projectSteps=[['construction','Konstrukcja'],['surface','Nawierzchnia'],['graphics','Grafika'],['summary','Podsumowanie']] as const;
export function ProjectSteps({current,done,onSelect}:{current:ProjectStep;done:ProjectStep[];onSelect:(step:ProjectStep)=>void}){return <nav className="studio-project-steps" aria-label="Kroki projektu">{projectSteps.map(([step,label],index)=><button key={step} type="button" aria-current={current===step?'step':undefined} onClick={()=>onSelect(step)}><span aria-hidden="true">{done.includes(step)?'✓':index+1}</span>{label}{done.includes(step)?<span className="sr-only"> — odwiedzono i zmieniono</span>:null}</button>)}</nav>}
