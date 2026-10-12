import { RHS_SECTIONS, type CourtEngineeringInput, type SteelGrade } from "./domain";
import type { EurocodeEngineResult, DesignCombination } from "./eurocode";
import type { Frame3DCaseResult, Frame3DLoadCaseId, Frame3DSolverResult } from "./frame3d";
import type { StructuralMember, StructuralModel } from "./model";

export interface StabilityProfile {
  schema: "GF-STABILITY-PROFILE-0.7";
  gammaM1: number;
  defaultBucklingAlpha: number;
  effectiveLengthFactorPost: number;
  effectiveLengthFactorRail: number;
  secondOrderWarningRatio: number;
  secondOrderFailureRatio: number;
  status: "PRE_DESIGN_DEFAULTS";
  assumptions: string[];
}

export interface SectionClassificationResult {
  memberId: string;
  sectionCode: string;
  epsilon: number;
  clearWidthToThickness: number;
  clearHeightToThickness: number;
  governingRatio: number;
  sectionClass: 1 | 2 | 3 | 4;
  status: "OK" | "CLASS_4_REQUIRES_EFFECTIVE_SECTION";
}

export interface MemberStabilityCheck {
  memberId: string;
  memberType: StructuralMember["type"];
  sectionCode: string;
  steelGrade: SteelGrade;
  governingCombination: string;
  sectionClass: 1 | 2 | 3 | 4;
  effectiveLengthM: number;
  radiusGyrationMinMm: number;
  eulerCriticalLoadKn: number;
  nonDimensionalSlenderness: number;
  bucklingReductionChi: number;
  bucklingResistanceKn: number;
  axialDesignKn: number;
  shearDesignKn: number;
  firstOrderMomentKnM: number;
  secondOrderAmplification: number;
  amplifiedMomentKnM: number;
  axialBucklingUtilization: number;
  shearUtilization: number;
  combinedUtilization: number;
  secondOrderRatio: number;
  status: "OK" | "WARN" | "NOT_OK";
  heat: "LOW" | "MEDIUM" | "HIGH" | "FAIL";
  ltbScreen: "CLOSED_HOLLOW_SECTION_REVIEW";
}

export interface StabilityEngineResult {
  schema: "GF-STABILITY-0.7";
  profile: StabilityProfile;
  classifications: SectionClassificationResult[];
  members: MemberStabilityCheck[];
  summary: {
    checkedMembers: number;
    failedMembers: number;
    warningMembers: number;
    class4Members: number;
    maxCombinedUtilization: number;
    governingMemberId: string;
    maxSecondOrderRatio: number;
  };
  limitations: string[];
}

const E_MPA = 210000;
const FY_MPA: Record<SteelGrade, number> = { S235: 235, S275: 275, S355: 355 };

export const DEFAULT_STABILITY_PROFILE: StabilityProfile = {
  schema: "GF-STABILITY-PROFILE-0.7",
  gammaM1: 1.0,
  defaultBucklingAlpha: 0.49,
  effectiveLengthFactorPost: 1.0,
  effectiveLengthFactorRail: 1.0,
  secondOrderWarningRatio: 0.10,
  secondOrderFailureRatio: 0.90,
  status: "PRE_DESIGN_DEFAULTS",
  assumptions: [
    "Buckling curve imperfection factor alpha=0.49 is a conservative project-default placeholder until section manufacturing route and applicable EN 1993 buckling curve are confirmed.",
    "Effective length factors are project-default placeholders and must be confirmed from actual restraint, joint stiffness and bracing behaviour.",
    "All absolute axial force is conservatively treated as compression because the current force envelope does not preserve force sign.",
  ],
};

function sectionGeometry(code: string) {
  const s = RHS_SECTIONS.find((item) => item.code === code) ?? RHS_SECTIONS[0];
  const b = s.widthMm;
  const h = s.heightMm;
  const t = s.wallMm;
  const bi = Math.max(0, b - 2 * t);
  const hi = Math.max(0, h - 2 * t);
  const areaMm2 = b * h - bi * hi;
  const iyMm4 = (b * h ** 3 - bi * hi ** 3) / 12;
  const izMm4 = (h * b ** 3 - hi * bi ** 3) / 12;
  const wyMm3 = iyMm4 / Math.max(1e-9, h / 2);
  const wzMm3 = izMm4 / Math.max(1e-9, b / 2);
  return { s, b, h, t, bi, hi, areaMm2, iyMm4, izMm4, wyMm3, wzMm3 };
}

