import {sportSurface} from '@/lib/sport-surfaces';
import type {Project} from '@/lib/project';
import {projectDimensions,formatArea,formatBounds} from '@/lib/project-dimensions';

export function ProjectDimensions({project,collapsed=false}:{project:Project;collapsed?:boolean}){
 const {reference,model,area}=projectDimensions(project);
 const surface=sportSurface(project.surfaceModel);
 const content=<><dl className="studio-dimension-values">
  <div><dt>Wymiary referencyjne pola gry</dt><dd>{surface?`${surface.fieldLength} × ${surface.fieldWidth} m`:reference}</dd></div>
  {model?<><div><dt>Obrys nawierzchni w modelu</dt><dd>{formatBounds(model.surfaceBounds)}</dd></div><div><dt>Powierzchnia nawierzchni z modelu</dt><dd>{formatArea(model.area)}</dd></div>{!surface&&<div><dt>Obrys konstrukcji z bramkami</dt><dd>{formatBounds(model.constructionBounds)}</dd></div>}</>:<div><dt>{project.arenaModel?'Powierzchnia nawierzchni z modelu':'Powierzchnia planu'}</dt><dd>{area===null?'Brak danych modelu':formatArea(area)}</dd></div>}
 </dl>{model?<><p className="studio-hint">{surface?surface.dimensionNote+" Grubość modelu 20 cm nie określa technologii ani podbudowy wykonawczej.":"Obrys konstrukcji obejmuje bramki i podstawy. Wymiary referencyjne pola gry nie skalują modelu. Pole gry i strefy bezpieczeństwa wymagają osobnego potwierdzenia."}</p><details className="studio-dimension-source"><summary>Źródło wymiarów</summary><p>Powierzchnia wynika z górnych trójkątów nawierzchni. Obrys to prostokąt obejmujący model; nie jest powierzchnią pola gry.</p><p>Rewizja modelu: <code>{model.sourceRevision.slice(0,12)}</code></p><p>Źródło nawierzchni: <code>{model.source}</code></p></details></>:project.arenaModel?<p className="studio-hint">Brak zweryfikowanych danych obrysu. Wymiary projektu nie określają powierzchni modelu.</p>:<p className="studio-hint">Wymiary dotyczą planu. Sceneria jest poglądowa i nie wyznacza stref bezpieczeństwa.</p>}</>;
 return collapsed?<details className="studio-dimension-spec"><summary>Wymiary i nawierzchnia</summary>{content}</details>:<section className="studio-summary-section studio-dimension-spec"><header><h3>Wymiary i nawierzchnia</h3></header>{content}</section>;
}
