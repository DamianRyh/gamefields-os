import type { StructuralAnalysisResult } from "./analysis";
import type { FabricationPackage } from "./fabrication";
import type { BaseConnectionConcept } from "./foundation";
import type { PreliminarySolverResult } from "./solver";
import type { Frame3DSolverResult } from "./frame3d";
import type { EurocodeEngineResult } from "./eurocode";

export type EngineerCheckStatus = "PASS" | "WARN" | "BLOCK";

export interface EngineerCheck {
  id: string;
  label: string;
  status: EngineerCheckStatus;
  note: string;
}

export interface EngineerReviewGate {
  schema: "GF-ENGINEER-GATE-0.2";
  checks: EngineerCheck[];
  summary: {
    pass: number;
    warn: number;
    block: number;
  };
  releaseStatus: "PRE_DESIGN_READY" | "ENGINEER_REVIEW_REQUIRED" | "BLOCKED";
  fabricationReleaseAllowed: false;
  constructionReleaseAllowed: false;
  requiredNextActions: string[];
}

export function runEngineerReviewGate(args: {
  analysis: StructuralAnalysisResult;
  solver: PreliminarySolverResult;
  frame3d?: Frame3DSolverResult;
  eurocode?: EurocodeEngineResult;
  baseConnection: BaseConnectionConcept;
  fabrication: FabricationPackage;
}): EngineerReviewGate {
  const checks: EngineerCheck[] = [];

  checks.push({
    id: "ULS_SCREEN",
    label: "Legacy preliminary section resistance screen",
    status: args.analysis.postCheck.resistanceStatus === "OK" ? "PASS" : "BLOCK",
    note: `Representative-post ULS utilization ${(args.analysis.postCheck.utilization * 100).toFixed(0)}%.`,
  });

  checks.push({
    id: "SLS_SCREEN",
    label: "Legacy preliminary deflection screen",
    status: args.analysis.postCheck.deflectionStatus === "OK" ? "PASS" : "BLOCK",
    note: `Representative-post SLS utilization ${(args.analysis.postCheck.deflectionUtilization * 100).toFixed(0)}%.`,
  });

  checks.push({
    id: "FEM_CONSISTENCY",
    label: "Representative FEM solver result available",
    status: Number.isFinite(args.solver.envelope.maxCharacteristicSupportMomentKnM) ? "PASS" : "BLOCK",
    note: `${args.solver.method}; governing case ${args.solver.envelope.governingCase}.`,
  });

  checks.push({
    id: "GLOBAL_FRAME",
    label: "Global 3D frame analysis",
    status: args.frame3d && Number.isFinite(args.frame3d.envelope.maxDisplacementMm) ? "PASS" : "BLOCK",
    note: args.frame3d
      ? `${args.frame3d.solver}; ${args.frame3d.cases.length} load cases; max displacement ${args.frame3d.envelope.maxDisplacementMm.toFixed(1)} mm.`
      : "Global 3D frame solution is missing.",
  });

  checks.push({
    id: "EUROCODE_MEMBER_SCREEN",
    label: "Eurocode member utilization screen",
    status: !args.eurocode ? "BLOCK" : args.eurocode.summary.failedMembers > 0 ? "BLOCK" : "PASS",
    note: args.eurocode
      ? `${args.eurocode.summary.checkedMembers} members checked; max utilization ${(args.eurocode.summary.maxUtilization * 100).toFixed(0)}%; ${args.eurocode.summary.failedMembers} failed.`
      : "Eurocode Engine result is missing.",
  });

  checks.push({
    id: "EUROCODE_SLS",
    label: "Eurocode serviceability screen",
    status: !args.eurocode ? "BLOCK" : args.eurocode.serviceability.status === "OK" ? "PASS" : "BLOCK",
    note: args.eurocode
      ? `SLS displacement ${args.eurocode.serviceability.maxDisplacementMm.toFixed(1)} / ${args.eurocode.serviceability.limitMm.toFixed(1)} mm.`
      : "Serviceability result is missing.",
  });

  checks.push({
    id: "EUROCODE_SCOPE",
    label: "Advanced EN 1993 stability verification",
    status: "WARN",
    note: "Buckling, LTB, section classification, imperfections, second-order effects and detailed interaction checks are not yet included in GF Eurocode Engine v0.6.",
  });

  checks.push({
    id: "BASE_CONNECTION",
    label: "Base connection geometry",
    status: args.baseConnection.status === "CONCEPT_ONLY" ? "WARN" : "PASS",
    note: "Base plate and anchors are concept geometry only; anchor/concrete verification remains required.",
  });

  checks.push({
    id: "FABRICATION_DATA",
    label: "Fabrication register generated",
    status: args.fabrication.cutList.length > 0 && args.fabrication.plates.length > 0 ? "PASS" : "BLOCK",
    note: `${args.fabrication.cutList.length} cut marks, ${args.fabrication.plates.length} plate type(s), ${args.fabrication.bolts.length} bolt assembly type(s).`,
  });

  checks.push({
    id: "WELD_VERIFICATION",
    label: "Weld design verification",
    status: "WARN",
    note: "Weld sizes are production placeholders until connection forces and weld resistance are checked.",
  });

  checks.push({
    id: "ANCHOR_VERIFICATION",
    label: "Anchor and concrete verification",
    status: "WARN",
    note: "Anchor grade, embedment, edge distances, pry-out, concrete cone and reinforcement are not verified yet.",
  });

  checks.push({
    id: "NATIONAL_ANNEX",
    label: "Project-specific actions / National Annex",
    status: "WARN",
    note: args.eurocode
      ? `${args.eurocode.profile.id}; ${args.eurocode.profile.nationalAnnex}. Project-specific wind, terrain and National Annex parameters must still be confirmed.`
      : "Project-specific action parameters and applicable National Annex must be confirmed.",
  });

  const summary = {
    pass: checks.filter((c) => c.status === "PASS").length,
    warn: checks.filter((c) => c.status === "WARN").length,
    block: checks.filter((c) => c.status === "BLOCK").length,
  };

  return {
    schema: "GF-ENGINEER-GATE-0.2",
    checks,
    summary,
    releaseStatus: summary.block > 0 ? "BLOCKED" : summary.warn > 0 ? "ENGINEER_REVIEW_REQUIRED" : "PRE_DESIGN_READY",
    fabricationReleaseAllowed: false,
    constructionReleaseAllowed: false,
    requiredNextActions: [
      "Confirm project-specific actions, wind parameters, load categories and applicable Polish National Annex / Eurocode edition.",
      "Add member stability: cross-section classification, buckling, LTB, imperfections and second-order effects where relevant.",
      "Design and verify steel connections, welds, bolts and anchors.",
      "Verify foundations using geotechnical parameters and concrete design.",
      "Cross-check GF Frame 3D against an independent structural solver before relying on results for fabrication.",
      "Obtain review/approval by an appropriately qualified structural engineer before fabrication or construction.",
    ],
  };
}