function classifySection(member: StructuralMember, grade: SteelGrade): SectionClassificationResult {
  const g = sectionGeometry(member.sectionCode);
  const epsilon = Math.sqrt(235 / FY_MPA[grade]);
  // Idealized flat widths. Real corner radii/manufacturer properties should replace this in verified design.
  const cWidth = Math.max(0, g.b - 2 * g.t);
  const cHeight = Math.max(0, g.h - 2 * g.t);
  const widthRatio = cWidth / Math.max(1e-9, g.t);
  const heightRatio = cHeight / Math.max(1e-9, g.t);
  const ratio = Math.max(widthRatio, heightRatio);
  // First-generation EN 1993-1-1 style internal compression-part screening limits.
  const sectionClass: 1 | 2 | 3 | 4 = ratio <= 33 * epsilon ? 1 : ratio <= 38 * epsilon ? 2 : ratio <= 42 * epsilon ? 3 : 4;
  return {
    memberId: member.id,
    sectionCode: member.sectionCode,
    epsilon,
    clearWidthToThickness: widthRatio,
    clearHeightToThickness: heightRatio,
    governingRatio: ratio,
    sectionClass,
    status: sectionClass === 4 ? "CLASS_4_REQUIRES_EFFECTIVE_SECTION" : "OK",
  };
}

function caseMap(frame3d: Frame3DSolverResult) {
  return new Map(frame3d.cases.map((c) => [c.loadCase, c]));
}

function memberMap(result: Frame3DCaseResult) {
  return new Map(result.members.map((m) => [m.memberId, m]));
}

function combinationById(combinations: DesignCombination[], id: string) {
  return combinations.find((c) => c.id === id) ?? combinations.find((c) => c.limitState === "ULS")!;
}

function combinedActions(memberId: string, combo: DesignCombination, frame3d: Frame3DSolverResult) {
  const cases = caseMap(frame3d);
  let axialKn = 0;
  let shearKn = 0;
  let myKnM = 0;
  let mzKnM = 0;
  for (const term of combo.terms) {
    const result = cases.get(term.loadCase as Frame3DLoadCaseId);
    if (!result) continue;
    const m = memberMap(result).get(memberId);
    if (!m) continue;
    axialKn += Math.abs(m.axialKn) * Math.abs(term.factor);
    shearKn += Math.hypot(m.shearYKn, m.shearZKn) * Math.abs(term.factor);
    myKnM += Math.abs(m.momentYKnM) * Math.abs(term.factor);
    mzKnM += Math.abs(m.momentZKnM) * Math.abs(term.factor);
  }
  return { axialKn, shearKn, myKnM, mzKnM };
}

function bucklingReduction(lambdaBar: number, alpha: number) {
  if (lambdaBar <= 0.2) return 1;
  const phi = 0.5 * (1 + alpha * (lambdaBar - 0.2) + lambdaBar ** 2);
  const inside = Math.max(0, phi ** 2 - lambdaBar ** 2);
  return Math.min(1, 1 / Math.max(1e-9, phi + Math.sqrt(inside)));
}

function heat(utilization: number): MemberStabilityCheck["heat"] {
  if (utilization > 1) return "FAIL";
  if (utilization > 0.8) return "HIGH";
  if (utilization > 0.5) return "MEDIUM";
  return "LOW";
}

function effectiveLengthFactor(member: StructuralMember, profile: StabilityProfile) {
  return member.type === "post" ? profile.effectiveLengthFactorPost : profile.effectiveLengthFactorRail;
}

