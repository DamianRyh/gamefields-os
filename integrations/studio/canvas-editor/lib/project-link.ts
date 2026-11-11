import type {Project} from './project';

export function projectLinkPatch(params:URLSearchParams):Partial<Project>{
 const patch:Partial<Project>={};
 for(const [param,key] of [['base','base'],['zone','zone'],['outside','outside'],['line','lineColor']] as const){
  const value=params.get(param);if(value&&/^[0-9A-Fa-f]{6}$/.test(value))patch[key]='#'+value;
 }
 const seed=params.get('seed');
 if(seed!==null&&/^\d{1,6}$/.test(seed))patch.patternSeed=Number(seed);
 return patch;
}

/** The server snapshot carries every field; these validated parameters also keep iframe entry links useful. */
export function projectLink(project:Project,origin:string,receipt:{id:string;url:string}):string{
 const params=new URLSearchParams({shared:receipt.id,sport:project.sport,pattern:project.patternFamily||'organic-flow',variant:String(project.patternVariant||1),palette:project.patternPalette||'court-culture',shadow:String(project.shadowIntensity??0),seed:String(project.patternSeed??0)});
 if(project.arenaModel)params.set('arena',project.arenaModel);
 if(project.surfaceModel)params.set('surface',project.surfaceModel);
 for(const [param,key] of [['base','base'],['zone','zone'],['outside','outside'],['line','lineColor']] as const)params.set(param,project[key].slice(1));
 return origin+'/?'+params+new URL(receipt.url).hash;
}
