import type { CourtEngineeringInput } from "./domain";
import type { Frame3DSolverResult } from "./frame3d";
import type { StructuralModel } from "./model";

export interface ConnectionFoundationAssumptions {
  concreteStrengthMpa: number;
  groutThicknessMm: number;
  anchorDesignTensionResistanceKn: number;
  anchorDesignShearResistanceKn: number;
  weldDesignShearStrengthMpa: number;
  soilDesignBearingKpa: number;
  soilBaseFrictionCoefficient: number;
  concreteDensityKnM3: number;
  footingCoverMm: number;
  gammaMPlate: number;
}

export const DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS: ConnectionFoundationAssumptions = {
  concreteStrengthMpa: 25,
  groutThicknessMm: 20,
  anchorDesignTensionResistanceKn: 25,
  anchorDesignShearResistanceKn: 18,
  weldDesignShearStrengthMpa: 180,
  soilDesignBearingKpa: 150,
  soilBaseFrictionCoefficient: 0.45,
  concreteDensityKnM3: 24,
  footingCoverMm: 50,
  gammaMPlate: 1,
};

export interface SupportReactionEnvelope { nodeId: string; fxKn: number; fyKn: number; fzKn: number; mxKnM: number; myKnM: number; mzKnM: number; governingCase: string; }
export interface AnchorGroupCheck { anchorCount: number; anchorDiameterMm: number; boltGridXmm: number; boltGridYmm: number; maxAnchorTensionKn: number; shearPerAnchorKn: number; tensionUtilization: number; shearUtilization: number; interactionUtilization: number; status: "OK" | "NOT_OK"; }
export interface BasePlateCheck { widthMm: number; lengthMm: number; thicknessMm: number; postFaceMm: number; maxBearingPressureMpa: number; concreteBearingScreenMpa: number; bearingUtilization: number; plateBendingUtilization: number; status: "OK" | "NOT_OK"; }
export interface WeldCheck { nominalSizeMm: number; effectiveLengthMm: number; designResistanceKn: number; designDemandKn: number; utilization: number; status: "OK" | "NOT_OK"; }
export interface FootingCheck { widthMm: number; lengthMm: number; depthMm: number; selfWeightKn: number; totalVerticalKn: number; horizontalKn: number; overturningMomentKnM: number; maxSoilPressureKpa: number; minSoilPressureKpa: number; bearingUtilization: number; slidingUtilization: number; eccentricityRatioX: number; eccentricityRatioY: number; contactStatus: "FULL_CONTACT" | "PARTIAL_CONTACT_SCREEN"; status: "OK" | "NOT_OK"; }
export interface ConnectionFoundationResult {
  schema: "GF-CONNECTION-FOUNDATION-0.8";
  status: "PRE_DESIGN";
  assumptions: ConnectionFoundationAssumptions;
  governingReaction: SupportReactionEnvelope;
  anchorGroup: AnchorGroupCheck;
  basePlate: BasePlateCheck;
  weld: WeldCheck;
  footing: FootingCheck;
  summary: { maxUtilization: number; governingCheck: "ANCHOR" | "BASE_PLATE" | "WELD" | "FOOTING"; failedChecks: number };
  limitations: string[];
}

function postFaceMm(code: string): number {
  const m = code.match(/(?:SHS|RHS)\s+(\d+)x(\d+)x(\d+)/i);
  return m ? Math.max(Number(m[1]), Number(m[2])) : 80;
}

