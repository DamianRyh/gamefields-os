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
  gammaMPlate: 1.0,
};

export interface SupportReactionEnvelope {
  nodeId: string;
  fxKn: number;
  fyKn: number;
  fzKn: number;
  mxKnM: number;
  myKnM: number;
  mzKnM: number;
  governingCase: string;
}

export interface AnchorGroupCheck {
  anchorCount: number;
  anchorDiameterMm: number;
  boltGridXmm: number;
  boltGridYmm: number;
  maxAnchorTensionKn: number;
  shearPerAnchorKn: number;
  tensionUtilization: number;
  shearUtilization: number;
  interactionUtilization: number;
  status: "OK" | "NOT_OK";
}

export interface BasePlateCheck {
  widthMm: number;
  lengthMm: number;
  thicknessMm: number;
  postFaceMm: number;
  maxBearingPressureMpa: number;
  concreteBearingScreenMpa: number;
  bearingUtilization: number;
  plateBendingUtilization: number;
  status: "OK" | "NOT_OK";
}

export interface WeldCheck {
  nominalSizeMm: number;
  effectiveLengthMm: number;
  designResistanceKn: number;
  designDemandKn: number;
  utilization: number;
  status: "OK" | "NOT_OK";
}

export interface FootingCheck {
  widthMm: number;
  lengthMm: number;
  depthMm: number;
  selfWeightKn: number;
  totalVerticalKn: number;
  horizontalKn: number;
  overturningMomentKnM: number;
  maxSoilPressureKpa: number;
  minSoilPressureKpa: number;
  bearingUtilization: number;
  slidingUtilization: number;
  eccentricityRatioX: number;
  eccentricityRatioY: number;
  contactStatus: "FULL_CONTACT" | "PARTIAL_CONTACT_SCREEN";
  status: "OK" | "NOT_OK";
}

export interface ConnectionFoundationResult {
  schema: "GF-CONNECTION-FOUNDATION-0.8";
  status: "PRE_DESIGN";
  assumptions: ConnectionFoundationAssumptions;
  governingReaction: SupportReactionEnvelope;
  anchorGroup: AnchorGroupCheck;
  basePlate: BasePlateCheck;
  weld: WeldCheck;
  footing: FootingCheck;
  summary: {
    maxUtilization: number;
    governingCheck: "ANCHOR" | "BASE_PLATE" | "WELD" | "FOOTING";
    failedChecks: number;
  };
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
      const current = map.get(r.nodeId) ?? {
        nodeId: r.nodeId, fxKn: 0, fyKn: 0, fzKn: 0, mxKnM: 0, myKnM: 0, mzKnM: 0, governingCase: c.loadCase,
      };
      const before = Math.hypot(current.fxKn, current.fyKn, current.mxKnM, current.myKnM);
      current.fxKn = Math.max(Math.abs(current.fxKn), Math.abs(r.fxKn));
      current.fyKn = Math.max(Math.abs(current.fyKn), Math.abs(r.fyKn));
      current.fzKn = Math.max(Math.abs(current.fzKn), Math.abs(r.fzKn));
      current.mxKnM = Math.max(Math.abs(current.mxKnM), Math.abs(r.mxKnM));
      current.myKnM = Math.max(Math.abs(current.myKnM), Math.abs(r.myKnM));
      current.mzKnM = Math.max(Math.abs(current.mzKnM), Math.abs(r.mzKnM));
      const after = Math.hypot(current.fxKn, current.fyKn, current.mxKnM, current.myKnM);
      if (after > before) current.governingCase = c.loadCase;
      map.set(r.nodeId, current);
    }
  }
  return [...map.values()];
}

function governingReaction(frame3d: Frame3DSolverResult): SupportReactionEnvelope {
  const rows = envelopeReactions(frame3d);
  if (!rows.length) return { nodeId: "NONE", fxKn: 0, fyKn: 0, fzKn: 0, mxKnM: 0, myKnM: 0, mzKnM: 0, governingCase: "NONE" };
  return rows.reduce((a, b) => {
    const ua = Math.hypot(a.fxKn, a.fyKn) + 2 * Math.hypot(a.mxKnM, a.myKnM) + a.fzKn;
    const ub = Math.hypot(b.fxKn, b.fyKn) + 2 * Math.hypot(b.mxKnM, b.myKnM) + b.fzKn;
    return ub > ua ? b : a;
  });
}