export function runStabilityEngine(args: {
  input: CourtEngineeringInput;
  model: StructuralModel;
  frame3d: Frame3DSolverResult;
  eurocode: EurocodeEngineResult;
  profile?: StabilityProfile;
}): StabilityEngineResult {
  const profile = args.profile ?? DEFAULT_STABILITY_PROFILE;
  const classifications = args.model.members.map((m) => classifySection(m, args.input.steelGrade));
  const classificationMap = new Map(classifications.map((c) => [c.memberId, c]));
  const euroMemberMap = new Map(args.eurocode.members.map((m) => [m.memberId, m]));
  const fy = FY_MPA[args.input.steelGrade];

  const members: MemberStabilityCheck[] = args.model.members.map((member) => {
    const g = sectionGeometry(member.sectionCode);
    const ec = euroMemberMap.get(member.id)!;
    const combo = combinationById(args.eurocode.combinations, ec.governingCombination);
    const actions = combinedActions(member.id, combo, args.frame3d);
    const Imin = Math.max(1e-9, Math.min(g.iyMm4, g.izMm4));
    const radiusMm = Math.sqrt(Imin / Math.max(1e-9, g.areaMm2));
    const leffMm = member.lengthM * 1000 * effectiveLengthFactor(member, profile);
    const ncrN = Math.PI ** 2 * E_MPA * Imin / Math.max(1e-9, leffMm ** 2);
    const ncrKn = ncrN / 1000;
    const lambdaBar = Math.sqrt((g.areaMm2 * fy) / Math.max(1e-9, ncrN));
    const chi = bucklingReduction(lambdaBar, profile.defaultBucklingAlpha);
    const nbRdKn = chi * g.areaMm2 * fy / Math.max(1e-9, profile.gammaM1) / 1000;
    const secondOrderRatio = actions.axialKn / Math.max(1e-9, ncrKn);
    const secondOrderAmplification = secondOrderRatio >= profile.secondOrderFailureRatio
      ? 10
      : 1 / Math.max(0.1, 1 - secondOrderRatio);
    const firstOrderMomentKnM = Math.hypot(actions.myKnM, actions.mzKnM);
    const amplifiedMomentKnM = firstOrderMomentKnM * secondOrderAmplification;
    const mRdY = g.wyMm3 * fy / 1e6;
    const mRdZ = g.wzMm3 * fy / 1e6;
    const mRd = Math.max(1e-9, Math.min(mRdY, mRdZ));
    // Thin-wall RHS/SHS shear area proxy for screening only.
    const avMm2 = Math.max(1e-9, 2 * g.t * Math.min(g.b, g.h));
    const vRdKn = avMm2 * fy / Math.sqrt(3) / 1000;
    const axialUtil = actions.axialKn / Math.max(1e-9, nbRdKn);
    const shearUtil = actions.shearKn / Math.max(1e-9, vRdKn);
    const momentUtil = amplifiedMomentKnM / mRd;
    const combinedUtilization = axialUtil + momentUtil + (shearUtil > 0.5 ? shearUtil ** 2 : 0);
    const sectionClass = classificationMap.get(member.id)!.sectionClass;
    const status: MemberStabilityCheck["status"] = sectionClass === 4 || secondOrderRatio >= profile.secondOrderFailureRatio || combinedUtilization > 1
      ? "NOT_OK"
      : secondOrderRatio > profile.secondOrderWarningRatio || combinedUtilization > 0.8
        ? "WARN"
        : "OK";

    return {
      memberId: member.id,
      memberType: member.type,
      sectionCode: member.sectionCode,
      steelGrade: args.input.steelGrade,
      governingCombination: combo.id,
      sectionClass,
      effectiveLengthM: leffMm / 1000,
      radiusGyrationMinMm: radiusMm,
      eulerCriticalLoadKn: ncrKn,
      nonDimensionalSlenderness: lambdaBar,
      bucklingReductionChi: chi,
      bucklingResistanceKn: nbRdKn,
      axialDesignKn: actions.axialKn,
      shearDesignKn: actions.shearKn,
      firstOrderMomentKnM,
      secondOrderAmplification,
      amplifiedMomentKnM,
      axialBucklingUtilization: axialUtil,
      shearUtilization: shearUtil,
      combinedUtilization,
      secondOrderRatio,
      status,
      heat: heat(combinedUtilization),
      ltbScreen: "CLOSED_HOLLOW_SECTION_REVIEW",
    };
  });

  const governing = members.reduce((a, b) => a.combinedUtilization >= b.combinedUtilization ? a : b);
  return {
    schema: "GF-STABILITY-0.7",
    profile,
    classifications,
    members,
    summary: {
      checkedMembers: members.length,
      failedMembers: members.filter((m) => m.status === "NOT_OK").length,
      warningMembers: members.filter((m) => m.status === "WARN").length,
      class4Members: classifications.filter((c) => c.sectionClass === 4).length,
      maxCombinedUtilization: governing.combinedUtilization,
      governingMemberId: governing.memberId,
      maxSecondOrderRatio: Math.max(...members.map((m) => m.secondOrderRatio)),
    },
    limitations: [
      "Pre-design stability screening only; not a complete EN 1993-1-1 member verification.",
      "Section classification uses idealized RHS/SHS clear flat widths and first-generation internal-compression screening limits; real corner radii and stress distributions require verified section data.",
      "Buckling resistance uses a configurable single imperfection factor and assumed effective length. Manufacturing route, buckling curve and restraint conditions must be confirmed project-by-project.",
      "Second-order response is represented by a member-level Euler amplification screen, not a geometrically nonlinear global P-Delta analysis.",
      "LTB is flagged for review rather than fully calculated; closed RHS/SHS behaviour and connection/restraint conditions require independent verification.",
      "Shear area and N+M+V interaction are screening approximations. Full code interaction, local buckling/effective widths for Class 4, fatigue and connection stiffness are not included.",
    ],
  };
}

export function stabilityToCsv(result: StabilityEngineResult): string {
  const rows = [
    ["member_id", "type", "section", "class", "combo", "Leff_m", "lambda_bar", "chi", "Ncr_kN", "NbRd_kN", "NEd_kN", "VEd_kN", "M1_kNm", "amplification", "M2_kNm", "buckling_util", "shear_util", "combined_util", "second_order_ratio", "status"],
    ...result.members.map((m) => [
      m.memberId, m.memberType, m.sectionCode, m.sectionClass, m.governingCombination,
      m.effectiveLengthM.toFixed(3), m.nonDimensionalSlenderness.toFixed(4), m.bucklingReductionChi.toFixed(4),
      m.eulerCriticalLoadKn.toFixed(3), m.bucklingResistanceKn.toFixed(3), m.axialDesignKn.toFixed(3), m.shearDesignKn.toFixed(3),
      m.firstOrderMomentKnM.toFixed(3), m.secondOrderAmplification.toFixed(4), m.amplifiedMomentKnM.toFixed(3),
      m.axialBucklingUtilization.toFixed(4), m.shearUtilization.toFixed(4), m.combinedUtilization.toFixed(4), m.secondOrderRatio.toFixed(4), m.status,
    ]),
  ];
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
}