function envelopeReactions(frame3d: Frame3DSolverResult): SupportReactionEnvelope[] {
  const map = new Map<string, SupportReactionEnvelope>();
  for (const c of frame3d.cases) {
    for (const r of c.reactions) {
      const current = map.get(r.nodeId) ?? { nodeId: r.nodeId, fxKn: 0, fyKn: 0, fzKn: 0, mxKnM: 0, myKnM: 0, mzKnM: 0, governingCase: c.loadCase };
      const before = Math.hypot(current.fxKn, current.fyKn, current.mxKnM, current.myKnM);
      current.fxKn = Math.max(Math.abs(current.fxKn), Math.abs(r.fxKn));
      current.fyKn = Math.max(Math.abs(current.fyKn), Math.abs(r.fyKn));
      current.fzKn = Math.max(Math.abs(current.fzKn), Math.abs(r.fzKn));
      current.mxKnM = Math.max(Math.abs(current.mxKnM), Math.abs(r.mxKnM));
      current.myKnM = Math.max(Math.abs(current.myKnM), Math.abs(r.myKnM));
      current.mzKnM = Math.max(Math.abs(current.mzKnM), Math.abs(r.mzKnM));
      if (Math.hypot(current.fxKn, current.fyKn, current.mxKnM, current.myKnM) > before) current.governingCase = c.loadCase;
      map.set(r.nodeId, current);
    }
  }
  return [...map.values()];
}

function governingReaction(frame3d: Frame3DSolverResult): SupportReactionEnvelope {
  const rows = envelopeReactions(frame3d);
  if (!rows.length) return { nodeId: "NONE", fxKn: 0, fyKn: 0, fzKn: 0, mxKnM: 0, myKnM: 0, mzKnM: 0, governingCase: "NONE" };
  return rows.reduce((a, b) => (Math.hypot(b.fxKn, b.fyKn) + 2 * Math.hypot(b.mxKnM, b.myKnM) + b.fzKn) > (Math.hypot(a.fxKn, a.fyKn) + 2 * Math.hypot(a.mxKnM, a.myKnM) + a.fzKn) ? b : a);
}

function designAnchorGroup(reaction: SupportReactionEnvelope, anchorCount: number, anchorDiameterMm: number, gridMm: number, a: ConnectionFoundationAssumptions): AnchorGroupCheck {
  const half = Math.max(1, gridMm / 2) / 1000;
  const positions = [[-half, -half], [half, -half], [half, half], [-half, half]] as const;
  const sumX2 = positions.reduce((s, p) => s + p[0] ** 2, 0);
  const sumY2 = positions.reduce((s, p) => s + p[1] ** 2, 0);
  const directUplift = Math.max(0, reaction.fzKn) / Math.max(1, anchorCount);
  let maxAnchorTensionKn = directUplift;
  for (const [x, y] of positions) maxAnchorTensionKn = Math.max(maxAnchorTensionKn, directUplift + Math.abs(reaction.mxKnM * y / Math.max(1e-9, sumY2)) + Math.abs(reaction.myKnM * x / Math.max(1e-9, sumX2)));
  const shearPerAnchorKn = Math.hypot(reaction.fxKn, reaction.fyKn) / Math.max(1, anchorCount);
  const tensionUtilization = maxAnchorTensionKn / Math.max(1e-9, a.anchorDesignTensionResistanceKn);
  const shearUtilization = shearPerAnchorKn / Math.max(1e-9, a.anchorDesignShearResistanceKn);
  const interactionUtilization = Math.hypot(tensionUtilization, shearUtilization);
  return { anchorCount, anchorDiameterMm, boltGridXmm: gridMm, boltGridYmm: gridMm, maxAnchorTensionKn, shearPerAnchorKn, tensionUtilization, shearUtilization, interactionUtilization, status: interactionUtilization <= 1 ? "OK" : "NOT_OK" };
}