function designAnchorGroup(args: {
  reaction: SupportReactionEnvelope;
  anchorCount: number;
  anchorDiameterMm: number;
  gridMm: number;
  assumptions: ConnectionFoundationAssumptions;
}): AnchorGroupCheck {
  const { reaction: r, assumptions: a } = args;
  const half = Math.max(1, args.gridMm / 2) / 1000;
  const positions = [[-half, -half], [half, -half], [half, half], [-half, half]] as const;
  const sumX2 = positions.reduce((s, p) => s + p[0] ** 2, 0);
  const sumY2 = positions.reduce((s, p) => s + p[1] ** 2, 0);
  const directUplift = Math.max(0, r.fzKn) / Math.max(1, args.anchorCount);
  let maxTension = directUplift;
  for (const [x, y] of positions) {
    const t = directUplift + Math.abs(r.mxKnM * y / Math.max(1e-9, sumY2)) + Math.abs(r.myKnM * x / Math.max(1e-9, sumX2));
    maxTension = Math.max(maxTension, t);
  }
  const shearPerAnchor = Math.hypot(r.fxKn, r.fyKn) / Math.max(1, args.anchorCount);
  const tensionUtilization = maxTension / Math.max(1e-9, a.anchorDesignTensionResistanceKn);
  const shearUtilization = shearPerAnchor / Math.max(1e-9, a.anchorDesignShearResistanceKn);
  const interactionUtilization = Math.hypot(tensionUtilization, shearUtilization);
  return {
    anchorCount: args.anchorCount,
    anchorDiameterMm: args.anchorDiameterMm,
    boltGridXmm: args.gridMm,
    boltGridYmm: args.gridMm,
    maxAnchorTensionKn: maxTension,
    shearPerAnchorKn,
    tensionUtilization,
    shearUtilization,
    interactionUtilization,
    status: interactionUtilization <= 1 ? "OK" : "NOT_OK",
  };
}

function checkBasePlate(args: {
  input: CourtEngineeringInput;
  reaction: SupportReactionEnvelope;
  widthMm: number;
  lengthMm: number;
  thicknessMm: number;
  assumptions: ConnectionFoundationAssumptions;
}): BasePlateCheck {
  const { reaction: r, assumptions: a } = args;
  const b = args.widthMm / 1000;
  const l = args.lengthMm / 1000;
  const area = b * l;
  const wx = b * l ** 2 / 6;
  const wy = l * b ** 2 / 6;
  const compressionKn = Math.max(0, r.fzKn);
  const qKpa = compressionKn / Math.max(1e-9, area) + r.mxKnM / Math.max(1e-9, wx) + r.myKnM / Math.max(1e-9, wy);
  const maxBearingPressureMpa = qKpa / 1000;
  const concreteBearingScreenMpa = 0.6 * a.concreteStrengthMpa;
  const bearingUtilization = maxBearingPressureMpa / Math.max(1e-9, concreteBearingScreenMpa);
  const face = postFaceMm(args.input.postSectionCode);
  const projectionMm = Math.max(0, (Math.min(args.widthMm, args.lengthMm) - face) / 2);
  const qNmm2 = maxBearingPressureMpa;
  const mEdPerMmNmm = qNmm2 * projectionMm ** 2 / 2;
  const fy = args.input.steelGrade === "S355" ? 355 : args.input.steelGrade === "S275" ? 275 : 235;
  const mRdPerMmNmm = fy * args.thicknessMm ** 2 / (6 * Math.max(1e-9, a.gammaMPlate));
  const plateBendingUtilization = mEdPerMmNmm / Math.max(1e-9, mRdPerMmNmm);
  return {
    widthMm: args.widthMm, lengthMm: args.lengthMm, thicknessMm: args.thicknessMm, postFaceMm: face,
    maxBearingPressureMpa, concreteBearingScreenMpa, bearingUtilization, plateBendingUtilization,
    status: Math.max(bearingUtilization, plateBendingUtilization) <= 1 ? "OK" : "NOT_OK",
  };
}

function checkWeld(args: { input: CourtEngineeringInput; reaction: SupportReactionEnvelope; nominalSizeMm: number; assumptions: ConnectionFoundationAssumptions }): WeldCheck {
  const face = postFaceMm(args.input.postSectionCode);
  const effectiveLengthMm = 4 * face;
  const throatMm = 0.7 * args.nominalSizeMm;
  const resistanceKn = throatMm * effectiveLengthMm * args.assumptions.weldDesignShearStrengthMpa / 1000;
  const shearDemand = Math.hypot(args.reaction.fxKn, args.reaction.fyKn);
  const momentDemandEquivalentKn = Math.hypot(args.reaction.mxKnM, args.reaction.myKnM) / Math.max(0.05, face / 1000);
  const designDemandKn = shearDemand + momentDemandEquivalentKn;
  const utilization = designDemandKn / Math.max(1e-9, resistanceKn);
  return { nominalSizeMm: args.nominalSizeMm, effectiveLengthMm, designResistanceKn: resistanceKn, designDemandKn, utilization, status: utilization <= 1 ? "OK" : "NOT_OK" };
}

