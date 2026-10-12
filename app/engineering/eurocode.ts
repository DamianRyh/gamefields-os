import { RHS_SECTIONS, type CourtEngineeringInput, type SteelGrade } from "./domain";
import type { Frame3DCaseResult, Frame3DLoadCaseId, Frame3DSolverResult } from "./frame3d";
import type { StructuralMember, StructuralModel } from "./model";

export type EurocodeProfileId = "EC-FIRST-GEN-PL-PREDESIGN" | "EC-SECOND-GEN-TRANSITION";
export type LimitState = "ULS" | "SLS";

export interface EurocodeProfile {
  id: EurocodeProfileId;
  generation: "first-generation" | "second-generation-transition";
  nationalAnnex: "PL_PROJECT_CONFIRMATION_REQUIRED";
  gammaG: number;
  gammaQ: number;
  gammaM0: number;
  serviceabilityLimitRatio: number;
  status: "PRE_DESIGN_DEFAULTS";
  notes: string[];
}

export interface CombinationTerm {
  loadCase: Frame3DLoadCaseId;
  factor: number;
}

export interface DesignCombination {
  id: string;
  limitState: LimitState;
  terms: CombinationTerm[];
  description: string;
}

export interface MemberUtilization {
  memberId: string;
  memberType: StructuralMember["type"];
  sectionCode: string;
  steelGrade: SteelGrade;
  governingCombination: string;
  axialKn: number;
  momentYKnM: number;
  momentZKnM: number;
  axialResistanceKn: number;
  bendingResistanceYKnM: number;
  bendingResistanceZKnM: number;
  utilization: number;
  status: "OK" | "NOT_OK";
  heat: "LOW" | "MEDIUM" | "HIGH" | "FAIL";
  verificationLevel: "ELASTIC_CROSS_SECTION_SCREEN";
}

export interface ServiceabilityCheck {
  governingCombination: string;
  maxDisplacementMm: number;
  limitMm: number;
  utilization: number;
  status: "OK" | "NOT_OK";
}

export interface SectionSizingSuggestion {
  memberType: StructuralMember["type"];
  currentSectionCode: string;
  recommendedSectionCode: string | null;
  governingUtilizationCurrent: number;
  estimatedUtilizationRecommended: number | null;
  estimatedKgSavingPerM: number | null;
  status: "KEEP" | "CHANGE" | "NO_SECTION_PASSES";
  requiresFrameResolve: true;
}

export interface EurocodeEngineResult {
  schema: "GF-EUROCODE-0.6";
  profile: EurocodeProfile;
  combinations: DesignCombination[];
  members: MemberUtilization[];
  serviceability: ServiceabilityCheck;
  sizing: SectionSizingSuggestion[];
  summary: {
    maxUtilization: number;
    governingMemberId: string;
    failedMembers: number;
    checkedMembers: number;
    slsUtilization: number;
  };
  limitations: string[];
}

const FY_MPA: Record<SteelGrade, number> = { S235: 235, S275: 275, S355: 355 };

