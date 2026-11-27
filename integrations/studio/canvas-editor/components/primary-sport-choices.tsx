'use client';
import {useStudioLanguage} from "@/components/studio-language";
import type {Project} from '@/lib/project';
import {primarySports,primarySport} from '@/lib/primary-sports';
export function PrimarySportChoices({project,onChange}:{project:Project;onChange:(id:typeof primarySports[number]['id'])=>void}){const {display:tr}=useStudioLanguage();return <div className="studio-primary-sports" role="group" aria-label={tr("Wybierz sport Gamefields")}>{primarySports.map(sport=><button key={sport.id} type="button" aria-pressed={primarySport(project)===sport.id} onClick={()=>onChange(sport.id)}><img src={sport.id==='panna'?'/arenas/thumbnails/o1.webp':`/sport-surfaces/${sport.surface}.webp`} alt=""/><span>{tr(sport.label)}</span></button>)}</div>}
