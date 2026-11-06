import type {Project} from './project';
export type ProjectStep='construction'|'surface'|'graphics'|'summary';
export function projectStepState(p:Project):Record<ProjectStep,string>{return {
 construction:JSON.stringify([p.arenaModel,p.arenaDesign,p.modular]),
 surface:JSON.stringify([p.surfaceModel,p.sport,p.surface,p.length,p.width,p.base,p.zone,p.outside,p.lineColor,p.patternFamily,p.patternVariant,p.patternPalette,p.patternSeed,p.patternDensity,p.graphicOpacity,p.graphicScale,p.graphicRotation,p.shadowIntensity]),
 graphics:JSON.stringify([p.objects,p.lines,p.decorativeLineStyle]),
 summary:JSON.stringify([p.name]),
}}
