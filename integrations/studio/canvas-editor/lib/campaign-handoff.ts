/* Hand-off between the Studio and the campaign wizard page /kampania/nowa (2026-11-25). Same origin, so the Studio
   leaves the current design in localStorage and the wizard picks it up. Only the design (no personal data). */
import type {Project} from './project';
const KEY='gf-campaign-project';
export function handOffProject(project:Project){try{localStorage.setItem(KEY,JSON.stringify({project,at:Date.now()}))}catch{/* optional */}}
export function readHandOff():{project:unknown;at:number}|null{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&typeof v==='object'&&v.project?v:null}catch{return null}}
/** Opens the wizard with this design in a new tab, so the Studio stays where it was. */
export function openCampaignWizard(project:Project){handOffProject(project);window.open('/kampania/nowa','_blank','noopener')}
