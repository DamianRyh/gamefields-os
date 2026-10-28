import {projectSchema,type Project} from './project';
import {getPatternFamily,patternFamilies,patternPalettes} from './pattern-library';
import {getSportProfile} from './sport-profiles';
export function publicWorkshopProject(raw:unknown):Project{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Nieprawidłowy projekt');
 const input=raw as Project;const family=patternFamilies.find(f=>f.id===input.patternFamily);if(!family)throw Error('Wybierz wzór');if(!patternPalettes.some(p=>p.id===input.patternPalette))throw Error('Wybierz paletę');
 const d=input.arenaDesign;
 const parsed=projectSchema.parse({...input,id:'GF-WORKSHOP',name:'Projekt społeczności',type:'Koncepcja',status:'Koncepcja',date:'',pattern:family.name,objects:[],arenaDesign:d?{panelColor:d.panelColor,frameColor:d.frameColor,goalColor:d.goalColor,finish:d.finish,side:d.side,text:''}:undefined});
 return {...parsed,name:`${getSportProfile(parsed.sport,parsed.arenaModel).label} · ${getPatternFamily(parsed.patternFamily).name}`.slice(0,190)};
}
