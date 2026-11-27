'use client';
import {useStudioLanguage} from "@/components/studio-language";
import type {ProjectStep} from '@/lib/project-steps';
export const projectSteps=[['construction','Konstrukcja'],['surface','Nawierzchnia'],['graphics','Grafika'],['summary','Podsumowanie']] as const;
export function ProjectSteps({current,done,onSelect}:{current:ProjectStep;done:ProjectStep[];onSelect:(step:ProjectStep)=>void}){const {display:tr}=useStudioLanguage();return <nav className="studio-project-steps" aria-label={tr("Kroki projektu")}>{projectSteps.map(([step,label],index)=><button key={step} type="button" aria-current={current===step?'step':undefined} onClick={()=>onSelect(step)}><span aria-hidden="true">{done.includes(step)?'✓':index+1}</span>{tr(label)}{done.includes(step)?<span className="sr-only"> {tr("— odwiedzono i zmieniono")}</span>:null}</button>)}</nav>}