function checkBasePlate(input: CourtEngineeringInput, reaction: SupportReactionEnvelope, widthMm: number, lengthMm: number, thicknessMm: number, a: ConnectionFoundationAssumptions): BasePlateCheck {
  const b = widthMm / 1000, l = lengthMm / 1000, area = b * l;
  const wx = b * l ** 2 / 6, wy = l * b ** 2 / 6;
  const maxBearingPressureMpa = (Math.max(0, reaction.fzKn) / Math.max(1e-9, area) + reaction.mxKnM / Math.max(1e-9, wx) + reaction.myKnM / Math.max(1e-9, wy)) / 1000;
  const concreteBearingScreenMpa = 0.6 * a.concreteStrengthMpa;
  const bearingUtilization = maxBearingPressureMpa / Math.max(1e-9, concreteBearingScreenMpa);
  const face = postFaceMm(input.postSectionCode);
  const projectionMm = Math.max(0, (Math.min(widthMm, lengthMm) - face) / 2);
  const fy = input.steelGrade === "S355" ? 355 : input.steelGrade === "S275" ? 275 : 235;
  const plateBendingUtilization = (maxBearingPressureMpa * projectionMm ** 2 / 2) / Math.max(1e-9, fy * thicknessMm ** 2 / (6 * Math.max(1e-9, a.gammaMPlate)));
  return { widthMm, lengthMm, thicknessMm, postFaceMm: face, maxBearingPressureMpa, concreteBearingScreenMpa, bearingUtilization, plateBendingUtilization, status: Math.max(bearingUtilization, plateBendingUtilization) <= 1 ? "OK" : "NOT_OK" };
}

function checkWeld(input: CourtEngineeringInput, reaction: SupportReactionEnvelope, nominalSizeMm: number, a: ConnectionFoundationAssumptions): WeldCheck {
  const face = postFaceMm(input.postSectionCode), effectiveLengthMm = 4 * face, throatMm = 0.7 * nominalSizeMm;
  const designResistanceKn = throatMm * effectiveLengthMm * a.weldDesignShearStrengthMpa / 1000;
  const designDemandKn = Math.hypot(reaction.fxKn, reaction.fyKn) + Math.hypot(reaction.mxKnM, reaction.myKnM) / Math.max(0.05, face / 1000);
  const utilization = designDemandKn / Math.max(1e-9, designResistanceKn);
  return { nominalSizeMm, effectiveLengthMm, designResistanceKn, designDemandKn, utilization, status: utilization <= 1 ? "OK" : "NOT_OK" };
}

function checkFooting(reaction: SupportReactionEnvelope, widthMm: number, lengthMm: number, depthMm: number, a: ConnectionFoundationAssumptions): FootingCheck {
  const b = widthMm / 1000, l = lengthMm / 1000, d = depthMm / 1000, area = b * l;
  const selfWeightKn = area * d * a.concreteDensityKnM3;
  const totalVerticalKn = Math.max(0.1, selfWeightKn + Math.max(0, reaction.fzKn));
  const horizontalKn = Math.hypot(reaction.fxKn, reaction.fyKn), overturningMomentKnM = Math.hypot(reaction.mxKnM, reaction.myKnM);
  const ex = Math.abs(reaction.myKnM) / totalVerticalKn, ey = Math.abs(reaction.mxKnM) / totalVerticalKn;
  const eccentricityRatioX = ex / Math.max(1e-9, b / 6), eccentricityRatioY = ey / Math.max(1e-9, l / 6);
  const q0 = totalVerticalKn / area, qx = 6 * Math.abs(reaction.myKnM) / Math.max(1e-9, l * b ** 2), qy = 6 * Math.abs(reaction.mxKnM) / Math.max(1e-9, b * l ** 2);
  const maxSoilPressureKpa = q0 + qx + qy, minSoilPressureKpa = q0 - qx - qy;
  const bearingUtilization = maxSoilPressureKpa / Math.max(1e-9, a.soilDesignBearingKpa);
  const slidingUtilization = horizontalKn / Math.max(1e-9, a.soilBaseFrictionCoefficient * totalVerticalKn);
  const contactStatus = minSoilPressureKpa >= 0 ? "FULL_CONTACT" : "PARTIAL_CONTACT_SCREEN";
  return { widthMm, lengthMm, depthMm, selfWeightKn, totalVerticalKn, horizontalKn, overturningMomentKnM, maxSoilPressureKpa, minSoilPressureKpa, bearingUtilization, slidingUtilization, eccentricityRatioX, eccentricityRatioY, contactStatus, status: bearingUtilization <= 1 && slidingUtilization <= 1 && contactStatus === "FULL_CONTACT" ? "OK" : "NOT_OK" };
}

