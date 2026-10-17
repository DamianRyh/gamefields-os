/** Catalogue contracts, not manufacturing specifications or certified capacities. */
export type ComponentId =
  | "PanelStandard"
  | "PanelBranding"
  | "PostStandard"
  | "Corner90"
  | "GoalSmall"
  | "Goal3v3"
  | "Gate"
  | "BallStopPost"
  | "BallStopNet"
  | "Bench"
  | "LightingPost"
  | "SponsorPanel";
export interface GamefieldsComponent {
  id: ComponentId;
  assetKey: string;
  category: "perimeter" | "support" | "opening" | "upper-layer" | "equipment";
  dimensions: {
    status: "UNCONFIRMED";
    xM: number | null;
    yM: number | null;
    zM: number | null;
  };
  connectionPoints: Array<{
    id: string;
    positionM: { x: number; y: number; z: number };
    interfaceId: string;
  }> | null;
  compatibleWith: ComponentId[];
  compatibilityStatus: "CONCEPTUAL_ONLY";
  material: string | null;
  finish: string | null;
  weightKg: number | null;
  bom: { unit: "pcs" | "m2"; pricebookField: string | null };
  cost: {
    status: "BUDGETARY_DEFAULT" | "UNPRICED";
    supplierReference: string | null;
  };
  structuralRole:
    "infill" | "post" | "connector" | "opening" | "net" | "equipment";
  glb: {
    url: string | null;
    revision: string | null;
    units: "m";
    upAxis: "Z";
    origin: "BOTTOM_CENTER";
    status: "NOT_SUPPLIED";
  };
  pbrMaterialSlots: string[];
  engineerApproval: "REQUIRED";
}
function component(
  id: ComponentId,
  assetKey: string,
  category: GamefieldsComponent["category"],
  structuralRole: GamefieldsComponent["structuralRole"],
  pricebookField: string | null,
  compatibleWith: ComponentId[],
  pbrMaterialSlots: string[],
  unit: "pcs" | "m2" = "pcs",
): GamefieldsComponent {
  return {
    id,
    assetKey,
    category,
    structuralRole,
    dimensions: { status: "UNCONFIRMED", xM: null, yM: null, zM: null },
    connectionPoints: null,
    compatibleWith,
    compatibilityStatus: "CONCEPTUAL_ONLY",
    material: null,
    finish: null,
    weightKg: null,
    bom: { unit, pricebookField },
    cost: {
      status: pricebookField ? "BUDGETARY_DEFAULT" : "UNPRICED",
      supplierReference: null,
    },
    glb: {
      url: null,
      revision: null,
      units: "m",
      upAxis: "Z",
      origin: "BOTTOM_CENTER",
      status: "NOT_SUPPLIED",
    },
    pbrMaterialSlots,
    engineerApproval: "REQUIRED",
  };
}
export const GAMEFIELDS_COMPONENT_LIBRARY = {
  PanelStandard: component(
    "PanelStandard",
    "gamefields/panel-standard",
    "perimeter",
    "infill",
    "panelStandardPlnEach",
    ["PostStandard", "Corner90"],
    ["frame", "surface"],
  ),
  PanelBranding: component(
    "PanelBranding",
    "gamefields/panel-branding",
    "perimeter",
    "infill",
    "panelBrandingPlnEach",
    ["PostStandard", "Corner90"],
    ["frame", "surface", "branding"],
  ),
  PostStandard: component(
    "PostStandard",
    "gamefields/post-standard",
    "support",
    "post",
    "postPlnEach",
    [
      "PanelStandard",
      "PanelBranding",
      "Goal3v3",
      "GoalSmall",
      "Gate",
      "BallStopPost",
    ],
    ["steel"],
  ),
  Corner90: component(
    "Corner90",
    "gamefields/corner-standard",
    "support",
    "connector",
    "cornerConnectorPlnEach",
    ["PostStandard", "PanelStandard", "PanelBranding"],
    ["steel"],
  ),
  GoalSmall: component(
    "GoalSmall",
    "gamefields/goal-small",
    "opening",
    "opening",
    "goalModulePlnEach",
    ["PostStandard"],
    ["frame", "net"],
  ),
  Goal3v3: component(
    "Goal3v3",
    "gamefields/goal-module",
    "opening",
    "opening",
    "goalModulePlnEach",
    ["PostStandard"],
    ["frame", "net"],
  ),
  Gate: component(
    "Gate",
    "gamefields/gate-module",
    "opening",
    "opening",
    "gateModulePlnEach",
    ["PostStandard"],
    ["frame", "surface"],
  ),
  BallStopPost: component(
    "BallStopPost",
    "gamefields/ballstop-post",
    "upper-layer",
    "post",
    "postPlnEach",
    ["PostStandard", "BallStopNet"],
    ["steel"],
  ),
  BallStopNet: component(
    "BallStopNet",
    "gamefields/ballstop-panel",
    "upper-layer",
    "net",
    "ballStopPlnPerM2",
    ["BallStopPost"],
    ["net"],
    "m2",
  ),
  Bench: component(
    "Bench",
    "gamefields/bench",
    "equipment",
    "equipment",
    null,
    [],
    ["frame", "seat"],
  ),
  LightingPost: component(
    "LightingPost",
    "gamefields/lighting-post",
    "equipment",
    "post",
    null,
    [],
    ["steel", "luminaire"],
  ),
  SponsorPanel: component(
    "SponsorPanel",
    "gamefields/sponsor-panel",
    "perimeter",
    "infill",
    null,
    ["PostStandard"],
    ["frame", "branding"],
  ),
} satisfies Record<ComponentId, GamefieldsComponent>;
export const COMPONENT_LIBRARY_SCHEMA = "GF-COMPONENT-LIBRARY-1.0" as const;
export function componentByAssetKey(assetKey: string): GamefieldsComponent {
  const entry = Object.values(GAMEFIELDS_COMPONENT_LIBRARY).find(
    (c) => c.assetKey === assetKey,
  );
  if (!entry) throw new Error(`Unknown Gamefields assetKey: ${assetKey}`);
  return entry;
}
