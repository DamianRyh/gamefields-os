/**
 * GAMEFIELDS WORLD — experimental asset registry.
 * Deliberately separate from current Studio and its pricing/project state.
 * Paths refer only to GLB assets already present in the repository.
 * Geometry, units and runtime compatibility must be checked in /world tests.
 */
export type WorldCourt = {
  id: string;
  name: string;
  category: "panna" | "street";
  glbPath: string;
  sourcePath?: string;
  dimensions?: { length: number; width: number };
  status: "candidate";
};
export type WorldEnvironment = {
  id: string;
  name: string;
  kind: "procedural" | "architectural";
  stage: "prototype" | "research";
  licenseRequired: boolean;
};
export const WORLD_COURTS: readonly WorldCourt[] = [
  {
    id: "street-15x10",
    name: "Street Football 3×3",
    category: "street",
    glbPath: "/products/street-football-15x10/boisko-15x10.glb",
    sourcePath: "public/products/street-football-15x10/boisko-15x10.blend",
    dimensions: { length: 15, width: 10 },
    status: "candidate",
  },
  {
    id: "street-15x10-structure",
    name: "Street Football — konstrukcja",
    category: "street",
    glbPath: "/products/street-football-15x10/konstrukcja.glb",
    status: "candidate",
  },
] as const;
export const WORLD_ENVIRONMENTS: readonly WorldEnvironment[] = [
  {id:"neutral",name:"Studio neutralne",kind:"procedural",stage:"prototype",licenseRequired:false},
  {id:"urban-park",name:"Park miejski",kind:"architectural",stage:"research",licenseRequired:true},
  {id:"housing-estate",name:"Osiedle mieszkaniowe",kind:"architectural",stage:"research",licenseRequired:true},
  {id:"school",name:"Szkoła i dziedziniec",kind:"architectural",stage:"research",licenseRequired:true},
] as const;
export function getWorldCourt(id: string): WorldCourt | undefined {
  return WORLD_COURTS.find(court => court.id === id);
}