export function runConnectionFoundationEngine(args: {
  input: CourtEngineeringInput;
  model: StructuralModel;
  frame3d: Frame3DSolverResult;
  plate: { plateWidthMm: number; plateLengthMm: number; plateThicknessMm: number; anchorCount: number; anchorDiameterMm: number; anchorCircleMm: number; footingConceptMm: { width: number; length: number; depth: number } };
  assumptions?: ConnectionFoundationAssumptions;
}): ConnectionFoundationResult {
  void args.model;
  const assumptions = args.assumptions ?? DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS;
  const reaction = governingReaction(args.frame3d);
  const anchorGroup = designAnchorGroup(reaction, args.plate.anchorCount, args.plate.anchorDiameterMm, args.plate.anchorCircleMm, assumptions);
  const basePlate = checkBasePlate(args.input, reaction, args.plate.plateWidthMm, args.plate.plateLengthMm, args.plate.plateThicknessMm, assumptions);
  const weld = checkWeld(args.input, reaction, 6, assumptions);
  const footing = checkFooting(reaction, args.plate.footingConceptMm.width, args.plate.footingConceptMm.length, args.plate.footingConceptMm.depth, assumptions);
  const values = [
    { key: "ANCHOR" as const, value: anchorGroup.interactionUtilization, failed: anchorGroup.status === "NOT_OK" },
    { key: "BASE_PLATE" as const, value: Math.max(basePlate.bearingUtilization, basePlate.plateBendingUtilization), failed: basePlate.status === "NOT_OK" },
    { key: "WELD" as const, value: weld.utilization, failed: weld.status === "NOT_OK" },
    { key: "FOOTING" as const, value: Math.max(footing.bearingUtilization, footing.slidingUtilization, footing.contactStatus === "FULL_CONTACT" ? 0 : 1.01), failed: footing.status === "NOT_OK" },
  ];
  const governing = values.reduce((a, b) => b.value > a.value ? b : a);
  return { schema: "GF-CONNECTION-FOUNDATION-0.8", status: "PRE_DESIGN", assumptions, governingReaction: reaction, anchorGroup, basePlate, weld, footing, summary: { maxUtilization: governing.value, governingCheck: governing.key, failedChecks: values.filter((v) => v.failed).length }, limitations: [
    "Pre-design screening only; not a complete EN 1993-1-8, EN 1992-4, EN 1992 or EN 1997 verification.",
    "Anchor resistances are project inputs and must come from the selected anchor system, concrete condition, embedment, edge distances, spacing and reinforcement design.",
    "Concrete bearing/base-plate bending and weld resistance are simplified screens and do not replace detailed connection design.",
    "Foundation screening assumes a rigid rectangular footing and user-supplied soil parameters; settlement, frost, groundwater, reinforcement and site-specific geotechnics are not designed.",
    "Support reaction envelope combines component maxima conservatively and must be cross-checked against governing design combinations before release.",
  ] };
}

export function connectionFoundationToCsv(result: ConnectionFoundationResult): string {
  const rows = [
    ["check", "utilization", "status", "value_1", "value_2"],
    ["anchor", result.anchorGroup.interactionUtilization, result.anchorGroup.status, result.anchorGroup.maxAnchorTensionKn, result.anchorGroup.shearPerAnchorKn],
    ["base_plate", Math.max(result.basePlate.bearingUtilization, result.basePlate.plateBendingUtilization), result.basePlate.status, result.basePlate.maxBearingPressureMpa, result.basePlate.plateBendingUtilization],
    ["weld", result.weld.utilization, result.weld.status, result.weld.designDemandKn, result.weld.designResistanceKn],
    ["footing", Math.max(result.footing.bearingUtilization, result.footing.slidingUtilization), result.footing.status, result.footing.maxSoilPressureKpa, result.footing.minSoilPressureKpa],
  ];
  return rows.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
}
