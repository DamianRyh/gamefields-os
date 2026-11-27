"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {areaLabel} from "@/lib/surface-finish";
import {finishAreaFor} from "@/lib/quote-engine";
import {sportSurface} from '@/lib/sport-surfaces';
import type {Project} from '@/lib/project';
import {projectDimensions,formatArea,formatBounds} from '@/lib/project-dimensions';

export function ProjectDimensions({project,collapsed=false}:{project:Project;collapsed?:boolean}){
 const {display:tr}=useStudioLanguage();
 const {reference,model,area}=projectDimensions(project);
 const surface=sportSurface(project.surfaceModel);
 const content=<><dl className="studio-dimension-values">
  <div><dt>{tr("Wymiary referencyjne pola gry")}</dt><dd>{surface?`${surface.fieldLength} × ${surface.fieldWidth} m`:reference}</dd></div>
  {model?<><div><dt>{tr("Obrys nawierzchni w modelu")}</dt><dd>{formatBounds(model.surfaceBounds)}</dd></div><div><dt>{tr("Powierzchnia nawierzchni z modelu")}</dt><dd>{formatArea(model.area)}</dd></div>{!project.constructionOnly&&(project.arenaModel||surface)&&finishAreaFor(project)!==null?<div><dt>{tr("Powierzchnia do wyceny nawierzchni (+10% zapasu)")}</dt><dd>{areaLabel(finishAreaFor(project)!)} m²</dd></div>:null}{!surface&&<div><dt>{tr("Obrys konstrukcji z bramkami")}</dt><dd>{formatBounds(model.constructionBounds)}</dd></div>}</>:<div><dt>{tr(project.arenaModel?'Powierzchnia nawierzchni z modelu':'Powierzchnia planu')}</dt><dd>{area===null?tr('Brak danych modelu'):formatArea(area)}</dd></div>}
 </dl>{model?<><p className="studio-hint">{surface?tr(surface.dimensionNote)+" "+tr("Grubość modelu 20 cm nie określa technologii ani podbudowy wykonawczej."):tr("Obrys konstrukcji obejmuje bramki i podstawy. Wymiary referencyjne pola gry nie skalują modelu. Pole gry i strefy bezpieczeństwa wymagają osobnego potwierdzenia.")}</p><details className="studio-dimension-source"><summary>{tr("Źródło wymiarów")}</summary><p>{tr("Powierzchnia wynika z górnych trójkątów nawierzchni. Obrys to prostokąt obejmujący model; nie jest powierzchnią pola gry.")}</p><p>{tr("Rewizja modelu:")} <code>{model.sourceRevision.slice(0,12)}</code></p><p>{tr("Źródło nawierzchni:")} <code>{model.source}</code></p></details></>:project.arenaModel?<p className="studio-hint">{tr("Brak zweryfikowanych danych obrysu. Wymiary projektu nie określają powierzchni modelu.")}</p>:<p className="studio-hint">{tr("Wymiary dotyczą planu. Sceneria jest poglądowa i nie wyznacza stref bezpieczeństwa.")}</p>}</>;
 return collapsed?<details className="studio-dimension-spec"><summary>{tr("Wymiary i nawierzchnia")}</summary>{content}</details>:<section className="studio-summary-section studio-dimension-spec"><header><h3>{tr("Wymiary i nawierzchnia")}</h3></header>{content}</section>;
}