export const DEFAULT_EUROCODE_PROFILE: EurocodeProfile = {
  id: "EC-FIRST-GEN-PL-PREDESIGN",
  generation: "first-generation",
  nationalAnnex: "PL_PROJECT_CONFIRMATION_REQUIRED",
  gammaG: 1.35,
  gammaQ: 1.5,
  gammaM0: 1.0,
  serviceabilityLimitRatio: 150,
  status: "PRE_DESIGN_DEFAULTS",
  notes: [
    "Factors are configurable pre-design defaults and must be confirmed for the project, action category and applicable Polish National Annex.",
    "The engine intentionally keeps Eurocode generation explicit because Poland is in the transition period toward second-generation Eurocodes.",
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
  return { s, areaMm2, wyMm3, wzMm3 };
}

export function buildDesignCombinations(profile: EurocodeProfile = DEFAULT_EUROCODE_PROFILE): DesignCombination[] {
  const uls = (id: string, action: Frame3DLoadCaseId): DesignCombination => ({
    id,
    limitState: "ULS",
    terms: [
      { loadCase: "SELF_WEIGHT", factor: profile.gammaG },
      { loadCase: action, factor: profile.gammaQ },
    ],
    description: `Pre-design STR combination: ${profile.gammaG.toFixed(2)}G + ${profile.gammaQ.toFixed(2)}Q`,
  });
  const sls = (id: string, action: Frame3DLoadCaseId): DesignCombination => ({
    id,
    limitState: "SLS",
    terms: [
      { loadCase: "SELF_WEIGHT", factor: 1.0 },
      { loadCase: action, factor: 1.0 },
    ],
    description: "Characteristic serviceability screening combination",
  });

  return [
    uls("ULS-WIND-X", "WIND_X"),
    uls("ULS-WIND-Y", "WIND_Y"),
    uls("ULS-IMPACT-X", "IMPACT_X"),
    uls("ULS-IMPACT-Y", "IMPACT_Y"),
    sls("SLS-WIND-X", "WIND_X"),
    sls("SLS-WIND-Y", "WIND_Y"),
    sls("SLS-IMPACT-X", "IMPACT_X"),
    sls("SLS-IMPACT-Y", "IMPACT_Y"),
  ];
}

function caseMap(frame3d: Frame3DSolverResult) {
  return new Map(frame3d.cases.map((c) => [c.loadCase, c]));
}

function memberMap(result: Frame3DCaseResult) {
  return new Map(result.members.map((m) => [m.memberId, m]));
}

function combineMember(
  memberId: string,
  combination: DesignCombination,
  cases: Map<Frame3DLoadCaseId, Frame3DCaseResult>,
) {
  let axialKn = 0;
  let momentYKnM = 0;
  let momentZKnM = 0;
  for (const term of combination.terms) {
    const c = cases.get(term.loadCase);
    if (!c) continue;
    const m = memberMap(c).get(memberId);
    if (!m) continue;
    axialKn += Math.abs(m.axialKn) * term.factor;
    momentYKnM += Math.abs(m.momentYKnM) * term.factor;
    momentZKnM += Math.abs(m.momentZKnM) * term.factor;
  }
  return { axialKn, momentYKnM, momentZKnM };
}

function utilizationFor(sectionCode: string, grade: SteelGrade, forces: { axialKn: number; momentYKnM: number; momentZKnM: number }, gammaM0: number) {
  const g = sectionGeometry(sectionCode);
  const fy = FY_MPA[grade];
  const nRdKn = g.areaMm2 * fy / Math.max(1e-9, gammaM0) / 1000;
  const myRdKnM = g.wyMm3 * fy / Math.max(1e-9, gammaM0) / 1e6;
  const mzRdKnM = g.wzMm3 * fy / Math.max(1e-9, gammaM0) / 1e6;
  const utilization = forces.axialKn / Math.max(1e-9, nRdKn) + forces.momentYKnM / Math.max(1e-9, myRdKnM) + forces.momentZKnM / Math.max(1e-9, mzRdKnM);
  return { utilization, nRdKn, myRdKnM, mzRdKnM, kgPerM: g.s.kgPerM };
}

function heat(utilization: number): MemberUtilization["heat"] {
  if (utilization > 1) return "FAIL";
  if (utilization > 0.8) return "HIGH";
  if (utilization > 0.5) return "MEDIUM";
  return "LOW";
}

function checkMembers(
  input: CourtEngineeringInput,
  model: StructuralModel,
  frame3d: Frame3DSolverResult,
  combinations: DesignCombination[],
  profile: EurocodeProfile,
): MemberUtilization[] {
  const cases = caseMap(frame3d);
  const uls = combinations.filter((c) => c.limitState === "ULS");
  return model.members.map((member) => {
    let governing = uls[0];
    let governingForces = { axialKn: 0, momentYKnM: 0, momentZKnM: 0 };
    let governingUtil = -Infinity;
    let resist = utilizationFor(member.sectionCode, input.steelGrade, governingForces, profile.gammaM0);

    for (const combo of uls) {
      const forces = combineMember(member.id, combo, cases);
      const r = utilizationFor(member.sectionCode, input.steelGrade, forces, profile.gammaM0);
      if (r.utilization > governingUtil) {
        governingUtil = r.utilization;
        governing = combo;
        governingForces = forces;
        resist = r;
      }
    }

    return {
      memberId: member.id,
      memberType: member.type,
      sectionCode: member.sectionCode,
      steelGrade: input.steelGrade,
      governingCombination: governing.id,
      axialKn: governingForces.axialKn,
      momentYKnM: governingForces.momentYKnM,
      momentZKnM: governingForces.momentZKnM,
      axialResistanceKn: resist.nRdKn,
      bendingResistanceYKnM: resist.myRdKnM,
      bendingResistanceZKnM: resist.mzRdKnM,
      utilization: governingUtil,
      status: governingUtil <= 1 ? "OK" : "NOT_OK",
      heat: heat(governingUtil),
      verificationLevel: "ELASTIC_CROSS_SECTION_SCREEN",
    };
  });
}

function serviceability(model: StructuralModel, frame3d: Frame3DSolverResult, combinations: DesignCombination[], profile: EurocodeProfile): ServiceabilityCheck {
  const cases = caseMap(frame3d);
  let governingCombination = combinations.find((c) => c.limitState === "SLS")?.id ?? "SLS";
  let maxDisplacementMm = 0;
  for (const combo of combinations.filter((c) => c.limitState === "SLS")) {
    let combined = 0;
    for (const term of combo.terms) combined += (cases.get(term.loadCase)?.maxDisplacementMm ?? 0) * Math.abs(term.factor);
    if (combined > maxDisplacementMm) {
      maxDisplacementMm = combined;
      governingCombination = combo.id;
    }
  }
  const limitMm = model.meta.totalHeightM * 1000 / Math.max(1, profile.serviceabilityLimitRatio);
  const utilization = maxDisplacementMm / Math.max(1e-9, limitMm);
  return { governingCombination, maxDisplacementMm, limitMm, utilization, status: utilization <= 1 ? "OK" : "NOT_OK" };
}

function sizingSuggestions(model: StructuralModel, members: MemberUtilization[], profile: EurocodeProfile): SectionSizingSuggestion[] {
  const byType = new Map<StructuralMember["type"], MemberUtilization[]>();
  for (const member of members) {
    const list = byType.get(member.memberType) ?? [];
    list.push(member);
    byType.set(member.memberType, list);
  }

  const sortedSections = [...RHS_SECTIONS].sort((a, b) => a.kgPerM - b.kgPerM);
  return [...byType.entries()].map(([memberType, rows]) => {
    const governing = rows.reduce((a, b) => a.utilization >= b.utilization ? a : b);
    const current = RHS_SECTIONS.find((s) => s.code === governing.sectionCode) ?? RHS_SECTIONS[0];
    let rec: { code: string; utilization: number; kgPerM: number } | null = null;
    const forces = { axialKn: governing.axialKn, momentYKnM: governing.momentYKnM, momentZKnM: governing.momentZKnM };
    for (const section of sortedSections) {
      const r = utilizationFor(section.code, governing.steelGrade, forces, profile.gammaM0);
      if (r.utilization <= 0.9) {
        rec = { code: section.code, utilization: r.utilization, kgPerM: section.kgPerM };
        break;
      }
    }
    return {
      memberType,
      currentSectionCode: governing.sectionCode,
      recommendedSectionCode: rec?.code ?? null,
      governingUtilizationCurrent: governing.utilization,
      estimatedUtilizationRecommended: rec?.utilization ?? null,
      estimatedKgSavingPerM: rec ? Number((current.kgPerM - rec.kgPerM).toFixed(2)) : null,
      status: !rec ? "NO_SECTION_PASSES" : rec.code === governing.sectionCode ? "KEEP" : "CHANGE",
      requiresFrameResolve: true,
    };
  });
}

export function runEurocodeEngine(args: {
  input: CourtEngineeringInput;
  model: StructuralModel;
  frame3d: Frame3DSolverResult;
  profile?: EurocodeProfile;
}): EurocodeEngineResult {
  const profile = args.profile ?? DEFAULT_EUROCODE_PROFILE;
  const combinations = buildDesignCombinations(profile);
  const members = checkMembers(args.input, args.model, args.frame3d, combinations, profile);
  const sls = serviceability(args.model, args.frame3d, combinations, profile);
  const sizing = sizingSuggestions(args.model, members, profile);
  const governing = members.reduce((a, b) => a.utilization >= b.utilization ? a : b);

  return {
    schema: "GF-EUROCODE-0.6",
    profile,
    combinations,
    members,
    serviceability: sls,
    sizing,
    summary: {
      maxUtilization: governing.utilization,
      governingMemberId: governing.memberId,
      failedMembers: members.filter((m) => m.status === "NOT_OK").length,
      checkedMembers: members.length,
      slsUtilization: sls.utilization,
    },
    limitations: [
      "Pre-design Eurocode screening only; this is not a complete EN 1993 verification.",
      "Member checks use elastic cross-section resistance and a conservative linear N+My+Mz interaction screen.",
      "Buckling, LTB, cross-section classification, shear interaction, fatigue, second-order effects, imperfections and connection stiffness are not yet verified.",
      "Combination factors and National Annex parameters must be confirmed for the actual project and applicable edition of the standards.",
      "Section sizing suggestions are force-based and require the global frame to be re-solved after any section change.",
    ],
  };
}