function checkFooting(args: {
  reaction: SupportReactionEnvelope;
  widthMm: number;
  lengthMm: number;
  depthMm: number;
  assumptions: ConnectionFoundationAssumptions;
}): FootingCheck {
  const { reaction: r, assumptions: a } = args;
  const b = args.widthMm / 1000;
  const l = args.lengthMm / 1000;
  const d = args.depthMm / 1000;
  const area = b * l;
  const selfWeightKn = area * d * a.concreteDensityKnM3;
  const totalVerticalKn = Math.max(0.1, selfWeightKn + Math.max(0, r.fzKn));
  const horizontalKn = Math.hypot(r.fxKn, r.fyKn);
  const overturningMomentKnM = Math.hypot(r.mxKnM, r.myKnM);
  const ex = Math.abs(r.myKnM) / totalVerticalKn;
  const ey = Math.abs(r.mxKnM) / totalVerticalKn;
  const eccentricityRatioX = ex / Math.max(1e-9, b / 6);
  const eccentricityRatioY = ey / Math.max(1e-9, l / 6);
  const q0 = totalVerticalKn / area;
  const qx = 6 * Math.abs(r.myKnM) / Math.max(1e-9, l * b ** 2);
  const qy = 6 * Math.abs(r.mxKnM) / Math.max(1e-9, b * l ** 2);
  const maxSoilPressureKpa = q0 + qx + qy;
  const minSoilPressureKpa = q0 - qx - qy;
  const bearingUtilization = maxSoilPressureKpa / Math.max(1e-9, a.soilDesignBearingKpa);
  const slidingResistanceKn = a.soilBaseFrictionCoefficient * totalVerticalKn;
  const slidingUtilization = horizontalKn / Math.max(1e-9, slidingResistanceKn);
  const contactStatus = minSoilPressureKpa >= 0 ? "FULL_CONTACT" : "PARTIAL_CONTACT_SCREEN";
  return {
    widthMm: args.widthMm, lengthMm: args.lengthMm, depthMm: args.depthMm,
    selfWeightKn, totalVerticalKn, horizontalKn, overturningMomentKnM,
    maxSoilPressureKpa, minSoilPressureKpa, bearingUtilization, slidingUtilization,
    eccentricityRatioX, eccentricityRatioY, contactStatus,
    status: bearingUtilization <= 1 && slidingUtilization <= 1 && contactStatus === "FULL_CONTACT" ? "OK" : "NOT_OK",
  };
}

export function runConnectionFoundationEngine(args: {
  input: CourtEngineeringInput;
  model: StructuralModel;
  frame3d: Frame3DSolverResult;
  plate: { widthMm: number; lengthMm: number; thicknessMm: number; anchorCount: number; anchorDiameterMm: number; anchorCircleMm: number; footingConceptMm: { width: number; length: number; depth: number } };
  assumptions?: ConnectionFoundationAssumptions;
}): ConnectionFoundationResult {
  const assumptions = args.assumptions ?? DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS;
  const reaction = governingReaction(args.frame3d);
  const anchorGroup = designAnchorGroup({ reaction, anchorCount: args.plate.anchorCount, anchorDiameterMm: args.plate.anchorDiameterMm, gridMm: args.plate.anchorCircleMm, assumptions });
  const basePlate = checkBasePlate({ input: args.input, reaction, widthMm: args.plate.widthMm, lengthMm: args.plate.lengthMm, thicknessMm: args.plate.thicknessMm, assumptions });
  const weld = checkWeld({ input: args.input, reaction, nominalSizeMm: 6, assumptions });
  const footing = checkFooting({ reaction, widthMm: args.plate.footingConceptMm.width, lengthMm: args.plate.footingConceptMm.length, depthMm: args.plate.footingConceptMm.depth, assumptions });
  const values = [
    { key: "ANCHOR" as const, value: anchorGroup.interactionUtilization, failed: anchorGroup.status === "NOT_OK" },
    { key: "BASE_PLATE" as const, value: Math.max(basePlate.bearingUtilization, basePlate.plateBendingUtilization), failed: basePlate.status === "NOT_OK" },
    { key: "WELD" as const, value: weld.utilization, failed: weld.status === "NOT_OK" },
    { key: "FOOTING" as const, value: Math.max(footing.bearingUtilization, footing.slidingUtilization, footing.contactStatus === "FULL_CONTACT" ? 0 : 1.01), failed: footing.status === "NOT_OK" },
  ];
  const governing = values.reduce((a, b) => b.value > a.value ? b : a);
  return {
    schema: "GF-CONNECTION-FOUNDATION-0.8",
    status: "PRE_DESIGN",
    assumptions,
    governingReaction: reaction,
    anchorGroup,
    basePlate,
    weld,
    footing,
    summary: { maxUtilization: governing.value, governingCheck: governing.key, failedChecks: values.filter((v) => v.failed).length },
    limitations: [
      "Pre-design screening only; not a complete EN 1993-1-8, EN 1992-4, EN 1992 or EN 1997 verification.",
      "Anchor resistances are project inputs and must come from the selected anchor system, concrete condition, embedment, edge distances, spacing and reinforcement design.",
      "Concrete bearing and base-plate bending are simplified elastic screens and do not replace component-method connection design.",
      "Weld resistance is a simplified throat-area screen; weld group stress distribution, steel ultimate strength and execution requirements require project verification.",
      "Foundation screening assumes a rigid rectangular footing and user-supplied soil design bearing/friction parameters; settlement, frost, groundwater, passive resistance and reinforcement are not designed.",
      "Support reaction envelope combines component maxima conservatively and must be cross-checked against governing design combinations before release.",
    ],
  };
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
